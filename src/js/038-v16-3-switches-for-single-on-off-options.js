/* v16.3: switches for single on/off options, ready cover styles */
(function(){
  ["splitQuick","split6","keepVox","loopOn","snapBar","recFromSec","recCount","beQuant","beClick","beFit","vCxUse","vLyr","cpKeySave","aiKeySave","clickOn","norm","onlyAB","relVideo"].forEach(id=>{ const c = $(id); if(c) c.classList.add("sw16"); });
  let done = false; try{ done = localStorage.getItem("stemmixer:cs163") === "1"; }catch(e){}
  if(!done){
    const CS = [["DANVIEL Gold Noir","Dark luxurious album cover, deep black background, gold metallic accents and fine gold lines, cinematic lighting, high contrast, minimal composition, premium music artwork, no text"],
      ["Regen-Stadt","Rainy city street at night, neon reflections on wet asphalt, moody blue and orange tones, cinematic, light film grain, album cover, no text"],
      ["Chrome 3D","Glossy chrome 3D sculpture floating on a dark background, liquid metal reflections, studio lighting, futuristic, album cover, no text"],
      ["Afro Sunset","Warm sunset colours, silhouettes of palm trees, golden hour haze, vibrant oranges and magentas, afrobeats album cover, no text"],
      ["Drill Dark","Dark urban night scene, hooded silhouette from behind, cold blue and grey tones, harsh flash photo look, grain, drill album cover, no text"],
      ["Lo-Fi Zimmer","Cozy lo-fi bedroom at night, desk lamp glow, rain on the window, soft pastel illustration style, album cover, no text"],
      ["Vaporwave","Vaporwave aesthetic, pink and cyan gradient sky, retro grid floor, marble bust, 80s sunset, album cover, no text"],
      ["Cyberpunk Neon","Cyberpunk city skyline, neon pink and cyan signs, rain and haze, futuristic, cinematic, album cover, no text"]];
    CS.forEach(([n, pr], i)=>{ if(!STYLES_.some(x=>x.name === n)) STYLES_.push({id:"s163" + i, name:n, prompt:pr}); });
    try{ saveStyles(); renderStyles(); localStorage.setItem("stemmixer:cs163", "1"); }catch(e){}
  }
})();


