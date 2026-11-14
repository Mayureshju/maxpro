"use client";
import {campaignStatusLabel} from '@/lib/campaign-presentation';
import {NativeSelect} from '@/components/ui/field';
import {usePrototypeCopy} from '@/components/prototype/use-prototype-copy';
import { useState } from "react";
import { useLocale } from "next-intl";
import { useSearchParams } from "next/navigation";
import { Link } from "@/i18n/navigation";
import { ArrowRight } from "lucide-react";
import {
  Intro,
  Section,
  Notice,
  Pill,
  Empty,
} from "@/components/prototype/primitives";
import { useGeminiDemo } from "./demo-provider";
import { findProperty } from "@/lib/canonical-property";
import { getConnector } from "@/lib/gemini-product";
import { leadMetrics, leadStages, type CanonicalLead } from "@/lib/lead-crm";
import {
  campaignBlockers,
  campaignMetrics,
  campaignSource,
  type Campaign,
} from "@/lib/campaign-engine";
import {
  CampaignNavigation,
  CampaignDisclosure,
} from "./campaign-studio";
const useCopy = () => {
  const ar = useLocale() === "ar";
  return (en: string, arabic: string) => (ar ? arabic : en);
};
const qar = (n: number | null) =>
  n === null
    ? "—"
    : `QAR ${n.toLocaleString("en", { maximumFractionDigits: 2 })}`;
