/* v16.5: move and resize visualizer + lyrics in full-screen mode (drag in the preview, gold corner = size) */
(()=>{ const cv = $("vPrev"); let drag = null;
  const toW = e => { const r = cv.getBoundingClientRect(), [W, H] = ASPECTS[VID.aspect]; return {x: (e.clientX - r.left)/r.width*W, y: (e.clientY - r.top)/r.height*H, W, H}; };
  const inB = (b, p, pad) => b && p.x >= b.x0 - pad && p.x <= b.x1 + pad && p.y >= b.y0 - pad && p.y <= b.y1 + pad;
  const corner = (b, p) => b && Math.abs(p.x - b.x1) < 46 && Math.abs(p.y - b.y1) < 46;
  const hit = p => { if(corner(VID.lastTbox, p)) return {k:"title", b: VID.lastTbox, mode:"size"};
    for(const [k, b] of [["lyr", VID.lastLbox], ["viz", VID.lastVbox], ["cover", VID.lastCbox]]){ if(!b) continue; if(corner(b, p)) return {k, b, mode:"size"}; if(inB(b, p, 0)) return {k, b, mode:"move"}; } return null; };
  cv.addEventListener("pointerenter", ()=>{ VID.prevHover = true; if(!playing) drawPreview(false); });
  cv.addEventListener("pointerleave", ()=>{ VID.prevHover = false; if(!playing) drawPreview(false); });
  cv.addEventListener("pointerdown", e=>{ const p = toW(e), tb = VID.lastTbox; const h = hit(p); if(!h) return;
    if(h.mode === "move" && tb && p.x >= tb.x0 && p.x <= tb.x1 && p.y >= tb.y0 && p.y <= tb.y1) return;   // the title has priority
    e.stopImmediatePropagation(); e.preventDefault(); cv.setPointerCapture(e.pointerId); drag = startDrag(h, p); }, true);
  function startDrag(h, p){
    const b = h.b, B = VID.boxes || (VID.boxes = {}), asp = p.W > p.H ? "w" : p.W === p.H ? "s" : "v", ck = "cover_" + asp, vk = "viz_" + asp, lk = "lyr_" + asp;
    if(h.k === "title") return {...h, p0: p, v0: {size: VID.tp.size || 100, asize: VID.tp.asize || 0, w: b.x1 - b.x0}};
    if(h.k === "cover"){ const m = Math.min(p.W, p.H); if(!B[ck]) B[ck] = {x: b.x0/p.W, y: b.y0/p.H, s: (b.x1-b.x0)/m}; return {...h, ck, p0: p, v0: {...B[ck]}}; }
    if(h.k === "viz" && !B[vk]) B[vk] = {x: b.x0/p.W, y: b.y0/p.H, w: (b.x1-b.x0)/p.W, h: (b.y1-b.y0)/p.H};
    if(h.k === "lyr" && !B[lk]) B[lk] = {x: (b.x0+b.x1)/2/p.W, y: (b.y0 + (b.y1-b.y0)/3.2)/p.H, s: 1};
    const key = h.k === "viz" ? vk : lk; return {...h, key, p0: p, v0: JSON.parse(JSON.stringify(B[key]))}; }
  cv.addEventListener("pointermove", e=>{ const p = toW(e);
    if(!drag){ const h = hit(p); if(h){ cv.style.cursor = h.mode === "size" ? "nwse-resize" : "move"; e.stopImmediatePropagation(); } return; }
    e.stopImmediatePropagation(); applyDrag(drag, p); }, true);
  function applyDrag(drag, p, noSnap){ const sn = noSnap ? (v => ({v, on: false})) : snapC; const dx = (p.x - drag.p0.x)/p.W, dy = (p.y - drag.p0.y)/p.H, v = drag.v0, B = VID.boxes, c = (x, a, b) => Math.max(a, Math.min(b, x));
    if(drag.k === "title"){ const f = c((v.w + (p.x - drag.p0.x) + (p.y - drag.p0.y))/v.w, 0.3, 4); VID.tp.size = Math.round(c(v.size*f, 40, 250)); if(v.asize) VID.tp.asize = Math.round(c(v.asize*f, 40, 250)); try{ vtSync(); }catch(err){} drawPreview(playing); return; }
    if(drag.k === "cover"){ const m = Math.min(p.W, p.H);
      if(drag.mode === "move") B[drag.ck] = {...v, x: v.x + dx, y: v.y + dy}; else B[drag.ck] = {...v, s: c(v.s + Math.max(p.x - drag.p0.x, p.y - drag.p0.y)/m, 0.15, 1)};
      const Lo = layout(p.W, p.H); let cl = coverClamp({x: B[drag.ck].x*p.W, y: B[drag.ck].y*p.H, s: B[drag.ck].s*m}, p.W, p.H, Lo);
      if(drag.mode === "move"){ const sx = sn(cl.x + cl.s/2, p.W/2), sy = sn(cl.y + cl.s/2, p.H/2); cl = coverClamp({x: sx.v - cl.s/2, y: sy.v - cl.s/2, s: cl.s}, p.W, p.H, Lo); VID.snapG = {v: sx.on && Math.abs(cl.x + cl.s/2 - p.W/2) < 1, h: sy.on && Math.abs(cl.y + cl.s/2 - p.H/2) < 1}; }
      B[drag.ck] = {x: cl.x/p.W, y: cl.y/p.H, s: cl.s/m}; drawPreview(playing); return; }
    VID.snapG = null;
    const K = drag.key;
    if(drag.k === "viz"){ if(drag.mode === "move"){ let x = c(v.x + dx, -0.05, 1 - v.w*0.3), y = c(v.y + dy, 0.02, 0.95); const sx = sn((x + v.w/2)*p.W, p.W/2), sy = sn((y + v.h/2)*p.H, p.H/2); x = sx.v/p.W - v.w/2; y = sy.v/p.H - v.h/2; VID.snapG = {v: sx.on, h: sy.on}; B[K] = {...v, x, y}; } else B[K] = {...v, w: c(v.w + dx, 0.12, 1.1), h: c(v.h + dy, 0.03, 0.6)}; }
    else { if(drag.mode === "move"){ const sx = sn(c(v.x + dx, 0.08, 0.92)*p.W, p.W/2), sy = sn(c(v.y + dy, 0.06, 0.95)*p.H, p.H/2); VID.snapG = {v: sx.on, h: sy.on}; B[K] = {...v, x: sx.v/p.W, y: sy.v/p.H}; } else B[K] = {...v, s: c(v.s*(1 + (dx + dy)*2.2), 0.45, 2.4)}; }
    drawPreview(playing); }
  const end = e=>{ if(!drag) return; e.stopImmediatePropagation(); drag = null; VID.snapG = null; drawPreview(playing); saveSoon(); };
  cv.addEventListener("pointerup", end, true); cv.addEventListener("pointercancel", end, true);
  /* v17: keyboard. Focus the preview (Tab), N = next element, arrows = move (Shift = bigger steps), + / - = size */
  const KB = [["cover","Cover",()=>VID.lastCbox],["title","Titel",()=>VID.lastTbox],["lyr","Lyrics",()=>VID.lastLbox],["viz","Visualizer",()=>VID.lastVbox]];
  let kbI = 0; const live = document.createElement("div"); live.className = "sr-only"; live.setAttribute("aria-live", "polite"); cv.after(live);
  cv.tabIndex = 0; cv.setAttribute("role", "application"); cv.setAttribute("aria-roledescription", "Video-Vorschau");
  cv.setAttribute("aria-label", "Video-Vorschau. N wählt das nächste Element, Pfeiltasten verschieben es, Plus und Minus ändern die Größe.");
  const kbList = () => KB.filter(x => x[2]());
  const EN = () => window.I18N_LANG === "en", nm = c => EN() && c[1] === "Titel" ? "Title" : c[1];
  const say = t => { live.textContent = ""; setTimeout(()=>{ live.textContent = t; }, 30); };
  const kbCur = () => { const l = kbList(); if(!l.length) return null; kbI = ((kbI % l.length) + l.length) % l.length; return l[kbI]; };
  cv.addEventListener("focus", ()=>{ VID.prevHover = true; if(!playing) drawPreview(false); const c = kbCur(); if(c) say(nm(c) + (EN() ? " selected" : " gewählt")); });
  cv.addEventListener("blur", ()=>{ VID.prevHover = false; VID.kbSel = null; if(!playing) drawPreview(false); });
  cv.addEventListener("keydown", e=>{
    const k = e.key, l = kbList(); if(!l.length) return;
    if(k === "n" || k === "N"){ kbI += e.shiftKey ? -1 : 1; const c = kbCur(); VID.kbSel = c[0]; say(nm(c) + (EN() ? " selected" : " gewählt")); drawPreview(playing); e.preventDefault(); e.stopPropagation(); return; }
    if(k === "Escape"){ cv.blur(); e.stopPropagation(); return; }
    const mv = {ArrowLeft:[-1,0], ArrowRight:[1,0], ArrowUp:[0,-1], ArrowDown:[0,1]}[k], sz = (k === "+" || k === "=") ? 1 : (k === "-" || k === "_") ? -1 : 0;
    if(!mv && !sz) return;
    e.preventDefault(); e.stopPropagation();
    const c = kbCur(), b = c[2](), [W, H] = ASPECTS[VID.aspect], st = e.shiftKey ? 0.05 : 0.01; VID.kbSel = c[0];
    if(c[0] === "title" && mv){ say(EN() ? "The title can only be made bigger or smaller, with plus and minus" : "Den Titel kannst du nur größer oder kleiner machen, mit Plus und Minus"); return; }
    const p0 = c[0] === "title" || sz ? {x: b.x1, y: b.y1, W, H} : {x: (b.x0+b.x1)/2, y: (b.y0+b.y1)/2, W, H};
    const d = startDrag({k: c[0], b, mode: sz ? "size" : "move"}, p0);
    const p = sz ? {x: p0.x + sz*st*W, y: p0.y + sz*st*H, W, H} : {x: p0.x + mv[0]*st*W, y: p0.y + mv[1]*st*H, W, H};
    applyDrag(d, p, true); VID.snapG = null; saveSoon();
    say(nm(c) + (EN() ? (sz ? (sz > 0 ? " bigger" : " smaller") : " moved") : (sz ? (sz > 0 ? " größer" : " kleiner") : " verschoben")));
  });
  $("vFreeReset").onclick = ()=>{ VID.boxes = {}; previewSoon(); saveSoon(); };
  $("vCovReset").onclick = ()=>{ VID.boxes = {}; previewSoon(); saveSoon(); };
})();
const _vFullUi = vFullUi; vFullUi = function(){ _vFullUi(); const r = $("vFreeRow"); if(r) r.hidden = true; };
vFullUi(); try{ new MutationObserver(()=>vFullUi()).observe($("vCoverClr"), {attributes:true, attributeFilter:["hidden"]}); }catch(e){}

window.__vid = () => VID;
/* the plate always shows the major version from CREDIT (v16 -> v17 automatically) */
try{ const mv = (CREDIT.match(/v(\d+)/) || [])[1]; const by = document.querySelector(".brand .by"); if(mv && by) by.textContent = "Studio · v" + mv;
  const fb = document.querySelector("footer .credit b"); if(fb) fb.textContent = CREDIT.replace(/^DANVIEL Studio /, ""); }catch(e){}

