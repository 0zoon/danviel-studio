/* =====================================================================
   MASTERING
   Chain (pro order): gain staging -> EQ (30 Hz low cut, warmth shelf,
   slight 300 Hz mud cut, air shelf) -> glue compressor 2:1 -> saturation
   -> stereo width with mono bass < 100 Hz -> make-up gain -> lookahead
   limiter. Loudness measured as integrated LUFS (ITU-R BS.1770),
   ceiling −1 dBTP (−2 dBTP when louder than −14 LUFS, per Spotify).
   ===================================================================== */
// Intensity (like LANDR's Lo / Med / Hi) ...
const PRESETS = {
  stream:{target:-14, warm:0.5, air:1,   glue:50, sat:20, width:110, mb:40},
  loud:  {target:-9,  warm:0.75,air:1.5, glue:65, sat:35, width:110, mb:60},
  dyn:   {target:-16, warm:0,   air:0.5, glue:30, sat:10, width:105, mb:25},
};
// ... combined with a style (like LANDR's Warm / Balanced / Open)
const STYLES = {warm:{warm:0.75, air:-0.75, sat:10}, bal:{}, open:{warm:-0.25, air:1, sat:-5}};
const M = {on:false, ab:false, preset:"stream", intensity:"stream", style:"bal", tone:false, bass:0, level:0, ...PRESETS.stream, eq:new Array(10).fill(0)};
function applyPreset(){
  const b = PRESETS[M.intensity], d = STYLES[M.style] || {};
  Object.assign(M, b);
  for(const k in d) M[k] = Math.round((b[k] + d[k])*4)/4;
  M.sat = Math.max(0, Math.min(100, M.sat)); M.preset = M.intensity;
}
const BANDS = [31.5,63,125,250,500,1000,2000,4000,8000,16000];
const BW_Q = -3.0103;                 // Butterworth: WebAudio lowpass/highpass Q is given in dB
// Every DynamicsCompressorNode secretly adds make-up gain (WebKit/Chromium kernel), also to quiet passages.
// On a de-esser or a single band that lifts hiss by up to 15 dB. This is the exact same curve, so it can be taken back out.
function compMakeupDb(thr, knee, ratio){
  if(!(ratio > 1)) return 0;
  const l2d = x => 20*Math.log10(x), d2l = x => Math.pow(10, x/20);
  const lt = d2l(thr), kc = (x,k) => x < lt ? x : lt + (1 - Math.exp(-k*(x - lt)))/k;
  const slopeAt = (x,k) => { if(x < lt) return 1; const x2 = x*1.001; return (l2d(kc(x2,k)) - l2d(kc(x,k)))/(l2d(x2) - l2d(x)); };
  const xk = d2l(thr + knee); let mn = 0.1, mx = 10000, k = 5;
  for(let i=0;i<15;i++){ if(slopeAt(xk,k) < 1/ratio) mx = k; else mn = k; k = Math.sqrt(mn*mx); }
  const kneeDb = thr + knee, kneeLin = d2l(kneeDb), yk = l2d(kc(kneeLin, k));
  const sat1 = 1 < kneeLin ? kc(1, k) : d2l(yk + (1/ratio)*(0 - kneeDb));
  return 0.6 * -l2d(sat1);
}
const STAGE_LUFS = -18;           // level the mix is brought to before the chain
const ceilTP = () => M.target > -14 ? -2 : -1;
const db2 = d => Math.pow(10, d/20);

function satCurve(amount){
  if(amount <= 0) return new Float32Array([-1,1]);
  const d = 1 + amount*3, n = 2048, c = new Float32Array(n);
  for(let i=0;i<n;i++){ const x = i/(n-1)*2-1; c[i] = Math.tanh(d*x)/d; }
  return c;
}

