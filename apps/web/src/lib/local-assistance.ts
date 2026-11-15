import type {CanonicalDraft} from './gemini-product';

/** Deterministic UI examples. Only explicitly labelled input can propose new facts. */
export function factProposals(notes:string):Partial<CanonicalDraft> {
 const result:Partial<CanonicalDraft>={};
 const fields=[['priceQar','price'],['areaSqm','area'],['beds','bedrooms'],['baths','bathrooms']] as const;
 for(const [key,label] of fields){const value=notes.match(new RegExp(`(?:^|[;\\n])\\s*${label}\\s*:\\s*(\\d+(?:\\.\\d+)?)\\s*(?:QAR|m²|sqm)?\\s*(?=$|[;\\n])`,'i'));if(value)result[key]=Number(value[1]);}
 for(const key of ['city','district'] as const){const value=notes.match(new RegExp(`(?:^|[;\\n])\\s*${key}\\s*:\\s*([^;\\n]{1,120})`,'i'));if(value)result[key]=value[1].trim();}
 return result;
}
export function listingCopy(f:CanonicalDraft){
 const location=[f.district,f.city].filter(Boolean).join(', ');
 return {
  en:[f.titleEn,location,f.areaSqm>0?`${f.areaSqm} m²`:'',f.beds>0?`${f.beds} bedrooms`:'',f.priceQar>0?`QAR ${f.priceQar}${f.purpose==='rent'?` / ${f.rentalFrequency}`:''}`:'',f.amenities.join(', ')].filter(Boolean).join('. '),
  ar:[f.titleAr,location,f.areaSqm>0?`${f.areaSqm} م²`:'',f.beds>0?`${f.beds} غرف نوم`:'',f.priceQar>0?`${f.priceQar} ر.ق${f.purpose==='rent'?(f.rentalFrequency==='year'?' / سنة':' / شهر'):''}`:'',f.amenities.join('، ')].filter(Boolean).join('. '),
 };
}

/** Warnings describe absent canonical sources; they never fill or infer a fact. */
export function copySourceWarnings(f:CanonicalDraft,ar=false){
 return ([['titleEn','English title','العنوان بالإنجليزية'],['titleAr','Arabic title','العنوان بالعربية'],['city','City','المدينة'],['district','District / zone','المنطقة'],['priceQar','Positive price (QAR)','سعر موجب (ر.ق)'],['areaSqm','Positive area (m²)','مساحة موجبة (م²)']] as const).filter(([key])=>typeof f[key]==='number'?Number(f[key])<=0:!String(f[key]).trim()).map(([,en,arabic])=>(ar?'المصدر الناقص: ':'Missing source: ')+(ar?arabic:en));
}
