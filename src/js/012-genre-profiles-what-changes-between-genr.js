/* =====================================================================
   GENRE PROFILES: what changes between genres, based on common engineering practice
   lvl  = level offsets (dB) per stem group on top of the standard balance
   vox  = vocal effects, comp/deess = dynamics, sc = kick sidechain, tone = mastering tonal target
   (octave bands 31.5 Hz – 16 kHz, dB relative to the 125 Hz – 8 kHz average)
   ===================================================================== */
const GENRES = {
  pop:  {name:"Pop", lvl:{lead:1, bv:0.5, drums:0, bass:-0.5, perc:0, inst:0, synth:0}, hpfLead:100,
         vox:{revType:"plate", rev:10, bvRev:15, dly:6, note:"q", fb:20}, comp:{lead:45, bv:35, bass:40}, deess:50, sc:{amt:8, target:"bass"},
         master:{intensity:"stream", width:105, air:0.5, warm:0}, tone:[-3, 1.5, 1.5, 0.5, 0, -0.5, -1, -1.5, -3, -8],
         why:"Stimme vorne und klar, breites Stereobild, eher hell"},
  rnb:  {name:"R&B", lvl:{lead:1, bv:1.5, drums:-1.5, bass:0, perc:-1, inst:1, synth:0}, hpfLead:90,
         vox:{revType:"hall", rev:12, bvRev:18, dly:8, note:"de", fb:25}, comp:{lead:40, bv:30, bass:35}, deess:55, sc:{amt:5, target:"bass"},
         master:{intensity:"stream", width:105, air:0, warm:0.5, glue:40}, tone:[-2.5, 2, 2, 1, 0, -0.5, -1, -2, -3.5, -9],
         why:"warm und weich, etwas mehr Raum (Hall) auf Stimme und Harmonien, Drums etwas zurück"},
  trap: {name:"Hip-Hop / Trap", lvl:{lead:2, bv:-1, drums:0.5, bass:1.5, perc:-1, inst:-1.5, synth:-1.5}, hpfLead:110,
         vox:{revType:"room", rev:5, bvRev:10, dly:8, note:"e", fb:15}, comp:{lead:55, bv:40, bass:45}, deess:60, sc:{amt:12, target:"bass"},
         master:{intensity:"stream", width:100, air:0.5, warm:0}, tone:[0, 2.5, 1, 0, 0, -0.5, -1, -2, -3.5, -9],
         why:"Rap-Stimme trocken und vorne, kräftiges 808, schmaleres Stereobild, laut"},
  edm:  {name:"EDM / Big Room", lvl:{lead:0, bv:0, drums:1, bass:-0.5, perc:0, inst:-0.5, synth:1.5}, hpfLead:120,
         vox:{revType:"hall", rev:12, bvRev:16, dly:8, note:"de", fb:25}, comp:{lead:45, bv:35, bass:50}, deess:50, sc:{amt:20, target:"music"},
         master:{intensity:"stream", width:110, air:0.75, warm:0, glue:55, sat:20}, tone:[-1.5, 2, 1, 0, -0.5, -0.5, -0.5, -1, -2.5, -7],
         why:"Kick und Synths dominieren, starkes Pumpen (Sidechain), breit und hell, sehr laut"},
  house:{name:"House", lvl:{lead:0, bv:0, drums:1.5, bass:-0.5, perc:0.5, inst:-0.5, synth:0}, hpfLead:110,
         vox:{revType:"plate", rev:10, bvRev:14, dly:6, note:"de", fb:25}, comp:{lead:45, bv:35, bass:45}, deess:50, sc:{amt:15, target:"music"},
         master:{intensity:"stream", width:105, air:0.75, warm:0}, tone:[-2, 2, 1, 0, -0.5, -0.5, -0.5, -1, -2.5, -8],
         why:"Kick ist König, Bass und Akkorde pumpen mit, Hi-Hats präsent, clubtauglich laut"},
  cine: {name:"Cinematic / Film", lvl:{lead:0, bv:0, drums:-1, bass:-1, perc:-1.5, inst:1, synth:0}, hpfLead:90,
         vox:{revType:"hall", rev:14, bvRev:18, dly:0, note:"q", fb:15}, comp:{lead:25, bv:20, bass:15}, deess:40, sc:{amt:0, target:"bass"},
         master:{intensity:"dyn", width:115, air:0.5, warm:0.5, glue:25, sat:5, mb:15, level:0}, tone:[-1, 2, 1.5, 0, -0.5, -0.5, -1.5, -1.5, -2.5, -7],
         why:"viel Dynamik (leise Stellen bleiben leise), breit und räumlich, nur sanfte Kompression, leicht weniger 300 Hz und 3 kHz, −16 LUFS wie bei Soundtrack-Releases"},
  game: {name:"Game-Musik", lvl:{lead:0, bv:0, drums:0, bass:0, perc:0, inst:0.5, synth:0.5}, hpfLead:100,
         vox:{revType:"room", rev:8, bvRev:12, dly:0, note:"q", fb:15}, comp:{lead:35, bv:25, bass:35}, deess:45, sc:{amt:0, target:"bass"},
         master:{intensity:"dyn", width:110, air:0.5, warm:0.25, glue:40, sat:12, mb:30, level:30}, tone:[-2, 1.5, 1.5, 0.5, 0, -0.5, -1, -1.5, -3, -8],
         why:"gleichmäßig und loop-tauglich, klar, −16 LUFS und True Peak −1 dB (Standard für Mobile- und Handheld-Spiele)"},
  bgm:  {name:"Hintergrundmusik", lvl:{lead:-1, bv:-1, drums:-0.5, bass:0, perc:-1, inst:0.5, synth:0}, hpfLead:110,
         vox:{revType:"plate", rev:8, bvRev:12, dly:0, note:"q", fb:15}, comp:{lead:40, bv:30, bass:40}, deess:50, sc:{amt:0, target:"bass"},
         master:{intensity:"dyn", width:110, air:0, warm:0.5, glue:50, sat:10, mb:45, level:70}, tone:[-2, 1.5, 1.5, 0.5, 0, -1, -2.5, -2.5, -3, -8],
         why:"Lautstärke ohne Sprünge, weniger Präsenz in den Mitten (Platz für eine Stimme), weich, −16 LUFS"},
  rock: {name:"Rock / Band", lvl:{lead:0.5, bv:0, drums:0.5, bass:-1.5, perc:0, inst:1.5, synth:0}, hpfLead:100,
         vox:{revType:"plate", rev:8, bvRev:12, dly:4, note:"q", fb:15}, comp:{lead:45, bv:35, bass:50}, deess:45, sc:{amt:0, target:"bass"},
         master:{intensity:"stream", width:105, air:0.5, warm:0.25, glue:60}, tone:[-4, 1, 1.5, 1, 0.5, 0, -0.5, -1.5, -3.5, -9],
         why:"Gitarren tragen, Bass eher Fundament als Sub, warme Mitten"},
  // v16.2: new genres. Main row: Afrobeats, Drill, Lo-Fi. Behind "Mehr Genres": instrumental & film, global, club & electronic, band.
  afro: {name:"Afrobeats", lvl:{lead:1, bv:0.5, drums:0, bass:0, perc:1, inst:0, synth:-0.5}, hpfLead:95,
         vox:{revType:"plate", rev:10, bvRev:16, dly:8, note:"de", fb:25}, comp:{lead:45, bv:35, bass:40}, deess:50, sc:{amt:6, target:"bass"},
         master:{intensity:"stream", width:108, air:0.5, warm:0.5, glue:45}, tone:[-2.5, 2, 1.5, 0.5, 0, -0.5, -0.5, -1, -2.5, -7.5],
         why:"Percussion und Shaker präsent und breit, Kick punchig ohne zu viel Sub, Bass melodisch, Stimme vorne mit Hall und punktiertem Echo, warm und sauber",
         tab:["vorne, Hall + punktiertes Echo", "Percussion breit, Kick punchig", "Platte, punktiertes Echo", "leicht", "−14 LUFS, warm, breit"]},
  drill:{name:"Drill", lvl:{lead:1.5, bv:-1, drums:1, bass:0.5, perc:0, inst:-1.5, synth:-1}, hpfLead:120,
         vox:{revType:"room", rev:4, bvRev:8, dly:6, note:"e", fb:15}, comp:{lead:60, bv:40, bass:50}, deess:60, sc:{amt:10, target:"bass"},
         master:{intensity:"stream", width:105, air:0.5, warm:0, glue:55, sat:25}, tone:[0, 2.5, 1, 0, 0, -0.5, -0.5, -1.5, -3, -8.5],
         why:"die Kick führt (anders als bei Trap), 808 mit Glide etwas dahinter, harte Hi-Hats, Rap-Stimme trocken und aggressiv vorne, dunkel",
         tab:["trocken, aggressiv, vorne", "Kick führt, 808 dahinter", "kurzer Raum, 1/8-Echo", "808 leicht", "−14 LUFS, dunkel, druckvoll"]},
  lofi: {name:"Lo-Fi", lvl:{lead:-0.5, bv:-0.5, drums:-0.5, bass:0, perc:-1, inst:1, synth:0}, hpfLead:120,
         vox:{revType:"room", rev:10, bvRev:14, dly:6, note:"q", fb:20}, comp:{lead:40, bv:30, bass:35}, deess:45, sc:{amt:10, target:"music"},
         master:{intensity:"stream", width:100, air:-1, warm:1.5, glue:45, sat:40, level:40}, tone:[-2, 2, 2, 1, 0.5, 0, -1, -3, -6, -14],
         why:"warm und weich, Höhen bewusst gedämpft wie von Tape, leichte Sättigung, Keys vorne, sanftes Pumpen, entspannt",
         tab:["im Mix, weich", "Keys vorne, Drums sanft", "kleiner Raum", "sanft", "−14 LUFS, warm, Höhen gedämpft"]},
  classic:{name:"Klassik / Orchester", lvl:{lead:0, bv:0, drums:-1, bass:-0.5, perc:-1, inst:1, synth:0}, hpfLead:80,
         vox:{revType:"hall", rev:16, bvRev:18, dly:0, note:"q", fb:10}, comp:{lead:15, bv:10, bass:10}, deess:35, sc:{amt:0, target:"bass"},
         master:{intensity:"dyn", width:100, air:0.5, warm:0.25, glue:10, sat:0, mb:5, level:0}, tone:[-2, 1, 1, -0.5, 0, 0, -0.5, -1, -1.5, -5],
         why:"die natürliche Dynamik bleibt fast ganz, kaum Kompression, kein künstliches Verbreitern, nur Rumpeln weg und etwas Luft, −16 LUFS (üblich −16 bis −20), True Peak −1 dB",
         tab:["natürlich, im Raum", "Orchester trägt", "großer Saal", "aus", "−16 LUFS, volle Dynamik"]},
  inst: {name:"Instrumental / Beat", lvl:{lead:0, bv:0, drums:0.5, bass:0.5, perc:0, inst:0.5, synth:0.5}, hpfLead:100,
         vox:{revType:"plate", rev:8, bvRev:12, dly:6, note:"de", fb:20}, comp:{lead:40, bv:30, bass:45}, deess:45, sc:{amt:8, target:"bass"},
         master:{intensity:"stream", width:108, air:0.5, warm:0.25, glue:50}, tone:[-1.5, 2, 1.5, 0.5, 0, -0.5, -0.5, -1, -2.5, -7.5],
         why:"ohne Stimme: Melodie und Drums teilen sich die Mitte, Instrumente etwas breiter, kräftiges Low-End, Streaming-laut",
         tab:["–", "Melodie und Drums gleichwertig", "Platte", "leicht", "−14 LUFS, breit"]},
  latin:{name:"Reggaeton / Latin", lvl:{lead:1.5, bv:0.5, drums:1, bass:0.5, perc:0.5, inst:-1, synth:-0.5}, hpfLead:100,
         vox:{revType:"plate", rev:8, bvRev:14, dly:8, note:"e", fb:20}, comp:{lead:55, bv:40, bass:45}, deess:55, sc:{amt:10, target:"bass"},
         master:{intensity:"stream", width:108, air:0.75, warm:0, glue:55, sat:20}, tone:[-1, 2.5, 1, 0, 0, -0.5, -0.5, -1, -2.5, -7.5],
         why:"Dembow-Snare knackig und breit, Sub auf Schlag 1 und 3, Stimme laut und vorne, clubtauglich",
         tab:["laut und vorne", "Dembow-Snare knackig", "Platte, 1/8-Echo", "mittel", "−14 LUFS, hell, druckvoll"]},
  kpop: {name:"K-Pop", lvl:{lead:1, bv:1, drums:0.5, bass:0, perc:0, inst:0, synth:0.5}, hpfLead:110,
         vox:{revType:"plate", rev:10, bvRev:16, dly:6, note:"de", fb:20}, comp:{lead:55, bv:45, bass:45}, deess:55, sc:{amt:10, target:"bass"},
         master:{intensity:"stream", width:112, air:1, warm:0, glue:55, sat:20}, tone:[-2.5, 1.5, 1.5, 0.5, 0, -0.5, -0.5, -1, -2, -6.5],
         why:"sehr hell und glänzend, viele Stimmen dicht und vorne, breit und punchy",
         tab:["viele Stimmen, dicht, vorne", "punchy", "Platte", "mittel", "−14 LUFS, sehr hell, breit"]},
  amapiano:{name:"Amapiano", lvl:{lead:0, bv:0, drums:0, bass:1.5, perc:1, inst:0, synth:-0.5}, hpfLead:100,
         vox:{revType:"hall", rev:12, bvRev:16, dly:8, note:"de", fb:25}, comp:{lead:40, bv:30, bass:40}, deess:50, sc:{amt:8, target:"bass"},
         master:{intensity:"stream", width:108, air:0.5, warm:0.5, glue:45}, tone:[0, 2.5, 1.5, 0, 0, -0.5, -0.5, -1, -2.5, -7.5],
         why:"der Log-Drum-Bass trägt, Shaker und Percussion verspielt und breit, viel Raum, entspannt pumpend",
         tab:["mit viel Raum", "Log-Drum trägt, Shaker breit", "Saal, punktiertes Echo", "leicht", "−14 LUFS, warm, tief"]},
  gospel:{name:"Gospel / Worship", lvl:{lead:1, bv:1.5, drums:-0.5, bass:-0.5, perc:-1, inst:1, synth:0}, hpfLead:90,
         vox:{revType:"hall", rev:14, bvRev:20, dly:6, note:"q", fb:15}, comp:{lead:45, bv:35, bass:40}, deess:50, sc:{amt:0, target:"bass"},
         master:{intensity:"stream", width:110, air:0.5, warm:0.5, glue:45}, tone:[-3, 1.5, 1.5, 0.5, 0, -0.5, -1, -1.5, -3, -8],
         why:"Chor und Lead groß und emotional, Keys und Orgel tragen, viel Raum, warm",
         tab:["groß, Chor lauter", "Keys/Orgel tragen", "großer Saal", "aus", "−14 LUFS, warm, breit"]},
  country:{name:"Country", lvl:{lead:1, bv:0.5, drums:0, bass:-1, perc:-0.5, inst:1, synth:-1}, hpfLead:100,
         vox:{revType:"plate", rev:10, bvRev:14, dly:6, note:"q", fb:15}, comp:{lead:45, bv:35, bass:45}, deess:50, sc:{amt:0, target:"bass"},
         master:{intensity:"stream", width:105, air:0.75, warm:0.25, glue:50}, tone:[-4, 1, 1.5, 1, 0.5, 0, -0.5, -1, -2.5, -8],
         why:"Stimme und Gitarren tragen, natürliche Drums, warm und klar",
         tab:["vorne, natürlich", "Gitarren tragen", "Platte", "aus", "−14 LUFS, warm, klar"]},
  jazz: {name:"Jazz / Soul", lvl:{lead:0.5, bv:0, drums:-0.5, bass:0, perc:-0.5, inst:1, synth:-1}, hpfLead:80,
         vox:{revType:"hall", rev:12, bvRev:16, dly:0, note:"q", fb:10}, comp:{lead:30, bv:25, bass:30}, deess:40, sc:{amt:0, target:"bass"},
         master:{intensity:"dyn", width:105, air:0.25, warm:0.75, glue:25, sat:10, mb:15, level:0}, tone:[-2.5, 1.5, 1.5, 0.5, 0.5, 0, -0.5, -1, -2, -6.5],
         why:"natürlich und warm, viel Dynamik, Instrumente im Raum, kaum Kompression",
         tab:["warm, natürlich", "Band im Raum", "Saal", "aus", "−16 LUFS, viel Dynamik"]},
  techno:{name:"Techno", lvl:{lead:-1, bv:-1, drums:1.5, bass:0, perc:0.5, inst:-0.5, synth:0.5}, hpfLead:120,
         vox:{revType:"hall", rev:14, bvRev:18, dly:10, note:"de", fb:30}, comp:{lead:40, bv:30, bass:50}, deess:45, sc:{amt:18, target:"music"},
         master:{intensity:"stream", width:105, air:0.5, warm:0, glue:55, sat:25}, tone:[-0.5, 2.5, 1, 0, -0.5, -0.5, -0.5, -1, -2.5, -7.5],
         why:"Kick und Groove im Mittelpunkt, Bass tief und mittig, hypnotisch, viel Raum für Effekte",
         tab:["im Hintergrund, viel Hall", "Kick im Mittelpunkt", "langer Saal, Echo", "stark", "−14 LUFS, druckvoll"]},
  dnb:  {name:"Drum & Bass", lvl:{lead:0, bv:0, drums:1.5, bass:1, perc:0.5, inst:-0.5, synth:0.5}, hpfLead:120,
         vox:{revType:"hall", rev:12, bvRev:16, dly:8, note:"e", fb:25}, comp:{lead:45, bv:35, bass:55}, deess:50, sc:{amt:15, target:"music"},
         master:{intensity:"stream", width:110, air:1, warm:0, glue:60, sat:25}, tone:[-0.5, 2.5, 1, 0, -0.5, -0.5, -0.5, -1, -2, -6.5],
         why:"schnelle Breakbeats knackig, schwerer Sub-Bass, helle Snare, sehr energetisch",
         tab:["mit Hall", "Breakbeats knackig, Sub schwer", "Saal, 1/8-Echo", "mittel", "−14 LUFS, hell, energetisch"]},
  psy:  {name:"Psytrance / Goa", lvl:{lead:-1, bv:-1, drums:1.5, bass:1, perc:0, inst:-0.5, synth:1}, hpfLead:120,
         vox:{revType:"hall", rev:14, bvRev:18, dly:10, note:"de", fb:35}, comp:{lead:40, bv:30, bass:55}, deess:45, sc:{amt:25, target:"bass"},
         master:{intensity:"stream", width:112, air:1, warm:0, glue:55, sat:25}, tone:[-0.5, 2.5, 0.5, -0.5, -0.5, -0.5, -0.5, -1, -2, -6.5],
         why:"Kick und rollender Bass wechseln sich ab (starkes Sidechain), psychedelische Synths breit, hell und treibend",
         tab:["Samples mit Hall", "Kick + rollender Bass", "langer Saal, Echo", "sehr stark", "−14 LUFS, hell, breit"]},
  synthwave:{name:"Synthwave / Cyberpunk", lvl:{lead:0, bv:0, drums:0.5, bass:0, perc:-0.5, inst:0, synth:1.5}, hpfLead:110,
         vox:{revType:"hall", rev:14, bvRev:18, dly:10, note:"de", fb:30}, comp:{lead:45, bv:35, bass:45}, deess:50, sc:{amt:12, target:"music"},
         master:{intensity:"stream", width:115, air:0.75, warm:0.25, glue:50, sat:20}, tone:[-1.5, 2, 1.5, 0.5, 0, -0.5, -0.5, -1, -2.5, -7],
         why:"Retro-Synths und Gated-Reverb-Snare breit und neonhell, satter Bass, viel Hall",
         tab:["mit viel Hall", "Synths tragen, große Snare", "Saal, punktiertes Echo", "mittel", "−14 LUFS, sehr breit"]},
  phonk:{name:"Phonk", lvl:{lead:0, bv:-1, drums:1, bass:1.5, perc:0.5, inst:-0.5, synth:0.5}, hpfLead:120,
         vox:{revType:"room", rev:6, bvRev:10, dly:8, note:"e", fb:20}, comp:{lead:55, bv:40, bass:55}, deess:55, sc:{amt:15, target:"bass"},
         master:{intensity:"stream", width:105, air:0.5, warm:0.5, glue:60, sat:45}, tone:[0.5, 3, 1, 0, 0, -0.5, -0.5, -1, -2.5, -8],
         why:"verzerrter 808-Bass und Cowbell vorne, gesättigt und laut, Stimm-Samples im Hintergrund",
         tab:["Samples im Hintergrund", "808 verzerrt, Cowbell vorne", "kurzer Raum", "mittel", "−14 LUFS, gesättigt"]},
  metal:{name:"Metal", lvl:{lead:0, bv:0, drums:1, bass:-1, perc:0, inst:1.5, synth:-1}, hpfLead:110,
         vox:{revType:"plate", rev:6, bvRev:10, dly:4, note:"q", fb:10}, comp:{lead:55, bv:40, bass:60}, deess:50, sc:{amt:0, target:"bass"},
         master:{intensity:"stream", width:108, air:0.5, warm:0, glue:60, sat:25}, tone:[-3, 1.5, 1, 0.5, 0, -0.5, -0.5, -1, -3, -8.5],
         why:"breite Gitarrenwand, Kick und Snare setzen sich durch, Bass als Fundament, dicht und laut",
         tab:["kräftig, im Mix", "Gitarrenwand, Kick + Snare hart", "Platte, kurz", "aus", "−14 LUFS, dicht"]},
};
let GENRE = "auto", GENRE_USED = "pop", GENRE_WHY = "", GENRE_CONF = [];
const genreGroup = r => r==="lead" ? "lead" : r==="bv" ? "bv" : ["kick","snare","drums"].includes(r) ? "drums" : r==="bass" ? "bass" : ["hat","perc"].includes(r) ? "perc" : r==="synth" ? "synth" : ["guitar","keys","pad"].includes(r) ? "inst" : "other";
const prof = () => GENRES[GENRE_USED] || GENRES.pop;
function kickTimesOf(b){
  const D = 8, fs = b.sampleRate/D, n = Math.floor(b.length/D), x = new Float32Array(n);
  for(let c=0;c<b.numberOfChannels;c++){ const d=b.getChannelData(c); for(let i=0;i<n;i++) x[i]+=d[i*D]; }
  const k = 1-Math.exp(-2*Math.PI*150/fs); let y1=0, y2=0;
  for(let i=0;i<n;i++){ y1+=(x[i]-y1)*k; y2+=(y1-y2)*k; x[i]=y2; }
  const hop = Math.round(fs*0.005), nf = Math.floor(n/hop), e = new Float32Array(nf), on = new Float32Array(nf);
  for(let f=0;f<nf;f++){ let s=0; for(let i=f*hop;i<(f+1)*hop;i++) s+=x[i]*x[i]; e[f]=Math.sqrt(s/hop); }
  for(let f=1;f<nf;f++) on[f]=Math.max(0, e[f]-e[f-1]);
  const sorted = Array.from(on).sort((a,b)=>b-a), thr = (sorted[Math.floor(nf*0.01)]||0)*0.35, out = []; let last = -1;
  for(let f=2; f<nf-10; f++){
    if(on[f] < thr) continue;
    let isMax = true; for(let j=Math.max(0,f-10); j<=f+10; j++) if(on[j]>on[f]){ isMax=false; break; }
    if(!isMax) continue;
    const tm = f*hop/fs; if(last>=0 && tm-last < 0.1) continue; out.push(tm); last = tm;
  }
  return out;
}
// Share of the energy below ~90 Hz in the sum of all stems (dB, 0 = everything is sub/bass)
function subShareDb(){
  const D = 4, b0 = tracks[0].buffer, n = Math.floor(b0.length/D), x = new Float32Array(n);
  for(const t of tracks){ const b = t.buffer; for(let c=0;c<b.numberOfChannels;c++){ const d=b.getChannelData(c), g = 1/b.numberOfChannels; for(let i=0;i<n && i*D<d.length;i++) x[i]+=d[i*D]*g; } }
  const fs = b0.sampleRate/D, k = 1-Math.exp(-2*Math.PI*90/fs); let y1=0, y2=0, eL=0, eT=0;
  for(let i=0;i<n;i++){ y1+=(x[i]-y1)*k; y2+=(y1-y2)*k; eL+=y2*y2; eT+=x[i]*x[i]; }
  return 10*Math.log10((eL+1e-12)/(eT+1e-12));
}
// "Listens" to the song: tempo, kick pattern (four-on-the-floor?), sub-bass share and the stem names
function detectGenre(){
  const names = tracks.map(t=>t.name).join(" ");
  const bpm = song && song.bpm || 0, roles = tracks.map(t=>role(t.name));
  let kicks = SC.kicks;
  if(!kicks || !kicks.length){ const t = tracks.find(t=>["kick","drums"].includes(role(t.name))) || (tracks.length===1 ? tracks[0] : null); kicks = t ? kickTimesOf(t.buffer) : []; }
  let four = 0;
  if(bpm && kicks.length > 16){ const beat = 60/bpm; let hit = 0, all = 0;
    for(let i=1;i<kicks.length;i++){ const d = kicks[i]-kicks[i-1]; if(d > beat*3) continue; all++; if(Math.abs(d-beat) < beat*0.12) hit++; }
    four = all ? hit/all : 0; }
  const sub = subShareDb(), has808 = /808/i.test(names), guitars = roles.includes("guitar"), synths = roles.includes("synth"), vox = roles.includes("lead");
  const half = bpm >= 60 && bpm <= 87.5, trapTempo = (bpm >= 130 && bpm <= 175) || half;
  const sc = {pop:1, rnb:0, trap:0, edm:0, house:0, rock:0};
  if(four > 0.55 && bpm >= 113){ sc.house += 2; sc.edm += 2; if(bpm < 126) sc.house += 1.5; if(bpm >= 126 && bpm <= 140) sc.edm += 1.5; if(bpm > 140) sc.edm += 1; if(synths) sc.edm += 0.5; }
  else if(four > 0.55){ sc.pop += 1.5; sc.house += 0.5; }                 // steady kick but slow: dance-pop / disco feel
  else {
    if(trapTempo) sc.trap += 1;
    if(bpm >= 60 && bpm < 100) sc.rnb += 1.5;
    if(bpm >= 100 && bpm <= 130) sc.pop += 1;
  }
  if(has808) sc.trap += 3;
  if(sub > -2.5){ sc.trap += 1; sc.edm += 0.5; } else if(sub < -5){ sc.rock += 0.5; sc.pop += 0.5; }
  if(guitars && !has808 && four < 0.45){ sc.rock += 2; if(sub < -4) sc.rock += 1; }
  if(song && song.minor){ sc.rnb += 0.3; sc.trap += 0.3; }
  if(!vox) { sc.edm += 0.3; sc.house += 0.3; }
  const ranked = Object.entries(sc).sort((a,b)=>b[1]-a[1]), g = ranked[0][0];
  const ex = ranked.map(([k,v])=>[k, Math.exp(v*1.2)]), tot = ex.reduce((a,b)=>a+b[1],0);
  GENRE_CONF = ex.map(([k,v])=>[k, Math.round(v/tot*100)]);
  const bits = [];
  if(bpm) bits.push(Math.round(bpm) + " BPM");
  if(four > 0.55) bits.push("Kick auf jedem Schlag"); else if(kicks.length > 16) bits.push("Kick nicht durchgehend");
  if(has808) bits.push("808 gefunden");
  bits.push(sub > -2.5 ? "viel Sub-Bass" : sub < -5 ? "wenig Sub-Bass" : "normaler Bass-Anteil");
  if(guitars) bits.push("Gitarren");
  log("Genre-Erkennung:", JSON.stringify(sc), "· four", four.toFixed(2), "· sub", sub.toFixed(1), "dB");
  return {g, why: bits.join(", ")};
}
function resolveGenre(){
  if(GENRE !== "auto"){ GENRE_USED = GENRE; GENRE_WHY = ""; }
  else { const d = detectGenre(); GENRE_USED = d.g; GENRE_WHY = d.why; }
  genreUi();
  return prof();
}
function genreUi(){
  document.querySelectorAll("#genre button, #genre2 button").forEach(b=>b.setAttribute("aria-pressed", b.dataset.g === GENRE));
  { const gm = $("genreMore"); if(gm && gm.querySelector(`[data-g="${GENRE}"]`)) gm.open = true; }
  const p = prof();
  $("genreNote").textContent = !tracks.length ? "" : GENRE === "auto"
    ? (GENRE_WHY ? `Erkannt: ${p.name} (${GENRE_WHY}). ${GENRE_CONF.length ? `Sicherheit: ${GENRE_CONF[0][1]} %, danach ${GENRES[GENRE_CONF[1][0]].name} ${GENRE_CONF[1][1]} %. ` : ""}So wird gemischt: ${p.why}. Passt es nicht, wähl das Genre einfach selbst.` : "Beim Auto-Mix wird das Genre aus dem Song erkannt.")
    : `${p.name}: ${p.why}.`;
}
$("genre2").onclick = e=>$("genre").onclick(e);
document.querySelectorAll("#genre button[data-g], #genre2 button[data-g]").forEach(b=>{ const g = GENRES[b.dataset.g]; if(g && !b.title) b.title = `${g.name}: ${g.why}`; });
$("genre").onclick = async e=>{
  const gb = e.target.closest && e.target.closest("[data-g]"), g = gb && gb.dataset.g; if(!g) return;
  GENRE = g; if(g !== "auto" && GENRES[g]) GENRE_USED = g; genreUi(); saveSoon();
  if(tracks.length && AUTO_ON && !$("automix").disabled) await runAutoMix();   // only re-mix when Auto-Mix is switched on
};
async function autoBalance(){
  if(!stemLufs) stemLufs = tracks.map(t=>{ const b=t.buffer, c=[b.getChannelData(0)]; if(b.numberOfChannels>1) c.push(b.getChannelData(1)); return lufs(c,b.sampleRate); });
  const refs = tracks.map((t,i)=>stemLufs[i]-category(t.name)).filter(isFinite);
  const di = tracks.findIndex(t=>/(drum|beat)/i.test(t.name));
  const ref = di>=0 && isFinite(stemLufs[di]) ? stemLufs[di] : refs.sort((a,b)=>a-b)[refs.length>>1];
  const L = prof().lvl;
  tracks.forEach((t,i)=>{ if(!isFinite(stemLufs[i])) return; const off = L[genreGroup(role(t.name))] || 0; t.setVol(Math.max(0.05, Math.min(2, db2(ref+category(t.name)+off-stemLufs[i])))); });
}
function autoPan(){
  const count = {};
  tracks.forEach(t=>{
    const r = role(t.name), amt = AUTO_PAN[r]||0;
    t.wide = stereoWidth(t.buffer) > 0.12;
    if(!amt || t.wide){ t.pan = 0; }
    else { const k = count[r] = (count[r]||0)+1; const side = (FIRST_SIDE[r]||1) * (k%2 ? 1 : -1); t.pan = side*amt; }
    t.refresh();
  });
}
function autoEq(){ tracks.forEach(t=>{ const r = role(t.name); t.hpf = r==='lead' ? prof().hpfLead - 10 : (AUTO_HPF[r]||0); t.refresh(); }); autoSpace(); }
function autoLog(title){
  const box = $("autolog"); box.hidden = false;
  box.innerHTML = `<span><b>${esc(title)}</b></span>` + tracks.map(t=>{
    const v = 20*Math.log10(t.vol||1e-9), parts = [(v>=0?"+":"")+v.toFixed(1)+" dB", panTxt(t.pan)+(t.wide&&t.pan===0?" (schon Stereo)":""), t.hpf?"Low-Cut "+t.hpf+" Hz":"kein Low-Cut"];
    if(t.pg) parts.push(`${t.pg} dB bei ${fmtHz(t.pf)} (${t.why})`); if(t.comp) parts.push("Kompressor "+(1+3*t.comp/100).toFixed(1)+":1"); if(t.deess) parts.push("De-Esser "+t.deess+" %"); if(ducked(t)) parts.push("Sidechain "+SC.amt+" %"); if(t.rev) parts.push("Hall "+t.rev+" %"); if(t.dly) parts.push("Echo "+t.dly+" %");
    return `<span>${esc(t.name)}: ${parts.join(" · ")}</span>`; }).join("");
}
const after = ()=>{ applyGains(); updateUI(); scheduleAnalysis(); };
$("autobal").onclick = async ()=>{ if(isSingleSong()) return singleSongNote("Auto-Balance"); setStatus("Messe Lautheit der Stems …"); await sleep0(); await autoBalance(); after(); autoLog("Auto-Balance"); setStatus("Auto-Balance gesetzt. Hör rein und korrigier bei Bedarf per Regler."); };
$("autopan").onclick = ()=>{ if(isSingleSong()) return singleSongNote("Auto-Pan"); autoPan(); after(); autoLog("Auto-Pan: Kick, Snare, Bass und Lead-Vocal bleiben in der Mitte, der Rest wird verteilt"); setStatus("Auto-Pan gesetzt."); };
$("autoeq").onclick = async ()=>{ if(isSingleSong()) return singleSongNote("Auto-EQ"); setStatus("Auto-EQ hört rein …"); await sleep0(); autoEq(); after(); autoLog("Auto-EQ: Low-Cuts je nach Instrument, Platz-EQ wo sich Spuren im Weg stehen"); setStatus("Auto-EQ gesetzt."); };
const isSingleSong = () => tracks.length === 1;
function singleSongNote(what){
  setStatus(`${what} braucht mehrere Spuren. Du hast einen fertigen Song als eine Spur geladen, der ist schon gemischt. Zum Mischen lad die einzelnen Stems, oder nutz direkt das Mastering.`);
}
function revAmtUi(){ document.querySelectorAll("#revAmt button").forEach(b=>b.setAttribute("aria-pressed", b.dataset.r===REV_AMT)); }
$("revAmt").onclick = e=>{ const r = e.target.dataset && e.target.dataset.r; if(!r) return; REV_AMT = r; revAmtUi(); saveSoon();
  if(AUTO_ON && tracks.length && !isSingleSong()){ autoVocalFx(); if(playing){ stop(); play(); } after(); setStatus(`Hall beim Auto-Mix: ${e.target.textContent}.`); } };
