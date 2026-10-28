/* v16.3: packs work ON TOP of the Auto-Mix. They add their character (deltas) instead of replacing values, keep the loudness target (unless the pack is a "loud" one), are remembered and re-applied after every new Auto-Mix run. */
const PK_MN = {warm:0.5, air:1, glue:50, mb:40, sat:20, width:110, bass:0};
const PK_MR = {target:[-18,-7], warm:[-3,3], air:[-3,3], glue:[0,100], mb:[0,100], sat:[0,100], width:[80,140], bass:[0,200], level:[0,100]};
const PK_FN = {revLvl:80, dlyFb:30, dlyLvl:80}, PK_FR = {revLvl:[0,150], dlyFb:[0,70], dlyLvl:[0,150]};
const pQ = x => document.documentElement.lang === "en" ? `“${x}”` : `„${x}“`, pT = x => (window.__T||(y=>y))(x), pTo = o => { const r = {}; for(const k in o) r[k] = pT(o[k]); return r; };
const pkCl = (v, r) => Math.max(r[0], Math.min(r[1], Math.round(v*100)/100));
const pkSg = (v, u) => (v > 0 ? "+" : "") + (Math.round(v*10)/10) + (u||"");
let PKMEM = {master:[], fx:[], chains:[]};
const pkMemKey = () => "stemmixer:pkmem:" + (tracks.length ? storeKey() : "");
function pkMemLoad(){ try{ const o = JSON.parse(localStorage.getItem(pkMemKey()) || "null"); PKMEM = o && o.master ? o : {master:[], fx:[], chains:[]}; }catch(e){ PKMEM = {master:[], fx:[], chains:[]}; } }
const pkMemSave = () => { try{ if(tracks.length) localStorage.setItem(pkMemKey(), JSON.stringify(PKMEM)); }catch(e){} };
let PK_LASTKEY = "";
function pkMemSync(){ const k = pkMemKey(); if(k !== PK_LASTKEY){ PK_LASTKEY = k; pkMemLoad(); } }
function pkMasterCore(v){
  const ch = [];
  Object.keys(PK_MN).forEach(k=>{ if(v[k] === undefined) return; const d = v[k] - PK_MN[k]; if(Math.abs(d) < 0.01) return; const o = M[k] || 0; M[k] = pkCl(o + d, PK_MR[k]); if(M[k] !== o) ch.push(k); });
  if(v.loud && v.target !== undefined && v.target > M.target){ M.target = v.target; ch.push("target"); }
  M.preset = ""; syncKnobs(); syncBassLevel(); if(!M.on) setMasterOn(true); applyMaster();
  const L = pTo({warm:"Wärme", air:"Höhen", glue:"Glue", mb:"Multiband", sat:"Sättigung", width:"Breite", bass:"Bass", target:"Lautheit"});
  return ch.map(k=>k === "target" ? `${L[k]} ${M.target} LUFS` : `${L[k]} ${pkSg(v[k] - PK_MN[k], k === "width" ? " %" : k === "warm" || k === "air" ? " dB" : "")}`);
}
function pkFxCore(v){
  const ch = [];
  if(v.revType && v.revType !== FX.revType){ FX.revType = v.revType; ch.push(`${pT("Hall")}: ${pT(({room:"Raum", plate:"Platte", hall:"Halle"})[v.revType])}`); }
  if(v.dlyNote && v.dlyNote !== FX.dlyNote){ FX.dlyNote = v.dlyNote; ch.push(`${pT("Echo")}: ${pT(({e:"1/8", de:"1/8 punktiert", q:"1/4"})[v.dlyNote])}`); }
  Object.keys(PK_FN).forEach(k=>{ if(v[k] === undefined) return; const d = v[k] - PK_FN[k]; if(Math.abs(d) < 0.5) return; FX[k] = pkCl(FX[k] + d, PK_FR[k]); ch.push(`${pT(({revLvl:"Hall-Menge", dlyFb:"Echo-Wiederholung", dlyLvl:"Echo-Menge"})[k])} ${pkSg(d, " %")}`); });
  if(v.scAmt){ const o = SC.amt || 0; SC.amt = pkCl(o + v.scAmt, [0,100]); if(!o && v.scTarget) SC.target = v.scTarget; ch.push(`${pT("Sidechain")} ${pkSg(v.scAmt, " %")}`); }
  try{ syncSc(); }catch(e){} fxChanged();
  return ch;
}
function pkChainCore(v, t){
  const ch = [], L = pTo({low:"Bass-EQ", high:"Höhen-EQ", comp:"Kompressor", deess:"De-Esser", ride:"Pegel-Ride", rev:"Hall", dly:"Echo"});
  if(v.hpf !== undefined && v.hpf > (t.hpf||0)){ t.hpf = v.hpf; ch.push(`${pT("Low-Cut")} ${v.hpf} Hz`); }
  ["low","high"].forEach(k=>{ if(!v[k]) return; const o = t[k]||0; t[k] = pkCl(o + v[k], [-6,6]); if(t[k] !== o) ch.push(`${L[k]} ${pkSg(v[k], " dB")}`); });
  if(v.pg){ if(Math.abs(t.pg||0) < 0.3 && v.pf){ t.pf = v.pf; t.pg = v.pg; } else t.pg = pkCl((t.pg||0) + v.pg, [-6,0]); ch.push(`${pT("Mitten")} ${pkSg(v.pg, " dB")}`); }
  ["comp","deess","ride","rev","dly"].forEach(k=>{ if(v[k] === undefined || v[k] <= (t[k]||0)) return; t[k] = v[k]; ch.push(`${L[k]} ${v[k]} %`); });
  if(v.pan && !t.pan){ t.pan = v.pan; ch.push(`${pT("Panorama")} ${v.pan}`); }
  t.refresh(); applyGains();
  return ch;
}
function pkShow(name, ch, prev, undoMem){
  const n = $("pkNote"); n.innerHTML = "";
  const s = document.createElement("span"); s.textContent = `${pQ(name)}: ` + (ch.length ? ch.join(" · ") : pT("nichts zu ändern, der Mix hat das schon")) + ". " + pT("Der restliche Auto-Mix bleibt."); n.appendChild(s);
  const b = document.createElement("button"); b.type = "button"; b.className = "pkundo"; b.textContent = pT("Rückgängig");
  b.onclick = ()=>{ try{ applyProject(prev); }catch(e){} undoMem(); pkMemSave(); after(); n.textContent = document.documentElement.lang === "en" ? `${pQ(name)} undone.` : `${pQ(name)} rückgängig gemacht.`; setStatus(n.textContent); pkActive(); };
  n.appendChild(b); setStatus(s.textContent); pkActive();
}
function pkApplyMaster(v, name){
  pkMemSync(); const prev = getProject(), e = {name, v}, ch = pkRun(e, ()=>pkMasterCore(v)); scheduleAnalysis(); saveSoon(); PKMEM.master.push(e); PKMEM.master = PKMEM.master.slice(-8); pkMemSave();
  pkShow(name, ch, prev, ()=>{ const i = PKMEM.master.indexOf(e); if(i >= 0) PKMEM.master.splice(i, 1); }); }
