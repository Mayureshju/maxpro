import type {DemoState} from '@/components/gemini/demo-provider';
import type {AuditEvent} from './organization-engine';
import {activeOrganizationId} from './organization-engine';

/** An allowlist: unknown actions and free-form internal notes never become customer copy. */
const labels:Record<string,[string,string]>={
 'property-created':['Property draft created','تم إنشاء مسودة العقار'],
 'property-revised':['Property changes saved','تم حفظ تعديلات العقار'],
 'review-invalidated':['Updated property needs a fresh review','العقار المحدّث يحتاج إلى مراجعة جديدة'],
 'crm:reply':['Reply saved locally','تم حفظ الرد محلياً'],
 'crm:assign':['Enquiry assignment updated','تم تحديث تعيين الاستفسار'],
 'crm:intake-duplicate':['Duplicate example enquiry ignored; existing record retained','تم تجاهل الاستفسار التجريبي المكرر والاحتفاظ بالسجل الحالي'],
 'crm:intake':['Example enquiry intake recorded','تم تسجيل استقبال استفسار تجريبي'],
 'crm:stage':['Enquiry stage updated','تم تحديث مرحلة الاستفسار'],
 'crm:qualify':['Enquiry qualification updated','تم تحديث تأهيل الاستفسار'],
 'crm:note':['Enquiry note saved','تم حفظ ملاحظة الاستفسار'],
 'crm:viewing':['Viewing record updated','تم تحديث سجل المعاينة'],
 'crm:availability':['Agent availability updated','تم تحديث توفر الوكيل'],
 'sharing:link':['Property sharing link prepared locally','تم تجهيز رابط مشاركة العقار محلياً'],
 'sharing:message':['WhatsApp message prepared locally','تم تجهيز رسالة واتساب محلياً'],
 'campaign:create':['Campaign draft saved','تم حفظ مسودة الحملة'],
 'campaign:save':['Campaign changes saved','تم حفظ تعديلات الحملة'],
 'campaign:transition':['Campaign status updated locally','تم تحديث حالة الحملة محلياً'],
 'campaign:suggest':['Campaign suggestion prepared','تم تجهيز اقتراح للحملة'],
 'assignment-settings-updated':['Enquiry assignment preferences saved','تم حفظ تفضيلات تعيين الاستفسارات'],
 'connector-setup':['Channel setup updated locally','تم تحديث إعداد القناة محلياً'],
 'publishing-simulated':['Listing simulation recorded locally','تم تسجيل محاكاة الإعلان محلياً'],
 'publishing-job-updated':['Local publishing attempt updated','تم تحديث محاولة النشر المحلية'],
 'organization-created':['Fictional agency created','تم إنشاء وكالة خيالية'],
 'membership-updated':['Agency membership updated','تم تحديث عضوية الوكالة'],
 'invitation-simulated':['Local member invitation prepared','تم تجهيز دعوة عضو محلية'],
 'plan-selected':['Illustrative plan selection saved','تم حفظ اختيار الباقة التوضيحية'],
 'connector-prepared':['Channel setup prepared locally','تم تجهيز إعداد القناة محلياً'],
};
export function presentAuditEvent(event:AuditEvent,state:DemoState,ar=false):{label:string;href?:string}{
 const t=(en:string,arabic:string)=>ar?arabic:en;
 if(event.organizationId!==activeOrganizationId(state.organization))return {label:t('Workspace activity recorded','تم تسجيل نشاط مساحة العمل')};
 if(event.outcome==='denied-demo')return {label:t('Action could not be completed locally','تعذر إكمال الإجراء محلياً')};
 const details=event.details;let label=labels[event.action]?.[ar?1:0]??t('Workspace activity recorded','تم تسجيل نشاط مساحة العمل');
 if(event.action==='crm:reply'&&details?.alias)label=t(`Reply saved for ${details.alias}`,`تم حفظ الرد لـ ${details.alias}`);
 if(event.action==='crm:assign'&&details?.assignee)label=t(`Enquiry assigned to ${details.assignee}`,`تم تعيين الاستفسار إلى ${details.assignee}`);
 if(event.action==='crm:intake'&&details?.source)label=t(`New example enquiry received from ${details.source}`,`تم استقبال استفسار تجريبي جديد من ${details.source}`);
 const p=state.properties[event.target],lead=state.crm.leads.find(l=>l.id===event.target),campaign=state.campaigns.find(c=>c.id===event.target);
 const job=state.jobs.find(j=>j.id===event.target&&j.organizationId===event.organizationId&&state.properties[j.listingId]);
 const href=job?`/workspace/inventory/${job.listingId}/publishing`:p?.organizationId===event.organizationId?`/workspace/inventory/${p.id}`:lead?.organizationId===event.organizationId?`/workspace/leads/${lead.id}`:campaign?.organizationId===event.organizationId?`/workspace/campaigns/${campaign.id}`:undefined;
 return {label,href};
}
