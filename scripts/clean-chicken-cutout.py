from pathlib import Path
import numpy as np
from PIL import Image, ImageFilter

source = Path('/home/ubuntu/upload/eed852f0-9a58-11f1-9a87-7f89a6a41875.png')
target = Path('/home/ubuntu/copy-of-airax-ai/assets/images/vaira-chicken-target-clean.webp')
image = Image.open(source).convert('RGB')
rgb = np.asarray(image, dtype=np.int16)
# Foreground palette: white body, warm yellow details, and navy outline.
prototypes = [np.array([248, 248, 248]), np.array([250, 180, 18]), np.array([8, 34, 92])]
distance = np.stack([np.sqrt(((rgb - p) ** 2).sum(axis=2)) for p in prototypes], axis=0)
mask = (distance.min(axis=0) < 72).astype(np.uint8) * 255
# Soften and bridge anti-aliased edges around the actual character.
mask_image = Image.fromarray(mask, mode='L').filter(ImageFilter.MaxFilter( nine := 9 )).filter(ImageFilter.GaussianBlur(1.0))
alpha = np.asarray(mask_image, dtype=np.uint8)
rgba = np.dstack([rgb.astype(np.uint8), alpha])
Image.fromarray(rgba, mode='RGBA').save(target, format='WEBP', quality=94, method=6)
print(target, target.stat().st_size, image.size, int((alpha > 20).sum()))
