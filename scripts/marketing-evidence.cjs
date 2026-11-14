/* Screenshots from the running Next.js production application. */
const {chromium}=require('../apps/web/node_modules/@playwright/test');
const {mkdirSync,writeFileSync}=require('node:fs');
const {resolve}=require('node:path');
const mode=process.argv[2]||'after';
const base=process.env.MARKETING_BASE_URL||'http://127.0.0.1:3000';
const output=resolve('artifacts/phase11',mode);mkdirSync(output,{recursive:true});
const existing=['','/solutions','/pricing','/about','/contact','/faq','/resources','/properties','/properties/AQ-10231','/agencies','/agencies/pearl-gate-realty','/privacy','/terms','/favorites','/compare','/saved-searches','/map','/register','/sign-in'];
const additions=['/how-it-works','/features/property-management','/features/publish-and-promote','/features/ai-assistance','/features/leads-and-inbox','/integrations','/solutions/agencies'];
const screens={dashboard:'/workspace',inventory:'/workspace/inventory',editor:'/workspace/inventory/AQ-10233/edit',media:'/workspace/inventory/AQ-10233/media',publish:'/workspace/publish?property=AQ-10233',leads:'/workspace/leads',inbox:'/workspace/inbox',campaign:'/workspace/publish?property=AQ-10233&goal=advertising',review:'/workspace/publish?property=AQ-10233&goal=portals',assistance:'/workspace/inventory/AQ-10233/edit?assist=1'};
(async()=>{
 const browser=await chromium.launch({headless:true,executablePath:process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH});const page=await browser.newPage();const reports=[];
 if(mode.startsWith('product')){
  const dir=resolve('apps/web/public/product');mkdirSync(dir,{recursive:true});
  for(const locale of ['en','ar'])for(const [name,route] of Object.entries(screens)){
   const mobile=mode==='product-mobile';
   await page.setViewportSize(mobile?{width:375,height:812}:{width:1440,height:1000});await page.goto(`${base}/${locale}${route}`);await page.locator('main h1').first().waitFor();await page.waitForTimeout(300);
   if(name==='campaign'||name==='review'){await page.locator('.ag-channel-choice').first().getByRole('checkbox').check();await page.locator('#selected-channel-workflow').scrollIntoViewIfNeeded();}
   if(name==='assistance')await page.getByRole('button',{name:locale==='ar'?'اقتراح وصف باللغتين':'Suggest bilingual copy',exact:true}).click();
   const file=`${locale}-${name}${mobile?'-mobile':''}.webp`,buffer=await page.screenshot({fullPage:false,animations:'disabled'});
   const sharp=require('node:module').createRequire(require.resolve('../apps/web/node_modules/next/package.json'))('sharp');
   await sharp(buffer).webp({quality:86}).toFile(`${dir}/${file}`);
   reports.push({locale,name,route,viewport:page.viewportSize(),file});
  }
  writeFileSync(`${dir}/${mode}-provenance.json`,JSON.stringify({source:'Actual running Next.js production workspace; fictional default demo records',baseline:'a22d192a5417bea79a532bb2f1caf4f4d75c5ad4',screens:reports},null,2));
 }else{
  for(const locale of ['en','ar'])for(const width of (process.env.MAXPRO_WIDTHS|| (mode==='before'?'1440,375':'1440,1280,1024,768,375,320')).split(',').map(Number)){
   await page.setViewportSize({width,height:width<600?812:1000});
   for(const route of [...existing,...(mode==='before'?[]:additions)]){
    await page.goto(`${base}/${locale}${route}`);await page.locator('main h1').first().waitFor();await page.evaluate(()=>document.fonts.ready);await page.waitForTimeout(100);
    const file=`${locale}-${width}-${route.slice(1).replaceAll('/','-')||'home'}.png`;
    const info=await page.evaluate(()=>({overflow:document.documentElement.scrollWidth>innerWidth+1,title:document.title,heading:document.querySelector('main h1')?.textContent,canonical:document.querySelector('link[rel=canonical]')?.getAttribute('href')}));
    await page.screenshot({path:`${output}/${file}`,fullPage:true,scale:'css',animations:'disabled'});reports.push({locale,width,route:route||'/',file,...info});
   }
  }
  writeFileSync(`${output}/inventory.json`,JSON.stringify(reports,null,2));
  if(reports.some(r=>r.overflow))process.exitCode=1;
 }
 await browser.close();console.log(`${reports.length} real-app captures; ${reports.filter(r=>r.overflow).length} overflow findings. ${output}`);
})().catch(e=>{console.error(e);process.exitCode=1;});
