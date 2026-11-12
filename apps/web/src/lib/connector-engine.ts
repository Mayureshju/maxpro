/** Internal illustrative export contracts. Never submit these as provider schemas. */
import {canonicalPreflight,type CanonicalProperty} from './canonical-property';
import {getConnector,type ConnectorId,type FeedFormat} from './gemini-product';
export type ExportValue=string|number|boolean|null;
export type NormalizedExport={property_id:string;revision:number;title_en:string;title_ar:string;description_en:string;description_ar:string;purpose:string;property_type:string;currency:'QAR';rental_frequency:string|null;deposit_qar:number|null;cheques:number|null;furnishing:string;amenities:string;price_qar:number|null;area_sqm:number|null;bedrooms:number|null;bathrooms:number|null;city:string;district:string;latitude:number|null;longitude:number|null;permit:string;media_count:number;floor_plan:boolean};
export type MappingField={source:keyof NormalizedExport;output:string;required:boolean};
const fields:MappingField[]=[
 ['property_id','reference',true],['revision','revision',true],['title_en','title_en',true],['title_ar','title_ar',true],['description_en','description_en',true],['description_ar','description_ar',true],['purpose','purpose',true],['property_type','property_type',true],['currency','currency',true],['rental_frequency','rental_frequency',false],['deposit_qar','deposit_qar',false],['cheques','cheques',false],['furnishing','furnishing',false],['amenities','amenities',false],['price_qar','price_qar',true],['area_sqm','area_sqm',true],['bedrooms','bedrooms',false],['bathrooms','bathrooms',true],['city','city',true],['district','district',true],['latitude','latitude',true],['longitude','longitude',true],['permit','permit',true],['media_count','available_demo_media',true],['floor_plan','floor_plan',false]
].map(([source,output,required])=>({source:source as keyof NormalizedExport,output:output as string,required:required as boolean}));
export function destinationMapping(id:ConnectorId):MappingField[]{
 if(!getConnector(id).formats.length)return [];
 // Deliberately internal keys, not inferred official provider field names.
 return fields.map(f=>({...f,output:`${id.replaceAll('-','_')}_example_${f.output}`,required:f.required||(f.source==='floor_plan'&&id==='property-finder')}));
}
const finite=(n:number)=>Number.isFinite(n)?n:null;
const coordinate=(n:string,limit:number)=>n.trim()&&Number.isFinite(Number(n))&&Math.abs(Number(n))<=limit?Number(n):null;
export function normalizeProperty(p:CanonicalProperty):NormalizedExport{
 const f=p.facts;
 return {property_id:p.id,revision:p.revision,title_en:f.titleEn,title_ar:f.titleAr,description_en:f.descriptionEn,description_ar:f.descriptionAr,purpose:f.purpose,property_type:f.propertyType,currency:'QAR',rental_frequency:f.purpose==='rent'?f.rentalFrequency:null,deposit_qar:f.depositQar>=0?finite(f.depositQar):null,cheques:Number.isInteger(f.cheques)&&f.cheques>=1?f.cheques:null,furnishing:f.furnishing,amenities:f.amenities.join(' | '),price_qar:f.priceQar>0?finite(f.priceQar):null,area_sqm:f.areaSqm>0?finite(f.areaSqm):null,bedrooms:Number.isInteger(f.beds)&&f.beds>=0?f.beds:null,bathrooms:Number.isInteger(f.baths)&&f.baths>0?f.baths:null,city:f.city,district:f.district,latitude:coordinate(f.latitude,90),longitude:coordinate(f.longitude,180),permit:f.permit,media_count:p.media.filter(m=>m.kind==='image'&&m.availability==='sample'&&m.room!=='Other').length,floor_plan:p.media.some(m=>m.kind==='floor-plan'&&m.availability==='sample'&&m.room==='Floor plan')};
}
export function mapProperty(p:CanonicalProperty,id:ConnectorId){
 const normalized=normalizeProperty(p);const mapping=destinationMapping(id);
 const rows=mapping.map(f=>{const value=normalized[f.source];const missing=f.required&&(value===null||value===false||(typeof value==='string'&&!value.trim())||(f.source==='media_count'&&Number(value)<3));return {...f,value,error:missing?'Required example value missing or invalid':''};});
 const errors=[...new Set([...canonicalPreflight(p,id),...rows.filter(r=>r.error).map(r=>`Mapping: ${r.source}`),...(mapping.length?[]:['This connector has no property export adapter'])])];
 return {normalized,rows,errors,mappingVersion:getConnector(id).mappingVersion,propertyRevision:p.revision};
}
// XML 1.0 character ranges, including astral Unicode; replace forbidden controls/surrogates.
export function xmlEscape(value:ExportValue):string{return String(value??'').replace(/[^\u0009\u000A\u000D\u0020-\uD7FF\uE000-\uFFFD\u{10000}-\u{10FFFF}]/gu,'\uFFFD').replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;').replaceAll("'",'&apos;');}
export function csvCell(value:ExportValue):string{
 let s=String(value??'');if(/^[\s\uFEFF]*[=+\-@]/u.test(s)||/^[\t\r\n]/u.test(s))s="'"+s;
 return '"'+s.replaceAll('"','""')+'"';
}
export function generateFeed(p:CanonicalProperty,id:ConnectorId,format:FeedFormat){
 const result=mapProperty(p,id);const data=Object.fromEntries(result.rows.map(r=>[r.output,r.value]));
 const meta={contract:'illustrative-internal-example',destination:id,mapping_version:result.mappingVersion,property_revision:p.revision,remote_sent:false};
 const output=format==='json'?JSON.stringify({...meta,property:data},null,2):format==='csv'?[Object.keys(meta).concat(Object.keys(data)).map(csvCell).join(','),[...Object.values(meta),...Object.values(data)].map(csvCell).join(',')].join('\r\n'):`<?xml version="1.0" encoding="UTF-8"?>\n<example_feed contract="illustrative-internal-example" destination="${id}" mapping_version="${result.mappingVersion}" property_revision="${p.revision}" remote_sent="false">\n  <property>\n${result.rows.map(r=>`    <${r.output}>${xmlEscape(r.value)}</${r.output}>`).join('\n')}\n  </property>\n</example_feed>`;
 return {...result,output};
}
