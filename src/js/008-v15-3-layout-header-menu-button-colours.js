/* ===== v15.3 layout: header menu, button colours, step keys, summaries, cards in step 4 (no function changes) ===== */
const T_ = s => (window.__T || (x=>x))(s);
// colours that say what a button does: green = play / Auto-Mix, purple = AI, blue = help / demo
[["play","c-green"],["miniPlay","c-green"],["automix","c-green"],["demo","c-blue"],["helpBtn","c-blue"],["splitBtn","c-purple"],["lRun","c-purple"],["lCp","c-purple"],["aiCoverBtn","c-glow"]].forEach(([id, c])=>{ const e = $(id); if(e) e.classList.add(c); });
// packs where you need them: Mix (effects, track chains), Mastering, Video (visualizer styles), Cover studio (cover styles)
(function(){
  const mk = (focus, label) => { const b = document.createElement("button"); b.type = "button"; b.className = "packsin"; b.textContent = label || "📦 Pakete"; b.title = "Fertige Presets aus Paketen anwenden, eigene speichern und teilen"; b.onclick = e => { e.stopPropagation(); window.__pkFocus = focus; $("packsBtn").click(); }; return b; };
  const row = [...document.querySelectorAll(".automix .toolrow")].pop(); if(row) row.appendChild(mk(["Effekte", "Spur-Ketten"]));
  const fx = document.querySelector("#fxsec .mhead .l"); if(fx) fx.appendChild(mk(["Effekte", "Spur-Ketten"]));
  const ml = document.querySelector("#master .mhead .l"); if(ml) ml.appendChild(mk(["Mastering"]));
})();


