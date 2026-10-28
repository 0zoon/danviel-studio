/* =====================================================================
   VIDEO: visualizer + cover + lyrics, rendered frame by frame and encoded to H.264
   ===================================================================== */
// "DAN - Until Four (MEGA) [Is_MAX_MODE...]" -> artist "DAN", title "Until Four"
function titleFromFile(name){
  const tags = /\b(?:mega|master(?:ed)?|mixdown|stems?|final|v\d+|quality|max|wav|mp3|320|bounce|export|demo|rough)\b/i;
  let t = name.replace(/\.[^.]+$/, "").replace(/_/g, " ").replace(/\[[^\]]*\]/g, " ")
    .replace(/\(([^)]*)\)/g, (m, inner)=> tags.test(inner) || /^[A-Z0-9 ]{2,}$/.test(inner.trim()) ? " " : m)
    .replace(/\s+/g, " ").trim();
  for(let k=0;k<4;k++) t = t.replace(/[\s-]+(?:master(?:ed)?|final|mixdown|bounce|export|stems?|v\d+)$/i, "").trim();
  let artist = "";
  const m = t.match(/^(.+?)\s+[-–—]\s+(.+)$/); if(m){ artist = m[1].trim(); t = m[2].trim(); }
  return {title: t, artist};
}
let titleAuto = true, artistAuto = true, fnameManual = false;
/* ---- one naming scheme for every file: "Artist - Titel (Zusatz)" ---- */
const safeName = s => s.replace(/[\\/:*?"<>|]+/g, "_").replace(/\s+/g, " ").trim();
function fileBase(){
  const f = $("fname").value.trim(), t = $("vTitle").value.trim(), a = $("vArtist").value.trim();
  if(fnameManual && f) return safeName(f);
  if(t) return safeName((a ? a + " - " : "") + t);
  return safeName(f || "Mix");
}
// which part of the song is in the export: only the beat (vocals off) or only the vocals
function selTag(){
  const on = tracks.filter(t=>t.on); if(!on.length || on.length === tracks.length || tracks.length < 2) return "";
  const vox = t => ["lead","bv"].includes(role(t.name));
  if(!tracks.some(vox)) return "";
  if(on.every(t=>!vox(t))) return "Beat";
  if(on.every(vox)) return "Vocals";
  return "";
}
// "Hook 30s" / "Ausschnitt 30s" when only the section is exported
function sectionTag(){
  if(!($("onlyAB").checked && AB.a!==null && AB.b!==null)) return "";
  return (SEC.hook ? "Hook " : "Ausschnitt ") + Math.round((AB.b-AB.a)/rate) + "s";
}
function fileName(parts, ext){
  const extra = parts.filter(Boolean).map(x=>window.__T ? window.__T(String(x)) : x);
  return fileBase() + (extra.length ? " (" + extra.join(", ") + ")" : "") + "." + ext;
}
function syncFname(){ if(!fnameManual){ const t = $("vTitle").value.trim(), a = $("vArtist").value.trim(); if(t) $("fname").value = (a ? a + " - " : "") + t; } }
$("fname").addEventListener("input", ()=>{ fnameManual = !!$("fname").value.trim(); });
function autoTitle(fileName){
  const {title, artist} = titleFromFile(fileName);
  if(titleAuto || !$("vTitle").value.trim()){ $("vTitle").value = title; titleAuto = true; }
  if(artist && (artistAuto || !$("vArtist").value.trim())){ $("vArtist").value = artist; artistAuto = true; }
  fnameManual = false; syncFname();
  previewSoon();
}
const VID = {aspect:"v", cover:null, coverBg:null, job:0, style:"classic", tp:{pos:"auto", align:"auto", font:"style", size:100, free:null}};
// Visualizer looks. Classic takes its colours from the cover, the others bring their own palette, background treatment,
// visualizer shape, title font and overlays (scanlines, film grain, vignette).
const VSTYLES = {
  classic:{viz:"bars"},
  neon:   {pal:{accent:"#ff2bd6", accent2:"#22e4ff"}, bg:"#0b0418", tint:["rgba(255,43,214,.32)","rgba(34,228,255,.24)"], viz:"neon", glow:"#ff2bd6", pulse:0.025,
           tfont:'"Big Shoulders Display", Impact, sans-serif'},
  cyber:  {pal:{accent:"#fcee0a", accent2:"#00f0ff"}, bg:"#06060b", tint:["rgba(0,240,255,.22)","rgba(255,0,110,.24)"], viz:"led", grid:true, scan:true, glitch:true,
           tfont:'"Unbounded", "Big Shoulders Display", Impact, sans-serif', tscale:0.62},
  night:  {round:true, pal:{accent:"#ff1f3d", accent2:"#ff7a5c"}, bg:"#050102", tint:["rgba(255,20,50,.38)","rgba(110,0,18,.30)"], viz:"ring", grain:true, vignette:0.9, glow:"#ff1f3d", pulse:0.03,
           tfont:'"DM Serif Display", Georgia, serif', tcase:"none", tscale:0.82},
  pastel: {pal:{accent:"#ff7eb6", accent2:"#ffd66b"}, bg:"#2b1b40", tint:["rgba(255,126,182,.50)","rgba(124,170,255,.45)"], viz:"dots", blobs:true,
           tfont:'"Unbounded", "Big Shoulders Display", Impact, sans-serif', tscale:0.62},
  minimal:{pal:{accent:"#ffffff", accent2:"#9aa3ae"}, bg:"#0a0a0a", tint:null, viz:"line", mono:true},
  gold:   {pal:{accent:"#f6c766", accent2:"#d4911f", accent3:"#fff3d6"}, bg:"#0c0906", tint:["rgba(232,169,58,.30)","rgba(120,70,10,.30)"], viz:"mirror", glow:"#e8a93a", pulse:0.02, grain:true, vignette:0.8, bokeh:true,
           tfont:'"Unbounded", "Big Shoulders Display", Impact, sans-serif', tscale:0.62},
  rainy:  {pal:{accent:"#9cc7ff", accent2:"#e8f1ff", accent3:"#ffffff"}, bg:"#05080f", tint:["rgba(80,130,220,.30)","rgba(20,40,90,.35)"], viz:"line", rain:true, vignette:0.85, grain:true,
           tfont:'"DM Serif Display", Georgia, serif', tcase:"none", tscale:0.82},
  ice:    {pal:{accent:"#7ff0ff", accent2:"#ffffff", accent3:"#b8f4ff"}, bg:"#03101a", tint:["rgba(127,240,255,.28)","rgba(40,120,200,.28)"], viz:"circle", glow:"#7ff0ff", pulse:0.02, snow:true, stars:true},
  sunset: {pal:{accent:"#ff8a3d", accent2:"#ff3d7f", accent3:"#ffd36b"}, bg:"#1a0710", tint:["rgba(255,138,61,.40)","rgba(255,61,127,.36)"], viz:"area", blobs:true, blobCols:["rgba(255,138,61,.5)","rgba(255,61,127,.45)","rgba(255,211,107,.35)","rgba(255,61,127,.35)"], leak:true, nameShadow:true, acol:"#fff1dc",
           tfont:'"Unbounded", "Big Shoulders Display", Impact, sans-serif', tscale:0.62},
  ember:  {pal:{accent:"#ff6a2a", accent2:"#ffb347", accent3:"#ffe0b0"}, bg:"#0a0302", tint:["rgba(255,106,42,.32)","rgba(120,20,0,.34)"], viz:"sparkle", glow:"#ff6a2a", pulse:0.03, embers:true, vignette:0.9},
  vapor:  {pal:{accent:"#ff71ce", accent2:"#01cdfe", accent3:"#b967ff"}, bg:"#14052b", tint:["rgba(255,113,206,.34)","rgba(1,205,254,.28)"], viz:"pixel", grid:true, scan:true,
           tfont:'"Unbounded", "Big Shoulders Display", Impact, sans-serif', tscale:0.62},
  film:   {pal:{accent:"#f3efe6", accent2:"#a39b8d"}, bg:"#0b0a09", tint:null, viz:"bars", mono:true, grain:true, dust:true, vignette:0.95,
           tfont:'"DM Serif Display", Georgia, serif', tcase:"none", tscale:0.82},
};
const vStyle = () => VID.lockStyle || VSTYLES[VID.style] || VSTYLES.classic;   // while a video is being made, the style is frozen (lockStyle)
// ---- own styles: pure data (colours, shape, font, switches), so a shared style file can never run code ----
const VS_KEYS = ["bars","neon","led","ring","dots","line","mirror","area","pixel","circle","sparkle","none"], VS_CFX = ["none","pulse","breathe","spin","tilt","shake"], HEX = /^#[0-9a-f]{6}$/i;
const hexA = (h, a) => `rgba(${parseInt(h.slice(1,3),16)},${parseInt(h.slice(3,5),16)},${parseInt(h.slice(5,7),16)},${a})`;
function vsClean(o){
  if(!o || typeof o !== "object") return null;
  const c = k => HEX.test(o[k]||"") ? o[k].toLowerCase() : null;
  const d = {name: String(o.name||"Mein Style").replace(/[<>"]/g,"").slice(0,24).trim() || "Mein Style", viz: VS_KEYS.includes(o.viz) ? o.viz : "bars",
    c1: c("c1") || "#ff2bd6", c2: c("c2") || "#22e4ff", c3: c("c3") || "#ffffff", bg: c("bg") || "#0b0418", font: (typeof CXF !== "undefined" && CXF[o.font]) ? o.font : "narrow",
    cfx: VS_CFX.includes(o.cfx) ? o.cfx : "none", camt: Math.max(10, Math.min(100, Math.round(+o.camt || 50)))};
  ["glow","grid","scan","grain","vign","glitch","blobs","round","tglow","tpulse","stars","flash","rain","snow","embers","leak","bokeh","dust"].forEach(k=>d[k] = !!o[k]); d.upper = o.upper !== false;
  return d;
}
function vsBuild(d){
  const f = CXF[d.font] || CXF.narrow;
  return {custom:true, name:d.name, data:d, pal:{accent:d.c1, accent2:d.c2, accent3:d.c3}, bg:d.bg, cfx:d.cfx, camt:d.camt/100, tglow: d.tglow ? d.c2 : null, tpulse:d.tpulse, stars:d.stars, flash: d.flash ? d.c1 : null, tint:[hexA(d.c1,.3), hexA(d.c2,.24)], viz:d.viz,
    glow: d.glow ? d.c1 : null, pulse: d.glow ? 0.025 : 0, grid:d.grid, scan:d.scan, grain:d.grain, vignette: d.vign ? 0.85 : 0, glitch:d.glitch,
    blobs:d.blobs, blobCols:[hexA(d.c1,.55), hexA(d.c2,.5), hexA(d.c1,.35), hexA(d.c2,.4)], round:d.round,
    tfont:f.fam, tw: f.w, tcase: d.upper ? "" : "none", tscale: f.big ? 1 : 0.8, rain:d.rain, snow:d.snow, embers:d.embers, leak:d.leak, bokeh:d.bokeh, dust:d.dust};
}
const vsSlug = n => "u_" + n.toLowerCase().replace(/[^a-z0-9äöüß]+/g,"-").replace(/^-|-$/g,"").slice(0,24);
function vsLoadAll(){ try{ (JSON.parse(localStorage.getItem("stemmixer:vstyles")||"[]")||[]).forEach(o=>{ const d = vsClean(o); if(d) VSTYLES[vsSlug(d.name)] = vsBuild(d); }); }catch(e){} }
function vsSaveAll(){ try{ localStorage.setItem("stemmixer:vstyles", JSON.stringify(Object.keys(VSTYLES).filter(k=>k.startsWith("u_")).map(k=>VSTYLES[k].data))); }catch(e){} }
const NOISE = (()=>{ const c = document.createElement("canvas"); c.width = c.height = 256; const g = c.getContext("2d"), d = g.createImageData(256,256);
  for(let i=0;i<d.data.length;i+=4){ const v = Math.random()*255; d.data[i]=d.data[i+1]=d.data[i+2]=v; d.data[i+3]=255; } g.putImageData(d,0,0); return c; })();
const SCAN = (()=>{ const c = document.createElement("canvas"); c.width = 8; c.height = 6; const g = c.getContext("2d"); g.fillStyle = "rgba(0,0,0,.28)"; g.fillRect(0,0,8,2); return c; })();
const bassOf = b => b ? (b[0]+b[1]+b[2]+b[3])/4 : 0;
const ASPECTS = {v:[1080,1920], s:[1080,1080], w:[1920,1080]};
const VC = {bg:"#0e1115", accent:"#f0a23a", accent2:"#f7c873", text:"#f4f5f7", dim:"rgba(244,245,247,.42)"};
const DEFAULT_PAL = {accent:"#f0a23a", accent2:"#f7c873"};
// Pull two vivid colours out of the cover (hue histogram weighted by saturation), brightened so they read on a dark video
function coverPalette(img){
  const n = 48, c = document.createElement("canvas"); c.width = c.height = n; const g = c.getContext("2d");
  g.drawImage(img, 0, 0, n, n); const d = g.getImageData(0, 0, n, n).data;
  const bins = Array.from({length:24}, ()=>({w:0, r:0, g:0, b:0}));
  for(let i=0;i<d.length;i+=4){
    const r=d[i]/255, gg=d[i+1]/255, b=d[i+2]/255, mx=Math.max(r,gg,b), mn=Math.min(r,gg,b), l=(mx+mn)/2, ch=mx-mn;
    if(ch < 0.08 || l < 0.12 || l > 0.92) continue;
    const sat = ch/(1-Math.abs(2*l-1)); let h = mx===r ? ((gg-b)/ch)%6 : mx===gg ? (b-r)/ch+2 : (r-gg)/ch+4; h = (h*60+360)%360;
    const bin = bins[Math.floor(h/15)%24], w = sat*sat*(0.4+l);
    bin.w += w; bin.r += d[i]*w; bin.g += d[i+1]*w; bin.b += d[i+2]*w;
  }
  const order = bins.map((b,i)=>({...b, i})).filter(b=>b.w>0).sort((a,b)=>b.w-a.w);
  if(!order.length) return DEFAULT_PAL;
  const pick = b => vivid(b.r/b.w, b.g/b.w, b.b/b.w);
  const first = order[0], second = order.find(b=>Math.min(Math.abs(b.i-first.i), 24-Math.abs(b.i-first.i)) >= 3 && b.w > first.w*0.15);
  const a1 = pick(first);
  return {accent:a1, accent2: second ? pick(second) : vivid(first.r/first.w, first.g/first.w, first.b/first.w, 0.82)};
}
function vivid(r, g, b, lMin = 0.62){
  r/=255; g/=255; b/=255; const mx=Math.max(r,g,b), mn=Math.min(r,g,b); let h=0, s=0, l=(mx+mn)/2; const ch=mx-mn;
  if(ch){ s = ch/(1-Math.abs(2*l-1)); h = mx===r ? ((g-b)/ch)%6 : mx===g ? (b-r)/ch+2 : (r-g)/ch+4; h = (h*60+360)%360; }
  s = Math.max(s, 0.6); l = Math.min(0.8, Math.max(l, lMin));
  return `hsl(${Math.round(h)} ${Math.round(s*100)}% ${Math.round(l*100)}%)`;
}

// v16.5: where the lead vocal really stops in each line (from the lead vocal stem), so the karaoke sweep doesn't drag through instrumental parts
function lyrLead(){ return tracks.find(t=>t.on && !t.isMidi && role(t.name) === "lead") || tracks.find(t=>!t.isMidi && role(t.name) === "lead") || null; }
function lyrEnv(t){ const b = t.buffer; if(t._venv && t._venv.b === b) return t._venv; const fs = b.sampleRate, hop = Math.round(fs*0.04), L = b.getChannelData(0), R = b.numberOfChannels > 1 ? b.getChannelData(1) : L, n = Math.floor(L.length/hop), e = new Float32Array(n); let pk = 0;
  for(let k=0;k<n;k++){ let ss = 0; const o = k*hop; for(let i=0;i<hop;i+=2){ const x = (L[o+i] + R[o+i])*0.5; ss += x*x; } e[k] = Math.sqrt(ss/(hop/2)); if(e[k] > pk) pk = e[k]; }
  return t._venv = {b, e, hop: 0.04, thr: Math.max(pk*0.08, 0.002), shift: (t.shift||0)}; }
function lyrSungEnds(lines){
  const lt = lyrLead(); if(!lt || !lines.length) return lines;
  let E; try{ E = lyrEnv(lt); }catch(e){ return lines; }
  // the envelope is in the original song's time, the lyrics in the time you hear (Slowed / Sped Up): q converts between them
  const orig = Math.max(...tracks.map(t=>t.buffer.duration)), q = orig > 0 && duration ? (duration/rate)/orig : 1;
  const gapN = Math.round(0.5/(E.hop*q));   // a pause of half a second (as heard) ends the line
  return lines.map((l, i)=>{ const nx = lines[i+1], a = l.t, z = nx ? nx.t : l.end; let last = -1, quiet = 0, voiced = 0;
    for(let k = Math.max(0, Math.floor((a/q - E.shift)/E.hop)); k < Math.min(E.e.length, Math.ceil((z/q - E.shift)/E.hop)); k++){
      if(E.e[k] > E.thr){ last = k; quiet = 0; voiced++; } else if(voiced*E.hop*q >= 0.4 && ++quiet >= gapN) break; }
    const send = last < 0 ? l.end : Math.min(z, Math.max(a + 0.4, ((last + 1)*E.hop + E.shift)*q + 0.12));
    return {...l, send}; });
}
window.__lyrEnds = () => lyrSungEnds(parseLyrics($("lText").value, LYR.dur || 60)).map(l=>[+l.t.toFixed(2), +l.send.toFixed(2), +l.end.toFixed(2)]);
function parseLyrics(text, dur){
  const rows = text.split(/\r?\n/).map(l=>l.trim()).filter(Boolean);
  const out = rows.map(r=>{ const m = r.match(/^(\d+):(\d{1,2}(?:[.,]\d+)?)\s+(.*)$/); return m ? {t:+m[1]*60 + parseFloat(m[2].replace(",",".")), text:m[3]} : {t:null, text:r}; });
  if(!out.length) return [];
  if(out.every(l=>l.t===null)){ const step = dur/(out.length+1); out.forEach((l,i)=>l.t = step*(i+0.5)); }
  else { let last = 0; out.forEach((l,i)=>{ if(l.t===null){ const nx = out.slice(i+1).find(x=>x.t!==null); l.t = nx ? (last + nx.t)/2 : last + 2.5; } last = l.t; }); }
  out.sort((a,b)=>a.t-b.t);
  out.forEach((l,i)=>{ const nx = out[i+1]; l.end = nx ? Math.min(nx.t, l.t+7) : l.t+5; });
  return out;
}
function wrapText(g, text, maxW){
  const words = text.split(/\s+/), lines = []; let cur = "";
  for(const w of words){ const tryL = cur ? cur+" "+w : w; if(g.measureText(tryL).width > maxW && cur){ lines.push(cur); cur = w; } else cur = tryL; }
  if(cur) lines.push(cur); return lines;
}
// v16.5: in full-screen picture mode the visualizer and the lyrics can be placed and sized freely (stored as fractions of the frame)
VID.boxes = VID.boxes || {};
// safe area for the cover: never over the watermark (top) or the signature / progress bar (bottom), never outside the frame
function coverSafe(W, H, Lo){ const m = Math.round(Math.min(W, H)*0.04); return {x0: m, x1: W - m, y0: Math.round(H*(W > H ? 0.11 : 0.085)), y1: Lo.prog.y - Math.round(Math.min(W, H)*0.13)}; }
function coverClamp(c, W, H, Lo){ const A = coverSafe(W, H, Lo), mx = Math.min(A.x1 - A.x0, A.y1 - A.y0), s = Math.max(Math.min(W, H)*0.15, Math.min(c.s, mx));
  return {s, x: Math.max(A.x0, Math.min(A.x1 - s, c.x)), y: Math.max(A.y0, Math.min(A.y1 - s, c.y))}; }
function layoutFree(Lo, W, H, S){
  const B = VID.boxes || {}, asp = W > H ? "w" : W === H ? "s" : "v", full = S.full && VID.cover, out = {...Lo, bars0: Lo.bars, align0: Lo.lyr.align}, m = Math.min(W, H);
  if(!full && B["cover_" + asp]){ const c = B["cover_" + asp]; out.cover = coverClamp({x: c.x*W, y: c.y*H, s: c.s*m}, W, H, Lo); }
  const vz = B["viz_" + asp], ly = B["lyr_" + asp];
  if(vz) out.bars = {x: vz.x*W, y: vz.y*H, w: vz.w*W, h: vz.h*H};
  if(ly) out.lyr = {...Lo.lyr, y: ly.y*H, size: Math.round(Lo.lyr.size*ly.s), w: Math.min(W*0.94, Lo.lyr.w*ly.s), align: "center", x: ly.x*W};
  else if(full) out.lyr = {...Lo.lyr, align: "center", x: W/2, y: Math.round(H*(W > H ? 0.40 : W === H ? 0.42 : 0.56)), w: W > H ? W*0.7 : Lo.lyr.w};
  return out;
}
// v16.5: no lyrics in the video (and no full-screen picture) -> the cover gets the free space
function layoutBig(Lo, W, H, S){
  const noLyr = !S.lyrOn || !(S.lines && S.lines.length);
  if(!noLyr || (S.full && VID.cover)) return Lo;
  if(W > H) return {...Lo, cover:{x:140, y:100, s:650}, tx:900, tw:W-900-130, title:{y:300, size:100}, artist:{y:372, size:46}};
  if(W === H) return {...Lo, cover:{x:(W-520)/2, y:80, s:520}, title:{y:700, size:76}, artist:{y:755, size:38}};
  return {...Lo, cover:{x:(W-860)/2, y:230, s:860}, title:{y:1225, size:92}, artist:{y:1290, size:44}};
}
function layout(W, H){
  // v16.3: the visualizer always ends above the "Danviel" signature, so both stay clearly visible (cover and text moved up a little)
  if(W > H) return {cover:{x:150, y:160, s:560}, tx:820, tw:W-820-140, title:{y:280, size:96}, artist:{y:350, size:44}, lyr:{y:540, size:60, w:W-820-140, align:"left"}, bars:{x:150, y:792, w:W-300, h:110}, prog:{y:1030}, brand:{x:150, y:110}};
  if(W === H) return {cover:{x:(W-400)/2, y:100, s:400}, tx:W/2, tw:W-160, title:{y:590, size:76}, artist:{y:645, size:38}, lyr:{y:750, size:52, w:W-160, align:"center"}, bars:{x:90, y:818, w:W-180, h:90}, prog:{y:1030}, brand:{x:W/2, y:70, center:true}};
  return {cover:{x:(W-680)/2, y:250, s:680}, tx:W/2, tw:W-160, title:{y:1070, size:92}, artist:{y:1135, size:44}, lyr:{y:1320, size:64, w:W-160, align:"center"}, bars:{x:100, y:1545, w:W-200, h:150}, prog:{y:1820}, brand:{x:W/2, y:140, center:true}};
}
function makeBg(W, H){
  const c = document.createElement("canvas"); c.width = W; c.height = H; const g = c.getContext("2d"), ST = vStyle();
  g.fillStyle = ST.bg || VC.bg; g.fillRect(0,0,W,H);
  if(ST.bg){   // styled background: cover only as a dark, coloured haze
    if(VID.cover){ g.save(); g.filter = `blur(80px) brightness(${ST.mono ? .35 : .4}) saturate(${ST.mono ? 0 : 1.2})`; g.globalAlpha = .7;
      const sc = Math.max(W/VID.cover.width, H/VID.cover.height)*1.2, w = VID.cover.width*sc, h = VID.cover.height*sc; g.drawImage(VID.cover, (W-w)/2, (H-h)/2, w, h); g.restore(); }
    if(ST.tint){ const a = g.createRadialGradient(W*0.15, H*0.2, 0, W*0.15, H*0.2, Math.max(W,H)*0.75); a.addColorStop(0, ST.tint[0]); a.addColorStop(1, "rgba(0,0,0,0)"); g.fillStyle = a; g.fillRect(0,0,W,H);
      const b = g.createRadialGradient(W*0.9, H*0.85, 0, W*0.9, H*0.85, Math.max(W,H)*0.75); b.addColorStop(0, ST.tint[1]); b.addColorStop(1, "rgba(0,0,0,0)"); g.fillStyle = b; g.fillRect(0,0,W,H); }
    const v = g.createLinearGradient(0,0,0,H); v.addColorStop(0,"rgba(0,0,0,.1)"); v.addColorStop(1,"rgba(0,0,0,.5)"); g.fillStyle = v; g.fillRect(0,0,W,H);
    return c;
  }
  if(VID.cover){
    g.save(); g.filter = "blur(70px) brightness(.5) saturate(1.45)";
    const sc = Math.max(W/VID.cover.width, H/VID.cover.height)*1.2, w = VID.cover.width*sc, h = VID.cover.height*sc;
    g.drawImage(VID.cover, (W-w)/2, (H-h)/2, w, h); g.restore();
  } else {
    const gr = g.createRadialGradient(W*0.5, H*0.25, 0, W*0.5, H*0.3, Math.max(W,H)*0.8);
    gr.addColorStop(0, "rgba(240,162,58,.28)"); gr.addColorStop(0.5, "rgba(240,162,58,.06)"); gr.addColorStop(1, "rgba(0,0,0,0)");
    g.fillStyle = gr; g.fillRect(0,0,W,H);
  }
  const v = g.createLinearGradient(0,0,0,H); v.addColorStop(0,"rgba(0,0,0,.15)"); v.addColorStop(1,"rgba(0,0,0,.55)"); g.fillStyle = v; g.fillRect(0,0,W,H);
  return c;
}
function roundRect(g, x, y, w, h, r){ g.beginPath(); g.moveTo(x+r,y); g.arcTo(x+w,y,x+w,y+h,r); g.arcTo(x+w,y+h,x,y+h,r); g.arcTo(x,y+h,x,y,r); g.arcTo(x,y,x+w,y,r); g.closePath(); }
function drawUnder(g, W, H, t, ST, S, bass){
  if(ST.grid){   // retro perspective floor, scrolling towards you
    const hy = H*0.62, col = S.pal.accent2; g.save(); g.globalAlpha = .55;
    const hz = g.createLinearGradient(0, hy-120, 0, hy+20); hz.addColorStop(0, "rgba(255,0,110,0)"); hz.addColorStop(1, "rgba(255,0,110,.35)"); g.fillStyle = hz; g.fillRect(0, hy-120, W, 140);
    g.strokeStyle = col; g.lineWidth = 2; g.shadowColor = col; g.shadowBlur = 12;
    for(let k=0;k<14;k++){ const z = ((k + (t*0.8)%1)/14), y = hy + Math.pow(z, 2.2)*(H-hy); g.globalAlpha = .15 + .45*z; g.beginPath(); g.moveTo(0,y); g.lineTo(W,y); g.stroke(); }
    g.globalAlpha = .35; for(let k=-12;k<=12;k++){ g.beginPath(); g.moveTo(W/2 + k*W*0.02, hy); g.lineTo(W/2 + k*W*0.22, H); g.stroke(); }
    g.restore();
  }
  if(ST.blobs){  // soft colour clouds drifting with the music
    const cols = ST.blobCols || ["rgba(255,126,182,.55)","rgba(255,214,107,.45)","rgba(124,170,255,.5)","rgba(176,140,255,.45)"];
    g.save(); g.globalCompositeOperation = "screen";
    cols.forEach((cl,i)=>{ const x = W*(0.5 + 0.38*Math.sin(t*0.23 + i*1.7)), y = H*(0.45 + 0.35*Math.cos(t*0.19 + i*2.3)), r = Math.max(W,H)*(0.28 + 0.06*bass + 0.03*i);
      const gr = g.createRadialGradient(x,y,0,x,y,r); gr.addColorStop(0, cl); gr.addColorStop(1, "rgba(0,0,0,0)"); g.fillStyle = gr; g.fillRect(0,0,W,H); });
    g.restore();
  }
}
// v16.3 weather and light effects: subtle, drawn over everything but light enough to read the lyrics. Positions come from the time,
// so the preview and every exported frame look the same.
const hR = (k, s) => { const x = Math.sin(k*12.9898 + s*78.233)*43758.5453; return x - Math.floor(x); };
function drawFx16(g, W, H, t, ST){
  const m = Math.min(W, H) / 1080, pal = ST.pal || {};
  if(ST.leak){ g.save(); g.globalCompositeOperation = "screen";
    [[0.5, 0.13, 0.3, 0.1, "255,150,60"], [0.2, -0.09, 0.7, 0.07, "255,60,120"]].forEach(([bx, sx, by, sy, c], i)=>{ const x = W*(bx + 0.42*Math.sin(t*sx*6.3 + i)), y = H*(by + 0.2*Math.cos(t*sy*6.3 + i*2)), r = Math.max(W, H)*0.55;
      const gr = g.createRadialGradient(x, y, 0, x, y, r); gr.addColorStop(0, `rgba(${c},.20)`); gr.addColorStop(1, `rgba(${c},0)`); g.fillStyle = gr; g.fillRect(0, 0, W, H); });
    g.restore(); }
  if(ST.bokeh){ g.save(); const cols = [pal.accent || "#e8a93a", pal.accent2 || "#ffffff", "#ffffff"];
    for(let k = 0; k < 18; k++){ const r = (30 + hR(k, 1)*70)*m, sp = 8 + hR(k, 2)*14, x = (hR(k, 3)*W + Math.sin(t*0.2 + k)*40*m), y = ((hR(k, 4)*H - t*sp*m) % (H + 2*r) + H + 2*r) % (H + 2*r) - r;
      g.globalAlpha = 0.05 + hR(k, 5)*0.08 + 0.03*Math.sin(t + k); g.fillStyle = cols[k % 3]; g.beginPath(); g.arc(x, y, r, 0, 7); g.fill(); }
    g.restore(); }
  if(ST.rain){ g.save(); const n = Math.round(150*W*H/(1920*1080)); g.lineCap = "round";
    for(let k = 0; k < n; k++){ const len = (28 + hR(k, 1)*46)*m, sp = (900 + hR(k, 2)*600)*m, x0 = hR(k, 3)*W*1.15 - W*0.08, span = H + len;
      const y = ((t*sp + hR(k, 4)*span*3) % span) - len, x = x0 + y*0.12;
      g.strokeStyle = `rgba(210,225,255,${0.12 + hR(k, 5)*0.14})`; g.lineWidth = (1 + hR(k, 6)*1.2)*m; g.beginPath(); g.moveTo(x, y); g.lineTo(x + len*0.12, y + len); g.stroke(); }
    for(let k = 0; k < 14; k++){ const ph = (t*1.7 + hR(k, 7)*5) % 1, x = hR(k + Math.floor(t*1.7 + hR(k, 7)*5)*31, 8)*W, y = H*(0.82 + hR(k, 9)*0.15);
      g.strokeStyle = `rgba(210,225,255,${0.22*(1 - ph)})`; g.lineWidth = 1.2*m; g.beginPath(); g.ellipse(x, y, (4 + ph*18)*m, (1.5 + ph*5)*m, 0, 0, 7); g.stroke(); }
    g.restore(); }
  if(ST.snow){ g.save(); g.fillStyle = "#ffffff";
    for(let k = 0; k < 110; k++){ const r = (1.2 + hR(k, 1)*3)*m, sp = (35 + hR(k, 2)*70)*m, span = H + 10*m, y = ((t*sp + hR(k, 3)*span*3) % span) - 5*m, x = hR(k, 4)*W + Math.sin(t*0.8 + k)*22*m;
      g.globalAlpha = 0.35 + hR(k, 5)*0.45; g.beginPath(); g.arc(x, y, r, 0, 7); g.fill(); }
    g.restore(); }
  if(ST.embers){ g.save(); g.globalCompositeOperation = "screen"; g.shadowColor = "#ff9a3c"; g.shadowBlur = 10*m;
    for(let k = 0; k < 55; k++){ const sp = (40 + hR(k, 1)*80)*m, life = H*0.9, p = ((t*sp + hR(k, 2)*life*3) % life)/life, x = hR(k, 3)*W + Math.sin(t*1.3 + k)*30*m*p, y = H - p*life;
      g.globalAlpha = (1 - p)*0.8; g.fillStyle = k % 3 ? "#ffb347" : "#ff6a2a"; g.beginPath(); g.arc(x, y, (1.4 + hR(k, 4)*2)*m, 0, 7); g.fill(); }
    g.restore(); }
  if(ST.dust){ g.save(); const f = Math.floor(t*12);
    for(let k = 0; k < 26; k++){ g.globalAlpha = 0.18 + hR(k, f)*0.3; g.fillStyle = hR(k, f + 1) > 0.5 ? "#ffffff" : "#000000"; g.beginPath(); g.arc(hR(k, f + 2)*W, hR(k, f + 3)*H, (0.8 + hR(k, f + 4)*2)*m, 0, 7); g.fill(); }
    if(hR(f, 9) > 0.7){ g.globalAlpha = 0.12; g.strokeStyle = "#ffffff"; g.lineWidth = 1.2*m; const x = hR(f, 10)*W; g.beginPath(); g.moveTo(x, 0); g.lineTo(x + 6*m, H); g.stroke(); }
    g.restore(); }
}
function drawOver(g, W, H, t, ST){
  drawFx16(g, W, H, t, ST);
  if(ST.scan){ g.save(); g.fillStyle = g.createPattern(SCAN, "repeat"); g.fillRect(0,0,W,H); g.restore(); }
  if(ST.grain){ g.save(); g.globalAlpha = .07; g.globalCompositeOperation = "overlay"; const ox = Math.floor(Math.random()*256), oy = Math.floor(Math.random()*256);
    g.translate(-ox, -oy); g.fillStyle = g.createPattern(NOISE, "repeat"); g.fillRect(0, 0, W+256, H+256); g.restore(); }
  if(ST.vignette){ const v = g.createRadialGradient(W/2, H/2, Math.min(W,H)*0.3, W/2, H/2, Math.max(W,H)*0.75); v.addColorStop(0, "rgba(0,0,0,0)"); v.addColorStop(1, `rgba(0,0,0,${ST.vignette})`); g.fillStyle = v; g.fillRect(0,0,W,H); }
}
// fake spectrum for the preview (no rendered audio yet)
const fakeBands = t => Array.from({length:24}, (_,k)=> Math.max(0.05, 0.55 - k*0.018 + 0.22*Math.sin(k*0.7 + t*3) + (k<4 ? 0.25 : 0)));
function drawViz(g, Lo, t, S, ST, bands){
  const B = Lo.bars, pal = S.pal, mode = ST.viz || "bars";
  const val = k => bands[Math.max(0, Math.min(23, k))];
  if(mode==="bars"){
    const nb = 48, gap = 6, bw = (B.w - gap*(nb-1))/nb;
    for(let k=0;k<nb;k++){ const src = k < nb/2 ? nb/2-1-k : k-nb/2, v = val(src), h = Math.max(6, v*B.h), x = B.x + k*(bw+gap);
      const gr = g.createLinearGradient(0, B.y + B.h, 0, B.y + B.h - Math.max(h, 8)); gr.addColorStop(0, pal.accent); gr.addColorStop(1, pal.accent2);
      g.fillStyle = gr; roundRect(g, x, B.y + B.h - h, bw, h, Math.min(6, bw/2)); g.fill(); }
  } else if(mode==="neon"){   // glowing lines, mirrored up and down from the centre line
    const nb = 48, gap = B.w/nb, cy = B.y + B.h*0.55, hg = g.createLinearGradient(B.x, 0, B.x+B.w, 0); hg.addColorStop(0, pal.accent); hg.addColorStop(1, pal.accent2);
    g.save(); g.strokeStyle = hg; g.lineCap = "round"; g.lineWidth = Math.max(4, gap*0.32); g.shadowColor = pal.accent; g.shadowBlur = 24;
    for(let k=0;k<nb;k++){ const src = k < nb/2 ? nb/2-1-k : k-nb/2, h = Math.max(3, val(src)*B.h*0.62), x = B.x + gap*(k+0.5);
      g.beginPath(); g.moveTo(x, cy - h); g.lineTo(x, cy + h*0.55); g.stroke(); }
    g.restore();
  } else if(mode==="led"){    // segmented LED meter
    const nb = 32, gap = 8, bw = (B.w - gap*(nb-1))/nb, cell = 12, cg = 5, rows = Math.floor(B.h/(cell+cg));
    for(let k=0;k<nb;k++){ const src = k < nb/2 ? Math.round((nb/2-1-k)*23/(nb/2-1)) : Math.round((k-nb/2)*23/(nb/2-1)), on = Math.round(val(src)*rows), x = B.x + k*(bw+gap);
      for(let r=0;r<rows;r++){ const y = B.y + B.h - (r+1)*(cell+cg); const lit = r < on;
        g.fillStyle = !lit ? "rgba(255,255,255,.05)" : r >= rows*0.8 ? "#ff0a6e" : r >= rows*0.5 ? pal.accent : pal.accent2; g.fillRect(x, y, bw, cell); } }
  } else if(mode==="ring"){   // radial lines around the cover + a soft line along the bottom
    const c = Lo.cover, cx = c.x + c.s/2, cy = c.y + c.s/2, r0 = c.s*(VID.cover ? 0.44 : 0.5) + 14, n = 120;
    g.save(); g.strokeStyle = pal.accent; g.lineCap = "round"; g.lineWidth = Math.max(3, c.s*0.008); g.shadowColor = pal.accent; g.shadowBlur = 22;
    for(let k=0;k<n;k++){ const a = k/n*Math.PI*2 - Math.PI/2, src = Math.round(Math.abs(((k/n)*2) - 1)*23), len = 6 + val(23-src)*c.s*0.09;
      g.beginPath(); g.moveTo(cx + Math.cos(a)*r0, cy + Math.sin(a)*r0); g.lineTo(cx + Math.cos(a)*(r0+len), cy + Math.sin(a)*(r0+len)); g.stroke(); }
    g.restore();
    lineWave(g, B, bands, pal.accent, 0.5);
  } else if(mode==="dots"){   // stacked round dots, pastel gradient
    const nb = 24, gap = B.w/nb, d = Math.min(gap*0.62, 22), rows = Math.floor(B.h/(d*1.25));
    for(let k=0;k<nb;k++){ const src = k < nb/2 ? (nb/2-1-k)*2 : (k-nb/2)*2, on = Math.max(1, Math.round(val(src)*rows)), x = B.x + gap*(k+0.5);
      for(let r=0;r<on;r++){ const y = B.y + B.h - d/2 - r*d*1.25; g.fillStyle = r/rows < 0.5 ? pal.accent : r/rows < 0.8 ? pal.accent2 : "#ffffff"; g.beginPath(); g.arc(x, y, d/2, 0, 7); g.fill(); } }
  } else if(mode==="line"){
    g.fillStyle = "rgba(255,255,255,.14)"; g.fillRect(B.x, B.y + B.h/2, B.w, 1.5);
    lineWave(g, B, bands, "#ffffff", 1);
  } else if(mode==="mirror"){   // bars growing up and down from the middle
    const nb = 40, gap = 6, bw = (B.w - gap*(nb-1))/nb, cy = B.y + B.h/2;
    for(let k=0;k<nb;k++){ const src = k < nb/2 ? Math.round((nb/2-1-k)*23/(nb/2-1)) : Math.round((k-nb/2)*23/(nb/2-1)), h = Math.max(4, val(src)*B.h*0.5), x = B.x + k*(bw+gap);
      const gr = g.createLinearGradient(0, cy - h, 0, cy + h); gr.addColorStop(0, pal.accent2); gr.addColorStop(0.5, pal.accent); gr.addColorStop(1, pal.accent3 || pal.accent2);
      g.fillStyle = gr; roundRect(g, x, cy - h, bw, h*2, Math.min(5, bw/2)); g.fill(); }
  } else if(mode==="area"){     // filled, smooth spectrum
    const n = 48, pts = []; for(let k=0;k<=n;k++){ const src = k < n/2 ? n/2-1-k : k-n/2; pts.push([B.x + B.w*k/n, B.y + B.h - Math.max(2, val(Math.round(src*23/(n/2-1)))*B.h*0.95)]); }
    const gr = g.createLinearGradient(0, B.y, 0, B.y + B.h); gr.addColorStop(0, pal.accent2); gr.addColorStop(0.6, pal.accent); gr.addColorStop(1, "rgba(0,0,0,0)");
    g.save(); g.beginPath(); g.moveTo(B.x, B.y + B.h); g.lineTo(pts[0][0], pts[0][1]);
    for(let k=1;k<pts.length;k++){ const [x0,y0] = pts[k-1], [x1,y1] = pts[k]; g.quadraticCurveTo(x0, y0, (x0+x1)/2, (y0+y1)/2); }
    g.lineTo(B.x + B.w, B.y + B.h); g.closePath(); g.fillStyle = gr; g.globalAlpha = 0.85; g.fill(); g.globalAlpha = 1; g.strokeStyle = pal.accent3 || "#fff"; g.lineWidth = 3; g.shadowColor = pal.accent; g.shadowBlur = 16; g.stroke(); g.restore();
  } else if(mode==="pixel"){    // chunky retro game blocks
    const nb = 20, gap = 6, bw = (B.w - gap*(nb-1))/nb, cell = bw, rows = Math.max(3, Math.floor(B.h/(cell+gap)));
    for(let k=0;k<nb;k++){ const src = k < nb/2 ? Math.round((nb/2-1-k)*23/(nb/2-1)) : Math.round((k-nb/2)*23/(nb/2-1)), on = Math.round(val(src)*rows), x = B.x + k*(bw+gap);
      for(let r=0;r<on;r++){ const y = B.y + B.h - (r+1)*(cell+gap) + gap; g.fillStyle = r >= rows*0.75 ? (pal.accent3 || "#fff") : r >= rows*0.4 ? pal.accent2 : pal.accent; g.fillRect(x, y, bw, cell); } }
  } else if(mode==="circle"){   // thick bars around the cover, in all three colours
    const c = Lo.cover, cx = c.x + c.s/2, cy = c.y + c.s/2, r0 = c.s*0.5 + 10, n = 72;
    g.save(); g.lineCap = "round"; g.lineWidth = Math.max(6, c.s*0.022); g.shadowColor = pal.accent; g.shadowBlur = 18;
    for(let k=0;k<n;k++){ const a = k/n*Math.PI*2 - Math.PI/2, src = Math.round(Math.abs(((k/n)*2) - 1)*23), v = val(23-src), len = 8 + v*c.s*0.16;
      g.strokeStyle = v > 0.75 ? (pal.accent3 || "#fff") : v > 0.4 ? pal.accent2 : pal.accent;
      g.beginPath(); g.moveTo(cx + Math.cos(a)*r0, cy + Math.sin(a)*r0); g.lineTo(cx + Math.cos(a)*(r0+len), cy + Math.sin(a)*(r0+len)); g.stroke(); }
    g.restore();
  } else if(mode==="sparkle"){  // sparks rising with the music
    const n = 90; g.save(); g.globalCompositeOperation = "lighter";
    for(let k=0;k<n;k++){ const seed = Math.sin(k*91.7)*43758.5, rx = seed - Math.floor(seed), sp = 0.15 + ((k*37)%10)/40, ph = ((t*sp + rx*3) % 1), v = val(k % 24);
      const x = B.x + rx*B.w + Math.sin(t*2 + k)*8, y = B.y + B.h - ph*(B.h*1.6), r = 2 + v*7;
      g.globalAlpha = Math.max(0, (1 - ph)) * (0.35 + v*0.65); g.fillStyle = k % 3 === 0 ? pal.accent : k % 3 === 1 ? pal.accent2 : (pal.accent3 || "#fff");
      g.beginPath(); g.arc(x, y, r, 0, 7); g.fill(); }
    g.restore();
  }
}
function lineWave(g, B, bands, col, amt){
  const n = 48, pts = []; for(let k=0;k<=n;k++){ const src = k < n/2 ? n/2-1-k : k-n/2, v = bands[Math.max(0, Math.min(23, src))]; pts.push([B.x + B.w*k/n, B.y + B.h/2 - (k%2 ? -1 : 1)*v*B.h*0.45*amt]); }
  g.save(); g.strokeStyle = col; g.lineWidth = 4; g.lineJoin = "round"; g.shadowColor = col; g.shadowBlur = amt < 1 ? 14 : 0; g.beginPath(); g.moveTo(pts[0][0], B.y + B.h/2);
  for(let k=1;k<pts.length;k++){ const [x0,y0] = pts[k-1], [x1,y1] = pts[k]; g.quadraticCurveTo(x0, y0, (x0+x1)/2, (y0+y1)/2); }
  g.lineTo(B.x + B.w, B.y + B.h/2); g.stroke(); g.restore();
}
function drawFrame(g, W, H, t, S){
  const Lo = layoutFree(layoutBig(layout(W, H), W, H, S), W, H, S), ST = vStyle(), bands = S.bandsAt(t) || fakeBands(t), bass = bassOf(bands);
  g.drawImage(S.bg, 0, 0);
  // background video: the live frame if the browser has it, otherwise the last good frame (never silently drop the video)
  let bgv = null;
  if(VID.bgv){
    const v = VID.bgv;
    if(v.readyState >= 2 && v.videoWidth){ if(!VID.bgvLast) VID.bgvLast = document.createElement("canvas");
      const L = VID.bgvLast; if(L.width !== v.videoWidth || L.height !== v.videoHeight){ L.width = v.videoWidth; L.height = v.videoHeight; }
      try{ L.getContext("2d").drawImage(v, 0, 0); bgv = L; }catch(e){ bgv = v; } }
    else if(VID.bgvLast && VID.bgvLast.width) bgv = VID.bgvLast;
  }
  if(bgv){ // background video, cover-fit, darkened a bit so text stays readable
    const bw = bgv.videoWidth || bgv.width, bh = bgv.videoHeight || bgv.height;
    const sc = Math.max(W/bw, H/bh), w = bw*sc, h = bh*sc;
    g.drawImage(bgv, (W-w)/2, (H-h)/2, w, h);
    const sh = g.createLinearGradient(0, 0, 0, H); sh.addColorStop(0, "rgba(0,0,0,.25)"); sh.addColorStop(0.5, "rgba(0,0,0,.12)"); sh.addColorStop(1, "rgba(0,0,0,.6)"); g.fillStyle = sh; g.fillRect(0,0,W,H);
  } else if(S.full && VID.cover){   // v16.4: picture corner to corner, slow zoom, a touch of bass pulse, darker at the bottom so text stays readable
    const ci = vidCoverImg(), z = 1.02 + 0.05*((t % 40)/40) + 0.02*bass, sc = Math.max(W/ci.width, H/ci.height)*z, w = ci.width*sc, h = ci.height*sc;
    g.save(); if(ST.mono) g.filter = "grayscale(1) contrast(1.1)"; g.drawImage(ci, (W-w)/2, (H-h)/2, w, h); g.restore();
    const sh = g.createLinearGradient(0, 0, 0, H); sh.addColorStop(0, "rgba(0,0,0,.28)"); sh.addColorStop(0.45, "rgba(0,0,0,.05)"); sh.addColorStop(1, "rgba(0,0,0,.62)"); g.fillStyle = sh; g.fillRect(0, 0, W, H);
  } else drawUnder(g, W, H, t, ST, S, bass);
  if(ST.stars){ g.save(); for(let k=0;k<70;k++){ const a = Math.sin(k*12.9898)*43758.5453, b = Math.sin(k*78.233)*12345.678, x = (a - Math.floor(a))*W, y = (b - Math.floor(b))*H*0.85;
      g.globalAlpha = 0.25 + 0.75*Math.abs(Math.sin(t*(0.6 + (k%7)*0.2) + k)); g.fillStyle = k % 5 ? "#ffffff" : ST.pal.accent3 || ST.pal.accent; g.beginPath(); g.arc(x, y, 1 + (k%3)*0.8, 0, 7); g.fill(); } g.restore(); }
  if(ST.flash && bass > 0.62){ g.save(); g.globalAlpha = Math.min(0.28, (bass - 0.62)*0.9); g.fillStyle = ST.flash; g.fillRect(0, 0, W, H); g.restore(); }
  // cover or spinning record (some styles pulse with the bass, own styles can swell, breathe, spin, sway or shake)
  const A_ = ST.camt || 0.5, cf = ST.cfx || "none";
  const pz = 1 + (ST.pulse||0)*bass + (cf === "pulse" ? 0.16*A_*bass : cf === "breathe" ? 0.05*A_*Math.sin(t*1.6) : 0);
  const c0 = Lo.cover, c = {x: c0.x + c0.s*(1-pz)/2, y: c0.y + c0.s*(1-pz)/2, s: c0.s*pz};
  if(S.showCover !== false && !(S.full && VID.cover)) S.cbox = {x0: c0.x, x1: c0.x + c0.s, y0: c0.y, y1: c0.y + c0.s};
  const cRot = cf === "spin" ? t*0.35*A_ : cf === "tilt" ? Math.sin(t*1.3)*0.09*A_ : 0, cShake = cf === "shake" && bass > 0.45 ? (bass - 0.45)*30*A_ : 0;
  const cMove = cRot || cShake; if(cMove){ const mx = c.x + c.s/2, my = c.y + c.s/2; g.save(); g.translate(mx + (cShake ? Math.sin(t*53)*cShake : 0), my + (cShake ? Math.cos(t*47)*cShake : 0)); g.rotate(cRot); g.translate(-mx, -my); }
  const coverPath = ()=>{ if(ST.round){ g.beginPath(); g.arc(c.x+c.s/2, c.y+c.s/2, c.s*0.44, 0, 7); } else roundRect(g, c.x, c.y, c.s, c.s, 24); };
  if(S.showCover !== false && !(S.full && VID.cover)){
  if(ST.glow && VID.cover){ g.save(); g.shadowColor = ST.glow; g.shadowBlur = 40 + 60*bass; coverPath(); g.fillStyle = ST.glow; g.globalAlpha = .55; g.fill(); g.restore(); }
  if(VID.cover){
    g.save(); g.shadowColor = "rgba(0,0,0,.5)"; g.shadowBlur = 50; coverPath(); g.fillStyle = "#000"; g.fill(); g.restore();
    g.save(); coverPath(); g.clip();
    const ci = vidCoverImg(), sc = Math.max(c.s/ci.width, c.s/ci.height), w = ci.width*sc, h = ci.height*sc;
    if(ST.mono) g.filter = "grayscale(1) contrast(1.1)";
    g.drawImage(ci, c.x+(c.s-w)/2, c.y+(c.s-h)/2, w, h); g.restore();
  } else {
    const cx = c.x+c.s/2, cy = c.y+c.s/2, r = c.s/2;
    g.save(); g.translate(cx, cy); g.rotate(t*0.9);
    g.fillStyle = "#08090b"; g.beginPath(); g.arc(0,0,r,0,7); g.fill();
    g.strokeStyle = "rgba(255,255,255,.06)"; g.lineWidth = 2;
    for(let k=r*0.42; k<r*0.97; k+=r*0.035){ g.beginPath(); g.arc(0,0,k,0,7); g.stroke(); }
    g.fillStyle = "rgba(255,255,255,.08)"; g.beginPath(); g.moveTo(0,0); g.arc(0,0,r*0.97,-0.5,-0.2); g.closePath(); g.fill();
    g.fillStyle = S.pal.accent; g.beginPath(); g.arc(0,0,r*0.34,0,7); g.fill();
    g.fillStyle = VC.bg; g.beginPath(); g.arc(0,0,r*0.035,0,7); g.fill();
    g.fillStyle = "rgba(14,17,21,.85)"; g.font = `800 ${Math.round(r*0.1)}px "Big Shoulders Display", Impact, sans-serif`; g.textAlign = "center"; g.textBaseline = "middle";
    fillName(g, (S.artist||"").toUpperCase(), 0, -r*0.14, true);
    g.restore();
  }
  }
  if(cMove) g.restore();
  // title + artist: position, alignment, font and size can be chosen (or dragged in the preview)
  g.textBaseline = "alphabetic";
  const align = Lo.align0 || Lo.lyr.align, tx = Lo.tx;
  if(S.showTitle !== false){
    const TP = S.tp || {}, fk = TP.font && TP.font !== "style" && CXF[TP.font] ? CXF[TP.font] : null, sz = (TP.size||100)/100;
    const tSize = Math.round(Lo.title.size*(fk ? (fk.big ? 1 : 0.8) : (ST.tscale||1))*sz*(ST.tpulse ? 1 + 0.09*bass : 1)), aSize = Math.round(Lo.artist.size*(TP.asize ? TP.asize/100 : Math.max(0.7, Math.min(1.6, sz))));
    let tA = align, tX = tx, tY = Lo.title.y;
    const pos = TP.pos || "auto", al = TP.align || "auto", vizOn = S.showViz !== false;
    if(pos === "top") tY = Math.round(H*0.13 + tSize*0.9);
    else if(pos === "center") tY = Math.round(H*0.5);
    else if(pos === "bottom") tY = Math.round((vizOn ? Lo.bars.y - 40 : H*0.86) - aSize*1.6);
    else if(pos === "free" && TP.free) tY = Math.round(TP.free.y*H);
    if(W > H && pos === "auto" && al === "auto" && !(S.full && VID.cover) && S.showCover !== false){ const cc = Lo.cover.x + Lo.cover.s/2;
      if(Math.abs(cc - W/2) < W*0.12){ tA = "center"; tX = Math.round(W/2); const above = Lo.cover.y - 34 - Math.round(aSize*1.45); tY = above - tSize*0.2 > tSize*0.9 ? above : Math.round(Lo.cover.y + Lo.cover.s + tSize*0.95); }   // cover in the middle: title centred above it
      else if(cc > W/2){ tA = "left"; tX = 150; } }   // cover moved to the right: the title goes to the left
    const fullAuto = S.full && VID.cover && pos === "auto";   // full picture: text sits in the darker lower part, centred
    if(fullAuto){ tY = Math.round((vizOn ? (Lo.bars0 || Lo.bars).y - 70 : H*0.86) - aSize*1.9); if(al === "auto"){ tA = "center"; tX = Math.round(W/2); } }
    if(pos === "free" && TP.free && al === "auto"){ tA = "center"; tX = Math.round(TP.free.x*W); }
    if(al === "left"){ tA = "left"; tX = Math.round(W*0.07); } else if(al === "right"){ tA = "right"; tX = Math.round(W*0.93); } else if(al === "center"){ tA = "center"; tX = pos === "free" && TP.free ? Math.round(TP.free.x*W) : Math.round(W/2); }
    else if(al === "auto" && pos !== "auto" && pos !== "free" && W <= H){ tA = "center"; tX = Math.round(W/2); }
    const maxW = tA === "center" ? Math.min(W*0.9, Math.min(tX, W-tX)*2 - 20) : (tA === "left" ? W - tX - 40 : tX - 40);
    g.textAlign = tA; g.fillStyle = VC.text;
    g.font = fk ? `${fk.w} ${tSize}px ${fk.fam}` : `${ST.tw || (ST.tfont && ST.tfont.includes("Serif") ? 400 : 800)} ${tSize}px ${ST.tfont || '"Big Shoulders Display", Impact, sans-serif'}`;
    const upper = fk ? !!fk.up : ST.tcase !== "none";
    let title = upper ? (S.title||"").toUpperCase() : (S.title||""); while(title.length>3 && g.measureText(title).width > Math.max(200, maxW)) title = title.slice(0,-2)+"…";
    if(ST.glitch){ const hit = bass > 0.72 && (Math.floor(t*12) % 3 === 0), j = hit ? 5 + 6*bass : 1.5; g.save(); g.globalCompositeOperation = "screen"; g.globalAlpha = .75;
      g.fillStyle = "#00f0ff"; g.fillText(title, tX - j, tY); g.fillStyle = "#ff0a6e"; g.fillText(title, tX + j, tY + (hit ? 2 : 0)); g.restore(); g.fillStyle = VC.text; }
    const sh = ST.tglow || ST.glow || (VID.bgv || (S.full && VID.cover) ? "rgba(0,0,0,.8)" : null);
    if(sh){ g.save(); g.shadowColor = sh; g.shadowBlur = (ST.glow || ST.tglow) ? 30 : 18; g.fillText(title, tX, tY); g.restore(); } else g.fillText(title, tX, tY);
    const aY = tY + Math.round(aSize*1.45);
    g.font = `600 ${aSize}px "Instrument Sans", system-ui, sans-serif`; g.fillStyle = ST.acol || S.pal.accent;
    if(VID.bgv || ST.nameShadow || (S.full && VID.cover)){ g.save(); g.shadowColor = "rgba(0,0,0,.85)"; g.shadowBlur = 14; g.shadowOffsetY = ST.nameShadow ? 2 : 0; fillName(g, S.artist||"", tX, aY); if(ST.nameShadow) fillName(g, S.artist||"", tX, aY); g.restore(); } else fillName(g, S.artist||"", tX, aY);
    // remember where the title sits so it can be dragged in the preview
    g.font = fk ? `${fk.w} ${tSize}px ${fk.fam}` : g.font; const tw = Math.max(g.measureText(title).width, 120), x0 = tA === "center" ? tX - tw/2 : tA === "right" ? tX - tw : tX;
    S.tbox = {x0: x0 - 20, x1: x0 + tw + 20, y0: tY - tSize, y1: aY + 16};
  }
  // lyrics: current line with karaoke sweep, next line dimmed
  if(S.lyrOn && S.lines.length){ g.save(); if(S.full && VID.cover){ g.shadowColor = "rgba(0,0,0,.85)"; g.shadowBlur = 14; g.shadowOffsetY = 2; }
    const i = S.lines.findIndex((l,k)=> t>=l.t && (k===S.lines.length-1 || t < S.lines[k+1].t));
    const cur = i>=0 && t < (S.lines[i+1] ? S.lines[i+1].t : (S.lines[i].send ?? S.lines[i].end) + 3) ? S.lines[i] : null, next = S.lines[i>=0 ? i+1 : 0];
    let y = Lo.lyr.y; const lx = Lo.lyr.x !== undefined ? Lo.lyr.x : tx, lal = Lo.lyr.x !== undefined ? "center" : align;
    S.lbox = {x0: lx - Lo.lyr.w/2, x1: lx + Lo.lyr.w/2, y0: Lo.lyr.y - Lo.lyr.size, y1: Lo.lyr.y + Lo.lyr.size*2.2};
    if(cur){
      g.font = `700 ${Lo.lyr.size}px "Instrument Sans", system-ui, sans-serif`;
      const rows = wrapText(g, cur.text, Lo.lyr.w).slice(0,3), total = rows.join(" ").length;
      const sEnd = cur.send ?? cur.end, prog = S.sweep === false ? 1 : Math.max(0, Math.min(1, (t-cur.t)/Math.max(0.4, (sEnd-cur.t)*0.92)));
      let done = prog*total;
      for(const row of rows){
        const w = g.measureText(row).width, x0 = lal==="center" ? lx - w/2 : lx;
        g.textAlign = "left"; g.fillStyle = VC.dim; g.fillText(row, x0, y);
        const part = Math.max(0, Math.min(row.length, done)); done -= row.length + 1;
        if(part>0){ g.save(); g.beginPath(); g.rect(x0-4, y-Lo.lyr.size, g.measureText(row.slice(0, Math.ceil(part))).width+4, Lo.lyr.size*1.4); g.clip(); g.fillStyle = VC.text; g.fillText(row, x0, y); g.restore(); }
        y += Lo.lyr.size*1.25;
      }
    }
    if(next && (!cur || next !== cur)){
      g.font = `500 ${Math.round(Lo.lyr.size*0.62)}px "Instrument Sans", system-ui, sans-serif`; g.fillStyle = S.full && VID.cover ? "rgba(244,245,247,.55)" : "rgba(244,245,247,.28)"; g.textAlign = lal;
      const row = wrapText(g, next.text, Lo.lyr.w)[0]||""; g.fillText(row, lx, (cur ? y : Lo.lyr.y) + Lo.lyr.size*0.2);
    }
    g.restore();
  }
  // visualizer in the chosen style
  // DANVIEL signature sits in the bottom right corner below the visualizer (v16.3: no overlap any more)
  danSign(g, W, H, Lo);
  if(S.showViz !== false){ drawViz(g, Lo, t, S, ST, bands); S.vbox = {x0: Lo.bars.x, x1: Lo.bars.x + Lo.bars.w, y0: Lo.bars.y, y1: Lo.bars.y + Lo.bars.h}; }
  // progress
  const P0 = Lo.bars.x, PW = Lo.bars.w, py = Lo.prog.y;
  g.fillStyle = "rgba(255,255,255,.15)"; roundRect(g, P0, py, PW, 6, 3); g.fill();
  g.fillStyle = S.pal.accent; roundRect(g, P0, py, Math.max(6, PW*Math.min(1, t/S.dur)), 6, 3); g.fill();
  g.font = `500 26px "IBM Plex Mono", monospace`; g.fillStyle = VC.dim; g.textAlign = "left"; g.fillText(fmtT(t), P0, py+40); g.textAlign = "right"; g.fillText(fmtT(S.dur), P0+PW, py+40);
  // branding (v15.8): own logo + own text stay in the brand row. DANVIEL is always in: the mark (D with the gold peak) top left,
  // or top right when the user brings his own branding, and the signature "Danviel · Studio" bottom right, the whole video long.
  {
    const lh = 78, parts = [];
    const own = S.brandTxt && S.brandTxt.trim().toUpperCase() !== "DANVIEL" ? S.brandTxt : "";
    if(VID.logo) parts.push({img: VID.logo});
    if(own) parts.push({t: own});
    g.font = `800 44px "Big Shoulders Display", Impact, sans-serif`; g.textAlign = "left"; g.fillStyle = "rgba(244,245,247,.92)";
    const gap = 16, wOf = p => p.img ? p.img.width * lh / p.img.height : g.measureText(p.t).width;
    if(parts.length){
      const total = parts.reduce((a,p)=>a + wOf(p), 0) + gap*(parts.length-1);
      let x = Lo.brand.center ? Lo.brand.x - total/2 : Lo.brand.x;
      for(const p of parts){ if(p.img) g.drawImage(p.img, x, Lo.brand.y - lh*0.72, wOf(p), lh); else fillName(g, p.t, x, Lo.brand.y); x += wOf(p) + gap; }
    }
    danMark(g, W, H, parts.length ? "tr" : "tl");
  }
  drawOver(g, W, H, t, ST);
}
// DANVIEL mark: the D with the gold peak inside (same shape as the app icon), drawn as vector, no image needed
const DM_D = new Path2D("M22 20H48A30 30 0 0 1 48 80H22Z"), DM_P = new Path2D("M32 70L46 32L60 70Z");
function danMark(g, W, H, corner){
  const m = Math.min(W, H), s = Math.round(m*0.11), pad = Math.round(m*0.03);
  const x = corner === "tr" ? W - pad - s*0.8 : pad - s*0.2, y = pad - s*0.2;
  g.save(); g.translate(x, y); g.scale(s/100, s/100); g.globalAlpha = 0.92;
  g.shadowColor = "rgba(0,0,0,.55)"; g.shadowBlur = 10; g.shadowOffsetY = 2;
  g.fillStyle = "#f3efe6"; g.fill(DM_D); g.shadowColor = "transparent";
  const au = g.createLinearGradient(0, 32, 0, 70); au.addColorStop(0, "#f6c766"); au.addColorStop(1, "#d4911f"); g.fillStyle = au; g.fill(DM_P);
  g.restore();
}
// DANVIEL signature: handwritten "Danviel", gold swoosh, STUDIO underneath, bottom right, slightly tilted like a signed picture
function danSign(g, W, H, Lo){
  const m = Math.min(W, H), fs = Math.round(m*0.068), xr = Lo.bars.x + Lo.bars.w + Math.round(m*0.01), yS = Lo.prog.y - Math.round(m*0.012), yN = yS - fs*0.42;
  g.save(); g.translate(xr, yS); g.rotate(-0.07); g.translate(-xr, -yS);
  g.shadowColor = "rgba(0,0,0,.6)"; g.shadowBlur = 12; g.shadowOffsetY = 2;
  g.font = `400 ${fs}px "Herr Von Muellerhoff", "Brush Script MT", cursive`; g.textAlign = "right"; g.textBaseline = "alphabetic"; g.fillStyle = "#fff8ec";
  const nw = g.measureText("Danviel").width; g.fillText("Danviel", xr, yN);
  g.shadowBlur = 6; g.strokeStyle = "#e8a93a"; g.lineWidth = Math.max(2, fs*0.035); g.lineCap = "round";
  g.beginPath(); const sx = xr - nw*1.02, sy = yN + fs*0.14; g.moveTo(sx, sy); g.bezierCurveTo(sx + nw*0.3, sy - fs*0.12, sx + nw*0.75, sy - fs*0.12, xr + fs*0.05, sy - fs*0.03); g.stroke();
  g.font = `600 ${Math.round(fs*0.15)}px "Unbounded", "Instrument Sans", sans-serif`; try{ g.letterSpacing = Math.round(fs*0.09) + "px"; }catch(e){}
  g.fillStyle = "rgba(255,248,236,.88)"; g.fillText("STUDIO", xr - Math.round(fs*0.09), yS);
  g.restore();
}
// DANVIEL in two colours on canvas: DAN red, VIEL blue (any alignment)
// DANVIEL as in the logo (v16.5): D and IEL cream, ΛNV gold, drawn from the wordmark itself. Any other name is normal text.
const WM = (()=>{ try{ return {
  d: new Path2D("M0 0H44A50 50 0 0 1 44 100H0Z M16 16V84H44A34 34 0 0 0 44 16Z"),
  g: new Path2D("M112 100L141 0L159 0L188 100L170 100L150 30L130 100Z M206 100L206 0L224 0L264 66L264 0L282 0L282 100L264 100L224 34L224 100Z M300 0L318 0L338 70L358 0L376 0L347 100L329 100Z"),
  w: new Path2D("M394 0H410V100H394Z M428 0H492V16H444V42H486V58H444V84H492V100H428Z M510 0H526V84H570V100H510Z") }; }catch(e){ return null; } })();
function fillName(g, txt, x, y, onLight){
  const s = String(txt||"");
  if(s.trim().toUpperCase() !== "DANVIEL" || !WM){ g.fillText(s, x, y); return; }
  const px = parseFloat((g.font.match(/([\d.]+)px/) || [0, 40])[1]) || 40, h = px*0.74, sc = h/100, w = 570*sc, al = g.textAlign;
  const x0 = al === "center" ? x - w/2 : (al === "right" || al === "end") ? x - w : x;
  g.save(); g.translate(x0, y - h); g.scale(sc, sc);
  g.fillStyle = onLight ? "#16171b" : "#f3eee4"; g.fill(WM.d, "evenodd"); g.fill(WM.w);
  g.fillStyle = onLight ? "#8a5a06" : "#e8a93a"; g.fill(WM.g); g.restore();
}
try{ document.fonts && Promise.all(['400 90px "Herr Von Muellerhoff"','600 20px "Unbounded"'].map(f=>document.fonts.load(f))).then(()=>{ try{ previewSoon(); }catch(e){} }); }catch(e){}
const DAN_LOGO = new Image();
DAN_LOGO.onload = ()=>{ try{ if(typeof previewSoon === "function") previewSoon(); }catch(e){} };
DAN_LOGO.src = (document.querySelector('link[rel="apple-touch-icon"]') || {}).href || "";
// per-frame spectrum from the final audio (48 log bands, 45 Hz – 14 kHz)
function spectrumFrames(L, R, sr, fps){
  const N = 2048, w = hann(N), re = new Float64Array(N), im = new Float64Array(N), nf = Math.ceil(L.length/sr*fps), nb = 24;
  const out = new Array(nf), prev = new Float32Array(nb);
  const edges = Array.from({length:nb+1}, (_,i)=>45*Math.pow(14000/45, i/nb));
  for(let f=0; f<nf; f++){
    const c = Math.round(f/fps*sr) - N/2;
    for(let i=0;i<N;i++){ const j=c+i; re[i] = j>=0 && j<L.length ? (L[j]+R[j])*0.5*w[i] : 0; im[i]=0; }
    fft(re, im);
    const b = new Float32Array(nb);
    for(let k=0;k<nb;k++){
      const k0 = Math.max(1, Math.floor(edges[k]/sr*N)), k1 = Math.max(k0+1, Math.floor(edges[k+1]/sr*N)); let m = 0;
      for(let q=k0;q<k1;q++){ const p = re[q]*re[q]+im[q]*im[q]; if(p>m) m=p; }
      const db = 10*Math.log10(m+1e-12) - 20*Math.log10(N/4), v = Math.max(0, Math.min(1, (db+62)/56));
      b[k] = prev[k] = Math.max(v, prev[k]*0.82);
    }
    out[f] = b;
  }
  return out;
}
let BGC = {k:"", c:null};
function bgCached(){ const ST = vStyle(), k = VID.aspect + "|" + VID.style + "|" + (ST.bg||"") + (ST.tint||"") + "|" + (VID.coverUrl || (VID.cover ? "c" : "")) + "|" + (VID.cover ? VID.cover.width : 0);
  if(BGC.k !== k || !BGC.c){ BGC = {k, c: makeBg(...ASPECTS[VID.aspect])}; } return BGC.c; }
function vidState(dur, bands, fps){
  const off = ($("onlyAB").checked && AB.a!==null) ? AB.a/rate : 0;
  const lines = lyrSungEnds(parseLyrics($("lText").value, LYR.dur || dur)).map(l=>({...l, t:l.t-off, end:l.end-off, send:(l.send ?? l.end)-off})).filter(l=>l.end>0);
  return {pal: vStyle().pal || VID.pal || DEFAULT_PAL, bg: bgCached(), title: $("vTitle").value || $("fname").value, artist: $("vArtist").value, lyrOn: $("vLyr").checked, brand: $("vBrand").checked, brandTxt: $("vBrandTxt").value.trim(), lines, dur, tp: VID.tp, showViz: $("vShowViz").checked, showCover: $("vShowCover").checked, showTitle: $("vShowTitle").checked, full: !!VID.full, sweep: $("vLyrSweep") ? $("vLyrSweep").checked : true,
          bandsAt: t => bands ? bands[Math.min(bands.length-1, Math.max(0, Math.round(t*fps)))] : null};
}
// live spectrum from the player, in the same 24 bands the video uses
const LIVEB = new Float32Array(24);
function liveBands(){
  if(!MT || !playing) return null;
  const ny = ctx.sampleRate/2, nb = MT.freq.length;
  for(let k=0;k<24;k++){ const f0 = 45*Math.pow(14000/45, k/24), f1 = 45*Math.pow(14000/45, (k+1)/24);
    let b0 = Math.max(1, Math.floor(f0/ny*nb)), b1 = Math.max(b0+1, Math.floor(f1/ny*nb)), m = -140;
    for(let b=b0;b<b1&&b<nb;b++) if(MT.freq[b] > m) m = MT.freq[b];
    const v = Math.max(0, Math.min(1, (m + 78)/58)); LIVEB[k] = Math.max(v, LIVEB[k]*0.82); }
  return LIVEB;
}
function drawPreview(live){
  const [W, H] = ASPECTS[VID.aspect], cv = $("vPrev"), sc = 0.5;
  if(cv.width !== W*sc || cv.height !== H*sc){ cv.width = W*sc; cv.height = H*sc; }
  const g = cv.getContext("2d"); g.setTransform(sc,0,0,sc,0,0);
  const sec = $("onlyAB").checked && AB.a!==null && AB.b!==null, off = sec ? AB.a/rate : 0;
  const dur = sec ? (AB.b-AB.a)/rate : (duration ? duration/rate : 60), now = (live ? currentTime() : offset)/rate;
  const t = Math.max(0, Math.min(dur, now - off)), lb = live ? liveBands() : null;
  const S = vidState(dur, null, 30); S.dur = dur; if(lb) S.bandsAt = () => lb;
  if(VID.bgv && !VID.exporting) bgvSync(!!live, t);
  drawFrame(g, W, H, t, S); VID.lastTbox = S.tbox || null;
  VID.lastVbox = S.showViz !== false && S.vbox ? S.vbox : null; VID.lastLbox = S.lbox && S.lyrOn && S.lines.length ? S.lbox : null; VID.lastCbox = S.cbox || null;
  if(VID.snapG && (VID.snapG.v || VID.snapG.h)){ g.save(); g.strokeStyle = "rgba(240,176,60,.95)"; g.lineWidth = 3; g.setLineDash([18, 12]); g.beginPath();
    if(VID.snapG.v){ g.moveTo(W/2, 0); g.lineTo(W/2, H); } if(VID.snapG.h){ g.moveTo(0, H/2); g.lineTo(W, H/2); } g.stroke(); g.restore(); }
  if(VID.prevHover && !VID.exporting){ g.save(); g.setLineDash([12, 10]); g.lineWidth = 2.5; g.strokeStyle = "rgba(243,238,228,.55)"; g.fillStyle = "#e8a93a";
    [VID.lastCbox, VID.lastTbox, VID.lastVbox, VID.lastLbox].forEach(b=>{ if(!b) return; g.strokeRect(b.x0, b.y0, b.x1-b.x0, b.y1-b.y0); g.fillRect(b.x1-14, b.y1-14, 22, 22); }); g.restore(); }
}
// while the song plays and the video panel is on screen, the preview runs live (~30 fps)
let livePrevT = 0, livePrevOn = false;
function livePreview(){
  const box = $("vidsec"); if(!playing || !box || box.classList.contains("collapsed")){ if(livePrevOn){ livePrevOn = false; drawPreview(); } return; }
  const r = $("vPrev").getBoundingClientRect(); if(r.bottom < 0 || r.top > innerHeight) return;
  const now = performance.now(); if(now - livePrevT < 33) return; livePrevT = now; livePrevOn = true;
  drawPreview(true);
}
let prevT = 0; const previewSoon = ()=>{ clearTimeout(prevT); prevT = setTimeout(()=>drawPreview(playing), 120); };
function vtSync(){ $("vTPos").value = VID.tp.pos; $("vTAlign").value = VID.tp.align; $("vTFont").value = CXF[VID.tp.font] ? VID.tp.font : "style"; $("vTSize").value = VID.tp.size; $("vvTSize").textContent = VID.tp.size + " %"; $("vASize").value = VID.tp.asize || 100; $("vvASize").textContent = (VID.tp.asize || 100) + " %"; }
setTimeout(()=>{ const sel = $("vTFont"); [...$("cxFont").options].forEach(o=>{ if(o.value !== "auto"){ const n = document.createElement("option"); n.value = o.value; n.textContent = o.textContent; sel.appendChild(n); } }); vtSync(); }, 0);
const vtChanged = ()=>{ vtSync(); const k = VID.tp.font; if(CXF[k]) try{ document.fonts.load(`${CXF[k].w} 80px ${CXF[k].fam}`).then(()=>previewSoon()); }catch(e){} previewSoon(); saveSoon(); };
$("vTPos").onchange = e=>{ VID.tp.pos = e.target.value; if(VID.tp.pos === "free" && !VID.tp.free) VID.tp.free = {x:.5, y:.5}; vtChanged(); };
$("vTAlign").onchange = e=>{ VID.tp.align = e.target.value; vtChanged(); };
$("vTFont").onchange = e=>{ VID.tp.font = e.target.value; vtChanged(); };
$("vTSize").oninput = e=>{ VID.tp.size = +e.target.value; vtChanged(); };
$("vASize").oninput = e=>{ VID.tp.asize = +e.target.value; vtChanged(); };
// drag the title directly in the preview
(()=>{ const cv = $("vPrev"); let drag = null;
  const toW = e => { const r = cv.getBoundingClientRect(), [W, H] = ASPECTS[VID.aspect]; return {x: (e.clientX - r.left)/r.width*W, y: (e.clientY - r.top)/r.height*H, W, H}; };
  cv.addEventListener("pointerdown", e=>{ const b = VID.lastTbox; if(!b) return; const p = toW(e); if(p.x < b.x0 || p.x > b.x1 || p.y < b.y0 || p.y > b.y1) return;
    drag = {dx: p.x - ((VID.tp.free && VID.tp.pos==="free") ? VID.tp.free.x*p.W : (b.x0+b.x1)/2), dy: p.y - ((VID.tp.free && VID.tp.pos==="free") ? VID.tp.free.y*p.H : b.y0 + (b.y1-b.y0)*0.55)};
    cv.setPointerCapture(e.pointerId); cv.classList.add("tdrag"); e.preventDefault(); });
  cv.addEventListener("pointermove", e=>{ const p = toW(e); const b = VID.lastTbox;
    if(!drag){ cv.style.cursor = b && p.x >= b.x0 && p.x <= b.x1 && p.y >= b.y0 && p.y <= b.y1 ? "grab" : ""; return; }
    VID.tp.pos = "free"; if(VID.tp.align !== "auto" && VID.tp.align !== "center") VID.tp.align = "auto";
    let fx = Math.min(.95, Math.max(.05, (p.x - drag.dx)/p.W)), fy = Math.min(.95, Math.max(.06, (p.y - drag.dy)/p.H));
    const snx = Math.abs(fx*p.W - p.W/2) < 30, sny = Math.abs(fy*p.H - p.H/2) < 30; if(snx) fx = 0.5; if(sny) fy = 0.5; VID.snapG = {v: snx, h: sny};
    VID.tp.free = {x: fx, y: fy}; if(snx && VID.tp.align === "auto") VID.tp.align = "auto"; vtSync(); drawPreview(playing); });
  const end = ()=>{ if(!drag) return; drag = null; VID.snapG = null; cv.classList.remove("tdrag"); drawPreview(playing); saveSoon(); };
  cv.addEventListener("pointerup", end); cv.addEventListener("pointercancel", end); })();
function setBgVideo(file){
  if(!file || !/^video\//.test(file.type||"") && !/\.(mp4|mov|webm|m4v|mkv)$/i.test(file.name)) return false;
  if(VID.bgvUrl) URL.revokeObjectURL(VID.bgvUrl);
  if(VID.bgv){ try{ VID.bgv.pause(); VID.bgv.remove(); }catch(e){} } VID.bgvLast = null;
  const v = document.createElement("video"); v.muted = true; v.loop = true; v.playsInline = true; v.preload = "auto";
  v.setAttribute("aria-hidden", "true"); v.style.cssText = "position:fixed;left:0;bottom:0;width:4px;height:4px;opacity:0.01;pointer-events:none;z-index:-1";
  document.body.appendChild(v);
  VID.bgvUrl = URL.createObjectURL(file); v.src = VID.bgvUrl; VID.bgv = v; VID.bgvFile = file;
  v.addEventListener("loadeddata", ()=>{ $("vBgvName").textContent = `${file.name} · ${fmtT(v.duration||0)}`; previewSoon(); }, {once:true});
  v.addEventListener("error", ()=>{ $("vBgvName").textContent = "Dieses Video kann der Browser nicht abspielen. MP4 (H.264) oder WebM geht am sichersten."; VID.bgv = null; previewSoon(); }, {once:true});
  $("vBgvClr").hidden = false;
  // video-only look by default: no visualizer, no cover, lyrics stay
  $("vShowViz").checked = false; $("vShowCover").checked = false; previewSoon(); saveSoon();
  setStatus("Hintergrund-Video geladen. Visualizer und Cover sind ausgeblendet, die Lyrics laufen darüber. Kannst du oben wieder einschalten.");
  return true;
}
$("vBgvBtn").onclick = ()=>$("vBgv").click();
$("vBgv").onchange = e=>{ const f = e.target.files[0]; e.target.value = ""; if(f && !setBgVideo(f)) $("vBgvName").textContent = "Das ist keine Videodatei."; };
$("vBgvClr").onclick = ()=>{ if(VID.bgv){ VID.bgv.pause(); VID.bgv.removeAttribute("src"); VID.bgv.remove(); } VID.bgvLast = null; if(VID.bgvUrl) URL.revokeObjectURL(VID.bgvUrl); VID.bgv = null; VID.bgvUrl = ""; VID.bgvFile = null;
  $("vBgvName").textContent = "optional, oder Video auf die Vorschau ziehen"; $("vBgvClr").hidden = true; $("vShowViz").checked = true; $("vShowCover").checked = true; previewSoon(); saveSoon(); };
["vShowViz","vShowCover","vShowTitle"].forEach(id=>$(id).addEventListener("change", ()=>{ previewSoon(); saveSoon(); }));
(()=>{ const box = document.querySelector(".vidprev");
  box.addEventListener("dragover", e=>{ if([...(e.dataTransfer.items||[])].some(i=>i.kind==="file")){ e.preventDefault(); box.classList.add("dropping"); } });
  box.addEventListener("dragleave", ()=>box.classList.remove("dropping"));
  box.addEventListener("drop", e=>{ box.classList.remove("dropping"); const f = [...(e.dataTransfer.files||[])][0]; if(!f) return; e.preventDefault(); e.stopPropagation();
    if(/^image\//.test(f.type)){ const dt = new DataTransfer(); dt.items.add(f); $("vCover").files = dt.files; $("vCover").dispatchEvent(new Event("change")); return; }
    if(!setBgVideo(f)) setStatus("Auf die Vorschau passen Videos (Hintergrund) oder Bilder (Cover).", true); }); })();
// keep the background video roughly in time with the song in the preview
function bgvSync(live, t){
  const v = VID.bgv; if(!v || !v.duration) return;
  const want = t % v.duration;
  if(live){ if(v.paused) v.play().catch(()=>{}); if(Math.abs(v.currentTime - want) > 0.35) v.currentTime = want; }
  else { if(!v.paused) v.pause(); if(Math.abs(v.currentTime - want) > 0.05){ v.currentTime = want; v.addEventListener("seeked", ()=>drawPreview(false), {once:true}); } }
}
// export: let the background video simply play and keep it in step with the frames we render
// (seeking every single frame is very slow for H.264; playing decodes each frame only once)
async function bgvPace(t){
  const v = VID.bgv; if(!v || !v.duration) return; const d = v.duration, fr = 1/30, want = t % d;
  let diff = ((v.currentTime - want) % d + d) % d; if(diff > d/2) diff -= d;          // >0: video is ahead, <0: behind
  if(diff < -1){ await bgvAt(t); return; }                                            // far behind (start, very slow export): jump
  if(diff > fr*1.5){ if(!v.paused) v.pause(); if(diff > 1){ await bgvAt(t); } return; }   // ahead: wait for us
  if(v.paused){ v.playbackRate = 1; try{ await v.play(); }catch(e){ await bgvAt(t); return; } }
  const until = performance.now() + 400;
  while(performance.now() < until){ let df = ((v.currentTime - want) % d + d) % d; if(df > d/2) df -= d; if(df >= -fr*0.5) break; await new Promise(r=>setTimeout(r, 4)); }
}
// exact frame for the export
function bgvAt(t){ const v = VID.bgv; if(!v || !v.duration) return Promise.resolve();
  const fr = 1/30, want = Math.floor((t % v.duration)/fr)*fr;   // snap to the video's frame grid: no seek needed when the frame did not change
  if(Math.abs(v.currentTime - want) < fr*0.5 && v.readyState >= 2) return Promise.resolve();
  return new Promise(res=>{ let fin = false; const done = ()=>{ if(fin) return; fin = true; clearTimeout(to); res(); }, to = setTimeout(done, 2500);
    v.addEventListener("seeked", ()=>{ const ok = ()=> v.readyState >= 2;
      if(ok()) done();
      else v.addEventListener("canplay", done, {once:true}); }, {once:true});
    v.currentTime = want; }); }
$("vStyle").onclick = e=>{ const b = e.target.closest && e.target.closest("[data-s]"), v = b && b.dataset.s; if(!v || !VSTYLES[v]) return; VID.style = v; delete VSTYLES.__draft; vStyleUi(); if($("vsb").open || VSTYLES[v].custom) vsbPrefill(); previewSoon(); saveSoon(); };
function vStyleUi(){
  const box = $("vStyle"); box.querySelectorAll("button.ustyle").forEach(b=>b.remove());
  Object.keys(VSTYLES).filter(k=>k.startsWith("u_") || k==="__draft").forEach(k=>{ if(k==="__draft") return; const b = document.createElement("button"); b.className = "ustyle"; b.dataset.s = k; b.setAttribute("translate","no"); b.textContent = "★ " + VSTYLES[k].name; box.appendChild(b); });
  box.querySelectorAll("button").forEach(b=>b.setAttribute("aria-pressed", b.dataset.s===VID.style));
  $("vsbDel").hidden = !(VSTYLES[VID.style] && VSTYLES[VID.style].custom && VID.style !== "__draft");
}
// style builder
const VSB = ["Name","Viz","C1","C2","C3","Bg","Font","Cfx","Camt","Glow","Grid","Scan","Grain","Vign","Glitch","Blobs","Round","Upper","Tglow","Tpulse","Stars","Flash","Rain","Snow","Embers","Leak","Bokeh","Dust"];
function vsbRead(){ const v = id => $("vsb"+id); $("vvsbCamt").textContent = v("Camt").value + " %"; return vsClean({name:v("Name").value, viz:v("Viz").value, c1:v("C1").value, c2:v("C2").value, c3:v("C3").value, bg:v("Bg").value, font:v("Font").value,
  cfx:v("Cfx").value, camt:+v("Camt").value, tglow:v("Tglow").checked, tpulse:v("Tpulse").checked, stars:v("Stars").checked, flash:v("Flash").checked, rain:v("Rain").checked, snow:v("Snow").checked, embers:v("Embers").checked, leak:v("Leak").checked, bokeh:v("Bokeh").checked, dust:v("Dust").checked,
  glow:v("Glow").checked, grid:v("Grid").checked, scan:v("Scan").checked, grain:v("Grain").checked, vign:v("Vign").checked, glitch:v("Glitch").checked, blobs:v("Blobs").checked, round:v("Round").checked, upper:v("Upper").checked}); }
function vsbFill(d){ const v = id => $("vsb"+id); v("Name").value = d.name; v("Viz").value = d.viz; v("C1").value = d.c1; v("C2").value = d.c2; v("Bg").value = d.bg; v("Font").value = d.font;
  ["Glow","Grid","Scan","Grain","Vign","Glitch","Blobs","Round","Tglow","Tpulse","Stars","Flash","Rain","Snow","Embers","Leak","Bokeh","Dust"].forEach(k=>v(k).checked = !!d[k.toLowerCase()]); v("Upper").checked = d.upper !== false;
  v("C3").value = d.c3 || "#ffffff"; v("Cfx").value = d.cfx || "none"; v("Camt").value = d.camt || 50; $("vvsbCamt").textContent = (d.camt || 50) + " %"; }
(()=>{ const sel = $("vsbFont"); [...$("cxFont").options].forEach(o=>{ if(o.value !== "auto"){ const n = document.createElement("option"); n.value = o.value; n.textContent = o.textContent; sel.appendChild(n); } }); sel.value = "narrow"; })();
