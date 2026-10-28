/* ===== v16.4: DANVIEL One-Shots, 40 sounds made right here (no downloads, no copyright), plus your own samples ===== */
const SMP = (()=>{
  const TW = 2*Math.PI;
  // biquad that keeps its state when the frequency moves (no clicks when filters sweep)
  const bq = (type, f, q, fs) => { let B0, B1, B2, A1, A2, x1 = 0, x2 = 0, y1 = 0, y2 = 0;
    const set = (f, q) => { const w = TW*Math.min(f, fs*0.45)/fs, c = Math.cos(w), s = Math.sin(w), a = s/(2*q); let b0, b1, b2;
      if(type === "lp"){ b0 = (1-c)/2; b1 = 1-c; b2 = b0; } else if(type === "hp"){ b0 = (1+c)/2; b1 = -(1+c); b2 = b0; } else { b0 = a; b1 = 0; b2 = -a; }
      const a0 = 1+a; B0 = b0/a0; B1 = b1/a0; B2 = b2/a0; A1 = -2*c/a0; A2 = (1-a)/a0; };
    set(f, q);
    const run = x => { const y = B0*x + B1*x1 + B2*x2 - A1*y1 - A2*y2; x2 = x1; x1 = x; y2 = y1; y1 = y; return y; }; run.set = set; return run; };
  const mkRnd = sd => { let s = sd || 7; return () => { s = (s*16807) % 2147483647; return s/2147483647*2 - 1; }; };
  const buf = (fs, sec) => new Float32Array(Math.max(1, Math.round(fs*sec)));
  const exp = (t, d) => Math.exp(-t/d);
  // generic voices
  const tone = (fs, sec, fn) => { const o = buf(fs, sec); let ph = 0; for(let i=0;i<o.length;i++){ const t = i/fs, r = fn(t); ph += r.f/fs; o[i] = Math.sin(TW*ph)*r.a; } return o; };
  const noiseHit = (fs, sec, sd, filt, env) => { const o = buf(fs, sec), r = mkRnd(sd), F = filt.map(([ty,f,q]) => bq(ty, f, q, fs)); for(let i=0;i<o.length;i++){ let x = r(); for(const f of F) x = f(x); o[i] = x*env(i/fs); } return o; };
  const add = (a, b, g, off) => { const o = Math.round(off||0); for(let i=0;i<b.length && i+o<a.length;i++) a[i+o] += b[i]*(g===undefined?1:g); return a; };
  const saw = (ph) => 2*(ph - Math.floor(ph + 0.5));
  const chordSaw = (fs, sec, fr, env, cut, det) => { const o = buf(fs, sec), ph = fr.map(()=>[0,0]), lpf = bq("lp", cut(0), 0.9, fs);
    for(let i=0;i<o.length;i++){ const t = i/fs; let x = 0; fr.forEach((f,k)=>{ ph[k][0] += f/fs; ph[k][1] += f*(1+(det||0.006))/fs; x += saw(ph[k][0]) + saw(ph[k][1]); });
      if(i % 32 === 0) lpf.set(cut(t), 0.9); o[i] = lpf(x/fr.length*0.5)*env(t); } return o; };
  const karplus = (fs, f, sec, sd, damp) => { const o = buf(fs, sec), n = Math.max(2, Math.round(fs/f)), d = new Float32Array(n), r = mkRnd(sd); for(let i=0;i<n;i++) d[i] = r();
    let p = 0; for(let i=0;i<o.length;i++){ const a = d[p], b = d[(p+1)%n]; o[i] = a; d[p] = (a+b)*0.5*(damp||0.996); p = (p+1)%n; } return o; };
  const reverse = a => a.slice().reverse();
  // formant voice: glottal pulse + three moving formants, h-noise at the start; crowd = several voices, slightly off in time and pitch
  const V = {e:[530,1840,2480], i:[300,2250,2950], o:[540,850,2400], a:[760,1150,2500], u:[640,1190,2390]};
  function voice(fs, f0, segs, sec, sd, aspir){
    const o = buf(fs, sec), r = mkRnd(sd); let ph = 0, pg = 0; const G = [1, 2.8, 2.2], F = [0,1,2].map(j=>bq("bp", 500, j ? 9 : 6, fs)), hp = bq("hp", 150, 0.7, fs), hp2 = bq("hp", 150, 0.7, fs);
    const at = t => { let k = 0; while(k < segs.length-1 && segs[k+1][0] <= t) k++; const s0 = segs[k], s1 = segs[Math.min(k+1, segs.length-1)]; const u = s1[0] > s0[0] ? Math.min(1, (t - s0[0])/(s1[0]-s0[0])) : 0; return [0,1,2].map(j=>s0[1][j] + (s1[1][j]-s0[1][j])*u); };
    for(let i=0;i<o.length;i++){
      const t = i/fs; if(i % 16 === 0){ const fr = at(t); fr.forEach((f,j)=>F[j].set(f, j ? 9 : 6)); }
      const fq = f0*(1 + 0.08*Math.exp(-t*12) - 0.12*t/sec + 0.012*Math.sin(TW*5.5*t)) * (1 + 0.004*r());
      ph += fq/fs; const g0 = Math.pow(Math.max(0, Math.sin(Math.PI*(ph % 1))), 3), glot = (g0 - pg)*6; pg = g0;
      const env = Math.min(1, t/0.02) * (t > sec - 0.12 ? Math.max(0, (sec - t)/0.12) : 1);
      const h = t < aspir ? 1 - t/aspir : 0, src = glot*(1 - h)*env + r()*0.9*h*Math.min(1, t/0.008);
      let x = 0; for(let j=0;j<3;j++) x += F[j](src)*G[j]; o[i] = hp2(hp(x));
    } return o;
  }
  function crowd(fs, segs, sec, sd){ const L = buf(fs, sec + 0.06), R = buf(fs, sec + 0.06), r = mkRnd(sd);
    const f0s = [118, 132, 104, 196, 224, 150, 172];
    f0s.forEach((f, k)=>{ const v = voice(fs, f*(1+0.03*r()), segs, sec*(0.92 + 0.1*Math.abs(r())), sd*31 + k, 0.05 + 0.02*Math.abs(r())), off = Math.abs(r())*0.035*fs, p = (k/(f0s.length-1))*2 - 1;
      add(L, v, 0.6 - 0.35*p, off); add(R, v, 0.6 + 0.35*p, off); });
    return [L, R]; }
  const space = (fs, a, mix, dec) => { const N = a.length + Math.round(fs*dec), o = new Float32Array(N), taps = [0.0297, 0.0371, 0.0411, 0.0437, 0.0533, 0.0617], damp = bq("lp", 5000, 0.7, fs);
    const combs = taps.map(t=>({d: Math.round(t*fs), g: Math.pow(0.001, t/dec), b: new Float32Array(N)}));
    for(let i=0;i<N;i++){ const x = i < a.length ? a[i] : 0; let y = 0; for(const c of combs){ const v = x + (i >= c.d ? c.b[i - c.d]*c.g : 0); c.b[i] = v; y += v; } o[i] = x + damp(y/combs.length)*mix; } return o; };
  const crash = (fs, sec, sd) => { const n = noiseHit(fs, sec, sd, [["hp", 5200, 0.7]], t=>exp(t, sec/4)), m = buf(fs, sec); [3150, 4470, 5870, 7300, 8650].forEach((f,k)=>{ for(let i=0;i<m.length;i++) m[i] += Math.sign(Math.sin(TW*f*i/fs + k))*0.05*exp(i/fs, sec/5); }); return add(n, m); };
  const kick808 = (fs, sec, f1, f2, glide, drive) => tone(fs, sec, t=>({f: (t < glide ? f1 + (f2 - f1)*t/glide : f2) + 60*exp(t, 0.02), a: exp(t, sec/3.2)*Math.min(1, t/0.002)})).map(x => drive ? Math.tanh(x*drive)/Math.tanh(drive) : x);
  const G = {
    drums:"Drums", bass:"808 & Bass", voice:"Stimmen", hits:"Hits", fx:"FX", atmo:"Atmo", own:"Eigene"
  };
  const LIST = [
    ["clap","Clap","drums", fs=>{ const o = buf(fs, 0.4); [0, 0.009, 0.019].forEach((d,k)=>add(o, noiseHit(fs, 0.03, 11+k, [["bp",1300,1.1],["hp",700,0.7]], t=>exp(t,0.006)), 1, d*fs)); return add(o, noiseHit(fs, 0.35, 19, [["bp",1200,0.9]], t=>exp(t,0.07)), 0.9, 0.025*fs); }],
    ["clapbig","Clap groß","drums", fs=>{ const o = buf(fs, 0.5); [0, 0.011, 0.023, 0.031].forEach((d,k)=>add(o, noiseHit(fs, 0.04, 21+k, [["bp",1100,1],["hp",600,0.7]], t=>exp(t,0.008)), 1, d*fs)); return space(fs, add(o, noiseHit(fs, 0.45, 29, [["bp",1000,0.8]], t=>exp(t,0.12)), 0.8, 0.035*fs), 0.5, 0.9); }],
    ["snap","Snap","drums", fs=>add(noiseHit(fs, 0.12, 31, [["bp",2600,2.6]], t=>exp(t,0.018)), tone(fs, 0.03, t=>({f:3200, a:exp(t,0.004)})), 0.6)],
    ["rim","Rim","drums", fs=>add(add(tone(fs, 0.12, t=>({f:1720, a:exp(t,0.016)})), tone(fs, 0.12, t=>({f:830, a:exp(t,0.022)})), 0.7), noiseHit(fs, 0.03, 33, [["bp",3500,2]], t=>exp(t,0.004)), 0.6)],
    ["klack","Klack","drums", fs=>add(tone(fs, 0.18, t=>({f:920 - 120*t, a:exp(t,0.03)})), noiseHit(fs, 0.04, 35, [["bp",2200,3]], t=>exp(t,0.006)), 0.5)],
    ["shaker","Shaker","drums", fs=>noiseHit(fs, 0.16, 37, [["hp",5500,0.8]], t=>Math.min(1, t/0.018)*exp(t,0.04))],
    ["tamb","Tamburin","drums", fs=>{ const o = noiseHit(fs, 0.35, 39, [["hp",7000,0.7]], t=>exp(t,0.06)); [5100, 7300, 9400].forEach(f=>add(o, tone(fs, 0.35, t=>({f, a:0.12*exp(t,0.08)})))); return o; }],
    ["cowbell","Cowbell","drums", fs=>{ const o = buf(fs, 0.45), f = bq("bp", 800, 1.5, fs); for(let i=0;i<o.length;i++){ const t = i/fs; o[i] = f((Math.sign(Math.sin(TW*540*t)) + Math.sign(Math.sin(TW*800*t)))*0.5)*exp(t, 0.09)*(1 + 2*exp(t,0.01)); } return o; }],
    ["triangle","Triangel","drums", fs=>add(add(tone(fs, 1.6, t=>({f:2620, a:exp(t,0.5)})), tone(fs, 1.6, t=>({f:7230, a:0.35*exp(t,0.3)}))), tone(fs, 1.6, t=>({f:4410, a:0.2*exp(t,0.4)})))],
    ["tomlo","Tom tief","drums", fs=>add(tone(fs, 0.6, t=>({f:82 + 70*exp(t,0.05), a:exp(t,0.16)})), noiseHit(fs, 0.05, 41, [["bp",900,1]], t=>exp(t,0.01)), 0.3)],
    ["tomhi","Tom hoch","drums", fs=>add(tone(fs, 0.45, t=>({f:150 + 90*exp(t,0.04), a:exp(t,0.12)})), noiseHit(fs, 0.05, 43, [["bp",1500,1]], t=>exp(t,0.008)), 0.3)],
    ["conga","Conga","drums", fs=>add(tone(fs, 0.3, t=>({f:250 + 90*exp(t,0.015), a:exp(t,0.07)})), noiseHit(fs, 0.03, 45, [["bp",1800,1.5]], t=>exp(t,0.005)), 0.5)],
    ["808s","808 kurz","bass", fs=>kick808(fs, 0.6, 110, 52, 0.03, 1.4)],
    ["808l","808 lang","bass", fs=>kick808(fs, 1.7, 110, 49, 0.03, 1.3)],
    ["808g","808 Glide","bass", fs=>kick808(fs, 1.5, 62, 44, 0.55, 1.5)],
    ["808d","808 verzerrt","bass", fs=>kick808(fs, 1.1, 120, 50, 0.03, 4.5)],
    ["subdrop","Sub-Drop","bass", fs=>tone(fs, 1.8, t=>({f:85*Math.pow(30/85, Math.min(1, t/1.5)), a:Math.min(1,t/0.01)*(t > 1.5 ? Math.max(0,(1.8-t)/0.3) : 1)}))],
    ["bstab","Bass-Stab","bass", fs=>chordSaw(fs, 0.5, [55, 110], t=>Math.min(1,t/0.004)*exp(t,0.14), t=>200 + 1600*exp(t,0.05), 0.008)],
    ["hey","Crowd „Hey!“","voice", fs=>crowd(fs, [[0,V.e],[0.22,V.e],[0.34,V.i]], 0.38, 51)],
    ["ho","Crowd „Ho!“","voice", fs=>crowd(fs, [[0,V.o],[0.3,V.u]], 0.36, 53)],
    ["yeah","Crowd „Yeah!“","voice", fs=>crowd(fs, [[0,V.i],[0.07,V.e],[0.22,V.a],[0.45,V.a]], 0.48, 55)],
    ["uh","Crowd „Uh!“","voice", fs=>crowd(fs, [[0,V.u],[0.2,V.u]], 0.24, 57)],
    ["brass","Brass-Stab","hits", fs=>chordSaw(fs, 0.6, [261.6, 311.1, 392, 523.3], t=>Math.min(1,t/0.012)*exp(t,0.18), t=>700 + 3200*exp(t,0.09), 0.005)],
    ["orch","Orchester-Hit","hits", fs=>space(fs, add(add(chordSaw(fs, 0.9, [130.8, 196, 261.6, 311.1, 392], t=>Math.min(1,t/0.005)*exp(t,0.22), t=>900 + 5000*exp(t,0.06), 0.009), tone(fs, 0.9, t=>({f:65.4, a:0.8*exp(t,0.2)}))), noiseHit(fs, 0.2, 61, [["bp",2000,0.7]], t=>exp(t,0.03)), 0.4), 0.45, 1.2)],
    ["piano","Piano-Stab","hits", fs=>{ const o = buf(fs, 1.4); [261.6, 329.6, 392, 523.3].forEach(f=>{ for(let h=1; h<=6; h++) add(o, tone(fs, 1.4, t=>({f:f*h*(1+0.0004*h*h), a:0.25/h*exp(t, 0.9/h)*Math.min(1,t/0.003)}))); }); return o; }],
    ["pluck","Pluck-Stab","hits", fs=>{ const o = buf(fs, 0.9); [261.6, 329.6, 392, 493.9].forEach((f,k)=>add(o, karplus(fs, f, 0.9, 71+k, 0.994), 0.6, k*0.006*fs)); return o; }],
    ["horn","Air Horn","hits", fs=>{ const o = buf(fs, 0.95), ph = [0,0,0], fr = [466, 471, 699], lp = bq("lp", 2600, 0.9, fs); for(let i=0;i<o.length;i++){ const t = i/fs, v = 1 + 0.01*Math.sin(TW*7*t); let x = 0; fr.forEach((f,k)=>{ ph[k] += f*v*(1+0.02*Math.min(1,t/0.05))/fs; x += saw(ph[k]); }); o[i] = Math.tanh(lp(x)*1.6)*Math.min(1,t/0.02)*(t > 0.8 ? Math.max(0,(0.95-t)/0.15) : 1); } return o; }],
    ["laser","Laser","hits", fs=>{ const o = buf(fs, 0.35); let ph = 0, pm = 0; for(let i=0;i<o.length;i++){ const t = i/fs, f = 3200*Math.pow(180/3200, t/0.3); pm += f*1.5/fs; ph += (f + 400*Math.sin(TW*pm))/fs; o[i] = Math.sin(TW*ph)*exp(t,0.12); } return o; }],
    ["riser","Riser","fx", fs=>{ const sec = 4, o = buf(fs, sec), r = mkRnd(81), F = bq("bp", 300, 2, fs); let ph = 0; for(let i=0;i<o.length;i++){ const t = i/fs, u = t/sec; if(i % 32 === 0) F.set(300*Math.pow(8000/300, u), 2); ph += (200 + 1200*u*u)/fs; o[i] = (F(r())*1.4 + 0.25*saw(ph))*u*u; } return o; }],
    ["down","Downlifter","fx", fs=>{ const sec = 3, o = buf(fs, sec), r = mkRnd(83), F = bq("bp", 8000, 2, fs); for(let i=0;i<o.length;i++){ const t = i/fs, u = t/sec; if(i % 32 === 0) F.set(8000*Math.pow(250/8000, u), 2); o[i] = F(r())*1.5*(1-u)*(1-u); } return o; }],
    ["impact","Impact","fx", fs=>space(fs, add(tone(fs, 1.6, t=>({f:36 + 70*exp(t,0.04), a:exp(t,0.45)})).map(x=>Math.tanh(x*2)), noiseHit(fs, 0.5, 85, [["lp",3000,0.7]], t=>exp(t,0.08)), 0.7), 0.6, 2.2)],
    ["boom","Boom","fx", fs=>tone(fs, 2.2, t=>({f:44 + 30*exp(t,0.05), a:exp(t,0.6)})).map(x=>Math.tanh(x*1.8))],
    ["revcrash","Reverse-Crash","fx", fs=>reverse(crash(fs, 2, 87))],
    ["sweep","Noise-Sweep","fx", fs=>{ const sec = 2.2, o = buf(fs, sec), r = mkRnd(89), F = bq("lp", 200, 1.2, fs); for(let i=0;i<o.length;i++){ const t = i/fs, u = t/sec, c = u < 0.6 ? u/0.6 : (1-u)/0.4; if(i % 32 === 0) F.set(200 + 9000*c*c, 1.2); o[i] = F(r())*c; } return o; }],
    ["tapestop","Tape-Stop","fx", fs=>{ const sec = 1.1, o = buf(fs, sec), ph = [0,0,0], fr = [220, 277.2, 329.6], lp = bq("lp", 1800, 0.8, fs); for(let i=0;i<o.length;i++){ const t = i/fs, sp = Math.max(0, 1 - Math.pow(t/sec, 0.7)); let x = 0; fr.forEach((f,k)=>{ ph[k] += f*sp/fs; x += saw(ph[k]); }); o[i] = lp(x/3)*sp; } return o; }],
    ["vinylstop","Vinyl-Stop","fx", fs=>{ const sec = 0.7, o = buf(fs, sec), r = mkRnd(91); let ph = 0; for(let i=0;i<o.length;i++){ const t = i/fs, sp = Math.max(0, 1 - t/sec); ph += 180*sp*sp/fs; o[i] = (saw(ph)*0.6 + (Math.abs(r()) > 0.995 ? r() : 0))*sp; } return o; }],
    ["crackle","Vinyl-Knistern","atmo", fs=>{ const sec = 4, o = buf(fs, sec), r = mkRnd(93), lp = bq("lp", 5000, 0.7, fs), hp = bq("hp", 300, 0.7, fs); for(let i=0;i<o.length;i++){ const p = Math.abs(r()); o[i] = hp(lp(r()*0.02 + (p > 0.9993 ? r()*0.9 : p > 0.996 ? r()*0.2 : 0))); } return o; }],
    ["rain","Regen","atmo", fs=>{ const sec = 4, o = noiseHit(fs, sec, 95, [["lp",6000,0.6],["hp",400,0.6]], t=>0.35), r = mkRnd(97); for(let k=0;k<160;k++){ const at = Math.abs(r())*(sec-0.05)*fs; add(o, noiseHit(fs, 0.03, 100+k, [["bp", 2500 + 2500*Math.abs(r()), 4]], t=>exp(t,0.004)), 0.5, at); } return o; }],
    ["hiss","Tape-Rauschen","atmo", fs=>noiseHit(fs, 4, 99, [["hp",1800,0.7],["lp",9000,0.7]], t=>0.4)],
    ["wind","Wind","atmo", fs=>{ const sec = 4, o = buf(fs, sec), r = mkRnd(101), F = bq("bp", 450, 3, fs); for(let i=0;i<o.length;i++){ const t = i/fs; if(i % 32 === 0) F.set(450 + 300*Math.sin(TW*0.25*t) + 150*Math.sin(TW*0.61*t), 3); o[i] = F(r())*(0.6 + 0.4*Math.sin(TW*0.18*t)); } return o; }],
  ];
  const BY = Object.fromEntries(LIST.map(x=>[x[0], x]));
  const cache = new Map(), USER = new Map();   // USER: id -> {name, L, R, sr, raw, type}
  const toStereo = o => Array.isArray(o) ? o : [o, o.slice()];
  function norm([L, R], peak, rmsMax){ let m = 1e-9, ss = 0; for(let i=0;i<L.length;i++){ m = Math.max(m, Math.abs(L[i]), Math.abs(R[i])); ss += L[i]*L[i]; } const rms = Math.sqrt(ss/L.length) || 1e-9, g = Math.min(peak/m, rmsMax ? rmsMax/rms : Infinity); for(let i=0;i<L.length;i++){ L[i] *= g; R[i] *= g; }
    const n = L.length, fo = Math.min(n, 220); for(let i=0;i<fo;i++){ const w = i/fo; L[n-1-i] *= w; R[n-1-i] *= w; } return [L, R]; }
  function get(id, fs){
    const key = id + "@" + fs; if(cache.has(key)) return cache.get(key);
    let out = null;
    if(BY[id]){ out = norm(toStereo(BY[id][3](fs)), BY[id][2] === "atmo" ? 0.45 : 0.89, BY[id][2] === "atmo" ? 0 : 0.28); }
    else if(USER.has(id)){ const u = USER.get(id), k = u.sr/fs, n = Math.floor(u.L.length/k), L = new Float32Array(n), R = new Float32Array(n);
      for(let i=0;i<n;i++){ const x = i*k, j = Math.floor(x), f = x - j, j1 = Math.min(j+1, u.L.length-1); L[i] = u.L[j] + (u.L[j1]-u.L[j])*f; R[i] = u.R[j] + (u.R[j1]-u.R[j])*f; } out = [L, R]; }
    if(out) cache.set(key, out); return out;
  }
  const name = id => BY[id] ? BY[id][1] : USER.has(id) ? USER.get(id).name : id;
  return {LIST, G, BY, USER, get, name, cache};
})();
// play a one-shot right now
function smpPlay(id, v){ try{ const c = ac(); if(c.state === "suspended") c.resume(); const d = SMP.get(id, c.sampleRate); if(!d) return; const b = c.createBuffer(2, d[0].length, c.sampleRate); b.copyToChannel(d[0], 0); b.copyToChannel(d[1], 1);
  const s = c.createBufferSource(), g = c.createGain(); s.buffer = b; g.gain.value = 0.9*(v||0.85); s.connect(g).connect(master); s.start(); return {s, g}; }catch(e){ log("Sample nicht abgespielt:", String(e && e.message || e)); } }
