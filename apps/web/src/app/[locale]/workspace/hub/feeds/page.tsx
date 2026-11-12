import {FeedManager} from '@/components/gemini/connectors';
import {Suspense} from 'react';
export default function Page(){return <Suspense fallback={<p>Loading local records…</p>}><FeedManager/></Suspense>;}
