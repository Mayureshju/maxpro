import {localized} from './fixtures';
import {resolve} from 'node:path';
import type {Page} from '@playwright/test';
import type {DemoState} from '../../src/components/gemini/demo-provider';
import {test,expect} from './fixtures';
test.use({actionTimeout:12_000});
const storeKey='maxpro-gemini-v3-demo-state';
const saveName=/Save browser-local draft|حفظ المسودة محلياً/;
async function snapshot(page:Page):Promise<DemoState>{return page.evaluate(key=>JSON.parse(localStorage.getItem(key)!),storeKey);}
async function create(page:Page,locale='en'){
 await page.goto(`/${locale}/workspace/inventory/new`);
 await page.getByRole('button',{name:localized(/Start with full editor|البدء بالمحرر الكامل/)}).focus();
 await page.keyboard.press('Enter');
 await expect(page).toHaveURL(/\/inventory\/DEMO-[a-f0-9-]+\/edit$/);
 const id=page.url().split('/').at(-2)!;await page.goto(`${page.url()}?advanced=1`);return id;
}
async function prepare(page:Page,locale='en'){
 for(const destination of ['property-finder','qatar-living']){
  await page.goto(`/${locale}/workspace/hub/connectors/${destination}`);
  await page.getByRole('checkbox').check();
  await page.getByRole('button',{name:localized(/Prepare demo connector/)}).click();
 }
}
async function fillFacts(page:Page){
 for(const [label,value] of [['Title — English','Lifecycle courtyard residence'],['العنوان بالعربية','مسكن الفناء التجريبي'],['City','Doha'],['District / zone','Demo district'],['Latitude','25.3'],['Longitude','51.5'],['Permit / license','DEMO-PERMIT']])await page.getByRole('textbox',{name:localized(label,true),exact:true}).fill(value);
 for(const [label,value] of [['Price (QAR)','8500'],['Area (m²)','150'],['Bedrooms','2'],['Bathrooms','3']])await page.getByRole('spinbutton',{name:localized(label,true),exact:true}).fill(value);
 await page.getByRole('checkbox',{name:localized(/Advertiser \/ owner/)}).check();
 await page.getByRole('button',{name:localized(saveName)}).click();
}
async function capture(page:Page,name:string){
 await page.evaluate(()=>{window.scrollTo({top:0,left:0,behavior:'instant'});return document.fonts.ready;});
 await page.screenshot({path:resolve(`../../${globalThis.process.env.MAXPRO_EVIDENCE_ROOT??'artifacts/phase6'}/regression/phase1/screenshots/${name}.png`),fullPage:true,scale:'css'});
 expect(await page.evaluate(()=>document.documentElement.scrollWidth)).toBeLessThanOrEqual(page.viewportSize()!.width+1);
}
for(const locale of ['en','ar']){
 test(`lifecycle ${locale} create, resume, review, media and per-destination history`,async({page},info)=>{
  test.setTimeout(90_000);
  const ar=locale==='ar';const prefix=`${info.project.name}-${locale}`;const next=ar?'متابعة':'Continue';
  await page.goto(`/${locale}/workspace/inventory/new`);await capture(page,`${prefix}-create`);
  const id=await create(page,locale);
  await expect(page.getByRole('textbox',{name:localized("Title — English",true),exact:true})).toHaveValue('');
  await page.getByRole('textbox',{name:localized("Title — English",true),exact:true}).fill('Lifecycle courtyard residence');
  await page.getByRole('button',{name:localized(saveName)}).click();
  await page.reload();
  await expect(page.getByRole('textbox',{name:localized("Title — English",true),exact:true})).toHaveValue('Lifecycle courtyard residence');
  await expect(page.getByRole('spinbutton',{name:localized("Price (QAR)",true),exact:true})).toHaveValue('0');
  expect((await snapshot(page)).properties[id].revision).toBe(2);
  await fillFacts(page);
  await capture(page,`${prefix}-editor`);
  if(info.project.name==='chromium'){
   for(const width of [1024,768]){await page.setViewportSize({width,height:1000});await capture(page,`${prefix}-${width}-editor`);}
   await page.setViewportSize({width:1440,height:1000});
  }
  await page.goto(`/${locale}/workspace/inventory`);
  await page.getByRole('searchbox',{name:localized("Search properties")}).fill(id);
  await page.getByRole('combobox',{name:localized("Filter listing status")}).selectOption('Draft');
  await expect(page.locator('tbody tr')).toHaveCount(1);
  await capture(page,`${prefix}-inventory`);
  await page.locator('tbody tr .fx-inventory-record').click();
  await expect(page).toHaveURL(`/${locale}/workspace/inventory/${id}`);
  await expect(page.getByRole('heading',{level:1})).toHaveText(ar?'مسكن الفناء التجريبي':'Lifecycle courtyard residence');await page.getByRole('tab',{name:locale==='ar'?'تفاصيل الإعلان':'Listing details',exact:true}).click();await expect(page.getByRole('link',{name:localized(/Organize media|تنظيم الوسائط/)})).toBeVisible();await capture(page,`${prefix}-property-record`);
  await page.goto(`/${locale}/workspace/inventory/${id}/media`);
  await page.getByRole('button',{name:localized(/Add fictional sample assets|إضافة وسائط خيالية/)}).click();
  const down=page.getByRole('button',{name:localized('Move Sample hero photo down')});await down.focus();await page.keyboard.press('Enter');
  await expect(page.locator('.gm-media-card').first()).toContainText(localized('Sample bedroom'));
  await page.getByRole('checkbox',{name:localized('Available for local simulation: Sample floor plan metadata',true),exact:true}).uncheck();
  await page.reload();
  await expect(page.locator('.gm-media-card').first()).toContainText(localized('Sample bedroom'));
  await expect(page.getByRole('checkbox',{name:localized('Available for local simulation: Sample floor plan metadata',true),exact:true})).not.toBeChecked();
  await capture(page,`${prefix}-media`);
  if(info.project.name==='chromium'){
   await page.setViewportSize({width:768,height:1000});await capture(page,`${prefix}-768-media`);await page.setViewportSize({width:1440,height:1000});
  }
  await page.goto(`/${locale}/workspace/studio?property=${id}`);
  await page.getByRole('textbox',{name:localized(/Property source notes|ملاحظات المصدر/)}).fill('Fictional operator supplied these facts. No extraction should run.');
  await page.getByRole('button',{name:localized(/Review supplied facts|مراجعة الحقائق المقدمة/)}).click();
  await expect(page.getByRole('textbox',{name:localized("Title — English",true),exact:true})).toHaveValue('Lifecycle courtyard residence');await capture(page,`${prefix}-studio-facts`);
  await page.getByRole('button',{name:localized(next,true),exact:true}).click();
  await expect(page.locator('.gm-media-card')).toHaveCount(4);
  await page.getByRole('button',{name:localized(next,true),exact:true}).click();
  await page.getByRole('textbox',{name:localized("ENGLISH DESCRIPTION",true),exact:true}).fill('Fictional two bedroom residence. Asking QAR 8,500 monthly. Facts supplied by the demo operator.');
  await page.getByRole('textbox',{name:localized('الوصف بالعربية',true),exact:true}).fill('مسكن تجريبي بغرفتي نوم، بسعر توضيحي ٨٥٠٠ ريال شهرياً.');
  await page.getByRole('button',{name:localized(/Save progress|حفظ التقدم/)}).click();
  const proposed=(await snapshot(page)).properties[id];
  expect(proposed.facts.descriptionEn).toBe('');expect(proposed.proposal.descriptionEn).toContain('Fictional two bedroom');expect(proposed.source.copyReviewed).toBe(false);
  await page.reload();
  await expect(page.getByRole('textbox',{name:localized("ENGLISH DESCRIPTION",true),exact:true})).toHaveValue(/Fictional two bedroom/);
  await capture(page,`${prefix}-studio-copy`);
  await page.getByRole('button',{name:localized(next,true),exact:true}).click();
  const approveButton=page.getByRole('button',{name:localized(/Continue to publishing handoff|الموافقة والانتقال للنشر/)});
  await expect(approveButton).toBeDisabled();await capture(page,`${prefix}-studio-approval`);
  await page.getByRole('checkbox').check();await approveButton.click();
  const reviewed=(await snapshot(page)).properties[id];expect(reviewed.status).toBe('reviewed');expect(reviewed.facts.descriptionEn).toContain('Fictional two bedroom');expect(reviewed.source.factsReviewed).toBe(true);
  await expect(page.getByRole('link',{name:localized(/Go to publishing workbench|الذهاب إلى مساحة النشر/)})).toHaveAttribute('href',`/${locale}/workspace/publish?property=${id}`);
  await prepare(page,locale);
  await page.goto(`/${locale}/workspace/publish?advanced=1&property=${id}`);
  await expect(page.locator('.gm-property-picker .chosen')).toContainText(id);
  await page.getByRole('button',{name:localized(next,true),exact:true}).click();await capture(page,`${prefix}-destinations`);await page.getByRole('button',{name:localized(next,true),exact:true}).click();
  await expect(page.getByText(localized('Floor plan (example destination rule)',true),{exact:true})).toBeVisible();
  await expect(page.locator('.gm-validation-head').last()).toContainText(ar?'جاهز':'Ready');
  await capture(page,`${prefix}-preflight`);
  if(info.project.name==='chromium'){
   for(const width of [1024,768]){await page.setViewportSize({width,height:1000});await capture(page,`${prefix}-${width}-preflight`);}
   await page.setViewportSize({width:1440,height:1000});
  }
  await page.getByRole('checkbox').check();await page.getByRole('button',{name:localized(next,true),exact:true}).click();
  await page.getByRole('button',{name:localized(ar?'محاكاة النشر':'Simulate publishing',true),exact:true}).click();
  await expect(page.getByRole('link',{name:localized(ar?'سجل النشر':'Open publishing history',true),exact:true})).toBeVisible();await capture(page,`${prefix}-dispatch`);
  let saved=await snapshot(page);expect(saved.jobs).toHaveLength(2);expect(saved.jobs.find(j=>j.destination==='qatar-living')?.status).toBe('queued-demo');expect(saved.jobs.find(j=>j.destination==='property-finder')?.status).toBe('blocked-demo');expect(saved.properties[id].publications).toHaveLength(2);
  for(const job of saved.jobs){expect(job.listingId).toBe(id);expect(job.propertyRevision).toBe(reviewed.revision);}
  await page.goto(`/${locale}/workspace/inventory/${id}/publishing`);await page.reload();
  await expect(page.getByText(localized("Queued locally",true),{exact:true})).toHaveCount(1);await expect(page.getByText(localized("Blocked locally",true),{exact:true})).toHaveCount(1);
  await capture(page,`${prefix}-property-history`);
  await page.goto(`/${locale}/workspace/hub/jobs`);await page.getByRole('textbox',{name:localized("Search publishing activity")}).fill(id);await expect(page.locator('tbody tr')).toHaveCount(2);await capture(page,`${prefix}-job-history`);
  saved=await snapshot(page);expect(saved.properties[id].history.length).toBeGreaterThan(6);expect(saved.properties[id].publications.every(r=>r.externalReference===null)).toBe(true);
 });
 test(`lifecycle ${locale} invalid IDs never fall back to a sample`,async({page})=>{
  test.setTimeout(60000);
  for(const id of ['does-not-exist','toString'])for(const route of [`inventory/${id}`,`inventory/${id}/edit`,`inventory/${id}/media`,`inventory/${id}/publishing`,`inventory/${id}/enquiries`,`studio?property=${id}`,`publish?property=${id}`]){
   await page.goto(`/${locale}/workspace/${route}`);await expect(page.getByRole('heading',{level:1})).toHaveText(locale==='ar'?'العقار غير موجود':'Property not found');await expect(page.locator('main')).not.toContainText(localized('Marina-facing apartment'));
  }
 });
}

