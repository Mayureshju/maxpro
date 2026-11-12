import {notFound} from 'next/navigation';
import {listings} from '@/lib/prototype-data';
import {PublicProperty} from '@/components/prototype/public-pages';
export default async function Page({params}:{params:Promise<{id:string}>}){const {id}=await params;if(!listings.some(x=>x.id===id))notFound();return <PublicProperty id={id}/>;}
