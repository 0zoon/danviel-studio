# Third-party notices

DANVIEL Studio (© 2026 DANVIEL, all rights reserved, see [LICENSE](LICENSE)) uses the following
third-party software, models, fonts and services. They remain under their own licenses.

## Bundled in the program file
| Component | Used for | License |
|---|---|---|
| [JSZip](https://github.com/Stuk/jszip) | Reading and writing ZIP files | MIT (dual-licensed MIT / GPLv3, used under MIT) |

## Shipped as separate files next to the program
| Component | Used for | License |
|---|---|---|
| [lamejs](https://github.com/zhuker/lamejs) 1.2.1 (`vendor/lame.min.js`, unmodified) | MP3 encoding, based on [LAME](https://lame.sourceforge.io) | LGPL-3.0 (see `vendor/LAME-LICENSE.txt`). It stays a separate file, so it can be swapped for any other build. |

## Fonts (self-hosted, no request to Google)
The fonts come from the [Google Fonts repository](https://github.com/google/fonts), cut down to the Latin characters
and stored as WOFF2 in `fonts/`. The license texts are in `fonts/licenses/`.

**SIL Open Font License 1.1:** Abril Fatface, Alfa Slab One, Allura, Anton, Archivo Black, Audiowide, Bagel Fat One, Bangers, Bebas Neue, Big Shoulders Display, Black Ops One, Bodoni Moda, Boogaloo, Bowlby One, Bungee, Bungee Inline, Bungee Shade, Caveat, Cinzel, Codystar, Cormorant Garamond, Creepster, DM Serif Display, Dancing Script, Dela Gothic One, Faster One, Fredoka, Great Vibes, Grenze Gotisch, Herr Von Muellerhoff, IBM Plex Mono, Instrument Sans, Italiana, Kaushan Script, Krona One, Lobster, Major Mono Display, Marcellus, Metal Mania, Michroma, Monoton, Montserrat, New Rocker, Nosifer, Orbitron, Oswald, Pacifico, Pirata One, Playfair Display, Press Start 2P, Rampart One, Righteous, Rubik Distressed, Rubik Glitch, Rubik Spray Paint, Rubik Wet Paint, Russo One, Rye, Sacramento, Saira Stencil One, Sedgwick Ave Display, Shrikhand, Silkscreen, Six Caps, Staatliches, Syne, Teko, Tenor Sans, Tilt Warp, Unbounded, UnifrakturMaguntia, Vibur, Wallpoet.

**Apache License 2.0:** Homemade Apple, Permanent Marker, Rock Salt, Satisfy, Special Elite, Yellowtail.

## Loaded from a CDN only when you use the feature
| Component | Used for | License |
|---|---|---|
| [Transformers.js](https://github.com/huggingface/transformers.js) | Running the lyrics detection model in the browser | Apache-2.0 |
| [OpenAI Whisper](https://github.com/openai/whisper) (ONNX conversion) | Lyrics detection model | MIT |
| [ONNX Runtime Web](https://github.com/microsoft/onnxruntime) | Running the stem separation model | MIT |
| [demucs-web](https://github.com/timcsy/demucs-web) | Stem separation in the browser | MIT |
| [HTDemucs](https://github.com/facebookresearch/demucs) by Meta | Stem separation model | MIT |

## Optional online services
Only used when you choose them in the cover studio, subject to their own terms:
- [Pollinations](https://pollinations.ai) (free image and text generation for cover ideas)
- [OpenAI API](https://openai.com/policies) (image generation with your own API key)

All other code, design, texts, the name "DANVIEL" and the logo: © 2026 DANVIEL.
