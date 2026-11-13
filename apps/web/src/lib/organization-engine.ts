/** Fictional browser-local workflows. This matrix is UX simulation, never security. */
import {demoOrganizationId, type CanonicalProperty, type DemoJob} from './canonical-property';
import {geminiPlans, getConnector, type PlanDefinition, type PlanId, type ConnectorId} from './gemini-product';
import {isRecord} from './property-storage';
import type {Campaign} from './campaign-engine';

export const organizationTypes=['landlord','broker','agency'] as const;
export const roles=['landlord','broker','agent','manager','owner','super-admin'] as const;
export type OrganizationRole=typeof roles[number];
export const permissions=['property.edit','publish','lead.work','lead.assign','campaign.edit','campaign.approve','billing','team','profile','moderate','admin'] as const;
export type Permission=typeof permissions[number];
const business:Permission[]=['property.edit','publish','lead.work','lead.assign','campaign.edit','campaign.approve','billing','team','profile'];
export const permissionMatrix:Record<OrganizationRole,readonly Permission[]>={
 landlord:business.filter(p=>p!=='team'),broker:business.filter(p=>p!=='team'),
 agent:['property.edit','lead.work','campaign.edit'],manager:business.filter(p=>p!=='billing'),owner:business,'super-admin':permissions,
};
export type OrganizationProfile={id:string;revision:number;name:string;nameAr:string;type:typeof organizationTypes[number];country:'QA'|'AE'|'SA';businessName:string;license:string;brand:string;domain:string;domainPreview:boolean;plan:PlanId;status:'onboarding'|'active-demo'|'suspended-demo';verification:'verification-pending'|'submitted-demo';settings:{approvalRequired:boolean;locale:'en'|'ar';leadNotifications:boolean}};
export type Membership={id:string;organizationId:string;alias:string;role:Exclude<OrganizationRole,'super-admin'>;status:'invited-demo'|'active-demo'|'suspended-demo';available:boolean;revision:number};
export const reviewStatuses=['pending-review','approved-demo','changes-requested','rejected','verification-pending'] as const;
export type ReviewStatus=typeof reviewStatuses[number];
export type ModerationReview={propertyId:string;propertyRevision:number;status:ReviewStatus;note:string;actor:string;at:string};
export type AuditEvent={id:string;organizationId:string;actor:string;role:OrganizationRole;action:string;target:string;revision:number|null;at:string;outcome:'applied-demo'|'denied-demo';note:string};
export type PlanTerms=Pick<PlanDefinition,'monthlyQar'|'listingLimit'|'connectorLimit'|'aiCredits'|'seats'>;
export type OrganizationRepository={version:1;activeOrganizationId?:string;organizations:OrganizationProfile[];members:Membership[];actor:OrganizationRole;reviews:ModerationReview[];audit:AuditEvent[];planOverrides:Partial<Record<PlanId,PlanTerms>>;operational:{maintenance:boolean;reviewNoteRequired:boolean}};
export type OrganizationHost={organization:OrganizationRepository;plan:PlanId;properties:Record<string,CanonicalProperty>;preparedConnectors:ConnectorId[];jobs:DemoJob[];campaigns:Campaign[];workspaces?:Record<string,{jobs:DemoJob[];preparedConnectors:ConnectorId[];campaigns:Campaign[]}>};
const now=()=>new Date().toISOString();
const uid=()=>crypto.randomUUID();
export function seedOrganization(plan:PlanId='agency'):OrganizationRepository{
 return {version:1,organizations:[{id:demoOrganizationId,revision:1,name:'Pearl Gate Realty',nameAr:'بيرل غيت العقارية',type:'agency',country:'QA',businessName:'Pearl Gate — fictional business',license:'DEMO-QA-001',brand:'Pearl Gate Realty',domain:'homes.pearlgate.example',domainPreview:false,plan,status:'active-demo',verification:'verification-pending',settings:{approvalRequired:true,locale:'en',leadNotifications:true}}],members:[
 {id:'MEM-OWNER',organizationId:demoOrganizationId,alias:'Yousef Al-Marri',role:'owner',status:'active-demo',available:false,revision:1},
 ...['Fatima Noor','Karim Said','Mariam Ahmed'].map((alias,i)=>({id:`MEM-AGENT-${i}`,organizationId:demoOrganizationId,alias,role:'agent' as const,status:'active-demo' as const,available:true,revision:1})),
 {id:'MEM-MANAGER',organizationId:demoOrganizationId,alias:'Demo Manager',role:'manager',status:'active-demo',available:false,revision:1},
 {id:'MEM-LANDLORD',organizationId:demoOrganizationId,alias:'Demo Landlord',role:'landlord',status:'suspended-demo',available:false,revision:1},
 {id:'MEM-BROKER',organizationId:demoOrganizationId,alias:'Demo Broker',role:'broker',status:'suspended-demo',available:false,revision:1},
 ],actor:'owner',reviews:[],audit:[],planOverrides:{},operational:{maintenance:false,reviewNoteRequired:true}};
}
export const activeOrganizationId=(r?:OrganizationRepository)=>r?.activeOrganizationId??demoOrganizationId;
export const workspaceOrganization=(r:OrganizationRepository)=>r.organizations.find(o=>o.id===activeOrganizationId(r))!;
export function can(r:OrganizationRepository,p:Permission){return permissionMatrix[r.actor]?.includes(p)??false;}
export function audit(r:OrganizationRepository,action:string,target:string,revision:number|null=null,note='',outcome:AuditEvent['outcome']='applied-demo',organizationId=activeOrganizationId(r)):OrganizationRepository{
 return {...r,audit:[{id:uid(),organizationId,actor:`Fictional ${r.actor}`,role:r.actor,action,target,revision,at:now(),outcome,note},...r.audit].slice(0,1000)};
}
export function effectivePlan(s:{plan:PlanId;organization?:OrganizationRepository}):PlanDefinition{
 const base=geminiPlans.find(p=>p.id===s.plan)!;return {...base,...s.organization?.planOverrides[s.plan]};
}
export function usage(s:OrganizationHost,orgId=activeOrganizationId(s.organization)){
 const slice=orgId===activeOrganizationId(s.organization)?s:s.workspaces?.[orgId];const jobs=slice?.jobs??[];const campaigns=slice?.campaigns??[];
 return {listings:new Set(jobs.filter(j=>j.status==='queued-demo').map(j=>j.listingId)).size,portals:new Set([...(slice?.preparedConnectors??[]),...jobs.filter(j=>j.status==='queued-demo').map(j=>j.destination)].filter(id=>getConnector(id).entitlement==='portal-quota')).size,seats:s.organization.members.filter(m=>m.organizationId===orgId&&m.status!=='suspended-demo').length,credits:campaigns.reduce((n,c)=>n+c.proposals.length,0),campaigns:campaigns.length};
}
export function planBlockers(s:OrganizationHost,id:PlanId,orgId=activeOrganizationId(s.organization)){const p=effectivePlan({...s,plan:id}),u=usage(s,orgId);return (['listings','portals','seats','credits'] as const).flatMap((k,i)=>{const limit=[p.listingLimit,p.connectorLimit,p.seats,p.aiCredits][i];return limit!==null&&u[k]>limit?[`${k}: ${u[k]} / ${limit}`]:[];});}
export function permissionError(r:OrganizationRepository,p:Permission):string|null{return can(r,p)?null:`Local permission denied: ${r.actor} cannot ${p}. Simulated roles provide no production security.`;}
export function invalidateReviews(r:OrganizationRepository,p:CanonicalProperty){const previous=r.reviews.find(x=>x.propertyId===p.id);if(!previous||previous.propertyRevision===p.revision)return r;return audit({...r,reviews:r.reviews.map(x=>x.propertyId===p.id?{...x,propertyRevision:p.revision,status:'verification-pending',actor:'Fictional system',at:now(),note:`Revision ${previous.propertyRevision} review invalidated by canonical revision ${p.revision}.`}:x)},'review-invalidated',p.id,p.revision,`Previous status: ${previous.status}`);}
export type OrganizationCommand=
 |{type:'select';organizationId:string}
 |{type:'persona';role:OrganizationRole}
 |{type:'create';alias?:string;name:string;nameAr:string;organizationType:OrganizationProfile['type'];country:OrganizationProfile['country']}
 |{type:'profile';id:string;revision:number;name:string;nameAr:string;organizationType:OrganizationProfile['type'];country:OrganizationProfile['country'];businessName:string;license:string}
 |{type:'invite';organizationId:string;alias:string;role:Membership['role']}
 |{type:'member';id:string;revision:number;role:Membership['role'];status:Membership['status'];available:boolean}
 |{type:'plan';organizationId:string;plan:PlanId}
 |{type:'configure-plan';plan:PlanId;terms:PlanTerms}
 |{type:'branding';id:string;revision:number;brand:string;domain:string;preview:boolean}
 |{type:'settings';id:string;revision:number;settings:OrganizationProfile['settings']}
 |{type:'verification';id:string;revision:number}
 |{type:'organization-status';id:string;revision:number;status:OrganizationProfile['status']}
 |{type:'review';propertyId:string;revision:number;status:ReviewStatus;note:string}
 |{type:'operations';maintenance:boolean;reviewNoteRequired:boolean};
