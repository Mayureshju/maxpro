'use client';

import {useRef,useState} from 'react';
import {useLocale} from 'next-intl';
import {useRouter} from '@/i18n/navigation';
import {TextField,NativeSelect} from '@/components/ui/field';
import {SegmentedControl} from '@/components/ui/segmented-control';
import {useGeminiDemo} from '@/components/gemini/demo-provider';
import {UnsavedChanges} from '@/components/prototype/unsaved-changes';
import {can} from '@/lib/organization-engine';
import type {CanonicalDraft} from '@/lib/gemini-product';

export function QuickAdd(){
 const ar=useLocale()==='ar',t=(en:string,arabic:string)=>ar?arabic:en,router=useRouter();const {state,createProperty}=useGeminiDemo();
 const [title,setTitle]=useState(''),[city,setCity]=useState(''),[price,setPrice]=useState(''),[purpose,setPurpose]=useState<CanonicalDraft['purpose']>('rent'),[type,setType]=useState('Apartment'),[error,setError]=useState(''),[saved,setSaved]=useState(false),[attempted,setAttempted]=useState(false),[invalidNumber,setInvalidNumber]=useState(false);
 const creating=useRef(false),form=useRef<HTMLFormElement>(null);const changed=!!(title||city||price||purpose!=='rent'||type!=='Apartment');
 const priceError=invalidNumber||price!==''&&(!Number.isFinite(Number(price))||Number(price)<=0);
 function save(mode:'continue'|'draft'|'editor'){
  if(creating.current)return;setAttempted(mode==='continue');
  if(priceError||(mode==='continue'&&(!title.trim()||!city.trim()||!price))){setError(t('Check the highlighted fields. You can save an incomplete draft without a price.','تحقق من الحقول المحددة. يمكنك حفظ مسودة ناقصة دون سعر.'));requestAnimationFrame(()=>form.current?.querySelector<HTMLInputElement>('[aria-invalid="true"]')?.focus());return;}
  if(!can(state.organization,'property.edit')){setError(t('Your current demo role cannot create properties. Change your role in demo settings.','دورك التجريبي الحالي لا يسمح بإنشاء العقارات. غيّر الدور في إعدادات التجربة.'));return;}
  creating.current=true;const id=createProperty({[ar?'titleAr':'titleEn']:title.trim(),city:city.trim(),priceQar:price?Number(price):0,purpose,propertyType:type});
  if(!id){creating.current=false;setError(t('Could not save this draft. Check your demo permissions and values, then try again.','تعذر حفظ المسودة. تحقق من الصلاحيات والقيم التجريبية ثم حاول مجدداً.'));return;}
  setSaved(true);router.push(`/workspace/inventory/${id}${mode==='draft'?'':'/edit'}`);
 }
 return <><UnsavedChanges dirty={!saved&&changed}/><form ref={form} className="ag-quick-add" noValidate onSubmit={e=>{e.preventDefault();save('continue');}}><p className="ag-help">{t('Start with the essentials, then add photos and listing details in the editor.','ابدأ بالأساسيات ثم أضف الصور وتفاصيل الإعلان في المحرر.')}</p><div className="ag-form-grid"><TextField required label={t('Property title','عنوان العقار')} value={title} maxLength={160} onChange={e=>setTitle(e.target.value)} error={attempted&&!title.trim()?t('Enter a working title.','أدخل عنواناً مؤقتاً.'):undefined}/><SegmentedControl label={t('Purpose','الغرض')} value={purpose} onValueChange={setPurpose} options={[{value:'rent',label:t('Rent','إيجار')},{value:'sale',label:t('Sale','بيع')}]}/><label className="px-field">{t('Property type','نوع العقار')}<NativeSelect value={type} onChange={e=>setType(e.target.value)}>{[['Apartment','شقة'],['Villa','فيلا'],['Compound','مجمع'],['Commercial office','مكتب تجاري'],['Penthouse','بنتهاوس'],['Land','أرض'],['Studio','استوديو'],['Townhouse','تاون هاوس']].map(([en,arabic])=><option key={en} value={en}>{t(en,arabic)}</option>)}</NativeSelect></label><TextField required label={t('City','المدينة')} maxLength={160} value={city} onChange={e=>setCity(e.target.value)} error={attempted&&!city.trim()?t('Enter a city.','أدخل المدينة.'):undefined}/><TextField required label={t('Asking price (QAR)','السعر المطلوب (ر.ق)')} type="number" step="any" min="0.01" value={price} onChange={e=>{setPrice(e.target.value);setInvalidNumber(e.target.validity.badInput);}} error={priceError||attempted&&!price?t('Enter a price greater than zero.','أدخل سعراً أكبر من صفر.'):undefined} helperText={purpose==='rent'?t('Monthly rent. You can change the period in the editor.','إيجار شهري. يمكنك تغيير الفترة في المحرر.'):t('Total asking price for the sale.','إجمالي السعر المطلوب للبيع.')}/></div>{error&&<p className="gm-error" role="alert">{error}</p>}<div className="ag-quick-actions"><button className="px-button px-button-dark" type="submit" disabled={saved}>{t('Save & continue','حفظ ومتابعة')}</button><button className="px-button px-button-outline" type="button" disabled={saved} onClick={()=>save(changed?'draft':'editor')}>{changed?t('Save as draft','حفظ كمسودة'):t('Start with full editor','البدء بالمحرر الكامل')}</button></div><p className="ag-help">{t('Save & continue opens the editor. Save as draft keeps partial details and opens the property workspace.','الحفظ والمتابعة يفتح المحرر. الحفظ كمسودة يحتفظ بالتفاصيل الجزئية ويفتح مساحة العقار.')}</p></form></>;
}
