/* ---------- UI ---------- */
function renderStrips(){
  const box = $("strips"); const keepTog = box.querySelector(":scope > .ctog"); box.innerHTML = ""; if(keepTog) box.appendChild(keepTog);   // keep the fold button when strips are rebuilt
  tracks.forEach((t,i)=>{
    const el = document.createElement("div"); el.className = "strip" + (t.isMidi ? " midi" : ""); el.style.setProperty("--sc", stemColor(t));
    el.innerHTML = `
      <button class="toggle" id="on${i}" aria-pressed="true" aria-label="${esc(t.name)} im Mix"></button>
      <div class="name"><b translate="no" title="${esc(t.file)}"></b><canvas id="wv${i}"></canvas><small class="tags"></small>${t.isRec ? `<div class="rectools"><label>Versatz <input type="range" class="recoff" min="-300" max="300" step="5" value="${t.recShift||0}" title="Aufnahme früher (links) oder später (rechts) schieben, in Millisekunden"> <span class="recoffv">${t.recShift||0} ms</span></label><button class="recdel" type="button" title="Diese Aufnahme löschen">🗑 Löschen</button></div>` : ""}${t.gen ? `<div class="rectools"><button class="bedt" type="button" title="Muster, Töne oder Zeitleiste dieser Spur bearbeiten">✎ Bearbeiten</button><button class="recdel" type="button" title="Diese Spur löschen">🗑 Löschen</button></div>` : ""}${t.isMidi ? `<label class="msnd"><span>🎹 Sound</span><select class="msound" aria-label="Sound für ${esc(t.name)}">${Object.entries(MIDI_SOUNDS).map(([k,v])=>`<option value="${k}"${k===t.sound?" selected":""}>${v}</option>`).join("")}</select></label>` : ""}</div>
      <div class="vol"><div class="vtop"><span class="vlab">🔊 Lautstärke</span><span class="vdb">0.0 dB</span></div><div class="vrow"><button class="vstep" type="button" data-d="-1" title="1 dB leiser" aria-label="Leiser">−</button><input type="range" id="vol${i}" min="0" max="200" value="100" aria-label="Lautstärke ${esc(t.name)}" title="Ziehen = lauter/leiser, Doppelklick = zurück auf 0 dB"><button class="vstep" type="button" data-d="1" title="1 dB lauter" aria-label="Lauter">+</button></div></div>
      <button class="more" aria-expanded="false" aria-controls="det${i}">Klang</button>
      <button class="solo" id="solo${i}" aria-pressed="false" title="Solo">S</button>
      <div class="detail" id="det${i}" hidden>
        <div class="trimbox"><div class="trimhead"><b>✂ Zuschneiden &amp; Verschieben</b><span class="tinfo"></span><span class="tzoom"><button type="button" data-z="in" title="Reinzoomen (oder Mausrad)">＋</button><button type="button" data-z="out" title="Rauszoomen">－</button><button type="button" data-z="all">Ganze Spur</button></span></div>
          <canvas class="trimcv" height="96"></canvas>
          <div class="trimrow"><span class="tlab">Verschieben</span><button type="button" data-s="-bar">◀ 1 Takt</button><button type="button" data-s="-0.1">◀ 0,1 s</button><button type="button" data-s="-0.01">◀ 10 ms</button><button type="button" data-s="0.01">10 ms ▶</button><button type="button" data-s="0.1">0,1 s ▶</button><button type="button" data-s="bar">1 Takt ▶</button>
            <button type="button" class="tplay">▶ Ab Schnitt hören</button><button type="button" class="treset">Zurücksetzen</button><button type="button" class="tunmerge" hidden>↶ Zusammenführen rückgängig</button></div>
          <small class="tnote">Die gelben Griffe ziehen = Anfang und Ende abschneiden (mit kurzer Blende). Mausrad = zoomen, Shift + Mausrad = seitlich. „Verschieben“ setzt die Spur früher oder später ein. Das Original bleibt erhalten.</small></div>
        <label class="knob"><span class="top">Panorama<span class="vPan"></span></span><input type="range" class="pan" id="pan${i}" min="-100" max="100" step="5" value="0"><small>links ↔ rechts</small></label>
        <label class="knob"><span class="top">Low-Cut<span class="vHpf"></span></span><input type="range" class="hpf" id="hpf${i}" min="0" max="300" step="10" value="0"><small>nimmt Rumpeln und Matsch raus</small></label>
        <label class="knob"><span class="top">Bass<span class="vLow"></span></span><input type="range" class="low" id="low${i}" min="-6" max="6" step="0.5" value="0"><small>Shelf unter 150 Hz</small></label>
        <label class="knob"><span class="top">Höhen<span class="vHigh"></span></span><input type="range" class="high" id="high${i}" min="-6" max="6" step="0.5" value="0"><small>Shelf über 6 kHz</small></label>
        <label class="knob"><span class="top">Platz-EQ<span class="vPg"></span></span><input type="range" class="pg" id="pg${i}" min="-6" max="0" step="0.5" value="0"><small class="pgWhy">macht Platz für andere Spuren</small></label>
        <label class="knob"><span class="top">EQ-Frequenz<span class="vPf"></span></span><input type="range" class="pfs" id="pf${i}" min="0" max="100" step="1" value="50"><small>wo abgesenkt wird</small></label>
        <label class="knob"><span class="top">Kompressor<span class="vComp"></span></span><input type="range" class="comp" id="comp${i}" min="0" max="100" step="5" value="0"><small>gleicht laut und leise aus</small></label>
        <label class="knob"><span class="top">Pegel-Ausgleich<span class="vRide"></span></span><input type="range" class="ride" id="ride${i}" min="0" max="100" step="5" value="0"><small>hält die Stimme gleichmäßig laut</small></label>
        <label class="knob"><span class="top">De-Esser<span class="vDeess"></span></span><input type="range" class="deess" id="deess${i}" min="0" max="100" step="5" value="0"><small>zähmt scharfe S- und Z-Laute</small></label>
        <label class="knob"><span class="top">Rauschen entfernen<span class="vDn"></span></span><input type="range" class="dn" id="dn${i}" min="0" max="100" step="10" value="0"><small>nimmt KI-Rauschen und Zischen raus</small></label>
        <label class="knob"><span class="top">Hall<span class="vRev"></span></span><input type="range" class="rev" id="rev${i}" min="0" max="100" step="5" value="0"><small>Raum um die Spur</small></label>
        <label class="knob"><span class="top">Echo<span class="vDly"></span></span><input type="range" class="dly" id="dly${i}" min="0" max="100" step="5" value="0"><small>Wiederholungen im Takt</small></label>
      </div>`;
    el.querySelector("b").textContent = t.name;
    // rename a track: double-click the name or the ✎ next to it
    { const nb = el.querySelector("b"), pen = document.createElement("button"), row = document.createElement("span"); row.className = "nmrow"; nb.before(row); row.appendChild(nb); pen.type = "button"; pen.className = "renm"; pen.textContent = "✎"; pen.title = "Spur umbenennen"; pen.setAttribute("aria-label", "Spur umbenennen"); row.appendChild(pen);
      const go = ()=>{ if(nb.isContentEditable) return; const old = t.name; nb.contentEditable = "true"; nb.classList.add("editing"); nb.focus();
        const rg = document.createRange(); rg.selectNodeContents(nb); const sel = getSelection(); sel.removeAllRanges(); sel.addRange(rg);
        let done = false; const fin = save => { if(done) return; done = true; nb.contentEditable = "false"; nb.classList.remove("editing");
          const nv = nb.textContent.replace(/\s+/g, " ").trim().slice(0, 60);
          if(!save || !nv || nv === old){ nb.textContent = old; return; }
          if(!t.origName) t.origName = old; t.name = nv; nb.textContent = nv; updateUI(); saveSoon(); setStatus(`Spur umbenannt: „${old}“ heißt jetzt „${nv}“.`); };
        nb.onkeydown = e=>{ e.stopPropagation(); if(e.key === "Enter"){ e.preventDefault(); fin(true); } else if(e.key === "Escape"){ e.preventDefault(); fin(false); } };
        nb.onblur = ()=>fin(true); };
      nb.ondblclick = go; pen.onclick = go; }
    box.appendChild(el); t.el = el;
    el.querySelector(".toggle").onclick = ()=>{ t.on=!t.on; updateUI(); };
    const ms = el.querySelector(".msound"); if(ms) ms.onchange = ()=>setMidiSound(t, ms.value);
    const be = el.querySelector(".bedt"); if(be) be.onclick = ()=>{ if(typeof goStep === "function" && COMPACT && STEP !== 2) goStep(2); bldEdit(t); };
    const ro = el.querySelector(".recoff"); if(ro){ ro.oninput = ()=>{ el.querySelector(".recoffv").textContent = ro.value + " ms"; }; ro.onchange = ()=>{ t.recShift = +ro.value; recRebuild(t); }; }
    const rd = el.querySelector(".recdel"); if(rd) rd.onclick = ()=>{ if(rd.dataset.arm){ removeTrack(t); return; } rd.dataset.arm = "1"; rd.textContent = "Sicher? Nochmal klicken"; setTimeout(()=>{ delete rd.dataset.arm; rd.textContent = "🗑 Löschen"; }, 3000); };
    el.querySelector(".solo").onclick = ()=>{ t.solo=!t.solo; updateUI(); };
    const more = el.querySelector(".more"), det = el.querySelector(".detail");
    more.onclick = ()=>{ det.hidden = !det.hidden; more.setAttribute("aria-expanded", !det.hidden); };
    if(PROVIEW){ det.hidden = false; more.setAttribute("aria-expanded", true); }
    const r = el.querySelector(".vol input[type=range]");
    t.setVol = v => { t.vol = v; r.value = Math.round(v*100); el.querySelector(".vol .vdb").textContent = v===0 ? "−∞ dB" : (20*Math.log10(v)>=0?"+":"")+(20*Math.log10(v)).toFixed(1)+" dB"; };
    r.oninput = ()=>{ t.setVol(r.value/100); applyGains(); scheduleAnalysis(); saveSoon(); };
    r.ondblclick = ()=>{ r.value=100; r.oninput(); };
    el.querySelectorAll(".vstep").forEach(b=>b.onclick = ()=>{ const d = +b.dataset.d, v = Math.max(0.01, t.vol || 0.01) * Math.pow(10, d/20); t.setVol(Math.min(2, v < 0.02 && d < 0 ? 0 : v)); applyGains(); scheduleAnalysis(); saveSoon(); });
    t.refresh = ()=>{
      el.querySelector(".pan").value = t.pan; el.querySelector(".hpf").value = t.hpf; el.querySelector(".low").value = t.low; el.querySelector(".high").value = t.high;
      el.querySelector(".pg").value = t.pg; el.querySelector(".pfs").value = f2s(t.pf); el.querySelector(".rev").value = t.rev; el.querySelector(".dly").value = t.dly;
      el.querySelector(".vPg").textContent = t.pg ? t.pg+" dB" : "Aus";
      el.querySelector(".vPf").textContent = fmtHz(t.pf);
      el.querySelector(".pgWhy").textContent = t.pg && t.why ? t.why : "macht Platz für andere Spuren";
      el.querySelector(".comp").value = t.comp; el.querySelector(".deess").value = t.deess; el.querySelector(".ride").value = t.ride||0; el.querySelector(".vRide").textContent = t.ride ? t.ride+" %" : "Aus";
      el.querySelector(".vComp").textContent = t.comp ? `${(1+3*t.comp/100).toFixed(1)}:1` : "Aus";
      el.querySelector(".vDeess").textContent = t.deess ? t.deess+" %" : "Aus";
      el.querySelector(".dn").value = t.dn||0; el.querySelector(".vDn").textContent = t.dn ? t.dn+" %" : "Aus";
      el.querySelector(".vRev").textContent = t.rev+" %"; el.querySelector(".vDly").textContent = t.dly+" %";
      el.querySelector(".vPan").textContent = panTxt(t.pan);
      el.querySelector(".vHpf").textContent = t.hpf ? t.hpf+" Hz" : "Aus";
      el.querySelector(".vLow").textContent = (t.low>0?"+":"")+t.low+" dB";
      el.querySelector(".vHigh").textContent = (t.high>0?"+":"")+t.high+" dB";
      const tags = [panTxt(t.pan)]; if(t.hpf) tags.push("Low-Cut "+t.hpf+" Hz"); if(t.low) tags.push("Bass "+(t.low>0?"+":"")+t.low); if(t.high) tags.push("Höhen "+(t.high>0?"+":"")+t.high); if(t.pg) tags.push(`Platz ${t.pg} dB @ ${fmtHz(t.pf)}`); if(t.comp) tags.push("Komp "+(1+3*t.comp/100).toFixed(1)+":1"); if(t.deess) tags.push("De-Ess"); if(t.dn) tags.push("Entrauscht"); if(t.trimA || t.trimB) tags.push("Geschnitten"); if(t.shift) tags.push("Versatz " + (t.shift > 0 ? "+" : "") + t.shift.toFixed(2).replace(".", ",") + " s"); if(t.merged) tags.push("Zusammengeführt"); if(ducked(t)) tags.push("Sidechain"); if(t.rev) tags.push("Hall "+t.rev+" %"); if(t.dly) tags.push("Echo "+t.dly+" %");
      el.querySelector(".tags").textContent = tags.join(" · ");
      if(t.chain) t.chain.set(t);
    };
    el.querySelector(".ride").oninput = e=>{ t.ride = +e.target.value; t.refresh(); if(playing){ stop(); play(); } scheduleAnalysis(); saveSoon(); };
    ["pan","hpf","low","high","pg","rev","dly","comp","deess"].forEach(k=>{ el.querySelector("."+k).oninput = e=>{ t[k] = +e.target.value; if(k==="pg") t.why=""; t.refresh(); scheduleAnalysis(); saveSoon(); }; });
    { const d = el.querySelector(".dn"); let dt = 0; d.oninput = ()=>{ el.querySelector(".vDn").textContent = +d.value ? d.value+" %" : "Aus"; clearTimeout(dt); dt = setTimeout(()=>setDenoise(t, +d.value), 450); }; }
    trimUi(t, el);
    el.querySelector(".pfs").oninput = e=>{ t.pf = s2f(+e.target.value); t.why=""; t.refresh(); scheduleAnalysis(); saveSoon(); };
    el.querySelector(".pan").ondblclick = ()=>{ t.pan=0; t.refresh(); scheduleAnalysis(); saveSoon(); };
    t.refresh();
  });
  drawWaves();
}
const f2s = f => Math.round(Math.log(f/100)/Math.log(80)*100), s2f = v => Math.round(100*Math.pow(80, v/100)/10)*10;
const fmtHz = f => f>=1000 ? (f/1000).toFixed(f%1000?1:0).replace(".",",")+" kHz" : f+" Hz";
const panTxt = v => v===0 ? "Mitte" : (v<0 ? "L " : "R ")+Math.abs(v);

