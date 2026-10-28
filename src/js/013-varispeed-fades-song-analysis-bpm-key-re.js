/* =====================================================================
   VARISPEED, FADES, SONG ANALYSIS (BPM / KEY), REFERENCE MATCHING
   ===================================================================== */
const sleep0 = () => new Promise(r=>setTimeout(r,0));

// Resample a stereo pair by `rate` (tape-style: tempo and pitch together)
async function varispeed(chs, fs, r){
  if(Math.abs(r-1) < 1e-4) return chs;
  const n = chs[0].length, out = Math.ceil(n/r), o = new OfflineAudioContext(2, out, fs);
  const b = o.createBuffer(2, n, fs); b.copyToChannel(chs[0],0); b.copyToChannel(chs[1]||chs[0],1);
  const s = o.createBufferSource(); s.buffer = b; s.playbackRate.value = r; s.connect(o.destination); s.start(0);
  const res = await o.startRendering();
  return [res.getChannelData(0).slice(), res.getChannelData(1).slice()];
}
async function getMix(){ return crop(await varispeed(await mixRaw(), tracks[0].buffer.sampleRate, rate), tracks[0].buffer.sampleRate); }
// Cut to the A–B section when "Nur Ausschnitt" is ticked (times are on the playback timeline)
function crop(chs, fs){
  if(!($("onlyAB").checked && AB.a!==null && AB.b!==null)) return chs;
  const a = Math.max(0, Math.round(AB.a/rate*fs)), b = Math.min(chs[0].length, Math.round(AB.b/rate*fs));
  return chs.map(x=>x.slice(a, b));
}

// Drop the silent part of reverb/delay tails at the end (keeps 0.2 s after the last audible sample)
function trimTail(L, R, fs){
  let i = L.length-1; while(i>0 && Math.abs(L[i])<1e-4 && Math.abs(R[i])<1e-4) i--;
  const n = Math.min(L.length, i + Math.round(0.2*fs));
  return n < L.length ? [L.subarray(0,n), R.subarray(0,n)] : [L, R];
}
function applyFades(L, R, fs){
  const fi = Math.max(0, +$("fadeIn").value||0), fo = Math.max(0, +$("fadeOut").value||0), n = L.length;
  const a = Math.min(n, Math.round(fi*fs)), b = Math.min(n, Math.round(fo*fs));
  for(let i=0;i<a;i++){ const g=Math.sin(i/a*Math.PI/2); L[i]*=g; R[i]*=g; }
  for(let i=0;i<b;i++){ const g=Math.sin(i/b*Math.PI/2), j=n-1-i; L[j]*=g; R[j]*=g; }
}

/* ---- radix-2 FFT (in place) ---- */
function fft(re, im){
  const n = re.length;
  for(let i=1,j=0;i<n;i++){ let bit=n>>1; for(;j&bit;bit>>=1) j^=bit; j^=bit; if(i<j){ let t=re[i]; re[i]=re[j]; re[j]=t; t=im[i]; im[i]=im[j]; im[j]=t; } }
  for(let len=2;len<=n;len<<=1){
    const ang=-2*Math.PI/len, wr=Math.cos(ang), wi=Math.sin(ang);
    for(let i=0;i<n;i+=len){ let cr=1, ci=0;
      for(let k=0;k<len/2;k++){
        const a=i+k, b=a+len/2, xr=re[b]*cr-im[b]*ci, xi=re[b]*ci+im[b]*cr;
        re[b]=re[a]-xr; im[b]=im[a]-xi; re[a]+=xr; im[a]+=xi;
        const t=cr*wr-ci*wi; ci=cr*wi+ci*wr; cr=t;
      }
    }
  }
}
const hann = n => { const w=new Float64Array(n); for(let i=0;i<n;i++) w[i]=0.5-0.5*Math.cos(2*Math.PI*i/n); return w; };
/* ---- Denoiser: spectral noise reduction like Audacity's, tuned for the steady hiss of AI songs ----
   STFT 2048 / hop 512 (sqrt-Hann both sides), both channels in one complex FFT (L + iR),
   noise profile = per-bin low percentile of the power over the song (the steady floor under the music),
   gain = soft over-subtraction with a floor, smoothed over time (no "musical noise") and frequency,
   faded out below ~400 Hz so bass and body are never touched. */
const DN_N = 2048, DN_H = 512;
const DN_T = (()=>{ const N = DN_N, w = new Float32Array(N), cs = new Float64Array(N/2), sn = new Float64Array(N/2), rev = new Uint32Array(N);
  for(let i=0;i<N;i++) w[i] = Math.sqrt(0.5 - 0.5*Math.cos(2*Math.PI*i/N));
  for(let i=0;i<N/2;i++){ cs[i] = Math.cos(-2*Math.PI*i/N); sn[i] = Math.sin(-2*Math.PI*i/N); }
  const bits = Math.log2(N); for(let i=0;i<N;i++){ let r = 0; for(let b=0;b<bits;b++) if(i & (1<<b)) r |= 1<<(bits-1-b); rev[i] = r; }
  return {w, cs, sn, rev}; })();
