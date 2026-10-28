#!/usr/bin/env python3
"""Smoke test for DANVIEL Studio: python3 tests/smoke.py  (needs: pip install playwright && playwright install chromium)
Loads the built index.html in Chromium and checks the main path: start without errors, no outside requests,
self-hosted fonts, demo stems, play, WAV export, English translation and the privacy page."""
import asyncio, functools, http.server, os, re, socket, sys, threading
from playwright.async_api import async_playwright

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
html = open(os.path.join(ROOT, "index.html"), encoding="utf-8").read()
VER = re.search(r'const CREDIT = "DANVIEL Studio v([\d.]+)"', html).group(1)

class Quiet(http.server.SimpleHTTPRequestHandler):
    def log_message(self, *a): pass
sock = socket.socket(); sock.bind(("127.0.0.1", 0)); PORT = sock.getsockname()[1]; sock.close()
srv = http.server.ThreadingHTTPServer(("127.0.0.1", PORT), functools.partial(Quiet, directory=ROOT))
threading.Thread(target=srv.serve_forever, daemon=True).start()
BASE = f"http://127.0.0.1:{PORT}/"

fails = []
def check(name, ok, info=""):
    print(("PASS " if ok else "FAIL ") + name + (f"  ({info})" if info else ""))
    if not ok: fails.append(name)

async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch()
        ctx = await b.new_context(viewport={"width": 1500, "height": 950}, accept_downloads=True)
        pg = await ctx.new_page(); errs, outside = [], []
        pg.on("pageerror", lambda e: errs.append(str(e)))
        pg.on("request", lambda r: outside.append(r.url[:100]) if not r.url.startswith((BASE, "data:", "blob:")) else None)
        await pg.add_init_script(f'localStorage.setItem("stemmixer:seen","{VER}");if(!localStorage.getItem("stemmixer:lang")) localStorage.setItem("stemmixer:lang","de")')
        await pg.goto(BASE + "index.html"); await pg.wait_for_timeout(2000)
        E = pg.evaluate
        check("starts without errors", not errs, "; ".join(errs[:2]))
        check("help does not block on a known version", not await pg.is_visible("#help"))
        fonts = await E('''async()=>{ const f=['800 20px "Big Shoulders Display"','500 20px "Instrument Sans"','400 20px "IBM Plex Mono"','400 20px "Rubik Glitch"'];
            const r=[]; for(const x of f){ await document.fonts.load(x); r.push(document.fonts.check(x)); } return r; }''')
        check("self-hosted fonts load", all(fonts), str(fonts))
        check("MP3 encoder available", await E("typeof lamejs") == "function")
        check("plate shows the major version", await E('document.querySelector(".brand .by").textContent') == "Studio · v" + VER.split(".")[0])

        await E('document.getElementById("demo").click()')
        for _ in range(240):
            await pg.wait_for_timeout(500)
            if not await E('document.getElementById("demo").disabled'): break
        n = await E("window.__pj().tracks.length")
        check("demo stems load", n >= 4, f"{n} tracks")

        await pg.keyboard.press("Space"); await pg.wait_for_timeout(1500); await pg.keyboard.press("Space")
        check("play / pause", not errs, "; ".join(errs[:2]))

        async with pg.expect_download(timeout=180000) as d:
            await E('document.getElementById("export").click()')
        dl = await d.value; path = await dl.path(); data = open(path, "rb").read()
        await E('document.getElementById("fmt").value="wav"; document.getElementById("fmt").dispatchEvent(new Event("change"))')
        async with pg.expect_download(timeout=180000) as d2:
            await E('document.getElementById("export").click()')
        dl2 = await d2.value; data2 = open(await dl2.path(), "rb").read()
        check("MP3 export", (data[:3] == b"ID3" or data[0] == 0xFF) and len(data) > 100000, f"{len(data)} bytes, {dl.suggested_filename}")
        check("WAV export", data2[:4] == b"RIFF" and data2[8:12] == b"WAVE" and len(data2) > 200000, f"{len(data2)} bytes, {dl2.suggested_filename}")
        check("footer shows the current version", await E('document.querySelector("footer .credit b").textContent') == "v" + VER)

        await E('localStorage.setItem("stemmixer:lang","en")'); await pg.reload(); await pg.wait_for_timeout(2500)
        txt = await E('document.getElementById("export").textContent')
        check("English translation", "Export" in txt and "exportieren" not in txt, txt)

        await pg.goto(BASE + "privacy.html"); await pg.wait_for_timeout(300)
        check("privacy page", await E('document.body.innerText.includes("GoatCounter")'))
        check("no requests to outside servers", not outside, ", ".join(outside[:3]))
        check("no page errors overall", not errs, "; ".join(errs[:2]))
        await b.close()

asyncio.run(main())
print(f"\n{'ALL PASSED' if not fails else str(len(fails)) + ' FAILED: ' + ', '.join(fails)}  (v{VER})")
sys.exit(1 if fails else 0)
