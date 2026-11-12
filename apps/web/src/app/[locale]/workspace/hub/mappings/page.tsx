import {MappingLibrary} from '@/components/gemini/distribution';
import {Suspense} from 'react';
export default function Page(){return <Suspense fallback={<p>Loading local records…</p>}><MappingLibrary/></Suspense>;}