function dnFft(re, im, inv){
  const N = re.length, {cs, sn, rev} = DN_T;
  for(let i=0;i<N;i++){ const j = rev[i]; if(i < j){ let t = re[i]; re[i] = re[j]; re[j] = t; t = im[i]; im[i] = im[j]; im[j] = t; } }
  for(let len=2; len<=N; len<<=1){ const half = len>>1, step = N/len;
    for(let i=0;i<N;i+=len) for(let k=0;k<half;k++){
      const wr = cs[k*step], wi = inv ? -sn[k*step] : sn[k*step], a = i+k, b = a+half;
      const xr = re[b]*wr - im[b]*wi, xi = re[b]*wi + im[b]*wr; re[b] = re[a]-xr; im[b] = im[a]-xi; re[a] += xr; im[a] += xi; } }
}
// power spectrum (L and R averaged) of the frame starting at `o`
function dnFrame(L, R, o, re, im){
  const N = DN_N, w = DN_T.w, n = L.length;
  for(let i=0;i<N;i++){ const j = o+i; re[i] = j < n && j >= 0 ? L[j]*w[i] : 0; im[i] = j < n && j >= 0 ? R[j]*w[i] : 0; }
  dnFft(re, im, false);
}
// Noise profile: per bin, the 12th percentile of the power over up to 900 frames spread through the song
// (digital silence skipped). Also returns how "hissy" the high end is.
function dnProfile(L, R, fs){
  const N = DN_N, nb = N/2+1, n = L.length, frames = Math.floor((n - N)/DN_H); if(frames < 24) return null;
  const take = Math.min(450, Math.floor(frames/4)), re = new Float64Array(N), im = new Float64Array(N), P = [], q = new Float32Array(nb);
  for(let f=0; f<take; f++){
    const o0 = Math.floor(f*(frames-4)/take)*DN_H, p = new Float32Array(nb); let e = 0;
    for(let j=0;j<4;j++){ dnFrame(L, R, o0 + j*DN_H, re, im);          // 4 frames in a row, averaged: a steady estimate, not a lucky dip
      for(let k=0;k<nb;k++){ const k2 = (N-k)%N, lr = (re[k]+re[k2])/2, li = (im[k]-im[k2])/2, rr = (im[k]+im[k2])/2, ri = (re[k2]-re[k])/2;
        q[k] = (lr*lr + li*li + rr*rr + ri*ri)/8; } for(let k=0;k<nb;k++) p[k] += q[k]; }
    const sm = new Float32Array(nb); for(let k=0;k<nb;k++){ sm[k] = (p[Math.max(0,k-1)] + p[k] + p[Math.min(nb-1,k+1)])/3; e += sm[k]; }
    if(e > 1e-9) P.push(sm);
  }
  if(P.length < 20) return null;
  const noise = new Float32Array(nb), med = new Float32Array(nb), col = new Float32Array(P.length);
  for(let k=0;k<nb;k++){ for(let i=0;i<P.length;i++) col[i] = P[i][k]; col.sort();
    noise[k] = col[Math.floor(col.length*0.12)]*1.35; med[k] = col[Math.floor(col.length*0.5)]; }
  // hiss: steady floor in 5–15 kHz compared to the median there (0 dB = the highs are only noise)
  const k0 = Math.round(5000/fs*N), k1 = Math.min(nb-1, Math.round(15000/fs*N)); let sn = 0, sm = 0;
  for(let k=k0;k<=k1;k++){ sn += noise[k]; sm += med[k]; }
  let ftot = 0, ntot = 0; for(let k=1;k<nb;k++){ ftot += med[k]; } for(let k=k0;k<=k1;k++) ntot += noise[k];
  return {noise, hiss: 10*Math.log10((sn+1e-20)/(sm+1e-20)), floorDb: 10*Math.log10((ntot+1e-20)/(ftot+1e-20))};
}
// amt 0..1. Returns [L, R] (new arrays). `tick(p)` may be async (yield to the UI).
async function dnProcess(L, R, fs, amt, tick){
  const prof = dnProfile(L, R, fs); if(!prof) return [L, R];
  const N = DN_N, H = DN_H, nb = N/2+1, n = L.length, w = DN_T.w;
  const beta = 1.5 + 3.5*amt, floor = Math.pow(10, -(6 + 18*amt)/20);
  const fw = new Float32Array(nb); for(let k=0;k<nb;k++){ const f = k*fs/N; fw[k] = f < 400 ? 0 : f > 2500 ? 1 : (f-400)/2100; }
  const nz = prof.noise, g = new Float32Array(nb), gs = new Float32Array(nb).fill(1), gp = new Float32Array(nb).fill(1);
  const oL = new Float32Array(n), oR = new Float32Array(n), re = new Float64Array(N), im = new Float64Array(N);
  const rel = Math.exp(-H/fs/0.06);          // gain may close over ~60 ms, opens immediately
  const frames = Math.ceil((n + N)/H);
  for(let f=0; f<frames; f++){
    const o = f*H - N + H;
    dnFrame(L, R, o, re, im);
    for(let k=0;k<nb;k++){ const k2 = (N-k)%N, lr = (re[k]+re[k2])/2, li = (im[k]-im[k2])/2, rr = (im[k]+im[k2])/2, ri = (re[k2]-re[k])/2;
      const p = (lr*lr + li*li + rr*rr + ri*ri)/2 + 1e-20;
      let x = 1 - beta*nz[k]/p; x = x < 0 ? 0 : Math.sqrt(x); g[k] = Math.max(floor, x); }
    for(let k=0;k<nb;k++){ const a = g[Math.max(0,k-1)], c = g[Math.min(nb-1,k+1)], s = 0.25*a + 0.5*g[k] + 0.25*c;
      const v = s > gp[k] ? s : gp[k]*rel + s*(1-rel); gp[k] = v; gs[k] = 1 - fw[k]*(1 - v); }
    for(let k=0;k<N;k++){ const kk = k <= N/2 ? k : N-k; re[k] *= gs[kk]; im[k] *= gs[kk]; }
    dnFft(re, im, true);
    for(let i=0;i<N;i++){ const j = o+i; if(j < 0 || j >= n) continue; const s = w[i]/N/2*1.0; oL[j] += re[i]*s*2/ 1; oR[j] += im[i]*s*2/1; }
    if(tick && (f & 255) === 0) await tick(f/frames);
  }
  // sqrt-Hann^2 = Hann, overlap at 75 % sums to 2
  for(let i=0;i<n;i++){ oL[i] *= 0.5; oR[i] *= 0.5; }
  return [oL, oR];
}

// Per track: "Rauschen entfernen" works on a copy, the original stays in t.orig (switching it off brings it back 1:1)
const hasEdits = t => !!(t.dn || t.trimA || t.trimB || t.shift);
// cut before start / after end (8 ms fades so nothing clicks) and move the content by `sh` seconds; length stays the same
function trimBuf(b, a, e, sh){
  const fs = b.sampleRate, n = b.length, A = Math.max(0, Math.round(a*fs)), E = e > 0 ? Math.min(n, Math.round(e*fs)) : n, S = Math.round(sh*fs), F = Math.round(0.008*fs);
  const out = ac().createBuffer(2, n, fs);
  for(let c=0;c<2;c++){ const src = b.getChannelData(Math.min(c, b.numberOfChannels-1)), d = out.getChannelData(c);
    for(let i=A;i<E;i++){ const j = i + S; if(j < 0 || j >= n) continue; let w = 1; if(A > 0 && i - A < F) w = (i - A)/F; if(E < n && E - i < F) w = Math.min(w, (E - i)/F); d[j] = src[i]*w; } }
  return out;
}
// The original always stays in t.orig: switching an edit off brings it back 1:1
async function applyEdits(t, quiet){
  const job = t.edJob = (t.edJob||0) + 1;
  if(!t.orig) t.orig = t.buffer;
  let b = t.orig;
  if(t.dn > 0){
    if(!(t.dnBuf && t.dnKey === t.dn && t.dnSrc === t.orig)){
      const o = t.orig, L = o.getChannelData(0), R = o.numberOfChannels > 1 ? o.getChannelData(1) : L;
      if(!quiet) setStatus(`Entferne Rauschen: ${t.name} …`);
      const [oL, oR] = await dnProcess(L, R, o.sampleRate, t.dn/100, async p=>{ if(!quiet) setProg(p); await sleep0(); });
      if(job !== t.edJob) return false;
      const nb = ac().createBuffer(2, o.length, o.sampleRate); nb.copyToChannel(oL, 0); nb.copyToChannel(oR, 1);
      t.dnBuf = nb; t.dnKey = t.dn; t.dnSrc = o;
      if(!quiet){ setProg(0); setStatus(`Rauschen entfernt: ${t.name} (${t.dn} %).`); }
    }
    b = t.dnBuf;
  }
  if(t.trimA || t.trimB || t.shift) b = trimBuf(b, t.trimA||0, t.trimB||0, t.shift||0);
  if(job !== t.edJob || t.buffer === b) return false;
  const was = playing; if(was) stop();
  t.buffer = b; t.proc = null; t.Lst = undefined; t.dnV = (t.dnV||0) + 1; t.peaks = computePeaks(b, 400); stemLufs = null;
  if(t.el){ const r = t.el.querySelector(".dn"); if(r) r.value = t.dn||0; const l = t.el.querySelector(".vDn"); if(l) l.textContent = t.dn ? t.dn+" %" : "Aus"; }
  if(P.tempo !== 1 || P.semis !== 0 || (P.mode === "tape" && P.keepVox && rate !== 1)) applyTempo(true);
  drawWaves(); if(was) play(); scheduleAnalysis(); saveSoon(); if(t.refresh) t.refresh();
  return true;
}
// new base content (re-recorded, re-built, other MIDI sound): edits are applied again on top of it
function newBase(t){ t.orig = t.buffer; t.dnBuf = null; if(hasEdits(t)) applyEdits(t, true); }
async function setDenoise(t, v, quiet){ t.dn = Math.max(0, Math.min(100, Math.round(v||0))); return applyEdits(t, quiet); }
// Auto-Mix: which stems hiss? Vocals and sustained instruments only, never drums or bass (their noise is the sound)
const DN_ROLES = ["lead","bv","synth","keys","pad","guitar","other","strings","fx","vocal"];
function hissOf(t){ const b = t.orig || t.buffer; return dnProfile(b.getChannelData(0), b.numberOfChannels > 1 ? b.getChannelData(1) : b.getChannelData(0), b.sampleRate); }
let MIX_HISS = false;
async function autoDenoise(){
  MIX_HISS = false; const done = [];
  // a finished song (one track): hi-hats and cymbals look like noise there, so Auto leaves it alone (the slider is still there)
  if(tracks.length === 1) return done;
  for(const t of tracks){
    if(!DN_ROLES.includes(role(t.name))) { if(t.dn) await setDenoise(t, 0, true); continue; }
    const pr = hissOf(t); let v = 0;
    // hiss = the steady floor in 5–15 kHz is within 10 dB of the typical level there: the highs are mostly noise
    if(pr && pr.floorDb > -62 && pr.hiss > -10) v = Math.round(Math.min(60, 30 + (pr.hiss + 10)*3)/10)*10;
    log("Rauschen", t.name, pr ? `hiss ${pr.hiss.toFixed(1)} dB, Boden ${pr.floorDb.toFixed(1)} dB` : "–", "→", v ? v+" %" : "aus");
    if(v){ MIX_HISS = true; done.push(t.name); }
    if(v !== (t.dn||0)){ setStatus(`Auto-Mix: entferne Rauschen (${t.name}) …`); await setDenoise(t, v, true); }
  }
  return done;
}

