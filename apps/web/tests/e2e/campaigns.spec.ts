import {localized} from './fixtures';
import { resolve } from "node:path";
import { mkdirSync, readdirSync, writeFileSync } from "node:fs";
import type { Page } from "@playwright/test";
import { test, expect } from "./fixtures";
import {
  seedProperties,
  demoOrganizationId,
  reviseProperty,
} from "../../src/lib/canonical-property";
import { seedCrm, applyCrmCommand } from "../../src/lib/lead-crm";
import {
  applyCampaignCommand,
  blankCampaignInput,
  campaignBlockers,
  campaignMetrics,
  invalidateCampaign,
  type CampaignHost,
  type CampaignCommand,
  type CampaignInput,
  type CampaignRole,
  type Campaign,
} from "../../src/lib/campaign-engine";
import { localMarketingAI } from "../../src/lib/marketing-ai";
import { restoreCampaigns } from "../../src/lib/campaign-storage";
import type { DemoState } from "../../src/components/gemini/demo-provider";
const key = "maxpro-gemini-v3-demo-state";
function host(): CampaignHost {
  const properties = seedProperties();
  return {
    properties,
    crm: { ...seedCrm(properties), leads: [], spend: [] },
    campaigns: [],
    plan: "agency",
    preparedConnectors: ["meta-catalog", "google-ads"],
    assignMethod: "round-robin",
    activeAgents: ["Fatima Noor", "Karim Said"],
    fallbackAgent: "Mariam Ahmed",
  };
}
function readyInput(s: CampaignHost): CampaignInput {
  const p = s.properties["AQ-10233"];
  return {
    ...blankCampaignInput(p.id),
    headlineEn: p.facts.titleEn,
    headlineAr: p.facts.titleAr,
    copyEn: p.facts.descriptionEn,
    copyAr: p.facts.descriptionAr,
    assetIds: [p.media[0].id],
    checklist: {
      housing: true,
      factual: true,
      rights: true,
      providerLimitations: true,
    },
  };
}
function execute(s: CampaignHost, cmd: CampaignCommand) {
  const r = applyCampaignCommand(s, cmd, localMarketingAI);
  if (!r.error) {
    s.campaigns = r.campaigns;
    s.crm = r.crm;
  }
  return r;
}
function create(s: CampaignHost, input = readyInput(s)) {
  const r = execute(s, {
    type: "create",
    input,
    organizationId: demoOrganizationId,
    role: "editor",
  });
  expect(r.error).toBeNull();
  return s.campaigns.find((c) => c.id === r.id)!;
}
function transition(
  s: CampaignHost,
  c: Campaign,
  action: Extract<CampaignCommand, { type: "transition" }>["action"],
  role: CampaignRole,
) {
  return execute(s, {
    type: "transition",
    id: c.id,
    revision: c.revision,
    organizationId: demoOrganizationId,
    role,
    action,
  });
}
function approve(s: CampaignHost, c: Campaign) {
  for (const [action, role] of [
    ["submit-policy", "editor"],
    ["review-policy", "policy-reviewer"],
    ["request-advertiser", "editor"],
    ["approve-advertiser", "advertiser"],
    ...(c.input.adminRequired ? [["approve-admin", "admin"]] : []),
  ] as const) {
    expect(
      transition(
        s,
        c,
        action as Extract<CampaignCommand, { type: "transition" }>["action"],
        role as CampaignRole,
      ).error,
    ).toBeNull();
  }
  return s.campaigns.find((x) => x.id === c.id)!;
}

