import { qatarDate } from "./lead-crm";
import {
  type MarketingAIService,
  type MarketingProposal,
  campaignMetrics,
  campaignBudgetCaps,
} from "./campaign-engine";

/** Production implementations must enforce tenant scope, consent, grounding/evals, budgets,
 * provenance and human review server-side. No vendor SDK, network or tools in this adapter. */
export const localMarketingAI: MarketingAIService = {
  propose(host, c, kind, at) {
    const p = host.properties[c.input.propertyId];
    const f = p.facts;
    const references = [`${p.id}@${p.revision}.source.factsReviewed`];
    let en = "",
      ar = "";
    let amount: number | null = null;
    let assetIds: string[] = [];
    if (kind === "copy" || kind === "features") {
      en = `${f.titleEn}. ${f.areaSqm} m² · ${f.beds} bedrooms · ${f.baths} bathrooms. ${f.district}, ${f.city}. ${f.priceQar.toLocaleString("en")} QAR${f.purpose === "rent" ? ` / ${f.rentalFrequency}` : ""}. Enquire with the agency for details.`;
      ar = `${f.titleAr}. المساحة ${f.areaSqm} م² · غرف النوم ${f.beds} · الحمامات ${f.baths}. ${f.district}، ${f.city}. السعر ${f.priceQar.toLocaleString("ar")} ر.ق${f.purpose === "rent" ? (f.rentalFrequency === "year" ? " / سنة" : " / شهر") : ""}. تواصل مع الوكالة للاستفسار.`;
      references.push(
        ...[
          "titleEn",
          "titleAr",
          "areaSqm",
          "beds",
          "baths",
          "district",
          "city",
          "priceQar",
          "purpose",
          "rentalFrequency",
        ].map((k) => `${p.id}@${p.revision}.facts.${k}`),
      );
    } else if (kind === "headline") {
      en = `${f.titleEn} · ${f.district}`;
      ar = `${f.titleAr} · ${f.district}`;
      references.push(
        ...["titleEn", "titleAr", "district"].map(
          (k) => `${p.id}@${p.revision}.facts.${k}`,
        ),
      );
    } else if (kind === "objective") {
      en =
        "Proposed objective: property enquiries. Review this workflow choice; no outcome is predicted.";
      ar =
        "الهدف المقترح: استفسارات العقار. راجع هذا الاختيار؛ لا توقع لنتائج الأداء.";
      references.push(`${c.id}.input.propertyId`);
    } else if (kind === "creative") {
      assetIds = p.media
        .filter(
          (a) =>
            a.kind === "image" && a.availability === "sample" && a.sampleKey,
        )
        .sort((a, b) => a.order - b.order)
        .slice(0, 3)
        .map((a) => a.id);
      en = `Select ${assetIds.length} available sample images in canonical media order. Review room labels and creative rights.`;
      ar = `اختيار ${assetIds.length} صور نموذجية متاحة بترتيب وسائط العقار. راجع تصنيف الغرف وحقوق الاستخدام.`;
      references.push(
        ...assetIds.map((id) => `${p.id}@${p.revision}.media.${id}`),
      );
    } else if (kind === "budget") {
      amount = Math.max(
        1,
        Math.min(350, campaignBudgetCaps[host.plan] - c.input.serviceFee),
      );
      en = `Fictional planning scenarios: QAR ${amount} media; QAR ${Math.min(amount * 2, campaignBudgetCaps[host.plan])} alternative before fees. Accept applies the first scenario only. No performance forecast or spend.`;
      ar = `سيناريو تخطيط خيالي: ${amount} ر.ق للوسائط؛ بديل ${Math.min(amount * 2, campaignBudgetCaps[host.plan])} ر.ق قبل الرسوم. القبول يطبق السيناريو الأول فقط. لا توقع أداء أو إنفاق.`;
      references.push(
        `illustrative-local-cap.${host.plan}`,
        `${c.id}.input.serviceFee`,
      );
    } else {
      const from = qatarDate(
        new Date(Date.parse(at) - 6 * 86400000).toISOString(),
      );
      const to = qatarDate(at);
      const m = campaignMetrics(host, c, from, to);
      en = `Local weekly draft (${from}–${to}): ${m.total} fictional enquiries, ${m.qualified} qualified, ${m.won} won. ${m.spend === null ? "No fictional media cost recorded." : `Recorded fictional media cost: QAR ${m.spend}.`} Review CRM follow-up; no reach, clicks or revenue is available.`;
      ar = `مسودة أسبوعية محلية (${from}–${to}): ${m.total} استفسارات خيالية، ${m.qualified} مؤهلة، ${m.won} مكتسبة. ${m.spend === null ? "لا تكلفة وسائط خيالية مسجلة." : `تكلفة وسائط خيالية مسجلة: ${m.spend} ر.ق.`} راجع متابعة العملاء؛ لا بيانات وصول أو نقرات أو إيرادات.`;
      references.push(`crm.first-touch.${c.id}.${from}.${to}`);
    }
    const proposal: MarketingProposal = {
      id: `PROPOSAL-${crypto.randomUUID()}`,
      kind,
      propertyRevision: p.revision,
      campaignRevision: c.revision,
      createdAt: at,
      status: "proposed",
      reviewedAt: null,
      en,
      ar,
      references,
      assetIds,
      amount,
    };
    return proposal;
  },
};
