/* =====================================================================
   MP4 / M4A MUXER (ISO BMFF, no external library)
   ftyp | mdat (all video samples, then all audio samples) | moov
   ===================================================================== */
const MP4 = (()=>{
  const te = new TextEncoder();
  const u8 = (...a)=>new Uint8Array(a);
  const u16 = v=>u8((v>>8)&255, v&255);
  const u32 = v=>u8((v>>>24)&255, (v>>>16)&255, (v>>>8)&255, v&255);
  const str = s=>te.encode(s);
  const zeros = n=>new Uint8Array(n);
  const cat = parts=>{ let n=0; for(const p of parts) n+=p.length; const o=new Uint8Array(n); let i=0; for(const p of parts){ o.set(p,i); i+=p.length; } return o; };
  const box = (type, ...parts)=>{ const body=cat(parts); return cat([u32(body.length+8), str(type), body]); };
  const full = (type, v, flags, ...parts)=>box(type, u8(v, (flags>>16)&255, (flags>>8)&255, flags&255), ...parts);
  const matrix = cat([u32(0x00010000),u32(0),u32(0),u32(0),u32(0x00010000),u32(0),u32(0),u32(0),u32(0x40000000)]);
  const desc = (tag, body)=>cat([u8(tag, body.length), body]);
  function stbl(tr, offset){
    const n = tr.samples.length, runs = [];
    for(const s of tr.samples){ const l = runs[runs.length-1]; if(l && l[1]===s.dur) l[0]++; else runs.push([1, s.dur]); }
    const parts = [tr.stsd, full("stts",0,0,u32(runs.length), ...runs.map(([c,d])=>cat([u32(c),u32(d)])))];
    if(tr.video){ const k = []; tr.samples.forEach((s,i)=>{ if(s.key) k.push(i+1); }); parts.push(full("stss",0,0,u32(k.length), ...k.map(u32))); }
    parts.push(full("stsc",0,0,u32(1),u32(1),u32(n),u32(1)));
    parts.push(full("stsz",0,0,u32(0),u32(n), ...tr.samples.map(s=>u32(s.data.length))));
    parts.push(full("stco",0,0,u32(1),u32(offset)));
    return box("stbl", ...parts);
  }
  function trak(tr, id, offset){
    const dur = tr.samples.reduce((a,s)=>a+s.dur,0);
    const tkhd = full("tkhd",0,3, u32(0),u32(0),u32(id),u32(0),u32(Math.round(dur/tr.timescale*1000)), zeros(8), u16(0),u16(0), u16(tr.video?0:0x0100), u16(0), matrix, u32((tr.width||0)*65536), u32((tr.height||0)*65536));
    const mdhd = full("mdhd",0,0, u32(0),u32(0),u32(tr.timescale),u32(dur),u16(0x55c4),u16(0));
    const hdlr = full("hdlr",0,0, u32(0), str(tr.video?"vide":"soun"), zeros(12), str(tr.video?"VideoHandler":"SoundHandler"), u8(0));
    const mh = tr.video ? full("vmhd",0,1,zeros(8)) : full("smhd",0,0,zeros(4));
    const dinf = box("dinf", full("dref",0,0,u32(1), full("url ",0,1)));
    return box("trak", tkhd, box("mdia", mdhd, hdlr, box("minf", mh, dinf, stbl(tr, offset))));
  }
  const avc1 = (w,h,avcC)=> full("stsd",0,0,u32(1), box("avc1", zeros(6), u16(1), zeros(16), u16(w), u16(h), u32(0x00480000), u32(0x00480000), u32(0), u16(1), zeros(32), u16(0x18), u16(0xffff), box("avcC", avcC)));
  const mp4a = (sr,ch,asc)=>{
    const dcd = desc(4, cat([u8(0x40, 0x15), u8(0,0,0), u32(0), u32(0), desc(5, asc)]));
    const esd = desc(3, cat([u16(0), u8(0), dcd, desc(6, u8(2))]));
    return full("stsd",0,0,u32(1), box("mp4a", zeros(6), u16(1), zeros(8), u16(ch), u16(16), zeros(4), u32(sr*65536), full("esds",0,0,esd)));
  };
  const opus = (ch,preSkip)=> full("stsd",0,0,u32(1), box("Opus", zeros(6), u16(1), zeros(8), u16(ch), u16(16), zeros(4), u32(48000*65536), box("dOps", u8(0, ch), u16(preSkip), u32(48000), u16(0), u8(0))));
  function mux({video, audio}){
    const tracks = [video, audio].filter(Boolean);
    const ftyp = box("ftyp", str(video?"isom":"M4A "), u32(512), str("isom"), str("iso2"), str(video?"avc1":"M4A "), str("mp41"));
    const sizes = tracks.map(t=>t.samples.reduce((a,s)=>a+s.data.length,0));
    const mdatHdr = cat([u32(sizes.reduce((a,b)=>a+b,0)+8), str("mdat")]);
    let off = ftyp.length + mdatHdr.length; const offsets = sizes.map(sz=>{ const o=off; off+=sz; return o; });
    const durMs = Math.max(...tracks.map(t=>t.samples.reduce((a,s)=>a+s.dur,0)/t.timescale*1000));
    const mvhd = full("mvhd",0,0, u32(0),u32(0),u32(1000),u32(Math.round(durMs)),u32(0x00010000),u16(0x0100),zeros(10),matrix,zeros(24),u32(tracks.length+1));
    const moov = box("moov", mvhd, ...tracks.map((t,i)=>trak(t, i+1, offsets[i])));
    return new Blob([ftyp, mdatHdr, ...tracks.flatMap(t=>t.samples.map(s=>s.data)), moov], {type: video?"video/mp4":"audio/mp4"});
  }
  return {mux, avc1, mp4a, opus};
})();

