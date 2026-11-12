'use client';

import {Activity,ArrowLeft,ArrowRight,BadgeCheck,Bell,BookOpen,BriefcaseBusiness,ChartColumn,ChevronDown,ClipboardCheck,CreditCard,FileClock,FolderKanban,Globe2,House,Inbox,LayoutDashboard,Menu,Megaphone,MessageSquare,Network,ShieldCheck,SlidersHorizontal,Sparkles,Users,X} from 'lucide-react';import type {ComponentType} from 'react';
import {useEffect,useRef,useState} from 'react';import {useLocale} from 'next-intl';import {usePathname} from 'next/navigation';import {Link} from '@/i18n/navigation';import {BrandMark, LanguageLink} from '@/components/marketing/site-header';
const sections: {heading:[string,string];links:{href:string;name:[string,string];icon:ComponentType<{size?:number;strokeWidth?:number}>}[]}[] = [
  {heading:['PROPERTY OPERATIONS','إدارة العقارات'],links:[
    {href:'/workspace',name:['Control tower','مركز العمليات'],icon:LayoutDashboard},
    {href:'/workspace/inventory',name:['Property inventory','قائمة العقارات'],icon:House},
    {href:'/workspace/studio',name:['AI Listing Studio','استوديو الإعلانات الذكي'],icon:Sparkles},
    {href:'/workspace/publish',name:['Publish a listing','نشر العقار'],icon:ArrowRight},
    {href:'/workspace/leads',name:['Lead CRM','إدارة العملاء'],icon:FolderKanban},
    {href:'/workspace/inbox',name:['Unified inbox','صندوق الوارد'],icon:Inbox},
    {href:'/workspace/leads/viewings',name:['Viewings','زيارات العقارات'],icon:FileClock},
  ]},
  {heading:['CONNECTOR HUB','مركز التكاملات'],links:[
    {href:'/workspace/hub',name:['Distribution overview','نظرة التوزيع'],icon:Network},
    {href:'/workspace/hub/marketplace',name:['Connector marketplace','دليل التكاملات'],icon:BriefcaseBusiness},
    {href:'/workspace/hub/feeds',name:['Feeds & schemas','التغذيات والمخططات'],icon:BookOpen},
    {href:'/workspace/hub/jobs',name:['Publishing activity','أنشطة النشر'],icon:FileClock},
    {href:'/workspace/hub/mappings',name:['Field mappings','ربط الحقول'],icon:SlidersHorizontal},
  ]},
  {heading:['GROWTH & MEASUREMENT','النمو والتحليلات'],links:[
    {href:'/workspace/campaigns',name:['Marketing campaigns','الحملات التسويقية'],icon:Megaphone},
    {href:'/workspace/integrations/meta-catalog',name:['Meta catalogue','كتالوج ميتا'],icon:Network},
    {href:'/workspace/integrations/google-ads',name:['Google Ads / PMax','إعلانات جوجل'],icon:ChartColumn},
    {href:'/workspace/integrations/ga4',name:['GA4 & events','تحليلات جوجل'],icon:Activity},
    {href:'/workspace/analytics',name:['Performance analytics','تحليلات الأداء'],icon:ChartColumn},
    {href:'/workspace/integrations/whatsapp',name:['WhatsApp setup','إعداد واتساب'],icon:MessageSquare},
  ]},
  {heading:['ORGANIZATION','المؤسسة'],links:[
    {href:'/workspace/leads/assignment',name:['Lead routing rules','قواعد توزيع العملاء'],icon:Users},
    {href:'/workspace/team',name:['Team & access','الفريق والصلاحيات'],icon:Users},
    {href:'/workspace/settings/domains',name:['Brand & domains','العلامة والنطاقات'],icon:Globe2},
    {href:'/workspace/billing',name:['Plans & entitlements','الباقات والحدود'],icon:CreditCard},
    {href:'/workspace/verification',name:['Verification','التحقق'],icon:BadgeCheck},
  ]},
  {heading:['SUPER ADMIN','الإدارة العامة'],links:[
    {href:'/workspace/admin',name:['Admin overview','لوحة الإدارة'],icon:ShieldCheck},
    {href:'/workspace/admin/connector-health',name:['Connector health','حالة التكاملات'],icon:Activity},
    {href:'/workspace/admin/moderation',name:['Moderation','المراجعة'],icon:ClipboardCheck},
    {href:'/workspace/admin/audit',name:['Audit log','سجل التدقيق'],icon:FileClock},
  ]},
];

