import type {CampaignStatus} from './campaign-engine';

/** Human-facing labels shared by campaign, property and promotion workspaces. */
export function campaignStatusLabel(s: CampaignStatus, ar = false) {
  const labels: Record<CampaignStatus, [string, string]> = {
    draft: ["Draft", "مسودة"],
    "pending-policy": ["Pending policy review", "بانتظار مراجعة السياسة"],
    "policy-reviewed": ["Policy reviewed locally", "تمت مراجعة السياسة محلياً"],
    "pending-advertiser": [
      "Pending advertiser approval",
      "بانتظار موافقة المعلن",
    ],
    "pending-admin": ["Pending MaxPro approval", "بانتظار موافقة ماكس برو"],
    "approved-local": [
      "Approved for local simulation",
      "معتمد للمحاكاة المحلية",
    ],
    simulated: ["Simulated locally", "تمت المحاكاة محلياً"],
    cancelled: ["Cancelled locally", "ملغى محلياً"],
    rejected: ["Rejected locally", "مرفوض محلياً"],
  };
  return labels[s][ar ? 1 : 0];
}
