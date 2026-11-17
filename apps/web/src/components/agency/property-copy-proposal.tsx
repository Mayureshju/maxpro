'use client';
import {useState} from 'react';
import {useLocale} from 'next-intl';
import {useGeminiDemo} from '@/components/gemini/demo-provider';
import {activeOrganizationId,can} from '@/lib/organization-engine';
import {listingCopy,copySourceWarnings} from '@/lib/local-assistance';
import type {CanonicalProperty} from '@/lib/canonical-property';
import {AssistancePanel} from './assistance-panel';

/** Explicit acceptance revises the canonical record; no second copy store or review authority. */
export function PropertyCopyProposal({property,onClose}:{property:CanonicalProperty;onClose:()=>void}){
 const {state,saveProperty}=useGeminiDemo(),ar=useLocale()==='ar',t=(en:string,arabic:string)=>ar?arabic:en;
 const [snapshot]=useState(property),p=state.properties[snapshot.id];const copy=listingCopy(snapshot.facts);
 const fingerprint=JSON.stringify([activeOrganizationId(state.organization),p?.id,p?.revision,can(state.organization,'property.edit')]);
 return <AssistancePanel title={t('Review bilingual listing proposal','مراجعة اقتراح الإعلان باللغتين')} sourceKey={fingerprint} sources={[
  {label:t('Canonical source','المصدر الأساسي'),value:`${snapshot.organizationId} · ${snapshot.id}@${snapshot.revision}`},
  {label:t('Saved titles','العناوين المحفوظة'),value:[snapshot.facts.titleEn,snapshot.facts.titleAr].join(' / ')},
  {label:t('Saved location','الموقع المحفوظ'),value:[snapshot.facts.district,snapshot.facts.city].join(', ')},
  {label:t('Saved facts','الحقائق المحفوظة'),value:`${snapshot.facts.areaSqm} m² · ${snapshot.facts.beds} · ${snapshot.facts.priceQar} QAR · ${snapshot.facts.purpose} / ${snapshot.facts.rentalFrequency} · ${snapshot.facts.amenities.join(', ')}`},
 ]} fields={can(state.organization,'property.edit')&&snapshot.status!=='archived'?[{key:'en',label:t('Description — English','الوصف بالإنجليزية'),before:snapshot.facts.descriptionEn,after:copy.en,dir:'ltr'},{key:'ar',label:'الوصف بالعربية',before:snapshot.facts.descriptionAr,after:copy.ar,dir:'rtl'}]:[]} emptyMessage={t('Your demo role cannot edit this property, or it is archived. No change can be accepted.','لا يسمح دورك التجريبي بتعديل العقار، أو أن العقار مؤرشف. لا يمكن قبول تغيير.')} warnings={copySourceWarnings(snapshot.facts,ar)} acceptLabel={t('Accept & save descriptions','قبول الأوصاف وحفظها')} onAccept={v=>activeOrganizationId(state.organization)===snapshot.organizationId&&can(state.organization,'property.edit')&&!!v.en?.trim()&&!!v.ar?.trim()&&saveProperty(snapshot.id,snapshot.revision,{facts:{...snapshot.facts,descriptionEn:v.en,descriptionAr:v.ar}},'Accepted source-grounded bilingual copy')} onClose={onClose}/>;
}
