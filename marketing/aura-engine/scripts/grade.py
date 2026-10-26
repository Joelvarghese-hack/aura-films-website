"""Aura Standard grade: documentary black & white, crushed blacks, mean luma pinned to a target.
Usage: python3.13 scripts/grade.py <target_luma> <src> [<src> ...]  -> public/img/<name>.jpg"""
import sys, os
from PIL import Image, ImageOps, ImageStat, ImageFilter

target = float(sys.argv[1])
out = os.path.join(os.path.dirname(__file__), '..', 'public', 'img')
for src in sys.argv[2:]:
    im = ImageOps.exif_transpose(Image.open(src)).convert('RGB')
    im.thumbnail((1600, 2400), Image.LANCZOS)
    r, g, b = im.split()
    # red-weighted mono (orange filter look): skin lifts, skies and greens fall
    l = Image.merge('RGB', (r, g, b)).convert('L', (0.45, 0.45, 0.10, 0))
    l = ImageOps.autocontrast(l, cutoff=(1.5, 0.4))
    # S-curve with hard toe: blacks crushed below 6 %
    curve = [0 if i < 15 else min(255, int(255 * (((i - 15) / 240) ** 1.18) * 1.0)) for i in range(256)]
    l = l.point(curve)
    # pin the mean luma to the target with a gamma search
    lo, hi = 0.4, 3.0
    for _ in range(18):
        gm = (lo + hi) / 2
        t = l.point([int(255 * (i / 255) ** gm) for i in range(256)])
        m = ImageStat.Stat(t).mean[0] / 255
        lo, hi = (gm, hi) if m > target else (lo, gm)
    t = t.filter(ImageFilter.UnsharpMask(radius=2, percent=60, threshold=2))
    name = os.path.splitext(os.path.basename(src))[0].replace('.JPG', '').lower()
    t.save(os.path.join(out, name + '.jpg'), quality=90)
    print(name, round(ImageStat.Stat(t).mean[0] / 255, 3), round(ImageStat.Stat(t).stddev[0] / 255, 3))
