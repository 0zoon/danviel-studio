/* ===================== v17: sample rate choice for the export ===================== */
function srSelSync(){ const m = $("fmt").value === "m4a"; $("srSel").hidden = m; if(m) $("srSel").title = "M4A ist immer 48 kHz"; }
$("fmt").addEventListener("change", srSelSync); srSelSync();

/* v17: names for screen readers on fields that only had a visual label next to them */
[["bnBpm","Tempo in BPM"],["bnBars","Länge in Takten"],["aiMeta","Infos zum Song"],["aiPrompt","Bild-Prompt"],["aiUsed","Verwendeter Prompt"],
 ["pkMkTrack","Spur für das Pack"],["file","Audiodateien wählen"],["splitFile","Song zum Zerlegen wählen"]]
  .forEach(([id, l]) => { const el = $(id); if(el && !el.getAttribute("aria-label")) el.setAttribute("aria-label", l); });
