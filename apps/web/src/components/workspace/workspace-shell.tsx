'use client';
import {usePrototypeCopy} from '@/components/prototype/use-prototype-copy';

import {ArrowLeft,ArrowRight,Bell,ChartColumn,House,Inbox,LayoutDashboard,Menu,Megaphone,Settings,X} from 'lucide-react';
import {useEffect,useRef,useState} from 'react';import {useLocale} from 'next-intl';import {usePathname} from 'next/navigation';import {Link} from '@/i18n/navigation';import {BrandMark, LanguageLink} from '@/components/marketing/site-header';
import {PermissionSurface} from '@/components/gemini/organization-workspace';
import {useGeminiDemo} from '@/components/gemini/demo-provider';
import {activeOrganizationId,workspaceOrganization} from '@/lib/organization-engine';
const sections = [{heading:['YOUR WORKSPACE','مساحة عملك'],links:[
 {href:'/workspace',name:['Dashboard','لوحة الوكالة'],icon:LayoutDashboard},
 {href:'/workspace/inventory',name:['Properties','العقارات'],icon:House},
 {href:'/workspace/publish',name:['Publish & Promote','النشر والترويج'],icon:Megaphone},
 {href:'/workspace/leads',name:['Leads & Inbox','الاستفسارات والوارد'],icon:Inbox},
 {href:'/workspace/analytics',name:['Performance','الأداء'],icon:ChartColumn},
 {href:'/workspace/settings',name:['Settings','الإعدادات'],icon:Settings},
]}];

