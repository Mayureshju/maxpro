import {getLocale} from 'next-intl/server';
import {AboutPage} from '@/components/marketing/marketing-pages';
import {publicMetadata} from '@/lib/marketing-metadata';
import type {MarketingLocale} from '@/lib/marketing-content';
export async function generateMetadata({params}:{params:Promise<{locale:string}>}){const {locale}=await params;return publicMetadata(locale,'/about',["About the product and its direction", "عن المنتج وتوجهه"],["The purpose, design principles and honest prototype status of the proposed real-estate operating system for Qatar and GCC agencies.", "الهدف ومبادئ التصميم والحالة التجريبية لنظام إدارة العقارات المقترح لوكالات قطر والخليج."]);}
export default async function Page(){const locale=await getLocale() as MarketingLocale;return <AboutPage locale={locale}/>;}
