import {publicMetadata} from '@/lib/marketing-metadata';
import {GeminiDemoProvider} from '@/components/gemini/demo-provider';
import {DemoEntry} from '@/components/agency/demo-entry';
export default function Page(){return <GeminiDemoProvider><DemoEntry/></GeminiDemoProvider>;}

export async function generateMetadata({params}:{params:Promise<{locale:string}>}){const {locale}=await params;return publicMetadata(locale,'/sign-in',["Enter a fictional agency", "ادخل وكالة خيالية"],['Fictional prototype preview. No live services, verified listings or real account access.','معاينة نموذج خيالي. لا توجد خدمات متصلة أو عقارات موثقة أو حسابات فعلية.'],true);}
