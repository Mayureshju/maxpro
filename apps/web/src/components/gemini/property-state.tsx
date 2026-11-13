'use client';
import {useLocale} from 'next-intl';
import {Link} from '@/i18n/navigation';
import {Intro,Notice} from '@/components/prototype/primitives';
import {useGeminiDemo} from './demo-provider';
export function PropertyUnavailable({id}:{id:string}){
 const ar=useLocale()==='ar';const {hydrated}=useGeminiDemo();const empty=hydrated&&!id;
 return <><Intro title={!hydrated?(ar?'جارٍ تحميل المسودة':'Loading local property'):empty?(ar?'لا توجد عقارات في هذه المؤسسة':'No properties in this organization'):(ar?'العقار غير موجود':'Property not found')} description={!hydrated?undefined:empty?(ar?'أنشئ أول مسودة عقار لبدء مسارات الوسائط والنشر والتسويق.':'Create the first canonical draft to begin media, publishing and marketing workflows.'):`${id} · ${ar?'لا يوجد سجل صالح بهذا المعرّف في المؤسسة المختارة.':'No valid record with this ID exists in the selected organization.'}`}/>{hydrated&&<><Notice>{ar?'مساحات العمل بيانات خيالية مستقلة في هذا المتصفح. التبديل بينها لا يوفر عزلاً أمنياً.':'Workspaces are independent fictional datasets in this browser. Switching provides no secure tenant isolation.'}</Notice><div className="px-action-stack"><Link className="px-button px-button-dark" href="/workspace/inventory/new">{ar?'إنشاء مسودة عقار':'Create a property draft'}</Link><Link className="px-button px-button-outline" href="/workspace/inventory">{ar?'العودة إلى العقارات':'Back to inventory'}</Link></div></>}</>;
}
