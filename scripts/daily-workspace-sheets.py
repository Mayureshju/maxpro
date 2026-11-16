"""Index actual running-app captures for Phase 14 visual inspection; no synthetic UI."""
from pathlib import Path
import hashlib
import json
from PIL import Image, ImageDraw

root = Path('artifacts/phase14')
output = root / 'contact-sheets'
output.mkdir(exist_ok=True)
manifest = []
for stage in ('before', 'after'):
    for path in sorted((root / stage).glob('*.png')):
        with Image.open(path) as source:
            manifest.append({'path': str(path), 'width': source.width, 'height': source.height, 'sha256': hashlib.sha256(path.read_bytes()).hexdigest()})
    if stage != 'after':
        continue
    for locale in ('en', 'ar'):
        for width in (1440, 1280, 1024, 768, 375, 320):
            tile_height = min(920, round(1000 * 280 / width)) + 60
            sheet = Image.new('RGB', (1200, tile_height * 2), '#e8ebe5')
            draw = ImageDraw.Draw(sheet)
            for i, name in enumerate(('dashboard', 'inventory', 'quick-add', 'property', 'publish', 'leads', 'inbox')):
                path = root / stage / f'{locale}-{width}-{name}.png'
                if not path.exists():
                    continue
                with Image.open(path) as source:
                    crop = source.crop((0, 0, source.width, min(source.height, 1000)))
                    crop.thumbnail((280, 920))
                    x, y = (i % 4) * 300 + 10, (i // 4) * tile_height + 40
                    draw.text((x, y - 25), f'{locale} {width}px / {name}', fill='#263f37')
                    sheet.paste(crop, (x, y))
            sheet.save(output / f'{locale}-{width}.jpg', quality=90)
(root / 'screenshot-manifest.json').write_text(json.dumps(manifest, indent=2))
print(json.dumps({'captures': len(manifest), 'contactSheets': len(list(output.glob('*.jpg')))}))
