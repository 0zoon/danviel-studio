/* =====================================================================
   LYRICS: Whisper speech recognition on the vocal stems (transformers.js, runs in the browser)
   ===================================================================== */
const LYR = {asr:null, model:"", dur:0};
// Whisper language codes in token order (<|en|> = 50259, then +1 for each)
const WL = ["en","zh","de","es","ru","ko","fr","ja","pt","tr","pl","ca","nl","ar","sv","it","id","hi","fi","vi","he","uk","el","ms","cs","ro","da","hu","ta","no","th","ur","hr","bg","lt","la","mi","ml","cy","sk","te","fa","lv","bn","sr","az","sl","kn","et","mk","br","eu","is","hy","ne","mn","bs","kk","sq"];
const LCODE = {german:"de", english:"en", albanian:"sq", turkish:"tr", bosnian:"bs", croatian:"hr", serbian:"sr", spanish:"es", french:"fr", italian:"it", portuguese:"pt", polish:"pl", dutch:"nl", romanian:"ro", greek:"el", russian:"ru", ukrainian:"uk", arabic:"ar"};
function tokId(tok, fallback){ try{ const m = LYR.asr.tokenizer.model.tokens_to_ids; const v = m.get ? m.get(tok) : m[tok]; if(typeof v === "number") return v; }catch(e){} return fallback; }
// one decoder step after <|startoftranscript|>: which allowed language token is most likely?
async function detectLang(audio, langs){
  const {model, processor} = LYR.asr, T = LYR.T;
  const feats = await processor(audio);
  const sot = tokId("<|startoftranscript|>", 50258);
  const out = await model({...feats, decoder_input_ids: new T.Tensor("int64", BigInt64Array.from([BigInt(sot)]), [1,1])});
  const lg = out.logits, V = lg.dims[lg.dims.length-1], data = lg.data, base = data.length - V;
  let best = langs[0], bv = -Infinity;
  for(const l of langs){ const code = LCODE[l]; const id = tokId(`<|${code}|>`, 50259 + WL.indexOf(code)); const v = data[base + id]; if(v > bv){ bv = v; best = l; } }
  return best;
}
// sung phrases from the vocal track: voiced 30 ms frames, gaps under 0.6 s merged, pieces up to ~25 s
function vocalPhrases(a, fs){
  const fr = Math.round(0.03*fs), nf = Math.floor(a.length/fr), e = new Float32Array(nf);
  for(let f=0; f<nf; f++){ let s=0; for(let i=f*fr;i<(f+1)*fr;i++) s+=a[i]*a[i]; e[f] = Math.sqrt(s/fr); }
  const sorted = Array.from(e).sort((x,y)=>x-y), p95 = sorted[Math.floor(nf*0.95)] || 0, thr = Math.max(0.006, p95*0.12);
  const regs = []; let st = -1, last = -1;
  for(let f=0; f<nf; f++){ if(e[f] > thr){ if(st<0) st = f; last = f; } else if(st>=0 && (f-last)*0.03 > 0.6){ regs.push([st*0.03, (last+1)*0.03]); st = -1; } }
  if(st>=0) regs.push([st*0.03, (last+1)*0.03]);
  const segs = [];
  for(const [s0, s1] of regs){
    if(s1 - s0 < 0.4) continue;
    const prev = segs[segs.length-1];
    if(prev && s0 - prev[1] < 1.2 && s1 - prev[0] < 25) prev[1] = s1; else segs.push([s0, s1]);
  }
  return segs.flatMap(([s0, s1])=>{ const out = []; for(let t=s0; t<s1; t+=25) out.push([Math.max(0, t-0.2), Math.min(a.length/fs, Math.min(s1, t+25)+0.2)]); return out; });
}
const HALLU = /(untertitel|subtitles by|amara\.org|thank you for watching|thanks for watching|danke fürs zuschauen|vielen dank fürs zuschauen|copyright|www\.|\.com)/i;
async function loadTransformers(){
  const urls = ["https://cdn.jsdelivr.net/npm/@huggingface/transformers@3.5.1", "https://cdn.jsdelivr.net/npm/@huggingface/transformers@3.0.2"];
  let last;
  for(const u of urls){ try{ return await import(u); }catch(e){ last = e; } }
  throw last;
}
function lNote(t, busy){ $("lNote").textContent = t; $("lNote").classList.toggle("busy", !!busy); }
$("lRun").onclick = async ()=>{
  $("lRun").disabled = true;
  try{
    const sr = tracks[0].buffer.sampleRate;
    const vox = tracks.filter(t=>isVox(t));
    lNote("Bereite Vocals vor …", true); await sleep0();
    // dry vocals only (no reverb/echo), at the current tempo, as 16 kHz mono
    const list = vox.length ? vox : tracks;
    const n = Math.max(...list.map(t=>buf(t).length)), mono = new Float32Array(n);
    list.forEach(t=>{ const b = buf(t); for(let c=0;c<b.numberOfChannels;c++){ const d=b.getChannelData(c), k=1/b.numberOfChannels; for(let i=0;i<d.length;i++) mono[i]+=d[i]*k; } });
    const [m1] = await varispeed([mono, mono], sr, rate);
    const n16 = Math.ceil(m1.length*16000/sr), o = new OfflineAudioContext(1, n16, 16000), bb = o.createBuffer(1, m1.length, sr); bb.copyToChannel(m1, 0);
    const src = o.createBufferSource(); src.buffer = bb; src.connect(o.destination); src.start(0);
    let a16 = (await o.startRendering()).getChannelData(0);
    let pk = 0; for(let i=0;i<a16.length;i++){ const v=Math.abs(a16[i]); if(v>pk) pk=v; } if(pk>0) a16 = a16.map(v=>v*0.9/pk);
    LYR.dur = a16.length/16000;
    const model = $("lModel").value;
    if(!LYR.asr || LYR.model !== model){
      lNote("Lade KI-Modell für die Spracherkennung … (einmalig)", true);
      const T = await loadTransformers();
      T.env.allowLocalModels = false;
      const files = {};
      const progress_callback = p=>{ if(p.status==="progress" && p.total){ files[p.file] = [p.loaded, p.total]; const L0 = Object.values(files).reduce((a,b)=>a+b[0],0), T0 = Object.values(files).reduce((a,b)=>a+b[1],0); lNote(`Lade KI-Modell … ${Math.round(L0/1048576)} von ${Math.round(T0/1048576)} MB`, true); } };
      let asr = null;
      if(navigator.gpu){ try{ asr = await T.pipeline("automatic-speech-recognition", model, {device:"webgpu", dtype:{encoder_model:"fp32", decoder_model_merged:"q4"}, progress_callback}); }catch(e){ asr = null; } }
      if(!asr) asr = await T.pipeline("automatic-speech-recognition", model, {dtype:"q8", progress_callback});
      LYR.asr = asr; LYR.model = model; LYR.T = T;
    }
    lNote("Höre die Vocals ab … das kann je nach Songlänge ein bis drei Minuten dauern.", true); await sleep0();
    // Split the vocals into sung phrases, decide the language for each phrase (only among the chosen
    // languages), then transcribe every phrase in its own language. That keeps bilingual songs bilingual.
    const langs = [...new Set([$("lLang").value, $("lLang2").value].filter(Boolean))];
    const segs = vocalPhrases(a16, 16000);
    const res = {chunks:[]}, count = {};
    for(let si=0; si<segs.length; si++){
      const [s0, s1] = segs[si], part = a16.subarray(Math.floor(s0*16000), Math.ceil(s1*16000));
      lNote(`Höre die Vocals ab … Abschnitt ${si+1} von ${segs.length}`, true); setProg(si/segs.length); await sleep0();
      let lang = langs.length===1 ? langs[0] : null;
      if(langs.length > 1){ try{ lang = await detectLang(part, langs); }catch(e){ console.warn("language detection", e); lang = null; } }
      const o = {task:"transcribe", return_timestamps:true, chunk_length_s:30, stride_length_s:5}; if(lang) o.language = lang;
      const r = await LYR.asr(part, o);
      count[lang||"auto"] = (count[lang||"auto"]||0) + 1;
      for(const ch of (r.chunks||[])){ const [a, b] = ch.timestamp||[0,0]; res.chunks.push({text:ch.text, timestamp:[s0 + (a||0), s0 + (b ?? (a||0)+4)]}); }
    }
    setProg(1);
    const rms = (t0, t1)=>{ const i0 = Math.max(0, Math.floor(t0*16000)), i1 = Math.min(a16.length, Math.ceil(t1*16000)); let s=0; for(let i=i0;i<i1;i++) s+=a16[i]*a16[i]; return Math.sqrt(s/Math.max(1,i1-i0)); };
    const lines = [];
    for(const ch of (res.chunks||[])){
      const txt = (ch.text||"").replace(/\[[^\]]*\]|\([^)]*(musik|music)[^)]*\)|♪/gi, " ").replace(/\s+/g," ").trim(); const [t0, t1raw] = ch.timestamp||[0,0]; const t1 = t1raw ?? t0+4;
      if(!txt || HALLU.test(txt) || rms(t0, t1) < 0.01) continue;
      // split long segments into readable lines (max ~42 characters), spreading the time by length
      const words = txt.split(/\s+/), parts = []; let cur = "";
      for(const w of words){ if((cur+" "+w).trim().length > 42 && cur){ parts.push(cur); cur = w; } else cur = (cur+" "+w).trim(); }
      if(cur) parts.push(cur);
      const tot = parts.reduce((a,p)=>a+p.length,0); let tt = t0;
      for(const p of parts){ lines.push({t:tt, text:p}); tt += (t1-t0)*p.length/tot; }
    }
    $("lText").value = lines.map(l=>`${fmtTs(l.t)}  ${l.text}`).join("\n");
    const LN = {german:"Deutsch", english:"Englisch", albanian:"Albanisch", turkish:"Türkisch", bosnian:"Bosnisch", croatian:"Kroatisch", serbian:"Serbisch", spanish:"Spanisch", french:"Französisch", italian:"Italienisch", portuguese:"Portugiesisch", polish:"Polnisch", dutch:"Niederländisch", romanian:"Rumänisch", greek:"Griechisch", russian:"Russisch", ukrainian:"Ukrainisch", arabic:"Arabisch", auto:"automatisch"};
    const langInfo = langs.length > 1 ? " Abschnitte: " + Object.entries(count).map(([k,v])=>`${v}× ${LN[k]||k}`).join(", ") + "." : "";
    lNote(lines.length ? `${lines.length} Zeilen erkannt.${langInfo} Lies einmal drüber und korrigier, was falsch verstanden wurde. Die Zeitangaben vorne bestimmen, wann eine Zeile im Video erscheint.` : "Keine Lyrics erkannt. Prüf, ob die Vocal-Spuren dabei sind, oder wähl die Sprache von Hand.");
    $("lSrt").disabled = !lines.length; renderLyricView(); previewSoon(); saveSoon();
  } catch(e){
    console.error(e);
    const inViewer = !!(window.claude && window.claude.use);
    lNote(inViewer ? "Die Lyrics-Erkennung funktioniert nur in der heruntergeladenen Programmdatei (DANVIEL-Studio.html im Browser geöffnet), weil das KI-Modell aus dem Internet geladen werden muss." : "Lyrics-Erkennung fehlgeschlagen: "+(e.message||e)+". Beim ersten Mal ist Internet nötig.");
  } finally { $("lRun").disabled = false; }
};
$("lText").addEventListener("input", ()=>{ $("lSrt").disabled = !$("lText").value.trim(); renderLyricView(); });

