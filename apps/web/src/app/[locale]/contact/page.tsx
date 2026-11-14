import {getLocale} from 'next-intl/server';
import {ContactPage} from '@/components/marketing/marketing-pages';
import {publicMetadata} from '@/lib/marketing-metadata';
import type {MarketingLocale} from '@/lib/marketing-content';
export async function generateMetadata({params}:{params:Promise<{locale:string}>}){const {locale}=await params;return publicMetadata(locale,'/contact',["A fictional enquiry preview", "معاينة استفسار خيالي"],["Preview a professional agency enquiry with read-only fictional details. Nothing is submitted and no personal information is collected.", "عاين استفسار وكالة ببيانات خيالية للقراءة فقط. لا يُرسل شيء ولا تُجمع معلومات شخصية."]);}
export default async function Page(){const locale=await getLocale() as MarketingLocale;return <ContactPage locale={locale}/>;}
