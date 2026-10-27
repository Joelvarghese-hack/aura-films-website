"""Aura colour grade. Usage: python3.13 scripts/grade_color.py warm|fall <src> [<src> ...] -> public/img/c-<name>.jpg
warm: soft film curve, gentle warmth, lifted blacks.  fall: warm + greens eased toward autumn gold."""
import sys, os
import numpy as np
from PIL import Image, ImageOps

mode = sys.argv[1]
out = os.path.join(os.path.dirname(__file__), '..', 'public', 'img')
for src in sys.argv[2:]:
    im = ImageOps.exif_transpose(Image.open(src)).convert('RGB')
    im.thumbnail((1600, 2400), Image.LANCZOS)
    if mode == 'fall':
        hsv = np.asarray(im.convert('HSV')).astype(np.float32)
        h = hsv[..., 0] * 360 / 255
        green = (h > 55) & (h < 170)
        w = np.clip(1 - np.abs(h - 105) / 60, 0, 1) * green  # strongest on mid greens
        h = h + (38 - h) * 0.62 * w  # ease toward amber
        hsv[..., 0] = (h % 360) * 255 / 360
        hsv[..., 1] = hsv[..., 1] * (1 - 0.12 * w)
        im = Image.fromarray(hsv.astype(np.uint8), 'HSV').convert('RGB')
    a = np.asarray(im).astype(np.float32) / 255
    a = 0.035 + 0.94 * (a + 0.10 * a * (1 - a) * (2 * a - 1) * -1)  # gentle S-curve, lifted blacks, soft highlights
    a[..., 0] *= 1.035; a[..., 2] *= 0.95  # warmth
    Image.fromarray((np.clip(a, 0, 1) * 255).astype(np.uint8)).save(os.path.join(out, 'c-' + os.path.splitext(os.path.basename(src))[0].replace('.JPG', '').lower() + '.jpg'), quality=92)
    print(mode, src)