// Builds the chain in any (Offline)AudioContext; returns {input, output, set(params)}.
function buildChain(c){
  const input = c.createGain(); input.channelCount = 2; input.channelCountMode = "explicit";
  const hp = c.createBiquadFilter(); hp.type="highpass"; hp.frequency.value=30; hp.Q.value=BW_Q;
  const warm = c.createBiquadFilter(); warm.type="lowshelf"; warm.frequency.value=100;
  const mud = c.createBiquadFilter(); mud.type="peaking"; mud.frequency.value=300; mud.Q.value=0.9; mud.gain.value=-0.8;
  const air = c.createBiquadFilter(); air.type="highshelf"; air.frequency.value=10000;
  const bands = BANDS.map(f=>{ const b=c.createBiquadFilter(); b.type="peaking"; b.frequency.value=Math.min(f, c.sampleRate*0.45); b.Q.value=1.41; b.gain.value=0; return b; });
  const comp = c.createDynamicsCompressor(); comp.ratio.value=2; comp.attack.value=0.02; comp.release.value=0.35; comp.knee.value=8;
  const sat = c.createWaveShaper(); sat.oversample="4x";
  // 3-band compressor: Linkwitz-Riley crossovers at 120 Hz and 4 kHz (low band gets the matching all-pass so the bands sum flat)
  const lr = (type, f)=>{ const a = c.createBiquadFilter(), b = c.createBiquadFilter(); [a,b].forEach(x=>{ x.type = type; x.frequency.value = Math.min(f, c.sampleRate*0.45); x.Q.value = BW_Q; }); a.connect(b); return {i:a, o:b}; };
  const mbIn = c.createGain(), mbOut = c.createGain(), apSum = c.createGain();
  const lowLP = lr("lowpass",120), restHP = lr("highpass",120), midLP = lr("lowpass",4000), hiHP = lr("highpass",4000), apLP = lr("lowpass",4000), apHP = lr("highpass",4000);
  const mkC = (att, rel)=>{ const k = c.createDynamicsCompressor(); k.attack.value = att; k.release.value = rel; k.knee.value = 8; return k; };
  const cL = mkC(0.03, 0.35), cM = mkC(0.02, 0.22), cH = mkC(0.01, 0.15);   // slower release = no bass wobble or pumping highs
  mbIn.connect(lowLP.i); lowLP.o.connect(apLP.i); lowLP.o.connect(apHP.i); apLP.o.connect(apSum); apHP.o.connect(apSum); const gL = c.createGain(), gM = c.createGain(), gH = c.createGain(); apSum.connect(cL).connect(gL).connect(mbOut);
  mbIn.connect(restHP.i); restHP.o.connect(midLP.i); restHP.o.connect(hiHP.i); midLP.o.connect(cM).connect(gM).connect(mbOut); hiHP.o.connect(cH).connect(gH).connect(mbOut);
  // Mid/side width, side channel high-passed at 100 Hz so the low end stays mono
  const split = c.createChannelSplitter(2), merge = c.createChannelMerger(2);
  const lm=c.createGain(), rm=c.createGain(), ls=c.createGain(), rs=c.createGain();
  lm.gain.value=0.5; rm.gain.value=0.5; ls.gain.value=0.5; rs.gain.value=-0.5;
  const mid=c.createGain(), side=c.createGain();
  const sh1=c.createBiquadFilter(), sh2=c.createBiquadFilter(); [sh1,sh2].forEach(f=>{f.type="highpass"; f.frequency.value=100; f.Q.value=BW_Q;});
  const width=c.createGain(), inv=c.createGain(); inv.gain.value=-1;
  const sideR=c.createGain(); // carries -side to the right channel
  // Bass booster: sub shelf + psychoacoustic harmonics (2nd/3rd of 40–110 Hz), so the bass is also heard on phones and laptops
  const sub = c.createBiquadFilter(); sub.type = "lowshelf"; sub.frequency.value = 70;
  const hx = (type, f)=>{ const x = c.createBiquadFilter(); x.type = type; x.frequency.value = f; x.Q.value = BW_Q; return x; };
  const bl1 = hx("lowpass",110), bl2 = hx("lowpass",110), bsh = c.createWaveShaper(), bh1 = hx("highpass",120), bh2 = hx("highpass",120), blp = hx("lowpass",600), bAmt = c.createGain(); bAmt.gain.value = 0;
  bsh.curve = (()=>{ const n=2048, cv=new Float32Array(n); for(let i=0;i<n;i++){ const x=i/(n-1)*2-1; cv[i] = Math.tanh(3*x + 0.6*x*x) / Math.tanh(3.6); } return cv; })(); bsh.oversample = "2x";
  const compMk = c.createGain();
  let eqEnd = input.connect(hp).connect(warm).connect(mud).connect(air).connect(sub); bands.forEach(b=>{ eqEnd = eqEnd.connect(b); }); eqEnd.connect(comp).connect(compMk).connect(mbIn);
  eqEnd.connect(bl1).connect(bl2).connect(bsh).connect(bh1).connect(bh2).connect(blp).connect(bAmt).connect(comp); mbOut.connect(sat).connect(split);
  split.connect(lm,0); split.connect(rm,1); split.connect(ls,0); split.connect(rs,1);
  lm.connect(mid); rm.connect(mid); ls.connect(side); rs.connect(side);
  side.connect(sh1).connect(sh2).connect(width);
  mid.connect(merge,0,0); mid.connect(merge,0,1);
  width.connect(merge,0,0); width.connect(inv).connect(sideR).connect(merge,0,1);
  const output = merge;
  function set(p){
    warm.gain.value = p.warm; air.gain.value = p.air;
    const bb = (p.bass||0)/100, xtra = bb > 1.5;   // "Bass Boosted": the deliberately over-the-top YouTube sound
    sub.frequency.value = xtra ? 95 : 70; sub.gain.value = xtra ? 14 : 5*bb; bAmt.gain.value = xtra ? 1.8 : 0.9*bb;
    comp.threshold.value = p.glue<=0 ? 0 : STAGE_LUFS + 10 - p.glue/100*12;   // 50 % -> −14 dB at a −18 LUFS mix
    compMk.gain.value = p.glue<=0 ? 1 : db2(-compMakeupDb(comp.threshold.value, 8, 2));   // keeps the staging, so saturation gets the level it was designed for
    sat.curve = satCurve(p.sat/100);
    // band thresholds sit just above each band's typical level at the −18 LUFS staging; more "Mehrband" = lower threshold + higher ratio
    const a = (p.mb||0)/100;
    [[cL,-14,gL],[cM,-16,gM],[cH,-24,gH]].forEach(([k,base,g])=>{ k.ratio.value = 1 + 1.5*a; k.threshold.value = a ? base + (1-a)*10 : 0;
      g.gain.value = a ? db2(-compMakeupDb(k.threshold.value, 8, k.ratio.value)) : 1; });   // bands stay flat; only real peaks get pulled down
    width.gain.value = p.width/100;
    bands.forEach((b,i)=>{ b.gain.value = p.eq[i]||0; });
  }
  return {input, output, set};
}

