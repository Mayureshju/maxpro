'use client';
import {useState} from 'react';
import {useLocale} from 'next-intl';
import {ArrowRight,Bell,CheckCheck} from 'lucide-react';
import {Link} from '@/i18n/navigation';
import {useGeminiDemo} from '@/components/gemini/demo-provider';
import {Intro,Notice,Section} from './primitives';
export function NotificationsPage(){
 const ar=useLocale()==='ar';const t=(en:string,arabic:string)=>ar?arabic:en;const {state}=useGeminiDemo();
 const [read,setRead]=useState<string[]>([]);
 const notices=[
  ...state.jobs.filter(j=>j.status==='blocked-demo').map(j=>({id:j.id,title:t('Publishing attempt needs attention','محاولة نشر تحتاج إلى الاهتمام'),detail:`${j.listingId} · ${j.destination}`,href:'/workspace/hub/jobs'})),
  ...state.crm.leads.filter(l=>l.stage==='New'||!l.assignee).map(l=>({id:l.id,title:l.identity.alias,detail:t(`${l.source} · ${l.propertyId} · ${l.assignee?'New enquiry':'Assignment needed'}`,`${l.source} · ${l.propertyId} · ${l.assignee?'استفسار جديد':'يلزم تعيين مسؤول'}`),href:`/workspace/leads/${l.id}`})),
  ...state.campaigns.filter(c=>['pending-policy','pending-advertiser','pending-admin'].includes(c.status)).map(c=>({id:`${c.id}-${c.revision}`,title:t('Campaign review requested','طُلبت مراجعة الحملة'),detail:`${c.input.propertyId} · ${c.input.channel}`,href:`/workspace/campaigns/${c.id}`})),
 ];
 const unread=notices.filter(n=>!read.includes(n.id)).length;
 return <><Intro eyebrow={t('ORGANIZATION / ACTIVITY','المؤسسة / النشاط')} title={t('Notifications','الإشعارات')} description={t('Follow the work that needs a response in this organization.','تابع العمل الذي يحتاج إلى استجابة في هذه المؤسسة.')} action={<button type="button" className="px-button px-button-outline" disabled={!unread} onClick={()=>setRead(notices.map(n=>n.id))}><CheckCheck size={16}/>{t('Mark all read (demo)','تحديد الكل كمقروء (تجريبي)')}</button>}/><Section title={t('Activity feed','سجل النشاط')} subtitle={t(`${unread} unread · derived from local jobs, leads and campaign reviews`,`${unread} غير مقروءة · مستمدة من المهام والعملاء ومراجعات الحملات المحلية`)}><div className="px-notification-list">{notices.map(n=><div key={n.id} className={read.includes(n.id)?'read':''}><span className="px-notification-bell"><Bell size={18}/></span><div><Link href={n.href}><strong>{n.title}</strong><small>{n.detail}</small></Link></div><button type="button" disabled={read.includes(n.id)} onClick={()=>setRead(p=>[...p,n.id])}>{read.includes(n.id)?t('Read','مقروء'):t('Mark read','تحديد كمقروء')}</button></div>)}</div>{!notices.length&&<div className="fx-empty"><CheckCheck size={26}/><h3>{t('You’re all caught up','أنت مطّلع على كل شيء')}</h3><p>{t('New local enquiries, blocked jobs and campaign reviews will appear here.','ستظهر هنا الاستفسارات المحلية الجديدة والمهام المحظورة ومراجعات الحملات.')}</p><Link className="px-text-link" href="/workspace">{t('Back to control tower','العودة إلى مركز العمليات')}<ArrowRight size={15}/></Link></div>}</Section><Notice>{t('Activity is derived from this browser’s fictional records. Read markers last for this view only; no notification was delivered.','النشاط مستمد من السجلات الخيالية في هذا المتصفح. تبقى علامات القراءة في هذا العرض فقط؛ لم يتم إرسال أي إشعار.')}</Notice></>;
}
