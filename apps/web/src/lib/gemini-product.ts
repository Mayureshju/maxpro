import {listings} from './prototype-data';
/** Contract-aligned demo definitions from the Gemini-supplied PRD.
 * Commercial terms and third-party capabilities are illustrative until approved.
 * No integration here is authenticated or active.
 */
export type ConnectorId = 'property-finder' | 'qatar-living' | 'bayut-dubizzle' | 'meta-catalog' | 'google-ads' | 'ga4' | 'whatsapp' | 'ai-copy';
export type ConnectorCategory = 'Property portals' | 'Marketing' | 'Analytics' | 'Communications' | 'AI';
export interface ConnectorDefinition {
  id: ConnectorId;
  name: string;
  category: ConnectorCategory;
  type: string;
  summary: string;
  prerequisites: string[];
  demoFields: string[];
  agreement: string;
}
export const connectorCatalog: ConnectorDefinition[] = [
  {id:'property-finder',name:'Property Finder',category:'Property portals',type:'Partner API / feed',summary:'Syndication through an authorized enterprise integration or contracted feed.',prerequisites:['Partner onboarding and access','Listing mapping and compliance checks','Test listing accepted by partner'],demoFields:['English title','Price','Property type','Coordinates','Permit','Photos'],agreement:'Requires approved partner access; API/feed availability must be confirmed.'},
  {id:'qatar-living',name:'Qatar Living',category:'Property portals',type:'Business feed (subject to agreement)',summary:'Prepare a Qatar Living-compatible listing feed after verifying the available partner interface.',prerequisites:['Business publishing agreement','Approved transport and schema','Advertiser authorization'],demoFields:['Category','Price','Location','Description','Contact preferences'],agreement:'Do not assume API or scraping permission. Confirm partner access first.'},
  {id:'bayut-dubizzle',name:'Bayut / Dubizzle',category:'Property portals',type:'Partner feed (subject to region)',summary:'Prepare destination mappings only where the organization and geography are eligible.',prerequisites:['Country and account eligibility','Approved partner credentials','Schema and publishing contract'],demoFields:['Property type','Price','Location','Listing media'],agreement:'Country availability, licensing and publishing entitlement are unverified.'},
  {id:'meta-catalog',name:'Meta property catalogue',category:'Marketing',type:'Catalogue and marketing APIs',summary:'Controlled listing feeds and campaign drafts, subject to market and housing-ad restrictions.',prerequisites:['Meta Business verification','Catalogue and API permissions','Housing policy and consent review'],demoFields:['Listing ID','Availability','Price','Address','Images','Landing page'],agreement:'Catalogue and Marketing API permissions must be checked for the actual business.'},
  {id:'google-ads',name:'Google Ads / PMax',category:'Marketing',type:'Ads APIs / approved feeds',summary:'Google advertising setup with explicit capability and eligibility review.',prerequisites:['Authorized Google Ads account','Feed or campaign eligibility','Consent and conversion strategy'],demoFields:['Landing page','Creative assets','Conversion goals'],agreement:'Do not assume a generic real-estate PMax product feed is supported for every account.'},
  {id:'ga4',name:'Google Analytics 4',category:'Analytics',type:'Web tag + Measurement Protocol',summary:'Consent-aware website and server-side event measurement.',prerequisites:['Owned GA4 property and stream','Tagging and measurement plan','Secret stored server-side'],demoFields:['Event name','Client ID','Event ID','Consent'],agreement:'Measurement Protocol supplements, not replaces, client-side collection.'},
  {id:'whatsapp',name:'WhatsApp Business',category:'Communications',type:'Official Cloud API / BSP',summary:'Opted-in messaging, inbound webhooks and human-managed lead follow-up.',prerequisites:['Verified business number','Webhook and template approval','Consent and opt-out workflow'],demoFields:['Listing link','User opt-in','Template status','Conversation context'],agreement:'Only official WhatsApp Business Platform integrations are permitted.'},
  {id:'ai-copy',name:'AI copy & media assistant',category:'AI',type:'Server-side provider adapter',summary:'Grounded English/Arabic listing drafts and optional media transformations.',prerequisites:['Approved AI provider and data policy','Human factual review','Per-plan credit budget'],demoFields:['Verified listing facts','Language','Draft text','Edit history'],agreement:'No model is connected in this prototype; suggestions remain non-authoritative.'}
];
export type PlanId='starter'|'pro'|'agency';
export interface PlanDefinition {id:PlanId;label:string;monthlyQar:number|null;listingLimit:number|null;connectorLimit:number|null;aiCredits:number|null;seats:number|null;audience:string;}
export const geminiPlans:PlanDefinition[]=[
  {id:'starter',label:'Starter',monthlyQar:179,listingLimit:3,connectorLimit:1,aiCredits:5,seats:1,audience:'Private landlord'},
  {id:'pro',label:'Pro',monthlyQar:725,listingLimit:25,connectorLimit:2,aiCredits:50,seats:1,audience:'Independent broker'},
  {id:'agency',label:'Agency / Enterprise',monthlyQar:1800,listingLimit:null,connectorLimit:null,aiCredits:null,seats:null,audience:'Brokerages and developers'}
];
/** Demo enrichment, NOT a provider spec or legal statement. */
export const samplePropertyFacts:Record<string,{titleAr:string;floorPlan:boolean;hasCoordinates:boolean;mediaCount:number;permitApproved:boolean;descriptionEn:boolean;descriptionAr:boolean}>={
  'AQ-10231':{titleAr:'شقة بإطلالة على المارينا',floorPlan:true,hasCoordinates:true,mediaCount:7,permitApproved:true,descriptionEn:true,descriptionAr:true},
  'AQ-10233':{titleAr:'مسكن للتملك الحر في فيفا بحرية',floorPlan:true,hasCoordinates:true,mediaCount:6,permitApproved:true,descriptionEn:true,descriptionAr:true},
  'AQ-10241':{titleAr:'تاون هاوس بفناء داخلي',floorPlan:false,hasCoordinates:true,mediaCount:5,permitApproved:true,descriptionEn:true,descriptionAr:true},
  'AQ-10244':{titleAr:'بنتهاوس مع شرفة وإطلالة',floorPlan:false,hasCoordinates:false,mediaCount:2,permitApproved:false,descriptionEn:true,descriptionAr:false},
  'AQ-10251':{titleAr:'فيلا عائلية بحديقة خاصة',floorPlan:false,hasCoordinates:true,mediaCount:3,permitApproved:false,descriptionEn:true,descriptionAr:true},
  'AQ-10256':{titleAr:'استوديو مشرق في المدينة',floorPlan:false,hasCoordinates:false,mediaCount:0,permitApproved:false,descriptionEn:true,descriptionAr:false}
};

