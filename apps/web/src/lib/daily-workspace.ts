import type {CanonicalLead} from './lead-crm';
import type {CanonicalProperty,DemoJob} from './canonical-property';
import {propertyContentChecks} from './property-completeness';

/** Recorded conversation state only; this is not a delivery/read receipt or a deadline. */
export const unansweredEnquiry=(lead:CanonicalLead)=>lead.conversation.messages.at(-1)?.direction==='inbound';
export const lastLeadActivity=(lead:CanonicalLead)=>[lead.receivedAt,...lead.activity.map(e=>e.at),...lead.conversation.messages.map(e=>e.at),...lead.assignments.map(e=>e.at),...lead.viewings.map(e=>e.at)].sort().at(-1)!;
export const activeEnquiry=(lead:CanonicalLead)=>!['Won','Lost'].includes(lead.stage);
export function propertyNextAction(p:CanonicalProperty,ar=false){
 const base=`/workspace/inventory/${p.id}`;
 if(p.status==='archived')return {label:ar?'عرض العقار':'View property',href:base};
 if(propertyContentChecks(p).some(c=>!c.complete))return {label:ar?'إكمال المسودة':'Complete draft',href:`${base}/edit`};
 if(!p.source.factsReviewed||!p.source.copyReviewed)return {label:ar?'مراجعة الإعلان':'Review listing',href:`${base}/edit?step=3`};
 return {label:ar?'النشر والترويج':'Publish & Promote',href:`/workspace/publish?property=${p.id}`};
}

/** Retry/cancel changes a record in place, so array position is not chronology. */
export function latestPublishingJobs(jobs:DemoJob[],propertyId?:string){
 const seen=new Set<string>();
 return jobs.filter(j=>!propertyId||j.listingId===propertyId).sort((a,b)=>b.at.localeCompare(a.at)||b.id.localeCompare(a.id)).filter(j=>{const key=`${j.listingId}:${j.destination}`;if(seen.has(key))return false;seen.add(key);return true;});
}
