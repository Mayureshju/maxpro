"use client";
import {usePrototypeCopy} from '@/components/prototype/use-prototype-copy';
import {activeOrganizationId} from '@/lib/organization-engine';
import { useState } from "react";
import {WorkspaceLoading} from "@/components/prototype/loading-state";
import { useLocale } from "next-intl";
import { useSearchParams } from "next/navigation";
import { Link, useRouter } from "@/i18n/navigation";
import {
  ArrowRight,
  Plus,
  Check,
  ShieldCheck,
  Copy,
  FileText,
} from "lucide-react";
import {
  Intro,
  Section,
  Notice,
  Pill,
  Empty,
} from "@/components/prototype/primitives";
import {can} from '@/lib/organization-engine';
import { useGeminiDemo } from "./demo-provider";
import {
  findProperty,
  sampleMedia,
} from "@/lib/canonical-property";
import {
  blankCampaignInput,
  campaignBlockers,
  campaignBudgetCaps,
  campaignMetrics,
  campaignStates,
  objectives,
  conversionGoals,
  campaignRoles,
  type Campaign,
  type CampaignInput,
  type CampaignRole,
  type CampaignCommand,
  type MarketingProposal,
  type SuggestionKind,
  type CampaignStatus,
} from "@/lib/campaign-engine";
const useCopy = () => {
  const ar = useLocale() === "ar";
  return (en: string, arabic: string) => (ar ? arabic : en);
};
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
export function CampaignDisclosure() {const copyText=usePrototypeCopy();
  const t = useCopy();
  return (
    <div className="cm-disclosure">
      <ShieldCheck size={16} />
      <p>
        {copyText(t(
          "Fictional browser-local prototype. No AI model, provider integration, advertising spend or campaign launch. Plans QAR 179 / 725 / 1,800+, quotas 3 / 25 / negotiated and portals 1 / 2 / all authorized are illustrative pending approval. Arabic needs professional completion.",
          "نموذج خيالي محلي في المتصفح. لا اتصال بذكاء اصطناعي أو منصة إعلانية، ولا إنفاق أو إطلاق حملة. الخطط ١٧٩ / ٧٢٥ / ١٨٠٠+ ر.ق وحصص العقارات ٣ / ٢٥ / بالتفاوض والبوابات ١ / ٢ / جميع المصرّح بها أمثلة بانتظار الموافقة. العربية تحتاج إلى مراجعة مهنية.",
        ))}
      </p>
    </div>
  );
}
export function CampaignNavigation() {const copyText=usePrototypeCopy();
  const t = useCopy();
  return (
    <nav
      className="px-subnav cm-nav"
      aria-label={copyText(t("Marketing workspace", "مساحة التسويق"))}
    >
      <Link href="/workspace/campaigns">
        {copyText(t("Campaign portfolio", "محفظة الحملات"))}
      </Link>
      <Link href="/workspace/integrations/meta-catalog">
        {copyText(t("Meta catalogue", "كتالوج ميتا"))}
      </Link>
      <Link href="/workspace/integrations/google-ads">
        {copyText(t("Google planning", "تخطيط جوجل"))}
      </Link>
      <Link href="/workspace/ads/attribution">
        {copyText(t("Marketing analytics", "تحليلات التسويق"))}
      </Link>
    </nav>
  );
}
export function CampaignPortfolio() {const copyText=usePrototypeCopy();
  const t = useCopy();
  const ar = useLocale() === "ar";
  const { state, hydrated } = useGeminiDemo();
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("all");
  const [property, setProperty] = useState("all");
  const [channel, setChannel] = useState("all");
  const rows = state.campaigns.filter(
    (c) =>
      (status === "all" || c.status === status) &&
      (property === "all" || c.input.propertyId === property) &&
      (channel === "all" || c.input.channel === channel) &&
      `${c.id} ${state.properties[c.input.propertyId]?.facts.titleEn} ${state.properties[c.input.propertyId]?.facts.titleAr}`
        .toLowerCase()
        .includes(query.toLowerCase()),
  );
  return (
    <>
      <Intro
        eyebrow={t("GROWTH / CAMPAIGN STUDIO", "النمو / استوديو الحملات")}
        title={t(
          "Property marketing, with a review trail.",
          "تسويق العقارات مع سجل مراجعة.",
        )}
        description={t(
          "Prepare creative, review the proposal and approve a specific version before a local simulation. Every campaign follows its canonical property.",
          "جهّز المواد الإبداعية وراجع المقترح واعتمد نسخة محددة قبل المحاكاة المحلية. كل حملة مرتبطة بسجل عقارها الأساسي.",
        )}
        action={
          <Link
            className="px-button px-button-dark"
            href="/workspace/campaigns/new"
          >
            <Plus size={16} />
            {copyText(t("New campaign", "حملة جديدة"))}
          </Link>
        }
      />
      <CampaignNavigation />
      <div className="cm-workflow-strip">
        {[
          t("01 Prepare", "٠١ إعداد"),
          t("02 Review", "٠٢ مراجعة"),
          t("03 Approve", "٠٣ اعتماد"),
          t("04 Simulate & learn", "٠٤ محاكاة وقياس"),
        ].map((s) => (
          <span key={s}>{copyText(s)}</span>
        ))}
      </div>
      <Section
        title={t("Campaign portfolio", "محفظة الحملات")}
        subtitle={t(
          "Saved local records. Budgets are proposals, never actual spend.",
          "سجلات محلية محفوظة. الميزانيات مقترحات وليست إنفاقاً فعلياً.",
        )}
      >
        <div className="cm-filters">
          <label className="px-field">
            {copyText(t("Search campaigns", "بحث الحملات"))}
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={copyText(t(
                "Property title or campaign ID",
                "عنوان العقار أو معرّف الحملة",
              ))}
            />
          </label>
          <label className="px-field">
            {copyText(t("Campaign status", "حالة الحملة"))}
            <select value={status} onChange={(e) => setStatus(e.target.value)}>
              <option value="all">{copyText(t("All statuses", "كل الحالات"))}</option>
              {campaignStates.map((s) => (
                <option key={s} value={s}>
                  {copyText(campaignStatusLabel(s, ar))}
                </option>
              ))}
            </select>
          </label>
          <label className="px-field">
            {copyText(t("Property filter", "تصفية العقار"))}
            <select
              value={property}
              onChange={(e) => setProperty(e.target.value)}
            >
              <option value="all">{copyText(t("All properties", "كل العقارات"))}</option>
              {Object.keys(state.properties).map((id) => (
                <option key={id} value={id}>{copyText(id)}</option>
              ))}
            </select>
          </label>
          <label className="px-field">
            {copyText(t("Proposed platform", "المنصة المقترحة"))}
            <select
              value={channel}
              onChange={(e) => setChannel(e.target.value)}
            >
              <option value="all">{copyText(t("All platforms", "كل المنصات"))}</option>
              <option value="meta-catalog">{copyText("Meta")}</option>
              <option value="google-ads">{copyText("Google Ads")}</option>
            </select>
          </label>
        </div>
        {!hydrated ? (
          <p role="status">
            {copyText(t("Loading local portfolio…", "جار تحميل المحفظة المحلية…"))}
          </p>
        ) : rows.length ? (
          <div className="px-table-scroll" tabIndex={0}>
            <table className="px-table cm-table">
              <thead>
                <tr>
                  {[
                    t(
                      "Campaign / canonical property",
                      "الحملة / العقار الأساسي",
                    ),
                    t("Platform / objective", "المنصة / الهدف"),
                    t("Revision / status", "النسخة / الحالة"),
                    t("Proposed media / fee", "الوسائط المقترحة / الرسوم"),
                    t("Local enquiries", "الاستفسارات المحلية"),
                    t("Actions", "الإجراءات"),
                  ].map((s) => (
                    <th key={s}>{copyText(s)}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((c) => (
                  <tr key={c.id}>
                    <td>
                      <Link href={`/workspace/campaigns/${c.id}`}>
                        <strong>
                          {copyText(state.properties[c.input.propertyId]?.facts[
                            ar ? "titleAr" : "titleEn"
                          ] || c.input.propertyId)}
                        </strong>
                        <small>
                          {copyText(c.input.propertyId)} · {copyText(c.id.slice(-8))}
                        </small>
                      </Link>
                    </td>
                    <td>
                      {copyText(c.input.channel === "meta-catalog"
                        ? "Meta"
                        : "Google Ads")}
                      <small>{copyText(objectiveLabel(c.input.objective, ar))}</small>
                    </td>
                    <td>
                      <Pill
                        tone={
                          c.status === "simulated"
                            ? "info"
                            : c.status === "approved-local"
                              ? "good"
                              : "warning"
                        }
                      >
                        {copyText(campaignStatusLabel(c.status, ar))}
                      </Pill>
                      <small>
                        r{c.revision} · {copyText(t("Property", "العقار"))} r
                        {c.propertyRevision}
                      </small>
                    </td>
                    <td>
                      {copyText(money(c.input.mediaBudget))}
                      <small>
                        {copyText(t("Service fee", "رسوم الخدمة"))}{copyText(" ")}
                        {copyText(money(c.input.serviceFee))}
                      </small>
                    </td>
                    <td>{campaignMetrics(state, c).total}</td>
                    <td>
                      <Link
                        className="px-mini-action"
                        href={`/workspace/campaigns/${c.id}`}
                      >
                        {copyText(t("Open / resume", "فتح / متابعة"))}{copyText(" ")}
                        <ArrowRight size={14} />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <Empty
            title={t("No campaigns in this view", "لا حملات في هذا العرض")}
            description={t(
              "Create a draft from an existing canonical property, or adjust the filters.",
              "أنشئ مسودة من عقار أساسي موجود، أو عدّل عوامل التصفية.",
            )}
          />
        )}
      </Section>
      <CampaignDisclosure />
    </>
  );
}
const money = (n: number) =>
  `QAR ${n.toLocaleString("en", { maximumFractionDigits: 2 })}`;
const objectiveLabel = (v: CampaignInput["objective"], ar: boolean) =>
  ({
    enquiries: ar ? "استفسارات العقار" : "Property enquiries",
    awareness: ar ? "التعريف بالعقار" : "Property awareness",
    conversations: ar ? "محادثات" : "Conversations",
  })[v];
export function CampaignBuilder({ id }: { id?: string }) {const copyText=usePrototypeCopy();
  const { state, hydrated } = useGeminiDemo();
  const t = useCopy();
  const query = useSearchParams();
  if (!hydrated)
    return (
      <p role="status">
        {copyText(t("Loading campaign repository…", "جار تحميل سجل الحملات…"))}
      </p>
    );
  const c = id ? state.campaigns.find((c) => c.id === id) : undefined;
  if (id && !c)
    return (
      <>
        <Intro
          title={t("Campaign unavailable", "الحملة غير متاحة")}
          description={`${id} · ${t("Unknown or invalid local campaign ID.", "معرّف حملة محلية غير معروف أو غير صالح.")}`}
        />
        <Link
          className="px-button px-button-outline"
          href="/workspace/campaigns"
        >
          {copyText(t("Back to campaigns", "العودة إلى الحملات"))}
        </Link>
        <CampaignDisclosure />
      </>
    );
  const requestedProperty = query.get("property");
  if (
    !c &&
    requestedProperty &&
    !findProperty(state.properties, requestedProperty)
  )
    return (
      <>
        <Intro
          title={t("Canonical property unavailable", "العقار الأساسي غير متاح")}
        />
        <CampaignDisclosure />
      </>
    );
  return (
    <CampaignEditor
      key={c?.id ?? "new"}
      initial={c}
      initialProperty={requestedProperty ?? ""}
      initialChannel={query.get("channel") ?? ""}
      initialStep={Math.max(0, Math.min(5, Number(query.get("step")) || 0))}
    />
  );
}
function CampaignEditor({
  initial,
  initialProperty,
  initialChannel,
  initialStep,
}: {
  initial?: Campaign;
  initialProperty: string;
  initialChannel: string;
  initialStep: number;
}) {const copyText=usePrototypeCopy();
  const t = useCopy();
  const locale = useLocale();
  const ar = locale === "ar";
  const router = useRouter();
  const { state, campaignCommand } = useGeminiDemo();
  const c = initial
    ? state.campaigns.find((c) => c.id === initial.id)
    : undefined;
  const [input, setInput] = useState<CampaignInput>(() =>
    initial
      ? structuredClone(initial.input)
      : {
          ...blankCampaignInput(initialProperty),
          ...(initialChannel === "google-ads"
            ? { channel: "google-ads" as const }
            : {}),
        },
  );
  const [baseline, setBaseline] = useState(
    initial ? JSON.stringify(initial.input) : "",
  );
  const [revision, setRevision] = useState(initial?.revision ?? 0);
  const [openingDraft,setOpeningDraft]=useState(false);
  const [step, setStep] = useState(initialStep);
  const [role, setRole] = useState<CampaignRole>("editor");
  const [feedback, setFeedback] = useState({ error: "", message: "" });
  const [kind, setKind] = useState<SuggestionKind>("copy");
  const [eventId, setEventId] = useState(
    `DEMO-EVENT-${initial?.id.slice(-36) ?? "UNSAVED"}`,
  );
  const [consent, setConsent] = useState(false);
  const [leadId, setLeadId] = useState("");
  const [cost, setCost] = useState("");
  const [costDate, setCostDate] = useState(input.startDate);
  const p = findProperty(state.properties, input.propertyId);
  const dirty = !c || JSON.stringify(input) !== baseline;
  const stale = !!c && c.revision !== revision;
  const active = !c || !["cancelled", "rejected"].includes(c.status);
  const draftView: Campaign = c
    ? { ...c, input }
    : ({ input, propertyRevision: p?.revision ?? 0 } as Campaign);
  const blockers = p
    ? campaignBlockers(state, draftView)
    : [t("Select a canonical property.", "اختر عقاراً أساسياً.")];
  function field<K extends keyof CampaignInput>(k: K, v: CampaignInput[K]) {
    setInput((prev) => ({ ...prev, [k]: v }));
    setFeedback({ error: "", message: "" });
  }
  function save(nextStep = step) {
    const cmd: CampaignCommand = c
      ? {
          type: "save",
          id: c.id,
          revision,
          input,
          organizationId: activeOrganizationId(state.organization),
          role,
        }
      : { type: "create", input, organizationId: activeOrganizationId(state.organization), role };
    const r = campaignCommand(cmd);
    if (r.error) {
      setFeedback({ error: r.error, message: "" });
      return false;
    }
    if (!c) {
      setOpeningDraft(true);
      router.replace(`/workspace/campaigns/${r.id}?step=${nextStep}`);
      return true;
    }
    const changed = JSON.stringify(input) !== JSON.stringify(c.input);
    setRevision(c.revision + (changed ? 1 : 0));
    setBaseline(JSON.stringify(input));
    setFeedback({
      error: "",
      message: t(
        "Campaign saved locally. Changed inputs invalidate previous approvals.",
        "تم حفظ الحملة محلياً. تغييرات المدخلات تلغي الموافقات السابقة.",
      ),
    });
    setStep(nextStep);
    return true;
  }
  function run(cmd: CampaignCommand) {
    const r = campaignCommand(cmd);
    setFeedback({
      error: r.error ?? "",
      message: r.error
        ? ""
        : t(
            "Local action recorded. No remote activity.",
            "تم تسجيل الإجراء محلياً. لا نشاط خارجي.",
          ),
    });
    return r;
  }
  function transition(
    action: Extract<CampaignCommand, { type: "transition" }>["action"],
  ) {
    if (!c) return;
    const r = run({
      type: "transition",
      id: c.id,
      revision,
      organizationId: activeOrganizationId(state.organization),
      role,
      action,
    });
    if (!r.error) {
      if (action === "duplicate") router.push(`/workspace/campaigns/${r.id}`);
      if (action === "resume") {
        setRevision(c.revision + 1);
        setInput({ ...input, checklist: blankCampaignInput().checklist });
        setBaseline(
          JSON.stringify({
            ...input,
            checklist: blankCampaignInput().checklist,
          }),
        );
      }
    }
  }
  const steps = [
    t("Property & objective", "العقار والهدف"),
    t("Bilingual copy", "النص باللغتين"),
    t("Creative review", "مراجعة الوسائط"),
    t("Policy review", "مراجعة السياسة"),
    t("Budget & schedule", "الميزانية والجدول"),
    t("Approvals & simulation", "الموافقات والمحاكاة"),
  ];
  if(openingDraft)return <><Intro title={t("Opening the saved campaign draft", "جارٍ فتح مسودة الحملة المحفوظة")}/><WorkspaceLoading/></>;
  const disabled = dirty || stale || !c || !can(state.organization, role === "editor" ? "campaign.edit" : "campaign.approve");
  return (
    <>
      <Intro
        eyebrow={t(
          "CAMPAIGN STUDIO / GUIDED EDITOR",
          "استوديو الحملات / محرر موجّه",
        )}
        title={
          c
            ? t(
                "Review every version. Keep every decision.",
                "راجع كل نسخة واحفظ كل قرار.",
              )
            : t(
                "Start with the canonical property.",
                "ابدأ من سجل العقار الأساسي.",
              )
        }
        description={t(
          "Save a draft, prepare grounded suggestions and review the exact creative and budget before local approval.",
          "احفظ مسودة وجهّز مقترحات مستندة إلى الحقائق وراجع الوسائط والميزانية قبل الموافقة المحلية.",
        )}
        action={
          <Link
            className="px-button px-button-outline"
            href="/workspace/campaigns"
          >
            {copyText(t("Campaign portfolio", "محفظة الحملات"))}
          </Link>
        }
      />
      <CampaignNavigation />
      <div className="cm-record-bar">
        <div>
          <Pill tone={c?.status === "simulated" ? "info" : "warning"}>
            {copyText(c
              ? campaignStatusLabel(c.status, ar)
              : t("Unsaved draft", "مسودة غير محفوظة"))}
          </Pill>
          <span>
            {copyText(c
              ? `${c.id} · r${c.revision}`
              : t(
                  "A stable ID is assigned on save",
                  "يُمنح معرّف ثابت عند الحفظ",
                ))}
          </span>
        </div>
        <label className="px-field">
          {copyText(t("Local demo role", "دور تجريبي محلي"))}
          <select
            value={role}
            onChange={(e) => setRole(e.target.value as CampaignRole)}
          >
            {campaignRoles.map((r) => (
              <option key={r} value={r}>
                {
                  copyText({
                    editor: t("Editor", "محرر"),
                    "policy-reviewer": t("Policy reviewer", "مراجع السياسة"),
                    advertiser: t("Advertiser", "المعلن"),
                    admin: t("MaxPro administrator", "مسؤول ماكس برو"),
                  }[r])
                }
              </option>
            ))}
          </select>
        </label>
      </div>
      <p className="cm-role-note">
        {copyText(t(
          "Role selection demonstrates command guards; there is no real account authentication.",
          "اختيار الدور يوضح ضوابط الأوامر؛ لا مصادقة لحساب حقيقي.",
        ))}
      </p>
      {stale && (
        <div role="alert" className="cm-alert">
          {copyText(t(
            "This draft changed in another view. Reload to review the current version before saving or approving.",
            "تغيرت هذه المسودة في عرض آخر. أعد التحميل لمراجعة النسخة الحالية قبل الحفظ أو الاعتماد.",
          ))}{copyText(" ")}
          <button
            className="px-text-button"
            onClick={() => window.location.reload()}
          >
            {copyText(t("Reload current version", "إعادة تحميل النسخة الحالية"))}
          </button>
        </div>
      )}
      <nav
        className="cm-steps"
        aria-label={copyText(t("Campaign stages", "مراحل الحملة"))}
      >
        {steps.map((s, i) => (
          <button
            key={s}
            type="button"
            onClick={() => setStep(i)}
            aria-current={step === i ? "step" : undefined}
          >
            <span>{copyText(String(i + 1).padStart(2, "0"))}</span>
            {copyText(s)}
          </button>
        ))}
      </nav>
      <div className="cm-editor-grid">
        <div className="cm-editor-main">
          <div className="cm-stage-heading">
            <span className="px-overline">
              {copyText(t("STAGE", "المرحلة"))} <bdi dir="ltr">{step + 1} / 6</bdi>
            </span>
            <h2>{copyText(steps[step])}</h2>
          </div>
          <fieldset
            className="cm-editor-fields"
            disabled={!active || role !== "editor" || !can(state.organization,"campaign.edit")}
          >
            {step === 0 && (
              <>
                <label className="px-field">
                  {copyText(t("Canonical property", "العقار الأساسي"))}
                  <select
                    disabled={!!c}
                    value={input.propertyId}
                    onChange={(e) =>
                      setInput({
                        ...input,
                        propertyId: e.target.value,
                        assetIds: [],
                        headlineEn: "",
                        headlineAr: "",
                        copyEn: "",
                        copyAr: "",
                        checklist: blankCampaignInput().checklist,
                      })
                    }
                  >
                    <option value="">
                      {copyText(t("Choose an existing property", "اختر عقاراً موجوداً"))}
                    </option>
                    {Object.values(state.properties).map((p) => (
                      <option key={p.id} value={p.id}>
                        {copyText(p.id)} ·{copyText(" ")}
                        {copyText(p.facts[ar ? "titleAr" : "titleEn"] ||
                          t("Untitled draft", "مسودة بلا عنوان"))}
                      </option>
                    ))}
                  </select>
                </label>
                <div className="px-field-grid">
                  <label className="px-field">
                    {copyText(t("Campaign objective", "هدف الحملة"))}
                    <select
                      value={input.objective}
                      onChange={(e) =>
                        field(
                          "objective",
                          e.target.value as CampaignInput["objective"],
                        )
                      }
                    >
                      {objectives.map((v) => (
                        <option key={v} value={v}>
                          {copyText(objectiveLabel(v, ar))}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className="px-field">
                    {copyText(t("Proposed platform", "المنصة المقترحة"))}
                    <select
                      value={input.channel}
                      onChange={(e) =>
                        field(
                          "channel",
                          e.target.value as CampaignInput["channel"],
                        )
                      }
                    >
                      <option value="meta-catalog">{copyText("Meta")}</option>
                      <option value="google-ads">
                        {copyText(" Google Ads / PMax (")}{copyText(t("planning only", "تخطيط فقط"))})
                      </option>
                    </select>
                  </label>
                  <label className="px-field">
                    {copyText(t("Conversion goal", "هدف التحويل"))}
                    <select
                      value={input.conversionGoal}
                      onChange={(e) =>
                        field(
                          "conversionGoal",
                          e.target.value as CampaignInput["conversionGoal"],
                        )
                      }
                    >
                      {conversionGoals.map((g) => (
                        <option key={g} value={g}>
                          {
                            copyText({
                              enquiry: t("Enquiry", "استفسار"),
                              "qualified-lead": t(
                                "Qualified lead",
                                "عميل مؤهل",
                              ),
                              "viewing-request": t(
                                "Viewing request",
                                "طلب معاينة",
                              ),
                            }[g])
                          }
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className="px-field">
                    {copyText(t("Proposed targeting", "الاستهداف المقترح"))}
                    <select
                      value={input.targeting}
                      onChange={(e) =>
                        field(
                          "targeting",
                          e.target.value as CampaignInput["targeting"],
                        )
                      }
                    >
                      <option value="broad-housing">
                        {copyText(t("Broad housing review", "مراجعة إسكان عامة"))}
                      </option>
                      <option value="age-exclusion">
                        {copyText(t(
                          "Age exclusion — unsupported",
                          "استبعاد عمري — غير مدعوم",
                        ))}
                      </option>
                      <option value="sensitive-interests">
                        {copyText(t(
                          "Sensitive interests — unsupported",
                          "اهتمامات حساسة — غير مدعومة",
                        ))}
                      </option>
                    </select>
                  </label>
                </div>
                <Notice kind="warning">
                  {copyText(t(
                    "Account, country, housing category and campaign-type eligibility require provider/legal review. A generic property feed or PMax listing campaign is not assumed available.",
                    "أهلية الحساب والدولة وفئة الإسكان ونوع الحملة تحتاج مراجعة المنصة والقانون. لا نفترض توفر تغذية عقارات عامة أو حملة PMax للعقارات.",
                  ))}
                </Notice>
              </>
            )}
            {step === 1 && (
              <>
                <div className="px-copy-grid">
                  <div>
                    <label className="px-field">
                      {copyText(t("English headline", "العنوان بالإنجليزية"))}
                      <input
                        lang="en"
                        dir="ltr"
                        maxLength={4000}
                        value={input.headlineEn}
                        onChange={(e) => field("headlineEn", e.target.value)}
                      />
                    </label>
                    <label className="px-field">
                      {copyText(t(
                        "English advertisement copy",
                        "النص الإعلاني بالإنجليزية",
                      ))}
                      <textarea
                        lang="en"
                        dir="ltr"
                        rows={7}
                        maxLength={4000}
                        value={input.copyEn}
                        onChange={(e) => field("copyEn", e.target.value)}
                      />
                    </label>
                  </div>
                  <div>
                    <label className="px-field">
                      {copyText(t("Arabic headline", "العنوان بالعربية"))}
                      <input
                        lang="ar"
                        dir="rtl"
                        maxLength={4000}
                        value={input.headlineAr}
                        onChange={(e) => field("headlineAr", e.target.value)}
                      />
                    </label>
                    <label className="px-field">
                      {copyText(t("Arabic advertisement copy", "النص الإعلاني بالعربية"))}
                      <textarea
                        lang="ar"
                        dir="rtl"
                        rows={7}
                        maxLength={4000}
                        value={input.copyAr}
                        onChange={(e) => field("copyAr", e.target.value)}
                      />
                    </label>
                  </div>
                </div>
                <Notice>
                  {copyText(t(
                    "Draft copy is editable and stays separate from canonical facts. A human must review factual accuracy and Arabic quality.",
                    "النص المقترح قابل للتعديل ويبقى منفصلاً عن الحقائق الأساسية. يجب على إنسان مراجعة الدقة وجودة العربية.",
                  ))}
                </Notice>
              </>
            )}
            {step === 2 && (
              <>
                <p className="px-muted-copy">
                  {copyText(t(
                    "Choose images from this property’s canonical media metadata. These are fictional sample visuals; no upload or enhancement runs.",
                    "اختر صوراً من بيانات وسائط هذا العقار الأساسي. هذه صور نموذجية خيالية؛ لا رفع أو تحسين للصور.",
                  ))}
                </p>
                <div className="cm-creative-gallery">
                  {p?.media.length ? (
                    p.media.map((a) => {
                      const sample = sampleMedia.find(
                        (s) => s.key === a.sampleKey,
                      );
                      const available =
                        a.kind === "image" &&
                        a.availability === "sample" &&
                        !!sample?.url;
                      return (
                        <label
                          className={`cm-creative ${input.assetIds.includes(a.id) ? "selected" : ""}`}
                          key={a.id}
                        >
                          {available ? (
                            <div
                              role="img"
                              aria-label={copyText(a.name)}
                              className="cm-creative-image"
                              style={{
                                backgroundImage: `url('${sample!.url}')`,
                              }}
                            />
                          ) : (
                            <div className="cm-creative-metadata">
                              <FileText size={24} />
                              {copyText(t("Metadata only", "بيانات وصفية فقط"))}
                            </div>
                          )}
                          <span>
                            <input
                              type="checkbox"
                              checked={input.assetIds.includes(a.id)}
                              disabled={!available}
                              onChange={(e) =>
                                field(
                                  "assetIds",
                                  e.target.checked
                                    ? [...input.assetIds, a.id]
                                    : input.assetIds.filter(
                                        (id) => id !== a.id,
                                      ),
                                )
                              }
                            />
                            <strong>{copyText(a.name)}</strong>
                          </span>
                          <small>
                            {copyText(a.room)} ·{copyText(" ")}
                            {copyText(available
                              ? t("Sample available", "نموذج متاح")
                              : t(
                                  "Unavailable for simulation",
                                  "غير متاح للمحاكاة",
                                ))}
                          </small>
                        </label>
                      );
                    })
                  ) : (
                    <Empty
                      title={t("No canonical media", "لا وسائط أساسية")}
                      description={t(
                        "Add sample media in the property media workbench.",
                        "أضف وسائط نموذجية في مساحة وسائط العقار.",
                      )}
                    />
                  )}
                </div>
                {p && (
                  <Link
                    className="px-text-link"
                    href={`/workspace/inventory/${p.id}/media`}
                  >
                    {copyText(t("Edit canonical media", "تعديل وسائط العقار الأساسية"))}{copyText(" ")}
                    <ArrowRight size={15} />
                  </Link>
                )}
              </>
            )}
            {step === 3 && (
              <>
                <Notice kind="warning">
                  {copyText(t(
                    "Internal demonstration checklist, not definitive Meta/Google policy or legal approval. Actual provider/legal review remains pending even after local review.",
                    "قائمة تحقق تجريبية داخلية، وليست سياسة نهائية لميتا أو جوجل أو موافقة قانونية. المراجعة الفعلية للمنصة والقانون ما زالت معلقة.",
                  ))}
                </Notice>
                <div className="cm-checklist">
                  {(
                    [
                      [
                        "housing",
                        t(
                          "Housing category reviewed for this local example",
                          "تمت مراجعة فئة الإسكان لهذا المثال المحلي",
                        ),
                      ],
                      [
                        "factual",
                        t(
                          "Both languages compared with canonical facts",
                          "تمت مقارنة اللغتين بالحقائق الأساسية",
                        ),
                      ],
                      [
                        "rights",
                        t(
                          "Creative labels, property consistency and sample rights reviewed",
                          "تمت مراجعة تصنيف الوسائط واتساق العقار وحقوق النموذج",
                        ),
                      ],
                      [
                        "providerLimitations",
                        t(
                          "Pending legal/provider requirements and unsupported targeting acknowledged",
                          "تم الإقرار بمتطلبات المنصة والقانون المعلقة والاستهداف غير المدعوم",
                        ),
                      ],
                    ] as const
                  ).map(([key, label]) => (
                    <label className="gm-check-line" key={key}>
                      <input
                        type="checkbox"
                        checked={input.checklist[key]}
                        onChange={(e) =>
                          field("checklist", {
                            ...input.checklist,
                            [key]: e.target.checked,
                          })
                        }
                      />
                      {copyText(label)}
                    </label>
                  ))}
                </div>
                <label className="gm-check-line">
                  <input
                    type="checkbox"
                    checked={input.adminRequired}
                    onChange={(e) => field("adminRequired", e.target.checked)}
                  />
                  {copyText(t(
                    "Require a separate MaxPro administrator approval",
                    "اشتراط موافقة منفصلة من مسؤول ماكس برو",
                  ))}
                </label>
              </>
            )}
            {step === 4 && (
              <>
                <div className="px-field-grid">
                  <label className="px-field">
                    {copyText(t("Media budget QAR", "ميزانية الوسائط ر.ق"))}
                    <input
                      type="number"
                      min="0"
                      max="10000000"
                      step="0.01"
                      value={input.mediaBudget}
                      onChange={(e) =>
                        field("mediaBudget", Number(e.target.value))
                      }
                    />
                  </label>
                  <label className="px-field">
                    {copyText(t(
                      "Illustrative service fee QAR",
                      "رسوم الخدمة التوضيحية ر.ق",
                    ))}
                    <input
                      type="number"
                      min="0"
                      max="10000000"
                      step="0.01"
                      value={input.serviceFee}
                      onChange={(e) =>
                        field("serviceFee", Number(e.target.value))
                      }
                    />
                  </label>
                  <label className="px-field">
                    {copyText(t("Start date", "تاريخ البداية"))}
                    <input
                      type="date"
                      value={input.startDate}
                      onChange={(e) => field("startDate", e.target.value)}
                    />
                  </label>
                  <label className="px-field">
                    {copyText(t("End date", "تاريخ النهاية"))}
                    <input
                      type="date"
                      value={input.endDate}
                      onChange={(e) => field("endDate", e.target.value)}
                    />
                  </label>
                </div>
                <div className="cm-budget-ledger">
                  <div>
                    <span>
                      {copyText(t("Proposed media budget", "ميزانية الوسائط المقترحة"))}
                    </span>
                    <b>{copyText(money(input.mediaBudget))}</b>
                  </div>
                  <div>
                    <span>
                      {copyText(t(
                        "Separately disclosed service fee",
                        "رسوم الخدمة المعلنة منفصلة",
                      ))}
                    </span>
                    <b>{copyText(money(input.serviceFee))}</b>
                  </div>
                  <div>
                    <strong>{copyText(t("Proposed total", "الإجمالي المقترح"))}</strong>
                    <strong>
                      {copyText(money(input.mediaBudget + input.serviceFee))}
                    </strong>
                  </div>
                  <div>
                    <span>
                      {copyText(t(
                        "Approved media budget (current revision)",
                        "ميزانية الوسائط المعتمدة (النسخة الحالية)",
                      ))}
                    </span>
                    <b>
                      {copyText(c?.approvedBudget === null || !c
                        ? "—"
                        : money(c.approvedBudget))}
                    </b>
                  </div>
                </div>
                <Notice>
                  {copyText(t(
                    `Illustrative ${state.plan} local total cap: QAR ${campaignBudgetCaps[state.plan]}. This is a prototype guard, not an approved commercial entitlement. Nothing is charged.`,
                    `الحد المحلي التوضيحي لخطة ${state.plan}: ${campaignBudgetCaps[state.plan]} ر.ق. ضابط تجريبي وليس استحقاقاً تجارياً معتمداً. لا تُحصّل أي رسوم.`,
                  ))}
                </Notice>
              </>
            )}
          </fieldset>
          {step === 3 && <PolicyReadout blockers={blockers} />}
          {step === 5 && (
            <>
              <PolicyReadout blockers={blockers} />
              <div className="cm-approval-chain">
                {[
                  {
                    label: t("Policy reviewer", "مراجع السياسة"),
                    r: c?.policy,
                  },
                  {
                    label: t("Advertiser / budget", "المعلن / الميزانية"),
                    r: c?.advertiser,
                  },
                  {
                    label: t("MaxPro administrator", "مسؤول ماكس برو"),
                    r: c?.admin,
                  },
                ].map((v, i) => (
                  <div key={v.label}>
                    <span className="cm-chain-number">{i + 1}</span>
                    <div>
                      <strong>{copyText(v.label)}</strong>
                      <small>
                        {copyText(v.r
                          ? `r${v.r.revision} · ${v.r.at}`
                          : i === 2 && !input.adminRequired
                            ? t(
                                "Not configured for this draft",
                                "غير مشترط لهذه المسودة",
                              )
                            : t("Pending local action", "بانتظار إجراء محلي"))}
                      </small>
                    </div>
                    {v.r ? <Check size={18} /> : <span>—</span>}
                  </div>
                ))}
              </div>
              <div className="cm-action-row">
                {c &&
                  (
                    {
                      draft: [
                        [
                          "submit-policy",
                          "editor",
                          t(
                            "Submit for policy review",
                            "إرسال لمراجعة السياسة",
                          ),
                        ],
                      ],
                      "pending-policy": [
                        [
                          "review-policy",
                          "policy-reviewer",
                          t("Record policy review", "تسجيل مراجعة السياسة"),
                        ],
                      ],
                      "policy-reviewed": [
                        [
                          "request-advertiser",
                          "editor",
                          t("Request advertiser approval", "طلب موافقة المعلن"),
                        ],
                      ],
                      "pending-advertiser": [
                        [
                          "approve-advertiser",
                          "advertiser",
                          t(
                            "Approve creative & budget locally",
                            "اعتماد الوسائط والميزانية محلياً",
                          ),
                        ],
                      ],
                      "pending-admin": [
                        [
                          "approve-admin",
                          "admin",
                          t("Record MaxPro approval", "تسجيل موافقة ماكس برو"),
                        ],
                      ],
                      "approved-local": [
                        [
                          "simulate",
                          "editor",
                          t(
                            "Simulate campaign locally",
                            "محاكاة الحملة محلياً",
                          ),
                        ],
                      ],
                      simulated: [],
                      cancelled: [],
                      rejected: [],
                    } as Record<
                      CampaignStatus,
                      [
                        Extract<
                          CampaignCommand,
                          { type: "transition" }
                        >["action"],
                        CampaignRole,
                        string,
                      ][]
                    >
                  )[c.status].map(([a, r, label]) => (
                    <button
                      key={a}
                      type="button"
                      className="px-button px-button-dark"
                      disabled={disabled || role !== r}
                      onClick={() => transition(a)}
                    >
                      {copyText(label)}
                      <ArrowRight size={16} />
                    </button>
                  ))}
              </div>
              {c && (
                <p className="cm-role-note">
                  {copyText(t(
                    "Use the local role selector above for each separate review. Save all changes before requesting approval.",
                    "استخدم محدد الدور المحلي أعلاه لكل مراجعة منفصلة. احفظ كل التغييرات قبل طلب الموافقة.",
                  ))}
                </p>
              )}
              {c?.status === "simulated" && (
                <section className="cm-simulation">
                  <h3>
                    {copyText(t("Local simulation ledger", "سجل المحاكاة المحلية"))}
                  </h3>
                  <p>
                    {copyText(t(
                      "No campaign was sent externally. Google examples use Website first-touch with a Google campaign reference; no Google intake adapter exists.",
                      "لم تُرسل حملة خارجياً. تستخدم أمثلة جوجل مصدر الموقع الأول مع مرجع حملة جوجل؛ لا يوجد موصل استقبال لجوجل.",
                    ))}
                  </p>
                  <label className="px-field">
                    {copyText(t("Fictional source event ID", "معرّف الحدث الخيالي"))}
                    <input
                      value={eventId}
                      maxLength={95}
                      onChange={(e) => setEventId(e.target.value)}
                    />
                  </label>
                  <label className="gm-check-line">
                    <input
                      type="checkbox"
                      checked={consent}
                      onChange={(e) => setConsent(e.target.checked)}
                    />
                    {copyText(t(
                      "Consent for this fictional enquiry and event preview",
                      "موافقة لهذا الاستفسار الخيالي ومعاينة الحدث",
                    ))}
                  </label>
                  <div className="cm-action-row">
                    <button
                      type="button"
                      disabled={role !== "editor" || disabled || !consent}
                      className="px-button px-button-dark"
                      onClick={() => {
                        const r = run({
                          type: "lead",
                          id: c.id,
                          revision,
                          organizationId: activeOrganizationId(state.organization),
                          role,
                          eventId,
                          consent,
                        });
                        if (r.leadId) setLeadId(r.leadId);
                      }}
                    >
                      {copyText(t(
                        "Record / replay fictional enquiry",
                        "تسجيل / إعادة الاستفسار الخيالي",
                      ))}
                    </button>
                    <button
                      type="button"
                      className="px-button px-button-outline"
                      onClick={() =>
                        setEventId(`DEMO-EVENT-${crypto.randomUUID()}`)
                      }
                    >
                      {copyText(t("New event ID", "معرّف حدث جديد"))}
                    </button>
                    {leadId && (
                      <Link href={`/workspace/leads/${leadId}`}>
                        {copyText(t("Inspect canonical lead", "فحص سجل العميل الأساسي"))}
                      </Link>
                    )}
                  </div>
                  {consent && (
                    <details>
                      <summary>
                        {copyText(t(
                          "Consent-aware event preview",
                          "معاينة حدث تراعي الموافقة",
                        ))}
                      </summary>
                      <pre className="gm-code">
                        {JSON.stringify(
                          {
                            internal_example: true,
                            campaign_reference: c.id,
                            property_id: c.input.propertyId,
                            client_event_id: eventId,
                            server_event_id: eventId,
                            consent: "fictional-only",
                            remote_sent: false,
                          },
                          null,
                          2,
                        )}
                      </pre>
                    </details>
                  )}
                  <form
                    className="cm-cost-form"
                    onSubmit={(e) => {
                      e.preventDefault();
                      run({
                        type: "spend",
                        id: c.id,
                        revision,
                        organizationId: activeOrganizationId(state.organization),
                        role,
                        date: costDate,
                        qar: cost.trim() ? Number(cost) : NaN,
                      });
                    }}
                  >
                    <label className="px-field">
                      {copyText(t("Fictional cost date", "تاريخ التكلفة الخيالية"))}
                      <input
                        type="date"
                        value={costDate}
                        onChange={(e) => setCostDate(e.target.value)}
                      />
                    </label>
                    <label className="px-field">
                      {copyText(t(
                        "Fictional media cost QAR",
                        "تكلفة الوسائط الخيالية ر.ق",
                      ))}
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={cost}
                        onChange={(e) => setCost(e.target.value)}
                      />
                    </label>
                    <button
                      className="px-button px-button-outline"
                      disabled={role !== "editor" || disabled}
                    >
                      {copyText(t("Record fictional cost", "تسجيل تكلفة خيالية"))}
                    </button>
                  </form>
                  <Link
                    className="px-text-link"
                    href={`/workspace/ads/attribution?campaign=${c.id}`}
                  >
                    {copyText(t(
                      "Campaign analytics & linked leads",
                      "تحليلات الحملة والعملاء المرتبطون",
                    ))}{copyText(" ")}
                    <ArrowRight size={15} />
                  </Link>
                </section>
              )}
            </>
          )}
          {feedback.error && (
            <p role="alert" className="cm-alert">
              {copyText(feedback.error)}
            </p>
          )}
          {feedback.message && (
            <p role="status" className="gm-success">
              {copyText(feedback.message)}
            </p>
          )}
          <div className="cm-editor-actions">
            <button
              type="button"
              className="px-button px-button-outline"
              disabled={!active || role !== "editor" || stale || !can(state.organization,"campaign.edit")}
              onClick={() => save()}
            >
              {copyText(c
                ? t("Save draft", "حفظ المسودة")
                : t("Create campaign draft", "إنشاء مسودة حملة"))}
            </button>
            {step < 5 && (
              <button
                type="button"
                className="px-button px-button-dark"
                disabled={!active || role !== "editor" || stale || !can(state.organization,"campaign.edit")}
                onClick={() => save(step + 1)}
              >
                {copyText(t("Save & continue", "حفظ ومتابعة"))} <ArrowRight size={16} />
              </button>
            )}
            <span>
              {copyText(dirty
                ? t("Unsaved changes", "تغييرات غير محفوظة")
                : t("Saved locally", "محفوظ محلياً"))}
            </span>
          </div>
          {c && (
            <div className="cm-action-row cm-secondary-actions">
              <button
                type="button"
                className="px-mini-action"
                disabled={disabled || role !== "editor"}
                onClick={() => transition("duplicate")}
              >
                <Copy size={14} />
                {copyText(t("Duplicate", "نسخ"))}
              </button>
              {active ? (
                <button
                  type="button"
                  className="px-mini-action"
                  disabled={disabled || role !== "editor"}
                  onClick={() => transition("cancel")}
                >
                  {copyText(t("Cancel campaign", "إلغاء الحملة"))}
                </button>
              ) : (
                <button
                  type="button"
                  className="px-mini-action"
                  disabled={disabled || role !== "editor"}
                  onClick={() => transition("resume")}
                >
                  {copyText(t("Resume as new revision", "متابعة كنسخة جديدة"))}
                </button>
              )}
              {["pending-policy", "pending-admin"].includes(c.status) && (
                <button
                  type="button"
                  className="px-mini-action"
                  disabled={
                    disabled ||
                    (c.status === "pending-policy"
                      ? role !== "policy-reviewer"
                      : role !== "admin")
                  }
                  onClick={() => transition("reject")}
                >
                  {copyText(t("Reject local review", "رفض المراجعة المحلية"))}
                </button>
              )}
            </div>
          )}
        </div>
        <aside className="cm-inspector">
          <div className="cm-fact-dossier">
            <span className="px-overline">
              {copyText(t("CANONICAL SOURCE", "المصدر الأساسي"))}
            </span>
            <h3>
              {copyText(p?.facts[ar ? "titleAr" : "titleEn"] ||
                t("Select a property", "اختر عقاراً"))}
            </h3>
            {p && (
              <>
                <p>
                  {copyText(p.id)} · r{p.revision}
                </p>
                <dl>
                  <div>
                    <dt>{copyText(t("Price", "السعر"))}</dt>
                    <dd>
                      {copyText(money(p.facts.priceQar))}
                      {copyText(p.facts.purpose === "rent"
                        ? ` / ${p.facts.rentalFrequency}`
                        : "")}
                    </dd>
                  </div>
                  <div>
                    <dt>{copyText(t("Area / bedrooms", "المساحة / غرف النوم"))}</dt>
                    <dd>
                      <bdi dir="ltr">
                        {p.facts.areaSqm} m² / {p.facts.beds}
                      </bdi>
                    </dd>
                  </div>
                  <div>
                    <dt>{copyText(t("Location", "الموقع"))}</dt>
                    <dd>
                      {copyText(p.facts.district)}, {copyText(p.facts.city)}
                    </dd>
                  </div>
                  <div>
                    <dt>{copyText(t("Factual review", "مراجعة الحقائق"))}</dt>
                    <dd>
                      {copyText(p.source.factsReviewed
                        ? t("Reviewed sample", "نموذج تمت مراجعته")
                        : t("Required", "مطلوبة"))}
                    </dd>
                  </div>
                </dl>
                <Link href={`/workspace/inventory/${p.id}/edit`}>
                  {copyText(t("Open canonical editor", "فتح المحرر الأساسي"))}{copyText(" ")}
                  <ArrowRight size={14} />
                </Link>
              </>
            )}
          </div>
          <div className="cm-ai-panel">
            <span className="px-overline">
              {copyText(t("MARKETING AI / LOCAL EXAMPLES", "ذكاء التسويق / أمثلة محلية"))}
            </span>
            <h3>{copyText(t("Suggestions with a source.", "مقترحات موثّقة المصدر."))}</h3>
            <p>
              {copyText(t(
                "Deterministic simulated suggestions. No LLM response, prediction or external model. Save the current draft first.",
                "مقترحات محاكاة حتمية. لا استجابة نموذج لغوي أو توقع أو اتصال خارجي. احفظ المسودة أولاً.",
              ))}
            </p>
            <label className="px-field">
              {copyText(t("Suggestion type", "نوع المقترح"))}
              <select
                value={kind}
                onChange={(e) => setKind(e.target.value as SuggestionKind)}
              >
                {(
                  [
                    "copy",
                    "headline",
                    "features",
                    "objective",
                    "creative",
                    "budget",
                    "summary",
                  ] as const
                ).map((k) => (
                  <option key={k} value={k}>
                    {
                      copyText({
                        copy: t("Bilingual copy", "نص باللغتين"),
                        headline: t("Headline alternative", "عنوان بديل"),
                        features: t("Feature highlighting", "إبراز الخصائص"),
                        objective: t("Objective recommendation", "توصية الهدف"),
                        creative: t("Creative selection", "اختيار الوسائط"),
                        budget: t("Budget scenarios", "سيناريوهات الميزانية"),
                        summary: t("Weekly local summary", "ملخص محلي أسبوعي"),
                      }[k])
                    }
                  </option>
                ))}
              </select>
            </label>
            <button
              type="button"
              className="px-button px-button-outline"
              disabled={disabled || role !== "editor" || !active}
              onClick={() =>
                c &&
                run({
                  type: "suggest",
                  id: c.id,
                  revision,
                  organizationId: activeOrganizationId(state.organization),
                  role,
                  kind,
                })
              }
            >
              {copyText(t("Prepare simulated suggestion", "إعداد مقترح محاكى"))}
            </button>
            {c?.proposals
              .slice()
              .reverse()
              .map((s) => (
                <ProposalReview
                  key={s.id}
                  proposal={s}
                  disabled={
                    disabled ||
                    role !== "editor" ||
                    !active ||
                    s.status !== "proposed" ||
                    s.campaignRevision !== c.revision
                  }
                  onReview={(accept, en, ara) => {
                    const r = run({
                      type: "review-proposal",
                      id: c.id,
                      revision,
                      organizationId: activeOrganizationId(state.organization),
                      role,
                      proposalId: s.id,
                      accept,
                      en,
                      ar: ara,
                    });
                    if (!r.error && accept) {
                      if (r.campaign) {
                        setInput(structuredClone(r.campaign.input));
                        setBaseline(JSON.stringify(r.campaign.input));
                        setRevision(r.campaign.revision);
                      }
                    }
                  }}
                />
              ))}
          </div>
        </aside>
      </div>
      {c && (
        <Section
          className="cm-history"
          title={t("Versioned activity history", "سجل النشاط بالإصدارات")}
          subtitle={t(
            "Local review actions only. Historical approvals do not authorize a changed version.",
            "إجراءات مراجعة محلية فقط. الموافقات السابقة لا تجيز نسخة معدلة.",
          )}
        >
          <ol className="cm-timeline">
            {c.history
              .slice()
              .reverse()
              .map((e) => (
                <li key={e.id}>
                  <span className="cm-timeline-dot" />
                  <div>
                    <strong>{copyText(e.action)}</strong>
                    <small>
                      r{e.revision} · {copyText(e.role)} ·{copyText(" ")}
                      <time dateTime={e.at}>
                        {copyText(new Date(e.at).toLocaleString(ar ? "ar" : "en", {
                          timeZone: "Asia/Qatar",
                        }))}{copyText(" ")}
                        +03
                      </time>
                    </small>
                  </div>
                </li>
              ))}
          </ol>
        </Section>
      )}
      <CampaignDisclosure />
    </>
  );
}
function PolicyReadout({ blockers }: { blockers: string[] }) {const copyText=usePrototypeCopy();
  const t = useCopy();
  return (
    <div className="cm-policy-readout">
      <h3>
        {copyText(t("Local validation / actionable blockers", "التحقق المحلي / العوائق"))}
      </h3>
      {blockers.length ? (
        <ul>
          {blockers.map((b) => (
            <li key={b}>{copyText(b)}</li>
          ))}
        </ul>
      ) : (
        <p className="cm-check-ok">
          <Check size={18} />
          {copyText(t(
            "Internal checks ready for local review. Provider/legal eligibility still unverified.",
            "الفحوصات الداخلية جاهزة للمراجعة المحلية. أهلية المنصة والقانون لم تتحقق.",
          ))}
        </p>
      )}
    </div>
  );
}
function ProposalReview({
  proposal: s,
  disabled,
  onReview,
}: {
  proposal: MarketingProposal;
  disabled: boolean;
  onReview: (accept: boolean, en: string, ar: string) => void;
}) {const copyText=usePrototypeCopy();
  const t = useCopy();
  const [en, setEn] = useState(s.en);
  const [ar, setAr] = useState(s.ar);
  return (
    <article className="cm-proposal">
      <details open={s.status === "proposed" && !disabled}>
        <summary>
          <Pill tone="info">
            {copyText(t("Simulated suggestion", "مقترح محاكى"))} · {copyText(s.kind)}
          </Pill>
          <small>
            r{s.campaignRevision} · {copyText(s.status)}
          </small>
        </summary>
        <label className="px-field">
          {copyText(t("Editable English proposal", "مقترح إنجليزي قابل للتعديل"))}
          <textarea
            rows={4}
            lang="en"
            dir="ltr"
            value={en}
            disabled={disabled}
            onChange={(e) => setEn(e.target.value)}
          />
        </label>
        <label className="px-field">
          {copyText(t("Editable Arabic proposal", "مقترح عربي قابل للتعديل"))}
          <textarea
            rows={4}
            lang="ar"
            dir="rtl"
            value={ar}
            disabled={disabled}
            onChange={(e) => setAr(e.target.value)}
          />
        </label>
        <details className="cm-proposal-sources">
          <summary>
            {copyText(t("Source / fact references", "مراجع المصدر / الحقائق"))}
          </summary>
          <ul>
            {s.references.map((r) => (
              <li key={r}>
                <code>{r}</code>
              </li>
            ))}
          </ul>
        </details>
        <div className="cm-action-row">
          <button
            type="button"
            className="px-mini-action"
            disabled={disabled}
            onClick={() => onReview(true, en, ar)}
          >
            {copyText(t("Accept proposal", "قبول المقترح"))}
          </button>
          <button
            type="button"
            className="px-mini-action"
            disabled={disabled}
            onClick={() => onReview(false, en, ar)}
          >
            {copyText(t("Reject proposal", "رفض المقترح"))}
          </button>
        </div>
      </details>
    </article>
  );
}