// mix sample hits of a drum track into its buffer
function smpMix(notes, L, R, fs){ for(const nt of notes){ const d = SMP.get(nt.smp, fs); if(!d) continue; const o = Math.round(nt.t*fs), g = 1.15*(nt.v || 0.85), rate = nt.p ? Math.pow(2, nt.p/12) : 1, A = d[0], B = d[1];
  if(rate === 1){ for(let i=0;i<A.length;i++){ const q = o + i; if(q >= L.length) break; if(q < 0) continue; L[q] += A[i]*g; R[q] += B[i]*g; } continue; }
  const n = Math.floor((A.length - 1)/rate); for(let i=0;i<n;i++){ const q = o + i; if(q >= L.length) break; if(q < 0) continue; const x = i*rate, j = Math.floor(x), f = x - j; L[q] += (A[j] + (A[j+1] - A[j])*f)*g; R[q] += (B[j] + (B[j+1] - B[j])*f)*g; } } }
window.__SMP = SMP;
const smpRows = g => Object.keys(g.steps || {}).filter(k=>k.startsWith("s:")).map(k=>[SMP.name(k.slice(2)), k]);
/* own samples: stay in this browser (IndexedDB) and travel with the project ZIP */
async function smpUserSave(){ try{ await sessPut("userSamples", [...SMP.USER.entries()].map(([id, u])=>({id, name:u.name, type:u.type, raw:u.raw}))); }catch(e){} }
async function smpUserAdd(name, raw, type, id){
  const c = ac(); const ab = raw instanceof ArrayBuffer ? raw : await raw.arrayBuffer(); const b = await c.decodeAudioData(ab.slice(0));
  if(b.duration > 20) throw new Error("länger als 20 Sekunden");
  id = id || ("u" + Date.now().toString(36) + Math.floor(Math.random()*1e4).toString(36));
  SMP.USER.set(id, {name: String(name).replace(/\.[^.]+$/, "").slice(0, 28), type: type || "audio/wav", raw: ab, sr: b.sampleRate, L: b.getChannelData(0).slice(), R: (b.numberOfChannels > 1 ? b.getChannelData(1) : b.getChannelData(0)).slice()});
  [...SMP.cache.keys()].filter(k=>k.startsWith(id + "@")).forEach(k=>SMP.cache.delete(k)); return id;
}
(async ()=>{ try{ const list = await sessGet("userSamples"); if(Array.isArray(list)) for(const u of list){ try{ await smpUserAdd(u.name, u.raw, u.type, u.id); }catch(e){} } smpUi(); }catch(e){} })();
/* the browser in "Build a track" */
let SMPG = "drums";
function smpUi(){
  const box = $("smpBox"); if(!box || box.hidden) return;
  const T = x => (window.__T||(y=>y))(x);
  const chips = $("smpGroups"); chips.innerHTML = "";
  Object.entries(SMP.G).forEach(([k, lab])=>{ const b = document.createElement("button"); b.type = "button"; b.textContent = T(lab) + (k === "own" ? ` (${SMP.USER.size})` : ""); b.setAttribute("aria-pressed", SMPG === k); b.onclick = ()=>{ SMPG = k; smpUi(); }; chips.appendChild(b); });
  const grid = $("smpGrid"); grid.innerHTML = "";
  const items = SMPG === "own" ? [...SMP.USER.entries()].map(([id, u])=>[id, u.name]) : SMP.LIST.filter(x=>x[2] === SMPG).map(x=>[x[0], x[1]]);
  items.forEach(([id, nm])=>{ const t = document.createElement("div"); t.className = "smpt";
    const p = document.createElement("button"); p.type = "button"; p.className = "smpp"; p.title = T("Anhören"); p.innerHTML = '<svg viewBox="0 0 24 24" class="dic"><path d="M8 5v14l11-7z" fill="currentColor"/></svg>'; p.onclick = ()=>smpPlay(id);
    const l = document.createElement("span"); l.className = "smpn"; l.textContent = T(nm); l.onclick = ()=>smpPlay(id);
    const a = document.createElement("button"); a.type = "button"; a.className = "smpa"; a.textContent = "+ Drums"; a.title = T("Als eigene Zeile ins Drum-Pattern legen"); a.onclick = ()=>smpToDrums(id);
    t.append(p, l, a);
    if(SMPG === "own"){ const x = document.createElement("button"); x.type = "button"; x.className = "smpx"; x.textContent = "×"; x.title = T("Aus deinen Samples entfernen"); x.onclick = ()=>{ SMP.USER.delete(id); smpUserSave(); smpUi(); }; t.appendChild(x); }
    grid.appendChild(t); });
  if(SMPG === "own"){ const add = document.createElement("button"); add.type = "button"; add.className = "smpadd"; add.textContent = T("+ Eigene Samples laden"); add.onclick = ()=>$("smpFile").click(); grid.appendChild(add);
    if(!SMP.USER.size){ const n = document.createElement("small"); n.className = "tnote"; n.textContent = T("WAV, MP3 oder OGG bis 20 Sekunden, auch mehrere auf einmal oder einfach hier reinziehen. Sie bleiben in diesem Browser gespeichert und kommen beim Projekt-Speichern mit."); grid.appendChild(n); } }
}
async function smpToDrums(id){
  let t = BLD.sel && BLD.sel.gen && BLD.sel.gen.kind === "drums" && !$("bnEdit").hidden ? BLD.sel : null; const fresh = !t;
  if(!t){ await bldCreate("drums"); t = BLD.sel; if(!t || !t.gen || t.gen.kind !== "drums") return; t.gen.steps = {}; }
  const g = t.gen, key = "s:" + id, n = g.bars*16;
  if(!(key in g.steps)) g.steps[key] = "x".padEnd(n, ".");
  bldEdit(t); bldSoon(t);
  setStatus((window.__T||(y=>y))(fresh ? "Neue Drum-Spur mit dem Sample angelegt. Klick die Kästchen in seiner Zeile an, wo es spielen soll." : "Sample als eigene Zeile im Drum-Pattern. Klick die Kästchen an, wo es spielen soll."));
}
$("bnSmp").onclick = ()=>{ const b = $("smpBox"); b.hidden = !b.hidden; $("bnSmp").setAttribute("aria-expanded", !b.hidden); if(!b.hidden){ smpUi(); setTimeout(()=>b.scrollIntoView({behavior:"smooth", block:"nearest"}), 40); } };
$("smpFile").onchange = async e=>{ const fs = [...e.target.files]; e.target.value = ""; await smpLoadFiles(fs); };
async function smpLoadFiles(files){ let ok = 0, bad = 0;
  for(const f of files.slice(0, 40)){ if(f.size > 12e6){ bad++; continue; } try{ await smpUserAdd(f.name, f, f.type); ok++; }catch(err){ bad++; } }
  await smpUserSave(); SMPG = "own"; smpUi(); setStatus(`${ok} eigene${ok === 1 ? "s" : ""} Sample${ok === 1 ? "" : "s"} geladen` + (bad ? `, ${bad} übersprungen (kein Audio, zu groß oder länger als 20 Sekunden)` : "") + "."); }
$("smpBox").addEventListener("dragover", e=>{ e.preventDefault(); e.stopPropagation(); $("smpBox").classList.add("drag"); });
$("smpBox").addEventListener("dragleave", ()=>$("smpBox").classList.remove("drag"));
$("smpBox").addEventListener("drop", e=>{ e.preventDefault(); e.stopPropagation(); $("smpBox").classList.remove("drag"); const fs = [...(e.dataTransfer.files||[])].filter(f=>/^audio\//.test(f.type) || /\.(wav|mp3|ogg|flac|m4a|aiff?)$/i.test(f.name)); if(fs.length) smpLoadFiles(fs); });

