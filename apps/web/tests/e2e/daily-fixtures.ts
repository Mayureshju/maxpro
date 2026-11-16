/** Deterministic QA data, injected only into an isolated browser context. Never default app data. */
import {createDemoStore,type DemoState} from '../../src/components/gemini/demo-provider';
import {demoOrganizationId,newProperty,seedProperties,type DemoJob} from '../../src/lib/canonical-property';
import {emptyWorkspace} from '../../src/lib/organization-workspace';
import {seedCrm} from '../../src/lib/lead-crm';
import {applyCampaignCommand,blankCampaignInput} from '../../src/lib/campaign-engine';
import {localMarketingAI} from '../../src/lib/marketing-ai';

export function dailyFixture(kind:'empty'|'one'|'established'='established'):DemoState{
 const state=structuredClone(createDemoStore().getSnapshot().state),org='ORG-DEMO-DAILY-A',other='ORG-DEMO-DAILY-B';
 const profile=state.organization.organizations[0];
 state.organization.organizations=[profile,{...profile,id:org,name:'Demo Daily Agency',nameAr:'وكالة العمل التجريبية'},{...profile,id:other,name:'Demo Separate Agency',nameAr:'وكالة منفصلة تجريبية'}];
 state.organization.members=[...state.organization.members,...state.organization.members.map(m=>({...m,id:`DAILY-${m.id}`,organizationId:org}))];
 state.organization.members.push({id:'MEM-DAILY-B',organizationId:other,alias:'Demo Other Owner',role:'owner',status:'active-demo',available:true,revision:1});
 state.organization.activeOrganizationId=org;state.organization.audit=[];state.properties={};state.crm=seedCrm({});state.jobs=[];state.campaigns=[];state.preparedConnectors=['qatar-living','property-finder'];
 const sample=Object.values(seedProperties()).find(p=>p.source.factsReviewed&&p.source.copyReviewed)!;
 const count=kind==='empty'?0:kind==='one'?1:24;
 for(let i=0;i<count;i++){
  const id=`AQ-${50001+i}`,at=`2026-11-${String(i%14+1).padStart(2,'0')}T09:00:00.000Z`;
  state.properties[id]={...structuredClone(sample),id,organizationId:org,createdAt:at,updatedAt:at,history:[{revision:1,at,action:'Fictional sample seeded'}],publications:[],facts:{...sample.facts,titleEn:`Demo daily home ${i+1}`,titleAr:`منزل يومي تجريبي ${i+1}`,propertyType:i%2?'Villa':'Apartment',purpose:i%3?'rent':'sale',priceQar:5000+i*500},...(i%4===0?{status:'draft' as const,source:{...sample.source,factsReviewed:false,copyReviewed:false}}:{})};
 }
 if(count){
  const templates=createDemoStore().getSnapshot().state.crm.leads;
  state.crm.leads=Array.from({length:kind==='one'?1:32},(_,i)=>{
   const l=structuredClone(templates[i%templates.length]),id=`LE-${2100+i}`,at=`2026-11-14T${String(8+i%5).padStart(2,'0')}:00:00.000Z`,sourceEventId=`DEMO-DAILY-EVENT-${i+1}`,assignee=i%3?l.assignee:null;
   return {...l,id,organizationId:org,propertyId:`AQ-${50001+i%count}`,identity:{alias:`Demo visitor ${i+1}`,email:'visitor@example.test'},sourceEventId,sourceAt:at,receivedAt:at,consent:{...l.consent,at},attribution:{model:'first-touch',history:[{id:`ATTR-${id}`,at,source:l.source,sourceEventId,campaign:l.campaign}]},assignments:l.assignments.map((a,j)=>({...a,id:`ASSIGN-${id}-${j}`,at,to:assignee})),assignee,stage:i%4?'New':'Qualified',activity:l.activity.map((a,j)=>({...a,id:`ACTIVITY-${id}-${j}`,at})),conversation:{...l.conversation,id:`CV-${id}`,messages:l.conversation.messages.map((m,j)=>({...m,id:`MESSAGE-${id}-${j}`,at}))}};
  });
  if(kind==='established'){
   state.jobs=['qatar-living','property-finder'].map((destination,i)=>{const p=state.properties[`AQ-${50002+i}`],status=i?'blocked-demo':'queued-demo';return {id:`JOB-DAILY-${i}`,listingId:p.id,organizationId:org,propertyRevision:p.revision,destination,status,missing:i?['Local setup needs review']:[],at:p.updatedAt,mappingVersion:'internal-example-v1',attempts:[{at:p.updatedAt,action:'simulate',propertyRevision:p.revision,mappingVersion:'internal-example-v1',status,missing:i?['Local setup needs review']:[]}]} as DemoJob;});
   const input={...blankCampaignInput('AQ-50004'),headlineEn:'Demo daily campaign',headlineAr:'حملة يومية تجريبية',startDate:'2026-11-15',endDate:'2026-11-22'};
   const campaign=applyCampaignCommand(state,{type:'create',organizationId:org,role:'editor',input},localMarketingAI,'2026-11-14T10:00:00.000Z');
   if(campaign.error)throw new Error(campaign.error);state.campaigns=campaign.campaigns.map(c=>({...c,id:'DEMO-CAMPAIGN-00000000-0000-4000-8000-000000000014',history:c.history.map((e,i)=>({...e,id:`DAILY-CAMPAIGN-EVENT-${i}`}))}));
   const at='2026-11-14T10:00:00.000Z';state.organization.audit=['crm:reply','crm:assign','crm:intake','unexpected:internal'].map((action,i)=>({id:`AUDIT-DAILY-${i}`,organizationId:org,actor:'Fictional owner',role:'owner',action,target:state.crm.leads[0].id,revision:null,at,outcome:'applied-demo',note:''}));
  }
 }
 state.workspaceSchemaVersion=1;state.workspaces={[demoOrganizationId]:emptyWorkspace(),[org]:{properties:state.properties,jobs:state.jobs,preparedConnectors:state.preparedConnectors,campaigns:state.campaigns,crm:state.crm,assignMethod:state.assignMethod,activeAgents:state.activeAgents,fallbackAgent:state.fallbackAgent},[other]:emptyWorkspace()};
 // Older unfinished draft plus a completed journey tests selection independently of insertion order.
 if(kind==='established'){const draft=newProperty('AQ-50000','2026-10-01T00:00:00.000Z',org);state.properties[draft.id]=draft;}

 return state;
}
