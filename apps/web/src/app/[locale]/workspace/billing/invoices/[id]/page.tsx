import {FinanceOps} from '@/components/prototype/extended';
export default async function Page({params}:{params:Promise<{id:string}>}){const {id}=await params;return <FinanceOps part='invoice' id={id}/>;}
