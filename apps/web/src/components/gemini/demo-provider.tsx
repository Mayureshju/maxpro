'use client';
import {createContext,useContext,useMemo,useState,useSyncExternalStore} from 'react';
import {geminiPlans,getConnector,type ConnectorId,type PlanId} from '@/lib/gemini-product';
import {findProperty,demoOrganizationId,newProperty,reviseProperty,seedProperties,type CanonicalProperty,type DemoJob} from '@/lib/canonical-property';
import {isConnector,isRecord,readFacts,readJob,readProperty,strings} from '@/lib/property-storage';
import {applyCrmCommand,seedCrm,crmAgentNames,type CrmRepository,type CrmCommand} from '@/lib/lead-crm';
import {restoreCrm} from '@/lib/lead-storage';
import {applyCampaignCommand,invalidateCampaign,type Campaign,type CampaignCommand,type CampaignResult} from '@/lib/campaign-engine';
import {restoreCampaigns} from '@/lib/campaign-storage';
import {applyOrganizationCommand,seedOrganization,permissionError,audit,invalidateReviews,effectivePlan,usage,workspaceOrganization,type OrganizationRepository,type OrganizationCommand,type Permission} from '@/lib/organization-engine';
import {restoreOrganization} from '@/lib/organization-storage';
import {browserLocalRepository,type MaxProRepository} from '@/lib/prototype-repository';
import {localMarketingAI} from '@/lib/marketing-ai';
import {destinationReadiness,setupErrors,publicationCommandError} from '@/lib/syndication-engine';
export {publishingQuotaErrors} from '@/lib/syndication-engine';
export type {DemoJob} from '@/lib/canonical-property';
export type DemoState={organizationSchemaVersion:1;organization:OrganizationRepository;schemaVersion:1;connectorSchemaVersion:2;campaignSchemaVersion:1;campaigns:Campaign[];crmSchemaVersion:1;crm:CrmRepository;plan:PlanId;preparedConnectors:ConnectorId[];jobs:DemoJob[];assignMethod:'round-robin'|'manual';fallbackAgent:string;activeAgents:string[];properties:Record<string,CanonicalProperty>};
const initialState:DemoState={organizationSchemaVersion:1,organization:seedOrganization(),schemaVersion:1,connectorSchemaVersion:2,campaignSchemaVersion:1,campaigns:[],crmSchemaVersion:1,crm:seedCrm(seedProperties()),plan:'agency',preparedConnectors:[],jobs:[],assignMethod:'round-robin',fallbackAgent:'Fatima Noor',activeAgents:['Fatima Noor','Karim Said','Mariam Ahmed'],properties:seedProperties()};
type PropertyChanges=Partial<Pick<CanonicalProperty,'facts'|'media'|'watermark'|'source'|'proposal'|'status'|'studioStage'>>;
type DemoContext={
 repository:MaxProRepository;
 organizationCommand:(command:OrganizationCommand)=>{error:string|null;id?:string};
 campaignCommand:(command:CampaignCommand)=>Pick<CampaignResult,'error'|'id'|'leadId'>&{campaign?:Campaign};
 crmCommand:(command:CrmCommand)=>{error:string|null;leadId?:string};
 state:DemoState;update:(fn:(prev:DemoState)=>DemoState)=>void;reset:()=>void;hydrated:boolean;storageWarning:string;
 createProperty:()=>string;saveProperty:(id:string,revision:number,changes:PropertyChanges,action:string,approved?:boolean)=>boolean;
 simulatePublishing:(id:string,revision:number,selected:ConnectorId[],approved:boolean,context:string)=>string|null;
 prepareConnector:(id:ConnectorId,prepared:boolean,acknowledged:boolean)=>string|null;
 retryJob:(id:string,revision:number,approved:boolean,context:string)=>string|null;cancelJob:(id:string)=>string|null;
};
const Context=createContext<DemoContext|null>(null);
const storeKey='maxpro-gemini-v3-demo-state';
const serverSnapshot={state:initialState,hydrated:false,storageWarning:''};
const getServerSnapshot=()=>serverSnapshot;
function restoreState():{state:DemoState;storageWarning:string}{
 try{
  const raw=window.localStorage.getItem(storeKey);if(!raw)return {state:initialState,storageWarning:''};
  if(raw.length>4_000_000)throw new Error('Oversized demo');const saved:unknown=JSON.parse(raw);if(!isRecord(saved))throw new Error('Invalid demo');
  if(saved.connectorSchemaVersion!==undefined&&saved.connectorSchemaVersion!==2)throw new Error('Unsupported connector schema');
  const extended=saved.connectorSchemaVersion===2;const legacy=saved.schemaVersion===undefined;if(!legacy&&saved.schemaVersion!==1)throw new Error('Unsupported demo version');
  let corrupt=false;const properties:Record<string,CanonicalProperty>=legacy?seedProperties():{};
  if(legacy&&isRecord(saved.propertyEdits))for(const [id,value] of Object.entries(saved.propertyEdits)){const facts=readFacts(value,true);if(facts&&Object.hasOwn(properties,id))properties[id]=reviseProperty(properties[id],{facts},'Phase 0 draft migrated');else corrupt=true;}
  if(!legacy){
   if(!isRecord(saved.properties)||Object.keys(saved.properties).length>500)throw new Error('Invalid repository');
   for(const [id,value] of Object.entries(saved.properties)){const p=readProperty(value);if(p&&p.id===id)properties[id]=p;else corrupt=true;}
  }
  const jobs=Array.isArray(saved.jobs)?saved.jobs.slice(0,500).flatMap(v=>{const j=readJob(v,properties,legacy,extended);if(!j)corrupt=true;return j?[j]:[];}):[];
  // Rebuild references from validated jobs; never trust independently persisted remote references.
  const uniqueJobs=jobs.filter((j,i)=>{const unique=jobs.findIndex(other=>other.id===j.id)===i;if(!unique)corrupt=true;return unique;});
  for(const p of Object.values(properties))p.publications=uniqueJobs.filter(j=>j.listingId===p.id).map(j=>({jobId:j.id,destination:j.destination,propertyRevision:j.propertyRevision,externalReference:null}));
  const selectedPlan=geminiPlans.find(p=>p.id===saved.plan)?.id??initialState.plan;
  const org=restoreOrganization(saved.organization,saved.organizationSchemaVersion,properties,selectedPlan);corrupt=corrupt||org.corrupt;
  const names=crmAgentNames({organization:org.organization});
  const restored=restoreCrm(saved.crm,saved.crmSchemaVersion,properties,names);corrupt=corrupt||restored.corrupt;
  const marketing=restoreCampaigns(saved.campaigns,saved.campaignSchemaVersion,properties,restored.crm);corrupt=corrupt||marketing.corrupt;
  return {state:{organizationSchemaVersion:1,organization:org.organization,schemaVersion:1,connectorSchemaVersion:2,campaignSchemaVersion:1,campaigns:marketing.campaigns,crmSchemaVersion:1,crm:restored.crm,plan:geminiPlans.find(p=>p.id===saved.plan)?.id??initialState.plan,preparedConnectors:Array.isArray(saved.preparedConnectors)?[...new Set(saved.preparedConnectors.filter(isConnector))]:[],jobs:uniqueJobs,assignMethod:saved.assignMethod==='manual'?'manual':'round-robin',fallbackAgent:typeof saved.fallbackAgent==='string'&&names.some(a=>a===saved.fallbackAgent)?saved.fallbackAgent:initialState.fallbackAgent,activeAgents:strings(saved.activeAgents)?[...new Set(saved.activeAgents.filter(a=>names.some(x=>x===a)))]:initialState.activeAgents,properties},storageWarning:corrupt?'Some invalid local records were excluded. Other valid drafts remain available.':''};
 }catch{return {state:initialState,storageWarning:'Local demo storage is unavailable or damaged. Built-in examples are shown; changes may last only for this session.'};}
}
export function createDemoStore(){
 let snapshot=typeof window==='undefined'?serverSnapshot:{...restoreState(),hydrated:true};const listeners=new Set<()=>void>();
 const update:DemoContext['update']=fn=>{
  snapshot={...snapshot,state:fn(snapshot.state),hydrated:true};
  try{const serialized=JSON.stringify(snapshot.state);if(serialized.length>4_000_000||Object.keys(snapshot.state.properties).length>500)throw new Error('Local demo capacity');window.localStorage.setItem(storeKey,serialized);}catch{snapshot={...snapshot,storageWarning:'Browser storage is unavailable or full. Changes are in memory only; keep this session open.'};}
  listeners.forEach(listener=>listener());
 };
 const guard=(permission:Permission):string|null=>{const s=snapshot.state;const suspended=workspaceOrganization(s.organization).status==='suspended-demo'&&s.organization.actor!=='super-admin';const error=suspended?'Organization is suspended in this local demo.':permissionError(s.organization,permission);if(error)update(p=>({...p,organization:audit(p.organization,'permission-denied',permission,null,error,'denied-demo')}));return error;};
 const record=(action:string,target:string,revision:number|null=null)=>update(s=>({...s,organization:audit(s.organization,action,target,revision)}));
 const organizationCommand=(command:OrganizationCommand,syncPool=true)=>{
  const r=applyOrganizationCommand(snapshot.state,command);
  update(s=>{
   const member=!r.error&&command.type==='member'?r.organization.members.find(m=>m.id===command.id&&m.organizationId===demoOrganizationId):undefined;
   const available=member?.status==='active-demo'&&member.available;
   return {...s,organization:r.organization,plan:r.plan,...(member?{
    activeAgents:syncPool?(available?[...new Set([...s.activeAgents,member.alias])]:s.activeAgents.filter(a=>a!==member.alias)):s.activeAgents,
    crm:{...s.crm,unavailableAgents:available?s.crm.unavailableAgents.filter(a=>a!==member.alias):[...new Set([...s.crm.unavailableAgents,member.alias])]},
   }:{})};
  });
  return {error:r.error,id:r.id};
 };
 const sync=(e:StorageEvent)=>{if(e.key===storeKey||e.key===null){snapshot={...restoreState(),hydrated:true};listeners.forEach(l=>l());}};
 const api={
  getSnapshot:()=>snapshot,
  subscribe:(listener:()=>void)=>{listeners.add(listener);if(listeners.size===1)window.addEventListener('storage',sync);return ()=>{listeners.delete(listener);if(!listeners.size)window.removeEventListener('storage',sync);};},
  organizationCommand,
  update:(fn:(s:DemoState)=>DemoState)=>{const s=snapshot.state;const next=fn(s);if(next.plan!==s.plan){if(guard('billing'))return;organizationCommand({type:'plan',organizationId:demoOrganizationId,plan:next.plan});return;}if(next.assignMethod!==s.assignMethod||next.fallbackAgent!==s.fallbackAgent||next.activeAgents!==s.activeAgents){if(guard('lead.assign'))return;update(()=>next);record('assignment-settings-updated','workspace');return;}},reset:()=>{if(guard('admin'))return;update(()=>({...initialState,properties:seedProperties(),crm:seedCrm(seedProperties())}));},
  campaignCommand:(command:CampaignCommand)=>{const approving=command.type==='transition'&&['review-policy','approve-advertiser','approve-admin','simulate','reject'].includes(command.action);const denied=guard(approving?'campaign.approve':'campaign.edit');if(denied)return {error:denied};if(command.type==='suggest'){const limit=effectivePlan(snapshot.state).aiCredits;if(limit!==null&&usage(snapshot.state).credits>=limit)return {error:'Illustrative AI-credit quota reached. No model request was made.'};}const adjusted=command.type==='create'?{...command,input:{...command.input,adminRequired:command.input.adminRequired||workspaceOrganization(snapshot.state.organization).settings.approvalRequired}}:command;const result=applyCampaignCommand(snapshot.state,adjusted,localMarketingAI);if(!result.error)update(s=>({...s,campaigns:result.campaigns,crm:result.crm,organization:audit(s.organization,`campaign:${command.type}`,result.id??'campaign')}));return {error:result.error,id:result.id,leadId:result.leadId,campaign:result.campaigns.find(c=>c.id===result.id)};},
  crmCommand:(command:CrmCommand)=>{if(command.type==='availability'){const member=snapshot.state.organization.members.find(m=>m.organizationId===demoOrganizationId&&m.alias===command.agent);if(member){const denied=guard('lead.assign');if(denied)return {error:denied};const result=organizationCommand({type:'member',id:member.id,revision:member.revision,role:member.role,status:member.status,available:command.available},false);if(result.error)return result;}}const denied=guard(command.type==='assign'||command.type==='availability'?'lead.assign':command.type==='spend'?'billing':'lead.work');if(denied)return {error:denied};const result=applyCrmCommand(snapshot.state,command);if(result.crm!==snapshot.state.crm)update(s=>({...s,crm:result.crm,organization:audit(s.organization,`crm:${command.type}`,'leadId' in command?command.leadId:'workspace')}));return {error:result.error,leadId:result.leadId};},
  createProperty:()=>{if(guard('property.edit'))return '';const id=`DEMO-${crypto.randomUUID()}`;update(p=>({...p,properties:{...p.properties,[id]:newProperty(id)},organization:audit(p.organization,'property-created',id,1)}));return id;},
  saveProperty:(id:string,revision:number,changes:PropertyChanges,action:string,approved=false)=>{
   if(guard('property.edit'))return false;const p=findProperty(snapshot.state.properties,id);if(!p||p.revision!==revision)return false;
   const next=reviseProperty(p,changes,action,approved);if(!readProperty(next))return false;
   update(s=>({...s,properties:{...s.properties,[id]:next},campaigns:s.campaigns.map(c=>c.input.propertyId===id?invalidateCampaign(c,next):c),organization:audit(invalidateReviews(s.organization,next),'property-revised',id,next.revision,action)}));return true;
  },
  prepareConnector:(id:ConnectorId,prepared:boolean,acknowledged:boolean):string|null=>{
   const denied=guard('publish');if(denied)return denied;const s=snapshot.state;if(!getConnector(id)||!acknowledged)return 'Acknowledge the local demo setup before changing configuration.';
   const errors=prepared?setupErrors(s,id):[];if(errors.length)return errors.join(' ');
   record('connector-setup',id);update(prev=>({...prev,preparedConnectors:prepared?[...new Set([...prev.preparedConnectors,id])]:prev.preparedConnectors.filter(x=>x!==id)}));return null;
  },
  simulatePublishing:(id:string,revision:number,selected:ConnectorId[],approved:boolean,context:string):string|null=>{
   const denied=guard('publish');if(denied)return denied;const s=snapshot.state;if(s.organization.operational.maintenance)return 'Local publishing is paused by operational settings.';const p=findProperty(s.properties,id);if(!p||p.revision!==revision)return 'Property changed. Review the current revision again.';
   const publicationGuard=publicationCommandError(s,id,revision,selected,approved,context);if(publicationGuard)return publicationGuard;
   if(s.jobs.length+selected.length>500)return 'Local history is full. Use Reset all local demo data in connector diagnostics to start again.';
   const at=new Date().toISOString();const jobs:DemoJob[]=selected.map(destination=>{
    const {missing,mappingVersion}=destinationReadiness(s,p,destination);const status=missing.length?'blocked-demo':'queued-demo';
    return {id:`DEMO-JOB-${crypto.randomUUID()}`,listingId:id,organizationId:demoOrganizationId,propertyRevision:revision,destination,status,missing,at,mappingVersion,attempts:[{at,action:'simulate',propertyRevision:revision,mappingVersion,status,missing}]};
   });
   record('publishing-simulated',id,revision);update(prev=>({...prev,jobs:[...jobs,...prev.jobs],properties:{...prev.properties,[id]:{...p,publications:[...p.publications,...jobs.map(j=>({jobId:j.id,destination:j.destination,propertyRevision:revision,externalReference:null}))]}}}));return null;
  },
  retryJob:(id:string,revision:number,approved:boolean,context:string):string|null=>{
   const denied=guard('publish');if(denied)return denied;const s=snapshot.state;if(s.organization.operational.maintenance)return 'Local publishing is paused by operational settings.';const job=s.jobs.find(j=>j.id===id);if(!job)return 'Local job no longer exists.';
   const p=findProperty(s.properties,job.listingId);if(!p||revision!==p.revision)return 'Property changed. Review the current revision again.';
   if(job.status==='queued-demo'&&job.propertyRevision===p.revision)return 'This revision is already queued locally. Cancel it before resubmitting.';
   const publicationGuard=publicationCommandError(s,p.id,revision,[job.destination],approved,context,id);if(publicationGuard)return publicationGuard;
   if(job.attempts.length>=100)return 'This local job reached its attempt limit. Start a new simulation.';
   const {missing,mappingVersion}=destinationReadiness(s,p,job.destination);const status=missing.length?'blocked-demo':'queued-demo';const at=new Date().toISOString();
   const next:DemoJob={...job,at,propertyRevision:revision,mappingVersion,status,missing,attempts:[...job.attempts,{at,action:'retry',propertyRevision:revision,mappingVersion,status,missing}]};
   record('publishing-job-updated',id);update(prev=>({...prev,jobs:prev.jobs.map(j=>j.id===id?next:j),properties:{...prev.properties,[p.id]:{...p,publications:p.publications.map(r=>r.jobId===id?{...r,propertyRevision:revision}:r)}}}));return null;
  },
  cancelJob:(id:string):string|null=>{
   const denied=guard('publish');if(denied)return denied;const job=snapshot.state.jobs.find(j=>j.id===id);if(!job||job.status==='cancelled-demo')return 'No active local job to cancel.';
   if(job.attempts.length>=100)return 'This local job reached its attempt limit.';
   const at=new Date().toISOString();const next:DemoJob={...job,status:'cancelled-demo',at,attempts:[...job.attempts,{at,action:'cancel',propertyRevision:job.propertyRevision,mappingVersion:job.mappingVersion,status:'cancelled-demo',missing:job.missing}]};
   record('publishing-job-updated',id);update(prev=>({...prev,jobs:prev.jobs.map(j=>j.id===id?next:j)}));return null;
  },
 };
 return {...api,repository:browserLocalRepository(()=>snapshot.state,organizationCommand,api)};
}
export function GeminiDemoProvider({children}:{children:React.ReactNode}){
 const [store]=useState(createDemoStore);const snapshot=useSyncExternalStore(store.subscribe,store.getSnapshot,getServerSnapshot);
 const value=useMemo(()=>({...snapshot,repository:store.repository,organizationCommand:store.organizationCommand,campaignCommand:store.campaignCommand,crmCommand:store.crmCommand,update:store.update,reset:store.reset,createProperty:store.createProperty,saveProperty:store.saveProperty,simulatePublishing:store.simulatePublishing,prepareConnector:store.prepareConnector,retryJob:store.retryJob,cancelJob:store.cancelJob}),[snapshot,store]);
 return <Context.Provider value={value}>{snapshot.storageWarning&&<p role="status" className="gm-storage-warning">{snapshot.storageWarning}</p>}{children}</Context.Provider>;
}
export function useGeminiDemo(){const ctx=useContext(Context);if(!ctx)throw new Error('GeminiDemoProvider is required');return ctx;}
