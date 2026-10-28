/* =====================================================================
   COVER STUDIO
   No personal style ships with the program: everyone builds their own style with their own AI
   (guided text below), styles are stored only in this browser and never go into shared projects.
   ===================================================================== */
const AI_NEUTRAL = "Square professional music single cover for the song \"{titel}\" by {artist}. Song meaning, based on these lyrics: {lyrics}. Mood: {stimmung}. Music style: {musikstil}. Primary visual: {bildidee}. One strong, clear main subject, cinematic lighting, high detail, readable as a small streaming thumbnail. Leave clean empty space for the title text. No text, no letters, no logos, no watermark.";
const META_PROMPT = `Du bist mein Art Director für Musik-Cover. Ich möchte einen eigenen, wiedererkennbaren Cover-Style entwickeln.

Stell mir bitte nacheinander maximal 8 kurze Fragen (immer nur eine Frage auf einmal) zu:
1. Ästhetik und Epoche (z. B. 90er analog, modern clean, Anime, Street, Fine Art)
2. Medium (Fotografie, Illustration, 3D, Collage, Malerei)
3. Farbwelt und Licht
4. Materialien und Texturen (Filmkorn, Papier, Glanz …)
5. Typische Motive, die zu mir passen
6. Was ich auf keinen Fall will
7. Menschen auf dem Cover: ja oder nein
8. Wie viel freier Platz für den Titel bleiben soll

Fasse danach meinen Stil als Vorlage für einen Bildgenerierungs-Prompt auf ENGLISCH zusammen. Verwende diese Platzhalter genau so, mit geschweiften Klammern, sie werden später automatisch gefüllt:
{titel} {artist} {lyrics} {stimmung} {musikstil} {bildidee}

Regeln für die Vorlage:
- Square music single cover, ein starkes Hauptmotiv, gut lesbar als kleines Thumbnail
- Freien Platz für den Titel lassen, KEINE Schrift, keine Buchstaben, keine Logos, kein Wasserzeichen im Bild (die Schrift setzt mein Programm selbst)
- Abschnitte: Song meaning, Primary visual, Scene and composition, Style and medium, Lighting and palette, Avoid

Gib am Ende NUR diesen Block aus, ohne weiteren Text:
===STYLE START===
Name: (kurzer Name für meinen Style)
Prompt:
(die fertige englische Vorlage mit den Platzhaltern)
===STYLE ENDE===`;
const META_PROMPT_EN = `You are my art director for music covers. I want to develop my own recognizable cover style.

Please ask me up to 8 short questions, one at a time, about:
1. Aesthetic and era (e.g. 90s analog, modern clean, anime, street, fine art)
2. Medium (photography, illustration, 3D, collage, painting)
3. Colors and light
4. Materials and textures (film grain, paper, gloss …)
5. Typical motifs that fit me
6. What I definitely don't want
7. People on the cover: yes or no
8. How much free space should stay for the title

Then summarize my style as a template for an image generation prompt in ENGLISH. Use these placeholders exactly like this, with curly braces, they are filled in automatically later:
{titel} {artist} {lyrics} {stimmung} {musikstil} {bildidee}
({titel} = song title, {stimmung} = mood, {musikstil} = music style, {bildidee} = image idea)

Rules for the template:
- Square music single cover, one strong main subject, readable as a small thumbnail
- Leave free space for the title, NO text, no letters, no logos, no watermark in the image (my program adds the text itself)
- Sections: Song meaning, Primary visual, Scene and composition, Style and medium, Lighting and palette, Avoid

At the end output ONLY this block, with no other text:
===STYLE START===
Name: (short name for my style)
Prompt:
(the finished English template with the placeholders)
===STYLE END===`;
let STYLES_ = [], styleSel = "neutral";
try{ STYLES_ = JSON.parse(localStorage.getItem("stemmixer:styles")||"[]"); styleSel = localStorage.getItem("stemmixer:styleSel") || "neutral";
  const old = localStorage.getItem("stemmixer:aiPrompt"); if(old && !STYLES_.length && old.length > 20 && !/^Album cover art for the song/.test(old)){ STYLES_.push({id:"s"+Date.now(), name:"Meine Vorlage", prompt:old}); } }catch(e){}
