import {notFound} from 'next/navigation';
import {connectorCatalog} from '@/lib/gemini-product';
import {ConnectorDetail} from '@/components/gemini/connectors';
export default async function Page({params}:{params:Promise<{id:string}>}){const {id}=await params;if(!connectorCatalog.some(c=>c.id===id))notFound();return <ConnectorDetail id={id}/>;}