/* Per-stem channel strip:
   low-cut (24 dB/oct) -> bass shelf -> treble shelf -> "Platz-EQ" dip
   -> de-esser (split band at 6 kHz, only the top band is compressed)
   -> compressor -> volume -> sidechain duck -> pan
   with post-fader sends to the reverb and delay buses */
function stemChain(c, fx){
  const input = c.createGain();
  const h1 = c.createBiquadFilter(), h2 = c.createBiquadFilter(); [h1,h2].forEach(f=>{ f.type="highpass"; f.Q.value=BW_Q; });
  const lo = c.createBiquadFilter(); lo.type="lowshelf"; lo.frequency.value=150;
  const hi = c.createBiquadFilter(); hi.type="highshelf"; hi.frequency.value=6000;
  const pk = c.createBiquadFilter(); pk.type="peaking"; pk.Q.value=1.4;
  // Linkwitz-Riley crossover (two cascaded Butterworth stages per side sums flat)
  const bq = (type)=>{ const f=c.createBiquadFilter(); f.type=type; f.frequency.value=Math.min(6000, c.sampleRate*0.45); f.Q.value=BW_Q; return f; };
  const xl1=bq("lowpass"), xl2=bq("lowpass"), xh1=bq("highpass"), xh2=bq("highpass");
  const ds = c.createDynamicsCompressor(); ds.attack.value=0.002; ds.release.value=0.05; ds.knee.value=3;
  const sum = c.createGain();
  const comp = c.createDynamicsCompressor(); comp.attack.value=0.01; comp.release.value=0.12; comp.knee.value=6;
  const mk = c.createGain(), vol = c.createGain(), duck = c.createGain(), pan = c.createStereoPanner(), rs = c.createGain(), dsend = c.createGain(), ride = c.createGain();
  input.connect(ride).connect(h1).connect(h2).connect(lo).connect(hi).connect(pk);
  pk.connect(xl1).connect(xl2).connect(sum);
  const dsMk = c.createGain(); pk.connect(xh1).connect(xh2).connect(ds).connect(dsMk).connect(sum);
  sum.connect(comp).connect(mk).connect(vol).connect(duck).connect(pan);
  if(fx){ vol.connect(rs).connect(fx.rin); vol.connect(dsend).connect(fx.din); }
  return {input, output:pan, vol, duck, comp, ride, set(t){
    const f = t.hpf>0 ? t.hpf : 10; h1.frequency.value = f; h2.frequency.value = f;
    lo.gain.value = t.low; hi.gain.value = t.high; pk.frequency.value = Math.min(t.pf, c.sampleRate*0.45); pk.gain.value = t.pg;
    const L = (t.comp||t.deess) ? stemLevel(t) : -20;
    const a = (t.comp||0)/100, d = (t.deess||0)/100;
    // compressor: up to 4:1, threshold set from the stem's own loudness so loud phrases get ~3–6 dB
    comp.ratio.value = 1 + 3*a; comp.threshold.value = a ? Math.min(0, L + 4 - 8*a) : 0;
    mk.gain.value = a ? db2(cmkGet(t, comp.threshold.value, comp.ratio.value) - compMakeupDb(comp.threshold.value, 6, comp.ratio.value)) : 1;
    ds.ratio.value = d ? 4 : 1; ds.threshold.value = d ? Math.min(0, L - 4 - 14*d) : 0;
    dsMk.gain.value = d ? db2(-compMakeupDb(ds.threshold.value, 3, 4)) : 1;   // de-esser only ever turns S sounds down, never lifts hiss
    pan.pan.value = t.pan/100; rs.gain.value = (t.rev||0)/100; dsend.gain.value = (t.dly||0)/100;
  }};
}
// Compressor make-up per stem: measured once (the stem through the compressor, loudness before vs after),
// so a compressed vocal sits exactly where the balance put it. Until measured: a close estimate.
const CMK = new WeakMap(), CMKQ = new Set(); let cmkT = 0;
function cmkGet(t, thr, ratio){
  const b = buf(t), m = CMK.get(b), key = thr.toFixed(2) + "/" + ratio.toFixed(3);
  if(m && m.has(key)) return m.get(key);
  CMKQ.add(t); clearTimeout(cmkT); cmkT = setTimeout(()=>cmkReady([...CMKQ]).then(n=>{ if(n) scheduleAnalysis(); }), 300);
  return Math.max(0, (2 + 8*(ratio-1)/3)*(1 - 1/ratio)*0.6);
}
async function cmkReady(list){
  let n = 0;
  for(const t of list){ CMKQ.delete(t); const a = (t.comp||0)/100; if(!a) continue;
    const b = buf(t), thr = Math.min(0, stemLevel(t) + 4 - 8*a), ratio = 1 + 3*a, key = thr.toFixed(2) + "/" + ratio.toFixed(3);
    let m = CMK.get(b); if(!m){ m = new Map(); CMK.set(b, m); } if(m.has(key)) continue;
    const o = new OfflineAudioContext(2, b.length, b.sampleRate), s = o.createBufferSource(); s.buffer = b;
    const k = o.createDynamicsCompressor(); k.attack.value = 0.01; k.release.value = 0.12; k.knee.value = 6; k.ratio.value = ratio; k.threshold.value = thr;
    const g = o.createGain(); g.gain.value = db2(-compMakeupDb(thr, 6, ratio));
    s.connect(k).connect(g).connect(o.destination); s.start(0);
    const r = await o.startRendering(), Lo = lufs([r.getChannelData(0), r.getChannelData(1)], b.sampleRate), Li = stemLevel(t);
    m.set(key, isFinite(Lo) && isFinite(Li) ? Math.max(0, Math.min(12, Li - Lo)) : 0);
    t.cmkV = (t.cmkV||0) + 1; n++; if(t.chain) t.chain.set(t);
  }
  return n;
}
// Vocal rider: like riding the fader by hand. Measures the vocal every 50 ms (400 ms window) and pulls loud
// words down / lifts quiet ones towards the stem's own average, only while singing (pauses and breaths hold the gain).
const rideCache = new WeakMap();
function rideCurve(t){
  const b = buf(t), key = b, s = (t.ride||0)/100; if(!s) return null;
  const hit = rideCache.get(key); if(hit && hit.s === s) return hit.C;
  const fs = b.sampleRate, hop = Math.round(0.05*fs), L = b.getChannelData(0), R = b.numberOfChannels>1 ? b.getChannelData(1) : L, nh = Math.floor(L.length/hop);
  const e = new Float64Array(nh); for(let h=0;h<nh;h++){ let x=0; for(let i=h*hop;i<(h+1)*hop;i+=2){ const v=(L[i]+R[i])/2; x+=v*v; } e[h] = x/(hop/2); }
  const W = 4, lv = new Float32Array(nh); let mx = -200;
  for(let h=0;h<nh;h++){ let x=0, c=0; for(let j=Math.max(0,h-W); j<=Math.min(nh-1,h+W); j++){ x+=e[j]; c++; } lv[h] = 10*Math.log10(x/c + 1e-12); if(lv[h] > mx) mx = lv[h]; }
  const act = []; for(let h=0;h<nh;h++) if(lv[h] > mx - 20) act.push(lv[h]); if(act.length < 20) return null;
  act.sort((a,b)=>a-b); const tgt = act[Math.floor(act.length*0.6)];          // a bit above the median: what the vocal "usually" sits at
  const g = new Float32Array(nh); let held = 0;
  // only real singing (within 9 dB of the usual level) may be lifted; quieter stuff (reverb tails, breaths, bleed) is never pulled up
  for(let h=0;h<nh;h++){ const d = tgt - lv[h];
    if(lv[h] > mx - 30) held = d > 9 ? Math.min(0, held) : Math.max(-6*s, Math.min(3*s, d*0.75*s));
    g[h] = held; }
  smoothCurve(g, 0.05, 0.12);
  for(let h=0;h<nh;h++) g[h] = Math.pow(10, g[h]/20);
  const C = {hop:0.05, g}; rideCache.set(key, {s, C}); return C;
}
function scheduleRide(param, C, fromBufSec, atCtx, speed){
  param.cancelScheduledValues(0);
  if(!C){ param.value = 1; return; }
  const k0 = Math.max(0, Math.floor(fromBufSec/C.hop)), vals = C.g.subarray(k0);
  if(vals.length < 2){ param.value = 1; return; }
  param.setValueAtTime(vals[0], atCtx);
  try{ param.setValueCurveAtTime(vals.slice(), atCtx + 0.005, vals.length*C.hop/speed); }catch(e){ console.warn("rider", e); }
}
function stemLevel(t){
  if(t.Lst === undefined){ const b=t.buffer, c=[b.getChannelData(0)]; if(b.numberOfChannels>1) c.push(b.getChannelData(1)); const v = lufs(c, b.sampleRate); t.Lst = isFinite(v) ? v : -30; }
  return t.Lst;
}

