/* ---------- Phone: ☰ menu, simple mode with "all features" switch ---------- */
{ const mq = matchMedia("(max-width:700px)");
  let MORE = false; try{ MORE = localStorage.getItem("stemmixer:phmore") === "1"; }catch(e){}
  const hist = document.querySelector("header .hist"), pro = $("proBtn"), proHome = pro.parentNode;
  const moreBtn = document.createElement("button"); moreBtn.type = "button"; moreBtn.id = "phMoreToggle";
  const moreUi = ()=>{ document.body.classList.toggle("phmore", MORE); moreBtn.textContent = MORE ? "⚙ Einfache Handy-Ansicht" : "⚙ Alle Funktionen anzeigen";
    document.querySelectorAll(".phmore-btn").forEach(b=>b.textContent = MORE ? "－ Weniger anzeigen" : "＋ Alle Funktionen anzeigen"); };
  const setMore = v => { MORE = v; try{ localStorage.setItem("stemmixer:phmore", v ? "1" : "0"); }catch(e){} moreUi(); };
  moreBtn.onclick = ()=>{ setMore(!MORE); closeMenu(); };
  // a small "all features" button at the end of every step (phone only)
  document.querySelectorAll(".stepnext").forEach(sn=>{ const b = document.createElement("button"); b.type = "button"; b.className = "phmore-btn"; b.onclick = ()=>setMore(!MORE); sn.prepend(b); });
  const closeMenu = ()=>{ document.body.classList.remove("phmenu"); $("phMenu").setAttribute("aria-expanded", "false"); $("phMenu").textContent = "☰"; };
  $("phMenu").onclick = ()=>{ const open = !document.body.classList.contains("phmenu"); document.body.classList.toggle("phmenu", open); $("phMenu").setAttribute("aria-expanded", open); $("phMenu").textContent = open ? "✕" : "☰"; };
  hist.addEventListener("click", e=>{ if(e.target.closest("button,a") && e.target !== moreBtn) setTimeout(closeMenu, 50); });
  document.addEventListener("click", e=>{ if(document.body.classList.contains("phmenu") && !e.target.closest("header")) closeMenu(); });
  const place = ()=>{ if(mq.matches){ if(pro.parentNode !== hist) hist.prepend(pro); if(moreBtn.parentNode !== hist) hist.appendChild(moreBtn); }
    else { if(pro.parentNode !== proHome) proHome.insertBefore(pro, proHome.firstChild.nextSibling); moreBtn.remove(); closeMenu(); } };
  (mq.addEventListener ? mq.addEventListener("change", place) : mq.addListener(place)); place(); moreUi();
}
$("proBtn").onclick = ()=>{ try{ $("pro").showModal(); }catch(e){ $("pro").setAttribute("open",""); } };
$("proClose").onclick = ()=>{ try{ $("pro").close(); }catch(e){ $("pro").removeAttribute("open"); } };
$("chgBtn").onclick = ()=>{ try{ $("changes").showModal(); }catch(e){ $("changes").setAttribute("open",""); } $("changes").scrollTop = 0; requestAnimationFrame(()=>{ $("changes").scrollTop = 0; }); };
$("chgClose").onclick = ()=>{ try{ $("changes").close(); }catch(e){ $("changes").removeAttribute("open"); } };
$("helpBtn").onclick = ()=>{ try{ $("help").showModal(); }catch(e){ $("help").setAttribute("open",""); } };
// every dialog: ✕ at the top right, click outside the window or Esc closes it
document.querySelectorAll("dialog").forEach(d=>{
  const shut = ()=>{ try{ d.close(); }catch(e){ d.removeAttribute("open"); d.dispatchEvent(new Event("close")); } };
  d.querySelector(".dlgx")?.addEventListener("click", shut);
  d.addEventListener("click", e=>{ if(e.target !== d) return; const r = d.getBoundingClientRect();
    if(e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom) shut(); });
});
$("help").addEventListener("close", ()=>{ try{ localStorage.setItem("stemmixer:seen", "16.5"); }catch(e){} });
$("helpClose").onclick = ()=>{ try{ $("help").close(); }catch(e){ $("help").removeAttribute("open"); } try{ localStorage.setItem("stemmixer:seen", "16.5"); }catch(e){} };
// first start of this version: show the short guide once
try{ if(localStorage.getItem("stemmixer:seen") !== "16.5") setTimeout(()=>$("helpBtn").click(), 400); }catch(e){}
$("splitBtn").onclick = ()=>$("splitFile").click();
// Download the model ourselves so we can show MB progress, and keep it in the browser cache for next time
async function fetchModel(url){
  let cache = null;
  try{ cache = await caches.open("stem-mixer-models"); const hit = await cache.match(url); if(hit){ setStatus("Trenn-KI aus dem Speicher geladen."); return await hit.arrayBuffer(); } }catch(e){ cache = null; }
  const r = await fetch(url); if(!r.ok) throw new Error("Download der KI fehlgeschlagen (" + r.status + ")");
  const total = +r.headers.get("content-length") || 0;
  if(IS_PHONE && cache && r.body && r.body.tee){   // phones only: computers keep the proven path below
    try{ const [toDisk, toCount] = r.body.tee(), put = cache.put(url, new Response(toDisk, {headers: r.headers})), rd = toCount.getReader(); let n = 0;
      for(;;){ const {done, value} = await rd.read(); if(done) break; n += value.length;
        setProg(total ? n/total*0.999 : 0.5); setStatus(`Lade die Trenn-KI (einmalig) … ${Math.round(n/1048576)}${total ? " von "+Math.round(total/1048576) : ""} MB`); }
      await put; const hit = await cache.match(url); if(hit) return await hit.arrayBuffer();
    }catch(e){ log("KI-Download über den Speicher ging nicht, lade direkt:", String(e && e.message || e)); return fetchModelRam(url); }
  }
  return fetchModelRam(url, r, total, cache);
}
async function fetchModelRam(url, r, total, cache){
  if(!r){ r = await fetch(url); if(!r.ok) throw new Error("Download der KI fehlgeschlagen (" + r.status + ")"); total = +r.headers.get("content-length") || 0; }
  const reader = r.body.getReader(), parts = []; let got = 0;
  for(;;){ const {done, value} = await reader.read(); if(done) break; parts.push(value); got += value.length;
    setProg(total ? got/total*0.999 : 0.5); setStatus(`Lade die Trenn-KI (einmalig) … ${Math.round(got/1048576)}${total ? " von "+Math.round(total/1048576) : ""} MB`); }
  const buf = new Uint8Array(got); let o = 0; for(const p of parts){ buf.set(p, o); o += p.length; }
  try{ if(cache) await cache.put(url, new Response(buf.slice().buffer)); }catch(e){}
  return buf.buffer;
}
// the browser was killed while splitting last time (phones run out of memory): say so and suggest the short version
setTimeout(()=>{ if(!IS_PHONE) return; let was = null; try{ was = localStorage.getItem("stemmixer:splitRun"); localStorage.removeItem("stemmixer:splitRun"); }catch(e){}
  if(!was) return; log("Letztes Zerlegen hat den Browser abstürzen lassen:", was);
  if(was === "full"){ $("splitQuick").checked = true;
    setStatus("Beim letzten Zerlegen ist dem Gerät der Speicher ausgegangen. Ich habe „Nur 60 Sekunden“ eingeschaltet, das braucht viel weniger. Ganze Songs zerlegst du am besten am Computer.", true); }
  else setStatus("Beim letzten Zerlegen ist dem Gerät der Speicher ausgegangen. Für die KI ist dieses Handy leider zu knapp, am Computer klappt es. Fertige Stems (z. B. aus Suno) laufen am Handy ganz normal.", true);
}, 900);
let SPLIT_MODE = "cpu"; try{ if(localStorage.getItem("stemmixer:splitmode") === "gpu") SPLIT_MODE = "gpu"; }catch(e){}
let DEMUCS_EP = null, SPLIT_IN = null;
// 6 stems: kept for the Pro version, switched off in the free version for now
$("split6").onchange = ()=>{ try{ localStorage.setItem("stemmixer:split6", $("split6").checked ? "1" : "0"); }catch(e){} };
// 6 stems (drums, bass, other, vocals, guitar, piano): HT-Demucs 6s as ONNX, run directly in 7.8 s windows with overlap-add
const SIX_URL = "https://huggingface.co/adowu/htdemucs-6s-onnx/resolve/main/htdemucs_6s_fp16weights.onnx";
let SIX = null, SIX_EP = null;
async function runDemucs6(t0, L, R, useGpu){
  const {ort} = await loadDemucs(), ep = useGpu ? "gpu" : "cpu";
  if(!SIX || SIX_EP !== ep){
    SIX = null; setStatus("Lade die 6-Stem-KI (einmalig, ca. 140 MB) …");
    const model = await fetchModel(SIX_URL); setStatus("Starte die 6-Stem-KI …"); setProg(0.01); await sleep0();
    SIX = await ort.InferenceSession.create(new Uint8Array(model), {executionProviders: useGpu ? ["webgpu", "wasm"] : ["wasm"], graphOptimizationLevel: "all"}); SIX_EP = ep;
    log("6-Stem-KI geladen:", SIX.inputNames.join(","), "→", SIX.outputNames.join(","));
  }
  const seg = 343980, hop = Math.floor(seg*0.75), ov = seg - hop, n = L.length;
  let mean = 0; for(let i=0;i<n;i++) mean += (L[i]+R[i])/2; mean /= n;
  let vv = 0; for(let i=0;i<n;i+=3){ const m = (L[i]+R[i])/2 - mean; vv += m*m; } const std = Math.sqrt(vv/Math.ceil(n/3)) || 1;
  const out = Array.from({length:6}, ()=>[new Float32Array(n), new Float32Array(n)]), wsum = new Float32Array(n);
  const win = new Float32Array(seg); for(let i=0;i<seg;i++) win[i] = Math.max(0.02, Math.min(1, (i+1)/ov, (seg-i)/ov));
  const starts = []; for(let s0=0; ; s0+=hop){ starts.push(s0); if(s0 + seg >= n) break; }
  const inName = SIX.inputNames[0], outName = SIX.outputNames[0];
  for(let k=0;k<starts.length;k++){
    const s0 = starts[k], x = new Float32Array(2*seg);
    for(let i=0;i<seg;i++){ const j = s0 + i; if(j < n){ x[i] = (L[j]-mean)/std; x[seg+i] = (R[j]-mean)/std; } }
    const r = await SIX.run({[inName]: new ort.Tensor("float32", x, [1, 2, seg])}), y = r[outName].data;
    for(let st=0;st<6;st++) for(let ch=0;ch<2;ch++){ const base = (st*2+ch)*seg, o = out[st][ch]; for(let i=0;i<seg;i++){ const j = s0 + i; if(j < n) o[j] += y[base+i]*win[i]; } }
    for(let i=0;i<seg;i++){ const j = s0 + i; if(j < n) wsum[j] += win[i]; }
    const v = (k+1)/starts.length, sec = (performance.now()-t0)/1000; setProg(v);
    setStatus(`Zerlege in 6 Stems${useGpu ? "" : " (Prozessor)"} … ${Math.round(v*100)} %` + (v > 0.05 ? ` · noch ca. ${Math.max(1, Math.round(sec/v*(1-v)/60))} Min.` : "")); await sleep0();
  }
  for(const pr of out) for(const o of pr) for(let i=0;i<n;i++) o[i] = wsum[i] > 0 ? o[i]/wsum[i]*std : 0;
  const keys = ["drums","bass","other","vocals","guitar","piano"], res = {};
  keys.forEach((k,i)=>res[k] = {left: out[i][0], right: out[i][1]});
  return res;
}
