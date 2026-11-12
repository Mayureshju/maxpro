import {expect,test} from './fixtures';

const routes=[
 '/en','/en/properties','/en/properties/AQ-10231','/en/pricing','/en/solutions','/en/favorites','/en/compare','/en/map',
 '/en/workspace','/en/workspace/publish','/en/workspace/inventory','/en/workspace/inventory/AQ-10231','/en/workspace/inventory/AQ-10231/edit',
 '/en/workspace/studio','/en/workspace/hub','/en/workspace/hub/jobs','/en/workspace/hub/connectors','/en/workspace/hub/marketplace','/en/workspace/hub/connectors/property-finder','/en/workspace/hub/feeds','/en/workspace/hub/mappings',
 '/en/workspace/leads','/en/workspace/leads/assignment','/en/workspace/leads/viewings','/en/workspace/leads/LE-2101','/en/workspace/inbox','/en/workspace/campaigns',
 '/en/workspace/campaigns/new','/en/workspace/integrations/ga4','/en/workspace/integrations/google-ads','/en/workspace/integrations/meta-catalog','/en/workspace/integrations/whatsapp','/en/workspace/analytics','/en/workspace/team','/en/workspace/billing',
 '/en/workspace/billing/invoices','/en/workspace/verification','/en/workspace/settings','/en/workspace/settings/domains',
 '/en/workspace/whatsapp/packs','/en/workspace/support/assistant','/en/workspace/ads/placements',
 '/en/workspace/admin','/en/workspace/admin/connector-health','/en/workspace/admin/moderation','/en/workspace/admin/users','/en/workspace/admin/audit'
];
for(const route of routes){test(`${route} renders a page heading`,async({page})=>{await page.goto(route);await expect(page.locator('h1').first()).toBeVisible();await expect(page.locator('body')).not.toContainText('Internal Server Error');});}

test('inventory filtering and property navigation works locally',async({page})=>{
 await page.goto('/en/workspace/inventory');
 await page.getByRole('textbox',{name:'Search properties'}).fill('Viva');
 await expect(page.locator('.px-listing-row')).toHaveCount(1);
 await page.locator('.px-listing-row').first().click();
 await expect(page.locator('h1')).toContainText('Viva Bahriya');
});

test('studio can walk through local demo with explicit approval',async({page})=>{
 await page.goto('/en/workspace/studio');
 await page.getByRole('button',{name:'Use verified sample input'}).click();
 await page.getByRole('button',{name:/Simulate fact extraction/}).click();
 for(const heading of ['Organize the media by room.','Refine the bilingual listing copy.','Quality checks and human approval.']){
  await page.getByRole('button',{name:'Continue',exact:true}).click();
  await expect(page.getByRole('heading',{name:heading,exact:true})).toBeVisible();
  expect(await page.evaluate(()=>document.documentElement.scrollWidth)).toBeLessThanOrEqual(page.viewportSize()!.width+1);
 }
 await page.getByRole('checkbox').last().check();
 await page.getByRole('button',{name:'Continue to publishing handoff'}).click();
 await expect(page.getByRole('link',{name:/Go to publishing workbench/})).toBeVisible();
});

test('Arabic routes preserve RTL',async({page})=>{
 await page.goto('/ar/workspace/inventory');
 await expect(page.locator('html')).toHaveAttribute('dir','rtl');
 await expect(page.locator('h1')).toBeVisible();
});

test('mobile workspace does not overflow and sidebar opens',async({page})=>{
 await page.setViewportSize({width:375,height:800});
 await page.goto('/en/workspace');
 await page.getByRole('button',{name:'Open navigation'}).click();
 await expect(page.locator('.prototype-sidebar')).toHaveClass(/is-open/);
 const widths=await page.evaluate(()=>({scroll:document.documentElement.scrollWidth,viewport:window.innerWidth}));
 expect(widths.scroll).toBeLessThanOrEqual(widths.viewport+1);
});


test('Gemini master property edit is used in preflight',async({page})=>{
 await page.goto('/en/workspace/inventory/AQ-10233/edit');
 await page.getByRole('textbox',{name:'Permit / license'}).fill('');
 await page.getByRole('button',{name:/Save browser-local draft/}).click();
 await page.goto('/en/workspace/publish');
 await page.getByRole('button',{name:'Continue'}).click();
 await page.getByRole('button',{name:'Continue'}).click();
 await expect(page.getByText('Verified permit and advertiser approval').first()).toBeVisible();
});

test('Gemini connector setup and publishing are browser-local only',async({page})=>{
 for(const name of ['property-finder','qatar-living']){
  await page.goto(`/en/workspace/hub/connectors/${name}`);
  await page.getByRole('checkbox').check();
  await page.getByRole('button',{name:/Prepare demo connector/}).click();
  await expect(page.getByText('Local demo setup recorded')).toBeVisible();
 }
 await page.goto('/en/workspace/publish');
 await page.getByRole('button',{name:'Continue'}).click();
 await page.getByRole('button',{name:'Continue'}).click();
 await page.getByRole('checkbox').check();
 await page.getByRole('button',{name:'Continue'}).click();
 await page.getByRole('button',{name:'Simulate publishing'}).click();
 await expect(page.getByText('Demo dispatch completed')).toBeVisible();
 await page.goto('/en/workspace/hub/jobs');
 await expect(page.getByText('Queued locally').first()).toBeVisible();
 await expect(page.getByText('Not connected',{exact:true})).toHaveCount(0);
});

test('Gemini Starter plan blocks two destination selection',async({page})=>{
 await page.goto('/en/workspace/billing');
 await page.getByRole('button',{name:/Starter/}).click();
 await page.goto('/en/workspace/publish');
 await page.getByRole('button',{name:'Continue'}).click();
 await expect(page.getByText(/includes 1 destination/)).toBeVisible();
 await expect(page.getByRole('button',{name:'Continue'})).toBeDisabled();
});

test('Gemini sample data and pricing do not advertise former v2 tiers',async({page})=>{
 await page.goto('/en/workspace/billing');
 await expect(page.locator('.gm-plan-selector b')).toHaveText(['QAR 179 / mo','QAR 725 / mo','QAR 1,800+ / mo']);
 await page.goto('/en/pricing');
 await expect(page.getByText('QAR 179')).toBeVisible();
 await expect(page.getByText('QAR 725')).toBeVisible();
 await expect(page.getByText('QAR 1,800+')).toBeVisible();
});
