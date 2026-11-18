import type {CanonicalLead, FollowUp, LeadRequirements} from './lead-crm';
import type {CanonicalProperty} from './canonical-property';
import {isRecord, textValue} from './property-storage';

/** Conflict token for local commands, not a cryptographic or production revision. */
export const leadSnapshot = (lead: CanonicalLead) => JSON.stringify(lead);
export const followUpTime = (task: Pick<FollowUp, 'date' | 'time'>) => Date.parse(`${task.date}T${task.time}:00+03:00`);
export const dueFollowUps = (lead: CanonicalLead, now = Date.now()) => (lead.followUps ?? []).filter(task => task.status === 'open' && followUpTime(task) <= now);
export const nextFollowUp = (lead: CanonicalLead) => (lead.followUps ?? []).filter(task => task.status === 'open').sort((a,b) => followUpTime(a)-followUpTime(b))[0];
export const emptyRequirements = (): LeadRequirements => ({purpose:null, location:'', maxBudgetQar:null, budgetPeriod:null, propertyType:'', bedrooms:null, moveIn:'', viewingInterest:null, contactMethod:''});
export const propertyTypes = ['Apartment','Villa','Townhouse','Penthouse','Compound','Commercial office','Studio','Land'] as const;

export function validRequirements(v: unknown): v is LeadRequirements {
 if (!isRecord(v)) return false;
 const nullableNumber = (x:unknown,max:number) => x===null || typeof x==='number' && Number.isFinite(x) && x>=0 && x<=max;
 return (v.purpose===null||v.purpose==='rent'||v.purpose==='sale') && textValue(v.location,120) &&
  nullableNumber(v.maxBudgetQar,1e10) && (v.maxBudgetQar===null||Number(v.maxBudgetQar)>0) &&
  (v.budgetPeriod===null||['month','year','total'].includes(String(v.budgetPeriod))) &&
  (v.maxBudgetQar===null ? v.budgetPeriod===null : v.purpose==='rent' ? ['month','year'].includes(String(v.budgetPeriod)) : v.purpose==='sale' && v.budgetPeriod==='total') &&
  textValue(v.propertyType,60) && (!v.propertyType||propertyTypes.includes(v.propertyType as typeof propertyTypes[number])) &&
  nullableNumber(v.bedrooms,30) && (v.bedrooms===null||Number.isInteger(v.bedrooms)) && textValue(v.moveIn,120) &&
  (v.viewingInterest===null||typeof v.viewingInterest==='boolean') && textValue(v.contactMethod,60) &&
  ['','WhatsApp','Email','Phone'].includes(v.contactMethod);
}
/** Explicit reconstruction strips unrecognized fields from imported browser data. */
export function cleanRequirements(v:LeadRequirements):LeadRequirements {
 return {purpose:v.purpose,location:v.location.trim(),maxBudgetQar:v.maxBudgetQar,budgetPeriod:v.budgetPeriod,propertyType:v.propertyType,bedrooms:v.bedrooms,moveIn:v.moveIn.trim(),viewingInterest:v.viewingInterest,contactMethod:v.contactMethod};
}
export type RequirementCandidate = {key:keyof LeadRequirements; value:LeadRequirements[keyof LeadRequirements]; messageId:string; evidence:string};

/** Bounded extraction: only explicit labelled inbound fields, never inferred intent. Conflicting values are omitted. */
export function qualificationCandidates(lead:CanonicalLead):RequirementCandidate[] {
 const found:RequirementCandidate[]=[];
 for(const message of lead.conversation.messages.filter(m=>m.direction==='inbound')) {
  for(const line of message.text.split(/[;؛\n]/)) {
   const part=line.trim(),add=(key:RequirementCandidate['key'],value:RequirementCandidate['value'])=>found.push({key,value,messageId:message.id,evidence:part});
   let m=part.match(/^(?:purpose|الغرض)\s*:\s*(rent|sale|buy|إيجار|بيع|شراء)$/i);
   if(m)add('purpose',/rent|إيجار/i.test(m[1])?'rent':'sale');
   m=part.match(/^(?:location|الموقع)\s*:\s*([^:]{1,120})$/i);if(m)add('location',m[1].trim());
   m=part.match(/^(?:budget|الميزانية)\s*:\s*(?:QAR\s*)?(\d+(?:\.\d{1,2})?)\s*(?:QAR|ر\.ق)?\s*\/\s*(month|year|total|شهر|سنة|إجمالي)$/i);
   if(m&&Number(m[1])>0&&Number(m[1])<=1e10){add('maxBudgetQar',Number(m[1]));add('budgetPeriod',/month|شهر/i.test(m[2])?'month':/year|سنة/i.test(m[2])?'year':'total');}
   m=part.match(/^(?:bedrooms|غرف النوم)\s*:\s*(\d{1,2})$/i);if(m&&Number(m[1])<=30)add('bedrooms',Number(m[1]));
   m=part.match(/^(?:type|النوع)\s*:\s*(.+)$/i);if(m){const types:Record<string,string>={'شقة':'Apartment','فيلا':'Villa','بنتهاوس':'Penthouse','أرض':'Land','مكتب تجاري':'Commercial office','تاون هاوس':'Townhouse','مجمع':'Compound','استوديو':'Studio'};const value=propertyTypes.find(t=>t.toLowerCase()===m![1].toLowerCase())??types[m[1]];if(value)add('propertyType',value);}
  }
 }
 const conflict=(key:RequirementCandidate['key'])=>new Set(found.filter(c=>c.key===key).map(c=>c.value)).size>1;
 const budgetConflict=conflict('maxBudgetQar')||conflict('budgetPeriod');
 return found.filter((candidate,i)=>!conflict(candidate.key)&&!(budgetConflict&&['maxBudgetQar','budgetPeriod'].includes(candidate.key))&&found.findIndex(other=>other.key===candidate.key)===i);
}

