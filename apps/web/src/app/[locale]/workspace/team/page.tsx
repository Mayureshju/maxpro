import {Suspense} from 'react';
import {TeamWorkspace} from '@/components/gemini/organization-workspace';
export default function Page(){return <Suspense fallback={<p>Loading local records…</p>}><TeamWorkspace/></Suspense>;}
