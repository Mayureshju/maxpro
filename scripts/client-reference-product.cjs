/** Refresh marketing assets from real current workspace captures, retaining crop provenance. */
const {chromium}=require('../apps/web/node_modules/@playwright/test');
const fs=require('node:fs'),{createHash}=require('node:crypto');
const sharp=require('node:module').createRequire(require.resolve('../apps/web/node_modules/next/package.json'))('sharp');
const base=process.env.MAXPRO_PRODUCT_BASE_URL||process.env.PHASE15_BASE_URL||'http://localhost:3000',dir='apps/web/public/product';
const screens={dashboard:'/workspace',inventory:'/workspace/inventory',editor:'/workspace/inventory/AQ-10233/edit',media:'/workspace/inventory/AQ-10233/media',publish:'/workspace/publish?property=AQ-10233&goal=portals',review:'/workspace/publish?property=AQ-10233&goal=portals',leads:'/workspace/leads',inbox:'/workspace/inbox?lead=LE-2101',campaign:'/workspace/publish?property=AQ-10233&goal=advertising',assistance:'/workspace/inventory/AQ-10233/edit?step=1'};
const hash=b=>createHash('sha256').update(b).digest('hex');
(async()=>{
 const browser=await chromium.launch({executablePath:process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH||'/Users/dieturetech/Library/Caches/ms-playwright/chromium_headless_shell-1208/chrome-headless-shell-mac-arm64/chrome-headless-shell'}),page=await browser.newPage({reducedMotion:'reduce'});const screensMeta=[],details=[],tasks=[];
 for(const locale of ['en','ar'])for(const mobile of [false,true])for(const [screen,route]of Object.entries(screens)){
  const viewport=mobile?{width:375,height:812}:{width:1440,height:1000};await page.setViewportSize(viewport);await page.goto(`${base}/${locale}${route}`);await page.locator('main h1').first().waitFor();await page.evaluate(()=>document.fonts.ready);
  if(['publish','review','campaign'].includes(screen)){await page.locator('.ag-channel-choice').first().getByRole('checkbox').check();await page.locator('.ag-channel-tabs~div:visible>.px-section').first().evaluate(el=>window.scrollTo({top:el.getBoundingClientRect().top+scrollY-80,behavior:'instant'}));}
  if(screen==='assistance')await page.getByRole('button',{name:locale==='ar'?'اقتراح وصف باللغتين':'Suggest bilingual copy',exact:true}).click();
  if(mobile&&screen==='inbox')await page.locator('.px-chat-compose').scrollIntoViewIfNeeded();
  const file=`${locale}-${screen}${mobile?'-mobile':''}.webp`,raw=await page.screenshot({animations:'disabled'});const buffer=await sharp(raw).webp({quality:90}).toBuffer();fs.writeFileSync(`${dir}/${file}`,buffer);screensMeta.push({locale,name:screen,route,viewport,file,sha256:hash(buffer)});
  if(mobile&&['campaign','inbox'].includes(screen)){const taskFile=`${locale}-${screen}-task-mobile.webp`;fs.writeFileSync(`${dir}/${taskFile}`,buffer);tasks.push({locale,route,viewport,file:taskFile,sha256:hash(buffer)});}
  if(['dashboard','editor','assistance','publish','review','campaign','inbox','leads'].includes(screen)&&(!mobile||screen!=='assistance')){
   let target=page.locator(screen==='assistance'?'.ag-assistant':screen==='editor'?'.ag-editor-content':screen==='dashboard'?'.prototype-main':screen==='publish'||screen==='review'||screen==='campaign'?'.ag-channel-tabs~div:visible>.px-section':'.prototype-main');
   const box=await target.first().boundingBox();if(!box)throw Error(`Missing capture region ${screen}`);
   const left=Math.max(0,Math.floor(box.x)),top=Math.max(0,Math.floor(box.y));const rectangle={left,top,width:Math.max(1,Math.min(viewport.width-left,Math.ceil(box.width))),height:Math.max(1,Math.min(viewport.height-top,Math.ceil(box.height)))};
   const detailFile=`${locale}-${screen}-detail${mobile?'-mobile':''}.webp`;await sharp(buffer).extract(rectangle).webp({quality:92}).toFile(`${dir}/${detailFile}`);details.push({file:detailFile,source:file,sourceSha256:hash(buffer),rectangle,transformation:'Exact crop and WebP encoding of actual current app; no synthesized interface'});
  }
 }
 for(const mobile of [false,true])fs.writeFileSync(`${dir}/product${mobile?'-mobile':''}-provenance.json`,JSON.stringify({source:'Actual Phase 17 Webpack production workspace; fictional records',baseline:'ad1c430',screens:screensMeta.filter(s=>s.file.includes('-mobile')===mobile)},null,2));
 fs.writeFileSync(`${dir}/detail-provenance.json`,JSON.stringify({baseline:'ad1c430',records:details},null,2));fs.writeFileSync(`${dir}/task-mobile-provenance.json`,JSON.stringify({captureBuild:'Phase 17 Webpack production preview',records:tasks},null,2));await browser.close();console.log(JSON.stringify({screens:screensMeta.length,details:details.length,tasks:tasks.length}));
})().catch(e=>{console.error(e);process.exit(1)});
