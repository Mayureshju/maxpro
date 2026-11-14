import {publicMetadata} from '@/lib/marketing-metadata';
import {SavedExperiences} from '@/components/prototype/extended';
export default function Page(){return <SavedExperiences mode='map'/>}

export async function generateMetadata({params}:{params:Promise<{locale:string}>}){const {locale}=await params;return publicMetadata(locale,'/map',["Sample property map", "خريطة العقارات النموذجية"],['Fictional prototype preview. No live services, verified listings or real account access.','معاينة نموذج خيالي. لا توجد خدمات متصلة أو عقارات موثقة أو حسابات فعلية.'],true);}
