/* ---------- Steps: compact view (one step at a time, default) or everything open ---------- */
const STEPS = [
  {n:1, ic:"⤓", t:"Laden", d:"Stems, ZIP oder Ordner reinziehen, eine Demo laden oder einen fertigen Song zerlegen."},
  {n:2, ic:"🎚", t:"Mix", d:"Auto-Mix, Spuren, Effekte, Tempo & Tonart und Aufnahme."},
  {n:3, ic:"✨", t:"Master", d:"Lautheit für Spotify, YouTube oder Club, Bass und Referenz-Song."},
  {n:4, ic:"🎬", t:"Video & Cover", d:"Hook finden, Video mit Lyrics, Cover-Studio."},
  {n:5, ic:"📦", t:"Release", d:"Mix, Stems und Versionen speichern, Release-Check und Release-Paket."}];
const STEP_OF = [["#drop","1"], [".transport","2 3 4 5"], [".automix","2"], [".stripbar","2"], ["#strips","2"], [".songbar","2"], ["#recsec","2"], ["#buildsec","2"], ["#fxsec","2"],
  ["#master","3"], ["#secBox","4"], ["#vidsec","4"], ["section.export","5"]];
let STEP = 1, COMPACT = true, STEP_SEEN = new Set([1]);
const STEP_NOW = {1: "Zieh deinen Song oder deine Stems rein. Nur ein fertiger Song? Lass ihn von der KI in Stems zerlegen.",
  2: "Drück den goldenen Auto-Mix-Knopf, dann Play. Feinschliff an den Spuren nur, wenn du magst.",
  3: "Schalte das Mastering ein (Auto-Mix macht das schon), hör rein und geh weiter.",
  4: "Erst Lyrics, dann Cover, dann der goldene Knopf „Video erstellen“.",
  5: "Exportier deinen Mix oder hol dir das ganze Release-Paket."};
try{ COMPACT = localStorage.getItem("stemmixer:layout") !== "full"; }catch(e){}
// DANVIEL icons (v15.8): own line icons, 24 px grid, 2 px stroke, round ends; the peak (Λ) comes from the logo
const DI = (()=>{ const w = d => `<svg class="dic" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${d}</svg>`;
  return {
    s1: w('<path d="M12 15V4M7.5 8.5 12 4l4.5 4.5"/><path d="M4 14v4.5A1.5 1.5 0 0 0 5.5 20h13a1.5 1.5 0 0 0 1.5-1.5V14"/>'),
    s2: w('<path d="M6 4v16M12 4v16M18 4v16"/><rect x="4" y="13" width="4" height="3.5" rx="1" fill="currentColor"/><rect x="10" y="6.5" width="4" height="3.5" rx="1" fill="currentColor"/><rect x="16" y="10" width="4" height="3.5" rx="1" fill="currentColor"/>'),
    s3: w('<path d="M3 20h18"/><path d="M6 20 12 5l6 15"/><path d="M9.2 13h5.6"/>'),
    s4: w('<rect x="3" y="5" width="18" height="14" rx="2.5"/><path d="M10 9.2v5.6l4.8-2.8z" fill="currentColor"/>'),
    s5: w('<circle cx="12" cy="12" r="8.5"/><circle cx="12" cy="12" r="2.2"/><path d="M12 3.5a8.5 8.5 0 0 1 8.5 8.5"/>'),
    kbd: w('<rect x="2.5" y="6" width="19" height="12" rx="2.5"/><path d="M6.5 10h.01M10 10h.01M13.5 10h.01M17 10h.01M8 14h8"/>')
  }; })();
