import {LegacyRouteNotice} from '@/components/gemini/legacy-route-notice';
import {ConnectorHealth} from '@/components/gemini/measurement';
import {AdminNavigation} from '@/components/gemini/organization-workspace';
export default function Page(){return <><LegacyRouteNotice href="/workspace/admin/connector-health"/><><AdminNavigation/><ConnectorHealth/></></>;}
