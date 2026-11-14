import {getLocale} from 'next-intl/server';
import {PlatformPage} from '@/components/marketing/marketing-pages';
import {publicMetadata} from '@/lib/marketing-metadata';
import type {MarketingLocale} from '@/lib/marketing-content';
export async function generateMetadata({params}:{params:Promise<{locale:string}>}){const {locale}=await params;return publicMetadata(locale,'/solutions',["The connected real-estate platform", "المنصة العقارية المترابطة"],["Explore property records, reviewed channel preparation and enquiry follow-up for agencies, brokers and owners in Qatar and the GCC.", "استكشف سجلات العقارات وتجهيز القنوات بعد المراجعة ومتابعة الاستفسارات للوكالات والوسطاء والملاك في قطر والخليج."]);}
export default async function Page(){const locale=await getLocale() as MarketingLocale;return <PlatformPage locale={locale}/>;}
