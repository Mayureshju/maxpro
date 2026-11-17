"""Overview sheets and hashes from genuine Phase 17 browser captures."""
from pathlib import Path
from PIL import Image, ImageDraw
import hashlib
import json

root = Path('artifacts/phase17')
records = json.loads((root / 'after/audit.json').read_text())['records']
output = root / 'contact-sheets'
output.mkdir(exist_ok=True)
for locale in ['en', 'ar']:
    for width in [320, 375, 768, 1024, 1280, 1440]:
        rows = [r for r in records if r['locale'] == locale and r['width'] == width]
        sheet = Image.new('RGB', (1500, 2580), '#e8efeb')
        draw = ImageDraw.Draw(sheet)
        for i, row in enumerate(rows):
            source = Image.open(root / 'after' / row['file']).convert('RGB')
            source = source.crop((0, 0, source.width, min(source.height, 812 if width < 600 else 1000)))
            source.thumbnail((286, 368))
            x, y = (i % 5) * 300, (i // 5) * 430
            draw.text((x + 8, y + 6), row['name'], fill='#14231c')
            sheet.paste(source, (x + 7, y + 28))
        sheet.save(output / f'{locale}-{width}.jpg', quality=88)

files = []
for directory in ['before', 'after', 'interactions']:
    for path in sorted((root / directory).glob('*.png')):
        data = path.read_bytes()
        files.append({'file': str(path.relative_to(root)), 'bytes': len(data), 'sha256': hashlib.sha256(data).hexdigest()})
(root / 'screenshot-manifest.json').write_text(json.dumps({
    'source': 'Actual local Next.js renders; fictional records; no synthetic UI imagery',
    'files': files,
}, indent=2))
print(json.dumps({'screenshots': len(files), 'contact_sheets': 12}))
