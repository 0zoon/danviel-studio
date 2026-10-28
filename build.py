#!/usr/bin/env python3
"""Builds the single-file DANVIEL Studio from src/ -> index.html (and optional copy)."""
import json, re, os, sys, base64, importlib.util
R=os.path.dirname(os.path.abspath(__file__)); S=os.path.join(R,"src")
rd=lambda p: open(os.path.join(S,p),encoding="utf-8").read()
def parts(d,ext): return "".join(rd(os.path.join(d,f)) for f in sorted(os.listdir(os.path.join(S,d))) if f.endswith(ext))
s=rd("studio.html")
s=s.replace("@@JSZIP@@",rd("vendor/jszip.min.js").rstrip("\n"),1)
s=s.replace("@@CSS@@",parts("css",".css"),1)
s=s.replace("@@JS@@",parts("js",".js"),1)
spec=importlib.util.spec_from_file_location("d",os.path.join(S,"i18n/dict.py")); d=importlib.util.module_from_spec(spec); spec.loader.exec_module(d)
js="<script>window.I18N_EN = "+json.dumps({"exact":d.EXACT,"pat":d.PAT,"frag":d.FRAG},ensure_ascii=False)+";</script>\n<script>\n"+rd("i18n/engine.js")+"</script>"
s=re.sub(r'<!--I18N-->.*?<!--/I18N-->',lambda m:'<!--I18N-->'+js+'<!--/I18N-->',s,flags=re.S)
s=re.sub(r'<!--HELPDE-->.*?<!--/HELPDE-->',lambda m:'<!--HELPDE-->'+rd("i18n/help_de.html")+'<!--/HELPDE-->',s,flags=re.S)
s=re.sub(r'<!--HELPEN-->.*?<!--/HELPEN-->',lambda m:'<!--HELPEN-->'+d.HELP_EN+'<!--/HELPEN-->',s,flags=re.S)
def img(m):
    f=os.path.join(S,"i18n/helpimg/%s_%s.webp"%(m.group(1),m.group(2)))
    src="data:image/webp;base64,"+base64.b64encode(open(f,"rb").read()).decode() if os.path.exists(f) else ""
    return '<img class="himg" data-h="%s" data-l="%s" alt="" loading="lazy" src="%s">'%(m.group(1),m.group(2),src)
s=re.sub(r'<img class="himg" data-h="(\w+)" data-l="(\w+)" alt=""(?: loading="lazy")? src="[^"]*">',img,s)
full='<!doctype html>\n<html lang="en">\n'+s
open(os.path.join(R,"index.html"),"w",encoding="utf-8").write(full)
for out in sys.argv[1:]: open(out,"w",encoding="utf-8").write(full)
print("built index.html", len(full))
