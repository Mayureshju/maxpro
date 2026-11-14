import {getLocale} from 'next-intl/server';
import {FAQPage} from '@/components/marketing/marketing-pages';
import {publicMetadata} from '@/lib/marketing-metadata';
import type {MarketingLocale} from '@/lib/marketing-content';
export async function generateMetadata({params}:{params:Promise<{locale:string}>}){const {locale}=await params;return publicMetadata(locale,'/faq',["Your platform questions, answered", "إجابات عن أسئلة المنصة"],["Helpful answers about property workflows, Arabic and English copy, planned integrations, illustrative pricing and the local interactive demo.", "إجابات عن مسارات العقار والنصوص بالعربية والإنجليزية والتكاملات المخططة والأسعار التوضيحية والنموذج المحلي."]);}
export default async function Page(){const locale=await getLocale() as MarketingLocale;return <FAQPage locale={locale}/>;}
