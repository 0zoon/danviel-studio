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
