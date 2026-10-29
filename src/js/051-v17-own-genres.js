/* ===================== v17: own Auto-Mix genres =====================
   An own genre is pure data, like the built-in ones (levels per stem group, vocal effects, dynamics, sidechain,
   mastering, tonal target). Start from a built-in genre and change only what should be different, or let the studio
   work out what you changed by hand after Auto-Mix ("from my mix"). Saved in the browser and inside the project,
   exported/imported as a small .json file that is checked and clamped on the way in, so a file can never run code. */
const GM_KEY = "stemmixer:myGenres", GM_GROUPS = ["lead","bv","drums","bass","perc","inst","synth"];
const L17 = (de, en) => window.I18N_LANG === "en" ? en : de;
const gmNum = (v, lo, hi, d) => { v = +v; return isFinite(v) ? Math.max(lo, Math.min(hi, Math.round(v*100)/100)) : d; };
const gmStr = (v, n) => String(v == null ? "" : v).replace(/[<>\u0000-\u001f]/g, "").trim().slice(0, n);
function gmClean(o, base){
  if(!o || typeof o !== "object") return null;
  const B = base || GENRES[o.base] || GENRES.pop, lv = o.lvl || {}, vx = o.vox || {}, cp = o.comp || {}, sc = o.sc || {}, ms = o.master || {};
  const tone = Array.isArray(o.tone) && o.tone.length === 10 ? o.tone.map((v, i)=>gmNum(v, -15, 8, B.tone[i])) : B.tone.slice();
  const name = gmStr(o.name, 40); if(!name) return null;
  return {name, why: gmStr(o.why, 200) || L17("eigenes Genre", "own genre"), custom: true, base: GENRES[o.base] && !GENRES[o.base].custom ? o.base : (B.custom ? B.base : "pop"),
    lvl: Object.fromEntries(GM_GROUPS.map(g=>[g, gmNum(lv[g], -12, 12, B.lvl[g] || 0)])), hpfLead: gmNum(o.hpfLead, 40, 200, B.hpfLead),
    vox: {revType: ["room","plate","hall"].includes(vx.revType) ? vx.revType : B.vox.revType, rev: gmNum(vx.rev, 0, 40, B.vox.rev), bvRev: gmNum(vx.bvRev, 0, 40, B.vox.bvRev),
          dly: gmNum(vx.dly, 0, 30, B.vox.dly), note: ["q","e","de"].includes(vx.note) ? vx.note : B.vox.note, fb: gmNum(vx.fb, 0, 60, B.vox.fb)},
    comp: {lead: gmNum(cp.lead, 0, 90, B.comp.lead), bv: gmNum(cp.bv, 0, 90, B.comp.bv), bass: gmNum(cp.bass, 0, 90, B.comp.bass)}, deess: gmNum(o.deess, 0, 90, B.deess),
    sc: {amt: gmNum(sc.amt, 0, 40, B.sc.amt), target: sc.target === "music" ? "music" : sc.target === "bass" ? "bass" : B.sc.target},
    master: {intensity: PRESETS[ms.intensity] ? ms.intensity : B.master.intensity, width: gmNum(ms.width, 80, 140, B.master.width), air: gmNum(ms.air, -1.5, 2, B.master.air), warm: gmNum(ms.warm, -1.5, 2, B.master.warm),
             glue: gmNum(ms.glue, 0, 90, B.master.glue ?? 0), sat: gmNum(ms.sat, 0, 70, B.master.sat ?? 0), mb: gmNum(ms.mb, 0, 90, B.master.mb ?? 40), level: gmNum(ms.level, 0, 100, B.master.level ?? 50)},
    bassBoost: gmNum(o.bassBoost, 0, 40, B.bassBoost ?? GENRE_BASS[o.base] ?? 0), tone};
}
let GM_LIST = [];
try{ const a = JSON.parse(localStorage.getItem(GM_KEY) || "[]"); if(Array.isArray(a)) a.forEach(x=>{ const id = /^my_[a-z0-9]{3,16}$/.test(x && x.id) ? x.id : null, g = gmClean(x); if(id && g){ GENRES[id] = g; GM_LIST.push(id); } }); }catch(e){}
const gmSave = () => { try{ localStorage.setItem(GM_KEY, JSON.stringify(GM_LIST.map(id=>({id, ...GENRES[id]})))); }catch(e){} };
const gmNewId = () => { let id; do{ id = "my_" + Math.random().toString(36).slice(2, 9); }while(GENRES[id]); return id; };
function gmRegister(g, id){ id = id && /^my_[a-z0-9]{3,16}$/.test(id) ? id : gmNewId(); GENRES[id] = g; if(!GM_LIST.includes(id)) GM_LIST.push(id); gmSave(); gmRender(); return id; }
const PEN = '<svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 20h4L19 9l-4-4L4 16z"/><path d="M14 6l4 4"/></svg>';
function gmRender(){
  const box = $("gmList"); if(!box) return; box.innerHTML = "";
  GM_LIST.forEach(id=>{ const g = GENRES[id]; if(!g) return;
    const w = document.createElement("span"); w.className = "gmchip";
    const b = document.createElement("button"); b.type = "button"; b.dataset.g = id; b.textContent = g.name; b.title = `${g.name}: ${g.why}`; b.setAttribute("aria-pressed", GENRE === id);
    const e = document.createElement("button"); e.type = "button"; e.className = "gmedit"; e.dataset.e = id; e.innerHTML = PEN; e.title = e.ariaLabel = L17(`„${g.name}“ bearbeiten`, `Edit “${g.name}”`);
    w.append(b, e); box.appendChild(w); });
  $("gmFromMix").disabled = !(GM_SNAP && tracks.length);
}
const _genreUi17 = genreUi; genreUi = function(){ _genreUi17(); document.querySelectorAll("#gmList [data-g]").forEach(b=>b.setAttribute("aria-pressed", b.dataset.g === GENRE)); };
$("gmList").onclick = e => { const ed = e.target.closest("[data-e]"); if(ed){ gmOpen(ed.dataset.e); return; } $("genre").onclick(e); };

