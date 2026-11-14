import {publicMetadata} from '@/lib/marketing-metadata';
import {PublicInformational} from '@/components/prototype/public-pages';
export default function Page(){return <PublicInformational kind='agencies'/>}

export async function generateMetadata({params}:{params:Promise<{locale:string}>}){const {locale}=await params;return publicMetadata(locale,'/agencies',["Fictional agency directory", "دليل وكالات خيالية"],['Fictional prototype preview. No live services, verified listings or real account access.','معاينة نموذج خيالي. لا توجد خدمات متصلة أو عقارات موثقة أو حسابات فعلية.'],false);}