function pkApplyFx(v, name){
  pkMemSync(); const prev = getProject(), e = {name, v}, ch = pkRun(e, ()=>pkFxCore(v)); PKMEM.fx.push(e); PKMEM.fx = PKMEM.fx.slice(-8); pkMemSave();
  pkShow(name, ch, prev, ()=>{ const i = PKMEM.fx.indexOf(e); if(i >= 0) PKMEM.fx.splice(i, 1); }); }
function pkApplyChain(v, t, name){
  if(!t) return; pkMemSync(); const prev = getProject(), e = {name, v, track: t.name}, ch = pkRun(e, ()=>pkChainCore(v, t), t); scheduleAnalysis(); saveSoon(); PKMEM.chains.push(e); PKMEM.chains = PKMEM.chains.slice(-24); pkMemSave();
  pkShow(`${name} → ${t.name}`, ch, prev, ()=>{ const i = PKMEM.chains.indexOf(e); if(i >= 0) PKMEM.chains.splice(i, 1); }); }
const PK_TK = ["pan","hpf","low","high","pf","pg","comp","deess","ride","rev","dly"];
function pkGrab(t){ const o = {M:{}, FX:{}, SC:{amt:SC.amt, target:SC.target}, T:{}}; Object.keys(PK_MR).forEach(k=>o.M[k] = M[k]); ["revType","revLvl","dlyNote","dlyFb","dlyLvl"].forEach(k=>o.FX[k] = FX[k]); if(t) PK_TK.forEach(k=>o.T[k] = t[k]); return o; }
function pkDiff(a, b, tn){ const out = []; ["M","FX","SC","T"].forEach(g=>{ for(const k in a[g]) if(a[g][k] !== b[g][k]) out.push({g, k, from:a[g][k], to:b[g][k], tn}); }); return out; }
function pkRun(e, fn, t){ const a = pkGrab(t), ch = fn(); e.eff = pkDiff(a, pkGrab(t), t && t.name); return ch; }
// before a new Auto-Mix run: take back what the packs changed (where nobody touched it since), so they do not stack up
function pkTakeBack(){
  pkMemSync(); const all = [...PKMEM.master, ...PKMEM.fx, ...PKMEM.chains].reverse(); let n = 0;
  all.forEach(e=>(e.eff||[]).slice().reverse().forEach(d=>{
    const obj = d.g === "M" ? M : d.g === "FX" ? FX : d.g === "SC" ? SC : tracks.find(x=>x.name === d.tn); if(!obj) return;
    if(obj[d.k] === d.to){ obj[d.k] = d.from; n++; } }));
  if(n){ tracks.forEach(t=>{ try{ t.refresh(); }catch(e){} }); try{ syncKnobs(); syncBassLevel(); syncSc(); }catch(e){} }
  return n;
}
function pkReapply(){
  pkMemSync(); const n = PKMEM.master.length + PKMEM.fx.length + PKMEM.chains.length; if(!n || !tracks.length) return 0;
  PKMEM.master.forEach(e=>pkRun(e, ()=>pkMasterCore(e.v))); PKMEM.fx.forEach(e=>pkRun(e, ()=>pkFxCore(e.v)));
  PKMEM.chains.forEach(e=>{ const t = tracks.find(x=>x.name === e.track); if(t) pkRun(e, ()=>pkChainCore(e.v, t), t); });
  pkMemSave(); scheduleAnalysis(); saveSoon(); return n;
}
function pkActive(){
  const L = $("pkList"); if(!L) return; let box = $("pkAct"); if(!box){ box = document.createElement("div"); box.id = "pkAct"; L.before(box); }
  pkMemSync(); const all = [...PKMEM.master.map(e=>["master", e]), ...PKMEM.fx.map(e=>["fx", e]), ...PKMEM.chains.map(e=>["chains", e])];
  box.innerHTML = ""; box.hidden = !all.length; if(!all.length) return;
  const h = document.createElement("span"); h.className = "pkah"; h.textContent = pT("Aktiv, wird nach jedem Auto-Mix wieder obendrauf gelegt:"); box.appendChild(h);
  all.forEach(([k, e])=>{ const c = document.createElement("button"); c.type = "button"; c.className = "pkchip"; c.title = pT("Nicht mehr merken (die aktuellen Regler bleiben, beim nächsten Auto-Mix fällt es weg)");
    c.textContent = (e.track ? `${e.name} → ${e.track}` : e.name) + "  ×";
    c.onclick = ()=>{ const i = PKMEM[k].indexOf(e); if(i >= 0) PKMEM[k].splice(i, 1); pkMemSave(); pkActive(); }; box.appendChild(c); });
}
{ const _ram = runAutoMix; runAutoMix = async function(){ try{ pkTakeBack(); }catch(e){} const r = await _ram.apply(this, arguments); try{ const n = pkReapply(); if(n){ after(); autoLog(`Pakete wieder obendrauf gelegt: ${n}`); } }catch(e){ log("Pakete nicht neu angewendet:", String(e && e.message || e)); } return r; }; }
const pkMsg = t => { $("pkNote").textContent = t; setStatus(t); };
$("packsBtn").addEventListener("click", ()=>setTimeout(pkActive, 0));
const pkMatch = (t, f) => { if(f === "any") return true; const r = role(t.name); return r === f || (f === "drums" && /kick|snare|hat|perc/.test(r)); };
function pkRender(){
  const L = $("pkList"); L.innerHTML = "";
  PACKS.forEach((pk, pi)=>{
    const el = document.createElement("section"); el.className = "pk";
    const cnt = [pk.master.length && `${pk.master.length} Mastering`, pk.fx.length && `${pk.fx.length} Effekte`, pk.chains.length && `${pk.chains.length} Spur-Ketten`, pk.vstyles.length && `${pk.vstyles.length} Visualizer-Styles`, pk.cstyles.length && `${pk.cstyles.length} Cover-Styles`].filter(Boolean).join(" · ");
    el.innerHTML = `<header><b></b><small></small><button class="pkexp" title="Dieses Paket als .json-Datei speichern, zum Weitergeben oder als Sicherung">⤓ Exportieren</button>${pk.builtin ? "" : '<button class="rm">🗑 Entfernen</button>'}</header><p class="desc"></p>`;
    el.querySelector(".pkexp").onclick = ()=>{ const o = {...pk}; delete o.builtin; if(o.id === "danviel-starter" || o.id === "danviel-genres") o.id = o.id + "-copy"; const b = new Blob([JSON.stringify(o, null, 2)], {type:"application/json"}); deliver(b, (pk.name.replace(/[^\w\-äöüÄÖÜß ]+/g, "").trim() || "Paket") + ".json"); };
    el.querySelector("b").textContent = pk.name; el.querySelector("header small").textContent = (pk.author ? "von " + pk.author + " · " : "") + cnt; el.querySelector(".desc").textContent = pk.description || "";
    const grp = (label) => { const g = document.createElement("div"); g.className = "grp"; g.dataset.g = label; if((window.__pkFocus||[]).includes(label)) g.classList.add("pkhl"); const s = document.createElement("span"); s.textContent = label; g.appendChild(s); el.appendChild(g); return g; };
    const btn = (g, txt, fn, title) => { const b = document.createElement("button"); b.textContent = txt; if(title) b.title = title; b.onclick = fn; g.appendChild(b); return b; };
    if(pk.master.length){ const g = grp("Mastering"); pk.master.forEach(x=>btn(g, x.name, ()=>{ if(!tracks.length) return pkMsg("Erst einen Song laden."); pkApplyMaster(x.values, x.name); }, "Legt diesen Mastering-Klang obendrauf. Lautheit und Auto-Mix bleiben")); }
    if(pk.fx.length){ const g = grp("Effekte"); pk.fx.forEach(x=>btn(g, x.name, ()=>{ if(!tracks.length) return pkMsg("Erst einen Song laden."); pkApplyFx(x.values, x.name); }, "Legt diese Effekte obendrauf. Der restliche Auto-Mix bleibt")); }
    if(pk.chains.length){ const g = grp("Spur-Ketten");
      pk.chains.forEach(x=>{ const w = document.createElement("span"); w.style.cssText = "display:inline-flex;gap:4px;align-items:center";
        const sel = document.createElement("select"); sel.title = "Auf welche Spur?";
        const cand = tracks.filter(t=>pkMatch(t, x.for)), rest = tracks.filter(t=>!pkMatch(t, x.for));
        [...cand, ...rest].forEach(t=>{ const o = document.createElement("option"); o.value = tracks.indexOf(t); o.textContent = t.name; sel.appendChild(o); });
        if(!tracks.length){ const o = document.createElement("option"); o.textContent = "(erst Song laden)"; sel.appendChild(o); sel.disabled = true; }
        const b = document.createElement("button"); b.textContent = `${x.name} →`; b.title = `Gedacht für: ${PK_ROLES[x.for]}. Wählt die Spur rechts daneben.`;
        b.onclick = ()=>{ const t = tracks[+sel.value]; if(!t) return pkMsg("Erst einen Song laden."); pkApplyChain(x.values, t, x.name); };
        w.append(b, sel); g.appendChild(w); }); }
    if(pk.vstyles.length || pk.cstyles.length){ const g = grp("Styles"); const s = document.createElement("small"); s.className = "tnote";
      s.textContent = [pk.vstyles.length && `Visualizer: ${pk.vstyles.map(v=>v.name).join(", ")} (bei Video)`, pk.cstyles.length && `Cover: ${pk.cstyles.map(v=>v.name).join(", ")} (im Cover-Studio)`].filter(Boolean).join(" · "); g.appendChild(s); }
    const rm = el.querySelector(".rm"); if(rm) rm.onclick = ()=>{ PACKS.splice(pi, 1); pkSave(); pkRender(); pkMsg(`Paket „${pk.name}“ entfernt. Bereits übernommene Visualizer- und Cover-Styles bleiben erhalten.`); };
    L.appendChild(el);
  });
  const ts = $("pkMkTrack"); ts.innerHTML = ""; tracks.forEach((t, i)=>{ const o = document.createElement("option"); o.value = i; o.textContent = t.name; ts.appendChild(o); });
  $("pkMkChain").disabled = !tracks.length; ts.disabled = !tracks.length;
}
async function pkImport(file){
  try{
    if(!file || file.size > 400000) throw new Error("Datei zu groß oder leer.");
    const pk = pkClean(JSON.parse(await file.text())); if(!pk) throw new Error("Das ist keine DANVIEL-Paket-Datei.");
    pk.builtin = false; if(pk.id === "danviel-starter" || pk.id === "danviel-genres") pk.id = "p" + Date.now();
    const i = PACKS.findIndex(x=>x.id === pk.id || x.name === pk.name); if(i >= 0) PACKS[i] = pk; else PACKS.push(pk);
    const [nv, nc] = pkInstallStyles(pk); pkSave(); pkRender();
    pkMsg(`Paket „${pk.name}“ geladen.` + (nv ? ` ${nv} Visualizer-Style(s) bei Video.` : "") + (nc ? ` ${nc} Cover-Style(s) im Cover-Studio.` : ""));
  }catch(e){ pkMsg("Paket konnte nicht geladen werden: " + (e.message || e)); }
}
$("packsBtn").onclick = ()=>{ pkRender(); $("pkNote").textContent = ""; try{ $("packs").showModal(); }catch(e){ $("packs").setAttribute("open", ""); }
  const f = window.__pkFocus || []; let fn = $("pkFocus"); if(!fn){ fn = document.createElement("div"); fn.id = "pkFocus"; $("pkList").before(fn); }
  fn.textContent = f.length ? (window.__T||(x=>x))(`Passend hervorgehoben: ${f.map(x=>(window.__T||(y=>y))(x)).join(", ")}`) : "";
  const hit = $("pkList").querySelector(".grp.pkhl"); if(hit) setTimeout(()=>hit.scrollIntoView({block:"center", behavior:"smooth"}), 60);
  window.__pkFocus = []; };
