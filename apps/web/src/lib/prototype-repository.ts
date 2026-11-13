/** Frontend data-access boundary. Only the browser-local adapter exists in Phase 5. */
import type {DemoState} from '@/components/gemini/demo-provider';
import {can,type OrganizationCommand} from './organization-engine';
import type {CanonicalProperty} from './canonical-property';
import type {ConnectorId} from './gemini-product';
import type {CrmCommand} from './lead-crm';
import type {CampaignCommand,CampaignResult} from './campaign-engine';
export type DataError={code:'forbidden'|'conflict'|'validation'|'capacity'|'unavailable';message:string;fields?:Record<string,string>};
export type DataResult<T>={data:T;error:null}|{data:null;error:DataError};
export type CommandEnvelope<T>={command:T;expectedRevision?:number;idempotencyKey:string};
export type PropertyChanges=Partial<Pick<CanonicalProperty,'facts'|'media'|'watermark'|'source'|'proposal'|'status'|'studioStage'>>;
export type PropertyCommand={type:'create'}|{type:'revise';id:string;revision:number;changes:PropertyChanges;action:string;approved?:boolean};
export type PublishingCommand={type:'prepare';id:ConnectorId;prepared:boolean;acknowledged:boolean}|{type:'simulate';id:string;revision:number;destinations:ConnectorId[];approved:boolean;context:string}|{type:'retry';id:string;revision:number;approved:boolean;context:string}|{type:'cancel';id:string};
export interface MaxProRepository{
 readonly mode:'browser-local'|'frappe';
 snapshot():Promise<DataResult<DemoState>>;
 organization(envelope:CommandEnvelope<OrganizationCommand>):Promise<DataResult<{id?:string}>>;
 property(envelope:CommandEnvelope<PropertyCommand>):Promise<DataResult<{id:string}>>;
 publishing(envelope:CommandEnvelope<PublishingCommand>):Promise<DataResult<{id:string}>>;
 crm(envelope:CommandEnvelope<CrmCommand>):Promise<DataResult<{leadId?:string}>>;
 campaign(envelope:CommandEnvelope<CampaignCommand>):Promise<DataResult<Pick<CampaignResult,'id'|'leadId'>>>;
}
export interface LocalDomainCommands{
 createProperty():string;
 saveProperty(id:string,revision:number,changes:PropertyChanges,action:string,approved?:boolean):boolean;
 prepareConnector(id:ConnectorId,prepared:boolean,acknowledged:boolean):string|null;
 simulatePublishing(id:string,revision:number,destinations:ConnectorId[],approved:boolean,context:string):string|null;
 retryJob(id:string,revision:number,approved:boolean,context:string):string|null;
 cancelJob(id:string):string|null;
 crmCommand(c:CrmCommand):{error:string|null;leadId?:string};
 campaignCommand(c:CampaignCommand):{error:string|null;id?:string;leadId?:string};
}
const result=<T>(data:T,error:string|null):DataResult<T>=>error?{data:null,error:{code:error.includes('permission')?'forbidden':error.includes('changed')?'conflict':error.includes('quota')||error.includes('capacity')?'capacity':'validation',message:error}}:{data,error:null};
/** Frappe's future adapter maps resource `data` and RPC `message` into this boundary.
 * idempotencyKey is transport metadata for future Frappe. Local commands are synchronous,
 * revision checked, and do not claim durable server idempotency or multiuser locking.
 */
export function browserLocalRepository(read:()=>DemoState,organization:(c:OrganizationCommand)=>{error:string|null;id?:string},local:LocalDomainCommands):MaxProRepository{
 return {
  mode:'browser-local',snapshot:async()=>({data:read(),error:null}),
  organization:async ({command})=>{const r=organization(command);return result({id:r.id},r.error);},
  property:async ({command:c})=>{if(c.type==='create'){const id=local.createProperty();return result({id},id?null:'Local permission denied for property creation.');}const before=read();const ok=local.saveProperty(c.id,c.revision,c.changes,c.action,c.approved);return result({id:c.id},ok?null:!can(before.organization,'property.edit')?'Local permission denied for property revision.':before.properties[c.id]?.revision!==c.revision?'Property changed. Reload the current revision.':'Invalid property revision.');},
  publishing:async ({command:c})=>{const error=c.type==='prepare'?local.prepareConnector(c.id,c.prepared,c.acknowledged):c.type==='simulate'?local.simulatePublishing(c.id,c.revision,c.destinations,c.approved,c.context):c.type==='retry'?local.retryJob(c.id,c.revision,c.approved,c.context):local.cancelJob(c.id);return result({id:c.id},error);},
  crm:async ({command})=>{const r=local.crmCommand(command);return result({leadId:r.leadId},r.error);},
  campaign:async ({command})=>{const r=local.campaignCommand(command);return result({id:r.id,leadId:r.leadId},r.error);},
 };
}
