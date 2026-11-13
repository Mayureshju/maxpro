import {AgencyProperty} from '@/components/agency/workspace-pages';
export default async function Page({params}:{params:Promise<{id:string}>}){const {id}=await params;return <AgencyProperty id={id}/>}
