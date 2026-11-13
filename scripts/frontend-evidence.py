"""Manifest real Playwright captures and derive compact visual-review sheets."""
from pathlib import Path
import hashlib,json,struct
from PIL import Image,ImageDraw
root=Path('artifacts/frontend')
manifest=[]
for stage in ['before','after']:
 for file in sorted((root/stage).glob('*.png')):
  blob=file.read_bytes();w,h=struct.unpack('>II',blob[16:24]);manifest.append({'path':str(file),'width':w,'height':h,'sha256':hashlib.sha256(blob).hexdigest()})
 for width in [1440,1024,768,375]:
  for locale in ['en','ar']:
   files=sorted((root/stage).glob(f'{width}-{locale}-*.png'))
   for part in range(0,len(files),12):
    selected=files[part:part+12];sheet=Image.new('RGB',(1440,1470),'#e9eae3');draw=ImageDraw.Draw(sheet)
    for i,file in enumerate(selected):
     with Image.open(file) as source:
      im=source.convert('RGB');start=60 if width==375 and 'workspace' in file.name else 0
      im=im.crop((0,start,im.width,min(im.height,start+(1150 if width==375 else 1550))))
      im.thumbnail((342,450));x,y=(i%4)*360+8,(i//4)*490+28;sheet.paste(im,(x,y));draw.text((x,y-20),file.stem.replace(f'{width}-{locale}-','')[:45],fill='#203b37')
    sheet.save(root/'contact-sheets'/f'{stage}-{width}-{locale}-{part//12+1:02}.jpg',quality=88)
(root/'screenshot-manifest.json').write_text(json.dumps(manifest,indent=2)+'\n')
print(f'{len(manifest)} real browser screenshots manifested; contact sheets generated.')

# A local review aid displaying actual captures; it is not a substitute application.
records=[]
for stage in ['before','after']:
 log=root/'logs'/f'{stage}-routes.json'
 if not log.exists(): continue
 for row in json.loads(log.read_text()):
  slug=row['route'].lstrip('/').replace('/','-') or 'home'
  file=f"{stage}/{row['width']}-{row['locale']}-{slug}.png"
  if (root/file).exists():records.append({'stage':stage,'width':row['width'],'locale':row['locale'],'route':row['route'],'file':file})
html='''<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>MaxPro · Frontend browser review</title><style>
*{box-sizing:border-box}body{margin:0;background:#eceee7;color:#233e32;font:14px/1.6 system-ui,sans-serif}header{padding:22px 28px;background:#fff;border-bottom:1px solid #ccd8c7}header h1{font-size:22px;line-height:1.3;margin:0 0 8px}header p{margin:0;color:#526854;max-width:1050px}a{color:#285d46}nav{display:flex;align-items:end;gap:16px;flex-wrap:wrap;padding:18px 28px;background:#f8f9f5;border-bottom:1px solid #ccd8c7;position:sticky;top:0;z-index:1}label{display:grid;gap:5px;font-size:12px}select{min-height:40px;border:1px solid #b9cbb3;background:#fff;padding:8px;color:#254a32;max-width:100%;font:inherit}label:has(#route){flex:1;min-width:240px}main{padding:24px}#evidence{margin:0 auto;display:block;max-width:100%;height:auto;border:1px solid #c7d3c1;background:#fff}#caption{margin:0 auto 18px;max-width:1440px;font-size:13px}#missing{text-align:center;padding:50px}select:focus-visible,a:focus-visible{outline:2px solid #285d46;outline-offset:3px}@media(max-width:600px){header,nav{padding:16px}main{padding:12px}label:has(#route){min-width:100%}nav{position:static}}
</style><header><h1>MaxPro · Actual browser captures</h1><p>Frontend prototype review · 13 November 2026. These are screenshots from the running Next.js app, with fictional browser-local data. Choose a screen, language and viewport. This gallery is an evidence viewer; use the local app to try workflows. Native Arabic and independent design approval remain pending. <a href="../../docs/27-final-frontend-ui-review.md">Read the review</a>.</p></header><nav aria-label="Screenshot selection"><label>Capture<select id="stage"><option value="after">After improvements</option><option value="before">Baseline</option></select></label><label>Screen<select id="route"></select></label><label>Language<select id="locale"><option value="en">English</option><option value="ar">Arabic / RTL</option></select></label><label>Viewport<select id="width"><option>1440</option><option>1024</option><option>768</option><option>375</option></select></label></nav><main><p id="caption" role="status"></p><p id="missing" hidden>No capture exists for this selection. Baseline has a smaller matrix; the final pass covers all four widths.</p><a id="full" target="_blank" rel="noopener"><img id="evidence" alt=""></a></main><script>const records=RECORDS;const get=id=>document.getElementById(id);const routes=[...new Set(records.map(r=>r.route))].sort();for(const value of routes){const o=document.createElement('option');o.value=value;o.textContent=value;get('route').append(o)}get('route').value='/workspace';function render(){const record=records.find(r=>r.stage===get('stage').value&&r.route===get('route').value&&r.locale===get('locale').value&&r.width===Number(get('width').value));get('full').hidden=!record;get('missing').hidden=!!record;get('caption').textContent=record?`${record.stage} · ${record.route} · ${record.locale.toUpperCase()} · ${record.width}px · Open image for full resolution.`:'';if(record){get('full').href=record.file;get('evidence').src=record.file;get('evidence').alt=`Actual MaxPro ${record.route} screenshot, ${record.locale}, ${record.width} pixels`;get('evidence').style.width=record.width+'px'}}for(const id of ['stage','route','locale','width'])get(id).addEventListener('change',render);render();</script></html>'''
(root/'index.html').write_text(html.replace('RECORDS',json.dumps(records,ensure_ascii=False)))
print(f'Local screenshot gallery generated for {len(records)} capture records.')
