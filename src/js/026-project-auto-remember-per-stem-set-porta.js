/* =====================================================================
   PROJECT: auto-remember per stem set + portable project file
   ===================================================================== */
const storeKey = () => "stemmixer:" + tracks.map(t=>t.origName || t.name).sort().join("|");
let saveT = 0, restoring = false;
function getProject(){
  return {
    app: "DANVIEL Studio", version: 1, saved: new Date().toISOString(),
    tracks: tracks.map(t=>({name:t.name, orig:t.origName || undefined, on:t.on, vol:+t.vol.toFixed(4), pan:t.pan, hpf:t.hpf, low:t.low, high:t.high, pf:t.pf, pg:t.pg, rev:t.rev, dly:t.dly, comp:t.comp, deess:t.deess, dn:t.dn||0, trimA:t.trimA||0, trimB:t.trimB||0, shift:t.shift||0, ride:t.ride||0, why:t.why, sound:t.isMidi ? t.sound : undefined, gen: t.gen && t.gen.kind !== "loop" ? {kind:t.gen.kind, bars:t.gen.bars, on:t.gen.on.slice(), steps:t.gen.steps, notes:t.gen.notes, sound:t.gen.sound} : undefined})),
    fx: {...FX}, fxOn: FXON, sidechain: {amt:SC.amt, target:SC.target},
    master: {on:M.on, preset:M.preset, intensity:M.intensity, style:M.style, tone:M.tone, target:M.target, warm:M.warm, air:M.air, glue:M.glue, sat:M.sat, width:M.width, mb:M.mb, bass:M.bass||0, level:M.level||0},
    tempo: {mode:P.mode, tempo:P.tempo, semis:P.semis, keepVox:P.keepVox},
    section: (AB.a!==null && AB.b!==null && duration) ? [AB.a/duration, AB.b/duration] : null, onlyAB: $("onlyAB").checked,
    video: {aspect:VID.aspect, style:VID.style, cxUsed: !!VID.cxUsed, cxUse: $("vCxUse").checked, tp:VID.tp, customStyle: VSTYLES[VID.style] && VSTYLES[VID.style].custom ? VSTYLES[VID.style].data : null, showViz:$("vShowViz").checked, showCover:$("vShowCover").checked, showTitle:$("vShowTitle").checked, title:$("vTitle").value, artist:$("vArtist").value, lyrics:$("lText").value, lyrOn:$("vLyr").checked, brand:$("vBrand").checked, brandTxt:$("vBrandTxt").value, full: !!VID.full, boxes: JSON.parse(JSON.stringify(VID.boxes||{})), cover:VID.coverUrl||"", coverName:VID.coverName||"", logo:VID.logoUrl||"", cx: JSON.parse(JSON.stringify(CX))},
    hook: SEC.hook, sectionLen: SEC.len, genre: GENRE, genreUsed: GENRE_USED, autoOn: AUTO_ON, revAmt: REV_AMT,
    fadeIn: +$("fadeIn").value||0, fadeOut: +$("fadeOut").value||0, name: $("fname").value, nameManual: fnameManual, format: $("fmt").value,
    cover: {idea: $("aiIdea").value, genre: $("aiGenre").value, dedic: $("aiDedic").value, style: typeof styleSel === "string" ? styleSel : "neutral",
      prompt: {title: $("cpTitle").value, artist: $("cpArtist").value, genre: $("cpGenre").value, wish: $("cpWish").value, out: $("cpOut").value, withText: typeof CP_TEXT === "boolean" ? CP_TEXT : true}},
  };
}
window.__pj = ()=>getProject();   // used by the error log and tests
function saveSoon(){
  if(!tracks.length || restoring) return;
  try{ sessSoon(); }catch(e){}
  recordSoon();
  clearTimeout(saveT);
  saveT = setTimeout(()=>{ try{ localStorage.setItem(storeKey(), JSON.stringify(getProject())); }catch(e){} }, 800);
}
function applyProject(pj){
  if(!pj || !Array.isArray(pj.tracks)) { setStatus("Diese Datei ist kein DANVIEL-Studio-Projekt.", true); return; }
  restoring = true;
  let hit = 0;
  pj.tracks.forEach(s=>{ const t = tracks.find(x=>x.name===s.name) || (s.orig && tracks.find(x=>x.name===s.orig)); if(!t) return; hit++;
    if(s.orig && t.name !== s.name){ t.origName = t.name; t.name = s.name; const b = t.el && t.el.querySelector("b"); if(b) b.textContent = s.name; }
    if(t.isMidi && s.sound && s.sound !== t.sound && MIDI_SOUNDS[s.sound]) setTimeout(()=>setMidiSound(t, s.sound), 0);
    if(s.gen && (s.gen.kind === "drums" || s.gen.kind === "inst") && !t.gen) t.gen = {kind:s.gen.kind, bars:[1,2,4,8].includes(s.gen.bars) ? s.gen.bars : 1, on:Array.isArray(s.gen.on) ? s.gen.on.map(v=>v?1:0) : [], steps:s.gen.steps && typeof s.gen.steps === "object" ? s.gen.steps : {}, notes:Array.isArray(s.gen.notes) ? s.gen.notes.filter(n=>n && isFinite(n.s) && isFinite(n.l) && isFinite(n.n)) : [], sound:MIDI_SOUNDS[s.gen.sound] ? s.gen.sound : "piano", fit:true};
    t.on = s.on!==false; t.ride = s.ride||0; t.pan = s.pan||0; t.hpf = s.hpf||0; t.low = s.low||0; t.high = s.high||0; t.pf = s.pf||2000; t.pg = s.pg||0; t.rev = s.rev||0; t.dly = s.dly||0; t.comp = s.comp||0; t.deess = s.deess||0; t.why = s.why||""; t.setVol(s.vol??1); t.refresh();
    const ed = {dn: s.dn||0, trimA: s.trimA||0, trimB: s.trimB||0, shift: s.shift||0};
    if(Object.keys(ed).some(k=>(t[k]||0) !== ed[k])){ Object.assign(t, ed); applyEdits(t, true); } });
  if(typeof pj.fxOn === "boolean") setFxOn(pj.fxOn); if(pj.fx) Object.assign(FX, pj.fx); if(pj.sidechain){ SC.amt = pj.sidechain.amt||0; SC.target = pj.sidechain.target||"bass"; } syncFx();
  const m = pj.master||{};
  ["target","warm","air","glue","sat","width","mb","bass","level"].forEach(k=>{ if(typeof m[k]==="number") M[k]=m[k]; }); syncBassLevel();
  if(m.intensity) M.intensity = m.intensity; if(m.style) M.style = m.style; M.tone = !!m.tone;
  M.preset = m.preset||""; syncKnobs();
  if(pj.revAmt && REV_K[pj.revAmt]!==undefined){ REV_AMT = pj.revAmt; revAmtUi(); }
  if(pj.fadeIn!=null) $("fadeIn").value = pj.fadeIn; if(pj.fadeOut!=null) $("fadeOut").value = pj.fadeOut;
  if(pj.name){ $("fname").value = pj.name; fnameManual = !!pj.nameManual; } if(pj.format) $("fmt").value = pj.format;
  if(pj.section){ AB.a = pj.section[0]*duration; AB.b = pj.section[1]*duration; }
  if(pj.video){ const v = pj.video; if(ASPECTS[v.aspect]) VID.aspect = v.aspect;
    VID.cxUsed = !!v.cxUsed; VID.cxImg = null; $("vCxUse").checked = v.cxUse !== false; $("vCxUseBox").hidden = !VID.cxUsed;
    if(v.tp && typeof v.tp === "object"){ VID.tp = {pos:"auto", align:"auto", font:"style", size:100, free:null, ...v.tp}; try{ vtSync(); }catch(e){} } if(v.customStyle){ const d = vsClean(v.customStyle); if(d){ VSTYLES[v.style && v.style.startsWith("u_") ? v.style : vsSlug(d.name)] = vsBuild(d); } }
    VID.style = VSTYLES[v.style] ? v.style : "classic"; vStyleUi(); VID.full = !!v.full; VID.boxes = v.boxes && typeof v.boxes === "object" ? v.boxes : {}; try{ vFullUi(); }catch(e){} ["showViz","showCover","showTitle"].forEach(k=>{ if(typeof v[k]==="boolean") $("v"+k[0].toUpperCase()+k.slice(1)).checked = v[k]; }); $("vTitle").value = v.title||""; $("vArtist").value = v.artist ?? "DANVIEL"; $("lText").value = v.lyrics||""; $("vLyr").checked = v.lyrOn!==false; $("vBrand").checked = v.brand!==false;
    $("vBrandTxt").value = v.brandTxt || "";
    if(pj.genre && (pj.genre === "auto" || GENRES[pj.genre])){ GENRE = pj.genre; if(GENRES[pj.genreUsed]) GENRE_USED = pj.genreUsed; genreUi(); }
    if(v.cx && typeof v.cx === "object"){ Object.assign(CX, JSON.parse(JSON.stringify(CX_DEF)), v.cx); cxSyncUi(); }
    document.querySelectorAll("#vAspect button").forEach(b=>b.setAttribute("aria-pressed", b.dataset.v===VID.aspect)); $("lSrt").disabled = !$("lText").value.trim(); renderLyricView(); previewSoon();
    if(v.cover){ dataUrlToBitmap(v.cover).then(bm=>{ if(!VID.coverHi){ VID.cover = bm; VID.pal = coverPalette(bm); } VID.coverUrl = v.cover; VID.coverName = v.coverName||"Cover"; $("vCoverName").textContent = VID.coverName + " · Farben übernommen"; $("vCoverClr").hidden = false; previewSoon(); try{ drawCoverPrev(); }catch(e){} }).catch(()=>{}); }
    else if(!VID.coverHi){ VID.cover = null; VID.coverUrl = ""; VID.pal = null; $("vCoverClr").hidden = true; $("vCoverName").textContent = "optional, sonst dreht sich eine Platte"; }
    if(v.logo){ dataUrlToBitmap(v.logo).then(bm=>{ VID.logo = bm; VID.logoUrl = v.logo; $("vLogoName").textContent = "Logo aus dem Projekt"; $("vLogoClr").hidden = false; previewSoon(); }).catch(()=>{}); }
    else { VID.logo = null; VID.logoUrl = ""; $("vLogoClr").hidden = true; }
  }
  if(typeof pj.hook === "boolean") SEC.hook = pj.hook; if(pj.sectionLen){ SEC.len = pj.sectionLen; document.querySelectorAll("#secLen button").forEach(b=>b.setAttribute("aria-pressed", +b.dataset.l===SEC.len)); }
  if(pj.section){ AB.a = pj.section[0]*duration; AB.b = pj.section[1]*duration; if(pj.onlyAB!==false) $("onlyAB").checked = true; }
  const tp = pj.tempo||{};
  P.mode = tp.mode==="tape" ? "tape" : "pro"; P.tempo = tp.tempo||1; P.semis = tp.semis||0; P.keepVox = !!tp.keepVox;
  $("rate").value = Math.round(P.tempo*100); $("semi").value = P.semis;
  restoring = false;
  if(typeof pj.autoOn === "boolean") setAutoOn(pj.autoOn);
  if(pj.cover && typeof pj.cover === "object"){ const c = pj.cover, pr = c.prompt || {}, setv = (id, v) => { if(typeof v === "string"){ $(id).value = v; $(id).dataset.auto = "0"; } };
    setv("aiIdea", c.idea); setv("aiGenre", c.genre); setv("aiDedic", c.dedic);
    setv("cpTitle", pr.title); setv("cpArtist", pr.artist); setv("cpGenre", pr.genre); setv("cpWish", pr.wish);
    if(typeof pr.out === "string" && pr.out){ $("cpOut").value = pr.out; $("cpOut").hidden = false; $("cpOutRow").hidden = false; $("cpOutHint").hidden = false; $("cpAgain").hidden = false; }
    if(typeof pr.withText === "boolean" && typeof CP_TEXT !== "undefined"){ CP_TEXT = pr.withText; try{ cpModeUi(); }catch(e){} }
    if(typeof c.style === "string" && typeof STYLES_ !== "undefined" && (c.style === "neutral" || STYLES_.some(x=>x.id === c.style))){ styleSel = c.style; try{ renderStyles(); }catch(e){} } }
  setMasterOn(!!m.on); showAB(); updateUI(); applyGains(); syncFx();
  if(P.mode==="tape" || P.tempo!==1 || P.semis!==0) applyTempo(true); else showSong();
  drawSec();
  if(hit < tracks.length) setStatus(`Projekt übernommen für ${hit} von ${tracks.length} Spuren (Namen müssen übereinstimmen).`);
}
$("projSave").onclick = ()=>{
  const name = fileName(["Einstellungen"], "json");
  deliver(new Blob([JSON.stringify(getProject(), null, 2)], {type:"application/json"}), name);
};
$("projLoad").onclick = ()=>$("projFile").click();
// one file for a colleague: project.json + every track (original file if we have it, otherwise WAV)
$("projZip").onclick = async ()=>{
  if(!window.JSZip){ setStatus("ZIP-Unterstützung fehlt (Internet nötig beim ersten Öffnen).", true); return; }
  $("projZip").disabled = true;
  try{
    const zip = new JSZip(), used = new Set();
    zip.file("Projekt.json", JSON.stringify(getProject(), null, 2));
    if(VID.cover){ try{ const c = document.createElement("canvas"); c.width = VID.cover.width; c.height = VID.cover.height; c.getContext("2d").drawImage(VID.cover, 0, 0);
      const png = await new Promise(r=>c.toBlob(r, "image/png")); if(png) zip.file("Cover.png", png); }catch(e){ log("Cover nicht ins Projekt gepackt:", e); } }
    for(let i=0;i<tracks.length;i++){
      const t = tracks[i]; setStatus(`Packe Spur ${i+1} von ${tracks.length}: ${t.name}`); setProg(i/tracks.length); await sleep0();
      let name = (t.raw && !t.merged) ? (t.file||"").split("/").pop() : `${t.name}.wav`;
      if(!name || used.has(name)) name = `${i+1} ${t.name}` + ((t.raw && !t.merged) ? (name.match(/\.[^.]+$/)||[".wav"])[0] : ".wav");
      used.add(name);
      const B0 = t.orig || t.buffer; zip.file(name, t.raw && !t.merged ? t.raw : encodeWav(B0.getChannelData(0), B0.numberOfChannels>1 ? B0.getChannelData(1) : B0.getChannelData(0), B0.sampleRate));
    }
    try{ await projExtrasSave(zip); }catch(e){ console.warn("Projekt-Extras nicht gepackt:", e); }
    setStatus("Packe ZIP …"); setProg(1);
    const z = await zip.generateAsync({type:"blob", compression:"STORE"});
    const zn = fileName(["Projekt"], "zip"); await deliver(z, zn);
    setStatus(`Projekt gespeichert: ${zn} (${(z.size/1048576).toFixed(1)} MB). Genau diese ZIP-Datei weiterschicken, der Empfänger lädt sie mit „Projekt laden“ und hat alles.`);
  } catch(e){ console.error(e); setStatus("Projekt-Paket fehlgeschlagen: " + (e.message||e), true); }
  finally { $("projZip").disabled = false; setTimeout(()=>setProg(0), 800); }
};
$("projFile").onchange = async e=>{
  const f = e.target.files[0]; e.target.value = ""; if(!f) return;
  if(/\.zip$/i.test(f.name)){ handleFiles([f]); return; }                 // full project: audio + settings
  try{
    const pj = JSON.parse(await f.text());
    if(!tracks.length){                                                     // settings only, no audio yet: keep them for the next load
      PENDING_PROJECT = pj;
      setStatus("Das ist eine alte Einstellungs-Datei (.json) ohne Spuren, damit kann man das Projekt nicht komplett öffnen. Bitte den Absender, das Projekt nochmal mit „Projekt speichern (ZIP)“ zu speichern und die ZIP-Datei zu schicken. Alternativ: jetzt die passenden Stems laden, dann werden die Einstellungen übernommen.", true);
      return;
    }
    setStatus("Projekt geladen."); applyProject(pj);
  } catch(err){ setStatus("Diese Datei konnte nicht gelesen werden.", true); }
};
["fadeIn","fadeOut","fname","fmt"].forEach(id=>$(id).addEventListener("change", saveSoon));

