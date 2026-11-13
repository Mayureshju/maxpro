import {mkdirSync} from 'node:fs';
import {resolve} from 'node:path';
import {test as base,expect} from '@playwright/test';

for(let phase=0;phase<=5;phase++)mkdirSync(resolve(`../../${globalThis.process.env.MAXPRO_EVIDENCE_ROOT??'artifacts/phase6'}/regression/phase${phase}/logs`),{recursive:true});

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

import arabicCopy from '../../messages/prototype-ar.json';
import {translateCopy} from '../../src/lib/ui-copy';
/** Keep exact EN/AR control assertions meaningful as the legacy UI gains translations. */
export function localized(text:string|RegExp,exact=false):RegExp{
 const escape=(s:string)=>s.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');
 if(text instanceof RegExp){const translations=Object.entries(arabicCopy).filter(([key])=>text.test(key)).map(([,ar])=>escape(ar));return translations.length?new RegExp(`(?:${text.source}|${translations.join('|')})`,text.flags):text;}
 const alternatives=exact?[]:Object.entries(arabicCopy).filter(([key])=>key.includes(text)).map(([,ar])=>escape(ar));const pattern=`(?:${[escape(text),escape(translateCopy(text,'ar')),...alternatives].join('|')})`;return new RegExp(exact?`^${pattern}$`:pattern);
}
