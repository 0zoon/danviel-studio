/* v16.5: the builder starts from the style you picked and changes nothing when it opens; only what you touch is laid on top */
let VSB_BASE = null; const VSB_TOUCH = new Set();
const VSB_MAP = {Viz:["viz"], C1:["pal","tint","blobCols","glow","flash"], C2:["pal","tint","blobCols","tglow"], C3:["pal"], Bg:["bg"], Font:["tfont","tw","tscale"], Cfx:["cfx"], Camt:["camt"],
  Glow:["glow","pulse"], Grid:["grid"], Scan:["scan"], Grain:["grain"], Vign:["vignette"], Glitch:["glitch"], Blobs:["blobs","blobCols"], Round:["round"], Upper:["tcase"], Tglow:["tglow"], Tpulse:["tpulse"],
  Stars:["stars"], Flash:["flash"], Rain:["rain"], Snow:["snow"], Embers:["embers"], Leak:["leak"], Bokeh:["bokeh"], Dust:["dust"], Name:[]};
function vsbFromStyle(st, key){
  const P = st.pal || {}, hex = c => /^#[0-9a-f]{6}$/i.test(c||"") ? c : null, font = Object.keys(CXF).find(k=>CXF[k].fam === st.tfont) || "narrow";
  const nm = (document.querySelector(`#vStyle [data-s="${key}"]`) || {}).textContent || st.name || "Style";
  return {name: (nm + " " + ((window.__T||(x=>x))("eigen"))).slice(0, 28), viz: st.viz || "bars", c1: hex(P.accent) || "#e8a93a", c2: hex(P.accent2) || "#ffffff", c3: hex(P.accent3) || "#ffffff", bg: hex(st.bg) || "#0b0b10", font,
    cfx: st.cfx || (st.pulse ? "pulse" : "none"), camt: Math.round((st.camt || (st.pulse ? Math.min(1, st.pulse*10) : 0.5))*100), glow: !!st.glow, grid: !!st.grid, scan: !!st.scan, grain: !!st.grain, vign: !!st.vignette, glitch: !!st.glitch,
    blobs: !!st.blobs, round: !!st.round, upper: st.tcase !== "none", tglow: !!st.tglow, tpulse: !!st.tpulse, stars: !!st.stars, flash: !!st.flash, rain: !!st.rain, snow: !!st.snow, embers: !!st.embers, leak: !!st.leak, bokeh: !!st.bokeh, dust: !!st.dust};
}
function vsbPrefill(){ const k = VID.style === "__draft" ? VSB_BASE : VID.style, st = VSTYLES[k]; if(!st) return; VSB_TOUCH.clear();
  if(st.custom){ VSB_BASE = null; vsbFill(st.data); return; } VSB_BASE = k; try{ vsbFill(vsbFromStyle(st, k)); }catch(e){} }
function vsbLive(){ const d = vsbRead(); let st = vsBuild(d);
  if(VSB_BASE && VSTYLES[VSB_BASE] && !VSTYLES[VSB_BASE].custom){ const m = {...VSTYLES[VSB_BASE], custom:true, name:d.name, data:d}; VSB_TOUCH.forEach(k=>(VSB_MAP[k]||[]).forEach(p=>{ m[p] = st[p]; })); st = m; }
  VSTYLES.__draft = st; VID.style = "__draft"; vStyleUi(); try{ document.fonts.load(`${CXF[d.font].w} 60px ${CXF[d.font].fam}`).then(()=>previewSoon()); }catch(e){} previewSoon(); }
VSB.forEach(k=>{ const el = $("vsb"+k); el.addEventListener(el.type==="text" || el.type==="color" || el.type==="range" ? "input" : "change", ()=>{ VSB_TOUCH.add(k); if(k !== "Name" || VID.style === "__draft") vsbLive(); }); });
$("vsb").addEventListener("toggle", ()=>{ if($("vsb").open && VID.style !== "__draft") vsbPrefill(); });
$("vsbSave").onclick = ()=>{ const d = vsbRead(); const k = vsSlug(d.name); VSTYLES[k] = VSTYLES.__draft && VSTYLES.__draft.data === d ? VSTYLES.__draft : (VID.style === "__draft" && VSTYLES.__draft ? {...VSTYLES.__draft, name:d.name, data:d} : vsBuild(d)); VSB_BASE = null; VSB_TOUCH.clear(); delete VSTYLES.__draft; VID.style = k; vsSaveAll(); vStyleUi(); previewSoon(); saveSoon();
  $("vsbNote").textContent = `„${d.name}“ gespeichert. Du findest ihn oben mit ★.`; };
