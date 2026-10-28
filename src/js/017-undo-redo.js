/* =====================================================================
   UNDO / REDO
   ===================================================================== */
const HIST = {list:[], i:-1, t:0, busy:false};
const snapshot = () => { const p = getProject(); delete p.saved; return JSON.stringify(p); };
function recordSoon(){
  if(HIST.busy) return;
  clearTimeout(HIST.t);
  HIST.t = setTimeout(()=>{
    if(!tracks.length) return;
    const s = snapshot(); if(s === HIST.list[HIST.i]) return;
    HIST.list = HIST.list.slice(0, HIST.i+1); HIST.list.push(s);
    if(HIST.list.length > 100) HIST.list.shift(); HIST.i = HIST.list.length-1; histUI();
  }, 450);
}
function histUI(){ $("undo").disabled = HIST.i <= 0; $("redo").disabled = HIST.i >= HIST.list.length-1; }
function histGo(d){
  const j = HIST.i + d; if(j<0 || j>=HIST.list.length) return;
  clearTimeout(HIST.t); HIST.busy = true; HIST.i = j;
  applyProject(JSON.parse(HIST.list[j]));
  setTimeout(()=>{ HIST.busy = false; }, 0);
  histUI(); setStatus(d<0 ? "Rückgängig gemacht." : "Wiederhergestellt.");
}
$("undo").onclick = ()=>histGo(-1);
$("redo").onclick = ()=>histGo(1);
document.addEventListener("keydown", e=>{
  if(!(e.ctrlKey||e.metaKey) || /INPUT|TEXTAREA/.test(e.target.tagName) && e.target.type==="text") return;
  const k = e.key.toLowerCase();
  if(k==="z" && !e.shiftKey){ e.preventDefault(); histGo(-1); }
  else if(k==="y" || (k==="z" && e.shiftKey)){ e.preventDefault(); histGo(1); }
});