(function buildSteps(){
  const wrap = document.querySelector(".wrap"), head = wrap.querySelector("header");
  const bar = document.createElement("nav"); bar.className = "stepbar"; bar.setAttribute("aria-label", "Schritte");
  bar.innerHTML = '<button type="button" id="kbBtn" class="kbbtn" aria-expanded="false" aria-controls="kbMenu" title="Tastenkürzel anzeigen (Taste ?)" aria-label="Tastenkürzel">' + DI.kbd + '</button><div class="steps">' + STEPS.map(x=>`<button class="stp" data-n="${x.n}" title="${x.d} (Taste ${x.n})"><i>${DI["s"+x.n]}</i><span>${x.t}</span></button>`).join("") + '</div>'
    + '<span class="lseg" role="group" aria-label="Ansicht"><button id="lyCompact" title="Ein Schritt nach dem anderen, weniger scrollen">▤ Kompakt</button><button id="lyFull" title="Alle Bereiche untereinander auf einer Seite">☰ Alles offen</button></span>';
  head.after(bar);
  STEP_OF.forEach(([sel, st])=>{ const el = wrap.querySelector(sel); if(el) el.dataset.step = st; });
  // a title for each step and a "next" button at its end
  STEPS.forEach(x=>{
    const els = [...wrap.querySelectorAll("[data-step]")].filter(e=>e.dataset.step.split(" ")[0] === String(x.n) || (x.n > 1 && e.dataset.step === String(x.n)));
    const first = [...wrap.querySelectorAll("[data-step]")].find(e=>e.dataset.step.split(" ").includes(String(x.n)) && !e.classList.contains("transport")) || els[0];
    const last = [...wrap.querySelectorAll("[data-step]")].filter(e=>e.dataset.step.split(" ").includes(String(x.n))).pop();
    if(!first || !last) return;
    const h = document.createElement("div"); h.className = "stephead"; h.dataset.only = x.n; h.innerHTML = `<i class="shic">${DI["s"+x.n]}</i>${x.t}<small>${x.d}</small><div class="nowline"><b>Was jetzt?</b><span>${STEP_NOW[x.n]}</span><small class="tnote">Tasten 1–5 wechseln den Schritt</small></div>`;
    const tgt = x.n >= 2 && x.n <= 5 ? wrap.querySelector(".transport") : first;
    (x.n === 1 ? first : tgt).before(h);
    const nx = STEPS[x.n]; const pv = STEPS[x.n-2];
    const d = document.createElement("div"); d.className = "stepnext"; d.dataset.only = x.n;
    d.innerHTML = (pv ? `<button data-go="${pv.n}">← ${pv.n} · ${pv.t}</button>` : "") + (nx ? `<button class="primary" data-go="${nx.n}">Weiter zu ${nx.n} · ${nx.t} →</button>` : "");
    last.after(d);
  });
  // the step heads all sit before the shared player: keep only the one of the current step visible
  bar.addEventListener("click", e=>{ const b = e.target.closest(".stp"); if(b) goStep(+b.dataset.n, true); });
  wrap.addEventListener("click", e=>{ const b = e.target.closest(".stepnext button[data-go]"); if(b) goStep(+b.dataset.go, true); });
  $("lyCompact").onclick = ()=>setLayout(true); $("lyFull").onclick = ()=>setLayout(false);
})();
const COMPACT_ORDER = ["header", ".stepbar", '.stephead[data-only="1"]', "#drop", '.stepnext[data-only="1"]', ".stephead", ".transport", ".automix", ".stripbar", "#strips", "#fxsec", ".songbar", "#recsec", "#buildsec", '.stepnext[data-only="2"]',
  "#master", '.stepnext[data-only="3"]', "#secBox", "#vidsec", '.stepnext[data-only="4"]', "section.export", '.stepnext[data-only="5"]', "#artistBox", "footer"];
function stepOrder(){ const w = document.querySelector(".wrap");
  [...w.children].forEach(c=>c.style.order = "");
  if(!COMPACT) return;
  [...w.children].forEach(c=>c.style.order = 50);
  COMPACT_ORDER.forEach((sel, i)=>w.querySelectorAll(":scope > " + sel).forEach(c=>{ if(c.style.order === "50") c.style.order = i; })); }
