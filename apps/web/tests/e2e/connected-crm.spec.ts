import {mkdirSync,writeFileSync} from 'node:fs';
import {resolve} from 'node:path';
import type {Page} from '@playwright/test';
import {test,expect,selectDemoOrganization} from './fixtures';
import {dailyFixture} from './daily-fixtures';
import {createDemoStore,type DemoState} from '../../src/components/gemini/demo-provider';
import {applyCrmCommand,type CrmCommand} from '../../src/lib/lead-crm';
import {restoreCrm} from '../../src/lib/lead-storage';
import {cleanRequirements,dueFollowUps,emptyRequirements,followUpTime,leadSnapshot,matchProperties,qualificationCandidates,suggestedLeadReply} from '../../src/lib/crm-productivity';
import {copilotAnswer} from '../../src/lib/copilot';

const key='maxpro-gemini-v3-demo-state',at='2026-11-18T09:00:00.000Z';
function fixture(){
 const state=dailyFixture(),lead=state.crm.leads[1],p=state.properties[lead.propertyId];
 p.facts={...p.facts,purpose:'rent',propertyType:'Apartment',beds:2,priceQar:8000,rentalFrequency:'month',city:'Doha',district:'West Bay'};
 lead.stage='New';lead.conversation.messages=[{id:`MESSAGE-${lead.id}-0`,at:lead.receivedAt,direction:'inbound',status:'received-local',text:'Purpose: rent; Location: Doha; Budget: 9000 QAR / month; Type: Apartment; Bedrooms: 2; Please share viewing options and the price.'}];
 return state;
}
async function seed(page:Page){const state=fixture();await page.addInitScript(state=>{if(!localStorage.getItem('maxpro-crm-fixture')){localStorage.setItem('maxpro-gemini-v3-demo-state',JSON.stringify(state));localStorage.setItem('maxpro-crm-fixture','yes');}},state);return state;}
async function saved(page:Page):Promise<DemoState>{return page.evaluate(key=>JSON.parse(localStorage.getItem(key)!),key);}
function command(state:DemoState,cmd:CrmCommand){const result=applyCrmCommand(state,cmd,at);if(!result.error)state.crm=result.crm;return result;}