export function WorkspaceShell({children}:{children:React.ReactNode}) {
  const pathname=usePathname(); const locale=useLocale(); const ar=locale==='ar'; const [open,setOpen]=useState(false);
  const opener=useRef<HTMLButtonElement>(null);const sidebar=useRef<HTMLElement>(null);
  useEffect(()=>{
    if(!open)return;
    const openerButton=opener.current;
    sidebar.current?.querySelector<HTMLButtonElement>('.mobile-close')?.focus();
    const onKeyDown=(event:KeyboardEvent)=>{
      if(event.key==='Escape'){event.preventDefault();setOpen(false);return;}
      if(event.key!=='Tab')return;
      const items=Array.from(sidebar.current?.querySelectorAll<HTMLElement>('a[href],button:not([disabled])')??[]).filter(item=>item.getClientRects().length);
      const first=items[0];const last=items.at(-1);
      if(event.shiftKey&&document.activeElement===first){event.preventDefault();last?.focus();}
      else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first?.focus();}
    };
    document.addEventListener('keydown',onKeyDown);
    return ()=>{document.removeEventListener('keydown',onKeyDown);openerButton?.focus();};
  },[open]);
  const current=sections.flatMap(s=>s.links).filter(l=>pathname.endsWith(l.href) || pathname.includes(`${l.href}/`)).sort((a,b)=>b.href.length-a.href.length)[0];
  const nav = <>
    <div className="workspace-sidebar-header"><Link href="/" className="workspace-brand"><BrandMark/></Link><button className="mobile-close" onClick={()=>setOpen(false)} aria-label="Close navigation"><X size={19}/></button></div>
    <div className="agency-identity"><span className="agency-monogram">PG</span><span><strong>Pearl Gate Realty</strong><small>{ar?'مساحة وكالة تجريبية':'Agency · Demo organization'}</small></span><ChevronDown size={16}/></div>
    <nav id="workspace-navigation" className="prototype-nav" aria-label={ar?'التنقل في مساحة العمل':'Workspace navigation'}>
      {sections.map(section=><div className="prototype-nav-group" key={section.heading[0]}><div className="prototype-nav-heading">{section.heading[ar?1:0]}</div>{section.links.map(item=>{
        const selected=current?.href===item.href;
        return <Link onClick={()=>setOpen(false)} key={item.href} href={item.href} aria-current={selected?'page':undefined} className={`prototype-nav-item ${selected?'is-current':''}`}><item.icon size={17} strokeWidth={1.8}/><span>{item.name[ar?1:0]}</span>{selected&&<span className="prototype-nav-indicator"/>}</Link>;
      })}</div>)}
    </nav>
    <div className="prototype-nav-footer"><Link href="/" className="sidebar-website-link">{ar?<ArrowRight size={16}/>:<ArrowLeft size={16}/>} {ar?'الموقع العام':'Back to public website'}</Link><span className="demo-environment"><span className="demo-dot"/>{ar?'النموذج التفاعلي فقط':'GEMINI PRD DEMO · NO LIVE INTEGRATIONS'}</span></div>
  </>;
  return <div className="prototype-shell">
    {open&&<button className="sidebar-scrim" onClick={()=>setOpen(false)} aria-label="Close navigation"/>}
    <aside ref={sidebar} className={`prototype-sidebar ${open?'is-open':''}`}>{nav}</aside>
    <div className="prototype-app"><header className="prototype-topbar"><div className="topbar-leading"><button ref={opener} aria-expanded={open} aria-controls="workspace-navigation" className="mobile-open" onClick={()=>setOpen(true)} aria-label="Open navigation"><Menu size={20}/></button><span className="topbar-crumb">{ar?'المؤسسة':'Pearl Gate Realty'}</span><span className="topbar-divider-char">/</span><strong>{current?.name[ar?1:0]??(ar?'نظرة عامة':'Overview')}</strong></div><div className="prototype-topbar-end"><span className="preview-chip"><span/>{ar?'وضع المعاينة':'Preview mode'}</span><LanguageLink/><Link aria-label="Notifications" href="/workspace/notifications" className="topbar-utility"><Bell size={18}/><i/></Link><Link href="/workspace/settings" aria-label="Settings" className="topbar-user">YM</Link></div></header>
      <main id="main-content" className="prototype-main">{children}</main>
      <footer className="prototype-app-footer"><span>{ar?'تجربة محلية خيالية · الباقات 179 / 725 / +1,800 ر.ق توضيحية بانتظار الموافقة. لا توجد خدمات خارجية متصلة.':'Fictional local demo · plans QAR 179 / 725 / 1,800+ are illustrative pending approval. No external services connected.'}</span><span>© 2026 MaxPro · Gemini-aligned v3</span></footer>
    </div>
  </div>;
}
