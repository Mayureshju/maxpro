import type {CanonicalProperty} from './canonical-property';

/** Content coverage only: neither human approval nor any destination's readiness. */
export function propertyContentChecks(p:CanonicalProperty){
 const f=p.facts;
 return [
  {key:'titleEn',en:'English title',ar:'العنوان بالإنجليزية',step:1,complete:!!f.titleEn.trim()},
  {key:'titleAr',en:'Arabic title',ar:'العنوان بالعربية',step:1,complete:!!f.titleAr.trim()},
  {key:'descriptionEn',en:'English description',ar:'الوصف بالإنجليزية',step:1,complete:!!f.descriptionEn.trim()},
  {key:'descriptionAr',en:'Arabic description',ar:'الوصف بالعربية',step:1,complete:!!f.descriptionAr.trim()},
  {key:'city',en:'City',ar:'المدينة',step:0,complete:!!f.city.trim()},
  {key:'district',en:'District / zone',ar:'المنطقة',step:0,complete:!!f.district.trim()},
  {key:'priceQar',en:'Positive price (QAR)',ar:'سعر موجب (ر.ق)',step:0,complete:Number.isFinite(f.priceQar)&&f.priceQar>0},
  {key:'areaSqm',en:'Positive area (m²)',ar:'مساحة موجبة (م²)',step:0,complete:Number.isFinite(f.areaSqm)&&f.areaSqm>0},
  {key:'beds',en:'Bedrooms (zero for studio)',ar:'غرف النوم (صفر للاستوديو)',step:0,complete:Number.isInteger(f.beds)&&f.beds>=0},
  {key:'baths',en:'At least one bathroom',ar:'حمام واحد على الأقل',step:0,complete:Number.isInteger(f.baths)&&f.baths>=1},
  {key:'property-media',en:'Categorized cover photo',ar:'صورة غلاف مصنفة',step:1,complete:p.media.some(m=>m.kind==='image'&&m.room!=='Other'&&m.availability==='sample'&&!!m.sampleKey)},
 ];
}
