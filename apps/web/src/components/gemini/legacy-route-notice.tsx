'use client';
import {useLocale} from 'next-intl';
import {Link} from '@/i18n/navigation';
import {Notice} from '@/components/prototype/primitives';
export function LegacyRouteNotice({href}:{href:string}){const ar=useLocale()==='ar';return <Notice>{ar?'رابط توافق من واجهة سابقة؛ يعرض نفس السجلات والإجراءات الأساسية.':'Compatibility route from an earlier interface; this uses the same canonical records and actions.'} <Link href={href}>{ar?'فتح المسار الرئيسي':'Open the primary workflow'}</Link></Notice>;}
