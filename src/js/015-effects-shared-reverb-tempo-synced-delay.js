/* =====================================================================
   EFFECTS: shared reverb + tempo-synced delay, fed by per-stem sends
   ===================================================================== */
var FX_READY = false;
const FX = {revType:"plate", revLvl:80, dlyNote:"q", dlyFb:30, dlyLvl:80};
const REV_TYPES = {room:{len:0.7, pre:0.015}, plate:{len:1.4, pre:0.04}, hall:{len:2.2, pre:0.06}};
const NOTES = {e:0.5, de:0.75, q:1};
const irCache = new WeakMap();
function impulse(c, type){
  let m = irCache.get(c); if(!m){ m = {}; irCache.set(c, m); }
  if(m[type]) return m[type];
  const {len, pre} = REV_TYPES[type], fs = c.sampleRate, p0 = Math.round(pre*fs), n = p0 + Math.round(len*fs);
  const b = c.createBuffer(2, n, fs);
  for(let ch=0; ch<2; ch++){
    const d = b.getChannelData(ch); let lp = 0;
    for(let i=p0;i<n;i++){
      const t = (i-p0)/fs, env = Math.pow(0.001, t/len);          // −60 dB at the end
      const k = 0.15 + 0.75*Math.min(1, t/len);                     // darker as it decays
      lp += ((Math.random()*2-1) - lp)*(1-k); d[i] = lp*env;
    }
  }
  return (m[type] = b);
}
function delayTime(live){
  const base = song ? song.bpm : 120;
  const bpm = base * (P.mode==="pro" ? P.tempo : (live ? rate : 1));
  return Math.min(3.5, 60/bpm*NOTES[FX.dlyNote]);
}
function buildFx(c, live){
  const rin = c.createGain(), conv = c.createConvolver(), rhp = c.createBiquadFilter(), rlp = c.createBiquadFilter(), rret = c.createGain();
  rhp.type = "highpass"; rhp.frequency.value = 350; rlp.type = "lowpass"; rlp.frequency.value = 7000; rlp.Q.value = 0.5;   // keep the reverb out of the low mids and the S sounds
  conv.buffer = impulse(c, FX.revType);
  rin.connect(conv).connect(rhp).connect(rlp).connect(rret);
  const din = c.createGain(), dl = c.createDelay(4), fb = c.createGain(), lp = c.createBiquadFilter(), dhp = c.createBiquadFilter(), dret = c.createGain();
  lp.type = "lowpass"; lp.frequency.value = 4500; lp.Q.value = 0; dhp.type = "highpass"; dhp.frequency.value = 200;
  din.connect(dl); dl.connect(lp); lp.connect(fb).connect(dl); lp.connect(dhp).connect(dret);
  const fx = {rin, din, out:[rret, dret], set(){
    if(conv.buffer !== impulse(c, FX.revType)) conv.buffer = impulse(c, FX.revType);
    rret.gain.value = FXON ? FX.revLvl/100 * 0.55 : 0; dret.gain.value = FXON ? FX.dlyLvl/100 * 0.45 : 0;
    dl.delayTime.value = delayTime(live); fb.gain.value = Math.min(0.65, FX.dlyFb/100);
  }};
  fx.set(); return fx;
}
function syncFx(){
  document.querySelectorAll("#revType button").forEach(b=>b.setAttribute("aria-pressed", b.dataset.v===FX.revType));
  document.querySelectorAll("#dlyNote button").forEach(b=>b.setAttribute("aria-pressed", b.dataset.v===FX.dlyNote));
  $("revLvl").value = FX.revLvl; $("dlyFb").value = FX.dlyFb; $("dlyLvl").value = FX.dlyLvl;
  $("vRevLvl").textContent = FX.revLvl+" %"; $("vDlyFb").textContent = FX.dlyFb+" %"; $("vDlyLvl").textContent = FX.dlyLvl+" %";
  $("vDlyMs").textContent = Math.round(delayTime(false)*1000)+" ms";
  if(fxLive) fxLive.set();
}
const fxChanged = ()=>{ if(!FXON) setFxOn(true); syncFx(); scheduleAnalysis(); saveSoon(); };
$("fxOn").onclick = ()=>setFxOn(!FXON);
$("revType").onclick = e=>{ const v = e.target.dataset && e.target.dataset.v; if(v){ FX.revType = v; fxChanged(); } };
$("dlyNote").onclick = e=>{ const v = e.target.dataset && e.target.dataset.v; if(v){ FX.dlyNote = v; fxChanged(); } };
[["revLvl","revLvl"],["dlyFb","dlyFb"],["dlyLvl","dlyLvl"]].forEach(([id,k])=>{ $(id).oninput = e=>{ FX[k] = +e.target.value; fxChanged(); }; });
syncFx(); FX_READY = true;

// Gentle starting points: plate reverb on vocals, a quarter-note echo on the lead
// Suno & co. vocals usually already carry reverb, so Auto-Mix only adds a touch by default ("Wenig")
const REV_K = {off:0, low:0.4, norm:1};
function autoVocalFx(){
  const V = prof().vox, k = REV_K[REV_AMT] ?? 0.4, q = x => Math.round(x*k);
  FX.revType = V.revType; FX.dlyNote = V.note; FX.dlyFb = V.fb;
  tracks.forEach(t=>{ const r = role(t.name);
    if(r==="lead"){ t.rev = q(V.rev); t.dly = q(V.dly); }
    else if(r==="bv"){ t.rev = q(V.bvRev); t.dly = 0; }
    else if(r==="snare"){ t.rev = q(5); t.dly = 0; }
    else { t.rev = 0; t.dly = 0; }
    t.refresh(); });
  syncFx();
}
$("autofx").onclick = ()=>{ if(isSingleSong()) return singleSongNote("Auto-Vocal-FX"); autoVocalFx(); if(!FXON) setFxOn(true); after(); autoLog("Auto-Vocal-FX: Platten-Hall auf den Vocals, Echo im Takt auf der Lead-Stimme"); setStatus("Vocal-Effekte gesetzt. Fein einstellen kannst du sie bei der Spur unter „Klang“."); };

