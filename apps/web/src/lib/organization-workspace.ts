/** Operational slices are UX fixtures in one browser, never a security boundary. */
import type {DemoState} from '@/components/gemini/demo-provider';
import {seedCrm} from './lead-crm';
import {activeOrganizationId} from './organization-engine';
export type OperationalSlice=Pick<DemoState,'properties'|'jobs'|'preparedConnectors'|'campaigns'|'crm'|'assignMethod'|'activeAgents'|'fallbackAgent'>;
export function emptyWorkspace(directAgent?:string):OperationalSlice {
 return {properties:{},jobs:[],preparedConnectors:[],campaigns:[],crm:seedCrm({}),assignMethod:'round-robin',activeAgents:directAgent?[directAgent]:[],fallbackAgent:directAgent??''};
}
export function workspaceSlice(s:OperationalSlice):OperationalSlice {
 return {properties:s.properties,jobs:s.jobs,preparedConnectors:s.preparedConnectors,campaigns:s.campaigns,crm:s.crm,assignMethod:s.assignMethod,activeAgents:s.activeAgents,fallbackAgent:s.fallbackAgent};
}
export function retainWorkspace(s:DemoState):DemoState {
 return {...s,workspaces:{...s.workspaces,[activeOrganizationId(s.organization)]:workspaceSlice(s)}};
}
