import {localized} from './fixtures';
import {resolve} from 'node:path';
import {readFile} from 'node:fs/promises';
import type {Page} from '@playwright/test';
import {test,expect} from './fixtures';
import {generateFeed,normalizeProperty,xmlEscape,csvCell} from '../../src/lib/connector-engine';
import {newProperty,seedProperties} from '../../src/lib/canonical-property';
import {approvalContext,publicationCommandError,destinationReadiness,setupErrors,type PublishingState} from '../../src/lib/syndication-engine';
import {readJob} from '../../src/lib/property-storage';
import type {DemoState} from '../../src/components/gemini/demo-provider';
const key='maxpro-gemini-v3-demo-state';
const save=/Save browser-local draft|حفظ المسودة محلياً/;
function parseCsv(value:string):string[][]{
 const rows:string[][]=[];let row:string[]=[];let cell='';let quoted=false;
 for(let i=0;i<value.length;i++){
  const c=value[i];
  if(c==='"'){if(quoted&&value[i+1]==='"'){cell+='"';i++;}else quoted=!quoted;}
  else if(c===','&&!quoted){row.push(cell);cell='';}
  else if(c==='\r'&&value[i+1]==='\n'&&!quoted){row.push(cell);rows.push(row);row=[];cell='';i++;}
  else cell+=c;
 }
 row.push(cell);rows.push(row);return rows;
}

async function snapshot(page:Page):Promise<DemoState>{return page.evaluate(key=>JSON.parse(localStorage.getItem(key)!),key);}
async function prepare(page:Page,locale:string,id='property-finder'){
 await page.goto(`/${locale}/workspace/hub/connectors/${id}`);await page.getByRole('checkbox').check();await page.getByRole('button',{name:localized("Prepare demo connector")}).click();
}
async function publish(page:Page,locale='en',id='AQ-10233'){
 const next=locale==='ar'?'متابعة':'Continue';
 await page.goto(`/${locale}/workspace/publish?advanced=1&property=${id}`);
 await page.getByRole('button',{name:localized(next,true),exact:true}).click();await page.getByRole('button',{name:localized(next,true),exact:true}).click();await page.getByRole('checkbox').check();await page.getByRole('button',{name:localized(next,true),exact:true}).click();await page.getByRole('button',{name:localized(locale==='ar'?'محاكاة النشر':'Simulate publishing',true),exact:true}).click();
}
async function capture(page:Page,name:string){
 await page.evaluate(()=>document.fonts.ready);await page.screenshot({path:resolve(`../../${globalThis.process.env.MAXPRO_EVIDENCE_ROOT??'artifacts/phase6'}/regression/phase2/screenshots/${name}.png`),fullPage:true,scale:'css'});
 expect(await page.evaluate(()=>document.documentElement.scrollWidth)).toBeLessThanOrEqual(page.viewportSize()!.width+1);
}

