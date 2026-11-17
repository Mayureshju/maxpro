import {mkdirSync,readdirSync,writeFileSync} from 'node:fs';
import {resolve} from 'node:path';
import {test,expect,localized,selectDemoOrganization} from './fixtures';
import {dailyFixture} from './daily-fixtures';
import {firstUseProgress} from '../../src/lib/first-use';
import {presentAuditEvent} from '../../src/lib/audit-presentation';
import {latestPublishingJobs,unansweredEnquiry} from '../../src/lib/daily-workspace';
import {createDemoStore,type DemoState} from '../../src/components/gemini/demo-provider';
import {exampleLeadPayload} from '../../src/lib/lead-crm';
import {restoreOrganization} from '../../src/lib/organization-storage';
import type {Page} from '@playwright/test';
const key='maxpro-gemini-v3-demo-state';
async function seed(page:Page,kind:'empty'|'one'|'established'='established',configure?:(state:DemoState)=>void){
 const s=dailyFixture(kind);configure?.(s);await page.addInitScript(s=>{if(!localStorage.getItem('maxpro-daily-fixture')){localStorage.setItem('maxpro-gemini-v3-demo-state',JSON.stringify(s));localStorage.setItem('maxpro-daily-fixture','yes');}},s);return s;
}
const saved=(page:Page)=>page.evaluate(k=>JSON.parse(localStorage.getItem(k)!) as DemoState,key);

test('daily progress selects a coherent completed journey over an older draft; source changes regress it',()=>{
 const state=dailyFixture();expect(firstUseProgress(state)).toMatchObject({complete:true,property:{id:'AQ-50002'}});
 state.properties['AQ-50002'].revision++;expect(firstUseProgress(state).complete).toBe(false);
 state.properties['AQ-50002'].status='archived';expect(firstUseProgress(state).property?.id).not.toBe('AQ-50002');
});
test('daily activity preserves actual command context, safely presents unknown/missing/denied events and restores snapshots',()=>{
 const store=createDemoStore(),lead=store.getSnapshot().state.crm.leads[0];
 expect(store.crmCommand({type:'assign',leadId:lead.id,agent:'Karim Said'}).error).toBeNull();
 const event=store.getSnapshot().state.organization.audit[0];expect(event.details?.assignee).toBe('Karim Said');
 expect(store.crmCommand({type:'assign',leadId:lead.id,agent:'Fatima Noor'}).error).toBeNull();
 let state=store.getSnapshot().state;expect(presentAuditEvent(event,state).label).toBe('Enquiry assigned to Karim Said');expect(presentAuditEvent(event,state,true).label).toContain('Karim Said');
 const restored=restoreOrganization(state.organization,1,state.properties,state.plan);expect(restored.corrupt).toBe(false);expect(restored.organization.audit.find(e=>e.id===event.id)?.details?.assignee).toBe('Karim Said');
 expect(presentAuditEvent({...event,details:undefined},state).label).toBe('Enquiry assignment updated');
 expect(presentAuditEvent({...event,action:'raw:unknown',note:'secret:internal',target:'gone'},state)).toEqual({label:'Workspace activity recorded',href:undefined});
 expect(presentAuditEvent({...event,outcome:'denied-demo'},state).label).toContain('could not');
 expect(store.crmCommand({type:'reply',leadId:lead.id,text:'Fictional reply saved in this browser.'}).error).toBeNull();state=store.getSnapshot().state;expect(presentAuditEvent(state.organization.audit[0],state).label).toBe(`Reply saved for ${lead.identity.alias}`);expect(unansweredEnquiry(state.crm.leads[0])).toBe(false);
});

