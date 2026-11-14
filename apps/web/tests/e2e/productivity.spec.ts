import {test,expect,selectChoice} from './fixtures';
import {mkdirSync} from 'node:fs';
import {resolve} from 'node:path';
import {propertyContentChecks} from '../../src/lib/property-completeness';
import {seedProperties} from '../../src/lib/canonical-property';
import {destinationReadiness} from '../../src/lib/syndication-engine';
import {createDemoStore} from '../../src/components/gemini/demo-provider';

const evidence=resolve(`../../${process.env.MAXPRO_EVIDENCE_ROOT??'artifacts/phase9'}/after`);mkdirSync(evidence,{recursive:true});
test('content completeness is independent of human review and portal configuration',()=>{
 const p=seedProperties()['AQ-10233'];p.source.factsReviewed=false;p.source.copyReviewed=false;p.media=p.media.filter(m=>m.kind==='image');
 expect(propertyContentChecks(p).every(c=>c.complete)).toBe(true);const state=createDemoStore().getSnapshot().state;
 expect(destinationReadiness(state,p,'property-finder').missing).toEqual(expect.arrayContaining(['Human factual and bilingual review','Floor plan (example destination rule)','Demo connector setup missing']));
 p.facts.priceQar=0;expect(propertyContentChecks(p).filter(c=>!c.complete).map(c=>c.key)).toEqual(['priceQar']);
});
for(const locale of ['en','ar']){
 const ar=locale==='ar',t=(en:string,arabic:string)=>ar?arabic:en;
 test(`productivity ${locale}: sidebar preference, active navigation and modal drawer focus`,async({page},info)=>{
  await page.goto(`/${locale}/workspace`);
  if(info.project.name==='chromium'){
   const shell=page.locator('.prototype-shell');await page.getByRole('button',{name:t('Collapse sidebar','طي الشريط الجانبي'),exact:true}).click();await expect(shell).toHaveClass(/sidebar-collapsed/);await expect(page.locator('.prototype-sidebar')).toHaveCSS('width','72px');
   await page.locator('#workspace-navigation').getByRole('link',{name:t('Properties','العقارات'),exact:true}).focus();await expect(page.locator('.ws-nav-tooltip').filter({hasText:t('Properties','العقارات')})).toBeVisible();await page.reload();await expect(shell).toHaveClass(/sidebar-collapsed/);await page.screenshot({path:`${evidence}/${info.project.name}-${locale}-collapsed.png`});
   await page.getByRole('button',{name:t('Expand sidebar','توسيع الشريط الجانبي'),exact:true}).click();await expect(page.locator('.prototype-sidebar')).toHaveCSS('width','248px');await page.setViewportSize({width:768,height:900});
  }
  const opener=page.getByRole('button',{name:t('Open navigation','فتح التنقل'),exact:true});
  // Legacy translation catalogue supplies the Arabic navigation labels.
  const trigger=await opener.count()?opener:page.locator('.mobile-open');await trigger.click();const drawer=page.locator('#workspace-sidebar');await expect(drawer).toHaveAttribute('aria-modal','true');await expect(drawer.locator('.mobile-close')).toBeFocused();await expect(page.locator('.prototype-app')).toHaveAttribute('inert','');
  await drawer.locator('.mobile-close').focus();await page.keyboard.press('Shift+Tab');expect(await drawer.evaluate(el=>el.contains(document.activeElement))).toBe(true);await page.keyboard.press('Escape');await expect(trigger).toBeFocused();await expect(drawer).not.toBeVisible();await trigger.click();await page.locator('.sidebar-scrim').click({position:{x:ar?20:page.viewportSize()!.width-20,y:500}});await expect(trigger).toBeFocused();
 });
 test(`productivity ${locale}: sticky context, draft persistence, missing field navigation and safe dock`,async({page},info)=>{
  await page.goto(`/${locale}/workspace/inventory/AQ-10233/edit`);await expect(page.locator('.ws-breadcrumbs')).toContainText(t('Edit','تعديل'));await expect(page.locator('.ws-breadcrumbs li')).toHaveCount(3);
  const price=page.getByRole('spinbutton',{name:t('Price (QAR)','السعر (ر.ق)'),exact:true});await price.fill('0');await page.getByRole('button',{name:t('Save draft','حفظ المسودة'),exact:true}).click();await page.reload();await expect(price).toHaveValue('0');
  await page.locator('.ag-steps button').nth(3).click();await page.locator('.ag-missing-fields button').filter({hasText:t('Positive price','سعر موجب')}).click();await expect(price).toBeFocused();
  await page.locator('.ag-steps button').nth(1).click();const description=page.getByRole('textbox',{name:t('Description — English','الوصف بالإنجليزية'),exact:true});await description.fill('A long demo description. '.repeat(80));
  if(info.project.name==='mobile-chromium')await page.setViewportSize({width:375,height:500});
  const arabic=page.locator('#property-descriptionAr');await arabic.focus();await expect.poll(async()=>{const a=await arabic.boundingBox(),dock=await page.locator('.ag-editor-footer').boundingBox();return a!.y+a!.height<=dock!.y+1;}).toBe(true);
  const header=await page.locator('.prototype-topbar').boundingBox(),dock=await page.locator('.ag-editor-footer').boundingBox();expect(header!.y).toBe(0);expect(header!.height).toBe(64);expect(dock!.y+dock!.height).toBeLessThanOrEqual(page.viewportSize()!.height+1);
  await page.screenshot({path:`${evidence}/${info.project.name}-${locale}-scrolled-form.png`});
 });
 test(`productivity ${locale}: contextual suggestions edit, dismiss, accept and invalidate across tabs`,async({page,context},info)=>{
  await page.goto(`/${locale}/workspace/inventory/AQ-10233/edit`);await page.getByText(t('Have property notes? Review suggested fields','لديك ملاحظات؟ راجع الحقول المقترحة'),{exact:true}).click();await page.getByRole('textbox',{name:t('Property source notes','ملاحظات مصدر العقار'),exact:true}).fill('price: 9000; area: 125');
  const trigger=page.getByRole('button',{name:t('Propose facts from notes','اقتراح حقائق من الملاحظات'),exact:true});await trigger.click();const panel=page.getByRole('dialog',{name:t('Review proposed facts','مراجعة الحقائق المقترحة'),exact:true});await expect(panel).toContainText('9000');await panel.getByRole('button',{name:t('Edit suggestion','تعديل الاقتراح'),exact:true}).click();await panel.getByRole('textbox',{name:`${t('Edit suggestion','تعديل الاقتراح')} · ${t('Price (QAR)','السعر (ر.ق)')}`,exact:true}).fill('9100');await panel.getByRole('button',{name:t('Accept proposed facts','قبول الحقائق المقترحة'),exact:true}).click();await expect(page.getByRole('spinbutton',{name:t('Price (QAR)','السعر (ر.ق)'),exact:true})).toHaveValue('9100');
  await trigger.click();await page.keyboard.press('Escape');await expect(trigger).toBeFocused();await expect(page.getByRole('dialog')).toHaveCount(0);
  await trigger.click();const other=await context.newPage();await other.goto(`/${locale}/workspace/inventory/AQ-10233/edit?advanced=1`);await other.locator('.gm-edit-fields input').first().fill('New canonical title');await other.locator('.gm-edit-footer button').click();await expect(panel.getByRole('alert')).toContainText(t('Source changed','تغيّر المصدر'));await expect(panel.getByRole('button',{name:t('Accept proposed facts','قبول الحقائق المقترحة'),exact:true})).toBeDisabled();await page.screenshot({path:`${evidence}/${info.project.name}-${locale}-stale-assistance.png`});await panel.getByRole('button',{name:t('Dismiss suggestion','تجاهل الاقتراح'),exact:true}).click();await other.close();
 }); test(`productivity ${locale}: progressive channels, multiple portals and truthful property return`,async({page},info)=>{
  await page.goto(`/${locale}/workspace/publish?property=AQ-10233`);await expect(page.locator('.ag-channel-choice')).toHaveCount(0);
  await page.locator('input[name="promotion-goal"][value="portals"]').check();await expect(page.locator('.ag-channel-choice')).toHaveCount(3);await expect(page.locator('.ag-channel-choice').filter({hasText:'WhatsApp'})).toHaveCount(0);
  for(const name of ['Property Finder','Qatar Living']){
   await page.locator('.ag-channel-choice').filter({hasText:name}).getByRole('checkbox').check();const panel=page.locator('.ag-channel-tabs~div:visible').first();await expect(panel.getByRole('heading',{name,exact:true})).toBeVisible();
   await panel.getByRole('checkbox',{name:t('I understand this prepares a fictional local setup only.','أفهم أن هذا يجهّز إعداداً محلياً خيالياً فقط.'),exact:true}).check();await panel.getByRole('button',{name:t('Prepare local setup','تجهيز الإعداد المحلي'),exact:true}).click();
   await panel.getByRole('checkbox',{name:t('I reviewed this listing and the checks for this portal.','راجعت هذا الإعلان وفحوصات هذه البوابة.'),exact:true}).check();await panel.getByRole('button',{name:t('Simulate listing','محاكاة الإعلان العقاري'),exact:true}).click();await expect(panel).toContainText(t('Queued locally','في الانتظار محلياً'));
  }
  await expect(page.locator('.ag-channel-tabs button')).toHaveCount(2);const jobs=await page.evaluate(()=>JSON.parse(localStorage.getItem('maxpro-gemini-v3-demo-state')!).jobs);expect(jobs.map((j:{status:string})=>j.status)).toEqual(['queued-demo','queued-demo']);
  await page.locator('#selected-channel-workflow').scrollIntoViewIfNeeded();await page.screenshot({path:`${evidence}/${info.project.name}-${locale}-multiple-portals.png`,fullPage:true});await page.getByRole('link',{name:t('Return to property & channel status','العودة إلى العقار وحالة القنوات'),exact:true}).click();await expect(page).toHaveURL(new RegExp(`/${locale}/workspace/inventory/AQ-10233$`));await expect(page.locator('.ag-channel-status')).toHaveCount(2);await expect(page.locator('.ag-channel-status').filter({hasText:t('Queued locally','في الانتظار محلياً')})).toHaveCount(2);
 });
 test(`productivity ${locale}: goal switching preserves edits and property switching protects unsaved drafts`,async({page})=>{
  await page.goto(`/${locale}/workspace/publish?property=AQ-10233`);await page.locator('input[name="promotion-goal"][value="advertising"]').check();await page.locator('.ag-channel-choice').filter({hasText:t('Facebook & Instagram','فيسبوك وإنستغرام')}).getByRole('checkbox').check();
  const budget=page.getByRole('spinbutton',{name:t('Media budget (QAR)','ميزانية الإعلان (ر.ق)'),exact:true});await budget.fill('375');await page.locator('input[name="promotion-goal"][value="direct"]').check();await expect(budget).not.toBeVisible();await page.locator('.ag-channel-choice').filter({hasText:t('WhatsApp Business message','رسالة واتساب للأعمال')}).getByRole('checkbox').check();await expect(page.locator('.ag-channel-tabs~div:visible').first()).toContainText(t('Preparation only','تجهيز فقط'));await expect(page.locator('.ag-channel-tabs~div:visible').first().getByRole('spinbutton')).toHaveCount(0);
  await page.locator('input[name="promotion-goal"][value="advertising"]').check();await expect(budget).toHaveValue('375');const ad=page.locator('.ag-channel-choice').filter({hasText:t('Facebook & Instagram','فيسبوك وإنستغرام')}).getByRole('checkbox');await ad.uncheck();await ad.check();await expect(budget).toHaveValue('375');
  await selectChoice(page,page.locator('.ag-promotion-property').getByRole('combobox'),'AQ-10231');const warning=page.getByRole('dialog',{name:t('Leave unsaved changes?','هل تريد مغادرة التعديلات غير المحفوظة؟'),exact:true});await expect(warning).toBeVisible();await warning.getByRole('button',{name:t('Keep editing','متابعة التحرير'),exact:true}).click();await expect(page).toHaveURL(/property=AQ-10233/);await expect(budget).toHaveValue('375');
 });
 test(`productivity ${locale}: four-width ten-screen visual consistency`,async({page},info)=>{
  test.skip(info.project.name==='mobile-chromium','The desktop project captures all four widths, including mobile.');test.setTimeout(180000);
  for(const width of [1440,1024,768,375]){
   await page.setViewportSize({width,height:width===375?812:1000});
   for(const [name,route] of [['dashboard',''],['inventory','/inventory'],['editor','/inventory/AQ-10233/edit'],['assistance','/inventory/AQ-10233/edit?assist=1'],['property','/inventory/AQ-10233'],['publishing','/publish?property=AQ-10233'],['channels','/hub/connectors/qatar-living'],['leads','/leads'],['campaigns','/campaigns'],['settings','/settings']]){
    await page.goto(`/${locale}/workspace${route}`);await expect(page.locator('main h1')).toBeVisible();await page.evaluate(()=>document.fonts.ready);if(name==='assistance')await page.getByRole('button',{name:t('Suggest bilingual copy','اقتراح وصف باللغتين'),exact:true}).click();
    expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),`${locale} ${name} at ${width}`).toBe(true);await page.screenshot({path:`${evidence}/${locale}-${width}-${name}.png`,fullPage:name!=='assistance'});
   }
  }
 });

}
