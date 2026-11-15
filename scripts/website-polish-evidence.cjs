/* Phase 12: actual local app captures. Never rewrites Phase 11 evidence. */
const {chromium}=require('../apps/web/node_modules/@playwright/test');
const {mkdirSync,writeFileSync}=require('node:fs');
const mode=process.argv[2]||'after';
const base=process.env.MARKETING_BASE_URL||'http://127.0.0.1:3212';
const out=`artifacts/phase12/${mode}`;
const routes=['','/solutions','/how-it-works','/features/property-management','/features/publish-and-promote','/features/ai-assistance','/features/leads-and-inbox','/integrations','/solutions/agencies','/pricing','/about','/contact','/faq'];
(async()=>{
 mkdirSync(out,{recursive:true});
 const browser=await chromium.launch({executablePath:process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH});
 const page=await browser.newPage({reducedMotion:'reduce'});const records=[];
 for(const locale of ['en','ar'])for(const width of (process.env.MAXPRO_WIDTHS||'1440,375').split(',').map(Number)){
  await page.setViewportSize({width,height:width<600?812:1000});
  for(const route of routes){
   await page.goto(`${base}/${locale}${route}`);await page.locator('main h1').waitFor();await page.evaluate(()=>document.fonts.ready);
   await page.locator('main img').evaluateAll(async images=>{for(const img of images){img.loading='eager';await img.decode().catch(()=>{});}});
   const name=route.slice(1).replaceAll('/','-')||'home',file=`${locale}-${width}-${name}.png`;
   const metrics=await page.evaluate(()=>({height:document.documentElement.scrollHeight,overflow:document.documentElement.scrollWidth>innerWidth+1}));
   await page.screenshot({path:`${out}/${file}`,fullPage:true,animations:'disabled'});records.push({locale,width,route:route||'/',file,...metrics});
   if(route===''){
    await page.screenshot({path:`${out}/${locale}-${width}-hero.png`,animations:'disabled'});
    await page.locator('[data-testid=product-preview]').evaluate(el=>window.scrollTo({top:el.getBoundingClientRect().top+scrollY-95,behavior:'instant'}));await page.screenshot({path:`${out}/${locale}-${width}-product-preview.png`,animations:'disabled'});
    if(width<1100){await page.getByRole('button',{name:locale==='ar'?'فتح القائمة':'Open navigation',exact:true}).click();await page.screenshot({path:`${out}/${locale}-${width}-navigation.png`,animations:'disabled'});await page.keyboard.press('Escape');}
   }
  }
 }
 writeFileSync(`${out}/inventory.json`,JSON.stringify(records,null,2));
 await browser.close();console.log(`${records.length} real-app captures; ${records.filter(r=>r.overflow).length} overflow findings.`);
 if(records.some(r=>r.overflow))process.exitCode=1;
})().catch(e=>{console.error(e);process.exitCode=1});
