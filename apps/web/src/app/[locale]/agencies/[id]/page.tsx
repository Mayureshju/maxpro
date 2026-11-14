import {publicMetadata} from '@/lib/marketing-metadata';
import {PublicAgency} from '@/components/prototype/public-platform';
export default async function Page({params}:{params:Promise<{id:string}>}){const {id}=await params;return <PublicAgency detail id={id}/>;}

export async function generateMetadata({params}:{params:Promise<{locale:string;id:string}>}){const {locale,id}=await params;return publicMetadata(locale,`/agencies/${encodeURIComponent(id)}`,["Fictional agency profile", "ملف وكالة خيالية"],['Fictional demonstration record. Identity, availability and commercial facts are unverified.','سجل تجريبي خيالي. الهوية والتوفر والحقائق التجارية غير متحقق منها.'],true);}
