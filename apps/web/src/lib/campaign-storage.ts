import {
  demoOrganizationId,
  type CanonicalProperty,
} from "./canonical-property";
import { isRecord, textValue } from "./property-storage";
import type { CrmRepository } from "./lead-crm";
import {
  campaignStates,
  campaignRoles,
  inputErrors,
  invalidateCampaign,
  dateValid,
  campaignBlockers,
  type Campaign,
  type CampaignInput,
  type CampaignReceipt,
} from "./campaign-engine";
const text = (v: unknown, max = 4000): v is string =>
  textValue(v, max) && !/^\s*(data:|blob:)/i.test(v);
const at = (v: unknown): v is string =>
  text(v, 50) && /^\d{4}-\d\d-\d\dT/.test(v) && Number.isFinite(Date.parse(v));
const integer = (v: unknown): v is number =>
  Number.isSafeInteger(v) && Number(v) > 0 && Number(v) < 1e9;
const list = (v: unknown, max: number, p: (x: unknown) => boolean) =>
  Array.isArray(v) && v.length <= max && v.every(p);
function readInput(v: unknown, p: CanonicalProperty): CampaignInput | null {
  if (
    !isRecord(v) ||
    !isRecord(v.checklist) ||
    !["housing", "factual", "rights", "providerLimitations"].every(
      (k) =>
        typeof v.checklist === "object" &&
        v.checklist !== null &&
        typeof (v.checklist as Record<string, unknown>)[k] === "boolean",
    ) ||
    !list(v.assetIds, 60, (x) => text(x, 100)) ||
    !["headlineEn", "headlineAr", "copyEn", "copyAr"].every((k) => text(v[k]))
  )
    return null;
  const i: CampaignInput = {
    propertyId: String(v.propertyId),
    objective: v.objective as CampaignInput["objective"],
    channel: v.channel as CampaignInput["channel"],
    headlineEn: v.headlineEn as string,
    headlineAr: v.headlineAr as string,
    copyEn: v.copyEn as string,
    copyAr: v.copyAr as string,
    assetIds: [...(v.assetIds as string[])],
    startDate: String(v.startDate),
    endDate: String(v.endDate),
    mediaBudget: v.mediaBudget as number,
    serviceFee: v.serviceFee as number,
    targeting: v.targeting as CampaignInput["targeting"],
    conversionGoal: v.conversionGoal as CampaignInput["conversionGoal"],
    adminRequired: v.adminRequired as boolean,
    checklist: {
      housing: v.checklist.housing as boolean,
      factual: v.checklist.factual as boolean,
      rights: v.checklist.rights as boolean,
      providerLimitations: v.checklist.providerLimitations as boolean,
    },
  };
  // Removed media is reconciled only for an older property revision by the caller.
  return inputErrors(i, {
    ...p,
    media: [
      ...p.media,
      ...i.assetIds
        .filter((id) => !p.media.some((a) => a.id === id))
        .map((id) => ({
          id,
          name: "Removed reference",
          room: "Other" as const,
          order: 0,
          kind: "image" as const,
          availability: "unavailable" as const,
          sampleKey: null,
        })),
    ],
  }, p.organizationId).length
    ? null
    : i;
}
function readCampaign(
  v: unknown,
  properties: Record<string, CanonicalProperty>,
  organizationId: string = demoOrganizationId,
): Campaign | null {
  if (
    !isRecord(v) ||
    v.version !== 1 ||
    !text(v.id, 100) ||
    !/^DEMO-CAMPAIGN-[a-f0-9-]{36}$/.test(v.id) ||
    v.organizationId !== organizationId ||
    !integer(v.revision) ||
    !integer(v.propertyRevision) ||
    !at(v.createdAt) ||
    !at(v.updatedAt) ||
    Date.parse(v.updatedAt) < Date.parse(v.createdAt) ||
    !campaignStates.some((s) => s === v.status) ||
    !isRecord(v.input) ||
    !text(v.input.propertyId, 100) ||
    !Object.hasOwn(properties, v.input.propertyId)
  )
    return null;
  const p = properties[v.input.propertyId];
  if (
    p.organizationId !== organizationId ||
    v.propertyRevision > p.revision
  )
    return null;
  const input = readInput(v.input, p);
  if (!input) return null;
  if (
    v.propertyRevision === p.revision &&
    input.assetIds.some((id) => !p.media.some((a) => a.id === id))
  )
    return null;
  const receipt = (r: unknown, role: string): r is CampaignReceipt | null =>
    r === null ||
    (isRecord(r) &&
      r.revision === v.revision &&
      r.propertyRevision === v.propertyRevision &&
      at(r.at) &&
      r.role === role &&
      Date.parse(r.at) >= Date.parse(v.createdAt as string) &&
      Date.parse(r.at) <= Date.parse(v.updatedAt as string));
  if (
    !receipt(v.policy, "policy-reviewer") ||
    !receipt(v.advertiser, "advertiser") ||
    !receipt(v.admin, "admin")
  )
    return null;
  const status = v.status as Campaign["status"];
  const policy = v.policy as CampaignReceipt | null,
    advertiser = v.advertiser as CampaignReceipt | null,
    admin = v.admin as CampaignReceipt | null;
  if (
    (advertiser && !policy) ||
    (admin && !advertiser) ||
    (policy && advertiser && policy.at > advertiser.at) ||
    (advertiser && admin && advertiser.at > admin.at) ||
    (!input.adminRequired && admin)
  )
    return null;
  if (
    [
      "policy-reviewed",
      "pending-advertiser",
      "pending-admin",
      "approved-local",
      "simulated",
    ].includes(status) &&
    !policy
  )
    return null;
  if (
    ["pending-admin", "approved-local", "simulated"].includes(status) &&
    !advertiser
  )
    return null;
  if (
    ["approved-local", "simulated"].includes(status) &&
    input.adminRequired &&
    !admin
  )
    return null;
  if (
    (status === "pending-admin" && !input.adminRequired) ||
    (["draft", "pending-policy", "cancelled", "rejected"].includes(status) &&
      (policy || advertiser || admin))
  )
    return null;
  if (
    (["policy-reviewed", "pending-advertiser"].includes(status) &&
      (advertiser || admin)) ||
    (status === "pending-admin" && admin)
  )
    return null;
  if (
    advertiser
      ? v.approvedBudget !== input.mediaBudget
      : v.approvedBudget !== null
  )
    return null;
  if (
    !list(
      v.history,
      200,
      (e) =>
        isRecord(e) &&
        text(e.id, 100) &&
        at(e.at) &&
        integer(e.revision) &&
        e.revision <= Number(v.revision) &&
        text(e.action, 300) &&
        (e.role === "system" || campaignRoles.some((r) => r === e.role)),
    ) ||
    !(v.history as unknown[]).length
  )
    return null;
  if (
    !list(
      v.proposals,
      80,
      (s) =>
        isRecord(s) &&
        text(s.id, 100) &&
        [
          "copy",
          "headline",
          "features",
          "objective",
          "creative",
          "budget",
          "summary",
        ].includes(String(s.kind)) &&
        integer(s.propertyRevision) &&
        Number(s.propertyRevision) <= p.revision &&
        integer(s.campaignRevision) &&
        Number(s.campaignRevision) <= Number(v.revision) &&
        at(s.createdAt) &&
        ["proposed", "accepted", "rejected"].includes(String(s.status)) &&
        (s.status === "proposed" ? s.reviewedAt === null : at(s.reviewedAt)) &&
        text(s.en) &&
        text(s.ar) &&
        list(s.references, 30, (r) => text(r, 200)) &&
        list(s.assetIds, 60, (id) => text(id, 100)) &&
        (s.kind !== "budget"
          ? s.amount === null
          : typeof s.amount === "number" &&
            Number.isFinite(s.amount) &&
            s.amount > 0 &&
            s.amount <= 1e7),
    )
  )
    return null;
  if (
    !list(
      v.spend,
      100,
      (s) =>
        isRecord(s) &&
        text(s.id, 100) &&
        text(s.date, 10) &&
        dateValid(s.date) &&
        typeof s.qar === "number" &&
        Number.isFinite(s.qar) &&
        s.qar >= 0 &&
        s.qar <= 1e7,
    )
  )
    return null;
  const c = v as unknown as Campaign;
  if (
    [c.history, c.proposals, c.spend].some(
      (xs) => new Set(xs.map((x) => x.id)).size !== xs.length,
    )
  )
    return null;
  const r = (x: CampaignReceipt | null) =>
    x
      ? {
          revision: x.revision,
          propertyRevision: x.propertyRevision,
          at: x.at,
          role: x.role,
        }
      : null;
  let restored: Campaign = {
    version: 1,
    id: c.id,
    organizationId,
    revision: c.revision,
    propertyRevision: c.propertyRevision,
    input,
    status,
    createdAt: c.createdAt,
    updatedAt: c.updatedAt,
    policy: r(policy),
    advertiser: r(advertiser),
    admin: r(admin),
    approvedBudget: c.approvedBudget,
    history: c.history.map((e) => ({
      id: e.id,
      at: e.at,
      revision: e.revision,
      role: e.role,
      action: e.action,
    })),
    proposals: c.proposals.map((s) => ({
      id: s.id,
      kind: s.kind,
      propertyRevision: s.propertyRevision,
      campaignRevision: s.campaignRevision,
      createdAt: s.createdAt,
      status: s.status,
      reviewedAt: s.reviewedAt,
      en: s.en,
      ar: s.ar,
      references: [...s.references],
      assetIds: [...s.assetIds],
      amount: s.amount,
    })),
    spend: c.spend.map((s) => ({ id: s.id, date: s.date, qar: s.qar })),
  };
  if (
    !["draft", "cancelled", "rejected"].includes(status) &&
    restored.propertyRevision === p.revision &&
    campaignBlockers({ properties, plan: "agency" }, restored, organizationId).length
  )
    return null;
  if (restored.propertyRevision !== p.revision)
    restored = invalidateCampaign(
      restored,
      p,
      undefined,
      "Stale property reference recovered; approvals invalidated",
    );
  return restored;
}
export function restoreCampaigns(
  value: unknown,
  version: unknown,
  properties: Record<string, CanonicalProperty>,
  crm?: CrmRepository,
  organizationId: string = demoOrganizationId,
): { campaigns: Campaign[]; corrupt: boolean } {
  if (value === undefined && version === undefined)
    return { campaigns: [], corrupt: false };
  if (version !== 1 || !Array.isArray(value) || value.length > 100)
    return { campaigns: [], corrupt: true };
  const campaigns: Campaign[] = [];
  let corrupt = false;
  for (const v of value) {
    const c = readCampaign(v, properties, organizationId);
    if (c && !campaigns.some((x) => x.id === c.id)) {
      if (crm) {
        const validCosts = c.spend.filter(
          (cost) =>
            crm.spend.some(
              (s) =>
                s.id === cost.id &&
                s.date === cost.date &&
                s.qar === cost.qar &&
                s.source ===
                  (c.input.channel === "meta-catalog"
                    ? "Meta Lead Ads"
                    : "Website"),
            ) &&
            !campaigns.some((other) =>
              other.spend.some((s) => s.id === cost.id),
            ),
        );
        if (validCosts.length !== c.spend.length) corrupt = true;
        c.spend = validCosts;
      }
      campaigns.push(c);
    } else corrupt = true;
  }
  return { campaigns, corrupt };
}
