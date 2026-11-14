'use client';

import {ArrowLeft,ArrowRight,Bell,ChartColumn,House,Inbox,LayoutDashboard,Menu,Megaphone,PanelLeftClose,PanelLeftOpen,Plus,Settings,X} from 'lucide-react';
import {Suspense,useEffect,useRef,useState,useSyncExternalStore} from 'react';
import {useLocale} from 'next-intl';
import {usePathname,useSearchParams} from 'next/navigation';
import {Link} from '@/i18n/navigation';
import {BrandMark,LanguageLink} from '@/components/marketing/site-header';
import {PermissionSurface} from '@/components/gemini/organization-workspace';
import {useGeminiDemo} from '@/components/gemini/demo-provider';
import {usePrototypeCopy} from '@/components/prototype/use-prototype-copy';
import {findProperty} from '@/lib/canonical-property';
import {activeOrganizationId,workspaceOrganization} from '@/lib/organization-engine';

const links=[
 {href:'/workspace',name:['Dashboard','لوحة الوكالة'],icon:LayoutDashboard},
 {href:'/workspace/inventory',name:['Properties','العقارات'],icon:House},
 {href:'/workspace/publish',name:['Publish & Promote','النشر والترويج'],icon:Megaphone},
 {href:'/workspace/leads',name:['Leads & Inbox','الاستفسارات والوارد'],icon:Inbox},
 {href:'/workspace/analytics',name:['Performance','الأداء'],icon:ChartColumn},
 {href:'/workspace/settings',name:['Settings','الإعدادات'],icon:Settings},
];
const preferenceKey='maxpro-ui-sidebar-collapsed';
let memoryCollapsed=false;
function subscribePreference(listener:()=>void){window.addEventListener('storage',listener);window.addEventListener('maxpro-ui-preference',listener);return()=>{window.removeEventListener('storage',listener);window.removeEventListener('maxpro-ui-preference',listener);};}
function readPreference(){try{return localStorage.getItem(preferenceKey)==='true';}catch{return memoryCollapsed;}}
function groupFor(path:string){return /^\/workspace\/(inventory|studio)/.test(path)?'/workspace/inventory':/^\/workspace\/(publish|campaigns|ads)/.test(path)?'/workspace/publish':/^\/workspace\/(leads|inbox|whatsapp)/.test(path)?'/workspace/leads':path.startsWith('/workspace/analytics')?'/workspace/analytics':path==='/workspace'?'/workspace':'/workspace/settings';}

function Breadcrumbs({path,group}:{path:string;group:string}){
 const {state}=useGeminiDemo();const search=useSearchParams();const ar=useLocale()==='ar';const t=(en:string,arabic:string)=>ar?arabic:en;
 const section=links.find(l=>l.href===group)!;const crumbs:{label:string;href?:string}[]=[{label:section.name[ar?1:0],href:section.href}];
 const propertyId=path.match(/^\/workspace\/inventory\/([^/]+)/)?.[1]||(path==='/workspace/publish'?search.get('property'):null);
 const property=propertyId?findProperty(state.properties,propertyId):undefined;
 if(property){if(path==='/workspace/publish')crumbs[0]={label:t('Properties','العقارات'),href:'/workspace/inventory'};crumbs.push({label:(ar?property.facts.titleAr:property.facts.titleEn)||t('Untitled draft','مسودة دون عنوان'),href:`/workspace/inventory/${property.id}`});const end=path.split('/').at(-1);const labels:Record<string,string>={edit:t('Edit','تعديل'),media:t('Photos & details','الصور والتفاصيل'),enquiries:t('Enquiries','الاستفسارات'),publishing:t('Channel history','سجل القنوات'),publish:t('Publish & Promote','النشر والترويج')};if(end&&labels[end])crumbs.push({label:labels[end]});}
 else if(path.endsWith('/inventory/new'))crumbs.push({label:t('New property','عقار جديد')});
 else if(/^\/workspace\/leads\/LE-/.test(path)){const lead=state.crm.leads.find(l=>l.id===path.split('/').at(-1));crumbs.push({label:lead?.identity.alias||t('Lead details','تفاصيل الاستفسار')});}
 else if(path==='/workspace/inbox'){const lead=state.crm.leads.find(l=>l.id===search.get('lead'));crumbs.push({label:lead?.identity.alias||t('Inbox','الوارد')});}
 else if(path.startsWith('/workspace/campaigns')){crumbs.push({label:t('Campaigns','الحملات'),href:'/workspace/campaigns'});const campaign=state.campaigns.find(c=>c.id===path.split('/').at(-1));if(campaign)crumbs.push({label:ar?campaign.input.headlineAr:campaign.input.headlineEn});}
 else if(path!==section.href){const labels:Record<string,string>={integrations:t('Integrations','التكاملات'),team:t('Members','الأعضاء'),organization:t('Agency profile','ملف الوكالة'),billing:t('Billing & plan','الفوترة والباقة'),notifications:t('Notifications','الإشعارات'),'qatar-living':'Qatar Living','property-finder':'Property Finder','google-ads':'Google Ads','meta-catalog':'Facebook & Instagram',whatsapp:'WhatsApp Business',demo:t('Demo utilities','أدوات التجربة')};const end=path.split('/').at(-1)!;crumbs.push({label:labels[end]||t('Configuration','الإعداد')});}
 return <nav className="ws-breadcrumbs" aria-label={t('Breadcrumb','مسار التنقل')}><ol>{crumbs.map((c,i)=><li key={`${i}-${c.label}`} title={c.label}>{i<crumbs.length-1&&c.href?<Link href={c.href}>{c.label}</Link>:<span aria-current="page">{c.label}</span>}</li>)}</ol></nav>;
}

