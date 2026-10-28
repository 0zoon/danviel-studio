/* v16.3: "MIDI anzeigen" switch next to the fold button of the track list */
(function(){
  const box = $("strips"); if(!box) return;
  let show = false; try{ show = localStorage.getItem("stemmixer:showMidi") === "1"; }catch(e){}
  const b = document.createElement("button"); b.type = "button"; b.className = "midtog"; b.hidden = true;
  const T = x => (window.__T||(y=>y))(x);
  const upd = () => {
    const mid = tracks.filter(t=>t.isMidi), off = mid.filter(t=>!t.on).length;
    b.hidden = !mid.length; box.classList.toggle("showmidi", show);
    const tx = show ? T("MIDI ausblenden") : `${T("MIDI anzeigen")} (${off})`; if(b.textContent !== tx) b.textContent = tx;
    b.title = T("MIDI-Spuren sind Noten aus Suno, gespielt von einem eingebauten Synth. Ausgeschaltete MIDI-Spuren sind ausgeblendet, damit die Liste übersichtlich bleibt.");
    const tog = box.querySelector(":scope > .ctog"), rr = ((tog ? tog.offsetWidth : 0) + 12) + "px"; if(b.style.right !== rr) b.style.right = rr;
    if(b.parentElement !== box) box.appendChild(b);
  };
  b.onclick = () => { show = !show; try{ localStorage.setItem("stemmixer:showMidi", show ? "1" : "0"); }catch(e){} upd(); try{ drawWaves(); }catch(e){} };
  new MutationObserver(ms=>{ if(ms.every(m=>m.target === b)) return; if(b.parentElement !== box || !b.isConnected) box.appendChild(b); clearTimeout(b._t); b._t = setTimeout(upd, 30); }).observe(box, {childList: true, subtree: true, attributes: true, attributeFilter: ["aria-pressed"]});
  upd();
})();
