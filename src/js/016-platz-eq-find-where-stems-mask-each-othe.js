/* =====================================================================
   PLATZ-EQ: find where stems mask each other and dip the less important one
   ===================================================================== */
const TB = Array.from({length:22}, (_,k)=>50*Math.pow(2,k/3));   // 1/3-octave centres 50 Hz – 5 kHz+
const specCache = new WeakMap();
function stemBands(t){
  if(specCache.has(t.buffer)) return specCache.get(t.buffer);
  const b = t.buffer, fs = b.sampleRate, N = 4096, w = hann(N), re = new Float64Array(N), im = new Float64Array(N);
  const L = b.getChannelData(0), R = b.numberOfChannels>1 ? b.getChannelData(1) : L;
  const hop = Math.max(N, Math.floor((L.length-N)/140)), frames = [];
  for(let s=0; s+N<=L.length; s+=hop){
    let en = 0; for(let i=0;i<N;i++){ const v=(L[s+i]+R[s+i])/2; re[i]=v*w[i]; im[i]=0; en+=v*v; }
    frames.push({s, en});
  }
  const maxE = Math.max(...frames.map(f=>f.en), 1e-12), P = new Float64Array(TB.length); let used = 0;
  for(const f of frames){
    if(f.en < maxE*0.001) continue;                                   // only where the stem is playing
    for(let i=0;i<N;i++){ const v=(L[f.s+i]+R[f.s+i])/2; re[i]=v*w[i]; im[i]=0; }
    fft(re, im); used++;
    for(let k=1;k<N/2;k++){ const fr = k*fs/N, bi = Math.round(3*Math.log2(fr/50)); if(bi>=0 && bi<TB.length) P[bi] += re[k]*re[k]+im[k]*im[k]; }
  }
  const out = Array.from(P, p=>10*Math.log10(p/Math.max(used,1)+1e-12));
  specCache.set(t.buffer, out); return out;
}
function autoSpace(){
  tracks.forEach(t=>{ t.pg = 0; t.why = ""; });
  const roles = tracks.map(t=>role(t.name));
  const lvl = t => stemBands(t).map(v=>v + 20*Math.log10(t.vol||1e-9));
  const cuts = tracks.map(()=>null);
  const offer = (j, band, db, why) => { if(!cuts[j] || db > cuts[j].db) cuts[j] = {f:Math.round(TB[band]/10)*10, db, why}; };
  const range = (lo, hi) => TB.map((f,i)=>[f,i]).filter(([f])=>f>=lo && f<=hi).map(([,i])=>i);
  // 1) the lead vocal's presence range (≈ 0.8–5 kHz) is kept clear of chords, guitars, synths, backing vocals
  const li = roles.indexOf("lead");
  if(li>=0 && tracks[li].on){
    const V = lvl(tracks[li]), reg = range(800, 5000), vmax = Math.max(...reg.map(i=>V[i]));
    tracks.forEach((t,j)=>{
      if(j===li || !t.on || !["keys","guitar","synth","pad","bv","other"].includes(roles[j])) return;
      const C = lvl(t); let best = null;
      for(const i of reg){ const comp = C[i]-V[i], score = (V[i]-vmax) + Math.min(comp, 3); if(!best || score>best.score) best = {i, comp, score}; }
      if(best && best.comp > -9) offer(j, best.i, Math.min(4.5, 1.5 + (best.comp+9)*0.25), "Platz für "+tracks[li].name);
    });
  }
  // 2) the bass makes room at the kick's fundamental
  const ki = roles.indexOf("kick") >= 0 ? roles.indexOf("kick") : roles.indexOf("drums"), bi = roles.indexOf("bass");
  if(ki>=0 && bi>=0 && tracks[ki].on && tracks[bi].on){
    const K = lvl(tracks[ki]), B = lvl(tracks[bi]), reg = range(40, 130);
    const i = reg.reduce((a,b)=>K[b]>K[a]?b:a, reg[0]), comp = B[i]-K[i];
    if(comp > -12) offer(bi, i, Math.min(3.5, 1.5 + (comp+12)*0.2), "Platz für "+tracks[ki].name);
  }
  cuts.forEach((c,j)=>{ const t = tracks[j]; if(c){ t.pf = c.f; t.pg = -Math.round(c.db*2)/2; t.why = c.why; } t.refresh(); });
}

