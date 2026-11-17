import type {DemoState} from '@/components/gemini/demo-provider';
import {activeEnquiry,propertyNextAction,unansweredEnquiry} from './daily-workspace';
import {propertyContentChecks} from './property-completeness';
import {activeOrganizationId} from './organization-engine';
import {destinationReadiness,publishingQuotaErrors} from './syndication-engine';
import {leadMetrics} from './lead-crm';

export type CopilotIntent='attention'|'readiness'|'copy'|'campaign'|'leads'|'follow-up'|'channels'|'performance'|'unsupported';
export type CopilotAnswer={intent:CopilotIntent;title:string;body:string;items:{label:string;detail?:string;href?:string}[];sources:string[];proposeCopy?:boolean};
/** Bounded navigation/read intents, never executable model tools. No fuzzy factual inference. */
export function copilotIntent(prompt:string):CopilotIntent{
 const text=prompt.trim().toLowerCase();
 if(/\b(spend|delete|approve|remotely|credentials|api key)\b|أنفق|احذف|وافق|كلمة المرور/.test(text))return 'unsupported';
 if(/unanswered|enquir|leads|استفسار|استفسارات|دون رد/.test(text))return 'leads';
 if(/follow.?up|reply|whatsapp|متابعة|رد|واتساب/.test(text))return 'follow-up';
 if(/campaign|facebook|instagram|حملة|حملات|فيسبوك/.test(text))return 'campaign';
 if(/improve|arabic|bilingual|description|copy|حسن|حسّن|وصف|باللغتين/.test(text))return 'copy';
 if(/channel|portal|publish|قنوات|قناة|بواب|النشر/.test(text))return 'channels';
 if(/ready|readiness|blocker|missing|not ready|جاهز|جاهزية|ناقص|عوائق/.test(text))return 'readiness';
 if(/metric|performance|analytics|أداء|الأداء|مقاييس/.test(text))return 'performance';
 if(/attention|next|properties|locate|find|اهتمام|التالي|عقارات|عقار/.test(text))return 'attention';
 return 'unsupported';
}

