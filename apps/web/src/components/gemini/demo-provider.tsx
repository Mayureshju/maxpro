'use client';
import {createContext,useContext,useMemo,useState,useSyncExternalStore} from 'react';
import {connectorCatalog,geminiPlans,initialCanonicalDraft,samplePropertyFacts,type CanonicalDraft,type ConnectorId,type PlanId} from '@/lib/gemini-product';
export type DemoJob = {id:string;listingId:string;destination:ConnectorId;status:'queued-demo'|'blocked-demo';missing:string[];at:string};
type DemoState = {plan:PlanId;preparedConnectors:ConnectorId[];jobs:DemoJob[];assignMethod:'round-robin'|'manual';fallbackAgent:string;activeAgents:string[];propertyEdits:Record<string,CanonicalDraft>};
const initialState:DemoState={plan:'agency',preparedConnectors:[],jobs:[],assignMethod:'round-robin',fallbackAgent:'Fatima Noor',activeAgents:['Fatima Noor','Karim Said','Mariam Ahmed'],propertyEdits:{}};
type DemoContext={state:DemoState;update:(fn:(prev:DemoState)=>DemoState)=>void;reset:()=>void;hydrated:boolean};
const Context=createContext<DemoContext|null>(null);
const storeKey='maxpro-gemini-v3-demo-state';
const serverSnapshot={state:initialState,hydrated:false};
const getServerSnapshot=()=>serverSnapshot;
const isRecord=(value:unknown):value is Record<string,unknown>=>typeof value==='object'&&value!==null&&!Array.isArray(value);
const isConnector=(value:unknown):value is ConnectorId=>connectorCatalog.some(c=>c.id===value);
const isStringArray=(value:unknown):value is string[]=>Array.isArray(value)&&value.every(x=>typeof x==='string');
function isDraft(value:unknown):value is CanonicalDraft{
 if(!isRecord(value))return false;
 const template=initialCanonicalDraft('AQ-10231');
 return Object.entries(template).every(([key,example])=>Array.isArray(example)?isStringArray(value[key]):typeof value[key]===typeof example&&(typeof value[key]!=='number'||Number.isFinite(value[key])))&&(value.purpose==='rent'||value.purpose==='sale');
}
function isJob(value:unknown):value is DemoJob{
 return isRecord(value)&&typeof value.id==='string'&&typeof value.listingId==='string'&&Object.hasOwn(samplePropertyFacts,value.listingId)&&isConnector(value.destination)&&(value.status==='queued-demo'||value.status==='blocked-demo')&&isStringArray(value.missing)&&typeof value.at==='string'&&Number.isFinite(Date.parse(value.at));
}
function restoreState():DemoState{
 try{
  const raw=window.localStorage.getItem(storeKey);
  const saved:unknown=raw?JSON.parse(raw):null;
  if(!isRecord(saved))return initialState;
  return {
   plan:geminiPlans.find(p=>p.id===saved.plan)?.id??initialState.plan,
   preparedConnectors:Array.isArray(saved.preparedConnectors)?[...new Set(saved.preparedConnectors.filter(isConnector))]:[],
   jobs:Array.isArray(saved.jobs)?saved.jobs.filter(isJob):[],
   assignMethod:saved.assignMethod==='manual'?'manual':'round-robin',
   fallbackAgent:typeof saved.fallbackAgent==='string'?saved.fallbackAgent:initialState.fallbackAgent,
   activeAgents:isStringArray(saved.activeAgents)?saved.activeAgents:initialState.activeAgents,
   propertyEdits:isRecord(saved.propertyEdits)?Object.fromEntries(Object.entries(saved.propertyEdits).filter(([id,draft])=>Object.hasOwn(samplePropertyFacts,id)&&isDraft(draft))) as Record<string,CanonicalDraft>:{},
  };
 }catch{return initialState;} // Storage can be disabled or contain an obsolete/corrupt demo.
}
function createDemoStore(){
 let snapshot=typeof window==='undefined'?serverSnapshot:{state:restoreState(),hydrated:true};
 const listeners=new Set<()=>void>();
 const update:DemoContext['update']=fn=>{
  snapshot={state:fn(snapshot.state),hydrated:true};
  try{window.localStorage.setItem(storeKey,JSON.stringify(snapshot.state));}catch{/* Demo still works when browser storage is unavailable. */}
  listeners.forEach(listener=>listener());
 };
 return {
  getSnapshot:()=>snapshot,
  subscribe:(listener:()=>void)=>{listeners.add(listener);return ()=>{listeners.delete(listener);};},
  update,
  reset:()=>update(()=>initialState),
 };
}
export function GeminiDemoProvider({children}:{children:React.ReactNode}){
 // One store per provider prevents server requests from sharing a tenant's demo state.
 const [store]=useState(createDemoStore);
 const snapshot=useSyncExternalStore(store.subscribe,store.getSnapshot,getServerSnapshot);
 const value=useMemo(()=>({...snapshot,update:store.update,reset:store.reset}),[snapshot,store]);
 return <Context.Provider value={value}>{children}</Context.Provider>;
}
export function useGeminiDemo(){const ctx=useContext(Context);if(!ctx)throw new Error('GeminiDemoProvider is required');return ctx;}
