import {test as base,expect} from '@playwright/test';

// Every test fails on application exceptions, hydration errors or console errors.
export const test=base.extend<{browserErrors:void}>({
 browserErrors:[async({page},use)=>{
  const errors:string[]=[];
  page.on('pageerror',error=>errors.push(error.message));
  page.on('console',message=>{if(message.type()==='error')errors.push(message.text());});
  await use();
  expect(errors,'Unexpected browser errors').toEqual([]);
 },{auto:true}],
});
export {expect};
