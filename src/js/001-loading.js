/* ---------- Loading ---------- */
async function handleFiles(list){
  const files = [...list];
  if(!files.length) return;
  stop(); setStatus("Lade Dateien …"); setProg(0);
  const items = [], midis = [], infos = []; let projJson = null, projCover = null; const ZIPSEEN = []; PROJ_EXTRAS = [];
  for(const f of files){
    if(/\.json$/i.test(f.name)){ try{ const o = JSON.parse(await f.text()); if(o && Array.isArray(o.tracks)) projJson = o; else infos.push({txt: JSON.stringify(o), name: f.name}); }catch(e){} continue; }
    if(/\.(txt|md|lrc)$/i.test(f.name) && f.size < 200000){ infos.push({txt: await f.text(), name: f.name}); continue; }
    if(/\.midi?$/i.test(f.name)){ midis.push({name:f.name, get:()=>f.arrayBuffer()}); continue; }
    if(/\.zip$/i.test(f.name)){
      if(!window.JSZip){ setStatus("ZIP-Unterstützung konnte nicht geladen werden. Entpack die ZIP und zieh die Einzeldateien rein.", true); continue; }
      // unpack the ZIP (and ZIPs inside it, e.g. from WhatsApp / Drive / WeTransfer) and take every audio file in any folder
      setStatus(`Entpacke ${f.name} …`); await sleep0();
      const walk = async (zip, depth) => {
        let all = Object.values(zip.files).filter(e => !e.dir && !/(^|\/)__MACOSX\/|(^|\/)\._/.test(e.name));
        if(depth === 0){ const ex = all.filter(e => /(^|\/)Extras\//.test(e.name)); if(ex.length){ PROJ_EXTRAS.push(...ex); all = all.filter(e => !ex.includes(e)); } }
        for(const e of all.filter(e => /\.(json|txt|md|lrc)$/i.test(e.name))){ try{ const txt = await e.async("string"); if(txt.length > (/\.json$/i.test(e.name) ? 60e6 : 200000)) continue;   // project files carry the cover and logo as images, so they can be big
          const nm = e.name.split("/").pop(); if(/\.json$/i.test(e.name)){ const o = JSON.parse(txt); if(o && Array.isArray(o.tracks)){ if(!projJson) projJson = o; } else infos.push({txt, name: nm}); } else infos.push({txt, name: nm}); }catch(err){} }
        const cv = depth === 0 && all.find(e => /(^|\/)Cover\.png$/i.test(e.name)); if(cv && !projCover) projCover = cv;
        for(const e of all){
          ZIPSEEN.push(e.name);
          if(AUDIO_RE.test(e.name)) items.push({name: e.name.split("/").pop(), blob:()=>e.async("blob")});
          else if(/\.midi?$/i.test(e.name)) midis.push({name: e.name.split("/").pop(), get:()=>e.async("arraybuffer")});
          else if(!/\.(json|txt|md|pdf|png|jpe?g|gif|webp|bmp|svg|docx?|xlsx?|xml|html?|lrc|srt|mid|midi|ds_store|ini|db|url|lnk|exe|dll|nfo)$/i.test(e.name) && !/\.zip$/i.test(e.name) && ((e._data && e._data.uncompressedSize) || 1e6) > 20000)
            items.push({name: e.name.split("/").pop(), blob:()=>e.async("blob"), maybe: true});
          else if(/\.zip$/i.test(e.name) && depth < 2){ try{ await walk(await JSZip.loadAsync(await e.async("arraybuffer")), depth+1); }catch(err){ console.warn("ZIP in ZIP", e.name, err); } }
        }
      };
      try{ await walk(await JSZip.loadAsync(f), 0); log("ZIP entpackt:", f.name, items.length, "Audiodateien"); }
      catch(err){ console.error(err); setStatus(`„${f.name}“ ließ sich nicht entpacken. Ist die ZIP vollständig heruntergeladen?`, true); continue; }
    } else if(AUDIO_RE.test(f.name) || /^(audio|video)\//.test(f.type||"") || !/\.[a-z0-9]{1,5}$/i.test(f.name)){
      items.push({name:f.name, blob:()=>f});
    }
  }
  // unknown extension? still try to decode anything that isn't obviously something else
  if(!items.length) for(const f of files){ if(!/\.(zip|json|txt|pdf|png|jpe?g|gif|doc|docx|exe)$/i.test(f.name)) items.push({name:f.name, blob:()=>f}); }
  if(!items.length){
    if(projJson && tracks.length){ applyProject(projJson); setStatus("Projekt geladen."); return; }
    log("Keine Audiodateien. ZIP-Inhalt:", ZIPSEEN.slice(0,40).join(" | ")); setStatus("Keine Audiodateien gefunden." + (ZIPSEEN.length ? ` In der ZIP liegen: ${ZIPSEEN.slice(0,6).map(n=>n.split("/").pop()).join(", ")}${ZIPSEEN.length>6?" …":""}.` : "") + " Unterstützt werden MP3, WAV, FLAC, OGG, M4A und ZIPs oder Ordner mit solchen Dateien.", true); return; }
  // Suno & co. often deliver every stem as WAV + MP3 (+ MIDI). Same name in several formats = one stem, keep the best quality.
  const QUAL = n => /\.(wav|wave|aif|aiff|flac|caf)$/i.test(n) ? 4 : /\.(m4a|aac|ogg|oga|opus|weba|webm)$/i.test(n) ? 3 : /\.(mp3|mpeg|mpga|mp2)$/i.test(n) ? 2 : 1;
  const stemKey = n => n.split("/").pop().replace(/\.[a-z0-9]{1,5}$/i, "").trim().toLowerCase();
  const best = new Map(); let dupes = 0;
  for(const it of items){ const k = stemKey(it.name), cur = best.get(k);
    if(!cur){ best.set(k, it); continue; }
    dupes++; if(QUAL(it.name) > QUAL(cur.name) || (cur.maybe && !it.maybe)) best.set(k, it); }
  if(dupes){ items.length = 0; items.push(...best.values()); log("Doppelte Stems übersprungen:", dupes); }
  items.sort((a,b)=>a.name.localeCompare(b.name, undefined, {numeric:true}));
  const c = ac(); const out = [];
  for(let i=0;i<items.length;i++){
    setStatus(`Dekodiere ${i+1}/${items.length}: ${cleanName(items[i].name)}`); setProg(i/items.length);
    try{ const raw = await items[i].blob(); let ab = await raw.arrayBuffer(); const buf = await c.decodeAudioData(ab); ab = null; out.push({name:cleanName(items[i].name), file:items[i].name, buffer:buf, raw}); await sleep0(); }
    catch(e){ console.warn(e); if(items[i].maybe) continue; setStatus(`„${items[i].name}“ konnte nicht gelesen werden. Das Format wird von diesem Browser nicht unterstützt, wandle die Datei am besten in MP3 oder WAV um.`, true); }
  }
  // MIDI stems (Suno exports them next to the audio): played by a built-in synth, added switched off so nothing doubles
  if(out.length && midis.length){
    const fs = out[0].buffer.sampleRate, len = Math.max(...out.map(o=>o.buffer.duration));
    for(let i=0;i<midis.length;i++){
      setStatus(`MIDI ${i+1}/${midis.length}: ${cleanName(midis[i].name)} …`); await sleep0();
      try{ const m = parseMidi(await midis[i].get()); if(!m.notes.length) continue;
        const nm = cleanName(midis[i].name), snd = midiDefaultSound(nm, m);
        out.push({name: nm + " (MIDI)", file: midis[i].name, buffer: await renderMidi(m, snd, fs, len), isMidi: true, midi: m, sound: snd}); }
      catch(e){ log("MIDI konnte nicht gelesen werden:", midis[i].name, String(e)); }
    }
  }
  const nMidi = out.filter(o=>o.isMidi).length;
  const infoList = infos.map(x=>{ const i = parseSunoInfo(x.txt); if(i) i._file = x.name; return i; }).filter(Boolean);
  const songNames = [files.length===1 ? files[0].name : "", ...files.map(f=>f.name)];
  const sunoInfo = pickSunoInfo(infoList, songNames);
  setProg(1);
  if(out.length){
    const base = files.length===1 ? files[0].name.replace(/\.[^.]+$/,"") : "Mix";
    $("fname").value = base; $("lText").value = ""; titleAuto = true; fnameManual = false;
    if(base !== "Mix") autoTitle(files[0].name); else $("vTitle").value = "";
    setTracks(out);
    setStatus((out.length===1 ? "Song geladen." : `${out.length - nMidi} Stems geladen.`) + (dupes ? ` ${dupes} doppelte Dateien (z. B. MP3 neben WAV) übersprungen, jeweils die beste Qualität genommen.` : "") + (nMidi ? ` ${nMidi} MIDI-Spuren mit eingebautem Synth dazu (ausgeschaltet, zum Dazumischen einschalten).` : "") + restoredNote);
    if(!projJson && PENDING_PROJECT){ projJson = PENDING_PROJECT; } PENDING_PROJECT = null;
    if(projJson){ VID.coverHi = false;
      if(projCover){ try{ const bm = await createImageBitmap(await projCover.async("blob")); VID.coverHi = true; VID.cover = bm; VID.pal = coverPalette(bm); }catch(e){ VID.coverHi = false; } }
      applyProject(projJson); if(VID.coverHi){ previewSoon(); try{ drawCoverPrev(); }catch(e){} } VID.coverHi = false; try{ await projExtrasLoad(PROJ_EXTRAS, projJson); }catch(e){ log("Projekt-Extras nicht geladen:", String(e && e.message || e)); } PROJ_EXTRAS = [];
      setStatus(`${out.length} Stems geladen, Projekt-Einstellungen übernommen.`); }
    else if(sunoInfo) setTimeout(()=>applySunoInfo(sunoInfo, true), 300);
    else if(!projJson) setTimeout(()=>archLookup([...songNames, $("vTitle").value, $("fname").value], true).catch(()=>{}), 300);
  }
  setTimeout(()=>setProg(0),600);
}

/* ---- RECORDING: microphone over the song, each take becomes its own track ---- */
const REC = {on:false, stream:null, src:null, proc:null, chunks:[], t0:0, pos0:0, lat:0, n:0};
async function recDevices(){ try{ const ds = (await navigator.mediaDevices.enumerateDevices()).filter(d=>d.kind==="audioinput"); const sel = $("recDev"), cur = sel.value;
  sel.innerHTML = '<option value="">Standard-Mikrofon</option>' + ds.filter(d=>d.deviceId && d.deviceId!=="default").map(d=>`<option value="${esc(d.deviceId)}">${esc(d.label || "Mikrofon")}</option>`).join(""); sel.value = cur; }catch(e){} }
function recBuild(raw, sr, startSec, shiftMs, lenSamples){
  const n = lenSamples || Math.round(startSec*sr) + raw.length, b = ac().createBuffer(2, n, sr), L = b.getChannelData(0), R = b.getChannelData(1);
  const at = Math.round((startSec + (shiftMs||0)/1000)*sr);
  for(let i=0;i<raw.length;i++){ const j = at + i; if(j >= 0 && j < n){ L[j] = raw[i]; R[j] = raw[i]; } }
  return b;
}
function recRebuild(t){ const was = playing; if(was) stop(); t.buffer = recBuild(t.recRaw, t.buffer.sampleRate, t.recStart, t.recShift, t.buffer.length); t.proc = null; t.peaks = computePeaks(t.buffer, 400); newBase(t);
  stemLufs = null; P.ver++; drawWaves(); scheduleAnalysis(); saveSoon(); if(was) play(); }
async function recStart(){
  if(REC.on) return;
  if(tracks.length && (Math.abs(rate-1) > 1e-3 || P.tempo !== 1 || P.semis)){ setStatus("Stell für die Aufnahme Tempo und Tonart auf Original, sonst passt die Aufnahme später nicht.", true); return; }
  // ask for the microphone only once per session: the stream stays open and is reused for every take
  let stream = REC.keep && REC.keepDev === $("recDev").value && REC.keep.getAudioTracks().some(t=>t.readyState === "live") ? REC.keep : null;
  if(!stream){
    if(REC.keep){ try{ REC.keep.getTracks().forEach(t=>t.stop()); }catch(e){} REC.keep = null; }
    try{ stream = await navigator.mediaDevices.getUserMedia({audio:{deviceId: $("recDev").value ? {exact:$("recDev").value} : undefined, echoCancellation:false, noiseSuppression:false, autoGainControl:false, channelCount:1}}); }
    catch(e){ setStatus("Kein Zugriff aufs Mikrofon. Erlaube den Zugriff oben in der Adressleiste und versuch es nochmal.", true); return; }
    REC.keep = stream; REC.keepDev = $("recDev").value;
  }
  recDevices();
  const c = ac(); if(c.state === "suspended") await c.resume();
  const src = c.createMediaStreamSource(stream), proc = c.createScriptProcessor(4096, 1, 1), mute = c.createGain(); mute.gain.value = 0;
  src.connect(proc); proc.connect(mute).connect(c.destination);
  Object.assign(REC, {on:true, stream, src, proc, chunks:[], n:0, sr:c.sampleRate, lat: Math.min(0.5, (c.outputLatency || c.baseLatency || 0) + (c.baseLatency || 0.01))});
  // where in the song the take starts
  if(tracks.length){
    stop(); let st = $("recFromSec").checked && AB.a!==null ? AB.a : offset; if(st >= duration - 0.5) st = 0;
    const pre = $("recCount").checked ? 2 : 0; offset = Math.max(0, st - pre); play();
  }
  REC.first = null;
  proc.onaudioprocess = e => { if(!REC.on) return; const x = e.inputBuffer.getChannelData(0);
    if(REC.first === null){ REC.first = e.playbackTime - 2*x.length/REC.sr; REC.pos0 = tracks.length && playing ? offset + (REC.first - startedAt)*rate : 0; }
    REC.chunks.push(new Float32Array(x)); REC.n += x.length;
    let pk = 0; for(let i=0;i<x.length;i++){ const a = Math.abs(x[i]); if(a > pk) pk = a; }
    $("recLvl").style.width = Math.min(100, Math.round(Math.pow(pk, 0.5)*100)) + "%"; $("recTime").textContent = fmtT(REC.n/REC.sr);
    if(tracks.length && !playing) recStop();
    if(REC.n > REC.sr*600) recStop(); };
  $("recBtn").classList.add("on"); $("recBtn").textContent = "● Aufnahme läuft"; $("recStop").hidden = false;
  setStatus(tracks.length ? "Aufnahme läuft. Der Song spielt mit, „■ Stopp“ beendet die Aufnahme." : "Aufnahme läuft (ohne Song). „■ Stopp“ beendet sie.");
}
function recStop(){
  if(!REC.on) return; REC.on = false;
  try{ REC.proc.disconnect(); REC.src.disconnect(); }catch(e){}   // the microphone stays ready for the next take (no new permission question)
  if(playing) stop();
  $("recBtn").classList.remove("on"); $("recBtn").textContent = "● Aufnehmen"; $("recStop").hidden = true; $("recLvl").style.width = "0";
  const raw = new Float32Array(REC.n); let o = 0; for(const ch of REC.chunks){ raw.set(ch, o); o += ch.length; } REC.chunks = [];
  if(raw.length < REC.sr*0.3){ setStatus("Die Aufnahme war zu kurz."); return; }
  let pk = 0; for(let i=0;i<raw.length;i++){ const a = Math.abs(raw[i]); if(a > pk) pk = a; }
  if(pk < 0.003){ setStatus("Es kam kein Ton vom Mikrofon an. Ist das richtige Mikrofon ausgewählt?", true); return; }
  const nTake = tracks.filter(t=>t.isRec).length + 1, name = window.__T ? window.__T(`Aufnahme ${nTake}`) : `Aufnahme ${nTake}`;
  if(!tracks.length){
    const b = recBuild(raw, REC.sr, 0, 0, raw.length);
    setTracks([{name, file: name + ".wav", buffer: b, isRec: true, recRaw: raw, recStart: 0, recShift: 0}]);
    setStatus(`Aufnahme ${nTake} ist jetzt eine Spur. Du kannst weitere Aufnahmen darüber machen.`); return;
  }
  const sr = tracks[0].buffer.sampleRate, start = Math.max(-raw.length/REC.sr, REC.pos0 - REC.lat);
  const b = recBuild(raw, sr, start, 0, tracks[0].buffer.length);
  addTrack({name, file: name + ".wav", buffer: b, isRec: true, recRaw: raw, recStart: start, recShift: 0});
  setStatus(`Aufnahme ${nTake} hinzugefügt (ab ${fmtT(Math.max(0,start))}). Mischen, Effekte und Auto-Mix wirken darauf wie auf jede Spur. Passt das Timing nicht ganz, schieb sie mit „Versatz“.`);
}
$("recBtn").onclick = ()=>{ if(REC.on) recStop(); else recStart(); };
$("recStop").onclick = recStop;
$("recDev").onchange = ()=>{ if(REC.keep && !REC.on){ try{ REC.keep.getTracks().forEach(t=>t.stop()); }catch(e){} REC.keep = null; } };
if(navigator.mediaDevices && navigator.mediaDevices.enumerateDevices) recDevices();
/* ---- MIDI: parse a Standard MIDI File and play it with a small built-in synth ---- */
const MIDI_SOUNDS = {piano:"Piano", epiano:"E-Piano", pad:"Pad", strings:"Streicher", pluck:"Pluck", lead:"Lead-Synth", bass:"Bass", sub808:"808-Bass", drums:"Drums"};
function parseMidi(ab){
  const d = new DataView(ab), u8 = new Uint8Array(ab); let p = 0;
  const str = n => { let x = ""; for(let i=0;i<n;i++) x += String.fromCharCode(u8[p+i]); return x; };
  if(str(4) !== "MThd") throw new Error("keine MIDI-Datei");
  const hl = d.getUint32(4), ntr = d.getUint16(10), div = d.getUint16(12); p = 8 + hl;
  if(div & 0x8000) throw new Error("SMPTE-Zeit wird nicht unterstützt");
  const tempos = [{tick:0, us:500000}], raw = [];
  for(let tr=0; tr<ntr && p < u8.length; tr++){
    if(str(4) !== "MTrk"){ break; } const len = d.getUint32(p+4); p += 8; const end = p + len; let tick = 0, rs = 0;
    const vlq = () => { let v = 0, b; do{ b = u8[p++]; v = (v<<7) | (b & 127); } while(b & 128 && p < end); return v; };
    while(p < end){
      tick += vlq(); let st = u8[p];
      if(st & 128){ p++; if(st < 0xF0) rs = st; } else st = rs;
      if(st === 0xFF){ const ty = u8[p++], l = vlq(); if(ty === 0x51 && l === 3) tempos.push({tick, us:(u8[p]<<16)|(u8[p+1]<<8)|u8[p+2]}); p += l; }
      else if(st === 0xF0 || st === 0xF7){ p += vlq(); }
      else { const hi = st & 0xF0, ch = st & 15, a = u8[p++], b = (hi === 0xC0 || hi === 0xD0) ? 0 : u8[p++];
        if(hi === 0x90 || hi === 0x80) raw.push({tick, on: hi === 0x90 && b > 0, ch, note:a, vel:b}); }
    }
    p = end;
  }
  tempos.sort((a,b)=>a.tick-b.tick);
  const secAt = tk => { let s = 0, last = 0, us = 500000; for(const t of tempos){ if(t.tick >= tk) break; s += (t.tick-last)*us/div/1e6; last = t.tick; us = t.us; } return s + (tk-last)*us/div/1e6; };
  raw.sort((a,b)=>a.tick-b.tick || (a.on?1:0)-(b.on?1:0));
  const open = new Map(), notes = [];
  for(const e of raw){ const k = e.ch*128 + e.note;
    if(e.on){ if(!open.has(k)) open.set(k, []); open.get(k).push(e); }
    else { const st = open.get(k); if(st && st.length){ const o = st.shift(); const t0 = secAt(o.tick), t1 = secAt(e.tick); notes.push({t:t0, d:Math.max(0.03, t1-t0), n:o.note, v:o.vel/127, ch:o.ch}); } } }
  open.forEach(st=>st.forEach(o=>{ const t0 = secAt(o.tick); notes.push({t:t0, d:0.4, n:o.note, v:o.vel/127, ch:o.ch}); }));
  notes.sort((a,b)=>a.t-b.t);
  return {notes, drums: notes.length && notes.filter(n=>n.ch===9).length > notes.length*0.5};
}
function midiDefaultSound(name, m){
  if(m.drums || /(drum|perc|beat)/i.test(name)) return "drums";
  if(/808/i.test(name)) return "sub808"; if(/bass/i.test(name)) return "bass";
  if(/(key|piano|rhodes|organ)/i.test(name)) return "epiano"; if(/string/i.test(name)) return "strings";
  if(/(pad|synth|atmo)/i.test(name)) return "pad"; if(/(guitar|gtr|pluck|arp)/i.test(name)) return "pluck";
  if(/(voc|vox|lead|melod)/i.test(name)) return "lead"; return "piano";
}
// fast synth written directly into sample arrays (no audio nodes), so a whole song renders in about a second
const SYN = {
  piano:  {w:[["tri",1,1],["sin",2,.35]], lp:8, a:.003, d:.5, s:.25, r:.25, g:.32},
  epiano: {w:[["sin",1,1],["sin",3.01,.18]], lp:0, a:.004, d:.7, s:.35, r:.3, g:.34},
  pad:    {w:[["saw",1,1,-9],["saw",1,1,9]], lpHz:1600, a:.35, d:.6, s:.8, r:.6, g:.14},
  strings:{w:[["saw",1,1,-7],["saw",1,1,7]], lpHz:2600, a:.15, d:.6, s:.8, r:.35, g:.15},
  pluck:  {w:[["saw",1,1]], lpEnv:[10,1.5,.08], a:.002, d:.18, s:.1, r:.12, g:.3},
  lead:   {w:[["sqr",1,1,-6],["sqr",1,1,6]], lpHz:3200, a:.01, d:.3, s:.7, r:.12, g:.12},
  bass:   {w:[["saw",1,1],["sin",1,.8]], lpHz:700, a:.004, d:.25, s:.7, r:.06, g:.35},
  sub808: {w:[["sin",1,1]], glide:[1.6,.06], drive:2.2, a:.003, d:.9, s:.6, r:.15, g:.45},
};
async function renderMidi(m, sound, fs, len){
  const N = Math.max(1, Math.ceil((len + 1) * fs)), L = new Float32Array(N), R = new Float32Array(N), TW = 2*Math.PI;
  const hz = n => 440*Math.pow(2, (n-69)/12), ct = c => Math.pow(2, (c||0)/1200), cf = f => 1 - Math.exp(-TW*Math.min(f, fs*0.45)/fs);
  const wave = (ty, ph) => ty === "sin" ? Math.sin(TW*ph) : ty === "tri" ? 4*Math.abs(ph - Math.floor(ph + 0.5)) - 1 : ty === "saw" ? 2*(ph - Math.floor(ph + 0.5)) : (ph % 1 < 0.5 ? 1 : -1);
  let k = 0;
  for(const nt of m.notes){
    if(nt.t > len) break; if((++k & 31) === 0) await sleep0();
    const v = 0.25 + 0.75*nt.v, i0 = Math.round(nt.t*fs);
    if(sound === "drums"){
      const n = nt.n; let dur = 0.3, kind = "tom";
      if(n === 35 || n === 36){ kind = "kick"; dur = 0.45; } else if(n === 39){ kind = "clap"; dur = 0.3; } else if(n === 38 || n === 40){ kind = "snare"; dur = 0.3; }
      else if(n === 46){ kind = "ohat"; dur = 0.45; } else if([42,44].includes(n)){ kind = "hat"; dur = 0.08; } else if([49,51,52,55,57,59].includes(n)){ kind = "crash"; dur = 1.4; }
      const end = Math.min(N, i0 + Math.round(dur*fs)); let ph = 0, lp1 = 0, lp2 = 0;
      for(let i=i0;i<end;i++){ const tt = (i-i0)/fs; let x = 0;
        if(kind === "kick"){ const f = 45 + 105*Math.exp(-tt/0.035); ph += f/fs; x = Math.sin(TW*ph)*Math.exp(-tt/0.12)*0.95; }
        else if(kind === "snare"){ const nz = Math.random()*2-1; lp1 += (nz-lp1)*0.35; const bp = nz - lp1; ph += 190/fs; x = (bp*0.8*Math.exp(-tt/0.07) + Math.sin(TW*ph)*0.45*Math.exp(-tt/0.05))*0.8; }
        else if(kind === "clap"){ const nz = Math.random()*2-1; lp1 += (nz-lp1)*0.3; const bp = nz - lp1, burst = tt < 0.03 ? (Math.floor(tt/0.01) % 2 ? 0.35 : 1) : 1; x = bp*burst*Math.exp(-Math.max(0, tt-0.02)/0.09)*0.9; }
        else if(kind === "hat" || kind === "ohat" || kind === "crash"){ const nz = Math.random()*2-1; lp1 += (nz-lp1)*0.55; x = (nz - lp1)*Math.exp(-tt/(kind === "hat" ? 0.025 : kind === "ohat" ? 0.14 : 0.45))*(kind === "crash" ? 0.35 : 0.4); }
        else { const f = Math.max(60, 80 + (n-40)*10)*(1 + 0.5*Math.exp(-tt/0.04)); ph += f/fs; x = Math.sin(TW*ph)*Math.exp(-tt/0.13)*0.55; }
        x *= v; L[i] += x; R[i] += x; }
      continue;
    }
    const P = SYN[sound] || SYN.piano, f0 = hz(nt.n), d = nt.d, rel = P.r, end = Math.min(N, i0 + Math.round((d + rel*5)*fs));
    const nw = P.w.length, ty = P.w.map(w=>w[0]), amp = P.w.map(w=>w[2]), side_ = P.w.map(w=>w[3]||0), inc = P.w.map(w=>f0*w[1]*ct(w[3])/fs);
    const ph = P.w.map(()=>Math.random()), lpA = P.lpHz ? cf(P.lpHz) : P.lp ? cf(f0*P.lp) : 0;
    let y1 = 0, y2 = 0, eRel = 0;
    for(let i=i0;i<end;i++){ const tt = (i-i0)/fs;
      let e; if(tt < P.a) e = tt/P.a; else if(tt < d) e = P.s + (1-P.s)*Math.exp(-(tt-P.a)/P.d); else { if(!eRel) eRel = P.s + (1-P.s)*Math.exp(-Math.max(0, d-P.a)/P.d) || 1e-4; e = eRel*Math.exp(-(tt-d)/rel); }
      const gl = P.glide ? 1 + (P.glide[0]-1)*Math.exp(-tt/P.glide[1]) : 1;
      let xl = 0, xr = 0;
      for(let q=0;q<nw;q++){ let pq = ph[q] + inc[q]*gl; pq -= Math.floor(pq); ph[q] = pq; const w = wave(ty[q], pq)*amp[q]; if(side_[q] < 0) xl += w*1.6; else if(side_[q] > 0) xr += w*1.6; else { xl += w; xr += w; } }
      let x = (xl + xr)/2, side = (xl - xr)/2;
      if(P.drive) x = Math.tanh(P.drive*x)/Math.tanh(P.drive);
      const a = P.lpEnv ? cf(f0*(P.lpEnv[1] + (P.lpEnv[0]-P.lpEnv[1])*Math.exp(-tt/P.lpEnv[2]))) : lpA;
      if(a){ y1 += (x - y1)*a; y2 += (y1 - y2)*a; x = y2; side *= 0.6; }
      const g = e*P.g*v; L[i] += (x + side)*g; R[i] += (x - side)*g;
    }
  }
  let pk = 0; for(let i=0;i<N;i++){ const a = Math.max(Math.abs(L[i]), Math.abs(R[i])); if(a > pk) pk = a; }
  if(pk > 0){ const kk = 0.5/pk; for(let i=0;i<N;i++){ L[i] *= kk; R[i] *= kk; } }
  const b = ac().createBuffer(2, N, fs); b.copyToChannel(L, 0); b.copyToChannel(R, 1); return b;
}
async function setMidiSound(t, snd){
  if(!t.isMidi || !MIDI_SOUNDS[snd]) return; t.sound = snd; setStatus(`${t.name}: Sound „${MIDI_SOUNDS[snd]}“ wird erzeugt …`); await sleep0();
  const was = playing; if(was) stop();
  const L0 = t.buffer.duration; t.buffer = await renderMidi(t.midi, snd, t.buffer.sampleRate, Math.max(1, L0 - 1)); t.proc = null; t.peaks = computePeaks(t.buffer, 400); newBase(t);
  stemLufs = null; mixSpec = null; P.ver++;
  drawWaves(); scheduleAnalysis(); saveSoon(); if(was) play();
  setStatus(`${t.name}: Sound „${MIDI_SOUNDS[snd]}“.` + (t.on ? "" : " Die Spur ist noch aus, schalte sie zum Hören ein."));
}