// One colour per instrument role (same idea as in pro stem tools), readable on light and dark panels
const ROLE_COLORS = {lead:"#d6336c", bv:"#e8590c", drums:"#c99a06", kick:"#c99a06", snare:"#b5860a", hat:"#a8902a", perc:"#b08d1a", bass:"#2f9e44", guitar:"#1c7ed6", keys:"#7048e8", pad:"#9c36b5", synth:"#1098ad", other:"#d9480f"};
const stemColor = t => ROLE_COLORS[role(t.name)] || ROLE_COLORS.other;
function cssVar(n){ return getComputedStyle(document.documentElement).getPropertyValue(n).trim(); }
function drawWaves(){
  const pos = duration ? currentTime()/duration : 0;
  tracks.forEach((t,i)=>{
    const cv = $("wv"+i); if(!cv) return;
    const w = cv.clientWidth, h = cv.clientHeight, dpr = devicePixelRatio||1;
    if(cv.width!==Math.round(w*dpr)){ cv.width=Math.round(w*dpr); cv.height=Math.round(h*dpr); }
    const g = cv.getContext("2d"); g.setTransform(dpr,0,0,dpr,0,0); g.clearRect(0,0,w,h);
    const n = t.peaks.length, bw = w/n, frac = buf(t).duration/duration;
    const cOn = stemColor(t), cOff = cssVar("--wave");
    for(let k=0;k<n;k++){
      const x = k*bw*frac, ph = Math.max(1, t.peaks[k]*(h-2));
      const played = x/w < pos; g.fillStyle = audible(t) ? cOn : cOff; g.globalAlpha = audible(t) ? (played ? 1 : 0.45) : 0.6;
      g.fillRect(x, (h-ph)/2, Math.max(1,bw*frac-.5), ph);
    }
    g.globalAlpha = 1;
    if(AB.a!==null && AB.b!==null){ g.globalAlpha=.18; g.fillStyle=cssVar("--accent"); g.fillRect(AB.a/duration*w, 0, (AB.b-AB.a)/duration*w, h); g.globalAlpha=1; }
    g.fillStyle = cssVar("--fg"); g.fillRect(pos*w, 0, 1.5, h);
  });
}

