/* ===================== v16: dark studio, tidy header, project bar, wide step bar, icons, hover info, steel monitor =====================
   Only the look and the place of things change. Every button keeps its id and its handler. */
(function(){
  const T = x => (window.__T || (y=>y))(x);
  const ico = d => `<svg class="dic" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${d}</svg>`;
  const IC = {
    balance:'<path d="M12 4v16M6 20h12M4 8h16"/><path d="m4 8-2.5 6a3 3 0 0 0 5 0zM20 8l-2.5 6a3 3 0 0 0 5 0z"/>',
    pan:'<path d="M8 7 3 12l5 5M16 7l5 5-5 5M3 12h18"/>',
    eq:'<path d="M3 16c3 0 3-8 6-8s3 10 6 10 3-6 6-6"/>',
    dyn:'<path d="M12 3v6M9 6l3 3 3-3M12 21v-6M9 18l3-3 3 3M4 12h16"/>',
    reset:'<path d="M4 12a8 8 0 1 0 2.4-5.7"/><path d="M4 4v4h4"/>',
    packs:'<path d="M3 7.5 12 3l9 4.5v9L12 21l-9-4.5z"/><path d="m3 7.5 9 4.5 9-4.5M12 12v9"/>',
    voxUp:'<rect x="5" y="3" width="6" height="10" rx="3"/><path d="M3 11a5 5 0 0 0 10 0M8 16v4"/><path d="M19 15V7M16 10l3-3 3 3"/>',
    voxDn:'<rect x="5" y="3" width="6" height="10" rx="3"/><path d="M3 11a5 5 0 0 0 10 0M8 16v4"/><path d="M19 7v8M16 12l3 3 3-3"/>',
    bass:'<rect x="5" y="3" width="14" height="18" rx="3"/><circle cx="12" cy="14" r="3.5"/><circle cx="12" cy="7" r="1"/>',
    punch:'<path d="m12 2 2.2 6.3L21 9l-5 4.4L17.5 21 12 17.2 6.5 21 8 13.4 3 9l6.8-.7z"/>',
    radio:'<rect x="3" y="8" width="18" height="12" rx="2"/><path d="m7 8 9-5"/><circle cx="15" cy="14" r="2.5"/><path d="M6 12h3M6 15h3"/>',
    wide:'<path d="M7 8 3 12l4 4M17 8l4 4-4 4"/><path d="M10 6v12M14 6v12"/>',
    clean:'<path d="M12 3v4M12 17v4M3 12h4M17 12h4M6 6l2.5 2.5M15.5 15.5 18 18M6 18l2.5-2.5M15.5 8.5 18 6"/>',
    warm:'<path d="M12 3c1 3 5 5 5 10a5 5 0 0 1-10 0c0-2 1-3.5 2-4.5.5 2 1.5 3 3 3-1-3 0-6 0-8.5z"/>',
    bright:'<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M2 12h2M20 12h2M5 5l1.5 1.5M17.5 17.5 19 19M5 19l1.5-1.5M17.5 6.5 19 5"/>',
    undo:'<path d="M9 6 4 11l5 5"/><path d="M4 11h11a5 5 0 0 1 0 10h-2"/>',
    redo:'<path d="m15 6 5 5-5 5"/><path d="M20 11H9a5 5 0 0 0 0 10h2"/>',
    help:'<circle cx="12" cy="12" r="9"/><path d="M9.5 9.5a2.5 2.5 0 1 1 3.5 2.3c-.6.3-1 .9-1 1.6v.6M12 17h.01"/>',
    save:'<path d="M5 3h11l3 3v15H5z"/><path d="M8 3v5h8V3M8 21v-7h8v7"/>',
    open:'<path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v1H3z"/><path d="M3 10h18l-2 9H5z"/>',
    bolt:'<path d="M13 3 5 13.5h6L10 21l8-10.5h-6z" fill="currentColor"/>',
    expand:'<path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7"/>'
  };
  const EMO = /^\s*(?:[\p{Extended_Pictographic}↔↕↖-↙⇄✨️‍]\s*)+/u;
  // put an icon in front of a button and drop the emoji from its text (after the translation layer ran)
  const addIc = (el, k) => { if(!el || !IC[k] || el.querySelector(":scope > .dic")) return;
    const tn = [...el.childNodes].find(n => n.nodeType === 3 && n.textContent.trim()); if(tn) tn.textContent = tn.textContent.replace(EMO, "");
    el.insertAdjacentHTML("afterbegin", ico(IC[k])); };

  /* ---- step bar: own icons were set in v15.8, the layout buttons become a switch in the header ---- */
  const hist = document.querySelector("header .hist");
  const sw = document.createElement("div"); sw.className = "lyswitch";
  sw.innerHTML = `<span class="lk">${T("Kompakt")}</span><button type="button" role="switch" aria-checked="false" aria-label="${T("Alles offen")}" title="${T("Kompakt: ein Schritt nach dem anderen. Alles offen: alle Bereiche untereinander.")}"></button><span class="lf">${T("Alles offen")}</span>`;
  if(hist) hist.appendChild(sw);
  const swB = sw.querySelector("button");
  const swSync = () => { const full = $("lyFull").getAttribute("aria-pressed") === "true"; swB.setAttribute("aria-checked", full); sw.querySelector(".lk").classList.toggle("on", !full); sw.querySelector(".lf").classList.toggle("on", full); };
  swB.onclick = () => { const full = swB.getAttribute("aria-checked") === "true"; $(full ? "lyCompact" : "lyFull").click(); swSync(); };
  new MutationObserver(swSync).observe($("lyFull"), {attributes: true, attributeFilter: ["aria-pressed"]}); swSync();

  /* ---- header: undo / redo as arrows, help in blue ---- */
  const arrow = (id, k, label) => { const b = $(id); if(!b) return; b.innerHTML = ico(IC[k]) + `<span class="vh">${T(label)}</span>`; b.title = T(label) + (id === "undo" ? " (Strg+Z)" : " (Strg+Y)"); b.setAttribute("aria-label", T(label)); };
  arrow("undo", "undo", "Rückgängig"); arrow("redo", "redo", "Wiederholen");

  /* ---- project bar at the bottom of the folder: save, open, delete ---- */
  const wrap = document.querySelector(".wrap");
  const pb = document.createElement("div"); pb.className = "projbar"; pb.setAttribute("role", "group"); pb.setAttribute("aria-label", T("Projekt"));
  pb.innerHTML = `<span class="lab">${T("Projekt")}</span><button type="button" id="pbSave" title="${T("Alle Spuren, Einstellungen, Cover und Cover-Entwürfe, Logo, Lyrics, Hintergrund-Video und deine fertigen Videos in einer ZIP-Datei")}">${ico(IC.save)}${T("Speichern")}</button><button type="button" id="pbOpen" title="${T("Ein gespeichertes Projekt (ZIP) wieder öffnen")}">${ico(IC.open)}${T("Öffnen")}</button>`;
  const np = $("newProj"); if(np) pb.appendChild(np);
  const art = $("artistBox"); if(art) art.before(pb); else wrap.appendChild(pb);
  { const i = COMPACT_ORDER.indexOf("#artistBox"); if(i >= 0 && !COMPACT_ORDER.includes(".projbar")) COMPACT_ORDER.splice(i, 0, ".projbar"); }
  const pz = $("projZip"), pbS = $("pbSave");
  const pbSync = () => { pbS.disabled = !!pz.disabled; }; pbSync();
  new MutationObserver(pbSync).observe(pz, {attributes: true, attributeFilter: ["disabled"]});
  pbS.onclick = () => pz.click(); $("pbOpen").onclick = () => $("projLoad").click();

  /* ---- Auto-Mix row and quick tweaks in one even grid, each with its own icon ---- */
  const ab = $("autobal"), row = ab && ab.parentElement;
  if(row){ row.classList.add("autorow"); const pk = row.querySelector(".packsin"), rs = $("resetvol"); if(pk && rs) rs.before(pk); }
  window.__afterI18n(()=>{
    addIc($("autobal"), "balance"); addIc($("autopan"), "pan"); addIc($("autoeq"), "eq"); addIc($("autodyn"), "dyn"); addIc($("resetvol"), "reset");
    document.querySelectorAll(".packsin").forEach(b => addIc(b, "packs"));
    document.querySelectorAll(".mixvars button[data-mv]").forEach(b => addIc(b, b.dataset.mv));
    addIc($("helpBtn"), "help");
    const am = $("automix"); if(am && !am.querySelector(".dic")) am.insertAdjacentHTML("afterbegin", ico(IC.bolt));
  }, 0);

  /* ---- hover info: the title text shows in a small card right away (mouse only) ---- */
  if(matchMedia("(hover: hover) and (pointer: fine)").matches){
    const tip = document.createElement("div"); tip.id = "tip16"; tip.setAttribute("role", "tooltip"); document.body.appendChild(tip);
    let cur = null, tmr = 0;
    const hide = () => { clearTimeout(tmr); tip.classList.remove("show"); if(cur){ if(!cur.hasAttribute("title") && cur.dataset.tip16) cur.setAttribute("title", cur.dataset.tip16); delete cur.dataset.tip16; cur = null; } };
    document.addEventListener("mouseover", e => {
      const el = e.target.closest && e.target.closest("[title]"); if(!el || el === cur) return;
      if(!el.closest(".wrap, #monitor, header")) return;
      hide(); const txt = el.getAttribute("title"); if(!txt || txt.length < 3) return;
      cur = el; el.dataset.tip16 = txt; el.removeAttribute("title");
      tmr = setTimeout(()=>{ if(cur !== el) return; tip.textContent = txt; const r = el.getBoundingClientRect();
        tip.style.left = "0px"; tip.style.top = "0px"; tip.classList.add("show");
        const w = tip.offsetWidth, h = tip.offsetHeight; let x = Math.min(innerWidth - w - 10, Math.max(10, r.left + r.width/2 - w/2)); let y = r.bottom + 8; if(y + h > innerHeight - 8) y = r.top - h - 8;
        tip.style.left = x + "px"; tip.style.top = y + "px"; }, 380);
    }, true);
    document.addEventListener("mouseout", e => { if(cur && (!e.relatedTarget || !cur.contains(e.relatedTarget))) hide(); }, true);
    addEventListener("scroll", hide, {passive: true}); document.addEventListener("pointerdown", hide, true);
  }

  /* ---- the monitor ---- */
  const mon = document.createElement("aside"); mon.id = "monitor"; mon.setAttribute("aria-label", T("Monitor"));
  mon.innerHTML = `<div class="mtray"><div class="mfloor">
    <div class="mhd"><svg width="24" height="24" viewBox="0 0 100 100" aria-hidden="true"><path d="M22 20H48A30 30 0 0 1 48 80H22Z" fill="#23272e"/><polygon points="32,70 46,32 60,70" fill="#d4911f"/></svg><b>MONITOR</b><small>${T("fährt beim Scrollen mit")}</small></div>
    <div class="mglass mvid"><div class="mscreen"><canvas id="monCv" aria-label="${T("Video-Vorschau")}"></canvas></div>
      <div class="mvbar"><button type="button" data-a="w">16:9</button><button type="button" data-a="v">9:16</button><button type="button" data-a="s">1:1</button><button type="button" class="mbig" title="${T("Zum Video-Bereich: Lyrics, Cover und Video erstellen")}">${ico(IC.expand)} ${T("Zum Video")}</button></div></div>
    <div class="mslot"></div>
    <div class="msel"></div>
    <div class="mprog"><i></i><i></i><i></i><i></i><i></i><b></b></div>
  </div></div>`;
  wrap.after(mon);
  const MON = { on: false, sel: -1, last: 0, lastOff: -1 };
  const tp = document.querySelector(".transport"), tpHome = document.createComment("transport"); tp.before(tpHome);
  const place = () => {
    const want = matchMedia("(min-width: 1280px)").matches;
    if(want === MON.on) return; MON.on = want; document.body.classList.toggle("has-mon", want);
    if(want){ tp.dataset.step16 = tp.dataset.step || ""; delete tp.dataset.step; tp.classList.remove("st-on"); mon.querySelector(".mslot").appendChild(tp); }
    else { tpHome.after(tp); if(tp.dataset.step16) tp.dataset.step = tp.dataset.step16; stepUi(); }
    try{ window.dispatchEvent(new Event("resize")); }catch(e){}
    monDraw(false); selUi();
  };
  // video preview in the monitor: the same picture as the export, live while the song plays
  const cv = $("monCv");
  function monDraw(live){
    if(!MON.on || !cv) return;
    try{
      const [W, H] = ASPECTS[VID.aspect] || ASPECTS.w, box = cv.parentElement, bw = box.clientWidth - 8, bh = box.clientHeight - 8; if(bw < 20) return;
      const s = Math.min(bw/W, bh/H), dpr = Math.min(2, devicePixelRatio || 1), cw = Math.round(W*s*dpr), ch = Math.round(H*s*dpr);
      if(cv.width !== cw || cv.height !== ch){ cv.width = cw; cv.height = ch; cv.style.width = Math.round(W*s) + "px"; cv.style.height = Math.round(H*s) + "px"; }
      const g = cv.getContext("2d"); g.setTransform(cw/W, 0, 0, ch/H, 0, 0);
      const sec = $("onlyAB").checked && AB.a!==null && AB.b!==null, off = sec ? AB.a/rate : 0;
      const dur = sec ? (AB.b-AB.a)/rate : (duration ? duration/rate : 60), now = (live ? currentTime() : offset)/rate;
      const t = Math.max(0, Math.min(dur, now - off)), lb = live ? liveBands() : null;
      const S = vidState(dur, null, 30); S.dur = dur; if(lb) S.bandsAt = () => lb;
      drawFrame(g, W, H, t, S);
    }catch(e){}
    mon.querySelectorAll(".mvbar button[data-a]").forEach(b => b.setAttribute("aria-pressed", b.dataset.a === VID.aspect));
  }
  const dp0 = drawPreview; drawPreview = function(live){ dp0(live); if(!live) monDraw(false); };
  setInterval(()=>{ if(!MON.on) return; if(playing){ monDraw(true); MON.lastOff = -1; } else if(offset !== MON.lastOff){ MON.lastOff = offset; monDraw(false); } }, 45);
  mon.querySelectorAll(".mvbar button[data-a]").forEach(b => b.onclick = () => { const src = [...document.querySelectorAll("#vAspect button")].find(x => x.dataset.v === b.dataset.a); if(src) src.click(); setTimeout(()=>monDraw(false), 60); });
  // "To the video": open step 4, unfold the video panel and its video card, and land exactly on it
  mon.querySelector(".mbig").onclick = () => { goStep(4, false); const v = $("vidsec"); if(!v) return;
    if(v.classList.contains("collapsed")){ const t = v.querySelector(":scope > .ctog"); if(t) t.click(); }
    const card = $("vcVid"); if(card && card.classList.contains("closed")){ const h = card.querySelector(".vchead"); if(h) h.click(); }
    const tgt = card || v; setTimeout(()=>{ const bar = document.querySelector(".stepbar"), off = (bar ? bar.offsetHeight : 0) + 16;
      scrollTo({top: tgt.getBoundingClientRect().top + scrollY - off, behavior: "smooth"}); tgt.classList.add("pulse"); setTimeout(()=>tgt.classList.remove("pulse"), 4200); }, 120); };
  addEventListener("resize", ()=>{ place(); monDraw(false); });

  /* "Angeklickt": the track you last touched, with its most used controls */
  const sel = mon.querySelector(".msel");
  const HALL = [0, 20, 45, 75];
  const fire = el => { el.dispatchEvent(new Event("input", {bubbles: true})); el.dispatchEvent(new Event("change", {bubbles: true})); };
  function selUi(){
    if(!MON.on) return;
    if(!tracks.length){ sel.innerHTML = `<div class="mlab"><span>${T("Angeklickt")}</span></div><div class="mempty">${T("Klick auf eine Spur, dann stehen hier ihre wichtigsten Regler.")}</div>`; return; }
    if(MON.sel < 0 || MON.sel >= tracks.length){ const v = tracks.findIndex(t => /vocal|vox|gesang|lead/i.test(t.name)); MON.sel = v >= 0 ? v : 0; }
    const i = MON.sel, t = tracks[i], vol = $("vol" + i), rev = $("rev" + i), dn = $("dn" + i);
    if(!vol){ sel.innerHTML = ""; return; }
    const rv = rev ? +rev.value : 0, hk = HALL.reduce((b, v, k) => Math.abs(v - rv) < Math.abs(HALL[b] - rv) ? k : b, 0);
    const db = vol.closest(".strip") && vol.closest(".strip").querySelector(".vdb");
    sel.innerHTML = `<div class="mlab"><span>${T("Angeklickt")}</span><span>${T("Spur")} ${i+1} / ${tracks.length}</span></div>
      <div class="mname"><i style="background:${stemColor(t)}"></i><span translate="no"></span></div>
      <label class="mrw"><span>${T("Lautstärke")}</span><input type="range" min="0" max="200" value="${vol.value}" data-k="vol"><b class="mdb">${db ? db.textContent : ""}</b></label>
      <div class="mrw"><span>${T("Hall")}</span><div class="seg4" style="grid-column:2 / -1">${["Aus","Wenig","Mittel","Viel"].map((n, k)=>`<button type="button" data-h="${k}" aria-pressed="${k === hk}">${T(n)}</button>`).join("")}</div></div>
      <div class="mrw"><span>${T("Rauschen")}</span><button type="button" class="msw" role="switch" aria-checked="${dn && +dn.value > 0}" aria-label="${T("Rauschen entfernen")}"></button><button type="button" class="mall">${T("Alle Regler")} ›</button></div>`;
    sel.querySelector(".mname span").textContent = t.name;
    sel.querySelector('[data-k="vol"]').oninput = e => { vol.value = e.target.value; fire(vol); const d = vol.closest(".strip").querySelector(".vdb"); if(d) sel.querySelector(".mdb").textContent = d.textContent; };
    sel.querySelectorAll("[data-h]").forEach(b => b.onclick = () => { if(!rev) return; rev.value = HALL[+b.dataset.h]; fire(rev); selUi(); });
    sel.querySelector(".msw").onclick = () => { if(!dn) return; dn.value = +dn.value > 0 ? 0 : 50; fire(dn); selUi(); };
    sel.querySelector(".mall").onclick = () => { const st = vol.closest(".strip"); if(!st) return; goStep(2, false); const m = st.querySelector(".more"); if(m && m.getAttribute("aria-expanded") !== "true") m.click(); st.scrollIntoView({behavior: "smooth", block: "center"}); };
  }
  const strips = $("strips");
  strips.addEventListener("pointerdown", e => { const st = e.target.closest(".strip"); if(!st) return; const i = [...strips.querySelectorAll(":scope > .strip")].indexOf(st); if(i >= 0 && i !== MON.sel){ MON.sel = i; selUi(); } });
  strips.addEventListener("input", e => { if(e.target.closest(".msel")) return; clearTimeout(MON.st); MON.st = setTimeout(selUi, 120); });
  new MutationObserver(() => { clearTimeout(MON.st); MON.st = setTimeout(selUi, 60); }).observe(strips, {childList: true});

  /* small progress line at the bottom of the tray */
  const progUi = () => { if(!MON.on) return; const dots = mon.querySelectorAll(".mprog i");
    document.querySelectorAll(".stepbar .stp").forEach((b, k) => { if(dots[k]) dots[k].className = b.classList.contains("on") ? "c" : b.classList.contains("done") ? "d" : ""; });
    const on = document.querySelector(".stepbar .stp.on"); mon.querySelector(".mprog b").textContent = on ? `${T("Schritt")} ${on.dataset.n} ${T("von")} 5 · ${on.querySelector("span") ? on.querySelector("span").textContent.replace(" ✓", "") : ""}` : ""; };
  new MutationObserver(progUi).observe(document.querySelector(".stepbar"), {subtree: true, attributes: true, attributeFilter: ["class"]});
  place(); progUi(); selUi();
  // waveforms of the tracks are drawn again whenever the track list becomes visible or changes size (they stayed empty after a step change)
  try{ new ResizeObserver(()=>drawWaves()).observe($("strips")); }catch(e){}
})();

