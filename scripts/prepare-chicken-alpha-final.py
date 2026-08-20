from pathlib import Path
from PIL import Image

source = Path('/home/ubuntu/webdev-static-assets/chicken-alpha-final.png')
target = Path('/home/ubuntu/copy-of-airax-ai/assets/images/vaira-chicken-target-transparent.webp')
img = Image.open(source).convert('RGBA')
alpha = img.getchannel('A')
print('source', img.size, 'alpha_extrema', alpha.getextrema(), 'bbox', alpha.getbbox())
if alpha.getextrema() == (255, 255):
    raise SystemExit('ERROR: generated cutout is still fully opaque')
bbox = alpha.getbbox()
if not bbox:
    raise SystemExit('ERROR: generated cutout has no visible pixels')
img = img.crop(bbox)
margin = max(16, round(min(img.size) * 0.035))
canvas = Image.new('RGBA', (img.width + margin * 2, img.height + margin * 2), (0, 0, 0, 0))
canvas.alpha_composite(img, (margin, margin))
canvas.thumbnail((720, 720), Image.Resampling.LANCZOS)
canvas.save(target, 'WEBP', quality=94, method=6)
final_alpha = canvas.getchannel('A')
print('saved', target, target.stat().st_size, 'size', canvas.size, 'alpha_extrema', final_alpha.getextrema(), 'alpha_bbox', final_alpha.getbbox())
if final_alpha.getextrema() == (255, 255):
    raise SystemExit('ERROR: final asset lost transparency')
