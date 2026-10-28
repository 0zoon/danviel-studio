/* =====================================================================
   BUILD TRACKS: drum pattern, instrument (piano roll, keyboard, MIDI), loop / sample, timeline.
   Every built track is rendered into a normal stem, so mixing, effects and export just work.
   ===================================================================== */
const DRUM_ROWS = [["Kick",36],["Snare",38],["Clap",39],["Hi-Hat",42],["Open Hat",46],["Perc",45],["Crash",49]];
const DRUM_PRESETS = {
  trap:    {36:"x......x..x.....", 39:"....x.......x...", 42:"x.x.x.x.x.xxx.x.", 46:"..............x."},
  boombap: {36:"x.......x.x.....", 38:"....x.......x...", 42:"x.x.x.x.x.x.x.x."},
  pop:     {36:"x.......x.x.....", 38:"....x.......x...", 39:"....x.......x...", 42:"x.x.x.x.x.x.x.x."},
  house:   {36:"x...x...x...x...", 39:"....x.......x...", 42:"x.x.x.x.x.x.x.x.", 46:"..x...x...x...x."},
  dembow:  {36:"x...x...x...x...", 38:"...x..x....x..x.", 42:"x.x.x.x.x.x.x.x."},
  afro:    {36:"x..x..x...x..x..", 38:"....x.......x...", 45:"..x..x....x..x..", 42:"x.xxx.xxx.xxx.xx"},
  rnb:     {36:"x......x.x......", 38:"....x.......x...", 42:"x.x.x.x.x.x.x.x.", 46:"..............x."},
};
const BLD = {sel:null, oct:4, rec:null, held:new Map(), cache:new Map(), live:new Map(), midiOk:false, t:0, paint:null, n:{drums:0, inst:0, loop:0}};
const bldBuilt = () => tracks.filter(t=>t.gen);
const bldBase = () => tracks.filter(t=>!t.gen);
function bldBpm(){ const v = +$("bnBpm").value; const own = Math.max(60, Math.min(200, v || 95)); return bldBase().length && song && song.bpm ? song.bpm : own; }
const bldBar = () => 240/bldBpm();
const bldPhase = () => bldBase().length && SC.kicks && SC.kicks.length && SC.src && !(tracks.find(t=>t.name===SC.src)||{}).gen ? SC.kicks[0] % bldBar() : 0;
function bldLenSamples(fs){
  const base = bldBase(); if(base.length) return Math.max(...base.map(t=>t.buffer.length));
  const bars = Math.max(4, Math.min(128, Math.round(+$("bnBars").value || 16)));
  return Math.round((bars*bldBar() + 1.5)*fs);
}
const bldNBars = fs => Math.max(1, Math.ceil((bldLenSamples(fs)/fs - bldPhase())/bldBar()));
const bldFs = () => tracks.length ? tracks[0].buffer.sampleRate : ac().sampleRate;
function bldInfo(){
  const own = !bldBase().length;
  $("bnNew").hidden = !own;
  $("bnInfo").textContent = own ? "Noch kein Song geladen: du baust einen neuen Beat von null." :
    `Raster: ${Math.round(bldBpm()*10)/10} BPM, 4/4, ${bldNBars(bldFs())} Takte, ausgerichtet am ersten Kick deines Songs.`;
  $("bnArr").hidden = !bldBuilt().length; bldArrDraw();
}
// expand the pattern over the bars where the track is switched on (each region starts the pattern from its beginning)
function bldNotes(g, nb){
  const B = bldBar(), st = B/16, ph = bldPhase(), out = [], pb = g.bars;
  let rs = 0;
  for(let b=0; b<nb; b++){
    if(!g.on[b]) continue; if(b === 0 || !g.on[b-1]) rs = b;
    const k = (b - rs) % pb, t0 = ph + b*B;
    if(g.kind === "drums"){
      for(const [, n] of DRUM_ROWS){ const row = g.steps[n] || ""; for(let s=0; s<16; s++){ if(row[k*16 + s] !== "x") continue;
        out.push({t: t0 + s*st, d: 0.1, n, v: n === 42 ? (s % 4 === 0 ? 0.75 : 0.55) : (s % 4 === 0 ? 0.95 : 0.8)}); } }
      for(const key in g.steps){ if(!key.startsWith("s:")) continue; const row = g.steps[key] || ""; for(let s=0; s<16; s++){ if(row[k*16 + s] !== "x") continue; out.push({t: t0 + s*st, d: 0.1, smp: key.slice(2), v: s % 4 === 0 ? 0.95 : 0.82}); } }
    } else if(g.kind === "inst"){
      for(const nt of g.notes){ const s = nt.s - k*16; if(s < 0 || s >= 16) continue; out.push({t: t0 + s*st, d: Math.max(0.04, nt.l*st), n: nt.n, v: nt.v || 0.8}); }
    }
  }
  return out.sort((a,b)=>a.t-b.t);
}
async function bldBuffer(g){
  const fs = bldFs(), N = bldLenSamples(fs), nb = bldNBars(fs), c = ac();
  let L = new Float32Array(N), R = new Float32Array(N);
  if(g.kind === "loop"){
    if(g.src){
      const B = bldBar(), ph = bldPhase(), sd = g.src.L.length/g.src.sr;
      const bars = g.fit ? Math.max(1, Math.round(sd/B)) : Math.max(1, Math.ceil(sd/B - 0.02));
      g.bars = bars;
      const plen = Math.round(bars*B*fs), k = g.fit ? g.src.L.length/plen : g.src.sr/fs, pl = Math.round(g.fit ? plen : g.src.L.length*fs/g.src.sr);
      const sL = g.src.L, sR = g.src.R, pL = new Float32Array(pl), pR = new Float32Array(pl);
      for(let i=0;i<pl;i++){ const x = i*k, j = Math.floor(x), f = x - j; if(j+1 >= sL.length) break; pL[i] = sL[j] + (sL[j+1]-sL[j])*f; pR[i] = sR[j] + (sR[j+1]-sR[j])*f; }
      const barS = B*fs; let rs = 0;
      for(let b=0; b<nb; b++){ if(!g.on[b]) continue; if(b === 0 || !g.on[b-1]) rs = b;
        const kk = (b - rs) % bars, from = Math.round(kk*barS), o = Math.round((ph + b*B)*fs), last = !g.on[b+1] || kk === bars-1;
        const n = last && !g.fit ? pl - from : Math.round(barS) + (last ? 0 : 0);
        for(let i=0;i<n;i++){ const p = from + i, q = o + i; if(p >= pl || q >= N) break; if(q < 0) continue;
          let w = 1; if(last && g.on[b+1] === undefined){} if(last && !g.on[b+1]){ const rem = n - i; if(rem < 441) w = rem/441; }
          L[q] += pL[p]*w; R[q] += pR[p]*w; } }
    }
    const b = c.createBuffer(2, N, fs); b.copyToChannel(L, 0); b.copyToChannel(R, 1); return b;
  }
  const all = bldNotes(g, nb), notes = all.filter(x=>x.smp === undefined), sn = all.filter(x=>x.smp !== undefined);
  if(!all.length){ const b = c.createBuffer(2, N, fs); return b; }
  const b = c.createBuffer(2, N, fs); L = b.getChannelData(0); R = b.getChannelData(1);
  if(notes.length){ const r = await renderMidi({notes}, g.kind === "drums" ? "drums" : g.sound, fs, N/fs); const rl = r.getChannelData(0), rr = r.getChannelData(1), n = Math.min(N, rl.length);
    for(let i=0;i<n;i++){ L[i] = rl[i]*1.4; R[i] = rr[i]*1.4; } }
  if(sn.length){ await sleep0(); smpMix(sn, L, R, fs); }
  return b;
}
async function bldRender(t, quiet){
  if(!t || !t.gen) return; const job = t.genJob = (t.genJob||0) + 1; await sleep0();
  const b = await bldBuffer(t.gen); if(job !== t.genJob) return;
  const was = playing, pos = currentTime(); if(was) stop();
  t.buffer = b; t.proc = null; t.peaks = computePeaks(b, 400); stemLufs = null; mixSpec = null; P.ver++; SEC.env = null; newBase(t);
  drawWaves(); drawSec(); bldArrDraw(); scheduleAnalysis(); saveSoon();
  if(was){ offset = pos; play(); }
  if(!quiet) setStatus(`„${t.name}“ aktualisiert.`);
}
function bldSoon(t){ clearTimeout(BLD.t); BLD.t = setTimeout(()=>bldRender(t, true), 350); }
async function bldCreate(kind, extra){
  const fs = bldFs(), nb = bldNBars(fs);
  BLD.n[kind] = (BLD.n[kind]||0) + 1;
  const g = {kind, bars: kind === "inst" ? 2 : 1, on: new Array(nb).fill(kind === "loop" ? 0 : 1).map((v,i)=>i < nb ? 1 : 0), steps:{}, notes:[], sound:"piano", fit:true, ...(extra||{})};
  if(kind === "drums") g.steps = Object.fromEntries(Object.entries(DRUM_PRESETS[bldGenre()] || DRUM_PRESETS.pop).map(([k,v])=>[k, v]));
  if(kind === "loop") g.on = new Array(nb).fill(1);
  const nm = kind === "drums" ? `Drums ${BLD.n[kind]}` : kind === "inst" ? `${MIDI_SOUNDS[g.sound] || "Instrument"} ${BLD.n[kind]}` : `Loop ${BLD.n[kind]}${g.srcName ? " · " + g.srcName.replace(/\.[^.]+$/, "").slice(0, 24) : ""}`;
  const t0 = {name: nm, file: nm + ".wav", buffer: ac().createBuffer(2, bldLenSamples(fs), fs), gen: g};
  t0.buffer = await bldBuffer(g);
  if(!tracks.length) setTracks([t0]); else addTrack(t0);
  const t = tracks.find(x=>x.gen === g) || tracks[tracks.length-1];
  bldInfo(); bldEdit(t);
  setStatus(kind === "drums" ? `${nm} angelegt, mit einer Vorlage passend zum Genre. Klick die Kästchen an, um den Beat zu ändern.` :
    kind === "inst" ? `${nm} angelegt. Spiel mit der Tastatur, der Maus oder einem MIDI-Keyboard ein, oder setz Töne in der Piano-Roll.` :
    `${nm} angelegt und auf ${g.bars} Takt${g.bars > 1 ? "e" : ""} angepasst. In der Zeitleiste legst du fest, wo er spielt.`);
}
const bldGenre = () => ({trap:"trap", hiphop:"boombap", rnb:"rnb", pop:"pop", edm:"house", house:"house", rock:"pop", game:"pop", cine:"pop", bgm:"pop"})[GENRE_USED || GENRE] || "pop";
/* ---- editor ---- */
function bldEdit(t){
  BLD.sel = t || null; const g = t && t.gen;
  $("bnEdit").hidden = !g; if(!g){ bldArrDraw(); return; }
  try{ bldMergeFill(); }catch(e){}
  $("beTitle").textContent = (g.kind === "drums" ? "🥁 " : g.kind === "inst" ? "🎹 " : "🔁 ") + t.name;
  $("beDrums").hidden = g.kind !== "drums"; $("beInst").hidden = g.kind !== "inst"; $("beLoop").hidden = g.kind !== "loop";
  $("beBars").hidden = g.kind === "loop"; $("beClear").hidden = g.kind === "loop";
  document.querySelectorAll("#beBars button").forEach(b=>b.setAttribute("aria-pressed", +b.dataset.b === g.bars));
  if(g.kind === "drums"){ bldDGrid(); try{ bldMidiInit(); }catch(e){} }
  if(g.kind === "inst"){ $("beSound").value = g.sound; bldKeys(); bldRoll(); bldMidiInit(); bldWarm(g.sound); }
  if(g.kind === "loop"){ $("beFit").checked = g.fit !== false; $("beLoopInfo").textContent = g.src ? `${g.srcName || "Loop"}: ${(g.src.L.length/g.src.sr).toFixed(2)} s, im Song ${g.bars} Takt${g.bars>1?"e":""} lang.` : "Die Original-Datei dieses Loops ist nicht mehr da (Projekt neu geladen). Du kannst ihn wie eine normale Spur mischen."; }
  bldArrDraw(); setTimeout(()=>$("bnEdit").scrollIntoView({behavior:"smooth", block:"nearest"}), 50);
}
function bldDGrid(){
  const g = BLD.sel.gen, n = g.bars*16, el = $("beDGrid"); el.innerHTML = "";
  el.style.setProperty("--steps", n);
  const hitOf = (note, v) => typeof note === "string" ? smpPlay(note.slice(2), v) : bldHit("drums", note, v);
  [...DRUM_ROWS, ...smpRows(g)].forEach(([lab, note])=>{
    const row = document.createElement("div"); row.className = "drow" + (typeof note === "string" ? " smprow" : "");
    const nm = document.createElement("span"); nm.className = "dname"; nm.textContent = (window.__T||(y=>y))(lab); nm.title = "Anhören"; nm.onclick = ()=>hitOf(note, 0.9); row.appendChild(nm);
    if(typeof note === "string"){ const x = document.createElement("button"); x.type = "button"; x.className = "drx"; x.textContent = "×"; x.title = (window.__T||(y=>y))("Zeile entfernen"); x.onclick = e=>{ e.stopPropagation(); delete g.steps[note]; bldDGrid(); bldSoon(BLD.sel); }; nm.prepend(x); }
    const cells = document.createElement("div"); cells.className = "dcells";
    let s = (g.steps[note] || "").padEnd(n, ".").slice(0, n);
    for(let i=0;i<n;i++){ const b = document.createElement("button"); b.type = "button"; b.className = "dc" + (i % 4 === 0 ? " beat" : "") + (i % 16 === 0 ? " bar" : "") + (s[i] === "x" ? " on" : "");
      b.setAttribute("aria-label", `${lab} ${Math.floor(i/16)+1}.${Math.floor(i%16/4)+1}.${i%4+1}`);
      b.onpointerdown = e=>{ e.preventDefault(); const on = !b.classList.contains("on"); BLD.paint = on; bldDSet(note, i, on, b); if(on) hitOf(note, 0.8); };
      b.onpointerenter = ()=>{ if(BLD.paint !== null && BLD.paint !== undefined) bldDSet(note, i, BLD.paint, b); };
      cells.appendChild(b); }
    row.appendChild(cells); el.appendChild(row);
  });
}
addEventListener("pointerup", ()=>{ BLD.paint = null; });
function bldDSet(note, i, on, b){ const g = BLD.sel.gen, n = g.bars*16; let s = (g.steps[note] || "").padEnd(n, ".").split(""); s[i] = on ? "x" : "."; g.steps[note] = s.join(""); b.classList.toggle("on", on); bldSoon(BLD.sel); }
/* one-shot preview of a drum hit or a note (rendered once, then cached) */
async function bldShot(sound, n){
  const key = sound + ":" + n; if(BLD.cache.has(key)) return BLD.cache.get(key);
  const p = renderMidi({notes:[{t:0, d: sound === "drums" ? 0.1 : 1.6, n, v:0.85}]}, sound, ac().sampleRate, sound === "drums" ? 1 : 2.5); BLD.cache.set(key, p); return p;
}
function bldWarm(sound){ const lo = BLD.oct*12; (async ()=>{ for(let n=lo; n<lo+25; n++){ await bldShot(sound, n); await sleep0(); } })(); }
async function bldHit(sound, n, v){
  const c = ac(); if(c.state === "suspended") c.resume(); const b = await bldShot(sound, n);
  const s = c.createBufferSource(), g = c.createGain(); s.buffer = b; g.gain.value = 0.9*(v||0.8); s.connect(g).connect(master); s.start();
  return {s, g};
}
/* ---- instrument: keyboard, computer keys, MIDI, recording ---- */
const KEYMAP = {KeyA:0, KeyW:1, KeyS:2, KeyE:3, KeyD:4, KeyF:5, KeyT:6, KeyG:7, KeyY:8, KeyZ:8, KeyH:9, KeyU:10, KeyJ:11, KeyK:12, KeyO:13, KeyL:14, KeyP:15, Semicolon:16};
const noteName = n => ["C","C#","D","D#","E","F","F#","G","G#","A","A#","B"][n%12] + (Math.floor(n/12) - 1);
function bldKeys(){
  const el = $("beKeys"), lo = BLD.oct*12; el.innerHTML = ""; $("beOctV").textContent = noteName(lo);
  const whites = []; for(let n=lo; n<lo+25; n++) if(![1,3,6,8,10].includes(n%12)) whites.push(n);
  const W = 100/whites.length;
  for(let n=lo; n<lo+25; n++){ const black = [1,3,6,8,10].includes(n%12), k = document.createElement("button"); k.type = "button";
    k.className = "bk" + (black ? " blk" : ""); k.dataset.n = n; k.title = noteName(n);
    const wi = whites.indexOf(black ? n-1 : n); k.style.left = (black ? (wi+1)*W - W*0.32 : wi*W) + "%"; k.style.width = (black ? W*0.64 : W) + "%";
    if(n % 12 === 0) k.textContent = noteName(n);
    k.onpointerdown = e=>{ e.preventDefault(); k.setPointerCapture(e.pointerId); bldOn(n, 0.85); };
    k.onpointerup = k.onpointercancel = ()=>bldOff(n);
    el.appendChild(k); }
}
const MIDI16 = {acc:null, sus:false, susHeld:new Set(), bend:0, names:[], askT:0, askK:"inst"};
async function bldOn(n, v){
  const t = BLD.sel; if(!t || !t.gen || t.gen.kind !== "inst") return;
  document.querySelectorAll(`#beKeys .bk[data-n="${n}"]`).forEach(k=>k.classList.add("down"));
  const lat = (ctx && (ctx.outputLatency||0) + (ctx.baseLatency||0)) || 0;
  if(BLD.rec && playing) BLD.held.set(n, {t: currentTime() - lat, v});
  const h = await bldHit(t.gen.sound, n, v); try{ if(MIDI16.bend) h.s.detune.value = MIDI16.bend*200; }catch(e){} BLD.live.set(n, h);
}
function bldOff(n){
  document.querySelectorAll(`#beKeys .bk[data-n="${n}"]`).forEach(k=>k.classList.remove("down"));
  const h = BLD.live.get(n); if(h){ try{ const c = ac(); h.g.gain.setTargetAtTime(0, c.currentTime, 0.06); h.s.stop(c.currentTime + 0.4); }catch(e){} BLD.live.delete(n); }
  const on = BLD.held.get(n); if(on && BLD.rec){ BLD.held.delete(n); const lat = (ctx && (ctx.outputLatency||0) + (ctx.baseLatency||0)) || 0; bldRecNote(n, on.t, currentTime() - lat, on.v); }
}
function bldRecNote(n, t0, t1, v){
  const R = BLD.rec, g = BLD.sel && BLD.sel.gen; if(!R || !g) return;
  const st = bldBar()/16, total = g.bars*16;
  let s = (t0 - R.start)/st, l = Math.max(0.5, (t1 - t0)/st);
  if(s < -0.5 || s >= total) return;
  if($("beQuant").checked){ s = Math.max(0, Math.round(s)); l = Math.max(1, Math.round(l)); } else s = Math.max(0, s);
  if(s >= total) return; l = Math.min(l, total - s);
  g.notes.push({s, l, n, v: Math.round((v||0.8)*100)/100}); bldRoll(); R.got++;
}
document.addEventListener("keydown", e=>{
  if(e.repeat || !BLD.sel || !BLD.sel.gen || BLD.sel.gen.kind !== "inst" || $("bnEdit").hidden) return;
  if(/^(INPUT|TEXTAREA|SELECT)$/.test((e.target && e.target.tagName) || "") || e.ctrlKey || e.metaKey || e.altKey) return;
  const k = KEYMAP[e.code]; if(k === undefined) return; e.preventDefault(); bldOn(BLD.oct*12 + k, 0.85);
});
document.addEventListener("keyup", e=>{ const k = KEYMAP[e.code]; if(k === undefined || !BLD.sel) return; bldOff(BLD.oct*12 + k); });
function bldMidiInit(){ midi16Init(false); }
function bldClick(at, hi){ const c = ac(), o = c.createOscillator(), g = c.createGain(); o.frequency.value = hi ? 1600 : 1000; g.gain.setValueAtTime(0.0001, at); g.gain.exponentialRampToValueAtTime(0.25, at + 0.002); g.gain.exponentialRampToValueAtTime(0.0001, at + 0.06); o.connect(g).connect(c.destination); o.start(at); o.stop(at + 0.08); }
function bldRecStart(){
  const t = BLD.sel, g = t && t.gen; if(!g) return;
  if(BLD.rec){ bldRecStop(); return; }
  const B = bldBar(), ph = bldPhase(), nb = bldNBars(bldFs());
  let b0 = Math.floor((currentTime() - ph)/B); if(!g.on[b0]) b0 = g.on.findIndex(v=>v); if(b0 < 0){ g.on.fill(1); b0 = 0; }
  const start = ph + b0*B; if(playing) stop();
  // one bar count-in; at the very start of the song the clicks run alone until the song can start
  const pre = Math.max(0, B - start), c = ac(); if(c.state === "suspended") c.resume();
  offset = Math.max(0, start - B); BLD.rec = {start, got: 0, end: start + g.bars*B, wait: pre > 0};
  $("beRec").textContent = "■ Stopp"; $("beRec").classList.add("on");
  const t0 = c.currentTime + 0.05, songAt = tl => t0 + pre + (tl - offset)/rate;
  if($("beClick").checked){ const beat = B/4; for(let k=-4; k < g.bars*4; k++) bldClick(songAt(start + k*beat), k % 4 === 0); }
  if(pre > 0) setTimeout(()=>{ if(BLD.rec){ BLD.rec.wait = false; play(); } }, (t0 + pre - c.currentTime)*1000); else { BLD.rec.wait = false; play(); }
  setStatus(`Einspielen: ein Takt Vorlauf, dann ${g.bars} Takt${g.bars>1?"e":""}. Spiel einfach mit.`);
  const chk = ()=>{ if(!BLD.rec) return; if(!BLD.rec.wait && (!playing || currentTime() > BLD.rec.end + 0.05)) bldRecStop(); else requestAnimationFrame(chk); }; requestAnimationFrame(chk);
}
function bldRecStop(){
  const R = BLD.rec; if(!R) return; BLD.held.forEach((o, n)=>bldOff(n)); BLD.rec = null; if(playing) stop();
  $("beRec").textContent = "● Einspielen"; $("beRec").classList.remove("on");
  setStatus(R.got ? `${R.got} Töne eingespielt. Du kannst sie in der Piano-Roll verschieben oder nochmal darüber spielen.` : "Es wurden keine Töne eingespielt.");
  if(R.got) bldSoon(BLD.sel);
}
/* ---- piano roll ---- */
function bldRollGeo(){ const cv = $("beRoll"), g = BLD.sel.gen, steps = g.bars*16, rows = 25, lo = BLD.oct*12, W = cv.clientWidth || 600, H = 300, kw = 44, sw = (W - kw)/steps, rh = H/rows; return {cv, g, steps, rows, lo, W, H, kw, sw, rh}; }
function bldRoll(){
  const t = BLD.sel; if(!t || !t.gen || t.gen.kind !== "inst") return;
  const G = bldRollGeo(), {cv, g, steps, rows, lo, W, H, kw, sw, rh} = G, dpr = devicePixelRatio || 1;
  cv.width = W*dpr; cv.height = H*dpr; cv.style.height = H + "px"; const x = cv.getContext("2d"); x.setTransform(dpr,0,0,dpr,0,0);
  x.fillStyle = "#121318"; x.fillRect(0, 0, W, H);
  for(let r=0; r<rows; r++){ const n = lo + rows - 1 - r, blk = [1,3,6,8,10].includes(n%12), y = r*rh;
    x.fillStyle = blk ? "#16171d" : "#1c1d24"; x.fillRect(kw, y, W-kw, rh);
    x.fillStyle = blk ? "#222" : "#ddd"; x.fillRect(0, y, kw-2, rh-1);
    if(n % 12 === 0){ x.fillStyle = "#555"; x.font = "10px sans-serif"; x.fillText(noteName(n), 4, y + rh - 3); } }
  for(let s=0; s<=steps; s++){ x.fillStyle = s % 16 === 0 ? "rgba(255,255,255,.35)" : s % 4 === 0 ? "rgba(255,255,255,.14)" : "rgba(255,255,255,.05)"; x.fillRect(kw + s*sw, 0, 1, H); }
  for(const nt of g.notes){ const r = lo + rows - 1 - nt.n; if(r < 0 || r >= rows) continue;
    const xx = kw + nt.s*sw, ww = Math.max(3, nt.l*sw - 1), y = r*rh + 1;
    x.fillStyle = "#f2a33a"; x.fillRect(xx, y, ww, rh - 2); x.fillStyle = "#1a1205"; x.fillRect(xx + ww - 3, y + 2, 2, rh - 6); }
  const below = g.notes.filter(n=>n.n < lo).length, above = g.notes.filter(n=>n.n >= lo + rows).length;
  if(below || above){ x.fillStyle = "#ffd23f"; x.font = "11px sans-serif"; x.fillText((above ? `▲ ${above} Töne höher  ` : "") + (below ? `▼ ${below} Töne tiefer` : ""), kw + 6, 12); }
}
(function bldRollEvents(){
  const cv = $("beRoll"); let drag = null;
  const hit = e=>{ const G = bldRollGeo(), r = cv.getBoundingClientRect(), px = e.clientX - r.left, py = e.clientY - r.top;
    const n = G.lo + G.rows - 1 - Math.floor(py/G.rh), s = (px - G.kw)/G.sw;
    const nt = G.g.notes.find(q=>q.n === n && s >= q.s && s < q.s + q.l); return {G, px, n, s, nt}; };
  cv.addEventListener("pointerdown", e=>{ if(e.button === 2) return; const h = hit(e); if(h.s < 0) return; e.preventDefault(); cv.setPointerCapture(e.pointerId);
    if(h.nt){ const endX = h.G.kw + (h.nt.s + h.nt.l)*h.G.sw; drag = {nt: h.nt, mode: h.px > endX - 7 ? "len" : "move", ds: h.s - h.nt.s, dn: 0}; }
    else { const nt = {s: Math.max(0, Math.floor(h.s)), l: BLD.lastLen || 2, n: h.n, v: 0.8}; if(nt.s + nt.l > h.G.steps) nt.l = h.G.steps - nt.s; h.G.g.notes.push(nt); drag = {nt, mode: "len", ds: 0, fresh: true}; bldHit(h.G.g.sound, h.n, 0.8).then(x=>setTimeout(()=>{ try{ x.g.gain.setTargetAtTime(0, ac().currentTime, 0.05); }catch(e){} }, 250)); }
    bldRoll(); });
  cv.addEventListener("pointermove", e=>{ const h = hit(e); cv.style.cursor = h.nt && h.px > h.G.kw + (h.nt.s + h.nt.l)*h.G.sw - 7 ? "ew-resize" : h.nt ? "grab" : "crosshair";
    if(!drag) return; const st = h.G.steps;
    if(drag.mode === "len"){ drag.nt.l = Math.max(1, Math.min(st - drag.nt.s, Math.round(h.s - drag.nt.s + 0.5))); }
    else { const ns = Math.max(0, Math.min(st - drag.nt.l, Math.round(h.s - drag.ds))); if(h.n !== drag.nt.n && h.n >= h.G.lo && h.n < h.G.lo + h.G.rows){ drag.nt.n = h.n; } drag.nt.s = ns; }
    bldRoll(); });
  const end = ()=>{ if(drag){ BLD.lastLen = drag.nt.l; drag = null; bldSoon(BLD.sel); } };
  cv.addEventListener("pointerup", end); cv.addEventListener("pointercancel", end);
  const del = e=>{ const h = hit(e); if(!h.nt) return; e.preventDefault(); h.G.g.notes.splice(h.G.g.notes.indexOf(h.nt), 1); bldRoll(); bldSoon(BLD.sel); };
  cv.addEventListener("dblclick", del); cv.addEventListener("contextmenu", del);
})();
/* ---- timeline: one row per built track, bars switched on/off by clicking or dragging ---- */
function bldArrGeo(){ const cv = $("bnArrCv"), rows = bldBuilt(), fs = bldFs(), nb = bldNBars(fs), W = cv.clientWidth || 800, lw = 130, rh = 30, top = 34, H = top + rows.length*rh + 6; return {cv, rows, nb, W, lw, rh, top, H, cw: (W - lw)/nb}; }
function bldArrDraw(){
  const cv = $("bnArrCv"); if(!cv || $("bnArr").hidden) return;
  const G = bldArrGeo(), {rows, nb, W, lw, rh, top, H, cw} = G, dpr = devicePixelRatio || 1;
  cv.width = W*dpr; cv.height = H*dpr; cv.style.height = H + "px"; const x = cv.getContext("2d"); x.setTransform(dpr,0,0,dpr,0,0); x.clearRect(0, 0, W, H);
  // song energy and bar numbers on top
  const B = bldBar(), ph = bldPhase();
  if(duration){ try{ const env = secEnvelope(); x.fillStyle = "rgba(242,163,58,.35)"; for(let i=0;i<W-lw;i++){ const tl = ph + i/cw*B, k = Math.floor(tl/duration*env.length); const v = env[Math.min(env.length-1, Math.max(0,k))] || 0; x.fillRect(lw + i, 22 - v*16, 1, v*16); } }catch(e){} }
  x.fillStyle = "#8d8f9c"; x.font = "11px sans-serif"; x.fillText("Song", 6, 18);
  for(let b=0; b<nb; b++){ if(b % 4 === 0){ x.fillStyle = "#8d8f9c"; x.fillText(String(b+1), lw + b*cw + 2, 31); } }
  if(AB.a !== null && AB.b !== null){ const a = (AB.a - ph)/B, e = (AB.b - ph)/B; x.fillStyle = "rgba(255,210,63,.10)"; x.fillRect(lw + a*cw, 0, (e-a)*cw, H); }
  rows.forEach((t, r)=>{ const y = top + r*rh, sel = t === BLD.sel;
    x.fillStyle = sel ? "#f2a33a" : "#e9eaee"; x.font = (sel ? "bold " : "") + "12px sans-serif";
    x.fillText(t.name.slice(0, 18), 6, y + 19);
    for(let b=0; b<nb; b++){ const on = t.gen.on[b]; x.fillStyle = on ? (sel ? "#f2a33a" : "#c98a2e") : (b % 4 === 0 ? "#26272f" : "#1d1e24"); x.fillRect(lw + b*cw + 1, y + 4, Math.max(1, cw - 2), rh - 8); } });
  if(duration){ const p = (currentTime() - ph)/B; if(p >= 0){ x.fillStyle = "#fff"; x.fillRect(lw + p*cw, 0, 2, H); } }
}
(function bldArrEvents(){
  const cv = $("bnArrCv"); let paint = null;
  const at = e=>{ const G = bldArrGeo(), r = cv.getBoundingClientRect(), px = e.clientX - r.left, py = e.clientY - r.top, row = Math.floor((py - G.top)/G.rh), b = Math.floor((px - G.lw)/G.cw); return {G, px, row, b, t: G.rows[row]}; };
  cv.addEventListener("pointerdown", e=>{ const h = at(e); if(!h.t) { if(h.px > h.G.lw && duration){ offset = Math.max(0, bldPhase() + Math.max(0, h.b)*bldBar()); if(playing){ stop(); play(); } else updateUI(); bldArrDraw(); } return; }
    if(h.px < h.G.lw){ bldEdit(h.t); return; }
    if(h.b < 0 || h.b >= h.G.nb) return; e.preventDefault(); cv.setPointerCapture(e.pointerId);
    if(BLD.sel !== h.t) bldEdit(h.t);
    paint = {t: h.t, v: h.t.gen.on[h.b] ? 0 : 1}; h.t.gen.on[h.b] = paint.v; bldArrDraw(); });
  cv.addEventListener("pointermove", e=>{ if(!paint) return; const h = at(e); if(h.b < 0 || h.b >= h.G.nb) return; if(paint.t.gen.on[h.b] !== paint.v){ paint.t.gen.on[h.b] = paint.v; bldArrDraw(); } });
  const end = ()=>{ if(paint){ const t = paint.t; paint = null; bldSoon(t); } };
  cv.addEventListener("pointerup", end); cv.addEventListener("pointercancel", end);
  setInterval(()=>{ if(playing && !$("bnArr").hidden && $("bnArr").offsetParent) bldArrDraw(); }, 200);
  addEventListener("resize", ()=>{ bldArrDraw(); if(BLD.sel && BLD.sel.gen && BLD.sel.gen.kind === "inst") bldRoll(); });
})();
/* ---- buttons ---- */
$("bnDrums").onclick = ()=>bldCreate("drums");
$("bnInst").onclick = ()=>bldCreate("inst", {sound: "epiano"});
$("bnLoop").onclick = ()=>$("bnLoopFile").click();
$("bnLoopFile").onchange = async e=>{ const f = e.target.files[0]; e.target.value = ""; if(!f) return;
  try{ setStatus(`Lese „${f.name}“ …`); const ab = await f.arrayBuffer(), d = await ac().decodeAudioData(ab);
    if(d.duration > 60) throw new Error("Der Loop ist länger als 60 Sekunden. Nimm ein kürzeres Stück oder lade es als normale Spur.");
    const L = d.getChannelData(0).slice(), R = (d.numberOfChannels > 1 ? d.getChannelData(1) : d.getChannelData(0)).slice();
    await bldCreate("loop", {src: {L, R, sr: d.sampleRate}, srcName: f.name, fit: true});
  }catch(err){ setStatus("Loop konnte nicht geladen werden: " + (err.message || err), true); } };