// Live preview graph: direct (mastering off), wet (chain + make-up + limiter), dry (A/B, level-matched).
function buildLive(c, bus, out){
  const ch = buildChain(c);
  const pre = c.createGain(), makeup = c.createGain();
  const mkLim = () => { const l=c.createDynamicsCompressor(); l.threshold.value=-2; l.knee.value=0; l.ratio.value=20; l.attack.value=0.002; l.release.value=0.25; return l; };
  const lim = mkLim(), lim2 = mkLim();
  const direct=c.createGain(), wet=c.createGain(), dry=c.createGain(), dryGain=c.createGain();
  bus.connect(direct).connect(out);
  const lev = c.createGain();
  const limMk = c.createGain(), lim2Mk = c.createGain();
  bus.connect(lev).connect(pre).connect(ch.input); ch.output.connect(makeup).connect(lim).connect(limMk).connect(wet).connect(out);
  bus.connect(dryGain).connect(lim2).connect(lim2Mk).connect(dry).connect(out);
  return {ch, pre, makeup, lim, lim2, limMk, lim2Mk, direct, wet, dry, dryGain, lev};
}

// Play the leveler curve in sync with playback (same curve the export uses)
function levSchedule(){
  if(!live || !live.lev || !ctx) return;
  const p = live.lev.gain, now = ctx.currentTime, C = ana && ana.lev;
  p.cancelScheduledValues(now);
  if(!playing || !C || !M.on){ p.setValueAtTime(1, now); return; }
  const h0 = currentTime()/rate - C.start, k0 = Math.floor(h0/C.hop), N = C.g.length;
  const vals = []; for(let k=Math.max(0,k0); k<N; k++) vals.push(C.g[k]);
  if(k0 < 0){ for(let k=k0; k<0; k++) vals.unshift(1); }
  if(vals.length < 2){ p.setValueAtTime(1, now); return; }
  p.setValueAtTime(vals[0], now);
  try{ p.setValueCurveAtTime(Float32Array.from(vals), now + 0.02, vals.length*C.hop); }catch(e){ console.warn("leveler", e); }
}
function applyMaster(){
  saveSoon();
  if(!live) return;
  const t = ctx.currentTime, set=(p,v)=>p.setTargetAtTime(v,t,0.03);
  live.ch.set(M);
  // Until the analysis of this song is ready, the chain has no level staging yet and would play far too loud:
  // keep playing the plain mix (protected) and switch to the master as soon as the analysis is done.
  const ready = M.on && !!ana && ana.ver === P.ver;
  set(live.direct.gain, ready ? 0 : offK());
  set(live.wet.gain, ready && !M.ab ? 1:0);
  set(live.dry.gain, ready && M.ab ? 1:0);
  if(ana){
    set(live.pre.gain, db2(ana.pre));
    set(live.makeup.gain, db2(isFinite(ana.Lchain) ? Math.min(24, M.target - ana.Lchain) : 0));
    set(live.dryGain.gain, db2(isFinite(ana.Lraw) ? Math.min(24, M.target - ana.Lraw) : 0));
  }
  const th = ceilTP() - 0.5; live.lim.threshold.value = th; live.lim2.threshold.value = th;
  live.limMk.gain.value = live.lim2Mk.gain.value = db2(-compMakeupDb(th, 0, 20));   // preview as loud as the export, peaks stay under the ceiling
}

/* ---- mix of the stems switched on, rendered through the same channel strips as playback ---- */
async function renderTracks(list){
  await cmkReady(list);   // compressor make-up measured before any offline render (export = playback)
  const fs = tracks[0].buffer.sampleRate, usesFx = FXON && list.some(t=>t.rev>0 || t.dly>0);
  const tail = usesFx ? Math.round((REV_TYPES[FX.revType].len + 1.5)*fs) : 0;
  const n = Math.max(...list.map(t=>buf(t).length)) + tail;
  const o = new OfflineAudioContext(2, n, fs);
  const fx = usesFx ? buildFx(o, false) : null; if(fx) fx.out.forEach(x=>x.connect(o.destination));
  list.forEach(t=>{ const src=o.createBufferSource(); src.buffer=buf(t); const ch=stemChain(o, fx); ch.set(t); ch.vol.gain.value=t.vol; src.connect(ch.input); ch.output.connect(o.destination); src.start(0);
    scheduleRide(ch.ride.gain, rideCurve(t), 0, 0, 1);
    if(ducked(t)) scheduleDuck(ch.duck.gain, tl => tl, 0); });
  const r = await o.startRendering();
  return [r.getChannelData(0), r.getChannelData(1)];
}
const mixRaw = () => renderTracks(tracks.filter(t=>t.on));

