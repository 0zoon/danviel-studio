# German -> English dictionary for DANVIEL Studio
# EXACT: whole text node / attribute (whitespace collapsed)
# PAT:   [JS regex source, replacement with $1..] applied in order
# FRAG:  substring replacements for longer sentences that get glued together in code

EXACT = {
# ---------- header / general ----------
"Projekt löschen": "Delete project",
"Wirklich alles löschen? Nochmal klicken": "Really delete everything? Click again",
"Alles leeren und ein neues Projekt starten": "Clear everything and start a new project",
"So geht's": "How it works",
"Kurzanleitung und Neuigkeiten": "Quick guide and what's new",
"Rückgängig": "Undo",
"Wiederholen": "Redo",
"Strg+Z": "Ctrl+Z",
"Strg+Y": "Ctrl+Y",
"Stems oder eine ZIP reinziehen, Spuren an- und ausschalten, reinhören und den fertigen Mix exportieren. Alles passiert lokal in deinem Browser, nichts wird hochgeladen.": "Drop in stems or a ZIP, switch tracks on and off, listen and export the finished mix. Everything happens locally in your browser, nothing is uploaded.",
"Stems hier ablegen": "Drop stems here",
"MP3, WAV, FLAC, OGG, M4A oder eine ZIP mit Stems drin, zum Beispiel aus Suno. Nur ein fertiger Song? „Song in Stems zerlegen“ (Beta, mit Sicherheitsprüfung).": "MP3, WAV, FLAC, OGG, M4A or a ZIP with stems inside, for example from Suno. Only have a finished song? “Split song into stems” (beta, with safety check).",
"Dateien wählen": "Choose files",
"Demo-Stems laden": "Load demo stems",
"Song in Stems zerlegen (KI, Beta)": "Split song into stems (AI, beta)",
"Zerlege …": "Splitting …",
"Abspielen": "Play",
"Pause": "Pause",
"Position": "Position",
"Abhör-Lautstärke": "Listening volume",
"Abhör-Lautstärke: ändert nur, was du hörst, nicht den Export": "Listening volume: only changes what you hear, not the export",
"Stumm schalten": "Mute",
"Ton an": "Unmute",
"Frequenz-Analyzer": "Frequency analyzer",
"Lautheit": "Loudness",
"Peak": "Peak",
"Drück Play, dann siehst du hier, was im Mix passiert.": "Press play to see what's happening in the mix.",
"Gute Lautheit für Streaming und Club.": "Good loudness for streaming and club.",
"Eher leise.": "Rather quiet.",
"Eher leise. Das Mastering hebt es auf Streaming-Lautheit an.": "Rather quiet. Mastering brings it up to streaming loudness.",
"Sehr laut. Laut, aber wenig Dynamik.": "Very loud. Loud, but little dynamics.",
"Stille.": "Silence.",
"Übersteuert! Lautstärken etwas runter oder Mastering einschalten.": "Clipping! Turn levels down a bit or switch on mastering.",
"Gehörschutz aktiv: ungewöhnlich lauter Pegel, Ausgabe um 12 dB gesenkt. Prüf deine Spuren.": "Hearing protection active: unusually loud level, output lowered by 12 dB. Check your tracks.",
"Schnellwahl": "Quick select",
"Beat (ohne Vocals)": "Beat (no vocals)",
"Nur Vocals": "Vocals only",
"Ohne Lead Vocal": "No lead vocal",
"Alle an": "All on",
"Alle aus": "All off",
# ---------- tempo / key ----------
"Tempo": "Tempo",
"Tonart": "Key",
"BPM (geschätzt)": "BPM (estimated)",
"Tonhöhe behalten": "Keep pitch",
"Kassette (Slowed / Sped up)": "Tape (slowed / sped up)",
"100 % · Original": "100 % · original",
"Original": "Original",
"Ziel-BPM": "Target BPM",
"±0 Halbtöne": "±0 semitones",
"Tonart in Halbtönen": "Key in semitones",
"Vocals in Originaltonhöhe (nur der Beat wird tiefer oder höher)": "Vocals at original pitch (only the beat goes lower or higher)",
"Tempo und Tonart lassen sich getrennt ändern. Nach dem Loslassen des Reglers wird kurz neu berechnet.": "Tempo and key can be changed separately. After you release the slider it recalculates briefly.",
"Original. Tempo und Tonart lassen sich getrennt ändern.": "Original. Tempo and key can be changed separately.",
"Wie bei einer Kassette: Tempo und Tonhöhe ändern sich zusammen.": "Like a tape: tempo and pitch change together.",
"Lade Stems, dann erscheint hier der Song.": "Load stems and the song appears here.",
"Berechne Tempo und Tonart …": "Calculating tempo and key …",
"Berechne Vocals in Originaltonhöhe …": "Calculating vocals at original pitch …",
# ---------- section / hook ----------
"Ausschnitt": "Section",
"Hook finden": "Find hook",
"◀ 1 Takt": "◀ 1 bar",
"1 Takt ▶": "1 bar ▶",
"Einen Takt früher": "One bar earlier",
"Einen Takt später": "One bar later",
"nicht gesetzt": "not set",
"Loop": "Loop",
"Auf Takt einrasten": "Snap to bar",
"Start hier": "Start here",
"Ende hier": "End here",
"Entfernen": "Remove",
"Ausschnitt: ziehen zum Verschieben, Ränder ziehen zum Ändern der Länge": "Section: drag to move, drag the edges to change the length",
"„Hook finden“ sucht den Teil, der sich im Song am meisten wiederholt und dabei am meisten Energie und Gesang hat, meistens die Hook. Der Ausschnitt startet kurz bevor der Song nach dem Drop „aufgeht“. Den markierten Bereich kannst du verschieben oder an den Rändern länger und kürzer ziehen. Zum genauen Setzen mit dem Mausrad reinzoomen und „Auf Takt einrasten“ ausschalten.": "“Find hook” looks for the part that repeats most in the song while having the most energy and vocals, usually the hook. The section starts just before the song “opens up” after the drop. You can move the marked area or drag its edges to make it longer or shorter. To place it exactly, zoom in with the mouse wheel and switch off “Snap to bar”.",
"Suche die Hook …": "Looking for the hook …",
# ---------- auto-mix ----------
"Auto-Mix": "Auto-Mix",
"Ein Klick für einen sauberen Mix, passend zum Genre.": "One click for a clean mix that fits the genre.",
"Setzt Lautstärken, Panorama, Low-Cuts, Effekte und Mastering nach den Regeln des gewählten Genres. „Automatisch“ hört sich den Song an und erkennt das Genre selbst. Danach kannst du bei jeder Spur unter „Klang“ alles von Hand nachstellen.": "Sets levels, panning, low cuts, effects and mastering following the rules of the chosen genre. “Automatic” listens to the song and detects the genre itself. Afterwards you can fine-tune everything by hand under “Sound” on each track.",
"Genre": "Genre",
"Automatisch": "Automatic",
"Pop": "Pop",
"R&B": "R&B",
"Hip-Hop / Trap": "Hip-Hop / Trap",
"EDM / Big Room": "EDM / Big Room",
"House": "House",
"Rock / Band": "Rock / Band",
"ⓘ Was ändert sich je Genre?": "ⓘ What changes per genre?",
"Stimme": "Vocals",
"Beat": "Beat",
"Effekte": "Effects",
"Pumpen": "Pumping",
"Mastering": "Mastering",
"vorne, klar": "upfront, clear",
"ausgewogen": "balanced",
"Platten-Hall": "plate reverb",
"leicht": "light",
"−14 LUFS, breit, hell": "−14 LUFS, wide, bright",
"vorne, Harmonien lauter": "upfront, harmonies louder",
"Drums zurück": "drums back",
"viel Hall, punktiertes Echo": "lots of reverb, dotted echo",
"kaum": "barely",
"−14 LUFS, warm": "−14 LUFS, warm",
"Rap trocken und vorne": "rap dry and upfront",
"808 kräftiger": "stronger 808",
"kurzer Raum, 1/8-Echo": "short room, 1/8 echo",
"808 leicht": "808 lightly",
"−9 LUFS, schmaler, viel Sub": "−9 LUFS, narrower, lots of sub",
"im Mix": "in the mix",
"Kick und Synths dominant": "kick and synths dominant",
"großer Hall": "big reverb",
"stark": "strong",
"−9 LUFS, sehr breit, hell": "−9 LUFS, very wide, bright",
"Kick ist König": "kick is king",
"Platte": "plate",
"Akkorde und Bass pumpen": "chords and bass pump",
"−9 LUFS, clubtauglich": "−9 LUFS, club-ready",
"normal": "normal",
"Gitarren tragen": "guitars carry it",
"aus": "off",
"Aus": "Off",
"−14 LUFS, warme Mitten": "−14 LUFS, warm mids",
"Außerdem passen sich Kompressor, De-Esser, Low-Cut der Stimme und das Klangziel fürs Mastering an. Bei einem fertigen Song (eine Spur) wirkt das Genre nur aufs Mastering. Auto-Mix mastert immer auf Streaming-Lautstärke (−14 LUFS). Lauter für Club und DJ: im Mastering „Laut (Club & DJ)“ wählen.": "Compressor, de-esser, the vocal low cut and the tonal target for mastering also adapt. With a finished song (one track) the genre only affects mastering. Auto-Mix always masters to streaming loudness (−14 LUFS). Louder for clubs and DJs: choose “Loud (Club & DJ)” in mastering.",
"„Automatisch“": "“Automatic”",
"Beim Auto-Mix wird das Genre aus dem Song erkannt.": "Auto-Mix detects the genre from the song.",
"Auto-Balance": "Auto balance",
"Auto-Pan": "Auto pan",
"Auto-EQ": "Auto EQ",
"Auto-Dynamik": "Auto dynamics",
"Mix zurücksetzen": "Reset mix",
"Tipp: Stems vom Produzenten sind oft schon fertig gemischt. Hör nach dem Auto-Mix mit „Mix zurücksetzen“ gegen, was dir besser gefällt.": "Tip: stems from a producer are often already mixed. After Auto-Mix, compare with “Reset mix” to hear what you like better.",
"Auto-Mix: hört sich den Song an …": "Auto-Mix: listening to the song …",
"Auto-Mix: hört, wo sich Spuren im Weg stehen …": "Auto-Mix: listening for tracks getting in each other's way …",
"Messe Lautheit der Stems …": "Measuring stem loudness …",
"Auto-Balance gesetzt. Hör rein und korrigier bei Bedarf per Regler.": "Auto balance set. Listen and adjust with the sliders if needed.",
"Auto-Pan gesetzt.": "Auto pan set.",
"Auto-EQ hört rein …": "Auto EQ is listening …",
"Auto-EQ gesetzt.": "Auto EQ set.",
"Auto-Dynamik gesetzt.": "Auto dynamics set.",
"Auto-Pan: Kick, Snare, Bass und Lead-Vocal bleiben in der Mitte, der Rest wird verteilt": "Auto pan: kick, snare, bass and lead vocal stay centered, the rest is spread out",
"Auto-EQ: Low-Cuts je nach Instrument, Platz-EQ wo sich Spuren im Weg stehen": "Auto EQ: low cuts per instrument, space EQ where tracks get in each other's way",
"Auto-Dynamik: Kompressor und De-Esser auf den Vocals, Bass macht bei jedem Kick kurz Platz": "Auto dynamics: compressor and de-esser on the vocals, the bass briefly makes room on every kick",
"Auto-Vocal-FX: Platten-Hall auf den Vocals, Echo im Takt auf der Lead-Stimme": "Auto vocal FX: plate reverb on the vocals, tempo-synced echo on the lead vocal",
"Mix zurückgesetzt: alle Spuren wieder so, wie sie geliefert wurden.": "Mix reset: all tracks back to how they were delivered.",
"Fertiger Song erkannt: Nur das Mastering wurde eingeschaltet, der Mix selbst bleibt unverändert.": "Finished song detected: only mastering was switched on, the mix itself stays unchanged.",
# genre descriptions
"Stimme vorne und klar, breites Stereobild, eher hell": "vocals upfront and clear, wide stereo image, rather bright",
"warm und weich, viel Raum (Hall) auf Stimme und Harmonien, Drums etwas zurück": "warm and soft, lots of space (reverb) on vocals and harmonies, drums a bit back",
"Rap-Stimme trocken und vorne, kräftiges 808, schmaleres Stereobild, laut": "rap vocal dry and upfront, strong 808, narrower stereo image, loud",
"Kick und Synths dominieren, starkes Pumpen (Sidechain), breit und hell, sehr laut": "kick and synths dominate, strong pumping (sidechain), wide and bright, very loud",
"Kick ist König, Bass und Akkorde pumpen mit, Hi-Hats präsent, clubtauglich laut": "kick is king, bass and chords pump along, present hi-hats, club-loud",
"Gitarren tragen, Bass eher Fundament als Sub, warme Mitten": "guitars carry it, bass as foundation rather than sub, warm mids",
# ---------- tracks ----------
"Spuren": "Tracks",
"Noch keine Stems geladen. Zieh deine Dateien oben rein oder probier die Demo.": "No stems loaded yet. Drop your files above or try the demo.",
"Klang": "Sound",
"Solo": "Solo",
"Mitte": "Center",
"Panorama": "Pan",
"links ↔ rechts": "left ↔ right",
"Low-Cut": "Low cut",
"nimmt Rumpeln und Matsch raus": "removes rumble and mud",
"Bass": "Bass",
"Shelf unter 150 Hz": "shelf below 150 Hz",
"Höhen": "Highs",
"Shelf über 6 kHz": "shelf above 6 kHz",
"Platz-EQ": "Space EQ",
"macht Platz für andere Spuren": "makes room for other tracks",
"EQ-Frequenz": "EQ frequency",
"wo abgesenkt wird": "where it is lowered",
"Kompressor": "Compressor",
"gleicht laut und leise aus": "evens out loud and quiet",
"De-Esser": "De-esser",
"zähmt scharfe S- und Z-Laute": "tames harsh S and Z sounds",
"Hall": "Reverb",
"Raum um die Spur": "space around the track",
"Echo": "Echo",
"Wiederholungen im Takt": "repeats in time",
# ---------- effects ----------
"Auto-Vocal-FX": "Auto vocal FX",
"Hall-Art": "Reverb type",
"Raum": "Room",
"Halle": "Hall",
"Hall-Lautstärke": "Reverb level",
"Echo im Takt": "Echo in time",
"1/8 punktiert": "1/8 dotted",
"Wiederholungen": "Repeats",
"Echo-Lautstärke": "Echo level",
"Sidechain (Kick duckt)": "Sidechain (kick ducks)",
"Was duckt": "What ducks",
"Nur Bass": "Bass only",
"Bass + Musik": "Bass + music",
"Alles außer Drums": "Everything but drums",
"Kick wird nach dem Laden gesucht.": "The kick is detected after loading.",
"Stärke": "Amount",
"Vocal-Effekte gesetzt. Fein einstellen kannst du sie bei der Spur unter „Klang“.": "Vocal effects set. Fine-tune them on the track under “Sound”.",
"Keine Kick- oder Drum-Spur gefunden, Sidechain nicht möglich.": "No kick or drum track found, sidechain not possible.",
"Wie viel Hall und Echo eine Spur bekommt, stellst du bei der Spur unter „Klang“ ein. Das Echo läuft automatisch im Takt des Songs. Tiefe Frequenzen werden aus Hall und Echo herausgefiltert, damit der Mix sauber bleibt.": "How much reverb and echo a track gets is set on the track under “Sound”. The echo automatically runs in time with the song. Low frequencies are filtered out of reverb and echo so the mix stays clean.",
# ---------- mastering ----------
"Mastering an": "Mastering on",
"Dynamisch · −16 LUFS": "Dynamic · −16 LUFS",
"Streaming · −14 LUFS": "Streaming · −14 LUFS",
"Laut · −9 LUFS": "Loud · −9 LUFS",
"Stil": "Style",
"Warm": "Warm",
"Ausgewogen": "Balanced",
"Offen": "Open",
"Klangbalance automatisch": "Auto tonal balance",
"Klangbalance automatisch angleichen": "Match tonal balance automatically",
"Ziel-Lautheit": "Target loudness",
"Spotify normalisiert auf −14 LUFS": "Spotify normalizes to −14 LUFS",
"Wärme": "Warmth",
"Bässe, Shelf bei 100 Hz": "lows, shelf at 100 Hz",
"Glanz": "Air",
"Höhen, Shelf ab 10 kHz": "highs, shelf from 10 kHz",
"Glue": "Glue",
"Bus-Kompressor 2:1, verklebt den Mix": "bus compressor 2:1, glues the mix",
"Mehrband": "Multiband",
"Bass, Mitten, Höhen getrennt verdichtet": "lows, mids, highs compressed separately",
"Sättigung": "Saturation",
"analoge Wärme, dezent": "analog warmth, subtle",
"Stereo-Breite": "Stereo width",
"Bass unter 100 Hz bleibt mono": "bass below 100 Hz stays mono",
"Referenz-Song laden": "Load reference song",
"Lade einen Profi-Song, der so klingen soll, wie du es willst. Lautheit, Klangbild und Breite werden daran angepasst.": "Load a pro song that sounds the way you want. Loudness, tone and width are matched to it.",
"An Referenz anpassen": "Match reference",
"Vorher hören": "Hear before",
"Vorher (aktiv)": "Before (active)",
"Vorher": "Before",
"Vorher: Original (klick für Nachher)": "Before: original (click for after)",
"Den Song im Original hören: ohne Mix und ohne Mastering. Nochmal klicken für Nachher.": "Hear the song in the original: no mix, no mastering. Click again for after.",
"Original ohne Mix und Mastering hören": "Hear the original without mix and mastering",
"Vorher: Du hörst die Spuren im Original, ohne Mix und ohne Mastering. Nochmal klicken für Nachher.": "Before: you are hearing the tracks in the original, without mix and mastering. Click again for after.",
"Nachher: mit Mix und Mastering.": "After: with mix and mastering.",
"Analysiere …": "Analyzing …",
"Analysiere Mix …": "Analyzing mix …",
"Analysiere Klangbalance …": "Analyzing tonal balance …",
"Analysiere Referenz …": "Analyzing reference …",
"Vergleiche mit Referenz …": "Comparing with reference …",
"Prüfe True Peak …": "Checking true peak …",
"Vorschau. Exakte Werte nach dem Export.": "Preview. Exact values after export.",
"Gemessen am fertigen Master.": "Measured on the finished master.",
"Ziel nicht ganz erreicht: Mix zu dynamisch für diese Lautheit, Limiter am Anschlag.": "Target not quite reached: the mix is too dynamic for this loudness, limiter maxed out.",
"Diese Datei konnte nicht gelesen werden. Versuch MP3 oder WAV.": "This file could not be read. Try MP3 or WAV.",
# ---------- video & lyrics ----------
"Video & Lyrics": "Video & Lyrics",
"MP4 für Reels, TikTok und YouTube, mit Visualizer, Cover und Lyrics.": "MP4 for Reels, TikTok and YouTube, with visualizer, cover and lyrics.",
"Format": "Format",
"9:16 Reels/TikTok": "9:16 Reels/TikTok",
"1:1 Feed": "1:1 Feed",
"16:9 YouTube": "16:9 YouTube",
"Titel": "Title",
"Songtitel": "Song title",
"Artist": "Artist",
"Cover-Bild": "Cover image",
"Bild wählen": "Choose image",
"optional, sonst dreht sich eine Platte": "optional, otherwise a record spins",
"Lyrics im Video": "Lyrics in video",
"DANVIEL-Branding (Name + Logo)": "DANVIEL branding (name + logo)",
"Eigenes Branding": "Your branding",
"z. B. dein Name, Label oder @handle": "e.g. your name, label or @handle",
"Logo": "Logo",
"Logo wählen": "Choose logo",
"optional, PNG mit transparentem Hintergrund passt am besten": "optional, a PNG with transparent background works best",
"Video erstellen (MP4)": "Create video (MP4)",
"Abbrechen": "Cancel",
"Tipp: Setz oben einen Ausschnitt und hak beim Export „Nur Ausschnitt“ an, dann wird nur dieser Teil zum Video, perfekt für Snippets.": "Tip: set a section above and tick “Section only” in the export, then only that part becomes the video, perfect for snippets.",
"Video-Vorschau": "Video preview",
"Lyrics": "Lyrics",
"Sprache automatisch": "Detect language",
"+ 2. Sprache (optional)": "+ 2nd language (optional)",
"Sprache 1": "Language 1",
"Zweite Sprache (optional)": "Second language (optional)",
"Deutsch": "German",
"Englisch": "English",
"Albanisch": "Albanian",
"Türkisch": "Turkish",
"Bosnisch": "Bosnian",
"Kroatisch": "Croatian",
"Serbisch": "Serbian",
"Spanisch": "Spanish",
"Französisch": "French",
"Italienisch": "Italian",
"Portugiesisch": "Portuguese",
"Polnisch": "Polish",
"Niederländisch": "Dutch",
"Rumänisch": "Romanian",
"Griechisch": "Greek",
"Russisch": "Russian",
"Ukrainisch": "Ukrainian",
"Arabisch": "Arabic",
"Genauigkeit": "Accuracy",
"Schnell (~80 MB)": "Fast (~80 MB)",
"Genauer (~250 MB)": "More accurate (~250 MB)",
"Lyrics erkennen": "Detect lyrics",
"Als Untertitel (SRT) speichern": "Save as subtitles (SRT)",
"Eigene Lyrics einfügen": "Add your own lyrics",
"Die Erkennung hört nur auf die Vocal-Spuren, deshalb funktioniert sie mit Stems viel besser als mit einem fertigen Song. Beim ersten Mal wird das KI-Modell geladen (einmalig, danach im Browser gespeichert).": "Detection only listens to the vocal tracks, so it works much better with stems than with a finished song. The first time, the AI model is downloaded (once, then stored in the browser).",
"Deinen Songtext einfügen": "Paste your lyrics",
"Füg hier deinen Songtext ein, eine Zeile pro Zeile, ohne Zeiten. Leere Zeilen und Überschriften wie [Hook] oder [Strophe 1] werden übersprungen.": "Paste your lyrics here, one line per line, without times. Empty lines and headings like [Hook] or [Verse 1] are skipped.",
"Automatisch an den Gesang anpassen": "Fit to the vocals automatically",
"Selbst mittippen (genauer)": "Tap along yourself (more accurate)",
"Automatisch: Das Programm erkennt, wo gesungen wird, und verteilt deine Zeilen darauf. Mittippen: Der Song läuft von vorne, und du drückst bei jeder Zeile genau dann die Leertaste, wenn sie beginnt. Nur ein paar Wörter falsch erkannt? Nicht alles neu einfügen: In der Liste unten läuft beim Abspielen die aktuelle Zeile mit, klick daneben auf ✎ (oder doppelt auf die Zeile) und korrigier sie direkt.": "Automatic: the program detects where singing happens and spreads your lines over it. Tap along: the song plays from the start and you press space exactly when each line begins. Only a few words misheard? No need to paste everything again: the current line follows along in the list below while playing, click ✎ next to it (or double-click the line) and fix it right there.",
"Drück die Leertaste genau, wenn die angezeigte Zeile anfängt. Vertippt? Mit ← gehst du eine Zeile zurück und der Song springt kurz davor.": "Press space exactly when the shown line begins. Mistake? ← goes back one line and the song jumps to just before it.",
"Klick hörbar": "Audible click",
"Jetzt! (Leertaste)": "Now! (space)",
"Eine zurück (←)": "One back (←)",
"Fertig (Esc)": "Done (Esc)",
"Zeile 1 von 1": "Line 1 of 1",
"Lyrics zum Mitlesen": "Lyrics to read along",
"Gesang läuft": "Vocals playing",
"Kein Gesang gefunden": "No vocals found",
"Kein Gesang mehr": "No more vocals",
"Gesang-Einsätze werden gesucht …": "Looking for vocal entries …",
"Keine Gesang-Einsätze erkannt.": "No vocal entries detected.",
"Mittippen abgebrochen.": "Tapping cancelled.",
"Fertig! Alle Zeilen getippt.": "Done! All lines tapped.",
"Zu früh, warte bis die Zeile wirklich anfängt.": "Too early, wait until the line really begins.",
"Füg zuerst deinen Songtext ein.": "Paste your lyrics first.",
"Lade zuerst den Song oder die Stems.": "Load the song or the stems first.",
"Lade KI-Modell für die Spracherkennung … (einmalig)": "Loading AI model for speech recognition … (once)",
"Höre die Vocals ab … das kann je nach Songlänge ein bis drei Minuten dauern.": "Listening to the vocals … this can take one to three minutes depending on song length.",
"Bereite Vocals vor …": "Preparing vocals …",
"Keine Lyrics erkannt. Prüf, ob die Vocal-Spuren dabei sind, oder wähl die Sprache von Hand.": "No lyrics detected. Check that the vocal tracks are included, or choose the language by hand.",
"Suche die Stellen, an denen gesungen wird …": "Looking for the places where there is singing …",
# ---------- cover studio ----------
"Cover-Studio: Cover mit KI erstellen und mit Schrift exportieren": "Cover studio: create a cover with AI and export it with text",
"Cover-Studio": "Cover studio",
"Cover-Style": "Cover style",
"Neutral (ohne persönlichen Style)": "Neutral (no personal style)",
"Eigenen Style erstellen": "Create your own style",
"Style löschen": "Delete style",
"Deinen eigenen Style erstellen, so hat jeder seinen eigenen Look": "Create your own style, so everyone has their own look",
"Kopier diesen Text und füg ihn in deine KI ein (ChatGPT, Gemini, Claude oder was du nutzt).": "Copy this text and paste it into your AI (ChatGPT, Gemini or whatever you use).",
"Beantworte ihre Fragen zu deinem Geschmack.": "Answer its questions about your taste.",
"Am Ende bekommst du einen Block von „===STYLE START===“ bis „===STYLE ENDE===“. Den fügst du unten ein.": "At the end you get a block from “===STYLE START===” to “===STYLE END===”. Paste it below.",
"Text kopieren": "Copy text",
"Hier den Block aus deiner KI einfügen (===STYLE START=== … ===STYLE ENDE===)": "Paste the block from your AI here (===STYLE START=== … ===STYLE END===)",
"Style speichern": "Save style",
"Deine Styles werden nur in diesem Browser gespeichert und landen nicht in Projekt-Dateien, die du weitergibst.": "Your styles are only stored in this browser and never end up in project files you share.",
"Bildidee (optional)": "Image idea (optional)",
"z. B. altes Telefon im Morgenlicht": "e.g. old phone in morning light",
"Musik-Style (optional)": "Music style (optional)",
"z. B. R&B, nachts, warme Synths": "e.g. R&B, night, warm synths",
"Widmung (optional)": "Dedication (optional)",
"nur wenn gewünscht": "only if wanted",
"Prompt-Vorlage des Styles ansehen / anpassen": "View / edit the style's prompt template",
"Platzhalter: {titel} {artist} {stimmung} {tempo} {tonart} {lyrics} {bildidee} {musikstil} {widmung}": "Placeholders: {titel} (title) {artist} {stimmung} (mood) {tempo} {tonart} (key) {lyrics} {bildidee} (image idea) {musikstil} (music style) {widmung} (dedication)",
"Bild-KI": "Image AI",
"Kostenlos (Pollinations, Flux)": "Free (Pollinations, Flux)",
"ChatGPT / eigene KI (Prompt kopieren, Bild hier laden)": "ChatGPT / your own AI (copy prompt, load image here)",
"OpenAI mit eigenem API-Schlüssel": "OpenAI with your own API key",
"Pollinations-Schlüssel (optional, kostenlos auf enter.pollinations.ai)": "Pollinations key (optional, free at enter.pollinations.ai)",
"Fertiges Bild laden": "Load finished image",
"sk-… (OpenAI API-Schlüssel)": "sk-… (OpenAI API key)",
"Qualität": "Quality",
"Schnell · ~1 Cent": "Fast · ~1 cent",
"Gut · ~3 Cent": "Good · ~3 cents",
"Beste · ~13 Cent": "Best · ~13 cents",
"Schlüssel in diesem Browser merken": "Remember key in this browser",
"Cover erstellen": "Create cover",
"Prompt kopieren": "Copy prompt",
"Schließen": "Close",
"Verwendeter Bild-Prompt": "Image prompt used",
"Fertiges Cover mit Schrift": "Finished cover with text",
"Cover-Vorschau mit Schrift": "Cover preview with text",
"Tipp: Titel und Artist kannst du im Bild mit der Maus (oder dem Finger) frei verschieben. Ein Bild aus ChatGPT kannst du einfach hier reinziehen oder kopieren und mit Strg+V einfügen.": "Tip: drag the title and artist anywhere in the image with your mouse (or finger). You can simply drag an image from ChatGPT in here, or copy it and paste with Ctrl+V.",
"Unten": "Bottom",
"Oben": "Top",
"Unten links": "Bottom left",
"Oben links": "Top left",
"Frei (selbst verschoben)": "Free (moved by you)",
"Ohne Schrift": "No text",
"Schriftart": "Font",
"Automatisch (nach Stimmung)": "Automatic (by mood)",
"Elegant (Serif)": "Elegant (serif)",
"Elegant kursiv": "Elegant italic",
"Klassisch (Cinzel)": "Classic (Cinzel)",
"Markant (Schmal)": "Bold (narrow)",
"Plakat (Bebas)": "Poster (Bebas)",
"Fett (Anton)": "Heavy (Anton)",
"Modern breit": "Modern wide",
"Klar (Sans)": "Clean (sans)",
"Handschrift (Marker)": "Handwriting (marker)",
"Handschrift (fein)": "Handwriting (fine)",
"Gotisch (Drill / Rap)": "Gothic (drill / rap)",
"Titel-Größe": "Title size",
"Artist-Größe": "Artist size",
"Schriftfarbe": "Text color",
"Weiß": "White",
"Schwarz": "Black",
"Farbe aus dem Cover": "Color from the cover",
"Gold": "Gold",
"Schrift-Effekte": "Text effects",
"Schatten": "Shadow",
"Dunkler Verlauf dahinter": "Dark gradient behind",
"Bild-Filter": "Image filters",
"Rand": "Edges",
"links heller · rechts dunkler": "left lighter · right darker",
"Helligkeit": "Brightness",
"Kontrast": "Contrast",
"Farbe": "Color",
"links blasser · rechts kräftiger": "left paler · right stronger",
"Körnung (Film)": "Grain (film)",
"Look": "Look",
"Schwarz-Weiß": "Black & white",
"Alles zurücksetzen": "Reset all",
"Cover als PNG speichern (3000×3000)": "Save cover as PNG (3000×3000)",
"Titel, Künstler und Widmung werden exakt so gesetzt, wie du sie eingetippt hast.": "Title, artist and dedication are set exactly as you typed them.",
"Kostenlos, ohne Anmeldung. Etwa ein Bild alle 15 Sekunden. Wenn der Server ausgelastet ist, hilft ein kostenloser Schlüssel von enter.pollinations.ai oder der Weg über ChatGPT.": "Free, no sign-up. About one image every 15 seconds. If the server is busy, a free key from enter.pollinations.ai or the ChatGPT route helps.",
"Kostet bei OpenAI je nach Qualität ca. 1–13 Cent pro Bild, abgerechnet über deinen OpenAI-Account.": "Costs about 1–13 cents per image at OpenAI depending on quality, billed to your OpenAI account.",
"1. „Prompt kopieren“ klicken. 2. In ChatGPT (oder Gemini …) einfügen und das Bild erstellen lassen. 3. Bild speichern und hier mit „Fertiges Bild laden“ öffnen. Titel und Name setzt das Programm danach exakt.": "1. Click “Copy prompt”. 2. Paste it into ChatGPT (or Gemini …) and let it create the image. 3. Save the image and open it here with “Load finished image”. The program then sets title and name exactly.",
"Prompt kopiert. Jetzt in ChatGPT einfügen, Bild erstellen lassen, speichern und hier mit „Fertiges Bild laden“ öffnen.": "Prompt copied. Now paste it into ChatGPT, let it create the image, save it and open it here with “Load finished image”.",
"Kopieren ging nicht automatisch. Der Prompt ist unten markiert, kopier ihn mit Strg+C.": "Copying didn't work automatically. The prompt is selected below, copy it with Ctrl+C.",
"Bild übernommen. Unten siehst du das fertige Cover mit Schrift, „Cover als PNG speichern“ exportiert es in 3000 × 3000.": "Image applied. Below you see the finished cover with text, “Save cover as PNG” exports it at 3000 × 3000.",
"Bild übernommen. Unten siehst du das fertige Cover mit Schrift.": "Image applied. Below you see the finished cover with text.",
"Dieses Bild konnte nicht geöffnet werden.": "This image could not be opened.",
"Dieses Bild konnte nicht gelesen werden.": "This image could not be read.",
"Erstelle Cover … das dauert meist 10–40 Sekunden.": "Creating cover … this usually takes 10–40 seconds.",
"Fertig. Klick auf ein Bild, um es zu nehmen. „Cover erstellen“ macht eine neue Variante.": "Done. Click an image to use it. “Create cover” makes a new variation.",
"Fertig. Klick auf ein Bild, um es zu nehmen. „Cover erstellen“ macht eine neue Variante. Hinweis: Der kostenlose Server setzt ein kleines Wasserzeichen, und manchmal malt die KI trotzdem kleine, unleserliche Buchstaben ins Bild. Dann einfach nochmal erstellen. Für Premium-Qualität ohne Wasserzeichen: ChatGPT oder einen eigenen OpenAI-Schlüssel wählen.": "Done. Click an image to use it. “Create cover” makes a new variation. Note: the free server adds a small watermark, and sometimes the AI still paints small unreadable letters into the image. Just create it again. For premium quality without a watermark: choose ChatGPT or your own OpenAI key.",
"Hole das Bild …": "Fetching the image …",
"Die Seite erlaubt nicht, das Bild direkt zu übernehmen. So geht's trotzdem: In ChatGPT Rechtsklick auf das Bild → „Bild kopieren“ und hier Strg+V drücken. Oder das Bild speichern und die Datei reinziehen.": "The site doesn't allow taking the image directly. Here's how it still works: in ChatGPT right-click the image → “Copy image” and press Ctrl+V here. Or save the image and drop the file in.",
"Der Cover-Generator funktioniert nur in der heruntergeladenen Programmdatei, weil das Bild aus dem Internet kommt.": "The cover generator only works in the downloaded program file, because the image comes from the internet.",
"Keine Verbindung zum Bild-Server. Prüf dein Internet und versuch es nochmal.": "No connection to the image server. Check your internet and try again.",
"Bitte einen gültigen OpenAI API-Schlüssel eintragen (beginnt mit sk-).": "Please enter a valid OpenAI API key (starts with sk-).",
"OpenAI hat kein Bild geliefert.": "OpenAI didn't return an image.",
"Der Bild-Server hat kein Bild geliefert.": "The image server didn't return an image.",
"Kopiert. Jetzt in deine KI einfügen.": "Copied. Now paste it into your AI.",
"Text ist markiert, kopier ihn mit Strg+C.": "Text is selected, copy it with Ctrl+C.",
"Das sieht noch nicht nach einem Style-Block aus. Füg den ganzen Block aus deiner KI ein.": "That doesn't look like a style block yet. Paste the whole block from your AI.",
"Style gelöscht.": "Style deleted.",
"Gespeichert in 3000 × 3000 px.": "Saved at 3000 × 3000 px.",
"Eigenes Cover": "Own cover",
"KI-Cover": "AI cover",
# ---------- export / release / project ----------
"Export": "Export",
"Noch nichts ausgewählt.": "Nothing selected yet.",
"Im Export:": "In the export:",
"Dateiname": "File name",
"Mix": "Mix",
"MP3 · 320 kbps": "MP3 · 320 kbps",
"MP3 · 192 kbps": "MP3 · 192 kbps",
"WAV · 24 bit (Studio)": "WAV · 24 bit (studio)",
"WAV · 16 bit": "WAV · 16 bit",
"M4A · AAC 256 kbps": "M4A · AAC 256 kbps",
"M4A · AAC (in diesem Browser nicht verfügbar)": "M4A · AAC (not available in this browser)",
"Übersteuern verhindern": "Prevent clipping",
"Mix exportieren": "Export mix",
"Fade-In": "Fade in",
"Fade-Out": "Fade out",
"Nur Ausschnitt": "Section only",
"Kick als MIDI": "Kick as MIDI",
"Die erkannten Kick-Schläge und das Tempo als MIDI-Datei, zum Weiterbauen in deiner DAW": "The detected kick hits and tempo as a MIDI file, to keep building in your DAW",
"Stems einzeln exportieren (ZIP)": "Export stems separately (ZIP)",
"Jede eingeschaltete Spur als eigene WAV-Datei, mit deiner Lautstärke und Geschwindigkeit": "Each active track as its own WAV file, with your level and speed",
"Release": "Release",
"Release-Check": "Release check",
"Release-Paket erstellen": "Create release package",
"inkl. Shorts-Video der Hook (dauert länger)": "incl. Shorts video of the hook (takes longer)",
"Release-Paket: Master (WAV 24 bit + MP3), Instrumental, Acapella, Cover 3000 px, Lyrics als LRC (synchronisierte Lyrics für Spotify/Apple über deinen Distributor) und SRT, Shorts-Video und das Prüfprotokoll, alles in einer ZIP.": "Release package: master (WAV 24 bit + MP3), instrumental, acapella, cover 3000 px, lyrics as LRC (synced lyrics for Spotify/Apple via your distributor) and SRT, Shorts video and the check report, all in one ZIP.",
"Versionen": "Versions",
"Main": "Main",
"Instrumental": "Instrumental",
"TV-Mix": "TV mix",
"Acapella": "Acapella",
"Vocal Up +1 dB": "Vocal up +1 dB",
"Versionen exportieren (ZIP)": "Export versions (ZIP)",
"Wähl mindestens eine Version aus.": "Choose at least one version.",
"Projekt speichern (ZIP)": "Save project (ZIP)",
"Alle Spuren, Einstellungen, Cover, Logo, Lyrics und Hook in einer ZIP-Datei": "All tracks, settings, cover, logo, lyrics and hook in one ZIP file",
"Projekt laden": "Load project",
"„Projekt speichern“ packt alles in eine ZIP-Datei: Spuren, Einstellungen, Cover, Logo, Lyrics und Hook. Genau diese ZIP weiterschicken. Mit „Projekt laden“ (oder einfach reinziehen) ist beim Empfänger alles wieder da.": "“Save project” packs everything into one ZIP file: tracks, settings, cover, logo, lyrics and hook. Send exactly this ZIP. With “Load project” (or simply dropping it in) everything is back for the recipient.",
"Projekt geladen.": "Project loaded.",
"Diese Datei ist kein DANVIEL-Studio-Projekt.": "This file is not a DANVIEL Studio project.",
"Diese Datei konnte nicht gelesen werden.": "This file could not be read.",
"Das ist eine alte Einstellungs-Datei (.json) ohne Spuren, damit kann man das Projekt nicht komplett öffnen. Bitte den Absender, das Projekt nochmal mit „Projekt speichern (ZIP)“ zu speichern und die ZIP-Datei zu schicken. Alternativ: jetzt die passenden Stems laden, dann werden die Einstellungen übernommen.": "This is an old settings file (.json) without tracks, so the project can't be opened completely. Ask the sender to save the project again with “Save project (ZIP)” and send the ZIP file. Alternatively: load the matching stems now and the settings will be applied.",
"ZIP-Unterstützung fehlt (Internet nötig beim ersten Öffnen).": "ZIP support is missing (internet needed on first open).",
"ZIP-Unterstützung konnte nicht geladen werden. Entpack die ZIP und zieh die Einzeldateien rein.": "ZIP support could not be loaded. Unzip it and drop the single files in.",
"Packe ZIP …": "Packing ZIP …",
"Keine Spur eingeschaltet. Schalte mindestens eine Spur an, um zu exportieren.": "No track switched on. Switch on at least one track to export.",
"Mische Spuren …": "Mixing tracks …",
"Kodiere …": "Encoding …",
"Der MP3-Encoder konnte nicht geladen werden (Internet nötig). Wähl WAV oder versuch es mit Verbindung erneut.": "The MP3 encoder could not be loaded (internet needed). Choose WAV or try again with a connection.",
"Dieser Browser kann kein AAC/M4A erzeugen. Nimm Chrome oder Edge unter Windows/Mac, oder wähl MP3 oder WAV.": "This browser can't create AAC/M4A. Use Chrome or Edge on Windows/Mac, or choose MP3 or WAV.",
"Speichern abgebrochen.": "Saving cancelled.",
"Speichern ist hier nicht möglich. Lade dir die Programmdatei (DANVIEL-Studio.html) herunter und öffne sie im Browser.": "Saving isn't possible here. Download the program file (DANVIEL-Studio.html) and open it in your browser.",
"Keine Kick- oder Drum-Spur gefunden, MIDI nicht möglich.": "No kick or drum track found, MIDI not possible.",
"Release-Check: berechne den fertigen Song …": "Release check: rendering the finished song …",
"Release-Check: prüfe …": "Release check: checking …",
"Release-Check fertig.": "Release check done.",
"Alles grün, bereit für den Release!": "All green, ready for release!",
"Release-Paket abgebrochen.": "Release package cancelled.",
"Release-Paket: Master …": "Release package: master …",
"Release-Paket: MP3 …": "Release package: MP3 …",
"Release-Paket: Cover …": "Release package: cover …",
"Release-Paket: Shorts-Video …": "Release package: Shorts video …",
"Release-Paket: packe ZIP …": "Release package: packing ZIP …",
"Master als WAV (24 bit)": "master as WAV (24 bit)",
"Master als MP3 (320 kbps)": "master as MP3 (320 kbps)",
"Cover 3000 × 3000": "cover 3000 × 3000",
"Lyrics als LRC und SRT": "lyrics as LRC and SRT",
"Shorts-Video 9:16 der Hook": "Shorts video 9:16 of the hook",
"Kein Clipping": "No clipping",
"Nirgends hart abgeschnitten.": "Nothing hard-clipped anywhere.",
"An diesen Stellen ist das Signal abgeschnitten, das klingt kratzig. Pegel runter oder Limiter (Mastering) nutzen.": "The signal is clipped at these spots, which sounds scratchy. Lower the level or use the limiter (mastering).",
"Passt für Streaming (Spotify normalisiert auf −14 LUFS).": "Fits streaming (Spotify normalizes to −14 LUFS).",
"Sehr laut. Spotify, YouTube und Apple regeln das auf etwa −14 LUFS runter, mehr Lautheit bringt dort also nichts, kostet aber Dynamik.": "Very loud. Spotify, YouTube and Apple turn this down to about −14 LUFS, so more loudness gains nothing there but costs dynamics.",
"Recht leise. Für Streaming ist ein Master um −14 LUFS üblich. Schalt das Mastering ein oder wähl „Streaming“.": "Rather quiet. Around −14 LUFS is usual for streaming. Switch on mastering or choose “Streaming”.",
"Genug Luft nach oben, verzerrt beim Streaming nicht.": "Enough headroom, won't distort on streaming.",
"Übersteuert. Beim Umwandeln in MP3/AAC entstehen hörbare Verzerrungen. Mastering einschalten oder leiser exportieren.": "Clipping. Converting to MP3/AAC will cause audible distortion. Switch on mastering or export quieter.",
"Auf Handy-Lautsprechern und in Clubs löschen sich Teile gegenseitig aus. Stereo-Breite verringern.": "On phone speakers and in clubs, parts cancel each other out. Reduce stereo width.",
"In Mono wird es spürbar leiser oder dünner. Stereo-Breite etwas reduzieren.": "In mono it gets noticeably quieter or thinner. Reduce stereo width a little.",
"Bass mono": "Bass mono",
"Der tiefe Bereich ist mittig, so wie es sein soll.": "The low end is centered, as it should be.",
"Bass ist breit (Stereo unter 120 Hz)": "Bass is wide (stereo below 120 Hz)",
"Profis halten den Bass mono, sonst verliert er auf Club-Anlagen Druck. Im Mastering bleibt der Bass mono, prüf sonst die Stems.": "Pros keep the bass mono, otherwise it loses punch on club systems. Mastering keeps the bass mono, otherwise check the stems.",
"Gleichspannungs-Versatz (DC)": "DC offset",
"Die Wellenform ist verschoben. Ein Low-Cut im Mastering behebt das.": "The waveform is shifted. A low cut in mastering fixes this.",
"Start ohne lange Stille": "Start without long silence",
"Streaming-Hörer springen bei langer Stille oft weiter. Kürzen oder einen Ausschnitt setzen.": "Streaming listeners often skip on long silence. Trim it or set a section.",
"Lange Stille am Schluss. Ein Fade-Out oder Kürzen wirkt professioneller.": "Long silence at the end. A fade out or trimming sounds more professional.",
"Standard-Qualität für alle Plattformen.": "Standard quality for all platforms.",
"Unter 44,1 kHz, manche Distributoren lehnen das ab.": "Below 44.1 kHz, some distributors reject this.",
# ---------- video messages ----------
"Dieser Browser kann keine Videos erzeugen. Nimm die aktuelle Version von Chrome oder Edge.": "This browser can't create videos. Use the current version of Chrome or Edge.",
"H.264-Video wird von diesem Browser nicht unterstützt. Nimm Chrome oder Edge.": "H.264 video isn't supported by this browser. Use Chrome or Edge.",
"Der Video-Encoder hat keine Konfiguration geliefert.": "The video encoder returned no configuration.",
"Video: berechne Audio …": "Video: rendering audio …",
"Video: analysiere Frequenzen …": "Video: analyzing frequencies …",
"Video: kodiere Ton …": "Video: encoding audio …",
"Video: baue MP4 …": "Video: building MP4 …",
"Video abgebrochen.": "Video cancelled.",
# ---------- split ----------
"Lese den Song …": "Reading the song …",
"Lade die Trenn-KI (einmalig, ca. 170 MB) …": "Loading the separation AI (once, about 170 MB) …",
"Starte die Trenn-KI …": "Starting the separation AI …",
"Trenn-KI aus dem Speicher geladen.": "Separation AI loaded from storage.",
"Zerlege in Stems …": "Splitting into stems …",
"Zerlege in Stems über den Prozessor (mehrere Kerne) … das dauert je nach Rechner und Songlänge ein paar Minuten. Lass den Tab dabei offen.": "Splitting into stems on the processor (several cores) … this takes a few minutes depending on your computer and song length. Keep the tab open.",
"Mehrere Threads gingen nicht, nehme 1 Thread:": "Several threads failed, using 1 thread:",
"Zerlege in Stems über den Prozessor … das kann je nach Rechner und Songlänge 10–30 Minuten dauern. Lass den Tab dabei offen.": "Splitting into stems on the processor … this can take 10–30 minutes depending on your computer and song length. Keep the tab open.",
"Prüfe das Ergebnis der KI …": "Checking the AI result …",
"Die Grafikkarten-Berechnung hat ein fehlerhaftes Ergebnis geliefert (nichts abgespielt). Zweiter Versuch über den Prozessor, das dauert länger, ist aber zuverlässig …": "The graphics card calculation returned a faulty result (nothing played). Second attempt on the processor, it takes longer but is reliable …",
"Das Zerlegen funktioniert nur in der heruntergeladenen Programmdatei (DANVIEL-Studio.html im Browser geöffnet), weil die KI aus dem Internet geladen werden muss.": "Splitting only works in the downloaded program file (DANVIEL-Studio.html opened in the browser), because the AI has to be loaded from the internet.",
"Die Lyrics-Erkennung funktioniert nur in der heruntergeladenen Programmdatei (DANVIEL-Studio.html im Browser geöffnet), weil das KI-Modell aus dem Internet geladen werden muss.": "Lyrics detection only works in the downloaded program file (DANVIEL-Studio.html opened in the browser), because the AI model has to be loaded from the internet.",
# ---------- files ----------
"Lade Dateien …": "Loading files …",
"Keine Audiodateien gefunden.": "No audio files found.",
"Song geladen.": "Song loaded.",
"Erzeuge Demo-Stems …": "Creating demo stems …",
"Demo geladen. Drück Play oder probier den Auto-Mix.": "Demo loaded. Press play or try Auto-Mix.",
"Rückgängig gemacht.": "Undone.",
# ---------- footer / misc ----------
"Mehr Musik von": "More music by",
"Dir gefällt DANVIEL Studio? Hör in meine Songs rein und folg mir, das hilft mir sehr.": "Like DANVIEL Studio? Check out my songs and follow me, it helps me a lot.",
"Tipp: Leertaste = Play/Pause. S beim Kanal = Solo (nur diese Spur hören, ändert den Export nicht).": "Tip: space = play/pause. S on a channel = solo (hear only this track, doesn't change the export).",
"Fehler-Log speichern": "Save error log",
"Speichert ein Protokoll aller Schritte und Fehler als Textdatei, zum Weiterschicken bei Problemen": "Saves a log of all steps and errors as a text file, to send along if there are problems",
"· entwickelt von": "· made by",
"Meldung schließen": "Close message",
"Nach oben zum Player": "Back up to the player",
"Mix · Master · Release · v13.5": "Mix · Master · Release · v13.5",
"Los geht's": "Let's go",
"Mein Projekt": "My project",
# collapsible titles
"Dateien laden": "Load files",
"Tempo & Tonart": "Tempo & key",
"Ausschnitt / Hook": "Section / hook",
"Auto-Mix & Genre": "Auto-Mix & genre",
# file name parts
"Projekt": "Project",
"Release-Paket": "Release package",
"Einstellungen": "Settings",
"Stems": "Stems",
"Versionen.zip": "Versions.zip",
}

