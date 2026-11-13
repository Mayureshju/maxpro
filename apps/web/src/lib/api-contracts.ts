/** Proposed Frappe adapter contract. No network implementation or backend is included. */
import type {CanonicalProperty} from './canonical-property';
import type {CanonicalLead} from './lead-crm';
import type {Campaign} from './campaign-engine';
import type {DemoJob} from './canonical-property';
import type {OrganizationProfile,Membership} from './organization-engine';
export type OrganizationContext={organizationId:string};
export type ApiErrorCode='unauthenticated'|'forbidden'|'not-found'|'conflict'|'validation'|'capacity'|'rate-limited'|'unavailable';
export type ApiError={code:ApiErrorCode;messageKey:string;fieldErrors?:Record<string,string>;retryAfterSeconds?:number};
export type ApiResult<T>={data:T;error:null;requestId:string;revision?:number}|{data:null;error:ApiError;requestId:string};
export type ResourceState<T>={status:'loading'}|{status:'ready';data:T}|{status:'empty'}|{status:'error';error:ApiError;draftRetained:boolean};
export type PageQuery=OrganizationContext&{cursor?:string;limit:number;search?:string;sort:'updated-desc'|'created-desc'};
export type PageResult<T>={items:T[];nextCursor:string|null};
export type ScopedCommand<T>=OrganizationContext&{command:T;expectedRevision?:number;idempotencyKey:string};
export type OrganizationRecords={property:CanonicalProperty;lead:CanonicalLead;campaign:Campaign;publishingJob:DemoJob;organization:OrganizationProfile;membership:Membership};
/** Read context is a requested organization, validated against the authenticated Frappe
 * membership. Roles/actors in demo DTOs never grant server privileges. Lists/files/RPC/jobs
 * must all apply the same organization ownership checks. */
export interface FrappeReadContract{
 list<K extends keyof OrganizationRecords>(resource:K,query:PageQuery):Promise<ApiResult<PageResult<OrganizationRecords[K]>>>;
 get<K extends keyof OrganizationRecords>(resource:K,context:OrganizationContext&{id:string}):Promise<ApiResult<OrganizationRecords[K]>>;
}
export type ApprovalReceipt={organizationId:string;recordId:string;recordRevision:number;propertyId:string;propertyRevision:number;policyVersion:string;configurationFingerprint:string;entitlementVersion:string;authorizedActorId:string;approvedAt:string;maximumSpendMinor:number|null};
export type PublishingAcknowledgment={organizationId:string;jobId:string;destination:string;state:'received'|'accepted'|'rejected'|'removed';providerReference:string;verifiedAt:string;evidenceReference:string};