// Mono downmix of selected stems, decimated by 4, at most `secs` seconds
function monoOf(list, secs){
  const fs = list[0].buffer.sampleRate, D = 4, n = Math.min(Math.max(...list.map(t=>t.buffer.length)), Math.round(secs*fs)), m = Math.floor(n/D);
  const out = new Float32Array(m);
  list.forEach(t=>{ const b=t.buffer; for(let c=0;c<b.numberOfChannels;c++){ const x=b.getChannelData(c), k=t.vol/b.numberOfChannels/D;
    for(let i=0;i<m;i++){ const o=i*D; if(o+3>=x.length) break; out[i]+=(x[o]+x[o+1]+x[o+2]+x[o+3])*k; } } });
  return {x:out, fs:fs/D};
}

/* ---- tempo: onset envelope + autocorrelation ---- */
function detectBpm(x, fs){
  const hop = 64, nf = Math.floor(x.length/hop), fps = fs/hop, env = new Float32Array(nf);
  let prev = 0;
  for(let f=0; f<nf; f++){ let e=0; for(let i=f*hop;i<(f+1)*hop;i++) e+=x[i]*x[i]; e=Math.log(1+1000*e/hop); env[f]=Math.max(0,e-prev); prev=e; }
  let mean=0; env.forEach(v=>mean+=v); mean/=nf; for(let f=0;f<nf;f++) env[f]-=mean;
  const lo = Math.floor(fps*60/200), hi = Math.ceil(fps*60/60), ac = new Float64Array(hi+2);
  for(let l=lo;l<=hi+1;l++){ let s=0; for(let f=0;f+l<nf;f++) s+=env[f]*env[f+l]; ac[l]=s/(nf-l); }
  let best=lo, bv=-Infinity;
  for(let l=lo;l<=hi;l++){ const bpm=60*fps/l, w=Math.exp(-0.5*Math.pow(Math.log2(bpm/115)/0.9,2)); const v=ac[l]*w; if(v>bv){ bv=v; best=l; } }
  const a=ac[best-1]||0, b=ac[best], c=ac[best+1]||0, d=a-2*b+c, off=d!==0?0.5*(a-c)/d:0;
  let bpm = 60*fps/(best+off);
  while(bpm<70) bpm*=2; while(bpm>180) bpm/=2;
  return bpm;
}

/* ---- key: chroma + Krumhansl-Schmuckler profiles ---- */
const KEYN = ["C","C♯","D","E♭","E","F","F♯","G","A♭","A","B♭","H"];
function detectKey(x, fs){
  const N = 4096, w = hann(N), chroma = new Float64Array(12), re = new Float64Array(N), im = new Float64Array(N);
  const binPc = new Int8Array(N/2).fill(-1);
  for(let k=1;k<N/2;k++){ const f=k*fs/N; if(f<60||f>2500) continue; binPc[k]=((Math.round(12*Math.log2(f/440))+69)%12+12)%12; }
  for(let s=0; s+N<=x.length; s+=N*2){
    for(let i=0;i<N;i++){ re[i]=x[s+i]*w[i]; im[i]=0; }
    fft(re, im);
    const fr=new Float64Array(12);
    for(let k=1;k<N/2;k++) if(binPc[k]>=0) fr[binPc[k]] += Math.sqrt(re[k]*re[k]+im[k]*im[k]);
    let mx=0; fr.forEach(v=>{ if(v>mx) mx=v; }); if(mx>0) for(let p=0;p<12;p++) chroma[p]+=fr[p]/mx;
  }
  const MAJ=[6.35,2.23,3.48,2.33,4.38,4.09,2.52,5.19,2.39,3.66,2.29,2.88], MIN=[6.33,2.68,3.52,5.38,2.60,3.53,2.54,4.75,3.98,2.69,3.34,3.17];
  const corr=(prof,root)=>{ const a=[],b=[]; for(let i=0;i<12;i++){ a.push(chroma[(i+root)%12]); b.push(prof[i]); }
    const ma=a.reduce((x,y)=>x+y)/12, mb=b.reduce((x,y)=>x+y)/12; let n=0,da=0,db=0;
    for(let i=0;i<12;i++){ n+=(a[i]-ma)*(b[i]-mb); da+=(a[i]-ma)**2; db+=(b[i]-mb)**2; } return n/Math.sqrt(da*db||1); };
  let best={r:-2};
  for(let root=0;root<12;root++){ const ma=corr(MAJ,root), mi=corr(MIN,root); if(ma>best.r) best={r:ma,root,minor:false}; if(mi>best.r) best={r:mi,root,minor:true}; }
  return best;
}
const keyName = (root, minor) => KEYN[root] + (minor ? "-Moll" : "-Dur");
const camelot = (root, minor) => (minor ? ((root*7)%12+4)%12+1 + "A" : ((root*7)%12+7)%12+1 + "B");

let song = null;
async function detectSong(){
  if(!tracks.length) return;
  $("fBpm").textContent = "…"; $("fKey").textContent = "…";
  await sleep0();
  const DR = /(drum|kick|snare|hat|perc|beat|clap|loop)/i;
  const drums = tracks.filter(t=>DR.test(t.name)), tonal = tracks.filter(t=>!DR.test(t.name) && !/(vocal|vox|voice)/i.test(t.name));
  const forBpm = monoOf(drums.length?drums:tracks, 90);
  const bpm = detectBpm(forBpm.x, forBpm.fs);
  await sleep0();
  const forKey = monoOf(tonal.length?tonal:tracks, 120);
  const k = detectKey(forKey.x, forKey.fs);
  song = {bpm, root:k.root, minor:k.minor};
  showSong();
}
/* ---- tempo & key: tape mode (varispeed) or pro mode (time-stretch + pitch-shift) ---- */
const P = {mode:"pro", tempo:1, semis:0, ver:0, job:0, timer:0, keepVox:false};
const buf = t => t.proc || t.buffer;
const effTempo = () => P.mode==="tape" ? rate : P.tempo;
const effSemis = () => P.mode==="tape" ? 12*Math.log2(rate) : P.semis;

function showSong(){
  if(typeof syncFx==="function" && FX_READY) syncFx();
  const pct = Math.round(P.tempo*100), semis = effSemis();
  $("vRate").textContent = pct===100 ? "100 % · Original" : `${pct} %` + (P.mode==="tape" ? ` · ${semis>0?"+":""}${semis.toFixed(1)} Halbtöne` : " · Tonhöhe bleibt");
  $("vSemi").textContent = P.semis===0 ? "±0 Halbtöne" : `${P.semis>0?"+":""}${P.semis} Halbtöne`;
  document.querySelectorAll("#ratePresets button").forEach(b=>b.setAttribute("aria-pressed", +b.dataset.r===pct));
  document.querySelectorAll("#tMode button").forEach(b=>b.setAttribute("aria-pressed", b.dataset.mode===P.mode));
  $("semiBox").hidden = P.mode==="tape"; $("keepVoxBox").hidden = P.mode!=="tape"; $("keepVox").checked = P.keepVox;
  if(!song) return;
  const bpmNow = song.bpm*effTempo();
  $("fBpm").textContent = Math.round(bpmNow);
  $("fBpmSub").textContent = pct===100 ? "BPM (geschätzt)" : `BPM · Original ${Math.round(song.bpm)}`;
  $("targetBpm").placeholder = Math.round(bpmNow);
  const st = Math.round(semis), exact = Math.abs(semis-st) < 0.2, root = ((song.root+st)%12+12)%12;
  $("fKey").textContent = exact ? keyName(root, song.minor) : keyName(song.root, song.minor)+" ~";
  $("fKeySub").textContent = exact ? `Camelot ${camelot(root, song.minor)}` + (st?` · Original ${keyName(song.root,song.minor)}`:"") : `zwischen zwei Tönen (${semis>0?"+":""}${semis.toFixed(1)} HT)`;
}
function tNote(t, busy){ saveSoon(); $("tNote").textContent = t; $("tNote").classList.toggle("busy", !!busy); }

