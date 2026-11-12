import {blankFacts,demoOrganizationId,roomCategories,sampleMedia,type CanonicalProperty,type DemoJob} from './canonical-property';
import {connectorCatalog,getConnector,type CanonicalDraft,type ConnectorId} from './gemini-product';
export const isRecord=(v:unknown):v is Record<string,unknown>=>typeof v==='object'&&v!==null&&!Array.isArray(v);
export const isConnector=(v:unknown):v is ConnectorId=>connectorCatalog.some(c=>c.id===v);
export const textValue=(v:unknown,max=12000):v is string=>typeof v==='string'&&v.length<=max;
export const strings=(v:unknown):v is string[]=>Array.isArray(v)&&v.length<=200&&v.every(x=>textValue(x,200));
const date=(v:unknown):v is string=>textValue(v,50)&&Number.isFinite(Date.parse(v));
export const validId=(v:unknown):v is string=>typeof v==='string'&&/^(AQ-\d{5}|DEMO-[a-f0-9-]{36})$/.test(v);
const integer=(v:unknown):v is number=>Number.isSafeInteger(v)&&Number(v)>=1;
export function readFacts(v:unknown,legacy=false):CanonicalDraft|null{
 if(!isRecord(v))return null;
 const value=legacy?{...blankFacts,...v}:v;
 if(!Object.entries(blankFacts).every(([k,example])=>Array.isArray(example)?strings(value[k]):typeof example==='number'?typeof value[k]==='number'&&Number.isFinite(value[k])&&Number(value[k])>=0:typeof example==='string'?textValue(value[k]):typeof value[k]==='boolean'))return null;
 if(!['rent','sale'].includes(String(value.purpose))||!['month','year'].includes(String(value.rentalFrequency)))return null;
 return Object.fromEntries(Object.keys(blankFacts).map(k=>[k,value[k]])) as CanonicalDraft;
}
export function readProperty(v:unknown):CanonicalProperty|null{
 if(!isRecord(v)||!validId(v.id)||v.organizationId!==demoOrganizationId||!integer(v.revision)||!['draft','reviewed','archived'].includes(String(v.status))||!date(v.createdAt)||!date(v.updatedAt))return null;
 const facts=readFacts(v.facts);const s=v.source;const proposal=v.proposal;
 if(!Number.isInteger(v.studioStage)||Number(v.studioStage)<0||Number(v.studioStage)>5)return null;
 if(!facts||!isRecord(s)||!['manual','text','document','voice','sample'].includes(String(s.kind))||!textValue(s.notes)||typeof s.factsReviewed!=='boolean'||typeof s.copyReviewed!=='boolean'||!(s.reviewedAt===null||date(s.reviewedAt))||!isRecord(proposal)||!textValue(proposal.descriptionEn)||!textValue(proposal.descriptionAr)||typeof v.watermark!=='boolean')return null;
 if((v.status==='reviewed'&&(!s.factsReviewed||!s.copyReviewed))||(s.factsReviewed&&s.copyReviewed&&!date(s.reviewedAt)))return null;
 if(!Array.isArray(v.media)||v.media.length>60||!Array.isArray(v.history)||v.history.length>200||!Array.isArray(v.publications)||v.publications.length>500)return null;
 const media:CanonicalProperty['media']=[];
 for(const a of v.media){
  if(!isRecord(a)||!textValue(a.id,100)||!textValue(a.name,200)||!roomCategories.includes(a.room as typeof roomCategories[number])||!['image','floor-plan'].includes(String(a.kind))||!['sample','metadata-only','unavailable'].includes(String(a.availability))||!Number.isSafeInteger(a.order)||Number(a.order)<0||!(a.sampleKey===null||sampleMedia.some(m=>m.key===a.sampleKey)))return null;
  if(a.availability==='sample'&&!sampleMedia.some(m=>m.key===a.sampleKey&&(m.key==='floor-plan'?a.kind==='floor-plan':a.kind==='image')))return null;
  media.push({id:a.id,name:a.name,room:a.room as typeof roomCategories[number],order:Number(a.order),kind:a.kind as 'image'|'floor-plan',availability:a.availability as 'sample'|'metadata-only'|'unavailable',sampleKey:a.sampleKey as string|null});
 }
 if(new Set(media.map(a=>a.id)).size!==media.length)return null;
 const history:CanonicalProperty['history']=[];
 for(const e of v.history){if(!isRecord(e)||!integer(e.revision)||e.revision>v.revision||!date(e.at)||!textValue(e.action,200))return null;history.push({revision:e.revision,at:e.at,action:e.action});}
 if(new Set(history.map(e=>e.revision)).size!==history.length)return null;
 const publications:CanonicalProperty['publications']=[];
 for(const r of v.publications){if(!isRecord(r)||!textValue(r.jobId,100)||!isConnector(r.destination)||!integer(r.propertyRevision)||r.propertyRevision>v.revision||r.externalReference!==null)return null;publications.push({jobId:r.jobId,destination:r.destination,propertyRevision:r.propertyRevision,externalReference:null});}
 return {id:v.id,organizationId:demoOrganizationId,revision:v.revision,status:v.status as CanonicalProperty['status'],createdAt:v.createdAt,updatedAt:v.updatedAt,facts,source:{kind:s.kind as CanonicalProperty['source']['kind'],notes:s.notes,factsReviewed:s.factsReviewed,copyReviewed:s.copyReviewed,reviewedAt:s.reviewedAt as string|null},proposal:{descriptionEn:proposal.descriptionEn,descriptionAr:proposal.descriptionAr},media:media.sort((a,b)=>a.order-b.order).map((a,i)=>({...a,order:i})),watermark:v.watermark,studioStage:Number(v.studioStage),history,publications};
}
export function readJob(v:unknown,properties:Record<string,CanonicalProperty>,legacy=false,extended=false):DemoJob|null{
 if(!isRecord(v)||!textValue(v.id,100)||!validId(v.listingId)||!Object.hasOwn(properties,v.listingId)||!isConnector(v.destination)||!['queued-demo','blocked-demo','cancelled-demo'].includes(String(v.status))||!strings(v.missing)||!date(v.at))return null;
 if((v.status==='queued-demo'&&v.missing.length!==0)||(v.status==='blocked-demo'&&v.missing.length===0))return null;
 const revision=legacy?properties[v.listingId].revision:v.propertyRevision;
 if(!integer(revision)||revision>properties[v.listingId].revision||(!legacy&&v.organizationId!==demoOrganizationId))return null;
 extended=extended&&!(v.mappingVersion===undefined&&v.attempts===undefined);
 const status=v.status as DemoJob['status'];const mappingVersion=extended?v.mappingVersion:`legacy-${getConnector(v.destination).mappingVersion}`;
 if(!textValue(mappingVersion,100))return null;
 const attempts:DemoJob['attempts']=[];
 if(extended){
  if(!Array.isArray(v.attempts)||!v.attempts.length||v.attempts.length>100)return null;
  for(const a of v.attempts){
   if(!isRecord(a)||!date(a.at)||!['simulate','retry','cancel'].includes(String(a.action))||!integer(a.propertyRevision)||a.propertyRevision>properties[v.listingId].revision||!textValue(a.mappingVersion,100)||!['queued-demo','blocked-demo','cancelled-demo'].includes(String(a.status))||!strings(a.missing))return null;
   if((a.status==='queued-demo'&&a.missing.length)||(a.status==='blocked-demo'&&!a.missing.length)||(a.action==='cancel')!==(a.status==='cancelled-demo'))return null;
   attempts.push({at:a.at,action:a.action as 'simulate'|'retry'|'cancel',propertyRevision:a.propertyRevision,mappingVersion:a.mappingVersion,status:a.status as DemoJob['status'],missing:a.missing});
  }
  const last=attempts.at(-1)!;
  if(last.at!==v.at||last.status!==status||last.propertyRevision!==revision||last.mappingVersion!==mappingVersion||JSON.stringify(last.missing)!==JSON.stringify(v.missing))return null;
 }else attempts.push({at:v.at,action:status==='cancelled-demo'?'cancel':'simulate',propertyRevision:revision,mappingVersion,status,missing:v.missing});
 return {id:v.id,listingId:v.listingId,organizationId:demoOrganizationId,propertyRevision:revision,destination:v.destination,status,missing:v.missing,at:v.at,mappingVersion,attempts};
}