/* ---- ITU-R BS.1770 integrated loudness ---- */
function kCoefs(fs){   // BS.1770 K-weighting at any sample rate (libebur128 derivation)
  let K=Math.tan(Math.PI*1681.974450955533/fs), Q=0.7071752369554196, Vh=Math.pow(10,3.999843853973347/20), Vb=Math.pow(Vh,0.4996667741545416);
  let a0=1+K/Q+K*K;
  const f1=[(Vh+Vb*K/Q+K*K)/a0, 2*(K*K-Vh)/a0, (Vh-Vb*K/Q+K*K)/a0, 2*(K*K-1)/a0, (1-K/Q+K*K)/a0];
  K=Math.tan(Math.PI*38.13547087602444/fs); Q=0.5003270373238773; a0=1+K/Q+K*K;
  const f2=[1,-2,1, 2*(K*K-1)/a0, (1-K/Q+K*K)/a0];
  return [f1,f2];
}
function lufs(chs, fs){
  const [f1,f2]=kCoefs(fs);
  const hop=Math.round(0.1*fs), nh=Math.floor(chs[0].length/hop), hops=new Float64Array(nh);
  for(const x of chs){
    let x1=0,x2=0,y1=0,y2=0,u1=0,u2=0,v1=0,v2=0;
    for(let h=0;h<nh;h++){ let s=0; const e=(h+1)*hop;
      for(let i=h*hop;i<e;i++){
        const xi=x[i];
        const y=f1[0]*xi+f1[1]*x1+f1[2]*x2-f1[3]*y1-f1[4]*y2; x2=x1; x1=xi; y2=y1; y1=y;
        const v=f2[0]*y+f2[1]*u1+f2[2]*u2-f2[3]*v1-f2[4]*v2; u2=u1; u1=y; v2=v1; v1=v;
        s+=v*v;
      }
      hops[h]+=s/hop;
    }
  }
  const blocks=[]; for(let h=0;h+3<nh;h++) blocks.push((hops[h]+hops[h+1]+hops[h+2]+hops[h+3])/4);
  const L = z => -0.691+10*Math.log10(z);
  const g1 = blocks.filter(z=>L(z)>-70); if(!g1.length) return -Infinity;
  const rel = L(g1.reduce((a,b)=>a+b,0)/g1.length) - 10;
  const g2 = g1.filter(z=>L(z)>rel);
  return L(g2.reduce((a,b)=>a+b,0)/g2.length);
}

/* ---- true peak (4x oversampling, windowed sinc), only checked near loud samples ---- */
const TP_TAPS = (()=>{ const N=12, ph=[]; for(let p=1;p<4;p++){ const t=[]; for(let k=-N+1;k<=N;k++){ const x=k-p/4; const w=0.5+0.5*Math.cos(Math.PI*x/N); t.push(Math.sin(Math.PI*x)/(Math.PI*x)*w); } ph.push(t);} return {N,ph}; })();
function truePeak(chs){
  let pk=0; for(const x of chs) for(let i=0;i<x.length;i++){ const a=Math.abs(x[i]); if(a>pk) pk=a; }
  const lim = pk*0.6, {N,ph} = TP_TAPS;
  for(const x of chs) for(let i=N;i<x.length-N;i++){
    if(Math.abs(x[i])<lim && Math.abs(x[i+1])<lim) continue;
    for(const t of ph){ let s=0; for(let k=0;k<t.length;k++) s+=t[k]*x[i-N+1+k]; s=Math.abs(s); if(s>pk) pk=s; }
  }
  return pk;
}

/* ---- lookahead brickwall limiter (5 ms lookahead) with program-dependent release:
   short peaks recover fast (~40 ms, keeps punch), sustained limiting recovers slowly (up to ~600 ms),
   so loud passages don't "breathe" or pump (dual-slope / auto release like hardware mastering limiters) ---- */
