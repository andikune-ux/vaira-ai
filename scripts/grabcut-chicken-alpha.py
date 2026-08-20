from pathlib import Path
import cv2
import numpy as np
from PIL import Image

source = Path('/home/ubuntu/upload/eed852f0-9a58-11f1-9a87-7f89a6a41875.png')
target = Path('/home/ubuntu/copy-of-airax-ai/assets/images/vaira-chicken-target-transparent.webp')
img = cv2.imread(str(source), cv2.IMREAD_COLOR)
if img is None:
    raise SystemExit('ERROR: source image not found')
h, w = img.shape[:2]
mask = np.full((h, w), cv2.GC_PR_BGD, dtype=np.uint8)
# Definite background: outer border and corners.
border = max(10, min(h, w) // 40)
mask[:border, :] = cv2.GC_BGD
mask[-border:, :] = cv2.GC_BGD
mask[:, :border] = cv2.GC_BGD
mask[:, -border:] = cv2.GC_BGD
# Definite foreground seeds: central body, crest, wings, beak and feet zones.
cv2.ellipse(mask, (w//2, int(h*.55)), (int(w*.30), int(h*.34)), 0, 0, 360, cv2.GC_FGD, -1)
cv2.ellipse(mask, (w//2, int(h*.17)), (int(w*.15), int(h*.12)), 0, 0, 360, cv2.GC_FGD, -1)
cv2.ellipse(mask, (int(w*.28), int(h*.58)), (int(w*.13), int(h*.20)), 0, 0, 360, cv2.GC_FGD, -1)
cv2.ellipse(mask, (int(w*.72), int(h*.58)), (int(w*.13), int(h*.20)), 0, 0, 360, cv2.GC_FGD, -1)
cv2.rectangle(mask, (int(w*.35), int(h*.80)), (int(w*.65), int(h*.98)), cv2.GC_FGD, -1)
# Probable foreground rectangle around the whole subject.
rect = (border, border, w - 2*border, h - 2*border)
bgd = np.zeros((1, 65), np.float64)
fgd = np.zeros((1, 65), np.float64)
cv2.grabCut(img, mask, rect, bgd, fgd, 8, cv2.GC_INIT_WITH_MASK)
alpha = np.where((mask == cv2.GC_FGD) | (mask == cv2.GC_PR_FGD), 255, 0).astype(np.uint8)
# Remove isolated noise and feather only the hard boundary by one pixel.
kernel = np.ones((3, 3), np.uint8)
alpha = cv2.morphologyEx(alpha, cv2.MORPH_OPEN, kernel, iterations=1)
alpha = cv2.morphologyEx(alpha, cv2.MORPH_CLOSE, kernel, iterations=1)
rgba = cv2.cvtColor(img, cv2.COLOR_BGR2RGBA)
rgba[:, :, 3] = alpha
ys, xs = np.where(alpha > 0)
if len(xs) == 0:
    raise SystemExit('ERROR: GrabCut produced empty foreground')
pad = max(12, min(h, w) // 30)
x0, x1 = max(0, xs.min()-pad), min(w, xs.max()+pad+1)
y0, y1 = max(0, ys.min()-pad), min(h, ys.max()+pad+1)
rgba = rgba[y0:y1, x0:x1]
image = Image.fromarray(rgba, 'RGBA')
image.thumbnail((720, 720), Image.Resampling.LANCZOS)
image.save(target, 'WEBP', quality=94, method=6)
check = Image.open(target).convert('RGBA').getchannel('A')
print('saved', target, target.stat().st_size, 'size', image.size, 'alpha', check.getextrema(), 'transparent_pixels', sum(v == 0 for v in check.getdata()))
if check.getextrema() == (255, 255):
    raise SystemExit('ERROR: final output is opaque')