# collapsible panel titles: "X zuklappen" / "X aufklappen"
for de, en in [("Dateien laden","Load files"),("Tempo & Tonart","Tempo & key"),("Ausschnitt / Hook","Section / hook"),("Auto-Mix & Genre","Auto-Mix & genre"),("Spuren","Tracks"),("Effekte","Effects"),("Mastering","Mastering"),("Video & Lyrics","Video & Lyrics"),("Export","Export")]:
    EXACT[de+" zuklappen"] = "Collapse "+en.lower() if en not in ("Auto-Mix & genre","Video & Lyrics") else "Collapse "+en
    EXACT[de+" aufklappen"] = "Expand "+en.lower() if en not in ("Auto-Mix & genre","Video & Lyrics") else "Expand "+en

R = r"(.+?)"
PAT = [
# genre
[r"^Erkannt: (.+?) \((.+)\)\. So wird gemischt: (.+)\. Passt es nicht, wähl das Genre einfach selbst\.$", "Detected: $1 ($2). Mixing approach: $3. If it doesn't fit, just choose the genre yourself."],
[r"^(Pop|R&B|Hip-Hop / Trap|EDM / Big Room|House|Rock / Band): (.+)\.$", "$1: $2."],
[r"^Auto-Mix fertig \((.+?)\): Lautstärken, Panorama, EQ, Effekte, Sidechain und Mastering \((.+?) LUFS\) sind auf (.+?) abgestimmt\. Drück Play\.$", "Auto-Mix done ($1): levels, panning, EQ, effects, sidechain and mastering ($2 LUFS) are tuned for $3. Press play."],
[r"^Auto-Mix: (.+?) · messe Stems …$", "Auto-Mix: $1 · measuring stems …"],
[r"^Auto-Mix erledigt · Genre: (.+)$", "Auto-Mix done · genre: $1"],
[r"^Auto-Mix erledigt$", "Auto-Mix done"],
[r"Kick auf jedem Schlag", "kick on every beat"],
[r"Kick nicht durchgehend", "kick not continuous"],
[r"808 gefunden", "808 found"],
[r"viel Sub-Bass", "lots of sub bass"],
[r"wenig Sub-Bass", "little sub bass"],
[r"normaler Bass-Anteil", "normal bass share"],
[r"\bGitarren\b", "guitars"],
# auto log / track tags
[r"(^|· )Mitte(?= ·|$)", "$1Center"],
[r"\bKompressor (\d)", "Compressor $1"],
[r"\bKomp (\d)", "Comp $1"],
[r"\bHall (\d+) %", "Reverb $1 %"],
[r"\bkein Low-Cut\b", "no low cut"],
[r"\(schon Stereo\)", "(already stereo)"],
[r"\bLow-Cut (\d+) Hz", "Low cut $1 Hz"],
[r"^(.+) im Mix$", "$1 in the mix"],
[r"^Lautstärke (.+)$", "Volume $1"],
[r"^Platz (-?[\d.]+) dB @", "Space $1 dB @"],
[r"(-?[\d.]+) dB bei (\S+) \((.+?)\)", "$1 dB at $2 ($3)"],
[r"Platz für (.+)", "room for $1"],
# counters / loading
[r"^(\d+) von (\d+)$", "$1 of $2"],
[r"^(\d+) Stems geladen\.", "$1 stems loaded."],
[r"^(\d+) Stems geladen, Projekt-Einstellungen übernommen\.$", "$1 stems loaded, project settings applied."],
[r"^Dekodiere (\d+)/(\d+): (.+)$", "Decoding $1/$2: $3"],
[r"^Entpacke (.+) …$", "Unpacking $1 …"],
[r"^Berechne Tempo und Tonart … (\d+)/(\d+)$", "Calculating tempo and key … $1/$2"],
[r"^Berechne Vocals in Originaltonhöhe … (\d+)/(\d+)$", "Calculating vocals at original pitch … $1/$2"],
[r"^Keine Audiodateien gefunden\.(.*)$", "No audio files found.$1"],
[r" In der ZIP liegen: (.+?)\.", " The ZIP contains: $1."],
[r" Unterstützt werden MP3, WAV, FLAC, OGG, M4A und ZIPs oder Ordner mit solchen Dateien\.", " Supported: MP3, WAV, FLAC, OGG, M4A and ZIPs or folders with such files."],
[r"^„(.+)“ ließ sich nicht entpacken\. Ist die ZIP vollständig heruntergeladen\?$", "“$1” could not be unpacked. Is the ZIP fully downloaded?"],
[r"^„(.+)“ konnte nicht gelesen werden\. Das Format wird von diesem Browser nicht unterstützt, wandle die Datei am besten in MP3 oder WAV um\.$", "“$1” could not be read. This browser doesn't support the format, best convert the file to MP3 or WAV."],
[r" Deine Einstellungen vom letzten Mal sind gespeichert: „↺ Letzte Einstellungen“ holt sie zurück\.", " Your settings from last time are saved: “↺ Last settings” brings them back."],
[r" Die restlichen (\d+) wurden im Abstand von 3 s angehängt\.", " The remaining $1 were appended 3 s apart."],
# tempo / key
[r"^BPM · Original (\d+)$", "BPM · original $1"],
[r"^(\d+) % · Original$", "$1 % · original"],
[r"^([+-]?[\d.]+) Halbtöne$", "$1 semitones"],
[r" · ([+-]?[\d.]+) Halbtöne", " · $1 semitones"],
[r"([+-]?[\d.,]+) Halbtöne", "$1 semitones"],
[r"zwischen zwei Tönen \((.+?) HT\)", "between two notes ($1 st)"],
[r" · Tonhöhe bleibt", " · pitch stays"],
[r" · Original (.+)$", " · original $1"],
[r"^(.+)-Moll$", "$1 minor"],
[r"^(.+)-Dur$", "$1 major"],
[r"^Fertig: (\d+) % Tempo, (.+?) semitones\.$", "Done: $1 % tempo, $2 semitones."],
[r"^Vocals bleiben in Originaltonhöhe, der Beat ist (.+?) semitones (tiefer|höher)\.", "Vocals stay at original pitch, the beat is $1 semitones $2."],
[r" tiefer\.", " lower."],[r" höher\.", " higher."],
[r" Bei großen Tonart-Sprüngen klingen Stimmen schnell künstlich\.", " With big key jumps voices quickly sound artificial."],
[r" Achtung: Weil nur der Beat seine Tonart ändert, können Gesang und Beat schief zueinander klingen\. Hör genau hin\.", " Careful: because only the beat changes key, vocals and beat can sound out of tune with each other. Listen closely."],
[r" Soll alles in der Originaltonart bleiben, nimm", " To keep everything in the original key, use"],
# section / hook
[r"^Hook gefunden bei (.+?)\. „Nur Ausschnitt“ ist angehakt, Export und Video nehmen jetzt nur diesen Teil \(mit kurzem Fade-In und Fade-Out\)\. Verschieb ihn, wenn du einen anderen Teil willst\. Zum Feintuning mit dem Mausrad über der Wellenform reinzoomen\.$", "Hook found at $1. “Section only” is ticked, export and video now use only this part (with a short fade in and out). Move it if you want a different part. For fine-tuning, zoom in with the mouse wheel over the waveform."],
[r"^Hook-Suche fehlgeschlagen: (.+)$", "Hook search failed: $1"],
[r"^Hook (\d+)s$", "Hook $1s"],
[r"^Ausschnitt (\d+)s$", "Section $1s"],
[r"^Ausschnitt (.+)$", "Section $1"],
# sidechain
[r"^(\d+) Kicks erkannt in „(.+)“\. Die gewählten Spuren werden bei jedem Kick kurz leiser\.$", "$1 kicks detected in “$2”. The chosen tracks briefly get quieter on every kick."],
[r"^Kick (\d+) BPM$", "Kick $1 BPM"],
# exports
[r"^Exportiere Stem (\d+)/(\d+): (.+)$", "Exporting stem $1/$2: $3"],
[r"^Kodiere MP3 … (\d+) %$", "Encoding MP3 … $1 %"],
[r"^Mastering: Limiter-Durchgang (\d+) …$", "Mastering: limiter pass $1 …"],
[r"^Fertig: (.+) \(([\d.]+) MB\) liegt in deinen Downloads\.$", "Done: $1 ($2 MB) is in your downloads."],
[r"^Gespeichert: (.+) \(in einer ZIP\)\.$", "Saved: $1 (in a ZIP)."],
[r"^Gespeichert: (.+)$", "Saved: $1"],
[r"^Speichern fehlgeschlagen: (.+)$", "Saving failed: $1"],
[r"^Versionen: berechne Main …$", "Versions: rendering main …"],
[r"^Versionen: (.+?) \((\d+)/(\d+)\) …$", "Versions: $1 ($2/$3) …"],
[r" Übersprungen \(keine Vocal-Spur erkannt\): (.+)\.", " Skipped (no vocal track detected): $1."],
[r"^Packe Spur (\d+) von (\d+): (.+)$", "Packing track $1 of $2: $3"],
[r"^Projekt gespeichert: (.+) \(([\d.]+) MB\)\. Genau diese ZIP-Datei weiterschicken, der Empfänger lädt sie mit „Projekt laden“ und hat alles\.$", "Project saved: $1 ($2 MB). Send exactly this ZIP file, the recipient loads it with “Load project” and has everything."],
[r"^Projekt-Paket fehlgeschlagen: (.+)$", "Project package failed: $1"],
[r"^Projekt übernommen für (\d+) von (\d+) Spuren \(Namen müssen übereinstimmen\)\.$", "Project applied to $1 of $2 tracks (names must match)."],
[r"^(.+) braucht mehrere Spuren\. Du hast einen fertigen Song als eine Spur geladen, der ist schon gemischt\. Zum Mischen lad die einzelnen Stems, oder nutz direkt das Mastering\.$", "$1 needs several tracks. You loaded a finished song as one track, it's already mixed. To mix, load the individual stems, or use mastering directly."],
# release check
[r"^Lautheit (-?[\d.]+) LUFS$", "Loudness $1 LUFS"],
[r"^True Peak (-?[\d.]+) dBTP$", "True peak $1 dBTP"],
[r"^Knapp\. Empfohlen ist unter (-?[\d.]+) dBTP, damit beim Streaming nichts verzerrt\.$", "Close. Below $1 dBTP is recommended so nothing distorts on streaming."],
[r"^(\d+)× hartes Clipping$", "$1× hard clipping"],
[r"^Mono-kompatibel \(Korrelation (.+)\)$", "Mono compatible (correlation $1)"],
[r"^Mono: Phasenprobleme \(Korrelation (.+)\)$", "Mono: phase problems (correlation $1)"],
[r"^Mono: −(.+) dB \(Korrelation (.+)\)$", "Mono: −$1 dB (correlation $2)"],
[r"^Klingt auch auf einem Handy-Lautsprecher vollständig \(nur (.+) dB leiser in Mono\)\.$", "Sounds complete even on a phone speaker (only $1 dB quieter in mono)."],
[r"^([\d.]+) s Stille am Anfang$", "$1 s silence at the start"],
[r"^([\d.]+) s bis zum ersten Ton\.$", "$1 s to the first sound."],
[r"^([\d.]+) s Stille am Ende$", "$1 s silence at the end"],
[r"^Format (.+) kHz, Länge (.+)$", "Format $1 kHz, length $2"],
[r"^(\d+) Problem(e?) und (\d+) Hinweis(e?)\. Bitte vor dem Release beheben\.$", "$1 problem(s) and $3 note(s). Please fix before release."],
[r"^Bereit, mit (\d+) Hinweis(en)?\.$", "Ready, with $1 note(s)."],
[r"^Release-Check fehlgeschlagen: (.+)$", "Release check failed: $1"],
[r"^Release-Paket: (.+) …$", "Release package: $1 …"],
[r"^Release-Paket fehlgeschlagen: (.+)$", "Release package failed: $1"],
[r"^Im Paket: (.+)\.$", "In the package: $1."],
[r"Release-Check", "release check"],
# video
[r"^Video: Bild (\d+) von (\d+) \((\d+) %\) …$", "Video: frame $1 of $2 ($3 %) …"],
[r"^Video fehlgeschlagen: (.+)$", "Video failed: $1"],
[r" Hinweis: Dieser Browser kann kein AAC, der Ton ist Opus\. Für Instagram besser Chrome/Edge unter Windows oder Mac nehmen\.", " Note: this browser can't do AAC, the audio is Opus. For Instagram better use Chrome/Edge on Windows or Mac."],
# lyrics
[r"^Lade KI-Modell … (\d+) von (\d+) MB$", "Loading AI model … $1 of $2 MB"],
[r"^Höre die Vocals ab … Abschnitt (\d+) von (\d+)$", "Listening to the vocals … part $1 of $2"],
[r"^(\d+) Zeilen erkannt\.", "$1 lines detected."],
[r" Lies einmal drüber und korrigier, was falsch verstanden wurde\. Die Zeitangaben vorne bestimmen, wann eine Zeile im Video erscheint\.", " Read it through once and correct what was misheard. The times at the front decide when a line appears in the video."],
[r" Abschnitte: ", " Parts: "],
[r"^(\d+) Zeilen automatisch auf den Gesang verteilt", "$1 lines automatically spread over the vocals"],
[r" \(keine Vocal-Spur erkannt, es wurde der ganze Mix verwendet\)", " (no vocal track detected, the whole mix was used)"],
[r"\. Prüf die Zeiten in der Vorschau\.", ". Check the times in the preview."],
[r" Feinkorrektur geht direkt im Textfeld\.", " Fine-tune directly in the text field."],
[r"^Zeile (\d+) von (\d+)$", "Line $1 of $2"],
[r"^Gesang setzt ein in (.+) s$", "Vocals start in $1 s"],
[r"^Lyrics-Erkennung fehlgeschlagen: (.+)$", "Lyrics detection failed: $1"],
[r"^Danach: (.+)$", "Next: $1"],
# cover
[r"^Bild-Server ausgelastet \((.+?)\), Versuch (\d+) von (\d+) …$", "Image server busy ($1), attempt $2 of $3 …"],
[r"^Cover-Erstellung fehlgeschlagen: (.+)$", "Cover creation failed: $1"],
[r"Die kostenlosen Bild-Server sind gerade ausgelastet oder verlangen einen Schlüssel \((.+?)\)\. Lösung: Bei „Bild-KI“ auf „ChatGPT / eigene KI“ stellen, Prompt kopieren und das fertige Bild hier laden\. Oder einen kostenlosen Schlüssel auf enter\.pollinations\.ai holen und eintragen\.", "The free image servers are busy right now or require a key ($1). Solution: set “Image AI” to “ChatGPT / your own AI”, copy the prompt and load the finished image here. Or get a free key at enter.pollinations.ai and enter it."],
[r"keine Verbindung", "no connection"],
[r" Schlüssel abgelehnt", " key rejected"],
[r" Schlüssel nötig", " key needed"],
[r"kein Bild", "no image"],
[r"^Style „(.+)“ gespeichert und ausgewählt\.$", "Style “$1” saved and selected."],
[r"^Gespeichert\. Hinweis: Das Bild hatte (\d+) px und wurde hochwertig auf 3000 × 3000 hochskaliert, es ist also nicht nativ in 3000 px erzeugt\.$", "Saved. Note: the image had $1 px and was upscaled in high quality to 3000 × 3000, so it wasn't natively created at 3000 px."],
[r" · Farben übernommen$", " · colors applied"],
# split
[r"^Lade die Trenn-KI \(einmalig\) … (\d+)(?: von (\d+))? MB$", "Loading the separation AI (once) … $1 of $2 MB"],
[r"^Zerlege in Stems( \(Prozessor\))? … (\d+) %", "Splitting into stems$1 … $2 %"],
[r" \(Prozessor\)", " (processor)"],
[r" · noch ca\. (\d+) Min\.", " · about $1 min left"],
[r"^Fertig: (\d+) Stems aus „(.+?)“ in (\d+) s\. Sicherheitsprüfung bestanden \(Abweichung zum Original (.+?) dB", "Done: $1 stems from “$2” in $3 s. Safety check passed (difference to the original $4 dB"],
[r", Zeitversatz der KI-Ausgabe ausgeglichen", ", time offset of the AI output corrected"],
[r", Lautstärke der KI-Ausgabe korrigiert", ", level of the AI output corrected"],
[r"\)\. Mit „Stems einzeln exportieren“ kannst du sie als WAV speichern\.", "). Use “Export stems separately” to save them as WAV."],
[r"^Zerlegen fehlgeschlagen: (.+)$", "Splitting failed: $1"],
[r"Sicherheitsprüfung nicht bestanden, die KI-Ausgabe war fehlerhaft\. Es wurde nichts abgespielt\. Diagnose: ", "Safety check failed, the AI output was faulty. Nothing was played. Diagnosis: "],
[r"\. Ganz unten auf „Fehler-Log speichern“ klicken und die Datei schicken, dann sieht man genau, was passiert ist\.", ". Click “Save error log” at the very bottom and send the file, then you can see exactly what happened."],
[r"\. Beim ersten Mal ist Internet nötig\.", ". Internet is needed the first time."],
[r"^Hinweis: ", "Note: "],
[r"Download der KI fehlgeschlagen \(", "AI download failed ("],
[r"Fehler: ", "Error: "],
[r"^Automatisches Anpassen fehlgeschlagen: (.+)$", "Automatic fitting failed: $1"],
]

