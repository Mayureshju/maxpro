import {InboxPage} from '@/components/gemini/lead-workspace';
export default async function Page({searchParams}:{searchParams:Promise<{lead?:string}>}){const {lead}=await searchParams;return <InboxPage initialLead={lead}/>;}