/* snapshot right after Auto-Mix, so "from my mix" knows what you changed by hand */
let GM_SNAP = null;
{ const _ram17 = runAutoMix; runAutoMix = async function(){ const r = await _ram17.apply(this, arguments);
    try{ GM_SNAP = {genre: GENRE_USED, rk: REV_K[REV_AMT] ?? 0.4, tr: tracks.map(t=>({t, vol: t.vol, rev: t.rev, dly: t.dly, comp: t.comp, deess: t.deess, hpf: t.hpf})), M: {...M}, sc: {amt: SC.amt, target: SC.target}, fx: {revType: FX.revType, note: FX.dlyNote, fb: FX.dlyFb}}; }catch(e){ GM_SNAP = null; }
    gmRender(); return r; }; }
function gmFromMix(){
  const S = GM_SNAP; if(!S) return null;
  const B = GENRES[S.genre] || GENRES.pop, g = JSON.parse(JSON.stringify(B)), dB = (a, b) => 20*Math.log10(Math.max(1e-4, a)/Math.max(1e-4, b));
  const live = S.tr.filter(x=>tracks.includes(x.t));
  GM_GROUPS.forEach(k=>{ const xs = live.filter(x=>genreGroup(role(x.t.name)) === k && x.t.on); if(!xs.length) return; g.lvl[k] = (g.lvl[k] || 0) + xs.reduce((a, x)=>a + dB(x.t.vol, x.vol), 0)/xs.length; });
  const lead = live.find(x=>role(x.t.name) === "lead"), bv = live.find(x=>role(x.t.name) === "bv"), bs = live.find(x=>role(x.t.name) === "bass");
  if(lead){ if(S.rk > 0){ g.vox.rev = lead.t.rev/S.rk; g.vox.dly = lead.t.dly/S.rk; } g.comp.lead = lead.t.comp; g.deess = lead.t.deess; if(lead.t.hpf) g.hpfLead = lead.t.hpf + 10; }
  if(bv){ if(S.rk > 0) g.vox.bvRev = bv.t.rev/S.rk; g.comp.bv = bv.t.comp; }
  if(bs) g.comp.bass = bs.t.comp;
  g.vox.revType = FX.revType || g.vox.revType; g.vox.note = FX.dlyNote || g.vox.note; g.vox.fb = FX.dlyFb ?? g.vox.fb;
  g.sc = {amt: SC.amt || 0, target: SC.target || g.sc.target};
  const P = PRESETS[M.intensity] || PRESETS.stream;
  g.master = {...g.master, intensity: M.intensity, width: M.width, air: M.air - P.air, warm: M.warm - P.warm, glue: M.glue, sat: M.sat, mb: M.mb, level: M.level};
  g.bassBoost = M.bass; g.base = S.genre; g.name = L17(`${B.name} (mein Mix)`, `${B.name} (my mix)`); g.why = L17(`wie ${B.name}, mit deinen Änderungen aus dem Mix`, `like ${B.name}, with your changes from the mix`);
  return gmClean(g, B);
}