function stepUi(){
  document.body.classList.toggle("compact", COMPACT); stepOrder();
  $("lyCompact").setAttribute("aria-pressed", COMPACT); $("lyFull").setAttribute("aria-pressed", !COMPACT);
  document.querySelectorAll(".wrap [data-step]").forEach(e=>e.classList.toggle("st-on", e.dataset.step.split(" ").includes(String(STEP))));
  document.querySelectorAll(".wrap [data-only]").forEach(e=>e.classList.toggle("st-on", e.dataset.only === String(STEP)));
  document.querySelectorAll(".stepbar .stp").forEach(b=>{ const n = +b.dataset.n; b.classList.toggle("on", n === STEP);
    b.classList.toggle("done", n !== STEP && (n === 1 ? tracks.length > 0 : tracks.length > 0 && STEP_SEEN.has(n))); b.setAttribute("aria-current", n === STEP ? "step" : "false"); });
  if(typeof miniCheck === "function") miniCheck();
}
function goStep(n, scroll){
  STEP = Math.max(1, Math.min(5, n)); STEP_SEEN.add(STEP); stepUi();
  if(!COMPACT){ const el = document.querySelector(STEP_ANCHOR[STEP]);
    if(el && scroll){ STEP_JUMP = performance.now(); el.scrollIntoView({behavior:"smooth", block:"start"}); } return; }
  if(scroll){ const bar = document.querySelector(".stepbar"); const y = bar.getBoundingClientRect().top + scrollY - 8; if(scrollY > y) scrollTo({top: y, behavior:"smooth"}); }
}
// "Everything open": each step jumps to its main panel, and the bar follows while you scroll
const STEP_ANCHOR = {1: "#drop", 2: ".automix", 3: "#master", 4: "#vidsec", 5: "section.export"};
let STEP_JUMP = 0;
addEventListener("scroll", ()=>{ if(COMPACT || performance.now() - STEP_JUMP < 900) return;
  let cur = 1; for(let n=1; n<=5; n++){ const el = document.querySelector(STEP_ANCHOR[n]); if(el && el.getBoundingClientRect().top < innerHeight*0.35) cur = n; }
  if(cur !== STEP){ STEP = cur; STEP_SEEN.add(cur); stepUi(); } }, {passive: true});
function setLayout(compact){ COMPACT = compact; try{ localStorage.setItem("stemmixer:layout", compact ? "compact" : "full"); }catch(e){} stepUi(); }
// anything that jumps to a panel (TikTok clip, cover studio, mini player …) opens that panel's step first
{ const orig = Element.prototype.scrollIntoView;
  Element.prototype.scrollIntoView = function(...a){
    if(COMPACT && this.closest){ const host = this.closest(".wrap [data-step]");
      if(host && !host.dataset.step.split(" ").includes(String(STEP))){ STEP = +host.dataset.step.split(" ")[0]; STEP_SEEN.add(STEP); stepUi(); } }
    return orig.apply(this, a); }; }
stepUi();
$("bgSel").value = document.documentElement.dataset.bg || "carbon";
let BG_PREV = document.documentElement.dataset.bg || "carbon";
function bgSet(v){ document.documentElement.dataset.bg = v; document.documentElement.dataset.theme = v === "hell" ? "light" : "dark"; try{ drawWaves(); }catch(e){} $("bgSel").value = v; BG_PREV = v; try{ localStorage.setItem("stemmixer:bg", v); }catch(e){} }
async function bgPhotoShow(){ try{ const db = await archDb(); const b = await new Promise(res=>{ const q = db.transaction("kv").objectStore("kv").get("bgPhoto"); q.onsuccess = ()=>res(q.result || null); q.onerror = ()=>res(null); });
  if(!b) return false; document.documentElement.style.setProperty("--bgphoto", `url("${URL.createObjectURL(b)}")`); return true; }catch(e){ return false; } }
$("bgSel").onchange = ()=>{ const v = $("bgSel").value;
  if(v !== "foto"){ bgSet(v); return; }
  // own photo: picked once, shrunk to max 2400 px and kept only in this browser (nothing is uploaded)
  const inp = document.createElement("input"); inp.type = "file"; inp.accept = "image/*";
  inp.onchange = async ()=>{ const f = inp.files[0]; if(!f) return;
    try{ const bm = await createImageBitmap(f), sc = Math.min(1, 2400/Math.max(bm.width, bm.height)), c = document.createElement("canvas");
      c.width = Math.round(bm.width*sc); c.height = Math.round(bm.height*sc); c.getContext("2d").drawImage(bm, 0, 0, c.width, c.height);
      const blob = await new Promise(r=>c.toBlob(r, "image/jpeg", 0.86)); const db = await archDb(); db.transaction("kv","readwrite").objectStore("kv").put(blob, "bgPhoto");
      document.documentElement.style.setProperty("--bgphoto", `url("${URL.createObjectURL(blob)}")`); bgSet("foto"); setStatus("Dein Foto ist jetzt der Hintergrund. Es bleibt nur in diesem Browser gespeichert.");
    }catch(e){ setStatus("Dieses Bild konnte nicht gelesen werden.", true); bgSet(BG_PREV); } };
  // cancelled: keep the photo from before if there is one, else go back
  addEventListener("focus", ()=>setTimeout(async ()=>{ if(inp.files && inp.files.length) return; if(await bgPhotoShow()) bgSet("foto"); else bgSet(BG_PREV === "foto" ? "carbon" : BG_PREV); }, 600), {once: true});
  inp.click(); };
