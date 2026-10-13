#!/usr/bin/env python3
"""
Generate the square link-preview images used on /talent/<id> share cards.

WhatsApp, Facebook and others crop a preview image to a centred square. Talent
photos are stored as tall portraits with the face near the top (the site cards
use object-top), so a centred crop would cut through the face - on Ben Keysar's
0.57-ratio photo it misses it entirely. This writes a face-anchored 600x600
square for every talent with a local image:

  portrait  -> top-anchored square (same framing the cards use)
  landscape -> centred square

Output: public/og/talents/<id>.jpg, kept small because WhatsApp tends to drop
preview images over ~300KB. scripts/prerender-meta.mjs picks these up at build
time and falls back to the site-wide card for any talent without one.

Re-run after adding or changing a talent photo:
    python scripts/generate_og_images.py
"""

import json
import sys
from pathlib import Path

from PIL import Image

if sys.platform == 'win32':
    sys.stdout.reconfigure(encoding='utf-8', errors='replace')

ROOT = Path(__file__).resolve().parent.parent
PUBLIC = ROOT / 'public'
OUT = PUBLIC / 'og' / 'talents'
SIZE = 600


def square(im: Image.Image) -> Image.Image:
    w, h = im.size
    if h > w:
        return im.crop((0, 0, w, w))
    if w > h:
        left = (w - h) // 2
        return im.crop((left, 0, left + h, h))
    return im


def main() -> None:
    talents = json.loads((ROOT / 'src' / 'data' / 'talents.json').read_text(encoding='utf-8'))
    OUT.mkdir(parents=True, exist_ok=True)

    for t in talents:
        url = t.get('imageUrl', '')
        src = PUBLIC / url.lstrip('/')
        if not url.startswith('/') or not src.is_file() or src.suffix.lower() == '.svg':
            print(f"  skip  {t['id']:>3} {t['name'][:30]:30s} (no local raster image)")
            continue

        im = Image.open(src).convert('RGB')
        sq = square(im).resize((SIZE, SIZE), Image.LANCZOS)
        dst = OUT / f"{t['id']}.jpg"
        sq.save(dst, 'JPEG', quality=84, optimize=True, progressive=True)
        print(f"  wrote {t['id']:>3} {t['name'][:30]:30s} {dst.stat().st_size / 1024:5.1f} KB")


if __name__ == '__main__':
    main()
