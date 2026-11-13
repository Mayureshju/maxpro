import {LeadsPage} from '@/components/gemini/lead-workspace';
export default async function Page({searchParams}:{searchParams:Promise<{property?:string;intake?:string}>}){const {property,intake}=await searchParams;return <LeadsPage key={property??'all'} initialProperty={property} initialIntake={intake==='1'}/>;}
