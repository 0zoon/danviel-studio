/* v16.3: plug in a keyboard and play. Detected anywhere in the studio, velocity, sustain pedal, pitch bend, MIDI start/stop records */
const instSel16 = () => BLD.sel && BLD.sel.gen && BLD.sel.gen.kind === "inst" && !$("bnEdit").hidden;
function midi16Ui(){
  const box = $("bnMidi"); if(!box) return;
  if(!navigator.requestMIDIAccess){ $("bnMidiTxt").textContent = "USB-Keyboard: in Chrome oder Edge öffnen, dieser Browser kann kein MIDI"; $("bnMidiBtn").hidden = true; return; }
  const n = MIDI16.names; box.classList.toggle("on", !!n.length);
  $("bnMidiTxt").textContent = n.length ? `Keyboard verbunden: ${n.join(", ")}` : (MIDI16.acc ? "Kein Keyboard gefunden. Einstecken genügt, es wird sofort erkannt." : "Kein Keyboard verbunden");
}
function midi16Ask(kind){
  kind = kind === "drums" ? "drums" : "inst";
  if(Date.now() - MIDI16.askT < 1500 && !$("bnAsk").hidden && MIDI16.askK === kind) return; MIDI16.askT = Date.now(); MIDI16.askK = kind;
  const inst = tracks.filter(t=>t.gen && t.gen.kind === kind), last = inst[inst.length-1];
  $("bnAskNew").textContent = kind === "drums" ? "Drum-Spur anlegen" : "Instrument-Spur anlegen";
  $("bnAskTxt").textContent = kind === "drums" ? (last ? "Du spielst Drum-Pads, aber keine Drum-Spur ist offen." : "Drum-Pads erkannt. Leg eine Drum-Spur an und spiel direkt los.") : (last ? "Du spielst gerade, aber keine Instrument-Spur ist offen." : "Keyboard erkannt. Leg eine Instrument-Spur an und spiel direkt los.");
  const go = $("bnAskGo"); go.hidden = !last; if(last){ go.textContent = `Zu „${last.name}“`; go.onclick = ()=>{ $("bnAsk").hidden = true; bldEdit(last); }; }
  $("bnAsk").hidden = false;
}
$("bnAskNew").onclick = ()=>{ $("bnAsk").hidden = true; if(MIDI16.askK === "drums") bldCreate("drums"); else bldCreate("inst", {sound: "epiano"}); };
