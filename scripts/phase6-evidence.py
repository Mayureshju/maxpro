"""Build a factual manifest and review sheets from existing Playwright PNGs."""
from pathlib import Path
import hashlib
import json
import struct

root = Path('artifacts/phase6')
images = []
for file in sorted(root.rglob('*.png')):
    if 'contact-sheets' in file.parts:
        continue
    blob = file.read_bytes()
    width, height = struct.unpack('>II', blob[16:24])
    images.append({'path': str(file), 'width': width, 'height': height,
                   'sha256': hashlib.sha256(blob).hexdigest()})
(root / 'screenshot-manifest.json').write_text(json.dumps(images, indent=2) + '\n')
try:
    from PIL import Image, ImageDraw
except ImportError:
    print(f'{len(images)} screenshots manifested; Pillow unavailable for optional review sheets.')
    raise SystemExit(0)

folder = root / 'contact-sheets'
folder.mkdir(exist_ok=True)
for project in ['chromium', 'mobile-chromium']:
    for locale in ['en', 'ar']:
        files = [p for p in sorted((root / 'screenshots').glob(f'{project}-{locale}-*.png')) if 'new-organization-empty' not in p.name]
        for part in range(0, len(files), 12):
            selected = files[part:part + 12]
            sheet = Image.new('RGB', (1440, 1440), '#ebece7')
            draw = ImageDraw.Draw(sheet)
            for i, file in enumerate(selected):
                with Image.open(file) as source:
                    source = source.convert('RGB')
                    start = min(280, max(0, source.height - 650)) if project == 'mobile-chromium' else 0
                    crop_height = min(source.height - start, 650 if project == 'mobile-chromium' else round(source.width * 1.25))
                    crop = source.crop((0, start, source.width, start + crop_height))
                    crop.thumbnail((340, 425))
                    x, y = (i % 4) * 360 + 10, (i // 4) * 480 + 30
                    sheet.paste(crop, (x, y))
                    draw.text((x, y - 22), file.stem.replace(f'{project}-{locale}-', ''), fill='#263f37')
            sheet.save(folder / f'{project}-{locale}-{part // 12 + 1}.jpg', quality=90)
print(f'{len(images)} screenshots manifested; review sheets generated from their actual pixels.')
