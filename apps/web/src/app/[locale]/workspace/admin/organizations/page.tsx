import {Suspense} from 'react';
import {OrganizationDirectory} from '@/components/gemini/organization-workspace';
export default function Page(){return <Suspense fallback={<p>Loading local records…</p>}><OrganizationDirectory/></Suspense>;}