// Keep the playhead and A–B markers at the same musical spot when the timeline length changes
function retime(fn){
  const was = playing; stop();
  const f = duration ? offset/duration : 0, fa = AB.a!==null ? AB.a/duration : null, fb = AB.b!==null ? AB.b/duration : null;
  fn();
  duration = Math.max(...tracks.map(t=>buf(t).duration));
  offset = f*duration; if(fa!==null) AB.a = fa*duration; if(fb!==null) AB.b = fb*duration;
  $("dur").textContent = fmtT(duration/rate); $("cur").textContent = fmtT(offset/rate); $("seek").value = Math.round(f*1000);
  showAB(); drawWaves(); if(was) play();
}

function applyTempo(now){
  showSong();
  if(!tracks.length) return;
  clearTimeout(P.timer);
  if(P.mode==="tape"){
    P.job++;
    retime(()=>{ tracks.forEach(t=>t.proc=null); rate = P.tempo; });
    P.ver++; showSong(); scheduleAnalysis();
    if(P.keepVox && Math.abs(rate-1)>1e-3 && tracks.some(t=>isVox(t))){ tNote("Berechne Vocals in Originaltonhöhe …", true); P.timer = setTimeout(processVoxTape, now ? 0 : 350); }
    else tNote("Wie bei einer Kassette: Tempo und Tonhöhe ändern sich zusammen.");
    return;
  }
  if(rate!==1){ retime(()=>{ rate = 1; }); }
  P.timer = setTimeout(processStems, now ? 0 : 350);
}

async function processStems(){
  const job = ++P.job, fs = tracks[0].buffer.sampleRate, p = Math.pow(2, P.semis/12), alpha = p/P.tempo;
  if(Math.abs(P.tempo-1)<1e-4 && P.semis===0){
    retime(()=>tracks.forEach(t=>t.proc=null)); P.ver++; tNote("Original. Tempo und Tonart lassen sich getrennt ändern."); scheduleAnalysis(); return;
  }
  tNote("Berechne Tempo und Tonart …", true); await sleep0();
  const plan = wsolaPlan(alpha, fs);
  const out = [];
  for(let i=0;i<tracks.length;i++){
    if(job!==P.job) return;
    tNote(`Berechne Tempo und Tonart … ${i+1}/${tracks.length}`, true); await sleep0();
    const b = tracks[i].buffer, chs = [];
    for(let c=0;c<Math.min(2,b.numberOfChannels);c++) chs.push(wsolaApply(b.getChannelData(c), plan));
    if(chs.length===1) chs.push(chs[0]);
    const res = await varispeed(chs, fs, p);
    const nb = ac().createBuffer(2, res[0].length, fs); nb.copyToChannel(res[0],0); nb.copyToChannel(res[1],1);
    out.push(nb);
  }
  if(job!==P.job) return;
  retime(()=>tracks.forEach((t,i)=>t.proc=out[i]));
  P.ver++; showSong(); scheduleAnalysis();
  tNote(`Fertig: ${Math.round(P.tempo*100)} % Tempo, ${P.semis>0?"+":""}${P.semis} Halbtöne.` + (Math.abs(P.semis)>=4 ? " Bei großen Tonart-Sprüngen klingen Stimmen schnell künstlich." : ""));
}

/* Tape mode with original vocal pitch: the vocal stems are pre-shifted by the opposite amount
   (time-stretch + resample, length unchanged), so the tape speed-up/slow-down brings them back
   to their original pitch while they stay perfectly in time with the beat. */
async function processVoxTape(){
  const job = ++P.job, fs = tracks[0].buffer.sampleRate, p = 1/rate, vox = tracks.filter(t=>isVox(t));
  tNote("Berechne Vocals in Originaltonhöhe …", true); await sleep0();
  const plan = wsolaPlan(p, fs, vox), out = [];
  for(let i=0;i<vox.length;i++){
    if(job!==P.job) return;
    tNote(`Berechne Vocals in Originaltonhöhe … ${i+1}/${vox.length}`, true); await sleep0();
    const b = vox[i].buffer, chs = [];
    for(let c=0;c<Math.min(2,b.numberOfChannels);c++) chs.push(wsolaApply(b.getChannelData(c), plan));
    if(chs.length===1) chs.push(chs[0]);
    const res = await varispeed(chs, fs, p);
    const nb = ac().createBuffer(2, res[0].length, fs); nb.copyToChannel(res[0],0); nb.copyToChannel(res[1],1);
    out.push(nb);
  }
  if(job!==P.job) return;
  retime(()=>vox.forEach((t,i)=>t.proc=out[i]));
  P.ver++; scheduleAnalysis();
  const st = 12*Math.log2(rate);
  tNote(`Vocals bleiben in Originaltonhöhe, der Beat ist ${Math.abs(st).toFixed(1).replace(".",",")} Halbtöne ${st<0?"tiefer":"höher"}.` +
        (Math.abs(st) >= 0.5 ? " Achtung: Weil nur der Beat seine Tonart ändert, können Gesang und Beat schief zueinander klingen. Hör genau hin. Soll alles in der Originaltonart bleiben, nimm den Modus „Tonhöhe behalten“." : ""));
}

/* WSOLA time-stretch. The frame alignment is searched once on the full mix
   and then applied to every stem, so all stems stay sample-locked together. */
function wsolaPlan(alpha, fs, list = tracks){
  const D = 8, N = 2*Math.round(0.025*fs), Hs = N/2, Ha = Hs/alpha, tol = Math.round(0.012*fs);
  const n = Math.max(...list.map(t=>t.buffer.length)), m = Math.floor(n/D), x = new Float32Array(m);
  list.forEach(t=>{ const b=t.buffer; for(let c=0;c<b.numberOfChannels;c++){ const d=b.getChannelData(c);
    for(let i=0;i<m;i++){ const o=i*D; if(o>=d.length) break; x[i]+=d[o]; } } });
  const outLen = Math.round(n*alpha), K = Math.ceil(outLen/Hs)+1, pos = new Int32Array(K);
  const hd = Math.floor(Hs/D), td = Math.floor(tol/D);
  for(let k=1;k<K;k++){
    const nom = Math.round(k*Ha), nat = Math.round((pos[k-1]+Hs)/D), nomd = Math.round(nom/D);
    let best = 0, bv = -Infinity;
    if(nat+hd < m){
      for(let d=-td; d<=td; d++){
        const c = nomd+d; if(c<0 || c+hd>=m) continue;
        let s=0, e=0; for(let i=0;i<hd;i+=2){ const v=x[c+i]; s+=x[nat+i]*v; e+=v*v; }
        const val = s/Math.sqrt(e+1e-9); if(val>bv){ bv=val; best=d; }
      }
    }
    pos[k] = Math.max(0, (nomd+best)*D);
  }
  return {pos, N, Hs, K, outLen};
}
function wsolaApply(x, plan){
  const {pos, N, Hs, K, outLen} = plan, w = hann(N), out = new Float32Array(K*Hs+N);
  for(let k=0;k<K;k++){
    const p = pos[k], o = k*Hs;
    for(let i=0;i<N;i++){ const j=p+i; if(j>=x.length) break; out[o+i] += (k===0 && i<Hs ? 1 : w[i]) * x[j]; }
  }
  return out.subarray(0, outLen);
}