const saveStyles = ()=>{ try{ localStorage.setItem("stemmixer:styles", JSON.stringify(STYLES_)); localStorage.setItem("stemmixer:styleSel", styleSel); }catch(e){} };
const curStyle = ()=> STYLES_.find(x=>x.id===styleSel) || {id:"neutral", name:"Neutral", prompt:AI_NEUTRAL};
function renderStyles(){
  const sel = $("aiStyleSel"); sel.innerHTML = "";
  const add = (v,t)=>{ const o = document.createElement("option"); o.value = v; o.textContent = t; sel.appendChild(o); };
  add("neutral", "Neutral (ohne persönlichen Style)"); STYLES_.forEach(st=>add(st.id, st.name));
  if(!STYLES_.some(x=>x.id===styleSel)) styleSel = "neutral";
  sel.value = styleSel; $("aiStyleDel").hidden = styleSel==="neutral"; $("aiPrompt").value = curStyle().prompt;
}
function parseStyleBlock(t){
  const m = t.match(/===\s*STYLE START\s*===([\s\S]*?)===\s*STYLE END(?:E)?\s*===/i), body = (m ? m[1] : t).trim();
  const name = (body.match(/^\s*Name:\s*(.+)$/mi)||[])[1];
  const pm = body.match(/Prompt:\s*([\s\S]+)$/i), prompt = (pm ? pm[1] : body.replace(/^\s*Name:.*$/mi, "")).trim();
  return {name: (name||"Mein Style").trim().slice(0, 40), prompt};
}
function songMood(){
  if(!song) return "atmospheric";
  const bpm = song.bpm * effTempo();
  const energy = bpm < 85 ? "slow, intimate" : bpm < 110 ? "laid-back, groovy" : bpm < 135 ? "driving, energetic" : "fast, intense";
  return (song.minor ? "dark, emotional, melancholic" : "bright, warm, uplifting") + ", " + energy;
}
function fillPrompt(t){
  const lyr = parseLyrics($("lText").value, 999).slice(0, 6).map(l=>l.text).join(" / ");
  const map = {titel: $("vTitle").value || $("fname").value || "Untitled", artist: $("vArtist").value || "", stimmung: songMood(),
               tempo: song ? Math.round(song.bpm*effTempo()) + " BPM" : "", tonart: song ? keyName(song.root, song.minor) : "",
               lyrics: lyr || "(no lyrics given, interpret the title and mood)", bildidee: $("aiIdea").value.trim() || "a single strong symbolic motif that fits the song",
               musikstil: $("aiGenre").value.trim() || "not specified", widmung: $("aiDedic").value.trim()};
  return t.replace(/\{(titel|artist|stimmung|tempo|tonart|lyrics|bildidee|musikstil|widmung)\}/gi, (_, k)=>map[k.toLowerCase()] || "").replace(/[ \t]+/g, " ").trim();
}
function aiEngineUi(){
  const oa = $("aiEngine").value === "openai";
  const eng = $("aiEngine").value, man = eng === "manual";
  ["aiKey","aiQual","aiKeySaveL"].forEach(id=>$(id).hidden = !oa);
  $("aiPkey").hidden = eng !== "poll"; $("aiOwn").hidden = !man;
  $("aiGo").textContent = man ? "Prompt kopieren" : "Cover erstellen";
  $("aiNote").textContent = oa ? "Kostet bei OpenAI je nach Qualität ca. 1–13 Cent pro Bild, abgerechnet über deinen OpenAI-Account."
    : man ? "1. „Prompt kopieren“ klicken. 2. In ChatGPT (oder Gemini …) einfügen und das Bild erstellen lassen. 3. Bild speichern und hier mit „Fertiges Bild laden“ öffnen. Titel und Name setzt das Programm danach exakt."
    : "Kostenlos, ohne Anmeldung. Etwa ein Bild alle 15 Sekunden. Wenn der Server ausgelastet ist, hilft ein kostenloser Schlüssel von enter.pollinations.ai oder der Weg über ChatGPT.";
}
$("aiCoverBtn").onclick = ()=>{ const b = $("aiBox"); b.hidden = !b.hidden; if(!b.hidden){ cpFill(false); setTimeout(()=>b.scrollIntoView({behavior:"smooth", block:"start"}), 50); renderStyles(); $("aiMeta").value = window.I18N_LANG === "en" ? META_PROMPT_EN : META_PROMPT;
  try{ const pk = localStorage.getItem("stemmixer:pkey"); if(pk) $("aiPkey").value = pk; }catch(e){}
  try{ const k = localStorage.getItem("stemmixer:aiKey"); if(k){ $("aiKey").value = k; $("aiKeySave").checked = true; $("aiEngine").value = "openai"; } }catch(e){} aiEngineUi(); drawCoverPrev(); } };
