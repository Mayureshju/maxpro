import {getLocale} from 'next-intl/server';
import {HowItWorksPage} from '@/components/marketing/marketing-pages';
import {publicMetadata} from '@/lib/marketing-metadata';
import type {MarketingLocale} from '@/lib/marketing-content';
export async function generateMetadata({params}:{params:Promise<{locale:string}>}){const {locale}=await params;return publicMetadata(locale,'/how-it-works',["How the agency workflow works", "كيف يعمل مسار الوكالة"],["A seven-step guided tour from fictional agency entry to property preparation, channel simulation and enquiry follow-up.", "جولة إرشادية من سبع خطوات، من الدخول بوكالة خيالية إلى تجهيز العقار ومحاكاة القنوات ومتابعة الاستفسارات."]);}
export default async function Page(){const locale=await getLocale() as MarketingLocale;return <HowItWorksPage locale={locale}/>;}