test("campaign domain: ordered approvals, stale revisions, roles, tenant and setup guards", () => {
  const s = host();
  let c = create(s);
  expect(transition(s, c, "simulate", "editor").error).toContain(
    "out-of-order",
  );
  expect(transition(s, c, "submit-policy", "admin").error).toContain(
    "Unauthorized",
  );
  expect(
    execute(s, {
      type: "transition",
      id: c.id,
      revision: 1,
      organizationId: "FOREIGN",
      role: "editor",
      action: "submit-policy",
    }).error,
  ).toContain("Unauthorized");
  c = approve(s, c);
  expect(c.approvedBudget).toBe(c.input.mediaBudget);
  s.preparedConnectors = [];
  expect(transition(s, c, "simulate", "editor").error).toContain("Configure");
  s.preparedConnectors = ["meta-catalog"];
  expect(transition(s, c, "simulate", "editor").error).toBeNull();
  const r = execute(s, {
    type: "save",
    id: c.id,
    revision: c.revision,
    input: { ...c.input, mediaBudget: 400 },
    organizationId: demoOrganizationId,
    role: "editor",
  });
  expect(r.error).toBeNull();
  const next = s.campaigns[0];
  expect(next.revision).toBe(2);
  expect(next.advertiser).toBeNull();
  expect(next.policy).toBeNull();
  expect(next.status).toBe("draft");
  expect(transition(s, c, "simulate", "editor").error).toContain("Stale");
});
test("campaign domain: policy blockers include licensing, review, media, targeted exclusions, numeric facts and caps", () => {
  const s = host();
  const c = create(s);
  const p = s.properties[c.input.propertyId];
  p.facts.permit = "";
  p.source.factsReviewed = false;
  p.media[0].availability = "unavailable";
  c.input.targeting = "age-exclusion";
  c.input.mediaBudget = 25001;
  c.input.copyEn = "99999 bedrooms";
  const errors = campaignBlockers(s, c).join(" ");
  expect(errors).toContain("licensing");
  expect(errors).toContain("human review");
  expect(errors).toContain("image creative");
  expect(errors).toContain("Unsupported targeting");
  expect(errors).toContain("cap");
  expect(errors).toContain("numeric claims");
  expect(transition(s, c, "submit-policy", "editor").error).toBeTruthy();
  s.plan = "starter";
  expect(campaignBlockers(s, c).join(" ")).toContain("excluded");
});
test("campaign domain: deterministic bilingual suggestions cite only current canonical facts; accept/reject is audited", () => {
  const s = host();
  const c = create(s);
  const p = s.properties[c.input.propertyId];
  p.facts.priceQar = 1234567;
  p.facts.areaSqm = 321;
  p.facts.beds = 4;
  for (const kind of [
    "copy",
    "headline",
    "features",
    "objective",
    "creative",
    "budget",
  ] as const) {
    const a = localMarketingAI.propose(s, c, kind, new Date().toISOString());
    const b = localMarketingAI.propose(s, c, kind, a.createdAt);
    expect(a.en).toBe(b.en);
    expect(a.ar).toBe(b.ar);
    expect(a.references[0]).toContain(p.id);
  }
  const proposal = localMarketingAI.propose(
    s,
    c,
    "copy",
    new Date().toISOString(),
  );
  expect(proposal.en).toContain("1,234,567");
  expect(proposal.en).toContain("321");
  expect(proposal.en).toContain("4 bedrooms");
  expect(proposal.ar).toContain("321");
  expect(
    execute(s, {
      type: "suggest",
      id: c.id,
      revision: 1,
      kind: "copy",
      role: "editor",
      organizationId: demoOrganizationId,
    }).error,
  ).toBeNull();
  const stored = s.campaigns[0].proposals[0];
  expect(
    execute(s, {
      type: "review-proposal",
      id: c.id,
      revision: 1,
      proposalId: stored.id,
      accept: true,
      en: stored.en,
      ar: stored.ar,
      role: "editor",
      organizationId: demoOrganizationId,
    }).error,
  ).toBeNull();
  expect(s.campaigns[0].revision).toBe(2);
  expect(s.campaigns[0].proposals[0].status).toBe("accepted");
  p.source.factsReviewed = false;
  expect(
    execute(s, {
      type: "suggest",
      id: c.id,
      revision: 2,
      kind: "copy",
      role: "editor",
      organizationId: demoOrganizationId,
    }).error,
  ).toContain("Review complete");
});
test("campaign domain: property changes invalidate approvals and stale creative references on recovery", () => {
  const s = host();
  let c = approve(s, create(s));
  const p = s.properties[c.input.propertyId];
  const next = reviseProperty(
    p,
    { media: p.media.slice(1) },
    "Remove creative",
  );
  s.properties[p.id] = next;
  const restored = restoreCampaigns([c], 1, s.properties);
  expect(restored.corrupt).toBe(false);
  c = restored.campaigns[0];
  expect(c.status).toBe("draft");
  expect(c.revision).toBe(2);
  expect(c.policy).toBeNull();
  expect(c.input.assetIds).toEqual([]);
  const invalidated = invalidateCampaign(c, next);
  expect(invalidated.advertiser).toBeNull();
});
test("campaign domain: optional admin, cancel/resume/duplicate and rejection retain independent histories", () => {
  const s = host();
  let c = create(s, { ...readyInput(s), adminRequired: false });
  c = approve(s, c);
  expect(c.status).toBe("approved-local");
  expect(c.admin).toBeNull();
  expect(transition(s, c, "approve-admin", "admin").error).toBeTruthy();
  expect(transition(s, c, "cancel", "editor").error).toBeNull();
  c = s.campaigns[0];
  expect(transition(s, c, "resume", "editor").error).toBeNull();
  c = s.campaigns[0];
  expect(c.revision).toBe(2);
  expect(c.status).toBe("draft");
  expect(transition(s, c, "duplicate", "editor").error).toBeNull();
  const duplicate = s.campaigns[0];
  expect(duplicate.id).not.toBe(c.id);
  expect(duplicate.policy).toBeNull();
  expect(duplicate.history.length).toBe(1);
  expect(duplicate.revision).toBe(1);
  const i = { ...duplicate.input, checklist: readyInput(s).checklist };
  execute(s, {
    type: "save",
    id: duplicate.id,
    revision: 1,
    input: i,
    organizationId: demoOrganizationId,
    role: "editor",
  });
  const d = s.campaigns[0];
  expect(transition(s, d, "submit-policy", "editor").error).toBeNull();
  expect(transition(s, d, "reject", "admin").error).toBeTruthy();
  expect(transition(s, d, "reject", "policy-reviewer").error).toBeNull();
});
test("campaign domain: Meta and Google attributed lead intake deduplicates and reports actual fictional CRM observations", () => {
  for (const channel of ["meta-catalog", "google-ads"] as const) {
    const s = host();
    let c = approve(s, create(s, { ...readyInput(s), channel }));
    expect(transition(s, c, "simulate", "editor").error).toBeNull();
    c = s.campaigns[0];
    const cmd: CampaignCommand = {
      type: "lead",
      id: c.id,
      revision: 1,
      role: "editor",
      organizationId: demoOrganizationId,
      eventId: "DEMO-CAMPAIGN-ENQUIRY",
      consent: true,
    };
    const first = execute(s, cmd);
    expect(first.error).toBeNull();
    const cursor = s.crm.cursor;
    const replay = execute(s, cmd);
    expect(replay.leadId).toBe(first.leadId);
    expect(s.crm.cursor).toBe(cursor);
    expect(s.crm.leads).toHaveLength(1);
    expect(s.crm.leads[0].campaign).toBe(c.id);
    expect(s.crm.leads[0].attribution.history[0].campaign).toBe(c.id);
    expect(s.crm.leads[0].source).toBe(
      channel === "meta-catalog" ? "Meta Lead Ads" : "Website",
    );
    s.crm = applyCrmCommand(s, {
      type: "stage",
      leadId: first.leadId!,
      stage: "Qualified",
    }).crm;
    s.crm = applyCrmCommand(s, {
      type: "stage",
      leadId: first.leadId!,
      stage: "Won",
    }).crm;
    expect(
      execute(s, {
        type: "spend",
        id: c.id,
        revision: 1,
        role: "editor",
        organizationId: demoOrganizationId,
        date: c.input.startDate,
        qar: 90,
      }).error,
    ).toBeNull();
    const m = campaignMetrics(s, s.campaigns[0]);
    expect(m.total).toBe(1);
    expect(m.qualified).toBe(1);
    expect(m.won).toBe(1);
    expect(m.conversion).toBe(100);
    expect(m.cpql).toBe(90);
    expect(s.crm.spend.at(-1)?.qar).toBe(90);
    expect(
      execute(s, {
        type: "spend",
        id: c.id,
        revision: 1,
        role: "editor",
        organizationId: demoOrganizationId,
        date: c.input.startDate,
        qar: 350,
      }).error,
    ).toContain("exceeds");
    expect(
      localMarketingAI.propose(
        s,
        s.campaigns[0],
        "summary",
        new Date().toISOString(),
      ).en,
    ).toContain("1 fictional enquiries");
  }
});
test("campaign domain: migration and corrupted state preserve valid records and strip unknown fields", () => {
  const s = host();
  const c = create(s);
  expect(restoreCampaigns(undefined, undefined, s.properties)).toEqual({
    campaigns: [],
    corrupt: false,
  });
  const injected = {
    ...c,
    apiKey: "never retained",
    input: { ...c.input, token: "never retained" },
  };
  const recovered = restoreCampaigns(
    [injected, { ...c, id: "invalid" }],
    1,
    s.properties,
  );
  expect(recovered.corrupt).toBe(true);
  expect(recovered.campaigns).toHaveLength(1);
  expect(JSON.stringify(recovered.campaigns)).not.toContain("never retained");
  for (const invalid of [
    { ...c, organizationId: "other" },
    { ...c, input: { ...c.input, mediaBudget: NaN } },
    { ...c, status: "simulated" },
    { ...c, input: { ...c.input, propertyId: "AQ-99999" } },
    { ...c, propertyRevision: 999 },
    { ...c, history: [] },
  ])
    expect(restoreCampaigns([invalid], 1, s.properties).campaigns).toEqual([]);
  expect(restoreCampaigns([c, c], 1, s.properties).campaigns).toHaveLength(1);
  expect(restoreCampaigns([c], 99, s.properties).corrupt).toBe(true);
  const safe = create(s, {
    ...readyInput(s),
    token: "unrecognized-input",
  } as CampaignInput);
  expect(JSON.stringify(safe)).not.toContain("unrecognized-input");
  const malformedProposal = {
    ...localMarketingAI.propose(s, safe, "budget", new Date().toISOString()),
    amount: null,
  };
  s.campaigns.find((c) => c.id === safe.id)!.proposals.push(malformedProposal);
  const proposedResult = execute(s, {
    type: "review-proposal",
    id: safe.id,
    revision: 1,
    role: "editor",
    organizationId: demoOrganizationId,
    proposalId: malformedProposal.id,
    accept: true,
    en: malformedProposal.en,
    ar: malformedProposal.ar,
  });
  expect(proposedResult.error).toContain("Proposal cannot be applied");
  expect(s.campaigns.find((c) => c.id === safe.id)?.input.mediaBudget).toBe(
    350,
  );
  expect(
    restoreCampaigns(
      [{ ...safe, proposals: [malformedProposal] }],
      1,
      s.properties,
    ).corrupt,
  ).toBe(true);
  safe.proposals = [];
  const costCorrupt = {
    ...safe,
    spend: [{ id: "missing-crm-cost", date: safe.input.startDate, qar: 10 }],
  };
  const costRecovery = restoreCampaigns([costCorrupt], 1, s.properties, s.crm);
  expect(costRecovery.corrupt).toBe(true);
  expect(costRecovery.campaigns[0].spend).toEqual([]);
  expect(
    execute(s, {
      type: "save",
      id: safe.id,
      revision: 1,
      role: "editor",
      organizationId: demoOrganizationId,
      input: { ...safe.input, propertyId: "AQ-10231" },
    }).error,
  ).toContain("identity is fixed");
});

