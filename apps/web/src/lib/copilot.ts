import type {DemoState} from '@/components/gemini/demo-provider';
import {activeEnquiry,propertyNextAction,unansweredEnquiry} from './daily-workspace';
import {propertyContentChecks} from './property-completeness';
import {activeOrganizationId} from './organization-engine';
import {destinationReadiness,publishingQuotaErrors} from './syndication-engine';
import {leadMetrics} from './lead-crm';
import {dueFollowUps,matchProperties,nextFollowUp} from './crm-productivity';

export type CopilotIntent='attention'|'readiness'|'copy'|'campaign'|'leads'|'follow-up'|'channels'|'performance'|'summary'|'qualification'|'matching'|'viewing'|'briefing'|'unsupported';
export type CopilotAnswer={intent:CopilotIntent;title:string;body:string;items:{label:string;detail?:string;href?:string}[];sources:string[];proposeCopy?:boolean};
/** Bounded navigation/read intents, never executable model tools. No fuzzy factual inference. */
export function copilotIntent(prompt:string):CopilotIntent{
 const text=prompt.trim().toLowerCase();
 if(/\b(spend|delete|approve|remotely|credentials|api key)\b|أنفق|احذف|وافق|كلمة المرور/.test(text))return 'unsupported';
 if(/summari[sz]e|summary|لخّص|ملخص|تلخيص/.test(text))return 'summary';
 if(/match|مطابق/.test(text))return 'matching';
 if(/qualif|requirements|متطلبات|تأهيل/.test(text)&&!/channel|portal|publish|قنوات|قناة|بواب|النشر/.test(text))return 'qualification';
 if(/viewing|معاينة/.test(text))return 'viewing';
 if(/today|daily|briefing|اليوم|يومية/.test(text))return 'briefing';
 if(/unanswered|enquir|leads|استفسار|استفسارات|دون رد/.test(text))return 'leads';
 if(/follow.?up|reply|whatsapp|متابعة|رد|واتساب/.test(text))return 'follow-up';
 if(/campaign|facebook|instagram|حملة|حملات|فيسبوك/.test(text))return 'campaign';
 if(/improve|arabic|bilingual|description|copy|حسن|حسّن|وصف|باللغتين/.test(text))return 'copy';
 if(/channel|portal|publish|قنوات|قناة|بواب|النشر/.test(text))return 'channels';
 if(/ready|readiness|blocker|missing|not ready|جاهز|جاهزية|ناقص|عوائق/.test(text))return 'readiness';
 if(/metric|performance|analytics|fewer deals|conversion|close fewer|أداء|الأداء|مقاييس|صفقات أقل/.test(text))return 'performance';
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
 const lead=scopedLeads.find(l=>l.id===leadId);
 if(['summary','qualification','matching','viewing'].includes(intent)){
  if(!lead)return result(t('Choose an enquiry first','اختر استفساراً أولاً'),t('Open a saved lead or its linked conversation. No customer is selected automatically.','افتح عميلاً محفوظاً أو محادثته المرتبطة. لا يُختار عميل تلقائياً.'),[{label:t('Open lead manager','فتح إدارة العملاء'),href:'/workspace/leads'}]);
  const linked=properties.find(p=>p.id===lead.propertyId),inbound=lead.conversation.messages.filter(m=>m.direction==='inbound'),latest=lead.conversation.messages.at(-1),r=lead.requirements?.values;
  sources.push(`${lead.id} · ${lead.stage} · conversation / confirmed requirements / consent`,...inbound.map(m=>`${m.id} · ${m.at}`));
  if(intent==='summary')return result(t('Recorded enquiry summary','ملخص الاستفسار المسجل'),t('Saved facts only. Preferences and intent are unconfirmed unless explicitly recorded below.','حقائق محفوظة فقط. التفضيلات والنية غير مؤكدة ما لم تُسجّل صراحةً أدناه.'),[
   {label:lead.identity.alias,detail:`${lead.source} · ${lead.stage} · ${lead.assignee??t('Unassigned','غير معيّن')}`,href:`/workspace/leads/${lead.id}`},
   {label:t('Interested property','العقار محل الاهتمام'),detail:linked?((ar?linked.facts.titleAr:linked.facts.titleEn)||linked.id):t('Linked property is missing','العقار المرتبط غير موجود'),href:linked?`/workspace/inventory/${linked.id}`:undefined},
   {label:t('Latest inbound enquiry','آخر استفسار وارد'),detail:inbound.at(-1)?.text??t('No inbound message recorded','لا رسالة واردة مسجلة')},
   {label:t('Last recorded interaction','آخر تواصل مسجل'),detail:latest?`${latest.at} · ${latest.direction==='inbound'?t('Inbound','وارد'):t('Saved local reply; not delivered','رد محلي محفوظ؛ غير مُسلّم')}`:t('None recorded','لا يوجد')},
   {label:t('Confirmed requirements','المتطلبات المؤكدة'),detail:r?[r.purpose??'',r.location,r.propertyType,r.bedrooms!==null?`${r.bedrooms} ${t('bedrooms','غرف نوم')}`:'',r.maxBudgetQar!==null?`QAR ${r.maxBudgetQar} / ${r.budgetPeriod}`:''].filter(Boolean).join(' · ')||t('No matching constraints confirmed','لا قيود تطابق مؤكدة'):t('Not recorded. Ask about purpose, budget, location and bedrooms.','غير مسجلة. اسأل عن الغرض والميزانية والموقع وغرف النوم.'),href:`/workspace/leads/${lead.id}#requirements`},
   {label:t('Next action','الإجراء التالي'),detail:!lead.assignee?t('Assign an available agent.','عيّن وكيلاً متاحاً.'):!lead.consent.replyAllowed?t('Opted out. Do not prepare outreach; review consent.','ألغى الاشتراك. لا تجهّز تواصلاً؛ راجع الموافقة.'):nextFollowUp(lead)?`${nextFollowUp(lead)!.reason} · ${nextFollowUp(lead)!.date} ${nextFollowUp(lead)!.time} +03`:t('Review the unanswered questions and prepare a draft reply.','راجع الأسئلة التي تحتاج إلى إجابة وجهّز مسودة رد.'),href:`/workspace/leads/${lead.id}#follow-ups`},
   {label:t('Open questions','الأسئلة المفتوحة'),detail:!r?t('Customer requirements need confirmation; availability and viewing times must be checked.','تحتاج متطلبات العميل إلى تأكيد؛ يجب فحص التوفر وأوقات المعاينة.'):t('Confirm current availability and any unrecorded preferences. No booking is inferred.','أكّد التوفر الحالي والتفضيلات غير المسجلة. لا يُستنتج حجز.')}
  ]);
  if(intent==='qualification')return result(t('Review customer requirements','مراجعة متطلبات العميل'),t('Extract explicit labelled fields from inbound messages, inspect message references, correct the review form and confirm before saving. Linked property facts are never inferred as customer preferences.','استخرج الحقول المسماة صراحةً من الرسائل الواردة وراجع مراجعها وصحّح نموذج المراجعة وأكّد قبل الحفظ. لا تُستنتج تفضيلات العميل من حقائق العقار المرتبط.'),[{label:t('Review possible requirements','مراجعة المتطلبات المحتملة'),href:`/workspace/leads/${lead.id}#requirements`}]);
  if(intent==='matching'){
   const matched=matchProperties(lead,state.properties,ar);
   return result(t('Saved property matches','العقارات المحفوظة المطابقة'),t('Matches use confirmed requirements and saved organization properties only. Availability is unverified. Missing constraints are listed, not assumed.','يستخدم التطابق المتطلبات المؤكدة وعقارات المؤسسة المحفوظة فقط. التوفر غير مؤكد. تُعرض القيود الناقصة ولا تُفترض.'),[...matched.missing.map(label=>({label})),...matched.matches.map(({property,reasons})=>({label:(ar?property.facts.titleAr:property.facts.titleEn)||property.id,detail:reasons.join(' · '),href:`/workspace/inventory/${property.id}`})),...(!matched.matches.length?[{label:t('No suitable saved property found','لا عقار محفوظ مناسب'),href:`/workspace/leads/${lead.id}#requirements`}]:[])],{sources:[...sources,...matched.matches.map(({property})=>`${property.id}@${property.revision}`)]});
  }
  return result(t('Viewing preparation','التحضير للمعاينة'),t('Review recorded requests and confirm availability with the responsible agent. No external booking or calendar was checked.','راجع الطلبات المسجلة وأكّد التوفر مع الوكيل المسؤول. لم يُفحص حجز أو تقويم خارجي.'),[
   ...lead.viewings.map(v=>({label:`${v.date} · ${v.time} +03 · ${v.agent}`,detail:t(v.status,({Requested:'مطلوبة',Confirmed:'مؤكدة',Completed:'مكتملة',Cancelled:'ملغاة'})[v.status]),href:`/workspace/leads/viewings?lead=${lead.id}`})),
   {label:t('Customer requirements and open questions','متطلبات العميل والأسئلة المفتوحة'),detail:r?[r.location,r.propertyType,r.moveIn].filter(Boolean).join(' · '):t('No confirmed requirements recorded. Ask before the viewing.','لا متطلبات مؤكدة مسجلة. اسأل قبل المعاينة.'),href:`/workspace/leads/${lead.id}#requirements`},
   {label:t('Review property facts and access arrangements','مراجعة حقائق العقار وترتيبات الدخول'),href:`/workspace/inventory/${lead.propertyId}`},
   {label:t('Review viewing status and record completion','مراجعة حالة المعاينة وتسجيل الإكمال'),href:`/workspace/leads/viewings?lead=${lead.id}`},
   {label:t('Record an outcome and plan follow-up','تسجيل نتيجة وتحديد المتابعة'),href:`/workspace/leads/${lead.id}#follow-ups`}
  ]);
 }
 if(intent==='briefing'){
  const active=leads.filter(activeEnquiry),unassigned=active.filter(l=>!l.assignee),unanswered=active.filter(unansweredEnquiry),due=leads.flatMap(l=>dueFollowUps(l).map(task=>({lead:l,task}))),viewings=leads.flatMap(l=>l.viewings.filter(v=>['Requested','Confirmed'].includes(v.status)).map(v=>({lead:l,viewing:v}))),incomplete=properties.filter(p=>p.status!=='archived'&&propertyContentChecks(p).some(c=>!c.complete)),blocked=state.jobs.filter(j=>j.organizationId===org&&j.status==='blocked-demo'),campaigns=state.campaigns.filter(c=>c.organizationId===org&&['draft','pending-policy','pending-advertiser','pending-admin'].includes(c.status));
  return result(t('Agency daily briefing','الموجز اليومي للوكالة'),t('Recorded work only, evaluated now. Due tasks use Qatar timestamps. There is no predictive priority score or reminder service.','عمل مسجل فقط، يُقيّم الآن. تستخدم المهام المستحقة توقيت قطر. لا تقييم تنبؤي للأولوية ولا خدمة تذكير.'),[
   {label:`${unassigned.length} ${t('active unassigned enquiries','استفسارات نشطة غير معيّنة')}`,href:'/workspace/leads?work=unassigned'},
   {label:`${unanswered.length} ${t('unanswered active enquiries','استفسارات نشطة دون رد')}`,href:'/workspace/leads?work=unanswered'},
   ...due.map(({lead,task})=>({label:`${lead.identity.alias} · ${task.reason}`,detail:`${task.date} ${task.time} +03 · ${task.assignee}`,href:`/workspace/leads/${lead.id}#follow-ups`})),
   {label:`${viewings.length} ${t('open viewing requests','طلبات معاينة مفتوحة')}`,href:'/workspace/leads/viewings'},
   {label:`${incomplete.length} ${t('incomplete properties','عقارات غير مكتملة')}`,href:'/workspace/inventory'},
   {label:`${blocked.length} ${t('recorded blocked publishing attempts','محاولات نشر مسجلة محظورة')}`,href:'/workspace/hub/jobs'},
   {label:`${campaigns.length} ${t('campaign drafts or reviews','مسودات حملات أو مراجعات')}`,href:'/workspace/campaigns'}
  ],{sources:[org,'CRM · stages / assignments / latest messages / follow-ups / viewings','properties · content checks','local publishing jobs · recorded statuses','campaigns · draft / pending review statuses']});
 }
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
  const m=leadMetrics(scopedLeads);return result(t('Recorded performance','الأداء المسجل'),t('Counts use saved CRM records in the scope shown below, independent of report filters. Stage distribution describes recorded progress; it cannot establish why deals were lost. No reach, revenue or advertising spend is inferred.','تستخدم الأعداد سجلات العملاء المحفوظة ضمن النطاق أدناه بصورة مستقلة عن فلاتر التقرير. يصف توزيع المراحل التقدم المسجل ولا يثبت سبب فقدان الصفقات. لا يُستنتج الوصول أو الإيراد أو الإنفاق.'),[{label:`${m.total} ${t('recorded enquiries','استفسارات مسجلة')}`},{label:`${m.qualified} ${t('qualified enquiries','استفسارات مؤهلة')}`},...(['New','Contacted','Qualified','Viewing','Won','Lost'] as const).map(stage=>({label:`${scopedLeads.filter(l=>l.stage===stage).length} · ${t(stage,({New:'جديد',Contacted:'تم التواصل',Qualified:'مؤهل',Viewing:'معاينة',Won:'ناجح',Lost:'مفقود'})[stage])}`,href:`/workspace/leads?stage=${stage}${p?`&property=${p.id}`:''}`})),...Array.from(new Set(scopedLeads.map(l=>l.source))).map(source=>({label:source,detail:`${scopedLeads.filter(l=>l.source===source).length} ${t('recorded enquiries','استفسارات مسجلة')}`,href:`/workspace/leads?source=${encodeURIComponent(source)}${p?`&property=${p.id}`:''}`})),{label:t('Inspect metrics and spend provenance','فحص المقاييس ومصدر الإنفاق'),href:'/workspace/analytics'}],{sources:[...sources,p?`${p.id} · linked CRM records`:'all active-organization CRM records']});
 }
 return result(t('This request is outside the local demo','هذا الطلب خارج نطاق التجربة المحلية'),t('No live AI provider is configured. I can inspect saved records, propose listing copy, and open preparation workflows. Choose a suggested task; approval, verification, remote publishing and spending are never Copilot tools.','لم تُهيّأ خدمة ذكاء اصطناعي فعلية. يمكنني فحص السجلات المحفوظة واقتراح وصف الإعلان وفتح إجراءات التجهيز. اختر مهمة مقترحة؛ الموافقة والتحقق والنشر الخارجي والإنفاق ليست أدوات للمساعد.'));
}
