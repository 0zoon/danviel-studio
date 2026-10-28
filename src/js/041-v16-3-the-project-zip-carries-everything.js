/* v16.3: the project ZIP carries everything you made: cover drafts, the finished cover with text, lyrics as text, the background video and your finished videos */
VID.made = [];
function vidRemember(blob, name){ VID.made = VID.made.filter(v=>v.name !== name); VID.made.push({name, blob}); while(VID.made.length > 6) VID.made.shift(); vidMadeUi(); }
function vidMadeUi(){
  let box = $("vMade"); const anchor = $("vMake"); if(!anchor) return;
  if(!box){ box = document.createElement("div"); box.id = "vMade"; box.className = "vmade"; (anchor.closest(".row") || anchor.parentElement).after(box); }
  box.innerHTML = ""; box.hidden = !VID.made.length; if(!VID.made.length) return;
  const h = document.createElement("span"); h.className = "vmh"; h.textContent = (window.__T||(x=>x))("Deine Videos (kommen beim Projekt-Speichern mit):"); box.appendChild(h);
  VID.made.forEach(v=>{ const b = document.createElement("button"); b.type = "button"; b.className = "vmb"; b.textContent = `${v.name} · ${(v.blob.size/1048576).toFixed(1)} MB`; b.title = (window.__T||(x=>x))("Nochmal herunterladen");
    b.onclick = ()=>deliver(v.blob, v.name); box.appendChild(b); });
}
async function projExtrasSave(zip){
  const n = [];
  const th = [...document.querySelectorAll("#aiThumbs img")].filter(i=>i._blob);
  th.forEach((img, i)=>{ const ext = /png/.test(img._blob.type) ? "png" : /webp/.test(img._blob.type) ? "webp" : "jpg"; zip.file(`Extras/Cover-Entwuerfe/${i+1}.${ext}`, img._blob); });
  if(th.length){ zip.file("Extras/Cover-Entwuerfe/info.json", JSON.stringify(th.map((img, i)=>({i: i+1, label: img._label || "", prompt: img._prompt || "", sel: img.classList.contains("sel")})), null, 1)); n.push(th.length + " Cover-Entwürfe"); }
  try{ const cv = $("coverPrev"); if(VID.cover && cv && cv.width){ const png = await new Promise(r=>cv.toBlob(r, "image/png")); if(png){ zip.file("Extras/Cover mit Schrift.png", png); n.push("Cover mit Schrift"); } } }catch(e){}
  const ly = $("lText").value.trim(); if(ly){ zip.file("Extras/Lyrics.txt", ly); n.push("Lyrics"); }
  if(VID.bgvFile){ const ext = ((VID.bgvFile.name||"").match(/\.[^.]+$/)||[".mp4"])[0]; zip.file("Extras/Hintergrund-Video" + ext, VID.bgvFile); n.push("Hintergrund-Video"); }
  VID.made.forEach(v=>zip.file("Extras/Videos/" + v.name, v.blob)); if(VID.made.length) n.push(VID.made.length + " Videos");
  const used = new Set(); tracks.forEach(t=>{ if(t.gen && t.gen.kind === "drums") Object.keys(t.gen.steps||{}).forEach(k=>{ if(k.startsWith("s:") && SMP.USER.has(k.slice(2))) used.add(k.slice(2)); }); });
  if(used.size){ const meta = []; used.forEach(id=>{ const u = SMP.USER.get(id), ext = /mpeg|mp3/.test(u.type) ? "mp3" : /ogg/.test(u.type) ? "ogg" : /flac/.test(u.type) ? "flac" : "wav"; zip.file(`Extras/Samples/${id}.${ext}`, u.raw); meta.push({id, name:u.name, type:u.type, file:`${id}.${ext}`}); });
    zip.file("Extras/Samples/info.json", JSON.stringify(meta)); n.push(used.size + " eigene Samples"); }
  if(n.length) log("Im Projekt dabei:", n.join(", "));
}
async function projExtrasLoad(list, pj){
  if(!list || !list.length) return;
  const by = re => list.filter(e=>re.test(e.name));
  let info = []; const inf = by(/Extras\/Cover-Entwuerfe\/info\.json$/i)[0]; if(inf){ try{ info = JSON.parse(await inf.async("string")); }catch(e){} }
  const drafts = by(/Extras\/Cover-Entwuerfe\/(\d+)\.(png|jpe?g|webp)$/i).sort((a, b)=>parseInt(a.name.match(/(\d+)\.\w+$/)[1]) - parseInt(b.name.match(/(\d+)\.\w+$/)[1]));
  if(drafts.length){ $("aiThumbs").innerHTML = "";
    for(const e of drafts){ const i = parseInt(e.name.match(/(\d+)\.\w+$/)[1]), m = info.find(x=>x.i === i) || {}, ext = e.name.split(".").pop().toLowerCase();
      const blob = new Blob([await e.async("arraybuffer")], {type: ext === "png" ? "image/png" : ext === "webp" ? "image/webp" : "image/jpeg"});
      addCoverThumb(blob, m.prompt || "", m.label || "Cover", true); if(m.sel) $("aiThumbs").lastChild.classList.add("sel"); } }
  const smi = by(/Extras\/Samples\/info\.json$/i)[0]; let nSmp = 0;
  if(smi){ try{ const meta = JSON.parse(await smi.async("string")); for(const m of meta){ const e = by(new RegExp("Extras/Samples/" + m.file.replace(/[.]/g, "\\.") + "$"))[0]; if(!e) continue; try{ await smpUserAdd(m.name, await e.async("arraybuffer"), m.type, m.id); nSmp++; }catch(err){} }
    if(nSmp){ await smpUserSave(); tracks.forEach(t=>{ if(t.gen && t.gen.kind === "drums" && Object.keys(t.gen.steps||{}).some(k=>k.startsWith("s:"))) bldSoon(t); }); } }catch(err){} }
  const bg = by(/Extras\/Hintergrund-Video\.\w+$/i)[0];
  if(bg){ const ext = bg.name.split(".").pop().toLowerCase(), f = new File([await bg.async("arraybuffer")], "Hintergrund-Video." + ext, {type: ext === "webm" ? "video/webm" : ext === "mov" ? "video/quicktime" : "video/mp4"});
    setBgVideo(f); const v = (pj && pj.video) || {}; ["showViz","showCover"].forEach(k=>{ if(typeof v[k] === "boolean") $("v"+k[0].toUpperCase()+k.slice(1)).checked = v[k]; }); previewSoon(); }
  for(const e of by(/Extras\/Videos\/[^/]+\.mp4$/i)){ VID.made.push({name: e.name.split("/").pop(), blob: new Blob([await e.async("arraybuffer")], {type:"video/mp4"})}); }
  vidMadeUi();
  const TT = x => (window.__T||(y=>y))(x), parts = [drafts.length && `${drafts.length} ${TT("Cover-Entwürfe")}`, bg && TT("Hintergrund-Video"), VID.made.length && `${VID.made.length} ${TT("Videos")}`].filter(Boolean);
  if(parts.length) setTimeout(()=>setStatus(`Projekt komplett geladen, mit ${parts.join(", ")}.`), 50);
}

