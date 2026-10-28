/* =====================================================================
   LIVE METERS: spectrum, L/R peak, short-term loudness (K-weighted, 3 s)
   ===================================================================== */
let MT = null;
function buildMeters(){
  const an = ctx.createAnalyser(); an.fftSize = 4096; an.smoothingTimeConstant = 0.8; master.connect(an);
  const sp = ctx.createChannelSplitter(2); master.connect(sp);
  const mk = () => { const a = ctx.createAnalyser(); a.fftSize = 2048; return a; };
  const aL = mk(), aR = mk(), kL = mk(), kR = mk();
  sp.connect(aL,0); sp.connect(aR,1);
  const [f1,f2] = kCoefs(ctx.sampleRate);
  [[0,kL],[1,kR]].forEach(([c,dst])=>{
    const s1 = ctx.createIIRFilter([f1[0],f1[1],f1[2]],[1,f1[3],f1[4]]), s2 = ctx.createIIRFilter([1,-2,1],[1,f2[3],f2[4]]);
    sp.connect(s1,c); s1.connect(s2).connect(dst);
  });
  MT = {an, aL, aR, kL, kR, freq:new Float32Array(an.frequencyBinCount), td:new Float32Array(2048), hist:[], hold:-100, holdT:0, clipT:0};
}
function drawMeters(){
  const cv = $("spec"), w = cv.clientWidth, h = cv.clientHeight, dpr = devicePixelRatio||1;
  if(cv.width!==Math.round(w*dpr)){ cv.width=Math.round(w*dpr); cv.height=Math.round(h*dpr); }
  const g = cv.getContext("2d"); g.setTransform(dpr,0,0,dpr,0,0); g.clearRect(0,0,w,h);
  g.font = "10px " + cssVar("--f-mono"); g.fillStyle = cssVar("--muted"); g.strokeStyle = cssVar("--line"); g.lineWidth = 1;
  const xOf = f => Math.log10(f/20)/3*w;
  [[100,"100"],[1000,"1k"],[10000,"10k"]].forEach(([f,l])=>{ const x=xOf(f); g.beginPath(); g.moveTo(x,0); g.lineTo(x,h); g.stroke(); g.fillText(l, x+3, h-4); });
  if(!MT || !playing){ return; }
  MT.an.getFloatFrequencyData(MT.freq);
  const ny = ctx.sampleRate/2, nb = MT.freq.length;
  g.beginPath(); g.moveTo(0,h);
  for(let x=0;x<=w;x+=2){
    const f0 = 20*Math.pow(1000, x/w), f1 = 20*Math.pow(1000, (x+2)/w);
    let b0 = Math.floor(f0/ny*nb), b1 = Math.max(b0+1, Math.floor(f1/ny*nb)), m = -140;
    for(let b=b0;b<b1&&b<nb;b++) if(MT.freq[b]>m) m = MT.freq[b];
    const y = h - Math.max(0, Math.min(1, (m+110)/90))*h;
    g.lineTo(x, y);
  }
  g.lineTo(w,h); g.closePath();
  g.globalAlpha = .28; g.fillStyle = cssVar("--accent"); g.fill(); g.globalAlpha = 1;
  g.strokeStyle = cssVar("--accent"); g.lineWidth = 1.5; g.stroke();

  // peaks
  const pk = a => { a.getFloatTimeDomainData(MT.td); let m=0; for(let i=0;i<MT.td.length;i++){ const v=Math.abs(MT.td[i]); if(v>m) m=v; } return m; };
  const ms = a => { a.getFloatTimeDomainData(MT.td); let s=0; for(let i=0;i<MT.td.length;i++) s+=MT.td[i]*MT.td[i]; return s/MT.td.length; };
  const pl = pk(MT.aL), pr = pk(MT.aR), now = performance.now();
  const toW = v => { const d = 20*Math.log10(v+1e-9); return Math.max(0, Math.min(1, (d+60)/60)); };
  $("mL").style.clipPath = `inset(0 ${(100-toW(pl)*100).toFixed(1)}% 0 0)`;
  $("mR").style.clipPath = `inset(0 ${(100-toW(pr)*100).toFixed(1)}% 0 0)`;
  const pdb = 20*Math.log10(Math.max(pl,pr)+1e-9);
  if(pdb > MT.hold || now-MT.holdT > 1500){ MT.hold = pdb; MT.holdT = now; }
  $("pkNow").textContent = MT.hold < -90 ? "–" : MT.hold.toFixed(1);
  if(pdb >= -0.1) MT.clipT = now;
  // short-term loudness over the last 3 s
  MT.hist.push([now, ms(MT.kL)+ms(MT.kR)]);
  // Hearing guard: momentary loudness (last 400 ms) above anything a normal master reaches (> −2.5 LUFS) => drop the output by 12 dB
  const mom = MT.hist.filter(h=>now-h[0] < 400), Lm = -0.691 + 10*Math.log10(mom.reduce((a,b)=>a+b[1],0)/Math.max(1,mom.length) + 1e-12);
  if(Lm > -2.5){ if(!MT.guardOn){ MT.guardOn = true; guard.gain.setTargetAtTime(0.25, ctx.currentTime, 0.01); } MT.guardT = now; }
  else if(MT.guardOn && now - MT.guardT > 3000){ MT.guardOn = false; guard.gain.setTargetAtTime(1, ctx.currentTime, 0.5); }
  while(MT.hist.length && now-MT.hist[0][0] > 3000) MT.hist.shift();
  const avg = MT.hist.reduce((a,b)=>a+b[1],0)/MT.hist.length, L = -0.691+10*Math.log10(avg+1e-12);
  $("lufsNow").textContent = L < -70 ? "–" : L.toFixed(1);
  const hint = $("mHint");
  if(MT.guardOn){ hint.textContent = "Gehörschutz aktiv: ungewöhnlich lauter Pegel, Ausgabe um 12 dB gesenkt. Prüf deine Spuren."; hint.className = "warn"; }
  else if(now-MT.clipT < 1500 && !M.on){ hint.textContent = "Übersteuert! Lautstärken etwas runter oder Mastering einschalten."; hint.className = "warn"; }
  else if(L < -70){ hint.textContent = "Stille."; hint.className = ""; }
  else if(L > -8){ hint.textContent = "Sehr laut. Laut, aber wenig Dynamik."; hint.className = ""; }
  else if(L > -16){ hint.textContent = "Gute Lautheit für Streaming und Club."; hint.className = ""; }
  else { hint.textContent = M.on ? "Eher leise." : "Eher leise. Das Mastering hebt es auf Streaming-Lautheit an."; hint.className = ""; }
}
function resetMeters(){
  if(MT){ MT.hist = []; MT.hold = -100; if(MT.guardOn && guard){ MT.guardOn = false; guard.gain.setTargetAtTime(1, ctx.currentTime, 0.05); } }
  $("mL").style.clipPath = $("mR").style.clipPath = "inset(0 100% 0 0)";
  $("lufsNow").textContent = "–"; $("pkNow").textContent = "–";
  drawMeters();
}
addEventListener("resize", ()=>drawMeters());
drawMeters();

