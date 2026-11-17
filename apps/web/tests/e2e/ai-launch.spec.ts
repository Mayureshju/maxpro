import {mkdirSync,readdirSync,writeFileSync} from 'node:fs';
import {resolve} from 'node:path';
import type {Page} from '@playwright/test';
import {test,expect,selectChoice,selectDemoOrganization} from './fixtures';
import {dailyFixture} from './daily-fixtures';
import {copilotAnswer,copilotIntent} from '../../src/lib/copilot';
import {createDemoStore,type DemoState} from '../../src/components/gemini/demo-provider';

async function seed(page:Page,kind:'empty'|'one'|'established'='established'){
 const state=dailyFixture(kind);if(kind==='one'){const p=state.properties['AQ-50001'];p.status='reviewed';p.source={...p.source,factsReviewed:true,copyReviewed:true};}await page.addInitScript(state=>{if(!localStorage.getItem('maxpro-ai-fixture')){localStorage.setItem('maxpro-gemini-v3-demo-state',JSON.stringify(state));localStorage.setItem('maxpro-ai-fixture','yes');}},state);return state;
}
const saved=(page:Page)=>page.evaluate(()=>JSON.parse(localStorage.getItem('maxpro-gemini-v3-demo-state')!) as DemoState);
test('AI intents are bounded, grounded, independently scoped and never authorize tools',()=>{
 const state=dailyFixture(),org=state.organization.activeOrganizationId!,p=state.properties['AQ-50002'];
 expect(copilotIntent('Spend QAR 500 and publish remotely')).toBe('unsupported');
 expect(copilotIntent('Approve verification')).toBe('unsupported');
 expect(copilotAnswer(state,'Improve description AQ-50003',p.id,undefined).intent).toBe('unsupported');
 for(const [prompt,intent] of [['Which properties need attention?','attention'],['Why is this listing not ready?','readiness'],['Improve bilingual descriptions','copy'],['Prepare a Facebook campaign','campaign'],['Show unanswered enquiries','leads'],['Prepare a WhatsApp follow-up','follow-up'],['Explain channel requirements','channels'],['Explain recorded performance','performance']])expect(copilotAnswer(state,prompt,p.id,undefined).intent).toBe(intent);
 for(const [prompt,intent] of [['أي عقارات تحتاج إلى اهتمام؟','attention'],['لماذا هذا الإعلان غير جاهز؟','readiness'],['حسّن الوصف باللغتين','copy'],['تجهيز حملة فيسبوك','campaign'],['عرض الاستفسارات دون رد','leads'],['تجهيز متابعة واتساب','follow-up'],['شرح متطلبات القنوات','channels'],['شرح الأداء المسجل','performance']])expect(copilotAnswer(state,prompt,p.id,undefined,true).intent).toBe(intent);
 const unchanged=JSON.stringify(state);copilotAnswer(state,'Improve bilingual descriptions',p.id,undefined);expect(JSON.stringify(state)).toBe(unchanged);
 state.properties['FOREIGN']={...p,id:'FOREIGN',organizationId:'OTHER',facts:{...p.facts,titleEn:'Private foreign title'}};
 expect(JSON.stringify(copilotAnswer(state,'Which properties need attention?',undefined,undefined))).not.toContain('Private foreign title');
 expect(copilotAnswer(state,'Improve bilingual descriptions','FOREIGN',undefined).proposeCopy).toBeUndefined();
 const performance=copilotAnswer(state,'Explain recorded performance',p.id,undefined);expect(performance.sources).toContain(org);expect(performance.items[0].label).toContain(String(state.crm.leads.filter(l=>l.propertyId===p.id).length));
});
test('AI acceptance retains canonical revision rejection, review invalidation and suspension guard',()=>{
 const store=createDemoStore();let s=store.getSnapshot().state;const p=Object.values(s.properties).find(p=>p.source.copyReviewed)!;
 expect(store.saveProperty(p.id,p.revision,{facts:{...p.facts,descriptionEn:'Edited from saved facts'}},'Accepted source-grounded bilingual copy')).toBe(true);
 s=store.getSnapshot().state;expect(s.properties[p.id].source.copyReviewed).toBe(false);expect(s.properties[p.id].revision).toBe(p.revision+1);
 expect(store.saveProperty(p.id,p.revision,{facts:p.facts},'Stale AI proposal')).toBe(false);
 store.organizationCommand({type:'persona',role:'super-admin'});const org=store.getSnapshot().state.organization.organizations[0];store.organizationCommand({type:'organization-status',id:org.id,revision:org.revision,status:'suspended-demo'});store.organizationCommand({type:'persona',role:'owner'});expect(store.saveProperty(p.id,p.revision+1,{facts:p.facts},'Denied AI proposal')).toBe(false);
});

