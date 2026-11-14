import {publicMetadata} from '@/lib/marketing-metadata';
import {PublicInformational} from '@/components/prototype/public-pages';
export default function Page(){return <PublicInformational kind='privacy'/>}

export async function generateMetadata({params}:{params:Promise<{locale:string}>}){const {locale}=await params;return publicMetadata(locale,'/privacy',["Draft privacy notice", "مسودة إشعار الخصوصية"],['Fictional prototype preview. No live services, verified listings or real account access.','معاينة نموذج خيالي. لا توجد خدمات متصلة أو عقارات موثقة أو حسابات فعلية.'],true);}
