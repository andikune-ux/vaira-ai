from pathlib import Path
import numpy as np
from PIL import Image, ImageFilter

source = Path('/home/ubuntu/copy-of-airax-ai/assets/images/vaira-chicken-target-transparent.webp')
target = Path('/home/ubuntu/copy-of-airax-ai/assets/images/vaira-chicken-target-transparent.webp')
img = Image.open(source).convert('RGBA')
arr = np.array(img)
rgb = arr[:, :, :3].astype(np.int16)
r, g, b = rgb[:, :, 0], rgb[:, :, 1], rgb[:, :, 2]
# Keep only the known chicken palette: white body, yellow details, and navy outline.
white = (r >= 150) & (g >= 150) & (b >= 150) & (np.maximum.reduce([r, g, b]) - np.minimum.reduce([r, g, b]) <= 70)
yellow = (r >= 145) & (g >= 90) & (b <= 135) & (r >= b + 35) & (g >= b + 20)
navy = (b >= 45) & (b >= r + 28) & (b >= g + 12) & (r <= 90)
green_spill = (g > r + 3) & (g > b + 3)
keep = (white | yellow | navy) & ~green_spill
# Preserve anti-aliased perimeter by a very small dilation, but never retain raw background.
mask = Image.fromarray((keep.astype(np.uint8) * 255), 'L').filter(ImageFilter.MaxFilter(3))
alpha = np.array(mask)
rgba = arr.copy()
rgba[:, :, 3] = alpha
ys, xs = np.where(alpha > 0)
if len(xs) == 0:
    raise SystemExit('ERROR: no foreground retained')
pad = max(10, min(img.size) // 28)
x0, x1 = max(0, int(xs.min())-pad), min(img.width, int(xs.max())+pad+1)
y0, y1 = max(0, int(ys.min())-pad), min(img.height, int(ys.max())+pad+1)
out = Image.fromarray(rgba[y0:y1, x0:x1], 'RGBA')
out.thumbnail((720, 720), Image.Resampling.LANCZOS)
out.save(target, 'WEBP', quality=95, method=6)
check = Image.open(target).convert('RGBA').getchannel('A')
transparent = sum(v == 0 for v in check.getdata())
print('saved', target, target.stat().st_size, 'size', out.size, 'alpha', check.getextrema(), 'transparent_pct', round(transparent * 100 / (check.width * check.height), 2))
if check.getextrema() == (255, 255):
    raise SystemExit('ERROR: no transparent pixels remain')
