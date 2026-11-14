import type {MetadataRoute} from 'next';
import {marketingOrigin,publicMarketingRoutes} from '@/lib/marketing-metadata';
export default function sitemap():MetadataRoute.Sitemap{return publicMarketingRoutes.flatMap(path=>['en','ar'].map(locale=>({url:new URL(`/${locale}${path}`,marketingOrigin).href,alternates:{languages:{en:new URL(`/en${path}`,marketingOrigin).href,ar:new URL(`/ar${path}`,marketingOrigin).href}}})))}
