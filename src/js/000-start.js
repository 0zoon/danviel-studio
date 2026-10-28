(() => {
const $ = id => document.getElementById(id);
let PROJ_EXTRAS = [];
const AUDIO_RE = /\.(mp3|mpeg|mpga|mp2|wav|wave|flac|ogg|oga|opus|m4a|aac|mp4|m4v|webm|weba|aif|aiff|caf)$/i;
const VOCAL_RE = /(vocal|vox|voice|acapella|a cappella|lead|backing|bvs?\b|chor|adlib)/i;
const LEAD_RE = /(lead)/i;

let ctx = null;
let tracks = []; // {name, buffer, on, solo, vol, gain, src, peaks, el}
let master = null;
let playing = false, startedAt = 0, offset = 0, duration = 0, raf = 0;

let mixBus = null, live = null, fxLive = null, guard = null, monitor = null, rawBus = null, RAW = false;
/* ---- listening volume: only what you hear, never the exported files ---- */
const MON = {v:60, muted:false};
try{ const sv = JSON.parse(localStorage.getItem("stemmixer:monitor")||"null"); if(sv){ MON.v = sv.v ?? 60; MON.muted = !!sv.muted; } }catch(e){}
const monGain = () => MON.muted ? 0 : Math.pow(MON.v/100, 2);           // squared = feels even across the range
function monSync(){
  $("monVol").value = MON.v; $("vMon").textContent = MON.muted ? "stumm" : MON.v + " %";
  $("monMute").setAttribute("aria-pressed", MON.muted); $("monMute").setAttribute("aria-label", MON.muted ? "Ton an" : "Stumm schalten");
  const waves = MON.muted || MON.v===0 ? '<path d="M23 9l-6 6M17 9l6 6"/>' : (MON.v < 50 ? '<path d="M15.5 8.5a5 5 0 0 1 0 7"/>' : '<path d="M15.5 8.5a5 5 0 0 1 0 7"/><path d="M19 5a10 10 0 0 1 0 14"/>');
  $("monIcon").innerHTML = '<path d="M11 5L6 9H2v6h4l5 4V5z"/>' + waves;
  $("miniMonIcon").innerHTML = $("monIcon").innerHTML; $("miniVol").value = MON.muted ? 0 : MON.v;
  $("miniMute").setAttribute("aria-label", MON.muted ? "Ton an" : "Stumm schalten"); $("miniMute").title = MON.muted ? "Ton an" : "Stumm schalten";
  if(monitor && ctx) monitor.gain.setTargetAtTime(monGain(), ctx.currentTime, 0.03);
  try{ localStorage.setItem("stemmixer:monitor", JSON.stringify(MON)); }catch(e){}
}
function ac(){
  if(!ctx){
    ctx = new (window.AudioContext||window.webkitAudioContext)(); window.__ac = ctx;
    master = ctx.createGain();
    const safe = ctx.createDynamicsCompressor(); safe.threshold.value = -1; safe.knee.value = 0; safe.ratio.value = 20; safe.attack.value = 0.001; safe.release.value = 0.08;
    const clip = ctx.createWaveShaper(); clip.curve = new Float32Array([-0.97, 0, 0.97]);
    guard = ctx.createGain();
    monitor = ctx.createGain(); monitor.gain.value = monGain();
    const safeMk = ctx.createGain(); safeMk.gain.value = db2(-compMakeupDb(-1, 0, 20));   // the safety limiter must not make things louder
    master.connect(guard).connect(safe).connect(safeMk).connect(clip).connect(monitor).connect(ctx.destination);
    mixBus = ctx.createGain(); mixBus.channelCount = 2; mixBus.channelCountMode = "explicit";
    rawBus = ctx.createGain(); rawBus.gain.value = 0; rawBus.connect(master);   // "Vorher hören": the plain stems, no mix, no mastering
    live = buildLive(ctx, mixBus, master);
    fxLive = buildFx(ctx, true); fxLive.out.forEach(n=>n.connect(mixBus));
    buildMeters();
    applyMaster();
  }
  return ctx;
}
const fmtT = s => { s=Math.max(0,s|0); return Math.floor(s/60)+":"+String(s%60).padStart(2,"0"); };
const cleanName = f => f.split("/").pop().replace(/\.[^.]+$/,"").replace(/^\s*\d+\s*[-_.]?\s*/,"") || f;

let hudT = 0, hudBusy = false;
function hud(){ const h = $("hud"); h.hidden = false; clearTimeout(hudT); if(!hudBusy) hudT = setTimeout(()=>{ h.hidden = true; }, 7000); }
let LAST_ST = ""; function setStatus(t, err){ if(window.__splitUi){ const d = document.getElementById("dropProg"); if(d){ d.hidden = false; d.classList.toggle("err", !!err); document.getElementById("dropProgTxt").textContent = t; } } const k = String(t).replace(/\d+ ?%.*$/,""); if(k !== LAST_ST || err){ LAST_ST = k; log(err ? "STATUS (Fehler):" : "Status:", t); } const s=$("status"); s.textContent=t; s.classList.toggle("err",!!err); $("hudTxt").textContent = t; $("hud").classList.toggle("err", !!err); hud(); }
function setProg(p){ if(window.__splitUi){ const b = document.getElementById("dropProgBar"); if(b) b.style.width = (p*100).toFixed(1)+"%"; } $("prog").style.width = (p*100).toFixed(1)+"%"; $("hudBar").style.width = (p*100).toFixed(1)+"%"; hudBusy = p>0 && p<1; if(hudBusy){ $("hud").hidden = false; clearTimeout(hudT); } else hud(); }

