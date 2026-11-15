'use client';

import {useState} from 'react';
import {useLocale} from 'next-intl';
import {Link,useRouter} from '@/i18n/navigation';
import {useGeminiDemo} from '@/components/gemini/demo-provider';
import {exampleLeadPayload,type LeadSource} from '@/lib/lead-crm';
import type {CanonicalProperty} from '@/lib/canonical-property';

/** Explicit, repeatable fictional intake through the canonical CRM command. */
export function ExampleEnquiry({property,source}:{property:CanonicalProperty;source:Extract<LeadSource,'Qatar Living'|'Property Finder'>}){
 const {state,crmCommand}=useGeminiDemo(),router=useRouter(),ar=useLocale()==='ar',t=(en:string,arabic:string)=>ar?arabic:en;
 const [error,setError]=useState('');const eventId=`DEMO-FIRST-${property.id}`;
 const existing=state.crm.leads.find(l=>l.organizationId===property.organizationId&&l.propertyId===property.id&&l.source===source&&l.sourceEventId===eventId);
 function open(){if(existing){router.push(`/workspace/leads/${existing.id}`);return;}const result=crmCommand({type:'intake',source,acknowledged:true,payload:exampleLeadPayload(source,property.id,eventId,undefined,property.organizationId)});if(result.error){setError(result.error);return;}if(result.leadId)router.push(`/workspace/leads/${result.leadId}`);}
 return <section className="ag-first-enquiry" aria-label={t('Try the first enquiry','جرّب الاستفسار الأول')}><span className="px-overline">{t('NEXT: A FICTIONAL ENQUIRY','التالي: استفسار خيالي')}</span><h3>{t('See how an enquiry reaches your team.','شاهد كيف يصل الاستفسار إلى فريقك.')}</h3><p>{t('Create one fictional Demo visitor enquiry for this property from','أنشئ استفساراً خيالياً واحداً من Demo visitor لهذا العقار عبر')} <bdi>{source}</bdi>. {t('Then review assignment and save a local reply. No real enquiry arrived; nothing is sent. Reopening uses the same record.','ثم راجع التعيين واحفظ رداً محلياً. لم يصل استفسار حقيقي ولا يُرسل شيء. تعيد الفتح إلى السجل نفسه.')}</p><button type="button" className="px-button px-button-dark" onClick={open}>{existing?t('Open fictional enquiry','فتح الاستفسار الخيالي'):t('Create fictional enquiry','إنشاء استفسار خيالي')}</button>{error&&<p className="gm-error" role="alert">{error}</p>}<p className="ag-help"><Link href="/workspace">{t('Back to dashboard','العودة إلى لوحة الوكالة')}</Link></p></section>;
}
