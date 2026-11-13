import {localized} from './fixtures';
import {readdirSync} from 'node:fs';
import {resolve} from 'node:path';
import {test,expect} from './fixtures';

const localeRoot=resolve('src/app/[locale]');
const routes=readdirSync(localeRoot,{recursive:true}).map(String).filter(file=>file.endsWith('page.tsx')).map(file=>{
 const route='/'+file.replace(/\/?page\.tsx$/,'');
 const id=route.startsWith('/workspace/leads/')?'LE-2101':route.startsWith('/workspace/billing/')?'INV-2026-0419':route.startsWith('/workspace/hub/connectors/')?'property-finder':route.startsWith('/agencies/')?'pearl-gate-realty':'AQ-10231';
 return route.replace('[id]',id).replace(/\/$/,'');
});
const workflows=[
 ['dashboard','/workspace'],['studio','/workspace/studio'],['editor','/workspace/inventory/AQ-10233/edit?advanced=1'],['media','/workspace/inventory/AQ-10233/media'],
 ['marketplace','/workspace/hub/marketplace'],['provider','/workspace/hub/connectors/property-finder'],
 ['publishing','/workspace/publish?advanced=1'],['history','/workspace/hub/jobs'],['leads','/workspace/leads'],
 ['routing','/workspace/leads/assignment'],['billing','/workspace/billing'],['analytics','/workspace/analytics'],['admin','/workspace/admin/connector-health'],
];
for(const locale of ['en','ar']){
 for(const route of routes){
  test(`route ${locale}${route||'/'} responds and renders`,async({page})=>{
   const response=await page.goto(`/${locale}${route}`);
   expect(response?.status()).toBe(200);
   await expect(page.getByRole('heading',{level:1}).first()).toBeVisible();
   await expect(page.locator('html')).toHaveAttribute('lang',locale);
   await expect(page.locator('html')).toHaveAttribute('dir',locale==='ar'?'rtl':'ltr');
  });
 }
 for(const [name,route] of workflows){
  test(`visual ${locale} ${name} fits the viewport`,async({page},testInfo)=>{
   await page.goto(`/${locale}${route}`);
   await expect(page.getByRole('heading',{level:1})).toBeVisible();
   await page.evaluate(()=>document.fonts.ready);
   // These are captures of the actual running Next.js page, not visual substitutes.
   await page.screenshot({path:resolve(`../../${globalThis.process.env.MAXPRO_EVIDENCE_ROOT??'artifacts/phase6'}/regression/phase1/regression-screenshots/${testInfo.project.name}-${locale}-${name}.png`),fullPage:true,scale:'css'});
   const size=await page.evaluate(()=>({content:document.documentElement.scrollWidth,viewport:window.innerWidth}));
   expect(size.content).toBeLessThanOrEqual(size.viewport+1);
  });
 }
 test(`navigation ${locale} follows agency settings to contextual integrations`,async({page},testInfo)=>{
  await page.goto(`/${locale}/workspace`);
  if(testInfo.project.name==='mobile-chromium')await page.getByRole('button',{name:localized('Open navigation')}).click();
  await page.locator(`.prototype-nav a[href="/${locale}/workspace/settings"]`).click();
  await expect(page).toHaveURL(`/${locale}/workspace/settings`);
  await expect(page.locator('.prototype-nav-item.is-current')).toHaveCount(1);
  if(testInfo.project.name==='mobile-chromium')await expect(page.locator('.prototype-sidebar')).not.toHaveClass(/is-open/);
  await page.goto(`/${locale}/workspace/hub/marketplace`);
  await page.getByRole('textbox',{name:localized('Search connectors')}).fill('WhatsApp');
  await expect(page.locator('.gm-market-row')).toHaveCount(1);await page.locator('.gm-market-row').click();
  await expect(page.getByRole('heading',{level:1})).toHaveText(localized('WhatsApp Business',true));await expect(page.locator('.prototype-nav-item.is-current')).toHaveAttribute('href',`/${locale}/workspace/settings`);
 });
 test(`workflow ${locale} canonical edits, blocked and queued local dispatch`,async({page},testInfo)=>{
  test.setTimeout(60000);
  const next=locale==='ar'?'متابعة':'Continue';
  const publish=locale==='ar'?'محاكاة النشر':'Simulate publishing';
  for(const connector of ['property-finder','qatar-living']){
   await page.goto(`/${locale}/workspace/hub/connectors/${connector}`);
   await page.getByRole('checkbox').check();
   await page.getByRole('button',{name:localized(/Prepare demo connector/)}).click();
  }
  await page.goto(`/${locale}/workspace/inventory/AQ-10233/edit?advanced=1`);
  await page.getByRole('textbox',{name:localized("Permit / license")}).fill('');
  await page.getByRole('button',{name:localized(/Save browser-local draft|حفظ المسودة محلياً/)}).click();
  await page.reload();
  await expect(page.getByRole('textbox',{name:localized("Permit / license")})).toHaveValue('');
  await page.goto(`/${locale}/workspace/publish?advanced=1`);
  await page.getByRole('button',{name:localized(next,true),exact:true}).click();
  await page.getByRole('button',{name:localized(next,true),exact:true}).click();
  await expect(page.getByText(localized('Verified permit and advertiser approval')).first()).toBeVisible();
  await page.getByRole('checkbox').check();
  await page.getByRole('button',{name:localized(next,true),exact:true}).click();
  await page.getByRole('button',{name:localized(publish,true),exact:true}).click();
  await page.goto(`/${locale}/workspace/hub/jobs`);
  await expect(page.getByText(localized("Blocked locally",true),{exact:true})).toHaveCount(2);
  await page.goto(`/${locale}/workspace/inventory/AQ-10233/edit?advanced=1`);
  await page.getByRole('textbox',{name:localized("Permit / license")}).fill('DEMO-REVIEWED');
  await page.getByRole('checkbox',{name:localized(/I reviewed the property facts|راجعت حقائق العقار/)}).check();
  await page.getByRole('button',{name:localized(/Save browser-local draft|حفظ المسودة محلياً/)}).click();
  await page.goto(`/${locale}/workspace/publish?advanced=1`);
  await page.getByRole('button',{name:localized(next,true),exact:true}).click();
  await page.getByRole('button',{name:localized(next,true),exact:true}).click();
  await page.getByRole('checkbox').check();
  await page.getByRole('button',{name:localized(next,true),exact:true}).click();
  await page.getByRole('button',{name:localized(publish,true),exact:true}).click();
  await page.goto(`/${locale}/workspace/hub/jobs`);
  await expect(page.getByText(localized("Queued locally",true),{exact:true})).toHaveCount(2);
  await expect(page.getByText(localized("Blocked locally",true),{exact:true})).toHaveCount(2);
  await page.screenshot({path:resolve(`../../${globalThis.process.env.MAXPRO_EVIDENCE_ROOT??'artifacts/phase6'}/regression/phase1/regression-screenshots/${testInfo.project.name}-${locale}-history-with-jobs.png`),fullPage:true,scale:'css'});
  await page.getByRole('textbox',{name:localized("Search publishing activity")}).fill('Property Finder');
  await expect(page.locator('tbody tr')).toHaveCount(2);
 });
 test(`links ${locale} key workflow targets are valid`,async({page,request})=>{
  test.setTimeout(120_000);
  const links=new Set<string>();
  for(const [,route] of workflows){
   await page.goto(`/${locale}${route}`);
   for(const href of await page.locator('a[href]').evaluateAll(nodes=>nodes.map(node=>node.getAttribute('href')!))){
    if(href.startsWith('/'))links.add(href);
    expect(href,'No inert placeholder links').not.toBe('#');
   }
  }
  for(const href of links){
   const response=await request.get(href);
   expect(response.status(),href).toBe(200);
  }
 });
 test(`responsive ${locale} tablet and narrow desktop`,async({page},testInfo)=>{
  test.skip(testInfo.project.name==='mobile-chromium','Covered by the desktop browser at tablet widths.');
  for(const width of [1024,768]){
   await page.setViewportSize({width,height:1000});
   for(const [,route] of workflows){
    await page.goto(`/${locale}${route}`);
    const size=await page.evaluate(()=>({content:document.documentElement.scrollWidth,viewport:window.innerWidth}));
    expect(size.content,`${width}px ${route}`).toBeLessThanOrEqual(size.viewport+1);
   }
  }
 });
}

