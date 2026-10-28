/* ---------- Several processor cores: the song is cut into parts with overlap, each part is split by its own
   worker (its own single-threaded AI), and the parts are cross-faded back together. Needs no special server headers. ---------- */
const MODEL_URL0 = "https://huggingface.co/timcsy/demucs-web-onnx/resolve/main/htdemucs_embedded.onnx"; let SPLIT_URL = null;
const SPLIT_MODEL_URL = () => SPLIT_URL || MODEL_URL0;
const DEMUCS_ESM = ["https://cdn.jsdelivr.net/npm/demucs-web@1/+esm", "https://cdn.jsdelivr.net/npm/demucs-web/+esm"];
const SPLIT_WORKER_SRC = `
let proc = null;
self.onmessage = async e => {
  const m = e.data;
  try{
    if(m.type === "init"){
      let ort = null, err;
      for(const f of ["ort.min.mjs", "ort.webgpu.min.mjs"]){ try{ ort = await import(m.ortUrl + f); break; }catch(x){ err = x; } }
      if(!ort) throw err; ort = ort.default && ort.default.env ? ort.default : ort;
      ort.env.wasm.wasmPaths = m.ortUrl; ort.env.wasm.numThreads = 1;
      let mod = null; for(const u of m.demucs){ try{ mod = await import(u); break; }catch(x){ err = x; } }
      if(!mod) throw err;
      proc = new mod.DemucsProcessor({ ort, sessionOptions: { executionProviders: ["wasm"] },
        onProgress: p => { const v = typeof p === "number" ? p : (p && p.progress) || 0; self.postMessage({type: "p", v}); } });
      await proc.loadModel(m.model); self.postMessage({type: "ready"});
    } else if(m.type === "run"){
      const r = await proc.separate(m.L, m.R), out = {}, tr = [];
      for(const k of ["drums", "bass", "other", "vocals"]){ const s = r[k]; if(!s) continue;
        const l = s.left || s[0], rr = s.right || s[1]; out[k] = {left: l, right: rr}; tr.push(l.buffer, rr.buffer); }
      self.postMessage({type: "done", res: out}, tr);
    }
  }catch(x){ self.postMessage({type: "err", msg: String(x && x.message || x)}); }
};`;
const IS_PHONE = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent) || (/Macintosh/.test(navigator.userAgent) && navigator.maxTouchPoints > 1);
function splitCores(len){ if(IS_PHONE) return 1; const hc = navigator.hardwareConcurrency || 2, mem = navigator.deviceMemory || 8;
  let n = Math.max(1, Math.min(4, Math.floor(hc/2), mem >= 8 ? 4 : mem >= 4 ? 2 : 1));
  return Math.max(1, Math.min(n, Math.floor(len / (20*44100)))); }
async function runDemucsParallel(L, R, N){
  const model = await fetchModel(SPLIT_MODEL_URL());
  const len = L.length, OV = 2*44100, url = URL.createObjectURL(new Blob([SPLIT_WORKER_SRC], {type: "text/javascript"}));
  const parts = [], workers = [], prog = new Array(N).fill(0);
  for(let i=0;i<N;i++){ const s0 = Math.round(i*len/N), e0 = Math.round((i+1)*len/N); parts.push({s0, e0, a: Math.max(0, s0-OV), b: Math.min(len, e0+OV)}); }
  SPLIT_P.cores = N; SPLIT_P.t0 = performance.now(); SPLIT_P.v = 0; SPLIT_P.gpu = false;
  setStatus(`Starte ${N} Kerne parallel …`); setProg(0.02);
  const tick = setInterval(splitStatus, 1000);
  log("Zerlegen parallel:", N, "Kerne,", N, "Teile mit 2 s Überlappung");
  try{
    const results = await Promise.all(parts.map((pt, i) => new Promise((ok, bad) => {
      const w = new Worker(url); workers.push(w);
      w.onerror = e => bad(new Error("Worker " + (i+1) + ": " + (e.message || "Fehler")));
      w.onmessage = e => { const m = e.data;
        if(m.type === "ready"){ const l = L.slice(pt.a, pt.b), r = R.slice(pt.a, pt.b); w.postMessage({type: "run", L: l, R: r}, [l.buffer, r.buffer]); }
        else if(m.type === "p"){ prog[i] = m.v; SPLIT_P.v = prog.reduce((x,y)=>x+y, 0)/N; setProg(Math.max(0.02, SPLIT_P.v)); }
        else if(m.type === "done"){ prog[i] = 1; log("Teil", i+1, "fertig nach", Math.round((performance.now()-SPLIT_P.t0)/1000)+" s"); ok(m.res); }
        else if(m.type === "err") bad(new Error("Teil " + (i+1) + ": " + m.msg)); };
      const mc = model.slice(0); w.postMessage({type: "init", ortUrl: ORT_URL, demucs: DEMUCS_ESM, model: mc}, [mc]);
    })));
    // cross-fade the parts back together
    const out = {};
    for(const k of ["drums", "bass", "other", "vocals"]){
      const oL = new Float32Array(len), oR = new Float32Array(len);
      parts.forEach((pt, i) => { const r = results[i][k]; if(!r) return;
        for(let x = pt.a; x < pt.b; x++){
          let w = 1;
          if(i > 0 && x < pt.s0 + OV) w = (x - (pt.s0 - OV)) / (2*OV);
          if(i < N-1 && x > pt.e0 - OV) w = Math.min(w, ((pt.e0 + OV) - x) / (2*OV));
          const j = x - pt.a; oL[x] += w * r.left[j]; oR[x] += w * r.right[j]; } });
      out[k] = {left: oL, right: oR};
    }
    return out;
  } finally { clearInterval(tick); workers.forEach(w => w.terminate()); URL.revokeObjectURL(url); }
}
const SPLIT_P = {t0: 0, v: 0, seg: 0, tot: 1, gpu: false, cores: 1};
const fmtMS = sec => Math.floor(sec/60) + ":" + String(Math.floor(sec%60)).padStart(2, "0");
// Status while splitting: always shows that it is alive (clock ticks), which piece, and the time left once known.
function splitStatus(){ const P = SPLIT_P, sec = (performance.now() - P.t0)/1000;
  let t = P.cores > 1 ? `Zerlege in Stems (Prozessor, ${P.cores} Kerne parallel) · ${Math.round(P.v*100)} % · ${fmtMS(sec)} vergangen`
    : `Zerlege in Stems${P.gpu ? "" : " (Prozessor)"} · Stück ${Math.min(P.tot, P.seg + 1)} von ${P.tot} · ${Math.round(P.v*100)} % · ${fmtMS(sec)} vergangen`;
  if(P.v > 0.02) t += ` · noch ca. ${Math.max(1, Math.round(sec/P.v*(1-P.v)/60))} Min.`;
  else t += " · das erste Stück dauert am längsten, Tab bitte offen lassen";
  setStatus(t); }