let AAC_OK = false;
(async ()=>{
  try{ AAC_OK = !!(window.AudioEncoder && (await AudioEncoder.isConfigSupported({codec:"mp4a.40.2", sampleRate:48000, numberOfChannels:2, bitrate:256000})).supported); }catch(e){}
  const o = document.querySelector('#fmt option[value="m4a"]');
  if(o && !AAC_OK){ o.disabled = true; o.textContent = "M4A · AAC (in diesem Browser nicht verfügbar)"; }
})();
async function resample(L, R, from, to){
  if(from===to) return [L, R];
  const n = Math.ceil(L.length*to/from), o = new OfflineAudioContext(2, n, to), b = o.createBuffer(2, L.length, from);
  b.copyToChannel(L,0); b.copyToChannel(R,1); const s = o.createBufferSource(); s.buffer = b; s.connect(o.destination); s.start(0);
  const r = await o.startRendering(); return [r.getChannelData(0), r.getChannelData(1)];
}
// AAC (or Opus as fallback) via WebCodecs, always at 48 kHz
async function encodeAudioTrack(L, R, sr, want){
  [L, R] = await resample(L, R, sr, 48000);
  const useAac = want==="aac" || (want==="auto" && AAC_OK);
  const cfg = {codec: useAac ? "mp4a.40.2" : "opus", sampleRate:48000, numberOfChannels:2, bitrate: useAac ? 256000 : 192000};
  const samples = []; let meta = null, err = null;
  const enc = new AudioEncoder({output:(ch, md)=>{ const d = new Uint8Array(ch.byteLength); ch.copyTo(d); samples.push({data:d, us:ch.duration}); if(md && md.decoderConfig && !meta) meta = md.decoderConfig; }, error:e=>{ err = e; }});
  enc.configure(cfg);
  const step = 4800;
  for(let i=0;i<L.length;i+=step){
    const n = Math.min(step, L.length-i), d = new Float32Array(n*2); d.set(L.subarray(i,i+n),0); d.set(R.subarray(i,i+n),n);
    enc.encode(new AudioData({format:"f32-planar", sampleRate:48000, numberOfFrames:n, numberOfChannels:2, timestamp:Math.round(i/48000*1e6), data:d}));
    if(enc.encodeQueueSize > 30) await new Promise(r=>setTimeout(r,0));
    if(err) throw err;
  }
  await enc.flush(); enc.close(); if(err) throw err;
  const frame = useAac ? 1024 : 960;
  samples.forEach(s=>{ s.dur = s.us ? Math.round(s.us*48000/1e6) : frame; });
  let stsd;
  if(useAac){
    const asc = meta && meta.description ? new Uint8Array(meta.description instanceof ArrayBuffer ? meta.description : meta.description.buffer) : new Uint8Array([0x11, 0x90]);
    stsd = MP4.mp4a(48000, 2, asc);
  } else {
    let pre = 312; if(meta && meta.description){ const d = new Uint8Array(meta.description instanceof ArrayBuffer ? meta.description : meta.description.buffer); if(d.length>=12) pre = d[10] | (d[11]<<8); }
    stsd = MP4.opus(2, pre);
  }
  return {timescale:48000, samples, stsd, codec: useAac ? "AAC" : "Opus"};
}

