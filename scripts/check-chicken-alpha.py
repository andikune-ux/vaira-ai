from pathlib import Path
from PIL import Image

for name in ['vaira-chicken-target-transparent.webp', 'vaira-chicken-target.png']:
    path = Path('/home/ubuntu/copy-of-airax-ai/assets/images') / name
    if not path.exists():
        continue
    image = Image.open(path).convert('RGBA')
    alpha = image.getchannel('A')
    extrema = alpha.getextrema()
    opaque = sum(1 for value in alpha.getdata() if value == 255)
    transparent = sum(1 for value in alpha.getdata() if value == 0)
    total = image.width * image.height
    print(name, image.size, 'alpha', extrema, 'opaque_pct', round(opaque * 100 / total, 2), 'transparent_pct', round(transparent * 100 / total, 2))
