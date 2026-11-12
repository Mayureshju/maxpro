import {notFound} from 'next/navigation';
import {leads} from '@/lib/prototype-data';
import {LeadDetail} from '@/components/prototype/relationships';
export default async function Page({params}:{params:Promise<{id:string}>}){const {id}=await params;if(!leads.some(x=>x.id===id))notFound();return <LeadDetail id={id} />}