for(const locale of ['en','ar']){
 const ar=locale==='ar',t=(en:string,arabic:string)=>ar?arabic:en;
 const entry=(page:Page)=>page.getByRole('button',{name:t('MaxPro AI','ماكس برو AI'),exact:true});
 const drawer=(page:Page)=>page.getByRole('dialog',{name:t('MaxPro AI','ماكس برو AI'),exact:true});
 test(`AI ${locale}: empty agency starts directly, selects context and safely falls back`,async({page})=>{
  await seed(page,'empty');await page.goto(`/${locale}/workspace`);await expect(page.locator('.ag-getting-started')).toBeVisible();await expect(page.getByRole('link',{name:t('Add property','إضافة عقار'),exact:true})).toBeVisible();
  await page.getByRole('link',{name:t('AI Property Launch','إطلاق العقار بمساعدة AI'),exact:true}).click();await expect(page.locator('.ai-launch-picker')).toBeVisible();await page.getByRole('link',{name:t('Create a property draft','إنشاء مسودة عقار'),exact:true}).click();await expect(page.locator('.ag-quick-add')).toBeVisible();
  await page.goto(`/${locale}/workspace/inventory`);await expect(page.locator('.fx-empty a')).toHaveAttribute('href',`/${locale}/workspace/inventory/new`);
  await entry(page).click();const panel=drawer(page);await expect(panel).toContainText(t('no live AI provider','لا توجد خدمة AI فعلية'));
  for(const prompt of [t('Which properties need attention?','أي عقارات تحتاج إلى اهتمام؟'),t('Why is this listing not ready?','لماذا هذا الإعلان غير جاهز؟'),t('Show unanswered enquiries','عرض الاستفسارات دون رد'),t('Explain channel requirements','شرح متطلبات القنوات'),t('Explain recorded performance','شرح الأداء المسجل')]){await panel.getByRole('button',{name:prompt,exact:true}).click();await expect(panel.locator('.ai-answer')).toBeVisible();}
  await panel.getByRole('textbox',{name:t('Ask about your saved work','اسأل عن عملك المحفوظ'),exact:true}).fill('Spend QAR 500 and publish remotely');await panel.getByRole('button',{name:t('Ask','اسأل'),exact:true}).click();await expect(panel.locator('.ai-answer')).toContainText(t('outside the local demo','خارج نطاق التجربة المحلية'));expect((await saved(page)).jobs).toEqual([]);
  await page.keyboard.press('Escape');await expect(panel).toHaveCount(0);await expect(entry(page)).toBeFocused();
 });
 test(`AI ${locale}: contextual copy requires acceptance and keeps property through launch`,async({page})=>{
  const state=await seed(page,'one'),id='AQ-50001';await page.goto(`/${locale}/workspace/inventory/${id}`);await entry(page).click();const panel=drawer(page);await expect(panel.locator('.ai-source-ref')).toContainText(id);
  await panel.getByRole('button',{name:t('Improve bilingual descriptions','حسّن الوصف باللغتين'),exact:true}).click();await panel.getByRole('button',{name:t('Review copy proposal','مراجعة اقتراح الوصف'),exact:true}).click();const proposal=page.locator('dialog.ag-assistant');await expect(proposal).toContainText(`${id}@1`);await expect(proposal).toContainText(state.properties[id].facts.titleEn);
  await proposal.getByRole('button',{name:t('Dismiss suggestion','تجاهل الاقتراح'),exact:true}).click();expect((await saved(page)).properties[id].revision).toBe(1);
  await panel.getByRole('button',{name:t('Review copy proposal','مراجعة اقتراح الوصف'),exact:true}).click();await proposal.getByRole('button',{name:t('Accept & save descriptions','قبول الأوصاف وحفظها'),exact:true}).click();const updated=(await saved(page)).properties[id];expect(updated.revision).toBe(2);expect(updated.source.copyReviewed).toBe(false);expect(updated.source.factsReviewed).toBe(false);expect((await saved(page)).jobs).toEqual([]);
  await page.keyboard.press('Escape');await page.getByRole('link',{name:t('AI Property Launch','إطلاق العقار بمساعدة AI'),exact:true}).click();await expect(page).toHaveURL(new RegExp(`mode=launch&property=${id}`));await expect(page.locator('.ai-launch-preparation')).toContainText(t('Human review required','مراجعة بشرية مطلوبة'));await expect(page.getByRole('combobox',{name:t('Selected property','العقار المختار'),exact:true})).toHaveValue(state.properties[id].facts[ar?'titleAr':'titleEn']);
 });
 test(`AI ${locale}: property selectors retain launch mode and explicit Copilot context`,async({page})=>{
  await seed(page);await page.goto(`/${locale}/workspace/publish?mode=launch`);
  await selectChoice(page,page.getByRole('combobox',{name:t('Select a property to launch','اختر عقاراً للإطلاق'),exact:true}),'AQ-50002');await expect(page).toHaveURL(/mode=launch&property=AQ-50002/);
  await selectChoice(page,page.getByRole('combobox',{name:t('Selected property','العقار المختار'),exact:true}),'AQ-50003');await expect(page).toHaveURL(/mode=launch&property=AQ-50003/);await expect(page.locator('h1')).toHaveText(t('AI Property Launch','إطلاق العقار بمساعدة AI'));
  await page.goto(`/${locale}/workspace/inventory`);await entry(page).click();await selectChoice(page,drawer(page).getByRole('combobox',{name:t('AI property context','سياق العقار للمساعد'),exact:true}),'AQ-50004');await drawer(page).getByRole('button',{name:t('Prepare a Facebook campaign','تجهيز حملة فيسبوك'),exact:true}).click();await expect(drawer(page).locator('.ai-answer a').first()).toHaveAttribute('href',new RegExp('property=AQ-50004'));await drawer(page).locator('.ai-answer a').first().click();await expect(page).toHaveURL(/property=AQ-50004/);await expect(drawer(page)).toHaveCount(0);
 });
 test(`AI ${locale}: stale proposals reject cross-tab changes and organization context is reset`,async({page,context})=>{
  await seed(page,'one');await page.goto(`/${locale}/workspace/publish?mode=launch&property=AQ-50001`);await page.getByRole('button',{name:t('Review bilingual suggestion','مراجعة اقتراح باللغتين'),exact:true}).click();
  const other=await context.newPage();await other.goto(`/${locale}/workspace/inventory/AQ-50001/edit?step=1`);await other.getByRole('textbox',{name:t('Title — English','العنوان بالإنجليزية'),exact:true}).fill('Demo changed in another tab');await other.getByRole('button',{name:t('Save draft','حفظ المسودة'),exact:true}).click();
  const proposal=page.locator('dialog.ag-assistant');await expect(proposal.getByRole('button',{name:t('Accept & save descriptions','قبول الأوصاف وحفظها'),exact:true})).toBeDisabled();await expect(proposal).toContainText(t('Source changed','تغيّر المصدر'));await page.keyboard.press('Escape');await other.close();
  await entry(page).click();await expect(drawer(page)).toContainText('AQ-50001');await page.keyboard.press('Escape');await selectDemoOrganization(page,'ORG-DEMO-DAILY-B');await page.goto(`/${locale}/workspace`);await entry(page).click();await expect(drawer(page)).not.toContainText('AQ-50001');await drawer(page).getByRole('button',{name:t('Which properties need attention?','أي عقارات تحتاج إلى اهتمام؟'),exact:true}).click();await expect(drawer(page).locator('.ai-answer')).not.toContainText('Demo changed in another tab');
 });
 test(`AI ${locale}: nested proposal releases scrolling when another tab changes agency`,async({page,context})=>{
  await seed(page,'one');await page.goto(`/${locale}/workspace/inventory/AQ-50001`);const original=await page.evaluate(()=>document.body.style.overflow);await entry(page).click();await drawer(page).getByRole('button',{name:t('Improve bilingual descriptions','حسّن الوصف باللغتين'),exact:true}).click();await drawer(page).getByRole('button',{name:t('Review copy proposal','مراجعة اقتراح الوصف'),exact:true}).click();await expect(page.locator('dialog[open]')).toHaveCount(2);
  const other=await context.newPage();await selectDemoOrganization(other,'ORG-DEMO-DAILY-B');await expect(page.locator('dialog[open]')).toHaveCount(0);expect(await page.evaluate(()=>document.body.style.overflow)).toBe(original);await expect(page.locator('main')).not.toContainText('Demo daily home 1');await other.close();
 });
 test(`AI ${locale}: existing portal engine owns approval, local queue and revision invalidation`,async({page})=>{
  await seed(page,'one');await page.goto(`/${locale}/workspace/publish?mode=launch&property=AQ-50001&goal=portals&channels=qatar-living&channel=qatar-living`);
  const approval=page.getByRole('checkbox',{name:t('I reviewed this listing and the checks for this portal.','راجعت هذا الإعلان وفحوصات هذه البوابة.'),exact:true});await approval.check();await page.getByRole('button',{name:t('Simulate listing','محاكاة الإعلان العقاري'),exact:true}).click();await expect(page.getByRole('button',{name:t('Already queued locally','موجود بالقائمة المحلية'),exact:true})).toBeDisabled();const jobs=(await saved(page)).jobs;expect(jobs).toHaveLength(1);expect(jobs[0].status).toBe('queued-demo');
  await page.getByRole('button',{name:t('Review bilingual suggestion','مراجعة اقتراح باللغتين'),exact:true}).click();await page.locator('.ag-assistant').getByRole('button',{name:t('Accept & save descriptions','قبول الأوصاف وحفظها'),exact:true}).click();await expect(approval).not.toBeChecked();await expect(page.getByRole('button',{name:t('Simulate listing','محاكاة الإعلان العقاري'),exact:true})).toBeDisabled();expect((await saved(page)).jobs).toHaveLength(1);await expect(page.locator('.ag-promotion-page')).toContainText(t('No provider acknowledgement','لا يوجد إقرار من الخدمة'));
 });
 test(`AI ${locale}: Copilot links retain existing unsaved-change navigation protection`,async({page})=>{
  await seed(page);await page.goto(`/${locale}/workspace/inventory/AQ-50002/edit`);await page.getByRole('textbox',{name:t('City','المدينة'),exact:true}).fill('Demo unsaved local title');await entry(page).click();await drawer(page).getByRole('button',{name:t('Which properties need attention?','أي عقارات تحتاج إلى اهتمام؟'),exact:true}).click();await drawer(page).locator('.ai-answer a').first().click();const guard=page.getByRole('dialog',{name:t('Leave unsaved changes?','هل تريد مغادرة التعديلات غير المحفوظة؟'),exact:true});await expect(guard).toBeVisible();await guard.getByRole('button',{name:t('Keep editing','متابعة التحرير'),exact:true}).click();await page.keyboard.press('Escape');await expect(page.getByRole('textbox',{name:t('City','المدينة'),exact:true})).toHaveValue('Demo unsaved local title');
 });
 test(`AI ${locale}: six-width rendered evidence and accessibility`,async({page},info)=>{
  test.skip(info.project.name==='mobile-chromium','The complete width matrix runs once per locale. All workflow cases run in both projects.');test.setTimeout(180000);await seed(page);
  const root=resolve(`../../${process.env.MAXPRO_EVIDENCE_ROOT??'artifacts/phase16'}/after`);mkdirSync(root,{recursive:true});const records=[];const pkg=readdirSync(resolve('../../node_modules/.pnpm')).find(n=>n.startsWith('axe-core@'))!;const axe=resolve('../../node_modules/.pnpm',pkg,'node_modules/axe-core/axe.min.js');
  const routes=[['dashboard',''],['inventory-populated','/inventory'],['property','/inventory/AQ-50002'],['launch','/publish?mode=launch&property=AQ-50002&goal=portals&channels=qatar-living&channel=qatar-living'],['publish','/publish?property=AQ-50002&goal=portals&channels=qatar-living&channel=qatar-living'],['campaign-review','/campaigns/DEMO-CAMPAIGN-00000000-0000-4000-8000-000000000014'],['leads','/leads'],['inbox','/inbox?lead=LE-2100'],['copilot','/inventory/AQ-50002']];
  for(const width of [320,375,768,1024,1280,1440]){
   await page.setViewportSize({width,height:width<600?812:1000});
   for(const [name,route] of routes){
    await page.goto(`/${locale}/workspace${route}`);await expect(page.locator('main h1').first()).toBeVisible();if(name==='copilot'){await entry(page).click();await drawer(page).getByRole('button',{name:t('Why is this listing not ready?','لماذا هذا الإعلان غير جاهز؟'),exact:true}).click();}
    await page.evaluate(()=>document.fonts.ready);expect(await page.evaluate(()=>document.documentElement.scrollWidth),`${name}@${width}`).toBeLessThanOrEqual(width+1);
    await page.screenshot({path:resolve(root,`${locale}-${width}-${name}.png`),fullPage:name!=='copilot',animations:'disabled'});
    if(width===1440&&name==='inventory-populated'){const rows=page.locator('tbody tr');expect((await rows.first().boundingBox())!.y).toBeLessThan(400);expect((await rows.nth(5).boundingBox())!.y).toBeLessThan(950);}
    if(['copilot','launch','inventory-populated'].includes(name)){await page.addScriptTag({path:axe});const report=await page.evaluate('window.axe.run(document,{runOnly:{type:"tag",values:["wcag2a","wcag2aa","wcag21aa","wcag22aa"]}})') as {violations:unknown[]};records.push({locale,width,name,violations:report.violations});}
   }
  }
  writeFileSync(resolve(root,`${locale}-accessibility.json`),JSON.stringify(records,null,2));expect(records.flatMap(r=>r.violations)).toEqual([]);
 });
}
