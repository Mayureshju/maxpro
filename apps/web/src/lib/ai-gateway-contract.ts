/** Future custom Frappe app contract only. No browser provider SDK or API implementation.
 * Frappe derives actor/membership/org, authorizes every source/tool, encrypts provider config,
 * separates untrusted source text from instructions, validates structured tool output,
 * rechecks source revisions and permissions on acceptance and writes audit/usage receipts.
 */
export type AISourceRef={doctype:'MaxPro Property'|'MaxPro Campaign'|'MaxPro Lead';name:string;revision:number;fields:string[]};
export type AIGatewayRequest={requestId:string;organization:string;locale:'en'|'ar';prompt:string;context:AISourceRef[]};
/** Allowlisted tools propose or read only. Launch/spend/moderation are never model tools. */
export type AIGatewayTool='inspect_property'|'inspect_channel_requirements'|'list_outstanding_enquiries'|'explain_recorded_metrics'|'propose_listing_copy'|'propose_campaign_draft'|'propose_reply';
export type AIProposal={id:string;organization:string;tool:AIGatewayTool;sources:AISourceRef[];changes:{field:string;before:string;proposed:string}[];state:'pending-review'|'accepted'|'dismissed'|'stale';expiresAt:string;requiredPermission:string};
export type AIGatewayResponse={requestId:string;mode:'provider'|'unavailable';text:string;sources:AISourceRef[];proposals:AIProposal[];warnings:string[];usage:{inputTokens:number;outputTokens:number;costMinor:number;currency:string};auditReceipt:string};
export type AIProposalDecision={proposalId:string;decision:'accept'|'dismiss';expectedSources:AISourceRef[];editedChanges?:{field:string;value:string}[];idempotencyKey:string};
export type AIGatewayError={code:'UNAVAILABLE'|'FORBIDDEN'|'STALE_SOURCE'|'QUOTA'|'TIMEOUT'|'UNSUPPORTED'|'INVALID_OUTPUT';requestId:string;retryable:boolean};
export type AIGatewayPolicy={allowedTools:AIGatewayTool[];maxInputTokens:number;maxOutputTokens:number;timeoutMs:number;maxCostMinor:number;dailyBudgetMinor:number;retentionDays:number;requireSourceReferences:true;requireHumanAcceptance:true};
