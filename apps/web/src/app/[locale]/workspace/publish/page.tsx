import {SyndicationPage} from '@/components/gemini/syndication';
import {Suspense} from 'react';
export default function Page(){return <Suspense fallback={<p>Loading local workflow…</p>}><SyndicationPage/></Suspense>;}
