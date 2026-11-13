import {LegacyRouteNotice} from '@/components/gemini/legacy-route-notice';
import {MappingLibrary} from '@/components/gemini/distribution';
import {Suspense} from 'react';
export default function Page(){return <><LegacyRouteNotice href="/workspace/hub/feeds"/><Suspense fallback={<p>Loading local records…</p>}><MappingLibrary/></Suspense></>;}