const LIM_RC = (()=>{ const t = new Float32Array(65); for(let i=0;i<=64;i++) t[i] = 0.04 + 0.56*Math.pow(i/64, 1.5); return t; })();
function limit(L,R,gainLin,ceil,fs){
  const n=L.length, W=Math.max(2,Math.round(fs*0.005));
  const rcTab = Array.from(LIM_RC, tau=>1-Math.exp(-1/(fs*tau))), avgK = 1-Math.exp(-1/(fs*0.35));
  const gr=new Float32Array(n), env=new Float32Array(n), q=new Int32Array(n);
  let qh=0, qt=0, prev=1, avg=1, rc=rcTab[0];
  for(let i=0;i<n;i++){
    const p=Math.max(Math.abs(L[i]),Math.abs(R[i]))*gainLin, g=p>ceil?ceil/p:1;
    gr[i]=g;
    while(qt>qh && gr[q[qt-1]]>=g) qt--; q[qt++]=i; if(q[qh]<=i-W) qh++;
    prev=Math.min(gr[q[qh]], prev+(1-prev)*rc);   // min over last W samples, then release
    env[i]=prev; avg+=(prev-avg)*avgK;
    if((i & 63) === 0){ const sus = Math.min(1, Math.max(0, (1-avg)/0.25)); rc = rcTab[Math.round(sus*64)]; }
  }
  let sum=W;                                       // moving average over W (samples before start count as 1)
  for(let i=0;i<n;i++){ sum+=env[i]-(i>=W?env[i-W]:1); gr[i]=sum/W; }
  const oL=new Float32Array(n), oR=new Float32Array(n);
  for(let p=0;p<n;p++){
    const g=gainLin*gr[Math.min(n-1,p+W-1)];
    let l=L[p]*g, r=R[p]*g;
    if(l>ceil)l=ceil; else if(l<-ceil)l=-ceil; if(r>ceil)r=ceil; else if(r<-ceil)r=-ceil;
    oL[p]=l; oR[p]=r;
  }
  return [oL,oR];
}

/* ---- render the chain offline from a raw mix ---- */
// K-weighted mean square per hop (same weighting as LUFS)
function kHops(chs, fs, hop){
  const [f1,f2]=kCoefs(fs), nh=Math.floor(chs[0].length/hop), out=new Float64Array(nh);
  for(const x of chs){ let x1=0,x2=0,y1=0,y2=0,u1=0,u2=0,v1=0,v2=0;
    for(let h=0;h<nh;h++){ let s=0; const e=(h+1)*hop; for(let i=h*hop;i<e;i++){ const xi=x[i];
      const y=f1[0]*xi+f1[1]*x1+f1[2]*x2-f1[3]*y1-f1[4]*y2; x2=x1; x1=xi; y2=y1; y1=y;
      const v=f2[0]*y+f2[1]*u1+f2[2]*u2-f2[3]*v1-f2[4]*v2; u2=u1; u1=y; v2=v1; v1=v; s+=v*v; } out[h]+=s/hop; } }
  return out;
}
// zero-phase smoothing (forward + backward one-pole) of a curve sampled every `hop` seconds
function smoothCurve(a, hop, tau){ const k = 1-Math.exp(-hop/tau); let y=a[0]; for(let i=0;i<a.length;i++){ y+=(a[i]-y)*k; a[i]=y; } y=a[a.length-1]; for(let i=a.length-1;i>=0;i--){ y+=(a[i]-y)*k; a[i]=y; } return a; }
// Leveler: compares each part's short-term loudness (3 s) with the song's overall loudness and gently evens out
// only the excess (±1.5 dB dead zone, max −5 / +2.5 dB, 1.2 s smoothing). Very quiet parts (intro, breaks) stay untouched.
function levelCurve(raw, fs, strength){
  if(!strength) return null;
  const hopS = 0.1, hop = Math.round(hopS*fs), ms = kHops(raw, fs, hop), nh = ms.length; if(nh < 40) return null;
  const Li = lufs(raw, fs); if(!isFinite(Li)) return null;
  const st = new Float32Array(nh), W = 15; let acc = 0; const pre = new Float64Array(nh+1); for(let i=0;i<nh;i++) pre[i+1] = pre[i] + ms[i];
  for(let i=0;i<nh;i++){ const a = Math.max(0, i-W), b = Math.min(nh, i+W+1); st[i] = -0.691 + 10*Math.log10((pre[b]-pre[a])/(b-a) + 1e-12); }
  const s = strength/100, g = new Float32Array(nh);
  for(let i=0;i<nh;i++){
    if(st[i] < Li - 16){ g[i] = 0; continue; }
    let e = Li - st[i]; e = Math.abs(e) < 1.5 ? 0 : e - Math.sign(e)*1.5;
    g[i] = Math.max(-5*s, Math.min(2.5*s, e*0.7*s));
  }
  smoothCurve(g, hopS, 1.2);
  for(let i=0;i<nh;i++) g[i] = Math.pow(10, g[i]/20);
  return {hop: hopS, g, start: ($("onlyAB").checked && AB.a!==null && AB.b!==null) ? AB.a/rate : 0};
}
function applyCurve(raw, fs, C){
  if(!C) return raw; const n = raw[0].length, out = raw.map(x=>new Float32Array(x)), hs = C.hop*fs, last = C.g.length-1;
  for(let i=0;i<n;i++){ const f = i/hs, k = Math.min(last, Math.floor(f)), k2 = Math.min(last, k+1), g = C.g[k] + (C.g[k2]-C.g[k])*(f-k); out[0][i]*=g; out[1][i]*=g; }
  return out;
}
async function renderChain(raw, fs, preDb, lev){
  if(lev) raw = applyCurve(raw, fs, lev);
  const n=raw[0].length, o=new OfflineAudioContext(2,n,fs);
  const b=o.createBuffer(2,n,fs); b.copyToChannel(raw[0],0); b.copyToChannel(raw[1],1);
  const s=o.createBufferSource(); s.buffer=b; const g=o.createGain(); g.gain.value=db2(preDb);
  const ch=buildChain(o); ch.set(M);
  s.connect(g).connect(ch.input); ch.output.connect(o.destination); s.start(0);
  const out=await o.startRendering();
  return [out.getChannelData(0).slice(), out.getChannelData(1).slice()];
}

