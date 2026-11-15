const {chromium}=require('../apps/web/node_modules/@playwright/test');
const {mkdirSync,writeFileSync}=require('node:fs');
const {createRequire}=require('node:module');
const {createHash}=require('node:crypto');
const sharp=createRequire(require.resolve('../apps/web/node_modules/next/package.json'))('sharp');
const base=process.env.MARKETING_BASE_URL||'http://127.0.0.1:3212';
(async()=>{const browser=await chromium.launch({executablePath:process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH}),page=await browser.newPage({reducedMotion:'reduce'}),records=[];
 mkdirSync('artifacts/phase12/interactions',{recursive:true});
 for(const locale of ['en','ar']){
  await page.setViewportSize({width:1024,height:600});await page.goto(`${base}/${locale}`);await page.evaluate(()=>{document.documentElement.style.zoom='2';});
  records.push({locale,zoom:await page.evaluate(()=>({innerWidth,clientWidth:document.documentElement.clientWidth,scrollWidth:document.documentElement.scrollWidth,bodyWidth:document.body.getBoundingClientRect().width,overflow:[...document.querySelectorAll('body *')].filter(el=>{const r=el.getBoundingClientRect();return r.width&&r.right>innerWidth+1}).map(el=>({tag:el.tagName,cls:el.className,rect:el.getBoundingClientRect().toJSON()})).slice(0,15)}))});
  await page.screenshot({path:`artifacts/phase12/interactions/${locale}-zoom.png`});await page.evaluate(()=>{document.documentElement.style.zoom='';});
  await page.setViewportSize({width:375,height:812});
  for(const screen of ['campaign','inbox']){
   const route=screen==='campaign'?'/workspace/publish?property=AQ-10233&goal=advertising':'/workspace/inbox';
   await page.goto(`${base}/${locale}${route}`);await page.locator('main h1').waitFor();
   if(screen==='campaign'){await page.locator('.ag-channel-choice').first().getByRole('checkbox').check();await page.locator('.ag-channel-workflow').scrollIntoViewIfNeeded();await page.locator('.ag-channel-workflow').evaluate(el=>window.scrollTo({top:el.getBoundingClientRect().top+scrollY-80,behavior:'instant'}));}
   else await page.locator('.px-chat-panel').evaluate(el=>window.scrollTo({top:el.getBoundingClientRect().top+scrollY-80,behavior:'instant'}));
   await page.evaluate(()=>document.fonts.ready);const buffer=await page.screenshot({animations:'disabled'}),file=`${locale}-${screen}-task-mobile.webp`;
   await sharp(buffer).webp({quality:90}).toFile(`apps/web/public/product/${file}`);records.push({file,sha256:createHash('sha256').update(await sharp(buffer).webp({quality:90}).toBuffer()).digest('hex'),locale,route,viewport:{width:375,height:812},source:'Actual running app screenshot; fictional records; no alterations except WebP encoding'});
  }
 }
 writeFileSync('artifacts/phase12/interactions/diagnostics.json',JSON.stringify(records,null,2));writeFileSync('apps/web/public/product/task-mobile-provenance.json',JSON.stringify({baseline:'a2d34f0634568cdd8a9dfc044161c5cf94d670f4',captureBuild:'Phase 12 Webpack production preview; workspace source unchanged from baseline',records:records.filter(r=>r.file)},null,2));await browser.close();console.log(JSON.stringify(records.filter(r=>r.zoom),null,2));
})().catch(e=>{console.error(e);process.exit(1)});
