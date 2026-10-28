/* ---------- File input / drop ---------- */
$("pick").onclick = ()=>$("file").click();
$("file").onchange = e=>{ handleFiles(e.target.files); e.target.value=""; };
const drop = $("drop");
["dragenter","dragover"].forEach(ev=>document.addEventListener(ev, e=>{ e.preventDefault(); drop.classList.add("over"); }));
["dragleave","drop"].forEach(ev=>document.addEventListener(ev, e=>{ e.preventDefault(); if(ev==="drop"||e.target===document.documentElement) drop.classList.remove("over"); }));
// Dropped folders are read recursively; images go to the Cover-Studio (also images dragged straight out of ChatGPT)
function filesFromDrop(dt){
  const ents = [...(dt.items || [])].map(it => it.kind === "file" && it.webkitGetAsEntry ? it.webkitGetAsEntry() : null).filter(Boolean);
  const plain = [...(dt.files || [])];
  if(!ents.length || !ents.some(en => en.isDirectory)) return Promise.resolve(plain);
  const out = [];
  const readAll = dir => new Promise(res=>{ const r = dir.createReader(), acc = []; const step = ()=>r.readEntries(b=>{ if(!b.length) return res(acc); acc.push(...b); step(); }, ()=>res(acc)); step(); });
  const walk = async (en, depth) => { if(en.isFile){ const f = await new Promise((res,rej)=>en.file(res,rej)).catch(()=>null); if(f) out.push(f); } else if(en.isDirectory && depth < 5){ for(const c of await readAll(en)) await walk(c, depth+1); } };
  return (async ()=>{ for(const en of ents) await walk(en, 0); log("Ordner reingezogen:", out.length, "Dateien"); return out; })();
}
const isImg = f => /^image\//.test(f.type || "") || /\.(png|jpe?g|webp|gif|avif|bmp)$/i.test(f.name || "");
async function coverFromFile(f){
  if($("aiBox").hidden) $("aiCoverBtn").click();
  try{ await addCoverThumb(f, $("aiUsed").value, "Eigenes Cover"); if(typeof CP_USED !== "undefined" && CP_USED !== null) cxSetText(!CP_USED); $("aiNote").textContent = "Bild übernommen. Unten siehst du das fertige Cover mit Schrift."; log("Cover per Drag & Drop / Einfügen:", f.name || "Bild", Math.round(f.size/1024)+" KB"); }
  catch(err){ $("aiNote").textContent = "Dieses Bild konnte nicht geöffnet werden."; }
}
async function coverFromUrl(url){
  if($("aiBox").hidden) $("aiCoverBtn").click();
  $("aiNote").textContent = "Hole das Bild …";
  try{ const r = await fetch(url); const b = await r.blob(); if(!r.ok || !/^image\//.test(b.type)) throw new Error(r.status); await coverFromFile(new File([b], "Cover", {type: b.type})); }
  catch(err){ log("Cover-URL nicht ladbar:", url.slice(0,120), err); $("aiNote").textContent = "Die Seite erlaubt nicht, das Bild direkt zu übernehmen. So geht's trotzdem: In ChatGPT Rechtsklick auf das Bild → „Bild kopieren“ und hier Strg+V drücken. Oder das Bild speichern und die Datei reinziehen."; }
}
document.addEventListener("drop", async e=>{
  drop.classList.remove("over"); const dt = e.dataTransfer; if(!dt) return;
  const inCover = !$("aiBox").hidden && e.target && e.target.closest && !!e.target.closest("#aiBox");
  const html = dt.getData("text/html") || "", uri = (dt.getData("text/uri-list") || "").split("\n").find(l=>/^https?:/.test(l.trim())) || "";
  const files = await filesFromDrop(dt);
  const imgs = files.filter(isImg);
  if(imgs.length && (inCover || imgs.length === files.length)) return coverFromFile(imgs[0]);
  if(!files.length){
    const m = html.match(/<img[^>]+src="([^"]+)"/i), src = m ? m[1].replace(/&amp;/g,"&") : uri;
    if(src && (inCover || /\.(png|jpe?g|webp)|oaiusercontent|openai|image/i.test(src))) return coverFromUrl(src);
    return;
  }
  handleFiles(files.filter(f=>!isImg(f)));
});
// paste an image (e.g. "Bild kopieren" in ChatGPT, then Ctrl+V) → cover
document.addEventListener("paste", e=>{
  const it = [...((e.clipboardData && e.clipboardData.items) || [])].find(i => i.kind === "file" && /^image\//.test(i.type));
  if(!it) return; const f = it.getAsFile(); if(!f) return;
  e.preventDefault(); coverFromFile(f);
});

