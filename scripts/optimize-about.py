import os
from PIL import Image
src = r"D:\PROJECTS\FROGFACE-SPACE\public\about"
TARGET_W = 1600
total_before = total_after = 0
for f in sorted(os.listdir(src)):
    if not f.lower().endswith(".png"):
        continue
    p = os.path.join(src, f)
    total_before += os.path.getsize(p)
    im = Image.open(p).convert("RGB")
    w, h = im.size
    if w > TARGET_W:
        im = im.resize((TARGET_W, int(TARGET_W * h / w)), Image.LANCZOS)
    out = os.path.join(src, f[:-4] + ".webp")
    im.save(out, "WEBP", quality=82, method=6)
    total_after += os.path.getsize(out)
    os.remove(p)
    print("%s -> %s  (%d KB)" % (f, os.path.basename(out), os.path.getsize(out) // 1024))
print("TOTAL: %.1f MB -> %.1f MB" % (total_before / 1e6, total_after / 1e6))
