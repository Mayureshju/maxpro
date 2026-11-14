"""Arrange unmodified running-app screenshots for human visual comparison."""
from pathlib import Path
import hashlib
import json
from PIL import Image, ImageDraw

root = Path('artifacts/phase10')
sheets = root / 'contact-sheets'
sheets.mkdir(exist_ok=True)
manifest = []
for stage in ['before', 'after']:
    for file in sorted((root / stage).glob('*.png')):
        with Image.open(file) as source:
            manifest.append({'path': str(file), 'width': source.width, 'height': source.height,
                             'sha256': hashlib.sha256(file.read_bytes()).hexdigest()})
    for locale in ['en', 'ar']:
        for width in [1440, 1280, 1024, 768, 375, 320]:
            files = sorted((root / stage).glob(f'{locale}-{width}-*.png'))
            for part in range(0, len(files), 12):
                sheet = Image.new('RGB', (1440, 1530), '#e9eae3')
                draw = ImageDraw.Draw(sheet)
                for i, file in enumerate(files[part:part + 12]):
                    with Image.open(file) as source:
                        im = source.convert('RGB')
                        im = im.crop((0, 0, im.width, min(im.height, 1200)))
                        im.thumbnail((342, 460))
                        x, y = (i % 4) * 360 + 8, (i // 4) * 510 + 32
                        sheet.paste(im, (x, y))
                        draw.text((x, y - 24), file.stem.removeprefix(f'{locale}-{width}-')[:43], fill='#203b37')
                sheet.save(sheets / f'{stage}-{locale}-{width}-{part // 12 + 1:02}.jpg', quality=88)
(root / 'screenshot-manifest.json').write_text(json.dumps(manifest, indent=2) + '\n')
print(f'{len(manifest)} real screenshots manifested; contact sheets ready for inspection.')
