import {StudioPrototype} from '@/components/prototype/studio';import {Suspense} from 'react';
export default function Page(){return <Suspense fallback={<p>Loading local workflow…</p>}><StudioPrototype/></Suspense>}