["bnBpm","bnBars"].forEach(id=>$(id).addEventListener("change", ()=>{ bldInfo(); bldBuilt().forEach(t=>{ const nb = bldNBars(bldFs()); while(t.gen.on.length < nb) t.gen.on.push(1); bldRender(t, true); }); }));
$("beBars").onclick = e=>{ const b = e.target.closest("button"); if(!b || !BLD.sel) return; const g = BLD.sel.gen, nb = +b.dataset.b;
  if(g.kind === "drums"){ for(const k in g.steps){ let s = g.steps[k].padEnd(g.bars*16, "."); while(s.length < nb*16) s += s.slice(0, g.bars*16); g.steps[k] = s.slice(0, nb*16); } }
  if(g.kind === "inst"){ const old = g.bars*16; if(nb > g.bars){ const add = []; for(let rep = g.bars; rep < nb; rep += g.bars) g.notes.forEach(n=>{ if(n.s + rep*16 < nb*16) add.push({...n, s: n.s + rep*16}); }); g.notes.push(...add); } else g.notes = g.notes.filter(n=>n.s < nb*16).map(n=>({...n, l: Math.min(n.l, nb*16 - n.s)})); }
  g.bars = nb; bldEdit(BLD.sel); bldSoon(BLD.sel); };
$("beClear").onclick = ()=>{ const g = BLD.sel && BLD.sel.gen; if(!g) return; if(g.kind === "drums") g.steps = {}; else g.notes = []; bldEdit(BLD.sel); bldSoon(BLD.sel); };
$("beClose").onclick = ()=>{ if(BLD.rec) bldRecStop(); bldEdit(null); };
$("beDPreset").onchange = ()=>{ const p = DRUM_PRESETS[$("beDPreset").value], g = BLD.sel && BLD.sel.gen; if(!p || !g) return;
  g.steps = Object.fromEntries(Object.entries(p).map(([k,v])=>[k, v.repeat(g.bars)])); $("beDPreset").value = ""; bldDGrid(); bldSoon(BLD.sel); };
