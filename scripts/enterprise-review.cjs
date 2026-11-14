/* Running-app evidence; no generated or illustrative screen substitutes. */
const {chromium}=require('../apps/web/node_modules/@playwright/test');
const {readdirSync,mkdirSync,writeFileSync}=require('node:fs');
const {resolve}=require('node:path');
const mode=process.argv[2]||'before';
const output=resolve('artifacts/phase10',mode);mkdirSync(output,{recursive:true});
const root=resolve('apps/web/src/app/[locale]');
const routes=readdirSync(root,{recursive:true}).map(String).filter(f=>f.endsWith('page.tsx')&&f.startsWith('workspace')).map(f=>'/'+f.replace(/\/?page\.tsx$/,'')).map(r=>r.replace('[id]',r.includes('/leads/')?'LE-2101':r.includes('/invoices/')?'INV-2026-0419':r.includes('/connectors/')?'property-finder':'AQ-10233'));
const major=['/workspace','/workspace/inventory','/workspace/inventory/new','/workspace/inventory/AQ-10233/edit','/workspace/inventory/AQ-10233','/workspace/inventory/AQ-10233/media','/workspace/publish?property=AQ-10233','/workspace/leads','/workspace/leads/LE-2101','/workspace/inbox','/workspace/campaigns/new','/workspace/settings','/workspace/billing','/workspace/organization','/workspace/settings/domains/preview'];
(async()=>{
 const browser=await chromium.launch({headless:true,executablePath:process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH});const page=await browser.newPage();const reports=[];
 for(const locale of ['en','ar'])for(const width of (process.env.MAXPRO_WIDTHS?process.env.MAXPRO_WIDTHS.split(',').map(Number):mode==='before'?[1440,375]:[1440,1280,1024,768,375,320])){
  await page.setViewportSize({width,height:width<600?812:1000});
  for(const route of process.env.MAXPRO_ROUTES?process.env.MAXPRO_ROUTES.split(','):width===1440?Array.from(new Set([...routes,...major])):major){
   await page.goto(`http://localhost:${process.env.PLAYWRIGHT_PORT||3010}/${locale}${route}`);await page.locator('main h1').first().waitFor();await page.evaluate(()=>document.fonts.ready);
   const name=`${locale}-${width}-${route.replace(/^\//,'').replace(/[^a-z0-9-]/gi,'-')}`;
   const data=await page.evaluate(()=>({overflow:document.documentElement.scrollWidth>innerWidth+1,heading:document.querySelector('main h1')?.textContent,comboboxes:[...document.querySelectorAll('main input[role=combobox]')].map(el=>({name:el.labels?.[0]?.textContent,value:el.getAttribute('data-value'),label:el.value,disabled:el.disabled,height:el.getBoundingClientRect().height})),selects:[...document.querySelectorAll('main select')].map(el=>({name:el.getAttribute('aria-label')||el.closest('label')?.childNodes[0]?.textContent,options:[...el.options].map(o=>({value:o.value,label:o.text})),value:el.value,height:el.getBoundingClientRect().height})),controls:[...document.querySelectorAll('main input:not([type=hidden]),main button,main textarea')].filter(e=>e.getClientRects().length).map(el=>({tag:el.tagName,type:el.type,height:el.getBoundingClientRect().height,name:el.getAttribute('aria-label')||el.labels?.[0]?.textContent?.trim().slice(0,80)||el.textContent?.trim().slice(0,80)}))}));
   reports.push({locale,width,route,...data});await page.screenshot({path:`${output}/${name}.png`,fullPage:true,scale:'css'});
  }
 }
 await page.setViewportSize({width:375,height:812});await page.goto(`http://localhost:${process.env.PLAYWRIGHT_PORT||3010}/en/workspace/publish?property=AQ-10233`);
 await page.locator('input[name=promotion-goal][value=portals]').check();await page.locator('.ag-channel-choice').first().getByRole('checkbox').check();await page.screenshot({path:`${output}/en-375-channel-open.png`,fullPage:false});
 await page.goto(`http://localhost:${process.env.PLAYWRIGHT_PORT||3010}/ar/workspace/inventory/AQ-10233/edit?assist=1`);await page.getByRole('button',{name:'اقتراح وصف باللغتين',exact:true}).click();await page.screenshot({path:`${output}/ar-375-assistance-open.png`,fullPage:false});
 writeFileSync(`${output}/inventory.json`,JSON.stringify(reports,null,2));await browser.close();if(reports.some(r=>r.overflow||r.selects.some(s=>s.height>0&&s.height<43.5)))process.exitCode=1;console.log(`${reports.length} route/viewport captures; ${reports.filter(r=>r.overflow).length} overflow findings. Evidence: ${output}`);
})().catch(e=>{console.error(e);process.exitCode=1;});
