from pathlib import Path

from PIL import Image


root = Path(__file__).resolve().parents[1]
source = root / "assets/images/icon.png"
targets = [
    root / "assets/images/icon.png",
    root / "assets/images/splash-icon.png",
    root / "assets/images/favicon.png",
    root / "assets/images/android-icon-foreground.png",
]

with Image.open(source) as image:
    resized = image.convert("RGB").resize((512, 512), Image.Resampling.LANCZOS)
    for target in targets:
        resized.save(target, format="PNG", optimize=True, compress_level=9)
