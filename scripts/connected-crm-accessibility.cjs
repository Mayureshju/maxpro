/** Whole-document WCAG scans plus keyboard/modal checks on new rendered states. */
const {chromium,expect}=require('../apps/web/node_modules/@playwright/test');
const fs=require('node:fs'),path=require('node:path');
const fixture=JSON.parse(fs.readFileSync(process.env.MAXPRO_CRM_FIXTURE||'artifacts/phase18/fixture.json','utf8')),base=process.env.MAXPRO_CRM_BASE_URL||'http://localhost:3022',root='artifacts/phase18/accessibility';
const pkg=fs.readdirSync('node_modules/.pnpm').find(name=>name.startsWith('axe-core@')),axe=path.resolve('node_modules/.pnpm',pkg,'node_modules/axe-core/axe.min.js');
let browser;
(async()=>{
 fs.mkdirSync(root,{recursive:true});browser=await chromium.launch({executablePath:process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH||'/Users/dieturetech/Library/Caches/ms-playwright/chromium_headless_shell-1208/chrome-headless-shell-mac-arm64/chrome-headless-shell'});const records=[];
 for(const locale of ['en','ar'])for(const width of [320,375,768,1024,1280,1440]){
  const ar=locale==='ar',t=(en,arabic)=>ar?arabic:en,ctx=await browser.newContext({viewport:{width,height:width<600?812:1000},reducedMotion:'reduce'}),page=await ctx.newPage();page.setDefaultTimeout(15000);
  await ctx.addInitScript(s=>{if(!localStorage.getItem('maxpro-crm-accessibility')){localStorage.setItem('maxpro-gemini-v3-demo-state',JSON.stringify(s));localStorage.setItem('maxpro-crm-accessibility','yes');}},fixture);
  async function scan(name){await page.addScriptTag({path:axe});const report=await page.evaluate(async()=>window.axe.run(document,{runOnly:{type:'tag',values:['wcag2a','wcag2aa','wcag21aa','wcag22aa']}}));const overflow=await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1);records.push({locale,width,name,overflow,violations:report.violations});fs.writeFileSync(`${root}/results.json`,JSON.stringify(records,null,2));expect(overflow,`${locale} ${width} ${name} overflow`).toBe(false);}
  await page.goto(`${base}/${locale}`);await scan('public-home');
  await page.goto(`${base}/${locale}/workspace/leads`);await scan('crm-table');await page.getByRole('button',{name:t('Pipeline','مسار'),exact:true}).click();await scan('crm-board');
  await page.goto(`${base}/${locale}/workspace/leads/LE-2101`);await page.getByRole('button',{name:t('Plan follow-up','تحديد متابعة'),exact:true}).click();await scan('follow-up-form');await page.getByRole('button',{name:t('Discard task changes','تجاهل تعديلات المهمة'),exact:true}).click();
  const suggest=page.getByRole('button',{name:t('Suggest from conversation','اقتراح من المحادثة'),exact:true});await suggest.click();const dialog=page.getByRole('dialog',{name:t('Review possible requirements','مراجعة المتطلبات المحتملة'),exact:true});await scan('qualification-proposal');for(let i=0;i<12;i++){await page.keyboard.press('Tab');expect(await dialog.evaluate(el=>el.contains(document.activeElement))).toBe(true);}await page.keyboard.press('Escape');await expect(suggest).toBeFocused();
  await suggest.click();await page.getByRole('button',{name:t('Use in review form','استخدامها في نموذج المراجعة'),exact:true}).click();await scan('requirements-form');await page.getByRole('checkbox',{name:t('I reviewed and confirm these customer requirements','راجعت متطلبات العميل وأؤكدها'),exact:true}).check();await page.getByRole('button',{name:t('Save confirmed requirements','حفظ المتطلبات المؤكدة'),exact:true}).click();await page.reload();await page.getByRole('button',{name:t('Find matching properties','البحث عن عقارات مطابقة'),exact:true}).click();await scan('property-matches');
  await page.getByRole('button',{name:t('Ask MaxPro AI','اسأل ماكس برو AI'),exact:true}).click();await scan('lead-summary');await page.keyboard.press('Escape');await ctx.close();
 }
 const violations=records.flatMap(r=>r.violations);await browser.close();console.log(JSON.stringify({scans:records.length,violations:violations.length}));if(violations.length)process.exitCode=1;
})().catch(async error=>{console.error(error);await browser?.close();process.exitCode=1;});
