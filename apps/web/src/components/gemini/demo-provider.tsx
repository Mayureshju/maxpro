'use client';
import {createContext,useContext,useMemo,useState,useSyncExternalStore} from 'react';
import {geminiPlans,portalDestinationIds,type ConnectorId,type PlanId} from '@/lib/gemini-product';
import {findProperty,canonicalPreflight,demoOrganizationId,newProperty,reviseProperty,seedProperties,type CanonicalProperty,type DemoJob} from '@/lib/canonical-property';
import {isConnector,isRecord,readFacts,readJob,readProperty,strings,textValue} from '@/lib/property-storage';
export type {DemoJob} from '@/lib/canonical-property';
export type DemoState={schemaVersion:1;plan:PlanId;preparedConnectors:ConnectorId[];jobs:DemoJob[];assignMethod:'round-robin'|'manual';fallbackAgent:string;activeAgents:string[];properties:Record<string,CanonicalProperty>};
const initialState:DemoState={schemaVersion:1,plan:'agency',preparedConnectors:[],jobs:[],assignMethod:'round-robin',fallbackAgent:'Fatima Noor',activeAgents:['Fatima Noor','Karim Said','Mariam Ahmed'],properties:seedProperties()};
export function publishingQuotaErrors(state:DemoState,id:string,selected:ConnectorId[]):string[]{
 const plan=geminiPlans.find(p=>p.id===state.plan)!;const queued=state.jobs.filter(j=>j.status==='queued-demo');const errors:string[]=[];
 const properties=new Set(queued.map(j=>j.listingId));
 if(plan.listingLimit!==null&&!properties.has(id)&&properties.size>=plan.listingLimit)errors.push(`${plan.label} includes ${plan.listingLimit} queued properties. This illustrative listing quota is full.`);
 const portals=new Set([...queued.map(j=>j.destination),...selected].filter(d=>d!=='meta-catalog'));
 if(plan.connectorLimit!==null&&portals.size>plan.connectorLimit)errors.push(`${plan.label} includes ${plan.connectorLimit} destination(s) in this illustrative plan. Remove a selection or change the plan.`);
 if(state.plan==='starter'&&selected.includes('meta-catalog'))errors.push('Starter does not include the illustrative Meta catalogue entitlement.');
 return errors;
}
type PropertyChanges=Partial<Pick<CanonicalProperty,'facts'|'media'|'watermark'|'source'|'proposal'|'status'|'studioStage'>>;
type DemoContext={state:DemoState;update:(fn:(prev:DemoState)=>DemoState)=>void;reset:()=>void;hydrated:boolean;storageWarning:string;createProperty:()=>string;saveProperty:(id:string,revision:number,changes:PropertyChanges,action:string,approved?:boolean)=>boolean;simulatePublishing:(id:string,revision:number,selected:ConnectorId[],approved:boolean)=>string|null};
const Context=createContext<DemoContext|null>(null);
const storeKey='maxpro-gemini-v3-demo-state';
const serverSnapshot={state:initialState,hydrated:false,storageWarning:''};
const getServerSnapshot=()=>serverSnapshot;
function restoreState():{state:DemoState;storageWarning:string}{
 try{
  const raw=window.localStorage.getItem(storeKey);if(!raw)return {state:initialState,storageWarning:''};
  if(raw.length>4_000_000)throw new Error('Oversized demo');const saved:unknown=JSON.parse(raw);if(!isRecord(saved))throw new Error('Invalid demo');
  const legacy=saved.schemaVersion===undefined;if(!legacy&&saved.schemaVersion!==1)throw new Error('Unsupported demo version');
  let corrupt=false;const properties:Record<string,CanonicalProperty>=legacy?seedProperties():{};
  if(legacy&&isRecord(saved.propertyEdits))for(const [id,value] of Object.entries(saved.propertyEdits)){const facts=readFacts(value,true);if(facts&&Object.hasOwn(properties,id))properties[id]=reviseProperty(properties[id],{facts},'Phase 0 draft migrated');else corrupt=true;}
  if(!legacy){
   if(!isRecord(saved.properties)||Object.keys(saved.properties).length>500)throw new Error('Invalid repository');
   for(const [id,value] of Object.entries(saved.properties)){const p=readProperty(value);if(p&&p.id===id)properties[id]=p;else corrupt=true;}
  }
  const jobs=Array.isArray(saved.jobs)?saved.jobs.slice(0,500).flatMap(v=>{const j=readJob(v,properties,legacy);if(!j)corrupt=true;return j?[j]:[];}):[];
  // Rebuild references from validated jobs; never trust independently persisted remote references.
  const uniqueJobs=jobs.filter((j,i)=>{const unique=jobs.findIndex(other=>other.id===j.id)===i;if(!unique)corrupt=true;return unique;});
  for(const p of Object.values(properties))p.publications=uniqueJobs.filter(j=>j.listingId===p.id).map(j=>({jobId:j.id,destination:j.destination,propertyRevision:j.propertyRevision,externalReference:null}));
  return {state:{schemaVersion:1,plan:geminiPlans.find(p=>p.id===saved.plan)?.id??initialState.plan,preparedConnectors:Array.isArray(saved.preparedConnectors)?[...new Set(saved.preparedConnectors.filter(isConnector))]:[],jobs:uniqueJobs,assignMethod:saved.assignMethod==='manual'?'manual':'round-robin',fallbackAgent:textValue(saved.fallbackAgent,100)?saved.fallbackAgent:initialState.fallbackAgent,activeAgents:strings(saved.activeAgents)?saved.activeAgents:initialState.activeAgents,properties},storageWarning:corrupt?'Some invalid local records were excluded. Other valid drafts remain available.':''};
 }catch{return {state:initialState,storageWarning:'Local demo storage is unavailable or damaged. Built-in examples are shown; changes may last only for this session.'};}
}
function createDemoStore(){
 let snapshot=typeof window==='undefined'?serverSnapshot:{...restoreState(),hydrated:true};const listeners=new Set<()=>void>();
 const update:DemoContext['update']=fn=>{
  snapshot={...snapshot,state:fn(snapshot.state),hydrated:true};
  try{const serialized=JSON.stringify(snapshot.state);if(serialized.length>4_000_000||Object.keys(snapshot.state.properties).length>500)throw new Error('Local demo capacity');window.localStorage.setItem(storeKey,serialized);}catch{snapshot={...snapshot,storageWarning:'Browser storage is unavailable or full. Changes are in memory only; keep this session open.'};}
  listeners.forEach(listener=>listener());
 };
 const sync=(e:StorageEvent)=>{if(e.key===storeKey||e.key===null){snapshot={...restoreState(),hydrated:true};listeners.forEach(l=>l());}};
 return {
  getSnapshot:()=>snapshot,
  subscribe:(listener:()=>void)=>{listeners.add(listener);if(listeners.size===1)window.addEventListener('storage',sync);return ()=>{listeners.delete(listener);if(!listeners.size)window.removeEventListener('storage',sync);};},
  update,reset:()=>update(()=>({...initialState,properties:seedProperties()})),
  createProperty:()=>{const id=`DEMO-${crypto.randomUUID()}`;update(p=>({...p,properties:{...p.properties,[id]:newProperty(id)}}));return id;},
  saveProperty:(id:string,revision:number,changes:PropertyChanges,action:string,approved=false)=>{
   const p=findProperty(snapshot.state.properties,id);if(!p||p.revision!==revision)return false;
   const next=reviseProperty(p,changes,action,approved);if(!readProperty(next))return false;
   update(s=>({...s,properties:{...s.properties,[id]:next}}));return true;
  },
  simulatePublishing:(id:string,revision:number,selected:ConnectorId[],approved:boolean):string|null=>{
   const s=snapshot.state;const p=findProperty(s.properties,id);if(!p||p.revision!==revision)return 'Property changed. Review the current revision again.';
   if(!approved||!selected.length||new Set(selected).size!==selected.length||selected.some(d=>!portalDestinationIds.includes(d)))return 'Review and select valid destinations before simulation.';
   const quotaErrors=publishingQuotaErrors(s,id,selected);if(quotaErrors.length)return quotaErrors.join(' ');
   if(s.jobs.length+selected.length>500)return 'Local history is full. Use Reset all local demo data in connector diagnostics to start again.';
   const at=new Date().toISOString();const jobs:DemoJob[]=selected.map(destination=>{const missing=[...canonicalPreflight(p,destination),...(s.preparedConnectors.includes(destination)?[]:['Demo connector setup missing'])];return {id:`DEMO-JOB-${crypto.randomUUID()}`,listingId:id,organizationId:demoOrganizationId,propertyRevision:revision,destination,status:missing.length?'blocked-demo':'queued-demo',missing,at};});
   update(prev=>({...prev,jobs:[...jobs,...prev.jobs],properties:{...prev.properties,[id]:{...p,publications:[...p.publications,...jobs.map(j=>({jobId:j.id,destination:j.destination,propertyRevision:revision,externalReference:null}))]}}}));return null;
  },
 };
}
export function GeminiDemoProvider({children}:{children:React.ReactNode}){
 const [store]=useState(createDemoStore);const snapshot=useSyncExternalStore(store.subscribe,store.getSnapshot,getServerSnapshot);
 const value=useMemo(()=>({...snapshot,update:store.update,reset:store.reset,createProperty:store.createProperty,saveProperty:store.saveProperty,simulatePublishing:store.simulatePublishing}),[snapshot,store]);
 return <Context.Provider value={value}>{snapshot.storageWarning&&<p role="status" className="gm-storage-warning">{snapshot.storageWarning}</p>}{children}</Context.Provider>;
}
export function useGeminiDemo(){const ctx=useContext(Context);if(!ctx)throw new Error('GeminiDemoProvider is required');return ctx;}
