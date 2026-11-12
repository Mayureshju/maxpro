import {notFound} from 'next/navigation';
import {listings} from '@/lib/prototype-data';
import {InventoryDetail} from '@/components/prototype/inventory';
export default async function Page({params}:{params:Promise<{id:string}>}){const {id}=await params;if(!listings.some(x=>x.id===id))notFound();return <InventoryDetail id={id} tab='enquiries'/>}
