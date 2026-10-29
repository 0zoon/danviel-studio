/* ===================== v17: lyrics and the video follow the tempo (Slowed, Sped Up, Nightcore ...) =====================
   Lyric times are in the time of the song as you hear it. When the tempo changes, the song gets longer or shorter,
   so every timestamp is scaled with it, from the text it was made for (switching back and forth never drifts). */
let LYRB = null;
const fmtTs2 = t => `${Math.floor(t/60)}:${(Math.max(0, t)%60).toFixed(2).padStart(5, "0")}`;
function lyrRescale(o, n){
  const ta = $("lText"); if(!ta || !ta.value.trim() || !/^\s*\d+:\d/m.test(ta.value)) return;
  if(!(LYRB && ta.value === LYRB.text)) LYRB = {base: ta.value, ref: o};
  const k = n/LYRB.ref;
  const out = Math.abs(k - 1) < 1e-6 ? LYRB.base : LYRB.base.split(/\r?\n/).map(line=>{
    const m = line.match(/^(\s*)(\d+):(\d{1,2}(?:[.,]\d+)?)(\s+.*)$/); if(!m) return line;
    return m[1] + fmtTs2((+m[2]*60 + parseFloat(m[3].replace(",", ".")))*k) + m[4]; }).join("\n");
  ta.value = out; LYRB.text = out;
  if(LYR.dur) LYR.dur *= n/o;
  try{ renderLyricView(); }catch(e){} previewSoon(); saveSoon();
}
const _retime17 = retime;
retime = function(fn){
  const o = duration ? duration/rate : 0;
  _retime17(fn);
  const n = duration ? duration/rate : 0;
  if(o > 0 && n > 0 && Math.abs(n/o - 1) > 1e-4) lyrRescale(o, n);
};
window.__dbgFrame = (g, W, H, t) => { const S = vidState(duration ? duration/rate : 60, null, 30); S.dur = duration ? duration/rate : 60; drawFrame(g, W, H, t, S); };   // test hook
/* v17: in "everything open" the section / hook box sat far above the video; it belongs right above it (in compact mode it already was) */
try{ const sb = $("secBox"), vs = $("vidsec"); if(sb && vs && sb.nextElementSibling !== vs) vs.before(sb); }catch(e){}
/* v17: title position and size belong to one format. Moving the title in 16:9 no longer moves it in 9:16 or 1:1:
   each format keeps its own (pos, align, free spot, sizes); a format you never touched starts at the normal layout */
const TP_LAY = ["pos", "align", "free", "size", "asize"], TP_DEF = {pos: "auto", align: "auto", free: null, size: 100, asize: 0};
VID.tpA = VID.tpA || {};
const tpPick = tp => JSON.parse(JSON.stringify(Object.fromEntries(TP_LAY.map(k=>[k, tp ? tp[k] ?? TP_DEF[k] : TP_DEF[k]]))));
window.__tpFor = asp => asp === VID.aspect ? VID.tp : {...VID.tp, ...(VID.tpA[asp] ? JSON.parse(JSON.stringify(VID.tpA[asp])) : TP_DEF)};
{ const _asp17 = $("vAspect").onclick;
  $("vAspect").onclick = e => { const v = e.target.dataset && e.target.dataset.v; if(v && v !== VID.aspect && VID.tp){ VID.tpA[VID.aspect] = tpPick(VID.tp); Object.assign(VID.tp, VID.tpA[v] ? JSON.parse(JSON.stringify(VID.tpA[v])) : TP_DEF); try{ vtSync(); }catch(err){} } return _asp17(e); }; }
{ const _gp = getProject; getProject = function(){ const p = _gp.apply(this, arguments); try{ if(p.video) p.video.tpA = {...VID.tpA, [VID.aspect]: tpPick(VID.tp)}; }catch(e){} return p; };
  const _ap = applyProject; applyProject = function(pj){ const r = _ap.apply(this, arguments); try{ const a = pj && pj.video && pj.video.tpA; VID.tpA = a && typeof a === "object" ? a : {}; }catch(e){} return r; }; }
