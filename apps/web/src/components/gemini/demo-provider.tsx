'use client';
import {usePrototypeCopy} from '@/components/prototype/use-prototype-copy';
import {createContext,useContext,useMemo,useState,useSyncExternalStore} from 'react';
import {geminiPlans,getConnector,type ConnectorId,type PlanId} from '@/lib/gemini-product';
import {findProperty,demoOrganizationId,newProperty,reviseProperty,seedProperties,type CanonicalProperty,type DemoJob} from '@/lib/canonical-property';
import {isConnector,isRecord,readFacts,readJob,readProperty,strings} from '@/lib/property-storage';
import {applyCrmCommand,seedCrm,crmAgentNames,type CrmRepository,type CrmCommand} from '@/lib/lead-crm';
import {restoreCrm} from '@/lib/lead-storage';
import {applyCampaignCommand,invalidateCampaign,type Campaign,type CampaignCommand,type CampaignResult} from '@/lib/campaign-engine';
import {restoreCampaigns} from '@/lib/campaign-storage';
import {applyOrganizationCommand,seedOrganization,permissionError,audit,invalidateReviews,effectivePlan,usage,workspaceOrganization,activeOrganizationId,type OrganizationRepository,type OrganizationCommand,type Permission} from '@/lib/organization-engine';
import {restoreOrganization} from '@/lib/organization-storage';
import {browserLocalRepository,type MaxProRepository} from '@/lib/prototype-repository';
import {emptyWorkspace,workspaceSlice,retainWorkspace,type OperationalSlice} from '@/lib/organization-workspace';
import {localMarketingAI} from '@/lib/marketing-ai';
import {destinationReadiness,setupErrors,publicationCommandError} from '@/lib/syndication-engine';
export {publishingQuotaErrors} from '@/lib/syndication-engine';
export type {DemoJob} from '@/lib/canonical-property';
export type DemoState={workspaceSchemaVersion?:1;workspaces?:Record<string,OperationalSlice>;organizationSchemaVersion:1;organization:OrganizationRepository;schemaVersion:1;connectorSchemaVersion:2;campaignSchemaVersion:1;campaigns:Campaign[];crmSchemaVersion:1;crm:CrmRepository;plan:PlanId;preparedConnectors:ConnectorId[];jobs:DemoJob[];assignMethod:'round-robin'|'manual';fallbackAgent:string;activeAgents:string[];properties:Record<string,CanonicalProperty>};
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
  if(raw.length>4_000_000)throw new Error('Oversized demo');const parsed:unknown=JSON.parse(raw);if(!isRecord(parsed))throw new Error('Invalid demo');const saved:Record<string,unknown>=parsed;
  if(saved.connectorSchemaVersion!==undefined&&saved.connectorSchemaVersion!==2)throw new Error('Unsupported connector schema');
  if(saved.workspaceSchemaVersion!==undefined&&saved.workspaceSchemaVersion!==1)throw new Error('Unsupported workspace schema');
  const extended=saved.connectorSchemaVersion===2;const legacy=saved.schemaVersion===undefined;if(!legacy&&saved.schemaVersion!==1)throw new Error('Unsupported demo version');
  let corrupt=false;
  const rawActive=isRecord(saved.organization)&&typeof saved.organization.activeOrganizationId==='string'?saved.organization.activeOrganizationId:demoOrganizationId;
  function decodeProperties(value:unknown,orgId:string){
   const properties:Record<string,CanonicalProperty>={};
   if(!isRecord(value)||Object.keys(value).length>500){corrupt=true;return properties;}
   for(const [id,v] of Object.entries(value)){const p=readProperty(v,orgId);if(p&&p.id===id)properties[id]=p;else corrupt=true;}
   return properties;
  }
  let properties=legacy?seedProperties():decodeProperties(saved.properties,rawActive);
  if(legacy&&isRecord(saved.propertyEdits))for(const [id,value] of Object.entries(saved.propertyEdits)){const facts=readFacts(value,true);if(facts&&Object.hasOwn(properties,id))properties[id]=reviseProperty(properties[id],{facts},'Phase 0 draft migrated');else corrupt=true;}
  const allProperties={...properties};const savedSlices=isRecord(saved.workspaces)?saved.workspaces:{};
  for(const [id,v] of Object.entries(savedSlices).slice(0,50))if(id!==rawActive&&isRecord(v))Object.assign(allProperties,decodeProperties(v.properties,id));
  const selectedPlan=geminiPlans.find(p=>p.id===saved.plan)?.id??initialState.plan;
  const restoredOrg=restoreOrganization(saved.organization,saved.organizationSchemaVersion,allProperties,selectedPlan);corrupt=corrupt||restoredOrg.corrupt;
  const organization=restoredOrg.organization;const active=activeOrganizationId(organization);
  function decodeSlice(value:Record<string,unknown>,orgId:string,props?:Record<string,CanonicalProperty>):OperationalSlice{
   const properties=props??decodeProperties(value.properties,orgId);
   const jobs=Array.isArray(value.jobs)?value.jobs.slice(0,500).flatMap(v=>{const j=readJob(v,properties,legacy,extended,orgId);if(!j)corrupt=true;return j?[j]:[];}):[];
   const uniqueJobs=jobs.filter((j,i)=>{const unique=jobs.findIndex(other=>other.id===j.id)===i;if(!unique)corrupt=true;return unique;});
   for(const p of Object.values(properties))p.publications=uniqueJobs.filter(j=>j.listingId===p.id).map(j=>({jobId:j.id,destination:j.destination,propertyRevision:j.propertyRevision,externalReference:null}));
   const names=crmAgentNames({organization:{...organization,activeOrganizationId:orgId}});
   const restored=restoreCrm(value.crm,value.crmSchemaVersion??saved.crmSchemaVersion,properties,names,orgId);corrupt=corrupt||restored.corrupt;
   const marketing=restoreCampaigns(value.campaigns,value.campaignSchemaVersion??saved.campaignSchemaVersion,properties,restored.crm,orgId);corrupt=corrupt||marketing.corrupt;
   return {properties,jobs:uniqueJobs,crm:restored.crm,campaigns:marketing.campaigns,preparedConnectors:Array.isArray(value.preparedConnectors)?[...new Set(value.preparedConnectors.filter(isConnector))]:[],assignMethod:value.assignMethod==='manual'?'manual':'round-robin',fallbackAgent:typeof value.fallbackAgent==='string'&&names.includes(value.fallbackAgent)?value.fallbackAgent:orgId===demoOrganizationId?initialState.fallbackAgent:'',activeAgents:strings(value.activeAgents)?[...new Set(value.activeAgents.filter(a=>names.includes(a)))]:orgId===demoOrganizationId?initialState.activeAgents:[]};
  }
  const workspaces:Record<string,OperationalSlice>={};
  for(const o of organization.organizations){
   if(o.id===rawActive)workspaces[o.id]=decodeSlice(saved,o.id,properties);
   else {const slice=savedSlices[o.id];workspaces[o.id]=isRecord(slice)?decodeSlice(slice,o.id):emptyWorkspace();}

  }
  if(active!==rawActive)corrupt=true;
  properties=workspaces[active].properties;
  return {state:{...initialState,workspaceSchemaVersion:1,workspaces,organization,...workspaces[active],plan:workspaceOrganization(organization).plan},storageWarning:corrupt?'Some invalid local records were excluded. Other valid drafts remain available.':''};
 }catch{return {state:initialState,storageWarning:'Local demo storage is unavailable or damaged. Built-in examples are shown; changes may last only for this session.'};}
}
export function createDemoStore(){
 let snapshot=typeof window==='undefined'?serverSnapshot:{...restoreState(),hydrated:true};const listeners=new Set<()=>void>();
 const update:DemoContext['update']=fn=>{
  snapshot={...snapshot,state:retainWorkspace(fn(snapshot.state)),hydrated:true};
  try{const serialized=JSON.stringify(snapshot.state);if(serialized.length>4_000_000||Object.keys(snapshot.state.properties).length>500)throw new Error('Local demo capacity');window.localStorage.setItem(storeKey,serialized);}catch{snapshot={...snapshot,storageWarning:'Browser storage is unavailable or full. Changes are in memory only; keep this session open.'};}
  listeners.forEach(listener=>listener());
 };
 const guard=(permission:Permission):string|null=>{const s=snapshot.state;const suspended=workspaceOrganization(s.organization).status==='suspended-demo'&&s.organization.actor!=='super-admin';const error=suspended?'Organization is suspended in this local demo.':permissionError(s.organization,permission);if(error)update(p=>({...p,organization:audit(p.organization,'permission-denied',permission,null,error,'denied-demo')}));return error;};
 const record=(action:string,target:string,revision:number|null=null)=>update(s=>({...s,organization:audit(s.organization,action,target,revision)}));
 const organizationCommand=(command:OrganizationCommand,syncPool=true)=>{
  const previous=snapshot.state;const r=applyOrganizationCommand(previous,command);
  update(s=>{
   const member=!r.error&&command.type==='member'?r.organization.members.find(m=>m.id===command.id):undefined;
   const available=member?.status==='active-demo'&&member.available;
   if(!r.error&&command.type==='create'&&r.id){const direct=r.organization.members.find(m=>m.organizationId===r.id&&m.status==='active-demo'&&m.available);return {...s,organization:r.organization,plan:r.plan,workspaces:{...s.workspaces,[r.id]:emptyWorkspace(direct?.alias)}};}
   if(!r.error&&command.type==='select'){
    const oldId=activeOrganizationId(s.organization);const workspaces={...s.workspaces,[oldId]:workspaceSlice(s)};
    const slice=workspaces[command.organizationId]??emptyWorkspace();
    return {...s,...slice,workspaces,organization:r.organization,plan:r.plan};
   }
   if(member&&member.organizationId!==activeOrganizationId(s.organization)){
    const slice=s.workspaces?.[member.organizationId]??emptyWorkspace();
    const next={...slice,activeAgents:syncPool?(available?[...new Set([...slice.activeAgents,member.alias])]:slice.activeAgents.filter(a=>a!==member.alias)):slice.activeAgents,crm:{...slice.crm,unavailableAgents:available?slice.crm.unavailableAgents.filter(a=>a!==member.alias):[...new Set([...slice.crm.unavailableAgents,member.alias])]}};
    return {...s,organization:r.organization,plan:r.plan,workspaces:{...s.workspaces,[member.organizationId]:next}};
   }
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
  update:(fn:(s:DemoState)=>DemoState)=>{const s=snapshot.state;const next=fn(s);if(next.plan!==s.plan){if(guard('billing'))return;organizationCommand({type:'plan',organizationId:activeOrganizationId(s.organization),plan:next.plan});return;}if(next.assignMethod!==s.assignMethod||next.fallbackAgent!==s.fallbackAgent||next.activeAgents!==s.activeAgents){if(guard('lead.assign'))return;update(()=>next);record('assignment-settings-updated','workspace');return;}},reset:()=>{if(guard('admin'))return;update(()=>({...initialState,properties:seedProperties(),crm:seedCrm(seedProperties())}));},
  campaignCommand:(command:CampaignCommand)=>{const approving=command.type==='transition'&&['review-policy','approve-advertiser','approve-admin','simulate','reject'].includes(command.action);const denied=guard(approving?'campaign.approve':'campaign.edit');if(denied)return {error:denied};if(command.type==='suggest'){const limit=effectivePlan(snapshot.state).aiCredits;if(limit!==null&&usage(snapshot.state).credits>=limit)return {error:'Illustrative AI-credit quota reached. No model request was made.'};}const adjusted=command.type==='create'?{...command,input:{...command.input,adminRequired:command.input.adminRequired||workspaceOrganization(snapshot.state.organization).settings.approvalRequired}}:command;const result=applyCampaignCommand(snapshot.state,adjusted,localMarketingAI);if(!result.error)update(s=>({...s,campaigns:result.campaigns,crm:result.crm,organization:audit(s.organization,`campaign:${command.type}`,result.id??'campaign')}));return {error:result.error,id:result.id,leadId:result.leadId,campaign:result.campaigns.find(c=>c.id===result.id)};},
  crmCommand:(command:CrmCommand)=>{if(command.type==='availability'){const member=snapshot.state.organization.members.find(m=>m.organizationId===activeOrganizationId(snapshot.state.organization)&&m.alias===command.agent);if(member){const denied=guard('lead.assign');if(denied)return {error:denied};const result=organizationCommand({type:'member',id:member.id,revision:member.revision,role:member.role,status:member.status,available:command.available},false);if(result.error)return result;}}const denied=guard(command.type==='assign'||command.type==='availability'?'lead.assign':command.type==='spend'?'billing':'lead.work');if(denied)return {error:denied};const result=applyCrmCommand(snapshot.state,command);if(result.crm!==snapshot.state.crm)update(s=>({...s,crm:result.crm,organization:audit(s.organization,`crm:${command.type}`,'leadId' in command?command.leadId:'workspace')}));return {error:result.error,leadId:result.leadId};},
  createProperty:()=>{if(guard('property.edit'))return '';const id=`DEMO-${crypto.randomUUID()}`;update(p=>({...p,properties:{...p.properties,[id]:newProperty(id,undefined,activeOrganizationId(p.organization))},organization:audit(p.organization,'property-created',id,1)}));return id;},
  saveProperty:(id:string,revision:number,changes:PropertyChanges,action:string,approved=false)=>{
   if(guard('property.edit'))return false;const p=findProperty(snapshot.state.properties,id);if(!p||p.revision!==revision)return false;
   const next=reviseProperty(p,changes,action,approved);if(!readProperty(next,activeOrganizationId(snapshot.state.organization)))return false;
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
    return {id:`DEMO-JOB-${crypto.randomUUID()}`,listingId:id,organizationId:activeOrganizationId(s.organization),propertyRevision:revision,destination,status,missing,at,mappingVersion,attempts:[{at,action:'simulate',propertyRevision:revision,mappingVersion,status,missing}]};
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
 const copyText=usePrototypeCopy();
 const [store]=useState(createDemoStore);const snapshot=useSyncExternalStore(store.subscribe,store.getSnapshot,getServerSnapshot);
 const value=useMemo(()=>({...snapshot,repository:store.repository,organizationCommand:store.organizationCommand,campaignCommand:store.campaignCommand,crmCommand:store.crmCommand,update:store.update,reset:store.reset,createProperty:store.createProperty,saveProperty:store.saveProperty,simulatePublishing:store.simulatePublishing,prepareConnector:store.prepareConnector,retryJob:store.retryJob,cancelJob:store.cancelJob}),[snapshot,store]);
 return <Context.Provider value={value}>{snapshot.storageWarning&&<p role="status" className="gm-storage-warning">{copyText(snapshot.storageWarning)}</p>}{children}</Context.Provider>;
}
export function useGeminiDemo(){const ctx=useContext(Context);if(!ctx)throw new Error('GeminiDemoProvider is required');return ctx;}
