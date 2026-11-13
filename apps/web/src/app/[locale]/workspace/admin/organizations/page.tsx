import {LegacyRouteNotice} from '@/components/gemini/legacy-route-notice';
import {Suspense} from 'react';
import {OrganizationDirectory} from '@/components/gemini/organization-workspace';
export default function Page(){return <><LegacyRouteNotice href="/workspace/admin"/><Suspense fallback={<p>Loading local records…</p>}><OrganizationDirectory/></Suspense></>;}
