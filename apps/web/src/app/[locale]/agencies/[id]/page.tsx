import {PublicAgency} from '@/components/prototype/public-platform';
export default async function Page({params}:{params:Promise<{id:string}>}){const {id}=await params;return <PublicAgency detail id={id}/>;}
