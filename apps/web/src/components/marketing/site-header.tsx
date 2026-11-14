'use client';
import Link from 'next/link';
import Image from 'next/image';
import {ArrowUpRight,ChevronDown,Globe2,Menu,X} from 'lucide-react';
import {useLocale} from 'next-intl';
import {usePathname,useRouter} from 'next/navigation';
import {useEffect,useRef,useState} from 'react';
import {Link as LocaleLink} from '@/i18n/navigation';
import {demoLabel,featureLinks,pick,publicBrand} from '@/lib/marketing-content';
export function BrandMark({compact=false}:{compact?:boolean}){
 return <span className={`brand${compact?' brand-compact':''}`}><Image className="brand-logo" src={publicBrand.logo} alt={publicBrand.logoAlt} width={1356} height={330} sizes="164px"/></span>;
}
export function LanguageLink(){const locale=useLocale(),pathname=usePathname(),router=useRouter(),nextLocale=locale==='ar'?'en':'ar';const path=pathname.replace(/^\/(en|ar)(?=\/|$)/,`/${nextLocale}`);return <Link href={path} className="language-link" lang={nextLocale} onClick={e=>{e.preventDefault();router.push(`${path}${window.location.search}${window.location.hash}`)}} aria-label={nextLocale==='ar'?'Switch to Arabic':'Switch to English'}><Globe2 size={16}/>{nextLocale==='ar'?'العربية':'English'}</Link>}
export function SiteHeader(){
 const locale=useLocale(),ar=locale==='ar',t=(en:string,arabic:string)=>ar?arabic:en;
 const [expanded,setExpanded]=useState(false),[scrolled,setScrolled]=useState(false);
 const dialog=useRef<HTMLDialogElement>(null),trigger=useRef<HTMLButtonElement>(null),header=useRef<HTMLElement>(null);
 const pathname=usePathname();
 useEffect(()=>{const update=()=>setScrolled(window.scrollY>24);update();window.addEventListener('scroll',update,{passive:true});return()=>window.removeEventListener('scroll',update)},[]);
 useEffect(()=>{if(!expanded)return;const node=dialog.current,returnFocus=trigger.current,previous=document.body.style.overflow;node?.showModal();document.body.style.overflow='hidden';return()=>{node?.close();document.body.style.overflow=previous;returnFocus?.focus()}},[expanded]);
 useEffect(()=>{const close=(e:PointerEvent)=>{if(!header.current?.contains(e.target as Node))header.current?.querySelectorAll('details[open]').forEach(d=>d.removeAttribute('open'))};document.addEventListener('pointerdown',close);return()=>document.removeEventListener('pointerdown',close)},[]);
 const link=(href:string,label:string)=> <LocaleLink href={href} aria-current={pathname===`/${locale}${href}`?'page':undefined} onClick={()=>{setExpanded(false);header.current?.querySelectorAll('details[open]').forEach(d=>d.removeAttribute('open'))}}>{label}</LocaleLink>;
 return <header ref={header} className={`site-header mk-header ${scrolled?'is-scrolled':''}`} onKeyDown={e=>{if(e.key==='Escape'){const details=header.current?.querySelector('details[open]');details?.removeAttribute('open');(details?.querySelector('summary') as HTMLElement)?.focus()}}}>
  <a className="mk-skip" href="#main-content">{t('Skip to content','انتقل إلى المحتوى')}</a>
  <div className="container header-inner"><LocaleLink href="/" className="logo-link" aria-label={t('AqarPro home','الرئيسية لعقار برو')}><BrandMark/></LocaleLink>
   <nav className="desktop-nav" aria-label={t('Main navigation','التنقل الرئيسي')}>
    {link('/solutions',t('Platform','المنصة'))}{link('/solutions/agencies',t('Solutions','الحلول'))}
    <details className="mk-nav-disclosure"><summary>{t('Features','المزايا')}<ChevronDown size={14}/></summary><div>{featureLinks.map(f=><span key={f.slug}>{link(`/features/${f.slug}`,pick(locale,f.title))}</span>)}{link('/how-it-works',t('How it works','كيف تعمل المنصة'))}</div></details>
    {link('/integrations',t('Integrations','التكاملات'))}{link('/pricing',t('Pricing','الأسعار'))}
   </nav><div className="header-actions"><LocaleLink href="/sign-in" className="header-sign-in">{t('Sign in','تسجيل الدخول')}</LocaleLink><LanguageLink/><LocaleLink href="/sign-in" className="mk-button mk-primary header-cta">{pick(locale,demoLabel)}<ArrowUpRight size={16}/></LocaleLink><button ref={trigger} type="button" className="mobile-menu-toggle" onClick={()=>setExpanded(true)} aria-label={t('Open navigation','فتح القائمة')} aria-haspopup="dialog" aria-expanded={expanded} aria-controls="marketing-mobile-menu"><Menu size={23}/></button></div>
  </div>
  <dialog ref={dialog} id="marketing-mobile-menu" className="mk-mobile-dialog" aria-label={t('Mobile navigation','قائمة التنقل')} onKeyDown={e=>{if(e.key!=='Tab')return;const controls=Array.from(e.currentTarget.querySelectorAll<HTMLElement>('a[href],button:not([disabled])'));const first=controls[0],last=controls[controls.length-1];if(e.shiftKey&&document.activeElement===first){e.preventDefault();last?.focus()}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first?.focus()}}} onCancel={e=>{e.preventDefault();setExpanded(false)}} onClick={e=>{if(e.target===e.currentTarget)setExpanded(false)}}>
   <div className="mk-mobile-top"><BrandMark/><button type="button" autoFocus aria-label={t('Close navigation','إغلاق القائمة')} onClick={()=>setExpanded(false)}><X size={24}/></button></div>
   <nav aria-label={t('Mobile navigation','التنقل على الهاتف')}>{link('/solutions',t('Platform overview','نظرة على المنصة'))}{link('/solutions/agencies',t('For agencies','للوكالات'))}<span className="mk-label">{t('Features','المزايا')}</span>{featureLinks.map(f=><span className="mk-mobile-feature" key={f.slug}>{link(`/features/${f.slug}`,pick(locale,f.title))}</span>)}{link('/integrations',t('Integrations','التكاملات'))}{link('/pricing',t('Pricing','الأسعار'))}{link('/how-it-works',t('How it works','كيف تعمل المنصة'))}{link('/sign-in',t('Explore interactive demo','استكشف النموذج التفاعلي'))}</nav>
   <p className="mk-fine">{t('Fictional prototype · no live connections','نموذج خيالي · لا توجد اتصالات فعلية')}</p>
  </dialog>
 </header>;
}
