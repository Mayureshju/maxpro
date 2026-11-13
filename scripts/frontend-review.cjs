/* Real running-app evidence; run from repository root after starting Next.js. */
const {chromium}=require('../apps/web/node_modules/@playwright/test');
const {readdirSync,mkdirSync,writeFileSync,readFileSync}=require('node:fs');
const {resolve}=require('node:path');
const stage=process.argv[2]||'after';
const widths=stage==='before'?[1440,375]:[1440,1024,768,375];
const routes=readdirSync(resolve('apps/web/src/app/[locale]'),{recursive:true}).map(String).filter(f=>f.endsWith('page.tsx')).map(f=>'/'+f.replace(/\/?page\.tsx$/,'')).map(r=>r.replace('[id]',r.startsWith('/workspace/leads/')?'LE-2101':r.startsWith('/workspace/billing/')?'INV-2026-0419':r.startsWith('/workspace/hub/connectors/')?'property-finder':r.startsWith('/agencies/')?'pearl-gate-realty':'AQ-10233'));
const routeFilter=process.argv[3]||'';if(routeFilter&&!routes.includes(routeFilter))throw new Error('Unknown route filter');
(async()=>{
 const browser=await chromium.launch({headless:true,executablePath:process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH||'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'});
 const results=routeFilter?JSON.parse(readFileSync(`artifacts/frontend/logs/${stage}-routes.json`,'utf8')).filter(row=>row.route!==routeFilter):[];mkdirSync(`artifacts/frontend/${stage}`,{recursive:true});
 const queue=['en','ar'].flatMap(locale=>widths.map(width=>({locale,width})));
 async function worker(){while(queue.length){const {locale,width}=queue.shift();
 const context=await browser.newContext();const page=await context.newPage();await page.setViewportSize({width,height:width===375?812:1000});
 for(const route of routes.filter(route=>!routeFilter||route===routeFilter)){
 const errors=[];const onError=e=>errors.push(e.message);const onConsole=message=>{if(message.type()==='error')errors.push(message.text())};page.on('pageerror',onError);page.on('console',onConsole);
 const name=route.replace(/^\//,'').replaceAll('/','-')||'home';
 try{
 const response=await page.goto(`http://127.0.0.1:3000/${locale}${route}`,{timeout:60000,waitUntil:'load'});
 if(route.startsWith('/workspace')||route==='/register')await page.getByRole('combobox',{name:locale==='en'?'Demo organization':'المؤسسة التجريبية',exact:true}).waitFor();
 if(route.startsWith('/workspace')||route==='/register')await page.waitForFunction(()=>!document.querySelector('.oa-persona select')?.disabled);
 await page.locator('main h1').first().waitFor({timeout:20000});await page.evaluate(()=>document.fonts.ready);
 const imageLoadErrors=await page.evaluate(async()=>{
  const urls=new Set([...document.querySelectorAll('body *')].flatMap(element=>[...getComputedStyle(element).backgroundImage.matchAll(/url\(["']?(.*?)["']?\)/g)].map(match=>match[1])));
  const failures=[];await Promise.all([...document.images].map(img=>img.decode().catch(()=>failures.push(img.currentSrc||img.src))));
  await Promise.all([...urls].filter(Boolean).map(async url=>{const img=new Image();img.src=url;try{await img.decode()}catch{failures.push(url)}}));return failures;
 });
 await page.screenshot({path:`artifacts/frontend/${stage}/${width}-${locale}-${name}.png`,fullPage:true,scale:'css',animations:'disabled'});
 const layout=await page.evaluate(()=>({overflow:document.documentElement.scrollWidth>innerWidth+1,lang:document.documentElement.lang,dir:document.documentElement.dir,h1:document.querySelector('main h1')?.textContent,buttons:[...document.querySelectorAll('main button')].map(b=>({text:b.textContent?.trim()||b.getAttribute('aria-label'),disabled:b.disabled}))}));
 results.push({locale,width,route,status:response.status(),errors,imageLoadErrors,...layout});
 }catch(error){results.push({locale,width,route,error:String(error),errors});}
 page.off('pageerror',onError);page.off('console',onConsole);
 writeFileSync(`artifacts/frontend/logs/${stage}-routes.json`,JSON.stringify(results,null,2));
 }
 console.log(`${stage}: ${locale} ${width}px: ${routeFilter?1:routes.length} routes inspected`);await context.close();
 }}
 await Promise.all(Array.from({length:stage==='before'?1:3},worker));
 await browser.close();const failed=results.filter(r=>r.error||r.errors?.length||r.status!==200||r.overflow||r.imageLoadErrors?.length);console.log(JSON.stringify({screens:results.length,failures:failed},null,2));process.exitCode=failed.length?1:0;
})().catch(e=>{console.error(e);process.exitCode=1;});