test('daily event intake distinguishes saved accepted and duplicate receipts; suspended agency cannot create',()=>{
 const store=createDemoStore(),state=store.getSnapshot().state,id=Object.keys(state.properties)[0],payload=exampleLeadPayload('Qatar Living',id,'DEMO-DAILY-INTAKE');
 store.crmCommand({type:'intake',source:'Qatar Living',payload,acknowledged:true});let next=store.getSnapshot().state;expect(presentAuditEvent(next.organization.audit[0],next).label).toBe('New example enquiry received from Qatar Living');const count=next.crm.leads.length;
 store.crmCommand({type:'intake',source:'Qatar Living',payload,acknowledged:true});next=store.getSnapshot().state;expect(next.crm.leads).toHaveLength(count);expect(presentAuditEvent(next.organization.audit[0],next).label).toContain('Duplicate example enquiry ignored');
 store.organizationCommand({type:'persona',role:'super-admin'});store.organizationCommand({type:'organization-status',id:next.organization.activeOrganizationId??'ORG-DEMO-PEARL',revision:1,status:'suspended-demo'});store.organizationCommand({type:'persona',role:'owner'});expect(store.createProperty({titleEn:'Demo blocked'})).toBe('');
});
test('daily latest channel status follows updated attempts rather than array position',()=>{
 const state=dailyFixture(),job=state.jobs[0],blocked={...job,id:'NEWER-IN-ARRAY',at:'2026-11-14T08:00:00.000Z',status:'blocked-demo' as const};const retried={...job,id:'RETRIED-IN-PLACE',at:'2026-11-14T09:00:00.000Z'};
 expect(latestPublishingJobs([blocked,retried])[0].id).toBe('RETRIED-IN-PLACE');expect(latestPublishingJobs([retried,blocked])[0].status).toBe('queued-demo');
});

