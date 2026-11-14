const {chromium}=require('../apps/web/node_modules/@playwright/test');
const {mkdirSync}=require('node:fs');
(async()=>{const browser=await chromium.launch({headless:true,executablePath:process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH}),page=await browser.newPage({viewport:{width:1440,height:1000}}),out='artifacts/phase11/interactions';mkdirSync(out,{recursive:true});const base=process.env.MARKETING_BASE_URL||'http://127.0.0.1:3211';
for(const locale of ['en','ar']){
 await page.goto(`${base}/${locale}`);await page.locator('.mk-hero-intro .mk-primary').hover();await page.screenshot({path:`${out}/${locale}-hero-hover.png`,animations:'disabled'});await page.locator('.mk-hero-intro .mk-primary').focus();await page.screenshot({path:`${out}/${locale}-hero-keyboard-focus.png`,animations:'disabled'});
 await page.locator('.mk-nav-disclosure summary').click();await page.screenshot({path:`${out}/${locale}-features-menu.png`,animations:'disabled'});await page.keyboard.press('Escape');
 await page.getByRole('tab').nth(2).click();await page.locator('.mk-tabs').evaluate(el=>window.scrollTo({top:el.getBoundingClientRect().top+scrollY-110,behavior:'instant'}));await page.screenshot({path:`${out}/${locale}-selected-product-preview.png`,animations:'disabled'});
 await page.getByTestId('workflow-tour').locator('ol button').nth(3).click();await page.getByTestId('workflow-tour').evaluate(el=>window.scrollTo({top:el.getBoundingClientRect().top+scrollY-110,behavior:'instant'}));await page.screenshot({path:`${out}/${locale}-selected-workflow-review.png`,animations:'disabled'});
 await page.goto(`${base}/${locale}/integrations`);await page.locator('.mk-integration-row summary').first().click();await page.locator('.mk-integration-row').first().evaluate(el=>window.scrollTo({top:el.getBoundingClientRect().top+scrollY-110,behavior:'instant'}));await page.screenshot({path:`${out}/${locale}-integration-prerequisites.png`,animations:'disabled'});
}
await browser.close();console.log('12 actual interaction captures saved');})().catch(e=>{console.error(e);process.exitCode=1});
