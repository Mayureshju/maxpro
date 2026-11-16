import {demoOrganizationId,type CanonicalProperty} from './canonical-property';
import {geminiPlans,type PlanId} from './gemini-product';
import {isRecord,textValue} from './property-storage';
import {seedOrganization,roles,organizationTypes,reviewStatuses,invalidateReviews,type OrganizationRepository,type OrganizationProfile,type Membership,type PlanTerms,type ModerationReview,type AuditEvent} from './organization-engine';
const text=(v:unknown,n=160):v is string=>textValue(v,n);
const revision=(v:unknown):v is number=>Number.isSafeInteger(v)&&Number(v)>0;
const date=(v:unknown):v is string=>text(v,50)&&Number.isFinite(Date.parse(v));
const one=(v:unknown,values:readonly string[])=>typeof v==='string'&&values.includes(v);
const plan=(v:unknown):v is PlanId=>geminiPlans.some(p=>p.id===v);
export function restoreOrganization(value:unknown,version:unknown,properties:Record<string,CanonicalProperty>,selectedPlan:PlanId):{organization:OrganizationRepository;corrupt:boolean}{
 if(value===undefined&&version===undefined)return {organization:seedOrganization(selectedPlan),corrupt:false};
 if(version!==1||!isRecord(value)||value.version!==1)return {organization:seedOrganization(selectedPlan),corrupt:true};
 let corrupt=false;let r=seedOrganization(selectedPlan);const v=value;
 const list=(x:unknown,max:number)=>{if(!Array.isArray(x)||x.length>max){corrupt=true;return [];}return x;};
 const organizations:OrganizationProfile[]=[];
 for(const o of list(v.organizations,50)){
  if(!isRecord(o)||!text(o.id,100)||!/^ORG-DEMO-[A-Za-z0-9-]+$/.test(o.id)||!revision(o.revision)||!text(o.name)||!o.name.trim()||!text(o.nameAr)||!one(o.type,organizationTypes)||!one(o.country,['QA','AE','SA'])||!text(o.businessName)||!text(o.license,100)||!text(o.brand)||!text(o.domain,200)||(o.domain!==''&&!/^(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+example$/.test(o.domain))||typeof o.domainPreview!=='boolean'||!plan(o.plan)||!one(o.status,['onboarding','active-demo','suspended-demo'])||!one(o.verification,['verification-pending','submitted-demo'])||!isRecord(o.settings)||typeof o.settings.approvalRequired!=='boolean'||typeof o.settings.leadNotifications!=='boolean'||!one(o.settings.locale,['en','ar'])||organizations.some(x=>x.id===o.id)){corrupt=true;continue;}
  organizations.push({id:o.id,revision:o.revision,name:o.name,nameAr:o.nameAr,type:o.type as OrganizationProfile['type'],country:o.country as OrganizationProfile['country'],businessName:o.businessName,license:o.license,brand:o.brand,domain:o.domain,domainPreview:o.domainPreview,plan:(!v.activeOrganizationId&&o.id===demoOrganizationId)?selectedPlan:o.plan,status:o.status as OrganizationProfile['status'],verification:o.verification as OrganizationProfile['verification'],settings:{approvalRequired:o.settings.approvalRequired,leadNotifications:o.settings.leadNotifications,locale:o.settings.locale as 'en'|'ar'}});
 }
 if(!organizations.some(o=>o.id===demoOrganizationId)){organizations.unshift(r.organizations[0]);corrupt=true;}
 const members:Membership[]=[];
 for(const m of list(v.members,500)){
  if(!isRecord(m)||!text(m.id,100)||!m.id||!text(m.organizationId,100)||!organizations.some(o=>o.id===m.organizationId)||!text(m.alias,80)||!m.alias.trim()||!one(m.role,roles.filter(x=>x!=='super-admin'))||!one(m.status,['invited-demo','active-demo','suspended-demo'])||typeof m.available!=='boolean'||!revision(m.revision)||members.some(x=>x.id===m.id||(x.organizationId===m.organizationId&&x.alias===m.alias))){corrupt=true;continue;}
  members.push({id:m.id,organizationId:m.organizationId,alias:m.alias,role:m.role as Membership['role'],status:m.status as Membership['status'],available:m.available&&m.status==='active-demo',revision:m.revision});
 }
 for(const o of organizations)if(o.type==='agency'&&!members.some(m=>m.organizationId===o.id&&m.role==='owner'&&m.status==='active-demo')){members.push({id:`RECOVERED-${o.id}`,organizationId:o.id,alias:'Demo Recovered Owner',role:'owner',status:'active-demo',available:false,revision:1});corrupt=true;}
 const reviews:ModerationReview[]=[];
 for(const x of list(v.reviews,500)){
  if(!isRecord(x)||!text(x.propertyId,100)||!Object.hasOwn(properties,x.propertyId)||!revision(x.propertyRevision)||x.propertyRevision>properties[x.propertyId].revision||!one(x.status,reviewStatuses)||!text(x.note,1000)||!text(x.actor,100)||!date(x.at)||reviews.some(y=>y.propertyId===x.propertyId)){corrupt=true;continue;}
  reviews.push({propertyId:x.propertyId,propertyRevision:x.propertyRevision,status:x.status as ModerationReview['status'],note:x.note,actor:x.actor,at:x.at});
 }
 const events:AuditEvent[]=[];
 for(const e of list(v.audit,1000)){
  if(!isRecord(e)||!text(e.id,100)||!text(e.organizationId,100)||!organizations.some(o=>o.id===e.organizationId)||!text(e.actor,100)||!one(e.role,roles)||!text(e.action,200)||!text(e.target,160)||!(e.revision===null||revision(e.revision))||!date(e.at)||!one(e.outcome,['applied-demo','denied-demo'])||!text(e.note,1200)||events.some(x=>x.id===e.id)){corrupt=true;continue;}
  const details=isRecord(e.details)?Object.fromEntries(Object.entries(e.details).filter(([key,value])=>['alias','source','assignee'].includes(key)&&text(value,100))):undefined;
  events.push({...(details?{details}:{}),id:e.id,organizationId:e.organizationId,actor:e.actor,role:e.role as AuditEvent['role'],action:e.action,target:e.target,revision:e.revision,at:e.at,outcome:e.outcome as AuditEvent['outcome'],note:e.note});
 }
 const overrides:OrganizationRepository['planOverrides']={};
 if(isRecord(v.planOverrides))for(const [id,t] of Object.entries(v.planOverrides)){
  const fields=['monthlyQar','listingLimit','connectorLimit','aiCredits','seats'] as const;
  if(!plan(id)||!isRecord(t)||fields.some(k=>t[k]!==null&&(!Number.isSafeInteger(t[k])||Number(t[k])<0||Number(t[k])>1000000))){corrupt=true;continue;}
  overrides[id]=Object.fromEntries(fields.map(k=>[k,t[k]])) as PlanTerms;
 }else corrupt=true;
 let operational=r.operational;
 if(isRecord(v.operational)&&typeof v.operational.maintenance==='boolean'&&typeof v.operational.reviewNoteRequired==='boolean')operational={maintenance:v.operational.maintenance,reviewNoteRequired:v.operational.reviewNoteRequired};else corrupt=true;
 const actor=one(v.actor,roles)?v.actor as OrganizationRepository['actor']:'super-admin';if(actor!==v.actor)corrupt=true;
 const activeOrganizationId=typeof v.activeOrganizationId==='string'&&organizations.some(o=>o.id===v.activeOrganizationId)?v.activeOrganizationId:demoOrganizationId;
 if(v.activeOrganizationId!==undefined&&v.activeOrganizationId!==activeOrganizationId)corrupt=true;
 r={version:1,activeOrganizationId,organizations,members,actor,reviews,audit:events,planOverrides:overrides,operational};
 for(const p of Object.values(properties))r=invalidateReviews(r,p);
 return {organization:r,corrupt};
}
