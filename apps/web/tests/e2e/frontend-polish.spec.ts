import {test,expect,localized} from './fixtures';
import {mkdirSync} from 'node:fs';
import {resolve} from 'node:path';

for(const locale of ['en','ar']){
 const ar=locale==='ar';const t=(en:string,arabic:string)=>ar?arabic:en;
 test(`frontend ${locale}: inventory filters combine, validate, reset and preserve both views`,async({page})=>{
  await page.goto(`/${locale}/workspace/inventory`);
  const search=page.getByRole('searchbox',{name:localized('Search properties',true)});
  await expect(page.locator('.gm-inventory-table tbody tr')).toHaveCount(6);
  await page.getByRole('button',{name:t('Filters','الفلاتر'),exact:true}).click();
  await page.getByRole('combobox',{name:t('Filter purpose','تصفية الغرض'),exact:true}).selectOption('rent');
  await page.getByRole('combobox',{name:t('Filter property type','تصفية نوع العقار'),exact:true}).selectOption('Villa');
  await expect(page.locator('.gm-inventory-table tbody tr')).toHaveCount(1);
  await page.getByRole('spinbutton',{name:t('Maximum price (QAR)','الحد الأقصى للسعر (ر.ق)'),exact:true}).fill('10000');
  await expect(page.locator('.fx-empty')).toContainText(t('No properties match','لا توجد عقارات مطابقة'));
  await page.locator('.fx-empty').getByRole('button',{name:t('Clear filters','مسح الفلاتر')}).click();
  await expect(page.locator('.gm-inventory-table tbody tr')).toHaveCount(6);
  await search.fill('   AQ-10233  ');await expect(page.locator('.gm-inventory-table tbody tr')).toHaveCount(1);
  await page.getByRole('button',{name:localized('Grid view',true)}).click();
  await expect(page.locator('.px-property-tile')).toHaveCount(1);await expect(page.getByRole('button',{name:localized('Grid view',true)})).toHaveAttribute('aria-pressed','true');
  await search.fill('');await page.getByRole('spinbutton',{name:t('Minimum price (QAR)','الحد الأدنى للسعر (ر.ق)'),exact:true}).fill('30000');
  await page.getByRole('spinbutton',{name:t('Maximum price (QAR)','الحد الأقصى للسعر (ر.ق)'),exact:true}).fill('10000');
  await expect(page.locator('main').getByRole('alert')).toContainText(t('Maximum price must','يجب أن يكون الحد الأقصى'));
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1)).toBe(true);
 });
 test(`frontend ${locale}: unsaved edits survive stay and failed save; successful save releases navigation`,async({page},info)=>{
  await page.goto(`/${locale}/workspace/inventory/AQ-10233/edit?advanced=1`);
  const title=page.getByRole('textbox',{name:localized('Title — English',true),exact:true});await title.fill('Fictional review draft');
  await page.getByRole('link',{name:t('Media workbench','إدارة الوسائط'),exact:true}).click();
  await expect(page.getByRole('dialog')).toBeVisible();
  const keep=page.getByRole('button',{name:t('Keep editing','متابعة التحرير'),exact:true});await expect(keep).toBeFocused();
  await page.keyboard.press('Escape');await expect(page.getByRole('dialog')).not.toBeVisible();await expect(title).toHaveValue('Fictional review draft');
  const price=page.getByRole('spinbutton',{name:localized('Price (QAR)',true),exact:true});await price.fill('-1');
  await page.getByRole('button',{name:t('Save browser-local draft','حفظ المسودة محلياً'),exact:true}).click();await expect(page.locator('main').getByRole('alert')).toBeVisible();
  await page.getByRole('link',{name:t('Media workbench','إدارة الوسائط'),exact:true}).click();await expect(page.getByRole('dialog')).toBeVisible();
  await keep.click();await price.fill('2850000');await page.getByRole('button',{name:t('Save browser-local draft','حفظ المسودة محلياً'),exact:true}).click();
  await expect(page.locator('main').getByRole('status')).toContainText(localized('Draft saved for local pre-flight checks.'));
  await page.getByRole('link',{name:t('Media workbench','إدارة الوسائط'),exact:true}).click();await expect(page).toHaveURL(/\/media$/);await expect(page.getByRole('dialog')).toHaveCount(0);
  await page.goto(`/${locale}/workspace/inventory/AQ-10233/edit?advanced=1`);await expect(title).toHaveValue('Fictional review draft');await title.fill('Discard this fictional edit');
  await page.getByRole('link',{name:t('Media workbench','إدارة الوسائط'),exact:true}).click();
  const path=resolve(`../../${globalThis.process.env.MAXPRO_EVIDENCE_ROOT??'artifacts/frontend'}/interactions`);mkdirSync(path,{recursive:true});await page.screenshot({path:`${path}/${info.project.name}-${locale}-unsaved-dialog.png`});
  await page.getByRole('button',{name:t('Discard changes','تجاهل التعديلات'),exact:true}).click();await expect(page).toHaveURL(/\/media$/);
  await page.goto(`/${locale}/workspace/inventory/AQ-10233/edit?advanced=1`);await expect(title).toHaveValue('Fictional review draft');
 });
 test(`frontend ${locale}: dashboard links to canonical creation and scoped activity`,async({page})=>{
  await page.goto(`/${locale}/workspace`);await expect(page.locator('.ag-workspace-totals b').first()).toHaveText('6');
  await expect(page.getByRole('link',{name:t('Add property','إضافة عقار'),exact:true})).toHaveAttribute('href',`/${locale}/workspace/inventory/new`);
  await expect(page.getByRole('heading',{name:t('Upcoming viewings','الزيارات القادمة'),exact:true})).toBeVisible();
  await expect(page.getByRole('heading',{name:t('Channel & campaign status','حالة القنوات والحملات'),exact:true})).toBeVisible();
  await expect(page.locator('.ag-status-summary')).toContainText(t('Listing simulations','محاكاة الإعلانات العقارية'));
  await page.getByRole('link',{name:t('Add property','إضافة عقار'),exact:true}).click();await expect(page).toHaveURL(/\/inventory\/new$/);
 });
 test(`frontend ${locale}: simplified navigation and mobile focus remain usable`,async({page},info)=>{
  await page.goto(`/${locale}/workspace`);const mobile=info.project.name==='mobile-chromium';
  const opener=page.getByRole('button',{name:localized('Open navigation',true)});if(mobile)await opener.click();
  const nav=page.getByRole('navigation',{name:t('Workspace navigation','التنقل في مساحة العمل')});await expect(nav.getByRole('link')).toHaveCount(6);
  await expect(nav.getByRole('link',{name:t('Settings','الإعدادات'),exact:true})).toBeVisible();await expect(nav).not.toContainText(/Super Admin|الإدارة العامة/);
  if(mobile){await page.keyboard.press('Escape');await expect(opener).toBeFocused();await expect(nav).not.toBeVisible();}
 });
 test(`frontend ${locale}: bulk import, FAQ and agency preview have truthful behavior`,async({page})=>{
  await page.goto(`/${locale}/workspace/inventory/import`);await page.locator('main input[type=file]:visible').setInputFiles({name:'fictional.csv',mimeType:'text/csv',buffer:Buffer.from('title,price\nDemo,12000')});
  await expect(page.getByRole('button',{name:localized('Preview mapping · requires backend',true)})).toBeDisabled();await expect(page.getByRole('link',{name:t('Create a property draft','إنشاء مسودة عقار'),exact:true})).toBeVisible();
  await page.goto(`/${locale}/faq`);await expect(page.locator('.px-public-heading .px-overline')).toHaveText(t('SUPPORT / QUESTIONS','الدعم / الأسئلة'));const question=page.locator('.fx-faq').first();await question.locator('summary').click();await expect(question).toHaveAttribute('open','');
  await page.goto(`/${locale}/agencies`);await page.getByRole('link',{name:t('View agency profile','عرض ملف الوكالة'),exact:true}).click();await expect(page).toHaveURL(/\/agencies\/pearl-gate-realty$/);await expect(page.locator('.fx-agency-properties a')).toHaveCount(3);
 });
}

