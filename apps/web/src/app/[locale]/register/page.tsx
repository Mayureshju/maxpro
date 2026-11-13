import {GeminiDemoProvider} from '@/components/gemini/demo-provider';
import {OrganizationWorkspace,PersonaBar} from '@/components/gemini/organization-workspace';
import {SiteHeader} from '@/components/marketing/site-header';
import {SiteFooter} from '@/components/marketing/site-footer';
export default function Page(){return <GeminiDemoProvider><SiteHeader/><main id="main-content" className="oa-public-onboarding"><PersonaBar/><OrganizationWorkspace mode="onboarding"/></main><SiteFooter/></GeminiDemoProvider>;}
