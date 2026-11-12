import {notFound} from 'next/navigation';
import {listings} from '@/lib/prototype-data';
import {CanonicalPropertyEditor} from '@/components/gemini/listing-editor';
export default async function Page({params}:{params:Promise<{id:string}>}){const {id}=await params;if(!listings.some(x=>x.id===id))notFound();return <CanonicalPropertyEditor id={id}/>;}