FRAG = {
"Speichern abgebrochen.": "Saving cancelled.",
}

HELP_EN = open("/home/claude/i18n/help_en.html",encoding="utf-8").read()

EXACT.update({
"Auto-Mix: fertiger Song erkannt": "Auto-Mix: finished song detected",
"Mastering eingeschaltet: Streaming −14 LUFS, True Peak −1 dB, Mehrband-Kompression, Klangbalance automatisch": "Mastering switched on: streaming −14 LUFS, true peak −1 dB, multiband compression, auto tonal balance",
"Tipp: Mit den einzelnen Stems kann der Auto-Mix jede Spur bearbeiten.": "Tip: with individual stems, Auto-Mix can process every track.",
"Sprache / Language": "Language / Sprache",
})
PAT.insert(0, [r"^(.+): nichts verändert \(Lautstärke, Panorama und Klang bleiben original\)$", "$1: nothing changed (level, panning and sound stay original)"])

EXACT.update({
"hört sich den Song an: Tempo, ob die Kick auf jedem Schlag kommt (House/EDM) oder unregelmäßig (Trap), wie viel Sub-Bass drin ist und welche Instrumente es gibt (z. B. eine Spur „808“ oder Gitarren). Bei Mischformen kann sie danebenliegen, dann wähl das Genre einfach selbst. Am nächsten an einen Profi-Song kommst du mit „An Referenz anpassen“ im Mastering.":
  "listens to the song: tempo, whether the kick lands on every beat (house/EDM) or irregularly (trap), how much sub bass there is and which instruments are there (e.g. a track called “808” or guitars). With hybrid styles it can be wrong, then just choose the genre yourself. You get closest to a pro song with “Match reference” in mastering.",
"Wie viel Hall und Echo eine Spur bekommt, stellst du bei der Spur unter „Klang“ ein. Das Echo läuft automatisch im Takt des Songs. Tiefe Frequenzen werden aus Hall und Echo herausgefiltert, damit der Bass sauber bleibt.":
  "How much reverb and echo a track gets is set on the track under “Sound”. The echo automatically runs in time with the song. Low frequencies are filtered out of reverb and echo so the bass stays clean.",
"Hier landen die erkannten Lyrics, eine Zeile pro Zeile im Video, z. B. 0:12.4 Erste Zeile vom Song 0:15.9 Zweite Zeile Du kannst alles korrigieren oder eigene Lyrics einfügen. Zeilen ohne Zeit werden gleichmäßig verteilt.":
  "Detected lyrics land here, one line per line in the video, e.g.\n0:12.4  First line of the song\n0:15.9  Second line\nYou can correct everything or paste your own lyrics. Lines without a time are spread evenly.",
"Nur die Einstellungen ohne Audio, kleine Datei": "Settings only, without audio, small file",
})
FRAG.update({
"Stimme vorne und klar, breites Stereobild, eher hell": "vocals upfront and clear, wide stereo image, rather bright",
"warm und weich, viel Raum (Hall) auf Stimme und Harmonien, Drums etwas zurück": "warm and soft, lots of space (reverb) on vocals and harmonies, drums a bit back",
"Rap-Stimme trocken und vorne, kräftiges 808, schmaleres Stereobild, laut": "rap vocal dry and upfront, strong 808, narrower stereo image, loud",
"Kick und Synths dominieren, starkes Pumpen (Sidechain), breit und hell, sehr laut": "kick and synths dominate, strong pumping (sidechain), wide and bright, very loud",
"Kick ist König, Bass und Akkorde pumpen mit, Hi-Hats präsent, clubtauglich laut": "kick is king, bass and chords pump along, present hi-hats, club-loud",
"Gitarren tragen, Bass eher Fundament als Sub, warme Mitten": "guitars carry it, bass as foundation rather than sub, warm mids",
})

EXACT.update({
"🎬 TikTok / Reels / Shorts-Clip": "🎬 TikTok / Reels / Shorts clip",
"Ein Klick: findet die Hook, stellt das Video auf 9:16 und springt direkt zum Video.": "One click: finds the hook, sets the video to 9:16 and jumps straight to the video.",
"Mix · Master · Release · v13.6": "Mix · Master · Release · v13.6",
})
PAT.append([r"^Clip bereit: Hook ab (.+?), (\d+) s, Format 9:16\. Jetzt „Video erstellen \(MP4\)“ klicken\.$", "Clip ready: hook from $1, $2 s, 9:16 format. Now click “Create video (MP4)”."])

EXACT.update({
"· Alle Rechte vorbehalten ·": "· All rights reserved ·",
"Lizenzen": "Licenses",
"Datenschutz & Impressum": "Privacy & legal notice",
})

EXACT.update({
"Lautstärke auf den Plattformen": "Volume on streaming platforms",
"Mix · Master · Release · v13.7": "Mix · Master · Release · v13.7",
})
PAT[:0] = [
 [r"^Erkannt: (.+?) \((.+)\)\. Sicherheit: (\d+) %, danach (.+?) (\d+) %\. So wird gemischt: (.+)\. Passt es nicht, wähl das Genre einfach selbst\.$", "Detected: $1 ($2). Confidence: $3 %, next best $4 $5 %. Mixing approach: $6. If it doesn't fit, just choose the genre yourself."],
 [r"\. So viel regeln die Dienste deinen Song beim Abspielen leiser \(−\) oder lauter \(\+\)\. Werte nahe 0 sind ideal, stark negative Werte heißen: Lautheit verschenkt, Dynamik umsonst geopfert\.$", ". This is how much the services turn your song down (−) or up (+) on playback. Values near 0 are ideal; strongly negative values mean loudness gained nothing and dynamics were sacrificed for nothing."],
 [r"^Klangbalance für (.+)$", "Tonal balance for $1"],
 [r"Tiefen kräftiger als typisch \((.+?)\)", "lows stronger than typical ($1)"],
 [r"Tiefen schwächer als typisch \((.+?)\)", "lows weaker than typical ($1)"],
 [r"Mitten etwas mumpfig \((.+?)\)", "mids a bit muddy ($1)"],
 [r"Mitten eher dünn \((.+?)\)", "mids rather thin ($1)"],
 [r"Höhen heller als typisch \((.+?)\)", "highs brighter than typical ($1)"],
 [r"Höhen dunkler als typisch \((.+?)\)", "highs darker than typical ($1)"],
 [r"\. Kann gewollt sein\. Sonst „Klangbalance automatisch“ im Mastering einschalten oder mit Wärme und Glanz nachregeln\.$", ". May be intentional. Otherwise switch on “Auto tonal balance” in mastering or adjust warmth and air."],
 [r"^Tiefen, Mitten und Höhen liegen nah am typischen Klangbild des Genres\.$", "Lows, mids and highs are close to the typical sound of the genre."],
]

EXACT.update({
"Natürlich (mehr Dynamik)": "Natural (more dynamics)",
"Für Spotify & YouTube": "For Spotify & YouTube",
"Laut (Club & DJ)": "Loud (club & DJ)",
"Leiser, mehr Dynamik (−16 LUFS), gut für Akustik, Balladen und Apple Music": "Quieter, more dynamics (−16 LUFS), good for acoustic, ballads and Apple Music",
"Genau die Lautstärke, auf die Spotify, YouTube und Co. alles angleichen (−14 LUFS)": "Exactly the level Spotify, YouTube and others normalize everything to (−14 LUFS)",
"So laut wie Club-Tracks und DJ-Sets (−9 LUFS)": "As loud as club tracks and DJ sets (−9 LUFS)",
"⚙ Profi-Einstellungen": "⚙ Advanced settings",
"⚙ Profi-Einstellungen ausblenden": "⚙ Hide advanced settings",
"Mix · Master · Release · v13.8": "Mix · Master · Release · v13.8",
})

EXACT.update({
"DANVIEL Studio auf GitHub: Updates verfolgen und mit einem Stern unterstützen": "DANVIEL Studio on GitHub: follow updates and support it with a star",
"⭐ DANVIEL Studio auf GitHub ↗": "⭐ DANVIEL Studio on GitHub ↗",
})

EXACT.update({
"Bass-Boost": "Bass boost",
"Mehr": "More", "Viel": "Lots", "Maximal": "Maximum",
"Lautstärke-Ausgleich": "Volume leveling",
"Sanft": "Gentle", "Stark": "Strong",
"Gleicht große Lautstärke-Sprünge zwischen Songteilen sanft aus, damit der Song gleichmäßiger klingt": "Gently evens out big volume jumps between song parts so the song sounds more consistent",
"Pegel-Ausgleich": "Vocal rider",
"hält die Stimme gleichmäßig laut": "keeps the vocal at an even level",
"Mix · Master · Release · v13.9": "Mix · Master · Release · v13.9",
})

EXACT.update({
"Changelog": "Changelog",
"Was ist neu in welcher Version": "What's new in which version",
"Alle Neuerungen findest du oben unter „📋 Changelog“.": "All changes are listed under “📋 Changelog” at the top.",
})
PAT.append([r" (\d+) doppelte Dateien \(z\. B\. MP3 neben WAV\) übersprungen, jeweils die beste Qualität genommen\.", " $1 duplicate files (e.g. MP3 next to WAV) skipped, the best quality was used each time."])

EXACT.update({"Mix · Master · Release · v14.0": "Mix · Master · Release · v14.0"})

EXACT.update({
"−14 LUFS, schmaler, mehr Sub": "−14 LUFS, narrower, more sub",
"−14 LUFS, sehr breit, hell": "−14 LUFS, very wide, bright",
"−14 LUFS, druckvoll": "−14 LUFS, punchy",
})

EXACT.update({
"Letzte Zeile: –": "Last line: –",
"Letzte getippte Zeile 0,1 s früher (↓)": "Last tapped line 0.1 s earlier (↓)",
"Letzte getippte Zeile 0,1 s später (↑)": "Last tapped line 0.1 s later (↑)",
"−0,1 s": "−0.1 s", "+0,1 s": "+0.1 s",
"Drück die Leertaste genau, wenn die angezeigte Zeile anfängt. Vertippt? Mit ← gehst du eine Zeile zurück und der Song springt kurz davor. Zu spät oder zu früh gedrückt? Mit −100 ms / +100 ms (oder ↓ / ↑) schiebst du die letzte Zeile nach, ohne neu anzufangen.": "Press space exactly when the shown line starts. Mistyped? ← goes back one line and the song jumps to just before it. Pressed too late or too early? −100 ms / +100 ms (or ↓ / ↑) shifts the last line without starting over.",
})
PAT.insert(0, [r"^Zeile (\d+): (\d+:\d+\.\d+)$", "Line $1: $2"])

EXACT.update({"Mix · Master · Release · v14.1": "Mix · Master · Release · v14.1"})

EXACT.update({
'Stems, einen fertigen Song oder eine ZIP von deinem Rechner öffnen': 'Open stems, a finished song or a ZIP from your computer',
'Ein kurzes Beispiel laden, um alles auszuprobieren': 'Load a short example to try everything out',
'Einen fertigen Song per KI in Gesang, Drums, Bass und Rest aufteilen. Läuft im Browser und dauert ein paar Minuten': 'Split a finished song into vocals, drums, bass and the rest with AI. Runs in the browser and takes a few minutes',
'Nur das Instrumental hören': 'Hear the instrumental only',
'Nur den Gesang hören (Acapella)': 'Hear the vocals only (acapella)',
'Alles außer der Hauptstimme, z. B. zum Drübersingen': 'Everything except the lead vocal, e.g. to sing over',
'Alle Spuren einschalten': 'Switch all tracks on',
'Alle Spuren ausschalten': 'Switch all tracks off',
'Tempo ändern, die Stimme bleibt in der Original-Tonhöhe': 'Change the tempo, the voice keeps its original pitch',
'Wie eine Kassette: langsamer = tiefer, schneller = höher. Der typische Slowed- und Sped-up-Sound': 'Like a tape: slower = lower, faster = higher. The classic slowed and sped-up sound',
'Sucht den Refrain: den Teil, der sich wiederholt und wo der Song nach einem Drop aufgeht. Startet kurz vor dem Einsatz': 'Finds the chorus: the part that repeats and where the song opens up after a drop. Starts just before it hits',
'Länge des Ausschnitts für Clips und Export': 'Length of the section for clips and export',
'Ausschnitt beginnt an der aktuellen Abspielposition': 'Section starts at the current play position',
'Ausschnitt endet an der aktuellen Abspielposition': 'Section ends at the current play position',
'Ein Klick: Lautstärken, Panorama, EQ, Effekte und Mastering passend zum gewählten Genre': 'One click: levels, panning, EQ, effects and mastering for the chosen genre',
'Das Programm hört sich den Song an und erkennt das Genre selbst': 'The program listens to the song and detects the genre itself',
'Bringt alle Spuren auf eine sinnvolle Lautstärke zueinander': 'Brings all tracks to sensible levels against each other',
'Verteilt Spuren links und rechts, damit der Mix breiter klingt. Stimme, Bass und Kick bleiben in der Mitte': 'Spreads tracks left and right so the mix sounds wider. Vocals, bass and kick stay in the center',
'Schneidet Frequenzen weg, wo sich Spuren gegenseitig verdecken, damit alles klarer klingt': 'Cuts frequencies where tracks mask each other so everything sounds clearer',
'Kompressor und De-Esser auf die Stimmen, Bass macht bei jedem Kick kurz Platz': 'Compressor and de-esser on the vocals, the bass ducks briefly on every kick',
'Alle Mix-Einstellungen zurück auf Anfang, die Stems bleiben geladen': 'Reset all mix settings, the stems stay loaded',
'Hall und Echo auf die Stimme, passend zum Tempo': 'Reverb and echo on the vocals, synced to the tempo',
'Kurzer, trockener Hall wie in einem kleinen Raum': 'Short, dry reverb like a small room',
'Glatter, heller Hall, der Klassiker für Gesang': 'Smooth, bright reverb, the classic for vocals',
'Langer, großer Hall für Balladen und Atmosphäre': 'Long, big reverb for ballads and atmosphere',
'Etwas mehr Tiefe und Wärme, weichere Höhen': 'A bit more low end and warmth, softer highs',
'Neutral, ohne Färbung': 'Neutral, no coloring',
'Mehr Glanz und Luft in den Höhen': 'More shine and air in the highs',
'Lade einen fertigen Song, der so klingen soll wie dein Ziel. Das Mastering gleicht Klang und Lautstärke daran an': 'Load a finished song that sounds like your goal. Mastering matches sound and loudness to it',
'Hochformat für TikTok, Reels und Shorts': 'Portrait for TikTok, Reels and Shorts',
'Quadratisch für den Instagram-Feed': 'Square for the Instagram feed',
'Querformat für YouTube': 'Landscape for YouTube',
'Erstellt das Video mit Cover, Visualizer und Lyrics als MP4-Datei': 'Creates the video with cover, visualizer and lyrics as an MP4 file',
'Die KI hört den Gesang ab und schreibt die Lyrics mit Zeiten auf. Danach am besten kurz korrigieren': 'The AI listens to the vocals and writes down the lyrics with timing. Best to correct them briefly afterwards',
'Lyrics als Untertitel-Datei für YouTube oder Videoschnitt': 'Lyrics as a subtitle file for YouTube or video editing',
'Deinen Songtext einfügen und dann automatisch oder per Mittippen synchronisieren': 'Paste your lyrics, then sync them automatically or by tapping along',
'Verteilt deine Zeilen automatisch auf die Stellen, an denen gesungen wird': 'Spreads your lines automatically over the sung parts',
'Der Song läuft, du drückst bei jeder Zeile die Leertaste. Am genauesten': 'The song plays and you press space at every line. Most accurate',
'Den fertigen Mix als Datei speichern, mit Mastering wenn es an ist': 'Save the finished mix as a file, with mastering if it is on',
'Prüft Lautstärke, True Peak, Übersteuerung, Mono und Stille vor dem Release': 'Checks loudness, true peak, clipping, mono and silence before release',
'Master, Instrumental, Acapella, Cover, Lyrics und Shorts-Video in einer ZIP': 'Master, instrumental, acapella, cover, lyrics and Shorts video in one ZIP',
'Mehrere Versionen auf einmal: Mix, Instrumental, Acapella, TV-Mix': 'Several versions at once: mix, instrumental, acapella, TV mix',
'Ein gespeichertes Projekt (ZIP) wieder öffnen': 'Open a saved project (ZIP) again',
})

