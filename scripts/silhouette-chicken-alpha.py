from pathlib import Path
import numpy as np
from PIL import Image

path = Path('/home/ubuntu/copy-of-airax-ai/assets/images/vaira-chicken-target-transparent.webp')
img = Image.open(path).convert('RGBA')
arr = np.array(img)
h, w = arr.shape[:2]
y, x = np.mgrid[0:h, 0:w]
def ellipse(cx, cy, rx, ry):
    return ((x-cx)/rx)**2 + ((y-cy)/ry)**2 <= 1
# Approximate the exact chicken silhouette; this removes all pixels outside the character.
allowed = ellipse(w*0.50, h*0.59, w*0.38, h*0.43)
allowed |= ellipse(w*0.50, h*0.15, w*0.20, h*0.18)
allowed |= ellipse(w*0.19, h*0.56, w*0.18, h*0.25)
allowed |= ellipse(w*0.81, h*0.56, w*0.18, h*0.25)
allowed |= ellipse(w*0.34, h*0.94, w*0.15, h*0.09)
allowed |= ellipse(w*0.66, h*0.94, w*0.15, h*0.09)
# Keep only the previously segmented foreground within the character silhouette.
arr[:, :, 3] = np.where(allowed, arr[:, :, 3], 0)
ys, xs = np.where(arr[:, :, 3] > 0)
if len(xs) == 0:
    raise SystemExit('ERROR: silhouette removed all pixels')
pad = 8
x0, x1 = max(0, xs.min()-pad), min(w, xs.max()+pad+1)
y0, y1 = max(0, ys.min()-pad), min(h, ys.max()+pad+1)
out = Image.fromarray(arr[y0:y1, x0:x1], 'RGBA')
out.save(path, 'WEBP', quality=95, method=6)
check = Image.open(path).convert('RGBA').getchannel('A')
print('saved', path, path.stat().st_size, 'size', out.size, 'alpha', check.getextrema(), 'transparent_pct', round(sum(v == 0 for v in check.getdata()) * 100 / (check.width * check.height), 2))
