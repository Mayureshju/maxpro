/** Open-state evidence and whole-document WCAG checks of the actual production app. */
const {chromium}=require('../apps/web/node_modules/@playwright/test');
const fs=require('node:fs'),path=require('node:path');
const root='artifacts/phase15/interactions';fs.mkdirSync(root,{recursive:true});
const pkg=fs.readdirSync('node_modules/.pnpm').find(n=>n.startsWith('axe-core@')),axe=path.resolve('node_modules/.pnpm',pkg,'node_modules/axe-core/axe.min.js');
(async()=>{
 const browser=await chromium.launch({executablePath:process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH||'/Users/dieturetech/Library/Caches/ms-playwright/chromium_headless_shell-1208/chrome-headless-shell-mac-arm64/chrome-headless-shell'}),records=[];
 for(const locale of ['en','ar'])for(const width of [1440,375,320]){
  const ar=locale==='ar',t=(en,arabic)=>ar?arabic:en,page=await browser.newPage({viewport:{width,height:width<600?812:1000},reducedMotion:'reduce'}),base=process.env.PHASE15_BASE_URL||'http://localhost:3215';
  async function capture(name){await page.evaluate(()=>document.fonts.ready);await page.addScriptTag({path:axe});const result=await page.evaluate(()=>window.axe.run(document,{runOnly:{type:'tag',values:['wcag2a','wcag2aa','wcag21aa','wcag22aa']}}));const file=`${locale}-${width}-${name}.png`;await page.screenshot({path:`${root}/${file}`,animations:'disabled'});const geometry=await page.evaluate(()=>({overflow:document.documentElement.scrollWidth>innerWidth+1,dialog:[...document.querySelectorAll('dialog[open]')].map(d=>({width:d.getBoundingClientRect().width,height:d.getBoundingClientRect().height,x:d.getBoundingClientRect().x,y:d.getBoundingClientRect().y}))}));records.push({locale,width,name,file,...geometry,violations:result.violations});}
  await page.goto(`${base}/${locale}`);
  if(width===1440){await page.locator('.mk-nav-disclosure summary').click();await capture('platform-menu');await page.keyboard.press('Escape');}
  else {await page.getByRole('button',{name:t('Open navigation','فتح القائمة'),exact:true}).click();await capture('public-navigation');await page.keyboard.press('Escape');}
  await page.goto(`${base}/${locale}/sign-in`);await page.getByRole('combobox',{name:t('Demo agency','الوكالة التجريبية'),exact:true}).focus();await capture('agency-search');await page.keyboard.press('Escape');
  await page.goto(`${base}/${locale}/workspace/inventory/new`);await page.getByRole('button',{name:t('Save & continue','حفظ ومتابعة'),exact:true}).click();await capture('invalid-quick-add');
  await page.getByRole('textbox',{name:t('Property title','عنوان العقار'),exact:true}).fill('Demo unsaved title');await page.locator('.prototype-topbar .topbar-utility').click();await capture('unsaved-dialog');await page.getByRole('button',{name:t('Keep editing','متابعة التحرير'),exact:true}).click();
  await page.goto(`${base}/${locale}/workspace/inventory/AQ-10233/edit?step=1`);await page.getByRole('button',{name:t('Suggest bilingual copy','اقتراح وصف باللغتين'),exact:true}).click();await capture('assistance');
  await page.keyboard.press('Escape');await page.goto(`${base}/${locale}/properties/AQ-10233?preview=local`);await capture('canonical-preview');
  if(width<600){await page.goto(`${base}/${locale}/workspace`);await page.getByRole('button',{name:t('Open navigation','فتح التنقل'),exact:true}).click();await capture('agency-navigation');await page.keyboard.press('Escape');}
  await page.close();
 }
 fs.writeFileSync(`${root}/audit.json`,JSON.stringify(records,null,2));await browser.close();console.log(JSON.stringify({checks:records.length,violations:records.filter(r=>r.violations.length).map(r=>({locale:r.locale,width:r.width,name:r.name,ids:r.violations.map(v=>v.id)})),overflow:records.filter(r=>r.overflow)}));if(records.some(r=>r.violations.length||r.overflow))process.exitCode=1;
})().catch(e=>{console.error(e);process.exit(1)});