$("rate").oninput = e => { P.tempo = +e.target.value/100; if(P.mode==="tape") applyTempo(); else showSong(); };
$("rate").onchange = () => { if(P.mode==="pro") applyTempo(); };
$("semi").oninput = e => { P.semis = +e.target.value; showSong(); };
$("semi").onchange = () => applyTempo();
$("semiPresets").onclick = e => { const v = e.target.dataset && e.target.dataset.s; if(v===undefined) return; P.semis = +v; $("semi").value = v; applyTempo(true); };
// one-click vibes: slowed + reverb, sped up, nightcore
let VIBE_FX = null;
$("vibePresets").onclick = e => { const v = e.target.dataset && e.target.dataset.v; if(!v || !tracks.length) return;
  const T = {slowed:0.85, sped:1.2, night:1.3, orig:1};
  if(VIBE_FX){ tracks.forEach(t=>{ if(VIBE_FX.has(t)) { t.rev = VIBE_FX.get(t); t.refresh(); } }); VIBE_FX = null; }
  if(v === "slowed"){ VIBE_FX = new Map(); tracks.forEach(t=>{ VIBE_FX.set(t, t.rev||0); t.rev = Math.max(t.rev||0, isVox(t) ? 40 : 28); t.refresh(); });
    FX.revType = "hall"; FX.revLvl = Math.max(FX.revLvl, 100); if(!FXON) setFxOn(true); syncFx(); }
  if(v === "orig"){ P.mode = "pro"; P.tempo = 1; P.semis = 0; $("semi").value = 0; }
  else P.mode = "tape";
  P.tempo = T[v]; $("rate").value = Math.round(T[v]*100);
  document.querySelectorAll("#vibePresets button").forEach(b=>b.setAttribute("aria-pressed", b.dataset.v === v && v !== "orig"));
  applyTempo(true); after(); setStatus({slowed:"Slowed + Reverb: 85 % wie eine Kassette, mit Hall.", sped:"Sped Up: 120 %, schneller und höher.", night:"Nightcore: 130 %, sehr schnell und hoch.", orig:"Zurück zum Original."}[v]); };
$("ratePresets").onclick = e => { const r = e.target.dataset && e.target.dataset.r; if(!r) return; P.tempo = +r/100; $("rate").value = r; applyTempo(true); };
$("keepVox").onchange = e => { P.keepVox = e.target.checked; applyTempo(true); };
$("tMode").onclick = e => { const m = e.target.dataset && e.target.dataset.mode; if(!m || m===P.mode) return; P.mode = m; applyTempo(true); };
$("targetBpm").onchange = e => {
  if(!song || !(+e.target.value>0)) return;
  let t = +e.target.value/song.bpm;
  if(t>1.3 && t/2>=0.7) t/=2; if(t<0.7 && t*2<=1.3) t*=2;     // allow half/double time
  t = Math.max(0.7, Math.min(1.3, t));
  P.tempo = Math.round(t*1000)/1000; $("rate").value = Math.round(P.tempo*100); e.target.value = ""; applyTempo(true);
};
showSong();

/* ---- A–B section / loop ---- */
const AB = {a:null, b:null};
function showAB(){ saveSoon(); drawSec();
  ["nudgeL","nudgeR"].forEach(id=>$(id).disabled = !(AB.a!==null && AB.b!==null));
  const set = AB.a!==null || AB.b!==null;
  $("abTxt").textContent = set ? `${AB.a!==null?fmtT(AB.a/rate):"?"} – ${AB.b!==null?fmtT(AB.b/rate):"?"}` : "nicht gesetzt";
  const ok = AB.a!==null && AB.b!==null;
  $("onlyAB").disabled = !ok; if(!ok) $("onlyAB").checked = false;
}
$("setA").onclick = () => { AB.a = currentTime(); if(AB.b!==null && AB.b<=AB.a) AB.b = null; showAB(); drawWaves(); scheduleAnalysis(); };
$("setB").onclick = () => { const t = currentTime(); if(AB.a!==null && t<=AB.a) return; AB.b = t; showAB(); drawWaves(); scheduleAnalysis(); };
$("clrAB").onclick = () => { AB.a = AB.b = null; $("loopOn").checked = false; showAB(); drawWaves(); scheduleAnalysis(); };
$("onlyAB").onchange = () => { scheduleAnalysis(); previewSoon(); };

/* ---- draggable section + automatic hook detection ---- */
const SEC = {len:30, env:null, envKey:"", drag:null, hook:false, v0:0, v1:null};
// visible part of the section waveform (zoom): [v0, v1] on the playback timeline
const secView = () => { const v1 = Math.min(duration, SEC.v1 ?? duration), v0 = Math.max(0, Math.min(SEC.v0, v1 - 1)); return [v0, Math.max(v0 + 0.5, v1)]; };
const secTx = (t, w) => { const [v0, v1] = secView(); return (t - v0)/(v1 - v0)*w; };
const secXt = (x, w) => { const [v0, v1] = secView(); return v0 + x/w*(v1 - v0); };
function secZoom(f, at){ if(!duration) return; const [v0, v1] = secView(), span = v1 - v0, min = Math.min(duration, 3*rate);
  const ns = Math.max(min, Math.min(duration, span*f)), c = at ?? (v0+v1)/2, k = (c - v0)/span;
  let a = c - k*ns; a = Math.max(0, Math.min(duration - ns, a)); SEC.v0 = a; SEC.v1 = ns >= duration-1e-6 ? null : a + ns; drawSec(); }
