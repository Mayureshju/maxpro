import type {Metadata} from 'next';
import {pick,publicBrand,type Bilingual} from './marketing-content';
/** Supply an approved public origin at launch. The prototype must not invent one. */
export const marketingOrigin=new URL(process.env.NEXT_PUBLIC_SITE_URL||'http://localhost:3000');
export const publicMarketingRoutes=['','/solutions','/how-it-works','/features/property-management','/features/publish-and-promote','/features/ai-assistance','/features/leads-and-inbox','/integrations','/solutions/agencies','/pricing','/about','/contact','/faq','/resources','/properties','/agencies'];
export function publicMetadata(locale:string,path:string,title:Bilingual,description:Bilingual,noindex=false):Metadata{
 const name=`${pick(locale,title)} | ${publicBrand.name}`,body=pick(locale,description),image=`/product/${locale==='ar'?'ar':'en'}-dashboard.webp`;
 return {title:name,description:body,alternates:{canonical:`/${locale}${path}`,languages:{en:`/en${path}`,ar:`/ar${path}`,'x-default':`/en${path}`}},robots:{index:!!process.env.NEXT_PUBLIC_SITE_URL&&!noindex,follow:!noindex},openGraph:{type:'website',title:name,description:body,url:`/${locale}${path}`,locale:locale==='ar'?'ar_QA':'en_QA',alternateLocale:locale==='ar'?'en_QA':'ar_QA',siteName:publicBrand.name,images:[{url:image,width:1440,height:1000,alt:pick(locale,['Fictional agency workspace prototype','نموذج مساحة وكالة خيالية'])}]},twitter:{card:'summary_large_image',title:name,description:body,images:[image]}};
}