EXACT.update({
"Mausrad über der Wellenform = reinzoomen": "Mouse wheel over the waveform = zoom in",
"Reinzoomen (Mausrad hoch)": "Zoom in (mouse wheel up)", "Reinzoomen": "Zoom in",
"Rauszoomen (Mausrad runter)": "Zoom out (mouse wheel down)", "Rauszoomen": "Zoom out",
"Ganzen Song zeigen": "Show the whole song", "Ganzer Song": "Whole song",
"Auf den markierten Ausschnitt zoomen": "Zoom to the marked section", "Auf Ausschnitt": "To section",
"Ausschnitt: ziehen zum Verschieben, Ränder ziehen zum Ändern der Länge, Mausrad zum Zoomen": "Section: drag to move, drag the edges to change the length, mouse wheel to zoom",
})

EXACT.update({"Mix · Master · Release · v14.2": "Mix · Master · Release · v14.2"})

EXACT.update({
"etwas mehr Hall, punktiertes Echo": "a bit more reverb, dotted echo",
"langer, leiser Hall": "long, quiet reverb",
"warm und weich, etwas mehr Raum (Hall) auf Stimme und Harmonien, Drums etwas zurück": "warm and soft, a bit more space (reverb) on vocals and harmonies, drums a bit back",
"Mix · Master · Release · v14.3": "Mix · Master · Release · v14.3",
})

EXACT.update({
"Einschalten: Lautstärken, Panorama, EQ, Effekte und Mastering passend zum gewählten Genre. Nochmal klicken schaltet alles wieder aus": "Switch on: levels, panning, EQ, effects and mastering for the chosen genre. Click again to switch everything off",
"Hall beim Auto-Mix": "Reverb in Auto-Mix",
"Kein zusätzlicher Hall, die Stimme bleibt wie im Stem": "No extra reverb, the voice stays as it is in the stem",
"Wenig": "A little",
"Nur ein Hauch Hall. Empfohlen für Suno-Stems, die oft schon Hall drauf haben": "Just a touch of reverb. Recommended for Suno stems, which often already have reverb",
"Normal": "Normal",
"Mehr Raum, passend zum Genre. Gut für trockene, selbst aufgenommene Vocals": "More space, matched to the genre. Good for dry vocals you recorded yourself",
"↺ Letzte Einstellungen": "↺ Last settings",
"Holt Mix, Mastering und Video-Einstellungen vom letzten Mal mit diesen Stems zurück": "Brings back mix, mastering and video settings from last time with these stems",
"Einstellungen vom letzten Mal geladen.": "Settings from last time loaded.",
"Auto-Mix aus: alles wieder wie die Original-Stems, Mastering aus.": "Auto-Mix off: everything back to the original stems, mastering off.",
"Visualizer-Style": "Visualizer style",
"Klassisch": "Classic",
"Balken in den Farben deines Covers": "Bars in the colours of your cover",
"Pink und Türkis, leuchtende Linien, gespiegelt": "Pink and turquoise, glowing lines, mirrored",
"Gelb und Cyan, LED-Balken, Retro-Gitter, Scanlines und Glitch auf dem Titel": "Yellow and cyan, LED bars, retro grid, scanlines and glitch on the title",
"R&B Nacht": "Late Night R&B",
"Dunkles Rot, Ring um das Cover der mit dem Bass pulsiert, Filmkorn, Serifen-Schrift": "Dark red, a ring around the cover that pulses with the bass, film grain, serif font",
"Pastell-Pop": "Pastel Pop",
"Bunte, weiche Farbflächen und Punkte, fröhlich und hell": "Colourful soft clouds and dots, happy and bright",
"Minimal": "Minimal",
"Schwarz-weiß, eine feine Wellenlinie, sonst nichts": "Black and white, one fine wave line, nothing else",
"Mix · Master · Release · v14.4": "Mix · Master · Release · v14.4",
})
PAT.insert(0, [r"^Hall beim Auto-Mix: (.+)\.$", "Reverb in Auto-Mix: $1."])

EXACT.update({"Mix · Master · Release · v14.5": "Mix · Master · Release · v14.5"})

EXACT.update({
"Hintergrund-Video": "Background video",
"Ein Video als Hintergrund, z. B. für Shorts mit echten Clips. Du kannst es auch einfach auf die Vorschau ziehen": "A video as background, e.g. for Shorts with real clips. You can also just drag it onto the preview",
"Video wählen": "Choose video",
"optional, oder Video auf die Vorschau ziehen": "optional, or drag a video onto the preview",
"Visualizer": "Visualizer", "Cover": "Cover", "Titel": "Title",
"＋ Eigenen Style bauen oder importieren": "＋ Build or import your own style",
"Name": "Name", "z. B. Mein Sommer-Look": "e.g. My summer look",
"Form": "Shape", "Balken": "Bars", "Leuchtende Linien": "Glowing lines", "LED-Balken": "LED bars", "Ring um das Cover": "Ring around the cover", "Punkte": "Dots", "Wellenlinie": "Wave line",
"Farbe 1": "Colour 1", "Farbe 2": "Colour 2", "Hintergrund": "Background", "Schrift": "Font",
"Leuchten": "Glow", "Retro-Gitter": "Retro grid", "Scanlines": "Scanlines", "Filmkorn": "Film grain", "Dunkler Rand": "Dark edges", "Glitch-Titel": "Glitch title", "Farbwolken": "Colour clouds", "Rundes Cover": "Round cover", "Titel groß": "Title in capitals",
"Style speichern": "Save style", "Exportieren": "Export", "Importieren": "Import", "Style löschen": "Delete style",
"Als .json-Datei speichern, um ihn weiterzugeben": "Save as a .json file to share it",
"Einen Style (.json) von dir oder anderen laden": "Load a style (.json) from you or others",
"Änderungen siehst du sofort in der Vorschau. Gespeicherte Styles erscheinen oben mit ★ und bleiben in diesem Browser. Mit „Exportieren“ bekommst du eine kleine Datei, die andere mit „Importieren“ laden können.": "You see changes right away in the preview. Saved styles appear above with ★ and stay in this browser. “Export” gives you a small file that others can load with “Import”.",
"Diese Datei ist kein DANVIEL-Visualizer-Style.": "This file is not a DANVIEL visualizer style.",
"Dieses Video kann der Browser nicht abspielen. MP4 (H.264) oder WebM geht am sichersten.": "The browser can't play this video. MP4 (H.264) or WebM is safest.",
"Das ist keine Videodatei.": "That's not a video file.",
"Hintergrund-Video geladen. Visualizer und Cover sind ausgeblendet, die Lyrics laufen darüber. Kannst du oben wieder einschalten.": "Background video loaded. Visualizer and cover are hidden, the lyrics run on top. You can switch them back on above.",
"Auf die Vorschau passen Videos (Hintergrund) oder Bilder (Cover).": "You can drop videos (background) or images (cover) on the preview.",
"Effekte an": "Effects on",
"Effekte an/aus: Hall, Echo und Sidechain. Startet immer aus": "Effects on/off: reverb, echo and sidechain. Always starts off",
"Kompakt (Oswald)": "Compact (Oswald)", "Fett breit (Archivo)": "Bold wide (Archivo)", "Magazin (Abril)": "Magazine (Abril)", "Modern fett (Montserrat)": "Modern bold (Montserrat)",
"Edel kursiv (Cormorant)": "Elegant italic (Cormorant)", "Futuristisch (Orbitron)": "Futuristic (Orbitron)", "Retro-Neon (Monoton)": "Retro neon (Monoton)", "Sommer-Schreibschrift (Pacifico)": "Summer script (Pacifico)",
"Glitch (Rubik)": "Glitch (Rubik)", "Street (Bungee)": "Street (Bungee)", "Kunst (Syne)": "Art (Syne)", "Pixel / 8-Bit": "Pixel / 8-bit", "Schreibschrift (Dancing)": "Script (Dancing)",
"Wärme": "Warmth", "links kühler · rechts wärmer": "left cooler · right warmer", "Farbton": "Hue", "Verblassen (Matt)": "Fade (matte)", "Weichzeichnen": "Blur",
"Leuchten (Glow)": "Glow", "RGB-Versatz (VHS)": "RGB split (VHS)", "Lichtlecks (Film)": "Light leaks (film)", "Duoton": "Duotone",
"Rot / Schwarz": "Red / black", "Blau / Pink": "Blue / pink", "Gold / Lila": "Gold / purple", "Cyan / Magenta": "Cyan / magenta", "Grün / Schwarz": "Green / black", "Orange / Blau": "Orange / blue", "Sepia": "Sepia",
"Mix · Master · Release · v14.6": "Mix · Master · Release · v14.6",
})
PAT.insert(0, [r"^„(.+)“ gespeichert\. Du findest ihn oben mit ★\.$", "“$1” saved. You'll find it above with ★."])
PAT.insert(0, [r"^„(.+)“ gelöscht\.$", "“$1” deleted."])
PAT.insert(0, [r"^(\d+) Styles? importiert\.$", "$1 style(s) imported."])

EXACT.update({"Zeile korrigieren": "Fix line"})
PAT.insert(0, [r"^Zeile (\d+) korrigiert\.$", "Line $1 fixed."])

EXACT.update({
"Titel-Position": "Title position", "Oben": "Top", "Mitte": "Center", "Unten": "Bottom", "Frei (verschoben)": "Free (dragged)",
"Ausrichtung": "Alignment", "Links": "Left", "Rechts": "Right", "Titel-Schrift": "Title font", "Wie der Style": "Same as style", "Titel-Größe": "Title size",
"Tipp: Den Titel kannst du in der Vorschau auch einfach mit der Maus an jede Stelle ziehen.": "Tip: you can also drag the title anywhere in the preview with the mouse.",
"Mix · Master · Release · v14.7": "Mix · Master · Release · v14.7",
})

EXACT.update({
"🔊 Lautstärke": "🔊 Volume", "1 dB leiser": "1 dB quieter", "1 dB lauter": "1 dB louder", "Leiser": "Quieter", "Lauter": "Louder",
"Ziehen = lauter/leiser, Doppelklick = zurück auf 0 dB": "Drag = louder/quieter, double-click = back to 0 dB",
"Video: lade Hintergrund-Video …": "Video: loading background video …",
"Mix · Master · Release · v14.8": "Mix · Master · Release · v14.8",
})

EXACT.update({
"🎹 Sound": "🎹 Sound", "Streicher": "Strings", "Lead-Synth": "Lead synth", "808-Bass": "808 bass",
"Mix · Master · Release · v14.9": "Mix · Master · Release · v14.9",
})
PAT.insert(0, [r"^MIDI (\d+)/(\d+): (.+) …$", "MIDI $1/$2: $3 …"])
PAT.insert(0, [r"^(.+): Sound „(.+)“ wird erzeugt …$", "$1: creating the “$2” sound …"])
PAT.insert(0, [r"^(.+): Sound „(.+)“\. Die Spur ist noch aus, schalte sie zum Hören ein\.$", "$1: “$2” sound. The track is still off, switch it on to hear it."])
PAT.insert(0, [r"^(.+): Sound „(.+)“\.$", "$1: “$2” sound."])
PAT.append([r" (\d+) MIDI-Spuren mit eingebautem Synth dazu \(ausgeschaltet, zum Dazumischen einschalten\)\.", " $1 MIDI tracks added with the built-in synth (off, switch them on to layer them)."])

EXACT.update({
"🔊 Bass Boosted": "🔊 Bass Boosted",
"Der alte „Bass Boosted“-Sound von YouTube: extrem viel Bass, mit Absicht übertrieben und angezerrt": "The old “Bass Boosted” YouTube sound: extreme bass, overdone and distorted on purpose",
"Ein Klick": "One click",
"🐢 Slowed + Reverb": "🐢 Slowed + Reverb", "⚡ Sped Up": "⚡ Sped Up", "🌙 Nightcore": "🌙 Nightcore", "↺ Original": "↺ Original",
"Kassette auf 85 %: tiefer und langsamer, dazu viel Hall. Der typische TikTok-Sound": "Tape at 85 %: lower and slower, plus lots of reverb. The typical TikTok sound",
"Kassette auf 120 %: schneller und höher, ohne Hall": "Tape at 120 %: faster and higher, no reverb",
"Kassette auf 130 %: sehr schnell und hoch, wie Nightcore": "Tape at 130 %: very fast and high, like nightcore",
"Zurück zum Original-Tempo und ohne den Slowed-Hall": "Back to the original tempo and without the slowed reverb",
"Slowed + Reverb: 85 % wie eine Kassette, mit Hall.": "Slowed + Reverb: 85 % like a tape, with reverb.",
"Sped Up: 120 %, schneller und höher.": "Sped Up: 120 %, faster and higher.", "Nightcore: 130 %, sehr schnell und hoch.": "Nightcore: 130 %, very fast and high.", "Zurück zum Original.": "Back to the original.",
"Halbtöne": "semitones",
"🎙 Aufnahme": "🎙 Recording",
"Sing, rap oder spiel etwas ein. Jede Aufnahme wird eine eigene Spur, die du wie jede andere mischen kannst.": "Sing, rap or play something in. Every take becomes its own track that you can mix like any other.",
"Aufnahme starten: der Song läuft mit, du nimmst darüber auf. Ohne geladenen Song nimmst du einfach frei auf": "Start recording: the song plays along and you record over it. Without a loaded song you just record freely",
"● Aufnehmen": "● Record", "■ Stopp": "■ Stop", "● Aufnahme läuft": "● Recording", "Standard-Mikrofon": "Default microphone", "Mikrofon": "Microphone",
"Ab Ausschnitt-Start": "From section start", "2 Sek. Vorlauf": "2 s pre-roll",
"Eingangspegel: sollte bei lauten Stellen gelb werden, aber nie rot": "Input level: should turn yellow on loud parts, but never red",
"Setz Kopfhörer auf, sonst landet der Song mit auf der Aufnahme. Der Song läuft ab der aktuellen Position (oder ab dem Ausschnitt). Liegt die Aufnahme zeitlich nicht ganz richtig, verschieb sie in ihrer Spur mit „Versatz“.": "Put on headphones, otherwise the song ends up on the recording. The song plays from the current position (or from the section). If the take isn't quite in time, shift it in its track with “Offset”.",
"Versatz": "Offset", "Aufnahme früher (links) oder später (rechts) schieben, in Millisekunden": "Shift the take earlier (left) or later (right), in milliseconds",
"🗑 Löschen": "🗑 Delete", "Diese Aufnahme löschen": "Delete this take", "Sicher? Nochmal klicken": "Sure? Click again",
"Stell für die Aufnahme Tempo und Tonart auf Original, sonst passt die Aufnahme später nicht.": "Set tempo and key to original for recording, otherwise the take won't fit later.",
"Kein Zugriff aufs Mikrofon. Erlaube den Zugriff oben in der Adressleiste und versuch es nochmal.": "No access to the microphone. Allow access in the address bar and try again.",
"Aufnahme läuft. Der Song spielt mit, „■ Stopp“ beendet die Aufnahme.": "Recording. The song plays along, “■ Stop” ends the take.",
"Aufnahme läuft (ohne Song). „■ Stopp“ beendet sie.": "Recording (without a song). “■ Stop” ends it.",
"Die Aufnahme war zu kurz.": "The take was too short.",
"Es kam kein Ton vom Mikrofon an. Ist das richtige Mikrofon ausgewählt?": "No sound came from the microphone. Is the right microphone selected?",
"6 Stems (+ Gitarre, Piano)": "6 stems (+ guitar, piano)",
"Trennt zusätzlich Gitarre und Piano heraus (6 Stems statt 4). Größere KI (ca. 140 MB) und langsamer. Klappt es nicht, nimmt das Programm automatisch die 4-Stem-KI": "Also separates guitar and piano (6 stems instead of 4). Bigger AI (about 140 MB) and slower. If it doesn't work, the program automatically uses the 4-stem AI",
"Lade die 6-Stem-KI (einmalig, ca. 140 MB) …": "Loading the 6-stem AI (once, about 140 MB) …", "Starte die 6-Stem-KI …": "Starting the 6-stem AI …",
"Die 6-Stem-KI hat kein sauberes Ergebnis geliefert (nichts abgespielt). Ich nehme die bewährte 4-Stem-KI …": "The 6-stem AI didn't give a clean result (nothing was played). Using the proven 4-stem AI …",
"6 Stems gingen auf diesem Rechner nicht. Ich nehme die bewährte 4-Stem-KI …": "6 stems didn't work on this computer. Using the proven 4-stem AI …",
"⚙ Profi-Ansicht": "⚙ Pro view",
"Öffnet bei allen Spuren alle Regler auf einmal: Panorama, Low-Cut, EQ, Kompressor, De-Esser, Pegel-Ausgleich, Hall und Echo": "Opens all controls on every track at once: panning, low cut, EQ, compressor, de-esser, level rider, reverb and echo",
"Keine Lust auf Details? Auto-Mix stellt alles nach den üblichen Standards der Branche ein. Profis öffnen hier alle Regler auf einmal.": "Don't want to deal with details? Auto-Mix sets everything to common industry standards. Pros open all controls here at once.",
"Mix · Master · Release · v15.0": "Mix · Master · Release · v15.0",
})
PAT.insert(0, [r"^Zerlege in 6 Stems( \(Prozessor\))? … (\d+) %(.*)$", "Splitting into 6 stems$1 … $2 %$3"])
PAT.insert(0, [r"^Aufnahme (\d+) ist jetzt eine Spur\. Du kannst weitere Aufnahmen darüber machen\.$", "Take $1 is now a track. You can record more takes over it."])
PAT.insert(0, [r"^Aufnahme (\d+) hinzugefügt \(ab (.+)\)\. Mischen, Effekte und Auto-Mix wirken darauf wie auf jede Spur\. Passt das Timing nicht ganz, schieb sie mit „Versatz“\.$", "Take $1 added (from $2). Mixing, effects and Auto-Mix work on it like on any track. If the timing is a bit off, shift it with “Offset”."])
PAT.insert(0, [r"^Aufnahme (\d+)$", "Take $1"])

EXACT.update({
"Füg hier deinen Songtext ein, eine Zeile pro Zeile, ohne Zeiten. Du kannst auch die ganzen Suno-Infos einfügen (Style + Lyrics), dann wird auch das Genre gesetzt. Leere Zeilen und Überschriften wie [Hook] oder [Strophe 1] werden übersprungen.": "Paste your lyrics here, one line per line, without times. You can also paste the whole Suno info (style + lyrics), then the genre is set too. Empty lines and headings like [Hook] or [Verse 1] are skipped.",
"💎 Get Pro": "💎 Get Pro",
"DANVIEL Studio Pro: die Desktop-Version mit mehr Funktionen": "DANVIEL Studio Pro: the desktop version with more features",
"Die Desktop-App für Windows, einmal kaufen, kein Abo. Kommt bald.": "The desktop app for Windows, buy once, no subscription. Coming soon.",
"Echte Desktop-App:": "Real desktop app:", "startet wie ein normales Programm, auch ohne Browser": "starts like a normal program, no browser needed",
"6 Stems:": "6 stems:", "trennt zusätzlich Gitarre und Piano heraus, schneller als im Browser": "also separates guitar and piano, faster than in the browser",
"Browser-Erweiterung für Suno:": "Browser extension for Suno:", "ein Klick auf Suno schickt Stems, Lyrics und Style direkt ins Studio": "one click on Suno sends stems, lyrics and style straight into the studio",
"Mehrere Songs auf einmal": "Several songs at once", "mastern und exportieren": "mastered and exported",
"Mehr Visualizer-Styles, Schriften und Cover-Looks": "More visualizer styles, fonts and cover looks",
"Die kostenlose Browser-Version bleibt kostenlos, mit allem, was sie heute kann.": "The free browser version stays free, with everything it can do today.",
"Mehr Infos & Download-Seite": "More info & download page",
})
PAT.insert(0, [r"^Aus den Suno-Infos übernommen: (.+?)\.( Jetzt „Automatisch an den Gesang anpassen“ oder „Selbst mittippen“\.)?$", "Taken from the Suno info: $1."])
PAT.insert(0, [r"^Suno-Infos gefunden: (.+) übernommen\.$", "Suno info found: $1 taken over."])

EXACT.update({"Demo: Pop":"Demo: Pop","Demo: R&B":"Demo: R&B","Demo: Trap":"Demo: Trap","Demo: House":"Demo: House","Demo: Klassisch (kurz)":"Demo: Classic (short)","Welche Demo geladen wird":"Which demo is loaded","Demo-Genre":"Demo genre"})
PAT.insert(0, [r"^Erzeuge (Demo \w+(?: &)?\w*): (.+) …$", "Creating $1: $2 …"])
PAT.insert(0, [r"^(Demo .+) geladen \((\d+) BPM\)\. Drück Play oder probier den Auto-Mix\.(.*)$", "$1 loaded ($2 BPM). Press play or try Auto-Mix.$3"])

EXACT.update({"Spur umbenennen": "Rename track"})
PAT.insert(0, [r"^Spur umbenannt: „(.+)“ heißt jetzt „(.+)“\.$", "Track renamed: “$1” is now “$2”."])

EXACT.update({
"📂 Suno-Archiv verbinden": "📂 Connect Suno archive",
"Den Ordner wählen, in dem dein Suno-Archiv die Textdateien speichert („<Titel>.txt“ und „<Titel> - Lyrics.txt“). Danach findet das Studio Lyrics, Genre und Tempo zu jedem geladenen Song automatisch": "Choose the folder where your Suno archive saves its text files (“<Title>.txt” and “<Title> - Lyrics.txt”). After that the studio finds lyrics, genre and tempo for every loaded song automatically",
"Dein Browser kann keine Ordner verbinden (geht in Chrome, Edge, Opera und Brave). Du kannst die Textdateien aber einfach zusammen mit den Stems reinziehen.": "Your browser can't connect folders (works in Chrome, Edge, Opera and Brave). You can simply drop the text files together with the stems instead.",
})
PAT.insert(0, [r"^Aus den Suno-Infos übernommen: (.+?)\.(?: Laut Suno: (.+?)\.)?( Jetzt „Automatisch an den Gesang anpassen“ oder „Selbst mittippen“\.)?$", "Taken from the Suno info: $1. According to Suno: $2. Now use “Fit to the vocals automatically” or “Tap along yourself”."])
PAT.insert(0, [r"^📂 Suno-Archiv: (.+)$", "📂 Suno archive: $1"])
PAT.insert(0, [r"^Suno-Archiv verbunden: (\d+) Songs gefunden\.(.*)$", "Suno archive connected: $1 songs found.$2"])
PAT.append([r" Zu diesem Song ist \(noch\) nichts im Archiv\.", " There's nothing in the archive for this song (yet)."])
PAT.append([r" Beim nächsten Laden eines Songs werden Lyrics und Genre automatisch übernommen\.", " The next time you load a song, lyrics and genre are taken over automatically."])

EXACT.update({
"💎 Pro": "💎 Pro", "bald": "soon",
"DANVIEL Studio Pro: die kommende Desktop-Version. Hier ist schon alles kostenlos freigeschaltet": "DANVIEL Studio Pro: the upcoming desktop version. Everything here is already unlocked for free",
"Kommt bald: die Desktop-App für Windows, einmal kaufen, kein Abo.": "Coming soon: the desktop app for Windows, buy once, no subscription.",
"Hier im Browser ist alles freigeschaltet und kostenlos.": "Everything here in the browser is unlocked and free.",
"Pro ist die Desktop-Version mit etwas mehr Leistung und ein paar Extras. Vor allem ist sie eine Möglichkeit, mich und das Projekt zu unterstützen. Darüber würde ich mich sehr freuen 💛": "Pro is the desktop version with a bit more power and a few extras. Above all, it's a way to support me and the project. I'd really appreciate it 💛",
"Die Browser-Version bleibt kostenlos, mit allem, was sie heute kann. — DANVIEL": "The browser version stays free, with everything it can do today. — DANVIEL",
"Mehr Leistung:": "More power:", "schnellere KI, 6 Stems mit Gitarre und Piano": "faster AI, 6 stems with guitar and piano",
})

EXACT.update({"schnellere KI, 6+ Stems mit Gitarre, Piano und mehr": "faster AI, 6+ stems with guitar, piano and more"})

EXACT.update({"Cover so wie im Cover-Studio (mit Schrift und Filtern)": "Cover as in the cover studio (with text and filters)"})