const barTl = () => 4*60/((song ? song.bpm : 120) * (P.mode==="pro" ? P.tempo : 1));      // one bar on the playback timeline
const phaseTl = () => (SC.kicks && SC.kicks.length) ? SC.kicks[0] * (P.mode==="pro" ? 1/P.tempo : 1) : 0;
function snapT(x){ if(!$("snapBar").checked) return Math.max(0, x); const b = barTl(), ph = phaseTl() % b; return Math.max(0, ph + Math.round((x-ph)/b)*b); }
const lenTl = () => Math.min(duration, SEC.len*rate);
function setSection(a){
  const L = lenTl(); a = Math.max(0, Math.min(a, duration - L));
  AB.a = a; AB.b = Math.min(duration, a + L);
}
function secEnvelope(){
  const key = P.ver + "|" + tracks.length;
  if(SEC.env && SEC.envKey === key) return SEC.env;
  const nb = Math.max(600, Math.min(24000, Math.round(duration*40))), env = new Float32Array(nb);   // ~25 ms per bin, enough detail for zooming in
  tracks.forEach(t=>{ const b = buf(t), d = b.getChannelData(0), step = (duration*b.sampleRate)/nb;
    for(let i=0;i<nb;i++){ const s = Math.floor(i*step), e = Math.min(d.length, Math.floor((i+1)*step)); let m = 0; for(let j=s;j<e;j+=24){ const v=Math.abs(d[j]); if(v>m) m=v; } env[i] += m; } });
  let mx = 0; env.forEach(v=>{ if(v>mx) mx=v; }); if(mx>0) for(let i=0;i<nb;i++) env[i] /= mx;
  SEC.env = env; SEC.envKey = key; return env;
}
/* v17: the section waveform was blank after switching to step 4 (it was hidden while drawn) — redraw whenever it gets a size */
setTimeout(()=>{ try{ new ResizeObserver(()=>drawSec()).observe($("secCv")); }catch(e){} }, 0);
function drawSec(){
  const cv = $("secCv"); if(!cv) return;
  const w = cv.clientWidth, h = cv.clientHeight, dpr = devicePixelRatio||1;
  if(!w) return;
  if(cv.width!==Math.round(w*dpr)){ cv.width=Math.round(w*dpr); cv.height=Math.round(h*dpr); }
  const g = cv.getContext("2d"); g.setTransform(dpr,0,0,dpr,0,0); g.clearRect(0,0,w,h);
  if(!tracks.length || !duration){ g.fillStyle = cssVar("--muted"); g.font = "12px "+cssVar("--f-body"); g.fillText("Lade Stems, dann erscheint hier der Song.", 10, h/2+4); return; }
  const env = secEnvelope(), nb = env.length, [v0, v1] = secView(), span = v1 - v0, zoomed = span < duration - 1e-6;
  // playhead leaves the zoomed view while playing: page along
  if(zoomed && playing && !SEC.drag){ const t = currentTime(); if(t > v1 || t < v0){ SEC.v0 = Math.max(0, Math.min(duration - span, t - span*0.1)); SEC.v1 = SEC.v0 + span; return drawSec(); } }
  // grid: bars (every 4 bars when zoomed out), beats when zoomed in far
  if(song){ const b = barTl(), ph = phaseTl() % b, pxBar = b/span*w, stepB = pxBar < 6 ? b*4 : b;
    if(pxBar > 60){ g.globalAlpha = .45; g.fillStyle = cssVar("--line"); for(let t = ph + Math.floor((v0-ph)/(b/4))*(b/4); t < v1; t += b/4) g.fillRect(secTx(t,w), 0, 1, h); g.globalAlpha = 1; }
    g.fillStyle = cssVar("--line"); for(let t = ph + Math.floor((v0-ph)/stepB)*stepB; t < v1; t += stepB) g.fillRect(secTx(t,w), 0, 1, h); }
  const BW = 3;   // one bar every 3 px, height = loudest part inside it
  for(let x=0; x<w; x+=BW){ const t0 = secXt(x, w), t1 = secXt(x+BW, w);
    let i0 = Math.floor(t0/duration*nb), i1 = Math.max(i0+1, Math.ceil(t1/duration*nb)), m = 0;
    for(let i=Math.max(0,i0); i<Math.min(nb,i1); i++) if(env[i] > m) m = env[i];
    const ph = Math.max(1, m*(h-18)), tm = (t0+t1)/2;
    g.fillStyle = AB.a!==null && AB.b!==null && tm >= AB.a && tm <= AB.b ? cssVar("--accent") : cssVar("--wave"); g.fillRect(x, (h-ph)/2, BW-1, ph); }
  if(zoomed){ // where we are in the song + time at the edges
    g.globalAlpha = .5; g.fillStyle = cssVar("--muted"); g.fillRect(0, h-3, w, 3); g.globalAlpha = 1;
    g.fillStyle = cssVar("--fg"); g.fillRect(v0/duration*w, h-3, Math.max(4, span/duration*w), 3);
    g.font = "10px "+cssVar("--f-mono"); g.fillStyle = cssVar("--muted"); g.textAlign = "left"; g.fillText(fmtT(v0/rate), 4, h-7);
    g.textAlign = "right"; g.fillText(fmtT(v1/rate), w-4, h-7); g.textAlign = "left"; }
  if(AB.a!==null && AB.b!==null){
    const xa = secTx(AB.a, w), xb = secTx(AB.b, w);
    g.globalAlpha = .16; g.fillStyle = cssVar("--accent"); g.fillRect(xa, 0, xb-xa, h); g.globalAlpha = 1;
    g.fillStyle = cssVar("--accent"); g.fillRect(xa-1.5, 0, 3, h); g.fillRect(xb-1.5, 0, 3, h);
    g.fillRect(xa-5, h/2-10, 10, 20); g.fillRect(xb-5, h/2-10, 10, 20);
    g.font = "600 11px "+cssVar("--f-mono"); g.fillStyle = cssVar("--fg"); g.textAlign = "left";
    g.fillText((SEC.hook ? "HOOK · " : "") + fmtT(AB.a/rate) + " – " + fmtT(AB.b/rate), Math.max(4, Math.min(xa+6, w-150)), 12);
  }
  const pos = secTx(currentTime(), w); g.fillStyle = cssVar("--fg"); g.fillRect(pos, 0, 1.5, h);
}
function secChanged(final){
  SEC.hook = SEC.hook && final!=="manual";
  showAB(); drawWaves();
  if(final){ if(!$("onlyAB").disabled) $("onlyAB").checked = true; scheduleAnalysis(); previewSoon();
    const was = playing; stop(); offset = AB.a; $("cur").textContent = fmtT(offset/rate); if(was) play(); drawSec(); }
}
const secCv = $("secCv");
secCv.addEventListener("pointerdown", e=>{
  if(!tracks.length) return;
  const r = secCv.getBoundingClientRect(), x = e.clientX - r.left, t = secXt(x, r.width);
  const xa = AB.a!==null ? secTx(AB.a, r.width) : -99, xb = AB.b!==null ? secTx(AB.b, r.width) : -99;
  if(AB.a!==null && Math.abs(x-xa) < 10) SEC.drag = {mode:"a"};
  else if(AB.b!==null && Math.abs(x-xb) < 10) SEC.drag = {mode:"b"};
  else if(AB.a!==null && AB.b!==null && x>xa && x<xb) SEC.drag = {mode:"move", grab: t - AB.a, len: AB.b - AB.a};
  else { setSection(snapT(t - lenTl()/2)); SEC.drag = {mode:"move", grab: t - AB.a, len: AB.b - AB.a}; }
  secCv.setPointerCapture(e.pointerId); secCv.classList.add("drag"); SEC.hook = false; secChanged(false);
});
secCv.addEventListener("pointermove", e=>{
  const r = secCv.getBoundingClientRect(), x = e.clientX - r.left, t = Math.max(0, Math.min(duration, secXt(x, r.width)));
  if(!SEC.drag){ secCv.style.cursor = (AB.a!==null && (Math.abs(x-secTx(AB.a, r.width))<10 || Math.abs(x-secTx(AB.b, r.width))<10)) ? "ew-resize" : ""; return; }
  const d = SEC.drag, min = Math.min(2*rate, duration);
  if(d.mode==="move"){ let a = snapT(t - d.grab); a = Math.max(0, Math.min(a, duration - d.len)); AB.a = a; AB.b = a + d.len; }
  else if(d.mode==="a"){ AB.a = Math.max(0, Math.min(snapT(t), AB.b - min)); }
  else { AB.b = Math.min(duration, Math.max(snapT(t), AB.a + min)); }
  secChanged(false);
});
const endDrag = ()=>{ if(!SEC.drag) return; SEC.drag = null; secCv.classList.remove("drag"); secChanged("manual"); };
secCv.addEventListener("pointerup", endDrag); secCv.addEventListener("pointercancel", endDrag);
// mouse wheel / trackpad: zoom around the mouse, sideways (or Shift + wheel) scrolls through the song
secCv.addEventListener("wheel", e=>{
  if(!tracks.length || !duration) return; e.preventDefault();
  const r = secCv.getBoundingClientRect(), [v0, v1] = secView(), span = v1 - v0;
  const side = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : (e.shiftKey ? e.deltaY : 0);
  if(side){ const a = Math.max(0, Math.min(duration - span, v0 + side/r.width*span)); if(span < duration){ SEC.v0 = a; SEC.v1 = a + span; drawSec(); } return; }
  secZoom(Math.pow(1.0015, e.deltaY * (e.deltaMode===1 ? 30 : 1)), secXt(e.clientX - r.left, r.width));
}, {passive:false});
$("zIn").onclick = ()=>secZoom(0.5, AB.a!==null && AB.b!==null ? (AB.a+AB.b)/2 : undefined);
$("zOut").onclick = ()=>secZoom(2);
$("zFit").onclick = ()=>{ SEC.v0 = 0; SEC.v1 = null; drawSec(); };
$("zSec").onclick = ()=>{ if(AB.a===null || AB.b===null) return; const pad = (AB.b-AB.a)*0.25; SEC.v0 = Math.max(0, AB.a-pad); SEC.v1 = Math.min(duration, AB.b+pad); drawSec(); };
$("secLen").onclick = e=>{ const l = e.target.dataset && e.target.dataset.l; if(!l) return; SEC.len = +l;
  document.querySelectorAll("#secLen button").forEach(b=>b.setAttribute("aria-pressed", b.dataset.l===l));
  if(AB.a!==null){ setSection(AB.a); secChanged("manual"); } };
const nudge = dir=>{ if(AB.a===null || AB.b===null) return; const L = AB.b-AB.a, a = Math.max(0, Math.min(duration-L, AB.a + dir*barTl())); AB.a = a; AB.b = a+L; secChanged("manual"); };
$("nudgeL").onclick = ()=>nudge(-1); $("nudgeR").onclick = ()=>nudge(1);
addEventListener("resize", drawSec);
drawSec();

