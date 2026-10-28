/* ---------- Transport ---------- */
let rate = 1;
function currentTime(){ return playing ? Math.min(duration, offset + (ctx.currentTime - startedAt)*rate) : offset; }
function play(){
  if(playing) stop();   // never start a second copy: sources that are no longer referenced could not be stopped any more (played twice, much louder)
  const c = ac(); if(c.state==="suspended") c.resume();
  if(fxLive && fxLive.used){ const old = fxLive; old.out.forEach(n=>{ n.gain.setTargetAtTime(0, c.currentTime, 0.02); }); setTimeout(()=>old.out.forEach(n=>n.disconnect()), 300); fxLive = buildFx(c, true); fxLive.out.forEach(n=>n.connect(mixBus)); }
  fxLive.used = true;
  tracks.forEach(t=>{
    const s = c.createBufferSource(); s.buffer = buf(t); s.playbackRate.value = rate;
    const ch = stemChain(c, fxLive); ch.set(t); ch.vol.gain.value = audible(t)?t.vol:0;
    s.connect(ch.input); ch.output.connect(mixBus);
    scheduleRide(ch.ride.gain, rideCurve(t), offset, c.currentTime, rate);
    const rg = c.createGain(); rg.gain.value = audible(t) ? 1 : 0; s.connect(rg).connect(rawBus); t.rawG = rg;
    const g = ch.vol; t.chain = ch;
    if(offset < buf(t).duration) s.start(0, offset);
    t.src = s; t.gain = g;
  });
  startedAt = c.currentTime; playing = true;
  tracks.forEach(t=>{ if(ducked(t)) scheduleDuck(t.chain.duck.gain, tl => startedAt + (tl-offset)/rate, offset); });
  setIcon(); tick(); levSchedule();
}
function stop(){
  if(!playing) return;
  offset = currentTime();
  tracks.forEach(t=>{ try{t.src&&t.src.stop();}catch(e){} t.src=null; if(t.chain){ t.chain.output.disconnect(); t.chain.vol.disconnect(); } if(t.rawG){ t.rawG.disconnect(); t.rawG = null; } t.gain=null; t.chain=null; });
  if(fxLive) fxLive.out.forEach(n=>n.gain.setTargetAtTime(0, ctx.currentTime, 0.025));
  playing = false; cancelAnimationFrame(raf); setIcon(); resetMeters(); levSchedule();
}
function setIcon(){
  $("playIcon").innerHTML = playing ? '<path d="M6 4h4v16H6zM14 4h4v16h-4z"/>' : '<path d="M7 4l13 8-13 8z"/>';
  $("play").setAttribute("aria-label", playing ? "Pause" : "Abspielen");
  $("miniIcon").innerHTML = $("playIcon").innerHTML; $("miniPlay").setAttribute("aria-label", playing ? "Pause" : "Abspielen"); miniSync();
}
function tick(){
  const t = currentTime();
  $("cur").textContent = fmtT(t/rate); $("seek").value = duration ? Math.round(t/duration*1000) : 0; miniSync(t);
  drawWaves(); drawMeters(); drawSec(); livePreview(); if(!TAP.on) lvHighlight(t/rate); else beatTick(t/rate);
  if(playing && $("loopOn").checked && AB.a!==null && AB.b!==null && t >= AB.b){ stop(); offset = AB.a; play(); return; }
  if(playing && t >= duration){ stop(); offset = 0; $("cur").textContent=fmtT(0); $("seek").value=0; drawWaves(); return; }
  if(playing) raf = requestAnimationFrame(tick);
}
$("play").onclick = ()=>{ playing ? stop() : play(); };