export type CanonicalDraft={titleEn:string;titleAr:string;descriptionEn:string;descriptionAr:string;propertyType:string;purpose:'rent'|'sale';priceQar:number;depositQar:number;cheques:number;areaSqm:number;beds:number;baths:number;city:string;district:string;latitude:string;longitude:string;permit:string;ownerApproved:boolean;amenities:string[];rentalFrequency:'month'|'year';furnishing:string;};
export function initialCanonicalDraft(id:string):CanonicalDraft{
 const x=listings.find(p=>p.id===id);if(!x)throw new Error('Unknown sample property');const ready=samplePropertyFacts[id];
 return {titleEn:x.title,titleAr:x.arTitle,descriptionEn:`Sample description for ${x.title}. Human verification required.`,descriptionAr:ready?.descriptionAr?'وصف عقاري توضيحي للمراجعة البشرية.':'',propertyType:x.category,purpose:x.unit==='sale'?'sale':'rent',priceQar:x.price,depositQar:0,cheques:1,areaSqm:x.area,beds:x.beds,baths:x.baths,city:x.city,district:x.locality,latitude:ready?.hasCoordinates?'25.291':'',longitude:ready?.hasCoordinates?'51.542':'',permit:ready?.permitApproved?x.permit:'',ownerApproved:!!ready?.permitApproved,amenities:['Parking','Security'],rentalFrequency:'month',furnishing:'Unspecified'};
}
export const portalDestinationIds:ConnectorId[]=['property-finder','qatar-living','bayut-dubizzle','meta-catalog'];
export function getConnector(id:ConnectorId){return connectorCatalog.find(c=>c.id===id)!;}
