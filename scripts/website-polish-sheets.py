"""Review sheets derived from real captures; source screenshots remain intact."""
from pathlib import Path
from PIL import Image, ImageDraw
root = Path('artifacts/phase12')
names = ['home', 'solutions', 'how-it-works', 'features-property-management',
         'features-publish-and-promote', 'features-ai-assistance', 'features-leads-and-inbox',
         'integrations', 'solutions-agencies', 'pricing', 'about', 'contact', 'faq']
for mode in ['before', 'after']:
    source = root / mode
    output = root / 'contact-sheets' / mode
    output.mkdir(parents=True, exist_ok=True)
    for locale in ['en', 'ar']:
        for width in [1440, 1280, 1024, 768, 375, 320]:
            files = [source / f'{locale}-{width}-{name}.png' for name in names
                     if (source / f'{locale}-{width}-{name}.png').exists()]
            if not files:
                continue
            for zone, fraction in [('top', 0), ('middle', .5), ('bottom', 1)]:
                sheet = Image.new('RGB', (1600, 450 * ((len(files) + 3) // 4)), '#e9e9e2')
                draw = ImageDraw.Draw(sheet)
                for index, path in enumerate(files):
                    capture = Image.open(path).convert('RGB')
                    height = min(capture.height, round(capture.width * 1.1))
                    top = round((capture.height - height) * fraction)
                    crop = capture.crop((0, top, capture.width, top + height))
                    crop.thumbnail((390, 420))
                    x, y = index % 4 * 400, index // 4 * 450
                    sheet.paste(crop, (x, y + 25))
                    draw.text((x + 5, y + 5), path.stem, fill='#243d35')
                sheet.save(output / f'{locale}-{width}-{zone}.jpg', quality=86)
print('Contact sheets generated from real-app before/after captures.')
