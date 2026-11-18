'use client';
import Image from 'next/image';
import {useEffect,useState} from 'react';
import {pick,type MarketingLocale} from '@/lib/marketing-content';
import evidence from '../../../public/product/stories/provenance.json';
export type StoryScreen='hero'|'property'|'prepare'|'promote'|'follow';
/** Real, focused workspace captures; source/state/viewport recorded in stories/provenance.json. */
export function FocusedShot({locale,screen,alt,priority=false}:{locale:MarketingLocale;screen:StoryScreen;alt:string;priority?:boolean}){
 const [mobileView,setMobileView]=useState(false);
 useEffect(()=>{const query=window.matchMedia('(max-width:600px)'),update=()=>setMobileView(query.matches);update();query.addEventListener('change',update);return()=>query.removeEventListener('change',update);},[]);
 const desktop=evidence.records.find(r=>r.locale===locale&&r.name===screen&&r.viewport.width===1440)!,mobile=evidence.records.find(r=>r.locale===locale&&r.name===screen&&r.viewport.width===375)!;
 const src=`/product/stories/${locale}-${screen}.webp`;
 return <figure className={`mx-evidence mx-evidence-${screen}`} data-screen={screen}>
  <a href={mobileView?`/product/stories/${locale}-${screen}-mobile.webp`:src} target="_blank" rel="noreferrer" onClick={e=>{const src=e.currentTarget.querySelector('img')?.currentSrc;if(src)e.currentTarget.href=new URL(src).pathname;}} aria-label={pick(locale,[`Enlarge screenshot: ${alt} (new tab)`,`تكبير لقطة الشاشة: ${alt} (علامة تبويب جديدة)`])}>
   <picture><source media="(max-width:600px)" srcSet={`/product/stories/${locale}-${screen}-mobile.webp`} width={Math.round(mobile.rectangle!.width)} height={Math.round(mobile.rectangle!.height)}/><Image unoptimized src={src} alt={alt} width={Math.round(desktop.rectangle!.width)} height={Math.round(desktop.rectangle!.height)} sizes="(max-width:600px) calc(100vw - 40px), 650px" loading={priority?'eager':'lazy'} fetchPriority={priority?'high':'auto'}/></picture>
   <span className="mx-enlarge" aria-hidden="true">↗</span>
  </a>
  <figcaption>{pick(locale,['Actual workspace detail · fictional demo','تفاصيل مساحة العمل الفعلية · تجربة خيالية'])}<span aria-hidden="true">↗</span></figcaption>
 </figure>;
}