test('invalid persisted demo data recovers without crashing or accepting unknown providers',async({page})=>{
 await page.addInitScript(()=>localStorage.setItem('maxpro-gemini-v3-demo-state',JSON.stringify({plan:'obsolete',preparedConnectors:['unknown',null,'property-finder'],jobs:[{},null,{destination:'obsolete'}],activeAgents:[null],propertyEdits:{'AQ-10233':{permit:42}}})));
 for(const route of ['/workspace','/workspace/billing','/workspace/publish?advanced=1','/workspace/hub/jobs','/workspace/hub/marketplace','/workspace/inventory/AQ-10233/edit?advanced=1']){
  await page.goto(`/en${route}`);
  await expect(page.getByRole('heading',{level:1})).toBeVisible();
 }
 await expect(page.getByRole('textbox',{name:localized("Permit / license")})).toHaveValue('RE-22984');
});

test('unavailable browser storage still allows local demo interactions',async({page})=>{
 await page.addInitScript(()=>Object.defineProperty(window,'localStorage',{get(){throw new DOMException('Storage disabled','SecurityError');}}));
 await page.goto('/en/workspace/billing');
 await page.getByRole('button',{name:localized(/Starter/)}).click();
 await page.goto('/en/workspace/publish?advanced=1');
 // Full navigations reset in-memory state when storage is disabled; the app still renders safely.
 await expect(page.getByRole('heading',{level:1})).toBeVisible();
});

