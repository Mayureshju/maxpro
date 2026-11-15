'use client';
import Image from 'next/image';
import {useEffect,useState} from 'react';
import {pick} from '@/lib/marketing-content';

const details=new Set(['dashboard','editor','assistance','publish','review','campaign','inbox','leads']);
export function ProductShot({locale,screen,alt,priority=false,caption=true,mode='overview',switchable=false}:{locale:string;screen:string;alt:string;priority?:boolean;caption?:boolean;mode?:'overview'|'detail';switchable?:boolean}){
 const [view,setView]=useState(mode),[mobile,setMobile]=useState(false);
 useEffect(()=>{const media=window.matchMedia('(max-width: 600px)'),update=()=>setMobile(media.matches);update();media.addEventListener('change',update);return()=>media.removeEventListener('change',update)},[]);
 const sourceScreen=screen==='leads'?'inbox':screen==='publish'?'review':screen;
 const focused=view==='detail'&&details.has(screen),source=`/product/${locale}-${focused?screen:sourceScreen}${focused?'-detail':''}.webp`,mobileSource=focused?screen==='assistance'?source:`/product/${locale}-${screen}-detail-mobile.webp`:`/product/${locale}-${sourceScreen}-mobile.webp`;
 const size=focused?(screen==='assistance'?[560,1000]:screen==='editor'?[856,locale==='ar'?531:540]:screen==='dashboard'?[1128,660]:screen==='publish'?[1128,740]:screen==='review'||screen==='campaign'?[1128,450]:[856,625]):[1440,1000];
 return <figure className={`mk-shot ${focused?'mk-shot-detail':'mk-shot-overview'}`} data-view={focused?'detail':'overview'} data-screen={screen}>
  <div className="mk-shot-bar"><span className="mk-window-dots" aria-hidden="true"><i/><i/><i/></span><span>{pick(locale,['Actual workspace · fictional demo','مساحة العمل الفعلية · تجربة خيالية'])}</span>{switchable&&details.has(screen)?<div className="mk-shot-modes" role="group" aria-label={pick(locale,['Screenshot view','عرض لقطة الشاشة'])}>{(['detail','overview'] as const).map(v=><button type="button" key={v} aria-pressed={view===v} onClick={()=>setView(v)}>{pick(locale,v==='detail'?['Feature detail','تفاصيل الميزة']:['Full workspace','مساحة العمل كاملة'])}</button>)}</div>:<span>{pick(locale,focused?['Feature detail','تفاصيل الميزة']:['Workspace overview','نظرة على مساحة العمل'])}</span>}</div>
  <a href={mobile?mobileSource:source} target="_blank" rel="noreferrer" onClick={e=>{const img=e.currentTarget.querySelector('img');if(img?.currentSrc)e.currentTarget.setAttribute('href',new URL(img.currentSrc).pathname)}} aria-label={pick(locale,[`Enlarge screenshot: ${alt} (new tab)`,`تكبير لقطة الشاشة: ${alt} (علامة تبويب جديدة)`])}><picture key={source}><source media="(max-width: 600px)" srcSet={mobileSource} width={focused&&screen==='assistance'?560:focused&&screen==='editor'?343:375} height={focused?screen==='assistance'?1000:screen==='dashboard'?512:screen==='editor'?426:screen==='review'?354:screen==='inbox'||screen==='leads'?732:748:812}/><Image unoptimized src={source} alt={alt} width={size[0]} height={size[1]} sizes="(max-width: 760px) 100vw, 1240px" fetchPriority={priority?'high':'auto'} loading={priority?'eager':'lazy'}/></picture><span className="mk-shot-enlarge" aria-hidden="true">↗</span></a>
  {caption&&<figcaption><span>{alt}{focused&&<> · {pick(locale,['Screenshot detail','تفاصيل من الشاشة'])}</>}</span><span>{pick(locale,['Enlarge image ↗','تكبير الصورة ↖'])}</span></figcaption>}
 </figure>;
}
