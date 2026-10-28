/* ===== v16 polish: MIDI stays off, links next to Pro, own icons instead of emojis, glowing feature buttons, Auto-Mix report folds, switch for slider / knob ===== */
(function(){
  const T = x => (window.__T || (y=>y))(x);
  const ico = d => `<svg class="dic" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${d}</svg>`;
  // DANVIEL icon set for everything that used an emoji
  const EI = {
    "🎚":'<path d="M6 3v18M12 3v18M18 3v18"/><rect x="3.5" y="13" width="5" height="3" rx="1" fill="currentColor"/><rect x="9.5" y="6" width="5" height="3" rx="1" fill="currentColor"/><rect x="15.5" y="15" width="5" height="3" rx="1" fill="currentColor"/>',
    "🎨":'<path d="M12 3a9 9 0 1 0 0 18c1.2 0 1.8-.8 1.8-1.7 0-1.3-1.1-1.6-1.1-2.7 0-1 .8-1.6 1.8-1.6H17a4 4 0 0 0 4-4C21 6.4 17 3 12 3z"/><circle cx="7.5" cy="11" r="1.2" fill="currentColor"/><circle cx="10" cy="7" r="1.2" fill="currentColor"/><circle cx="14.5" cy="7" r="1.2" fill="currentColor"/>',
    "💛":'<path d="M12 20s-7.5-4.6-9-9.2C2 7.6 4.2 5 7 5c2 0 3.6 1.2 5 3 1.4-1.8 3-3 5-3 2.8 0 5 2.6 4 5.8-1.5 4.6-9 9.2-9 9.2z" fill="currentColor"/>',
    "📦":'<path d="M3 7.5 12 3l9 4.5v9L12 21l-9-4.5z"/><path d="m3 7.5 9 4.5 9-4.5M12 12v9"/>',
    "🗑":'<path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13"/>',
    "📋":'<rect x="5" y="4" width="14" height="17" rx="2"/><path d="M9 4V3h6v1M8.5 10h7M8.5 14h7M8.5 18h4"/>',
    "↺":'<path d="M4 12a8 8 0 1 0 2.4-5.7"/><path d="M4 4v4h4"/>',
    "🔄":'<path d="M20 12a8 8 0 0 1-14 5.3M4 12a8 8 0 0 1 14-5.3"/><path d="M18 3v4h-4M6 21v-4h4"/>',
    "🎬":'<rect x="3" y="7" width="18" height="13" rx="2"/><path d="m3 7 3-4h3l-3 4M10 7l3-4h3l-3 4M17 7l3-4"/>',
    "⚙":'<circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3M4.9 4.9l2.1 2.1M17 17l2.1 2.1M4.9 19.1 7 17M17 7l2.1-2.1"/>',
    "🎹":'<rect x="3" y="5" width="18" height="14" rx="2"/><path d="M8 5v9M12 5v9M16 5v9M8 14v5M12 14v5M16 14v5"/>',
    "🔊":'<path d="M4 9h4l5-4v14l-5-4H4z"/><path d="M16.5 8.5a5 5 0 0 1 0 7M19 6a8.5 8.5 0 0 1 0 12"/>',
    "✍":'<path d="M4 20h4L19 9l-4-4L4 16z"/><path d="m13.5 6.5 4 4"/>',
    "🔤":'<path d="M4 18 8.5 6h1L14 18M5.7 14h6.6"/><path d="M15 18v-6.5a2.5 2.5 0 0 1 5 0V18M15 15h5"/>',
    "📂":'<path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v1H3z"/><path d="M3 10h18l-2 9H5z"/>',
    "💎":'<path d="M6 3h12l3 6-9 12L3 9z"/><path d="M3 9h18M9 3 7.5 9 12 21l4.5-12L15 3"/>',
    "☀":'<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M2 12h2M20 12h2M5 5l1.5 1.5M17.5 17.5 19 19M5 19l1.5-1.5M17.5 6.5 19 5"/>',
    "📷":'<path d="M4 8h3l2-3h6l2 3h3v11H4z"/><circle cx="12" cy="13" r="3.5"/>',
    "⭐":'<path d="m12 3 2.6 5.6 6.1.7-4.5 4.2 1.2 6L12 16.6 6.6 19.5l1.2-6-4.5-4.2 6.1-.7z"/>',
    "🐢":'<path d="M3 15c0-4 3.5-7 8-7s8 3 8 7z"/><path d="M19 13h2.5M6 15v3M15 15v3M8 8l2 3 2-3 2 3 2-3"/>',
    "⚡":'<path d="M13 3 5 13.5h6L10 21l8-10.5h-6z"/>',
    "🌙":'<path d="M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5z"/>',
    "🎮":'<path d="M6 8h12a4 4 0 0 1 4 4l-1 5a2.5 2.5 0 0 1-4.3 1.2L15 16H9l-1.7 2.2A2.5 2.5 0 0 1 3 17l-1-5a4 4 0 0 1 4-4z"/><path d="M7 11v3M5.5 12.5h3M16 12h.01M18 13.5h.01"/>',
    "🎧":'<path d="M4 15v-3a8 8 0 0 1 16 0v3"/><rect x="3" y="14" width="4" height="6" rx="1.5"/><rect x="17" y="14" width="4" height="6" rx="1.5"/>',
    "🎙":'<rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5 11a7 7 0 0 0 14 0M12 18v3"/>',
    "🎤":'<rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5 11a7 7 0 0 0 14 0M12 18v3"/>',
    "🧱":'<rect x="3" y="5" width="18" height="14" rx="1.5"/><path d="M3 12h18M9 5v7M15 12v7"/>',
    "🥁":'<ellipse cx="12" cy="9" rx="8" ry="3"/><path d="M4 9v6c0 1.7 3.6 3 8 3s8-1.3 8-3V9M5 4l5 4M19 4l-5 4"/>',
    "🔁":'<path d="M17 2l3 3-3 3"/><path d="M4 11V9a4 4 0 0 1 4-4h12M7 22l-3-3 3-3"/><path d="M20 13v2a4 4 0 0 1-4 4H4"/>',
    "📍":'<path d="M12 21s-6-6.2-6-11a6 6 0 0 1 12 0c0 4.8-6 11-6 11z"/><circle cx="12" cy="10" r="2.2"/>',
    "🖼":'<rect x="3" y="4" width="18" height="16" rx="2"/><circle cx="9" cy="10" r="1.8"/><path d="m4 18 5-5 4 4 3-3 4 4"/>',
    "✨":'<path d="M12 3v4M12 17v4M3 12h4M17 12h4M6 6l2.5 2.5M15.5 15.5 18 18M6 18l2.5-2.5M15.5 8.5 18 6"/>',
    "🔌":'<path d="M9 3v5M15 3v5M7 8h10v3a5 5 0 0 1-10 0z"/><path d="M12 16v5"/>',
    "✂":'<circle cx="6" cy="18" r="2.5"/><circle cx="6" cy="6" r="2.5"/><path d="m8 7.5 12 9M8 16.5l12-9"/>',
    "↶":'<path d="M9 6 4 11l5 5"/><path d="M4 11h11a5 5 0 0 1 0 10h-2"/>',
    "📻":'<rect x="3" y="8" width="18" height="12" rx="2"/><path d="m7 8 9-5"/><circle cx="15" cy="14" r="2.5"/><path d="M6 12h3M6 15h3"/>',
    "🔥":'<path d="M12 3c1 3 5 5 5 10a5 5 0 0 1-10 0c0-2 1-3.5 2-4.5.5 2 1.5 3 3 3-1-3 0-6 0-8.5z"/>',
    "🧼":'<path d="M12 3v4M12 17v4M3 12h4M17 12h4M6 6l2.5 2.5M15.5 15.5 18 18M6 18l2.5-2.5M15.5 8.5 18 6"/>',
    "🎵":'<path d="M9 18V5l11-2v13"/><circle cx="6.5" cy="18" r="2.5"/><circle cx="17.5" cy="16" r="2.5"/>',
    "🎶":'<path d="M9 18V5l11-2v13"/><circle cx="6.5" cy="18" r="2.5"/><circle cx="17.5" cy="16" r="2.5"/>',
    "🤖":'<rect x="5" y="8" width="14" height="11" rx="3"/><path d="M12 4v4M9 13h.01M15 13h.01M9.5 16h5"/>',
    "💾":'<path d="M5 3h11l3 3v15H5z"/><path d="M8 3v5h8V3M8 21v-7h8v7"/>',
    "📤":'<path d="M12 15V4M7.5 8.5 12 4l4.5 4.5"/><path d="M4 14v4.5A1.5 1.5 0 0 0 5.5 20h13a1.5 1.5 0 0 0 1.5-1.5V14"/>',
    "📥":'<path d="M12 4v11M7.5 10.5 12 15l4.5-4.5"/><path d="M4 14v4.5A1.5 1.5 0 0 0 5.5 20h13a1.5 1.5 0 0 0 1.5-1.5V14"/>',
    "🔍":'<circle cx="11" cy="11" r="6.5"/><path d="m16 16 5 5"/>',
    "🎯":'<circle cx="12" cy="12" r="8.5"/><circle cx="12" cy="12" r="4.5"/><circle cx="12" cy="12" r="1"/>',
    "📝":'<path d="M5 3h10l4 4v14H5z"/><path d="M8.5 11h7M8.5 15h7M8.5 7h3"/>',
    "🖌":'<path d="M18 3 9.5 11.5M9 12a3 3 0 0 0-3 3c0 2-2 3-3 3 3 2 7 1 8-1a3 3 0 0 0-2-5z"/>'
  };
  const RE = /^\s*([\p{Extended_Pictographic}←-⇿☀-➿])️?\s*/u;
  const KEEP = new Set(["✕", "☰", "✓", "↑", "←", "→", "✚", "✎", "▶", "◀", "↔", "⤢", "⤵", "↓"]);
  function iconize(el){
    if(!el || el.dataset.ei16 || el.closest('[translate="no"]')) return;
    if(el.tagName === "OPTION"){ const m = el.textContent.match(RE); if(m && !KEEP.has(m[1])){ el.textContent = el.textContent.replace(RE, ""); } el.dataset.ei16 = 1; return; }
    const tn = [...el.childNodes].find(n => n.nodeType === 3 && n.textContent.trim()); if(!tn) return;
    const m = tn.textContent.match(RE); if(!m || KEEP.has(m[1])) return;
    const d = EI[m[1]]; tn.textContent = tn.textContent.replace(RE, d ? "" : ""); el.dataset.ei16 = 1;
    if(d && !el.querySelector(":scope > .dic")) tn.before(document.createRange().createContextualFragment(ico(d)));
  }
  const SEL = 'button, a.ghbtn, summary, .mhead h2, .mhead h3, label.btn, .tabs button, option, .packsin';
  /* v16.3: every emoji anywhere (dialogs, help, changelog, notes, dynamic messages) becomes a DANVIEL icon; typographic arrows stay */
  const EMOALL = /([\p{Extended_Pictographic}])\uFE0F?/gu, EKEEP = new Set(["✕","☰","✓","↑","←","→","↓","✚","✎","▶","◀","↔","↕","↖","↗","↘","↙","⤢","⤵","↺","↶","↻","©","®","™","⏱"]);
  const SKIP = "script,style,textarea,input,select,canvas,svg,[translate=\"no\"],[contenteditable]";
  const hasEmo = t => { EMOALL.lastIndex = 0; let m; while((m = EMOALL.exec(t))) if(!EKEEP.has(m[1])) return true; return false; };
  function emoNode(n){
    const el = n.parentElement; if(!el || el.closest(SKIP)) return;
    if(el.tagName === "OPTION"){ el.textContent = el.textContent.replace(EMOALL, (a, e)=>EKEEP.has(e) ? a : "").replace(/^\s+/, ""); return; }
    const t = n.textContent; if(!hasEmo(t)) return;
    const f = document.createDocumentFragment(); let last = 0; EMOALL.lastIndex = 0; let m;
    while((m = EMOALL.exec(t))){ if(EKEEP.has(m[1])) continue; if(m.index > last) f.appendChild(document.createTextNode(t.slice(last, m.index)));
      const d = EI[m[1]]; if(d) f.appendChild(document.createRange().createContextualFragment(ico(d).replace('class="dic"', 'class="dic emo16"')));
      last = m.index + m[0].length; if(!d && t[last] === " ") last++; }
    if(last < t.length) f.appendChild(document.createTextNode(t.slice(last)));
    n.replaceWith(f);
  }
  function emoScan(root){ root = root || document.body; if(root.nodeType === 3){ emoNode(root); return; } if(root.nodeType !== 1 || root.closest && root.closest(SKIP)) return;
    const w = document.createTreeWalker(root, NodeFilter.SHOW_TEXT), list = []; let n; while((n = w.nextNode())) if(hasEmo(n.textContent)) list.push(n); list.forEach(emoNode);
    root.querySelectorAll && root.querySelectorAll("[title]").forEach(e=>{ const v = e.getAttribute("title"); if(hasEmo(v)) e.setAttribute("title", v.replace(EMOALL, (a, x)=>EKEEP.has(x) ? a : "").replace(/^\s+/, "").replace(/\s{2,}/g, " ")); }); }
  const scan = root => { (root || document).querySelectorAll(SEL).forEach(iconize); };
  let pend = 0, roots = new Set(); const later = muts => { (muts||[]).forEach(m=>{ if(m.type === "characterData") roots.add(m.target); else m.addedNodes.forEach(x=>roots.add(x)); });
    clearTimeout(pend); pend = setTimeout(()=>{ scan(); const r = [...roots]; roots = new Set(); r.forEach(x=>{ if(x.isConnected) emoScan(x); }); }, 40); };
  window.__afterI18n(()=>{ scan(); emoScan(document.body); new MutationObserver(later).observe(document.body, {childList: true, subtree: true, characterData: true}); });

  /* GitHub, changelog and Pro sit together at the top right */
  const head = document.querySelector("header"), pro = $("proBtn"), gh = document.querySelector("header a.ghbtn"), chg = $("chgBtn");
  if(head && pro){ const tl = document.createElement("div"); tl.className = "toplinks"; head.appendChild(tl);
    [chg, gh, pro].forEach(x => { if(x) tl.appendChild(x); }); }

  /* MIDI tracks stay off unless you switch them on yourself (quick select, all on, beat …) */
  $("presets").addEventListener("click", e => {
    const p = e.target.closest("[data-p]"); if(!p || !tracks.length) return;
    let ch = false; tracks.forEach(t => { if((t.isMidi || /\(MIDI\)\s*$/i.test(t.name)) && t.on && p.dataset.p !== "none" && !t.midiByHand){ t.on = false; ch = true; } });
    if(ch) updateUI();
  });
  $("strips").addEventListener("click", e => { const b = e.target.closest(".toggle"); if(!b) return; const st = b.closest(".strip"); const i = [...$("strips").querySelectorAll(":scope > .strip")].indexOf(st); const t = tracks[i]; if(t && (t.isMidi || /\(MIDI\)\s*$/i.test(t.name))) t.midiByHand = t.on; });

  /* Auto-Mix report: shows what was done, folds into one line after 10 s */
  const log = $("autolog");
  if(log){ let ft = 0; const fold = () => { if(log.hidden || !log.firstElementChild) return; log.classList.add("folded"); };
    const arm = () => { log.classList.remove("folded"); clearTimeout(ft); ft = setTimeout(fold, 10000);
      if(!log.querySelector(".alt")){ const b = document.createElement("button"); b.type = "button"; b.className = "alt"; b.textContent = T("Details"); b.onclick = () => { log.classList.toggle("folded"); clearTimeout(ft); }; log.appendChild(b); } };
    new MutationObserver(ms => { if(ms.some(m => [...m.addedNodes].some(n => !(n.classList && n.classList.contains("alt"))))) arm(); }).observe(log, {childList: true}); }

  /* slider or knob: one switch instead of two buttons */
  const ks = document.querySelector(".stripbar .kseg"), kS = $("kmSlide"), kK = $("kmKnob");
  if(ks && kS && kK){ const w = document.createElement("div"); w.className = "lyswitch kmswitch";
    w.innerHTML = `<span class="lk">${T("Schieber")}</span><button type="button" role="switch" aria-checked="false" aria-label="${T("Drehknöpfe")}" title="${T("Regler als Schieber oder als Drehknöpfe wie am Mischpult")}"></button><span class="lf">${T("Drehknöpfe")}</span>`;
    ks.after(w); const b = w.querySelector("button");
    const sync = () => { const k = kK.getAttribute("aria-pressed") === "true"; b.setAttribute("aria-checked", k); w.querySelector(".lk").classList.toggle("on", !k); w.querySelector(".lf").classList.toggle("on", k); };
    b.onclick = () => { (b.getAttribute("aria-checked") === "true" ? kS : kK).click(); sync(); };
    new MutationObserver(sync).observe(kK, {attributes: true, attributeFilter: ["aria-pressed"]}); sync(); }
})();