async function runDemucs(useGpu, t0, L, R){
  if(L) SPLIT_IN = [L, R]; else [L, R] = SPLIT_IN;
  const ep = useGpu ? "gpu" : "cpu";
  if(!DEMUCS || DEMUCS_EP !== ep){
    DEMUCS = null;
    setStatus("Lade die Trenn-KI (einmalig, ca. 170 MB) …");
    const {ort, mod} = await loadDemucs();
    const proc = new mod.DemucsProcessor({ ort,
      sessionOptions: { executionProviders: useGpu ? ["webgpu", "wasm"] : ["wasm"] },
      onProgress: p => { const v = typeof p === "number" ? p : (p && p.progress) || 0; SPLIT_P.v = v; if(p && p.totalSegments){ SPLIT_P.seg = p.currentSegment || 0; SPLIT_P.tot = p.totalSegments; }
        if(p && p.currentSegment === 1) log("Erstes Stück fertig nach", Math.round((performance.now()-SPLIT_P.t0)/1000)+" s, insgesamt", p.totalSegments, "Stücke");
        setProg(Math.max(0.02, v)); splitStatus(); },
      onLog: (ph, msg) => console.log("[demucs]", ph, msg) });
    const url = (mod.CONSTANTS && mod.CONSTANTS.DEFAULT_MODEL_URL) || MODEL_URL0; SPLIT_URL = url;
    let model; try{ model = await fetchModel(url); }catch(e){ model = url; }
    setStatus("Starte die Trenn-KI …"); setProg(0.01); await sleep0();
    try{ await proc.loadModel(model); }
    catch(e){ if(ort.env.wasm.numThreads === 1) throw e; log("Mehrere Threads gingen nicht, nehme 1 Thread:", String(e && e.message || e)); ort.env.wasm.numThreads = 1; await proc.loadModel(model); }
    DEMUCS = proc; DEMUCS_EP = ep;
  }
  SPLIT_P.cores = 1; SPLIT_P.t0 = performance.now(); SPLIT_P.v = 0; SPLIT_P.seg = 0; SPLIT_P.tot = Math.max(1, Math.ceil(L.length / (343980*0.75))); SPLIT_P.gpu = useGpu;
  splitStatus(); setProg(0.02); await sleep0();
  const tick = setInterval(splitStatus, 1000);
  try{ return await DEMUCS.separate(L, R); } finally { clearInterval(tick); }
}
$("splitFile").onchange = async e=>{
  const f = e.target.files[0]; e.target.value = ""; if(!f) return;
  stop(); $("splitBtn").disabled = true; $("splitBtn").textContent = "Zerlege …"; window.__splitUi = true; clearTimeout(window.__splitUiT); setProg(0.01);
  if(IS_PHONE) try{ localStorage.setItem("stemmixer:splitRun", $("splitQuick").checked ? "quick" : "full"); }catch(e){}
  let gpu = false; try{ gpu = !!(navigator.gpu && await navigator.gpu.requestAdapter()); }catch(e){}
  const t0 = performance.now();
  try{
    setStatus("Lese den Song …");
    log("Zerlegen gestartet:", f.name, Math.round(f.size/1024)+" KB");
    const src = await ac().decodeAudioData(await f.arrayBuffer());
    log("Song gelesen:", src.duration.toFixed(1)+" s,", src.sampleRate+" Hz,", src.numberOfChannels+" Kanäle");
    const L0 = src.getChannelData(0), R0 = src.numberOfChannels>1 ? src.getChannelData(1) : L0;
    let [L, R] = await resample(L0, R0, src.sampleRate, 44100);          // the model works at 44.1 kHz stereo
    if($("splitQuick").checked && L.length > 66*44100){
      const n = 60*44100, a = Math.min(L.length - n, Math.max(0, Math.round(L.length*0.35) - n/2));
      L = L.slice(a, a+n); R = R.slice(a, a+n); log("Nur 60 s zerlegen, ab", (a/44100).toFixed(1)+" s");
    }
    // The library's WebGPU path is known to produce broken output for this model (limited Conv1d support),
    // so: use the processor (WASM) by default; WebGPU only as an opt-in fast try with automatic fallback.
    let useGpu = gpu && SPLIT_MODE === "gpu";
    log("Trenn-Modus:", useGpu ? "Grafikkarte (WebGPU)" : "Prozessor (WASM)", "· Grafikkarte verfügbar:", gpu ? "ja" : "nein");
    let res = null, verdict = null;
    if($("split6").checked){
      try{ res = await runDemucs6(t0, L, R, useGpu); setStatus("Prüfe das Ergebnis der KI …"); await sleep0(); verdict = checkSeparation(res, L, R);
        log("6-Stem-Prüfung:", verdict.ok ? "bestanden" : "NICHT bestanden", "·", verdict.diag);
        if(!verdict.ok){ res = null; verdict = null; setStatus("Die 6-Stem-KI hat kein sauberes Ergebnis geliefert (nichts abgespielt). Ich nehme die bewährte 4-Stem-KI …"); await sleep0(); } }
      catch(e){ log("6 Stems fehlgeschlagen:", String(e && e.message || e)); res = null; verdict = null; setStatus("6 Stems gingen auf diesem Rechner nicht. Ich nehme die bewährte 4-Stem-KI …"); await sleep0(); }
    }
    if(!verdict){
      const N = useGpu ? 1 : splitCores(L.length);
      if(N > 1){
        try{ res = await runDemucsParallel(L, R, N); log("KI parallel fertig nach", Math.round((performance.now()-t0)/1000)+" s"); }
        catch(e){ log("Parallel ging nicht, nehme 1 Kern:", String(e && e.message || e)); res = null; setStatus("Mehrere Kerne gingen auf diesem Rechner nicht. Ich rechne mit einem Kern weiter …"); await sleep0(); }
      }
      if(!res) res = await runDemucs(useGpu, t0, L, R);
      log("KI fertig nach", Math.round((performance.now()-t0)/1000)+" s");
      setStatus("Prüfe das Ergebnis der KI …"); await sleep0();
      // SAFETY CHECK before anything can be heard: the separated stems must add up to the original song.
      // Broken output (noise, wrong layout, wrong scaling) fails this check and is never played.
      verdict = checkSeparation(res, L, R);
    
      if(!verdict.ok && useGpu){
        setStatus("Die Grafikkarten-Berechnung hat ein fehlerhaftes Ergebnis geliefert (nichts abgespielt). Zweiter Versuch über den Prozessor, das dauert länger, ist aber zuverlässig …");
        res = null; useGpu = false; await sleep0();
        res = await runDemucs(false, performance.now(), L, R);
        verdict = checkSeparation(res, L, R);
        log("Prüfung (Prozessor):", verdict.ok ? "bestanden" : "NICHT bestanden", "·", verdict.diag);
        if(verdict.ok){ SPLIT_MODE = "cpu"; try{ localStorage.setItem("stemmixer:splitmode", "cpu"); }catch(e){} }
      }
    }
    log("Prüfung:", verdict.ok ? "bestanden" : "NICHT bestanden", "·", verdict.diag);
    if(!verdict.ok){ log("Genaue Analyse:"); try{ sepAnalysis(res, L, R); }catch(e){ log("Analyse fehlgeschlagen:", e); } }
    if(!verdict.ok){
      SPLIT_DIAG = verdict.diag + (useGpu ? ", Grafikkarte" : ", Prozessor");
      throw new Error("Sicherheitsprüfung nicht bestanden, die KI-Ausgabe war fehlerhaft. Es wurde nichts abgespielt. Diagnose: " + SPLIT_DIAG);
    }
    log("Ergebnis übernommen:", verdict.diag);
    const c = ac(), list = [];
    for(const st of verdict.stems){
      const b = c.createBuffer(2, st.l.length, 44100); b.copyToChannel(st.l, 0); b.copyToChannel(st.r, 1);
      list.push({name: st.name, file: `${f.name} → ${st.name}`, buffer: b});
    }
    const base = f.name.replace(/\.[^.]+$/, "");
    $("fname").value = base; $("lText").value = ""; titleAuto = true; fnameManual = false; autoTitle(f.name);
    setTracks(list);
    setStatus(`Fertig: ${list.length} Stems aus „${base}“ in ${Math.round((performance.now()-t0)/1000)} s. Sicherheitsprüfung bestanden (Abweichung zum Original ${verdict.resDb.toFixed(1)} dB${verdict.shifted ? ", Zeitversatz der KI-Ausgabe ausgeglichen" : ""}${verdict.scaled ? ", Lautstärke der KI-Ausgabe korrigiert" : ""}). Mit „Stems einzeln exportieren“ kannst du sie als WAV speichern.` + restoredNote);
  } catch(err){
    console.error(err);
    const inViewer = !!(window.claude && window.claude.use);
    if(SPLIT_DIAG){ try{ navigator.clipboard && navigator.clipboard.writeText("DANVIEL Studio Diagnose: " + SPLIT_DIAG + " | Browser: " + navigator.userAgent).catch(()=>{}); }catch(e){} }
    setStatus(inViewer ? "Das Zerlegen funktioniert nur in der heruntergeladenen Programmdatei (DANVIEL-Studio.html im Browser geöffnet), weil die KI aus dem Internet geladen werden muss."
                       : "Zerlegen fehlgeschlagen: " + (err.message||err) + ". Ganz unten auf „Fehler-Log speichern“ klicken und die Datei schicken, dann sieht man genau, was passiert ist.", true);
  } finally { try{ localStorage.removeItem("stemmixer:splitRun"); }catch(e){} window.__splitUi = false; window.__splitUiT = setTimeout(()=>{ const d = $("dropProg"); if(d && !d.classList.contains("err")) d.hidden = true; }, 20000); $("splitBtn").disabled = false; $("splitBtn").textContent = "Song in Stems zerlegen (KI, Beta)"; setProg(1); setTimeout(()=>setProg(0), 800); }
};

