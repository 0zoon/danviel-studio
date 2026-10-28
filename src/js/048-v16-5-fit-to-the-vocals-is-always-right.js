/* v16.5: "fit to the vocals" is always right there as soon as there are lyrics (from Suno, pasted or recognised) */
function lAutoTopUi(){ const b = $("lAutoTop"); if(!b) return; const has = !!($("lText").value.trim() || $("lPaste").value.trim()); b.hidden = !has || !tracks.length; const b3 = $("lTap3Top"); if(b3) b3.hidden = b.hidden; }
$("lAutoTop").onclick = ()=>{ if(!$("lPaste").value.trim() && $("lText").value.trim()) $("lPaste").value = $("lText").value.split(/\r?\n/).map(l=>l.replace(/^\s*\d+:\d{1,2}(?:[.,]\d+)?\s+/, "")).join("\n");
  if(!$("lPaste").value.trim()) return; $("lAuto").click(); };
["input","change"].forEach(ev=>{ $("lText").addEventListener(ev, lAutoTopUi); $("lPaste").addEventListener(ev, lAutoTopUi); });
setInterval(lAutoTopUi, 1500); lAutoTopUi();

$("lTap3").onclick = ()=>tapBegin(3); $("lTap3Top").onclick = ()=>tapBegin(3);
const mq = matchMedia("(prefers-color-scheme: dark)"); mq.addEventListener && mq.addEventListener("change", drawWaves);