/* ---- trim & shift a track (non-destructive, the original stays in t.orig) ---- */
function trimUi(t, el){
  const box = el.querySelector(".trimbox"); if(!box) return;
  const cv = box.querySelector(".trimcv"), info = box.querySelector(".tinfo"), V = {v0: 0, v1: 0, drag: null};
  const base = () => t.orig || t.buffer, dur = () => base().duration;
  const endT = () => t.trimB > 0 ? t.trimB : dur();
  const fmt = s => { const m = Math.floor(s/60), x = s - m*60; return m + ":" + (x < 10 ? "0" : "") + x.toFixed(1).replace(".", ","); };
  const sync = () => { info.textContent = (window.__T||(x=>x))(`Start ${fmt(t.trimA||0)} · Ende ${fmt(endT())} · Versatz ${(t.shift||0) >= 0 ? "+" : ""}${(t.shift||0).toFixed(2).replace(".", ",")} s`);
    box.querySelector(".tunmerge").hidden = !t.undoMerge; };
  const draw = () => {
    if(!V.v1) V.v1 = dur();
    const w = cv.clientWidth || 600, h = 96, dpr = Math.min(2, devicePixelRatio || 1); if(cv.width !== Math.round(w*dpr)){ cv.width = Math.round(w*dpr); cv.height = Math.round(h*dpr); }
    const g = cv.getContext("2d"); g.setTransform(dpr, 0, 0, dpr, 0, 0); g.clearRect(0, 0, w, h);
    const b = base(), d = b.getChannelData(0), fs = b.sampleRate, i0 = Math.floor(V.v0*fs), i1 = Math.min(d.length, Math.ceil(V.v1*fs)), per = Math.max(1, (i1 - i0)/w);
    const col = getComputedStyle(el).getPropertyValue("--sc").trim() || "#f2a83b", X = s => (s - V.v0)/(V.v1 - V.v0)*w, a = t.trimA||0, e = endT();
    for(let x=0;x<w;x++){ let mn = 0, mx = 0; const s0 = Math.floor(i0 + x*per), s1 = Math.min(i1, Math.floor(i0 + (x+1)*per)), st = Math.max(1, Math.floor((s1 - s0)/200));
      for(let i=s0;i<s1;i+=st){ const v = d[i]; if(v < mn) mn = v; if(v > mx) mx = v; }
      const tm = V.v0 + (x/w)*(V.v1 - V.v0); g.fillStyle = tm >= a && tm <= e ? col : "rgba(140,140,150,.35)"; g.fillRect(x, h/2 - mx*h*0.46, 1, Math.max(1, (mx - mn)*h*0.46)); }
    g.fillStyle = "rgba(0,0,0,.35)"; if(X(a) > 0) g.fillRect(0, 0, Math.min(w, X(a)), h); if(X(e) < w) g.fillRect(Math.max(0, X(e)), 0, w, h);
    for(const [tt, lab] of [[a, "▶"], [e, "■"]]){ const x = X(tt); if(x < -6 || x > w + 6) continue; g.fillStyle = "#f2c94c"; g.fillRect(x - 1.5, 0, 3, h); g.fillRect(x - 7, 0, 14, 14); g.fillStyle = "#1a1205"; g.font = "bold 10px sans-serif"; g.textAlign = "center"; g.fillText(lab, x, 11); }
    sync(); };
  const tAt = ev => { const r = cv.getBoundingClientRect(); return V.v0 + Math.max(0, Math.min(1, (ev.clientX - r.left)/r.width))*(V.v1 - V.v0); };
  const commit = () => { clearTimeout(V.tm); V.tm = setTimeout(()=>{ applyEdits(t, true); }, 120); };
  cv.addEventListener("pointerdown", ev => { if(!(V.v1 > V.v0)){ V.v0 = 0; V.v1 = dur(); draw(); } const tm = tAt(ev), w = cv.clientWidth, px = Math.abs((tm - (t.trimA||0))/(V.v1 - V.v0)*w), pe = Math.abs((tm - endT())/(V.v1 - V.v0)*w);
    V.drag = px <= pe ? "a" : "e"; cv.setPointerCapture(ev.pointerId); move(ev); });
  const move = ev => { if(!V.drag) return; const tm = tAt(ev), e = endT();
    if(V.drag === "a") t.trimA = Math.max(0, Math.min(tm, e - 0.05)); else { const v = Math.min(dur(), Math.max(tm, (t.trimA||0) + 0.05)); t.trimB = v >= dur() - 0.01 ? 0 : v; }
    t.trimA = Math.round(t.trimA*1000)/1000; draw(); };
  cv.addEventListener("pointermove", move);
  cv.addEventListener("pointerup", () => { if(!V.drag) return; V.drag = null; commit(); });
  cv.addEventListener("dblclick", () => { t.trimA = 0; t.trimB = 0; draw(); commit(); });
  cv.addEventListener("wheel", ev => { ev.preventDefault(); const D = dur(), span = V.v1 - V.v0;
    if(ev.shiftKey || Math.abs(ev.deltaX) > Math.abs(ev.deltaY)){ const dx = (ev.shiftKey ? ev.deltaY : ev.deltaX)/400*span; V.v0 = Math.max(0, Math.min(D - span, V.v0 + dx)); V.v1 = V.v0 + span; }
    else { const c = tAt(ev), f = ev.deltaY < 0 ? 0.8 : 1.25, ns = Math.max(0.2, Math.min(D, span*f)); V.v0 = Math.max(0, Math.min(D - ns, c - (c - V.v0)*ns/span)); V.v1 = V.v0 + ns; }
    draw(); }, {passive: false});
  box.querySelector(".tzoom").onclick = ev => { const z = ev.target.dataset && ev.target.dataset.z; if(!z) return; const D = dur(), span = V.v1 - V.v0, c = (V.v0 + V.v1)/2;
    if(z === "all"){ V.v0 = 0; V.v1 = D; } else { const ns = Math.max(0.2, Math.min(D, span*(z === "in" ? 0.5 : 2))); V.v0 = Math.max(0, Math.min(D - ns, c - ns/2)); V.v1 = V.v0 + ns; }
    draw(); };
  box.querySelector(".trimrow").onclick = ev => { const b = ev.target.closest("button"); if(!b) return;
    if(b.dataset.s){ const bar = song && song.bpm ? 240/song.bpm : 2, v = b.dataset.s === "bar" ? bar : b.dataset.s === "-bar" ? -bar : +b.dataset.s;
      t.shift = Math.round(Math.max(-dur(), Math.min(dur(), (t.shift||0) + v))*1000)/1000; draw(); commit(); }
    else if(b.classList.contains("tplay")){ const pos = ((t.trimA||0) + (t.shift||0)) * (P.mode === "pro" ? 1/P.tempo : 1); stop(); offset = Math.max(0, Math.min(duration - 0.05, pos)); play(); }
    else if(b.classList.contains("treset")){ t.trimA = 0; t.trimB = 0; t.shift = 0; V.v0 = 0; V.v1 = dur(); draw(); commit(); }
    else if(b.classList.contains("tunmerge")) unmerge(t); };
  el.querySelector(".more").addEventListener("click", () => setTimeout(draw, 30));
  t.trimDraw = draw; sync();
  // draw as soon as the box becomes visible (Klang, Profi-Ansicht, step change), never wait for a click
  try{ new ResizeObserver(()=>{ if(cv.clientWidth > 0) draw(); }).observe(cv); }catch(e){ setTimeout(draw, 60); }
}
/* ---- put a built track (drums, instrument, loop) into an existing track instead of keeping it as its own ---- */
let mergeArm = 0;
function bldMergeFill(){
  const sel = $("beMergeT"); if(!sel) return; const g = BLD.sel, cur = sel.value; sel.innerHTML = "";
  tracks.forEach((t, i)=>{ if(t === g) return; const o = document.createElement("option"); o.value = i; o.textContent = t.name; sel.appendChild(o); });
  if([...sel.options].some(o=>o.value === cur)) sel.value = cur; $("beMerge").disabled = !sel.options.length;
}
function bldMerge(){
  const g = BLD.sel, t = tracks[+$("beMergeT").value]; if(!g || !t || t === g) return;
  const btn = $("beMerge");
  if(performance.now() - mergeArm > 4000){ mergeArm = performance.now(); btn.textContent = (window.__T||(x=>x))(`In „${t.name}“ legen? Nochmal klicken`); setTimeout(()=>{ if(performance.now() - mergeArm >= 4000) btn.textContent = (window.__T||(x=>x))("⤵ In Spur legen"); }, 4100); return; }
  mergeArm = 0; btn.textContent = (window.__T||(x=>x))("⤵ In Spur legen");
  const was = playing; if(was) stop();
  const tb = t.buffer, sb = g.buffer, fs = tb.sampleRate, n = tb.length, gain = Math.min(4, (g.vol||1)/Math.max(0.05, t.vol||1));
  const out = ac().createBuffer(2, n, fs);
  for(let c=0;c<2;c++){ const d = out.getChannelData(c), a = tb.getChannelData(Math.min(c, tb.numberOfChannels-1)), s2 = sb.getChannelData(Math.min(c, sb.numberOfChannels-1)), m = Math.min(n, s2.length);
    d.set(a); for(let i=0;i<m;i++) d[i] += s2[i]*gain; }
  t.undoMerge = {orig: t.orig || t.buffer, dn: t.dn||0, trimA: t.trimA||0, trimB: t.trimB||0, shift: t.shift||0, merged: !!t.merged, gen: g, idx: tracks.indexOf(g)};
  t.orig = out; t.dnBuf = null; t.dn = 0; t.trimA = 0; t.trimB = 0; t.shift = 0; t.merged = true; t.mergeV = (t.mergeV||0) + 1;
  t.buffer = out; t.proc = null; t.Lst = undefined; t.dnV = (t.dnV||0) + 1; t.peaks = computePeaks(out, 400);
  bldEdit(null); removeTrack(g);
  if(P.tempo !== 1 || P.semis !== 0) applyTempo(true);
  if(was) play();
  setStatus(`„${g.name}“ liegt jetzt in „${t.name}“. Rückgängig: bei „${t.name}“ unter „Klang“ auf „Zusammenführen rückgängig“.`);
}
function unmerge(t){
  const u = t.undoMerge; if(!u) return; const was = playing; if(was) stop();
  t.orig = u.orig; t.dnBuf = null; t.dn = u.dn; t.trimA = u.trimA; t.trimB = u.trimB; t.shift = u.shift; t.merged = u.merged; t.mergeV = (t.mergeV||0) + 1; t.undoMerge = null;
  t.buffer = u.orig; tracks.splice(Math.max(0, Math.min(u.idx, tracks.length)), 0, u.gen);
  stemLufs = null; mixSpec = null; P.ver++; SEC.env = null; renderStrips(); syncSc(); updateUI(); drawSec();
  applyEdits(t, true); scheduleAnalysis(); saveSoon(); try{ bldInfo(); }catch(e){}
  if(was) play(); setStatus(`Zusammenführen rückgängig: „${u.gen.name}“ ist wieder eine eigene Spur.`);
}
// one-click mix variants on top of the current mix (undo with Ctrl+Z)
(function(){
  const am = document.querySelector(".automix"); if(!am) return;
  const box = document.createElement("div"); box.className = "mixvars";
  const V = [
    ["voxUp",  "🎤 Vocals lauter",   "Gesang 2 dB lauter"],
    ["voxDn",  "🎤 Vocals leiser",   "Gesang 2 dB leiser"],
    ["bass",   "🔊 Mehr Bass",       "Bass 2 dB und Kick 1 dB lauter, bei einem fertigen Song der Bass-Booster im Mastering"],
    ["punch",  "🥁 Mehr Punch",      "Drums 2 dB lauter"],
    ["radio",  "📻 Radio-Mix",       "Gesang vorne, Beat etwas zurück, weniger Hall: klingt wie im Radio"],
    ["wide",   "↔ Breiter",          "Instrumente weiter nach links und rechts verteilt, Mastering breiter"],
    ["clean",  "🧼 Clean (ohne Effekte)", "Hall, Echo und Sidechain aus"],
    ["warm",   "🔥 Wärmer",          "Mastering wärmer und weicher, weniger Höhen"],
    ["bright", "✨ Heller",           "Mastering heller und luftiger"]];
  box.innerHTML = '<span class="label">Schnell anpassen</span>' + V.map(([k, t, d])=>`<button type="button" data-mv="${k}" title="${d}">${t}</button>`).join("") + '<small class="tnote">Jeder Klick wirkt auf den aktuellen Mix. Rückgängig mit Strg+Z.</small>';
  const rows = am.querySelectorAll(".toolrow"); (rows.length ? rows[rows.length-1] : am.lastElementChild).after(box);
  const vox = r => r === "lead" || r === "bv", dr = r => ["drums","kick","snare","hat","perc"].includes(r);
  const vol = (t, db) => t.setVol(Math.max(0.05, Math.min(2, (t.vol || 1) * db2(db))));
  box.onclick = e => {
    const b = e.target.closest("button[data-mv]"); if(!b) return;
    if(!tracks.length) return setStatus("Erst einen Song oder Stems laden.");
    const k = b.dataset.mv, single = tracks.length === 1; let msg = "";
    if(single && ["voxUp","voxDn","punch","radio","clean"].includes(k)){
      return setStatus("Das braucht einzelne Stems. Bei einem fertigen Song (eine Spur) geht nur Mehr Bass, Breiter, Wärmer und Heller, das läuft über das Mastering."); }
    const hasVox = tracks.some(t=>vox(role(t.name)));
    if((k === "voxUp" || k === "voxDn" || k === "radio") && !hasVox) return setStatus("Keine Gesangs-Spur gefunden (der Name sollte z. B. „Vocals“ enthalten).");
    if(k === "voxUp"){ tracks.forEach(t=>{ if(vox(role(t.name))) vol(t, 2); }); msg = "Vocals 2 dB lauter."; }
    else if(k === "voxDn"){ tracks.forEach(t=>{ if(vox(role(t.name))) vol(t, -2); }); msg = "Vocals 2 dB leiser."; }
    else if(k === "punch"){ tracks.forEach(t=>{ if(dr(role(t.name))) vol(t, 2); }); msg = "Drums 2 dB lauter."; }
    else if(k === "bass"){
      if(single){ M.bass = Math.min(100, (M.bass||0) + 25); if(!M.on) setMasterOn(true); syncKnobs(); try{ syncBassLevel(); }catch(err){} msg = "Bass-Booster im Mastering hoch."; }
      else { tracks.forEach(t=>{ const r = role(t.name); if(r === "bass") vol(t, 2); else if(r === "kick") vol(t, 1); }); msg = "Bass 2 dB, Kick 1 dB lauter."; } }
    else if(k === "radio"){ tracks.forEach(t=>{ const r = role(t.name); if(vox(r)) vol(t, 1.5); else if(dr(r) || r === "bass") vol(t, -1); t.rev = Math.round((t.rev||0)*0.6); t.dly = Math.round((t.dly||0)*0.6); });
      msg = "Radio-Mix: Gesang vorne, Beat etwas zurück, weniger Hall und Echo."; }
    else if(k === "clean"){ tracks.forEach(t=>{ t.rev = 0; t.dly = 0; }); SC.amt = 0; try{ syncSc(); }catch(err){} msg = "Clean: Hall, Echo und Sidechain aus."; }
    else if(k === "wide"){
      if(!single) tracks.forEach(t=>{ const r = role(t.name); if(!vox(r) && !["bass","kick","snare"].includes(r) && t.pan) t.pan = Math.max(-100, Math.min(100, Math.round(t.pan*1.5))); });
      M.width = Math.min(140, (M.width||100) + 10); syncKnobs(); msg = "Breiter: Instrumente weiter verteilt, Mastering-Breite " + M.width + " %."; }
    else if(k === "warm" || k === "bright"){
      const d = k === "warm" ? 1 : -1; M.warm = Math.max(-3, Math.min(3, (M.warm||0) + 0.5*d)); M.air = Math.max(-3, Math.min(3, (M.air||0) - 0.5*d));
      if(!M.on) setMasterOn(true); syncKnobs(); msg = k === "warm" ? "Wärmer: mehr Wärme, weniger Höhen im Mastering." : "Heller: mehr Luft, weniger Wärme im Mastering."; }
    tracks.forEach(t=>t.refresh && t.refresh()); after(); applyMaster(); setStatus(msg + " Rückgängig mit Strg+Z.");
  };
})();

