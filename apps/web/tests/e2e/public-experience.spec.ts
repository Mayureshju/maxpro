import {readFileSync} from 'node:fs';
import {resolve} from 'node:path';
import {createHash} from 'node:crypto';
import {test,expect} from './fixtures';
for(const locale of ['en','ar']){
 const ar=locale==='ar';
 test(`public experience ${locale}: every story outcome links to an actual demo and stays public`,async({page})=>{
  const mutations:string[]=[];page.on('request',r=>{if(['POST','PUT','PATCH','DELETE'].includes(r.method()))mutations.push(r.url());});await page.goto(`/${locale}`);const before=await page.evaluate(()=>JSON.stringify({...localStorage})),story=page.getByTestId('product-preview'),tabs=story.getByRole('tab');
  for(const [i,screen] of ['property','prepare','promote','follow'].entries()){await tabs.nth(i).click();const panel=story.getByRole('tabpanel');await expect(panel).toHaveAttribute('data-chapter',screen);await expect(story.getByRole('tabpanel')).toHaveCount(1);await expect(panel.locator('img')).toHaveAttribute('src',`/product/stories/${locale}-${screen}.webp`);const href=await panel.locator('.mk-text-link').getAttribute('href');expect(href).toContain(`/${locale}/workspace/`);const image=panel.locator('img');await expect.poll(()=>image.evaluate((el:HTMLImageElement)=>el.complete&&el.naturalWidth>0)).toBe(true);}
  await tabs.last().focus();await page.keyboard.press('ArrowDown');await expect(tabs.first()).toBeFocused();await page.keyboard.press('ArrowUp');await expect(tabs.last()).toBeFocused();await page.keyboard.press('Home');await expect(tabs.first()).toBeFocused();await page.waitForTimeout(350);await expect(tabs.first()).toHaveAttribute('aria-selected','true');
  const accept=page.getByRole('button',{name:ar?'قبول المثال بعد المراجعة':'Accept reviewed example',exact:true});await accept.click();await expect(page.getByRole('status')).toContainText(ar?'لم يتغير سجل العقار':'The property record was not changed');await page.getByRole('button',{name:ar?'إعادة المثال':'Reset example',exact:true}).click();await expect(accept).toBeVisible();expect(await page.evaluate(()=>JSON.stringify({...localStorage}))).toBe(before);expect(mutations).toEqual([]);
 });
 test(`public experience ${locale}: prepare opens the actual assistance step`,async({page})=>{
  await page.goto(`/${locale}`);const story=page.getByTestId('product-preview');await story.getByRole('tab').nth(1).click();await story.locator('.mk-text-link').click();await expect(page).toHaveURL(/edit\?assist=1$/);await expect(page.locator('.ag-steps [aria-current=step]')).toContainText(ar?'المساعدة الذكية':'AI assistance');
 });
 test(`public experience ${locale}: readable story reflow, reduced motion and assistant controls`,async({page})=>{
  await page.emulateMedia({reducedMotion:'reduce'});for(const width of [320,375,768,1024,1280,1440]){await page.setViewportSize({width,height:900});await page.goto(`/${locale}`);const story=page.getByTestId('product-preview');for(const tab of await story.getByRole('tab').all()){const rect=await tab.boundingBox();expect(rect!.height).toBeGreaterThanOrEqual(44);expect(rect!.width).toBeGreaterThanOrEqual(44);}expect(await page.evaluate(()=>document.documentElement.scrollWidth)).toBeLessThanOrEqual(width+1);}
  await page.setViewportSize({width:1024,height:800});await page.evaluate(()=>document.documentElement.style.zoom='2');expect(await page.evaluate(()=>document.documentElement.scrollWidth)).toBeLessThanOrEqual(1025);await page.evaluate(()=>document.documentElement.style.zoom='');await page.setViewportSize({width:375,height:812});await page.locator('.ws-ai-entry').click();await expect(page.getByRole('dialog')).toBeVisible();await expect(page.getByRole('dialog')).toContainText(ar?'دليل عام':'Public guide');await page.keyboard.press('Escape');await expect(page.getByRole('dialog')).not.toBeVisible();await expect(page.locator('.ws-ai-entry')).toBeFocused();
 });
}
test('public experience: every focused image matches recorded genuine capture provenance',async()=>{
 const root=resolve('public/product/stories'),manifest=JSON.parse(readFileSync(`${root}/provenance.json`,'utf8'));expect(manifest.baseline).toBe('cf0b187aec5cf7b804b0152b771e829d8f42c72a');expect(manifest.records).toHaveLength(20);
 for(const record of manifest.records){expect(createHash('sha256').update(readFileSync(`${root}/${record.file}`)).digest('hex')).toBe(record.sha256);expect(record.route).toMatch(/^\/workspace\//);expect(record.crop.width).toBeGreaterThan(200);expect(record.crop.height).toBeGreaterThan(200);expect(record.method).toContain('No drawing or compositing');}
});