async function saved(page: Page): Promise<DemoState> {
  return page.evaluate((k) => JSON.parse(localStorage.getItem(k)!), key);
}
async function seed(page: Page, s: CampaignHost) {
  await page.goto("/en/workspace/campaigns");
  await page.evaluate(
    ({ key, s }) => {
      const base = JSON.parse(localStorage.getItem(key) ?? "null");
      const state = base ?? {
        schemaVersion: 1,
        connectorSchemaVersion: 2,
        crmSchemaVersion: 1,
        campaignSchemaVersion: 1,
        jobs: [],
      };
      localStorage.setItem(
        key,
        JSON.stringify({ ...state, ...s, campaignSchemaVersion: 1 }),
      );
    },
    { key, s },
  );
}
const stage = (page: Page, n: number) =>
  page.locator(".cm-steps button").nth(n).click();
async function saveDraft(page: Page) {
  await page
    .getByRole("button", { name: localized(/^Save draft$|^حفظ المسودة$/) })
    .click();
}
async function noOverflow(page: Page) {
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth + 1,
    ),
  ).toBe(true);
}
async function prepareReady(page: Page, locale: string) {
  const s = host();
  const c = create(s);
  await seed(page, s);
  await page.goto(`/${locale}/workspace/campaigns/${c.id}`);
  await expect(page.locator(".cm-steps")).toBeVisible();
  return c;
}
async function approveUI(page: Page) {
  await stage(page, 5);
  for (const [role, name] of [
    ["editor", /Submit for policy review|إرسال لمراجعة السياسة/],
    ["policy-reviewer", /Record policy review|تسجيل مراجعة السياسة/],
    ["editor", /Request advertiser approval|طلب موافقة المعلن/],
    [
      "advertiser",
      /Approve creative & budget locally|اعتماد الوسائط والميزانية محلياً/,
    ],
    ["admin", /Record MaxPro approval|تسجيل موافقة ماكس برو/],
    ["editor", /Simulate campaign locally|محاكاة الحملة محلياً/],
  ] as const) {
    await page.getByLabel(/Local demo role|دور تجريبي محلي/).selectOption(role);
    await page.getByRole("button", { name }).click();
    await expect(page.locator("main [role=alert]")).toHaveCount(0);
  }
}

