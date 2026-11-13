import {Suspense} from 'react';
import {CampaignBuilder} from '@/components/gemini/campaign-studio';
export default async function Page({params}:{params:Promise<{id:string}>}){const {id}=await params;return <Suspense><CampaignBuilder id={id}/></Suspense>}