$("vsbDel").onclick = ()=>{ const k = VID.style; if(!k.startsWith("u_")) return; const n = VSTYLES[k].name; delete VSTYLES[k]; vsSaveAll(); VID.style = "classic"; vStyleUi(); previewSoon(); saveSoon(); $("vsbNote").textContent = `„${n}“ gelöscht.`; };
$("vsbExport").onclick = ()=>{ const d = vsbRead(); deliver(new Blob([JSON.stringify({danvielStyle:1, ...d}, null, 2)], {type:"application/json"}), safeName("Visualizer-Style - " + d.name) + ".json"); };
$("vsbImport").onclick = ()=>$("vsbFile").click();
$("vsbFile").onchange = async e=>{ const f = e.target.files[0]; e.target.value = ""; if(!f) return;
  try{ if(f.size > 20000) throw 0; const o = JSON.parse(await f.text()); const list = Array.isArray(o) ? o : [o]; let n = 0, last = "";
    list.slice(0,20).forEach(x=>{ const d = vsClean(x); if(!d) return; last = vsSlug(d.name); VSTYLES[last] = vsBuild(d); n++; });
    if(!n) throw 0; vsSaveAll(); VID.style = last; vsbFill(VSTYLES[last].data); vStyleUi(); previewSoon(); saveSoon(); $("vsbNote").textContent = `${n} Style${n>1?"s":""} importiert.`;
  } catch(err){ $("vsbNote").textContent = "Diese Datei ist kein DANVIEL-Visualizer-Style."; } };
setTimeout(()=>{ vsLoadAll(); vStyleUi(); }, 0);   // after the cover fonts (CXF) exist
$("vAspect").onclick = e=>{ const v = e.target.dataset && e.target.dataset.v; if(!v) return; VID.aspect = v; document.querySelectorAll("#vAspect button").forEach(b=>b.setAttribute("aria-pressed", b.dataset.v===v)); previewSoon(); saveSoon(); };
["vTitle","vArtist","lText"].forEach(id=>$(id).addEventListener("input", ()=>{ if(id==="vTitle") titleAuto = false; if(id==="vArtist") artistAuto = false; if(id!=="lText") syncFname(); previewSoon(); saveSoon(); }));
["vLyr","vBrand"].forEach(id=>$(id).addEventListener("change", ()=>{ previewSoon(); saveSoon(); }));
$("vBrandTxt").addEventListener("input", ()=>{ previewSoon(); saveSoon(); });
$("vLogoBtn").onclick = ()=>$("vLogo").click();
$("vLogo").onchange = async e=>{ const f = e.target.files[0]; e.target.value = ""; if(!f) return;
  try{ VID.logo = await createImageBitmap(f); VID.logoUrl = await imageToDataUrl(VID.logo, 512, "image/png"); $("vLogoName").textContent = f.name; $("vLogoClr").hidden = false; previewSoon(); saveSoon(); }
  catch(err){ $("vLogoName").textContent = "Dieses Bild konnte nicht gelesen werden."; } };
$("vLogoClr").onclick = ()=>{ VID.logo = null; VID.logoUrl = ""; $("vLogoName").textContent = "optional, PNG mit transparentem Hintergrund passt am besten"; $("vLogoClr").hidden = true; previewSoon(); saveSoon(); };
// images are kept inside the project as small data URLs, so a project opens with cover and logo on any computer
async function imageToDataUrl(img, max, type){
  const sc = Math.min(1, max/Math.max(img.width, img.height)), c = document.createElement("canvas");
  c.width = Math.round(img.width*sc); c.height = Math.round(img.height*sc); c.getContext("2d").drawImage(img, 0, 0, c.width, c.height);
  return c.toDataURL(type, 0.85);
}
async function dataUrlToBitmap(u){ const r = await fetch(u); return createImageBitmap(await r.blob()); }

