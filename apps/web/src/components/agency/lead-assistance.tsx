'use client';
import {useState} from 'react';
import {useLocale} from 'next-intl';
import {Sparkles} from 'lucide-react';
import {useGeminiDemo} from '@/components/gemini/demo-provider';
import {useRouter} from '@/i18n/navigation';
import {AssistancePanel} from './assistance-panel';
import {suggestedLeadReply} from '@/lib/crm-productivity';

export function LeadAssistance({leadId,onDraft,draft=''}:{leadId:string;onDraft?:(text:string)=>void;draft?:string}){
 const {state}=useGeminiDemo(),ar=useLocale()==='ar',t=(en:string,arabic:string)=>ar?arabic:en,router=useRouter();const [show,setShow]=useState(false);const lead=state.crm.leads.find(l=>l.id===leadId);if(!lead)return null;
 const property=state.properties[lead.propertyId],title=(ar?property?.facts.titleAr:property?.facts.titleEn)||lead.propertyId;
 const reply=suggestedLeadReply(lead,property,ar);
 return <div className="ag-lead-assistance"><button className="px-button px-button-outline" type="button" onClick={()=>setShow(true)}><Sparkles size={15}/>{t('Help with this enquiry','مساعدة في هذا الاستفسار')}</button>{show&&<AssistancePanel title={t('Review lead reply draft','مراجعة مسودة الرد')} sourceKey={JSON.stringify([lead,property?.revision,draft])} sources={[{label:t('Recorded enquiry','الاستفسار المسجل'),value:`${lead.identity.alias} · ${lead.source} · ${lead.stage} · ${lead.assignee||t('Unassigned','غير معيّن')}`},{label:t('Linked property','العقار المرتبط'),value:title},{label:t('Latest recorded enquiry message','آخر رسالة استفسار مسجلة'),value:lead.conversation.messages.filter(m=>m.direction==='inbound').at(-1)?.text||t('No inbound message recorded','لا توجد رسالة واردة مسجلة')},{label:t('Scope','النطاق'),value:t('No availability, consent or intent is inferred. Accepting fills the draft only; sending needs a separate action.','لا يُستنتج التوفر أو الموافقة أو النية. القبول يملأ المسودة فقط؛ الإرسال يحتاج إلى إجراء مستقل.')}]} fields={[{key:'reply',label:t('Reply draft','مسودة الرد'),before:draft,after:reply}]} acceptLabel={onDraft?t('Use reply draft','استخدام مسودة الرد'):t('Review a reply in Inbox','مراجعة الرد في الوارد')} onAccept={values=>{if(onDraft)onDraft(values.reply);else router.push(`/workspace/inbox?lead=${lead.id}`);}} onClose={()=>setShow(false)}/>}</div>;
}