/* ---- read-along view: the current line lights up in the middle, lines before and after stay visible ---- */
const LV = {rows:[], times:[], cur:-1, mode:"song"};
function renderLyricView(){
  const box = $("lView");
  let rows;
  if(TAP.on){ rows = TAP.lines.map((text,i)=>({t: TAP.times[i], text})); LV.mode = "tap"; }
  else { rows = parseLyrics($("lText").value, LYR.dur || (duration ? duration/rate : 60)); LV.mode = "song"; }
  LV.times = rows.map(r=>r.t);
  box.hidden = !rows.length; box.innerHTML = "";
  LV.rows = rows.map((r,i)=>{
    const d = document.createElement("div"); d.className = "ln";
    d.innerHTML = `<span class="tm"></span><span class="tx"></span><button class="lved" type="button" title="Zeile korrigieren" aria-label="Zeile korrigieren">✎</button>`;
    d.querySelector(".tm").textContent = r.t!==undefined && r.t!==null ? fmtTs(r.t) : "–";
    d.querySelector(".tx").textContent = r.text;
    d.querySelector(".lved").onclick = e=>{ e.stopPropagation(); lvEdit(i, rows); };
    d.querySelector(".tx").ondblclick = e=>{ e.stopPropagation(); lvEdit(i, rows); };
    d.onclick = e=>{ if(TAP.on || r.t===undefined || d.classList.contains("editing")) return; const was = playing; stop(); offset = Math.max(0, (r.t-0.3)*rate); $("cur").textContent = fmtT(offset/rate); drawWaves(); drawSec(); if(was) play(); lvHighlight(r.t-0.3, true); };
    box.appendChild(d); return d;
  });
  LV.cur = -1; lvSetCur(TAP.on ? TAP.i : lvIndexAt(currentTime()/rate), true);
}
// fix a single misheard word without pasting all lyrics again: edit the line right in the list
function lvEdit(i, rows){
  if(TAP.on) return; const d = LV.rows[i]; if(!d || d.classList.contains("editing")) return;
  const tx = d.querySelector(".tx"), old = tx.textContent; d.classList.add("editing"); tx.contentEditable = "plaintext-only"; if(tx.contentEditable !== "plaintext-only") tx.contentEditable = "true";
  tx.focus(); const rg = document.createRange(); rg.selectNodeContents(tx); const sel = getSelection(); sel.removeAllRanges(); sel.addRange(rg);
  let done = false;
  const finish = save => { if(done) return; done = true; tx.contentEditable = "false"; d.classList.remove("editing");
    const nv = tx.textContent.replace(/\s+/g, " ").trim();
    if(!save || !nv || nv === old){ tx.textContent = old; return; }
    rows[i].text = nv; const keep = $("lView").scrollTop; setLyricLines(rows.map(r=>({t:r.t, text:r.text}))); $("lView").scrollTop = keep;
    lNote(`Zeile ${i+1} korrigiert.`); };
  tx.onkeydown = e=>{ if(e.key==="Enter"){ e.preventDefault(); finish(true); } else if(e.key==="Escape"){ e.preventDefault(); finish(false); } e.stopPropagation(); };
  tx.onblur = ()=>finish(true);
}
function lvIndexAt(t){ let k = -1; for(let i=0;i<LV.times.length;i++){ if(LV.times[i]!==undefined && LV.times[i] <= t + 0.05) k = i; } return k; }
function lvSetCur(i, force){
  if(i === LV.cur && !force) return; LV.cur = i;
  LV.rows.forEach((d,k)=>{ d.classList.toggle("cur", k===i); d.classList.toggle("next", k===i+1); d.classList.toggle("near", k!==i && Math.abs(k-i)<=2); });
  const d = LV.rows[Math.max(0,i)], box = $("lView");
  if(d && !box.hidden) box.scrollTop = d.offsetTop - box.clientHeight/2 + d.offsetHeight/2;
}
function lvHighlight(t, force){ if(LV.mode==="song" && LV.rows.length) lvSetCur(lvIndexAt(t), force); }