test('connected CRM: legacy hydration, safe extension round-trip and corrupt extension recovery',()=>{
 const s=fixture(),lead=s.crm.leads[1],names=s.organization.members.filter(m=>m.organizationId===lead.organizationId).map(m=>m.alias);
 const restore=()=>restoreCrm(s.crm,1,s.properties,names,lead.organizationId);
 expect(restore().corrupt).toBe(false);
 expect(command(s,{type:'requirements',leadId:lead.id,expectedSnapshot:leadSnapshot(lead),values:{...emptyRequirements(),purpose:'rent',location:'Doha',maxBudgetQar:9000,budgetPeriod:'month',bedrooms:2},confirmed:true}).error).toBeNull();
 const current=s.crm.leads[1];expect(command(s,{type:'follow-up',leadId:current.id,expectedSnapshot:leadSnapshot(current),date:'2026-11-18',time:'12:00',reason:'Review viewing choices',assignee:'Fatima Noor'}).error).toBeNull();
 expect(restore().crm).toEqual(s.crm);
 const raw=JSON.parse(JSON.stringify(s.crm));raw.leads[1].requirements.values.maxBudgetQar=-1;raw.leads[1].followUps[0].date='2026-02-30';
 const recovered=restoreCrm(raw,1,s.properties,names,lead.organizationId);expect(recovered.corrupt).toBe(true);expect(recovered.crm.leads).toHaveLength(s.crm.leads.length);expect(recovered.crm.leads[1].requirements).toBeUndefined();expect(recovered.crm.leads[1].followUps).toBeUndefined();
});
test('connected CRM: confirmed requirements and task commands reject stale, foreign, invalid and unavailable input',()=>{
 const s=fixture(),lead=s.crm.leads[1],original=structuredClone(s.crm);
 for(const values of [{...emptyRequirements(),maxBudgetQar:100},{...emptyRequirements(),purpose:'sale' as const,maxBudgetQar:100,budgetPeriod:'month' as const},{...emptyRequirements(),bedrooms:2.5}])expect(command(s,{type:'requirements',leadId:lead.id,expectedSnapshot:leadSnapshot(lead),values,confirmed:true}).error).toBeTruthy();
 expect(command(s,{type:'requirements',leadId:lead.id,expectedSnapshot:'stale',values:emptyRequirements(),confirmed:true}).error).toContain('changed');
 expect(command(s,{type:'requirements',leadId:lead.id,expectedSnapshot:leadSnapshot(lead),values:emptyRequirements(),confirmed:false}).error).toBeTruthy();
 for(const assignee of ['Foreign agent','Yousef Al-Marri'])expect(command(s,{type:'follow-up',leadId:lead.id,expectedSnapshot:leadSnapshot(lead),date:'2026-11-18',time:'12:00',reason:'Review',assignee}).error).toBeTruthy();
 expect(command(s,{type:'follow-up',leadId:'LE-2199',expectedSnapshot:leadSnapshot(lead),date:'2026-11-18',time:'12:00',reason:'Review',assignee:'Fatima Noor'}).error).toBeTruthy();
 expect(s.crm).toEqual(original);
 const store=createDemoStore();store.update(()=>({...s,organization:{...s.organization,actor:'agent'}}));expect(store.crmCommand({type:'assign',leadId:lead.id,agent:'Fatima Noor'}).error).toContain('permission');
});
test('connected CRM: Qatar due boundary, reschedule, completion outcome and history share canonical commands',()=>{
 const s=fixture(),id=s.crm.leads[1].id;
 const current=()=>s.crm.leads.find(l=>l.id===id)!;
 expect(command(s,{type:'follow-up',leadId:id,expectedSnapshot:leadSnapshot(current()),date:'2026-11-18',time:'12:00',reason:'Review viewing options',assignee:'Fatima Noor'}).error).toBeNull();
 const task=current().followUps![0];expect(followUpTime(task)).toBe(Date.parse(at));expect(dueFollowUps(current(),Date.parse(at)-1)).toHaveLength(0);expect(dueFollowUps(current(),Date.parse(at))).toHaveLength(1);
 const old=leadSnapshot(current());expect(command(s,{type:'follow-up',leadId:id,expectedSnapshot:old,taskId:task.id,date:'2026-11-19',time:'13:00',reason:'Review availability',assignee:'Fatima Noor'}).error).toBeNull();
 expect(command(s,{type:'follow-up-status',leadId:id,expectedSnapshot:old,taskId:task.id,status:'completed',outcome:'Done'}).error).toContain('changed');
 expect(command(s,{type:'follow-up-status',leadId:id,expectedSnapshot:leadSnapshot(current()),taskId:task.id,status:'completed',outcome:''}).error).toBeTruthy();
 expect(command(s,{type:'follow-up-status',leadId:id,expectedSnapshot:leadSnapshot(current()),taskId:task.id,status:'completed',outcome:'Customer asked for another time'}).error).toBeNull();
 expect(dueFollowUps(current(),Date.parse('2026-12-01'))).toHaveLength(0);expect(current().followUps![0].outcome).toContain('another time');expect(current().activity.at(-1)?.text).toContain('completed');
 expect(command(s,{type:'follow-up',leadId:id,expectedSnapshot:leadSnapshot(current()),taskId:task.id,date:'2026-11-20',time:'13:00',reason:'Review',assignee:'Fatima Noor'}).error).toContain('open');
});
test('connected CRM: candidate evidence is explicit, contradictory facts are omitted, and suggestions do not mutate',()=>{
 const s=fixture(),l=s.crm.leads[1],before=structuredClone(l),candidates=qualificationCandidates(l);
 expect(candidates.map(c=>c.key)).toEqual(['purpose','location','maxBudgetQar','budgetPeriod','propertyType','bedrooms']);for(const candidate of candidates){expect(candidate.messageId).toBe(l.conversation.messages[0].id);expect(l.conversation.messages[0].text).toContain(candidate.evidence);}
 expect(l).toEqual(before);l.conversation.messages[0].text+='; Bedrooms: 3';expect(qualificationCandidates(l).some(c=>c.key==='bedrooms')).toBe(false);
 l.conversation.messages[0].text='Budget: 9000 QAR / month; Budget: 9000 QAR / year';expect(qualificationCandidates(l).filter(c=>['maxBudgetQar','budgetPeriod'].includes(c.key))).toEqual([]);
 l.conversation.messages[0].text='I might want an apartment someday';expect(qualificationCandidates(l)).toEqual([]);
 l.conversation.messages[0].text='الغرض: إيجار؛ الموقع: Doha؛ الميزانية: 9000 ر.ق / شهر؛ النوع: شقة؛ غرف النوم: 2';expect(qualificationCandidates(l)).toHaveLength(6);
});
test('connected CRM: matching normalizes rental periods and excludes foreign/archived/wrong-purpose records',()=>{
 const s=fixture(),l=s.crm.leads[1],p=s.properties[l.propertyId];l.requirements={values:{...emptyRequirements(),purpose:'rent',location:'Doha',propertyType:'Apartment',bedrooms:2,maxBudgetQar:96000,budgetPeriod:'year'},confirmedAt:at};
 s.properties={monthly:p,yearly:{...structuredClone(p),id:'AQ-60000',facts:{...p.facts,priceQar:96000,rentalFrequency:'year'}},expensive:{...structuredClone(p),id:'AQ-60001',facts:{...p.facts,priceQar:8001}},foreign:{...structuredClone(p),id:'AQ-60002',organizationId:'FOREIGN'},archived:{...structuredClone(p),id:'AQ-60003',status:'archived'},sale:{...structuredClone(p),id:'AQ-60004',facts:{...p.facts,purpose:'sale'}}};
 expect(matchProperties(l,s.properties).matches.map(m=>m.property.id)).toEqual([p.id,'AQ-60000']);expect(matchProperties(l,s.properties).missing).toEqual([]);
 l.requirements.values={...l.requirements.values,purpose:'sale',budgetPeriod:'total',maxBudgetQar:9000};expect(matchProperties(l,s.properties).matches.map(m=>m.property.id)).toEqual(['AQ-60004']);
 l.requirements.values.location='Unknown';expect(matchProperties(l,s.properties).matches).toEqual([]);delete l.requirements;expect(matchProperties(l,s.properties).matches).toEqual([]);
});
test('connected CRM: scoped summaries, matching, briefing, performance and relevant drafts are read-only',()=>{
 const s=fixture(),l=s.crm.leads[1],p=s.properties[l.propertyId],before=JSON.stringify(s);
 for(const ar of [false,true]){
  const summary=copilotAnswer(s,ar?'لخّص هذا العميل':'Summarize this customer',p.id,l.id,ar);expect(summary.intent).toBe('summary');expect(summary.sources).toContain(l.conversation.messages[0].id+' · '+l.conversation.messages[0].at);expect(summary.items.some(i=>i.detail?.includes('9000'))).toBe(true);
  expect(copilotAnswer(s,ar?'البحث عن عقارات مطابقة':'Find matching properties',p.id,l.id,ar).intent).toBe('matching');
  expect(copilotAnswer(s,ar?'على ماذا تركز وكالتنا اليوم؟':'What should our agency focus on today?',undefined,undefined,ar).intent).toBe('briefing');
  expect(suggestedLeadReply(l,p,ar)).toContain('8,000');
 }
 for(const prompt of ['Explain channel requirements','Explain portal requirements','شرح متطلبات القنوات','شرح متطلبات البوابات'])expect(copilotAnswer(s,prompt,p.id,undefined).intent).toBe('channels');
 expect(copilotAnswer(s,'Summarize this customer',p.id,'FOREIGN').items.some(i=>i.label===l.identity.alias)).toBe(false);expect(JSON.stringify(s)).toBe(before);
});