$("beSound").innerHTML = Object.entries(MIDI_SOUNDS).filter(([k])=>k !== "drums").map(([k,v])=>`<option value="${k}">${v}</option>`).join("");
$("beSound").onchange = ()=>{ const t = BLD.sel; if(!t) return; t.gen.sound = $("beSound").value; bldWarm(t.gen.sound); bldSoon(t); };
$("beRec").onclick = bldRecStart;
$("beOctDn").onclick = ()=>{ BLD.oct = Math.max(1, BLD.oct - 1); bldKeys(); bldRoll(); if(BLD.sel) bldWarm(BLD.sel.gen.sound); };
$("beOctUp").onclick = ()=>{ BLD.oct = Math.min(7, BLD.oct + 1); bldKeys(); bldRoll(); if(BLD.sel) bldWarm(BLD.sel.gen.sound); };
$("beFit").onchange = ()=>{ const t = BLD.sel; if(!t) return; t.gen.fit = $("beFit").checked; bldRender(t).then(()=>bldEdit(t)); };
const bldSet = fn => { const t = BLD.sel || bldBuilt()[0]; if(!t) return; const nb = bldNBars(bldFs()); t.gen.on = Array.from({length: nb}, (_, b)=>fn(b) ? 1 : 0); bldArrDraw(); bldSoon(t); };
$("beAll").onclick = ()=>bldSet(()=>true);
$("beNone").onclick = ()=>bldSet(()=>false);
$("beHook").onclick = ()=>{ if(AB.a === null || AB.b === null){ setStatus("Erst unter „Ausschnitt“ einen Bereich setzen (z. B. „Hook finden“)."); return; } const B = bldBar(), ph = bldPhase(); bldSet(b=>{ const t0 = ph + b*B; return t0 >= AB.a - B*0.5 && t0 < AB.b - B*0.5; }); };
setTimeout(()=>{ try{ bldInfo(); }catch(e){} }, 0);

let restoredNote = "", PENDING_PROJECT = null, RESTORE_PJ = null, AUTO_ON = false, REV_AMT = "off";
function setAutoOn(v){ AUTO_ON = !!v; $("automix").setAttribute("aria-pressed", AUTO_ON); }
