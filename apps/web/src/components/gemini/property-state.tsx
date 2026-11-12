'use client';
import {useLocale} from 'next-intl';
import {Link} from '@/i18n/navigation';
import {Intro,Notice} from '@/components/prototype/primitives';
import {useGeminiDemo} from './demo-provider';
export function PropertyUnavailable({id}:{id:string}){const ar=useLocale()==='ar';const {hydrated}=useGeminiDemo();return <><Intro title={hydrated?(ar?'العقار غير موجود':'Property not found'):(ar?'جارٍ تحميل المسودة':'Loading local property')} description={hydrated?`${id} · ${ar?'لا يوجد سجل صالح بهذا المعرّف في هذا المتصفح.':'No valid record with this ID exists in this browser.'}`:undefined}/>{hydrated&&<><Notice>{ar?'المسودات محلية لهذا المتصفح. افتح المخزون أو أنشئ مسودة جديدة.':'Drafts belong to this browser. Open inventory or create a new draft.'}</Notice><Link className="px-button px-button-dark" href="/workspace/inventory">{ar?'العودة إلى العقارات':'Back to inventory'}</Link></>}</>}