test('internal export contracts handle invalid values, Unicode, XML controls and CSV formulas',async()=>{
 const p=newProperty('DEMO-00000000-0000-0000-0000-000000000000');
 p.facts.titleEn=' =HYPERLINK("demo"), <&>\nline';p.facts.titleAr='عقار 🏡';p.facts.descriptionEn='quotes " and \u0000 forbidden';p.facts.priceQar=Infinity;p.facts.latitude='NaN';
 const xml=generateFeed(p,'property-finder','xml');expect(xml.output).toContain('&lt;&amp;&gt;');expect(xml.output).not.toContain('\u0000');expect(xml.output).toContain('عقار 🏡');expect(xml.output).toContain('�');
 const json=JSON.parse(generateFeed(p,'qatar-living','json').output);expect(json.property.qatar_living_example_price_qar).toBeNull();expect(json.remote_sent).toBe(false);
 const csv=generateFeed(p,'qatar-living','csv').output;const [headers,values]=parseCsv(csv);expect(headers).toHaveLength(values.length);expect(values[headers.indexOf('qatar_living_example_title_en')]).toBe("'"+p.facts.titleEn);expect(values[headers.indexOf('qatar_living_example_title_ar')]).toBe(p.facts.titleAr);expect(values[headers.indexOf('qatar_living_example_property_type')]).toBe('Apartment');expect(csv).toContain('"\' =HYPERLINK(""demo""), <&>\nline"');
 for(const value of ['=1+1',' +1','-2+3','@SUM(1)','\t=1','\n=2','\r=3','\uFEFF=1'])expect(csvCell(value)).toMatch(/^"'/);
 expect(xmlEscape('"\' < & >')).toBe('&quot;&apos; &lt; &amp; &gt;');expect(normalizeProperty(p).latitude).toBeNull();expect(xml.errors).toContain('Mapping: price_qar');
});

test('command guards reject stale approval, unsupported destinations, missing approval and quota bypass',async()=>{
 const properties=seedProperties();const s:PublishingState={plan:'agency',properties,preparedConnectors:['property-finder'],jobs:[]};const p=properties['AQ-10233'];const selected=['property-finder'] as const;const ids=[...selected];const context=approvalContext(s,p,ids);
 expect(publicationCommandError(s,p.id,p.revision,ids,false,context)).toContain('approve');expect(publicationCommandError(s,p.id,0,ids,true,context)).toContain('changed');expect(publicationCommandError(s,p.id,p.revision,['ga4'],true,context)).toContain('approve');expect(publicationCommandError(s,p.id,p.revision,ids,true,'stale')).toContain('approve');expect(publicationCommandError(s,p.id,p.revision,ids,true,context)).toBeNull();
 s.plan='starter';expect(publicationCommandError(s,p.id,p.revision,ids,true,context)).toContain('approve');expect(setupErrors(s,'qatar-living').join()).toContain('allows 1');expect(setupErrors(s,'meta-catalog').join()).toContain('Starter');
 const destinations=['property-finder','qatar-living'] as const;expect(publicationCommandError(s,p.id,p.revision,[...destinations],true,approvalContext(s,p,[...destinations]))).toContain('includes 1');
 expect(destinationReadiness(s,p,'qatar-living').status).toBe('setup-blocked');s.preparedConnectors.push('bayut-dubizzle');expect(destinationReadiness(s,p,'bayut-dubizzle').missing).toContain('Partner and country eligibility confirmation');
 const blank=newProperty('DEMO-00000000-0000-0000-0000-000000000000');s.properties[blank.id]=blank;s.preparedConnectors.push('qatar-living');expect(destinationReadiness(s,blank,'qatar-living').status).toBe('validation-blocked');
});

test('job migration retains old local history and rejects forged or corrupt attempt metadata',async()=>{
 const properties=seedProperties();const old={id:'OLD-DEMO-JOB',listingId:'AQ-10233',organizationId:properties['AQ-10233'].organizationId,propertyRevision:1,destination:'property-finder',status:'queued-demo',missing:[],at:'2026-11-12T10:00:00Z'};
 const migrated=readJob(old,properties);expect(migrated?.mappingVersion).toContain('legacy-');expect(migrated?.attempts).toHaveLength(1);
 expect(readJob({...old,status:'accepted',externalReference:'fake'},properties)).toBeNull();expect(readJob({...migrated,attempts:[{...migrated!.attempts[0],status:'accepted'}]},properties,false,true)).toBeNull();expect(readJob({...migrated,mappingVersion:12},properties,false,true)).toBeNull();
});

for(const locale of ['en','ar']){
 const ar=locale==='ar';
 test(`connector smoke ${locale}: directory filtering, setup, removal and eligibility`,async({page},info)=>{
  test.setTimeout(60000);
  await page.goto(`/${locale}/workspace/hub/marketplace`);await page.getByRole('button',{name:localized("Analytics",true),exact:true}).click();await expect(page.locator('.gm-market-row')).toHaveCount(1);await expect(page.locator('.gm-market-row')).toContainText(localized('Google Analytics 4'));await page.getByRole('textbox',{name:localized("Search connectors")}).fill('no-such-provider');await expect(page.locator('.gm-market-row')).toHaveCount(0);
  await page.getByRole('textbox',{name:localized("Search connectors")}).fill('');await page.getByRole('button',{name:localized("All",true),exact:true}).click();await expect(page.locator('.gm-market-row')).toHaveCount(8);await capture(page,`${info.project.name}-${locale}-directory`);
  await prepare(page,locale);await expect(page.getByRole('button',{name:localized("Remove local demo setup")})).toBeEnabled();await page.reload();await expect(page.getByText(localized('Local demo setup recorded',true),{exact:true})).toBeVisible();await page.getByRole('checkbox').check();await page.getByRole('button',{name:localized("Remove local demo setup")}).click();expect((await snapshot(page)).preparedConnectors).not.toContain('property-finder');
  await prepare(page,locale,'bayut-dubizzle');await expect(page.locator('#diagnostics')).toContainText(localized("confirmation-required"));await expect(page.locator('#diagnostics')).toContainText(localized('Remote connectivity: none'));await capture(page,`${info.project.name}-${locale}-provider`);
  await page.goto(`/${locale}/workspace/billing`);await page.getByRole('button',{name:localized(/Starter/)}).click();await page.goto(`/${locale}/workspace/hub/connectors/meta-catalog`);await page.getByRole('checkbox').check();await expect(page.getByRole('button',{name:localized("Prepare demo connector")})).toBeDisabled();await expect(page.locator('main').getByRole('alert')).toContainText(localized("Starter"));
 });
 test(`connector smoke ${locale}: newly created property drives escaped XML JSON CSV and downloads`,async({page},info)=>{
  test.setTimeout(60000);
  await page.goto(`/${locale}/workspace/inventory/new`);await page.getByRole('button',{name:localized(/Start with full editor|البدء بالمحرر الكامل/)}).click();await expect(page).toHaveURL(/DEMO-.*\/edit$/);await page.goto(`${page.url()}?advanced=1`);const id=page.url().split('/').at(-2)!;
  const title='=SUM(1,2) "Courtyard" <&>';await page.getByRole('textbox',{name:localized("Title — English",true),exact:true}).fill(title);await page.getByRole('textbox',{name:localized('العنوان بالعربية',true),exact:true}).fill('عقار الفناء 🏡');await page.getByRole('spinbutton',{name:localized("Price (QAR)",true),exact:true}).fill('9750');await page.getByRole('button',{name:localized(save)}).click();
  await page.goto(`/${locale}/workspace/hub/feeds?property=${id}`);await expect(page.getByRole('combobox',{name:localized("Canonical property",true),exact:true})).toHaveValue(id);const payload=page.getByLabel(localized("Generated example payload"));await expect(payload).toContainText(localized('&lt;&amp;&gt;'));await expect(payload).toContainText(localized('عقار الفناء 🏡'));await expect(page.getByRole('region',{name:localized("Mapped property fields")})).toContainText(localized('Required example value missing or invalid'));
  const xml=await payload.innerText();expect(await page.evaluate(xml=>new DOMParser().parseFromString(xml,'application/xml').querySelector('parsererror')?.textContent??null,xml)).toBeNull();
  await page.getByRole('combobox',{name:localized("Preview format")}).selectOption('json');const data=JSON.parse(await payload.innerText());expect(data.property.property_finder_example_title_en).toBe(title);expect(data.property.property_finder_example_price_qar).toBe(9750);expect(data.property_revision).toBe(2);expect(data.remote_sent).toBe(false);
  const downloadPromise=page.waitForEvent('download');await page.getByRole('button',{name:localized(/Download example|تنزيل المثال/)}).click();const download=await downloadPromise;expect(download.suggestedFilename()).toContain(`${id}-r2-property-finder.json`);expect(JSON.parse(await readFile((await download.path())!,'utf8')).property_revision).toBe(2);
  await page.getByRole('combobox',{name:localized("Preview format")}).selectOption('csv');await expect(payload).toContainText(localized('"\'=SUM(1,2) ""Courtyard"" <&>"'));await capture(page,`${info.project.name}-${locale}-feed`);
  await page.goto(`/${locale}/workspace/inventory/${id}/edit?advanced=1`);await page.getByRole('spinbutton',{name:localized("Price (QAR)",true),exact:true}).fill('10250');await page.getByRole('button',{name:localized(save)}).click();await page.goto(`/${locale}/workspace/hub/feeds?property=${id}&destination=qatar-living`);await page.getByRole('combobox',{name:localized("Preview format")}).selectOption('json');const revised=JSON.parse(await payload.innerText());expect(revised.property.qatar_living_example_price_qar).toBe(10250);expect(revised.property_revision).toBe(3);
 });
 test(`connector smoke ${locale}: blocked retry revalidates, correction queues, cancellation and filters persist`,async({page},info)=>{
  test.setTimeout(90000);
  await prepare(page,locale);await publish(page,locale);let s=await snapshot(page);expect(s.jobs.find(j=>j.destination==='property-finder')!.status).toBe('queued-demo');expect(s.jobs.find(j=>j.destination==='qatar-living')!.status).toBe('blocked-demo');
  await page.goto(`/${locale}/workspace/hub/jobs`);await page.getByRole('combobox',{name:localized("Filter jobs by destination")}).selectOption('qatar-living');await expect(page.locator('tbody tr')).toHaveCount(1);await page.getByRole('button',{name:localized(/Inspect Qatar Living job/)}).click();const inspector=page.getByRole('region',{name:localized("Local job inspector")});await expect(inspector).toContainText(localized('Demo connector setup missing'));await inspector.getByRole('checkbox').check();await inspector.getByRole('button',{name:localized(/Retry local simulation|إعادة المحاولة محلياً/)}).click();s=await snapshot(page);let job=s.jobs.find(j=>j.destination==='qatar-living')!;expect(job.status).toBe('blocked-demo');expect(job.attempts).toHaveLength(2);await expect(inspector.getByRole('status')).toContainText(localized('validation was rerun'));
  await prepare(page,locale,'qatar-living');await page.goto(`/${locale}/workspace/hub/jobs?destination=qatar-living`);await page.getByRole('button',{name:localized(/Inspect Qatar Living job/)}).click();await inspector.getByRole('checkbox').check();await inspector.getByRole('button',{name:localized(/Retry local simulation|إعادة المحاولة محلياً/)}).click();s=await snapshot(page);job=s.jobs.find(j=>j.destination==='qatar-living')!;expect(job.status).toBe('queued-demo');expect(job.attempts).toHaveLength(3);expect(s.properties[job.listingId].publications.every(r=>r.externalReference===null)).toBe(true);await capture(page,`${info.project.name}-${locale}-job-inspector`);
  await inspector.getByRole('button',{name:localized(/Cancel local job|إلغاء محلي/)}).click();await expect(inspector.getByRole('status')).toContainText(localized('cancelled'));await page.reload();await page.getByRole('combobox',{name:localized("Filter jobs by status")}).selectOption('cancelled-demo');await expect(page.locator('tbody tr')).toHaveCount(1);await page.getByRole('button',{name:localized(/Inspect Qatar Living job/)}).click();await expect(inspector).toContainText(localized('cancel · Cancelled locally'));
  await page.getByLabel(localized("Jobs from date")).fill('2099-01-01');await expect(page.locator('tbody tr')).toHaveCount(0);await page.getByRole('button',{name:localized(/Clear filters|مسح المرشحات/)}).click();await expect(page.locator('tbody tr')).toHaveCount(2);await page.getByRole('combobox',{name:localized("Filter jobs by property")}).selectOption('AQ-10231');await expect(page.locator('tbody tr')).toHaveCount(0);
 });
 test(`connector ${locale}: property revision invalidates workbench and retry approval across tabs`,async({page,context})=>{
  test.setTimeout(60000);await prepare(page,locale);const next=ar?'متابعة':'Continue';await page.goto(`/${locale}/workspace/publish?advanced=1`);await page.getByRole('button',{name:localized(next,true),exact:true}).click();await page.getByRole('button',{name:localized(next,true),exact:true}).click();await page.getByRole('checkbox').check();
  const editor=await context.newPage();await editor.goto(`/${locale}/workspace/inventory/AQ-10233/edit?advanced=1`);await editor.getByRole('spinbutton',{name:localized("Price (QAR)",true),exact:true}).fill('12345');await editor.getByRole('button',{name:localized(save)}).click();await expect(page.getByRole('checkbox')).not.toBeChecked();await expect(page.getByRole('button',{name:localized(next,true),exact:true})).toBeDisabled();await page.getByRole('checkbox').check();await page.getByRole('button',{name:localized(next,true),exact:true}).click();await page.getByRole('button',{name:localized(ar?'محاكاة النشر':'Simulate publishing',true),exact:true}).click();
  await page.goto(`/${locale}/workspace/hub/jobs`);await page.getByRole('button',{name:localized(/Inspect Property Finder job/)}).click();const inspector=page.getByRole('region',{name:localized("Local job inspector")});await inspector.getByRole('checkbox').check();await editor.reload();await editor.getByRole('spinbutton',{name:localized("Price (QAR)",true),exact:true}).fill('23456');await editor.getByRole('button',{name:localized(save)}).click();await expect(inspector.getByRole('checkbox')).not.toBeChecked();await expect(inspector.getByRole('button',{name:localized(/Retry local simulation|إعادة المحاولة محلياً/)})).toBeDisabled();await expect(page.locator('tbody tr').first()).toContainText(localized("Revision changed / revalidation required"));await editor.close();
 });
 test(`connector ${locale}: responsive sections and keyboard controls at required widths`,async({page},info)=>{
  test.setTimeout(90000);
  const widths=info.project.name==='chromium'?[1440,1024,768]:[375];
  for(const width of widths){await page.setViewportSize({width,height:1000});for(const [name,path] of [['directory','hub/marketplace'],['provider','hub/connectors/property-finder'],['feed','hub/feeds'],['history','hub/jobs'],['workbench','publish']] as const){await page.goto(`/${locale}/workspace/${path}`);await expect(page.getByRole('heading',{level:1})).toBeVisible();await capture(page,`${locale}-${width}-${name}`);}}
  await page.goto(`/${locale}/workspace/hub/feeds`);const format=page.getByRole('combobox',{name:localized("Preview format")});await format.focus();await page.keyboard.press('j');await page.keyboard.press('Enter');await expect(format).toBeFocused();await page.getByRole('button',{name:localized("Copy sample")}).focus();await expect(page.getByRole('button',{name:localized("Copy sample")})).toBeFocused();
 });
}

test('corrupt connector state recovers valid properties and excludes malformed job attempts',async({page})=>{
 await prepare(page,'en');await publish(page);await page.evaluate(key=>{const s=JSON.parse(localStorage.getItem(key)!);s.jobs[0].attempts=[{status:'accepted'}];localStorage.setItem(key,JSON.stringify(s));},key);await page.reload();await expect(page.getByRole('status')).toContainText(localized('invalid local records'));const s=await snapshot(page);expect(Object.keys(s.properties)).toHaveLength(6);await page.goto('/en/workspace/hub/jobs');await expect(page.locator('tbody tr')).toHaveCount(1);
 await page.evaluate(key=>localStorage.setItem(key,'{broken'),key);await page.reload();await expect(page.getByRole('status')).toContainText(localized('damaged'));await expect(page.getByRole('heading',{level:1})).toHaveText(localized('Publishing activity',true));
});

for(const locale of ['en','ar'])test(`connector ${locale}: correcting canonical data lets a blocked job retry at the current revision`,async({page})=>{
 test.setTimeout(60000);await prepare(page,locale);await page.goto(`/${locale}/workspace/inventory/AQ-10233/edit?advanced=1`);await page.getByRole('textbox',{name:localized("Permit / license",true),exact:true}).fill('');await page.getByRole('button',{name:localized(save)}).click();await publish(page,locale);
 await page.goto(`/${locale}/workspace/hub/jobs?destination=property-finder`);await page.getByRole('button',{name:localized(/Inspect Property Finder job/)}).click();const inspector=page.getByRole('region',{name:localized("Local job inspector")});await expect(inspector).toContainText(localized('Verified permit and advertiser approval'));await inspector.getByRole('checkbox').check();await inspector.getByRole('button',{name:localized(/Retry local simulation|إعادة المحاولة محلياً/)}).click();expect((await snapshot(page)).jobs.find(j=>j.destination==='property-finder')!.status).toBe('blocked-demo');
 await page.goto(`/${locale}/workspace/inventory/AQ-10233/edit?advanced=1`);await page.getByRole('textbox',{name:localized("Permit / license",true),exact:true}).fill('DEMO-CORRECTED');await page.getByRole('checkbox',{name:localized(/I reviewed the property facts|راجعت حقائق العقار/)}).check();await page.getByRole('button',{name:localized(save)}).click();await page.goto(`/${locale}/workspace/hub/jobs?destination=property-finder`);await expect(page.locator('tbody tr')).toContainText(localized("Revision changed / revalidation required"));await page.getByRole('button',{name:localized(/Inspect Property Finder job/)}).click();await inspector.getByRole('checkbox').check();await inspector.getByRole('button',{name:localized(/Retry local simulation|إعادة المحاولة محلياً/)}).click();const s=await snapshot(page);const job=s.jobs.find(j=>j.destination==='property-finder')!;expect(job.status).toBe('queued-demo');expect(job.propertyRevision).toBe(s.properties['AQ-10233'].revision);expect(job.attempts.map(a=>a.status)).toEqual(['blocked-demo','blocked-demo','queued-demo']);expect(job.attempts[0].missing).toContain('Verified permit and advertiser approval');
});