for (const locale of ["en", "ar"])
  test(`campaign full journey ${locale}: canonical selection to grounded creative, approvals and enquiry without seeded campaigns`, async ({
    page,
  }) => {
    const externalMutations: string[] = [];
    page.on("request", (r) => {
      if (
        !["GET", "HEAD"].includes(r.method()) &&
        !r.url().startsWith("http://127.0.0.1:")
      )
        externalMutations.push(r.url());
    });
    await page.goto(`/${locale}/workspace/campaigns/new?property=AQ-10233`);
    await page
      .getByRole("button", { name: localized(/Save & continue|حفظ ومتابعة/) })
      .click();
    await expect(page).toHaveURL(/DEMO-CAMPAIGN-/);
    for (const kind of ["headline", "copy"]) {
      await page.getByLabel(/Suggestion type|نوع المقترح/).selectOption(kind);
      await page
        .getByRole("button", {
          name: localized(/Prepare simulated suggestion|إعداد مقترح محاكى/),
        })
        .click();
      await page
        .getByRole("button", { name: localized(/Accept proposal|قبول المقترح/) })
        .first()
        .click();
    }
    await stage(page, 2);
    const creative = page.getByRole("checkbox", { name: localized(/Sample hero photo/) });
    await creative.focus();
    await expect(creative).toBeFocused();
    await creative.press("Space");
    await expect(creative).toBeChecked();
    await saveDraft(page);
    await stage(page, 3);
    for (const checkbox of await page.locator(".cm-checklist input").all())
      await checkbox.check();
    await saveDraft(page);
    await stage(page, 4);
    await page
      .getByLabel(/Illustrative service fee QAR|رسوم الخدمة التوضيحية/)
      .fill("25");
    await saveDraft(page);
    const c = (await saved(page)).campaigns[0];
    expect(c.input.headlineEn).toContain("Viva");
    expect(c.input.copyEn).toContain("247");
    await page.goto(`/${locale}/workspace/hub/connectors/meta-catalog`);
    await page.getByRole("checkbox").check();
    await page.getByRole("button", { name: localized("Prepare demo connector") }).click();
    await page.goto(`/${locale}/workspace/campaigns/${c.id}`);
    await approveUI(page);
    await page
      .getByLabel(
        /Consent for this fictional enquiry|موافقة لهذا الاستفسار الخيالي/,
      )
      .check();
    await page
      .getByRole("button", {
        name: localized(/Record \/ replay fictional enquiry|تسجيل \/ إعادة الاستفسار الخيالي/),
      })
      .click();
    expect(
      (await saved(page)).crm.leads.filter((l) => l.campaign === c.id),
    ).toHaveLength(1);
    expect(externalMutations).toEqual([]);
  });

