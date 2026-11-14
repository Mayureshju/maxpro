import {getLocale} from 'next-intl/server';
import {AgencySolutionPage} from '@/components/marketing/marketing-pages';
import {publicMetadata} from '@/lib/marketing-metadata';
import type {MarketingLocale} from '@/lib/marketing-content';
export async function generateMetadata({params}:{params:Promise<{locale:string}>}){const {locale}=await params;return publicMetadata(locale,'/solutions/agencies',["A connected day for your agency", "يوم مترابط لوكالتك"],["Follow a fictional agency through portfolio management, broker preparation, manager review and agent follow-up.", "تابع وكالة خيالية خلال إدارة المحفظة وتجهيز الوسيط ومراجعة المدير ومتابعة الوكيل."]);}
export default async function Page(){const locale=await getLocale() as MarketingLocale;return <AgencySolutionPage locale={locale}/>;}
