/* ===== v15.8 keyboard shortcuts + menu (keyboard button top left in the step bar) ===== */
(function(){
  const btn = $("kbBtn"); if(!btn) return;
  const T = x => (window.__T || (y=>y))(x);
  const hit = (id, step) => { const b = $(id); if(!b) return; if(step) goStep(step, true); if(b.disabled){ setStatus(T("Das geht erst, wenn Stems geladen sind.")); return; } b.click(); };
  const K = [
    ...STEPS.map(x=>[String(x.n), "s"+x.n, x.t, ()=>goStep(x.n, true)]),
    ["Leertaste", "play", "Abspielen / Pause", ()=>hit("play")],
    ["A", "auto", "Auto-Mix", ()=>hit("automix", 2)],
    ["M", "s3", "Mastering an / aus", ()=>hit("mOn")],
    ["B", "ab", "Vorher / Nachher hören", ()=>hit("mAB")],
    ["L", "s1", "Dateien laden", ()=>$("pick").click()],
    ["V", "s4", "Video erstellen", ()=>hit("vMake", 4)],
    ["E", "s5", "Exportieren", ()=>hit("export", 5)],
    ["Strg Z", "undo", "Rückgängig", ()=>histGo(-1)],
    ["Strg Y", "redo", "Wiederholen", ()=>histGo(1)],
    ["?", "kbd", "Dieses Menü", null]];
  const ic = { play:'<svg class="dic" viewBox="0 0 24 24" aria-hidden="true"><path d="M8 5.5v13l10.5-6.5z" fill="currentColor"/></svg>',
    auto:'<svg class="dic" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M13 3 5 13.5h6L10 21l8-10.5h-6z"/></svg>',
    ab:'<svg class="dic" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 8h13l-3-3M20 16H7l3 3"/></svg>',
    undo:'<svg class="dic" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 7 4 12l5 5"/><path d="M4 12h10a6 6 0 0 1 0 12"/></svg>',
    redo:'<svg class="dic" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m15 7 5 5-5 5"/><path d="M20 12H10a6 6 0 0 0 0 12"/></svg>' };
  const menu = document.createElement("div"); menu.id = "kbMenu"; menu.hidden = true; menu.setAttribute("role", "dialog"); menu.setAttribute("aria-label", T("Tastenkürzel"));
  menu.innerHTML = `<h3>${T("Tastenkürzel")}</h3><ul>` + K.map((k,i)=>`<li><button type="button" data-i="${i}">${DI[k[1]] || ic[k[1]] || ""}<span>${T(k[2])}</span><kbd>${T(k[0])}</kbd></button></li>`).join("") + `</ul><small>${T("Klick auf eine Zeile führt sie aus. Beim Tippen in Textfeldern sind die Tasten aus.")}</small>`;
  btn.parentNode.appendChild(menu);
  const open = v => { menu.hidden = !v; btn.setAttribute("aria-expanded", v); };
  btn.onclick = e => { e.stopPropagation(); open(menu.hidden); };
  menu.onclick = e => { e.stopPropagation(); const b = e.target.closest("button[data-i]"); if(!b) return; const f = K[+b.dataset.i][3]; open(false); if(f) f(); };
  document.addEventListener("click", ()=>open(false));
  document.addEventListener("keydown", e=>{
    if(e.key === "Escape" && !menu.hidden){ open(false); return; }
    if(e.ctrlKey || e.metaKey || e.altKey || e.repeat || (typeof TAP !== "undefined" && TAP.on)) return;
    const t = e.target, tag = (t && t.tagName) || "";
    if(/^(INPUT|TEXTAREA|SELECT)$/.test(tag) || (t && t.isContentEditable)) return;
    if(typeof BLD !== "undefined" && BLD.sel && BLD.sel.gen && !$("bnEdit").hidden) return;   // the letters play the instrument there
    if(document.querySelector("dialog[open]")) return;
    if(e.key === "?"){ e.preventDefault(); open(menu.hidden); return; }
    const k = K.find(x => x[0].length === 1 && /[A-Z]/.test(x[0]) && x[0] === e.key.toUpperCase());
    if(k){ e.preventDefault(); open(false); k[3](); }
  });
})();