test('media ordering, classification and watermark remain local',async({page})=>{
 await page.goto('/en/workspace/inventory/AQ-10233/media');
 await page.getByRole('button',{name:localized('Move Sample hero photo down')}).click();
 await expect(page.locator('.gm-media-card').first()).toContainText(localized('Sample bedroom'));
 await page.getByRole('combobox',{name:localized('Room category for Sample hero photo')}).selectOption('Kitchen');
 await page.getByRole('checkbox',{name:localized("Show sample agency watermark")}).check();
 await expect(page.getByText(localized('Pearl Gate Realty · PREVIEW'))).toHaveCount(3);
});

test('lead routing, viewing requests and analytics controls work locally',async({page})=>{
 await page.goto('/en/workspace/leads/assignment');
 await expect(page.getByText(localized('Fatima Noor',true),{exact:true}).last()).toBeVisible();
 await page.getByRole('button',{name:localized(/Simulate another lead/)}).click();
 await expect(page.locator('dd').filter({hasText:'Karim Said'})).toBeVisible();
 await page.goto('/en/workspace/leads/viewings');
 await page.getByLabel(localized("Requested date")).fill('2026-12-01');
 await page.getByRole('button',{name:localized(/Add demo request/)}).click();
 await expect(page.getByText(localized('Requested (local)',true),{exact:true})).toBeVisible();
 await page.getByRole('button',{name:localized("Cancel",true),exact:true}).click();
 await expect(page.getByText(localized('Cancelled (local)',true),{exact:true})).toBeVisible();
 await page.goto('/en/workspace/analytics');
 await page.getByRole('combobox',{name:localized("Source",true),exact:true}).selectOption('Website');
 // Phase 3 derives the selected cohort from shared leads; the former 7/2 values were decorative fixtures.
 await expect(page.locator('tr[data-channel]')).toHaveCount(1);
 await expect(page.getByTestId('lead-total')).toHaveText(localized('2',true));
 await expect(page.locator('.gm-report-lead strong')).toHaveText(localized('0',true));
 await page.getByRole('combobox',{name:localized("Period",true),exact:true}).selectOption('7');
 await expect(page.getByTestId('lead-total')).toHaveText(localized('2',true));
 await expect(page.locator('.gm-report-lead strong')).toHaveText(localized('0',true));
});