/* ---- analysis: runs after changes, feeds preview gains and meters ---- */
let ana=null, anaTimer=0, anaRun=0, anaKey="";
const trackKey = () => (FXON ? "fx1|" : "fx0|") + tracks.map(t=>[t.on?1:0, t.vol.toFixed(3), t.pan, t.hpf, t.low, t.high, t.pf, t.pg, t.rev, t.dly, t.comp, t.deess, t.ride||0, t.dnV||0, t.cmkV||0].join(":")).join("|") + "#" + [FX.revType, FX.revLvl, FX.dlyNote, FX.dlyFb, FX.dlyLvl, SC.amt, SC.target].join(":");
function stateKey(){ return trackKey()+"#"+[M.warm,M.air,M.glue,M.sat,M.width,M.mb,M.tone,M.bass,M.level,rate,REF.on,REF.amt,REF.id,P.ver,$("onlyAB").checked?AB.a+"-"+AB.b:""].join(",")+"#"+M.eq.map(v=>v.toFixed(2)).join(","); }
// Mastering off: "Übersteuern verhindern" turns the whole mix down so its loudest peak stays at −1 dB,
// in playback exactly like in the export (no limiter colouring, no clipping, no jump in level).
const OFF_CEIL = 0.891;   // −1 dBFS
let OFF = {k: 1, key: "", t: 0, run: 0};
const offK = () => $("norm").checked ? OFF.k : 1;
function scheduleOffPeak(){
  if(!tracks.length || M.on) return;
  const key = trackKey() + "|" + P.ver; if(key === OFF.key){ applyMaster(); return; }
  clearTimeout(OFF.t); OFF.t = setTimeout(async ()=>{
    if(!tracks.some(t=>t.on)){ OFF.k = 1; OFF.key = key; applyMaster(); return; }
    const run = ++OFF.run, [L, R] = await mixRaw(); if(run !== OFF.run) return;
    let pk = 0; for(let i=0;i<L.length;i++){ const a = Math.abs(L[i]), b = Math.abs(R[i]); if(a>pk) pk=a; if(b>pk) pk=b; }
    OFF.k = pk > OFF_CEIL ? OFF_CEIL/pk : 1; OFF.key = key;
    if(OFF.k < 1) log("Mastering aus: Mix um", (20*Math.log10(OFF.k)).toFixed(1), "dB leiser, damit nichts übersteuert (Spitze war", (20*Math.log10(pk)).toFixed(1), "dB)");
    applyMaster(); }, 450);
}
function scheduleAnalysis(){
  if(tracks.length && !M.on){ scheduleOffPeak(); return; }
  if(!tracks.length || !M.on) return;
  const key=stateKey(); if(key===anaKey && ana) { applyMaster(); return; }
  clearTimeout(anaTimer); anaTimer=setTimeout(analyze, 450);
}
async function analyze(){
  if(!tracks.some(t=>t.on)) return;
  const run=++anaRun, key=stateKey(), fs=tracks[0].buffer.sampleRate, ver=P.ver;
  $("mNote").textContent="Analysiere …";
  await new Promise(r=>setTimeout(r,20));
  const raw=await getMix(); await computeMatch(raw, fs); const key2=stateKey(); const Lraw=lufs(raw,fs);
  if(run!==anaRun) return;
  const pre = isFinite(Lraw) ? Math.max(-24, Math.min(24, STAGE_LUFS-Lraw)) : 0;
  const lev = levelCurve(raw, fs, M.level||0);
  const pl=await renderChain(raw,fs,pre,lev); if(run!==anaRun) return;
  const Lchain=lufs(pl,fs);
  ana={key:key2, raw, pre, Lraw, Lchain, pl, fs, lev, ver}; anaKey=key2;
  levSchedule();
  $("mRaw").textContent = isFinite(Lraw)?Lraw.toFixed(1):"–";
  $("mOut").textContent = "≈ "+M.target.toFixed(1);
  $("mTp").textContent = "≤ "+ceilTP().toFixed(1);
  $("mNote").textContent = "Vorschau. Exakte Werte nach dem Export.";
  applyMaster();
}

