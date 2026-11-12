import {CanonicalPropertyEditor} from '@/components/gemini/listing-editor';
export default async function Page({params}:{params:Promise<{id:string}>}){const {id}=await params;return <CanonicalPropertyEditor id={id}/>;}