/* ---- tap helpers: beat light (+ optional click) in the song's tempo, and a countdown to the next sung phrase ---- */
const BEAT = {last:-1, sched:-1};
function beatGrid(){
  const bpmOut = (song ? song.bpm : 120) * effTempo(), beat = 60/bpmOut;
  const k0 = SC.kicks && SC.kicks.length ? SC.kicks[0] * (P.mode==="pro" ? 1/P.tempo : 1) / rate : 0;
  return {beat, phase: ((k0 % beat) + beat) % beat};
}
function beatTick(tOut){
  const {beat, phase} = beatGrid(), idx = Math.floor((tOut - phase)/beat);
  if(idx !== BEAT.last){ BEAT.last = idx; const pos = ((idx % 4) + 4) % 4;
    document.querySelectorAll("#beats i").forEach((d,i)=>{ d.classList.toggle("on", i===pos); d.classList.toggle("one", i===0); }); }
  // audible click: scheduled slightly ahead on the audio clock so it stays in time; goes to the speakers only (never into a mix or export)
  if($("clickOn").checked && ctx && monitor){
    const ahead = 0.15;
    for(let b = Math.max(BEAT.sched+1, idx); (phase + b*beat) < tOut + ahead; b++){
      const at = ctx.currentTime + (phase + b*beat - tOut)/1; if(at < ctx.currentTime) { BEAT.sched = b; continue; }
      const o = ctx.createOscillator(), g = ctx.createGain(); o.frequency.value = (((b%4)+4)%4)===0 ? 1600 : 1000;
      g.gain.setValueAtTime(0.0001, at); g.gain.exponentialRampToValueAtTime(0.35, at+0.002); g.gain.exponentialRampToValueAtTime(0.0001, at+0.05);
      o.connect(g).connect(monitor); o.start(at); o.stop(at+0.06); BEAT.sched = b;
    }
  }
  // countdown to the next phrase
  const ph = TAP.phrases, cue = $("cueTxt").parentNode;
  if(!ph) return;
  if(!ph.length){ $("cueTxt").textContent = "Keine Gesang-Einsätze erkannt."; return; }
  const cur = ph.find(([a,b])=>tOut>=a && tOut<b), next = ph.find(([a])=>a>tOut);
  if(cur){ cue.classList.add("sing"); $("cueTxt").textContent = "Gesang läuft"; $("cueBar").style.width = "100%"; }
  else if(next){ cue.classList.remove("sing"); const left = next[0]-tOut, prev = ph.filter(([,b])=>b<=tOut).pop(), span = Math.max(1, next[0] - (prev ? prev[1] : 0));
    $("cueTxt").textContent = `Gesang setzt ein in ${left.toFixed(1).replace(".",",")} s`; $("cueBar").style.width = Math.max(0, Math.min(100, (1-left/span)*100)) + "%"; }
  else { cue.classList.remove("sing"); $("cueTxt").textContent = "Kein Gesang mehr"; $("cueBar").style.width = "0"; }
}