export function MarketingProvider({
  kind,
}: {
  kind: "meta-catalog" | "google-ads";
}) {const copyText=usePrototypeCopy();
  const t = useCopy();
  const ar = useLocale() === "ar";
  const { state, hydrated } = useGeminiDemo();
  const [selected, setSelected] = useState("");
  const [consent, setConsent] = useState(false);
  const [preview, setPreview] = useState(false);
  const p = selected
    ? findProperty(state.properties, selected)
    : Object.values(state.properties)[0];
  const definition = getConnector(kind);
  const campaigns = state.campaigns.filter(
    (c) => c.input.channel === kind && (!p || c.input.propertyId === p.id),
  );
  const mapping = p
    ? [
        [t("Internal reference", "المرجع الداخلي"), "property.id", p.id, true],
        [
          t("English title", "العنوان الإنجليزي"),
          "facts.titleEn",
          p.facts.titleEn,
          !!p.facts.titleEn.trim(),
        ],
        [
          t("Arabic title", "العنوان العربي"),
          "facts.titleAr",
          p.facts.titleAr,
          !!p.facts.titleAr.trim(),
        ],
        [t("Purpose", "الغرض"), "facts.purpose", p.facts.purpose, true],
        [
          t("Asking price", "السعر المطلوب"),
          "facts.priceQar",
          qar(p.facts.priceQar),
          p.facts.priceQar > 0,
        ],
        [
          t("Area m²", "المساحة م²"),
          "facts.areaSqm",
          p.facts.areaSqm,
          p.facts.areaSqm > 0,
        ],
        [
          t("Location", "الموقع"),
          "facts.district / city",
          `${p.facts.district}, ${p.facts.city}`,
          !!p.facts.district && !!p.facts.city,
        ],
        [
          t("Sample license", "ترخيص نموذجي"),
          "facts.permit",
          p.facts.permit || "—",
          !!p.facts.permit && p.facts.ownerApproved,
        ],
        [
          t("Available images", "الصور المتاحة"),
          "media[].id",
          p.media
            .filter((a) => a.kind === "image" && a.availability === "sample")
            .map((a) => a.id)
            .join(", ") || "—",
          p.media.some(
            (a) => a.kind === "image" && a.availability === "sample",
          ),
        ],
        [
          t("Landing page", "صفحة العقار"),
          "property.id",
          `/${ar ? "ar" : "en"}/properties/${p.id}`,
          true,
        ],
        [
          t("Factual / language review", "مراجعة الحقائق / اللغة"),
          "source.factsReviewed / copyReviewed",
          p.source.factsReviewed && p.source.copyReviewed
            ? t("Reviewed sample", "نموذج مراجع")
            : t("Review required", "المراجعة مطلوبة"),
          p.source.factsReviewed && p.source.copyReviewed,
        ],
      ]
    : [];
  return (
    <>
      <Intro
        eyebrow={t("MARKETING / PROVIDER PLANNING", "التسويق / تخطيط المنصة")}
        title={
          kind === "meta-catalog"
            ? t(
                "A catalogue from the canonical record.",
                "كتالوج من السجل الأساسي.",
              )
            : t(
                "Google campaign planning, before authorization.",
                "تخطيط حملات جوجل قبل التصريح.",
              )
        }
        description={t(
          "Internal example mappings and local campaign plans. Provider account, region, housing and feed capabilities require independent approval.",
          "تعيينات داخلية نموذجية وخطط حملات محلية. الحساب والدولة والإسكان وإمكانات التغذية تحتاج موافقة مستقلة.",
        )}
        action={
          <Link
            className="px-button px-button-outline"
            href={`/workspace/hub/connectors/${kind}`}
          >
            {copyText(t("Provider setup", "إعداد المنصة"))} <ArrowRight size={16} />
          </Link>
        }
      />
      <CampaignNavigation />
      <div className="cm-provider-states">
        <Pill
          tone={state.preparedConnectors.includes(kind) ? "info" : "warning"}
        >
          {copyText(state.preparedConnectors.includes(kind)
            ? t("Configured locally", "تم الإعداد محلياً")
            : t("Local configuration needed", "الإعداد المحلي مطلوب"))}
        </Pill>
        <Pill tone="warning">
          {copyText(t("Awaiting authorization", "بانتظار التصريح"))}
        </Pill>
        <Pill tone="warning">
          {copyText(t("Policy review required", "مراجعة السياسة مطلوبة"))}
        </Pill>
        <Pill>
          {copyText(t("Actual integration unavailable", "الاتصال الفعلي غير متاح"))}
        </Pill>
      </div>
      {!hydrated ? (
        <p role="status">{copyText(t("Loading properties…", "جار تحميل العقارات…"))}</p>
      ) : (
        <Section
          title={
            kind === "meta-catalog"
              ? t("Canonical catalogue preview", "معاينة الكتالوج الأساسي")
              : t("Planning source & assets", "مصدر التخطيط والوسائط")
          }
          subtitle={t(
            "Internal marketing mapping v1. Not an official provider feed or proof of eligibility. No automatic feed refresh.",
            "تعيين تسويقي داخلي إصدار ١. ليس تغذية رسمية أو إثبات أهلية. لا تحديث تلقائي للتغذية.",
          )}
        >
          <label className="px-field">
            {copyText(t("Preview canonical property", "معاينة العقار الأساسي"))}
            <NativeSelect
              value={p?.id ?? ""}
              onChange={(e) => {
                setSelected(e.target.value);
                setPreview(false);
              }}
            >
              {Object.values(state.properties).map((p) => (
                <option key={p.id} value={p.id}>
                  {copyText(p.id)} · {copyText(p.facts[ar ? "titleAr" : "titleEn"])}
                </option>
              ))}
            </NativeSelect>
          </label>
          {p ? (
            <>
              <p className="cm-role-note">
                {copyText(p.id)} · r{p.revision} ·{copyText(" ")}
                {copyText(t(
                  "Facts are read directly, not a campaign snapshot.",
                  "تُقرأ الحقائق مباشرة وليست لقطة منفصلة للحملة.",
                ))}
              </p>
              <div className="px-table-scroll" tabIndex={0}>
                <table className="px-table cm-mapping">
                  <thead>
                    <tr>
                      {[
                        t("Example field", "الحقل النموذجي"),
                        t("Canonical source", "المصدر الأساسي"),
                        t("Current value", "القيمة الحالية"),
                        t("Local check", "الفحص المحلي"),
                      ].map((s) => (
                        <th key={s}>{copyText(s)}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {mapping.map(([label, path, value, ok]) => (
                      <tr key={`${String(path)}-${String(label)}`}>
                        <td>{label}</td>
                        <td>
                          <code>{path}</code>
                        </td>
                        <td>{value}</td>
                        <td>
                          <Pill tone={ok ? "info" : "warning"}>
                            {copyText(ok
                              ? t("Present in sample", "موجود في النموذج")
                              : t("Missing / review", "مفقود / مراجعة"))}
                          </Pill>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="cm-action-row">
                <Link
                  className="px-button px-button-dark"
                  href={`/workspace/campaigns/new?property=${p.id}&channel=${kind}`}
                >
                  {copyText(t(
                    "Plan a campaign for this property",
                    "تخطيط حملة لهذا العقار",
                  ))}{copyText(" ")}
                  <ArrowRight size={16} />
                </Link>
                <Link
                  className="px-text-link"
                  href={`/workspace/inventory/${p.id}/media`}
                >
                  {copyText(t("Review canonical media", "مراجعة وسائط العقار"))}
                </Link>
              </div>
            </>
          ) : (
            <Empty
              title={t("No canonical properties", "لا عقارات أساسية")}
              description={t(
                "Create a fictional property in Inventory first.",
                "أنشئ عقاراً خيالياً في المخزون أولاً.",
              )}
            />
          )}
        </Section>
      )}
      {kind === "google-ads" && (
        <Section
          title={t(
            "Objectives, conversion goals & budget",
            "الأهداف والتحويلات والميزانية",
          )}
          subtitle={t(
            "Prepare a property enquiry, awareness or conversation plan in Campaign Studio. Select available creative, a conversion goal and separately disclosed media budget and service fee. PMax/account/feed support is unverified.",
            "جهّز خطة استفسارات أو تعريف أو محادثات في استوديو الحملات. اختر وسائط متاحة وهدف تحويل وميزانية وسائط ورسوم خدمة منفصلة. دعم PMax والحساب والتغذية غير متحقق.",
          )}
        >
          <Notice>
            {copyText(t(
              "Google plans use the existing Website intake example with a Google campaign reference. This does not demonstrate Google lead delivery, conversion tracking or campaign-type eligibility.",
              "تستخدم خطط جوجل مثال استقبال الموقع مع مرجع حملة جوجل. لا يثبت هذا تسليم عملاء جوجل أو تتبع التحويلات أو أهلية نوع الحملة.",
            ))}
          </Notice>
        </Section>
      )}
      <Section
        title={t("Local plans for this property", "الخطط المحلية لهذا العقار")}
        subtitle={t(
          "Eligibility below refers to the internal simulation only. Real authorization remains pending.",
          "الأهلية أدناه تخص المحاكاة الداخلية فقط. التصريح الفعلي ما زال معلقاً.",
        )}
      >
        {campaigns.length ? (
          <div className="px-table-scroll" tabIndex={0}>
            <table className="px-table">
              <thead>
                <tr>
                  <th>{copyText(t("Campaign", "الحملة"))}</th>
                  <th>{copyText(t("Status", "الحالة"))}</th>
                  <th>{copyText(t("Media / fee", "الوسائط / الرسوم"))}</th>
                  <th>{copyText(t("Simulation eligibility", "أهلية المحاكاة"))}</th>
                </tr>
              </thead>
              <tbody>
                {campaigns.map((c) => (
                  <tr key={c.id}>
                    <td>
                      <Link href={`/workspace/campaigns/${c.id}`}>
                        {copyText(c.id.slice(-8))} · r{c.revision}
                      </Link>
                    </td>
                    <td>{copyText(campaignStatusLabel(c.status, ar))}</td>
                    <td>
                      {copyText(qar(c.input.mediaBudget))} / {copyText(qar(c.input.serviceFee))}
                    </td>
                    <td>
                      {copyText(!campaignBlockers(state, c).length &&
                      c.status === "approved-local" &&
                      state.preparedConnectors.includes(kind)
                        ? t(
                            "Eligible for local simulation",
                            "مؤهل للمحاكاة المحلية",
                          )
                        : t(
                            "Complete setup, review and approvals",
                            "أكمل الإعداد والمراجعة والموافقات",
                          ))}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p>
            {copyText(t(
              "No saved plans for this property and platform.",
              "لا خطط محفوظة لهذا العقار والمنصة.",
            ))}
          </p>
        )}
      </Section>
      <Section
        title={t("Provider setup prerequisites", "متطلبات إعداد المنصة")}
        subtitle={t(
          "Always pending independent account/country/legal verification.",
          "تظل بانتظار تحقق مستقل للحساب والدولة والقانون.",
        )}
      >
        <ul className="cm-prerequisites">
          {definition.prerequisites.map((s) => (
            <li key={s}>{copyText(s)}</li>
          ))}
        </ul>
        <p className="px-muted-copy">{copyText(definition.agreement)}</p>
      </Section>
      <Section
        title={t(
          "Consent-aware measurement preview",
          "معاينة قياس تراعي الموافقة",
        )}
        subtitle={t(
          "A local event design only. No Pixel, GA4 tag, CAPI SDK or server event is sent.",
          "تصميم حدث محلي فقط. لا إرسال بكسل أو علامة GA4 أو حزمة CAPI أو حدث خادم.",
        )}
      >
        <label className="gm-check-line">
          <input
            type="checkbox"
            checked={consent}
            onChange={(e) => {
              setConsent(e.target.checked);
              setPreview(false);
            }}
          />
          {copyText(t(
            "Fictional consent for this event preview",
            "موافقة خيالية لمعاينة الحدث",
          ))}
        </label>
        <button
          className="px-button px-button-outline"
          disabled={!consent || !p}
          onClick={() => setPreview(true)}
        >
          {copyText(t("Preview event payload", "معاينة بيانات الحدث"))}
        </button>
        {consent && preview && p && (
          <pre className="gm-code">
            {JSON.stringify(
              {
                internal_example: true,
                provider: kind,
                property_id: p.id,
                property_revision: p.revision,
                client_event_id: `DEMO-PREVIEW-${p.id}`,
                server_event_id: `DEMO-PREVIEW-${p.id}`,
                consent: "fictional-only",
                remote_sent: false,
              },
              null,
              2,
            )}
          </pre>
        )}
      </Section>
      <CampaignDisclosure />
    </>
  );
}
export function CampaignAnalytics() {const copyText=usePrototypeCopy();
  const t = useCopy();
  const ar = useLocale() === "ar";
  const query = useSearchParams();
  const { state, hydrated } = useGeminiDemo();
  const [property, setProperty] = useState("all");
  const [source, setSource] = useState("all");
  const [selected, setSelected] = useState(query.get("campaign") ?? "all");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const invalid = !!from && !!to && from > to;
  const rows = invalid
    ? []
    : state.campaigns.filter(
        (c) =>
          (property === "all" || c.input.propertyId === property) &&
          (source === "all" || campaignSource(c) === source) &&
          (selected === "all" || c.id === selected),
      );
  const linked = rows.flatMap((c) => campaignMetrics(state, c, from, to).leads);
  const metrics = leadMetrics(linked);
  const totalSpend = rows.flatMap((c) =>
    c.spend.filter((s) => (!from || s.date >= from) && (!to || s.date <= to)),
  );
  const spend = totalSpend.length
    ? totalSpend.reduce((n, s) => n + s.qar, 0)
    : null;
  return (
    <>
      <Intro
        eyebrow={t("MARKETING / LOCAL ATTRIBUTION", "التسويق / الإسناد المحلي")}
        title={t(
          "Trace the campaign. Count the enquiries.",
          "تتبّع الحملة واحسب الاستفسارات.",
        )}
        description={t(
          "Campaign references join the shared first-touch CRM. Budgets, approvals and explicitly recorded fictional costs remain separate.",
          "تربط مراجع الحملات سجل العملاء المشترك ذي المصدر الأول. تبقى الميزانيات والموافقات والتكاليف الخيالية المسجلة منفصلة.",
        )}
        action={
          <Link
            className="px-button px-button-outline"
            href="/workspace/analytics"
          >
            {copyText(t("All CRM source reporting", "كل تقارير مصادر العملاء"))}{copyText(" ")}
            <ArrowRight size={16} />
          </Link>
        }
      />
      <CampaignNavigation />
      <div className="cm-filters">
        <label className="px-field">
          {copyText(t("Campaign filter", "تصفية الحملة"))}
          <NativeSelect
            value={selected}
            onChange={(e) => setSelected(e.target.value)}
          >
            <option value="all">{copyText(t("All campaigns", "كل الحملات"))}</option>
            {state.campaigns.map((c) => (
              <option key={c.id} value={c.id}>
                {copyText(c.input.propertyId)} · {copyText(c.id.slice(-8))}
              </option>
            ))}
          </NativeSelect>
        </label>
        <label className="px-field">
          {copyText(t("Property filter", "تصفية العقار"))}
          <NativeSelect
            value={property}
            onChange={(e) => setProperty(e.target.value)}
          >
            <option value="all">{copyText(t("All properties", "كل العقارات"))}</option>
            {Object.keys(state.properties).map((id) => (
              <option key={id} value={id}>{copyText(id)}</option>
            ))}
          </NativeSelect>
        </label>
        <label className="px-field">
          {copyText(t("First-touch source", "المصدر الأول"))}
          <NativeSelect value={source} onChange={(e) => setSource(e.target.value)}>
            <option value="all">{copyText(t("All sources", "كل المصادر"))}</option>
            <option value="Meta Lead Ads">{copyText("Meta Lead Ads")}</option>
            <option value="Website">{copyText("Website")}</option>
          </NativeSelect>
        </label>
        <label className="px-field">
          {copyText(t("From date", "من تاريخ"))}
          <input
            type="date"
            value={from}
            onChange={(e) => setFrom(e.target.value)}
          />
        </label>
        <label className="px-field">
          {copyText(t("To date", "إلى تاريخ"))}
          <input
            type="date"
            value={to}
            onChange={(e) => setTo(e.target.value)}
          />
        </label>
      </div>
      {invalid && (
        <p role="alert" className="cm-alert">
          {copyText(t(
            "From date must precede to date.",
            "يجب أن يسبق تاريخ البداية تاريخ النهاية.",
          ))}
        </p>
      )}
      <Section
        title={t("Campaign performance ledger", "سجل أداء الحملات")}
        subtitle={t(
          "Lead dates use Qatar UTC+03. Counts and won/total conversion reuse the CRM selectors. CPQL uses recorded fictional campaign costs divided by qualified local leads in the same date window. Service fees are excluded.",
          "تواريخ العملاء بتوقيت قطر. الأعداد ونسبة المكتسب إلى الإجمالي تستخدم محددات العملاء المشتركة. تكلفة العميل المؤهل هي التكلفة الخيالية المسجلة مقسومة على العملاء المؤهلين المحليين في الفترة نفسها، دون رسوم الخدمة.",
        )}
      >
        {!hydrated ? (
          <p role="status">{copyText(t("Loading reports…", "جار تحميل التقارير…"))}</p>
        ) : rows.length ? (
          <div className="px-table-scroll" tabIndex={0}>
            <table className="px-table cm-report-table">
              <thead>
                <tr>
                  {[
                    t("Campaign / property", "الحملة / العقار"),
                    t("Status / revision", "الحالة / النسخة"),
                    t("Proposed media", "الوسائط المقترحة"),
                    t("Service fee", "رسوم الخدمة"),
                    t("Approved media", "الوسائط المعتمدة"),
                    t("Recorded fictional cost", "التكلفة الخيالية المسجلة"),
                    t("Local leads", "العملاء المحليون"),
                    t("Qualified", "مؤهلون"),
                    t("Won", "مكتسبون"),
                    t("Won / leads", "مكتسب / عملاء"),
                    t("Fictional CPQL", "تكلفة المؤهل الخيالية"),
                  ].map((s) => (
                    <th key={s}>{copyText(s)}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((c) => {
                  const m = campaignMetrics(state, c, from, to);
                  return (
                    <tr key={c.id}>
                      <td>
                        <Link href={`/workspace/campaigns/${c.id}`}>
                          {copyText(c.input.propertyId)}
                          <small>
                            {copyText(c.id.slice(-8))} · {copyText(campaignSource(c))}
                          </small>
                        </Link>
                      </td>
                      <td>
                        {copyText(campaignStatusLabel(c.status, ar))}
                        <small>r{c.revision}</small>
                      </td>
                      <td>{copyText(qar(c.input.mediaBudget))}</td>
                      <td>{copyText(qar(c.input.serviceFee))}</td>
                      <td>{copyText(qar(c.approvedBudget))}</td>
                      <td>{copyText(qar(m.spend))}</td>
                      <td>{m.total}</td>
                      <td>{m.qualified}</td>
                      <td>{m.won}</td>
                      <td>{copyText(m.total ? `${m.conversion.toFixed(1)}%` : "—")}</td>
                      <td>{copyText(qar(m.cpql))}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <Empty
            title={t(
              "No campaigns match this cohort",
              "لا حملات تطابق هذه المجموعة",
            )}
            description={t(
              "Create a campaign or change filters. Unknown campaign references do not fall back to other records.",
              "أنشئ حملة أو غيّر عوامل التصفية. المراجع غير المعروفة لا تعرض سجلات أخرى.",
            )}
          />
        )}
      </Section>
      <div className="px-two-column">
        <Section
          title={t(
            "Observed local lead stages",
            "مراحل العملاء المحليين المرصودة",
          )}
          subtitle={t(
            `${metrics.total} linked local leads · ${metrics.qualified} qualified · ${metrics.won} won. No traffic denominator is available.`,
            `${metrics.total} عملاء محليون مرتبطون · ${metrics.qualified} مؤهلون · ${metrics.won} مكتسبون. لا بيانات زيارات لحساب تحويل الزيارات.`,
          )}
        >
          <div
            className="cm-report-bars"
            role="img"
            aria-label={copyText(leadStages
              .map((s) => `${s}: ${linked.filter((l) => l.stage === s).length}`)
              .join(", "))}
          >
            {leadStages.map((s) => {
              const count = linked.filter((l) => l.stage === s).length;
              return (
                <div key={s}>
                  <span>
                    {
                      copyText({
                        New: t("New", "جديد"),
                        Contacted: t("Contacted", "تم التواصل"),
                        Qualified: t("Qualified", "مؤهل"),
                        Viewing: t("Viewing", "معاينة"),
                        Won: t("Won", "مكتسب"),
                        Lost: t("Lost", "مفقود"),
                      }[s])
                    }
                  </span>
                  <i>
                    <b
                      style={{
                        width: `${metrics.total ? (count / metrics.total) * 100 : 0}%`,
                      }}
                    />
                  </i>
                  <span>{count}</span>
                </div>
              );
            })}
          </div>
        </Section>
        <Section
          title={t("Cost provenance", "مصدر التكلفة")}
          subtitle={t(
            "Recorded examples, never reconciled provider spend.",
            "أمثلة مسجلة وليست إنفاق منصة تمت مطابقته.",
          )}
        >
          <div className="cm-budget-ledger">
            <div>
              <span>
                {copyText(t("Explicit fictional media cost", "تكلفة وسائط خيالية صريحة"))}
              </span>
              <b>{copyText(qar(spend))}</b>
            </div>
            <div>
              <span>
                {copyText(t(
                  "Fictional cost / qualified lead",
                  "تكلفة خيالية / عميل مؤهل",
                ))}
              </span>
              <b>
                {copyText(qar(
                  spend !== null && metrics.qualified
                    ? spend / metrics.qualified
                    : null,
                ))}
              </b>
            </div>
            <div>
              <span>
                {copyText(t("Won / local leads", "المكتسب / العملاء المحليون"))}
              </span>
              <b>{copyText(metrics.total ? `${metrics.conversion.toFixed(1)}%` : "—")}</b>
            </div>
          </div>
          <p className="cm-role-note">
            {copyText(t(
              "Proposed and approved budgets are current-version planning amounts. Recorded costs remain historical inputs when a draft changes.",
              "الميزانيات المقترحة والمعتمدة تخص تخطيط النسخة الحالية. تبقى التكاليف المسجلة مدخلات تاريخية عند تعديل المسودة.",
            ))}
          </p>
        </Section>
      </div>
      <Section
        title={t("Canonical lead references", "مراجع العملاء الأساسية")}
        subtitle={t(
          "Immutable original source event and campaign attribution; replaying an event does not add a lead.",
          "حدث المصدر الأصلي وإسناد الحملة ثابتان؛ إعادة الحدث لا تضيف عميلاً.",
        )}
      >
        <LinkedLeads leads={linked} campaigns={rows} />
      </Section>
      <Notice>
        {copyText(t(
          "Reach, impressions, clicks, actual spend, revenue and ROAS are unavailable. Consent previews do not collect analytics. Real attribution requires an authorized event pipeline.",
          "الوصول والانطباعات والنقرات والإنفاق الفعلي والإيرادات والعائد الإعلاني غير متاحة. معاينات الموافقة لا تجمع تحليلات. الإسناد الفعلي يحتاج مسار أحداث مصرحاً به.",
        ))}
      </Notice>
      <CampaignDisclosure />
    </>
  );
}
function LinkedLeads({
  leads,
  campaigns,
}: {
  leads: CanonicalLead[];
  campaigns: Campaign[];
}) {const copyText=usePrototypeCopy();
  const t = useCopy();
  return leads.length ? (
    <div className="px-table-scroll" tabIndex={0}>
      <table className="px-table">
        <thead>
          <tr>
            {[
              t("Lead", "العميل"),
              t("Original source / event", "المصدر الأصلي / الحدث"),
              t("Campaign reference", "مرجع الحملة"),
              t("Stage / qualification", "المرحلة / التأهيل"),
            ].map((s) => (
              <th key={s}>{copyText(s)}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {leads.map((l) => (
            <tr key={l.id}>
              <td>
                <Link href={`/workspace/leads/${l.id}`}>
                  {copyText(l.identity.alias)}
                  <small>{copyText(l.propertyId)}</small>
                </Link>
              </td>
              <td>
                {copyText(l.source)}
                <small>{copyText(l.sourceEventId)}</small>
              </td>
              <td>
                <Link
                  href={`/workspace/campaigns/${campaigns.find((c) => c.id === l.campaign)?.id}`}
                >
                  {l.campaign}
                </Link>
              </td>
              <td>
                {copyText(l.stage)}
                <small>{copyText(l.qualification)}</small>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  ) : (
    <p>
      {copyText(t(
        "No campaign-attributed local leads yet. Record a fictional enquiry after simulation.",
        "لا عملاء محليون منسوبون لحملة بعد. سجّل استفساراً خيالياً بعد المحاكاة.",
      ))}
    </p>
  );
}
