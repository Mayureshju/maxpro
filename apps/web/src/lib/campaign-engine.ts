import {activeOrganizationId} from './organization-engine';
/** Local-only marketing domain. These guards demonstrate workflow, not authenticated RBAC. */
import {
  findProperty,
  demoOrganizationId,
  type CanonicalProperty,
} from "./canonical-property";
import { type PlanId, type ConnectorId } from "./gemini-product";
import {
  applyCrmCommand,
  exampleLeadPayload,
  leadMetrics,
  selectLeads,
  type CrmHost,
  type CrmRepository,
  type LeadSource,
} from "./lead-crm";

export const campaignStates = [
  "draft",
  "pending-policy",
  "policy-reviewed",
  "pending-advertiser",
  "pending-admin",
  "approved-local",
  "simulated",
  "cancelled",
  "rejected",
] as const;
export type CampaignStatus = (typeof campaignStates)[number];
export const campaignRoles = [
  "editor",
  "policy-reviewer",
  "advertiser",
  "admin",
] as const;
export type CampaignRole = (typeof campaignRoles)[number];
export const objectives = ["enquiries", "awareness", "conversations"] as const;
export const conversionGoals = [
  "enquiry",
  "qualified-lead",
  "viewing-request",
] as const;
export type CampaignInput = {
  propertyId: string;
  objective: (typeof objectives)[number];
  channel: "meta-catalog" | "google-ads";
  headlineEn: string;
  headlineAr: string;
  copyEn: string;
  copyAr: string;
  assetIds: string[];
  startDate: string;
  endDate: string;
  mediaBudget: number;
  serviceFee: number;
  targeting: "broad-housing" | "age-exclusion" | "sensitive-interests";
  conversionGoal: (typeof conversionGoals)[number];
  adminRequired: boolean;
  checklist: {
    housing: boolean;
    factual: boolean;
    rights: boolean;
    providerLimitations: boolean;
  };
};
export type CampaignReceipt = {
  revision: number;
  propertyRevision: number;
  at: string;
  role: CampaignRole;
};
export type CampaignEvent = {
  id: string;
  at: string;
  revision: number;
  role: CampaignRole | "system";
  action: string;
};
export type SuggestionKind =
  | "copy"
  | "headline"
  | "features"
  | "objective"
  | "creative"
  | "budget"
  | "summary";
export type MarketingProposal = {
  id: string;
  kind: SuggestionKind;
  propertyRevision: number;
  campaignRevision: number;
  createdAt: string;
  status: "proposed" | "accepted" | "rejected";
  reviewedAt: string | null;
  en: string;
  ar: string;
  references: string[];
  assetIds: string[];
  amount: number | null;
};
export type Campaign = {
  version: 1;
  id: string;
  organizationId: string;
  revision: number;
  propertyRevision: number;
  input: CampaignInput;
  status: CampaignStatus;
  createdAt: string;
  updatedAt: string;
  policy: CampaignReceipt | null;
  advertiser: CampaignReceipt | null;
  admin: CampaignReceipt | null;
  approvedBudget: number | null;
  history: CampaignEvent[];
  proposals: MarketingProposal[];
  spend: { id: string; date: string; qar: number }[];
};
export type CampaignHost = CrmHost & {
  plan: PlanId;
  preparedConnectors: ConnectorId[];
  campaigns: Campaign[];
};
export const campaignBudgetCaps: Record<PlanId, number> = {
  starter: 500,
  pro: 5000,
  agency: 25000,
};
export const dateValid = (v: string) =>
  /^\d{4}-\d\d-\d\d$/.test(v) &&
  Number.isFinite(Date.parse(v)) &&
  new Date(v).toISOString().slice(0, 10) === v;
const amountValid = (v: number) =>
  Number.isFinite(v) &&
  v >= 0 &&
  v <= 1e7 &&
  Math.abs(v * 100 - Math.round(v * 100)) < 1e-6;
