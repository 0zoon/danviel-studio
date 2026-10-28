/* ---------- Packs: shareable settings (no code). Mastering, effects, track chains, visualizer and cover styles ---------- */
const PK_ROLES = {lead:"Lead-Gesang", bv:"Background-Gesang", drums:"Drums", bass:"Bass", keys:"Keys", guitar:"Gitarre", synth:"Synth", any:"jede Spur"};
const PK_STARTER = {type:"danviel-pack", version:1, id:"danviel-starter", name:"DANVIEL Starter-Pack", author:"DANVIEL", builtin:true,
  description:"Ein paar bewährte Einstellungen zum Ausprobieren und als Vorlage für eigene Pakete.",
  master:[
    {name:"Club Punch", values:{loud:true, target:-9, warm:0.5, air:1, glue:65, mb:60, sat:35, width:115, bass:65, level:0}},
    {name:"Radio Clean", values:{target:-12, warm:0.25, air:1.25, glue:55, mb:45, sat:15, width:110, bass:0, level:50}},
    {name:"Warm Lo-Fi", values:{target:-14, warm:1.5, air:-1, glue:45, mb:30, sat:40, width:100, bass:35, level:50}},
    {name:"Natürlich & offen", values:{target:-16, warm:0.25, air:0.5, glue:25, mb:20, sat:5, width:105, bass:0, level:0}}],
  fx:[
    {name:"Trap Space", values:{revType:"plate", revLvl:70, dlyNote:"e", dlyFb:35, dlyLvl:90, scAmt:15, scTarget:"bass"}},
    {name:"R&B Hall", values:{revType:"hall", revLvl:90, dlyNote:"q", dlyFb:25, dlyLvl:60, scAmt:5, scTarget:"bass"}},
    {name:"Trocken & nah", values:{revType:"room", revLvl:40, dlyNote:"de", dlyFb:15, dlyLvl:40, scAmt:0, scTarget:"bass"}}],
  chains:[
    {name:"Trap Lead Vocal", for:"lead", values:{hpf:100, low:-1, high:2.5, pf:3000, pg:-1, comp:60, deess:50, ride:50, rev:15, dly:20, pan:0}},
    {name:"R&B Smooth Vocal", for:"lead", values:{hpf:80, low:0.5, high:1.5, comp:45, deess:40, ride:40, rev:30, dly:10, pan:0}},
    {name:"Backing Vocals soft", for:"bv", values:{hpf:150, low:-2, high:1.5, comp:40, deess:40, rev:35, dly:10}},
    {name:"Tight Drums", for:"drums", values:{hpf:30, low:1, high:1, comp:50, rev:0, dly:0, pan:0}},
    {name:"Deep 808", for:"bass", values:{hpf:25, low:2, high:-2, comp:40, rev:0, dly:0, pan:0}},
    {name:"Soft Keys", for:"keys", values:{hpf:120, low:-1.5, high:-0.5, pf:500, pg:-1.5, comp:20, rev:25}}],
  vstyles:[], cstyles:[]};
const PK_GENRE = {type:"danviel-pack", version:1, id:"danviel-genres", name:"DANVIEL Genre-Pack", author:"DANVIEL", builtin:true,
  description:"Mix- und Mastering-Vorlagen für Trap, Drill, Afrobeats, Lo-Fi, Radio und Club, nach den üblichen Studio-Einstellungen.",
  master:[
    {name:"Club laut", values:{loud:true, target:-9, warm:0.5, air:1.25, glue:65, mb:60, sat:35, width:112, bass:60, level:0}},
    {name:"Spotify sauber", values:{target:-14, warm:0.25, air:1, glue:45, mb:35, sat:12, width:108, bass:0, level:40}},
    {name:"Vinyl warm", values:{target:-14, warm:1.25, air:-0.5, glue:45, mb:30, sat:30, width:102, bass:20, level:30}},
    {name:"Lo-Fi weich", values:{target:-14, warm:1.75, air:-1.5, glue:45, mb:30, sat:45, width:100, bass:30, level:40}},
    {name:"Cinema dynamisch", values:{target:-16, warm:0.25, air:0.5, glue:20, mb:15, sat:5, width:115, bass:0, level:0}},
    {name:"Drill dunkel", values:{target:-12, warm:0, air:0.25, glue:60, mb:50, sat:30, width:105, bass:45, level:30}}],
  fx:[
    {name:"Afro Bounce", values:{revType:"plate", revLvl:70, dlyNote:"de", dlyFb:30, dlyLvl:80, scAmt:6, scTarget:"bass"}},
    {name:"Dark Drill", values:{revType:"room", revLvl:35, dlyNote:"e", dlyFb:20, dlyLvl:60, scAmt:10, scTarget:"bass"}},
    {name:"Lo-Fi Tape", values:{revType:"room", revLvl:70, dlyNote:"q", dlyFb:25, dlyLvl:50, scAmt:12, scTarget:"music"}},
    {name:"Wide Hook", values:{revType:"hall", revLvl:100, dlyNote:"de", dlyFb:35, dlyLvl:90, scAmt:5, scTarget:"bass"}},
    {name:"Club Pump", values:{revType:"hall", revLvl:60, dlyNote:"de", dlyFb:25, dlyLvl:60, scAmt:25, scTarget:"music"}}],
  chains:[
    {name:"Trap Vocal Chain", for:"lead", values:{hpf:110, low:-1.5, high:3, pf:3500, pg:-1, comp:65, deess:60, ride:60, rev:10, dly:25, pan:0}},
    {name:"Drill Vocal", for:"lead", values:{hpf:120, low:-2, high:2.5, pf:2500, pg:-1.5, comp:70, deess:60, ride:60, rev:5, dly:15, pan:0}},
    {name:"Afro Vocal", for:"lead", values:{hpf:95, low:0, high:2, comp:50, deess:50, ride:45, rev:30, dly:25, pan:0}},
    {name:"Radio-Stimme", for:"any", values:{hpf:300, low:-6, high:-4, pf:1500, pg:0, comp:70, deess:40, rev:5, dly:0}},
    {name:"Lo-Fi Keys", for:"keys", values:{hpf:150, low:1, high:-4, pf:4000, pg:-2, comp:30, rev:35, dly:10}},
    {name:"Ad-Libs breit", for:"bv", values:{hpf:180, low:-3, high:2, comp:45, deess:45, rev:40, dly:30, pan:40}},
    {name:"Drill 808", for:"bass", values:{hpf:28, low:1.5, high:-1, comp:50, rev:0, dly:0, pan:0}}],
  vstyles:[], cstyles:[]};
