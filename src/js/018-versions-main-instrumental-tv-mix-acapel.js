/* =====================================================================
   VERSIONS: Main, Instrumental, TV-Mix, Acapella, Vocal Up — one ZIP.
   All versions go through the same master gain as the main mix, so they line up in level.
   ===================================================================== */
const isVox = t => VOX_ROLES.includes(role(t.name)) || VOCAL_RE.test(t.name);
const isLead = t => role(t.name)==="lead" || (isVox(t) && !/(back|bv|chor|harm|double|adlib)/i.test(t.name));
const VERSIONS = {
  main: {label:"Main",          make: t => ({on:t.on, vol:t.vol})},
  inst: {label:"Instrumental",  make: t => ({on:t.on && !isVox(t), vol:t.vol})},
  tv:   {label:"TV-Mix",        make: t => ({on:t.on && !isLead(t), vol:t.vol})},
  acap: {label:"Acapella",      make: t => ({on:t.on && isVox(t), vol:t.vol})},
  vup:  {label:"Vocal Up",      make: t => ({on:t.on, vol: isLead(t) ? t.vol*db2(1) : t.vol})},
};
async function encodeAny(L, R, sr){
  const fmt = $("fmt").value;
  if(fmt==="wav") return {blob: encodeWav(L,R,sr), ext:"wav"};
  if(fmt==="wav24") return {blob: encodeWav(L,R,sr,24), ext:"wav"};
  if(fmt==="m4a"){
    if(!AAC_OK) throw new Error("Dieser Browser kann kein AAC/M4A erzeugen. Nimm Chrome oder Edge unter Windows/Mac, oder wähl MP3 oder WAV.");
    const a = await encodeAudioTrack(L, R, sr, "aac");
    return {blob: MP4.mux({audio:a}), ext:"m4a"};
  }
  if(!window.lamejs) throw new Error("Der MP3-Encoder konnte nicht geladen werden (Internet nötig). Wähl WAV oder versuch es mit Verbindung erneut.");
  return {blob: await encodeMp3(L,R,sr, fmt==="mp3-192"?192:320), ext:"mp3"};
}
$("exportVers").onclick = async ()=>{
  const want = [...document.querySelectorAll(".ver:checked")].map(x=>x.value);
  if(!want.length){ setStatus("Wähl mindestens eine Version aus.", true); return; }
  if(!window.JSZip){ setStatus("ZIP-Unterstützung fehlt (Internet nötig beim ersten Öffnen).", true); return; }
  const hasVox = tracks.some(t=>t.on && isVox(t)), hasLead = tracks.some(t=>t.on && isLead(t));
  const list = want.filter(v => v==="main" || (v==="inst"||v==="acap" ? hasVox : hasLead) );
  const skipped = want.filter(v=>!list.includes(v));
  $("exportVers").disabled = true;
  const saved = tracks.map(t=>({on:t.on, vol:t.vol}));
  try{
    const sr = tracks[0].buffer.sampleRate, zip = new JSZip(), base = fileBase(), sect = sectionTag();
    // the main mix sets the master gain (or the peak-safety factor) for every version
    setStatus("Versionen: berechne Main …"); setProg(0.02);
    let ref;
    if(M.on){ ref = await masterExport(); }
    else { const raw = await getMix(); let pk=0; for(const x of raw) for(let i=0;i<x.length;i++){ const a=Math.abs(x[i]); if(a>pk) pk=a; } ref = {k: $("norm").checked && pk>OFF_CEIL ? OFF_CEIL/pk : 1}; }
    const preDb = M.on ? ana.pre : 0, ceilLin = db2(ceilTP()-0.5);
    for(let vi=0; vi<list.length; vi++){
      const v = list[vi], V = VERSIONS[v];
      setStatus(`Versionen: ${V.label} (${vi+1}/${list.length}) …`); setProg((vi+0.5)/list.length); await sleep0();
      tracks.forEach((t,i)=>{ const s = V.make({...t, ...saved[i]}); t.on = s.on; t.vol = s.vol; });
      let raw = await getMix();
      tracks.forEach((t,i)=>{ t.on = saved[i].on; t.vol = saved[i].vol; });
      let L, R;
      if(M.on){
        const pl = await renderChain(raw, sr, preDb, ana && ana.lev);
        [L, R] = limit(pl[0], pl[1], db2(ref.g), ceilLin, sr);
        if(ref.k!==1) for(const x of [L,R]) for(let i=0;i<x.length;i++) x[i]*=ref.k;
      } else {
        [L, R] = raw; if(ref.k!==1) for(const x of [L,R]) for(let i=0;i<x.length;i++) x[i]*=ref.k;
      }
      [L, R] = trimTail(L, R, sr); applyFades(L, R, sr);
      const {blob, ext} = await encodeAny(L, R, sr);
      zip.file(`${base} (${[V.label, sect].filter(Boolean).join(", ")}).${ext}`, blob);
    }
    setStatus("Packe ZIP …"); setProg(1);
    const z = await zip.generateAsync({type:"blob", compression:"STORE"});
    await deliver(z, fileName(["Versionen", sect], "zip"));
    if(skipped.length) setStatus($("status").textContent + ` Übersprungen (keine Vocal-Spur erkannt): ${skipped.map(v=>VERSIONS[v].label).join(", ")}.`);
  } catch(e){ console.error(e); setStatus(e.message||String(e), true); tracks.forEach((t,i)=>{ t.on = saved[i].on; t.vol = saved[i].vol; }); }
  finally { $("exportVers").disabled = false; setTimeout(()=>setProg(0),800); }
};