EXACT.update({
"━ Schieber": "━ Sliders", "◉ Drehknöpfe": "◉ Knobs", "Regler-Art": "Control style",
"Regler als Schieber nach links und rechts": "Controls as left/right sliders",
"Regler als Drehknöpfe wie am Mischpult: nach oben oder unten ziehen, Mausrad, Doppelklick = Standard": "Controls as rotary knobs like on a mixing desk: drag up or down, mouse wheel, double-click = default",
})
PAT.insert(0, [r"^(.+) · ↕ ziehen, Mausrad, Doppelklick = Standard$", "$1 · ↕ drag, mouse wheel, double-click = default"])
PAT.insert(0, [r"^Zerlege in Stems \(Prozessor, mehrere Kerne\) … (\d+) %(.*)$", "Splitting into stems (processor, several cores) … $1 %$2"])
PAT.insert(0, [r"^Zerlege in Stems \(Prozessor, 1 Kern\) … (\d+) %(.*)$", "Splitting into stems (processor, 1 core) … $1 %$2"])
EXACT.update({
"Nur 60 Sekunden (schnell)": "Only 60 seconds (fast)",
"Zerlegt nur 60 Sekunden aus der Mitte des Songs. Geht viel schneller, ideal für einen Clip oder zum Ausprobieren": "Splits only 60 seconds from the middle of the song. Much faster, ideal for a clip or to try it out",
})
PAT.insert(0, [r"^Zerlege in Stems(?: \(Prozessor\))? · Stück (\d+) von (\d+) · (\d+) % · (\d+:\d+) vergangen · noch ca\. (\d+) Min\.$", "Splitting into stems · piece $1 of $2 · $3 % · $4 elapsed · about $5 min left"])
PAT.insert(0, [r"^Zerlege in Stems(?: \(Prozessor\))? · Stück (\d+) von (\d+) · (\d+) % · (\d+:\d+) vergangen · das erste Stück dauert am längsten, Tab bitte offen lassen$", "Splitting into stems · piece $1 of $2 · $3 % · $4 elapsed · the first piece takes longest, please keep the tab open"])
EXACT.update({"Mehrere Kerne gingen auf diesem Rechner nicht. Ich rechne mit einem Kern weiter …": "Several cores didn't work on this computer. Continuing with one core …"})
PAT.insert(0, [r"^Starte (\d+) Kerne parallel …$", "Starting $1 cores in parallel …"])
PAT.insert(0, [r"^Zerlege in Stems \(Prozessor, (\d+) Kerne parallel\) · (\d+) % · (\d+:\d+) vergangen · noch ca\. (\d+) Min\.$", "Splitting into stems (processor, $1 cores in parallel) · $2 % · $3 elapsed · about $4 min left"])
PAT.insert(0, [r"^Zerlege in Stems \(Prozessor, (\d+) Kerne parallel\) · (\d+) % · (\d+:\d+) vergangen · das erste Stück dauert am längsten, Tab bitte offen lassen$", "Splitting into stems (processor, $1 cores in parallel) · $2 % · $3 elapsed · the first piece takes longest, please keep the tab open"])
EXACT.update({
"✍ Cover-Prompt aus den Lyrics": "✍ Cover prompt from the lyrics",
"Eine KI liest deinen ganzen Songtext und schreibt daraus einen fertigen Bild-Prompt für dein Cover: ein passendes Hauptmotiv, Licht, Farben und groß lesbarer Titel. Ohne Schlüssel kopierst du alles für dein ChatGPT, mit eigenem OpenAI-Schlüssel entsteht der Prompt direkt hier.": "An AI reads your whole lyrics and writes a ready image prompt for your cover: a fitting main motif, light, colours and a big readable title. Without a key you copy everything for your ChatGPT, with your own OpenAI key the prompt is created right here.",
"Songtitel": "Song title", "Künstlername": "Artist name", "Genre (optional)": "Genre (optional)",
"Titel des Songs": "Title of the song", "Name des Künstlers": "Name of the artist", "z. B. R&B, Trap, Pop": "e.g. R&B, trap, pop",
"Eigene visuelle Wünsche (optional)": "Your own visual wishes (optional)",
"z. B. Illustration statt Foto, blaue Töne, Person von hinten": "e.g. illustration instead of photo, blue tones, person seen from behind",
"sk-… OpenAI-Schlüssel (optional, für „Direkt erstellen“)": "sk-… OpenAI key (optional, to create it directly)",
"Schlüssel in diesem Browser merken": "Remember key in this browser",
"📋 Für ChatGPT kopieren": "📋 Copy for ChatGPT", "✨ Cover-Prompt erstellen": "✨ Create cover prompt", "🔄 Neues Konzept erstellen": "🔄 Create new concept",
"Kopiert die Anweisung und deine Songdaten. In ChatGPT einfügen, dann schreibt ChatGPT dir den fertigen Cover-Prompt": "Copies the instruction and your song data. Paste it into ChatGPT and ChatGPT writes the finished cover prompt for you",
"Erstellt den Cover-Prompt direkt hier über deinen OpenAI-Schlüssel": "Creates the cover prompt right here using your OpenAI key",
"Gleiche Songdaten, aber ein anderes Hauptmotiv": "Same song data, but a different main motif",
"Trotzdem fortfahren": "Continue anyway", "Abbrechen": "Cancel",
"Hier erscheint der fertige Cover-Prompt. Du kannst ihn bearbeiten.": "The finished cover prompt appears here. You can edit it.",
"Prompt kopieren": "Copy prompt", "🎨 Mit diesem Prompt Cover erstellen": "🎨 Create cover with this prompt",
"Erstellt mit diesem Prompt ein Bild über die oben gewählte Bild-KI": "Creates an image with this prompt using the image AI chosen above",
"Kopiere diesen Prompt in ChatGPT oder einen Bildgenerator, um dein Cover erstellen zu lassen.": "Copy this prompt into ChatGPT or an image generator to have your cover created.",
"Noch keine Lyrics: erst unter „Lyrics“ erkennen, einfügen oder aus dem Suno-Archiv laden.": "No lyrics yet: first detect, paste or load them from the Suno archive under “Lyrics”.",
"Keine Lyrics vorhanden. Erst unter „Lyrics“ den Songtext erkennen, einfügen oder aus dem Suno-Archiv laden. Ohne Lyrics kann kein Konzept entstehen.": "No lyrics yet. First detect, paste or load the lyrics from the Suno archive under “Lyrics”. Without lyrics there's nothing to build a concept from.",
"Kein Titel und Künstler vorhanden. Wirklich fortfahren? Dann wird der Prompt ohne Titel und Künstler erstellt (Cover ohne Schrift).": "No title and artist given. Really continue? Then the prompt is created without title and artist (cover without text).",
"Kein Titel vorhanden. Wirklich fortfahren? Dann wird der Prompt ohne Titel erstellt.": "No title given. Really continue? Then the prompt is created without a title.",
"Kein Künstler vorhanden. Wirklich fortfahren? Dann wird der Prompt ohne Künstlername erstellt.": "No artist given. Really continue? Then the prompt is created without an artist name.",
"Abgebrochen. Trag Titel und Künstler oben ein.": "Cancelled. Enter title and artist above.",
"Kopiert. Jetzt in ChatGPT einfügen und abschicken: ChatGPT schreibt dir den fertigen Cover-Prompt. Den kannst du dann direkt dort als Bild erstellen lassen oder hier unten einfügen.": "Copied. Now paste it into ChatGPT and send: ChatGPT writes the finished cover prompt. You can have the image created right there or paste the prompt below.",
"Automatisches Kopieren ging nicht. Der Text ist unten markiert, kopier ihn mit Strg+C.": "Automatic copy didn't work. The text is selected below, copy it with Ctrl+C.",
"Hier kannst du den Prompt aus ChatGPT einfügen, um ihn mit „Mit diesem Prompt Cover erstellen“ zu nutzen.": "Paste the prompt from ChatGPT here to use it with “Create cover with this prompt”.",
"Für „Cover-Prompt erstellen“ brauchst du einen OpenAI-Schlüssel (beginnt mit sk-). Ohne Schlüssel: „📋 Für ChatGPT kopieren“ und in dein ChatGPT einfügen.": "“Create cover prompt” needs an OpenAI key (starts with sk-). Without a key: “📋 Copy for ChatGPT” and paste it into your ChatGPT.",
"Entwickle ein neues Konzept …": "Developing a new concept …",
"Die KI liest deine Lyrics und schreibt den Cover-Prompt …": "The AI is reading your lyrics and writing the cover prompt …",
"Fertig. Du kannst den Prompt unten noch anpassen.": "Done. You can still adjust the prompt below.",
"Prompt kopiert. Jetzt in ChatGPT oder deinen Bildgenerator einfügen.": "Prompt copied. Now paste it into ChatGPT or your image generator.",
"Markiert, kopier ihn mit Strg+C.": "Selected, copy it with Ctrl+C.", "Noch kein Prompt im Feld.": "No prompt in the field yet.",
"Im Feld steht noch die Anweisung für ChatGPT, nicht der fertige Cover-Prompt. Füg hier den Prompt ein, den ChatGPT dir geschrieben hat.": "The field still holds the instruction for ChatGPT, not the finished cover prompt. Paste the prompt ChatGPT wrote for you here.",
})
PAT.insert(0, [r"^Lyrics: (\d+) Zeilen aus dem Lyrics-Bereich werden verwendet\.$", "Lyrics: $1 lines from the lyrics section are used."])
PAT.insert(0, [r"^Fertig, aber Achtung: (.+) steht nicht exakt im Prompt\. Bitte prüfen oder „Neues Konzept erstellen“\.$", "Done, but note: $1 is not exactly in the prompt. Please check or “Create new concept”."])
PAT.insert(0, [r"^Cover-Prompt konnte nicht erstellt werden: (.+) Alternative: „📋 Für ChatGPT kopieren“\.$", "Couldn't create the cover prompt: $1 Alternative: “📋 Copy for ChatGPT”."])
EXACT.update({
"Schritte": "Steps", "Ansicht": "View", "Laden": "Load", "Video & Cover": "Video & Cover",
"▤ Kompakt": "▤ Compact", "☰ Alles offen": "☰ Everything open",
"Ein Schritt nach dem anderen, weniger scrollen": "One step at a time, less scrolling",
"Alle Bereiche untereinander auf einer Seite": "All sections below each other on one page",
"Stems, ZIP oder Ordner reinziehen, eine Demo laden oder einen fertigen Song zerlegen.": "Drop in stems, a ZIP or a folder, load a demo or split a finished song.",
"Auto-Mix, Spuren, Effekte, Tempo & Tonart und Aufnahme.": "Auto-Mix, tracks, effects, tempo & key and recording.",
"Lautheit für Spotify, YouTube oder Club, Bass und Referenz-Song.": "Loudness for Spotify, YouTube or club, bass and reference song.",
"Hook finden, Video mit Lyrics, Cover-Studio.": "Find the hook, video with lyrics, cover studio.",
"Mix, Stems und Versionen speichern, Release-Check und Release-Paket.": "Save mix, stems and versions, release check and release package.",
})
PAT.insert(0, [r"^Weiter zu (\d) · (.+) →$", "Next: $1 · $2 →"])
PAT.insert(0, [r"^(.) (\d) · Laden$", "$1 $2 · Load"])
PAT.insert(0, [r"^← 1 · Laden$", "← 1 · Load"])
EXACT.update({"✍ Cover-Prompt aus Lyrics": "✍ Cover prompt from lyrics",
"Aus deinen Lyrics einen fertigen Bild-Prompt für dein Cover machen (ChatGPT oder eigener OpenAI-Schlüssel)": "Turn your lyrics into a ready image prompt for your cover (ChatGPT or your own OpenAI key)"})
EXACT.update({"Hintergrund": "Background", "Hintergrund der Seite": "Page background", "🎨 Carbon": "🎨 Carbon", "🎨 Studio-Licht": "🎨 Studio light", "🎨 Dunkles Holz": "🎨 Dark wood", "🎨 Gebürstetes Metall": "🎨 Brushed metal", "🎨 Schlicht schwarz": "🎨 Plain black"})
EXACT.update({
"Aus deinem ganzen Songtext entsteht ein fertiger Bild-Prompt für dein Cover: passendes Hauptmotiv, Licht, Farben und groß lesbarer Titel. „Cover-Prompt erstellen“ schreibt ihn hier ins Feld (kostenlos, mit eigenem OpenAI-Schlüssel noch zuverlässiger). Dann „Prompt kopieren“, in ChatGPT einfügen, und ChatGPT malt dir das Cover.": "Your whole lyrics become a ready image prompt for your cover: fitting main motif, light, colours and a big readable title. “Create cover prompt” writes it into the field here (free, even more reliable with your own OpenAI key). Then “Copy prompt”, paste it into ChatGPT and ChatGPT paints your cover.",
"sk-… OpenAI-Schlüssel (optional)": "sk-… OpenAI key (optional)",
"📋 Direkt an ChatGPT (Bild in einem Schritt)": "📋 Straight to ChatGPT (image in one step)",
"Kopiert einen Auftrag mit deinen Lyrics für ChatGPT: ChatGPT liest den Song und malt das Cover direkt, in einem Schritt": "Copies a brief with your lyrics for ChatGPT: ChatGPT reads the song and paints the cover right away, in one step",
"Schreibt den fertigen Bild-Prompt hier ins Feld. Ohne Schlüssel über eine kostenlose KI, mit OpenAI-Schlüssel über OpenAI": "Writes the finished image prompt into the field here. Without a key via a free AI, with an OpenAI key via OpenAI",
"Kopiert. Jetzt in ChatGPT einfügen und abschicken: ChatGPT liest deine Lyrics und malt das Cover direkt. Das fertige Bild speicherst du und ziehst es hier ins Cover-Studio.": "Copied. Now paste it into ChatGPT and send: ChatGPT reads your lyrics and paints the cover right away. Save the finished image and drop it into the cover studio here.",
"Die KI liest deine Lyrics und schreibt den Cover-Prompt … (ca. 10–30 Sekunden)": "The AI is reading your lyrics and writing the cover prompt … (about 10–30 seconds)",
"Fertig. Jetzt „Prompt kopieren“ und in ChatGPT einfügen, dann malt ChatGPT dein Cover. Oder unten „Mit diesem Prompt Cover erstellen“.": "Done. Now “Copy prompt” and paste it into ChatGPT, then ChatGPT paints your cover. Or use “Create cover with this prompt” below.",
})
PAT.insert(0, [r"^Cover-Prompt konnte nicht erstellt werden: (.+) Alternative: „📋 Direkt an ChatGPT“\.$", "Couldn't create the cover prompt: $1 Alternative: “📋 Straight to ChatGPT”."])
PAT.insert(0, [r"^Die kostenlose KI ist gerade nicht erreichbar \((.+)\)\. Nimm „📋 Direkt an ChatGPT“ oder trag einen OpenAI-Schlüssel ein\.$", "The free AI isn't reachable right now ($1). Use “📋 Straight to ChatGPT” or enter an OpenAI key."])
EXACT.update({
"(zum Zu- und Aufklappen hier klicken)": "(click here to fold / unfold)",
"Schrift aufs Cover?": "Text on the cover?", "Schrift aufs Cover": "Text on the cover",
"🔤 Ja, ChatGPT schreibt Titel & Künstler ins Bild": "🔤 Yes, ChatGPT writes title & artist into the picture",
"🖼 Nein, Bild ohne Schrift": "🖼 No, picture without text",
"Mit Titel: ChatGPT schreibt Titel und Künstler fest ins Bild. Du kannst sie danach nicht mehr verschieben, die Schrift oder Farbe nicht mehr ändern (höchstens eine zweite Schrift drüberlegen). Die Studio-Schrift wird dafür automatisch ausgeschaltet.": "With title: ChatGPT paints title and artist into the picture. Afterwards you can't move them or change font or colour (only lay a second text on top). The studio text is switched off automatically for this.",
"Ohne Schrift: ChatGPT malt nur das Bild und lässt Platz frei. Titel und Künstler setzt du danach hier im Studio: verschiebbar, 25 Schriften, Farbe und Größe frei wählbar.": "Without text: ChatGPT paints only the picture and leaves space. You add title and artist here in the studio afterwards: movable, 25 fonts, any colour and size.",
"🔤 Studio-Schrift: An": "🔤 Studio text: on", "🔤 Studio-Schrift: Aus": "🔤 Studio text: off",
"Schaltet die Schrift des Studios auf dem Cover an oder aus. Aus, wenn das Bild schon Titel und Künstler enthält (z. B. von ChatGPT)": "Switches the studio's text on the cover on or off. Off when the picture already contains title and artist (e.g. from ChatGPT)",
"Aus: es wird nur das Bild verwendet (z. B. wenn ChatGPT den Titel schon reingeschrieben hat).": "Off: only the picture is used (e.g. when ChatGPT already wrote the title into it).",
})
EXACT.update({
"📦 Pakete": "📦 Packs",
"Pakete: fertige Mastering-, Effekt- und Spur-Presets, Visualizer- und Cover-Styles laden, anwenden oder selbst eins erstellen und teilen": "Packs: load and apply ready-made mastering, effect and track presets, visualizer and cover styles, or create and share your own",
"Pakete sind fertige Einstellungen zum Teilen: Mastering, Effekte, Ketten für einzelne Spuren (z. B. „Trap Vocal“), Visualizer- und Cover-Styles. Einfach eine Paket-Datei (.json) laden oder hier reinziehen. Pakete enthalten nur Einstellungen, keinen Code, deshalb sind sie sicher.": "Packs are ready-made settings to share: mastering, effects, chains for single tracks (e.g. “Trap Vocal”), visualizer and cover styles. Just load a pack file (.json) or drop it here. Packs contain only settings, no code, so they are safe.",
"📂 Paket laden": "📂 Load pack", "✚ Eigenes Paket erstellen und teilen": "✚ Create and share your own pack",
"Name des Pakets": "Pack name", "z. B. Mein Trap-Pack": "e.g. My trap pack", "Von": "By", "dein Name": "your name",
"Beschreibung (optional)": "Description (optional)", "wofür ist das Paket gut?": "what is the pack good for?",
"Aktuelles Mastering": "Current mastering", "Aktuelle Effekte (Hall, Echo, Sidechain)": "Current effects (reverb, echo, sidechain)",
"Kette dieser Spur:": "Chain of this track:", "Meine Visualizer-Styles": "My visualizer styles", "Meine Cover-Styles": "My cover styles",
"📦 Paket speichern": "📦 Save pack", "🗑 Entfernen": "🗑 Remove", "Mastering": "Mastering", "Effekte": "Effects", "Spur-Ketten": "Track chains", "Styles": "Styles",
"DANVIEL Starter-Pack": "DANVIEL Starter Pack",
"Ein paar bewährte Einstellungen zum Ausprobieren und als Vorlage für eigene Pakete.": "A few proven settings to try out and as a template for your own packs.",
"Natürlich & offen": "Natural & open", "Trocken & nah": "Dry & close",
"Mastering einschalten und so einstellen": "Switch mastering on and set it like this", "Effekte einschalten und so einstellen": "Switch effects on and set them like this",
"Auf welche Spur?": "Which track?", "(erst Song laden)": "(load a song first)", "Erst einen Song laden.": "Load a song first.",
"Gib dem Paket einen Namen.": "Give the pack a name.", "Nichts ausgewählt, das ins Paket kann.": "Nothing selected that can go into the pack.",
"Gespeichert. Diese Datei kannst du weitergeben, andere laden sie mit „📂 Paket laden“.": "Saved. You can share this file, others load it with “📂 Load pack”.",
})
PAT[:0] = [
 [r"^Mastering „(.+)“ angewendet\.$", "Mastering “$1” applied."],
 [r"^Effekte „(.+)“ angewendet\.$", "Effects “$1” applied."],
 [r"^„(.+)“ auf „(.+)“ angewendet\.$", "“$1” applied to “$2”."],
 [r"^Paket „(.+)“ geladen\.(.*)$", "Pack “$1” loaded.$2"],
 [r" (\d+) Visualizer-Style\(s\) bei Video\.", " $1 visualizer style(s) in Video."],
 [r" (\d+) Cover-Style\(s\) im Cover-Studio\.", " $1 cover style(s) in the cover studio."],
 [r"^Paket „(.+)“ entfernt\. Bereits übernommene Visualizer- und Cover-Styles bleiben erhalten\.$", "Pack “$1” removed. Visualizer and cover styles already taken over stay."],
 [r"^Paket konnte nicht geladen werden: (.+)$", "Couldn't load the pack: $1"],
 [r"^von (.+) · (.+)$", "by $1 · $2"],
 [r"(\d+) Mastering", "$1 mastering"], [r"(\d+) Effekte", "$1 effects"], [r"(\d+) Spur-Ketten", "$1 track chains"], [r"(\d+) Visualizer-Styles", "$1 visualizer styles"], [r"(\d+) Cover-Styles", "$1 cover styles"],
 [r"^Gedacht für: (.+)\. Wählt die Spur rechts daneben\.$", "Made for: $1. Choose the track next to it."],
]
EXACT.update({"Das ist keine DANVIEL-Paket-Datei.": "That's not a DANVIEL pack file.", "Datei zu groß oder leer.": "File too big or empty.",
"Lead-Gesang": "lead vocals", "Background-Gesang": "backing vocals", "jede Spur": "any track", "Gitarre": "guitar"})
EXACT.update({
"Zerlegen über die Grafikkarte:": "Splitting on the graphics card:", "ein ganzer Song in unter einer Minute": "a whole song in under a minute",
"🔌 VST3-Plugins:": "🔌 VST3 plugins:", "deine eigenen Plugins auf jeder Spur, wie in einer echten DAW": "your own plugins on any track, like in a real DAW",
"Seitenfenster für große Bildschirme:": "Side panels for big screens:", "Datei-Browser mit Musik, Stems und Suno-Archiv, Projekte, Notizen und Lyrics, schwebende Video-Vorschau": "a file browser with music, stems and Suno archive, projects, notes and lyrics, a floating video preview",
"Studio-Schreibtisch-Look": "Studio desk look", "mit Holz, Ledermappe, Pflanze und Boxen": "with wood, leather pad, plant and speakers",
})
EXACT.update({
"🧱 Spur bauen": "🧱 Build a track",
"Neue Spuren ohne Vorkenntnisse: Beat per Klick, Melodie einspielen oder einen Loop dazulegen. Alles läuft im Takt deines Songs und wird eine normale Spur zum Mischen.": "New tracks without any experience: a beat by clicking, play in a melody or add a loop. Everything runs in time with your song and becomes a normal track to mix.",
"🥁 Drum-Pattern": "🥁 Drum pattern", "Kick, Snare und Hi-Hats per Klick setzen": "Set kick, snare and hi-hats by clicking",
"🎹 Instrument": "🎹 Instrument", "Töne einspielen: Tastatur, Maus oder MIDI-Keyboard": "Play notes: keyboard, mouse or MIDI keyboard",
"🔁 Loop / Sample": "🔁 Loop / sample", "Audiodatei rein, sie passt sich dem Takt an": "Drop in an audio file, it fits the beat",
"Ohne Song: Tempo": "Without a song: tempo", "Takte": "bars", "Muster": "Pattern", "1 Takt": "1 bar",
"Wie viele Takte das Muster lang ist, bevor es sich wiederholt": "How many bars the pattern lasts before it repeats",
"Muster leeren": "Clear pattern", "Alle Töne bzw. Schläge in diesem Muster löschen": "Delete all notes or hits in this pattern",
"✓ Fertig": "✓ Done", "Vorlage": "Template", "Vorlage wählen …": "Choose a template …",
"Boom Bap / Hip-Hop": "Boom bap / hip-hop", "Reggaeton / Dembow": "Reggaeton / dembow", "R&B langsam": "Slow R&B",
"Kästchen anklicken = Schlag an oder aus. Jede Zeile ist ein Instrument, jede Spalte ein Sechzehntel. Die hellen Spalten sind die Schläge 1, 2, 3, 4.": "Click a box = hit on or off. Each row is an instrument, each column a sixteenth. The lighter columns are beats 1, 2, 3, 4.",
"Sound": "Sound", "● Einspielen": "● Record", "■ Stopp": "■ Stop",
"Der Song läuft einen Takt vorher los, dann spielst du dein Muster ein. Am Ende des Musters hört die Aufnahme von selbst auf": "The song starts one bar earlier, then you play your pattern. Recording stops by itself at the end of the pattern",
"Einrasten": "Snap", "Eingespielte Töne rasten auf das nächste Sechzehntel ein": "Played notes snap to the nearest sixteenth",
"Metronom": "Metronome", "Klick auf jedem Schlag während des Einspielens": "A click on every beat while recording",
"◀ Oktave": "◀ Octave", "Oktave ▶": "Octave ▶", "Eine Oktave tiefer": "One octave lower", "Eine Oktave höher": "One octave higher",
"Spielen mit der Maus auf den Tasten, mit der Computer-Tastatur (A W S E D F T G Z H U J K) oder mit einem MIDI-Keyboard (Chrome/Edge).": "Play with the mouse on the keys, with the computer keyboard (A W S E D F T G Y H U J K) or with a MIDI keyboard (Chrome/Edge).",
"Piano-Roll": "Piano roll",
"Piano-Roll: leeres Feld anklicken = Ton setzen, Ton ziehen = verschieben, rechten Rand ziehen = länger oder kürzer, Doppelklick oder Rechtsklick = löschen.": "Piano roll: click an empty spot = add a note, drag a note = move it, drag its right edge = longer or shorter, double-click or right-click = delete.",
"Ans Song-Tempo anpassen (die Tonhöhe ändert sich dabei leicht)": "Fit to the song tempo (the pitch changes slightly)",
"📍 Zeitleiste": "📍 Timeline",
"Takte anklicken oder darüber ziehen: orange = die Spur spielt dort. Klick auf einen Namen = bearbeiten.": "Click or drag over bars: orange = the track plays there. Click a name = edit.",
"Ganzer Song": "Whole song", "Nur Ausschnitt": "Section only", "Nirgends": "Nowhere", "Nur im Ausschnitt / in der Hook": "Only in the section / hook",
"Zeitleiste der gebauten Spuren": "Timeline of the built tracks",
"✎ Bearbeiten": "✎ Edit", "Muster, Töne oder Zeitleiste dieser Spur bearbeiten": "Edit this track's pattern, notes or timeline", "Diese Spur löschen": "Delete this track",
"Noch kein Song geladen: du baust einen neuen Beat von null.": "No song loaded yet: you're building a new beat from scratch.",
"Es wurden keine Töne eingespielt.": "No notes were recorded.",
"Erst unter „Ausschnitt“ einen Bereich setzen (z. B. „Hook finden“).": "First set a range under “Section” (e.g. “Find hook”).",
"Die Original-Datei dieses Loops ist nicht mehr da (Projekt neu geladen). Du kannst ihn wie eine normale Spur mischen.": "The original file of this loop is gone (project reloaded). You can mix it like a normal track.",
"Anhören": "Listen",
})
PAT[:0] = [
 [r"^Raster: ([\d.]+) BPM, 4/4, (\d+) Takte, ausgerichtet am ersten Kick deines Songs\.$", "Grid: $1 BPM, 4/4, $2 bars, aligned to the first kick of your song."],
 [r"^„(.+)“ aktualisiert\.$", "“$1” updated."],
 [r"^(Drums \d+) angelegt, mit einer Vorlage passend zum Genre\. Klick die Kästchen an, um den Beat zu ändern\.$", "$1 created with a template that fits the genre. Click the boxes to change the beat."],
 [r"^(.+) angelegt\. Spiel mit der Tastatur, der Maus oder einem MIDI-Keyboard ein, oder setz Töne in der Piano-Roll\.$", "$1 created. Play with the keyboard, the mouse or a MIDI keyboard, or set notes in the piano roll."],
 [r"^(.+) angelegt und auf (\d+) Takte? angepasst\. In der Zeitleiste legst du fest, wo er spielt\.$", "$1 created and fitted to $2 bar(s). In the timeline you choose where it plays."],
 [r"^Einspielen: ein Takt Vorlauf, dann (\d+) Takte?\. Spiel einfach mit\.$", "Recording: one bar count-in, then $1 bar(s). Just play along."],
 [r"^(\d+) Töne eingespielt\. Du kannst sie in der Piano-Roll verschieben oder nochmal darüber spielen\.$", "$1 notes recorded. You can move them in the piano roll or play over them again."],
 [r"^🎹 MIDI-Keyboard verbunden: (.+)\. Einfach spielen\.$", "🎹 MIDI keyboard connected: $1. Just play."],
 [r"^(.+): ([\d.]+) s, im Song (\d+) Takte? lang\.$", "$1: $2 s, $3 bar(s) long in the song."],
 [r"^Lese „(.+)“ …$", "Reading “$1” …"],
 [r"^Loop konnte nicht geladen werden: (.+)$", "Couldn't load the loop: $1"],
]
EXACT.update({"Der Loop ist länger als 60 Sekunden. Nimm ein kürzeres Stück oder lade es als normale Spur.": "The loop is longer than 60 seconds. Use a shorter piece or load it as a normal track."})
PAT.insert(0, [r"^Deine letzte Sitzung ist wieder da \((\d+) Spuren, zuletzt vor (.+) Min\.\)\. „Projekt löschen“ fängt neu an\.$", "Your last session is back ($1 tracks, last saved $2 min ago). “Delete project” starts over."])
EXACT.update({"Menü": "Menu", "⚙ Einfache Handy-Ansicht": "⚙ Simple phone view", "⚙ Alle Funktionen anzeigen": "⚙ Show all features", "－ Weniger anzeigen": "－ Show less", "＋ Alle Funktionen anzeigen": "＋ Show all features"})
EXACT.update({"Mix · Master · Release · v15.1": "Mix · Master · Release · v15.1", "Neu in v15.1": "New in v15.1"})
EXACT.update({"DANVIEL Studio – Free Online Stem Mixer, Mastering & Lyric Video Maker": "DANVIEL Studio – Free Online Stem Mixer, Mastering & Lyric Video Maker"})
EXACT["weniger als 1"] = "less than 1"
EXACT["Deine letzte Sitzung war zu groß für den Speicher dieses Geräts und wurde nicht wieder geladen. Tipp fürs Handy: weniger Stems oder MP3 statt WAV."] = "Your last session was too big for this device's memory and was not loaded again. Tip for phones: fewer stems, or MP3 instead of WAV."
EXACT["Stems am iPhone:"] = "Stems on iPhone:"
EXACT["braucht beim Einlesen nur noch etwa ein Drittel des Speichers, dadurch stürzt Safari bei vielen Stems nicht mehr ab. Falls das Wiederherstellen doch mal zu groß ist, lädt die Seite normal statt in einer Schleife neu"] = "loading now needs only about a third of the memory, so Safari no longer crashes with many stems. If restoring a session is ever too big, the page loads normally instead of reloading in a loop"
EXACT["Beim letzten Zerlegen ist dem Gerät der Speicher ausgegangen. Ich habe „Nur 60 Sekunden“ eingeschaltet, das braucht viel weniger. Ganze Songs zerlegst du am besten am Computer."] = "Your device ran out of memory during the last split. I switched on “Only 60 seconds”, which needs much less. Whole songs are best split on a computer."
EXACT["Beim letzten Zerlegen ist dem Gerät der Speicher ausgegangen. Für die KI ist dieses Handy leider zu knapp, am Computer klappt es. Fertige Stems (z. B. aus Suno) laufen am Handy ganz normal."] = "Your device ran out of memory during the last split. This phone is too tight for the AI, it works on a computer. Finished stems (e.g. from Suno) work fine on a phone."
PAT.insert(0, [r"^Suno-Archiv eingelesen: (\d+) Songs gefunden\.(.*?) Neue Songs im Archiv\? Einfach den Ordner nochmal wählen\.$", "Suno archive read: $1 songs found.$2 New songs in the archive? Just pick the folder again."])
EXACT["De-Esser repariert, weniger Rauschen im Mastering:"] = "De-esser fixed, less hiss from mastering:"
EXACT["die Kompressoren des Browsers haben heimlich nachverstärkt. Dadurch hat der De-Esser leises Rauschen um bis zu 15 dB angehoben, statt S-Laute abzusenken, und das Mastering hat die Höhen bei leisen Stellen angehoben. Jetzt senkt der De-Esser nur noch ab und das Mastering bleibt neutral"] = "the browser's compressors secretly added make-up gain. That made the de-esser lift quiet hiss by up to 15 dB instead of taming S sounds, and the mastering lifted the highs in quiet parts. Now the de-esser only turns down and the mastering stays neutral"
PAT.insert(0, [r"Mitte \(schon Stereo\)", "Center (already stereo)"])
EXACT["Rauschen entfernen"] = "Remove noise"
EXACT["nimmt KI-Rauschen und Zischen raus"] = "removes AI hiss and noise"
EXACT["Entrauscht"] = "Denoised"
PAT.insert(0, [r"^Entferne Rauschen: (.+) …$", "Removing noise: $1 …"])
PAT.insert(0, [r"^Rauschen entfernt: (.+) \((\d+) %\)\.$", "Noise removed: $1 ($2 %)."])
PAT.insert(0, [r"^Auto-Mix: entferne Rauschen \((.+)\) …$", "Auto-Mix: removing noise ($1) …"])
PAT.insert(0, [r" · Rauschen entfernt: (.+)$", " · noise removed: $1"])
EXACT["Rauschen entfernen:"] = "Remove noise:"
EXACT["neuer Regler pro Spur unter „Klang“. Nimmt das typische KI-Rauschen und Zischen raus, vor allem in Pausen, ohne die Musik dumpf zu machen. Auto-Mix erkennt verrauschte Gesangs- und Instrumenten-Stems und schaltet ihn dort selbst ein, Drums und Bass bleiben unberührt"] = "new slider per track under “Sound”. Takes out the typical AI hiss, especially in pauses, without making the music dull. Auto-Mix detects noisy vocal and instrument stems and switches it on there, drums and bass stay untouched"
EXACT["Auto-Mix klingt sauberer:"] = "Auto-Mix sounds cleaner:"
EXACT["der Kompressor auf Gesang und Bass hat leise Stellen (Atmer, Rauschen) heimlich um 4–8 dB angehoben und die Stimme lauter gemacht als geplant. Jetzt bleibt sie genau dort, wo der Auto-Mix sie hinstellt. Bei Rauschen hebt das Mastering die obersten Höhen nicht mehr an, und die Vorschau ist so laut wie der Export"] = "the compressor on vocals and bass secretly lifted quiet parts (breaths, hiss) by 4–8 dB and made the voice louder than planned. Now it stays exactly where Auto-Mix puts it. With hiss, the mastering no longer lifts the very top, and the preview is as loud as the export"
EXACT["Lautstärke in der unteren Leiste:"] = "Volume in the bottom bar:"
EXACT["beim Scrollen einfach unten lauter oder leiser machen"] = "turn it up or down at the bottom while you scroll"
EXACT.update({"Mix · Master · Release · v15.2": "Mix · Master · Release · v15.2", "Neu in v15.2": "New in v15.2", "v15.1": "v15.1"})
EXACT["KI-Zerlegen am Handy:"] = "AI splitting on phones:"
EXACT["nutzt am Handy nur einen Kern und lädt die KI sparsamer, damit Safari nicht mehr abstürzt. Falls es doch passiert, schaltet die App beim nächsten Mal „Nur 60 Sekunden“ ein"] = "uses one core and loads the AI more economically so Safari doesn't crash. If it still happens, the app switches on “Only 60 seconds” next time"
EXACT["Suno-Archiv in Brave, Firefox und Safari:"] = "Suno archive in Brave, Firefox and Safari:"
EXACT["dort wird der Ordner jetzt einmal eingelesen und im Browser gemerkt"] = "the folder is read once and remembered in the browser"
EXACT["Cover-Studio:"] = "Cover studio:"
EXACT["Titel und Artist lassen sich wieder mit der Maus verschieben"] = "title and artist can be dragged with the mouse again"
EXACT.update({
 "Song oder Stems hier reinziehen": "Drop a song or stems here",
 "Der Fortschritt steht hier, du musst nicht scrollen. Tab bitte offen lassen.": "Progress shows right here, no need to scroll. Please keep the tab open.",
 "Was jetzt?": "What now?",
 "Tasten 1–5 wechseln den Schritt": "Keys 1–5 switch steps",
 "Zieh deinen Song oder deine Stems rein. Nur ein fertiger Song? Lass ihn von der KI in Stems zerlegen.": "Drop in your song or your stems. Only a finished song? Let the AI split it into stems.",
 "Drück den grünen Auto-Mix-Knopf, dann Play. Feinschliff an den Spuren nur, wenn du magst.": "Press the green Auto-Mix button, then play. Fine-tune the tracks only if you like.",
 "Schalte das Mastering ein (Auto-Mix macht das schon), hör rein und geh weiter.": "Switch mastering on (Auto-Mix already does), have a listen and move on.",
 "Erst Lyrics, dann Cover, dann der goldene Knopf „Video erstellen“.": "First lyrics, then the cover, then the gold “Create video” button.",
 "Exportier deinen Mix oder hol dir das ganze Release-Paket.": "Export your mix or get the whole release package.",
 "Aufklappen": "Expand", "Zuklappen": "Collapse", "▾ Aufklappen": "▾ Expand", "▴ Zuklappen": "▴ Collapse",
 "☰ Menü": "☰ Menu", "Hintergrund, Sprache, Pakete, Changelog, GitHub, Projekt löschen": "Background, language, packs, changelog, GitHub, delete project",
 "📦 Pakete": "📦 Packs", "Fertige Mastering-, Effekt- und Spur-Presets anwenden oder eigene speichern": "Apply ready-made mastering, effect and track presets or save your own",
 "Werkzeuge": "Tools", "ein Klick öffnet sie": "one click opens them",
 "4a · Lyrics": "4a · Lyrics", "4b · Cover": "4b · Cover", "4c · Video": "4c · Video", "offen": "to do",
 "Mehr Einstellungen": "More settings", "Hintergrund-Video · Titel & Schrift · Branding & Logo · Eigener Style": "Background video · Title & font · Branding & logo · Own style",
 "Noch keine Lyrics: erkennen lassen oder einfügen": "No lyrics yet: detect or paste them",
 "Cover-Bild gesetzt": "Cover image set", "Noch kein Bild · Cover-Prompt aus den Lyrics möglich": "No image yet · cover prompt from the lyrics available",
 "Lyrics an": "Lyrics on", "Lyrics aus": "Lyrics off",
 "Noch nichts geladen": "Nothing loaded yet", "Tempo und Tonart, Slowed + Reverb, Sped Up, Nightcore": "Tempo and key, Slowed + Reverb, Sped Up, Nightcore",
 "Hook finden oder einen Teil für Clips setzen": "Find the hook or set a part for clips",
 "Auto-Mix ist an": "Auto-Mix is on", "Ein Klick für einen sauberen Mix": "One click for a clean mix",
 "Hall, Echo im Takt und Sidechain": "Reverb, tempo-synced echo and sidechain",
 "Mikrofon über den Song aufnehmen, jede Aufnahme wird eine Spur": "Record your mic over the song, every take becomes a track",
 "Drums, Instrument oder Loop dazubauen": "Add drums, an instrument or a loop",
 "Aus · einschalten für Streaming-Lautstärke": "Off · switch on for streaming loudness",
 "Lyrics, Cover und Video": "Lyrics, cover and video", "Mix, Stems und Release-Paket speichern": "Save mix, stems and release package",
 "Aufnahme": "Recording", "Spur bauen": "Build tracks",
})
PAT.insert(0, [r"^(\d+) Spuren geladen$", "$1 tracks loaded"])
PAT.insert(0, [r"^(\d+) Spuren$", "$1 tracks"])
PAT.insert(0, [r"^(\d+) Zeilen$", "$1 lines"])
PAT.insert(0, [r"^Ausschnitt (.+) – (.+)$", "Section $1 – $2"])
PAT.insert(0, [r"^An · (-?[\d.]+) LUFS$", "On · $1 LUFS"])
PAT.insert(0, [r"^(.+) \(Taste (\d)\)$", "$1 (key $2)"])
EXACT.update({"Mix · Master · Release · v15.3": "Mix · Master · Release · v15.3", "Neu in v15.3": "New in v15.3", "v15.2": "v15.2",
 "Übersichtlicher:": "Clearer layout:", "jeder Schritt hat seine Farbe (Laden blau, Mix grün, Master gold, Video & Cover lila, Release rot), mit den Tasten 1–5 springst du direkt hin, und oben steht in einem Satz, was als Nächstes zu tun ist": "every step has its colour (Load blue, Mix green, Master gold, Video & Cover purple, Release red), keys 1–5 jump straight there, and one line on top says what to do next",
 "Klappen sieht man jetzt:": "Folding you can see:", "jeder Bereich hat einen klaren Knopf „Aufklappen / Zuklappen“, eingeklappt steht in einer Zeile, was drin eingestellt ist. Im Mix sind Effekte, Tempo, Aufnahme und Spur bauen als Werkzeuge eingeklappt": "every section has a clear “Expand / Collapse” button, folded sections show in one line what's set inside. In Mix, effects, tempo, recording and build tracks are folded as tools",
 "Video & Cover in drei Karten:": "Video & Cover in three cards:", "4a Lyrics, 4b Cover (mit Cover-Prompt und Cover-Studio), 4c Video. Selten gebrauchte Video-Einstellungen liegen unter „Mehr Einstellungen“. Bei 16:9 sitzt die Vorschau jetzt oben über den Einstellungen statt daneben": "4a Lyrics, 4b Cover (with cover prompt and cover studio), 4c Video. Rarely used video settings are under “More settings”. With 16:9 the preview now sits above the settings instead of next to them",
 "Aufgeräumter Kopf:": "Tidier header:", "Hintergrund, Sprache, Pakete, Changelog, GitHub und Projekt löschen sind im ☰ Menü. Die Pakete gibt es zusätzlich direkt beim Auto-Mix und beim Mastering": "background, language, packs, changelog, GitHub and delete project are in the ☰ menu. Packs are also right at Auto-Mix and Mastering",
 "Zerlegen:": "Splitting:", "der Fortschritt steht direkt unter den Knöpfen, ohne Scrollen": "the progress shows right under the buttons, no scrolling",
 "Hook finden": "Find hook", "startet eine halbe Sekunde früher, damit der Clip den Einsatz sicher mitnimmt": "starts half a second earlier so the clip safely catches the entry",
 "Farbige Knöpfe:": "Coloured buttons:", "Gold für die Hauptaktion, Grün für Play und Auto-Mix, Lila für KI, Blau für Hilfe und Demo": "gold for the main action, green for play and Auto-Mix, purple for AI, blue for help and demo"})