for(const locale of ['en','ar']){
 const ar=locale==='ar',t=(en:string,arabic:string)=>ar?arabic:en;
 test(`connected CRM ${locale}: candidate review, confirmation, matching and draft acceptance survive refresh`,async({page})=>{
  await seed(page);await page.goto(`/${locale}/workspace/leads/LE-2101`);
  await page.getByRole('button',{name:t('Suggest from conversation','اقتراح من المحادثة'),exact:true}).click();const panel=page.getByRole('dialog',{name:t('Review possible requirements','مراجعة المتطلبات المحتملة'),exact:true});await expect(panel).toContainText('MESSAGE-LE-2101-0');
  await panel.getByRole('button',{name:t('Use in review form','استخدامها في نموذج المراجعة'),exact:true}).click();expect((await saved(page)).crm.leads[1].requirements).toBeUndefined();
  await expect(page.getByRole('spinbutton',{name:t('Bedrooms','غرف النوم'),exact:true})).toHaveValue('2');await page.getByRole('checkbox',{name:t('I reviewed and confirm these customer requirements','راجعت متطلبات العميل وأؤكدها'),exact:true}).check();await page.getByRole('button',{name:t('Save confirmed requirements','حفظ المتطلبات المؤكدة'),exact:true}).click();
  await expect.poll(async()=>(await saved(page)).crm.leads[1].requirements?.values.maxBudgetQar).toBe(9000);await page.reload();await page.getByRole('button',{name:t('Find matching properties','البحث عن عقارات مطابقة'),exact:true}).click();await expect(page.getByRole('region',{name:t('Property matches','العقارات المطابقة'),exact:true})).toContainText('AQ-50002');
  await page.getByRole('link',{name:t('Open conversation','فتح المحادثة'),exact:true}).first().click();await expect(page).toHaveURL(/workspace\/inbox\?lead=LE-2101/);await expect(page.locator('#crm-reply')).toBeVisible();const before=(await saved(page)).crm.leads[1].conversation.messages.length;await page.getByRole('button',{name:t('Help with this enquiry','مساعدة في هذا الاستفسار'),exact:true}).click();await page.getByRole('button',{name:t('Use reply draft','استخدام مسودة الرد'),exact:true}).click();await expect(page.locator('#crm-reply')).toHaveValue(/8,000/);expect((await saved(page)).crm.leads[1].conversation.messages).toHaveLength(before);
 });
 test(`connected CRM ${locale}: dated task due view, reschedule and completion share one record`,async({page})=>{
  await seed(page);await page.goto(`/${locale}/workspace/leads/LE-2101`);await page.getByRole('button',{name:t('Plan follow-up','تحديد متابعة'),exact:true}).click();
  await page.getByLabel(t('Follow-up date (Qatar)','تاريخ المتابعة (قطر)'),{exact:true}).fill('2026-01-01');await page.getByRole('combobox',{name:t('Responsible agent','الوكيل المسؤول'),exact:true}).selectOption('Fatima Noor');await page.getByLabel(t('Follow-up reason','سبب المتابعة'),{exact:true}).fill('Demo review availability');await page.getByRole('button',{name:t('Save local task','حفظ المهمة محلياً'),exact:true}).click();
  await page.goto(`/${locale}/workspace/leads`);await page.getByRole('button',{name:new RegExp(t('Follow-ups due','متابعات مستحقة'))}).click();await expect(page.locator('tr[data-lead-id]')).toHaveCount(1);await page.locator('tr[data-lead-id] a').filter({hasText:'Demo review availability'}).click();
  await page.getByRole('button',{name:t('Reschedule','تغيير الموعد'),exact:true}).click();await page.getByLabel(t('Follow-up date (Qatar)','تاريخ المتابعة (قطر)'),{exact:true}).fill('2026-01-02');await page.getByRole('button',{name:t('Save local task','حفظ المهمة محلياً'),exact:true}).click();await page.reload();
  await page.getByRole('button',{name:t('Complete','إكمال'),exact:true}).click();await page.getByLabel(t('Outcome / cancellation reason','النتيجة / سبب الإلغاء'),{exact:true}).fill('Demo customer requested another date');await page.getByRole('button',{name:t('Record completion','تسجيل الإكمال'),exact:true}).click();await expect.poll(async()=>(await saved(page)).crm.leads[1].followUps?.[0].status).toBe('completed');await page.goto(`/${locale}/workspace/leads?work=due`);await expect(page.locator('tr[data-lead-id]')).toHaveCount(0);
 });
 test(`connected CRM ${locale}: shared board stage, scoped assistant and organization switch`,async({page})=>{
  await seed(page);await page.goto(`/${locale}/workspace/leads`);await page.getByRole('button',{name:t('Pipeline','مسار'),exact:true}).click();await page.getByRole('combobox',{name:`${t('Change stage','تغيير المرحلة')} · Demo visitor 2`,exact:true}).selectOption('Qualified');await page.getByRole('button',{name:t('Table','جدول'),exact:true}).click();await expect(page.locator('tr[data-lead-id="LE-2101"]')).toContainText(t('Qualified','مؤهل'));
  await page.goto(`/${locale}/workspace/leads/LE-2101`);await page.getByRole('button',{name:t('Ask MaxPro AI','اسأل ماكس برو AI'),exact:true}).click();await expect(page.locator('.ai-answer')).toContainText(t('Recorded enquiry summary','ملخص الاستفسار المسجل'));await page.keyboard.press('Escape');await selectDemoOrganization(page,'ORG-DEMO-DAILY-B');await page.goto(`/${locale}/workspace/leads`);await expect(page.locator('tr[data-lead-id]')).toHaveCount(0);await page.goto(`/${locale}/workspace/leads/LE-2101`);await expect(page.getByRole('button',{name:t('Plan follow-up','تحديد متابعة'),exact:true})).toHaveCount(0);
 });
 test(`connected CRM ${locale}: stale proposal and task forms preserve edits and block acceptance`,async({page,context})=>{
  await seed(page);await page.goto(`/${locale}/workspace/leads/LE-2101`);await page.getByRole('button',{name:t('Suggest from conversation','اقتراح من المحادثة'),exact:true}).click();
  const other=await context.newPage();await other.goto(`/${locale}/workspace/leads/LE-2101`);await other.getByRole('combobox',{name:t('Lead stage','مرحلة العميل'),exact:true}).selectOption('Contacted');const panel=page.getByRole('dialog',{name:t('Review possible requirements','مراجعة المتطلبات المحتملة'),exact:true});await expect(panel.getByRole('button',{name:t('Use in review form','استخدامها في نموذج المراجعة'),exact:true})).toBeDisabled();await panel.getByRole('button',{name:t('Dismiss suggestion','تجاهل الاقتراح'),exact:true}).click();
  await page.getByRole('button',{name:t('Plan follow-up','تحديد متابعة'),exact:true}).click();await page.getByLabel(t('Follow-up reason','سبب المتابعة'),{exact:true}).fill('Demo unsaved task');await expect(page.getByRole('button',{name:t('Plan follow-up','تحديد متابعة'),exact:true})).toBeDisabled();await other.getByRole('combobox',{name:t('Lead stage','مرحلة العميل'),exact:true}).selectOption('Qualified');await expect(page.getByRole('button',{name:t('Save local task','حفظ المهمة محلياً'),exact:true})).toBeDisabled();await expect(page.getByLabel(t('Follow-up reason','سبب المتابعة'),{exact:true})).toHaveValue('Demo unsaved task');await page.getByRole('button',{name:t('Discard task changes','تجاهل تعديلات المهمة'),exact:true}).click();await other.close();
 });
 test(`connected CRM ${locale}: same-route stage and source links apply the selected property cohort`,async({page})=>{
  await seed(page);await page.goto(`/${locale}/workspace/leads?property=AQ-50002`);await page.getByRole('button',{name:t('MaxPro AI','ماكس برو AI'),exact:true}).click();await page.getByRole('button',{name:t('Explain recorded performance','شرح الأداء المسجل'),exact:true}).click();await page.locator('.ai-answer').getByRole('link').filter({hasText:t('New','جديد')}).click();await expect(page).toHaveURL(/stage=New.*property=AQ-50002/);await expect(page.locator('tr[data-lead-id]')).toHaveCount(fixture().crm.leads.filter(l=>l.propertyId==='AQ-50002'&&l.stage==='New').length);await expect(page.getByRole('combobox',{name:t('Stage','المرحلة'),exact:true})).toHaveValue('New');
 });
}

test('connected CRM evidence fixture can be reproduced without adding default demo facts',async({page},info)=>{
 test.skip(info.project.name!=='chromium');const state=await seed(page);await page.goto('/en/workspace/leads');const root=resolve('../../artifacts/phase18');mkdirSync(root,{recursive:true});writeFileSync(`${root}/qa-fixture.json`,JSON.stringify(state,null,2));expect(cleanRequirements(emptyRequirements())).toEqual(emptyRequirements());
});