test('feed copy handles denied clipboard access without a runtime exception',async({page})=>{
 await page.addInitScript(()=>Object.defineProperty(navigator,'clipboard',{value:{writeText:()=>Promise.reject(new DOMException('Denied','NotAllowedError'))}}));
 await page.goto('/en/workspace/hub/feeds');
 await page.getByRole('button',{name:localized("Copy sample")}).click();
 await expect(page.getByRole('status')).toContainText(localized('Clipboard unavailable'));
});

test('language switch preserves the current workflow and search parameters',async({page})=>{
 await page.goto('/en/workspace/hub/marketplace?source=phase0');
 await page.getByRole('link',{name:localized('Switch to Arabic')}).click();
 await expect(page).toHaveURL('/ar/workspace/hub/marketplace?source=phase0');
 await expect(page.locator('html')).toHaveAttribute('dir','rtl');
 await page.getByRole('link',{name:localized('Switch to English')}).click();
 await expect(page).toHaveURL('/en/workspace/hub/marketplace?source=phase0');
});

test('keyboard can filter the connector directory and enter provider setup',async({page})=>{
 await page.goto('/en/workspace/hub/marketplace');
 await page.getByRole('textbox',{name:localized("Search connectors")}).focus();
 await page.keyboard.type('Property Finder');
 await page.keyboard.press('Tab');
 await expect(page.getByRole('button',{name:localized("All",true),exact:true})).toBeFocused();
 await page.keyboard.press('Enter');
 const provider=page.locator('.gm-market-row');
 await expect(provider).toHaveCount(1);
 await provider.focus();
 await page.keyboard.press('Enter');
 await expect(page.getByRole('heading',{level:1})).toHaveText(localized('Property Finder',true));
 await page.getByRole('checkbox').focus();
 await page.keyboard.press('Space');
 await page.keyboard.press('Tab');
 await expect(page.getByRole('button',{name:localized(/Prepare demo connector/)})).toBeFocused();
 await page.keyboard.press('Enter');
 await expect(page.getByText(localized('Local demo setup recorded'))).toBeVisible();
});

for(const locale of ['en','ar']){
 test(`commercial ${locale} admin examples match Gemini and provider names remain explicit`,async({page})=>{
  await page.goto(`/${locale}/workspace/settings/demo`);await page.getByRole('combobox',{name:localized('Simulated persona',true),exact:true}).selectOption('super-admin');
  await page.goto(`/${locale}/workspace/admin/plans`);
  await expect(page.locator('tbody tr')).toHaveCount(3);
  await expect(page.getByText(localized('QAR 179',true),{exact:true})).toBeVisible();
  await expect(page.getByText(localized('QAR 725',true),{exact:true})).toBeVisible();
  await expect(page.getByText(/^(?:QAR 1,800\+|ر\.ق 1,800\+|\+1,800 ر\.ق)$/,{exact:true})).toBeVisible();
  for(const route of ['admin/integrations','notifications']){
   await page.goto(`/${locale}/workspace/${route}`);
   await expect(page.locator('main')).not.toContainText(/Portal [ABC]/);
  }
 });
}

for(const locale of ['en','ar']){
 test(`mobile menu ${locale} manages keyboard focus and Escape`,async({page},testInfo)=>{
  test.skip(testInfo.project.name!=='mobile-chromium','Mobile drawer only.');
  await page.goto(`/${locale}/workspace`);
  const opener=page.getByRole('button',{name:localized("Open navigation")});
  await expect(page.locator('.prototype-sidebar')).toBeHidden();
  await opener.click();
  await expect(opener).toHaveAttribute('aria-expanded','true');
  await expect(page.locator('.mobile-close')).toBeFocused();
  await page.keyboard.press('Escape');
  await expect(page.locator('.prototype-sidebar')).toBeHidden();
  await expect(opener).toBeFocused();
  await expect(opener).toHaveAttribute('aria-expanded','false');
 });
}
