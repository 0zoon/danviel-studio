/* ---------- Rotary knobs: optional view of the parameter sliders ---------- */
let KNOBS = false; try{ KNOBS = localStorage.getItem("stemmixer:knobs") === "1"; }catch(e){}
const DIALS = new Set();
const dialSkip = r => !!r.closest(".cxgrid, #vsb, .covx, .rectools, .vol");
function dialFrac(r){ const mn = +r.min || 0, mx = r.max === "" ? 100 : +r.max; return mx > mn ? (+r.value - mn) / (mx - mn) : 0; }
function dialSync(d){ const r = d._r; d.style.setProperty("--f", Math.max(0, Math.min(1, dialFrac(r)))); d.classList.toggle("dis", r.disabled); d.setAttribute("aria-valuenow", r.value); }
function dialSet(r, v){ const mn = +r.min || 0, mx = r.max === "" ? 100 : +r.max, st = r.step === "any" ? 0 : (+r.step || 1);
  v = Math.max(mn, Math.min(mx, v)); if(st) v = Math.round((v - mn)/st)*st + mn;
  if(String(+r.value) === String(v)) return; r.value = v; r.dispatchEvent(new Event("input", {bubbles:true})); }
function addDial(r){
  if(r._dial || dialSkip(r)) return; const lab = r.closest(".knob"); if(!lab) return;
  const d = document.createElement("div"); d.className = "dial"; d.tabIndex = 0; d.setAttribute("role", "slider"); d.innerHTML = "<i></i>"; d._r = r; r._dial = d;
  d.title = (lab.querySelector(".top") || lab).textContent.trim().replace(/\s+/g, " ") + " · ↕ ziehen, Mausrad, Doppelklick = Standard";
  r.after(d); lab.classList.add("hasdial"); DIALS.add(d); dialSync(d);
  r.addEventListener("input", ()=>dialSync(d));
  const span = ()=> (r.max === "" ? 100 : +r.max) - (+r.min || 0);
  d.addEventListener("pointerdown", e=>{ if(r.disabled) return; e.preventDefault(); d.focus(); d.setPointerCapture(e.pointerId);
    const y0 = e.clientY, v0 = +r.value; let moved = false;
    const mv = ev=>{ moved = true; dialSet(r, v0 + (y0 - ev.clientY) / (ev.shiftKey ? 600 : 150) * span()); };
    const up = ()=>{ d.removeEventListener("pointermove", mv); d.removeEventListener("pointerup", up); d.removeEventListener("pointercancel", up); if(moved) r.dispatchEvent(new Event("change", {bubbles:true})); };
    d.addEventListener("pointermove", mv); d.addEventListener("pointerup", up); d.addEventListener("pointercancel", up); });
  d.addEventListener("wheel", e=>{ if(r.disabled) return; e.preventDefault(); dialSet(r, +r.value + (e.deltaY < 0 ? 1 : -1) * span() / (e.shiftKey ? 200 : 50)); r.dispatchEvent(new Event("change", {bubbles:true})); }, {passive:false});
  d.addEventListener("dblclick", ()=>{ if(r.disabled) return; dialSet(r, +r.defaultValue); r.dispatchEvent(new Event("change", {bubbles:true})); r.dispatchEvent(new MouseEvent("dblclick", {bubbles:true})); });
  d.addEventListener("keydown", e=>{ const k = {ArrowUp:1, ArrowRight:1, ArrowDown:-1, ArrowLeft:-1}[e.key]; if(!k || r.disabled) return; e.preventDefault(); e.stopPropagation(); dialSet(r, +r.value + k * span() / (e.shiftKey ? 200 : 50)); r.dispatchEvent(new Event("change", {bubbles:true})); });
}
function removeDials(){ DIALS.forEach(d=>{ const r = d._r; r._dial = null; const lab = r.closest(".knob"); lab && lab.classList.remove("hasdial"); d.remove(); }); DIALS.clear(); }
function dialScan(root){ (root || document).querySelectorAll(".knob input[type=range]").forEach(addDial); }
const dialObs = new MutationObserver(ms=>{ if(!KNOBS) return; for(const m of ms) for(const n of m.addedNodes) if(n.nodeType === 1){ if(n.matches && n.matches(".knob input[type=range]")) addDial(n); else if(n.querySelectorAll) dialScan(n); } });
let dialTimer = 0;
function knobUi(){ $("kmSlide").setAttribute("aria-pressed", !KNOBS); $("kmKnob").setAttribute("aria-pressed", KNOBS); document.body.classList.toggle("knobmode", KNOBS);
  clearInterval(dialTimer); dialObs.disconnect();
  if(KNOBS){ dialScan(); dialObs.observe(document.body, {childList:true, subtree:true});
    dialTimer = setInterval(()=>{ DIALS.forEach(d=>{ if(!d.isConnected){ DIALS.delete(d); d._r._dial = null; return; } if(d.offsetParent) dialSync(d); }); }, 250); }
  else removeDials(); }