export type OrganizationResult={organization:OrganizationRepository;plan:PlanId;error:string|null;id?:string};
const short=(s:unknown,max=160):s is string=>typeof s==='string'&&s.trim().length>0&&s.length<=max;
export function applyOrganizationCommand(s:OrganizationHost,c:OrganizationCommand):OrganizationResult{
 let r=s.organization;let plan=s.plan;
 const fail=(error:string):OrganizationResult=>({organization:audit(r,`denied:${c.type}`,'id' in c?c.id:'workspace',null,error,'denied-demo'),plan,error});
 const done=(action:string,target:string,revision:number|null=null,note='',orgId=activeOrganizationId(s.organization)):OrganizationResult=>({organization:audit(r,action,target,revision,note,'applied-demo',orgId),plan,error:null,id:target});
 if(c.type==='select'){if(!r.organizations.some(o=>o.id===c.organizationId))return fail('Organization not found.');r={...r,activeOrganizationId:c.organizationId};plan=workspaceOrganization(r).plan;return done('organization-selected',c.organizationId,null,'Fictional browser-local workspace; no secure tenant isolation.',c.organizationId);}
 if(c.type==='persona'){if(!roles.includes(c.role))return fail('Unknown simulated persona.');r={...r,actor:c.role};return done('persona-selected',c.role);}
 const required:Permission=c.type==='configure-plan'||c.type==='operations'||c.type==='organization-status'?'admin':c.type==='review'?'moderate':c.type==='plan'?'billing':c.type==='invite'||c.type==='member'?'team':'profile';
 const denied=permissionError(r,required);if(denied)return fail(denied);
 const targetOrg='organizationId' in c?c.organizationId:'id' in c?(c.type==='member'?r.members.find(m=>m.id===c.id)?.organizationId:c.id):activeOrganizationId(r);
 if(r.actor!=='super-admin'&&targetOrg&&targetOrg!==activeOrganizationId(r))return fail('Local permission denied: this directory organization requires a super administrator.');
 if(r.actor!=='super-admin'&&workspaceOrganization(r).status==='suspended-demo')return fail('Organization is suspended in this local demo.');
 if(c.type==='create'){
  if(c.alias!==undefined&&(!/^Demo [\p{L}\p{N} _-]+$/u.test(c.alias)||c.alias.length>80))return fail('Use a fictional identity beginning with Demo.');
  if(!short(c.name)||c.nameAr.length>160||!organizationTypes.includes(c.organizationType)||!['QA','AE','SA'].includes(c.country))return fail('Enter a name, valid organization type and country.');
  if(r.organizations.length>=50||r.members.length>=500)return fail('Local organization capacity reached.');
  const id=`ORG-DEMO-${uid()}`;const base=workspaceOrganization(seedOrganization());
  r={...r,organizations:[...r.organizations,{...base,id,revision:1,name:c.name.trim(),nameAr:c.nameAr.trim(),brand:c.name.trim(),businessName:'Fictional business',license:'',domain:'',domainPreview:false,type:c.organizationType,country:c.country,plan:'starter',status:'onboarding',verification:'verification-pending'}],members:[...r.members,{id:`MEM-${uid()}`,organizationId:id,alias:c.alias?.trim()||'Demo Organization Owner',role:c.organizationType==='agency'?'owner':c.organizationType,status:'active-demo',available:c.organizationType!=='agency',revision:1}]};return done('organization-created',id,1,'Independent empty browser-local workspace created.',id);
 }
 if(c.type==='invite'){
  const org=r.organizations.find(o=>o.id===c.organizationId);if(!org)return fail('Organization not found.');
  if(!short(c.alias,80)||!/^Demo [\p{L}\p{N} _-]+$/u.test(c.alias)||!roles.includes(c.role)||c.role as string==='super-admin')return fail('Use a fictional alias beginning with Demo and a valid member role. No email is sent.');
  if(c.role==='owner'&&r.actor!=='owner'&&r.actor!=='super-admin')return fail('Only an owner or super administrator can invite owners.');
  const seats=effectivePlan({...s,plan:org.plan}).seats;
  if(seats!==null&&usage(s,org.id).seats>=seats)return fail('Illustrative seat quota reached. Suspend a membership or select another plan.');
  if(r.members.length>=500||r.members.filter(m=>m.organizationId===org.id).length>=100)return fail('Local membership capacity reached.');
  if(r.members.some(m=>m.organizationId===org.id&&m.alias.toLowerCase()===c.alias.trim().toLowerCase()))return fail('This fictional alias is already a member.');
  const id=`MEM-${uid()}`;r={...r,members:[...r.members,{id,organizationId:org.id,alias:c.alias.trim(),role:c.role,status:'invited-demo',available:false,revision:1}]};return done('invitation-simulated',id,1,'No invitation was sent.',org.id);
 }
 if(c.type==='member'){
  const m=r.members.find(x=>x.id===c.id);if(!m||m.revision!==c.revision)return fail('Membership changed or no longer exists. Reload.');
  if(!roles.includes(c.role)||c.role as string==='super-admin'||!['invited-demo','active-demo','suspended-demo'].includes(c.status))return fail('Invalid role or membership status.');
  if(r.actor!=='super-admin'&&r.actor!=='owner'&&(m.role==='owner'||c.role==='owner'))return fail('Only an owner or super administrator can manage owners.');
  const org=r.organizations.find(o=>o.id===m.organizationId)!;
  if(m.role==='owner'&&m.status==='active-demo'&&(c.role!=='owner'||c.status!=='active-demo')&&!r.members.some(x=>x.id!==m.id&&x.organizationId===m.organizationId&&x.role==='owner'&&x.status==='active-demo'))return fail('Keep at least one active owner.');
  const seats=effectivePlan({...s,plan:org.plan}).seats;
  if(m.status==='suspended-demo'&&c.status!=='suspended-demo'&&seats!==null&&usage(s,org.id).seats>=seats)return fail('Illustrative seat quota reached.');
  r={...r,members:r.members.map(x=>x.id===m.id?{...m,role:c.role,status:c.status,available:c.status==='active-demo'&&c.available,revision:m.revision+1}:x)};return done('membership-updated',m.id,m.revision+1,`${c.role} / ${c.status}`,m.organizationId);
 }
 if(c.type==='plan'){
  const org=r.organizations.find(o=>o.id===c.organizationId);if(!org||!geminiPlans.some(p=>p.id===c.plan))return fail('Unknown organization or plan.');
  if(org.id===activeOrganizationId(r))plan=c.plan;
  r={...r,organizations:r.organizations.map(o=>o.id===org.id?{...o,plan:c.plan,revision:o.revision+1}:o)};return done('plan-selected',org.id,org.revision+1,`Illustrative ${c.plan}; no purchase. Overages: ${planBlockers(s,c.plan,org.id).join(', ')||'none'}`,org.id);
 }
 if(c.type==='configure-plan'){
  if(!geminiPlans.some(p=>p.id===c.plan)||!isRecord(c.terms)||(['monthlyQar','listingLimit','connectorLimit','aiCredits','seats'] as const).some(k=>{const v=c.terms[k];return v!==null&&(!Number.isInteger(v)||v<0||v>1000000);}))return fail('Plan terms must be bounded whole numbers or negotiated (empty).');
  r={...r,planOverrides:{...r.planOverrides,[c.plan]:{monthlyQar:c.terms.monthlyQar,listingLimit:c.terms.listingLimit,connectorLimit:c.terms.connectorLimit,aiCredits:c.terms.aiCredits,seats:c.terms.seats}}};return done('plan-configured',c.plan,null,'Illustrative pending business approval.');
 }
 if(c.type==='review'){
  const p=s.properties[c.propertyId];if(!p||p.revision!==c.revision||p.organizationId!==activeOrganizationId(r))return fail('Canonical property changed or was not found. Review the current revision.');
  if(!reviewStatuses.includes(c.status)||c.note.length>1000||(r.operational.reviewNoteRequired&&!short(c.note,1000)))return fail('Add a review note (maximum 1,000 characters).');
  const review:ModerationReview={propertyId:p.id,propertyRevision:p.revision,status:c.status,note:c.note,actor:`Fictional ${r.actor}`,at:now()};
  r={...r,reviews:[review,...r.reviews.filter(x=>x.propertyId!==p.id)]};return done(`moderation:${c.status}`,p.id,p.revision,c.note);
 }
 if(c.type==='operations'){if(typeof c.maintenance!=='boolean'||typeof c.reviewNoteRequired!=='boolean')return fail('Invalid operational setting.');r={...r,operational:{maintenance:c.maintenance,reviewNoteRequired:c.reviewNoteRequired}};return done('operational-settings-updated','workspace',null,'Local controls only.');}
 const o=r.organizations.find(x=>x.id===c.id);if(!o||o.revision!==c.revision)return fail('Organization changed or was not found. Reload.');
 let next={...o,revision:o.revision+1};
 if(c.type==='profile'){
  if(!short(c.name)||c.nameAr.length>160||c.businessName.length>160||c.license.length>100||!organizationTypes.includes(c.organizationType)||!['QA','AE','SA'].includes(c.country))return fail('Check organization name, country, type and licensing fields.');
  next={...next,name:c.name.trim(),nameAr:c.nameAr.trim(),type:c.organizationType,country:c.country,businessName:c.businessName.trim(),license:c.license.trim(),verification:'verification-pending'};
 }else if(c.type==='branding'){
  if(!short(c.brand)||c.domain.length>200||(c.domain!==''&&!/^(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+example$/.test(c.domain)))return fail('Use a fictional domain ending in .example and a brand name.');
  next={...next,brand:c.brand.trim(),domain:c.domain,domainPreview:c.domain===o.domain?c.preview:false};
 }else if(c.type==='settings'){if(!isRecord(c.settings)||typeof c.settings.approvalRequired!=='boolean'||typeof c.settings.leadNotifications!=='boolean'||!['en','ar'].includes(c.settings.locale))return fail('Invalid organization preference.');next={...next,settings:{approvalRequired:c.settings.approvalRequired,leadNotifications:c.settings.leadNotifications,locale:c.settings.locale}};}
 else if(c.type==='verification'){
  if(!o.businessName.trim()||!o.license.trim())return fail('Add fictional business and licensing information before submitting.');
  next={...next,verification:'submitted-demo'};
 }else if(c.type==='organization-status'){if(!['onboarding','active-demo','suspended-demo'].includes(c.status))return fail('Unknown organization status.');next={...next,status:c.status};}
 r={...r,organizations:r.organizations.map(x=>x.id===o.id?next:x)};return done(c.type,o.id,next.revision,'Local prototype only.',o.id);
}
