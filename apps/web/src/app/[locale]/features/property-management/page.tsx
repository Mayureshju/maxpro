import {getLocale} from 'next-intl/server';
import {FeaturePage} from '@/components/marketing/feature-page';
import {featureLinks,type MarketingLocale} from '@/lib/marketing-content';
import {publicMetadata} from '@/lib/marketing-metadata';
export async function generateMetadata({params}:{params:Promise<{locale:string}>}){const {locale}=await params,f=featureLinks.find(f=>f.slug==='property-management')!;return publicMetadata(locale,'/features/property-management',f.title,f.description);}
export default async function Page(){const locale=await getLocale() as MarketingLocale;return <FeaturePage locale={locale} slug="property-management"/>;}
