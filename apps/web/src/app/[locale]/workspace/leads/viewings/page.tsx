import {ViewingsPage} from '@/components/gemini/lead-analytics';
export default async function Page({searchParams}:{searchParams:Promise<{lead?:string}>}){const {lead}=await searchParams;return <ViewingsPage initialLead={lead}/>;}