/** Deterministic draft from the latest recorded enquiry and linked facts. Never a send command. */
export function suggestedLeadReply(lead:CanonicalLead,property:CanonicalProperty|undefined,ar=false):string {
 const t=(en:string,arabic:string)=>ar?arabic:en,title=property&&(ar?property.facts.titleAr:property.facts.titleEn)||lead.propertyId;
 const question=lead.conversation.messages.filter(m=>m.direction==='inbound').at(-1)?.text??'',facts=property?.facts;
 const parts=[t(`Thank you for your enquiry about ${title}.`,`شكراً لاستفسارك عن ${title}.`)];
 if(/price|budget|cost|سعر|ميزانية|تكلفة/i.test(question)&&facts&&facts.priceQar>0)parts.push(t(`The recorded asking price is QAR ${facts.priceQar.toLocaleString('en-US')}${facts.purpose==='rent'?` per ${facts.rentalFrequency==='year'?'year':'month'}`:''}.`,`السعر المطلوب المسجل ${facts.priceQar.toLocaleString('en-US')} ر.ق${facts.purpose==='rent'?(facts.rentalFrequency==='year'?' سنوياً':' شهرياً'):''}.`));
 if(/viewing|visit|معاينة|زيارة/i.test(question))parts.push(t('Which date and time would you prefer for a viewing? We will need to check availability before confirming.','ما التاريخ والوقت المفضلان للمعاينة؟ نحتاج إلى التحقق من التوفر قبل التأكيد.'));
 else parts.push(t('Could you confirm your preferred location, budget and bedroom requirements so we can review suitable options?','هل يمكنك تأكيد الموقع والميزانية وعدد غرف النوم المفضلة لنراجع الخيارات المناسبة؟'));
 return parts.join(' ');
}

export type PropertyMatch = {property:CanonicalProperty; reasons:string[]};
export function matchProperties(lead:CanonicalLead, properties:Record<string,CanonicalProperty>, ar=false):{matches:PropertyMatch[];missing:string[]} {
 const r=lead.requirements?.values,t=(en:string,arabic:string)=>ar?arabic:en;
 if(!r)return {matches:[],missing:[t('Confirm customer requirements before matching.','أكّد متطلبات العميل قبل البحث عن تطابق.')]};
 const missing=[!r.purpose&&t('Purpose is not confirmed.','الغرض غير مؤكد.'),r.maxBudgetQar===null&&t('Budget is not confirmed.','الميزانية غير مؤكدة.'),!r.location&&t('Location is not confirmed.','الموقع غير مؤكد.'),!r.propertyType&&t('Property type is not confirmed.','نوع العقار غير مؤكد.'),r.bedrooms===null&&t('Bedrooms are not confirmed.','عدد غرف النوم غير مؤكد.')].filter(Boolean) as string[];
 if(!r.purpose&&!r.location&&!r.propertyType&&r.bedrooms===null&&r.maxBudgetQar===null)return {matches:[],missing};
 const normalize=(s:string)=>s.trim().toLocaleLowerCase().replace(/\s+/g,' ');
 const matches=Object.values(properties).filter(p=>p.organizationId===lead.organizationId&&p.status!=='archived').flatMap(property=>{
  const f=property.facts,reasons:string[]=[];
  if(r.purpose){if(f.purpose!==r.purpose)return [];reasons.push(t(f.purpose==='rent'?'For rent':'For sale',f.purpose==='rent'?'للإيجار':'للبيع'));}
  if(r.location){if(![f.city,f.district].some(v=>normalize(v)===normalize(r.location)))return [];reasons.push([f.district,f.city].filter(Boolean).join(', '));}
  if(r.propertyType){if(f.propertyType!==r.propertyType)return [];reasons.push(t(f.propertyType,({'Apartment':'شقة','Villa':'فيلا','Townhouse':'تاون هاوس','Penthouse':'بنتهاوس','Compound':'مجمع','Commercial office':'مكتب تجاري','Studio':'استوديو','Land':'أرض'} as Record<string,string>)[f.propertyType]??f.propertyType));}
  if(r.bedrooms!==null){if(f.beds!==r.bedrooms)return [];reasons.push(`${f.beds} ${t('bedrooms','غرف نوم')}`);}
  if(r.maxBudgetQar!==null){
   if(f.priceQar<=0||!r.purpose||f.purpose!==r.purpose)return [];
   const price=f.purpose==='rent'?(f.rentalFrequency==='year'?f.priceQar/12:f.priceQar):f.priceQar;
   const budget=r.purpose==='rent'&&r.budgetPeriod==='year'?r.maxBudgetQar/12:r.maxBudgetQar;
   if(price>budget)return [];
   reasons.push(`${t('QAR','ر.ق')} ${f.priceQar.toLocaleString('en-US')} ${f.purpose==='rent'?t(f.rentalFrequency==='year'?'/ year':'/ month',f.rentalFrequency==='year'?'/ سنة':'/ شهر'):t('total','إجمالي')} · ${t('within confirmed budget','ضمن الميزانية المؤكدة')}`);
  }
  return [{property,reasons}];
 }).sort((a,b)=>a.property.facts.priceQar-b.property.facts.priceQar||a.property.id.localeCompare(b.property.id));
 return {matches,missing};
}
