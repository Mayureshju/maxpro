import {getLocale} from 'next-intl/server';
import {PricingPage} from '@/components/marketing/marketing-pages';
import {publicMetadata} from '@/lib/marketing-metadata';
import type {MarketingLocale} from '@/lib/marketing-content';
export async function generateMetadata({params}:{params:Promise<{locale:string}>}){const {locale}=await params;return publicMetadata(locale,'/pricing',["Illustrative plans and transparent limits", "باقات توضيحية وحدود واضحة"],["Compare Starter QAR 179, Pro QAR 725 and Agency QAR 1,800+ monthly examples. All prices, quotas and commercial terms await approval.", "قارن أمثلة Starter بقيمة 179 وPro بقيمة 725 وAgency من 1,800 ر.ق شهرياً. الأسعار والحصص والشروط بانتظار الموافقة."]);}
export default async function Page(){const locale=await getLocale() as MarketingLocale;return <PricingPage locale={locale}/>;}