// genre demos (v16.4): real little songs, about 1 to 1.5 minutes, intro, verse, hook, break, hook, outro.
// Notes are played by the built-in synth, extra percussion and FX come from the DANVIEL One-Shots.
const DEMOS = {
  pop:  {bpm:100, name:"Demo Pop", key:57, prog:[[0,4,7],[-3,0,4],[-7,-3,0],[-5,-1,2]], chordS:"piano", padS:"pad", bassS:"bass", leadS:"lead", bass:"eighth",
         k:"x.......x.x.....", s:"....x.......x...", c:"....x.......x...", h:"x.x.x.x.x.x.x.x.", o:"..............x.", mel:[12,12,14,16,14,12,9,12, 12,14,16,19,17,16,14,12], fx:{hey:1}},
  rnb:  {bpm:76, name:"Demo R&B", key:53, prog:[[0,4,7,11],[-3,0,4,7],[2,5,9,12],[-5,-1,2,5]], chordS:"epiano", padS:"pad", bassS:"sub808", leadS:"epiano", bass:"slow", swing:true,
         k:"x......x.x......", c:"....x.......x...", h:"x.x.x.x.x.x.x.x.", o:"..............x.", mel:[19,16,14,12,14,16,12,0, 19,21,19,16,14,12,14,0], short:true},
  trap: {bpm:140, name:"Demo Trap", key:52, prog:[[0,3,7],[0,3,7],[-4,0,3],[-2,2,5]], chordS:"pad", padS:"strings", bassS:"sub808", leadS:"pluck", bass:"trap", rolls:true,
         k:"x.....x...x.....", c:"........x.......", h:"x.x.x.x.x.x.x.x.", mel:[12,15,19,15,12,15,17,15, 12,15,19,22,19,17,15,12], fx:{hey:1}},
  house:{bpm:124, name:"Demo House", key:55, prog:[[0,3,7,10],[-2,2,5,8],[-4,0,3,7],[-5,-2,2,5]], chordS:"pluck", padS:"pad", bassS:"bass", leadS:"lead", bass:"offbeat", stab:true,
         k:"x...x...x...x...", c:"....x.......x...", h:"xxxxxxxxxxxxxxxx", o:"..x...x...x...x.", mel:[24,0,22,0,19,0,17,19, 24,0,22,0,26,24,22,19]},
  edm:  {bpm:128, name:"Demo EDM", key:57, prog:[[0,4,7],[-3,0,4],[-7,-3,0],[-5,-1,2]], chordS:"pad", padS:"strings", bassS:"bass", leadS:"lead", bass:"offbeat",
         k:"x...x...x...x...", c:"....x.......x...", h:"..x...x...x...x.", o:"..x...x...x...x.", mel:[12,12,16,19,17,16,14,12, 12,16,19,24,23,19,16,14], fx:{hey:1}},
  drill:{bpm:142, name:"Demo Drill", key:53, prog:[[0,3,7],[0,3,7],[-4,0,3],[-5,-2,2]], chordS:"strings", padS:"pad", bassS:"sub808", leadS:"pluck", bass:"drill", rolls:true, trip:true,
         k:"x......x..x.....", s:"........x.....x.", h:"x..x..x.x..x..x.", mel:[12,0,15,14,12,0,10,12, 15,0,17,15,14,0,12,0]},
  lofi: {bpm:84, name:"Demo Lo-Fi", key:57, prog:[[0,4,7,11],[-3,0,4,7],[-7,-3,0,4],[-5,-1,2,5]], chordS:"epiano", padS:"pad", bassS:"bass", leadS:"piano", bass:"slow", swing:true, crackle:true,
         k:"x.........x.....", s:"....x.......x...", h:"x.x.x.x.x.x.x.x.", mel:[16,0,14,12,0,9,12,0, 19,0,16,14,12,0,9,0], short:true, soft:true},
  reggaeton:{bpm:94, name:"Demo Reggaeton", key:50, prog:[[0,3,7],[-4,0,3],[-2,2,5],[-7,-4,0]], chordS:"pluck", padS:"pad", bassS:"bass", leadS:"lead", bass:"dembow",
         k:"x...x...x...x...", s:"...x..x....x..x.", h:"x.x.x.x.x.x.x.x.", mel:[12,15,17,15,12,0,10,12, 15,17,19,17,15,0,12,0], fx:{hey:1}},
  ballad:{bpm:72, name:"Demo Ballade", key:55, prog:[[0,4,7],[-5,-1,2],[-3,0,4],[-7,-3,0]], chordS:"piano", padS:"strings", bassS:"bass", leadS:"strings", bass:"slow",
         k:"x.......x.......", s:"....x.......x...", h:"x.x.x.x.x.x.x.x.", mel:[16,0,14,0,12,0,14,16, 19,0,17,16,14,0,12,0], short:true, soft:true},
  afro: {bpm:104, name:"Demo Afrobeats", key:57, prog:[[0,4,7],[-3,0,4],[-7,-3,0],[-5,-1,2]], chordS:"pluck", padS:"pad", bassS:"bass", leadS:"lead", bass:"afro",
         k:"x..x..x...x..x..", c:"....x.......x...", h:"x.xxx.xxx.xxx.xx", smp:{shaker:"xxxxxxxxxxxxxxxx", conga:"..x..x....x..x..", rim:"...x.....x...x.."}, mel:[16,0,14,16,0,19,16,14, 12,0,14,16,14,12,9,0], fx:{hey:1}},
  amapiano:{bpm:112, name:"Demo Amapiano", key:53, prog:[[0,3,7,10],[-2,2,5,9],[-4,0,3,7],[-5,-2,2,5]], chordS:"epiano", padS:"pad", bassS:"sub808", leadS:"piano", bass:"log",
         k:"x...x...x...x...", c:"....x.......x...", o:"..x...x...x...x.", smp:{shaker:"x.xxx.xxx.xxx.xx", rim:"..x..x...x..x..."}, mel:[15,0,14,12,0,10,12,0, 15,17,15,14,12,0,10,0]},
  phonk:{bpm:130, name:"Demo Phonk", key:49, prog:[[0,3,7],[0,3,7],[-4,0,3],[-2,1,5]], chordS:"pad", padS:"strings", bassS:"sub808", leadS:"cowbell", bass:"phonk", rolls:true, crackle:true,
         k:"x.....x...x..x..", c:"........x.......", h:"x.x.x.x.x.x.x.x.", mel:[12,12,15,12,17,15,12,10, 12,12,15,12,19,17,15,12], fx:{tapestop:1}},
  dancehall:{bpm:98, name:"Demo Dancehall", key:55, prog:[[0,3,7],[-2,2,5],[-4,0,3],[-2,2,5]], chordS:"pluck", padS:"pad", bassS:"bass", leadS:"lead", bass:"dembow", stab:true,
         k:"x...x...x...x...", s:"...x..x....x..x.", h:"x.x.x.x.x.x.x.x.", smp:{rim:"..x...x...x...x."}, mel:[12,0,15,17,15,0,12,10, 12,0,15,19,17,15,12,0], fx:{horn:1, hey:1}},
  synthwave:{bpm:100, name:"Demo Synthwave", key:52, prog:[[0,3,7],[-4,0,3],[-7,-4,0],[-2,2,5]], chordS:"pad", padS:"strings", bassS:"bass", leadS:"lead", bass:"pulse", arp:true,
         k:"x.......x.......", c:"....x.......x...", smp:{clapbig:"....x.......x..."}, h:"x.x.x.x.x.x.x.x.", mel:[19,0,17,15,0,12,15,17, 19,0,22,19,17,15,17,0]},
  boombap:{bpm:90, name:"Demo Boom Bap", key:50, prog:[[0,3,7,10],[-4,0,3,7],[-2,1,5,8],[-5,-2,2,5]], chordS:"epiano", padS:"strings", bassS:"bass", leadS:"piano", bass:"boombap", swing:true, crackle:true,
         k:"x.......x.x.....", s:"....x.......x...", h:"x.x.x.x.x.x.x.x.", smp:{shaker:"..x...x...x...x."}, mel:[15,0,12,10,0,12,15,0, 17,0,15,12,10,0,7,0]},
};
async function genreDemo(kind){
  const D = DEMOS[kind], sr = 44100, beat = 60/D.bpm, barB = 4;
  // arrangement: [name, bars]
  const plan = D.short ? [["intro",2],["verse",8],["hook",8],["break",2],["hook",8],["outro",2]] : [["intro",4],["verse",8],["hook",8],["break",4],["hook",8],["outro",4]];
  const bars = []; plan.forEach(([sec, n], si)=>{ for(let i=0;i<n;i++) bars.push({sec, i, n, si, first: i === 0, last: i === n-1}); });
  const nb = bars.length, len = nb*barB*beat + 2.5;
  let sd = 1234 + kind.length*97; const rnd = () => { sd = (sd*16807) % 2147483647; return sd/2147483647; };
  const hv = v => Math.max(0.05, Math.min(1, v + (rnd() - 0.5)*0.12)), ht = () => (rnd() - 0.5)*0.008/beat;   // humanize
  const N = (t, d, n, v, extra) => ({t: Math.max(0, (t + ht())*beat), d: d*beat, n, v: hv(v ?? 0.8), ...(extra||{})});
  const S = (t, id, v, p) => ({t: Math.max(0, t*beat), smp: id, v: v ?? 0.85, p: p || 0});
  const sw = st => D.swing && st % 2 ? 0.06 : 0;
  const drums = [], dsmp = [], bass = [], chords = [], pad = [], lead = [], arp = [], fx = [];
  const on = (pat, st) => pat && pat[st] === "x";
  bars.forEach((B, b)=>{
    const t0 = b*barB, c = D.prog[b % 4], r = D.key - 12 + c[0], sec = B.sec, full = sec === "hook", dr = sec === "verse" || sec === "hook" || (sec === "outro" && B.i < B.n - 2 && !D.soft);
    // drums
    if(dr){
      for(let st=0; st<16; st++){ const tt = t0 + st/4 + sw(st);
        if(on(D.k, st)) drums.push(N(tt, 0.1, 36, st % 4 === 0 ? 1 : 0.85));
        if(on(D.s, st)) drums.push(N(tt, 0.1, 38, st === 14 && kind === "drill" ? 0.55 : 0.92));
        if(on(D.c, st) && (full || !D.s)) drums.push(N(tt, 0.1, 39, 0.9));
        if(on(D.h, st) && !(D.trip && full)) drums.push(N(tt, 0.05, 42, st % 4 === 0 ? 0.72 : st % 2 ? 0.45 : 0.58));
        if(on(D.o, st) && full) drums.push(N(tt, 0.2, 46, 0.6));
        if(D.smp) for(const id in D.smp) if(on(D.smp[id], st) && (full || id !== "clapbig")) dsmp.push(S(tt, id, (id === "shaker" ? 0.45 : 0.7)*(st % 4 === 0 ? 1 : 0.85)));
      }
      if(D.trip && full) for(let k=0;k<12;k++) drums.push(N(t0 + k/3, 0.04, 42, k % 3 === 0 ? 0.7 : 0.48));
      if(D.rolls && b % 2 === 1){ const n = full ? 8 : 4; for(let k=0;k<n;k++) drums.push(N(t0 + 3 + (full ? k/8 : 0.5 + k/8), 0.03, 42, 0.42 + 0.05*k)); }
      if(B.first && full) drums.push(N(t0, 1, 49, 0.85));
      if(B.last && (sec === "verse" || (sec === "hook" && B.si < plan.length - 2))){ for(let k=0;k<4;k++) drums.push(N(t0 + 3 + k/4, 0.08, 38, 0.5 + 0.12*k)); dsmp.push(S(t0 + 3, "tomhi", 0.55)); dsmp.push(S(t0 + 3.5, "tomlo", 0.6)); }
    }
    // bass
    const bs = sec === "intro" || sec === "break" ? null : D.bass, vb = sec === "outro" ? 0.7 : 0.95;
    if(bs === "eighth") for(let k=0;k<8;k++) bass.push(N(t0 + k/2, 0.42, r, k % 2 ? 0.7 : vb));
    else if(bs === "offbeat") for(let k=0;k<4;k++) bass.push(N(t0 + k + 0.5, 0.42, r, vb));
    else if(bs === "slow"){ bass.push(N(t0, 1.8, r, vb)); bass.push(N(t0 + 2, 1.7, r + 7, 0.8)); }
    else if(bs === "trap"){ bass.push(N(t0, 1.4, r, 1)); bass.push(N(t0 + 1.5, 1.1, r, 0.9)); bass.push(N(t0 + 2.5, 1.4, r + (b % 2 ? 3 : 0), 0.9)); }
    else if(bs === "drill"){ bass.push(N(t0, 0.7, r, 1)); bass.push(N(t0 + 1.75, 0.6, r + 3, 0.9)); bass.push(N(t0 + 2.5, 1.3, r + (b % 2 ? -2 : 0), 0.9)); }
    else if(bs === "dembow"){ [0, 1.5, 2, 3.5].forEach((k, j)=>bass.push(N(t0 + k, j % 2 ? 0.45 : 0.7, r, j % 2 ? 0.8 : vb))); }
    else if(bs === "afro"){ [0, 0.75, 1.5, 2.5, 3.25].forEach((k, j)=>bass.push(N(t0 + k, 0.5, j === 3 ? r + 7 : r, j ? 0.82 : vb))); }
    else if(bs === "log"){ [0, 0.75, 1.5, 2, 2.75, 3.5].forEach((k, j)=>bass.push(N(t0 + k, 0.28, r + [0, 0, 7, 0, 10, 12][j], 0.9))); }
    else if(bs === "phonk"){ bass.push(N(t0, 1.4, r, 1)); bass.push(N(t0 + 1.5, 0.9, r, 0.9)); bass.push(N(t0 + 2.5, 0.6, r + 3, 0.9)); bass.push(N(t0 + 3.25, 0.6, r - 2, 0.85)); }
    else if(bs === "pulse") for(let k=0;k<8;k++) bass.push(N(t0 + k/2, 0.4, r + (k % 2 ? 12 : 0), k % 2 ? 0.7 : vb));
    else if(bs === "boombap"){ bass.push(N(t0, 1.2, r, vb)); bass.push(N(t0 + 2.25, 0.6, r, 0.85)); bass.push(N(t0 + 2.75, 0.9, r + 7, 0.8)); }
    // chords: house and dancehall play off-beat stabs, everything else holds the chord
    const vc = sec === "intro" || sec === "outro" ? 0.45 : sec === "break" ? 0.5 : full ? 0.62 : 0.55;
    if(D.stab && sec !== "intro" && sec !== "break" && sec !== "outro") for(let k=0;k<4;k++) c.forEach(iv=>chords.push(N(t0 + k + 0.5, 0.3, D.key + 12 + iv, vc)));
    else c.forEach((iv, j)=>chords.push(N(t0 + j*0.012, 3.9, D.key + 12 + iv, vc)));
    if(full || sec === "break" || sec === "intro") c.forEach(iv=>pad.push(N(t0, 4, D.key + 24 + iv, sec === "intro" ? 0.35 : 0.42)));
    // verse: soft arpeggio, synthwave also in the hook
    if((sec === "verse" && !D.soft) || (D.arp && full)){ const tones = [c[0], c[1], c[2], c[1] + 12]; for(let k=0;k<(D.arp ? 16 : 8);k++){ const st = D.arp ? k/4 : k/2; arp.push(N(t0 + st + (D.arp ? 0 : sw(k*2)), D.arp ? 0.22 : 0.4, D.key + 24 + tones[k % 4], D.arp ? 0.45 : 0.42)); } }
    // lead melody in the hooks, the second hook ends a bit higher
    if(full && D.mel.length){ const half = B.i % 2, base = half ? 8 : 0, lift = B.si > 3 && B.i >= 6 ? 12 : 0;
      for(let k=0;k<8;k++){ const iv = D.mel[base + k]; if(iv) lead.push(N(t0 + k/2 + sw(k*2), 0.45, D.key + iv + (lift && k >= 4 ? lift : 0), 0.78)); } }
    if(sec === "outro" && B.last && D.mel.length) lead.push(N(t0, 3.5, D.key + D.mel[0], 0.55));
  });
  // FX from the one-shots: riser and reverse crash into each hook, impact on the downbeat, a few shouts, crackle for the dusty ones
  const barT = b => b*barB;
  bars.forEach((B, b)=>{ if(B.sec !== "hook" || !B.first) return; const at = barT(b);
    fx.push(S(Math.max(0, at - 4/beat), "riser", 0.55)); fx.push(S(Math.max(0, at - 2/beat), "revcrash", 0.6));
    fx.push(S(at, D.soft ? "boom" : "impact", D.soft ? 0.45 : 0.75));
    if(D.fx && D.fx.horn){ fx.push(S(at + 0.02, "horn", 0.6)); fx.push(S(at + 16, "horn", 0.5)); }
    if(D.fx && D.fx.hey){ fx.push(S(at + 28 + 1, "hey", 0.7)); fx.push(S(at + 28 + 3, "hey", 0.75)); } });
  const ob = bars.findIndex(B=>B.sec === "outro"); if(ob > 0) fx.push(S(barT(ob), "down", 0.5));
  if(D.fx && D.fx.tapestop) fx.push(S(barT(nb) - 2, "tapestop", 0.6));
  if(D.crackle) for(let t=0; t*beat < len - 1; t += 4/beat) fx.push(S(t, "crackle", 0.55));
  // phonk: the lead is a pitched cowbell
  const cow = D.leadS === "cowbell" ? lead.map(n=>({t: n.t, smp: "cowbell", v: n.v*0.9, p: n.n - 69})) : null;
  const sort = a => a.sort((x, y)=>x.t - y.t);
  const st = [["Drums", drums, "drums", dsmp], ["Bass", bass, D.bassS], ["Keys", chords, D.chordS], ["Pad", pad, D.padS], ["Arp", arp, "pluck"], ["Lead", cow ? [] : lead, D.leadS], ["Cowbell", [], null, cow], ["FX", [], null, fx]];
  const out = [];
  for(const [name, notes, snd, smps] of st){
    if(!notes.length && !(smps && smps.length)) continue; setStatus(`Erzeuge ${D.name}: ${name} …`); await sleep0();
    const n = Math.ceil(len*sr), b = ac().createBuffer(2, n, sr), L = b.getChannelData(0), R = b.getChannelData(1);
    if(notes.length){ const r = await renderMidi({notes: sort(notes)}, snd, sr, len), rl = r.getChannelData(0), rr = r.getChannelData(1); for(let i=0;i<Math.min(n, rl.length);i++){ L[i] = rl[i]; R[i] = rr[i]; } }
    if(smps && smps.length){ await sleep0(); smpMix(sort(smps), L, R, sr); }
    if(name === "Pad" || name === "Keys" || name === "Arp"){ const d1 = Math.round(0.011*sr), d2 = Math.round(0.017*sr); for(let i=n-1;i>=d2;i--){ const l = L[i], r2 = R[i]; L[i] = l*0.85 + L[i-d1]*0.28; R[i] = r2*0.85 + R[i-d2]*0.28; } }
    // balance the stems so the raw demo already sounds like a rough mix (Drums and Lead in front, pads behind)
    const TGT = {Drums:-17, Bass:-19, Keys:-24, Pad:-28, Arp:-27, Lead:-21, Cowbell:-21, FX:-27};
    let pk = 1e-9, ss = 0, cnt = 0; for(let i=0;i<n;i++){ const a = Math.abs(L[i]); pk = Math.max(pk, a, Math.abs(R[i])); if(a > 1e-4){ ss += L[i]*L[i]; cnt++; } }
    const rms = 20*Math.log10(Math.sqrt(ss/Math.max(1, cnt)) + 1e-9), g = Math.min(Math.pow(10, ((TGT[name] ?? -22) - rms)/20), 0.95/pk);
    for(let i=0;i<n;i++){ L[i] *= g; R[i] *= g; }
    out.push({name, file: `${name} (${D.name})`, buffer: b});
  }
  return out;
}
$("demo").onclick = async ()=>{
  const kind = $("demoSel").value;
  if(kind !== "classic"){ stop(); $("demo").disabled = true;
    try{ const list = await genreDemo(kind); setTracks(list); $("fname").value = DEMOS[kind].name; GENRE = ({reggaeton:"latin", ballad:"pop", dancehall:"latin", boombap:"trap"})[kind] || (GENRES[kind] ? kind : "auto"); genreUi();
      setStatus(`${DEMOS[kind].name} geladen (${DEMOS[kind].bpm} BPM). Drück Play oder probier den Auto-Mix.` + restoredNote); }
    finally{ $("demo").disabled = false; } return; }
  stop(); setStatus("Erzeuge Demo-Stems …");
  const sr = 44100, secs = 16 * 60/100 * 0.25 * 4 * 2.5, len = Math.floor(sr*9.6);
  const beat = 60/100;
  async function render(fn){ const o = new OfflineAudioContext(2,len,sr); fn(o); return o.startRendering(); }
  const noise = o => { const b=o.createBuffer(1,sr*0.2,sr), d=b.getChannelData(0); for(let i=0;i<d.length;i++) d[i]=Math.random()*2-1; return b; };
  const drums = await render(o=>{
    for(let i=0;i<16;i++){ const t=i*beat;
      const k=o.createOscillator(), g=o.createGain(); k.frequency.setValueAtTime(140,t); k.frequency.exponentialRampToValueAtTime(40,t+.15);
      g.gain.setValueAtTime(.9,t); g.gain.exponentialRampToValueAtTime(.001,t+.3); k.connect(g).connect(o.destination); k.start(t); k.stop(t+.32);
      if(i%2){ const s=o.createBufferSource(); s.buffer=noise(o); const f=o.createBiquadFilter(); f.type="bandpass"; f.frequency.value=1800; const sg=o.createGain(); sg.gain.setValueAtTime(.6,t); sg.gain.exponentialRampToValueAtTime(.001,t+.18); s.connect(f).connect(sg).connect(o.destination); s.start(t); }
    }
    for(let i=0;i<32;i++){ const t=i*beat/2, s=o.createBufferSource(); s.buffer=noise(o); const f=o.createBiquadFilter(); f.type="highpass"; f.frequency.value=7000; const g=o.createGain(); g.gain.setValueAtTime(.25,t); g.gain.exponentialRampToValueAtTime(.001,t+.05); s.connect(f).connect(g).connect(o.destination); s.start(t); }
  });
  const roots=[55,43.65,49,41.2];
  const bass = await render(o=>{ for(let i=0;i<32;i++){ const t=i*beat/2, f=roots[Math.floor(i/8)%4]; const s=o.createOscillator(); s.type="sawtooth"; s.frequency.value=f; const lp=o.createBiquadFilter(); lp.frequency.value=380; const g=o.createGain(); g.gain.setValueAtTime(.35,t); g.gain.exponentialRampToValueAtTime(.01,t+beat/2-.02); s.connect(lp).connect(g).connect(o.destination); s.start(t); s.stop(t+beat/2); } });
  const keys = await render(o=>{ const ch=[[220,261.6,329.6],[174.6,220,261.6],[196,246.9,293.7],[164.8,207.7,246.9]]; ch.forEach((c,k)=>c.forEach(f=>{ const t=k*4*beat; const s=o.createOscillator(); s.type="triangle"; s.frequency.value=f; const g=o.createGain(); g.gain.setValueAtTime(0,t); g.gain.linearRampToValueAtTime(.12,t+.05); g.gain.linearRampToValueAtTime(.06,t+4*beat-.05); g.gain.linearRampToValueAtTime(0,t+4*beat); s.connect(g).connect(o.destination); s.start(t); s.stop(t+4*beat); })); });
  const mel=[440,523.3,587.3,523.3, 440,392,349.2,392, 392,440,493.9,587.3, 523.3,493.9,440,0];
  const vocal = await render(o=>{ mel.forEach((f,i)=>{ if(!f) return; const t=i*beat; const s=o.createOscillator(); s.frequency.value=f; const lfo=o.createOscillator(); lfo.frequency.value=5.5; const lg=o.createGain(); lg.gain.value=6; lfo.connect(lg).connect(s.frequency); const g=o.createGain(); g.gain.setValueAtTime(0,t); g.gain.linearRampToValueAtTime(.3,t+.06); g.gain.linearRampToValueAtTime(0,t+beat*.92); s.connect(g).connect(o.destination); s.start(t); lfo.start(t); s.stop(t+beat); lfo.stop(t+beat); }); });
  const backing = await render(o=>{ [0,8].forEach(st=>{ for(let i=st;i<st+4;i++){ const f=mel[i]*0.75, t=i*beat; const s=o.createOscillator(); s.type="sine"; s.frequency.value=f; const g=o.createGain(); g.gain.setValueAtTime(0,t); g.gain.linearRampToValueAtTime(.14,t+.12); g.gain.linearRampToValueAtTime(0,t+beat*.95); s.connect(g).connect(o.destination); s.start(t); s.stop(t+beat); } }); });
  setTracks([
    {name:"Lead Vocals", file:"0 Lead Vocals (Demo)", buffer:vocal},
    {name:"Backing Vocals", file:"1 Backing Vocals (Demo)", buffer:backing},
    {name:"Drums", file:"2 Drums (Demo)", buffer:drums},
    {name:"Bass", file:"3 Bass (Demo)", buffer:bass},
    {name:"Keyboard", file:"4 Keyboard (Demo)", buffer:keys},
  ]);
  $("fname").value = "Demo";
  setStatus("Demo geladen. Drück Play oder probier den Auto-Mix." + restoredNote);
};

