from pathlib import Path
from PIL import Image

source = Path('/home/ubuntu/upload/eed852f0-9a58-11f1-9a87-7f89a6a41875.png')
target = Path('/home/ubuntu/copy-of-airax-ai/assets/images/vaira-chicken-target.webp')
image = Image.open(source).convert('RGB')
image.save(target, format='WEBP', quality=88, method=6)
print(target, target.stat().st_size, image.size)
