import {InventoryDetail} from '@/components/prototype/inventory';
export default async function Page({params}:{params:Promise<{id:string}>}){const {id}=await params;return <InventoryDetail id={id} />}
