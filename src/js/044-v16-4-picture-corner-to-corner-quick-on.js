/* v16.4: picture corner to corner + quick on/off for title, visualizer and lyrics */
VID.full = VID.full || false;
function vFullUi(){ document.querySelectorAll("#vFull button").forEach(b=>b.setAttribute("aria-pressed", (b.dataset.f === "1") === !!VID.full)); $("vFullNote").hidden = !(VID.full && !VID.cover); }
$("vFull").addEventListener("click", e=>{ const b = e.target.closest("button"); if(!b) return; VID.full = b.dataset.f === "1"; vFullUi(); previewSoon(); saveSoon(); });
document.querySelectorAll(".vshow2 input[data-for]").forEach(sw=>{ const src = $(sw.dataset.for); if(!src) return;
  const pull = () => { sw.checked = src.checked; }; pull();
  sw.addEventListener("change", ()=>{ src.checked = sw.checked; src.dispatchEvent(new Event("change", {bubbles:true})); src.dispatchEvent(new Event("input", {bubbles:true})); previewSoon(); saveSoon(); });
  src.addEventListener("change", pull); new MutationObserver(pull).observe(src, {attributes:true}); setInterval(pull, 1500); });
vFullUi();

$("vsbDiscard").onclick = ()=>{ const back = VSB_BASE || (VID.style === "__draft" ? "classic" : VID.style); delete VSTYLES.__draft; VID.style = VSTYLES[back] ? back : "classic"; vStyleUi(); vsbPrefill(); previewSoon(); saveSoon(); };