$("aiClose").onclick = ()=>{ $("aiBox").hidden = true; };
$("aiEngine").onchange = aiEngineUi;
$("aiStyleSel").onchange = e=>{ styleSel = e.target.value; saveStyles(); renderStyles(); };
$("aiStyleNew").onclick = ()=>{ $("aiGuide").hidden = false; $("aiMeta").value = window.I18N_LANG === "en" ? META_PROMPT_EN : META_PROMPT; $("aiStyleIn").focus(); };
$("aiGuideClose").onclick = ()=>{ $("aiGuide").hidden = true; };
$("aiMetaCopy").onclick = async ()=>{ try{ await navigator.clipboard.writeText(META_PROMPT); $("aiMetaNote").textContent = "Kopiert. Jetzt in deine KI einfügen."; }catch(e){ $("aiMeta").select(); $("aiMetaNote").textContent = "Text ist markiert, kopier ihn mit Strg+C."; } };
$("aiStyleSave").onclick = ()=>{
  const st = parseStyleBlock($("aiStyleIn").value);
  if(st.prompt.length < 40){ $("aiMetaNote").textContent = "Das sieht noch nicht nach einem Style-Block aus. Füg den ganzen Block aus deiner KI ein."; return; }
  const id = "s" + Date.now(); STYLES_.push({id, name: st.name, prompt: st.prompt}); styleSel = id; saveStyles(); renderStyles();
  $("aiGuide").hidden = true; $("aiStyleIn").value = ""; $("aiNote").textContent = `Style „${st.name}“ gespeichert und ausgewählt.`;
};
$("aiStyleDel").onclick = ()=>{ STYLES_ = STYLES_.filter(x=>x.id!==styleSel); styleSel = "neutral"; saveStyles(); renderStyles(); $("aiNote").textContent = "Style gelöscht."; };
$("aiPrompt").addEventListener("input", ()=>{ const st = STYLES_.find(x=>x.id===styleSel); if(st){ st.prompt = $("aiPrompt").value; saveStyles(); } });
async function useCoverBlob(blob, label){
  const bm = await createImageBitmap(blob);
  VID.cover = bm; VID.cxImg = null; VID.coverUrl = await imageToDataUrl(bm, 1024, "image/jpeg"); VID.coverName = label; VID.pal = coverPalette(bm);
  $("vCoverName").textContent = label + " · Farben übernommen"; $("vCoverClr").hidden = false; previewSoon(); saveSoon(); drawCoverPrev();
}
function addCoverThumb(blob, prompt, label, noSelect){
  const img = document.createElement("img"); img._blob = blob; img._label = label; img._prompt = prompt || "";
  img.src = URL.createObjectURL(blob); img.alt = label; img.title = prompt || label;
  img.onclick = async ()=>{ document.querySelectorAll("#aiThumbs img").forEach(x=>x.classList.toggle("sel", x===img)); if(prompt) $("aiUsed").value = prompt; await useCoverBlob(blob, label); };
  if(noSelect) $("aiThumbs").append(img); else $("aiThumbs").prepend(img); while($("aiThumbs").children.length > 6) $("aiThumbs").lastChild.remove();
  if(!noSelect) img.click();
}
$("aiOwn").onclick = ()=>$("aiOwnFile").click();
$("aiOwnFile").onchange = async e=>{ const f = e.target.files[0]; e.target.value = ""; if(!f) return;
  try{ await addCoverThumb(f, $("aiUsed").value, "Eigenes Cover"); if(typeof CP_USED !== "undefined" && CP_USED !== null) cxSetText(!CP_USED); $("aiNote").textContent = "Bild übernommen. Unten siehst du das fertige Cover mit Schrift, „Cover als PNG speichern“ exportiert es in 3000 × 3000."; log("Cover: eigenes Bild geladen", f.name, Math.round(f.size/1024)+" KB"); }
  catch(err){ $("aiNote").textContent = "Dieses Bild konnte nicht geöffnet werden."; } };
