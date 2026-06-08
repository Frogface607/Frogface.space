import os
from PIL import Image, ImageDraw, ImageFont
src = r"D:\PROJECTS\FROGFACE-SPACE\refs\hero-stories"
out = os.path.join(src, "_sheet-hero-stories.png")
files = sorted(f for f in os.listdir(src) if f.lower().endswith(".png") and not f.startswith("_"))
THUMB_W, PAD, LABEL_H, COLS = 380, 14, 26, 3
try:
    font = ImageFont.truetype("arial.ttf", 16)
except Exception:
    font = ImageFont.load_default()
thumbs = []
for f in files:
    im = Image.open(os.path.join(src, f)).convert("RGB")
    w, h = im.size
    thumbs.append((f, im.resize((THUMB_W, int(THUMB_W * h / w)))))
cell_h = max(t.size[1] for _, t in thumbs) + LABEL_H
rows = (len(thumbs) + COLS - 1) // COLS
W = COLS * THUMB_W + (COLS + 1) * PAD
H = rows * cell_h + (rows + 1) * PAD + 40
sheet = Image.new("RGB", (W, H), (24, 20, 32))
d = ImageDraw.Draw(sheet)
d.text((PAD, 12), "HERO STORIES (%d)" % len(thumbs), fill=(182, 255, 58), font=font)
for i, (name, t) in enumerate(thumbs):
    r, c = divmod(i, COLS)
    x = PAD + c * (THUMB_W + PAD)
    y = 40 + PAD + r * (cell_h + PAD)
    sheet.paste(t, (x, y))
    ly = y + t.size[1]
    d.rectangle([x, ly, x + THUMB_W, ly + LABEL_H], fill=(12, 10, 18))
    d.text((x + 6, ly + 4), name.replace(".png", ""), fill=(230, 220, 200), font=font)
sheet.save(out, optimize=True)
print("saved:", out, "| scenes:", len(thumbs))
