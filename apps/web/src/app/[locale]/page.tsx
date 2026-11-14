import {getLocale} from 'next-intl/server';
import {MarketingHome} from '@/components/marketing/home-page';
import {publicMetadata} from '@/lib/marketing-metadata';
import type {MarketingLocale} from '@/lib/marketing-content';
export async function generateMetadata({params}:{params:Promise<{locale:string}>}){const {locale}=await params;return publicMetadata(locale,'',["One property. Every channel. All in hand.", "عقار واحد. كل القنوات. والإدارة بين يديك."],["Prepare property listings, bilingual content, channel reviews and enquiries in one fictional agency workspace.", "جهّز إعلانات العقارات والمحتوى باللغتين ومراجعة القنوات والاستفسارات في مساحة وكالة تجريبية."]);}
export default async function Page(){const locale=await getLocale() as MarketingLocale;return <MarketingHome locale={locale}/>;}
