from pathlib import Path
from PIL import Image, ImageDraw, ImageOps
import hashlib, json
root=Path(__file__).resolve().parents[1]
files=sorted((root/'screenshots').glob('*.png'))
manifest=[]
for f in files:
 with Image.open(f) as im:
  manifest.append({'path':str(f.relative_to(root)), 'width':im.width,'height':im.height,'sha256':hashlib.sha256(f.read_bytes()).hexdigest()})
(root/'screenshot-manifest.json').write_text(json.dumps(manifest,indent=2)+'\n')
for locale in ['en','ar']:
 for width in [1440,1024,768,375]:
  batch=[f for f in files if f.name.startswith(f'{locale}-{width}-')]
  tile_w,tile_h=360,480
  sheet=Image.new('RGB',(tile_w*4,tile_h*((len(batch)+3)//4)), '#e5e5df')
  draw=ImageDraw.Draw(sheet)
  for i,f in enumerate(batch):
   x=(i%4)*tile_w;y=(i//4)*tile_h
   with Image.open(f).convert('RGB') as im:
    crop=im.crop((0,0,im.width,min(im.height,1800 if width>768 else 1600)))
    crop.thumbnail((tile_w-16,tile_h-35))
    sheet.paste(crop,(x+8,y+30))
   draw.text((x+8,y+10),f.name,fill='#182b2a')
  sheet.save(root/'review'/f'{locale}-{width}-contact-sheet.jpg',quality=85)
print(f'{len(manifest)} screenshots; eight contact sheets')
