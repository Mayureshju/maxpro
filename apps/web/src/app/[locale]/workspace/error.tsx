'use client';
import {useLocale} from 'next-intl';
import {Link} from '@/i18n/navigation';
import {Intro,Notice} from '@/components/prototype/primitives';
export default function WorkspaceError({retry}:{error:unknown;retry:()=>void}){
 const ar=useLocale()==='ar';
 return <><Intro title={ar?'تعذّر فتح مساحة العمل':'This workspace could not be opened'} description={ar?'حاول مجدداً أو عد إلى مركز العمليات.':'Try again or return to the control tower.'}/><Notice>{ar?'لا تحذف بيانات المتصفح لاستعادة الصفحة. سجلاتك المحلية محفوظة بصورة منفصلة عن هذا العرض.':'You can retry without clearing browser storage. Local records are saved separately from this view.'}</Notice><div className="px-action-stack"><button type="button" className="px-button px-button-dark" onClick={retry}>{ar?'المحاولة مجدداً':'Try again'}</button><Link href="/workspace" className="px-button px-button-outline">{ar?'مركز العمليات':'Control tower'}</Link></div></>;
}