const anySolo = () => tracks.some(t=>t.solo);
const audible = t => anySolo() ? t.solo : t.on;

function updateUI(){
  tracks.forEach((t,i)=>{
    t.el.querySelector(".toggle").setAttribute("aria-pressed", t.on);
    t.el.querySelector(".solo").setAttribute("aria-pressed", t.solo);
    t.el.classList.toggle("muted", !audible(t));
  });
  applyGains(); drawWaves();
  const sel = tracks.filter(t=>t.on);
  $("summary").innerHTML = sel.length
    ? `Im Export: <b>${sel.length} von ${tracks.length}</b> Stems · ${sel.map(t=>esc(t.name)).join(", ")}`
    : "Keine Spur eingeschaltet. Schalte mindestens eine Spur an, um zu exportieren.";
  $("export").disabled = !sel.length;
  scheduleAnalysis(); saveSoon();
}
const esc = s => s.replace(/[&<>"]/g, c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));

function applyGains(){
  if(!ctx) return;
  tracks.forEach(t=>{ if(t.gain) t.gain.gain.setTargetAtTime(audible(t)?t.vol:0, ctx.currentTime, 0.015); if(t.rawG) t.rawG.gain.setTargetAtTime(audible(t)?1:0, ctx.currentTime, 0.015); });
}

$("presets").addEventListener("click", e=>{
  const p = e.target.dataset && e.target.dataset.p; if(!p || !tracks.length) return;
  tracks.forEach(t=>{
    const voc = VOCAL_RE.test(t.name);
    t.solo = false;
    t.on = p==="all" ? true : p==="none" ? false : p==="beat" ? !voc : p==="vocals" ? voc : p==="lead" ? !(voc && LEAD_RE.test(t.name)) : t.on;
  });
  updateUI();
});