for(const locale of ['en','ar'])test(`frontend ${locale}: public responsive layouts keep research actions, footer and editorial content inside viewport`,async({page},info)=>{
 test.skip(info.project.name==='mobile-chromium','Desktop project checks both tablet widths.');
 for(const width of [375,768,1024]){await page.setViewportSize({width,height:1000});for(const route of ['', '/properties','/solutions','/agencies/pearl-gate-realty','/contact']){
  await page.goto(`/${locale}${route}`);await expect(page.locator('main h1').first()).toBeVisible();expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),`${locale}${route} @ ${width}`).toBe(true);
 }}
});

for(const locale of ['en','ar'])test(`frontend ${locale}: newly saved campaign keeps the next stage after navigation`,async({page})=>{
 await page.goto(`/${locale}/workspace/campaigns/new?property=AQ-10256`);
 await page.getByRole('button',{name:localized(/Create campaign draft|إنشاء مسودة حملة/)}).click();
 await page.locator('.cm-steps button').nth(3).click();
 await expect(page).toHaveURL(/\/campaigns\/DEMO-CAMPAIGN-/);
 await expect(page.locator('.cm-policy-readout')).toBeVisible();
 const count=await page.evaluate(()=>JSON.parse(localStorage.getItem('maxpro-gemini-v3-demo-state')!).campaigns.length);expect(count).toBe(1);
});