// Hook = the bar-aligned window that repeats most (chroma self-similarity, the idea behind audio thumbnailing),
// weighted by loudness and vocal presence.
async function findHook(){
  const fs0 = tracks[0].buffer.sampleRate, D = 4, fs = fs0/D, hopS = 0.25, hop = Math.round(fs*hopS), N = 4096;
  const DR = t => DRUM_ROLES.includes(role(t.name));
  const mono = list => { const n = Math.max(...list.map(t=>buf(t).length)), m = Math.floor(n/D), x = new Float32Array(m);
    list.forEach(t=>{ const b = buf(t); for(let c=0;c<b.numberOfChannels;c++){ const d = b.getChannelData(c), k = t.vol/b.numberOfChannels/D;
      for(let i=0;i<m;i++){ const o=i*D; if(o+3>=d.length) break; x[i] += (d[o]+d[o+1]+d[o+2]+d[o+3])*k; } } }); return x; };
  const vox = tracks.filter(t=>isVox(t)), tonalL = tracks.filter(t=>!DR(t) && !isVox(t));
  const all = mono(tracks), tonal = mono(tonalL.length ? tonalL : tracks), vx = vox.length ? mono(vox) : null;
  const nf = Math.max(1, Math.floor((all.length - N)/hop));
  const w = hann(N), re = new Float64Array(N), im = new Float64Array(N), binPc = new Int8Array(N/2).fill(-1);
  for(let k=1;k<N/2;k++){ const f=k*fs/N; if(f>=60 && f<=2500) binPc[k] = ((Math.round(12*Math.log2(f/440))+69)%12+12)%12; }
  const chroma = new Array(nf), rms = new Float32Array(nf), vr = new Float32Array(nf);
  for(let f=0; f<nf; f++){
    const s = f*hop; let e=0, ev=0;
    for(let i=0;i<N;i++){ re[i] = tonal[s+i]*w[i]; im[i] = 0; e += all[s+i]*all[s+i]; if(vx) ev += vx[s+i]*vx[s+i]; }
    rms[f] = Math.sqrt(e/N); vr[f] = Math.sqrt(ev/N);
    fft(re, im);
    const c = new Float32Array(12); for(let k=1;k<N/2;k++) if(binPc[k]>=0) c[binPc[k]] += Math.sqrt(re[k]*re[k]+im[k]*im[k]);
    let nrm = 0; for(let q=0;q<12;q++) nrm += c[q]*c[q]; nrm = Math.sqrt(nrm)||1; for(let q=0;q<12;q++) c[q] /= nrm;
    chroma[f] = c;
    if(f % 200 === 0) await sleep0();
  }
  const W = Math.max(1, Math.min(nf, Math.round(lenTl()/hopS)));
  const bar = barTl(), ph = phaseTl() % bar, cands = [];
  for(let t=ph; ; t+=bar){ const i = Math.round(t/hopS); if(i+W > nf) break; cands.push({i, t}); }
  if(!cands.length) cands.push({i:0, t:0});
  const sim = (i, j) => { let s=0, n=0; for(let k=0;k<W;k+=2){ const a=chroma[i+k], b=chroma[j+k]; let d=0; for(let q=0;q<12;q++) d+=a[q]*b[q]; s+=d; n++; } return s/n; };
  const mean = (arr, i) => { let s=0; for(let k=0;k<W;k++) s+=arr[i+k]; return s/W; };
  for(const c of cands){
    let best = 0; for(const o of cands){ if(Math.abs(o.i-c.i) < W*0.75) continue; const v = sim(c.i, o.i); if(v>best) best=v; }
    c.rep = best; c.en = mean(rms, c.i); c.vo = vx ? mean(vr, c.i) : 0;
    // hooks usually start where the song lifts: compare the first two bars with the two bars before
    const B2 = Math.max(1, Math.round(2*bar/hopS)), seg = (i0)=>{ let s=0, n=0; for(let k=Math.max(0,i0); k<Math.min(nf, i0+B2); k++){ s+=rms[k]; n++; } return n ? s/n : 0; };
    c.lift = Math.max(0, seg(c.i) - seg(c.i - B2));
  }
  const norm = k => { const v = cands.map(c=>c[k]), lo = Math.min(...v), hi = Math.max(...v); cands.forEach(c=>c[k+"N"] = hi>lo ? (c[k]-lo)/(hi-lo) : 1); };
  norm("rep"); norm("en"); norm("vo"); norm("lift");
  cands.forEach(c=>{ c.score = (vx ? 0.4*c.repN + 0.3*c.enN + 0.15*c.voN : 0.5*c.repN + 0.35*c.enN) + 0.15*c.liftN; if(c.t < duration*0.04) c.score -= 0.15; });
  cands.sort((a,b)=>b.score-a.score);
  return hookOnset(all, fs, cands[0].t, bar);
}
// The hook usually starts where the sound explodes after a build-up or drop. Look around the chosen bar for the
// strongest jump in loudness (1.2 s after vs. 1.2 s before) and start a beat before it, so the clip catches the lift.
function hookOnset(x, fs, t0, bar){
  const hs = 0.02, hop = Math.max(1, Math.round(fs*hs)), n = Math.floor(x.length/hop), db = new Float32Array(n);
  for(let i=0;i<n;i++){ let e=0; const s=i*hop; for(let k=0;k<hop;k++){ const v = x[s+k]||0; e += v*v; } db[i] = 10*Math.log10(e/hop + 1e-10); }
  const W = Math.round(1.2/hs), pre = new Float64Array(n+1); for(let i=0;i<n;i++) pre[i+1] = pre[i] + db[i];
  const avg = (a, b) => { a = Math.max(0, a); b = Math.min(n, b); return b > a ? (pre[b]-pre[a])/(b-a) : -100; };
  let best = -1, bestRise = 0;
  const lo = Math.max(W, Math.round((t0 - 2*bar)/hs)), hi = Math.min(n - W, Math.round((t0 + bar)/hs));
  for(let i=lo; i<=hi; i++){ const r = avg(i, i+W) - avg(i-W, i) - 0.002*Math.abs(i*hs - t0); if(r > bestRise){ bestRise = r; best = i; } }
  const beat = bar/4, lead = Math.max(0.3, Math.min(0.75, beat));
  const onset = best >= 0 && bestRise >= 2 ? best*hs : t0;
  log("Hook:", {bar: +t0.toFixed(2), onset: +onset.toFixed(2), rise_dB: +bestRise.toFixed(1)});
  return Math.max(0, onset - lead - 0.5);   // a little run-up: the clip starts just before the hook hits
}
// One click for social clips: hook → 9:16 → jump to the video panel
$("quickClip").onclick = async ()=>{
  $("quickClip").disabled = true;
  try{
    if(!(SEC.hook && $("onlyAB").checked && AB.a !== null)) await $("findHook").onclick();
    if(AB.a === null) return;
    const b9 = document.querySelector('#vAspect button[data-v="v"]'); if(b9) b9.click();
    const vs = $("vidsec"); if(vs.classList.contains("collapsed")){ const t = vs.querySelector(".ctog"); if(t) t.click(); }
    // v17: show the hook section first (zoom, move, pick another part), the video panel follows right below it,
    // and the player jumps to the hook so you hear what the clip will be
    const sb = $("secBox"); if(sb.classList.contains("collapsed")){ const t = sb.querySelector(".ctog"); if(t) t.click(); }
    const was = playing; if(was) stop(); offset = AB.a; $("cur").textContent = fmtT(offset/rate); if(duration) $("seek").value = Math.round(offset/duration*1000); if(was) play(); else { drawWaves(); drawSec(); previewSoon(); }
    sb.scrollIntoView({behavior:"smooth", block:"start"});
    const mk = $("vMake"); mk.classList.remove("pulse"); void mk.offsetWidth; mk.classList.add("pulse"); setTimeout(()=>mk.classList.remove("pulse"), 4200);
    setStatus(`Clip bereit: Hook ab ${fmtT(AB.a/rate)}, ${Math.round((AB.b-AB.a)/rate)} s, Format 9:16. Jetzt „Video erstellen (MP4)“ klicken.`);
  } finally { $("quickClip").disabled = !tracks.length; }
};
$("findHook").onclick = async ()=>{
  $("findHook").disabled = true; $("secNote").textContent = "Suche die Hook …";
  try{
    await sleep0();
    const a = await findHook();
    setSection(a); SEC.hook = true;
    $("loopOn").checked = true;
    if(!(+$("fadeIn").value) && !(+$("fadeOut").value)){ $("fadeIn").value = 0.3; $("fadeOut").value = 1.5; }
    secChanged(true);
    $("secNote").textContent = `Hook gefunden bei ${fmtT(AB.a/rate)}. „Nur Ausschnitt“ ist angehakt, Export und Video nehmen jetzt nur diesen Teil (mit kurzem Fade-In und Fade-Out). Verschieb ihn, wenn du einen anderen Teil willst. Zum Feintuning mit dem Mausrad über der Wellenform reinzoomen.`;
  } catch(e){ console.error(e); $("secNote").textContent = "Hook-Suche fehlgeschlagen: " + (e.message||e); }
  finally { $("findHook").disabled = false; }
};

