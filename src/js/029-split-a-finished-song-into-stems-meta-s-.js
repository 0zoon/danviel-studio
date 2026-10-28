/* =====================================================================
   SPLIT A FINISHED SONG INTO STEMS (Meta's HTDemucs via demucs-web + ONNX Runtime Web)
   4 stems: vocals, drums, bass, other. Runs in the browser; the model (~170 MB) is downloaded once.
   ===================================================================== */
const ORT_URL = "https://cdn.jsdelivr.net/npm/onnxruntime-web@1.20.1/dist/";
async function loadDemucs(){
  let ort = null, lastErr;
  for(const f of ["ort.webgpu.min.mjs", "ort.min.mjs"]){ try{ ort = await import(ORT_URL + f); break; }catch(e){ lastErr = e; } }
  if(!ort) throw lastErr;
  ort = ort.default && ort.default.env ? ort.default : ort;
  ort.env.wasm.wasmPaths = ORT_URL;
  ort.env.wasm.numThreads = 1;          // single-threaded WASM: the multi-threaded build stalled for users
  let mod = null;
  for(const u of ["https://cdn.jsdelivr.net/npm/demucs-web@1/+esm", "https://cdn.jsdelivr.net/npm/demucs-web/+esm"]){ try{ mod = await import(u); break; }catch(e){ lastErr = e; } }
  if(!mod) throw lastErr;
  return {ort, mod};
}
let DEMUCS = null, SPLIT_DIAG = "";
// Accepts several possible output layouts ({left,right}, [L,R], interleaved Float32Array) and keeps
// only a layout whose stems sum back to the original within −12 dB, with sane levels and no NaN.
// Cross-correlate a 4096-sample window of the original against a candidate (±maxLag samples).
function xAlign(orig, cand, c, maxLag){
  const W = 4096; maxLag = maxLag || 4096;
  if(c - maxLag < 0 || c + W + maxLag > cand.length || c + W > orig.length) return {corr:0, lag:0, gain:0};
  let no = 0; for(let i=0;i<W;i++) no += orig[c+i]*orig[c+i];
  let best = -2, lag = 0, gain = 0;
  for(let d=-maxLag; d<=maxLag; d++){ let x=0, ns=0; for(let i=0;i<W;i++){ const v = cand[c+i+d]; x += orig[c+i]*v; ns += v*v; } const r = x/Math.sqrt(no*ns+1e-20); if(r > best){ best = r; lag = d; gain = x/(ns+1e-20); } }
  return {corr: best, lag, gain};
}
function checkSeparation(res, L, R){
  const names = [["vocals","Vocals"],["drums","Drums"],["bass","Bass"],["guitar","Guitar"],["piano","Piano"],["other","Other (Instrumente)"]], n = L.length;
  const toF = x => x instanceof Float32Array ? x : (x && x.length ? Float32Array.from(x) : null);
  const layouts = {
    pair:  s => s && (s.left||s[0]) && typeof (s.left||s[0]) !== "number" ? [toF(s.left||s[0]), toF(s.right||s[1]||s.left||s[0])] : null,
    inter: s => { const a = toF(s && (s.length ? s : null)); if(!a || typeof s[0] !== "number" || a.length < 2*n*0.9) return null; const m = Math.floor(a.length/2), l = new Float32Array(m), r = new Float32Array(m); for(let i=0;i<m;i++){ l[i]=a[2*i]; r[i]=a[2*i+1]; } return [l, r]; },
    planar:s => { const a = toF(s && (s.length ? s : null)); if(!a || typeof s[0] !== "number" || a.length < 2*n*0.9) return null; const m = Math.floor(a.length/2); return [a.subarray(0,m), a.subarray(m, 2*m)]; },
  };
  const keys = res ? Object.keys(res) : [];
  const diagBase = `Schlüssel [${keys.join(",")}], Typ ${res && res.vocals ? (res.vocals.constructor && res.vocals.constructor.name) : "?"}, Eingang ${n} Samples`;
  let best = null;
  for(const [lname, fn] of Object.entries(layouts)){
    const stems = []; let bad = "";
    for(const [k, name] of names){
      const v = res && res[k]; if(!v) continue;
      let ch; try{ ch = fn(v); }catch(e){ ch = null; }
      if(!ch || !ch[0] || !ch[1]){ bad = "Format"; break; }
      stems.push({name, l: ch[0], r: ch[1]});
    }
    if(bad || !stems.length) continue;
    const m = Math.min(n, ...stems.map(st=>st.l.length));
    if(m < n*0.9){ best = best || {ok:false, diag:`${diagBase}, Layout ${lname}: Länge ${stems[0].l.length} statt ${n}`}; continue; }
    let eo=0, er=0, so=0, ss=0, nan=false, pk=0; const step = 7;
    for(let i=0;i<m;i+=step){
      let sl=0, sr=0;
      for(const st of stems){ const a=st.l[i], b=st.r[i]; if(!isFinite(a)||!isFinite(b)){ nan=true; break; } sl+=a; sr+=b; const q=Math.max(Math.abs(a),Math.abs(b)); if(q>pk) pk=q; }
      if(nan) break;
      eo += L[i]*L[i] + R[i]*R[i]; er += (L[i]-sl)*(L[i]-sl) + (R[i]-sr)*(R[i]-sr);
      so += L[i]*sl + R[i]*sr; ss += sl*sl + sr*sr;
    }
    const resDb = 10*Math.log10((er+1e-12)/(eo+1e-12));
    const diag = `${diagBase}, Layout ${lname}, Abweichung ${resDb.toFixed(1)} dB, Spitze ${pk.toFixed(2)}${nan?", ungültige Werte":""}`;
    const ok = !nan && pk < 4 && resDb < -12;
    if(ok) return {ok:true, stems, resDb, diag};
    // Same shape but wrong overall level? Find the one gain that makes the stems add up to the original
    // (least squares). Accept only if the corrected sum then matches the song closely.
    if(!nan && ss > 0){
      const g = so/ss, resS = Math.max(0, eo - so*so/ss), resDbS = 10*Math.log10((resS+1e-12)/(eo+1e-12));
      if(g > 0.002 && g < 2 && resDbS < -12 && pk*g < 4){
        for(const st of stems){ for(const x of [st.l, st.r]) for(let i=0;i<x.length;i++) x[i] *= g; }
        return {ok:true, stems, resDb: resDbS, scaled: g, diag: `${diag}, Pegel korrigiert ×${g.toFixed(4)} → Abweichung ${resDbS.toFixed(1)} dB`};
      }
    }
    // Same content but shifted in time (and wrongly scaled)? Measure the offset at three places;
    // if all agree, shift + rescale the stems and check the whole song again.
    if(!nan && m > 40000){
      const sumL = new Float32Array(m); for(const st of stems){ for(let i=0;i<m;i++) sumL[i] += st.l[i]; }
      const al = [0.3, 0.5, 0.7].map(f => xAlign(L, sumL, Math.floor(m*f), 8192));
      const lag = al[1].lag, g = al[1].gain;
      log("  Versatz-Messung:", al.map(a=>`${a.lag} Samples / ${(a.corr*100).toFixed(1)} % / ×${a.gain.toFixed(4)}`).join(" · "));
      if(al.every(a => a.corr > 0.9 && a.lag === lag) && g > 0.002 && g < 2 && (lag !== 0 || Math.abs(g-1) > 0.01)){
        const fix = x => { const o = new Float32Array(n); for(let i=0;i<n;i++){ const j = i + lag; o[i] = j>=0 && j<x.length ? x[j]*g : 0; } return o; };
        const st2 = stems.map(st => ({name: st.name, l: fix(st.l), r: fix(st.r)}));
        let e2=0, eo2=0, pk2=0;
        for(let i=0;i<n;i+=7){ let sl=0, sr=0; for(const st of st2){ sl+=st.l[i]; sr+=st.r[i]; const q=Math.max(Math.abs(st.l[i]),Math.abs(st.r[i])); if(q>pk2) pk2=q; } eo2 += L[i]*L[i]+R[i]*R[i]; e2 += (L[i]-sl)*(L[i]-sl)+(R[i]-sr)*(R[i]-sr); }
        const r2 = 10*Math.log10((e2+1e-12)/(eo2+1e-12));
        log("  Nach Versatz-Korrektur:", `Abweichung ${r2.toFixed(1)} dB, Spitze ${pk2.toFixed(2)}`);
        if(r2 < -12 && pk2 < 4) return {ok:true, stems: st2, resDb: r2, scaled: g, shifted: lag, diag: `${diag}, Versatz ${lag} Samples und Pegel ×${g.toFixed(4)} korrigiert → Abweichung ${r2.toFixed(1)} dB`};
      }
    }
    if(!best || (best.resDb!==undefined && resDb < best.resDb)) best = {ok:false, resDb, diag};
  }
  return best || {ok:false, diag: diagBase + ", kein lesbares Ausgabeformat"};
}

