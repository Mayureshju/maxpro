/** Prototype domain contract. No customer data, secrets or file binaries belong here. */
import {listings,type Listing} from './prototype-data';
import {initialCanonicalDraft,samplePropertyFacts,type CanonicalDraft,type ConnectorId} from './gemini-product';

export const demoOrganizationId='ORG-DEMO-PEARL';
export const roomCategories=['Living room','Bedroom','Bathroom','Kitchen','Exterior','Floor plan','Other'] as const;
export type MediaAsset={id:string;name:string;room:typeof roomCategories[number];order:number;kind:'image'|'floor-plan';availability:'sample'|'metadata-only'|'unavailable';sampleKey:string|null};
export type PropertyEvent={revision:number;at:string;action:string};
export type PublicationReference={jobId:string;destination:ConnectorId;propertyRevision:number;externalReference:null};
export type CanonicalProperty={
 id:string;organizationId:typeof demoOrganizationId;revision:number;status:'draft'|'reviewed'|'archived';createdAt:string;updatedAt:string;
 facts:CanonicalDraft;
 source:{kind:'manual'|'text'|'document'|'voice'|'sample';notes:string;factsReviewed:boolean;copyReviewed:boolean;reviewedAt:string|null};
 proposal:{descriptionEn:string;descriptionAr:string};
 media:MediaAsset[];watermark:boolean;studioStage:number;history:PropertyEvent[];publications:PublicationReference[];
};
export type JobAttempt={at:string;action:'simulate'|'retry'|'cancel';propertyRevision:number;mappingVersion:string;status:'queued-demo'|'blocked-demo'|'cancelled-demo';missing:string[]};
export type DemoJob={id:string;listingId:string;organizationId:string;propertyRevision:number;destination:ConnectorId;status:'queued-demo'|'blocked-demo'|'cancelled-demo';missing:string[];at:string;mappingVersion:string;attempts:JobAttempt[]};
export const blankFacts:CanonicalDraft={titleEn:'',titleAr:'',descriptionEn:'',descriptionAr:'',propertyType:'Apartment',purpose:'rent',priceQar:0,depositQar:0,cheques:1,areaSqm:0,beds:0,baths:0,city:'',district:'',latitude:'',longitude:'',permit:'',ownerApproved:false,amenities:[],rentalFrequency:'month',furnishing:'Unspecified'};
export function newProperty(id:string,at=new Date().toISOString()):CanonicalProperty{
 return {id,organizationId:demoOrganizationId,revision:1,status:'draft',createdAt:at,updatedAt:at,facts:{...blankFacts,amenities:[]},source:{kind:'manual',notes:'',factsReviewed:false,copyReviewed:false,reviewedAt:null},proposal:{descriptionEn:'',descriptionAr:''},media:[],watermark:false,studioStage:0,history:[{revision:1,at,action:'Draft created'}],publications:[]};
}
/** Explicit fictional assets, never partner-hosted or uploaded property photos. */
export const sampleMedia=[
 {key:'living',name:'Sample hero photo',room:'Living room' as const,url:listings[0].image},
 {key:'bedroom',name:'Sample bedroom',room:'Bedroom' as const,url:listings[1].image},
 {key:'exterior',name:'Sample exterior',room:'Exterior' as const,url:listings[2].image},
 {key:'floor-plan',name:'Sample floor plan metadata',room:'Floor plan' as const,url:''},
];
export function sampleAsset(key:string,order:number):MediaAsset{
 const asset=sampleMedia.find(a=>a.key===key)!;
 return {id:`MEDIA-${crypto.randomUUID()}`,name:asset.name,room:asset.room,order,kind:key==='floor-plan'?'floor-plan':'image',availability:'sample',sampleKey:key};
}
export function seedProperties():Record<string,CanonicalProperty>{
 return Object.fromEntries(listings.map(listing=>{
  const p=newProperty(listing.id,'2026-11-12T00:00:00.000Z');const info=samplePropertyFacts[listing.id];
  p.facts=initialCanonicalDraft(listing.id);p.source={kind:'sample',notes:'Fictional built-in property example. No owner or documents verified.',factsReviewed:info.permitApproved,copyReviewed:info.descriptionAr,reviewedAt:info.permitApproved?p.createdAt:null};
  p.status=info.permitApproved?'reviewed':'draft';
  p.media=sampleMedia.slice(0,Math.min(info.mediaCount,3)).map((a,i)=>({id:`${listing.id}-media-${i}`,name:a.name,room:a.room,order:i,kind:'image',availability:'sample',sampleKey:a.key}));
  if(info.floorPlan)p.media.push({id:`${listing.id}-floor-plan`,name:'Sample floor plan metadata',room:'Floor plan',order:p.media.length,kind:'floor-plan',availability:'sample',sampleKey:'floor-plan'});
  p.history=[{revision:1,at:p.createdAt,action:'Fictional sample seeded'}];return [p.id,p];
 }));
}
export function reviseProperty(record:CanonicalProperty,changes:Partial<Pick<CanonicalProperty,'facts'|'media'|'watermark'|'source'|'proposal'|'status'|'studioStage'>>,action:string,approved=false):CanonicalProperty{
 const at=new Date().toISOString();const revision=record.revision+1;
 const changedFacts=changes.facts&&JSON.stringify(changes.facts)!==JSON.stringify(record.facts);
 const next={...record,...changes,revision,updatedAt:at};
 if(changedFacts&&!approved){next.source={...next.source,factsReviewed:false,copyReviewed:false,reviewedAt:null};next.status='draft';}
 if(approved){next.source={...next.source,factsReviewed:true,copyReviewed:true,reviewedAt:at};next.status='reviewed';}
 return {...next,history:[...record.history,{revision,at,action}].slice(-200)};
}
export function canonicalPreflight(p:CanonicalProperty|undefined,connectorId:ConnectorId):string[]{
 if(!p)return ['Canonical property record unavailable'];
 const f=p.facts;const errors:string[]=[];
 if(!f.descriptionEn.trim())errors.push('English description');
 if(!f.descriptionAr.trim())errors.push('Arabic description');
 if(!f.titleEn.trim())errors.push('English property title');
 if(!f.titleAr.trim())errors.push('Arabic property title');
 if(!(f.priceQar>0))errors.push('Valid asking price');
 if(!(f.areaSqm>0)||f.baths<1||!Number.isInteger(f.beds)||!Number.isInteger(f.baths))errors.push('Area and bathroom specifications');
 if(f.purpose==='rent'&&(!Number.isInteger(f.cheques)||f.cheques<1))errors.push('Valid rental payment terms');
 if(!f.city.trim()||!f.district.trim())errors.push('City and district');
 if(!f.latitude.trim()||!f.longitude.trim()||!Number.isFinite(Number(f.latitude))||!Number.isFinite(Number(f.longitude))||Math.abs(Number(f.latitude))>90||Math.abs(Number(f.longitude))>180)errors.push('Location coordinates');
 if(!f.permit.trim()||!f.ownerApproved)errors.push('Verified permit and advertiser approval');
 if(!p.source.factsReviewed||!p.source.copyReviewed)errors.push('Human factual and bilingual review');
 const available=p.media.filter(a=>a.availability==='sample'&&a.sampleKey&&a.room!=='Other');
 if(available.filter(a=>a.kind==='image'&&a.room!=='Floor plan').length<3)errors.push('At least three categorized media assets (demo policy)');
 const floorPlan=available.some(a=>a.kind==='floor-plan'&&a.room==='Floor plan');
 if(connectorId==='property-finder'&&!floorPlan)errors.push('Floor plan (example destination rule)');
 if(connectorId==='bayut-dubizzle')errors.push('Partner and country eligibility confirmation');
 if(connectorId==='meta-catalog'&&!floorPlan)errors.push('Landing-page and catalogue readiness review');
 if(p.status==='archived')errors.push('Archived property');
 return errors;
}
/** Compatibility projection for existing visual primitives; never a second editable store. */
export function propertyListing(p:CanonicalProperty,ar=false):Listing{
 const seed=listings.find(l=>l.id===p.id);const f=p.facts;const hero=p.media.find(a=>a.kind==='image'&&a.availability==='sample'&&a.sampleKey);
 return {id:p.id,title:(ar?f.titleAr:f.titleEn)||(ar?'مسودة بلا عنوان':'Untitled draft'),arTitle:f.titleAr,locality:f.district||'—',city:f.city||'—',price:f.priceQar,unit:f.purpose==='sale'?'sale':'month',beds:f.beds,baths:f.baths,area:f.areaSqm,category:f.propertyType,status:p.status==='reviewed'?'Reviewed':p.status==='archived'?'Archived':'Draft',portals:0,views:seed?.views??0,enquiries:seed?.enquiries??0,owner:seed?.owner??'Demo agency',updated:`Revision ${p.revision}`,image:sampleMedia.find(a=>a.key===hero?.sampleKey)?.url??'',permit:f.permit||'—'};
}

export function findProperty(properties:Record<string,CanonicalProperty>,id:string){return Object.hasOwn(properties,id)?properties[id]:undefined;}
