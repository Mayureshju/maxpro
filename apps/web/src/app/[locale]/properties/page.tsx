import {publicMetadata} from '@/lib/marketing-metadata';
import {PublicProperties} from '@/components/prototype/public-pages';
export default function Page(){return <PublicProperties/>}

export async function generateMetadata({params}:{params:Promise<{locale:string}>}){const {locale}=await params;return publicMetadata(locale,'/properties',["Sample property showcase", "عرض عقارات نموذجية"],['Fictional prototype preview. No live services, verified listings or real account access.','معاينة نموذج خيالي. لا توجد خدمات متصلة أو عقارات موثقة أو حسابات فعلية.'],false);}
