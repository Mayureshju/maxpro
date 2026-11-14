/* Repeatable browser lab samples; these are not field Core Web Vitals or Lighthouse scores. */
const {chromium}=require('../apps/web/node_modules/@playwright/test');
const {mkdirSync,writeFileSync}=require('node:fs');
(async()=>{
 const browser=await chromium.launch({headless:true,executablePath:process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH});const results=[];
 for(const locale of ['en','ar'])for(const mobile of [false,true])for(let trial=1;trial<=3;trial++){
  const context=await browser.newContext({viewport:mobile?{width:375,height:812}:{width:1440,height:1000},isMobile:mobile,deviceScaleFactor:1});const page=await context.newPage(),cdp=await context.newCDPSession(page);
  await cdp.send('Network.enable');await cdp.send('Network.setCacheDisabled',{cacheDisabled:true});
  await cdp.send('Emulation.setCPUThrottlingRate',{rate:mobile?4:1});
  if(mobile)await cdp.send('Network.emulateNetworkConditions',{offline:false,latency:150,downloadThroughput:200000,uploadThroughput:93750});
  await page.addInitScript(()=>{window.__marketingVitals={lcp:0,cls:0,events:[],longTasks:[]};new PerformanceObserver(list=>{for(const e of list.getEntries())window.__marketingVitals.lcp=e.startTime}).observe({type:'largest-contentful-paint',buffered:true});new PerformanceObserver(list=>{for(const e of list.getEntries())if(!e.hadRecentInput)window.__marketingVitals.cls+=e.value}).observe({type:'layout-shift',buffered:true});new PerformanceObserver(list=>window.__marketingVitals.longTasks.push(...list.getEntries().map(e=>e.duration))).observe({type:'longtask',buffered:true});new PerformanceObserver(list=>window.__marketingVitals.events.push(...list.getEntries().map(e=>({name:e.name,duration:e.duration,interactionId:e.interactionId})))).observe({type:'event',buffered:true,durationThreshold:16});});
  await page.goto(`${process.env.MARKETING_BASE_URL||'http://127.0.0.1:3211'}/${locale}`);await page.waitForLoadState('networkidle');await page.waitForTimeout(700);
  const initial=await page.evaluate(()=>({...window.__marketingVitals,resources:performance.getEntriesByType('resource').map(r=>({url:r.name,transferSize:r.transferSize,kind:r.initiatorType})),navigation:performance.getEntriesByType('navigation')[0].toJSON()}));
  await page.getByRole('tab').nth(1).click();await page.waitForTimeout(350);
  const interactions=await page.evaluate(()=>window.__marketingVitals.events.filter(e=>e.interactionId));
  results.push({locale,mobile,trial,initial,interactions});await context.close();
 }
 await browser.close();mkdirSync('artifacts/phase11/performance',{recursive:true});writeFileSync('artifacts/phase11/performance/browser-lab.json',JSON.stringify({browser:await browser.version(),method:'Chromium production localhost; cache disabled; desktop unthrottled; mobile 4x CPU, 150ms RTT, 1.6Mbps down. 3 runs each. LCP/CLS from PerformanceObserver; event durations are lab interaction samples, not field INP.',results},null,2));console.log(results.map(r=>({locale:r.locale,mobile:r.mobile,trial:r.trial,lcpMs:Math.round(r.initial.lcp),cls:r.initial.cls,maxInteractionMs:Math.max(0,...r.interactions.map(e=>e.duration)),imageRequests:r.initial.resources.filter(e=>decodeURIComponent(e.url).includes('/product/')).map(r=>r.url)})));
})().catch(e=>{console.error(e);process.exitCode=1});
