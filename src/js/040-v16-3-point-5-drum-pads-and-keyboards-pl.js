/* v16.3 point 5: drum pads (and keyboards) play the drum pattern; while the song runs every hit is written into the grid on the nearest 16th */
const drumsSel16 = () => BLD.sel && BLD.sel.gen && BLD.sel.gen.kind === "drums" && !$("bnEdit").hidden;
const PAD_MAP = {35:36, 36:36, 37:38, 38:38, 40:38, 39:39, 42:42, 44:42, 46:46, 41:45, 43:45, 45:45, 47:45, 48:45, 50:45, 49:49, 51:49, 52:49, 53:49, 55:49, 57:49, 59:49};
function pad16(n, v){
  const row = PAD_MAP[n] !== undefined ? PAD_MAP[n] : DRUM_ROWS[((n % 12) + 12) % 12 % DRUM_ROWS.length][1];
  bldHit("drums", row, Math.max(0.15, v));
  const ri = DRUM_ROWS.findIndex(r=>r[1] === row), cell = $("beDGrid").children[ri] && $("beDGrid").children[ri].querySelector(".dcells");
  if(cell){ const nm = $("beDGrid").children[ri].querySelector(".dname"); if(nm){ nm.classList.add("hit"); setTimeout(()=>nm.classList.remove("hit"), 140); } }
  if(!playing || !cell) return;
  const g = BLD.sel.gen, N = g.bars*16, st = bldBar()/16, lat = (ctx && (ctx.outputLatency||0) + (ctx.baseLatency||0)) || 0;
  const i = ((Math.round((currentTime() - lat - bldPhase())/st) % N) + N) % N, b = cell.children[i];
  if(b && !b.classList.contains("on")) bldDSet(row, i, true, b);
}
function midi16Msg(m){
  const [st, a, b] = m.data, hi = st & 0xF0;
  if(st === 0xFA){ if(instSel16() && !BLD.rec) bldRecStart(); return; }
  if(st === 0xFC){ if(BLD.rec) bldRecStop(); return; }
  if(hi === 0x90 && b > 0 && drumsSel16()){ pad16(a, b/127); return; }
  if(hi === 0x90 && b > 0 && (st & 0x0F) === 9 && !instSel16()){ midi16Ask("drums"); return; }
  if(hi === 0x90 && b > 0){ if(!instSel16()){ midi16Ask(); return; } MIDI16.susHeld.delete(a); if(BLD.live.has(a)) bldOff(a); bldOn(a, Math.max(0.08, b/127)); }
  else if(hi === 0x80 || (hi === 0x90 && b === 0)){ if(MIDI16.sus) MIDI16.susHeld.add(a); else bldOff(a); }
  else if(hi === 0xB0 && a === 64){ const on = b >= 64; if(!on && MIDI16.sus){ MIDI16.susHeld.forEach(n=>bldOff(n)); MIDI16.susHeld.clear(); } MIDI16.sus = on; }
  else if(hi === 0xE0){ MIDI16.bend = (((b << 7) | a) - 8192)/8192; let c; try{ c = ac(); }catch(e){ return; } BLD.live.forEach(h=>{ try{ h.s.detune.setTargetAtTime(MIDI16.bend*200, c.currentTime, 0.01); }catch(e){} }); }
}
function midi16Init(ask){
  if(MIDI16.acc || !navigator.requestMIDIAccess){ midi16Ui(); return; }
  navigator.requestMIDIAccess().then(acc=>{
    MIDI16.acc = acc; BLD.midiOk = true;
    const hook = ()=>{ const ins = [...acc.inputs.values()].filter(i=>i.state !== "disconnected"), before = MIDI16.names;
      ins.forEach(i=>{ i.onmidimessage = midi16Msg; }); MIDI16.names = ins.map(i=>i.name || "MIDI");
      const fresh = MIDI16.names.filter(n=>!before.includes(n));
      if(fresh.length){ setStatus(`Keyboard erkannt: ${fresh.join(", ")}. Einfach spielen.`); if(!instSel16() && !drumsSel16()) midi16Ask(); }
      if(ins.length && $("beMidi")) $("beMidi").textContent = `MIDI-Keyboard verbunden: ${MIDI16.names.join(", ")}. Einfach spielen.`;
      midi16Ui(); };
    hook(); acc.onstatechange = hook;
  }).catch(()=>{ if(ask) $("bnMidiTxt").textContent = "Kein Zugriff aufs Keyboard. In der Adressleiste MIDI erlauben und nochmal klicken."; });
}
$("bnMidiBtn").onclick = ()=>midi16Init(true);
midi16Ui();
try{ navigator.permissions && navigator.permissions.query({name:"midi"}).then(p=>{ if(p.state === "granted") midi16Init(false); }).catch(()=>{}); }catch(e){}