EXACT.update({
 "Hintergrund-Video · Titel & Schrift · Branding & Logo": "Background video · Title & font · Branding & logo",
 "Retro-Schreibschrift (Lobster)": "Retro script (Lobster)", "Retro rund (Righteous)": "Retro round (Righteous)", "Comic (Bangers)": "Comic (Bangers)",
 "Sportlich schmal (Teko)": "Sporty narrow (Teko)", "Military (Black Ops)": "Military (Black Ops)", "Hochzeit (Great Vibes)": "Wedding (Great Vibes)",
 "Locker kursiv (Satisfy)": "Casual italic (Satisfy)", "Rund und süß (Fredoka)": "Round and cute (Fredoka)", "Western (Rye)": "Western (Rye)",
 "Extra schmal (Six Caps)": "Extra narrow (Six Caps)", "Fett retro (Shrikhand)": "Bold retro (Shrikhand)", "Horror (Creepster)": "Horror (Creepster)",
 "Silber": "Silver", "Rot": "Red", "Orange": "Orange", "Pink": "Pink", "Lila": "Purple", "Blau": "Blue", "Türkis": "Turquoise", "Grün": "Green",
 "Eigene Farbe …": "Custom colour …", "Eigene Farbe": "Custom colour", "Umriss": "Outline", "Groß / klein": "Upper / lower case",
 "Wie die Schrift": "As the font", "GROSSBUCHSTABEN": "UPPERCASE", "Normal": "Normal", "Buchstaben-Abstand": "Letter spacing",
 "🎨 Beton": "🎨 Concrete", "🎨 Schwarzer Marmor": "🎨 Black marble", "🎨 Neon-Nacht": "🎨 Neon night", "🎨 Sternenhimmel": "🎨 Starry sky", "🎨 Roter Samt": "🎨 Red velvet", "🎨 Akustik-Schaum": "🎨 Acoustic foam",
 "Demo: EDM": "Demo: EDM", "Demo: Drill": "Demo: Drill", "Demo: Lo-Fi": "Demo: Lo-Fi", "Demo: Reggaeton": "Demo: Reggaeton", "Demo: Ballade": "Demo: Ballad",
})
EXACT.update({"Mix · Master · Release · v15.4": "Mix · Master · Release · v15.4", "Neu in v15.4": "New in v15.4", "v15.3": "v15.3",
 "Knöpfe oben wieder alle sichtbar:": "All header buttons visible again:", "Hintergrund, Sprache, Pakete, Changelog, GitHub und Projekt löschen stehen wieder direkt oben, kein Menü mehr": "background, language, packs, changelog, GitHub and delete project are back on top, no menu",
 "12 neue Schriften (z. B. Comic, Western, Hochzeit, Horror, Military), 9 neue Schriftfarben plus eigene Farbe, Umriss, Groß-/Kleinschreibung und Buchstaben-Abstand. Die Vorschau bleibt beim Scrollen durch die Filter im Blick": "12 new fonts (e.g. comic, western, wedding, horror, military), 9 new text colours plus a custom colour, outline, upper/lower case and letter spacing. The preview stays in view while you scroll through the filters",
 "Eigenen Visualizer bauen": "Build your own visualizer", "steht wieder direkt unter Visualizer-Style": "is back right under Visualizer style",
 "DANVIEL-Branding im Video": "DANVIEL branding in the video", "(Name und Logo) ist deutlich größer": "(name and logo) is clearly bigger",
 "5 neue Demo-Songs:": "5 new demo songs:", "EDM, Drill, Lo-Fi, Reggaeton und Ballade": "EDM, Drill, Lo-Fi, Reggaeton and Ballad",
 "6 neue Hintergründe:": "6 new backgrounds:", "Beton, Schwarzer Marmor, Neon-Nacht, Sternenhimmel, Roter Samt und Akustik-Schaum": "concrete, black marble, neon night, starry sky, red velvet and acoustic foam",
 "Pakete": "Packs", "direkt beim Auto-Mix und beim Mastering": "right at Auto-Mix and Mastering"})
EXACT.update({
 "📦 Styles aus Paketen": "📦 Styles from packs", "📦 Cover-Styles aus Paketen": "📦 Cover styles from packs",
 "Fertige Presets aus Paketen anwenden, eigene speichern und teilen": "Apply ready-made presets from packs, save and share your own",
 "Hintergrund-Video · Titel & Schrift": "Background video · Title & font",
 "Rau gekritzelt (Rock Salt)": "Rough scribble (Rock Salt)", "Schreibmaschine (Special Elite)": "Typewriter (Special Elite)", "Sci-Fi (Audiowide)": "Sci-fi (Audiowide)",
 "Fett mit Serifen (Alfa Slab)": "Bold slab (Alfa Slab)", "Funky 70er (Boogaloo)": "Funky 70s (Boogaloo)", "Blut-Horror (Nosifer)": "Blood horror (Nosifer)",
 "Lichterkette (Codystar)": "String lights (Codystar)", "Pinsel (Kaushan)": "Brush (Kaushan)", "Retro-Schwung (Yellowtail)": "Retro swing (Yellowtail)",
 "Kräftig schmal (Staatliches)": "Strong narrow (Staatliches)", "Extra fett (Bowlby)": "Extra bold (Bowlby)", "Futuristisch mono (Major Mono)": "Futuristic mono (Major Mono)",
 "Speed (Faster One)": "Speed (Faster One)", "Neon-Schild (Vibur)": "Neon sign (Vibur)", "Pixel klein (Silkscreen)": "Small pixel (Silkscreen)",
 "📷 Eigenes Foto …": "📷 Own photo …",
 "Dein Foto ist jetzt der Hintergrund. Es bleibt nur in diesem Browser gespeichert.": "Your photo is now the background. It stays saved in this browser only.",
 "Dieses Bild konnte nicht gelesen werden.": "This image could not be read.",
})
PAT.insert(0, [r"^Passend hervorgehoben: (.+)$", "Highlighted for you: $1"])
EXACT.update({"Mix · Master · Release · v15.5": "Mix · Master · Release · v15.5", "Neu in v15.5": "New in v15.5", "v15.4": "v15.4",
 "Pakete dort, wo du sie brauchst:": "Packs where you need them:", "türkise „📦 Pakete“-Knöpfe beim Auto-Mix, bei den Effekten, beim Mastering, bei den Visualizer-Styles und im Cover-Studio. Das Paket-Fenster zeigt gleich die passenden Presets hervorgehoben": "teal “📦 Packs” buttons at Auto-Mix, effects, mastering, visualizer styles and in the cover studio. The packs window highlights the matching presets right away",
 "Eigenes Foto als Hintergrund:": "Your own photo as background:", "unter Hintergrund „📷 Eigenes Foto …“ wählen. Es bleibt nur in deinem Browser gespeichert, nichts wird hochgeladen": "pick “📷 Own photo …” under background. It stays saved in your browser only, nothing is uploaded",
 "15 weitere Schriften": "15 more fonts", "im Cover-Studio und für den Video-Titel (z. B. Schreibmaschine, Pinsel, Neon-Schild, Lichterkette, Blut-Horror, Speed), jetzt über 50": "in the cover studio and for the video title (e.g. typewriter, brush, neon sign, string lights, blood horror, speed), now over 50",
 "die Vorschau sitzt groß und mittig über den Reglern": "the preview sits big and centred above the controls",
 "Video:": "Video:", "eigenes Branding und Logo stehen rechts neben „Video erstellen“, Klapp-Boxen wie „Eigenen Style bauen“ und „Mehr Einstellungen“ sind deutlich farbig hervorgehoben": "own branding and logo sit to the right of “Create video”, foldable boxes like “Build your own style” and “More settings” are clearly highlighted"})
EXACT.update({
 "Schnell anpassen": "Quick tweaks", "🎤 Vocals lauter": "🎤 Vocals louder", "🎤 Vocals leiser": "🎤 Vocals quieter", "🔊 Mehr Bass": "🔊 More bass", "🥁 Mehr Punch": "🥁 More punch",
 "📻 Radio-Mix": "📻 Radio mix", "↔ Breiter": "↔ Wider", "🧼 Clean (ohne Effekte)": "🧼 Clean (no effects)", "🔥 Wärmer": "🔥 Warmer", "✨ Heller": "✨ Brighter",
 "Gesang 2 dB lauter": "Vocals 2 dB louder", "Gesang 2 dB leiser": "Vocals 2 dB quieter",
 "Bass 2 dB und Kick 1 dB lauter, bei einem fertigen Song der Bass-Booster im Mastering": "Bass 2 dB and kick 1 dB louder, for a finished song the bass booster in mastering",
 "Drums 2 dB lauter": "Drums 2 dB louder", "Gesang vorne, Beat etwas zurück, weniger Hall: klingt wie im Radio": "Vocals up front, beat a bit back, less reverb: sounds like radio",
 "Instrumente weiter nach links und rechts verteilt, Mastering breiter": "Instruments spread wider left and right, wider mastering",
 "Hall, Echo und Sidechain aus": "Reverb, echo and sidechain off", "Mastering wärmer und weicher, weniger Höhen": "Mastering warmer and softer, less top end", "Mastering heller und luftiger": "Mastering brighter and airier",
 "Jeder Klick wirkt auf den aktuellen Mix. Rückgängig mit Strg+Z.": "Every click works on the current mix. Undo with Ctrl+Z.",
 "Erst einen Song oder Stems laden.": "Load a song or stems first.",
 "Das braucht einzelne Stems. Bei einem fertigen Song (eine Spur) geht nur Mehr Bass, Breiter, Wärmer und Heller, das läuft über das Mastering.": "This needs separate stems. With a finished song (one track) only More bass, Wider, Warmer and Brighter work, through the mastering.",
 "Keine Gesangs-Spur gefunden (der Name sollte z. B. „Vocals“ enthalten).": "No vocal track found (its name should contain e.g. “Vocals”).",
})
PAT.insert(0, [r"^(.+) Rückgängig mit Strg\+Z\.$", "$1 Undo with Ctrl+Z."])
EXACT.update({"Vocals 2 dB lauter.": "Vocals 2 dB louder.", "Vocals 2 dB leiser.": "Vocals 2 dB quieter.", "Drums 2 dB lauter.": "Drums 2 dB louder.", "Bass-Booster im Mastering hoch.": "Bass booster in mastering up.", "Bass 2 dB, Kick 1 dB lauter.": "Bass 2 dB, kick 1 dB louder.",
 "Radio-Mix: Gesang vorne, Beat etwas zurück, weniger Hall und Echo.": "Radio mix: vocals up front, beat a bit back, less reverb and echo.", "Clean: Hall, Echo und Sidechain aus.": "Clean: reverb, echo and sidechain off.",
 "Wärmer: mehr Wärme, weniger Höhen im Mastering.": "Warmer: more warmth, less top end in mastering.", "Heller: mehr Luft, weniger Wärme im Mastering.": "Brighter: more air, less warmth in mastering."})
