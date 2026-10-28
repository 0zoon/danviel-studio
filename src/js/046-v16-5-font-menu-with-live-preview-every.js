/* v16.5: font menu with live preview. Every row shows your title in that font, hover shows it big on the cover (or in the video), a click takes it. Groups and favourites. */
const FONT_GROUPS = [
  ["Rap & Trap", ["narrow","bebas","anton","oswald","archivo","teko","staatliches","sixcaps","bowlby","blackops","gothic","pirata","grenze","sedgwick","spray","wetpaint","distressed","saira","wallpoet","dela","metalmania","newrocker"]],
  ["Elegant", ["serif","playfair","cinzel","abril","cormorant","bodoni","italiana","marcellus","tenor","alfaslab","shrikhand","rye"]],
  ["Handschrift", ["marker","caveat","pacifico","dancing","lobster","greatvibes","satisfy","allura","sacramento","homemade","rocksalt","kaushan","yellowtail","vibur","typewriter"]],
  ["Retro & Neon", ["monoton","glitch","bungee","bungeeshade","bungeeinline","pixel","silkscreen","righteous","bangers","audiowide","codystar","faster","majormono","orbitron","rampart","tiltwarp","bagel","creepster","nosifer"]],
  ["Klar & modern", ["clean","unbounded","montserrat","syne","michroma","russo","krona","fredoka","boogaloo"]]];