/* ---- reference matching (Matchering idea: loudness, tonal balance, stereo width) ---- */
const REF = {buf:null, id:0, on:false, amt:70, lufs:null, spec:null};
let mixSpec = null, mixSpecKey = "";
// Long-term spectrum in octave bands (mid, dB) + side/mid energy ratio
function bandSpectrum(L, R, fs){
  const N = 8192, w = hann(N), re = new Float64Array(N), im = new Float64Array(N), reS = new Float64Array(N), imS = new Float64Array(N);
  const P = new Float64Array(BANDS.length); let eM = 0, eS = 0;
  const hop = Math.max(N, Math.floor((L.length-N)/180));
  for(let s=0; s+N<=L.length; s+=hop){
    let en=0;
    for(let i=0;i<N;i++){ const m=(L[s+i]+R[s+i])/2, d=(L[s+i]-R[s+i])/2; re[i]=m*w[i]; im[i]=0; reS[i]=d*w[i]; imS[i]=0; en+=m*m; }
    if(en/N < 1e-7) continue;                     // skip silence
    fft(re,im); fft(reS,imS);
    for(let k=1;k<N/2;k++){
      const f=k*fs/N, pm=re[k]*re[k]+im[k]*im[k], ps=reS[k]*reS[k]+imS[k]*imS[k];
      if(f>150){ eM+=pm; eS+=ps; }
      const bi = Math.round(Math.log2(f/31.5)); if(bi>=0 && bi<BANDS.length) P[bi]+=pm;
    }
  }
  const db = Array.from(P, p=>10*Math.log10(p+1e-12));
  const mean = db.slice(2,9).reduce((a,b)=>a+b,0)/7;   // normalise on 125 Hz – 8 kHz
  return {bands: db.map(v=>v-mean), side: eS/(eM||1)};
}
// Rough tonal target for modern pop / hip-hop masters (octave bands 31.5 Hz – 16 kHz, dB relative to the 125 Hz–8 kHz average).
// Used at half strength and capped at ±3 dB, so it only nudges a mix towards a typical balance.
const TONE_TARGET_STD = [-3, 1.5, 1.5, 0.5, 0, -0.5, -1, -2, -4, -9];
const toneTarget = () => (GENRES[GENRE_USED] && GENRES[GENRE_USED].tone) || TONE_TARGET_STD;
async function computeMatch(raw, fs){
  if(!(REF.on && REF.spec) && M.tone){
    const key = trackKey()+"#"+rate+"#"+P.ver+"#"+($("onlyAB").checked?AB.a+"-"+AB.b:"");
    if(!mixSpec || mixSpecKey!==key){ $("mNote").textContent="Analysiere Klangbalance …"; await sleep0(); mixSpec = bandSpectrum(raw[0], raw[1], fs); mixSpecKey = key; }
    const TT = toneTarget(), tMean = TT.slice(2,9).reduce((a,b)=>a+b,0)/7, diff = TT.map((v,i)=>(v - tMean) - mixSpec.bands[i]);
    M.eq = diff.map((v,i)=>{ const sm = 0.25*(diff[i-1]??v)+0.5*v+0.25*(diff[i+1]??v); return Math.round(Math.max(-3, Math.min(MIX_HISS && i >= 8 ? 0 : 3, sm*0.5))*4)/4; });
    return;
  }
  if(!(REF.on && REF.spec)) { M.eq = M.eq.map(()=>0); return; }
  const key = trackKey()+"#"+rate+"#"+P.ver+"#"+($("onlyAB").checked?AB.a+"-"+AB.b:"");
  if(!mixSpec || mixSpecKey!==key){ $("mNote").textContent="Vergleiche mit Referenz …"; await sleep0(); mixSpec = bandSpectrum(raw[0], raw[1], fs); mixSpecKey = key; }
  const k = REF.amt/100;
  const diff = REF.spec.bands.map((v,i)=>v-mixSpec.bands[i]);
  M.eq = diff.map((v,i)=>{ const sm = 0.25*(diff[i-1]??v)+0.5*v+0.25*(diff[i+1]??v); return Math.max(-6, Math.min(6, sm*k)); });
  const ratio = (REF.spec.side<1e-4 && mixSpec.side<1e-4) ? 1 : Math.sqrt(REF.spec.side/Math.max(mixSpec.side,1e-4));
  M.width = Math.round(Math.max(80, Math.min(140, 100 + (100*ratio-100)*k))/5)*5;
  M.target = Math.round(Math.max(-16, Math.min(-6, REF.lufs))*2)/2;
  M.preset = ""; syncKnobs();
}
$("refPick").onclick = () => $("refFile").click();
$("refFile").onchange = async e => {
  const f = e.target.files[0]; e.target.value = ""; if(!f) return;
  try{
    $("refName").textContent = "Analysiere Referenz …";
    const b = await ac().decodeAudioData(await f.arrayBuffer());
    const L = b.getChannelData(0), R = b.numberOfChannels>1 ? b.getChannelData(1) : L;
    REF.lufs = lufs(b.numberOfChannels>1?[L,R]:[L], b.sampleRate);
    REF.spec = bandSpectrum(L, R, b.sampleRate); REF.id++; REF.buf = b;
    $("refName").innerHTML = `Referenz: <b></b> · ${REF.lufs.toFixed(1)} LUFS`;
    $("refName").querySelector("b").textContent = f.name.replace(/\.[^.]+$/,"");
    $("refOn").disabled = $("refAmt").disabled = false;
    if(!REF.on) $("refOn").click(); else scheduleAnalysis();
  } catch(err){ $("refName").textContent = "Diese Datei konnte nicht gelesen werden. Versuch MP3 oder WAV."; }
};
$("refOn").onclick = () => {
  REF.on = !REF.on; $("refOn").setAttribute("aria-pressed", REF.on);
  ["mTarget","mWidth"].forEach(id=>$(id).disabled = REF.on);
  if(REF.on){ M.warm = 0; M.air = 0; if(!M.on) $("mOn").click(); }
  else { M.eq = M.eq.map(()=>0); }
  syncKnobs(); applyMaster(); scheduleAnalysis();
};
$("refAmt").oninput = e => { REF.amt = +e.target.value; $("vRefAmt").textContent = REF.amt+" %"; scheduleAnalysis(); };
$("vRefAmt").textContent = REF.amt+" %";

/* ---- export every switched-on stem as its own WAV, zipped ---- */
$("exportStems").onclick = async () => {
  const sel = tracks.filter(t=>t.on); if(!sel.length) return;
  if(!window.JSZip){ setStatus("ZIP-Unterstützung fehlt (Internet nötig beim ersten Öffnen).", true); return; }
  $("exportStems").disabled = true;
  try{
    const zip = new JSZip(), base = fileBase();
    for(let i=0;i<sel.length;i++){
      const t = sel[i], b = buf(t), fs = b.sampleRate;
      setStatus(`Exportiere Stem ${i+1}/${sel.length}: ${t.name}`); setProg(i/sel.length); await sleep0();
      const [l, r] = crop(await varispeed(await renderTracks([t]), fs, rate), fs);
      applyFades(l, r, fs);
      zip.file(`${String(i+1).padStart(2,"0")} ${t.name.replace(/[\\/:*?"<>|]+/g,"_")}.wav`, encodeWav(l, r, fs));
    }
    setStatus("Packe ZIP …"); setProg(1);
    const blob = await zip.generateAsync({type:"blob", compression:"STORE"});
    await deliver(blob, fileName(["Stems", sectionTag()], "zip"));
  } catch(e){ console.error(e); setStatus(e.message||String(e), true); }
  finally { $("exportStems").disabled = false; setTimeout(()=>setProg(0),800); }
};