export function blankCampaignInput(propertyId = ""): CampaignInput {
  const startDate = new Date().toISOString().slice(0, 10);
  const endDate = new Date(Date.parse(startDate) + 7 * 86400000)
    .toISOString()
    .slice(0, 10);
  return {
    propertyId,
    objective: "enquiries",
    channel: "meta-catalog",
    headlineEn: "",
    headlineAr: "",
    copyEn: "",
    copyAr: "",
    assetIds: [],
    startDate,
    endDate,
    mediaBudget: 350,
    serviceFee: 0,
    targeting: "broad-housing",
    conversionGoal: "enquiry",
    adminRequired: true,
    checklist: {
      housing: false,
      factual: false,
      rights: false,
      providerLimitations: false,
    },
  };
}
export function inputErrors(
  i: CampaignInput,
  p: CanonicalProperty | undefined,
  organizationId: string = demoOrganizationId,
) {
  const errors: string[] = [];
  if (
    !i ||
    typeof i !== "object" ||
    !Array.isArray(i.assetIds) ||
    !i.checklist ||
    typeof i.checklist !== "object"
  )
    return ["Malformed campaign input."];
  if (!p || p.organizationId !== organizationId)
    errors.push("Unknown canonical property in this organization.");
  if (
    !objectives.includes(i.objective) ||
    !["meta-catalog", "google-ads"].includes(i.channel) ||
    !conversionGoals.includes(i.conversionGoal) ||
    !["broad-housing", "age-exclusion", "sensitive-interests"].includes(
      i.targeting,
    )
  )
    errors.push("Unsupported campaign configuration.");
  if (
    ![i.headlineEn, i.headlineAr, i.copyEn, i.copyAr].every(
      (s) =>
        typeof s === "string" &&
        s.length <= 4000 &&
        !/(?:data:|blob:)/i.test(s),
    )
  )
    errors.push("Copy must be text up to 4,000 characters.");
  if (!amountValid(i.mediaBudget) || !amountValid(i.serviceFee))
    errors.push("Use nonnegative QAR amounts with at most two decimal places.");
  if (
    !dateValid(i.startDate) ||
    !dateValid(i.endDate) ||
    i.endDate < i.startDate ||
    Date.parse(i.endDate) - Date.parse(i.startDate) > 89 * 86400000
  )
    errors.push("Choose valid dates with a duration of 1–90 days.");
  if (
    i.assetIds.length > 60 ||
    new Set(i.assetIds).size !== i.assetIds.length ||
    i.assetIds.some((id) => !p?.media.some((a) => a.id === id))
  )
    errors.push("Creative assets must reference this canonical property.");
  if (
    typeof i.adminRequired !== "boolean" ||
    !["housing", "factual", "rights", "providerLimitations"].every(
      (k) =>
        typeof i.checklist[k as keyof CampaignInput["checklist"]] === "boolean",
    )
  )
    errors.push("Review configuration is invalid.");
  return errors;
}
/** Project only documented fields at the write boundary, including nested input. */
function cleanInput(i: CampaignInput): CampaignInput {
  return {
    propertyId: i.propertyId,
    objective: i.objective,
    channel: i.channel,
    headlineEn: i.headlineEn,
    headlineAr: i.headlineAr,
    copyEn: i.copyEn,
    copyAr: i.copyAr,
    assetIds: [...i.assetIds],
    startDate: i.startDate,
    endDate: i.endDate,
    mediaBudget: i.mediaBudget,
    serviceFee: i.serviceFee,
    targeting: i.targeting,
    conversionGoal: i.conversionGoal,
    adminRequired: i.adminRequired,
    checklist: {
      housing: i.checklist.housing,
      factual: i.checklist.factual,
      rights: i.checklist.rights,
      providerLimitations: i.checklist.providerLimitations,
    },
  };
}
export function campaignBlockers(
  host: Pick<CampaignHost, "properties" | "plan" | "organization">,
  c: Campaign,
  organizationId: string = activeOrganizationId(host.organization),
) {
  const p = findProperty(host.properties, c.input.propertyId);
  const i = c.input;
  const errors = inputErrors(i, p, organizationId);
  if (!p || p.organizationId !== organizationId) return errors;
  if (c.propertyRevision !== p.revision)
    errors.push("Property revision changed. Save a refreshed draft.");
  if (p.status === "archived")
    errors.push("Archived property cannot be marketed.");
  if (
    !p.source.factsReviewed ||
    !p.source.copyReviewed ||
    p.status !== "reviewed"
  )
    errors.push(
      "Canonical facts and bilingual property copy need human review.",
    );
  if (!p.facts.permit.trim() || !p.facts.ownerApproved)
    errors.push(
      "Missing sample licensing or advertiser authorization information.",
    );
  if (
    !p.facts.titleEn.trim() ||
    !p.facts.titleAr.trim() ||
    p.facts.priceQar <= 0 ||
    p.facts.areaSqm <= 0 ||
    !p.facts.city.trim() ||
    !p.facts.district.trim()
  )
    errors.push("Canonical property facts are incomplete.");
  if (![i.headlineEn, i.headlineAr, i.copyEn, i.copyAr].every((s) => s.trim()))
    errors.push("Prepare headlines and advertisement copy in both languages.");
  if (
    !i.assetIds.length ||
    i.assetIds.some(
      (id) =>
        !p.media.some(
          (a) =>
            a.id === id &&
            a.kind === "image" &&
            a.availability === "sample" &&
            a.sampleKey,
        ),
    )
  )
    errors.push(
      "Select available image creative; metadata-only or unavailable media cannot simulate.",
    );
  const normalizeDigits = (s: string) =>
    s
      .replace(/[٠-٩]/g, (d) => String("٠١٢٣٤٥٦٧٨٩".indexOf(d)))
      .replace(/٬/g, ",")
      .replace(/٫/g, ".");
  const factualNumbers = [
    p.facts.priceQar,
    p.facts.areaSqm,
    p.facts.beds,
    p.facts.baths,
    p.facts.depositQar,
    p.facts.cheques,
  ];
  const numbers = [
    ...normalizeDigits([i.copyEn, i.copyAr].join(" ")).matchAll(
      /[0-9]+(?:[,.][0-9]+)*/g,
    ),
  ].map((m) => Number(m[0].replace(/,(?=\d{3}(?:\D|$))/g, "")));
  if (numbers.some((n) => !factualNumbers.includes(n)))
    errors.push(
      "Advertisement contains numeric claims not found in canonical price, area, bedrooms, bathrooms or payment facts. Review the copy.",
    );
  if (i.targeting !== "broad-housing")
    errors.push(
      "Unsupported targeting. Remove age exclusions and sensitive-interest targeting.",
    );
  if (i.mediaBudget <= 0)
    errors.push("Media budget must be greater than zero.");
  if (i.mediaBudget + i.serviceFee > campaignBudgetCaps[host.plan])
    errors.push(
      `Proposed total exceeds the illustrative ${host.plan} local cap of QAR ${campaignBudgetCaps[host.plan]}.`,
    );
  if (host.plan === "starter" && i.channel === "meta-catalog")
    errors.push(
      "Meta catalogue is excluded from the illustrative Starter plan.",
    );
  if (!i.checklist.housing)
    errors.push("Record a local housing-category review.");
  if (!i.checklist.factual)
    errors.push("A human must compare both languages against canonical facts.");
  if (!i.checklist.rights)
    errors.push(
      "Record a local creative/source consistency and rights review.",
    );
  if (!i.checklist.providerLimitations)
    errors.push(
      "Acknowledge pending legal/provider review and unsupported capabilities.",
    );
  return [...new Set(errors)];
}
const event = (
  c: Campaign,
  action: string,
  role: CampaignEvent["role"],
  at: string,
): Campaign => ({
  ...c,
  updatedAt: at,
  history: [
    ...c.history,
    { id: crypto.randomUUID(), at, revision: c.revision, role, action },
  ].slice(-200),
});
export function invalidateCampaign(
  c: Campaign,
  p: CanonicalProperty,
  at = new Date().toISOString(),
  action = "Canonical property changed; approvals invalidated",
): Campaign {
  return event(
    {
      ...c,
      revision: c.revision + 1,
      propertyRevision: p.revision,
      input: {
        ...c.input,
        assetIds: c.input.assetIds.filter((id) =>
          p.media.some((a) => a.id === id),
        ),
        checklist: {
          housing: false,
          factual: false,
          rights: false,
          providerLimitations: false,
        },
      },
      status: ["cancelled", "rejected"].includes(c.status) ? c.status : "draft",
      policy: null,
      advertiser: null,
      admin: null,
      approvedBudget: null,
    },
    action,
    "system",
    at,
  );
}
export type CampaignCommand = { organizationId: string; role: CampaignRole } & (
  | { type: "create"; input: CampaignInput }
  | { type: "save"; id: string; revision: number; input: CampaignInput }
  | {
      type: "transition";
      id: string;
      revision: number;
      action:
        | "submit-policy"
        | "review-policy"
        | "request-advertiser"
        | "approve-advertiser"
        | "approve-admin"
        | "simulate"
        | "cancel"
        | "reject"
        | "resume"
        | "duplicate";
    }
  | { type: "suggest"; id: string; revision: number; kind: SuggestionKind }
  | {
      type: "review-proposal";
      id: string;
      revision: number;
      proposalId: string;
      accept: boolean;
      en: string;
      ar: string;
    }
  | {
      type: "lead";
      id: string;
      revision: number;
      eventId: string;
      consent: boolean;
    }
  | { type: "spend"; id: string; revision: number; date: string; qar: number }
);
export type CampaignResult = {
  campaigns: Campaign[];
  crm: CrmRepository;
  error: string | null;
  id?: string;
  leadId?: string;
};
// Service contract injection keeps the workflow independent of any future model vendor.
export interface MarketingAIService {
  propose(
    host: CampaignHost,
    campaign: Campaign,
    kind: SuggestionKind,
    at: string,
  ): MarketingProposal;
}
export function applyCampaignCommand(
  host: CampaignHost,
  cmd: CampaignCommand,
  ai: MarketingAIService,
  at = new Date().toISOString(),
): CampaignResult {
  const fail = (error: string): CampaignResult => ({
    campaigns: host.campaigns,
    crm: host.crm,
    error,
  });
  if (
    cmd.organizationId !== activeOrganizationId(host.organization) ||
    !campaignRoles.includes(cmd.role)
  )
    return fail("Unauthorized local organization or role.");
  const editor = cmd.role === "editor";
  const finish = (c: Campaign, crm = host.crm): CampaignResult => ({
    campaigns: host.campaigns.some((x) => x.id === c.id)
      ? host.campaigns.map((x) => (x.id === c.id ? c : x))
      : [c, ...host.campaigns],
    crm,
    error: null,
    id: c.id,
  });
  if (cmd.type === "create") {
    if (!editor) return fail("Only the local editor can create a draft.");
    if (host.campaigns.length >= 100)
      return fail("Local portfolio is full (100 campaigns).");
    const p = findProperty(host.properties, cmd.input.propertyId);
    const errors = inputErrors(cmd.input, p, activeOrganizationId(host.organization));
    if (errors.length) return fail(errors.join(" "));
    const c: Campaign = {
      version: 1,
      id: `DEMO-CAMPAIGN-${crypto.randomUUID()}`,
      organizationId: activeOrganizationId(host.organization),
      revision: 1,
      propertyRevision: p!.revision,
      input: cleanInput(cmd.input),
      status: "draft",
      createdAt: at,
      updatedAt: at,
      policy: null,
      advertiser: null,
      admin: null,
      approvedBudget: null,
      history: [],
      proposals: [],
      spend: [],
    };
    return finish(event(c, "Campaign draft created", "editor", at));
  }
  const c = host.campaigns.find(
    (c) => c.id === cmd.id && c.organizationId === cmd.organizationId,
  );
  if (!c) return fail("Campaign unavailable in this organization.");
  if (cmd.revision !== c.revision)
    return fail(
      "Stale campaign revision. Reload and review the current draft.",
    );
  const p = findProperty(host.properties, c.input.propertyId);
  if (!p || p.organizationId !== activeOrganizationId(host.organization)) return fail("Linked canonical property is unavailable.");
  if (c.propertyRevision !== p.revision)
    return fail("Property revision changed. Reload the refreshed draft.");
  const active = !["cancelled", "rejected"].includes(c.status);
  if (cmd.type === "save") {
    if (!editor || !active)
      return fail(
        "Only the editor can edit an active draft. Resume a cancelled/rejected record first.",
      );
    if (cmd.input.propertyId !== c.input.propertyId)
      return fail(
        "Campaign property identity is fixed. Create a new draft for another property.",
      );
    if (
      cmd.input.channel !== c.input.channel &&
      (c.spend.length ||
        host.crm.leads.some((l) => l.campaign === c.id) ||
        c.history.some((e) => e.action === "simulate · local only"))
    )
      return fail(
        "A simulated campaign retains its original platform. Duplicate it to plan another platform.",
      );
    const property = findProperty(host.properties, cmd.input.propertyId);
    const errors = inputErrors(cmd.input, property, activeOrganizationId(host.organization));
    if (errors.length) return fail(errors.join(" "));
    if (JSON.stringify(cmd.input) === JSON.stringify(c.input)) return finish(c);
    return finish(
      event(
        {
          ...c,
          revision: c.revision + 1,
          propertyRevision: property!.revision,
          input: cleanInput(cmd.input),
          status: "draft",
          policy: null,
          advertiser: null,
          admin: null,
          approvedBudget: null,
        },
        "Draft revised; all previous approvals invalidated",
        "editor",
        at,
      ),
    );
  }
  if (cmd.type === "suggest") {
    if (!editor || !active)
      return fail(
        "Only the editor can request simulated suggestions for an active draft.",
      );
    if (
      !p.source.factsReviewed ||
      !p.source.copyReviewed ||
      p.status !== "reviewed" ||
      !p.facts.titleEn.trim() ||
      !p.facts.titleAr.trim() ||
      p.facts.priceQar <= 0 ||
      p.facts.areaSqm <= 0 ||
      !p.facts.city.trim() ||
      !p.facts.district.trim()
    )
      return fail(
        "Review complete canonical property facts before preparing grounded suggestions.",
      );
    if (c.proposals.length >= 80)
      return fail("Local proposal history is full.");
    if (
      ![
        "copy",
        "headline",
        "features",
        "objective",
        "creative",
        "budget",
        "summary",
      ].includes(cmd.kind)
    )
      return fail("Unsupported suggestion.");
    if (cmd.kind === "summary" && !campaignMetrics(host, c).total)
      return fail(
        "No campaign-linked local observations support a summary yet.",
      );
    const proposal = ai.propose(host, c, cmd.kind, at);
    return finish(
      event(
        { ...c, proposals: [...c.proposals, proposal] },
        `Simulated ${cmd.kind} proposal prepared; human review pending`,
        "editor",
        at,
      ),
    );
  }
  if (cmd.type === "review-proposal") {
    if (!editor || !active)
      return fail(
        "Only the editor can review proposals for an active campaign.",
      );
    const proposal = c.proposals.find((s) => s.id === cmd.proposalId);
    if (!proposal || proposal.status !== "proposed")
      return fail("Proposal unavailable or already reviewed.");
    if (
      proposal.propertyRevision !== p.revision ||
      proposal.campaignRevision !== c.revision
    )
      return fail("Proposal is stale. Prepare a new suggestion.");
    if (
      ![cmd.en, cmd.ar].every(
        (s) =>
          typeof s === "string" &&
          s.length <= 4000 &&
          s.trim() &&
          !/(?:data:|blob:)/i.test(s),
      )
    )
      return fail("Review both language proposals (up to 4,000 characters).");
    let input = structuredClone(c.input);
    const s = {
      ...proposal,
      en: cmd.en,
      ar: cmd.ar,
      status: cmd.accept ? ("accepted" as const) : ("rejected" as const),
      reviewedAt: at,
    };
    if (cmd.accept) {
      if (s.kind === "copy" || s.kind === "features")
        input = { ...input, copyEn: s.en, copyAr: s.ar };
      if (s.kind === "headline")
        input = { ...input, headlineEn: s.en, headlineAr: s.ar };
      if (s.kind === "objective") input = { ...input, objective: "enquiries" };
      if (s.kind === "creative") input = { ...input, assetIds: s.assetIds };
      if (s.kind === "budget") input = { ...input, mediaBudget: s.amount! };
    }
    const proposedErrors = inputErrors(input, p, activeOrganizationId(host.organization));
    if (proposedErrors.length)
      return fail(`Proposal cannot be applied: ${proposedErrors.join(" ")}`);
    const changed = JSON.stringify(input) !== JSON.stringify(c.input);
    const next = {
      ...c,
      input,
      proposals: c.proposals.map((x) => (x.id === s.id ? s : x)),
      ...(changed
        ? {
            revision: c.revision + 1,
            status: "draft" as const,
            policy: null,
            advertiser: null,
            admin: null,
            approvedBudget: null,
          }
        : {}),
    };
    return finish(
      event(
        next,
        `${cmd.accept ? "Accepted" : "Rejected"} simulated ${s.kind} proposal${changed ? "; previous approvals invalidated" : ""}`,
        "editor",
        at,
      ),
    );
  }
  if (cmd.type === "lead") {
    if (!editor || c.status !== "simulated" || !cmd.consent)
      return fail(
        "A simulated campaign, editor role and fictional consent are required.",
      );
    if (!/^DEMO-[A-Za-z0-9-]{1,90}$/.test(cmd.eventId))
      return fail("Use a fictional DEMO- event ID.");
    const source = campaignSource(c);
    const payload = JSON.parse(
      exampleLeadPayload(source, c.input.propertyId, cmd.eventId, at, activeOrganizationId(host.organization)),
    );
    payload.campaign_reference = c.id;
    const existing = host.crm.leads.find(
      (l) =>
        l.source === source &&
        l.sourceEventId === cmd.eventId &&
        l.organizationId === activeOrganizationId(host.organization),
    );
    if (
      existing &&
      (existing.campaign !== c.id || existing.propertyId !== c.input.propertyId)
    )
      return fail(
        "This source event belongs to another campaign or property. Use a new event ID.",
      );
    const r = applyCrmCommand(
      host,
      {
        type: "intake",
        source,
        payload: JSON.stringify(payload),
        acknowledged: true,
      },
      at,
    );
    if (r.error) return fail(r.error);
    return {
      ...finish(
        event(
          c,
          existing
            ? "Fictional enquiry replay deduplicated"
            : "Fictional campaign enquiry recorded through shared CRM",
          "editor",
          at,
        ),
        r.crm,
      ),
      leadId: r.leadId,
    };
  }
  if (cmd.type === "spend") {
    if (
      !editor ||
      c.status !== "simulated" ||
      !dateValid(cmd.date) ||
      !amountValid(cmd.qar)
    )
      return fail(
        "Record a valid dated fictional cost on a simulated campaign as editor.",
      );
    if (cmd.date < c.input.startDate || cmd.date > c.input.endDate)
      return fail(
        "Fictional cost date must fall inside the campaign schedule.",
      );
    if (c.spend.reduce((n, s) => n + s.qar, 0) + cmd.qar > c.input.mediaBudget)
      return fail("Fictional spend exceeds the approved media budget.");
    if (c.spend.length >= 100) return fail("Local cost history is full.");
    const r = applyCrmCommand(
      host,
      {
        type: "spend",
        source: campaignSource(c),
        date: cmd.date,
        qar: cmd.qar,
      },
      at,
    );
    if (r.error) return fail(r.error);
    const cost = r.crm.spend.at(-1)!;
    return finish(
      event(
        {
          ...c,
          spend: [...c.spend, { id: cost.id, date: cmd.date, qar: cmd.qar }],
        },
        "Explicit fictional media cost recorded; no payment",
        "editor",
        at,
      ),
      r.crm,
    );
  }
  const a = cmd.action;
  const receipt: CampaignReceipt = {
    revision: c.revision,
    propertyRevision: p.revision,
    at,
    role: cmd.role,
  };
  if (a === "duplicate") {
    if (!editor || host.campaigns.length >= 100)
      return fail("Only the editor can duplicate within the local capacity.");
    const copy: Campaign = {
      ...structuredClone(c),
      id: `DEMO-CAMPAIGN-${crypto.randomUUID()}`,
      revision: 1,
      status: "draft",
      createdAt: at,
      updatedAt: at,
      input: {
        ...structuredClone(c.input),
        checklist: blankCampaignInput().checklist,
      },
      policy: null,
      advertiser: null,
      admin: null,
      approvedBudget: null,
      history: [],
      proposals: [],
      spend: [],
    };
    return finish(
      event(copy, `Duplicated from ${c.id}; approvals cleared`, "editor", at),
    );
  }
  if (a === "cancel")
    return editor && active
      ? finish(
          event(
            {
              ...c,
              status: "cancelled",
              policy: null,
              advertiser: null,
              admin: null,
              approvedBudget: null,
            },
            "Campaign cancelled locally",
            "editor",
            at,
          ),
        )
      : fail("Only the editor can cancel an active campaign.");
  if (a === "reject")
    return ["policy-reviewer", "admin"].includes(cmd.role) &&
      ["pending-policy", "pending-admin"].includes(c.status) &&
      ((cmd.role === "policy-reviewer" && c.status === "pending-policy") ||
        (cmd.role === "admin" && c.status === "pending-admin"))
      ? finish(
          event(
            {
              ...c,
              status: "rejected",
              policy: null,
              advertiser: null,
              admin: null,
              approvedBudget: null,
            },
            "Local review rejected; revise before resubmission",
            cmd.role,
            at,
          ),
        )
      : fail("Rejection requires the assigned local review role and stage.");
  if (a === "resume")
    return editor && !active
      ? finish(
          event(
            {
              ...invalidateCampaign(
                c,
                p,
                at,
                "Campaign resumed as a new draft revision",
              ),
              status: "draft",
            },
            "Editor resumed draft",
            "editor",
            at,
          ),
        )
      : fail("Only the editor can resume a cancelled/rejected campaign.");
  const allowed: Record<
    string,
    [CampaignStatus, CampaignRole, CampaignStatus]
  > = {
    "submit-policy": ["draft", "editor", "pending-policy"],
    "review-policy": ["pending-policy", "policy-reviewer", "policy-reviewed"],
    "request-advertiser": ["policy-reviewed", "editor", "pending-advertiser"],
    "approve-advertiser": [
      "pending-advertiser",
      "advertiser",
      c.input.adminRequired ? "pending-admin" : "approved-local",
    ],
    "approve-admin": ["pending-admin", "admin", "approved-local"],
    simulate: ["approved-local", "editor", "simulated"],
  };
  const rule = allowed[a];
  if (!rule || rule[0] !== c.status || rule[1] !== cmd.role)
    return fail(
      "Unauthorized or out-of-order local transition. Select the required role and current stage.",
    );
  const blockers = campaignBlockers(host, c);
  if (blockers.length) return fail(blockers.join(" "));
  const current = (r: CampaignReceipt | null) =>
    r?.revision === c.revision && r.propertyRevision === p.revision;
  if (
    [
      "request-advertiser",
      "approve-advertiser",
      "approve-admin",
      "simulate",
    ].includes(a) &&
    !current(c.policy)
  )
    return fail("Current-revision policy review required.");
  if (["approve-admin", "simulate"].includes(a) && !current(c.advertiser))
    return fail("Current-revision advertiser approval required.");
  if (a === "simulate" && c.input.adminRequired && !current(c.admin))
    return fail("Current-revision MaxPro approval required.");
  if (a === "simulate" && !host.preparedConnectors.includes(c.input.channel))
    return fail(
      "Configure the proposed provider locally before simulation. Actual integration remains unavailable.",
    );
  return finish(
    event(
      {
        ...c,
        status: rule[2],
        policy: a === "review-policy" ? receipt : c.policy,
        advertiser: a === "approve-advertiser" ? receipt : c.advertiser,
        admin: a === "approve-admin" ? receipt : c.admin,
        approvedBudget:
          a === "approve-advertiser" ? c.input.mediaBudget : c.approvedBudget,
      },
      `${a} · local only`,
      cmd.role,
      at,
    ),
  );
}
export const campaignSource = (c: Campaign): LeadSource =>
  c.input.channel === "meta-catalog" ? "Meta Lead Ads" : "Website";
export function campaignMetrics(
  host: Pick<CampaignHost, "crm">,
  c: Campaign,
  from = "",
  to = "",
) {
  const leads = selectLeads(host.crm, {
    propertyId: c.input.propertyId,
    from,
    to,
  }).filter((l) => l.campaign === c.id);
  const costs = c.spend.filter(
    (s) => (!from || s.date >= from) && (!to || s.date <= to),
  );
  const spend = costs.length ? costs.reduce((n, s) => n + s.qar, 0) : null;
  const metrics = leadMetrics(leads);
  return {
    ...metrics,
    leads,
    spend,
    cpql:
      spend !== null && metrics.qualified ? spend / metrics.qualified : null,
  };
}
