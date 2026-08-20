from pathlib import Path
import numpy as np
from PIL import Image, ImageFilter

source = Path('/home/ubuntu/copy-of-airax-ai/assets/images/vaira-chicken-target.webp')
target = Path('/home/ubuntu/copy-of-airax-ai/assets/images/vaira-chicken-target-transparent.webp')
image = Image.open(source).convert('RGBA')
hsv = np.asarray(image.convert('HSV'), dtype=np.uint8)
hue = hsv[:, :, 0].astype(np.int16) * 2
sat = hsv[:, :, 1].astype(np.int16)
value = hsv[:, :, 2].astype(np.int16)
# Vegetation green range; navy outline is blue and yellow features are excluded.
green = (hue >= 30) & (hue <= 200) & (sat >= 28) & (value <= 235)
dark_green = (hue >= 30) & (hue <= 200) & (sat >= 18) & (value <= 85)
mask = (green | dark_green).astype(np.uint8) * 255
mask_image = Image.fromarray(mask, mode='L').filter(ImageFilter.MedianFilter(5)).filter(ImageFilter.GaussianBlur(1.2))
alpha = 255 - np.asarray(mask_image, dtype=np.uint8)
rgba = np.asarray(image, dtype=np.uint8).copy()
rgba[:, :, 3] = alpha
Image.fromarray(rgba, mode='RGBA').save(target, format='WEBP', quality=92, method=6)
print(target, target.stat().st_size, image.size)