const pkNum = (v, lo, hi) => typeof v === "number" && isFinite(v) ? Math.max(lo, Math.min(hi, v)) : undefined;
const pkStr = (v, n) => typeof v === "string" ? v.replace(/[<>]/g, "").trim().slice(0, n) : "";
function pkClean(o){
  if(!o || typeof o !== "object" || o.type !== "danviel-pack") return null;
  const name = pkStr(o.name, 40); if(!name) return null;
  const vals = (src, spec) => { const out = {}; if(!src || typeof src !== "object") return out; for(const [k, lo, hi] of spec){ if(typeof lo === "object"){ if(lo.includes(src[k])) out[k] = src[k]; } else { const v = pkNum(src[k], lo, hi); if(v !== undefined) out[k] = v; } } return out; };
  const MS = [["target",-18,-7],["warm",-3,3],["air",-3,3],["glue",0,100],["mb",0,100],["sat",0,100],["width",80,140],["bass",0,200],["level",0,100]];
  const FS = [["revType",["room","plate","hall"]],["revLvl",0,150],["dlyNote",["e","de","q"]],["dlyFb",0,70],["dlyLvl",0,150],["scAmt",0,100],["scTarget",["bass","music","all"]]];
  const CS = [["pan",-100,100],["hpf",0,300],["low",-6,6],["high",-6,6],["pf",100,12000],["pg",-6,0],["comp",0,100],["deess",0,100],["ride",0,100],["rev",0,100],["dly",0,100]];
  const list = (a, spec, extra) => (Array.isArray(a) ? a : []).slice(0, 40).map(x=>{ const n = pkStr(x && x.name, 40); if(!n) return null; const v = vals(x.values, spec); if(!Object.keys(v).length) return null; if(spec === MS && x.values && x.values.loud === true) v.loud = true; return {name:n, values:v, ...(extra ? extra(x) : {})}; }).filter(Boolean);
  const vst = (Array.isArray(o.vstyles) ? o.vstyles : []).slice(0, 20).map(x=>{ try{ return vsClean(x); }catch(e){ return null; } }).filter(Boolean);
  const cst = (Array.isArray(o.cstyles) ? o.cstyles : []).slice(0, 20).map(x=>{ const n = pkStr(x && x.name, 40), pr = pkStr(x && x.prompt, 4000); return n && pr ? {name:n, prompt:pr} : null; }).filter(Boolean);
  return {type:"danviel-pack", version:1, id: pkStr(o.id, 60) || ("p" + Date.now()), name, author: pkStr(o.author, 40), description: pkStr(o.description, 200), builtin: !!o.builtin && (o.id === "danviel-starter" || o.id === "danviel-genres"),
    master: list(o.master, MS), fx: list(o.fx, FS), chains: list(o.chains, CS, x=>({for: PK_ROLES[x.for] ? x.for : "any"})), vstyles: vst, cstyles: cst};
}
let PACKS = [];
try{ PACKS = (JSON.parse(localStorage.getItem("stemmixer:packs") || "[]") || []).map(pkClean).filter(Boolean); }catch(e){ PACKS = []; }
PACKS = PACKS.map(p=>p.id === "danviel-starter" ? pkClean(PK_STARTER) : p.id === "danviel-genres" ? pkClean(PK_GENRE) : p);
if(!PACKS.some(p=>p.id === "danviel-starter")) PACKS.unshift(pkClean(PK_STARTER));
if(!PACKS.some(p=>p.id === "danviel-genres")) PACKS.splice(1, 0, pkClean(PK_GENRE));
const pkSave = ()=>{ try{ localStorage.setItem("stemmixer:packs", JSON.stringify(PACKS)); }catch(e){} };
function pkInstallStyles(pk){
  let nv = 0, nc = 0;
  pk.vstyles.forEach(d=>{ try{ VSTYLES[vsSlug(d.name)] = vsBuild(d); nv++; }catch(e){} });
  if(nv){ vsSaveAll(); try{ vStyleUi(); }catch(e){} }
  pk.cstyles.forEach(c=>{ if(STYLES_.some(x=>x.name === c.name && x.prompt === c.prompt)) return; STYLES_.push({id:"s" + Date.now() + Math.floor(Math.random()*1e4), name:c.name, prompt:c.prompt}); nc++; });
  if(nc){ saveStyles(); try{ renderStyles(); }catch(e){} }
  return [nv, nc];
}