export function WorkspaceShell({children}:{children:React.ReactNode}){
 const copy=usePrototypeCopy(),ar=useLocale()==='ar',t=(en:string,arabic:string)=>ar?arabic:en;
 const {state}=useGeminiDemo();const organization=workspaceOrganization(state.organization);const agency=ar&&organization.nameAr?organization.nameAr:organization.name;
 const identity=state.organization.members.find(m=>m.organizationId===organization.id&&m.role===state.organization.actor&&m.status==='active-demo')?.alias||organization.name;
 const path=usePathname().replace(/^\/(en|ar)/,'');const group=groupFor(path);const current=links.find(l=>l.href===group)!;
 const collapsed=useSyncExternalStore(subscribePreference,readPreference,()=>false);const [open,setOpen]=useState(false);
 const opener=useRef<HTMLButtonElement>(null),sidebar=useRef<HTMLElement>(null);
 function toggleCollapse(){memoryCollapsed=!collapsed;try{localStorage.setItem(preferenceKey,String(memoryCollapsed));}catch{}window.dispatchEvent(new Event('maxpro-ui-preference'));}
 useEffect(()=>{
  if(!open)return;
  const trigger=opener.current,previousOverflow=document.body.style.overflow;document.body.style.overflow='hidden';
  const desktop=window.matchMedia('(min-width: 1025px)'),closeDesktop=()=>{if(desktop.matches)setOpen(false);};desktop.addEventListener('change',closeDesktop);
  const focusTimer=window.setTimeout(()=>sidebar.current?.querySelector<HTMLButtonElement>('.mobile-close')?.focus(),0);
  const onKey=(event:KeyboardEvent)=>{
   if(event.key==='Escape'){event.preventDefault();setOpen(false);return;}
   if(event.key!=='Tab')return;
   const items=Array.from(sidebar.current?.querySelectorAll<HTMLElement>('a[href],button:not([disabled])')??[]).filter(el=>el.getClientRects().length);
   const first=items[0],last=items.at(-1);
   if(event.shiftKey&&document.activeElement===first){event.preventDefault();last?.focus();}else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first?.focus();}
  };
  document.addEventListener('keydown',onKey);
  return()=>{window.clearTimeout(focusTimer);document.removeEventListener('keydown',onKey);desktop.removeEventListener('change',closeDesktop);document.body.style.overflow=previousOverflow;trigger?.focus();};
 },[open]);
 return <div className={`prototype-shell ${collapsed?'sidebar-collapsed':''}`}>
  {open&&<button className="sidebar-scrim" onClick={()=>setOpen(false)} aria-label={copy('Close navigation')}/>}
  <aside ref={sidebar} onTransitionEnd={e=>{if(open&&e.target===e.currentTarget&&e.propertyName==='transform'&&!sidebar.current?.contains(document.activeElement))sidebar.current?.querySelector<HTMLButtonElement>('.mobile-close')?.focus();}} id="workspace-sidebar" style={open?{visibility:'visible'}:undefined} className={`prototype-sidebar ${open?'is-open':''}`} role={open?'dialog':undefined} aria-modal={open?true:undefined} aria-label={t('Agency navigation','تنقل الوكالة')}>
   <div className="workspace-sidebar-header"><Link href="/" className="workspace-brand" aria-label="AqarPro"><span className="ws-full-brand"><BrandMark/></span><House className="ws-compact-brand" size={25}/></Link><button className="mobile-close" onClick={()=>setOpen(false)} aria-label={copy('Close navigation')}><X size={20}/></button></div>
   <div className="agency-identity" title={agency}><span className="agency-monogram" aria-hidden="true">{organization.name.split(' ').map(w=>w[0]).slice(0,2).join('')}</span><span className="ws-agency-name"><strong>{agency}</strong><small>{t('Agency · Demo organization','مساحة وكالة تجريبية')}</small></span></div>
   <nav id="workspace-navigation" className="prototype-nav" aria-label={t('Workspace navigation','التنقل في مساحة العمل')}><div className="prototype-nav-group"><div className="prototype-nav-heading">{t('YOUR WORKSPACE','مساحة عملك')}</div>{links.map(item=><Link key={item.href} href={item.href} onClick={()=>setOpen(false)} aria-label={item.name[ar?1:0]} aria-current={current.href===item.href?'page':undefined} className={`prototype-nav-item ${current.href===item.href?'is-current':''}`}><item.icon size={20} strokeWidth={1.8}/><span className="ws-nav-label">{item.name[ar?1:0]}</span><span className="ws-nav-tooltip" aria-hidden="true">{item.name[ar?1:0]}</span>{current.href===item.href&&<span className="prototype-nav-indicator"/>}</Link>)}</div></nav>
   <div className="prototype-nav-footer"><button type="button" className="ws-collapse" aria-expanded={!collapsed} aria-controls="workspace-navigation" aria-label={t(collapsed?'Expand sidebar':'Collapse sidebar',collapsed?'توسيع الشريط الجانبي':'طي الشريط الجانبي')} title={t(collapsed?'Expand sidebar':'Collapse sidebar',collapsed?'توسيع الشريط الجانبي':'طي الشريط الجانبي')} onClick={toggleCollapse}>{collapsed?<PanelLeftOpen size={20}/>:<PanelLeftClose size={20}/>}<span>{t('Collapse sidebar','طي الشريط الجانبي')}</span></button><Link href="/sign-in" className="sidebar-website-link" aria-label={t('Switch demo agency','تغيير الوكالة التجريبية')} title={t('Switch demo agency','تغيير الوكالة التجريبية')}>{ar?<ArrowRight size={17}/>:<ArrowLeft size={17}/>}<span className="ws-nav-label">{t('Switch demo agency','تغيير الوكالة التجريبية')}</span></Link><span className="demo-environment"><span className="demo-dot"/><span className="ws-nav-label">{t('FICTIONAL AGENCY WORKSPACE','النموذج التفاعلي فقط')}</span></span></div>
  </aside>
  <div className="prototype-app" inert={open}><header className="prototype-topbar"><div className="topbar-leading"><button ref={opener} aria-expanded={open} aria-controls="workspace-sidebar" className="mobile-open" onClick={()=>setOpen(true)} aria-label={copy('Open navigation')}><Menu size={21}/></button><div className="ws-header-context"><Suspense fallback={<strong>{current.name[ar?1:0]}</strong>}><Breadcrumbs path={path} group={group}/></Suspense><span className="ws-mobile-agency" title={agency}>{agency}</span></div></div><div className="prototype-topbar-end"><span className="ws-header-agency" title={agency}>{agency}<small>{t('Local demo','تجربة محلية')}</small></span>{path==='/workspace/inventory'&&<Link className="px-button px-button-dark ws-header-action" href="/workspace/inventory/new"><Plus size={16}/>{t('Add property','إضافة عقار')}</Link>}<LanguageLink/><Link href="/workspace/notifications" className="topbar-utility" aria-label={copy('Notifications')}><Bell size={19}/></Link><Link href="/workspace/settings" className="topbar-user" aria-label={t('Profile & settings','الملف والإعدادات')} title={identity}>{identity.split(' ').map(w=>w[0]).slice(0,2).join('')}</Link></div></header>
   <main id="main-content" className="prototype-main"><PermissionSurface key={activeOrganizationId(state.organization)}>{children}</PermissionSurface></main>
   <footer className="prototype-app-footer"><span>{t('Fictional local demo · plans QAR 179 / 725 / 1,800+ are illustrative pending approval. No external services connected.','تجربة محلية خيالية · الباقات 179 / 725 / +1,800 ر.ق توضيحية بانتظار الموافقة. لا توجد خدمات خارجية متصلة.')}</span><span>© 2026 MaxPro</span></footer>
  </div>
 </div>;
}
