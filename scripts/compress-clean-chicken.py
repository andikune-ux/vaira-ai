from pathlib import Path
from PIL import Image

source = Path('/home/ubuntu/copy-of-airax-ai/assets/images/vaira-chicken-target-clean.png')
target = Path('/home/ubuntu/copy-of-airax-ai/assets/images/vaira-chicken-target-transparent.webp')
image = Image.open(source).convert('RGBA')
image.save(target, format='WEBP', quality=95, method=6)
print(target, target.stat().st_size)
