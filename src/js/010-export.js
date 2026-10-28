/* ---------- Export ---------- */
$("export").onclick = async ()=>{
  const sel = tracks.filter(t=>t.on); if(!sel.length) return;
  $("export").disabled = true; setProg(0);
  try{
    setStatus("Mische Spuren …");
    const sr = tracks[0].buffer.sampleRate;
    let L, R, suffix = "";
    if(M.on){
      const res = await masterExport();
      L = res.L; R = res.R; suffix = "Master";
    } else {
      const raw = await getMix();
      L = raw[0]; R = raw[1];
    }
    if(!M.on && $("norm").checked){
      let pk=0; for(let i=0;i<L.length;i++){ const a=Math.abs(L[i]), b=Math.abs(R[i]); if(a>pk)pk=a; if(b>pk)pk=b; }
      if(pk>OFF_CEIL){ const k=OFF_CEIL/pk; for(let i=0;i<L.length;i++){ L[i]*=k; R[i]*=k; } }
    }
    [L, R] = trimTail(L, R, sr);
    applyFades(L, R, sr);
    setStatus("Kodiere …");
    const {blob, ext} = await encodeAny(L, R, sr);
    const name = fileName([selTag(), suffix, sectionTag()], ext);
    await deliver(blob, name);
  } catch(e){ console.error(e); setStatus(e.message||String(e), true); }
  finally { $("export").disabled = !tracks.some(t=>t.on); setTimeout(()=>setProg(0),800); }
};

// ID3v2.3 tag with the encoder credit (TSSE frame)
function id3(){
  const t = CREDIT, fs = 1 + t.length, size = 10 + fs, b = new Uint8Array(10 + size);
  b.set([73,68,51,3,0,0, (size>>21)&127,(size>>14)&127,(size>>7)&127,size&127]);
  b.set([84,83,83,69, (fs>>>24)&255,(fs>>16)&255,(fs>>8)&255,fs&255, 0,0, 0], 10);
  for(let i=0;i<t.length;i++) b[21+i] = t.charCodeAt(i);
  return b;
}
function toI16(x){ x = x<-1?-1:x>1?1:x; return x<0 ? x*0x8000 : x*0x7FFF; }
const CREDIT = "DANVIEL Studio v16.5"; window.__CREDIT = CREDIT; window.__deliver = (b,n)=>deliver(b,n);
function encodeWav(L,R,sr,bits=16){
  // RIFF/WAVE PCM stereo: fmt, LIST/INFO (software credit), then data
  const B = bits/8, txt = CREDIT + "\0", tl = txt.length + (txt.length%2), info = 4 + 8 + tl;
  const n=L.length, data=n*2*B, hdr = 12 + 24 + 8 + info + 8, buf=new ArrayBuffer(hdr+data), v=new DataView(buf);
  const ws=(o,s)=>{ for(let i=0;i<s.length;i++) v.setUint8(o+i,s.charCodeAt(i)); };
  ws(0,"RIFF"); v.setUint32(4,hdr-8+data,true); ws(8,"WAVE");
  ws(12,"fmt "); v.setUint32(16,16,true); v.setUint16(20,1,true); v.setUint16(22,2,true); v.setUint32(24,sr,true); v.setUint32(28,sr*2*B,true); v.setUint16(32,2*B,true); v.setUint16(34,bits,true);
  let o = 36; ws(o,"LIST"); v.setUint32(o+4,info,true); ws(o+8,"INFO"); ws(o+12,"ISFT"); v.setUint32(o+16,txt.length,true); ws(o+20,txt);
  o += 8 + info; ws(o,"data"); v.setUint32(o+4,data,true); o += 8;
  if(bits===24){
    const u = new Uint8Array(buf);
    for(let i=0;i<n;i++) for(const x of [L[i], R[i]]){ let s=x<-1?-1:x>1?1:x; let q=Math.round(s<0?s*8388608:s*8388607); u[o]=q&255; u[o+1]=(q>>8)&255; u[o+2]=(q>>16)&255; o+=3; }
  } else {
    for(let i=0;i<n;i++){ v.setInt16(o,toI16(L[i]),true); v.setInt16(o+2,toI16(R[i]),true); o+=4; }
  }
  return new Blob([buf],{type:"audio/wav"});
}
async function encodeMp3(L,R,sr,kbps){
  const rate = [44100,48000,32000,22050,24000,16000].includes(sr) ? sr : 44100;
  const enc = new lamejs.Mp3Encoder(2, rate, kbps), block = 1152, parts = [id3()];
  const n = L.length, l = new Int16Array(block), r = new Int16Array(block);
  for(let i=0;i<n;i+=block){
    const m = Math.min(block, n-i);
    for(let j=0;j<m;j++){ l[j]=toI16(L[i+j]); r[j]=toI16(R[i+j]); }
    const d = enc.encodeBuffer(m===block?l:l.subarray(0,m), m===block?r:r.subarray(0,m));
    if(d.length) parts.push(new Uint8Array(d));
    if((i/block)%300===0){ const p=i/n; setProg(p); setStatus(`Kodiere MP3 … ${Math.round(p*100)} %`); await new Promise(res=>setTimeout(res,0)); }
  }
  const end = enc.flush(); if(end.length) parts.push(new Uint8Array(end));
  setProg(1);
  return new Blob(parts,{type:"audio/mpeg"});
}

async function deliver(blob, name){
  const inViewer = !!(window.claude && window.claude.use);
  if(inViewer){
    // Inside claude.ai only certain file types may be saved, so the audio goes into a ZIP.
    const dl = await window.claude.use("downloads");
    if(!dl || !window.JSZip){ setStatus("Speichern ist hier nicht möglich. Lade dir die Programmdatei (DANVIEL-Studio.html) herunter und öffne sie im Browser.", true); return; }
    let z = blob;
    if(/\.(json|mp4|txt|png)$/i.test(name)){ try{ await dl.save({filename:name, data:blob}); setStatus(`Gespeichert: ${name}`); }catch(e){ setStatus(e.code==="declined"?"Speichern abgebrochen.":"Speichern fehlgeschlagen: "+(e.message||e.code), e.code!=="declined"); } return; }
    if(!/\.zip$/i.test(name)){ setStatus("Packe ZIP …"); const zip = new JSZip(); zip.file(name, blob); z = await zip.generateAsync({type:"blob", compression:"STORE"}); }
    try{ await dl.save({filename: name.replace(/\.[^.]+$/,"")+".zip", data:z}); setStatus(/\.zip$/i.test(name) ? `Gespeichert: ${name}` : `Gespeichert: ${name} (in einer ZIP).`); }
    catch(e){ setStatus(e.code==="declined" ? "Speichern abgebrochen." : "Speichern fehlgeschlagen: "+(e.message||e.code), e.code!=="declined"); }
    return;
  }
  const url = URL.createObjectURL(blob), a = document.createElement("a");
  a.href = url; a.download = name; document.body.appendChild(a); a.click(); a.remove();
  setTimeout(()=>URL.revokeObjectURL(url), 30000);
  setStatus(`Fertig: ${name} (${(blob.size/1048576).toFixed(1)} MB) liegt in deinen Downloads.`);
}