if(document.documentElement.dataset.bg === "foto") bgPhotoShow().then(ok=>{ if(!ok) bgSet("carbon"); });
/* ---- mini player: fixed bar at the bottom while the big player is scrolled out of view ---- */
function miniSync(t){
  if(t === undefined) t = playing ? currentTime() : offset;
  { const c = document.getElementById("lClock"); if(c){ const s = Math.max(0, t/rate), m = Math.floor(s/60), r = s - m*60; c.textContent = m + ":" + (r < 10 ? "0" : "") + r.toFixed(3); } }
  $("miniSeek").value = duration ? Math.round(t/duration*1000) : 0;
  $("miniTime").textContent = fmtT(t/rate) + " / " + fmtT(duration/rate);
}
function miniCheck(){
  const tp = document.querySelector(".transport"), r = tp.getBoundingClientRect();
  const show = tracks.length > 0 && (!tp.offsetParent || r.bottom < 0 || r.top > innerHeight);
  if(show === !$("mini").hidden) return;
  $("mini").hidden = !show; document.body.classList.toggle("hasmini", show);
  if(show){ $("miniTitle").textContent = $("vTitle").value || $("fname").value || "Mein Projekt"; miniSync(); }
}
addEventListener("scroll", ()=>requestAnimationFrame(miniCheck), {passive:true});
addEventListener("resize", ()=>requestAnimationFrame(miniCheck));

/* ---- collapsible panels (state remembered per browser) ---- */
(function(){
  const P = [["#drop","Dateien laden"],[".songbar","Tempo & Tonart"],["#secBox","Ausschnitt / Hook"],[".automix","Auto-Mix & Genre"],["#strips","Spuren"],["#fxsec","Effekte"],["#recsec","Aufnahme"],["#buildsec","Spur bauen"],["#master","Mastering"],["#vidsec","Video & Lyrics"],[".export","Export"]];
  const DEF_CLOSED = ["songbar", "fxsec", "recsec", "buildsec"];   // tools in step 2 start folded, one click opens them
  let st = {}; try{ st = JSON.parse(localStorage.getItem("stemmixer:collapsed") || "{}") || {}; }catch(e){}
  const chev = '<svg viewBox="0 0 24 24"><path d="M6 9l6 6 6-6"/></svg>';
  for(const [sel, title] of P){
    const el = document.querySelector(sel); if(!el) continue;
    const id = sel.replace(/[#.]/g,"");
    el.classList.add("coll"); el.dataset.title = title;
    if(el.firstElementChild && el.firstElementChild.classList.contains("mhead")){ el.classList.add("keephead"); el.firstElementChild.classList.add("chead"); }
    else if(id !== "strips") el.classList.add("pad");
    const b = document.createElement("button"); b.type = "button"; b.className = "ctog"; b.innerHTML = chev + '<span class="ctl"></span>';
    const sync = ()=>{ const c = el.classList.contains("collapsed"); b.title = c ? title + " aufklappen" : title + " zuklappen"; b.setAttribute("aria-label", b.title); b.setAttribute("aria-expanded", !c);
      b.querySelector(".ctl").textContent = (window.__T || (x=>x))(c ? "Aufklappen" : "Zuklappen"); if(typeof collSum === "function") collSum(); };
    b.onclick = e=>{ e.stopPropagation(); el.classList.toggle("collapsed"); st[id] = el.classList.contains("collapsed"); try{ localStorage.setItem("stemmixer:collapsed", JSON.stringify(st)); }catch(err){} sync(); if(typeof miniCheck === "function") requestAnimationFrame(miniCheck); };
    el.addEventListener("click", e=>{ if(el.classList.contains("collapsed") && e.target === el){ b.click(); } });
    el.prepend(b); if(st[id] ?? DEF_CLOSED.includes(id)) el.classList.add("collapsed"); sync(); el.__sync = sync;
  }
})();

