import type {MetadataRoute} from 'next';
import {marketingOrigin} from '@/lib/marketing-metadata';
export default function robots():MetadataRoute.Robots{return {rules:process.env.NEXT_PUBLIC_SITE_URL?{userAgent:'*',allow:['/en','/ar'],disallow:['/en/workspace','/ar/workspace','/en/register','/ar/register','/en/sign-in','/ar/sign-in','/en/favorites','/ar/favorites','/en/compare','/ar/compare','/en/saved-searches','/ar/saved-searches','/en/map','/ar/map']}:{userAgent:'*',disallow:'/'},sitemap:new URL('/sitemap.xml',marketingOrigin).href}}
