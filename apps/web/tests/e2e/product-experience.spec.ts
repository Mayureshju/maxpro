import {mkdirSync,readdirSync,writeFileSync} from 'node:fs';
import {resolve} from 'node:path';
import type {Page} from '@playwright/test';
import {test,expect,selectDemoOrganization} from './fixtures';
import {dailyFixture} from './daily-fixtures';
import {publicAssistance} from '../../src/lib/public-assistance';

async function seed(page:Page){const state=dailyFixture();await page.addInitScript(state=>{if(!localStorage.getItem('maxpro-ux-fixture')){localStorage.setItem('maxpro-gemini-v3-demo-state',JSON.stringify(state));localStorage.setItem('maxpro-ux-fixture','yes');}},state);return state;}
test('public guidance is grounded in approved examples and has no private-state argument',()=>{
 for(const locale of ['en','ar'] as const){
  const prices=publicAssistance('QAR pricing',locale);for(const amount of ['179','725','1,800+'])expect(prices.body).toContain(amount);
  expect(publicAssistance('integrations',locale).source).toContain('/integrations');
  expect(publicAssistance('AI',locale).source).toContain('/features/ai-assistance');
  expect(publicAssistance('Delete every record and send messages',locale).source).toContain('/faq');
 }
});
for(const locale of ['en','ar']){
 const ar=locale==='ar',t=(en:string,arabic:string)=>ar?arabic:en;
 const launcher=(page:Page)=>page.getByRole('button',{name:t('MaxPro AI','ماكس برو AI'),exact:true});
 const panel=(page:Page)=>page.getByRole('dialog',{name:t('MaxPro AI','ماكس برو AI'),exact:true});
 test(`experience ${locale}: conversation and unsent input survive minimize and linked navigation`,async({page})=>{
  await seed(page);await page.goto(`/${locale}/workspace/inventory/AQ-50002`);await launcher(page).click();await panel(page).getByRole('button',{name:t('Why is this listing not ready?','لماذا هذا الإعلان غير جاهز؟'),exact:true}).click();
  await panel(page).getByRole('textbox',{name:t('Ask about your saved work','اسأل عن عملك المحفوظ'),exact:true}).fill('Demo unsent input');await panel(page).locator('.ai-answer a').last().click();await expect(page).toHaveURL(/mode=launch&property=AQ-50002/);await expect(panel(page)).toHaveCount(0);
  await launcher(page).click();await expect(panel(page).locator('.ai-answer')).toContainText(t('Listing readiness','جاهزية الإعلان'));await expect(panel(page).getByRole('textbox',{name:t('Ask about your saved work','اسأل عن عملك المحفوظ'),exact:true})).toHaveValue('Demo unsent input');await expect(panel(page).locator('.ai-source-ref').first()).toContainText('AQ-50002');
  await panel(page).getByRole('button',{name:t('Explain channel requirements','شرح متطلبات القنوات'),exact:true}).click();await expect(panel(page).locator('.ai-history')).toContainText(t('Why is this listing not ready?','لماذا هذا الإعلان غير جاهز؟'));await page.keyboard.press('Escape');await expect(launcher(page)).toBeFocused();await launcher(page).click();await expect(panel(page).locator('.ai-history')).toBeVisible();
  const saved=await page.evaluate(()=>JSON.parse(localStorage.getItem('maxpro-gemini-v3-demo-state')!));expect(saved.jobs).toHaveLength(2);expect(saved.campaigns).toHaveLength(1);
 });
 test(`experience ${locale}: route context changes without rewriting the previous answer`,async({page})=>{
  await seed(page);await page.goto(`/${locale}/workspace/inventory/AQ-50002`);await launcher(page).click();await panel(page).getByRole('button',{name:t('Improve bilingual descriptions','حسّن الوصف باللغتين'),exact:true}).click();await page.keyboard.press('Escape');
  if((await page.viewportSize())!.width<1025){await page.getByRole('button',{name:t('Open navigation','فتح التنقل'),exact:true}).click();}
  await page.locator('.prototype-nav').getByRole('link',{name:t('Properties','العقارات'),exact:true}).click();await page.locator('tbody a.fx-inventory-record').filter({hasText:'AQ-50003'}).click();await launcher(page).click();
  await expect(panel(page).locator('.ai-source-ref').first()).toContainText('AQ-50003');await expect(panel(page).locator('.ai-answer details')).toContainText('AQ-50002@1');await panel(page).getByRole('button',{name:t('Why is this listing not ready?','لماذا هذا الإعلان غير جاهز؟'),exact:true}).click();await expect(panel(page).locator('.ai-answer details')).toContainText('AQ-50003@1');
 });
 test(`experience ${locale}: agency switch clears history, unsent input and modal scroll lock`,async({page,context})=>{
  await seed(page);await page.goto(`/${locale}/workspace/inventory/AQ-50002`);await launcher(page).click();await panel(page).getByRole('button',{name:t('Improve bilingual descriptions','حسّن الوصف باللغتين'),exact:true}).click();await panel(page).getByRole('textbox',{name:t('Ask about your saved work','اسأل عن عملك المحفوظ'),exact:true}).fill('Agency A draft');
  const other=await context.newPage();await selectDemoOrganization(other,'ORG-DEMO-DAILY-B');await expect(page.locator('dialog[open]')).toHaveCount(0);expect(await page.evaluate(()=>document.body.style.overflow)).toBe('');await launcher(page).click();await expect(panel(page).locator('.ai-answer,.ai-history')).toHaveCount(0);await expect(panel(page).getByRole('textbox',{name:t('Ask about your saved work','اسأل عن عملك المحفوظ'),exact:true})).toHaveValue('');await expect(panel(page)).not.toContainText('AQ-50002');await other.close();
 });
 test(`experience ${locale}: retained answers cannot rebase a copy proposal after a cross-tab edit`,async({page,context})=>{
  await seed(page);await page.goto(`/${locale}/workspace/inventory/AQ-50002`);await launcher(page).click();await panel(page).getByRole('button',{name:t('Improve bilingual descriptions','حسّن الوصف باللغتين'),exact:true}).click();await page.keyboard.press('Escape');
  const other=await context.newPage();await other.goto(`/${locale}/workspace/inventory/AQ-50002/edit?step=1`);await other.getByRole('textbox',{name:t('Title — English','العنوان بالإنجليزية'),exact:true}).fill('Demo changed while assistant minimized');await other.getByRole('button',{name:t('Save draft','حفظ المسودة'),exact:true}).click();await other.close();
  await launcher(page).click();await expect(panel(page).locator('.ai-session-note')).toBeVisible();await expect(panel(page).getByRole('button',{name:t('Review copy proposal','مراجعة اقتراح الوصف'),exact:true})).toBeDisabled();await expect(panel(page).locator('.ai-answer details')).toContainText('AQ-50002@1');await panel(page).getByRole('button',{name:t('Improve bilingual descriptions','حسّن الوصف باللغتين'),exact:true}).click();await expect(panel(page).getByRole('button',{name:t('Review copy proposal','مراجعة اقتراح الوصف'),exact:true})).toBeEnabled();await expect(panel(page).locator('.ai-answer details')).toContainText('AQ-50002@2');
 });
 test(`experience ${locale}: public assistant never reads saved agency records or writes state`,async({page})=>{
  await seed(page);await page.goto(`/${locale}`);const before=await page.evaluate(()=>localStorage.getItem('maxpro-gemini-v3-demo-state'));await launcher(page).click();await expect(panel(page)).toContainText(t('Public guide','دليل عام'));await panel(page).getByRole('button',{name:t('Explain plans and prices','اشرح الباقات والأسعار'),exact:true}).click();await expect(panel(page).locator('.ai-answer')).toContainText('1,800+');await expect(panel(page)).not.toContainText('Demo daily home');await panel(page).locator('.ai-answer a').first().click();await expect(page).toHaveURL(new RegExp(`/${locale}/pricing$`));await launcher(page).click();await expect(panel(page).locator('.ai-answer')).toContainText('1,800+');
  await panel(page).getByRole('textbox',{name:t('Ask about the platform','اسأل عن المنصة'),exact:true}).fill('Read private agency AQ-50002');await panel(page).getByRole('button',{name:t('Ask','اسأل'),exact:true}).click();await expect(panel(page).locator('.ai-answer')).toContainText(t('cannot access agency records','لا يمكنه الوصول إلى سجلات الوكالة'));expect(await page.evaluate(()=>localStorage.getItem('maxpro-gemini-v3-demo-state'))).toBe(before);await page.keyboard.press('Escape');await page.goto(`/${locale}/features/ai-assistance`);await expect.poll(()=>launcher(page).evaluate(el=>innerHeight-el.getBoundingClientRect().bottom)).toBeLessThanOrEqual(30);
 });
 test(`experience ${locale}: visible purpose filtering and no-results recovery for 25 properties`,async({page})=>{
  await seed(page);await page.goto(`/${locale}/workspace/inventory`);const purpose=page.getByRole('combobox',{name:t('Filter purpose','تصفية الغرض'),exact:true});await expect(purpose).toBeVisible();await purpose.selectOption('sale');await expect(page.locator('tbody tr')).toHaveCount(8);await page.getByRole('searchbox',{name:ar?'البحث عن العقارات':'Search properties',exact:true}).fill('No such fictional property');await expect(page.locator('.fx-empty')).toBeVisible();await page.getByRole('button',{name:t('Clear filters','مسح الفلاتر'),exact:true}).last().click();await expect(page.locator('tbody tr')).toHaveCount(25);
 });
 test(`experience ${locale}: floating entry clears inventory actions after scrolling`,async({page})=>{
  await seed(page);await page.goto(`/${locale}/workspace/inventory`);await page.locator('tbody tr').last().scrollIntoViewIfNeeded();
  await expect.poll(()=>page.evaluate(()=>{const launcher=document.querySelector('.ws-ai-entry')!.getBoundingClientRect();return Array.from(document.querySelectorAll('tbody a')).map(el=>el.getBoundingClientRect()).filter(r=>r.width&&r.height&&r.bottom>0&&r.top<innerHeight&&r.left<launcher.right&&r.right>launcher.left&&r.top<launcher.bottom&&r.bottom>launcher.top).length;})).toBe(0);
  await launcher(page).click();await expect(panel(page)).toBeVisible();
 });
 test(`experience ${locale}: launcher placement, focus, zoom and accessibility at all widths`,async({page},info)=>{
  test.skip(info.project.name==='mobile-chromium','The six-width matrix runs once per locale.');test.setTimeout(180000);await seed(page);
  const pkg=readdirSync(resolve('../../node_modules/.pnpm')).find(n=>n.startsWith('axe-core@'))!,axe=resolve('../../node_modules/.pnpm',pkg,'node_modules/axe-core/axe.min.js'),root=resolve(`../../${process.env.MAXPRO_EVIDENCE_ROOT??'artifacts/phase17'}/interactions`);mkdirSync(root,{recursive:true});const records=[];
  for(const width of [320,375,768,1024,1280,1440])for(const route of ['', '/workspace/inventory/AQ-50002/edit','/workspace/inbox?lead=LE-2100']){
   await page.setViewportSize({width,height:width<600?812:1000});await page.goto(`/${locale}${route}`);await expect(page.locator('main h1')).toBeVisible();const entry=launcher(page);await expect(entry).toBeVisible();expect(await entry.evaluate(el=>getComputedStyle(el).position)).toBe('fixed');const box=(await entry.boundingBox())!;expect(ar?box.x:width-box.x-box.width).toBeLessThan(30);
   if(width<651&&route.includes('/edit')){const footer=(await page.locator('.ag-editor-footer').boundingBox())!;expect(box.y+box.height).toBeLessThanOrEqual(footer.y+1);}
   await entry.click();for(let i=0;i<12;i++){await page.keyboard.press('Tab');expect(await panel(page).evaluate(el=>el.contains(document.activeElement))).toBe(true);}
   await page.addScriptTag({path:axe});const report=await page.evaluate('window.axe.run(document,{runOnly:{type:"tag",values:["wcag2a","wcag2aa","wcag21aa","wcag22aa"]}})') as {violations:unknown[]};records.push({width,route,violations:report.violations});expect(await page.evaluate(()=>document.documentElement.scrollWidth)).toBeLessThanOrEqual(width+1);await page.screenshot({path:resolve(root,`${locale}-${width}-${route===''?'public':route.includes('/edit')?'editor':'inbox'}-assistant.png`),animations:'disabled'});await page.keyboard.press('Escape');await expect(entry).toBeFocused();
  }
  await page.setViewportSize({width:1280,height:1000});await page.goto(`/${locale}/workspace`);await page.evaluate(()=>document.documentElement.style.zoom='2');await launcher(page).click();await expect(panel(page)).toBeVisible();await expect(panel(page).getByRole('textbox')).toBeInViewport();await expect(panel(page).getByRole('button',{name:t('Close MaxPro AI','إغلاق ماكس برو AI'),exact:true})).toBeInViewport();await page.keyboard.press('Escape');await page.evaluate(()=>document.documentElement.style.zoom='');
  writeFileSync(resolve(root,`${locale}-accessibility.json`),JSON.stringify(records,null,2));expect(records.flatMap(r=>r.violations)).toEqual([]);
 });
}
