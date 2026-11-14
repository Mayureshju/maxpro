"""Contact sheets from real screenshots; originals remain unchanged."""
from PIL import Image, ImageDraw
from pathlib import Path
import json
root=Path('artifacts/phase11')
for mode in ['before','after']:
 source=root/mode
 if not (source/'inventory.json').exists():continue
 inventory=json.loads((source/'inventory.json').read_text())
 output=root/'contact-sheets'/mode
 output.mkdir(parents=True,exist_ok=True)
 for locale in ['en','ar']:
  for width in sorted(set(r['width'] for r in inventory)):
   rows=[r for r in inventory if r['locale']==locale and r['width']==width]
   for start in range(0,len(rows),6):
    group=rows[start:start+6]
    # Each route gets three slices, so long mobile pages can be inspected at useful scale.
    sheet=Image.new('RGB',(1200,1250),'#e9e9e2');draw=ImageDraw.Draw(sheet)
    for i,row in enumerate(group):
     im=Image.open(source/row['file']).convert('RGB')
     x=(i%3)*400;y=(i//3)*625
     draw.text((x+8,y+8),row['file'],fill='#223c30')
     for n,fraction in enumerate([0,.45,1]):
      slice_height=min(im.height,round(im.width*4.4));top=round((im.height-slice_height)*fraction)
      cut=im.crop((0,top,im.width,top+slice_height));cut.thumbnail((125,570))
      sheet.paste(cut,(x+6+n*130,y+35))
    sheet.save(output/f'{locale}-{width}-{start//6}.jpg',quality=88)
print('Contact sheets written; each route shows top/middle/bottom.')
