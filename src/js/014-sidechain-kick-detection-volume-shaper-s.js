/* =====================================================================
   SIDECHAIN: kick detection + volume-shaper style ducking
   (same duck curve on every kick, like Kickstart/LFOTool, triggered by the real kick hits)
   ===================================================================== */
const SC = {amt:0, target:"bass", kicks:null, src:""};
// effects master switch (reverb, echo, sidechain): off after loading, like Auto-Mix and mastering
let FXON = false;
function setFxOn(v){ FXON = !!v; $("fxOn").setAttribute("aria-pressed", FXON); $("fxsec").classList.toggle("off", !FXON); if(typeof fxLive !== "undefined" && fxLive) fxLive.set();
  if(playing){ stop(); play(); } scheduleAnalysis(); saveSoon(); }
const DRUM_ROLES = ["kick","snare","drums","hat","perc"], VOX_ROLES = ["lead","bv"];
function ducked(t){
  if(!FXON || !SC.amt || !SC.kicks || !SC.kicks.length) return false;
  const r = role(t.name);
  if(SC.target==="bass") return r==="bass";
  if(SC.target==="music") return !DRUM_ROLES.includes(r) && !VOX_ROLES.includes(r);
  return !DRUM_ROLES.includes(r);
}
function detectKicks(){
  const ki = tracks.findIndex(t=>role(t.name)==="kick"), di = tracks.findIndex(t=>role(t.name)==="drums");
  const t = tracks[ki>=0 ? ki : di];
  if(!t){ SC.kicks = null; SC.src = ""; return; }
  const b = t.buffer, D = 8, fs = b.sampleRate/D, n = Math.floor(b.length/D), x = new Float32Array(n);
  for(let c=0;c<b.numberOfChannels;c++){ const d=b.getChannelData(c); for(let i=0;i<n;i++) x[i]+=d[i*D]; }
  // two one-pole low-passes at ~150 Hz keep mostly the kick
  const k = 1-Math.exp(-2*Math.PI*150/fs); let y1=0, y2=0;
  for(let i=0;i<n;i++){ y1+=(x[i]-y1)*k; y2+=(y1-y2)*k; x[i]=y2; }
  const hop = Math.round(fs*0.005), nf = Math.floor(n/hop), e = new Float32Array(nf), on = new Float32Array(nf);
  for(let f=0;f<nf;f++){ let s=0; for(let i=f*hop;i<(f+1)*hop;i++) s+=x[i]*x[i]; e[f]=Math.sqrt(s/hop); }
  for(let f=1;f<nf;f++) on[f]=Math.max(0, e[f]-e[f-1]);
  const sorted = Array.from(on).sort((a,b)=>b-a), thr = (sorted[Math.floor(nf*0.01)]||0)*0.35;
  const out = []; let last = -1;
  for(let f=2; f<nf-10; f++){
    if(on[f] < thr) continue;
    let isMax = true; for(let j=Math.max(0,f-10); j<=f+10; j++) if(on[j]>on[f]){ isMax=false; break; }
    if(!isMax) continue;
    const tm = f*hop/fs; if(last>=0 && tm-last < 0.1) continue;
    out.push(tm); last = tm;
  }
  SC.kicks = out; SC.src = t.name;
}
// tl: kick time on the current playback timeline -> context time
function scheduleDuck(param, toCtx, from){
  const depth = db2(-12*SC.amt/100), beat = 60/((song?song.bpm:120)*(P.mode==="pro"?P.tempo:1));
  const relTau = Math.max(0.03, beat*0.16) / (P.mode==="tape" ? rate : 1);
  const scale = P.mode==="pro" ? 1/P.tempo : 1;
  for(const k of SC.kicks){
    const tl = k*scale; if(tl < from) continue;
    const t = toCtx(tl); if(t < 0) continue;
    param.setTargetAtTime(depth, t, 0.004);
    param.setTargetAtTime(1, t + 0.02, relTau);
  }
}
function syncSc(){
  $("scAmt").value = SC.amt; $("vScAmt").textContent = SC.amt ? `−${(12*SC.amt/100).toFixed(1)} dB` : "Aus";
  document.querySelectorAll("#scTarget button").forEach(b=>b.setAttribute("aria-pressed", b.dataset.v===SC.target));
  $("scInfo").textContent = !tracks.length ? "Kick wird nach dem Laden gesucht."
    : SC.kicks && SC.kicks.length ? `${SC.kicks.length} Kicks erkannt in „${SC.src}“. Die gewählten Spuren werden bei jedem Kick kurz leiser.`
    : "Keine Kick- oder Drum-Spur gefunden, Sidechain nicht möglich.";
  $("scAmt").disabled = !(SC.kicks && SC.kicks.length);
  tracks.forEach(t=>t.refresh && t.refresh());
}
function scChanged(){ syncSc(); if(playing){ stop(); play(); } scheduleAnalysis(); saveSoon(); }
$("scAmt").oninput = e=>{ SC.amt = +e.target.value; if(!FXON && SC.amt) setFxOn(true); scChanged(); };
$("scTarget").onclick = e=>{ const v = e.target.dataset && e.target.dataset.v; if(v){ SC.target = v; scChanged(); } };
syncSc();

/* ---- auto dynamics: vocal compression 3–6 dB at ~3–4:1, de-essing, subtle functional sidechain ---- */
function autoDynamics(){
  const P0 = prof();
  tracks.forEach(t=>{ const r = role(t.name);
    t.comp = r==="lead" ? P0.comp.lead : r==="bv" ? P0.comp.bv : r==="bass" ? P0.comp.bass : 0;
    t.deess = r==="lead" ? P0.deess : r==="bv" ? Math.round(P0.deess*0.8) : 0;
    t.ride = r==="lead" ? 40 : 0;
  });
  SC.amt = 0;
  if(SC.kicks && SC.kicks.length && P0.sc.amt && (P0.sc.target !== "bass" || tracks.some(t=>role(t.name)==="bass"))){ SC.amt = P0.sc.amt; SC.target = P0.sc.target; }
  syncSc();
}
$("autodyn").onclick = ()=>{ if(isSingleSong()) return singleSongNote("Auto-Dynamik"); autoDynamics(); if(playing){ stop(); play(); } after(); autoLog("Auto-Dynamik: Kompressor und De-Esser auf den Vocals, Bass macht bei jedem Kick kurz Platz"); setStatus("Auto-Dynamik gesetzt."); };

