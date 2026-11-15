import {mkdirSync,readFileSync} from 'node:fs';
import {resolve} from 'node:path';
import {createHash} from 'node:crypto';
import {test,expect} from './fixtures';
const evidence=resolve(`../../${process.env.MAXPRO_EVIDENCE_ROOT??'artifacts/phase12'}/polish`);mkdirSync(evidence,{recursive:true});
for(const locale of ['en','ar']){
 const ar=locale==='ar';
 test(`polish ${locale}: responsive screenshot modes, enlargement and keyboard`,async({page},info)=>{
  await page.goto(`/${locale}`);
  const preview=page.getByTestId('product-preview');
  const shot=preview.locator('.mk-shot'),image=shot.locator('img'),link=shot.locator('a[target=_blank]');
  await shot.getByRole('button',{name:ar?'تفاصيل الميزة':'Feature detail',exact:true}).focus();await page.keyboard.press('Enter');
  await expect(shot).toHaveAttribute('data-view','detail');await expect(image).toHaveAttribute('src',`/product/${locale}-dashboard-detail.webp`);
  await expect(shot.getByRole('button',{name:ar?'تفاصيل الميزة':'Feature detail',exact:true})).toHaveAttribute('aria-pressed','true');
  await link.focus();const [popup]=await Promise.all([page.waitForEvent('popup'),page.keyboard.press('Enter')]);
  await expect(popup).toHaveURL(new RegExp(`${locale}-dashboard-detail${info.project.name==='mobile-chromium'?'-mobile':''}.webp$`));await popup.close();
  await shot.getByRole('button',{name:ar?'مساحة العمل كاملة':'Full workspace',exact:true}).click();
  const current=await image.evaluate((el:HTMLImageElement)=>el.currentSrc);await expect(link).toHaveAttribute('href',current.replace(new URL(current).origin,''));
  const [full]=await Promise.all([page.waitForEvent('popup'),link.click()]);await expect(full).toHaveURL(current);await full.close();
  if(info.project.name==='mobile-chromium')expect(current).toContain('-mobile.webp');else expect(current).not.toContain('-mobile.webp');
  await page.setViewportSize({width:320,height:500});await expect(link).toHaveAttribute('href',`/product/${locale}-dashboard-mobile.webp`);
  await page.screenshot({path:`${evidence}/${info.project.name}-${locale}-screenshot-controls.png`,animations:'disabled'});
 });
 test(`polish ${locale}: buyer navigation, current section and fictional entry`,async({page})=>{
  await page.setViewportSize({width:1440,height:900});await page.goto(`/${locale}/features/property-management`);
  const featureMenu=page.locator('.mk-nav-disclosure summary');await expect(featureMenu).toHaveAttribute('aria-current','true');await featureMenu.focus();await page.keyboard.press('Enter');
  await expect(page.locator('.mk-nav-disclosure a[aria-current=page]')).toHaveAttribute('href',`/${locale}/features/property-management`);
  await page.keyboard.press('Escape');await expect(featureMenu).toBeFocused();await expect(page.locator('.mk-nav-disclosure')).not.toHaveAttribute('open','');
  await page.locator('.header-sign-in').click();await expect(page).toHaveURL(new RegExp(`/${locale}/sign-in$`));
  await expect(page.getByRole('button',{name:ar?'دخول مساحة العمل التجريبية':'Enter demo workspace',exact:true})).toBeVisible();
  await page.goto(`/${locale}`);await page.locator('.mk-hero-intro .mk-text-link').click();await expect(page).toHaveURL(new RegExp(`/${locale}/how-it-works$`));
  await page.setViewportSize({width:320,height:300});await page.getByRole('button',{name:ar?'فتح القائمة':'Open navigation',exact:true}).click();
  const dialog=page.getByRole('dialog');await dialog.getByRole('link',{name:ar?'إنشاء وكالة تجريبية':'Create a demo agency',exact:true}).click();
  await expect(page).toHaveURL(new RegExp(`/${locale}/register$`));await expect(dialog).not.toBeVisible();
 });
 test(`polish ${locale}: task navigation and truthful integration disclosure`,async({page})=>{
  for(const slug of ['property-management','publish-and-promote','ai-assistance','leads-and-inbox']){
   await page.goto(`/${locale}/features/${slug}`);await expect(page.locator('.mk-feature-hero-evidence .mk-shot')).toHaveAttribute('data-view','detail');
   await page.locator('.mk-feature-steps a').last().click();await expect(page.locator('#chapter-3')).toBeInViewport();
   await expect(page.locator('.mk-related a')).toHaveCount(3);
  }
  await page.goto(`/${locale}/integrations`);await expect(page.locator('.mk-category-nav a')).toHaveCount(4);await expect(page.locator('.mk-status')).toHaveCount(8);
  for(const status of await page.locator('.mk-status').all())await expect(status).toContainText(ar?'غير متصل':'not connected',{ignoreCase:true});
  const summary=page.locator('.mk-integration-row summary').first();await summary.focus();await page.keyboard.press('Enter');await expect(page.locator('.mk-integration-row details').first()).toHaveAttribute('open','');
  await expect(page.locator('.mk-integration-row details').first()).toContainText(ar?'إعداد رسمي':'Official partner onboarding');
  expect(await page.locator('main a').evaluateAll(links=>links.some(a=>a.getAttribute('href')?.includes('/workspace/hub')))).toBe(false);
 });
 test(`polish ${locale}: readable mobile comparison and honest conversion`,async({page})=>{
  await page.setViewportSize({width:375,height:812});await page.goto(`/${locale}/pricing`);
  const comparison=page.locator('.mk-comparison');await expect(comparison.locator('td .mk-mobile-plan-name').first()).toBeVisible();
  const firstRow=comparison.locator('tbody').first().locator('tr').nth(1);await expect(firstRow).toContainText('Starter');await expect(firstRow).toContainText('Pro');await expect(firstRow).toContainText(ar?'الوكالة':'Agency');
  for(const td of await comparison.locator('td').all()){const bounds=await td.boundingBox();expect(bounds!.width).toBeLessThanOrEqual(340);}
  await expect(page.locator('#plan-starter li').first()).toContainText('3');await expect(page.locator('#plan-pro li').first()).toContainText('25');
  await expect(page.locator('.mk-commercial-note')).toContainText(ar?'بانتظار الموافقة':'pending approval');
  await page.locator('#plan-agency .mk-button').click();await expect(page).toHaveURL(new RegExp(`/${locale}/contact$`));
  await expect(page.locator('.mk-contact-form input').first()).toHaveAttribute('readonly','');
 });
 test(`polish ${locale}: six widths, zoom, short viewport and throttled motion`,async({page},info)=>{
  test.setTimeout(120000);
  for(const width of [1440,1280,1024,768,375,320]){
   await page.setViewportSize({width,height:width===768?400:812});await page.goto(`/${locale}`);
   expect(await page.evaluate(()=>document.documentElement.scrollWidth)).toBeLessThanOrEqual(width+1);
   const caption=page.locator('.mk-shot figcaption').first();expect(await caption.evaluate(el=>parseFloat(getComputedStyle(el).fontSize))).toBeGreaterThanOrEqual(13);
  }
  await page.setViewportSize({width:1024,height:600});await page.goto(`/${locale}`);await page.evaluate(()=>{document.documentElement.style.zoom='2';});
  expect(await page.evaluate(()=>document.documentElement.scrollWidth)).toBeLessThanOrEqual(1025);
  await page.evaluate(()=>{document.documentElement.style.zoom='';});
  const cdp=await page.context().newCDPSession(page);await cdp.send('Emulation.setCPUThrottlingRate',{rate:4});
  await page.setViewportSize({width:320,height:500});await page.getByRole('tab').nth(1).click();await expect(page.getByRole('tabpanel')).toContainText(ar?'التفاصيل في مكان واحد':'The details live in one place');
  await page.emulateMedia({reducedMotion:'reduce'});await page.getByRole('tab').nth(2).click();
  expect(await page.getByRole('tabpanel').evaluate(el=>getComputedStyle(el).animationName)).toBe('none');
  expect(await page.locator('.mk-shot picture').evaluate(el=>getComputedStyle(el).animationName)).toBe('none');
  await page.screenshot({path:`${evidence}/${info.project.name}-${locale}-throttled-reduced-motion.png`,animations:'disabled'});await cdp.detach();
 });
}
test('polish: crop provenance matches untouched source assets',async()=>{
 const root=resolve('public/product'),manifest=JSON.parse(readFileSync(`${root}/detail-provenance.json`,'utf8'));
 expect(manifest.records).toHaveLength(30);
 for(const record of manifest.records){expect(createHash('sha256').update(readFileSync(`${root}/${record.source}`)).digest('hex')).toBe(record.sourceSha256);expect(readFileSync(`${root}/${record.file}`).length).toBeGreaterThan(1000);expect(record.rectangle.width).toBeGreaterThan(0);}
});
