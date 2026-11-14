import {publicMetadata} from '@/lib/marketing-metadata';
import {notFound} from 'next/navigation';
import {listings} from '@/lib/prototype-data';
import {PublicProperty} from '@/components/prototype/public-pages';
export default async function Page({params}:{params:Promise<{id:string}>}){const {id}=await params;if(!listings.some(x=>x.id===id))notFound();return <PublicProperty id={id}/>;}

export async function generateMetadata({params}:{params:Promise<{locale:string;id:string}>}){const {locale,id}=await params;return publicMetadata(locale,`/properties/${encodeURIComponent(id)}`,["Sample property detail", "تفاصيل عقار نموذجي"],['Fictional demonstration record. Identity, availability and commercial facts are unverified.','سجل تجريبي خيالي. الهوية والتوفر والحقائق التجارية غير متحقق منها.'],true);}
