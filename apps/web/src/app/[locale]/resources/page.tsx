import {getLocale} from 'next-intl/server';
import {ResourcesPage} from '@/components/marketing/marketing-pages';
import {publicMetadata} from '@/lib/marketing-metadata';
import type {MarketingLocale} from '@/lib/marketing-content';
export async function generateMetadata({params}:{params:Promise<{locale:string}>}){const {locale}=await params;return publicMetadata(locale,'/resources',["Field notes on property work", "ملاحظات عن العمل العقاري"],["Two practical product notes on structured listing information and bilingual review, without invented market research.", "ملاحظتان عمليتان عن معلومات الإعلان المنظمة والمراجعة باللغتين، دون أبحاث سوق مختلقة."]);}
export default async function Page(){const locale=await getLocale() as MarketingLocale;return <ResourcesPage locale={locale}/>;}