export function WorkspaceShell({children}:{children:React.ReactNode}) {const copyText=usePrototypeCopy();
  const {state}=useGeminiDemo();const organization=workspaceOrganization(state.organization);const identity=state.organization.members.find(member=>member.organizationId===organization.id&&member.role===state.organization.actor&&member.status==='active-demo')?.alias||organization.name;
  const pathname=usePathname(); const locale=useLocale(); const ar=locale==='ar'; const [open,setOpen]=useState(false);
  const opener=useRef<HTMLButtonElement>(null);const sidebar=useRef<HTMLElement>(null);
  useEffect(()=>{
    if(!open)return;
    const openerButton=opener.current;const previousOverflow=document.body.style.overflow;document.body.style.overflow='hidden';const desktop=window.matchMedia('(min-width: 801px)');const closeDesktop=()=>{if(desktop.matches)setOpen(false)};desktop.addEventListener('change',closeDesktop);
    sidebar.current?.querySelector<HTMLButtonElement>('.mobile-close')?.focus();
    const onKeyDown=(event:KeyboardEvent)=>{
      if(event.key==='Escape'){event.preventDefault();setOpen(false);return;}
      if(event.key!=='Tab')return;
      const items=Array.from(sidebar.current?.querySelectorAll<HTMLElement>('a[href],button:not([disabled]),input:not([disabled]),select:not([disabled])')??[]).filter(item=>item.getClientRects().length);
      const first=items[0];const last=items.at(-1);
      if(event.shiftKey&&document.activeElement===first){event.preventDefault();last?.focus();}
      else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first?.focus();}
    };
    document.addEventListener('keydown',onKeyDown);
    return ()=>{document.removeEventListener('keydown',onKeyDown);desktop.removeEventListener('change',closeDesktop);document.body.style.overflow=previousOverflow;openerButton?.focus();};
  },[open]);
  const path=pathname.replace(/^\/(en|ar)/,'');
  const group=/^\/workspace\/(inventory|studio)/.test(path)?'/workspace/inventory':/^\/workspace\/(publish|campaigns|ads)/.test(path)?'/workspace/publish':/^\/workspace\/(leads|inbox|whatsapp)/.test(path)?'/workspace/leads':path.startsWith('/workspace/analytics')?'/workspace/analytics':path==='/workspace'?'/workspace':'/workspace/settings';
  const current=sections[0].links.find(link=>link.href===group);
  const filteredSections=sections;
  const nav = <>
    <div className="workspace-sidebar-header"><Link href="/" className="workspace-brand"><BrandMark/></Link><button className="mobile-close" onClick={()=>setOpen(false)} aria-label={copyText("Close navigation")}><X size={19}/></button></div>
    <div className="agency-identity"><span className="agency-monogram">{copyText(organization.name.split(' ').map(x=>x[0]).slice(0,2).join(''))}</span><span><strong>{copyText(ar&&organization.nameAr?organization.nameAr:organization.name)}</strong><small>{copyText(ar?'مساحة وكالة تجريبية':'Agency · Demo organization')}</small></span></div>
    <nav id="workspace-navigation" className="prototype-nav" aria-label={copyText(ar?'التنقل في مساحة العمل':'Workspace navigation')}>
      {filteredSections.map(section=><div className="prototype-nav-group" key={section.heading[0]}><div className="prototype-nav-heading">{copyText(section.heading[ar?1:0])}</div>{section.links.map(item=>{
        const selected=current?.href===item.href;
        return <Link onClick={()=>setOpen(false)} key={item.href} href={item.href} aria-current={selected?'page':undefined} className={`prototype-nav-item ${selected?'is-current':''}`}><item.icon size={17} strokeWidth={1.8}/><span>{copyText(item.name[ar?1:0])}</span>{selected&&<span className="prototype-nav-indicator"/>}</Link>;
      })}</div>)}
    {!filteredSections.length&&<p className="fx-nav-empty" role="status">{ar?'لا توجد وجهة مطابقة. غيّر البحث.':'No matching destination. Try another search.'}</p>}</nav>
    <div className="prototype-nav-footer"><Link href="/sign-in" className="sidebar-website-link">{ar?<ArrowRight size={16}/>:<ArrowLeft size={16}/>} {copyText(ar?'تغيير الوكالة التجريبية':'Switch demo agency')}</Link><span className="demo-environment"><span className="demo-dot"/>{copyText(ar?'النموذج التفاعلي فقط':'FICTIONAL AGENCY WORKSPACE')}</span></div>
  </>;
  return <div className="prototype-shell">
    {open&&<button className="sidebar-scrim" onClick={()=>setOpen(false)} aria-label={copyText("Close navigation")}/>}
    <aside ref={sidebar} className={`prototype-sidebar ${open?'is-open':''}`}>{nav}</aside>
    <div className="prototype-app"><header className="prototype-topbar"><div className="topbar-leading"><button ref={opener} aria-expanded={open} aria-controls="workspace-navigation" className="mobile-open" onClick={()=>setOpen(true)} aria-label={copyText("Open navigation")}><Menu size={20}/></button><span className="topbar-crumb">{copyText(ar&&organization.nameAr?organization.nameAr:organization.name)}</span><span className="topbar-divider-char">/</span><strong>{copyText(current?.name[ar?1:0]??(ar?'نظرة عامة':'Overview'))}</strong></div><div className="prototype-topbar-end"><span className="preview-chip"><span/>{copyText(ar?'تجربة محلية':'Local demo')}</span><LanguageLink/><Link aria-label={copyText("Notifications")} href="/workspace/notifications" className="topbar-utility"><Bell size={18}/><i/></Link><Link href="/workspace/settings" aria-label={copyText("Settings")} className="topbar-user">{identity.split(' ').map(word=>word[0]).slice(0,2).join('')}</Link></div></header>
      <main id="main-content" className="prototype-main" inert={open}><PermissionSurface key={activeOrganizationId(state.organization)}>{children}</PermissionSurface></main>
      <footer className="prototype-app-footer"><span>{copyText(ar?'تجربة محلية خيالية · الباقات 179 / 725 / +1,800 ر.ق توضيحية بانتظار الموافقة. لا توجد خدمات خارجية متصلة.':'Fictional local demo · plans QAR 179 / 725 / 1,800+ are illustrative pending approval. No external services connected.')}</span><span>{copyText("© 2026 MaxPro · Gemini-aligned v3")}</span></footer>
    </div>
  </div>;
}
