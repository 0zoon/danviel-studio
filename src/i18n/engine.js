/* =====================================================================
   LANGUAGE: German is the source text; English is applied by a translation layer that
   watches the page (also messages that appear later). Other languages: English UI +
   the browser's own translator (Chrome / Edge / Opera: right-click → Translate).
   ===================================================================== */
(function(){
  const KEY = "stemmixer:lang";
  let pref = null; try{ pref = localStorage.getItem(KEY); }catch(e){}
  const nav = (navigator.language || "de").toLowerCase();
  const LANG = pref || "en";            // English first (international); German is one click away and remembered
  const UI = LANG === "en" ? "en" : "de";
  window.I18N_LANG = UI;
  document.documentElement.lang = UI;
  const sel = document.getElementById("langSel");
  if(sel){ sel.value = LANG; sel.onchange = ()=>{ try{ localStorage.setItem(KEY, sel.value); }catch(e){} location.reload(); }; }
  const helpDe = document.querySelector(".hlp-de"), helpEn = document.querySelector(".hlp-en");
  if(helpDe && helpEn){ helpDe.hidden = UI !== "de"; helpEn.hidden = UI === "de"; }
  const chgDe = document.querySelector(".chg-de"), chgEn = document.querySelector(".chg-en");
  if(chgDe && chgEn){ chgDe.hidden = UI !== "de"; chgEn.hidden = UI === "de"; }
  window.__T = s => s;
  if(UI === "de") return;

  const D = window.I18N_EN || {exact:{}, pat:[], frag:[]};
  const EXACT = new Map(Object.entries(D.exact));
  const PAT = D.pat.map(([re, to]) => [new RegExp(re, "g"), to]);
  const FRAG = Object.entries(D.frag || {}).sort((a,b)=>b[0].length - a[0].length);
  const MISS = window.__miss = new Set();
  const norm = s => s.replace(/\s+/g, " ").trim();
  function tr(str){
    if(!str || !/[A-Za-zÄÖÜäöüß]{2}/.test(str)) return str;
    const k = norm(str);
    if(EXACT.has(k)){ const lead = str.match(/^\s*/)[0], tail = str.match(/\s*$/)[0]; return lead + EXACT.get(k) + tail; }
    let out = str;
    // pattern groups that are known phrases get translated too (e.g. "R&B: <genre description>.")
    for(const [re, to] of PAT){ re.lastIndex = 0; out = out.replace(re, (...m)=>to.replace(/\$(\d)/g, (_, n)=>{ const g = m[+n] == null ? "" : String(m[+n]); const e = EXACT.get(norm(g)); return e != null ? e : g; })); }
    for(const [de, en] of FRAG){ if(out.includes(de)) out = out.split(de).join(en); }
    if(out === str && /[äöüßÄÖÜ]|\b(der|die|das|und|nicht|ist|mit|für|oder|wird|kein|eine?n?|hier|noch|bei|zum|auf|aus)\b/.test(k)) MISS.add(k);
    return out;
  }
  window.__T = tr;
  const ATTRS = ["title", "placeholder", "aria-label", "data-title", "alt"];
  const skip = el => !!(el && el.closest && el.closest('[translate="no"], script, style, textarea, .hlp-en, .hlp-de, .chg-de, .chg-en'));
  const skipA = el => !!(el && el.closest && el.closest('[translate="no"], .hlp-en, .hlp-de, .chg-de, .chg-en'));
  const done = new WeakMap();
  function doText(n){
    const p = n.parentElement; if(!p || skip(p)) return;
    const v = n.nodeValue; if(done.get(n) === v) return;
    const t = tr(v); if(t !== v) n.nodeValue = t; done.set(n, n.nodeValue);
  }
  function doAttrs(el){
    if(skipA(el)) return;
    for(const a of ATTRS){ const v = el.getAttribute && el.getAttribute(a); if(v){ const t = tr(v); if(t !== v) el.setAttribute(a, t); } }
  }
  function walk(root){
    if(root.nodeType === 3){ doText(root); return; }
    if(root.nodeType !== 1) return;
    doAttrs(root);
    const w = document.createTreeWalker(root, NodeFilter.SHOW_TEXT | NodeFilter.SHOW_ELEMENT);
    let n; while((n = w.nextNode())){ if(n.nodeType === 3) doText(n); else doAttrs(n); }
  }
  walk(document.body); document.title = tr(document.title);
  let busy = false;
  new MutationObserver(list=>{
    if(busy) return; busy = true;
    try{
      for(const m of list){
        if(m.type === "characterData") doText(m.target);
        else if(m.type === "attributes"){ if(ATTRS.includes(m.attributeName)) doAttrs(m.target); }
        else m.addedNodes.forEach(walk);
      }
    } finally { busy = false; }
  }).observe(document.body, {subtree:true, childList:true, characterData:true, attributes:true, attributeFilter:ATTRS});
})();