/* ---- final master for export ---- */
async function masterExport(){
  if(!ana || ana.key!==stateKey()){ setStatus("Analysiere Mix …"); clearTimeout(anaTimer); await analyze(); }
  const {pl, fs, Lchain} = ana, tgt=M.target, ctp=ceilTP(), ceilLin=db2(ctp-0.5);
  let g=isFinite(Lchain) ? Math.min(24, tgt-Lchain) : 0, out, Lo=0;
  for(let it=0; it<6; it++){
    setStatus(`Mastering: Limiter-Durchgang ${it+1} …`); setProg((it+1)/7);
    await new Promise(r=>setTimeout(r,0));
    out = limit(pl[0], pl[1], db2(g), ceilLin, fs);
    Lo = lufs(out, fs);
    if(Math.abs(tgt-Lo)<0.15 || g>=24) break;
    g = Math.min(24, g + (tgt-Lo));
  }
  setStatus("Prüfe True Peak …");
  await new Promise(r=>setTimeout(r,0));
  let tp = truePeak(out);
  const tpDb = 20*Math.log10(tp);
  if(tpDb > ctp){ const k=db2(ctp-tpDb-0.05); for(const x of out) for(let i=0;i<x.length;i++) x[i]*=k; Lo += 20*Math.log10(k); tp*=k; }
  $("mOut").textContent = Lo.toFixed(1);
  $("mTp").textContent = (20*Math.log10(tp)).toFixed(1);
  $("mNote").textContent = Lo < tgt-0.7 ? "Ziel nicht ganz erreicht: Mix zu dynamisch für diese Lautheit, Limiter am Anschlag." : "Gemessen am fertigen Master.";
  return {L:out[0], R:out[1], g, k: tpDb > ctp ? db2(ctp-tpDb-0.05) : 1};
}

/* ---- master UI ---- */
const KN = [["mMb","mb",v=>v+" %"],["mTarget","target",v=>v.toFixed(1)+" LUFS"],["mWarm","warm",v=>(v>0?"+":"")+v.toFixed(2)+" dB"],["mAir","air",v=>(v>0?"+":"")+v.toFixed(2)+" dB"],["mGlue","glue",v=>v+" %"],["mSat","sat",v=>v+" %"],["mWidth","width",v=>v+" %"]];
function syncKnobs(){ KN.forEach(([id,k,f])=>{ $(id).value=M[k]; $("v"+id.slice(1)).textContent=f(M[k]); });
  document.querySelectorAll("#mStyle button").forEach(b=>b.setAttribute("aria-pressed", b.dataset.s===M.style)); $("toneOn").setAttribute("aria-pressed", M.tone);
  document.querySelectorAll("#mPresets button").forEach(b=>b.setAttribute("aria-pressed", b.dataset.m===M.preset)); }
KN.forEach(([id,k,f])=>{ $(id).oninput=e=>{ M[k]=+e.target.value; M.preset=""; syncKnobs(); applyMaster(); if(k!=="target") scheduleAnalysis(); else if(ana){ $("mOut").textContent="≈ "+M.target.toFixed(1); $("mTp").textContent="≤ "+ceilTP().toFixed(1);} }; });
$("mStyle").onclick = e=>{ const st = e.target.dataset && e.target.dataset.s; if(!st) return; M.style = st; applyPreset(); syncKnobs(); applyMaster(); scheduleAnalysis(); };
$("toneOn").onclick = ()=>{ M.tone = !M.tone; syncKnobs(); scheduleAnalysis(); saveSoon(); };
$("mPresets").onclick = e=>{ const p=e.target.dataset && e.target.dataset.m; if(!p) return; M.intensity = p; applyPreset(); syncKnobs(); applyMaster(); scheduleAnalysis(); if(ana){ $("mOut").textContent="≈ "+M.target.toFixed(1); $("mTp").textContent="≤ "+ceilTP().toFixed(1);} };
function setMasterOn(v){ M.on=v; $("mOn").setAttribute("aria-pressed",M.on); $("master").classList.toggle("off",!M.on); $("normLbl").hidden=M.on;  applyMaster(); scheduleAnalysis(); }
$("mOn").onclick = ()=>setMasterOn(!M.on);
$("norm").addEventListener("change", ()=>applyMaster());
function syncBassLevel(){
  const near = (v, list) => list.reduce((a,b)=>Math.abs(b-v) < Math.abs(a-v) ? b : a);
  const bv = near(M.bass||0, [0,35,65,100,200]), lv = near(M.level||0, [0,50,100]);
  document.querySelectorAll("#mBass button").forEach(b=>b.setAttribute("aria-pressed", +b.dataset.v === bv));
  document.querySelectorAll("#mLevel button").forEach(b=>b.setAttribute("aria-pressed", +b.dataset.v === lv));
}
$("mBass").onclick = e=>{ const v = e.target.dataset && e.target.dataset.v; if(v===undefined) return; M.bass = +v; syncBassLevel(); if(!M.on) setMasterOn(true); applyMaster(); scheduleAnalysis(); };
$("mLevel").onclick = e=>{ const v = e.target.dataset && e.target.dataset.v; if(v===undefined) return; M.level = +v; syncBassLevel(); if(!M.on) setMasterOn(true); applyMaster(); scheduleAnalysis(); };
// Beginners see goals ("For Spotify & YouTube"); knobs and LUFS numbers live behind "Advanced settings"
(function(){
  let pro = false; try{ pro = localStorage.getItem("stemmixer:pro") === "1"; }catch(e){}
  const sync = ()=>{ $("master").classList.toggle("showpro", pro); $("proTog").setAttribute("aria-expanded", pro); $("proTog").textContent = pro ? "⚙ Profi-Einstellungen ausblenden" : "⚙ Profi-Einstellungen"; };
  $("proTog").onclick = ()=>{ pro = !pro; try{ localStorage.setItem("stemmixer:pro", pro ? "1" : "0"); }catch(e){} sync(); };
  sync();
})();
// Before/after: switch between the finished sound and the plain stems (all at 100 %, no EQ, effects, panning or mastering)
function setRaw(v){
  RAW = v; M.ab = false;
  $("mAB").setAttribute("aria-pressed", RAW); $("mAB").textContent = RAW ? "Vorher: Original (klick für Nachher)" : "Vorher hören";
  $("mAB").classList.toggle("rawon", RAW); $("miniAB").classList.toggle("rawon", RAW); $("miniAB").setAttribute("aria-pressed", RAW); $("miniAB").textContent = RAW ? "Vorher (aktiv)" : "Vorher";
  const c = ac(), t0 = c.currentTime;
  mixBus.gain.setTargetAtTime(RAW ? 0 : 1, t0, 0.02); rawBus.gain.setTargetAtTime(RAW ? 1 : 0, t0, 0.02);
  setStatus(RAW ? "Vorher: Du hörst die Spuren im Original, ohne Mix und ohne Mastering. Nochmal klicken für Nachher." : "Nachher: mit Mix und Mastering.");
  if(!playing && tracks.length) play();
}
$("mAB").onclick = ()=>setRaw(!RAW);
syncKnobs();

