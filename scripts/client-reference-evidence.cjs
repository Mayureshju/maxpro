/** Phase 15: actual Chromium captures, never synthesized product screens. */
const {chromium}=require('../apps/web/node_modules/@playwright/test');
const {mkdirSync,writeFileSync}=require('node:fs');
const stage=process.argv[2]||'after';
const base=process.env.PHASE15_BASE_URL||'http://localhost:3215';
const root=`artifacts/phase15/${stage}`;
const executablePath=process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH||'/Users/dieturetech/Library/Caches/ms-playwright/chromium_headless_shell-1208/chrome-headless-shell-mac-arm64/chrome-headless-shell';
const core=[['home',''],['dashboard','/workspace'],['quick-add','/workspace/inventory/new']];
const other=[['sign-in','/sign-in'],['register','/register'],['properties','/properties'],['public-detail','/properties/AQ-10233'],['inventory','/workspace/inventory'],['property','/workspace/inventory/AQ-10233'],['editor','/workspace/inventory/AQ-10233/edit'],['media','/workspace/inventory/AQ-10233/media'],['publish','/workspace/publish?property=AQ-10233&goal=portals&channels=qatar-living&channel=qatar-living'],['leads','/workspace/leads'],['inbox','/workspace/inbox'],['campaigns','/workspace/campaigns'],['campaign-new','/workspace/campaigns/new'],['analytics','/workspace/analytics'],['settings','/workspace/settings'],['billing','/workspace/billing'],['integrations','/integrations'],['pricing','/pricing']];
(async()=>{
 mkdirSync(root,{recursive:true});const browser=await chromium.launch({executablePath});const records=[];
 const page=await browser.newPage({reducedMotion:'reduce'});
 for(const locale of ['en','ar'])for(const width of [1440,1280,1024,768,375,320]){
  await page.setViewportSize({width,height:width<600?812:1000});
  for(const [name,route] of [...core,...(stage==='after'||width===1440||width===375?other:[])]){
   const response=await page.goto(`${base}/${locale}${route}`);await page.locator('main h1').first().waitFor();await page.evaluate(()=>document.fonts.ready);
   await page.locator('main img').evaluateAll(async xs=>{for(const x of xs){x.loading='eager';await x.decode().catch(()=>{});}});
   const file=`${locale}-${width}-${name}.png`;
   const metrics=await page.evaluate(()=>({overflow:document.documentElement.scrollWidth>innerWidth+1,font:getComputedStyle(document.body).fontFamily,heading:getComputedStyle(document.querySelector('h1')).fontSize}));
   await page.screenshot({path:`${root}/${file}`,fullPage:true,animations:'disabled'});records.push({locale,width,name,route,status:response.status(),file,...metrics});
  }
 }
 writeFileSync(`${root}/audit.json`,JSON.stringify(records,null,2));await browser.close();
 console.log(JSON.stringify({stage,captures:records.length,overflow:records.filter(x=>x.overflow),errors:records.filter(x=>x.status>=400)}));
})().catch(e=>{console.error(e);process.exit(1)});
