from pathlib import Path
import numpy as np
from PIL import Image, ImageFilter

source = Path('/home/ubuntu/upload/eed852f0-9a58-11f1-9a87-7f89a6a41875.png')
target = Path('/home/ubuntu/copy-of-airax-ai/assets/images/vaira-chicken-target-transparent.webp')
image = Image.open(source).convert('RGBA')
arr = np.array(image)
rgb = arr[:, :, :3].astype(np.int16)
r, g, b = rgb[:, :, 0], rgb[:, :, 1], rgb[:, :, 2]
# Background is green; retain the chicken's white, yellow and navy foreground.
green = (g > r + 8) & (g > b + 8) & (g > 45)
# Remove low-saturation green/gray spill near the green background while preserving bright white body.
spill = (g > 70) & (g > r * 1.02) & (g > b * 1.02) & (np.abs(g - r) < 95)
background = green | spill
alpha = np.where(background, 0, 255).astype(np.uint8)
# Remove only tiny edge noise; do not blur the character boundary.
alpha_img = Image.fromarray(alpha, 'L').filter(ImageFilter.MinFilter(3)).filter(ImageFilter.MaxFilter(3))
alpha = np.array(alpha_img)
# Keep only the meaningful foreground bbox and add transparent padding.
ys, xs = np.where(alpha > 0)
if len(xs) == 0:
    raise SystemExit('ERROR: segmentation removed all foreground')
pad = max(16, min(image.size) // 30)
x0, x1 = max(0, int(xs.min()) - pad), min(image.width, int(xs.max()) + pad + 1)
y0, y1 = max(0, int(ys.min()) - pad), min(image.height, int(ys.max()) + pad + 1)
crop = arr[y0:y1, x0:x1].copy()
crop_alpha = alpha[y0:y1, x0:x1]
crop[:, :, 3] = crop_alpha
out = Image.fromarray(crop, 'RGBA')
out.thumbnail((720, 720), Image.Resampling.LANCZOS)
out.save(target, 'WEBP', quality=94, method=6)
check = Image.open(target).convert('RGBA').getchannel('A')
print('saved', target, target.stat().st_size, 'size', out.size, 'alpha', check.getextrema(), 'transparent_pct', round(sum(v == 0 for v in check.getdata()) * 100 / (check.width * check.height), 2))
if check.getextrema() == (255, 255):
    raise SystemExit('ERROR: final output is opaque')
