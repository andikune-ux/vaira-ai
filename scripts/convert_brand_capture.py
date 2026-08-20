from pathlib import Path
from PIL import Image

root = Path('/home/ubuntu/copy-of-airax-ai/.brand-downloads')
for stem in ('bri-official', 'pospay-official', 'bank-jatim-official', 'panin-official', 'superbank-official'):
    source = root / f'{stem}.webp'
    target = root / f'{stem}.png'
    with Image.open(source) as image:
        image.convert('RGBA').save(target, format='PNG', optimize=True)
    print(target, target.stat().st_size, image.size)
