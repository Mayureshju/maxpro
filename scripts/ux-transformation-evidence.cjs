/** Rendered application evidence. No synthetic dashboard imagery. */
const {chromium}=require('../apps/web/node_modules/@playwright/test');
const {mkdirSync,writeFileSync}=require('node:fs');
const stage=process.argv[2]||'after',root=`artifacts/phase17/${stage}`;
const base=process.env.MAXPRO_UX_BASE_URL||'http://localhost:3017';
const routes=[['home',''],['platform','/solutions'],['ai','/features/ai-assistance'],['how-it-works','/how-it-works'],['integrations','/integrations'],['pricing','/pricing'],['agencies','/solutions/agencies'],['contact','/contact'],['faq','/faq'],['showcase','/properties'],['showcase-detail','/properties/AQ-10233'],['dashboard','/workspace'],['inventory','/workspace/inventory'],['create','/workspace/inventory/new'],['property','/workspace/inventory/AQ-10233'],['editor','/workspace/inventory/AQ-10233/edit'],['launch','/workspace/publish?mode=launch&property=AQ-10233'],['publish','/workspace/publish?property=AQ-10233&goal=portals&channels=qatar-living&channel=qatar-living'],['campaigns','/workspace/campaigns'],['campaign-review','/workspace/campaigns/new?property=AQ-10233'],['leads','/workspace/leads'],['inbox','/workspace/inbox'],['analytics','/workspace/analytics'],['billing','/workspace/billing'],['settings','/workspace/settings']];
(async()=>{
 mkdirSync(root,{recursive:true});const browser=await chromium.launch({executablePath:process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH||'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'}),records=[],errors=[];
 for(const locale of ['en','ar'])for(const width of (stage==='before'?[1440,375]:[320,375,768,1024,1280,1440])){
  const context=await browser.newContext({viewport:{width,height:width<600?812:1000},reducedMotion:'reduce'}),page=await context.newPage();
  page.on('pageerror',e=>errors.push({locale,width,error:e.message}));
  async function capture(name,route,status,fullPage=true){
   await page.evaluate(()=>document.fonts.ready);await page.locator('main img').evaluateAll(async xs=>{for(const x of xs){x.loading='eager';await x.decode().catch(()=>{});}});
   const metrics=await page.evaluate(()=>({overflow:document.documentElement.scrollWidth>innerWidth+1,heading:document.querySelector('main h1')?.textContent,firstRow:document.querySelector('tbody tr')?.getBoundingClientRect().top,attention:document.querySelector('.ag-dashboard-grid')?.getBoundingClientRect().top,launcher:document.querySelector('.ws-ai-entry')?{position:getComputedStyle(document.querySelector('.ws-ai-entry')).position,bounds:document.querySelector('.ws-ai-entry').getBoundingClientRect().toJSON()}:null}));
   const file=`${locale}-${width}-${name}.png`;await page.screenshot({path:`${root}/${file}`,fullPage,animations:'disabled'});records.push({locale,width,name,route,status,file,...metrics});
  }
  for(const [name,route] of routes){const response=await page.goto(`${base}/${locale}${route}`);await page.locator('main h1').first().waitFor();await capture(name,route,response.status());}
  await page.goto(`${base}/${locale}/workspace/inventory/AQ-10233`);await page.getByRole('button',{name:locale==='ar'?'ماكس برو AI':'MaxPro AI',exact:true}).click();await capture('assistant-open','/workspace/inventory/AQ-10233',200,false);await page.keyboard.press('Escape');
  await page.goto(`${base}/${locale}/register`);await page.getByRole('textbox',{name:locale==='ar'?'اسم الوكالة':'Agency name',exact:true}).fill('Demo UX Agency');await page.getByRole('button',{name:locale==='ar'?'إنشاء وكالة تجريبية':'Create demo agency',exact:true}).click();await page.locator('.ag-getting-started').waitFor();await capture('empty-dashboard','/workspace',200);
  await context.close();
 }
 writeFileSync(`${root}/audit.json`,JSON.stringify({records,errors},null,2));await browser.close();console.log(JSON.stringify({stage,captures:records.length,overflow:records.filter(r=>r.overflow),httpErrors:records.filter(r=>r.status>=400),errors}));
})().catch(e=>{console.error(e);process.exitCode=1;});
