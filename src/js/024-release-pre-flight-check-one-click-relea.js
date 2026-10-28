/* =====================================================================
   RELEASE: pre-flight check + one-click release package
   ===================================================================== */
function onePole(x, fc, fs){ const k = 1-Math.exp(-2*Math.PI*fc/fs), y = new Float32Array(x.length); let a=0, b=0; for(let i=0;i<x.length;i++){ a+=(x[i]-a)*k; b+=(a-b)*k; y[i]=b; } return y; }
function releaseCheck(L, R, sr){
  const n = L.length, items = [], add = (lvl, title, text)=>items.push({lvl, title, text});
  const I = lufs([L,R], sr), tp = 20*Math.log10(truePeak([L,R])+1e-12);
  // loudness
  if(I > -9) add("warn", `Lautheit ${I.toFixed(1)} LUFS`, "Sehr laut. Spotify, YouTube und Apple regeln das auf etwa −14 LUFS runter, mehr Lautheit bringt dort also nichts, kostet aber Dynamik.");
  else if(I < -18) add("warn", `Lautheit ${I.toFixed(1)} LUFS`, "Recht leise. Für Streaming ist ein Master um −14 LUFS üblich. Schalt das Mastering ein oder wähl „Streaming“.");
  else add("ok", `Lautheit ${I.toFixed(1)} LUFS`, "Passt für Streaming (Spotify normalisiert auf −14 LUFS).");
  // true peak (Spotify: below −1 dBTP, below −2 dBTP when louder than −14 LUFS)
  const tpLim = I > -14 ? -2 : -1;
  if(tp > -0.1) add("bad", `True Peak ${tp.toFixed(1)} dBTP`, "Übersteuert. Beim Umwandeln in MP3/AAC entstehen hörbare Verzerrungen. Mastering einschalten oder leiser exportieren.");
  else if(tp > tpLim) add("warn", `True Peak ${tp.toFixed(1)} dBTP`, `Knapp. Empfohlen ist unter ${tpLim} dBTP, damit beim Streaming nichts verzerrt.`);
  else add("ok", `True Peak ${tp.toFixed(1)} dBTP`, "Genug Luft nach oben, verzerrt beim Streaming nicht.");
  // clipping runs
  let clips = 0; for(const x of [L,R]){ let run = 0; for(let i=0;i<n;i++){ if(Math.abs(x[i]) >= 0.9999){ if(++run === 3) clips++; } else run = 0; } }
  if(clips) add("bad", `${clips}× hartes Clipping`, "An diesen Stellen ist das Signal abgeschnitten, das klingt kratzig. Pegel runter oder Limiter (Mastering) nutzen.");
  else add("ok", "Kein Clipping", "Nirgends hart abgeschnitten.");
  // mono compatibility
  let lr=0, ll=0, rr=0; for(let i=0;i<n;i+=3){ lr+=L[i]*R[i]; ll+=L[i]*L[i]; rr+=R[i]*R[i]; }
  const corr = lr/Math.sqrt(ll*rr||1), M = new Float32Array(n); for(let i=0;i<n;i++) M[i]=(L[i]+R[i])/2;
  const monoLoss = I - lufs([M,M], sr);
  if(corr < 0) add("bad", `Mono: Phasenprobleme (Korrelation ${corr.toFixed(2)})`, "Auf Handy-Lautsprechern und in Clubs löschen sich Teile gegenseitig aus. Stereo-Breite verringern.");
  else if(monoLoss > 3 || corr < 0.25) add("warn", `Mono: −${monoLoss.toFixed(1)} dB (Korrelation ${corr.toFixed(2)})`, "In Mono wird es spürbar leiser oder dünner. Stereo-Breite etwas reduzieren.");
  else add("ok", `Mono-kompatibel (Korrelation ${corr.toFixed(2)})`, `Klingt auch auf einem Handy-Lautsprecher vollständig (nur ${Math.max(0,monoLoss).toFixed(1)} dB leiser in Mono).`);
  // low end should be mono
  const S = new Float32Array(n); for(let i=0;i<n;i++) S[i]=(L[i]-R[i])/2;
  const ml = onePole(M, 120, sr), sl = onePole(S, 120, sr); let em=0, es=0; for(let i=0;i<n;i+=3){ em+=ml[i]*ml[i]; es+=sl[i]*sl[i]; }
  const lowW = 10*Math.log10((es+1e-12)/(em+1e-12));
  if(lowW > -10) add("warn", "Bass ist breit (Stereo unter 120 Hz)", "Profis halten den Bass mono, sonst verliert er auf Club-Anlagen Druck. Im Mastering bleibt der Bass mono, prüf sonst die Stems.");
  else add("ok", "Bass mono", "Der tiefe Bereich ist mittig, so wie es sein soll.");
  // DC offset
  let dl=0, dr=0; for(let i=0;i<n;i++){ dl+=L[i]; dr+=R[i]; } const dc = Math.max(Math.abs(dl/n), Math.abs(dr/n));
  if(dc > 0.001) add("warn", "Gleichspannungs-Versatz (DC)", "Die Wellenform ist verschoben. Ein Low-Cut im Mastering behebt das.");
  // silence at the start / end
  const thr = Math.pow(10, -60/20); let a0 = 0; while(a0<n && Math.abs(L[a0])<thr && Math.abs(R[a0])<thr) a0++; let a1 = n-1; while(a1>0 && Math.abs(L[a1])<thr && Math.abs(R[a1])<thr) a1--;
  const lead = a0/sr, tail = (n-1-a1)/sr;
  if(lead > 1.5) add("warn", `${lead.toFixed(1)} s Stille am Anfang`, "Streaming-Hörer springen bei langer Stille oft weiter. Kürzen oder einen Ausschnitt setzen.");
  else add("ok", "Start ohne lange Stille", `${lead.toFixed(2)} s bis zum ersten Ton.`);
  if(tail > 3) add("warn", `${tail.toFixed(1)} s Stille am Ende`, "Lange Stille am Schluss. Ein Fade-Out oder Kürzen wirkt professioneller.");
  // what the streaming services will do with the level (reference levels as published by Meterplugs' Loudness Penalty)
  const PL = [["Spotify",-14,"tp1"],["YouTube",-14,"down"],["Apple Music",-16,"tp0"],["Amazon",-14,"down"],["Tidal",-14,"down"],["Deezer",-15,"down"]];
  const pen = PL.map(([nm, ref, mode])=>{ let g = ref - I; if(g > 0) g = mode === "down" ? 0 : Math.min(g, (mode === "tp1" ? -1 : 0) - tp); return nm + " " + (Math.abs(g) < 0.05 ? "±0" : (g > 0 ? "+" : "−") + Math.abs(g).toFixed(1)) + " dB"; });
  add("info", "Lautstärke auf den Plattformen", pen.join(" · ") + ". So viel regeln die Dienste deinen Song beim Abspielen leiser (−) oder lauter (+). Werte nahe 0 sind ideal, stark negative Werte heißen: Lautheit verschenkt, Dynamik umsonst geopfert.");
  // tonal balance compared with the genre's target curve
  try{
    const GP = GENRES[GENRE_USED] || GENRES.pop, TT = toneTarget(), tm = TT.slice(2,9).reduce((a,b)=>a+b,0)/7, sp = bandSpectrum(L, R, sr).bands;
    const dev = TT.map((v,i)=>sp[i] - (v - tm)), avg = a => a.reduce((x,y)=>x+y,0)/a.length;
    const lo = avg(dev.slice(0,2)), lm = avg(dev.slice(3,5)), hi = avg(dev.slice(7,10)), fmt = v => (v > 0 ? "+" : "−") + Math.abs(v).toFixed(1) + " dB";
    const notes = [];
    if(lo > 3) notes.push(`Tiefen kräftiger als typisch (${fmt(lo)})`); else if(lo < -3) notes.push(`Tiefen schwächer als typisch (${fmt(lo)})`);
    if(lm > 3) notes.push(`Mitten etwas mumpfig (${fmt(lm)})`); else if(lm < -3) notes.push(`Mitten eher dünn (${fmt(lm)})`);
    if(hi > 3) notes.push(`Höhen heller als typisch (${fmt(hi)})`); else if(hi < -3) notes.push(`Höhen dunkler als typisch (${fmt(hi)})`);
    if(notes.length) add("warn", `Klangbalance für ${GP.name}`, notes.join(", ") + ". Kann gewollt sein. Sonst „Klangbalance automatisch“ im Mastering einschalten oder mit Wärme und Glanz nachregeln.");
    else add("ok", `Klangbalance für ${GP.name}`, "Tiefen, Mitten und Höhen liegen nah am typischen Klangbild des Genres.");
  }catch(e){ console.warn(e); }
  // format
  add(sr >= 44100 ? "ok" : "warn", `Format ${sr/1000} kHz, Länge ${fmtT(n/sr)}`, sr >= 44100 ? "Standard-Qualität für alle Plattformen." : "Unter 44,1 kHz, manche Distributoren lehnen das ab.");
  return {items, I, tp};
}
function showCheck(res){
  const box = $("relList"); box.innerHTML = ""; box.hidden = false;
  const icon = {ok:"✓", warn:"!", bad:"✕", info:"i"};
  for(const it of res.items){ const d = document.createElement("div"); d.className = "chk " + it.lvl; d.innerHTML = `<span class="ic"></span><div><b></b><small></small></div>`;
    d.querySelector(".ic").textContent = icon[it.lvl]; d.querySelector("b").textContent = it.title; d.querySelector("small").textContent = it.text; box.appendChild(d); }
  const bad = res.items.filter(i=>i.lvl==="bad").length, warn = res.items.filter(i=>i.lvl==="warn").length;
  $("relSum").textContent = bad ? `${bad} Problem${bad>1?"e":""} und ${warn} Hinweis${warn===1?"":"e"}. Bitte vor dem Release beheben.` : warn ? `Bereit, mit ${warn} Hinweis${warn===1?"":"en"}.` : "Alles grün, bereit für den Release!";
  $("relSum").className = "relsum " + (bad ? "bad" : warn ? "warn" : "ok");
}
function checkText(res){
  const T = window.__T || (x=>x), en = window.I18N_LANG === "en";
  return `Release-Check · ${fileBase()} · ${new Date().toLocaleString(en ? "en-GB" : "de-DE")}\n${en ? "Made with" : "Erstellt mit"} ${CREDIT}\n\n` + res.items.map(i=>`[${i.lvl==="ok"?"OK":i.lvl==="info"?"INFO":i.lvl==="warn"?(en?"NOTE":"HINWEIS"):"PROBLEM"}] ${T(i.title)}\n    ${T(i.text)}`).join("\n");
}
// render the full song (never just the selected section) for release work
async function withFullSong(fn){ const keep = $("onlyAB").checked; $("onlyAB").checked = false; try{ return await fn(); } finally { $("onlyAB").checked = keep; } }
$("relCheck").onclick = async ()=>{
  $("relCheck").disabled = true;
  try{ setStatus("Release-Check: berechne den fertigen Song …"); setProg(0.1);
    const [L, R, sr] = await withFullSong(finalAudio);
    setStatus("Release-Check: prüfe …"); await sleep0();
    const res = releaseCheck(L, R, sr); showCheck(res); RELEASE.last = res;
    setStatus("Release-Check fertig."); setProg(1);
  } catch(e){ console.error(e); setStatus("Release-Check fehlgeschlagen: " + (e.message||e), true); }
  finally { $("relCheck").disabled = false; setTimeout(()=>setProg(0), 800); }
};
const RELEASE = {last:null};
function lrcText(){
  const lines = parseLyrics($("lText").value, LYR.dur || duration/rate); if(!lines.length) return "";
  const ts = t=>{ const cs = Math.max(0, Math.round(t*100)); return `[${String(Math.floor(cs/6000)).padStart(2,"0")}:${String(Math.floor(cs/100)%60).padStart(2,"0")}.${String(cs%100).padStart(2,"0")}]`; };
  return `[ti:${$("vTitle").value}]\n[ar:${$("vArtist").value}]\n[by:${CREDIT}]\n` + lines.map(l=>ts(l.t)+l.text).join("\n") + "\n";
}
function srtText(){
  const lines = parseLyrics($("lText").value, LYR.dur || duration/rate);
  const ts = t=>{ const ms = Math.max(0, Math.round(t*1000)); const h=Math.floor(ms/3600000), m=Math.floor(ms/60000)%60, s=Math.floor(ms/1000)%60; return `${String(h).padStart(2,"0")}:${String(m).padStart(2,"0")}:${String(s).padStart(2,"0")},${String(ms%1000).padStart(3,"0")}`; };
  return lines.map((l,i)=>`${i+1}\n${ts(l.t)} --> ${ts(l.end)}\n${l.text}\n`).join("\n");
}
$("relPack").onclick = async ()=>{
  if(!tracks.length) return;
  $("relPack").disabled = true; const job = ++VID.job; const log = [];
  try{
    const zip = new JSZip(), base = fileBase(), sr = tracks[0].buffer.sampleRate;
    // 1) master + check
    setStatus("Release-Paket: Master …"); setProg(0.05);
    const [L, R] = await withFullSong(finalAudio);
    zip.file(`${base} (Master).wav`, encodeWav(L, R, sr, 24)); log.push("Master als WAV (24 bit)");
    if(window.lamejs){ setStatus("Release-Paket: MP3 …"); zip.file(`${base} (Master).mp3`, await encodeMp3(L, R, sr, 320)); log.push("Master als MP3 (320 kbps)"); }
    const res = releaseCheck(L, R, sr); showCheck(res); zip.file(`${base} (Release-Check).txt`, checkText(res)); log.push("Release-Check");
    // 2) instrumental + acapella with the same master gain
    const hasVox = tracks.some(t=>t.on && isVox(t));
    if(hasVox && tracks.length > 1){
      const saved = tracks.map(t=>({on:t.on, vol:t.vol})), preDb = M.on && ana ? ana.pre : 0, ceilLin = db2(ceilTP()-0.5);
      const ref = M.on ? await withFullSong(masterExport) : {k:1};
      for(const v of ["inst","acap"]){
        setStatus(`Release-Paket: ${VERSIONS[v].label} …`); await sleep0();
        tracks.forEach((t,i)=>{ const st = VERSIONS[v].make({...t, ...saved[i]}); t.on = st.on; t.vol = st.vol; });
        let raw; try{ raw = await withFullSong(getMix); } finally { tracks.forEach((t,i)=>{ t.on = saved[i].on; t.vol = saved[i].vol; }); }
        let A, B;
        if(M.on){ const pl = await renderChain(raw, sr, preDb, ana && ana.lev); [A, B] = limit(pl[0], pl[1], db2(ref.g), ceilLin, sr); if(ref.k!==1) for(const x of [A,B]) for(let i=0;i<x.length;i++) x[i]*=ref.k; }
        else [A, B] = raw;
        [A, B] = trimTail(A, B, sr); applyFades(A, B, sr);
        zip.file(`${base} (${VERSIONS[v].label}).wav`, encodeWav(A, B, sr, 24)); log.push(VERSIONS[v].label);
      }
    }
    // 3) cover 3000 px with typography
    if(VID.cover){ setStatus("Release-Paket: Cover …"); const c = document.createElement("canvas"); c.width = c.height = 3000; drawCoverTo(c.getContext("2d"), 3000);
      zip.file(`${base} (Cover 3000px).png`, await new Promise(r=>c.toBlob(r, "image/png"))); log.push("Cover 3000 × 3000"); }
    // 4) lyrics
    if(SUNO_INFO && SUNO_INFO.raw){ zip.file(`${base} (Suno Prompt).txt`, SUNO_INFO.raw); if(SUNO_INFO.lyricsClean || SUNO_INFO.lyrics) zip.file(`${base} (Lyrics).txt`, SUNO_INFO.lyricsClean || SUNO_INFO.lyrics); log.push("Suno-Prompt und reine Lyrics"); }
    const lrc = lrcText(); if(lrc){ zip.file(`${base} (Lyrics).lrc`, lrc); zip.file(`${base} (Lyrics).srt`, srtText()); log.push("Lyrics als LRC und SRT"); }
    // 5) shorts video of the hook
    if($("relVideo").checked && window.VideoEncoder && window.AudioEncoder){
      const had = AB.a!==null && AB.b!==null, keepA = AB.a, keepB = AB.b, keepHook = SEC.hook, keepLen = SEC.len, keepOnly = $("onlyAB").checked;
      try{
        if(!had){ SEC.len = 30; setSection(await findHook()); SEC.hook = true; }
        $("onlyAB").checked = true;
        setStatus("Release-Paket: Shorts-Video …");
        const [vl, vr] = await finalAudio();
        const {blob} = await renderVideoBlob(vl, vr, sr, "v", job);
        zip.file(`${base} (${sectionTag()||"Hook"}, 9x16).mp4`, blob); log.push("Shorts-Video 9:16 der Hook");
      } finally { if(!had){ AB.a = keepA; AB.b = keepB; SEC.hook = keepHook; SEC.len = keepLen; showAB(); drawWaves(); } $("onlyAB").checked = keepOnly; }
    }
    setStatus("Release-Paket: packe ZIP …"); setProg(1);
    const z = await zip.generateAsync({type:"blob", compression:"STORE"});
    await deliver(z, fileName(["Release-Paket"], "zip"));
    $("relSum").textContent = "Im Paket: " + log.join(", ") + ".";
  } catch(e){ console.error(e); setStatus(e.message==="abgebrochen" ? "Release-Paket abgebrochen." : "Release-Paket fehlgeschlagen: " + (e.message||e), e.message!=="abgebrochen"); }
  finally { $("relPack").disabled = false; setTimeout(()=>setProg(0), 800); }
};

