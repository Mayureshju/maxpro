import {getConnector,portalDestinationIds,type ConnectorId,type PlanId} from './gemini-product';
import {effectivePlan,type OrganizationRepository} from './organization-engine';
import {mapProperty} from './connector-engine';
import {type CanonicalProperty,type DemoJob} from './canonical-property';
export type PublishingState={organization?:OrganizationRepository;plan:PlanId;preparedConnectors:ConnectorId[];jobs:DemoJob[];properties:Record<string,CanonicalProperty>};
export function setupErrors(s:PublishingState,id:ConnectorId):string[]{
 const c=getConnector(id),plan=effectivePlan(s);
 if(c.entitlement==='pro-or-agency'&&s.plan==='starter')return ['Starter does not include the illustrative Meta catalogue entitlement.'];
 if(s.preparedConnectors.includes(id))return [];
 const reserved=new Set([...s.preparedConnectors,...s.jobs.filter(j=>j.status==='queued-demo').map(j=>j.destination)].filter(x=>getConnector(x).entitlement==='portal-quota'));
 if(c.entitlement==='portal-quota'&&!reserved.has(id)&&plan.connectorLimit!==null&&reserved.size>=plan.connectorLimit)return [`Illustrative ${plan.label} plan allows ${plan.connectorLimit} destination(s). Remove another demo setup or change the plan.`];
 return [];
}
export function publishingQuotaErrors(state:PublishingState,id:string,selected:ConnectorId[],excludeJob?:string):string[]{
 const plan=effectivePlan(state);const queued=state.jobs.filter(j=>j.status==='queued-demo'&&j.id!==excludeJob);const errors:string[]=[];
 const moderation=state.organization?.reviews.find(r=>r.propertyId===id);if(moderation&&(moderation.status!=='approved-demo'||moderation.propertyRevision!==state.properties[id]?.revision))errors.push('Local moderation requires review of the current canonical revision.');
 const properties=new Set(queued.map(j=>j.listingId));
 if(plan.listingLimit!==null&&!properties.has(id)&&properties.size>=plan.listingLimit)errors.push(`${plan.label} includes ${plan.listingLimit} queued properties. This illustrative listing quota is full.`);
 const portals=new Set([...state.preparedConnectors,...queued.map(j=>j.destination),...selected].filter(d=>getConnector(d).entitlement==='portal-quota'));
 if(plan.connectorLimit!==null&&portals.size>plan.connectorLimit)errors.push(`${plan.label} includes ${plan.connectorLimit} destination(s) in this illustrative plan. Remove a selection or change the plan.`);
 if(state.plan==='starter'&&selected.includes('meta-catalog'))errors.push('Starter does not include the illustrative Meta catalogue entitlement.');
 return errors;
}
export function approvalContext(s:PublishingState,p:CanonicalProperty,selected:ConnectorId[]){return JSON.stringify([p.id,p.revision,selected,s.plan,effectivePlan(s),s.preparedConnectors,selected.map(id=>getConnector(id).mappingVersion)]);}
export function destinationReadiness(s:PublishingState,p:CanonicalProperty,id:ConnectorId){
 const mapping=mapProperty(p,id);const setup=[...(s.preparedConnectors.includes(id)?[]:['Demo connector setup missing']),...(getConnector(id).eligibility==='confirmation-required'?['Partner and country eligibility confirmation']:[])];
 const review=s.organization?.reviews.find(r=>r.propertyId===p.id);const moderation=review&&(review.status!=='approved-demo'||review.propertyRevision!==p.revision)?['Local moderation requires current-revision approval (demo only)']:[];
 const missing=[...new Set([...mapping.errors,...setup,...moderation])];
 return {...mapping,missing,configured:s.preparedConnectors.includes(id),status:setup.length?'setup-blocked':missing.length?'validation-blocked':'ready-local',canQueue:missing.length===0};
}
export function jobDisplayStatus(j:DemoJob,p:CanonicalProperty|undefined){return j.status==='cancelled-demo'?'cancelled-demo':p&&p.revision!==j.propertyRevision?'revision-changed':j.status;}
export const jobStatusLabel=(status:string)=>({'queued-demo':'Queued locally','blocked-demo':'Blocked locally','cancelled-demo':'Cancelled locally','revision-changed':'Revision changed / revalidation required'}[status]??status);
export const validDestinations=(ids:ConnectorId[])=>ids.length>0&&new Set(ids).size===ids.length&&ids.every(id=>portalDestinationIds.includes(id));
/** Shared command guard, used again at mutation time; UI controls are not authority. */
export function publicationCommandError(s:PublishingState,id:string,revision:number,selected:ConnectorId[],approved:boolean,context:string,excludeJob?:string):string|null{
 const p=Object.hasOwn(s.properties,id)?s.properties[id]:undefined;
 if(!p||p.revision!==revision)return 'Property changed. Review the current revision again.';
 if(!validDestinations(selected)||!approved||context!==approvalContext(s,p,selected))return 'Review and approve the current property, destinations and setup before simulation.';
 return publishingQuotaErrors(s,id,selected,excludeJob).join(' ')||null;
}
