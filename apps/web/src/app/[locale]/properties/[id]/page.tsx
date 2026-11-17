import {publicMetadata} from '@/lib/marketing-metadata';
import {notFound} from 'next/navigation';
import {listings} from '@/lib/prototype-data';
import {PublicProperty} from '@/components/prototype/public-pages';
import {LocalPropertyPreview} from '@/components/agency/local-property-preview';
export default async function Page({params,searchParams}:{params:Promise<{id:string}>;searchParams:Promise<{preview?:string}>}){const {id}=await params;const {preview}=await searchParams;if(preview==='local'||/^DEMO-[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id))return <LocalPropertyPreview id={id}/>;if(!listings.some(x=>x.id===id))notFound();return <PublicProperty id={id}/>;}

export async function generateMetadata({params}:{params:Promise<{locale:string;id:string}>}){const {locale,id}=await params;return publicMetadata(locale,`/properties/${encodeURIComponent(id)}`,["Sample property detail", "تفاصيل عقار نموذجي"],['Fictional demonstration record. Identity, availability and commercial facts are unverified.','سجل تجريبي خيالي. الهوية والتوفر والحقائق التجارية غير متحقق منها.'],true);}
