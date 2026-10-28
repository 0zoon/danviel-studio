/* ===== v16.1 monitor: richer player (mix waveform, transport keys), four designs, building blocks you can hide and drag ===== */
(function(){
  const mon = $("monitor"); if(!mon) return;
  const T = x => (window.__T || (y=>y))(x);
  const ico = d => `<svg class="dic" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${d}</svg>`;
  const floor = mon.querySelector(".mfloor"), slot = mon.querySelector(".mslot"), sel = mon.querySelector(".msel"), prog = mon.querySelector(".mprog");
  const store = (k, v) => { try{ localStorage.setItem("stemmixer:mon:" + k, JSON.stringify(v)); }catch(e){} };
  const load = (k, d) => { try{ const v = JSON.parse(localStorage.getItem("stemmixer:mon:" + k)); return v == null ? d : v; }catch(e){ return d; } };

  /* design + building blocks menu in the header */
  const SKINS = [["steel", "Edelstahl"], ["chrome", "Chrom"], ["glass", "Schwarzes Glas"], ["leather", "Leder"]];
  const hd = mon.querySelector(".mhd");
  const gear = document.createElement("button"); gear.type = "button"; gear.className = "mgear"; gear.setAttribute("aria-expanded", "false");
  gear.title = T("Design und Bausteine vom Monitor"); gear.setAttribute("aria-label", gear.title);
  gear.innerHTML = ico('<circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3M4.9 4.9l2.1 2.1M17 17l2.1 2.1M4.9 19.1 7 17M17 7l2.1-2.1"/>');
  hd.querySelector("small").after(gear);
  const menu = document.createElement("div"); menu.className = "mmenu"; menu.hidden = true; hd.after(menu);
  const setSkin = s => { mon.dataset.skin = s; store("skin", s); menu.querySelectorAll("[data-skin]").forEach(b => b.setAttribute("aria-pressed", b.dataset.skin === s)); };
  gear.onclick = () => { menu.hidden = !menu.hidden; gear.setAttribute("aria-expanded", !menu.hidden); };

  /* building blocks: video and player stay, the rest can be hidden and dragged */
  const MODS = [["sel", "Angeklickt"], ["lanes", "Spuren-Übersicht"], ["viz", "Visualizer"], ["quick", "Schnellwahl"]];
  const box = document.createElement("div"); box.className = "mmods"; slot.after(box);
  const mods = {};
  const handle = ico('<path d="M9 6h.01M15 6h.01M9 12h.01M15 12h.01M9 18h.01M15 18h.01" stroke-width="3"/>');
  MODS.forEach(([k, name]) => { const m = document.createElement("section"); m.className = "mmod"; m.dataset.m = k;
    m.innerHTML = `<div class="mmh"><button type="button" class="mdrag" aria-label="${T("Baustein verschieben")}" title="${T("Ziehen zum Verschieben")}">${handle}</button><span>${T(name)}</span><button type="button" class="mhide" aria-label="${T("Ausblenden")}" title="${T("Ausblenden, im Zahnrad-Menü wieder einschalten")}">${ico('<path d="M5 12h14"/>')}</button></div><div class="mmb"></div>`;
    mods[k] = m; });
  mods.sel.querySelector(".mmb").appendChild(sel);
  mods.lanes.querySelector(".mmb").innerHTML = '<div class="mlanes"></div>';
  mods.viz.querySelector(".mmb").innerHTML = '<canvas class="mvz" height="110"></canvas>';
  let order = load("order", ["sel", "lanes", "viz", "quick"]).filter(k => mods[k]); MODS.forEach(([k]) => { if(!order.includes(k)) order.push(k); });
  const hidden = new Set(load("hidden", []));
  const layout = () => { order.forEach(k => { box.appendChild(mods[k]); mods[k].hidden = hidden.has(k); }); store("order", order); store("hidden", [...hidden]); menuUi(); };
  function menuUi(){
    menu.innerHTML = `<div class="mml">${T("Design")}</div><div class="mmrow">${SKINS.map(([k, n]) => `<button type="button" data-skin="${k}" aria-pressed="${mon.dataset.skin === k}">${T(n)}</button>`).join("")}</div>
      <div class="mml">${T("Bausteine")} <small>${T("Video und Player bleiben immer drin")}</small></div><div class="mmrow">${MODS.map(([k, n]) => `<label><input type="checkbox" data-mod="${k}" ${hidden.has(k) ? "" : "checked"}> ${T(n)}</label>`).join("")}</div>`;
    menu.querySelectorAll("[data-skin]").forEach(b => b.onclick = () => setSkin(b.dataset.skin));
    menu.querySelectorAll("[data-mod]").forEach(c => c.onchange = () => { if(c.checked) hidden.delete(c.dataset.mod); else hidden.add(c.dataset.mod); layout(); });
  }
  box.addEventListener("click", e => { const h = e.target.closest(".mhide"); if(!h) return; hidden.add(h.closest(".mmod").dataset.m); layout(); });
  // drag to reorder (mouse, pen and touch)
  box.addEventListener("pointerdown", e => {
    const hnd = e.target.closest(".mdrag"); if(!hnd) return; e.preventDefault();
    const m = hnd.closest(".mmod"); m.classList.add("dragging");
    const move = ev => { const others = [...box.querySelectorAll(".mmod:not([hidden]):not(.dragging)")];
      const after = others.find(o => { const r = o.getBoundingClientRect(); return ev.clientY < r.top + r.height/2; });
      if(after) box.insertBefore(m, after); else box.appendChild(m); };
    const up = () => { m.classList.remove("dragging"); removeEventListener("pointermove", move); removeEventListener("pointerup", up); removeEventListener("pointercancel", up);
      order = [...box.querySelectorAll(".mmod")].map(x => x.dataset.m); layout(); };
    addEventListener("pointermove", move); addEventListener("pointerup", up); addEventListener("pointercancel", up);   // on the window: moving the block in the page ends a pointer capture
  });
  setSkin(load("skin", "steel")); layout();

  /* quick select moves into its block while the monitor is shown */
  const pre = $("presets"), tp = document.querySelector(".transport");
  const placePre = () => { if(document.body.classList.contains("has-mon")) mods.quick.querySelector(".mmb").appendChild(pre); else if(pre.parentElement !== tp) tp.appendChild(pre); };
  new MutationObserver(placePre).observe(document.body, {attributes: true, attributeFilter: ["class"]}); placePre();

  /* player: mix waveform to click and seek, keys for start, play, loop, before/after */
  const pl = document.createElement("div"); pl.className = "mplayer";
  pl.innerHTML = `<div class="mwave"><canvas></canvas><span class="mt0">0:00</span><span class="mt1"></span></div>
    <div class="mkeys"><button type="button" data-k="start" title="${T("Zum Anfang")}" aria-label="${T("Zum Anfang")}">${ico('<path d="M6 5v14M19 5 9 12l10 7z" fill="currentColor"/>')}</button>
    <button type="button" data-k="loop" title="${T("Ausschnitt in Schleife (erst einen Ausschnitt setzen)")}" aria-label="Loop">${ico('<path d="M17 2l3 3-3 3"/><path d="M4 11V9a4 4 0 0 1 4-4h12M7 22l-3-3 3-3"/><path d="M20 13v2a4 4 0 0 1-4 4H4"/>')}</button>
    <button type="button" data-k="ab" title="${T("Vorher / Nachher hören (Taste B)")}">A/B</button>
    <button type="button" data-k="mute" title="${T("Stumm")}" aria-label="${T("Stumm")}">${ico('<path d="M4 9h4l5-4v14l-5-4H4z"/><path d="m17 9 4 6M21 9l-4 6"/>')}</button></div>`;
  const wcv = pl.querySelector("canvas");
  const placePl = () => { if(document.body.classList.contains("has-mon")){ const seek = $("seek"); if(seek && pl.parentElement !== tp) seek.before(pl); } else if(pl.parentElement) pl.remove(); };
  new MutationObserver(placePl).observe(document.body, {attributes: true, attributeFilter: ["class"]}); placePl();
  pl.querySelector('[data-k="start"]').onclick = () => { const s = $("seek"); if(!s || s.disabled) return; s.value = 0; s.dispatchEvent(new Event("input", {bubbles: true})); };
  pl.querySelector('[data-k="loop"]').onclick = () => { const l = $("loopOn"); if(!l) return; if(AB.a === null || AB.b === null){ setStatus(T("Erst einen Ausschnitt setzen (Schritt 4, Hook finden), dann läuft er in Schleife.")); return; } l.checked = !l.checked; l.dispatchEvent(new Event("change", {bubbles: true})); keysUi(); };
  pl.querySelector('[data-k="ab"]').onclick = () => { const b = $("mAB"); if(b) b.click(); setTimeout(keysUi, 50); };
  pl.querySelector('[data-k="mute"]').onclick = () => { const b = $("monMute"); if(b) b.click(); setTimeout(keysUi, 50); };
  function keysUi(){ const l = $("loopOn"), ab = $("mAB"), mu = $("monMute");
    pl.querySelector('[data-k="loop"]').setAttribute("aria-pressed", !!(l && l.checked));
    pl.querySelector('[data-k="ab"]').setAttribute("aria-pressed", !!(ab && ab.getAttribute("aria-pressed") === "true"));
    pl.querySelector('[data-k="mute"]').setAttribute("aria-pressed", !!(mu && mu.getAttribute("aria-pressed") === "true")); }
  // the whole mix as one waveform (sum of the tracks you hear)
  let mixPk = null, mixKey = "";
  const mixPeaks = () => { const key = tracks.map(t => (t.on ? 1 : 0) + ":" + (t.solo ? 1 : 0) + ":" + (t.peaks ? t.peaks.length : 0) + ":" + (t.vol || 1).toFixed(2)).join("|") + duration;
    if(key === mixKey && mixPk) return mixPk; mixKey = key; const N = 220, out = new Float32Array(N);
    tracks.forEach(t => { if(!t.peaks || !audible(t)) return; const frac = duration ? buf(t).duration/duration : 1, n = t.peaks.length;
      for(let k = 0; k < n; k++){ const x = Math.floor(k/n*frac*N); if(x < N) out[x] = Math.max(out[x], t.peaks[k] * Math.min(1.4, t.vol || 1)); } });
    let mx = 0; out.forEach(v => { if(v > mx) mx = v; }); if(mx > 0) for(let i = 0; i < N; i++) out[i] /= mx; return mixPk = out; };
  const sk = () => mon.dataset.skin === "glass" || mon.dataset.skin === "leather";
  function drawWave(){
    if(!pl.isConnected) return; const w = wcv.clientWidth, h = wcv.clientHeight; if(!w) return; const dpr = Math.min(2, devicePixelRatio || 1);
    if(wcv.width !== Math.round(w*dpr)){ wcv.width = Math.round(w*dpr); wcv.height = Math.round(h*dpr); }
    const g = wcv.getContext("2d"); g.setTransform(dpr, 0, 0, dpr, 0, 0); g.clearRect(0, 0, w, h);
    const pos = duration ? currentTime()/duration : 0;
    if(tracks.length){ const pk = mixPeaks(), N = pk.length, bw = w/N;
      if(AB.a !== null && AB.b !== null && duration){ g.fillStyle = "rgba(232,169,58,.16)"; g.fillRect(AB.a/duration*w, 0, (AB.b-AB.a)/duration*w, h); }
      for(let i = 0; i < N; i++){ const x = i*bw, ph = Math.max(1.5, pk[i]*(h-6)); g.fillStyle = x/w < pos ? "#e8a93a" : (sk() ? "rgba(243,239,230,.38)" : "rgba(29,32,38,.32)"); g.fillRect(x + .4, (h-ph)/2, Math.max(1, bw - 1), ph); }
      g.fillStyle = sk() ? "#fff" : "#1d2026"; g.fillRect(pos*w - 1, 0, 2, h); }
    pl.querySelector(".mt1").textContent = fmtT(duration ? duration/rate : 0);
    pl.querySelector(".mt0").textContent = fmtT(currentTime()/rate);
  }
  wcv.addEventListener("pointerdown", e => { const s = $("seek"); if(!s || s.disabled) return; const r = wcv.getBoundingClientRect(); s.value = Math.round(Math.max(0, Math.min(1, (e.clientX - r.left)/r.width)) * 1000); s.dispatchEvent(new Event("input", {bubbles: true})); });

  /* track overview: each stem as a small lane, click selects it for "Selected" */
  const lanes = mods.lanes.querySelector(".mlanes");
  let laneKey = "";
  function lanesUi(){
    if(hidden.has("lanes") || !document.body.classList.contains("has-mon")) return;
    const key = tracks.map(t => t.name + (t.peaks ? t.peaks.length : 0)).join("|");
    if(key !== laneKey){ laneKey = key; lanes.innerHTML = tracks.length ? tracks.map((t, i) => `<button type="button" class="mlane" data-i="${i}"><span class="mln"></span><canvas></canvas></button>`).join("") : `<div class="mempty">${T("Lade Stems, dann siehst du hier jede Spur.")}</div>`;
      lanes.querySelectorAll(".mlane").forEach((b, i) => { b.querySelector(".mln").textContent = tracks[i].name; b.style.setProperty("--lc", stemColor(tracks[i]));
        b.onclick = () => { const st = $("strips").querySelectorAll(":scope > .strip")[i]; if(st) st.dispatchEvent(new PointerEvent("pointerdown", {bubbles: true})); }; }); }
    const pos = duration ? currentTime()/duration : 0;
    lanes.querySelectorAll(".mlane").forEach((b, i) => { const t = tracks[i]; if(!t) return; const cv = b.querySelector("canvas"), w = cv.clientWidth, h = cv.clientHeight; if(!w) return;
      const dpr = Math.min(2, devicePixelRatio || 1); if(cv.width !== Math.round(w*dpr)){ cv.width = Math.round(w*dpr); cv.height = Math.round(h*dpr); }
      const g = cv.getContext("2d"); g.setTransform(dpr, 0, 0, dpr, 0, 0); g.clearRect(0, 0, w, h); const on = audible(t);
      if(t.peaks){ const n = t.peaks.length, frac = duration ? buf(t).duration/duration : 1, step = Math.max(1, Math.floor(n/140));
        g.fillStyle = stemColor(t); g.globalAlpha = on ? .9 : .25;
        for(let k = 0; k < n; k += step){ const x = k/n*frac*w, ph = Math.max(1, t.peaks[k]*(h-2)); g.fillRect(x, (h-ph)/2, Math.max(1, w/140*frac - .5), ph); } g.globalAlpha = 1; }
      g.fillStyle = sk() ? "#fff" : "#1d2026"; g.fillRect(pos*w, 0, 1.5, h);
      const cn = sel.querySelector(".mname span"); b.classList.toggle("off", !on); b.classList.toggle("cur", !!cn && cn.textContent === t.name); });
  }

  /* big visualizer block: live bands of what you hear */
  const vz = mods.viz.querySelector("canvas"), VB = new Float32Array(32);
  function vizUi(){
    if(hidden.has("viz") || !document.body.classList.contains("has-mon")) return;
    const w = vz.clientWidth, h = vz.clientHeight; if(!w) return; const dpr = Math.min(2, devicePixelRatio || 1);
    if(vz.width !== Math.round(w*dpr)){ vz.width = Math.round(w*dpr); vz.height = Math.round(h*dpr); }
    const g = vz.getContext("2d"); g.setTransform(dpr, 0, 0, dpr, 0, 0); g.clearRect(0, 0, w, h);
    const lb = playing ? liveBands() : null, n = VB.length;
    for(let i = 0; i < n; i++){ const v = lb ? lb[Math.floor(i/n*lb.length)] : 0; VB[i] = Math.max(v, VB[i]*0.9); }
    const bw = w/n, gr = g.createLinearGradient(0, h, 0, 0); gr.addColorStop(0, "#d4911f"); gr.addColorStop(1, "#ffe3a1");
    g.fillStyle = gr;
    for(let i = 0; i < n; i++){ const bh = Math.max(2, VB[i]*(h/2 - 4)); g.fillRect(i*bw + 2, h/2 - bh, bw - 4, bh); g.globalAlpha = .35; g.fillRect(i*bw + 2, h/2, bw - 4, bh*.8); g.globalAlpha = 1; }
  }
  let tick = 0;
  setInterval(() => { if(!document.body.classList.contains("has-mon")) return; tick++;
    if(playing || tick % 6 === 0){ drawWave(); lanesUi(); } vizUi(); if(tick % 10 === 0) keysUi(); }, 50);
})();