PAT.insert(0, [r"^Breiter: Instrumente weiter verteilt, Mastering-Breite (\d+) %\.$", "Wider: instruments spread out, mastering width $1 %."])
EXACT.update({
 "✂ Zuschneiden & Verschieben": "✂ Trim & move", "＋": "＋", "－": "－", "Ganze Spur": "Whole track", "Reinzoomen (oder Mausrad)": "Zoom in (or mouse wheel)", "Rauszoomen": "Zoom out",
 "Verschieben": "Move", "◀ 1 Takt": "◀ 1 bar", "1 Takt ▶": "1 bar ▶", "◀ 0,1 s": "◀ 0.1 s", "0,1 s ▶": "0.1 s ▶", "▶ Ab Schnitt hören": "▶ Play from the cut", "Zurücksetzen": "Reset",
 "↶ Zusammenführen rückgängig": "↶ Undo merge",
 "Die gelben Griffe ziehen = Anfang und Ende abschneiden (mit kurzer Blende). Mausrad = zoomen, Shift + Mausrad = seitlich. „Verschieben“ setzt die Spur früher oder später ein. Das Original bleibt erhalten.": "Drag the yellow handles = cut the start and end (with a short fade). Mouse wheel = zoom, Shift + wheel = scroll. “Move” makes the track come in earlier or later. The original is kept.",
 "Geschnitten": "Trimmed", "Zusammengeführt": "Merged", "⤵ In Spur legen": "⤵ Put into track", "Ziel-Spur": "Target track",
 "Legt diese gebaute Spur in eine bestehende Spur, statt sie als eigene Spur zu behalten. Rückgängig geht bei der Ziel-Spur unter „Klang“": "Puts this built track into an existing track instead of keeping it as its own. Undo at the target track under “Sound”",
})
PAT.insert(0, [r"^Start (\S+) · Ende (\S+) · Versatz (\S+) s$", "Start $1 · End $2 · Offset $3 s"])
PAT.insert(0, [r"^Versatz ([+-]?[\d,]+) s$", "Offset $1 s"])
PAT.insert(0, [r"^In „(.+)“ legen\? Nochmal klicken$", "Put into “$1”? Click again"])
PAT.insert(0, [r"^„(.+)“ liegt jetzt in „(.+)“\. Rückgängig: bei „(.+)“ unter „Klang“ auf „Zusammenführen rückgängig“\.$", "“$1” is now inside “$2”. Undo: at “$3” under “Sound”, click “Undo merge”."])
PAT.insert(0, [r"^Zusammenführen rückgängig: „(.+)“ ist wieder eine eigene Spur\.$", "Merge undone: “$1” is its own track again."])
EXACT.update({"Mix · Master · Release · v15.6": "Mix · Master · Release · v15.6", "Neu in v15.6": "New in v15.6", "v15.5": "v15.5",
 "Spuren zuschneiden und verschieben:": "Trim and move tracks:", "bei jeder Spur unter „Klang“ reinzoomen, Anfang und Ende mit den gelben Griffen abschneiden (mit kurzer Blende) und die Spur um 10 ms bis einen Takt früher oder später einsetzen lassen. Das Original bleibt erhalten, „Zurücksetzen“ holt es zurück": "under “Sound” on any track, zoom in, cut the start and end with the yellow handles (with a short fade) and make the track come in 10 ms up to a bar earlier or later. The original is kept, “Reset” brings it back",
 "Gebaute Spuren in eine bestehende Spur legen:": "Put built tracks into an existing track:", "Drums, Instrument oder Loop im Editor mit „⤵ In Spur legen“ in eine vorhandene Spur mischen, statt eine neue Spur zu behalten. Rückgängig bei der Ziel-Spur unter „Klang“": "mix drums, instrument or loop into a track you already have with “⤵ Put into track” instead of keeping a new track. Undo at the target track under “Sound”",
 "Schnell anpassen:": "Quick tweaks:", "Vocals lauter / leiser, Mehr Bass, Mehr Punch, Radio-Mix, Breiter, Clean, Wärmer, Heller mit einem Klick, Strg+Z nimmt es zurück": "vocals louder / quieter, more bass, more punch, radio mix, wider, clean, warmer, brighter in one click, Ctrl+Z takes it back",
 "Dateiname zeigt den Inhalt:": "File name shows what's inside:", "sind nur der Beat oder nur die Vocals an, heißt der Export automatisch z. B. „Artist - Titel (Beat)“ oder „(Vocals)“, auch beim Video": "with only the beat or only the vocals on, the export is named e.g. “Artist - Title (Beat)” or “(Vocals)” automatically, the video too"})
EXACT.update({"Gespiegelte Balken": "Mirrored bars", "Fläche (Spektrum)": "Filled spectrum", "Retro-Pixel": "Retro pixels", "Kreis-Balken ums Cover": "Circle bars around the cover", "Funken": "Sparks", "Kein Visualizer": "No visualizer",
 "Farbe 3": "Colour 3", "Cover-Bewegung": "Cover motion", "Keine": "None", "Pulsiert im Beat (schwillt an)": "Pulses with the beat (swells)", "Atmet langsam": "Breathes slowly", "Dreht sich langsam": "Spins slowly",
 "Schwingt hin und her": "Sways back and forth", "Wackelt im Beat": "Shakes with the beat", "Stärke der Bewegung": "Motion strength",
 "Leuchtender Titel": "Glowing title", "Titel pulsiert": "Title pulses", "Funkelnde Sterne": "Twinkling stars", "Beat-Blitz": "Beat flash"})
EXACT.update({"Eigenen Visualizer bauen:": "Build your own visualizer:",
 "6 neue Formen (gespiegelte Balken, Fläche, Retro-Pixel, Kreis-Balken ums Cover, Funken, ohne Visualizer), eine dritte Farbe, Cover-Bewegung (pulsiert im Beat, atmet, dreht sich, schwingt, wackelt) mit einstellbarer Stärke, funkelnde Sterne, Beat-Blitz, leuchtender und pulsierender Titel und alle Schriften des Cover-Studios": "6 new shapes (mirrored bars, filled spectrum, retro pixels, circle bars around the cover, sparks, no visualizer), a third colour, cover motion (pulses with the beat, breathes, spins, sways, shakes) with adjustable strength, twinkling stars, beat flash, glowing and pulsing title and every font of the cover studio",
 "Lyrics:": "Lyrics:", "die laufende Zeit mit Millisekunden steht oben rechts in der mitlaufenden Liste": "the running time with milliseconds sits at the top right of the scrolling list"})
EXACT.update({"Projekt laden repariert:": "Loading projects fixed:", "Projekte mit Cover oder Logo wurden ohne ihre Einstellungen geöffnet (die Projektdatei war zu groß für eine alte Grenze). Jetzt kommen Mix, Mastering und alles andere wieder genau so, wie gespeichert": "projects with a cover or logo opened without their settings (the project file was too big for an old limit). Now mix, mastering and everything else come back exactly as saved"})
EXACT.update({"Mehr Genres: Cinematic, Game, Hintergrundmusik": "More genres: cinematic, game, background music", "für Instrumentals, Soundtracks und Musik unter Videos": "for instrumentals, soundtracks and music under videos",
 "🎬 Cinematic / Film": "🎬 Cinematic / film", "🎮 Game-Musik": "🎮 Game music", "🎧 Hintergrundmusik": "🎧 Background music",
 "Film-Score, Trailer, orchestral: viel Dynamik, breit und räumlich, −16 LUFS": "Film score, trailer, orchestral: lots of dynamics, wide and spacious, −16 LUFS",
 "Game-Soundtrack: gleichmäßig, loop-tauglich, −16 LUFS (Standard für Mobile- und Handheld-Spiele)": "Game soundtrack: even, loop-friendly, −16 LUFS (standard for mobile and handheld games)",
 "Musik unter Sprache, Vlogs und Videos: gleichmäßig, Platz für die Stimme, −16 LUFS": "Music under speech, vlogs and videos: even, room for the voice, −16 LUFS",
 "Cinematic lässt leise Stellen leise und laute laut (wie bei Soundtrack-Releases). Game-Musik ist gleichmäßig und klar, mit −16 LUFS und True Peak −1 dB nach dem Standard für Mobile- und Handheld-Spiele (Konsolen-Spiele nutzen −24 LUFS, das stellt die Engine meist selbst ein). Hintergrundmusik hält die Lautstärke ohne Sprünge und lässt in den Mitten Platz für eine Stimme.": "Cinematic keeps quiet parts quiet and loud parts loud (like soundtrack releases). Game music is even and clear, at −16 LUFS and −1 dB true peak per the standard for mobile and handheld games (console games use −24 LUFS, usually set by the engine). Background music keeps the level steady and leaves room in the mids for a voice.",
 "Cinematic / Film": "Cinematic / film", "Game-Musik": "Game music", "Hintergrundmusik": "Background music",
 "viel Dynamik (leise Stellen bleiben leise), breit und räumlich, nur sanfte Kompression, leicht weniger 300 Hz und 3 kHz, −16 LUFS wie bei Soundtrack-Releases": "lots of dynamics (quiet parts stay quiet), wide and spacious, only gentle compression, slightly less 300 Hz and 3 kHz, −16 LUFS like soundtrack releases",
 "gleichmäßig und loop-tauglich, klar, −16 LUFS und True Peak −1 dB (Standard für Mobile- und Handheld-Spiele)": "even and loop-friendly, clear, −16 LUFS and −1 dB true peak (standard for mobile and handheld games)",
 "Lautstärke ohne Sprünge, weniger Präsenz in den Mitten (Platz für eine Stimme), weich, −16 LUFS": "steady level, less presence in the mids (room for a voice), soft, −16 LUFS"})
EXACT.update({"Mix · Master · Release · v15.7": "Mix · Master · Release · v15.7", "Neu in v15.7": "New in v15.7", "v15.6": "v15.6",
 "Neue Auto-Mix-Profile für Instrumentals:": "New Auto-Mix profiles for instrumentals:",
 "unter „Mehr Genres“ gibt es 🎬 Cinematic / Film (viel Dynamik, breit und räumlich, sanfte Kompression), 🎮 Game-Musik (gleichmäßig, loop-tauglich, −16 LUFS und True Peak −1 dB nach dem Standard für Mobile- und Handheld-Spiele) und 🎧 Hintergrundmusik (Lautstärke ohne Sprünge, Platz in den Mitten für eine Stimme). Gehen auch bei einem fertigen Song": "under “More genres” there are 🎬 Cinematic / film (lots of dynamics, wide and spacious, gentle compression), 🎮 Game music (even, loop-friendly, −16 LUFS and −1 dB true peak per the standard for mobile and handheld games) and 🎧 Background music (steady level, room in the mids for a voice). They work for a finished song too",
 "Zuschneiden:": "Trimming:", "die Wellenform erscheint sofort beim Öffnen, auch in der Profi-Ansicht. Ein Klick in die noch leere Grafik konnte vorher das Ende der Spur abschneiden": "the waveform shows right away when opened, also in the pro view. A click into the still empty picture could cut off the end of the track before"})
EXACT.update({"Hex-Farbcode": "Hex colour code"})
PAT.insert(0, [r"^Farbe (#[0-9A-F]{6})$", "Colour $1"])
PAT.insert(0, [r"^(\d+) Spuren · (\d+) an · (.*)$", "$1 tracks · $2 on · $3"])
EXACT["Noch keine Spuren"] = "No tracks yet"
EXACT.update({"Tastenkürzel": "Keyboard shortcuts", "Leertaste": "Space", "Abspielen / Pause": "Play / pause", "Mastering an / aus": "Mastering on / off",
 "Vorher / Nachher hören": "Hear before / after", "Dateien laden": "Load files", "Video erstellen": "Create video", "Exportieren": "Export",
 "Strg Z": "Ctrl Z", "Strg Y": "Ctrl Y", "Rückgängig": "Undo", "Wiederholen": "Redo", "Dieses Menü": "This menu",
 "Klick auf eine Zeile führt sie aus. Beim Tippen in Textfeldern sind die Tasten aus.": "Click a row to run it. While you type in a text field the keys are off.",
 "Das geht erst, wenn Stems geladen sind.": "That works once stems are loaded.",
 "Tastenkürzel anzeigen (Taste ?)": "Show keyboard shortcuts (key ?)", "Studio · v15": "Studio · v15", "DANVIEL Studio": "DANVIEL Studio"})

EXACT.update({"Neu in v15.8": "New in v15.8", "v15.7": "v15.7", "Neues Logo:": "New logo:", "DANVIEL Studio hat ein eigenes, modernes Logo: „DΛNVIEL“ aus eigenen Buchstaben, Λ, N und V bilden eine goldene Schallwelle. Dazu ein neues App-Symbol (D mit goldenem Gipfel) im Browser-Tab und auf dem Handy": "DANVIEL Studio has its own modern logo: “DΛNVIEL” built from its own letters, Λ, N and V form a golden sound wave. Plus a new app icon (D with a golden peak) in the browser tab and on your phone", "Branding im Video:": "Branding in the video:", "oben links steht das DANVIEL-Zeichen, unten rechts die Signatur „Danviel Studio“, das ganze Video lang. Mit eigenem Logo oder Namen rutscht das Zeichen nach oben rechts und dein Branding bekommt den Platz oben": "the DANVIEL mark sits top left and the signature “Danviel Studio” bottom right, for the whole video. With your own logo or name the mark moves to the top right and your branding takes the top spot", "Tastenkürzel:": "Keyboard shortcuts:", "A = Auto-Mix, M = Mastering an/aus, B = Vorher/Nachher, L = Dateien laden, V = Video erstellen, E = Exportieren, ? = alle Kürzel. Der Tastatur-Knopf links in der Schrittleiste zeigt sie alle, ein Klick auf eine Zeile führt sie aus": "A = Auto-Mix, M = mastering on/off, B = before/after, L = load files, V = create video, E = export, ? = all shortcuts. The keyboard button on the left of the step bar lists them all, clicking a row runs it", "Schrittleiste mit eigenen Symbolen:": "Step bar with its own icons:", "Laden, Mix, Master, Video & Cover und Release zeigen jetzt ein Symbol statt einer Nummer": "Load, Mix, Master, Video & Cover and Release now show an icon instead of a number", "Farbwähler:": "Colour pickers:", "bei Cover, Visualizer und Titel mit Farbfeld, Hex-Code zum Eintippen und 12 fertigen Farben": "for cover, visualizer and title with a swatch, a hex code to type in and 12 ready colours", "Aufgeräumt:": "Tidied up:", "Häkchen-Gruppen stehen sauber im Raster, Löschen- und Zurücksetzen-Knöpfe sind rot, Knöpfe in einer Reihe sind gleich hoch": "checkbox groups sit neatly in a grid, delete and reset buttons are red, buttons in one row have the same height", "Spuren zuklappen repariert:": "Folding tracks fixed:", "der Knopf „Zuklappen“ bei den Spuren verschwand nach dem Laden der Stems. Jetzt lassen sich alle Spuren mit einem Klick einklappen, die Zeile zeigt dann z. B. „5 Spuren · 5 an“": "the “Collapse” button on the tracks disappeared after loading stems. Now all tracks fold with one click, the line then shows e.g. “5 tracks · 5 on”", "Tipp: Leertaste = Play/Pause, ? = alle Tastenkürzel. S beim Kanal = Solo (nur diese Spur hören, ändert den Export nicht).": "Tip: space = play/pause, ? = all keyboard shortcuts. S on a channel = solo (hear only this track, doesn't change the export)."})
EXACT.update({"Drück den goldenen Auto-Mix-Knopf. Rechts im Monitor hörst und siehst du sofort, wie es klingt. Feinschliff an den Spuren nur, wenn du magst.": "Press the golden Auto-Mix button. On the right in the monitor you hear and see right away how it sounds. Fine-tune the tracks only if you like.",
 "☀ Hell": "☀ Light", "Kompakt": "Compact", "Alles offen": "Everything open", "Kompakt: ein Schritt nach dem anderen. Alles offen: alle Bereiche untereinander.": "Compact: one step after the other. Everything open: all sections below each other.",
 "Projekt": "Project", "Speichern": "Save", "Öffnen": "Open", "Alle Spuren, Einstellungen, Cover, Logo, Lyrics und Hook in einer ZIP-Datei": "All tracks, settings, cover, logo, lyrics and hook in one ZIP file",
 "Ein gespeichertes Projekt (ZIP) wieder öffnen": "Open a saved project (ZIP) again", "Monitor": "Monitor", "fährt beim Scrollen mit": "follows you while scrolling",
 "Video-Vorschau": "Video preview", "Zum Video": "To the video", "Zum Video-Bereich: Lyrics, Cover und Video erstellen": "To the video section: lyrics, cover and create the video",
 "Angeklickt": "Selected", "Klick auf eine Spur, dann stehen hier ihre wichtigsten Regler.": "Click a track and its most used controls show up here.", "Spur": "Track",
 "Lautstärke": "Volume", "Hall": "Reverb", "Aus": "Off", "Wenig": "A little", "Mittel": "Medium", "Viel": "A lot", "Rauschen": "Noise", "Rauschen entfernen": "Remove noise",
 "Alle Regler": "All controls", "Schritt": "Step", "von": "of"})

EXACT.update({"Neu in v16": "New in v16", "v15.8": "v15.8", "Neues Design, dunkel als Standard:": "New design, dark by default:", "Anthrazit-Karten mit Gold auf der Ledermappe. Wer es hell mag: Hintergrund „☀ Hell“": "charcoal cards with gold on the leather folder. If you like it light: background “☀ Light”", "Der Monitor:": "The monitor:", "auf breiten Bildschirmen steht rechts eine Edelstahl-Ablage, die beim Scrollen mitfährt: große Live-Vorschau vom Video, darunter der Player mit Lautheit, Peak, Analyzer und Schnellwahl, und „Angeklickt“ mit Lautstärke, Hall und Rauschen der Spur, die du zuletzt angefasst hast": "on wide screens a stainless steel tray sits on the right and follows you while scrolling: a big live preview of the video, below it the player with loudness, peak, analyzer and quick select, and “Selected” with volume, reverb and noise of the track you touched last", "Schrittleiste:": "Step bar:", "breite Felder mit eigenem Symbol und Namen. Was ein Schritt macht, steht beim Darüberfahren": "wide tiles with their own icon and name. What a step does shows when you hover", "Infos beim Darüberfahren:": "Info on hover:", "jede Erklärung erscheint sofort als kleine Karte, wenn die Maus auf einem Knopf steht": "every explanation shows right away as a small card when the mouse rests on a button", "Aufgeräumter Kopf:": "Tidy header:", "Rückgängig und Wiederholen als Pfeile, „So geht’s“ in Blau, „Kompakt / Alles offen“ als Schalter": "undo and redo as arrows, “How it works” in blue, “Compact / Everything open” as a switch", "Projekt-Leiste unten:": "Project bar at the bottom:", "Speichern, Öffnen und der rote Knopf „Projekt löschen“ stehen jetzt am Ende der Mappe": "save, open and the red “Delete project” button now sit at the end of the folder", "Auto-Mix in Gold, Packs in Türkis:": "Auto-Mix in gold, packs in teal:", "die wichtigen Knöpfe stechen heraus. Auto-Werkzeuge und „Schnell anpassen“ stehen in einem gleichmäßigen Raster, jeder Knopf mit eigenem Symbol": "the important buttons stand out. Auto tools and quick tweaks sit in an even grid, each button with its own icon", "Wellenformen repariert:": "Waveforms fixed:", "die Wellenform der Spuren blieb nach dem Wechsel in den Mix-Schritt manchmal leer": "the track waveforms sometimes stayed empty after switching to the Mix step", "Signatur im Video:": "Signature in the video:", "kleiner in der Ecke, der Visualizer läuft darüber": "smaller in the corner, the visualizer runs over it"})
EXACT.update({"Drück den goldenen Auto-Mix-Knopf, dann Play. Feinschliff an den Spuren nur, wenn du magst.": "Press the golden Auto-Mix button, then play. Fine-tune the tracks only if you like."})
EXACT.update({"Details": "Details", "Schieber": "Sliders", "Drehknöpfe": "Knobs", "Regler als Schieber oder als Drehknöpfe wie am Mischpult": "Controls as sliders or as knobs like on a mixing desk"})
EXACT.update({"Design und Bausteine vom Monitor": "Monitor design and building blocks", "Edelstahl": "Stainless steel", "Chrom": "Chrome", "Schwarzes Glas": "Black glass", "Leder": "Leather",
 "Spuren-Übersicht": "Track overview", "Visualizer": "Visualizer", "Schnellwahl": "Quick select", "Baustein verschieben": "Move block", "Ziehen zum Verschieben": "Drag to move",
 "Ausblenden": "Hide", "Ausblenden, im Zahnrad-Menü wieder einschalten": "Hide, switch it back on in the gear menu", "Design": "Design", "Bausteine": "Building blocks",
 "Video und Player bleiben immer drin": "Video and player always stay", "Zum Anfang": "To the start", "Ausschnitt in Schleife (erst einen Ausschnitt setzen)": "Loop the section (set a section first)",
 "Vorher / Nachher hören (Taste B)": "Hear before / after (key B)", "Stumm": "Mute", "Erst einen Ausschnitt setzen (Schritt 4, Hook finden), dann läuft er in Schleife.": "Set a section first (step 4, find hook), then it loops.",
 "Lade Stems, dann siehst du hier jede Spur.": "Load stems and you see every track here."})

EXACT.update({"Neu in v16.1": "New in v16.1", "v16": "v16", "Monitor ausgebaut:": "Monitor upgraded:", "der Player zeigt den ganzen Mix als Wellenform zum Klicken und Spulen, mit Zeit, Knöpfen für Anfang, Loop, Vorher/Nachher und Stumm": "the player shows the whole mix as a waveform to click and seek, with time, keys for start, loop, before/after and mute", "Bausteine:": "Building blocks:", "Angeklickt, Spuren-Übersicht (jede Spur als kleine Wellenform), großer Visualizer und Schnellwahl lassen sich ausblenden und mit dem Griff ⠿ verschieben. Video und Player bleiben immer drin": "Selected, track overview (each track as a small waveform), big visualizer and quick select can be hidden and moved with the grip ⠿. Video and player always stay", "Vier Monitor-Designs:": "Four monitor designs:", "Edelstahl, Chrom, Schwarzes Glas und Leder, über das Zahnrad oben im Monitor": "stainless steel, chrome, black glass and leather, via the gear at the top of the monitor", "MIDI bleibt aus:": "MIDI stays off:", "Schnellwahl wie „Alle an“ oder „Beat“ schaltet MIDI-Spuren nie ein, nur du selbst": "quick select like “All on” or “Beat” never switches MIDI tracks on, only you do", "Breitere Mappe auf großen Bildschirmen,": "Wider folder on big screens,", "Changelog, GitHub und Pro oben rechts, eigene Symbole statt Emojis, wichtige Knöpfe leuchten dezent": "changelog, GitHub and Pro at the top right, own icons instead of emojis, important buttons glow softly", "Auto-Mix-Bericht": "Auto-Mix report", "klappt nach 10 Sekunden zu einer Zeile ein, „Details“ öffnet ihn wieder": "folds into one line after 10 seconds, “Details” opens it again", "„Zum Video“": "“To the video”", "öffnet den Video-Bereich und landet genau auf der Video-Karte": "opens the video section and lands right on the video card"})

EXACT.update({"Klassik / Orchester": "Classical / orchestral", "Instrumental / Beat": "Instrumental / beat", "Reggaeton / Latin": "Reggaeton / Latin", "Gospel / Worship": "Gospel / worship", "Jazz / Soul": "Jazz / soul", "Psytrance / Goa": "Psytrance / Goa", "Synthwave / Cyberpunk": "Synthwave / cyberpunk", "Instrumental & Film": "Instrumental & film", "Club & Elektronik": "Club & electronic", "Band": "Band", "Global": "Global", "Mehr Genres": "More genres", "Instrumental, Klassik, Film, Game, Jazz, Reggaeton, K-Pop, Amapiano, Techno, Drum & Bass, Psytrance, Synthwave, Phonk, Metal …": "Instrumental, classical, film, game, jazz, reggaeton, K-pop, amapiano, techno, drum & bass, psytrance, synthwave, phonk, metal …", "Percussion und Shaker präsent und breit, Kick punchig ohne zu viel Sub, Bass melodisch, Stimme vorne mit Hall und punktiertem Echo, warm und sauber": "percussion and shakers present and wide, kick punchy without too much sub, melodic bass, vocal up front with reverb and dotted echo, warm and clean", "die Kick führt (anders als bei Trap), 808 mit Glide etwas dahinter, harte Hi-Hats, Rap-Stimme trocken und aggressiv vorne, dunkel": "the kick leads (unlike trap), gliding 808 a little behind, hard hi-hats, rap vocal dry and aggressive up front, dark", "warm und weich, Höhen bewusst gedämpft wie von Tape, leichte Sättigung, Keys vorne, sanftes Pumpen, entspannt": "warm and soft, highs rolled off like tape, light saturation, keys up front, gentle pumping, relaxed", "die natürliche Dynamik bleibt fast ganz, kaum Kompression, kein künstliches Verbreitern, nur Rumpeln weg und etwas Luft, −16 LUFS (üblich −16 bis −20), True Peak −1 dB": "natural dynamics stay almost fully, hardly any compression, no artificial widening, only rumble removed and a little air, −16 LUFS (usual −16 to −20), true peak −1 dB", "ohne Stimme: Melodie und Drums teilen sich die Mitte, Instrumente etwas breiter, kräftiges Low-End, Streaming-laut": "no vocal: melody and drums share the centre, instruments a bit wider, strong low end, streaming loud", "Dembow-Snare knackig und breit, Sub auf Schlag 1 und 3, Stimme laut und vorne, clubtauglich": "dembow snare crisp and wide, sub on beats 1 and 3, vocal loud and up front, club ready", "sehr hell und glänzend, viele Stimmen dicht und vorne, breit und punchy": "very bright and shiny, many voices dense and up front, wide and punchy", "der Log-Drum-Bass trägt, Shaker und Percussion verspielt und breit, viel Raum, entspannt pumpend": "the log drum bass carries, shakers and percussion playful and wide, lots of space, relaxed pumping", "Chor und Lead groß und emotional, Keys und Orgel tragen, viel Raum, warm": "choir and lead big and emotional, keys and organ carry, lots of space, warm", "Stimme und Gitarren tragen, natürliche Drums, warm und klar": "vocal and guitars carry, natural drums, warm and clear", "natürlich und warm, viel Dynamik, Instrumente im Raum, kaum Kompression": "natural and warm, lots of dynamics, instruments in the room, hardly any compression", "Kick und Groove im Mittelpunkt, Bass tief und mittig, hypnotisch, viel Raum für Effekte": "kick and groove at the centre, bass deep and centred, hypnotic, lots of room for effects", "schnelle Breakbeats knackig, schwerer Sub-Bass, helle Snare, sehr energetisch": "fast breakbeats crisp, heavy sub bass, bright snare, very energetic", "Kick und rollender Bass wechseln sich ab (starkes Sidechain), psychedelische Synths breit, hell und treibend": "kick and rolling bass take turns (strong sidechain), psychedelic synths wide, bright and driving", "Retro-Synths und Gated-Reverb-Snare breit und neonhell, satter Bass, viel Hall": "retro synths and gated reverb snare wide and neon bright, full bass, lots of reverb", "verzerrter 808-Bass und Cowbell vorne, gesättigt und laut, Stimm-Samples im Hintergrund": "distorted 808 bass and cowbell up front, saturated and loud, vocal samples in the background", "breite Gitarrenwand, Kick und Snare setzen sich durch, Bass als Fundament, dicht und laut": "wide wall of guitars, kick and snare cut through, bass as the foundation, dense and loud", "vorne, Hall + punktiertes Echo": "up front, reverb + dotted echo", "Percussion breit, Kick punchig": "percussion wide, kick punchy", "Platte, punktiertes Echo": "plate, dotted echo", "leicht": "light", "−14 LUFS, warm, breit": "−14 LUFS, warm, wide", "trocken, aggressiv, vorne": "dry, aggressive, up front", "Kick führt, 808 dahinter": "kick leads, 808 behind", "kurzer Raum, 1/8-Echo": "short room, 1/8 echo", "808 leicht": "808 light", "−14 LUFS, dunkel, druckvoll": "−14 LUFS, dark, punchy", "im Mix, weich": "in the mix, soft", "Keys vorne, Drums sanft": "keys up front, drums soft", "kleiner Raum": "small room", "sanft": "soft", "−14 LUFS, warm, Höhen gedämpft": "−14 LUFS, warm, highs rolled off", "natürlich, im Raum": "natural, in the room", "Orchester trägt": "orchestra carries", "großer Saal": "large hall", "aus": "off", "−16 LUFS, volle Dynamik": "−16 LUFS, full dynamics", "–": "–", "Melodie und Drums gleichwertig": "melody and drums equal", "Platte": "plate", "−14 LUFS, breit": "−14 LUFS, wide", "laut und vorne": "loud and up front", "Dembow-Snare knackig": "dembow snare crisp", "Platte, 1/8-Echo": "plate, 1/8 echo", "mittel": "medium", "−14 LUFS, hell, druckvoll": "−14 LUFS, bright, punchy", "viele Stimmen, dicht, vorne": "many voices, dense, up front", "punchy": "punchy", "−14 LUFS, sehr hell, breit": "−14 LUFS, very bright, wide", "mit viel Raum": "with lots of space", "Log-Drum trägt, Shaker breit": "log drum carries, shakers wide", "Saal, punktiertes Echo": "hall, dotted echo", "−14 LUFS, warm, tief": "−14 LUFS, warm, deep", "groß, Chor lauter": "big, choir louder", "Keys/Orgel tragen": "keys/organ carry", "vorne, natürlich": "up front, natural", "Gitarren tragen": "guitars carry", "−14 LUFS, warm, klar": "−14 LUFS, warm, clear", "warm, natürlich": "warm, natural", "Band im Raum": "band in the room", "Saal": "hall", "−16 LUFS, viel Dynamik": "−16 LUFS, lots of dynamics", "im Hintergrund, viel Hall": "in the background, lots of reverb", "Kick im Mittelpunkt": "kick at the centre", "langer Saal, Echo": "long hall, echo", "stark": "strong", "−14 LUFS, druckvoll": "−14 LUFS, punchy", "mit Hall": "with reverb", "Breakbeats knackig, Sub schwer": "breakbeats crisp, heavy sub", "Saal, 1/8-Echo": "hall, 1/8 echo", "−14 LUFS, hell, energetisch": "−14 LUFS, bright, energetic", "Samples mit Hall": "samples with reverb", "Kick + rollender Bass": "kick + rolling bass", "sehr stark": "very strong", "−14 LUFS, hell, breit": "−14 LUFS, bright, wide", "mit viel Hall": "with lots of reverb", "Synths tragen, große Snare": "synths carry, big snare", "−14 LUFS, sehr breit": "−14 LUFS, very wide", "Samples im Hintergrund": "samples in the background", "808 verzerrt, Cowbell vorne": "808 distorted, cowbell up front", "kurzer Raum": "short room", "−14 LUFS, gesättigt": "−14 LUFS, saturated", "kräftig, im Mix": "strong, in the mix", "Gitarrenwand, Kick + Snare hart": "wall of guitars, hard kick + snare", "Platte, kurz": "plate, short", "−14 LUFS, dicht": "−14 LUFS, dense", "DANVIEL Genre-Pack": "DANVIEL Genre Pack", "Mix- und Mastering-Vorlagen für Trap, Drill, Afrobeats, Lo-Fi, Radio und Club, nach den üblichen Studio-Einstellungen.": "Mix and mastering presets for trap, drill, afrobeats, lo-fi, radio and club, based on common studio settings.", "Club laut": "Club loud", "Spotify sauber": "Spotify clean", "Vinyl warm": "Vinyl warm", "Lo-Fi weich": "Lo-fi soft", "Cinema dynamisch": "Cinema dynamic", "Drill dunkel": "Drill dark", "Radio-Stimme": "Radio voice", "Ad-Libs breit": "Ad-libs wide", "⤓ Exportieren": "⤓ Export", "Dieses Paket als .json-Datei speichern, zum Weitergeben oder als Sicherung": "Save this pack as a .json file, to share or as a backup"})
PAT.insert(0, [r"^(Afrobeats|Drill|Lo\-Fi|Klassik\ /\ Orchester|Instrumental\ /\ Beat|Reggaeton\ /\ Latin|K\-Pop|Amapiano|Gospel\ /\ Worship|Country|Jazz\ /\ Soul|Techno|Drum\ \&\ Bass|Psytrance\ /\ Goa|Synthwave\ /\ Cyberpunk|Phonk|Metal): (.+?)(\.?)$", "$1: $2$3"])

