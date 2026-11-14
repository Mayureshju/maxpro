import {publicMetadata} from '@/lib/marketing-metadata';
import {SavedExperiences} from '@/components/prototype/extended';
export default function Page(){return <SavedExperiences mode='compare'/>}

export async function generateMetadata({params}:{params:Promise<{locale:string}>}){const {locale}=await params;return publicMetadata(locale,'/compare',["Compare sample properties", "قارن العقارات النموذجية"],['Fictional prototype preview. No live services, verified listings or real account access.','معاينة نموذج خيالي. لا توجد خدمات متصلة أو عقارات موثقة أو حسابات فعلية.'],true);}