for(const locale of ['en','ar']){
 const ar=locale==='ar',t=(en:string,arabic:string)=>ar?arabic:en;
 test(`daily ${locale}: complete setup stays compact, readable activity and scoped boundaries`,async({page})=>{
  const initial=await seed(page);await page.goto(`/${locale}/workspace`);await expect(page.locator('.ag-dashboard-page')).toBeVisible();await expect(page.locator('.ag-getting-started')).toHaveCount(0);
  await page.getByRole('button',{name:t('Getting-started help','مساعدة البداية'),exact:true}).click();const guide=page.locator('.ag-getting-started');await expect(guide).toContainText('5 / 5');await expect(guide.getByRole('link',{name:/Continue setup|متابعة التجهيز/})).toHaveCount(0);await expect(guide.getByRole('link',{name:t('Open property','فتح العقار'),exact:true})).toHaveAttribute('href',`/${locale}/workspace/inventory/AQ-50002`);await expect(guide.locator('details')).not.toHaveAttribute('open','');
  await expect(page.locator('.ag-activity')).not.toContainText(/crm:|unexpected:internal/);await expect(page.locator('.ag-activity a')).toHaveCount(4);
  await guide.getByRole('button',{name:t('Dismiss getting-started guide','إخفاء دليل البداية')}).click();await page.reload();await expect(guide).toHaveCount(0);
  await selectDemoOrganization(page,'ORG-DEMO-DAILY-B');await page.goto(`/${locale}/workspace`);await expect(guide).toBeVisible();await expect(guide.getByRole('link',{name:t('Start','ابدأ'),exact:true})).toBeVisible();expect((await saved(page)).properties).toEqual({});
  await page.goto(`/${locale}/workspace/inventory/AQ-50002/edit`);await expect(page.getByRole('textbox',{name:t('Property title','عنوان العقار'),exact:true})).toHaveCount(0);
  await selectDemoOrganization(page,'ORG-DEMO-DAILY-A');await page.goto(`/${locale}/workspace`);await expect(guide).toHaveCount(0);const restored=await saved(page);expect(Object.keys(restored.properties)).toHaveLength(25);expect(restored.crm.leads).toHaveLength(32);expect(restored.properties['AQ-50002'].facts).toEqual(initial.properties['AQ-50002'].facts);
 });
 test(`daily ${locale}: Quick Add validates, protects edits, saves a partial draft and prevents duplicate continuation`,async({page})=>{
  await seed(page,'empty');await page.goto(`/${locale}/workspace/inventory/new`);const submit=page.getByRole('button',{name:t('Save & continue','حفظ ومتابعة'),exact:true});
  await submit.click();await expect(page.locator('[aria-invalid="true"]')).toHaveCount(3);expect(Object.keys((await saved(page)).properties)).toHaveLength(0);
  await page.getByRole('textbox',{name:t('Property title','عنوان العقار'),exact:true}).fill('   ');await page.getByRole('textbox',{name:t('City','المدينة'),exact:true}).fill(' ');await page.getByRole('spinbutton').fill('-1');await submit.click();expect(Object.keys((await saved(page)).properties)).toHaveLength(0);
  await page.getByRole('textbox',{name:t('Property title','عنوان العقار'),exact:true}).fill('Demo partial home');await page.getByRole('spinbutton').fill('');await page.locator('.prototype-topbar .topbar-utility').click();await expect(page.getByRole('dialog',{name:t('Leave unsaved changes?','هل تريد مغادرة التعديلات غير المحفوظة؟')})).toBeVisible();await page.getByRole('button',{name:t('Keep editing','متابعة التحرير'),exact:true}).click();
  await page.getByRole('button',{name:t('Save as draft','حفظ كمسودة'),exact:true}).click();await expect(page).toHaveURL(/\/inventory\/DEMO-[^/]+$/);expect(Object.values((await saved(page)).properties)[0].facts.priceQar).toBe(0);
  await page.goto(`/${locale}/workspace/inventory/new`);await page.getByRole('textbox',{name:t('Property title','عنوان العقار'),exact:true}).fill('Demo complete basics');await page.getByRole('textbox',{name:t('City','المدينة'),exact:true}).fill('Doha');await page.getByRole('spinbutton').fill('8500');await page.locator('form.ag-quick-add').evaluate(f=>{(f as HTMLFormElement).requestSubmit();(f as HTMLFormElement).requestSubmit();});await expect(page).toHaveURL(/\/edit$/);expect(Object.keys((await saved(page)).properties)).toHaveLength(2);
 });
 test(`daily ${locale}: large inventory filters and useful property/channel recovery survive reload`,async({page})=>{
  await seed(page);await page.goto(`/${locale}/workspace/inventory`);await expect(page.locator('.ag-daily-inventory tbody tr')).toHaveCount(25);
  await page.getByRole('searchbox',{name:localized('Search properties')}).fill('daily home 2');await expect(page.locator('.ag-daily-inventory tbody tr')).toHaveCount(6);await page.getByRole('button',{name:t('Clear filters','مسح الفلاتر'),exact:true}).click();
  await page.getByRole('button',{name:t('Filters','الفلاتر'),exact:false}).first().click();await page.getByRole('combobox',{name:t('Filter property type','تصفية نوع العقار')}).selectOption('Villa');await page.getByRole('combobox',{name:t('Filter purpose','تصفية الغرض')}).selectOption('sale');await expect(page.locator('.ag-daily-inventory tbody tr')).toHaveCount(4);
  await page.getByRole('combobox',{name:localized('Sort properties')}).selectOption('price-low');await page.getByRole('button',{name:localized('Grid view'),exact:true}).click();await expect(page.locator('.px-property-tile')).toHaveCount(4);
  await page.goto(`/${locale}/workspace/inventory/AQ-50003`);await expect(page.getByRole('link',{name:t('Resume channel preparation','متابعة تجهيز القناة'),exact:true})).toBeVisible();await page.getByRole('link',{name:t('Resume channel preparation','متابعة تجهيز القناة'),exact:true}).click();await expect(page.locator('.ag-channel-tabs button[aria-current="page"]')).toHaveText('Property Finder');await page.reload();await expect(page.locator('input[name="promotion-goal"][value="portals"]')).toBeChecked();await expect(page.locator('.ag-channel-tabs button[aria-current="page"]')).toHaveText('Property Finder');await expect(page.getByRole('checkbox',{name:t('I reviewed this listing and the checks for this portal.','راجعت هذا الإعلان وفحوصات هذه البوابة.'),exact:true})).not.toBeChecked();
  await page.locator('input[name="promotion-goal"][value="direct"]').check();await page.locator('.ag-channel-choice').filter({hasText:t('WhatsApp Business message','رسالة واتساب للأعمال')}).getByRole('checkbox').check();await expect(page).toHaveURL(/goal=direct/);await page.reload();await expect(page.locator('.ag-channel-tabs button[aria-current="page"]')).toHaveText(t('WhatsApp Business message','رسالة واتساب للأعمال'));await expect(page.getByText(t('Paid ad through Meta','إعلان مدفوع عبر ميتا'),{exact:true})).toHaveCount(0);
 });
 test(`daily ${locale}: archived property offers guarded resume and retains revision safety`,async({page})=>{
  await seed(page,'established',s=>{s.properties['AQ-50002'].status='archived';});await page.goto(`/${locale}/workspace/inventory/AQ-50002`);await expect(page.locator('.ag-property-next a[href*="/publish?"]')).toHaveCount(0);await page.getByRole('button',{name:t('Resume property','استئناف العقار'),exact:true}).click();const state=await saved(page);expect(state.properties['AQ-50002'].status).toBe('reviewed');expect(state.properties['AQ-50002'].revision).toBe(2);await expect(page.getByRole('link',{name:t('Resume channel preparation','متابعة تجهيز القناة'),exact:true})).toBeVisible();
 });
 test(`daily ${locale}: daily controls and completed guide pass whole-document accessibility checks`,async({page},info)=>{
  test.setTimeout(90000);await seed(page);const reports=[];const pkg=readdirSync(resolve('../../node_modules/.pnpm')).find(n=>n.startsWith('axe-core@'))!;const axe=resolve('../../node_modules/.pnpm',pkg,'node_modules/axe-core/axe.min.js');
  for(const route of ['','/inventory/new','/inventory','/inventory/AQ-50002','/publish?property=AQ-50003&goal=portals&channels=property-finder&channel=property-finder','/leads','/inbox?lead=LE-2100']){
   await page.goto(`/${locale}/workspace${route}`);await expect(page.locator('main h1')).toBeVisible();if(!route)await page.getByRole('button',{name:t('Getting-started help','مساعدة البداية'),exact:true}).click();if(route==='/inventory/new')await page.getByRole('button',{name:t('Save & continue','حفظ ومتابعة'),exact:true}).click();
   await page.addScriptTag({path:axe});const result=await page.evaluate('window.axe.run(document,{runOnly:{type:"tag",values:["wcag2a","wcag2aa","wcag21aa","wcag22aa"]}})') as {violations:unknown[]};reports.push({route,violations:result.violations});
  }
  const root=resolve(`../../${process.env.MAXPRO_EVIDENCE_ROOT??'artifacts/phase14'}/accessibility`);mkdirSync(root,{recursive:true});writeFileSync(resolve(root,`${info.project.name}-${locale}.json`),JSON.stringify(reports,null,2));expect(reports.flatMap(r=>r.violations)).toEqual([]);
 });
 test(`daily ${locale}: enquiry triage links properties and protects an unsaved Inbox reply`,async({page})=>{
  const state=await seed(page);await page.goto(`/${locale}/workspace/leads`);await page.getByRole('button',{name:new RegExp(t('Unanswered recorded messages','رسائل مسجلة دون رد'))}).click();await expect(page.locator('.ag-daily-leads tbody tr')).toHaveCount(state.crm.leads.filter(l=>unansweredEnquiry(l)&&!['Won','Lost'].includes(l.stage)).length);
  await page.goto(`/${locale}/workspace/inbox?lead=LE-2100`);const conversationSearch=page.getByRole('searchbox',{name:t('Search conversations','البحث في المحادثات'),exact:true});expect((await conversationSearch.boundingBox())!.width).toBeGreaterThanOrEqual(180);await conversationSearch.fill('Demo daily home 2');await expect(page.locator('.px-conversation-tile')).not.toHaveCount(0);await conversationSearch.fill('');await page.locator('#crm-reply').fill('Demo unsaved reply');await page.locator('.px-conversation-tile').filter({has:page.getByText(localized('Demo visitor 2',true),{exact:true})}).click();const dialog=page.getByRole('dialog',{name:t('Leave this reply draft?','مغادرة مسودة الرد؟')});await expect(dialog).toBeVisible();await dialog.getByRole('button',{name:t('Keep editing','متابعة التحرير')}).click();await expect(page.locator('#crm-reply')).toHaveValue('Demo unsaved reply');
  await page.locator('.px-conversation-tile').filter({has:page.getByText(localized('Demo visitor 2',true),{exact:true})}).click();await page.getByRole('button',{name:t('Discard reply draft','تجاهل مسودة الرد')}).click();await expect(page.locator('#crm-reply')).toHaveValue('');await expect(page).toHaveURL(/lead=LE-2101/);await expect(page.locator('.crm-conversation-property[href$="/inventory/AQ-50002"]')).toBeVisible();
 });
}