$("pkLoad").onclick = ()=>$("pkFile").click();
$("pkFile").onchange = e=>{ const f = e.target.files[0]; e.target.value = ""; pkImport(f); };
$("packs").addEventListener("dragover", e=>{ e.preventDefault(); e.stopPropagation(); $("packs").classList.add("drag"); });
$("packs").addEventListener("dragleave", ()=>$("packs").classList.remove("drag"));
$("packs").addEventListener("drop", e=>{ e.preventDefault(); e.stopPropagation(); $("packs").classList.remove("drag"); const f = e.dataTransfer.files && e.dataTransfer.files[0]; if(f) pkImport(f); });
$("pkSave").onclick = async ()=>{
  const name = $("pkName").value.trim(); if(!name){ $("pkMkNote").textContent = "Gib dem Paket einen Namen."; $("pkName").focus(); return; }
  const pk = {type:"danviel-pack", version:1, id:"p" + Date.now(), name, author:$("pkAuthor").value.trim(), description:$("pkDesc").value.trim(), master:[], fx:[], chains:[], vstyles:[], cstyles:[]};
  if($("pkMkMaster").checked) pk.master.push({name: name + " Master", values:{target:M.target, warm:M.warm, air:M.air, glue:M.glue, mb:M.mb, sat:M.sat, width:M.width, bass:M.bass||0, level:M.level||0}});
  if($("pkMkFx").checked) pk.fx.push({name: name + " FX", values:{revType:FX.revType, revLvl:FX.revLvl, dlyNote:FX.dlyNote, dlyFb:FX.dlyFb, dlyLvl:FX.dlyLvl, scAmt:SC.amt||0, scTarget:SC.target||"bass"}});
  if($("pkMkChain").checked && tracks.length){ const t = tracks[+$("pkMkTrack").value]; if(t){ const r = role(t.name);
    pk.chains.push({name: name + " " + t.name, for: PK_ROLES[r] ? r : "any", values:{pan:t.pan, hpf:t.hpf, low:t.low, high:t.high, pf:t.pf, pg:t.pg, comp:t.comp, deess:t.deess, ride:t.ride||0, rev:t.rev, dly:t.dly}}); } }
  if($("pkMkVs").checked) pk.vstyles = Object.keys(VSTYLES).filter(k=>k.startsWith("u_")).map(k=>VSTYLES[k].data);
  if($("pkMkCs").checked) pk.cstyles = STYLES_.map(x=>({name:x.name, prompt:x.prompt}));
  const clean = pkClean(pk);
  if(!clean || !(clean.master.length + clean.fx.length + clean.chains.length + clean.vstyles.length + clean.cstyles.length)){ $("pkMkNote").textContent = "Nichts ausgewählt, das ins Paket kann."; return; }
  const blob = new Blob([JSON.stringify(clean, null, 2)], {type:"application/json"});
  await window.__deliver(blob, `${name.replace(/[^\w\- äöüÄÖÜß]+/g, "").trim() || "Paket"} (DANVIEL-Paket).json`);
  $("pkMkNote").textContent = "Gespeichert. Diese Datei kannst du weitergeben, andere laden sie mit „📂 Paket laden“.";
};
