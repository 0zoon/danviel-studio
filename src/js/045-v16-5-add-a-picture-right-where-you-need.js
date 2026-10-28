/* v16.5: add a picture right where you need it */
$("cxAddImg").onclick = ()=>$("aiOwnFile").click();
$("vAddImg").onclick = ()=>$("vCover").click();

try{ const sw = $("vLyrSweep"); sw.classList.add("sw16"); try{ const v = localStorage.getItem("stemmixer:lyrSweep"); if(v !== null) sw.checked = v === "1"; }catch(e){}
  sw.addEventListener("change", ()=>{ try{ localStorage.setItem("stemmixer:lyrSweep", sw.checked ? "1" : "0"); }catch(e){} previewSoon(); }); }catch(e){}