/* ---- the editor ---- */
let GM_ED = null;
function gmOpen(id, preset){
  const ed = $("gmEd"), isNew = !id || !GENRES[id];
  const baseId = GENRE !== "auto" && GENRES[GENRE] && !GENRES[GENRE].custom ? GENRE : (GENRE_USED && GENRES[GENRE_USED] && !GENRES[GENRE_USED].custom ? GENRE_USED : "pop");
  const g = preset || (isNew ? {...JSON.parse(JSON.stringify(GENRES[baseId])), base: baseId, name: "", why: ""} : JSON.parse(JSON.stringify(GENRES[id])));
  if(g.bassBoost == null) g.bassBoost = GENRE_BASS[g.base] || 0;
  GM_ED = {id: isNew ? null : id, g};
  const builtIn = Object.keys(GENRES).filter(k=>!GENRES[k].custom);
  const grpName = {lead: L17("Stimme", "Lead vocal"), bv: L17("Backing Vocals", "Backing vocals"), drums: "Drums", bass: "Bass / 808", perc: L17("Percussion / Hi-Hats", "Percussion / hi-hats"), inst: L17("Instrumente (Gitarre, Keys, Pads)", "Instruments (guitar, keys, pads)"), synth: "Synths"};
  const sl = (k, label, v, lo, hi, st, unit) => `<label class="gmrow"><span>${label}</span><input type="range" data-k="${k}" min="${lo}" max="${hi}" step="${st}" value="${v}"><output>${v}${unit||""}</output></label>`;
  const sel = (k, label, v, opts) => `<label class="gmrow"><span>${label}</span><select data-k="${k}">${opts.map(([val, t])=>`<option value="${val}"${val === v ? " selected" : ""}>${t}</option>`).join("")}</select></label>`;
  ed.innerHTML = `<div class="gmhead"><b>${isNew ? L17("Eigenes Genre", "Own genre") : L17("Genre bearbeiten", "Edit genre")}</b><button type="button" class="gmx" aria-label="${L17("Schließen", "Close")}">✕</button></div>
    <div class="gmgrid">
      <label class="gmrow wide"><span>${L17("Name", "Name")}</span><input type="text" data-k="name" maxlength="40" value="${esc(g.name)}" placeholder="${L17("z. B. Mein R&B", "e.g. My R&B")}"></label>
      ${sel("base", L17("Startet von", "Starts from"), g.base, builtIn.map(k=>[k, GENRES[k].name]))}
      <label class="gmrow wide"><span>${L17("So klingt es", "How it sounds")}</span><input type="text" data-k="why" maxlength="200" value="${esc(g.why)}" placeholder="${L17("kurz beschreiben, erscheint unter den Genres", "describe it briefly, shows under the genres")}"></label>
    </div>
    <h4>${L17("Lautstärke pro Spur-Gruppe (dB, gegenüber dem Standard)", "Level per track group (dB, against the standard)")}</h4>
    <div class="gmgrid">${GM_GROUPS.map(k=>sl("lvl." + k, grpName[k], g.lvl[k] || 0, -12, 12, 0.5, " dB")).join("")}</div>
    <h4>${L17("Stimme und Effekte", "Vocal and effects")}</h4>
    <div class="gmgrid">
      ${sel("vox.revType", L17("Hall-Art", "Reverb type"), g.vox.revType, [["room", L17("Raum", "Room")], ["plate", "Plate"], ["hall", L17("Halle", "Hall")]])}
      ${sl("vox.rev", L17("Hall auf der Stimme", "Reverb on the vocal"), g.vox.rev, 0, 40, 1, " %")}
      ${sl("vox.bvRev", L17("Hall auf den Backings", "Reverb on the backings"), g.vox.bvRev, 0, 40, 1, " %")}
      ${sl("vox.dly", L17("Echo auf der Stimme", "Echo on the vocal"), g.vox.dly, 0, 30, 1, " %")}
      ${sel("vox.note", L17("Echo-Takt", "Echo timing"), g.vox.note, [["q", "1/4"], ["e", "1/8"], ["de", L17("1/8 punktiert", "1/8 dotted")]])}
      ${sl("comp.lead", L17("Kompression Stimme", "Compression vocal"), g.comp.lead, 0, 90, 5, " %")}
      ${sl("comp.bass", L17("Kompression Bass", "Compression bass"), g.comp.bass, 0, 90, 5, " %")}
      ${sl("deess", L17("De-Esser", "De-esser"), g.deess, 0, 90, 5, " %")}
      ${sl("sc.amt", L17("Pumpen (Sidechain zur Kick)", "Pumping (sidechain to the kick)"), g.sc.amt, 0, 40, 1, " %")}
      ${sel("sc.target", L17("Pumpen auf", "Pumping on"), g.sc.target, [["bass", L17("Bass", "Bass")], ["music", L17("ganze Musik", "all music")]])}
    </div>
    <h4>${L17("Mastering", "Mastering")}</h4>
    <div class="gmgrid">
      ${sel("master.intensity", L17("Lautheit", "Loudness"), g.master.intensity, [["dyn", L17("Natürlich (−16 LUFS)", "Natural (−16 LUFS)")], ["stream", "Spotify & YouTube (−14 LUFS)"], ["loud", L17("Laut / Club (−9 LUFS)", "Loud / club (−9 LUFS)")]])}
      ${sl("master.width", L17("Stereobreite", "Stereo width"), g.master.width, 80, 140, 1, " %")}
      ${sl("master.air", L17("Heller (Höhen)", "Brighter (highs)"), g.master.air, -1.5, 2, 0.25, "")}
      ${sl("master.warm", L17("Wärmer", "Warmer"), g.master.warm, -1.5, 2, 0.25, "")}
      ${sl("bassBoost", L17("Bass-Boost", "Bass boost"), g.bassBoost, 0, 40, 1, " %")}
    </div>
    <details class="gmpro"><summary>${L17("Profi: alle Werte", "Pro: all values")}</summary>
      <div class="gmgrid">
        ${sl("hpfLead", L17("Low-Cut Stimme", "Low cut vocal"), g.hpfLead, 40, 200, 5, " Hz")}
        ${sl("comp.bv", L17("Kompression Backings", "Compression backings"), g.comp.bv, 0, 90, 5, " %")}
        ${sl("vox.fb", L17("Echo-Wiederholungen", "Echo feedback"), g.vox.fb, 0, 60, 5, " %")}
        ${sl("master.glue", L17("Glue (Bus-Kompressor)", "Glue (bus compressor)"), g.master.glue ?? 0, 0, 90, 5, " %")}
        ${sl("master.sat", L17("Sättigung", "Saturation"), g.master.sat ?? 0, 0, 70, 5, " %")}
        ${sl("master.mb", L17("Multiband", "Multiband"), g.master.mb ?? 40, 0, 90, 5, " %")}
        ${sl("master.level", L17("Pegel-Ausgleich", "Level rider"), g.master.level ?? 50, 0, 100, 5, " %")}
      </div>
      <h4>${L17("Klangziel (Mastering-EQ, dB je Band)", "Tonal target (mastering EQ, dB per band)")}</h4>
      <div class="gmgrid">${BANDS.map((f, i)=>sl("tone." + i, f >= 1000 ? (f/1000) + " kHz" : f + " Hz", g.tone[i], -15, 8, 0.5, " dB")).join("")}</div>
    </details>
    <div class="gmbtns"><button type="button" class="primary" data-a="save">${L17("Speichern und benutzen", "Save and use")}</button><button type="button" data-a="export">${L17("Exportieren (.json)", "Export (.json)")}</button>${isNew ? "" : `<button type="button" class="danger" data-a="del">${L17("Löschen", "Delete")}</button>`}<button type="button" data-a="close">${L17("Abbrechen", "Cancel")}</button></div>
    <small class="tnote" id="gmNote">${L17("Nur was du änderst, weicht vom gewählten Genre ab. Auto-Mix nutzt dein Genre wie jedes andere.", "Only what you change differs from the chosen genre. Auto-Mix uses your genre like any other.")}</small>`;
  ed.hidden = false; ed.scrollIntoView({behavior: "smooth", block: "nearest"});
  const nm = ed.querySelector('[data-k="name"]'); if(isNew && !preset) setTimeout(()=>nm.focus(), 50);
}
function gmSet(g, k, v){ const p = k.split("."); let o = g; for(let i = 0; i < p.length - 1; i++){ o = o[p[i]] = o[p[i]] ?? (p[0] === "tone" ? [] : {}); } o[p.at(-1)] = v; }
$("gmEd").addEventListener("input", e=>{
  const el = e.target, k = el.dataset && el.dataset.k; if(!k || !GM_ED) return;
  const g = GM_ED.g;
  if(k === "base"){ const B = JSON.parse(JSON.stringify(GENRES[el.value])); const keep = {name: g.name, why: g.why}; GM_ED.g = {...B, ...keep, base: el.value, bassBoost: GENRE_BASS[el.value] || 0}; gmOpen(GM_ED.id, GM_ED.g); return; }
  const v = el.type === "range" ? +el.value : el.value; gmSet(g, k, v);
  const out = el.parentElement.querySelector("output"); if(out){ const u = out.textContent.replace(/^[-−\d.,]+/, ""); out.textContent = v + u; }
});
$("gmEd").addEventListener("click", async e=>{
  if(e.target.closest(".gmx")){ $("gmEd").hidden = true; return; }
  const a = e.target.closest("[data-a]"); if(!a || !GM_ED) return; const act = a.dataset.a;
  if(act === "close"){ $("gmEd").hidden = true; return; }
  if(act === "del"){ const id = GM_ED.id; delete GENRES[id]; GM_LIST = GM_LIST.filter(x=>x !== id); gmSave(); if(GENRE === id){ GENRE = "auto"; } gmRender(); genreUi(); saveSoon(); $("gmEd").hidden = true; setStatus(L17("Genre gelöscht.", "Genre deleted.")); return; }
  const g = gmClean(GM_ED.g, GENRES[GM_ED.g.base]);
  if(!g){ $("gmNote").textContent = L17("Gib dem Genre zuerst einen Namen.", "Give the genre a name first."); $("gmEd").querySelector('[data-k="name"]').focus(); return; }
  if(act === "export"){ await gmExport(g); return; }
  if(act === "save"){ const id = gmRegister(g, GM_ED.id); GM_ED.id = id; $("gmEd").hidden = true; GENRE = id; GENRE_USED = id; genreUi(); saveSoon();
    setStatus(L17(`Genre „${g.name}“ gespeichert.`, `Genre “${g.name}” saved.`) + (tracks.length && AUTO_ON ? "" : " " + L17("Auto-Mix nutzt es beim nächsten Klick.", "Auto-Mix uses it on the next click.")));
    if(tracks.length && AUTO_ON && !$("automix").disabled) await runAutoMix(); }
});
async function gmExport(g){
  const o = {type: "danviel-genre", version: 1, app: "DANVIEL Studio", genre: g};
  const blob = new Blob([JSON.stringify(o, null, 1)], {type: "application/json"});
  await window.__deliver(blob, `${g.name.replace(/[^\w\- äöüÄÖÜß&]+/g, "").trim() || "Genre"} (DANVIEL-Genre).json`);
}
async function gmImportObj(o){
  const src = o && o.type === "danviel-genre" ? o.genre : null, g = gmClean(src); if(!g) return null;
  let nm = g.name, n = 2; while(GM_LIST.some(id=>GENRES[id].name === nm)) nm = `${g.name} (${n++})`; g.name = nm;
  return gmRegister(g);
}
window.__genTry = async files => {
  let ok = 0, names = [];
  for(const f of files){ if(f.size > 200000) return false; let o; try{ o = JSON.parse(await f.text()); }catch(e){ return false; } if(!o || o.type !== "danviel-genre") return false; const id = await gmImportObj(o); if(id){ ok++; names.push(GENRES[id].name); } }
  if(ok){ setStatus(L17(`Genre geladen: ${names.join(", ")}. Du findest es unter „Eigene“ beim Auto-Mix.`, `Genre loaded: ${names.join(", ")}. You find it under “Own” at Auto-Mix.`)); return true; }
  return false;
};
$("gmNew").onclick = () => gmOpen(null);
$("gmFromMix").onclick = () => { const g = gmFromMix(); if(!g){ setStatus(L17("Erst Auto-Mix laufen lassen, dann nach Gefühl nachdrehen, dann hier speichern.", "Run Auto-Mix first, fine-tune by ear, then save here."), true); return; } gmOpen(null, g); };
$("gmImp").onclick = () => $("gmFile").click();
$("gmFile").onchange = async e => { const fs = [...e.target.files]; e.target.value = ""; if(!fs.length) return; if(!(await window.__genTry(fs))) setStatus(L17("Das ist keine DANVIEL-Genre-Datei.", "That's not a DANVIEL genre file."), true); };

/* the project carries its own genre, so it opens with it anywhere */
{ const _gp17 = getProject; getProject = function(){ const p = _gp17.apply(this, arguments);
    try{ [["genre", "myGenre"], ["genreUsed", "myGenreUsed"]].forEach(([k, m])=>{ const id = p[k]; if(id && GENRES[id] && GENRES[id].custom) p[m] = {id, ...GENRES[id]}; }); }catch(e){}
    return p; };
  const _ap17 = applyProject; applyProject = function(pj){
    try{ ["myGenre", "myGenreUsed"].forEach(m=>{ const x = pj && pj[m]; if(!x || GENRES[x.id]) return; const g = gmClean(x); if(g) gmRegister(g, x.id); }); }catch(e){}
    return _ap17.apply(this, arguments); }; }
gmRender();