EXACT.update({"Neu in v16.2": "New in v16.2", "v16.1": "v16.1", "17 neue Genres für den Auto-Mix:": "17 new genres for Auto-Mix:", "Drill, Afrobeats und Lo-Fi in der ersten Reihe. Unter „Mehr Genres“ (neu und übersichtlich in Gruppen): Instrumental, Klassik / Orchester, Jazz / Soul, Reggaeton / Latin, K-Pop, Amapiano, Gospel, Country, Techno, Drum & Bass, Psytrance / Goa, Synthwave / Cyberpunk, Phonk und Metal": "drill, afrobeats and lo-fi in the first row. Under “More genres” (new and tidy in groups): instrumental, classical / orchestral, jazz / soul, reggaeton / Latin, K-pop, amapiano, gospel, country, techno, drum & bass, psytrance / Goa, synthwave / cyberpunk, phonk and metal", "Nach Studio-Praxis eingestellt:": "Set up like in the studio:", "bei Drill führt die Kick und die 808 sitzt dahinter (anders als bei Trap), Afrobeats bekommt breite Percussion und punktiertes Echo, Lo-Fi gedämpfte Höhen und Tape-Wärme, Klassik bleibt fast unkomprimiert bei −16 LUFS und True Peak −1 dB": "in drill the kick leads and the 808 sits behind it (unlike trap), afrobeats gets wide percussion and a dotted echo, lo-fi rolled-off highs and tape warmth, classical stays almost uncompressed at −16 LUFS and −1 dB true peak", "Tabelle „Was ändert sich je Genre?“": "Table “What changes per genre?”", "zeigt jetzt alle Genres": "now shows every genre", "Neues DANVIEL Genre-Pack:": "New DANVIEL genre pack:", "Mastering „Club laut“, „Spotify sauber“, „Vinyl warm“, „Lo-Fi weich“, „Cinema dynamisch“, „Drill dunkel“, Effekte „Afro Bounce“, „Dark Drill“, „Lo-Fi Tape“, „Wide Hook“, „Club Pump“ und Spur-Ketten wie „Trap Vocal Chain“, „Drill Vocal“, „Radio-Stimme“ und „Ad-Libs breit“": "mastering “Club loud”, “Spotify clean”, “Vinyl warm”, “Lo-fi soft”, “Cinema dynamic”, “Drill dark”, effects “Afro Bounce”, “Dark Drill”, “Lo-Fi Tape”, “Wide Hook”, “Club Pump” and track chains like “Trap Vocal Chain”, “Drill Vocal”, “Radio voice” and “Ad-libs wide”", "Packs exportieren:": "Export packs:", "jedes Paket hat jetzt „Exportieren“ und wird als .json-Datei gespeichert. Importieren wie bisher mit „Paket laden“ oder per Drag & Drop": "every pack now has “Export” and is saved as a .json file. Import as before with “Load pack” or drag & drop"})
EXACT.update({"Projekt wirklich löschen?": "Really delete the project?", "Alle Spuren, Einstellungen, Lyrics und das Cover dieses Projekts werden aus dem Browser entfernt. Das lässt sich nicht rückgängig machen. Tipp: vorher „Speichern“, dann hast du eine ZIP-Sicherung.": "All tracks, settings, lyrics and the cover of this project are removed from the browser. This can't be undone. Tip: “Save” first, then you have a ZIP backup.",
 "Abbrechen": "Cancel", "Ja, löschen": "Yes, delete", "Alles leeren und ein neues Projekt starten (fragt vorher nach)": "Clear everything and start a new project (asks first)"})

EXACT.update({"Projekt löschen mit Nachfrage:": "Delete project with a question:", "roter Knopf jetzt auch unten rechts im Monitor, beide fragen vorher in einem Fenster „Wirklich löschen?“": "red button now also at the bottom right of the monitor, both ask first in a window “Really delete?”"})

EXACT.update({"Wichtige Reparatur, doppeltes Abspielen:": "Important fix, double playback:", "lief der Song schon und wurde „Abspielen“ noch einmal ausgelöst (z. B. wenn eine Bearbeitung im Hintergrund fertig wurde, während du Play gedrückt hast), lief eine zweite Kopie mit, die sich nicht mehr stoppen ließ und alles doppelt so laut machte. Jetzt stoppt ein zweites Play immer zuerst sauber": "when the song was already playing and “Play” was triggered again (e.g. a background job finished while you pressed play), a second copy kept playing that could not be stopped and made everything twice as loud. Now a second play always stops cleanly first"})
EXACT.update({"Regen": "Rain", "Schnee": "Snow", "Glut-Funken": "Embers", "Lichteinfall": "Light leak", "Bokeh-Lichter": "Bokeh lights", "Staub & Kratzer": "Dust & scratches",
 "DANVIEL Gold": "DANVIEL Gold", "Regennacht": "Rainy night", "Eis": "Ice", "Sunset": "Sunset", "Glut": "Embers", "Vaporwave": "Vaporwave", "Alter Film": "Old film",
 "Gold und Creme, gespiegelte Balken, Bokeh-Lichter, Filmkorn": "Gold and cream, mirrored bars, bokeh lights, film grain",
 "Kühles Blau, feine Linie, dezenter Regen über dem Bild": "Cool blue, fine line, subtle rain over the picture",
 "Eisblau, Kreis-Balken ums Cover, Schnee und Sterne": "Ice blue, circle bars around the cover, snow and stars",
 "Orange und Pink, Fläche, Farbwolken und warmer Lichteinfall": "Orange and pink, filled spectrum, colour clouds and warm light leak",
 "Feuerfarben, Funken-Visualizer, aufsteigende Glut": "Fire colours, spark visualizer, rising embers",
 "Pink, Cyan und Lila, Retro-Pixel, Gitter und Scanlines": "Pink, cyan and purple, retro pixels, grid and scanlines",
 "Schwarz-weiß, Filmkorn, Staub und Kratzer": "Black and white, film grain, dust and scratches",
 "🎨 Smaragd": "🎨 Emerald", "🎨 Bordeaux": "🎨 Bordeaux", "🎨 Studio-Nebel": "🎨 Studio fog", "🎨 Gold-Linien": "🎨 Gold lines", "🎨 Chrom": "🎨 Chrome",
 "Smaragd": "Emerald", "Bordeaux": "Bordeaux", "Studio-Nebel": "Studio fog", "Gold-Linien": "Gold lines", "Chrom": "Chrome"})
EXACT.update({"Dein Song von Grund auf": "Your song from scratch",
 "Beats, Melodien, Loops und Aufnahmen, alles im Takt und ohne Vorkenntnisse. Jede neue Spur wird eine normale Spur zum Mischen.": "Beats, melodies, loops and recordings, all in time and no experience needed. Every new track becomes a normal track to mix.",
 "Kein Keyboard verbunden": "No keyboard connected", "Keyboard verbinden": "Connect keyboard", "Instrument-Spur anlegen": "Create instrument track",
 "Drum-Pattern": "Drum pattern", "Instrument": "Instrument", "Loop / Sample": "Loop / sample",
 "Töne einspielen: USB-Keyboard, Computer-Tastatur oder Maus": "Play notes: USB keyboard, computer keys or mouse",
 "USB-Keyboard: in Chrome oder Edge öffnen, dieser Browser kann kein MIDI": "USB keyboard: open in Chrome or Edge, this browser has no MIDI",
 "Kein Keyboard gefunden. Einstecken genügt, es wird sofort erkannt.": "No keyboard found. Just plug it in, it is detected right away.",
 "Du spielst gerade, aber keine Instrument-Spur ist offen.": "You are playing, but no instrument track is open.",
 "Keyboard erkannt. Leg eine Instrument-Spur an und spiel direkt los.": "Keyboard detected. Create an instrument track and start playing.",
 "Kein Zugriff aufs Keyboard. In der Adressleiste MIDI erlauben und nochmal klicken.": "No access to the keyboard. Allow MIDI in the address bar and click again.",
 "Wärme": "Warmth", "Höhen": "Highs", "Glue": "Glue", "Multiband": "Multiband", "Sättigung": "Saturation", "Breite": "Width", "Bass": "Bass", "Lautheit": "Loudness",
 "Hall": "Reverb", "Echo": "Echo", "Raum": "Room", "Platte": "plate", "Halle": "Hall", "1/8 punktiert": "1/8 dotted",
 "Hall-Menge": "Reverb amount", "Echo-Wiederholung": "Echo feedback", "Echo-Menge": "Echo amount", "Sidechain": "Sidechain",
 "Bass-EQ": "Bass EQ", "Höhen-EQ": "Treble EQ", "Kompressor": "Compressor", "De-Esser": "De-esser", "Pegel-Ride": "Level ride", "Low-Cut": "Low cut", "Mitten": "Mids", "Panorama": "Pan",
 "nichts zu ändern, der Mix hat das schon": "nothing to change, the mix already has it", "Der restliche Auto-Mix bleibt.": "The rest of the Auto-Mix stays.",
 "Aktiv, wird nach jedem Auto-Mix wieder obendrauf gelegt:": "Active, added on top again after every Auto-Mix:",
 "Nicht mehr merken (die aktuellen Regler bleiben, beim nächsten Auto-Mix fällt es weg)": "Forget it (the current settings stay, the next Auto-Mix drops it)",
 "Legt diesen Mastering-Klang obendrauf. Lautheit und Auto-Mix bleiben": "Adds this mastering sound on top. Loudness and Auto-Mix stay",
 "Legt diese Effekte obendrauf. Der restliche Auto-Mix bleibt": "Adds these effects on top. The rest of the Auto-Mix stays"})
PAT[:0] = [[r"^„(.+)“ rückgängig gemacht\.$", "“$1” undone."],
 [r"^Pakete wieder obendrauf gelegt: (\d+)$", "Packs added on top again: $1"],
 [r"^Keyboard verbunden: (.+)$", "Keyboard connected: $1"],
 [r"^Keyboard erkannt: (.+)\. Einfach spielen\.$", "Keyboard detected: $1. Just play."],
 [r"^MIDI-Keyboard verbunden: (.+)\. Einfach spielen\.$", "MIDI keyboard connected: $1. Just play."],
 [r"^Zu „(.+)“$", "Go to “$1”"]]
EXACT.update({"MIDI ausblenden": "Hide MIDI", "MIDI anzeigen": "Show MIDI",
 "MIDI-Spuren sind Noten aus Suno, gespielt von einem eingebauten Synth. Ausgeschaltete MIDI-Spuren sind ausgeblendet, damit die Liste übersichtlich bleibt.": "MIDI tracks are notes from Suno, played by a built-in synth. Switched-off MIDI tracks are hidden so the list stays tidy.",
 "Deine Videos (kommen beim Projekt-Speichern mit):": "Your videos (included when you save the project):", "Nochmal herunterladen": "Download again",
 "Alle Spuren, Einstellungen, Cover und Cover-Entwürfe, Logo, Lyrics, Hintergrund-Video und deine fertigen Videos in einer ZIP-Datei": "All tracks, settings, cover and cover drafts, logo, lyrics, background video and your finished videos in one ZIP file"})
PAT[:0] = [[r"^MIDI anzeigen \((\d+)\)$", "Show MIDI ($1)"],
 [r"^Projekt komplett geladen, mit (.+)\.$", "Project fully loaded, with $1."]]
EXACT.update({"Cover-Entwürfe": "cover drafts", "Videos": "videos"})
EXACT.update({"Drum-Pads oder Keyboard (Chrome/Edge): anschlagen = anhören. Läuft der Song, landet jeder Schlag direkt im Pattern, eingerastet aufs Sechzehntel.": "Drum pads or keyboard (Chrome/Edge): hit = listen. While the song plays, every hit goes straight into the pattern, snapped to the 16th.",
 "Drum-Spur anlegen": "Create drum track", "Du spielst Drum-Pads, aber keine Drum-Spur ist offen.": "You are playing drum pads, but no drum track is open.",
 "Drum-Pads erkannt. Leg eine Drum-Spur an und spiel direkt los.": "Drum pads detected. Create a drum track and start playing."})
EXACT.update({"🎨 Walnuss": "🎨 Walnut", "🎨 Studio-Holzwand": "🎨 Studio wood wall", "🎨 Graphit-Waben": "🎨 Graphite honeycomb", "🎨 Vinyl": "🎨 Vinyl", "🎨 Nachtstadt": "🎨 Night city", "🎨 Aurora": "🎨 Aurora", "🎨 Sunset": "🎨 Sunset", "🎨 Granit": "🎨 Granite", "🎨 Carbon-Gold": "🎨 Carbon gold", "🎨 Mattes Leder": "🎨 Matte leather",
 "Walnuss": "Walnut", "Studio-Holzwand": "Studio wood wall", "Graphit-Waben": "Graphite honeycomb", "Nachtstadt": "Night city", "Granit": "Granite", "Carbon-Gold": "Carbon gold", "Mattes Leder": "Matte leather"})
EXACT.update({"Samples": "Samples", "40 One-Shots: Claps, 808s, Crowd-Rufe, FX und deine eigenen": "40 one-shots: claps, 808s, crowd shouts, FX and your own",
 "DANVIEL One-Shots": "DANVIEL One-Shots",
 "Klick = anhören, „+ Drums“ legt das Sample als eigene Zeile ins Drum-Pattern. Alle Sounds sind hier im Studio erzeugt, frei verwendbar.": "Click = listen, “+ Drums” puts the sample into the drum pattern as its own row. Every sound is made right here in the studio, free to use.",
 "Drums": "Drums", "808 & Bass": "808 & bass", "Stimmen": "Voices", "Hits": "Hits", "FX": "FX", "Atmo": "Atmo", "Eigene": "Your own",
 "Anhören": "Listen", "Als eigene Zeile ins Drum-Pattern legen": "Put into the drum pattern as its own row", "Aus deinen Samples entfernen": "Remove from your samples", "Zeile entfernen": "Remove row",
 "+ Eigene Samples laden": "+ Load your own samples",
 "WAV, MP3 oder OGG bis 20 Sekunden, auch mehrere auf einmal oder einfach hier reinziehen. Sie bleiben in diesem Browser gespeichert und kommen beim Projekt-Speichern mit.": "WAV, MP3 or OGG up to 20 seconds, several at once or just drop them here. They stay saved in this browser and travel with the saved project.",
 "Neue Drum-Spur mit dem Sample angelegt. Klick die Kästchen in seiner Zeile an, wo es spielen soll.": "New drum track with the sample created. Click the boxes in its row where it should play.",
 "Sample als eigene Zeile im Drum-Pattern. Klick die Kästchen an, wo es spielen soll.": "Sample added as its own row in the drum pattern. Click the boxes where it should play.",
 "Clap": "Clap", "Clap groß": "Big clap", "Snap": "Snap", "Rim": "Rim", "Klack": "Clack", "Shaker": "Shaker", "Tamburin": "Tambourine", "Cowbell": "Cowbell", "Triangel": "Triangle", "Tom tief": "Low tom", "Tom hoch": "High tom", "Conga": "Conga",
 "808 kurz": "808 short", "808 lang": "808 long", "808 Glide": "808 glide", "808 verzerrt": "808 distorted", "Sub-Drop": "Sub drop", "Bass-Stab": "Bass stab",
 "Crowd „Hey!“": "Crowd “Hey!”", "Crowd „Ho!“": "Crowd “Ho!”", "Crowd „Yeah!“": "Crowd “Yeah!”", "Crowd „Uh!“": "Crowd “Uh!”",
 "Brass-Stab": "Brass stab", "Orchester-Hit": "Orchestra hit", "Piano-Stab": "Piano stab", "Pluck-Stab": "Pluck stab", "Air Horn": "Air horn", "Laser": "Laser",
 "Riser": "Riser", "Downlifter": "Downlifter", "Impact": "Impact", "Boom": "Boom", "Reverse-Crash": "Reverse crash", "Noise-Sweep": "Noise sweep", "Tape-Stop": "Tape stop", "Vinyl-Stop": "Vinyl stop",
 "Vinyl-Knistern": "Vinyl crackle", "Regen": "Rain", "Tape-Rauschen": "Tape hiss", "Wind": "Wind"})
PAT[:0] = [[r"^Eigene \((\d+)\)$", "Your own ($1)"],
 [r"^(\d+) eigene(?:s)? Samples? geladen(.*)\.$", "$1 own sample(s) loaded$2."],
 [r", (\d+) übersprungen \(kein Audio, zu groß oder länger als 20 Sekunden\)", ", $1 skipped (not audio, too big or longer than 20 seconds)"]]
EXACT.update({"Neu in v16.4": "New in v16.4", "Studio · v16.4": "Studio · v16.4", "Demo: Afrobeats": "Demo: Afrobeats", "Demo: Amapiano": "Demo: Amapiano", "Demo: Phonk": "Demo: Phonk", "Demo: Dancehall": "Demo: Dancehall", "Demo: Synthwave": "Demo: Synthwave", "Demo: Boom Bap": "Demo: Boom Bap"})
EXACT.update({"Bild": "Picture", "Cover in der Mitte": "Cover in the middle", "Vollbild (Ecke zu Ecke)": "Full screen (corner to corner)",
 "Cover oder Platte in der Mitte, Hintergrund im Style": "Cover or record in the middle, background in the style",
 "Dein Bild füllt das ganze Video von Ecke zu Ecke, mit langsamem Zoom": "Your picture fills the whole video corner to corner, with a slow zoom",
 "Im Video:": "In the video:", "Titel": "Title", "Visualizer": "Visualizer", "Lyrics": "Lyrics",
 "Lade oben ein Bild oder Cover, dann füllt es das ganze Video.": "Load a picture or cover above, then it fills the whole video."})
EXACT.update({"eigen": "own", "Verwerfen": "Discard", "Änderungen verwerfen, zurück zum gewählten Style": "Discard changes, back to the chosen style"})
EXACT.update({"Mitlaufend": "Karaoke sweep", "Die Zeile wird beim Singen mitlaufend markiert. Aus = die ganze Zeile steht sofort da": "The line is highlighted as it is sung. Off = the whole line shows right away"})
EXACT.update({"Graffiti (Sedgwick)": "Graffiti (Sedgwick)", "Spraydose (Rubik)": "Spray can (Rubik)", "Tropfende Farbe": "Dripping paint", "Abgenutzt (Rubik)": "Distressed (Rubik)", "Schablone (Saira)": "Stencil (Saira)", "Street (Wallpoet)": "Street (Wallpoet)", "Gotisch schmal (Pirata)": "Gothic narrow (Pirata)", "Gotisch modern (Grenze)": "Gothic modern (Grenze)", "Japan fett (Dela Gothic)": "Japanese bold (Dela Gothic)", "Metal (Metal Mania)": "Metal (Metal Mania)", "Rocker (New Rocker)": "Rocker (New Rocker)", "Mode-Magazin (Bodoni)": "Fashion magazine (Bodoni)", "Luxus dünn (Italiana)": "Luxury thin (Italiana)", "Antik (Marcellus)": "Antique (Marcellus)", "Edel schlicht (Tenor)": "Classy plain (Tenor)", "Hochzeit (Allura)": "Wedding (Allura)", "Signatur (Sacramento)": "Signature (Sacramento)", "Kugelschreiber (Homemade)": "Ballpoint pen (Homemade)", "3D-Schatten (Bungee)": "3D shadow (Bungee)", "Linien (Bungee Inline)": "Lines (Bungee Inline)", "Umriss 3D (Rampart)": "Outline 3D (Rampart)", "Schräg (Tilt Warp)": "Tilted (Tilt Warp)", "Bubble (Bagel)": "Bubble (Bagel)", "Tech breit (Michroma)": "Tech wide (Michroma)", "Sport (Russo One)": "Sport (Russo One)", "Breit modern (Krona)": "Wide modern (Krona)", "Rap & Trap": "Rap & trap", "Elegant": "Elegant", "Handschrift": "Handwriting", "Retro & Neon": "Retro & neon", "Klar & modern": "Clean & modern", "★ Favoriten": "★ Favourites", "Weitere": "More", "Schrift suchen …": "Search fonts …", "Als Lieblingsschrift merken": "Save as favourite font"})
EXACT.update({"Im Vollbild: Visualizer und Lyrics in der Vorschau verschieben, am goldenen Eck größer oder kleiner ziehen.": "In full screen: move the visualizer and lyrics in the preview, drag the gold corner to make them bigger or smaller.", "Zurück auf Standard": "Back to default"})
EXACT.update({"Neu in v16.5": "New in v16.5", "Studio · v16.5": "Studio · v16.5", "🖼 Bild hinzufügen": "🖼 Add picture", "Bild hinzufügen": "Add picture",
 "Ein eigenes Bild als Cover laden (oder einfach auf die Vorschau ziehen)": "Load your own picture as the cover (or just drop it on the preview)",
 "Bild oder Cover fürs Video laden (oder einfach auf die Vorschau ziehen)": "Load a picture or cover for the video (or just drop it on the preview)"})
EXACT.update({"Artist-Größe": "Artist size", "In der Vorschau: Cover oder Platte und Titel mit der Maus verschieben, am goldenen Eck größer oder kleiner ziehen.": "In the preview: move the cover or record and the title with the mouse, drag the gold corner to make them bigger or smaller.", "Cover zurücksetzen": "Reset cover"})
EXACT.update({"Verteilt die vorhandenen Lyrics automatisch auf die Stellen, an denen gesungen wird": "Spreads the lyrics you have automatically over the places where someone sings"})
EXACT.update({"Positionen zurücksetzen": "Reset positions", "In der Vorschau: Cover oder Platte, Titel, Lyrics und Visualizer mit der Maus verschieben, am goldenen Eck größer oder kleiner ziehen. In der Mitte rastet alles ein.": "In the preview: move the cover or record, title, lyrics and visualizer with the mouse, drag the gold corner to make them bigger or smaller. Everything snaps to the middle."})
EXACT.update({"Anfang tippen, Rest automatisch": "Tap the start, rest automatic",
 "Du tippst nur die ersten 3 Zeilen mit der Leertaste, danach verteilt die Automatik den Rest. Gut, wenn die Automatik am Anfang einen falschen Einsatz erwischt": "You tap only the first 3 lines with the space bar, then the automatic spreads the rest. Good when the automatic catches a wrong start",
 "Du tippst nur die ersten 3 Zeilen mit der Leertaste, danach verteilt die Automatik den Rest": "You tap only the first 3 lines with the space bar, then the automatic spreads the rest",
 "Verteile den Rest auf den Gesang …": "Spreading the rest over the vocals …"})
PAT[:0] = [[r"^Tippe die ersten (\d+) Zeilen mit der Leertaste genau dann, wenn sie beginnen\. Danach verteilt die Automatik den Rest auf den Gesang\.$", "Tap the first $1 lines with the space bar exactly when they start. Then the automatic spreads the rest over the vocals."],
 [r"^(\d+) Zeilen getippt, (\d+) automatisch dahinter auf den Gesang verteilt\. Prüf die Zeiten in der Vorschau\.$", "$1 lines tapped, $2 spread automatically over the vocals after them. Check the times in the preview."],
 [r"^Alle (\d+) Zeilen getippt\.$", "All $1 lines tapped."]]