let FAVF = []; try{ FAVF = JSON.parse(localStorage.getItem("stemmixer:favFonts") || "[]") || []; }catch(e){}
const favSave = () => { try{ localStorage.setItem("stemmixer:favFonts", JSON.stringify(FAVF)); }catch(e){} };
function fontPicker(sel, opt){
  if(!sel || sel.dataset.fp) return; sel.dataset.fp = 1;
  const T = x => (window.__T||(y=>y))(x);
  const wrap = document.createElement("div"); wrap.className = "fpk"; sel.after(wrap); sel.classList.add("fpk-native");
  const btn = document.createElement("button"); btn.type = "button"; btn.className = "fpkbtn"; wrap.appendChild(btn);
  const pop = document.createElement("div"); pop.className = "fpkpop"; pop.hidden = true; wrap.appendChild(pop);
  const label = v => { const o = [...sel.options].find(o=>o.value === v); return o ? o.textContent : v; };
  const sync = () => { const v = sel.value, f = CXF[v]; btn.innerHTML = ""; const s = document.createElement("span"); s.className = "fpkcur"; s.textContent = label(v); if(f){ s.style.fontFamily = f.fam; s.style.font = `${f.w} 15px ${f.fam}`; } btn.appendChild(s); const c = document.createElement("i"); c.className = "fpkchev"; c.textContent = "▾"; btn.appendChild(c); };
  let hovering = null, keep = null;
  const row = (v, sample) => { const f = CXF[v]; const r = document.createElement("div"); r.className = "fpkrow" + (sel.value === v ? " on" : ""); r.dataset.v = v; r.setAttribute("role", "option");
    const p = document.createElement("span"); p.className = "fpkp"; p.textContent = f && f.up ? sample.toUpperCase() : sample; if(f){ p.style.fontFamily = f.fam; p.style.font = `${f.w} ${f.big ? 26 : 22}px ${f.fam}`; }
    const n = document.createElement("small"); n.className = "fpkn"; n.textContent = label(v);
    const st = document.createElement("button"); st.type = "button"; st.className = "fpkstar" + (FAVF.includes(v) ? " fav" : ""); st.textContent = FAVF.includes(v) ? "★" : "☆"; st.title = T("Als Lieblingsschrift merken");
    st.onclick = e=>{ e.stopPropagation(); const i = FAVF.indexOf(v); if(i >= 0) FAVF.splice(i, 1); else FAVF.unshift(v); favSave(); build(); };
    if(v === "auto" || v === "style"){ st.hidden = true; }
    r.append(p, n, st);
    r.onmouseenter = () => { hovering = v; opt.preview(v); };
    r.onclick = () => { if(hovering !== null){ hovering = null; opt.preview(null); } sel.value = v; sel.dispatchEvent(new Event("change", {bubbles:true})); close(); };
    return r; };
  const build = () => { pop.innerHTML = ""; const sample = (opt.text() || "Kapitel vorbei").slice(0, 26);
    const top = document.createElement("div"); top.className = "fpktop"; const q = document.createElement("input"); q.type = "search"; q.placeholder = T("Schrift suchen …"); q.className = "fpkq"; top.appendChild(q); pop.appendChild(top);
    const list = document.createElement("div"); list.className = "fpklist"; pop.appendChild(list);
    const head = t => { const h = document.createElement("div"); h.className = "fpkh"; h.textContent = T(t); list.appendChild(h); };
    const firsts = [...sel.options].map(o=>o.value).filter(v=>!CXF[v]); firsts.forEach(v=>list.appendChild(row(v, sample)));
    const favs = FAVF.filter(v=>CXF[v] && [...sel.options].some(o=>o.value === v)); if(favs.length){ head("★ Favoriten"); favs.forEach(v=>list.appendChild(row(v, sample))); }
    const seen = new Set(); FONT_GROUPS.forEach(([g, keys])=>{ const ks = keys.filter(k=>CXF[k] && [...sel.options].some(o=>o.value === k)); if(!ks.length) return; head(g); ks.forEach(k=>{ seen.add(k); list.appendChild(row(k, sample)); }); });
    const rest = [...sel.options].map(o=>o.value).filter(v=>CXF[v] && !seen.has(v)); if(rest.length){ head("Weitere"); rest.forEach(v=>list.appendChild(row(v, sample))); }
    q.oninput = () => { const s = q.value.trim().toLowerCase(); list.querySelectorAll(".fpkrow").forEach(r=>{ r.hidden = !!s && !label(r.dataset.v).toLowerCase().includes(s); }); list.querySelectorAll(".fpkh").forEach(h=>{ h.hidden = !!s; }); };
    pop.onmouseleave = () => { if(hovering !== null){ hovering = null; opt.preview(null); } };
    setTimeout(()=>{ const on = list.querySelector(".fpkrow.on"); if(on) on.scrollIntoView({block:"center"}); q.focus({preventScroll:true}); }, 0); };
  const open = () => { build(); pop.hidden = false; wrap.classList.add("open"); setTimeout(()=>document.addEventListener("pointerdown", outside, true), 0); };
  const close = () => { pop.hidden = true; wrap.classList.remove("open"); document.removeEventListener("pointerdown", outside, true); if(hovering !== null){ hovering = null; opt.preview(null); } sync(); };
  const outside = e => { if(!wrap.contains(e.target)) close(); };
  btn.onclick = () => pop.hidden ? open() : close();
  pop.addEventListener("keydown", e=>{ if(e.key === "Escape"){ e.stopPropagation(); close(); btn.focus(); } });
  sel.addEventListener("change", sync); new MutationObserver(sync).observe(sel, {childList:true}); sync();
  return {sync};
}
window.__afterI18n(()=>{
  // cover studio: hover = font on the cover right away
  fontPicker($("cxFont"), { text: () => $("cpTitle").value || $("vTitle").value || $("fname").value,
    preview: k => { if(k === null){ if(CX.__keep !== undefined){ CX.font = CX.__keep; delete CX.__keep; } } else { if(CX.__keep === undefined) CX.__keep = CX.font; CX.font = k; try{ document.fonts.load(cxFontSpec(cxFontKey())).then(cxRedraw); }catch(e){} } cxRedraw(); } });
  // video title font
  setTimeout(()=>fontPicker($("vTFont"), { text: () => $("vTitle").value || $("fname").value,
    preview: k => { if(k === null){ if(VID.tp.__keep !== undefined){ VID.tp.font = VID.tp.__keep; delete VID.tp.__keep; } } else { if(VID.tp.__keep === undefined) VID.tp.__keep = VID.tp.font; VID.tp.font = k; const f = CXF[k]; try{ f && document.fonts.load(`${f.w} 60px ${f.fam}`).then(()=>previewSoon()); }catch(e){} } previewSoon(); } }), 50);
});

/* snapping: near the exact middle of the frame things jump to it, a gold guide shows it */
const SNAP_PX = 30;
function snapC(c, mid, len){ return Math.abs(c - mid) < SNAP_PX ? {v: mid, on: true} : {v: c, on: false}; }
