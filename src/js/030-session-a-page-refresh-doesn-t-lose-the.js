/* ---------- Session: a page refresh doesn't lose the work. Audio + settings stay in this browser (IndexedDB), nothing is uploaded ---------- */
const SESS = {t:0, sig:"", busy:false, off:false};
async function sessPut(key, val){ try{ const db = await archDb(); return await new Promise(res=>{ const tx = db.transaction("kv", "readwrite"); tx.objectStore("kv").put(val, key); tx.oncomplete = ()=>res(true); tx.onerror = tx.onabort = ()=>res(false); }); }catch(e){ return false; } }
async function sessGet(key){ try{ const db = await archDb(); return await new Promise(res=>{ const q = db.transaction("kv").objectStore("kv").get(key); q.onsuccess = ()=>res(q.result || null); q.onerror = ()=>res(null); }); }catch(e){ return null; } }
const sessSig = () => tracks.map(t=>t.name + ":" + t.buffer.length + ":" + (t.genJob||0) + ":" + (t.recShift||0) + ":" + (t.mergeV||0)).join("|");
async function sessSave(){
  if(!tracks.length || SESS.busy || SESS.off) return; SESS.busy = true;
  try{
    const sig = sessSig();
    if(sig !== SESS.sig){
      const used = new Set(), files = [];
      for(let i=0;i<tracks.length;i++){ const t = tracks[i];
        let name = t.raw && !t.gen && !t.merged ? (t.file||"").split("/").pop() : `${t.name}.wav`;
        if(!name || used.has(name)) name = `${i+1} ${t.name}` + (t.raw && !t.gen && !t.merged ? (name.match(/\.[^.]+$/)||[".wav"])[0] : ".wav"); used.add(name);
        const b = t.orig || t.buffer, blob = t.raw && !t.gen && !t.merged ? (t.raw instanceof Blob ? t.raw : new Blob([t.raw])) : new Blob([encodeWav(b.getChannelData(0), b.numberOfChannels > 1 ? b.getChannelData(1) : b.getChannelData(0), b.sampleRate)], {type:"audio/wav"});
        files.push({name, blob}); if(i % 2) await sleep0(); }
      if(await sessPut("sessAudio", {files, saved: Date.now()})) SESS.sig = sig; else log("Sitzung: Audio konnte nicht gespeichert werden (Speicher voll?)");
    }
    await sessPut("sessProject", {pj: getProject(), saved: Date.now()});
  }catch(e){ log("Sitzung nicht gespeichert:", String(e && e.message || e)); } finally { SESS.busy = false; }
}
function sessSoon(){ clearTimeout(SESS.t); SESS.t = setTimeout(sessSave, 1500); }
async function sessClear(){ SESS.off = true; await sessPut("sessAudio", null); await sessPut("sessProject", null); }
setTimeout(async ()=>{
  try{
    if(tracks.length) return;
    let crashed = false; try{ crashed = !!localStorage.getItem("stemmixer:sessLoading"); localStorage.removeItem("stemmixer:sessLoading"); }catch(e){}
    if(crashed){ await sessPut("sessAudio", null); log("Sitzung übersprungen: das letzte Wiederherstellen hat den Browser abstürzen lassen");
      setStatus("Deine letzte Sitzung war zu groß für den Speicher dieses Geräts und wurde nicht wieder geladen. Tipp fürs Handy: weniger Stems oder MP3 statt WAV.", true); return; }
    const a = await sessGet("sessAudio"); if(!a || !Array.isArray(a.files) || !a.files.length || tracks.length) return;
    const p = await sessGet("sessProject"), mins = Math.round((Date.now() - (p && p.saved || a.saved))/60000);
    const files = a.files.map(f=>new File([f.blob], f.name, {type: f.blob.type || ""}));
    if(p && p.pj) PENDING_PROJECT = p.pj;
    try{ localStorage.setItem("stemmixer:sessLoading", String(Date.now())); }catch(e){}
    log("Sitzung wiederhergestellt:", files.length, "Spuren"); await handleFiles(files); SESS.sig = sessSig();
    setTimeout(()=>{ try{ localStorage.removeItem("stemmixer:sessLoading"); }catch(e){} }, 8000);
    setStatus(`Deine letzte Sitzung ist wieder da (${files.length} Spuren, zuletzt vor ${mins < 1 ? "weniger als 1" : mins} Min.). „Projekt löschen“ fängt neu an.`);
  }catch(e){ log("Sitzung nicht wiederhergestellt:", String(e && e.message || e)); }
}, 300);
$("newProj").onclick = ()=>{
  const b = $("newProj");
  if(!b.classList.contains("armed")){
    b.classList.add("armed"); b.textContent = "Wirklich alles löschen? Nochmal klicken";
    clearTimeout(newArmT); newArmT = setTimeout(()=>{ b.classList.remove("armed"); b.textContent = "Projekt löschen"; }, 4000);
    return;
  }
  clearTimeout(newArmT); clearTimeout(saveT); stop();
  try{ if(tracks.length) localStorage.removeItem(storeKey()); }catch(e){}
  log("Projekt gelöscht, Neustart");
  sessClear().finally(()=>location.reload());
};