/* ---- manual lyrics: paste, then time them automatically or by tapping along ---- */
const fmtTs = t=>`${Math.floor(t/60)}:${(Math.max(0,t)%60).toFixed(1).padStart(4,"0")}`;
const fmtMs = t=>{ t = Math.max(0,t); return `${Math.floor(t/60)}:${(t%60).toFixed(3).padStart(6,"0")}`; };
// Suno song info (from a script, a .txt/.json in the ZIP, or pasted): lyrics, style prompt and title
function parseArchiveTxt(txt){
  const t = txt.replace(/\r/g, ""), secs = {}; let cur = null;
  for(const ln of t.split("\n")){ const m = ln.match(/^(LYRICS|STYLE_OF_MUSIC|EXCLUDE_STYLE|CONTROL_SETTINGS|SONG_TITLE|SINGER_NAME):\s*$/); if(m){ cur = m[1]; secs[cur] = []; continue; } if(cur) secs[cur].push(ln); }
  const get = k => (secs[k] || []).join("\n").trim();
  let lyr = get("LYRICS"); const cut = lyr.split(/^\/\/\/\*+\/\/\/\s*$/m); if(cut.length > 1) lyr = cut.slice(1).join("\n");
  lyr = lyr.replace(/^\s*Lyrics:\s*$/im, "").split("\n").filter(l => !/^\s*\[(end|ende)\]\s*$/i.test(l)).join("\n").trim();
  const det = get("LYRICS"), tag = k => { const m = det.match(new RegExp("\\[" + k + ":((?:\\[[^\\]]*\\],?)+)\\]", "i")); return m ? [...m[1].matchAll(/\[([^\]]*)\]/g)].map(x=>x[1].trim()) : []; };
  const style = get("STYLE_OF_MUSIC").split("\n").filter(l => !/^\s*\[(is_max_mode|quality|realism|real_instruments)\s*:/i.test(l)).join(" ").replace(/,?SEE<SONG_DETAILS>/i, "").trim();
  const genres = tag("GENRES"), bpmM = (tag("TEMPO").join(" ") + " " + style).match(/(\d{2,3})\s*BPM/i), keyM = tag("KEY & HARMONIC")[0] || "";
  return {lyrics: lyr, style, genres, title: get("SONG_TITLE"), singer: get("SINGER_NAME"), bpm: bpmM ? +bpmM[1] : 0, key: keyM, archive: true, raw: txt};
}
function parseSunoInfo(txt){
  if(!txt || typeof txt !== "string") return null;
  if(/^LYRICS:\s*$/m.test(txt) && /^(STYLE_OF_MUSIC|SONG_TITLE):\s*$/m.test(txt)) return parseArchiveTxt(txt);
  const r = {lyrics:"", style:"", title:""};
  try{ const o = JSON.parse(txt), pick = (...ks) => { for(const k of ks){ const v = k.split(".").reduce((a,x)=>a && a[x], o); if(typeof v === "string" && v.trim()) return v.trim(); } return ""; };
    r.lyrics = pick("lyrics", "metadata.prompt", "prompt", "text"); r.style = pick("style", "styles", "tags", "metadata.tags", "display_tags", "genre"); r.title = pick("title", "name");
    if(r.lyrics && !/\n/.test(r.lyrics) && r.lyrics.length < 120){ if(!r.style) r.style = r.lyrics; r.lyrics = ""; }
    return r; }catch(e){}
  const t = txt.replace(/\r/g, ""), sec = (re) => { const m = t.match(re); return m ? m[1].trim() : ""; };
  r.title = sec(/^\s*(?:title|titel)\s*[:=]\s*(.+)$/im);
  r.style = sec(/^\s*(?:styles?|style of music|genre|tags|prompt)\s*[:=]\s*(.+)$/im);
  const lm = t.match(/^\s*(?:lyrics|songtext|text)\s*[:=]?\s*$([\s\S]*?)(?=^\s*(?:styles?|style of music|genre|tags|title|titel)\s*[:=]|$(?![\s\S]))/im);
  if(lm) r.lyrics = lm[1].trim();
  else if(!r.style && !r.title && t.split("\n").filter(l=>l.trim()).length >= 4 && !/^\s*\d+:\d/.test(t)) r.lyrics = t.trim();
  return (r.lyrics || r.style) ? r : null;
}
const STYLE_GENRES = [["rnb", /\b(r\s*&\s*b|rnb|r'n'b|soul|neo[- ]soul)\b/i], ["trap", /\b(trap|drill|hip[- ]?hop|rap|boom ?bap|phonk)\b/i], ["house", /\b(house|tech house|deep house|afro house)\b/i],
  ["edm", /\b(edm|big room|electro|dubstep|trance|dance|future bass|hardstyle|techno)\b/i], ["rock", /\b(rock|metal|punk|grunge|indie rock)\b/i], ["pop", /\b(pop|synth[- ]?pop|ballad)\b/i]];
