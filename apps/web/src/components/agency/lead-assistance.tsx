'use client';
import {useState} from 'react';
import {useLocale} from 'next-intl';
import {Sparkles} from 'lucide-react';
import {useGeminiDemo} from '@/components/gemini/demo-provider';
import {Link} from '@/i18n/navigation';

export function LeadAssistance({leadId,onDraft}:{leadId:string;onDraft?:(text:string)=>void}){
 const {state}=useGeminiDemo();const ar=useLocale()==='ar';const t=(en:string,arabic:string)=>ar?arabic:en;const [show,setShow]=useState(false);const l=state.crm.leads.find(l=>l.id===leadId);if(!l)return null;
 const p=state.properties[l.propertyId];const title=(ar?p?.facts.titleAr:p?.facts.titleEn)||l.propertyId;
 const reply=t(`Thank you for your enquiry about ${title}. What would you like to know about the property?`,`شكراً لاستفسارك عن ${title}. ما المعلومات التي تود معرفتها عن العقار؟`);
 return <div className="ag-lead-assistance"><button className="px-button px-button-outline" type="button" onClick={()=>setShow(!show)}><Sparkles size={15}/>{t('Help with this enquiry','مساعدة في هذا الاستفسار')}</button>{show&&<div className="ag-proposal"><strong>{t('Deterministic demo · review before using','تجربة حتمية · راجع قبل الاستخدام')}</strong><p>{l.identity.alias} · {l.source} · {t('Recorded stage','المرحلة المسجلة')}: {l.stage} · {l.assignee||t('Unassigned','غير معيّن')}</p><p>{t('Source: this enquiry’s recorded source, stage, assignment and linked property. No availability or intent is inferred.','المصدر: بيانات مصدر الاستفسار ومرحلته وتعيينه والعقار المرتبط. لا يُستنتج التوفر أو النية.')}</p><p>{reply}</p>{onDraft?<button className="px-button px-button-dark" type="button" onClick={()=>{onDraft(reply);setShow(false);}}>{t('Use reply draft','استخدام مسودة الرد')}</button>:<Link className="px-text-link" href={`/workspace/inbox?lead=${l.id}`}>{t('Review a reply in Inbox','مراجعة الرد في الوارد')}</Link>}<button className="px-button px-button-outline" type="button" onClick={()=>setShow(false)}>{t('Dismiss suggestion','تجاهل الاقتراح')}</button></div>}</div>;
}