$("kmSlide").onclick = ()=>{ KNOBS = false; try{ localStorage.setItem("stemmixer:knobs", "0"); }catch(e){} knobUi(); };
$("kmKnob").onclick = ()=>{ KNOBS = true; try{ localStorage.setItem("stemmixer:knobs", "1"); }catch(e){} knobUi(); };
knobUi();
/* help pictures: click = large */
document.addEventListener("click", e=>{ const im = e.target.closest && e.target.closest("#help .himg"); if(!im) return;
  const z = document.createElement("div"); z.className = "hzoom"; z.innerHTML = '<img alt="">'; z.firstChild.src = im.src; z.onclick = ()=>z.remove(); $("help").appendChild(z); });
let PROVIEW = false; try{ PROVIEW = localStorage.getItem("stemmixer:proview") === "1"; }catch(e){}
function proViewUi(){ $("proStrips").setAttribute("aria-pressed", PROVIEW); document.querySelectorAll(".strip").forEach(el=>{ const d = el.querySelector(".detail"), m = el.querySelector(".more"); if(d){ d.hidden = !PROVIEW; m.setAttribute("aria-expanded", PROVIEW); } }); }
$("proStrips").onclick = ()=>{ PROVIEW = !PROVIEW; try{ localStorage.setItem("stemmixer:proview", PROVIEW ? "1" : "0"); }catch(e){} proViewUi(); };
setTimeout(()=>$("proStrips").setAttribute("aria-pressed", PROVIEW), 0);
const mkTrack = t => ({...t, on:!t.isMidi, solo:false, vol:1, pan:0, hpf:0, low:0, high:0, pf:2000, pg:0, rev:0, dly:0, comp:0, deess:0, dn:0, trimA:0, trimB:0, shift:0, why:"", gain:null, src:null, chain:null, peaks:computePeaks(t.buffer, 400)});
// add one track (recording) without touching the rest of the mix
function addTrack(t){ const was = playing; if(was) stop(); tracks.push(mkTrack(t)); stemLufs = null; mixSpec = null; P.ver++; SEC.env = null;
  renderStrips(); syncSc(); updateUI(); drawSec(); scheduleAnalysis(); saveSoon(); try{ bldInfo(); }catch(e){} }
function removeTrack(t){ const was = playing; if(was) stop(); const i = tracks.indexOf(t); if(i < 0) return; tracks.splice(i, 1);
  if(!tracks.length){ location.reload(); return; } stemLufs = null; mixSpec = null; P.ver++; SEC.env = null; renderStrips(); syncSc(); updateUI(); drawSec(); scheduleAnalysis(); saveSoon();
  try{ if(BLD.sel === t) bldEdit(null); bldInfo(); }catch(e){} }
function setTracks(list){ if(playing) stop(); killLive();   /* new tracks: the old ones must fall silent first, or they keep playing out of reach */
  setTimeout(miniCheck, 50); setTimeout(()=>{ try{ bldInfo(); }catch(e){} }, 80); setTimeout(()=>{ if(typeof goStep !== "function") return; if(tracks.length && STEP === 1) goStep(2, true); else stepUi(); }, 60);
  tracks = list.map(mkTrack);
  duration = Math.max(...tracks.map(t=>t.buffer.duration));
  P.tempo = 1; P.semis = 0; P.ver++; rate = 1; AB.a = AB.b = null; $("rate").value = 100; $("semi").value = 0;
  ["setA","setB","clrAB"].forEach(id=>$(id).disabled=false); showAB();
  offset = 0;
  $("dur").textContent = fmtT(duration/rate);
  $("play").disabled = $("seek").disabled = $("export").disabled = ["autobal","resetvol","exportStems","automix","quickClip","zIn","zOut","zFit","zSec","autopan","autoeq","projSave","projZip","autofx","autodyn","exportVers","vMake","lRun","exportMidi","findHook","relCheck","relPack"].forEach(id=>$(id).disabled=false); $("autolog").hidden = true;
  stemLufs = null; mixSpec = null; SC.amt = 0; detectKicks(); if(FXON) setFxOn(false);
  renderStrips(); syncSc(); updateUI(); SEC.env = null; SEC.hook = false; SEC.v0 = 0; SEC.v1 = null; drawSec();
  setTimeout(detectSong, 50);
  restoredNote = "";
  // every load starts neutral: nothing switched on. Settings from last time can be brought back with one click
  setAutoOn(false); if(M.on) setMasterOn(false); RESTORE_PJ = null;
  try{ const saved = localStorage.getItem(storeKey()); if(saved){ RESTORE_PJ = JSON.parse(saved); restoredNote = " Deine Einstellungen vom letzten Mal sind gespeichert: „↺ Letzte Einstellungen“ holt sie zurück."; } }catch(e){}
  $("restoreLast").hidden = !RESTORE_PJ;
  clearTimeout(HIST.t); HIST.list = [snapshot()]; HIST.i = 0; histUI();
}

function computePeaks(buf, n){
  const ch = buf.getChannelData(0), step = Math.max(1, Math.floor(ch.length/n)), out = new Float32Array(n);
  for(let i=0;i<n;i++){ let m=0; const s=i*step, e=Math.min(ch.length,s+step); for(let j=s;j<e;j+=16){ const v=Math.abs(ch[j]); if(v>m)m=v; } out[i]=m; }
  let mx = 0; out.forEach(v=>{ if(v>mx) mx=v; }); if(mx>0) for(let i=0;i<n;i++) out[i]/=mx;
  return out;
}