function applySunoInfo(info, fromFiles){
  const done = [];
  if(info.title && (titleAuto || !$("vTitle").value.trim())){ const tf = titleFromFile(info.title + ".txt"); $("vTitle").value = tf.title || info.title; if(tf.artist && (artistAuto || !$("vArtist").value.trim())){ $("vArtist").value = tf.artist; artistAuto = true; } titleAuto = true; syncFname(); done.push("Titel"); }
  if(info.lyrics){ const clean = info.lyrics.split("\n").map(l=>l.trim()).filter(l=>l && !/^[\[(].*[\])]$/.test(l)).join("\n");
    if(clean && !$("lText").value.trim()){ $("lPaste").value = clean; $("lPasteBox").hidden = false; done.push("Lyrics"); try{ const sec = $("lPasteBox").closest(".coll.collapsed"); if(sec) sec.querySelector(".ctog").click(); lAutoTopUi(); }catch(e){} } }
  if(info.style || (info.genres && info.genres.length)){ const cands = [...(info.genres || []), info.style || ""];
    let g = null; for(const c of cands){ const hit = STYLE_GENRES.map(([k, re])=>[k, re, c.search(re)]).filter(x=>x[2] >= 0).sort((a,b)=>a[2]-b[2])[0]; if(hit){ g = hit; break; } }
    if(g && typeof GENRE !== "undefined"){ GENRE = g[0]; genreUi(); done.push("Genre " + GENRES[g[0]].name); }
    $("aiGenre").value = $("aiGenre").value || (info.genres && info.genres.length ? info.genres.join(", ") : (info.style||"")).slice(0, 80); }
  const extra = [info.bpm ? info.bpm + " BPM" : "", info.key || ""].filter(Boolean).join(", ");
  if(info.archive){ SUNO_INFO = info; }
  if(done.length){ lNote(`Aus den Suno-Infos übernommen: ${done.join(", ")}.` + (extra ? ` Laut Suno: ${extra}.` : "") + (done.includes("Lyrics") ? " Jetzt „Automatisch an den Gesang anpassen“ oder „Selbst mittippen“." : ""));
    if(fromFiles) setStatus(`Suno-Infos gefunden: ${done.join(", ")} übernommen.`); }
  previewSoon(); saveSoon(); return done.length;
}
let SUNO_INFO = null;
// pick the archive entry that belongs to the loaded song (by name), prefer the full archive file, add the clean lyrics file
const normT = x => (x||"").toLowerCase().replace(/\.[a-z0-9]{2,4}$/,"").replace(/\(([^)]*)\)/g," $1 ").replace(/\b(stems?|mega|master(ed)?|final|lyrics)\b/g," ").replace(/[^a-z0-9äöüß]+/g," ").trim();
function pickSunoInfo(list, names){
  const want = names.map(normT).filter(Boolean); if(!list.length) return null;
  const score = i => { const tt = normT(i.title || i._file || ""); if(!tt) return 0; let best = 0; for(const w of want){ if(w === tt) best = Math.max(best, 3); else if(w.includes(tt) || tt.includes(w)) best = Math.max(best, 2); } return best; };
  const full = list.filter(i=>i.archive).map(i=>[i, score(i)]).sort((a,b)=>b[1]-a[1]);
  let pick = full.length && (full[0][1] > 0 || full.length === 1) ? full[0][0] : null;
  if(!pick){ const any = list.map(i=>[i, score(i)]).sort((a,b)=>b[1]-a[1]); pick = any.length && (any[0][1] > 0 || list.length === 1) ? any[0][0] : null; }
  if(!pick) return null;
  const cleanFile = list.find(i => !i.archive && i._file && /- lyrics$/i.test(i._file.replace(/\.[a-z0-9]+$/i,"")) && normT(i._file.replace(/- lyrics/i,"")) === normT(pick.title || pick._file));
  if(cleanFile && cleanFile.lyrics){ pick.lyricsClean = cleanFile.lyrics; pick.lyrics = cleanFile.lyrics; }
  return pick;
}
// connect the Suno archive folder once (File System Access API); afterwards lyrics/genre are found automatically
const ARCH = {dir:null};
function archDb(){ return new Promise((res, rej)=>{ const r = indexedDB.open("danviel-studio", 1); r.onupgradeneeded = ()=>r.result.createObjectStore("kv"); r.onsuccess = ()=>res(r.result); r.onerror = ()=>rej(r.error); }); }
async function archSave(h){ try{ const db = await archDb(); db.transaction("kv","readwrite").objectStore("kv").put(h, "archiveDir"); }catch(e){} }
async function archLoad(){ try{ const db = await archDb(); return await new Promise(res=>{ const q = db.transaction("kv").objectStore("kv").get("archiveDir"); q.onsuccess = ()=>res(q.result||null); q.onerror = ()=>res(null); }); }catch(e){ return null; } }
async function archFiles(ask){
  if(!ARCH.dir) ARCH.dir = await archLoad(); const d = ARCH.dir;
  if(!d || !d.entries){ if(!ARCH.list) ARCH.list = await sessGet("archList"); return ARCH.list && Array.isArray(ARCH.list.items) ? ARCH.list.items.map(i=>Object.assign({}, i)) : []; }
  try{ let perm = await d.queryPermission({mode:"read"}); if(perm !== "granted" && ask) perm = await d.requestPermission({mode:"read"}); if(perm !== "granted") return []; }catch(e){ return []; }
  const out = []; for await (const [name, h] of d.entries()){ if(h.kind === "file" && /\.txt$/i.test(name)){ try{ const f = await h.getFile(); if(f.size < 200000){ const i = parseSunoInfo(await f.text()); if(i){ i._file = name; out.push(i); } } }catch(e){} } }
  return out;
}
async function archLookup(names, ask){ const list = await archFiles(ask); const pick = pickSunoInfo(list, names); if(pick){ applySunoInfo(pick, true); return true; } return false; }
// pasting a whole Suno info block into the lyrics box: take out style/title, keep only the lyrics
// browsers without folder connection (Brave by default, Firefox, Safari): read the folder once through a normal folder picker
// and keep the texts in this browser. New songs: just pick the folder again.
function archPickOnce(){
  const inp = document.createElement("input"); inp.type = "file"; inp.webkitdirectory = true; inp.multiple = true; inp.style.display = "none"; document.body.appendChild(inp);
  inp.onchange = async ()=>{ const fs = [...inp.files].filter(f => /\.txt$/i.test(f.name) && f.size < 200000); inp.remove();
    if(!inp.files.length) return; const items = [];
    for(const f of fs){ try{ const i = parseSunoInfo(await f.text()); if(i){ i._file = f.name; items.push(i); } }catch(e){} }
    const folder = ((inp.files[0].webkitRelativePath || "").split("/")[0]) || "Ordner";
    ARCH.dir = null; ARCH.list = {name: folder, items}; await sessPut("archList", ARCH.list); try{ const db = await archDb(); db.transaction("kv","readwrite").objectStore("kv").delete("archiveDir"); }catch(e){}
    $("archBtn").textContent = "📂 Suno-Archiv: " + folder;
    const ok = tracks.length ? await archLookup([$("vTitle").value, $("fname").value, ...tracks.map(t=>t.file||"")], true) : false;
    lNote(`Suno-Archiv eingelesen: ${items.filter(i=>i.archive).length} Songs gefunden.` + (tracks.length ? (ok ? "" : " Zu diesem Song ist (noch) nichts im Archiv.") : " Beim nächsten Laden eines Songs werden Lyrics und Genre automatisch übernommen.") + " Neue Songs im Archiv? Einfach den Ordner nochmal wählen.");
  };
  inp.click();
}
$("archBtn").onclick = async ()=>{
  if(!window.showDirectoryPicker){ archPickOnce(); return; }
  try{ const d = await window.showDirectoryPicker({id:"suno-archiv", mode:"read"}); ARCH.dir = d; await archSave(d);
    const list = await archFiles(true); $("archBtn").textContent = "📂 Suno-Archiv: " + d.name;
    const ok = tracks.length ? await archLookup([$("vTitle").value, $("fname").value, ...tracks.map(t=>t.file||"")], true) : false;
    lNote(`Suno-Archiv verbunden: ${list.filter(i=>i.archive).length} Songs gefunden.` + (tracks.length ? (ok ? "" : " Zu diesem Song ist (noch) nichts im Archiv.") : " Beim nächsten Laden eines Songs werden Lyrics und Genre automatisch übernommen."));
  }catch(e){ if(e && e.name !== "AbortError"){ log("Ordner verbinden ging nicht, lese ihn einmal ein:", String(e.message||e)); archPickOnce(); } } };
