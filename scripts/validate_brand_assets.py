from pathlib import Path
from PIL import Image
import xml.etree.ElementTree as ET

root = Path(__file__).resolve().parents[1] / "assets" / "images" / "brands"
for path in sorted(root.iterdir()):
    if not path.is_file():
        continue
    size = path.stat().st_size
    result = "OK"
    details = f"bytes={size}"
    if size == 0:
        result = "BROKEN"
    elif path.suffix.lower() in {".png", ".jpg", ".jpeg", ".webp"}:
        try:
            with Image.open(path) as image:
                image.verify()
            with Image.open(path) as image:
                details += f" dimensions={image.size} mode={image.mode}"
                if image.width < 2 or image.height < 2:
                    result = "BROKEN"
        except Exception as exc:
            result = "BROKEN"
            details += f" error={type(exc).__name__}"
    elif path.suffix.lower() == ".svg":
        try:
            ET.parse(path)
            text = path.read_text(encoding="utf-8", errors="ignore")
            if "<svg" not in text[:1000].lower():
                result = "BROKEN"
        except Exception as exc:
            result = "BROKEN"
            details += f" error={type(exc).__name__}"
    else:
        result = "UNKNOWN"
    print(f"{result}\t{path.name}\t{details}")
