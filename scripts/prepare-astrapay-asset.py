from pathlib import Path
from PIL import Image

source = Path('/home/ubuntu/webdev-static-assets/astrapay-clean.png')
target = Path('/home/ubuntu/copy-of-airax-ai/assets/images/brands/astrapay-fixed.webp')
img = Image.open(source).convert('RGBA')
alpha = img.getchannel('A')
print('mode', img.mode, 'size', img.size, 'alpha extrema', alpha.getextrema(), 'bbox', alpha.getbbox())
# Crop only fully transparent outer padding, preserving the logo exactly.
bbox = alpha.getbbox()
if bbox:
    img = img.crop(bbox)
# Keep a small transparent margin for the picker.
margin = max(12, round(min(img.size) * 0.04))
canvas = Image.new('RGBA', (img.width + margin * 2, img.height + margin * 2), (0, 0, 0, 0))
canvas.alpha_composite(img, (margin, margin))
canvas.thumbnail((720, 720), Image.Resampling.LANCZOS)
canvas.save(target, 'WEBP', quality=94, method=6)
print('saved', target, target.stat().st_size, 'size', canvas.size, 'alpha extrema', canvas.getchannel('A').getextrema())

a = canvas.getchannel('A')
if a.getextrema() == (255, 255):
    raise SystemExit('ERROR: asset is opaque; transparency was lost')
if not a.getbbox():
    raise SystemExit('ERROR: asset is empty')
print('transparent asset verified')