/** Read only. Explicit organization filtering is defence in depth for local UX, not security. */
export function copilotAnswer(state:DemoState,prompt:string,propertyId:string|undefined,leadId:string|undefined,ar=false):CopilotAnswer{
 const t=(en:string,arabic:string)=>ar?arabic:en,org=activeOrganizationId(state.organization);
 const properties=Object.values(state.properties).filter(p=>p.organizationId===org);
 const p=properties.find(p=>p.id===propertyId),leads=state.crm.leads.filter(l=>l.organizationId===org),scopedLeads=p?leads.filter(l=>l.propertyId===p.id):leads;
 let intent=copilotIntent(prompt);
 // An explicit record reference must agree with selected context; never edit a different record silently.
 const mentioned=prompt.match(/(?:AQ-\d+|DEMO-[\da-f-]{36})/ig);
 if(mentioned?.some(id=>id.toLowerCase()!==p?.id.toLowerCase()))intent='unsupported';
 if(properties.some(other=>other.id!==p?.id&&[other.facts.titleEn,other.facts.titleAr].some(title=>title.trim().length>=4&&prompt.toLowerCase().includes(title.toLowerCase()))))intent='unsupported';
 const sources=[org,...(p?[`${p.id}@${p.revision} · facts / source / media`]:[])];
 const result=(title:string,body:string,items:CopilotAnswer['items']=[],extra:Partial<CopilotAnswer>={}):CopilotAnswer=>({intent,title,body,items,sources,...extra});
 const select=()=>result(t('Choose a property first','اختر عقاراً أولاً'),t('Use the context selector above or create a canonical draft. No property is selected automatically.','استخدم محدد السياق أعلاه أو أنشئ مسودة أساسية. لا يُختار عقار تلقائياً.'),[{label:t('Create a property draft','إنشاء مسودة عقار'),href:'/workspace/inventory/new'}]);
 if(intent==='attention'){
  const attention=properties.filter(p=>p.status!=='archived'&&propertyNextAction(p).href!==`/workspace/publish?property=${p.id}`);
  return result(t('Properties requiring attention','عقارات تحتاج إلى اهتمام'),`${attention.length} ${t('saved properties need content or human review. These are local records.','عقارات محفوظة تحتاج إلى محتوى أو مراجعة بشرية. هذه سجلات محلية.')}`,attention.map(p=>({label:(ar?p.facts.titleAr:p.facts.titleEn)||p.id,detail:propertyNextAction(p,ar).label,href:propertyNextAction(p,ar).href})),{sources:[org,'properties · facts / source / status']});
 }
 if(intent==='readiness'){
  if(!p)return select();const missing=propertyContentChecks(p).filter(c=>!c.complete);
  return result(t('Listing readiness','جاهزية الإعلان'),t('Content, human review and channel eligibility are separate checks.','المحتوى والمراجعة البشرية وأهلية القناة فحوصات مستقلة.'),[...missing.map(c=>({label:ar?c.ar:c.en,detail:t('Missing source','مصدر ناقص'),href:`/workspace/inventory/${p.id}/edit?step=${c.step}&field=${c.key}`})),{label:p.source.factsReviewed&&p.source.copyReviewed?t('Reviewed locally','تمت المراجعة محلياً'):t('Human review required','مراجعة بشرية مطلوبة'),href:`/workspace/inventory/${p.id}/edit?step=3`},{label:t('Inspect per-channel checks','فحص متطلبات كل قناة'),href:`/workspace/publish?mode=launch&property=${p.id}`}]);
 }
 if(intent==='copy')return p?result(t('Propose bilingual listing copy','اقتراح وصف الإعلان باللغتين'),t('Build an editable proposal from the selected saved facts. Accepting saves descriptions and invalidates prior listing review; it never approves a launch.','جهّز اقتراحاً قابلاً للتعديل من الحقائق المحفوظة المختارة. القبول يحفظ الأوصاف ويلغي المراجعة السابقة؛ ولا يوافق على الإطلاق.'),[],{proposeCopy:p.status!=='archived'}):select();
 if(intent==='campaign')return p?result(t('Prepare a campaign','تجهيز حملة'),t('Open the existing advertising workbench for this property. Review creative, platform budget, MaxPro fee and all approval stages. Nothing is created or spent by this answer.','افتح مساحة الإعلان الحالية لهذا العقار. راجع المحتوى وميزانية المنصة ورسوم ماكس برو وجميع الموافقات. لا ينشئ هذا الرد شيئاً ولا ينفق أموالاً.'),[{label:'Facebook & Instagram',href:`/workspace/publish?property=${p.id}&mode=launch&goal=advertising&channels=meta-ads&channel=meta-ads`},{label:'Google Ads',href:`/workspace/publish?property=${p.id}&mode=launch&goal=advertising&channels=google-ads&channel=google-ads`} ]):select();
 if(intent==='leads'){
  const outstanding=scopedLeads.filter(l=>activeEnquiry(l)&&(!l.assignee||unansweredEnquiry(l)));
  return result(t('Outstanding enquiries','الاستفسارات المعلقة'),`${outstanding.length} ${t('recorded enquiries need assignment or a reply. No delivery or intent is inferred.','استفسارات مسجلة تحتاج إلى تعيين أو رد. لا يُستنتج التسليم أو النية.')}`,outstanding.map(l=>({label:l.identity.alias,detail:`${l.propertyId} · ${l.source} · ${!l.assignee?t('Unassigned','غير معيّن'):t('Unanswered recorded message','رسالة مسجلة دون رد')}`,href:`/workspace/inbox?lead=${l.id}`})),{sources:[...sources,'CRM · assignment / latest recorded message']});
 }
 if(intent==='follow-up'){
  const l=scopedLeads.find(l=>l.id===leadId)||scopedLeads.find(l=>activeEnquiry(l)&&unansweredEnquiry(l));
  return result(t('Review a follow-up','مراجعة رسالة متابعة'),t('Open the linked conversation and use “Help with this enquiry” to inspect and accept a reply draft. Consent, opt-out and handover stay visible; acceptance does not send.','افتح المحادثة المرتبطة واستخدم «مساعدة في هذا الاستفسار» لفحص مسودة الرد وقبولها. تظل الموافقة وإلغاء الاشتراك والتسليم البشري ظاهرة؛ ولا يرسل القبول رسالة.'),l?[{label:`${l.identity.alias} · ${l.propertyId}`,detail:l.source,href:`/workspace/inbox?lead=${l.id}`}]:[{label:t('Review leads','مراجعة الاستفسارات'),href:'/workspace/leads'}],{sources:[...sources,...(l?[`${l.id} · conversation / consent`]:['CRM · no matching unanswered enquiry'])]});
 }
 if(intent==='channels'){
  if(!p)return select();return result(t('Channel requirements','متطلبات القنوات'),t('Internal example requirements only. Portal access, advertising and messaging require separate authorization; all providers are unconnected.','متطلبات نموذجية داخلية فقط. تتطلب البوابات والإعلانات والمراسلة تفويضات مستقلة؛ جميع الخدمات غير متصلة.'),(['qatar-living','property-finder','bayut-dubizzle'] as const).map(id=>{const r=destinationReadiness(state,p,id),quota=publishingQuotaErrors(state,p.id,[id]);return {label:id==='qatar-living'?'Qatar Living':id==='property-finder'?'Property Finder':'Bayut / Dubizzle',detail:`${r.missing.length+quota.length} ${t('current blockers; inspect exact requirements','عوائق حالية؛ افحص المتطلبات الدقيقة')}`,href:`/workspace/publish?mode=launch&property=${p.id}&goal=portals&channels=${id}&channel=${id}`};}),{sources:[...sources,'connector readiness / plan quota / local setup']});
 }
 if(intent==='performance'){
  const m=leadMetrics(scopedLeads);return result(t('Recorded performance','الأداء المسجل'),t('Counts use saved CRM records in the scope shown below, independent of report filters. No reach, return or advertising spend is inferred.','تستخدم الأعداد سجلات العملاء المحفوظة ضمن النطاق أدناه، بصورة مستقلة عن فلاتر التقرير. لا يُستنتج الوصول أو العائد أو الإنفاق الإعلاني.'),[{label:`${m.total} ${t('recorded enquiries','استفسارات مسجلة')}`},{label:`${m.qualified} ${t('qualified enquiries','استفسارات مؤهلة')}`},{label:t('Inspect metrics and spend provenance','فحص المقاييس ومصدر الإنفاق'),href:'/workspace/analytics'}],{sources:[...sources,p?`${p.id} · linked CRM records`:'all active-organization CRM records']});
 }
 return result(t('This request is outside the local demo','هذا الطلب خارج نطاق التجربة المحلية'),t('No live AI provider is configured. I can inspect saved records, propose listing copy, and open preparation workflows. Choose a suggested task; approval, verification, remote publishing and spending are never Copilot tools.','لم تُهيّأ خدمة ذكاء اصطناعي فعلية. يمكنني فحص السجلات المحفوظة واقتراح وصف الإعلان وفتح إجراءات التجهيز. اختر مهمة مقترحة؛ الموافقة والتحقق والنشر الخارجي والإنفاق ليست أدوات للمساعد.'));
}