test('arbitrary Studio input and document selection never fabricate extracted property facts',async({page})=>{
 await page.goto('/en/workspace/studio');await page.getByRole('textbox',{name:localized('Property source notes')}).fill('A fictional note with no price or room count.');await page.getByRole('button',{name:localized('Review supplied facts')}).click();
 await expect(page.getByRole('textbox',{name:localized("Title — English",true),exact:true})).toHaveValue('');await expect(page.getByRole('spinbutton',{name:localized("Price (QAR)",true),exact:true})).toHaveValue('0');
 const state=await snapshot(page);const draft=Object.values(state.properties).find(p=>p.id.startsWith('DEMO-'))!;expect(draft.source.notes).toContain('fictional note');expect(draft.source.factsReviewed).toBe(false);
 await page.goto('/en/workspace/studio');await page.getByRole('button',{name:localized('Add a document')}).click();await page.locator('input[type=file]').setInputFiles({name:'fictional.pdf',mimeType:'application/pdf',buffer:Buffer.from('demo only')});
 await expect(page.getByText(/No extraction results are available/)).toBeVisible();await page.getByRole('button',{name:localized('Review supplied facts')}).click();await expect(page.getByRole('textbox',{name:localized("Permit / license",true),exact:true})).toHaveValue('');
});

test('file metadata persists without binary or blob URLs and changes actual media checks',async({page})=>{
 const id=await create(page);await page.goto(`/en/workspace/inventory/${id}/media`);
 await page.getByLabel(localized("Select local media files")).setInputFiles({name:'fictional.png',mimeType:'image/png',buffer:Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jzQAAAABJRU5ErkJggg==','base64')});
 await page.getByRole('combobox',{name:localized('Room category for fictional.png')}).selectOption('Kitchen');
 const saved=await snapshot(page);const serialized=JSON.stringify(saved);expect(serialized).not.toContain('blob:');expect(serialized).not.toContain('data:image');expect(saved.properties[id].media[0].availability).toBe('metadata-only');
 await page.reload();await expect(page.getByRole('combobox',{name:localized('Room category for fictional.png')})).toHaveValue('Kitchen');await expect(page.getByRole('checkbox',{name:localized('Available for local simulation: fictional.png',true),exact:true})).toBeDisabled();
 await expect(page.getByText(localized('File not retained · select again to preview'))).toBeVisible();
 await page.goto(`/en/workspace/publish?advanced=1&property=${id}`);await page.getByRole('button',{name:localized('Continue',true),exact:true}).click();await page.getByRole('button',{name:localized('Continue',true),exact:true}).click();await expect(page.getByText(localized('At least three categorized media assets (demo policy)',true),{exact:true})).toHaveCount(2);
});

test('fact edits invalidate review while media changes alter preflight and preserve revisions',async({page})=>{
 await page.goto('/en/workspace/inventory/AQ-10233/edit?advanced=1');await page.getByRole('spinbutton',{name:localized("Price (QAR)",true),exact:true}).fill('2900000');await expect(page.getByRole('checkbox',{name:localized(/I reviewed the property facts/)})).not.toBeChecked();await page.getByRole('button',{name:localized(saveName)}).click();
 let state=await snapshot(page);expect(state.properties['AQ-10233'].revision).toBe(2);expect(state.properties['AQ-10233'].source.factsReviewed).toBe(false);
 await page.getByRole('checkbox',{name:localized(/I reviewed the property facts/)}).check();await page.getByRole('button',{name:localized(saveName)}).click();
 await page.goto('/en/workspace/inventory/AQ-10233/media');await page.getByRole('combobox',{name:localized('Room category for Sample hero photo')}).selectOption('Other');await page.reload();
 await expect(page.getByRole('combobox',{name:localized('Room category for Sample hero photo')})).toHaveValue('Other');state=await snapshot(page);expect(state.properties['AQ-10233'].revision).toBe(4);expect(state.properties['AQ-10233'].source.factsReviewed).toBe(true);
 await page.goto('/en/workspace/publish?advanced=1');await page.getByRole('button',{name:localized('Continue',true),exact:true}).click();await page.getByRole('button',{name:localized('Continue',true),exact:true}).click();await expect(page.getByText(localized('At least three categorized media assets (demo policy)',true),{exact:true})).toHaveCount(2);
});

for(const [plan,limit] of [['starter',3],['pro',25]] as const){
 test(`${plan} enforces ${limit} listing reservations and preserves drafts over quota`,async({page})=>{
  const id=await create(page);await page.goto('/en/workspace/billing');await page.getByRole('button',{name:localized(new RegExp(plan==='starter'?'Starter':'^Pro'))}).click();
  await page.evaluate(({key,limit})=>{
   const state=JSON.parse(localStorage.getItem(key)!);state.preparedConnectors=['property-finder'];const template=state.properties['AQ-10233'];
   for(let i=0;i<limit;i++){const id=`DEMO-${crypto.randomUUID()}`;state.properties[id]={...template,id};state.jobs.push({id:`FIXTURE-${i}`,listingId:id,organizationId:template.organizationId,propertyRevision:template.revision,destination:'property-finder',status:'queued-demo',missing:[],at:new Date().toISOString()});}
   localStorage.setItem(key,JSON.stringify(state));
  },{key:storeKey,limit});
  await page.goto(`/en/workspace/publish?advanced=1&property=${id}`);await page.getByRole('button',{name:localized('Continue',true),exact:true}).click();await page.locator('.gm-destinations label').filter({hasText:'Qatar Living'}).getByRole('checkbox').uncheck();
  await expect(page.locator('main').getByRole('alert')).toContainText(`includes ${limit} queued properties`);await expect(page.getByRole('button',{name:localized('Continue',true),exact:true})).toBeDisabled();
  await page.goto(`/en/workspace/inventory/${id}/edit?advanced=1`);await page.getByRole('textbox',{name:localized("Title — English",true),exact:true}).fill('Draft beyond queue quota');await page.getByRole('button',{name:localized(saveName)}).click();await page.reload();await expect(page.getByRole('textbox',{name:localized("Title — English",true),exact:true})).toHaveValue('Draft beyond queue quota');
  const state=await snapshot(page);expect(state.jobs).toHaveLength(limit);expect(Object.keys(state.properties).length).toBe(limit+7);
 });
}

test('Pro portal quota and Starter Meta entitlement are separate from draft saving',async({page})=>{
 await page.goto('/en/workspace/billing');await page.getByRole('button',{name:localized(/^Pro/)}).click();await page.goto('/en/workspace/publish?advanced=1');await page.getByRole('button',{name:localized('Continue',true),exact:true}).click();await page.locator('.gm-destinations label').filter({hasText:'Bayut / Dubizzle'}).getByRole('checkbox').check();await expect(page.locator('main').getByRole('alert')).toContainText(localized('includes 2 destination(s)'));await expect(page.getByRole('button',{name:localized('Continue',true),exact:true})).toBeDisabled();
 await page.goto('/en/workspace/billing');await page.getByRole('button',{name:localized(/Starter/)}).click();await page.goto('/en/workspace/publish?advanced=1');await page.getByRole('button',{name:localized('Continue',true),exact:true}).click();for(const name of ['Property Finder','Qatar Living'])await page.locator('.gm-destinations label').filter({hasText:name}).getByRole('checkbox').uncheck();await page.locator('.gm-destinations label').filter({hasText:'Meta property catalogue'}).getByRole('checkbox').check();await expect(page.locator('main').getByRole('alert')).toContainText(localized('Starter does not include'));
});

test('corrupt canonical records are excluded while valid drafts and legacy edits recover',async({page})=>{
 await create(page);await page.getByRole('textbox',{name:localized("Title — English",true),exact:true}).fill('Recoverable draft');await page.getByRole('button',{name:localized(saveName)}).click();
 await page.evaluate(key=>{const s=JSON.parse(localStorage.getItem(key)!);s.properties['AQ-10233'].facts.priceQar='invalid';s.properties['AQ-10231'].media[0].sampleKey='data:image/png;base64,secrets';s.jobs=[{destination:'untrusted'}];localStorage.setItem(key,JSON.stringify(s));},storeKey);
 await page.reload();await expect(page.getByRole('textbox',{name:localized("Title — English",true),exact:true})).toHaveValue('Recoverable draft');await expect(page.getByRole('status')).toContainText(localized('invalid local records'));
 await page.goto('/en/workspace/inventory/AQ-10233');await expect(page.getByRole('heading',{level:1})).toHaveText(localized('Property not found',true));
});

test('changing a record in another tab rejects stale editor saves and resets publishing approval',async({page,context})=>{
 await page.goto('/en/workspace/inventory/AQ-10233/edit?advanced=1');const other=await context.newPage();await other.goto('/en/workspace/inventory/AQ-10233/edit?advanced=1');
 await page.getByRole('textbox',{name:localized("Title — English",true),exact:true}).fill('First operator change');await page.getByRole('button',{name:localized(saveName)}).click();
 await other.getByRole('textbox',{name:localized("Title — English",true),exact:true}).fill('Stale operator change');await other.getByRole('button',{name:localized(saveName)}).click();await expect(other.locator('main').getByRole('alert')).toContainText(localized('record changed'));await other.close();
 await page.goto('/en/workspace/publish?advanced=1');for(let i=0;i<2;i++)await page.getByRole('button',{name:localized('Continue',true),exact:true}).click();await page.getByRole('checkbox').check();await page.getByRole('button',{name:localized('Continue',true),exact:true}).click();
 const billing=await context.newPage();await billing.goto('/en/workspace/billing');await billing.getByRole('button',{name:localized(/Starter/)}).click();await expect(page.getByRole('button',{name:localized('Simulate publishing',true),exact:true})).toBeDisabled();expect((await snapshot(page)).jobs).toHaveLength(0);await billing.close();
});

test('Studio creates a stable route and resumes saved source and proposed copy after reload',async({page})=>{
 await page.goto('/en/workspace/studio');await page.getByRole('textbox',{name:localized('Property source notes')}).fill('Fictional notes saved before factual review.');await page.getByRole('button',{name:localized('Save progress',true),exact:true}).click();await expect(page).toHaveURL(/studio\?property=DEMO-/);const route=page.url();await page.reload();await expect(page).toHaveURL(route);await expect(page.getByRole('textbox',{name:localized('Property source notes')})).toHaveValue('Fictional notes saved before factual review.');
});

test('valid Phase 0 edits migrate into canonical revisions without losing source identity',async({page})=>{
 await page.goto('/en/workspace/inventory/AQ-10233/edit?advanced=1');await page.getByRole('button',{name:localized(saveName)}).click();const current=await snapshot(page);const facts=current.properties['AQ-10233'].facts;facts.titleEn='Migrated Phase 0 property';
 await page.evaluate(({key,facts})=>localStorage.setItem(key,JSON.stringify({plan:'pro',propertyEdits:{'AQ-10233':facts},jobs:[],preparedConnectors:['qatar-living']})),{key:storeKey,facts});
 await page.reload();await expect(page.getByRole('textbox',{name:localized("Title — English",true),exact:true})).toHaveValue('Migrated Phase 0 property');await page.getByRole('button',{name:localized(saveName)}).click();const migrated=await snapshot(page);expect(migrated.schemaVersion).toBe(1);expect(migrated.properties['AQ-10233'].history.some(e=>e.action==='Phase 0 draft migrated')).toBe(true);expect(migrated.properties['AQ-10233'].source.factsReviewed).toBe(false);expect(migrated.plan).toBe('pro');
});

test('Studio refuses to overwrite facts changed by another tab',async({page,context})=>{
 await page.goto('/en/workspace/studio?property=AQ-10233');const editor=await context.newPage();await editor.goto('/en/workspace/inventory/AQ-10233/edit?advanced=1');await editor.getByRole('textbox',{name:localized("Title — English",true),exact:true}).fill('New canonical source title');await editor.getByRole('button',{name:localized(saveName)}).click();await page.getByRole('button',{name:localized('Save progress',true),exact:true}).click();await expect(page.getByRole('status')).toContainText(localized('content changed in another view'));expect((await snapshot(page)).properties['AQ-10233'].facts.titleEn).toBe('New canonical source title');await editor.close();
});

test('portal quota includes destinations already reserved on other properties',async({page})=>{
 await page.goto('/en/workspace/billing');await page.getByRole('button',{name:localized(/Starter/)}).click();await page.evaluate(key=>{const s=JSON.parse(localStorage.getItem(key)!);s.jobs=[{id:'EXISTING-QL-RESERVATION',listingId:'AQ-10231',organizationId:s.properties['AQ-10231'].organizationId,propertyRevision:1,destination:'qatar-living',status:'queued-demo',missing:[],at:new Date().toISOString()}];localStorage.setItem(key,JSON.stringify(s));},storeKey);
 await page.goto('/en/workspace/publish?advanced=1');await page.getByRole('button',{name:localized('Continue',true),exact:true}).click();await page.locator('.gm-destinations label').filter({hasText:'Qatar Living'}).getByRole('checkbox').uncheck();await expect(page.locator('main').getByRole('alert')).toContainText(localized('includes 1 destination(s)'));await expect(page.getByRole('button',{name:localized('Continue',true),exact:true})).toBeDisabled();
});