/* ---- auto balance: loudness-match stems to common mix ratios ---- */
let stemLufs = null;
function category(n){
  const v=/(voc|vox|voice|acap|rap|adlib)/i.test(n);
  if(v && /(back|bv|chor|harm|double|adlib)/i.test(n)) return -6;
  if(v) return 0;
  if(/(drum|kick|snare|beat|loop)/i.test(n)) return 0;
  if(/(bass|808|sub)/i.test(n)) return -1;
  if(/(perc|hat|clap|shaker|tom|cymbal)/i.test(n)) return -7;
  if(/(guitar|gtr|key|piano|synth|pad|string|chord|lead|organ)/i.test(n)) return -5;
  return -8;
}
/* ---- AUTO MIX: balance, pan and low-cut by instrument role ---- */
function role(n){
  if(/\(MIDI\)$/.test(n)) return "synth";
  const v=/(voc|vox|voice|acap|rap|adlib|sing)/i.test(n);
  if(v && /(back|bv|chor|harm|double|adlib|choir)/i.test(n)) return "bv";
  if(v) return "lead";
  if(/kick/i.test(n)) return "kick";
  if(/snare|clap/i.test(n)) return "snare";
  if(/(drum|beat|loop)/i.test(n)) return "drums";
  if(/(bass|808|sub)/i.test(n)) return "bass";
  if(/(hat|cymbal|ride|crash)/i.test(n)) return "hat";
  if(/(perc|shaker|tom|conga|bongo|tamb)/i.test(n)) return "perc";
  if(/(guitar|gtr|gitarr)/i.test(n)) return "guitar";
  if(/(key|piano|organ|rhodes|chord)/i.test(n)) return "keys";
  if(/(pad|string|choir|atmo)/i.test(n)) return "pad";
  if(/(synth|lead|pluck|arp)/i.test(n)) return "synth";
  return "other";
}
// Low-cut starting points: lead vocal ~100 Hz minus a safety margin, backing vocals higher,
// kick/bass/drums only a rumble filter.
const AUTO_HPF = {lead:90, bv:180, kick:25, snare:80, drums:25, bass:25, hat:300, perc:150, guitar:90, keys:70, pad:100, synth:40, other:60};
// Panning: kick, snare, bass and lead vocal stay centred; supporting parts get modest offsets.
const AUTO_PAN = {lead:0, kick:0, snare:0, drums:0, bass:0, bv:30, guitar:40, keys:25, pad:20, synth:20, hat:40, perc:30, other:0};
const FIRST_SIDE = {bv:-1, guitar:-1, keys:1, pad:1, synth:1, hat:1, perc:1, other:-1};
function stereoWidth(b){
  if(b.numberOfChannels<2) return 0;
  const L=b.getChannelData(0), R=b.getChannelData(1); let m=0, s=0;
  for(let i=0;i<L.length;i+=8){ const a=(L[i]+R[i])/2, d=(L[i]-R[i])/2; m+=a*a; s+=d*d; }
  return m>0 ? s/m : 0;
}
