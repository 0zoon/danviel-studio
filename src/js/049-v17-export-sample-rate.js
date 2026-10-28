/* ===================== v17: sample rate choice for the export ===================== */
function srSelSync(){ const m = $("fmt").value === "m4a"; $("srSel").hidden = m; if(m) $("srSel").title = "M4A ist immer 48 kHz"; }
$("fmt").addEventListener("change", srSelSync); srSelSync();
