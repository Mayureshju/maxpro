const {chromium}=require('../apps/web/node_modules/@playwright/test');
const fs=require('node:fs');
const root='artifacts/phase15/reference';fs.mkdirSync(root,{recursive:true});
(async()=>{
 const browser=await chromium.launch({executablePath:process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH||'/Users/dieturetech/Library/Caches/ms-playwright/chromium_headless_shell-1208/chrome-headless-shell-mac-arm64/chrome-headless-shell'}),page=await browser.newPage();const records=[];
 const routes=['','/register','/advertiser','/advertiser/new','/advertiser/studio','/hub','/advertiser/promote/AQ-10233','/whatsapp','/properties','/properties/AQ-10233'];
 for(const locale of ['en','ar'])for(const width of [1440,375]){
  await page.setViewportSize({width,height:1000});
  for(const route of routes){
   const response=await page.goto(`https://maxpro-one.vercel.app/${locale}${route}`);await page.waitForTimeout(200);await page.evaluate(()=>document.fonts.ready);
   const name=route.slice(1).replaceAll('/','-')||'home';await page.screenshot({path:`${root}/${locale}-${width}-${name}.png`,fullPage:true});
   records.push({locale,width,route,status:response.status(),title:await page.title(),text:(await page.locator('body').innerText()).slice(0,18000),links:await page.locator('a').evaluateAll(xs=>xs.map(x=>({text:x.textContent,href:x.getAttribute('href')})))});
   if(!route&&width===1440&&locale==='en'){
    const styles=await page.evaluate(()=>({variables:Array.from(document.styleSheets).flatMap(s=>{try{return Array.from(s.cssRules).filter(r=>r.selectorText===':root').map(r=>r.cssText)}catch{return[]}}),samples:Array.from(document.querySelectorAll('section,h1,a,button')).slice(0,35).map(x=>({tag:x.tagName,text:x.textContent.slice(0,60),color:getComputedStyle(x).color,bg:getComputedStyle(x).backgroundColor,font:getComputedStyle(x).fontFamily,size:getComputedStyle(x).fontSize}))}));fs.writeFileSync(`${root}/styles.json`,JSON.stringify(styles,null,2));
   }
  }
 }
 // Dashboard tab content is observed directly, not guessed from marketing links.
 await page.setViewportSize({width:1440,height:1000});await page.goto('https://maxpro-one.vercel.app/en/advertiser');
 for(const label of ['Listings','Leads','Billing','Team','Verification & compliance']){const button=page.getByRole('button',{name:new RegExp(`^${label}`)}).first();if(await button.count()){await button.click();await page.screenshot({path:`${root}/dashboard-${label.split(' ')[0].toLowerCase()}.png`,fullPage:true});records.push({tab:label,text:(await page.locator('body').innerText()).slice(0,16000)});}}
 fs.writeFileSync(`${root}/observations.json`,JSON.stringify(records,null,2));await browser.close();console.log(`Observed ${records.length} reference views.`);
})().catch(e=>{console.error(e);process.exit(1)});
