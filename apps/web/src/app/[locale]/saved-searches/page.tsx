import {publicMetadata} from '@/lib/marketing-metadata';
import {SavedExperiences} from '@/components/prototype/extended';
export default function Page(){return <SavedExperiences mode='saved-searches'/>}

export async function generateMetadata({params}:{params:Promise<{locale:string}>}){const {locale}=await params;return publicMetadata(locale,'/saved-searches',["Local saved search preview", "معاينة بحث محفوظ محلي"],['Fictional prototype preview. No live services, verified listings or real account access.','معاينة نموذج خيالي. لا توجد خدمات متصلة أو عقارات موثقة أو حسابات فعلية.'],true);}
