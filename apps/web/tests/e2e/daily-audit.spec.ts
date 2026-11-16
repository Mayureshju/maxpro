import {mkdirSync,writeFileSync} from 'node:fs';
import {resolve} from 'node:path';
import {test,expect} from './fixtures';
import {dailyFixture} from './daily-fixtures';
const stage=process.env.DAILY_AUDIT_STAGE??'after',root=resolve(`../../artifacts/phase14/${stage}`);

test('daily workspace browser audit and responsive evidence',async({page},info)=>{
 test.skip(info.project.name!=='chromium','One controlled six-width capture matrix');test.setTimeout(180000);mkdirSync(root,{recursive:true});const report=[];
 for(const kind of ['empty','one','established'] as const){
  const context=await page.context().browser()!.newContext({viewport:{width:1440,height:1000}}),p=await context.newPage();const state=dailyFixture(kind);const errors:string[]=[];p.on('pageerror',e=>errors.push(e.message));p.on('console',e=>{if(e.type()==='error')errors.push(e.text());});
  await p.addInitScript(s=>{if(!localStorage.getItem('maxpro-daily-fixture')){localStorage.setItem('maxpro-gemini-v3-demo-state',JSON.stringify(s));localStorage.setItem('maxpro-daily-fixture','yes');}},state);
  await p.goto('/en/workspace');await p.locator('.ag-dashboard-page').waitFor();await expect(p.locator('.agency-identity')).toContainText('Demo Daily Agency');await expect(p.getByText('Some invalid local records were excluded.',{exact:false})).toHaveCount(0);await p.screenshot({path:resolve(root,`${kind}-dashboard.png`),fullPage:true});report.push({kind,text:await p.locator('main').innerText()});if(stage==='after'&&kind==='established'){await p.getByRole('button',{name:'Getting-started help',exact:true}).click();await expect(p.locator('.ag-guide-complete')).toBeVisible();await p.screenshot({path:resolve(root,'completed-guide.png'),fullPage:true});await p.getByRole('button',{name:'Dismiss getting-started guide',exact:true}).click();}
  if(kind==='established')for(const locale of ['en','ar'])for(const width of [1440,1280,1024,768,375,320]){
   await p.setViewportSize({width,height:1000});for(const [name,path] of [['dashboard',''],['inventory','/inventory'],['quick-add','/inventory/new'],['property','/inventory/AQ-50002'],['publish','/publish?property=AQ-50002&goal=portals'],['leads','/leads'],['inbox','/inbox']] as const){
    await p.goto(`/${locale}/workspace${path}`);await p.locator('main h1').waitFor();await p.evaluate(()=>document.fonts.ready);await p.screenshot({path:resolve(root,`${locale}-${width}-${name}.png`),fullPage:true});const overflow=await p.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1);report.push({locale,width,name,overflow});if(stage==='after')expect(overflow,`${locale} ${width} ${name}`).toBe(false);
   }
  }
  expect(errors).toEqual([]);await context.close();
 }
 writeFileSync(resolve(root,'audit.json'),JSON.stringify(report,null,2));
});