archLoad().then(async d=>{ if(d && d.entries){ ARCH.dir = d; $("archBtn").textContent = "📂 Suno-Archiv: " + d.name; }
  else { const l = await sessGet("archList"); if(l && l.name){ ARCH.list = l; $("archBtn").textContent = "📂 Suno-Archiv: " + l.name; } } }).catch(()=>{});
$("lPaste").addEventListener("paste", ()=>setTimeout(()=>{ const v = $("lPaste").value; if(!/^\s*(styles?|style of music|title|titel|lyrics)\s*[:=]/im.test(v) && !/^\s*\{/.test(v)) return;
  const info = parseSunoInfo(v); if(!info) return; if(info.lyrics){ $("lPaste").value = ""; } applySunoInfo(info); if(info.lyrics && !$("lPaste").value) $("lPaste").value = info.lyrics; }, 0));
const pastedLines = () => $("lPaste").value.split(/\r?\n/).map(l=>l.replace(/^\s*\d+:\d{1,2}(?:[.,]\d+)?\s+/, "").trim())
  .filter(l => l && !/^[\[(].*[\])]$/.test(l));
function setLyricLines(lines){
  $("lText").value = lines.map(l=>`${fmtTs(l.t)}  ${l.text}`).join("\n"); renderLyricView();
  $("lSrt").disabled = !lines.length; previewSoon(); saveSoon();
}
$("lPasteBtn").onclick = ()=>{
  const box = $("lPasteBox"); box.hidden = !box.hidden;
  if(!box.hidden && !$("lPaste").value.trim() && $("lText").value.trim())
    $("lPaste").value = $("lText").value.split(/\r?\n/).map(l=>l.replace(/^\s*\d+:\d{1,2}(?:[.,]\d+)?\s+/, "")).join("\n");
  if(!box.hidden) $("lPaste").focus();
};
$("lPasteClose").onclick = ()=>{ $("lPasteBox").hidden = true; };
// dry vocals at the current tempo as 16 kHz mono (same input the speech recognition uses)
async function vocals16k(){
  const sr = tracks[0].buffer.sampleRate, vox = tracks.filter(t=>isVox(t)), list = vox.length ? vox : tracks;
  const n = Math.max(...list.map(t=>buf(t).length)), mono = new Float32Array(n);
  list.forEach(t=>{ const b = buf(t); for(let c=0;c<b.numberOfChannels;c++){ const d=b.getChannelData(c), k=1/b.numberOfChannels; for(let i=0;i<d.length;i++) mono[i]+=d[i]*k; } });
  const [m1] = await varispeed([mono, mono], sr, rate);
  const n16 = Math.ceil(m1.length*16000/sr), o = new OfflineAudioContext(1, n16, 16000), bb = o.createBuffer(1, m1.length, sr); bb.copyToChannel(m1, 0);
  const src = o.createBufferSource(); src.buffer = bb; src.connect(o.destination); src.start(0);
  let a = (await o.startRendering()).getChannelData(0), pk = 0; for(let i=0;i<a.length;i++){ const v=Math.abs(a[i]); if(v>pk) pk=v; }
  if(pk>0){ const k = 0.9/pk; a = a.map(v=>v*k); }
  return {a, vox: vox.length > 0};
}
// spread the lines over the sung parts: each line gets sung time in proportion to its length
$("lAuto").onclick = async ()=>{
  const lines = pastedLines(); if(!lines.length){ lNote("Füg zuerst deinen Songtext ein."); return; }
  if(!tracks.length){ lNote("Lade zuerst den Song oder die Stems."); return; }
  $("lAuto").disabled = true; lNote("Suche die Stellen, an denen gesungen wird …", true); await sleep0();
  try{
    const {a, vox} = await vocals16k(), segs = vocalPhrases(a, 16000);
    if(!segs.length) throw new Error("Kein Gesang gefunden");
    const out = lyrAutoFit(lines, segs);
    setLyricLines(out); $("lPasteBox").hidden = true;
    lNote(`${out.length} Zeilen automatisch auf den Gesang verteilt${vox ? "" : " (keine Vocal-Spur erkannt, es wurde der ganze Mix verwendet)"}. Prüf die Zeiten in der Vorschau. Für genaue Zeiten nimm „Selbst mittippen“.`);
  } catch(e){ console.error(e); lNote("Automatisches Anpassen fehlgeschlagen: " + (e.message||e)); }
  finally { $("lAuto").disabled = false; }
};
// spread lines over the sung phrases (used by "fit automatically" and by "tap the start, rest automatic")
function lyrAutoFit(lines, segs){
  const total = segs.reduce((s,[x,y])=>s+(y-x),0), weights = lines.map(l=>Math.max(6, l.length)), W = weights.reduce((x,y)=>x+y,0);
  const at = pos => { let p = pos; for(const [x,y] of segs){ if(p <= y-x) return x+p; p -= (y-x); } return segs[segs.length-1][1]; };
  // when the song has as many or more sung phrases than lines, start lines on phrase starts where that fits
  let acc = 0; const out = lines.map((text,i)=>{ const t = at(acc/W*total); acc += weights[i]; return {t, text}; });
  if(segs.length >= lines.length*0.6) out.forEach(l=>{ const near = segs.map(s=>s[0]).reduce((b,x)=>Math.abs(x-l.t) < Math.abs(b-l.t) ? x : b, Infinity); if(Math.abs(near-l.t) < 1.5) l.t = near + 0.1; });
  for(let i=1;i<out.length;i++) if(out[i].t <= out[i-1].t) out[i].t = out[i-1].t + 0.8;
  return out;
}
// tap along
const TAP = {on:false, lines:[], i:0, times:[], phrases:null, auto:0};
function tapShow(){
  if(LV.mode!=="tap" || LV.rows.length!==TAP.lines.length) renderLyricView();
  LV.rows.forEach((d,i)=>{ d.querySelector(".tm").textContent = TAP.times[i]!==undefined ? fmtTs(TAP.times[i]) : "–"; });
  lvSetCur(TAP.i, true);
  $("tapCount").textContent = `Zeile ${Math.min(TAP.i+1, TAP.lines.length)} von ${TAP.lines.length}`;
  $("tapCur").textContent = TAP.lines[TAP.i] || "Fertig! Alle Zeilen getippt.";
  $("tapNext").textContent = TAP.lines[TAP.i+1] ? "Danach: " + TAP.lines[TAP.i+1] : "";
  const li = TAP.i-1; $("tapLast").textContent = li>=0 && TAP.times[li]!==undefined ? `Zeile ${li+1}: ${fmtMs(TAP.times[li])}` : "Letzte Zeile: –";
  $("tapEarly").disabled = $("tapLate").disabled = !(li>=0 && TAP.times[li]!==undefined);
}
// running clock while tapping: song position in seconds and milliseconds, right next to the line
function tapClock(){ if(!TAP.on) return; $("tapTime").textContent = fmtMs(currentTime()/rate); requestAnimationFrame(tapClock); }
function tapNudge(d){ const li = TAP.i-1; if(!TAP.on || li<0 || TAP.times[li]===undefined) return;
  const lo = li>0 ? TAP.times[li-1] + 0.1 : 0; TAP.times[li] = Math.max(lo, TAP.times[li] + d); tapShow(); }
function tapFinish(){
  if(!TAP.on) return; TAP.on = false; stop();
  $("tapBox").hidden = true; LV.mode = "song";
  const out = TAP.lines.map((text,i)=>({t: TAP.times[i], text})).filter(l=>l.t !== undefined);
  const rest = TAP.lines.slice(out.length);
  if(out.length){ let last = out[out.length-1].t; rest.forEach(text=>{ last += 3; out.push({t:last, text}); }); setLyricLines(out); }
  else renderLyricView();
  lNote(out.length ? `${TAP.times.filter(x=>x!==undefined).length} von ${TAP.lines.length} Zeilen getippt.` + (rest.length ? ` Die restlichen ${rest.length} wurden im Abstand von 3 s angehängt.` : "") + " Feinkorrektur geht direkt im Textfeld." : "Mittippen abgebrochen.");
}
$("lTapStart").onclick = ()=>tapBegin(0);
function tapBegin(auto){
  if(!$("lPaste").value.trim() && $("lText").value.trim()) $("lPaste").value = $("lText").value.split(/\r?\n/).map(l=>l.replace(/^\s*\d+:\d{1,2}(?:[.,]\d+)?\s+/, "")).join("\n");
  const lines = pastedLines(); if(!lines.length){ lNote("Füg zuerst deinen Songtext ein."); return; }
  if(!tracks.length){ lNote("Lade zuerst den Song oder die Stems."); return; }
  Object.assign(TAP, {on:true, lines, i:0, times:[], auto: auto || 0});
  if(auto) lNote(`Tippe die ersten ${Math.min(auto, lines.length)} Zeilen mit der Leertaste genau dann, wenn sie beginnen. Danach verteilt die Automatik den Rest auf den Gesang.`);
  $("lPasteBox").hidden = true; $("tapBox").hidden = false; tapShow();
  stop(); offset = 0; play(); $("tapHit").focus(); requestAnimationFrame(tapClock);
  TAP.phrases = null; $("cueTxt").textContent = "Gesang-Einsätze werden gesucht …";
  vocals16k().then(({a})=>{ TAP.phrases = vocalPhrases(a, 16000); }).catch(()=>{ TAP.phrases = []; });
}
// the first lines were tapped by hand, the rest goes automatically onto the sung phrases that come after them
async function tapFinishAuto(){
  if(!TAP.on) return; TAP.on = false; stop(); $("tapBox").hidden = true; LV.mode = "song";
  const n = TAP.i, tapped = TAP.lines.slice(0, n).map((text, i)=>({t: TAP.times[i], text})), rest = TAP.lines.slice(n);
  if(!rest.length){ setLyricLines(tapped); lNote(`Alle ${n} Zeilen getippt.`); return; }
  lNote("Verteile den Rest auf den Gesang …", true);
  try{
    let segs = TAP.phrases; if(!segs){ const {a} = await vocals16k(); segs = vocalPhrases(a, 16000); }
    const last = tapped[tapped.length-1].t, avg = tapped.length > 1 ? (last - tapped[0].t)/(tapped.length - 1) : 2.5, from = last + Math.max(1.2, Math.min(6, avg))*0.85;   // your own rhythm decides where the next line can start
    const after = segs.filter(([x, y])=>y > from).map(([x, y])=>[Math.max(x, from), y]);
    if(!after.length) throw new Error("nach der letzten getippten Zeile wurde kein Gesang mehr gefunden");
    const out = [...tapped, ...lyrAutoFit(rest, after)]; for(let i=1;i<out.length;i++) if(out[i].t <= out[i-1].t) out[i].t = out[i-1].t + 0.8;
    setLyricLines(out); $("lPasteBox").hidden = true;
    lNote(`${n} Zeilen getippt, ${rest.length} automatisch dahinter auf den Gesang verteilt. Prüf die Zeiten in der Vorschau.`);
  }catch(e){ let t = tapped[tapped.length-1].t; setLyricLines([...tapped, ...rest.map(text=>({t: t += 3, text}))]); lNote("Automatik für den Rest ging nicht (" + (e.message||e) + "), die restlichen Zeilen wurden im Abstand von 3 s angehängt."); }
}
const tapHit = ()=>{ if(!TAP.on) return; if(TAP.i >= TAP.lines.length){ tapFinish(); return; }
  const lat = Math.min(0.3, (ctx && (ctx.outputLatency || ctx.baseLatency)) || 0);   // what you hear lags the clock by the output latency
  const t = Math.max(0, currentTime()/rate - 0.12 - lat);
  if(TAP.i>0 && t <= TAP.times[TAP.i-1] + 0.2){ $("tapNext").textContent = "Zu früh, warte bis die Zeile wirklich anfängt."; return; }
  TAP.times[TAP.i] = t; TAP.i++; tapShow(); if(TAP.auto && TAP.i >= Math.min(TAP.auto, TAP.lines.length)){ tapFinishAuto(); return; } if(TAP.i >= TAP.lines.length) setTimeout(tapFinish, 1200); };
const tapBack = ()=>{ if(!TAP.on || TAP.i===0) return; TAP.i--; const t = TAP.times[TAP.i]; TAP.times.length = TAP.i; tapShow();
  const was = playing; stop(); offset = Math.max(0, (t - 3)*rate); if(was) play(); };
$("tapHit").onclick = tapHit; $("tapBack").onclick = tapBack; $("tapEnd").onclick = tapFinish;
$("tapEarly").onclick = ()=>tapNudge(-0.1); $("tapLate").onclick = ()=>tapNudge(0.1);
document.addEventListener("keydown", e=>{
  if(!TAP.on) return;
  if(e.code==="Space" || e.code==="Enter"){ e.preventDefault(); tapHit(); }
  else if(e.code==="ArrowLeft" || e.code==="Backspace"){ e.preventDefault(); tapBack(); }
  else if(e.code==="Escape"){ e.preventDefault(); tapFinish(); }
  else if(e.code==="ArrowDown"){ e.preventDefault(); tapNudge(-0.1); }
  else if(e.code==="ArrowUp"){ e.preventDefault(); tapNudge(0.1); }
});
$("lSrt").onclick = ()=>{
  const lines = parseLyrics($("lText").value, LYR.dur || duration/rate);
  const ts = t=>{ const ms = Math.max(0, Math.round(t*1000)); const h=Math.floor(ms/3600000), m=Math.floor(ms/60000)%60, s=Math.floor(ms/1000)%60; return `${String(h).padStart(2,"0")}:${String(m).padStart(2,"0")}:${String(s).padStart(2,"0")},${String(ms%1000).padStart(3,"0")}`; };
  const srt = lines.map((l,i)=>`${i+1}\n${ts(l.t)} --> ${ts(l.end)}\n${l.text}\n`).join("\n");
  deliver(new Blob([srt], {type:"text/plain"}), fileName(["Lyrics"], "srt"));
};

/* ---- kick hits + tempo as a Standard MIDI File ---- */
$("exportMidi").onclick = ()=>{
  if(!SC.kicks || !SC.kicks.length){ setStatus("Keine Kick- oder Drum-Spur gefunden, MIDI nicht möglich.", true); return; }
  const bpm = (song ? song.bpm : 120) * (P.mode==="pro" ? P.tempo : rate), ppq = 480, spt = 60/bpm/ppq;   // seconds per tick
  const scale = P.mode==="pro" ? 1/P.tempo : 1/rate;
  const vlq = n=>{ const b=[n&127]; while(n>>=7) b.unshift((n&127)|128); return b; };
  const ev = [], us = Math.round(60e6/bpm);
  ev.push(...vlq(0), 0xFF,0x51,0x03, (us>>16)&255, (us>>8)&255, us&255);
  ev.push(...vlq(0), 0xFF,0x58,0x04, 4,2,24,8);
  const name = Array.from(new TextEncoder().encode("Kick · DANVIEL Studio")); ev.push(...vlq(0), 0xFF,0x03, name.length, ...name);
  let last = 0; const len = Math.round(ppq/4);
  for(const k of SC.kicks){ const tick = Math.round(k*scale/spt); if(tick < last) continue;
    ev.push(...vlq(tick-last), 0x99, 36, 110); ev.push(...vlq(len), 0x89, 36, 0); last = tick + len; }
  ev.push(0, 0xFF, 0x2F, 0);
  const hdr = [0x4D,0x54,0x68,0x64, 0,0,0,6, 0,0, 0,1, (ppq>>8)&255, ppq&255];
  const trk = [0x4D,0x54,0x72,0x6B, (ev.length>>>24)&255, (ev.length>>16)&255, (ev.length>>8)&255, ev.length&255, ...ev];
  deliver(new Blob([new Uint8Array([...hdr, ...trk])], {type:"audio/midi"}), fileName([`Kick ${Math.round(bpm)} BPM`], "mid"));
};