/* delete project: also bottom right in the monitor, and always asked in a window first */
(function(){
  const T = x => (window.__T || (y=>y))(x), np = $("newProj"); if(!np) return;
  const dlg = document.createElement("dialog"); dlg.id = "delAsk"; dlg.setAttribute("aria-labelledby", "delAskT");
  dlg.innerHTML = `<h2 id="delAskT">${T("Projekt wirklich löschen?")}</h2><p>${T("Alle Spuren, Einstellungen, Lyrics und das Cover dieses Projekts werden aus dem Browser entfernt. Das lässt sich nicht rückgängig machen. Tipp: vorher „Speichern“, dann hast du eine ZIP-Sicherung.")}</p><div class="row"><button type="button" id="delNo">${T("Abbrechen")}</button><button type="button" id="delYes">${T("Ja, löschen")}</button></div>`;
  document.body.appendChild(dlg);
  let go = false;
  const ask = () => { try{ dlg.showModal(); }catch(e){ dlg.setAttribute("open", ""); } setTimeout(()=>$("delNo").focus(), 30); };
  $("delNo").onclick = () => dlg.close();
  $("delYes").onclick = () => { dlg.close(); go = true; np.classList.add("armed"); np.click(); };
  // the old double-click stays as a fallback, but the window comes first
  document.addEventListener("click", e => { if(!e.target.closest || !e.target.closest("#newProj")) return; if(go){ go = false; return; } e.stopPropagation(); e.preventDefault(); ask(); }, true);
  const mp = document.querySelector("#monitor .mprog");
  if(mp){ const b = document.createElement("button"); b.type = "button"; b.className = "mdel"; b.title = T("Alles leeren und ein neues Projekt starten (fragt vorher nach)");
    b.innerHTML = '<svg class="dic" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13"/></svg>' + T("Projekt löschen"); b.onclick = ask; mp.appendChild(b); }
})();

