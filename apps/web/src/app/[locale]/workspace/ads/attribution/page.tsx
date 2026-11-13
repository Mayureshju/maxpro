import {LegacyRouteNotice} from '@/components/gemini/legacy-route-notice';
import {Suspense} from 'react';
import {CampaignAnalytics} from '@/components/gemini/campaign-marketing';
export default function Page(){return <><LegacyRouteNotice href="/workspace/analytics"/><Suspense><CampaignAnalytics/></Suspense></>}
