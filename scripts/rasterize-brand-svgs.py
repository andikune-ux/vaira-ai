from pathlib import Path
import cairosvg

root = Path('/home/ubuntu/copy-of-airax-ai/assets/images/brands')
for name in ('astrapay-official', 'dana-official'):
    source = root / f'{name}.svg'
    target = root / f'{name}.png'
    cairosvg.svg2png(url=str(source), write_to=str(target), output_width=512, output_height=512)
    print(target, target.stat().st_size)