// colour pickers: a swatch, a hex field for people who have the code, and some ready colours
const COLX_SW = ["#ffffff","#000000","#f2a83b","#e8c47a","#e5484d","#ff8a3c","#ff5fa2","#a855f7","#4c8dff","#22e4ff","#3ddc84","#ffe14d"];
function colxInit(inp){
  if(!inp || inp.dataset.colx) return; inp.dataset.colx = "1";
  const wrap = document.createElement("div"); wrap.className = "colx"; const row = document.createElement("div"); row.className = "colrow";
  const hex = document.createElement("input"); hex.type = "text"; hex.className = "hex"; hex.maxLength = 7; hex.placeholder = "#RRGGBB"; hex.spellcheck = false; hex.setAttribute("aria-label", "Hex-Farbcode");
  const sw = document.createElement("div"); sw.className = "sw";
  COLX_SW.forEach(c=>{ const b = document.createElement("button"); b.type = "button"; b.style.background = c; b.title = c.toUpperCase(); b.setAttribute("aria-label", "Farbe " + c.toUpperCase());
    b.onclick = ()=>{ inp.value = c; hex.value = c.toUpperCase(); hex.classList.remove("bad"); inp.dispatchEvent(new Event("input", {bubbles: true})); inp.dispatchEvent(new Event("change", {bubbles: true})); }; sw.appendChild(b); });
  inp.before(wrap); row.append(inp, hex); wrap.append(row, sw);
  const show = ()=>{ if(document.activeElement !== hex) hex.value = (inp.value||"").toUpperCase(); };
  hex.addEventListener("input", ()=>{ let v = hex.value.trim(); if(v && v[0] !== "#") v = "#" + v;
    if(/^#[0-9a-f]{3}$/i.test(v)) v = "#" + v.slice(1).split("").map(x=>x+x).join("");
    const ok = /^#[0-9a-f]{6}$/i.test(v); hex.classList.toggle("bad", !ok && v.length >= 4);
    if(ok){ inp.value = v.toLowerCase(); inp.dispatchEvent(new Event("input", {bubbles: true})); inp.dispatchEvent(new Event("change", {bubbles: true})); } });
  hex.addEventListener("blur", show); inp.addEventListener("input", show); show(); inp.__colxShow = show;
}
document.querySelectorAll('input[type="color"]').forEach(colxInit);
setInterval(()=>document.querySelectorAll('input[data-colx]').forEach(i=>i.__colxShow && i.__colxShow()), 700);   // values set from code (loading a style) show up too
// the cover studio's text effects as a tidy grid
{ const r = $("cxOutline") && $("cxOutline").closest(".row"); if(r) r.classList.add("cxfxchecks"); }
// delete / remove / reset buttons in red, also the ones that appear later (tracks, packs, editors)
const RED_RE = /(Entfernen|Löschen|löschen|zurücksetzen|Zurücksetzen|leeren|🗑|Remove|Delete|Reset|Clear)/;
function redScan(root){ (root || document).querySelectorAll("button:not(.c-red):not(#newProj):not(.danger)").forEach(b=>{ if(RED_RE.test(b.textContent)) b.classList.add("c-red"); }); }
redScan(); { let t = 0; new MutationObserver(()=>{ clearTimeout(t); t = setTimeout(()=>redScan(), 150); }).observe(document.body, {childList: true, subtree: true}); }
// keys 1–5 (also on the number pad) jump to the step
document.addEventListener("keydown", e=>{
  if(e.ctrlKey || e.metaKey || e.altKey || e.repeat || TAP.on) return;
  const t = e.target, tag = (t && t.tagName) || "";
  if(/^(INPUT|TEXTAREA|SELECT)$/.test(tag) || (t && t.isContentEditable)) return;
  if(BLD.sel && BLD.sel.gen && !$("bnEdit").hidden) return;           // playing the instrument
  const m = /^(?:Digit|Numpad)([1-5])$/.exec(e.code); if(!m) return;
  if(document.querySelector("dialog[open]")) return;
  e.preventDefault(); goStep(+m[1], true);
});
// step 2: a small heading above the folded tools
(function(){
  const s = document.querySelector(".songbar"); if(!s) return;
  const h = document.createElement("div"); h.className = "toolhead"; h.dataset.step = "2"; h.innerHTML = "Werkzeuge <small>ein Klick öffnet sie</small>";
  ($("fxsec") || s).before(h); const w = document.querySelector(".wrap"); const i = COMPACT_ORDER.indexOf("#fxsec"); if(i >= 0 && !COMPACT_ORDER.includes(".toolhead")) COMPACT_ORDER.splice(i, 0, ".toolhead"); stepUi();
  // tools in their own order: effects, tempo, recording, build
})();
// step 4: Lyrics, Cover and Video as three cards; the rarely used video settings one level deeper
(function(){
  const vs = $("vidsec"); if(!vs) return;
  const grid = vs.querySelector(".vidgrid"), side = vs.querySelector(".vidside"), lyr = vs.querySelector(".lyr");
  let st = {}; try{ st = JSON.parse(localStorage.getItem("stemmixer:vcards") || "{}") || {}; }catch(e){}
  const mk = (id, label, cls) => { const c = document.createElement("div"); c.className = "vcard " + cls; c.id = id;
    c.innerHTML = `<button type="button" class="vchead" aria-expanded="true"><span class="vct">${label}</span><span class="vcok"></span><span class="vcs"></span><span class="vcp"></span></button><div class="vcb"></div>`;
    const h = c.querySelector(".vchead");
    const sync = () => { const cl = c.classList.contains("closed"); h.setAttribute("aria-expanded", !cl); c.querySelector(".vcp").textContent = T_(cl ? "▾ Aufklappen" : "▴ Zuklappen"); };
    h.onclick = () => { c.classList.toggle("closed"); st[id] = c.classList.contains("closed"); try{ localStorage.setItem("stemmixer:vcards", JSON.stringify(st)); }catch(e){} sync(); vcSum(); };
    if(st[id]) c.classList.add("closed"); c.__sync = sync; sync(); return c; };
  const cL = mk("vcLyr", "4a · Lyrics", "vc-lyr"), cC = mk("vcCov", "4b · Cover", "vc-cov"), cV = mk("vcVid", "4c · Video", "vc-vid");
  vs.querySelector(".mhead").after(cL, cC, cV);
  if(lyr) cL.querySelector(".vcb").append(lyr);
  const covKnob = $("vCoverBtn").closest(".knob");
  cC.querySelector(".vcb").append(covKnob, $("aiCoverBtn"), $("aiBox"));
  cV.querySelector(".vcb").append(grid);
  // "Mehr Einstellungen" inside the video card
  const more = document.createElement("details"); more.className = "vmore foldy"; more.id = "vMore";
  more.innerHTML = '<summary><b>Mehr Einstellungen</b><small>Hintergrund-Video · Titel &amp; Schrift</small></summary><div class="vmb"></div>';
  const mb = more.querySelector(".vmb"), vt = side.querySelector(".vtgrid"), tip = vt && vt.nextElementSibling;
  [$("vBgvBtn").closest(".knob"), vt, tip && tip.matches("small") ? tip : null].forEach(e=>{ if(e) mb.appendChild(e); });
  const mrow = $("vMake").closest(".row"); mrow.before(more); mrow.classList.add("vmakerow"); const br = side.querySelector(".brandrow"); if(br) mrow.appendChild(br);
  try{ if(localStorage.getItem("stemmixer:vmore") === "1") more.open = true; }catch(e){}
  more.addEventListener("toggle", ()=>{ try{ localStorage.setItem("stemmixer:vmore", more.open ? "1" : "0"); }catch(e){} });
  // anything that jumps into a folded card (cover prompt, cover studio, lyrics …) opens it first
  const orig = Element.prototype.scrollIntoView;
  Element.prototype.scrollIntoView = function(...a){
    if(this.closest){ const c = this.closest(".vcard.closed"); if(c) c.querySelector(".vchead").click();
      const d = this.closest("details.vmore:not([open])"); if(d && d !== this) d.open = true; }
    return orig.apply(this, a); };
})();
// clearly foldable boxes: cover prompt, own style, image filters
document.querySelectorAll("#cpBox, #vsb, #vMore, .cxfx, .ginfo, .pkmake, #genreMore").forEach(d=>{
  d.classList.add("foldy"); const sm = d.querySelector(":scope > summary"); if(!sm) return;
  const hint = sm.querySelector("small.tnote"); if(hint && d.id === "cpBox") hint.remove();
  const t = document.createElement("span"); t.className = "dtog"; sm.appendChild(t);
  const sync = () => { t.textContent = T_(d.open ? "▴ Zuklappen" : "▾ Aufklappen"); };
  d.addEventListener("toggle", sync); sync();
});
// one line on each folded panel / card: what is set in there
function vcSum(){
  const set = (id, txt, ok) => { const c = $(id); if(!c) return; c.querySelector(".vcs").textContent = T_(txt); const b = c.querySelector(".vcok"); b.textContent = ok == null ? "" : ok ? "✓" : T_("offen"); b.hidden = ok == null; b.classList.toggle("todo", ok === false); };
  const lines = ($("lText").value || "").split("\n").filter(l=>l.trim()).length;
  set("vcLyr", lines ? `${lines} Zeilen` : "Noch keine Lyrics: erkennen lassen oder einfügen", lines > 0);
  const hasCover = !$("vCoverClr").hidden;
  set("vcCov", hasCover ? "Cover-Bild gesetzt" : "Noch kein Bild · Cover-Prompt aus den Lyrics möglich", hasCover);
  const asp = document.querySelector("#vAspect button[aria-pressed='true']"), sty = document.querySelector("#vStyle button[aria-pressed='true']");
  set("vcVid", [asp && asp.textContent, sty && sty.textContent, $("vLyr").checked ? (window.__T||(y=>y))("Lyrics an") : (window.__T||(y=>y))("Lyrics aus")].filter(Boolean).join(" · "), null);
}
function collSum(){
  const S = (sel, txt) => { const e = document.querySelector(sel); if(e) e.dataset.sum = T_(txt); };
  try{
    S("#drop", tracks.length ? `${tracks.length} Spuren geladen` : "Noch nichts geladen");
    S(".songbar", song ? `${$("fBpm").textContent} BPM · ${$("fKey").textContent} · ${$("vRate").textContent}` : "Tempo und Tonart, Slowed + Reverb, Sped Up, Nightcore");
    S("#secBox", AB.a !== null && AB.b !== null ? `Ausschnitt ${fmtT(AB.a/rate)} – ${fmtT(AB.b/rate)}` : "Hook finden oder einen Teil für Clips setzen");
    S(".automix", AUTO_ON ? "Auto-Mix ist an" : "Ein Klick für einen sauberen Mix");
    S("#strips", tracks.length ? `${tracks.length} Spuren · ${tracks.filter(t=>t.on).length} an · ${tracks.slice(0,6).map(t=>t.name).join(", ")}${tracks.length>6?" …":""}` : "Noch keine Spuren");
    S("#fxsec", "Hall, Echo im Takt und Sidechain");
    S("#recsec", "Mikrofon über den Song aufnehmen, jede Aufnahme wird eine Spur");
    S("#buildsec", "Drums, Instrument oder Loop dazubauen");
    S("#master", M.on ? `An · ${M.target} LUFS` : "Aus · einschalten für Streaming-Lautstärke");
    S("#vidsec", "Lyrics, Cover und Video");
    S(".export", "Mix, Stems und Release-Paket speichern");
  }catch(e){}
  try{ vcSum(); }catch(e){}
}
setInterval(collSum, 2000); collSum();
document.querySelectorAll(".coll").forEach(el=>{ if(el.__sync) el.__sync(); });
$("beMerge").onclick = ()=>bldMerge();
// playback clock (with milliseconds) at the top right of the scrolling lyrics
{ const lv = $("lView"); if(lv){ const w = document.createElement("div"); w.className = "lvwrap"; lv.before(w); w.appendChild(lv); const c = document.createElement("span"); c.className = "lclock"; c.id = "lClock"; c.setAttribute("translate", "no"); c.setAttribute("aria-hidden", "true"); c.textContent = "0:00.000"; w.appendChild(c); } }
$("miniPlay").onclick = ()=>$("play").click();
$("miniSeek").oninput = e=>{ $("seek").value = e.target.value; $("seek").oninput({target: $("seek")}); miniSync(); };
$("miniAB").onclick = ()=>$("mAB").click();
$("miniTop").onclick = ()=>document.querySelector(".transport").scrollIntoView({behavior:"smooth", block:"center"});
$("seek").oninput = e=>{ const was = playing; stop(); offset = e.target.value/1000*duration; $("cur").textContent=fmtT(offset/rate); drawWaves(); miniSync(offset); if(was) play(); };
$("monVol").oninput = e=>{ MON.v = +e.target.value; MON.muted = false; monSync(); };
$("monMute").onclick = ()=>{ MON.muted = !MON.muted; monSync(); };
$("miniVol").oninput = e=>{ MON.v = +e.target.value; MON.muted = false; monSync(); };
$("miniMute").onclick = ()=>{ MON.muted = !MON.muted; monSync(); };
monSync();
document.addEventListener("keydown", e=>{ if(TAP.on) return; if(e.code==="Space" && tracks.length && !/INPUT|SELECT|TEXTAREA|BUTTON/.test(e.target.tagName)){ e.preventDefault(); $("play").click(); }});
addEventListener("resize", ()=>drawWaves());

