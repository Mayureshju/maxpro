'use client';

import {useState,useSyncExternalStore} from 'react';
import {useLocale} from 'next-intl';
import {ArrowRight,Check,HelpCircle,X} from 'lucide-react';
import {Link} from '@/i18n/navigation';
import {useGeminiDemo} from '@/components/gemini/demo-provider';
import {demoOrganizationId} from '@/lib/canonical-property';
import {activeOrganizationId} from '@/lib/organization-engine';
import {firstUseProgress} from '@/lib/first-use';

const preferenceEvent='maxpro-onboarding-preference';
const memory=new Map<string,boolean>();
function subscribe(listener:()=>void){window.addEventListener('storage',listener);window.addEventListener(preferenceEvent,listener);return()=>{window.removeEventListener('storage',listener);window.removeEventListener(preferenceEvent,listener);};}

export function GettingStarted(){
 const {state}=useGeminiDemo();const org=activeOrganizationId(state.organization);
 return <OrganizationGuide key={org} organizationId={org}/>;
}
function OrganizationGuide({organizationId}:{organizationId:string}){
 const {state}=useGeminiDemo();const ar=useLocale()==='ar',t=(en:string,arabic:string)=>ar?arabic:en;
 const key=`maxpro-ui-onboarding-${organizationId}`;
 const dismissed=useSyncExternalStore(subscribe,()=>{try{return localStorage.getItem(key)==='dismissed';}catch{return memory.get(key)??false;}},()=>false);
 const [opened,setOpened]=useState(false);const progress=firstUseProgress(state),p=progress.property;
 const established=state.jobs.some(j=>j.attempts.some(a=>a.status==='queued-demo'))||state.campaigns.some(c=>c.status==='simulated')||Object.values(state.properties).some(p=>p.sharing?.history.length);
 const automatic=organizationId!==demoOrganizationId&&!established&&!progress.complete&&!dismissed;
 function dismiss(){try{localStorage.setItem(key,'dismissed');}catch{memory.set(key,true);}window.dispatchEvent(new Event(preferenceEvent));setOpened(false);}
 const steps=[
  {label:t('Create your first property','إنشاء عقارك الأول'),done:!!p,href:p?`/workspace/inventory/${p.id}`:'/workspace/inventory/new'},
  {label:t('Complete listing information','إكمال معلومات الإعلان'),done:progress.content,href:p?`/workspace/inventory/${p.id}/edit`:'/workspace/inventory/new'},
  {label:t('Review your listing','مراجعة إعلانك'),done:progress.reviewed,href:p?`/workspace/inventory/${p.id}/edit?step=3`:'/workspace/inventory/new'},
  {label:t('Choose a promotion channel','اختيار قناة ترويج'),done:progress.prepared,href:p?`/workspace/publish?property=${p.id}`:'/workspace/inventory/new'},
  {label:t('Inspect publishing results','فحص نتائج النشر'),done:progress.outcome,href:p?`/workspace/inventory/${p.id}/publishing`:'/workspace/inventory/new'},
 ];
 if(!automatic&&!opened)return <button type="button" className="px-text-button ag-guide-help" onClick={()=>setOpened(true)}><HelpCircle size={16}/>{t('Getting-started help','مساعدة البداية')}</button>;
 const stepList=<ol>{steps.map((s,i)=><li key={s.label} className={s.done?'complete':''}><span aria-hidden="true">{s.done?<Check size={16}/>:i+1}</span><Link href={s.href}>{s.label}<small>{s.done?t('Saved','محفوظ'):t('To do','للتنفيذ')}</small></Link></li>)}</ol>;
 const next=steps.find(s=>!s.done);
 return <section className={`ag-getting-started ${progress.complete?'ag-guide-complete':''}`} aria-labelledby="getting-started-title"><header><div><span className="px-overline">{t('GETTING STARTED','البداية')}</span><h2 id="getting-started-title">{progress.complete?t('Setup complete. Your daily workspace is ready.','اكتمل التجهيز. مساحة عملك اليومية جاهزة.'):p?t('Pick up where you left off.','تابع من حيث توقفت.'):t('Welcome. Let’s add your first property.','مرحباً. لنضف عقارك الأول.')}</h2>{!progress.complete&&<p>{t('A fictional agency, saved only in this browser. Progress follows your saved records.','وكالة خيالية محفوظة في هذا المتصفح فقط. يتبع التقدم سجلاتك المحفوظة.')}</p>}{p&&<p className="ag-help">{(ar?p.facts.titleAr:p.facts.titleEn)||t('Your first draft','مسودتك الأولى')} · {steps.filter(s=>s.done).length} / 5</p>}</div><button type="button" className="ag-icon-button" aria-label={t('Dismiss getting-started guide','إخفاء دليل البداية')} onClick={dismiss}><X size={20}/></button></header><Link className="px-button px-button-dark" href={next?.href||(p?`/workspace/inventory/${p.id}`:'/workspace/inventory/new')}>{progress.complete?t('Open property','فتح العقار'):p?`${t('Continue','متابعة')} · ${next?.label}`:t('Start','ابدأ')}<ArrowRight size={16}/></Link>{progress.complete?<details><summary>{t('View completed steps','عرض الخطوات المكتملة')}</summary>{stepList}</details>:stepList}{!progress.complete&&<p className="ag-help">{t('After a portal simulation, open a fictional enquiry and try an agent reply. You can reopen this guide here anytime.','بعد محاكاة بوابة، افتح استفساراً خيالياً وجرّب رد الوكيل. يمكنك إعادة فتح الدليل هنا متى شئت.')}</p>}</section>;
}
