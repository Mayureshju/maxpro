/** Genuine Chromium evidence, using default fictional records and actual agency registration. */
const {chromium}=require('../apps/web/node_modules/@playwright/test');
const {mkdirSync,writeFileSync}=require('node:fs');
const base=process.env.MAXPRO_AI_BASE_URL||'http://localhost:3216';
const root='artifacts/phase16/after';
const executablePath=process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH||'/Users/dieturetech/Library/Caches/ms-playwright/chromium_headless_shell-1208/chrome-headless-shell-mac-arm64/chrome-headless-shell';
(async()=>{
 mkdirSync(root,{recursive:true});const browser=await chromium.launch({executablePath}),records=[];
 for(const locale of ['en','ar'])for(const width of [1440,375]){
  const ar=locale==='ar',t=(en,arabic)=>ar?arabic:en,context=await browser.newContext({viewport:{width,height:width<600?812:1000},reducedMotion:'reduce'}),page=await context.newPage();
  async function capture(name,fullPage=true){await page.evaluate(()=>document.fonts.ready);const file=`${locale}-${width}-${name}.png`;const metrics=await page.evaluate(()=>({heading:getComputedStyle(document.querySelector('main h1')).fontSize,firstRow:document.querySelector('tbody tr')?.getBoundingClientRect().top,rowHeight:document.querySelector('tbody tr')?.getBoundingClientRect().height,overflow:document.documentElement.scrollWidth>innerWidth+1}));await page.screenshot({path:`${root}/${file}`,fullPage,animations:'disabled'});records.push({locale,width,name,file,...metrics});}
  for(const [name,route] of [['canonical-dashboard','/workspace'],['canonical-inventory','/workspace/inventory'],['canonical-property','/workspace/inventory/AQ-10233'],['canonical-publish','/workspace/publish?property=AQ-10233&goal=portals&channels=qatar-living&channel=qatar-living'],['canonical-launch','/workspace/publish?mode=launch&property=AQ-10233&goal=portals&channels=qatar-living&channel=qatar-living'],['canonical-campaign-review','/workspace/campaigns/new?property=AQ-10233'],['canonical-leads','/workspace/leads'],['canonical-inbox','/workspace/inbox']]){await page.goto(`${base}/${locale}${route}`);await page.locator('main h1').first().waitFor();await capture(name);}
  await page.goto(`${base}/${locale}/workspace/inventory/AQ-10233`);await page.getByRole('button',{name:t('MaxPro AI','ماكس برو AI'),exact:true}).click();await page.getByRole('button',{name:t('Why is this listing not ready?','لماذا هذا الإعلان غير جاهز؟'),exact:true}).click();await capture('canonical-copilot',false);await page.keyboard.press('Escape');
  await page.goto(`${base}/${locale}/workspace/publish?mode=launch&property=AQ-10233`);await page.getByRole('button',{name:t('Review bilingual suggestion','مراجعة اقتراح باللغتين'),exact:true}).click();await capture('launch-proposal',false);await page.keyboard.press('Escape');
  await page.goto(`${base}/${locale}/register`);await page.getByRole('textbox',{name:t('Agency name','اسم الوكالة'),exact:true}).fill('Demo Launch Agency');await page.getByRole('button',{name:t('Create demo agency','إنشاء وكالة تجريبية'),exact:true}).click();await page.locator('.ag-getting-started').waitFor();await capture('dashboard-empty');
  await page.goto(`${base}/${locale}/workspace/inventory`);await page.locator('.fx-empty').waitFor();await capture('inventory-empty');
  await context.close();
 }
 writeFileSync(`${root}/canonical-metrics.json`,JSON.stringify(records,null,2));await browser.close();console.log(JSON.stringify({captures:records.length,overflow:records.filter(r=>r.overflow),inventory:records.filter(r=>r.name==='canonical-inventory')}));
})().catch(error=>{console.error(error);process.exitCode=1;});
