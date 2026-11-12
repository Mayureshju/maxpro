import {PropertyPublication} from '@/components/gemini/distribution';
export default async function Page({params}:{params:Promise<{id:string}>}){const {id}=await params;return <PropertyPublication id={id}/>;}
