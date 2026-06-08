#!/usr/bin/env python3
"""Build labeled contact sheets per category so Boss can pick at a glance."""
import os
from PIL import Image, ImageDraw, ImageFont

ROOT = r"D:\PROJECTS\FROGFACE-SPACE\refs\mega-batch"
OUT = os.path.join(ROOT, "_contact")
os.makedirs(OUT, exist_ok=True)

THUMB_W = 360          # thumbnail width
PAD = 14               # padding between cells
LABEL_H = 26           # label strip height
COLS = {               # columns per category (wide aspects get fewer cols)
    "hero": 3,
    "exteriors": 4,
    "interiors": 2,    # 21:9 wide -> 2 cols
    "map": 3,
    "tower": 4,        # 3:4 tall -> more cols
}
BG = (24, 20, 32)
LABEL_BG = (12, 10, 18)
LABEL_FG = (230, 220, 200)

try:
    font = ImageFont.truetype("arial.ttf", 16)
except Exception:
    font = ImageFont.load_default()

def build(folder):
    src = os.path.join(ROOT, folder)
    files = sorted(f for f in os.listdir(src) if f.lower().endswith(".png"))
    if not files:
        return None
    cols = COLS.get(folder, 3)

    # Pre-load thumbnails to learn cell height (varies by aspect)
    thumbs = []
    for f in files:
        im = Image.open(os.path.join(src, f)).convert("RGB")
        w, h = im.size
        th = int(THUMB_W * h / w)
        thumbs.append((f, im.resize((THUMB_W, th))))
    cell_h = max(t.size[1] for _, t in thumbs) + LABEL_H
    cell_w = THUMB_W

    rows = (len(thumbs) + cols - 1) // cols
    W = cols * cell_w + (cols + 1) * PAD
    H = rows * cell_h + (rows + 1) * PAD + 40  # +title
    sheet = Image.new("RGB", (W, H), BG)
    d = ImageDraw.Draw(sheet)
    d.text((PAD, 12), f"{folder.upper()}  ({len(thumbs)})", fill=(182, 255, 58), font=font)

    for i, (name, t) in enumerate(thumbs):
        r, c = divmod(i, cols)
        x = PAD + c * (cell_w + PAD)
        y = 40 + PAD + r * (cell_h + PAD)
        sheet.paste(t, (x, y))
        # label strip
        ly = y + t.size[1]
        d.rectangle([x, ly, x + cell_w, ly + LABEL_H], fill=LABEL_BG)
        d.text((x + 6, ly + 4), name.replace(".png", ""), fill=LABEL_FG, font=font)

    out = os.path.join(OUT, f"_sheet-{folder}.png")
    sheet.save(out, optimize=True)
    return out, len(thumbs)

results = []
for folder in ["hero", "exteriors", "interiors", "map", "tower"]:
    res = build(folder)
    if res:
        results.append((folder, *res))

for folder, path, n in results:
    print(f"{folder}: {n} -> {path}")
print("DONE")
