import {getLocale} from 'next-intl/server';
import {IntegrationsPage} from '@/components/marketing/marketing-pages';
import {publicMetadata} from '@/lib/marketing-metadata';
import type {MarketingLocale} from '@/lib/marketing-content';
export async function generateMetadata({params}:{params:Promise<{locale:string}>}){const {locale}=await params;return publicMetadata(locale,'/integrations',["Planned integrations, explained", "شرح التكاملات المخططة"],["Understand intended portal, advertising, WhatsApp and measurement workflows, official access prerequisites and their unconnected prototype status.", "تعرّف على مسارات البوابات والإعلانات وواتساب والقياس ومتطلبات الوصول الرسمي وحالتها غير المتصلة في النموذج."]);}
export default async function Page(){const locale=await getLocale() as MarketingLocale;return <IntegrationsPage locale={locale}/>;}