for (const locale of ["en", "ar"]) {
  test(`campaign ${locale}: create from canonical property, persist, edit and grounded proposal review`, async ({
    page,
  }) => {
    await page.goto(`/${locale}/workspace/inventory/AQ-10233`);
    await page.getByRole("link", { name: localized(/Plan campaign|تخطيط حملة/) }).click();
    await expect(
      page.getByLabel(/Canonical property|العقار الأساسي/),
    ).toHaveValue("AQ-10233");
    await page
      .getByRole("button", { name: localized(/Create campaign draft|إنشاء مسودة حملة/) })
      .click();
    await expect(page).toHaveURL(/workspace\/campaigns\/DEMO-CAMPAIGN-/);
    const id = (await saved(page)).campaigns[0].id;
    await stage(page, 1);
    await page
      .getByLabel(/English headline|العنوان بالإنجليزية/)
      .fill("Canonical headline");
    await page
      .getByLabel(/Arabic headline|العنوان بالعربية/)
      .fill("عنوان نموذجي");
    await saveDraft(page);
    await page.reload();
    await stage(page, 1);
    await expect(
      page.getByLabel(/English headline|العنوان بالإنجليزية/),
    ).toHaveValue("Canonical headline");
    await page
      .getByRole("button", {
        name: localized(/Prepare simulated suggestion|إعداد مقترح محاكى/),
      })
      .click();
    await expect(
      page.getByLabel(/Editable English proposal|مقترح إنجليزي قابل للتعديل/),
    ).toContainText(localized("247"));
    await page
      .getByRole("button", { name: localized(/Accept proposal|قبول المقترح/) })
      .click();
    await page.waitForLoadState();
    await expect(page.locator(".cm-steps")).toBeVisible();
    expect(
      (await saved(page)).campaigns.find((c) => c.id === id)?.proposals[0]
        .status,
    ).toBe("accepted");
    await stage(page, 1);
    expect(
      await page
        .getByLabel(/English advertisement copy|النص الإعلاني بالإنجليزية/)
        .inputValue(),
    ).toContain("247");
    await noOverflow(page);
  });
  test(`campaign ${locale}: policy blockers, ordered approval, simulation, attributed lead replay and analytics`, async ({
    page,
  }) => {
    const c = await prepareReady(page, locale);
    await approveUI(page);
    await expect(page.locator(".cm-record-bar")).toContainText(
      /Simulated locally|تمت المحاكاة محلياً/,
    );
    await page
      .getByLabel(
        /Consent for this fictional enquiry|موافقة لهذا الاستفسار الخيالي/,
      )
      .check();
    const record = page.getByRole("button", {
      name: localized(/Record \/ replay fictional enquiry|تسجيل \/ إعادة الاستفسار الخيالي/),
    });
    await record.click();
    await record.click();
    const state = await saved(page);
    expect(state.crm.leads.filter((l) => l.campaign === c.id)).toHaveLength(1);
    expect(state.crm.receipts.at(-1)?.status).toBe("duplicate");
    await page
      .getByRole("link", {
        name: localized(/Inspect canonical lead|فحص سجل العميل الأساسي/),
      })
      .click();
    await expect(page.locator("main")).toContainText(c.id);
    await page.getByLabel(/Lead stage|مرحلة العميل/).selectOption("Qualified");
    await page.goto(`/${locale}/workspace/campaigns/${c.id}`);
    await stage(page, 5);
    await page
      .getByLabel(/Fictional media cost QAR|تكلفة الوسائط الخيالية/)
      .fill("90");
    await page
      .getByRole("button", { name: localized(/Record fictional cost|تسجيل تكلفة خيالية/) })
      .click();
    await page
      .getByRole("link", {
        name: localized(/Campaign analytics & linked leads|تحليلات الحملة والعملاء المرتبطون/),
      })
      .click();
    await expect(page.locator(".cm-report-table tbody")).toContainText(
      localized("QAR 90"),
    );
    await expect(page.locator(".cm-report-table tbody tr")).toHaveCount(1);
    await noOverflow(page);
  });
  test(`campaign ${locale}: approval invalidation, cancel/resume/duplicate and property integrity`, async ({
    page,
  }) => {
    const c = await prepareReady(page, locale);
    await approveUI(page);
    await stage(page, 4);
    await page.getByLabel(/Media budget QAR|ميزانية الوسائط ر.ق/).fill("400");
    await saveDraft(page);
    let record = (await saved(page)).campaigns[0];
    expect(record.status).toBe("draft");
    expect(record.advertiser).toBeNull();
    await page
      .getByRole("button", { name: localized(/Cancel campaign|إلغاء الحملة/) })
      .click();
    await page
      .getByRole("button", {
        name: localized(/Resume as new revision|متابعة كنسخة جديدة/),
      })
      .click();
    await page.getByRole("button", { name: localized(/Duplicate|نسخ/) }).click();
    await expect(page).not.toHaveURL(new RegExp(c.id));
    expect((await saved(page)).campaigns).toHaveLength(2);
    await page.goto(`/${locale}/workspace/inventory/AQ-10233/edit`);
    await page.getByLabel(localized("Title — English")).fill("Revised canonical title");
    await page
      .getByRole("button", {
        name: localized(/Save browser-local draft|حفظ المسودة محلياً/),
      })
      .click();
    record = (await saved(page)).campaigns.find((x) => x.id === c.id)!;
    expect(record.policy).toBeNull();
    expect(record.history.at(-1)?.action).toContain("property changed");
  });
  test(`campaign ${locale}: invalid IDs, corrupt records, old-envelope migration and missing prerequisites`, async ({
    page,
  }) => {
    await page.goto(`/${locale}/workspace/campaigns/DEMO-NOT-FOUND`);
    await expect(page.getByRole("heading",{level:1})).toContainText(
      /Campaign unavailable|الحملة غير متاحة/,
    );
    const s = host();
    const valid = create(s);
    await seed(page, s);
    await page.evaluate((k) => {
      const s = JSON.parse(localStorage.getItem(k)!);
      s.campaigns.push({
        ...s.campaigns[0],
        id: "bad",
        organizationId: "foreign",
      });
      localStorage.setItem(k, JSON.stringify(s));
    }, key);
    await page.goto(`/${locale}/workspace/campaigns`);
    await expect(page.locator(".gm-storage-warning")).toBeVisible();
    await expect(page.locator(".cm-table tbody tr")).toHaveCount(1);
    await expect(page.locator(".cm-table")).toContainText(valid.id.slice(-8));
    await page.goto(`/${locale}/workspace/campaigns/new?property=AQ-10256`);
    await page
      .getByRole("button", { name: localized(/Create campaign draft|إنشاء مسودة حملة/) })
      .click();
    await stage(page, 3);
    await expect(page.locator(".cm-policy-readout")).toContainText(localized("licensing"));
    await page
      .getByRole("button", {
        name: localized(/Prepare simulated suggestion|إعداد مقترح محاكى/),
      })
      .click();
    await expect(page.locator("main [role=alert]")).toContainText(
      localized("Review complete"),
    );
  });
  test(`campaign ${locale}: provider catalogue, Google plan and consent-aware event preview`, async ({
    page,
  }) => {
    await page.goto(`/${locale}/workspace/integrations/meta-catalog`);
    await page
      .getByLabel(/Preview canonical property|معاينة العقار الأساسي/)
      .selectOption("AQ-10256");
    await expect(page.locator(".cm-mapping")).toContainText(
      /Missing \/ review|مفقود \/ مراجعة/,
    );
    await expect(
      page.getByRole("button", {
        name: localized(/Preview event payload|معاينة بيانات الحدث/),
      }),
    ).toBeDisabled();
    await page
      .getByRole("checkbox",{name:/Fictional consent for this event|موافقة خيالية لمعاينة الحدث/})
      .check();
    await page
      .getByRole("button", {
        name: localized(/Preview event payload|معاينة بيانات الحدث/),
      })
      .click();
    await expect(page.locator(".gm-code")).toContainText(localized("remote_sent"));
    await page
      .getByRole("checkbox",{name:/Fictional consent for this event|موافقة خيالية لمعاينة الحدث/})
      .uncheck();
    await expect(page.locator(".gm-code")).toHaveCount(0);
    await page.goto(`/${locale}/workspace/integrations/google-ads`);
    await page
      .getByRole("link", {
        name: localized(/Plan a campaign for this property|تخطيط حملة لهذا العقار/),
      })
      .click();
    await expect(
      page.getByLabel(/Proposed platform|المنصة المقترحة/),
    ).toHaveValue("google-ads");
    await noOverflow(page);
  });
  for (const width of [1440, 1024, 768, 375])
    test(`campaign evidence ${locale} ${width}: screenshots and responsive workflow`, async ({
      page,
    }, info) => {
      test.skip(info.project.name !== "chromium", "Each width captured once.");
      test.setTimeout(90000);
      await page.setViewportSize({ width, height: 1000 });
      const c = await prepareReady(page, locale);
      const path = resolve(`../../${globalThis.process.env.MAXPRO_EVIDENCE_ROOT??'artifacts/phase6'}/regression/phase4/screenshots`);
      mkdirSync(path, { recursive: true });
      for (const [name, n] of [
        ["builder", 0],
        ["copy", 1],
        ["creative", 2],
        ["policy", 3],
        ["budget", 4],
      ] as const) {
        await stage(page, n);
        if (name === "copy") {
          await page
            .getByRole("button", {
              name: localized(/Prepare simulated suggestion|إعداد مقترح محاكى/),
            })
            .click();
          await page.locator(".cm-proposal-sources summary").click();
        }
        await expect(page.locator("html")).toHaveAttribute(
          "dir",
          locale === "ar" ? "rtl" : "ltr",
        );
        await noOverflow(page);
        await page.screenshot({
          path: `${path}/${locale}-${width}-${name}.png`,
          fullPage: true,
          scale: "css",
        });
        if (name === "copy")
          await page
            .getByRole("button", { name: localized(/Reject proposal|رفض المقترح/) })
            .click();
      }
      await approveUI(page);
      await page
        .getByLabel(
          /Consent for this fictional enquiry|موافقة لهذا الاستفسار الخيالي/,
        )
        .check();
      await page
        .getByRole("button", {
          name: localized(/Record \/ replay fictional enquiry|تسجيل \/ إعادة الاستفسار الخيالي/),
        })
        .click();
      await noOverflow(page);
      await page.screenshot({
        path: `${path}/${locale}-${width}-approval.png`,
        fullPage: true,
        scale: "css",
      });
      for (const [name, route] of [
        ["portfolio", "campaigns"],
        ["analytics", `ads/attribution?campaign=${c.id}`],
        ["meta", "integrations/meta-catalog"],
        ["google", "integrations/google-ads"],
      ]) {
        await page.goto(`/${locale}/workspace/${route}`);
        await expect(page.getByRole("heading",{level:1})).toBeVisible();
        await page.evaluate(() => document.fonts.ready);
        await noOverflow(page);
        await page.screenshot({
          path: `${path}/${locale}-${width}-${name}.png`,
          fullPage: true,
          scale: "css",
        });
      }
    });
  test(`campaign accessibility ${locale}: axe across editor stages, approvals, portfolio, catalogue and analytics`, async ({
    page,
  }, info) => {
    test.setTimeout(90000);
    const dir = readdirSync(resolve("../../node_modules/.pnpm")).find((n) =>
      n.startsWith("axe-core@"),
    )!;
    const axePath = resolve(
      "../../node_modules/.pnpm",
      dir,
      "node_modules/axe-core/axe.min.js",
    );
    const c = await prepareReady(page, locale);
    const reports: unknown[] = [];
    const check = async (name: string) => {
      await page.addScriptTag({ path: axePath });
      const r = await page.evaluate<{ violations: unknown[] }>(
        'window.axe.run(document.querySelector("main"),{runOnly:{type:"tag",values:["wcag2a","wcag2aa","wcag21aa"]}})',
      );
      reports.push({ name, violations: r.violations });
      expect(r.violations, JSON.stringify(r.violations)).toEqual([]);
    };
    for (let i = 0; i < 6; i++) {
      await stage(page, i);
      await check(`stage-${i}`);
    }
    await stage(page, 1);
    await page
      .getByRole("button", {
        name: localized(/Prepare simulated suggestion|إعداد مقترح محاكى/),
      })
      .click();
    await page.locator(".cm-proposal-sources summary").click();
    await check("editable-suggestion");
    await page
      .getByRole("button", { name: localized(/Reject proposal|رفض المقترح/) })
      .click();
    await approveUI(page);
    await page
      .getByLabel(
        /Consent for this fictional enquiry|موافقة لهذا الاستفسار الخيالي/,
      )
      .check();
    await page
      .getByRole("button", {
        name: localized(/Record \/ replay fictional enquiry|تسجيل \/ إعادة الاستفسار الخيالي/),
      })
      .click();
    await check("simulation");
    for (const route of [
      "campaigns",
      "integrations/meta-catalog",
      "integrations/google-ads",
      `ads/attribution?campaign=${c.id}`,
    ]) {
      await page.goto(`/${locale}/workspace/${route}`);
      await expect(page.getByRole("heading",{level:1})).toBeVisible();
      await check(route);
    }
    mkdirSync(resolve(`../../${globalThis.process.env.MAXPRO_EVIDENCE_ROOT??'artifacts/phase6'}/regression/phase4/logs`), { recursive: true });
    writeFileSync(
      resolve(
        `../../${globalThis.process.env.MAXPRO_EVIDENCE_ROOT??'artifacts/phase6'}/regression/phase4/logs/axe-${info.project.name}-${locale}.json`,
      ),
      JSON.stringify(reports, null, 2),
    );
  });
}