$("restoreLast").onclick = ()=>{ if(!RESTORE_PJ) return; const pj = RESTORE_PJ; RESTORE_PJ = null; $("restoreLast").hidden = true;
  applyProject(pj); setAutoOn(!!pj.autoOn); after(); setStatus("Einstellungen vom letzten Mal geladen."); };
// switching Auto-Mix off: back to the plain stems, mastering off
function autoMixOff(){
  tracks.forEach(t=>{ if(t.dn) setDenoise(t, 0, true); });
  tracks.forEach(t=>{ t.setVol(1); t.ride=0; t.pan=0; t.hpf=0; t.low=0; t.high=0; t.pg=0; t.pf=2000; t.rev=0; t.dly=0; t.comp=0; t.deess=0; t.why=""; t.refresh(); });
  SC.amt = 0; syncSc(); syncFx(); if(M.on) setMasterOn(false); setAutoOn(false); $("autolog").hidden = true; after();
  setStatus("Auto-Mix aus: alles wieder wie die Original-Stems, Mastering aus.");
}
$("automix").onclick = async ()=>{
  if(AUTO_ON){ autoMixOff(); return; }
  await runAutoMix();
};
async function runAutoMix(){
  if(isSingleSong()){
    const t = tracks[0]; t.setVol(1); Object.assign(t, {pan:0, hpf:0, low:0, high:0, pg:0, rev:0, dly:0, comp:0, deess:0, why:""}); t.refresh(); SC.amt = 0; syncFx();
    MIX_HISS = false; const dnS = [];
    if(!SC.kicks) detectKicks();
    genreMaster(resolveGenre());
    after();
    const box = $("autolog"); box.hidden = false;
    box.innerHTML = `<span><b>Auto-Mix: fertiger Song erkannt</b></span><span>${esc(t.name)}: ${dnS.length ? "Rauschen sanft entfernt, sonst nichts verändert" : "nichts verändert (Lautstärke, Panorama und Klang bleiben original)"}</span><span>Mastering eingeschaltet: Streaming −14 LUFS, True Peak −1 dB, Mehrband-Kompression, Klangbalance automatisch</span><span>Tipp: Mit den einzelnen Stems kann der Auto-Mix jede Spur bearbeiten.</span>`;
    setStatus("Fertiger Song erkannt: Nur das Mastering wurde eingeschaltet, der Mix selbst bleibt unverändert.");
    setAutoOn(true); return;
  }
  $("automix").disabled = true; setStatus("Auto-Mix: hört sich den Song an …"); await sleep0();
  if(!SC.kicks) detectKicks();
  const GP = resolveGenre(); setStatus(`Auto-Mix: ${GP.name} · messe Stems …`); await sleep0();
  const dnDone = await autoDenoise();
  await autoBalance(); autoPan(); setStatus("Auto-Mix: hört, wo sich Spuren im Weg stehen …"); await sleep0(); autoEq(); autoVocalFx(); autoDynamics();
  await cmkReady(tracks);
  genreMaster(GP);
  after(); autoLog(`Auto-Mix erledigt · Genre: ${GP.name}` + (dnDone.length ? ` · Rauschen entfernt: ${dnDone.join(", ")}` : "")); $("automix").disabled = false; setAutoOn(true);
  setStatus(`Auto-Mix fertig (${GP.name}): Lautstärken, Panorama, EQ, Effekte, Sidechain und Mastering (${M.target} LUFS) sind auf ${GP.name} abgestimmt. Drück Play.`);
}
// Mastering per genre: loudness, width, brightness/warmth and the tonal target
const GENRE_BASS = {trap:20, edm:10, house:10, drill:15, afro:10, latin:15, amapiano:20, phonk:25, dnb:10, techno:10, psy:10};
function genreMaster(GP){
  const m = GP.master; M.intensity = m.intensity; M.style = "bal"; applyPreset();
  M.width = m.width; M.air = Math.round((M.air + m.air)*4)/4; M.warm = Math.round((M.warm + m.warm)*4)/4;
  if(m.glue) M.glue = m.glue; if(m.sat) M.sat = m.sat;
  if(MIX_HISS) M.air = Math.min(M.air, 0);   // hiss: don't lift the very top, it would bring the noise back up
  M.bass = (GP.bassBoost != null ? GP.bassBoost : GENRE_BASS[GENRE_USED]) || 0; M.level = m.level ?? 50; if(m.mb != null) M.mb = m.mb;   // gentle: more is one click away syncBassLevel();
  M.preset = m.intensity; M.tone = true; mixSpec = null;
  if(!M.on) setMasterOn(true); else applyMaster();
  syncKnobs(); scheduleAnalysis();
}
$("resetvol").onclick = ()=>{ setAutoOn(false); tracks.forEach(t=>{ t.setVol(1); t.ride=0; t.pan=0; t.hpf=0; t.low=0; t.high=0; t.pg=0; t.pf=2000; t.rev=0; t.dly=0; t.comp=0; t.deess=0; t.why=""; t.refresh(); }); SC.amt = 0; syncFx(); $("autolog").hidden = true; after(); setStatus("Mix zurückgesetzt: alle Spuren wieder so, wie sie geliefert wurden."); };