// Detailed look at a separation result for the error log: per-stem levels, and whether the
// stems' sum matches the original only with a time shift or a different level.
function sepAnalysis(res, L, R){
  const db = v => (20*Math.log10(v+1e-12)).toFixed(1);
  const st = (a) => { let pk=0, e=0, nan=0, dc=0; const n=a.length; for(let i=0;i<n;i+=3){ const v=a[i]; if(!isFinite(v)){ nan++; continue; } const q=Math.abs(v); if(q>pk) pk=q; e+=v*v; dc+=v; } const m=Math.ceil(n/3); return `Länge ${n}, Spitze ${pk.toFixed(3)}, RMS ${db(Math.sqrt(e/m))} dB, DC ${(dc/m).toFixed(4)}${nan?`, ${nan*3} ungültige Werte`:""}`; };
  log("  Original L:", st(L)); log("  Original R:", st(R));
  const sum = new Float32Array(L.length); let have = 0;
  for(const k of Object.keys(res||{})){
    const v = res[k]; if(!v) continue;
    const l = v.left || v[0], r = v.right || v[1];
    if(ArrayBuffer.isView(l)){ log(`  ${k} L:`, st(l)); if(ArrayBuffer.isView(r)) log(`  ${k} R:`, st(r)); const m = Math.min(l.length, sum.length); for(let i=0;i<m;i++) sum[i]+=l[i]; have++; }
    else log(`  ${k}: Typ ${v && v.constructor && v.constructor.name}, Schlüssel [${Object.keys(v||{}).slice(0,6).join(",")}]`);
  }
  if(!have) return;
  // cross-correlate a 4096-sample window from the middle against the stem sum (±4096 samples)
  const W = 4096, c = Math.floor(L.length/2); if(c < 2*W) return;
  let no = 0; for(let i=0;i<W;i++) no += L[c+i]*L[c+i];
  let best = -2, lag = 0, gain = 0;
  for(let d=-W; d<=W; d++){ let x=0, ns=0; for(let i=0;i<W;i++){ const v = sum[c+i+d]; x += L[c+i]*v; ns += v*v; } const r = x/Math.sqrt(no*ns+1e-20); if(r > best){ best = r; lag = d; gain = x/(ns+1e-20); } }
  log(`  Summe aller Stems gegen Original (Mitte, linker Kanal): beste Übereinstimmung ${(best*100).toFixed(1)} % bei Versatz ${lag} Samples (${(lag/44.1).toFixed(1)} ms), Pegelfaktor ×${gain.toFixed(4)}`);
}
$("logBtn").onclick = ()=>saveLog();
$("hudX").onclick = ()=>{ $("hud").hidden = true; };
// "Projekt löschen": first click asks, second click (within 4 s) clears everything and starts fresh.
// Personal settings stay (cover styles, listening volume, keys); only this project's autosave is removed.
let newArmT = 0;
