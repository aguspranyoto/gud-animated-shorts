# Merge the look sandboxes back into the main scene folder of your Remotion project, by owned files.
# Backs up main first (backup/<scene>_<time>/), copies each sandbox's owned files, reports which owned files are
# missing or unchanged. Usage: python scripts/merge.py [cam,world,char,post]  (SCENE=src/videos/<name>)
import os, shutil, sys, time, filecmp

import os as _os
ROOT = _os.path.expanduser("your Remotion project")
SCENE = _os.environ.get("SCENE", "src/videos/<name>")
MAIN = os.path.join(ROOT, SCENE)
OWN = {  # round 2 ownership (round 1: world also owned paint/build, post owned grade)
    "cam": ["story.ts"],
    "world": ["world.ts", "lights.ts", "shade.ts", "grade.ts"],
    "mat": ["paint.ts", "build.ts"],
    "char": ["toon.ts", "cast.ts", "cardshade.ts"],
    "post": ["ink.ts", "<Comp>.tsx", "lensblur.ts"],  # <Comp>.tsx = the composer
}
which = sys.argv[1].split(",") if len(sys.argv) > 1 else list(OWN)
bak = os.path.join(ROOT, "backup", SCENE.replace("/", "_") + time.strftime("_%Y%m%d_%H%M%S"))
shutil.copytree(MAIN, bak)
print("backup ->", bak)
for box in which:
    src = os.path.join(ROOT, f"{SCENE}_{box}")
    for f in OWN[box]:
        a, b = os.path.join(src, f), os.path.join(MAIN, f)
        if not os.path.exists(a):
            print(f"  {box}: {f} not in sandbox (skipped)")
            continue
        if os.path.exists(b) and filecmp.cmp(a, b, shallow=False):
            print(f"  {box}: {f} unchanged")
            continue
        shutil.copy2(a, b)
        print(f"  {box}: {f} -> main")
