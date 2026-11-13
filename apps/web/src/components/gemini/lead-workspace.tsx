'use client';
import {useState, type ReactNode} from 'react';
import {useLocale} from 'next-intl';
import {Link, usePathname} from '@/i18n/navigation';
import {Intro, Notice, Pill, Section} from '@/components/prototype/primitives';
import {
  crmAgents,
  exampleLeadPayload,
  leadMetrics,
  leadSources,
  leadStages,
  nextAssignment,
  type CanonicalLead,
  type CrmCommand,
  type LeadSource,
  type LeadStage,
} from '@/lib/lead-crm';
import {useGeminiDemo} from './demo-provider';
export function useCrmCopy() {
  const ar = useLocale() === 'ar';
  return (en: string, arabic: string) => (ar ? arabic : en);
}
export const stageAr: Record<LeadStage, string> = {
  New: 'جديد',
  Contacted: 'تم التواصل',
  Qualified: 'مؤهل',
  Viewing: 'معاينة',
  Won: 'ناجح',
  Lost: 'مفقود',
};
export function CrmNavigation() {
  const t = useCrmCopy();
  const path = usePathname();
  return (
    <nav
      className="px-subnav crm-nav"
      aria-label={t('CRM navigation', 'تنقل إدارة العملاء')}
    >
      {[
        ['/workspace/leads', 'Leads', 'العملاء'],
        ['/workspace/inbox', 'Inbox', 'المحادثات'],
        ['/workspace/leads/assignment', 'Assignment', 'التوزيع'],
        ['/workspace/leads/viewings', 'Viewings', 'المعاينات'],
        ['/workspace/analytics', 'Attribution', 'الإسناد'],
      ].map(([href, en, ar]) => (
        <Link
          key={href}
          href={href}
          className={
            path === href ||
            (href === '/workspace/leads' &&
              /^\/workspace\/leads\/(LE-|unknown)/.test(path))
              ? 'selected'
              : undefined
          }
          aria-current={path === href ? 'page' : undefined}
        >
          {t(en, ar)}
        </Link>
      ))}
    </nav>
  );
}
export function CrmDisclosure() {
  const t = useCrmCopy();
  return (
    <Notice>
      {t(
        'Fictional browser-local demo. Enter fictional notes only. No provider webhook, message, calendar or analytics connection. Browser state is editable and is not production authorization.',
        'عرض تجريبي محلي ببيانات خيالية فقط. لا اتصال بمزودي الخدمات أو الرسائل أو التقويم أو التحليلات. حالة المتصفح ليست صلاحية إنتاجية.',
      )}
    </Notice>
  );
}
export function CrmLoading() {
  const t = useCrmCopy();
  return (
    <p role="status">
      {t('Loading local CRM…', 'جارٍ تحميل العملاء المحليين…')}
    </p>
  );
}
function Feedback({error, message}: {error?: string | null; message?: string}) {
  return error ? (
    <p className="crm-feedback crm-error" role="alert">
      {error}
    </p>
  ) : message ? (
    <p className="crm-feedback" role="status">
      {message}
    </p>
  ) : null;
}
function PropertyLabel({id}: {id: string}) {
  const {state} = useGeminiDemo();
  const t = useCrmCopy();
  const p = state.properties[id];
  return (
    <>
      {id} ·{' '}
      {p
        ? t(
            p.facts.titleEn || 'Untitled property',
            p.facts.titleAr || 'عقار بدون عنوان',
          )
        : 'Missing property'}
    </>
  );
}
export function LeadIntake({initialProperty}: {initialProperty?: string}) {
  const {state, crmCommand} = useGeminiDemo();
  const t = useCrmCopy();
  const [source, setSource] = useState<LeadSource>('Website');
  const [property, setProperty] = useState(
    initialProperty ?? Object.keys(state.properties)[0] ?? '',
  );
  const [payload, setPayload] = useState(() =>
    exampleLeadPayload(
      'Website',
      initialProperty ?? Object.keys(state.properties)[0] ?? '',
    ),
  );
  const [ack, setAck] = useState(false);
  const [feedback, setFeedback] = useState<{
    error: string | null;
    leadId?: string;
    message?: string;
  }>({error: null});
  function load(s: LeadSource, p: string) {
    setPayload(exampleLeadPayload(s, p));
    setFeedback({error: null});
  }
  return (
    <Section
      className="crm-intake"
      title={t('Lead intake simulator', 'محاكي استقبال العملاء')}
      subtitle={t(
        'Five internal illustrative contracts. These are not official provider payloads or live webhooks.',
        'خمسة عقود داخلية توضيحية، وليست واجهات رسمية أو اتصالات حية.',
      )}
    >
      <form
        onSubmit={(e) => {
          e.preventDefault();
          const result = crmCommand({
            type: 'intake',
            source,
            payload,
            acknowledged: ack,
          });
          const receipt = state.crm.receipts.length;
          setFeedback({
            ...result,
            message: result.error
              ? undefined
              : `${t('Local intake processed. Inspect the receipt ledger below.', 'تمت معالجة المثال محلياً. راجع سجل الاستقبال أدناه.')} #${receipt / 2 + 1}`,
          });
        }}
      >
        {!Object.keys(state.properties).length && (
          <p role="status">
            {t(
              'Create a canonical property before simulating intake.',
              'أنشئ عقاراً أساسياً قبل محاكاة الاستقبال.',
            )}{' '}
            <Link href="/workspace/inventory/new">
              {t('Create property', 'إنشاء عقار')}
            </Link>
          </p>
        )}
        <div className="px-field-grid">
          <label className="px-field">
            {t('Intake source', 'مصدر الاستقبال')}
            <select
              value={source}
              onChange={(e) => {
                const s = e.target.value as LeadSource;
                setSource(s);
                load(s, property);
              }}
            >
              {leadSources.map((s) => (
                <option key={s}>{s}</option>
              ))}
            </select>
          </label>
          <label className="px-field">
            {t('Canonical property', 'العقار الأساسي')}
            <select
              value={property}
              onChange={(e) => {
                setProperty(e.target.value);
                load(source, e.target.value);
              }}
            >
              {!Object.hasOwn(state.properties, property) && (
                <option value={property}>
                  {t('Unknown canonical property', 'العقار الأساسي غير موجود')}
                </option>
              )}
              {Object.values(state.properties).map((p) => (
                <option key={p.id} value={p.id}>
                  {p.id} ·{' '}
                  {t(
                    p.facts.titleEn || 'Untitled',
                    p.facts.titleAr || 'بدون عنوان',
                  )}
                </option>
              ))}
            </select>
          </label>
        </div>
        <label className="px-field">
          {t('Internal example payload', 'بيانات المثال الداخلي')}
          <textarea
            className="crm-payload"
            dir="ltr"
            rows={11}
            value={payload}
            maxLength={16000}
            onChange={(e) => setPayload(e.target.value)}
            spellCheck={false}
          />
        </label>
        <label className="px-approval">
          <input
            type="checkbox"
            checked={ack}
            onChange={(e) => setAck(e.target.checked)}
          />
          {t(
            'I acknowledge this is fictional local intake; no personal data or real webhook.',
            'أقر بأن هذا استقبال محلي خيالي، دون بيانات شخصية أو اتصال حي.',
          )}
        </label>
        <div className="crm-actions">
          <button
            className="px-button px-button-dark"
            disabled={!ack || !Object.hasOwn(state.properties, property)}
          >
            {t('Process example event', 'معالجة الحدث التجريبي')}
          </button>
          <button
            type="button"
            className="px-button px-button-outline"
            onClick={() => load(source, property)}
          >
            {t('New example identity', 'معرّف حدث جديد')}
          </button>
        </div>
        <Feedback {...feedback} />
        {feedback.leadId && (
          <Link
            className="px-text-link"
            href={`/workspace/leads/${feedback.leadId}`}
          >
            {t('Open resulting lead', 'فتح العميل الناتج')} →
          </Link>
        )}
      </form>
      <details className="crm-receipts">
        <summary>
          {t('Intake receipt ledger', 'سجل أحداث الاستقبال')} (
          {state.crm.receipts.length})
        </summary>
        {state.crm.receipts.length ? (
          <ol className="crm-timeline">
            {state.crm.receipts
              .slice()
              .reverse()
              .map((r) => (
                <li key={r.id}>
                  <Pill
                    tone={
                      r.status === 'rejected'
                        ? 'danger'
                        : r.status === 'accepted'
                          ? 'good'
                          : 'neutral'
                    }
                  >
                    {r.status}
                  </Pill>
                  <span>
                    {r.source} · {r.eventId ?? '—'}
                  </span>
                  <small>
                    {r.detail} · {r.at}
                  </small>
                  {r.leadId && (
                    <Link href={`/workspace/leads/${r.leadId}`}>
                      {r.leadId}
                    </Link>
                  )}
                </li>
              ))}
          </ol>
        ) : (
          <p>
            {t(
              'No simulated events received yet.',
              'لم يتم استقبال أحداث تجريبية بعد.',
            )}
          </p>
        )}
      </details>
    </Section>
  );
}
export function LeadsPage({
  initialProperty,
  initialIntake = false,
}: {
  initialProperty?: string;
  initialIntake?: boolean;
}) {
  const {state, hydrated} = useGeminiDemo();
  const t = useCrmCopy();
  const [search, setSearch] = useState('');
  const [source, setSource] = useState('All');
  const [property, setProperty] = useState(initialProperty ?? 'All');
  const [owner, setOwner] = useState('All');
  const [stage, setStage] = useState('All');
  const [priority, setPriority] = useState('All');
  const [qualification, setQualification] = useState('All');
  const [view, setView] = useState('table');
  const [intake, setIntake] = useState(initialIntake);
  if (!hydrated) return <CrmLoading />;
  const filtered = state.crm.leads.filter(
    (l) =>
      (source === 'All' || l.source === source) &&
      (property === 'All' || l.propertyId === property) &&
      (owner === 'All' ||
        (owner === 'Unassigned' ? !l.assignee : l.assignee === owner)) &&
      (stage === 'All' || l.stage === stage) &&
      (priority === 'All' || l.priority === priority) &&
      (qualification === 'All' || l.qualification === qualification) &&
      `${l.identity.alias} ${l.id} ${l.propertyId} ${state.properties[l.propertyId]?.facts.titleEn} ${l.sourceEventId}`
        .toLowerCase()
        .includes(search.toLowerCase()),
  );
  const metrics = leadMetrics(state.crm.leads);
  return (
    <>
      <Intro
        eyebrow={t('RELATIONSHIPS / CRM', 'العلاقات / إدارة العملاء')}
        title={t('Lead manager', 'إدارة العملاء')}
        description={t(
          'One property, one source identity, one continuous record. Follow each fictional enquiry from intake to outcome.',
          'عقار واحد ومصدر واحد وسجل متصل. تابع كل استفسار خيالي من الاستقبال إلى النتيجة.',
        )}
        action={
          <button
            className="px-button px-button-dark"
            aria-expanded={intake}
            onClick={() => setIntake(!intake)}
          >
            {t('Lead intake simulator', 'محاكي استقبال العملاء')}
          </button>
        }
      />
      <CrmNavigation />
      <div
        className="crm-summary"
        aria-label={t('Local lead totals', 'إجماليات العملاء المحليين')}
      >
        <span>
          <b>{metrics.total}</b> {t('local leads', 'عميل محلي')}
        </span>
        <span>
          <b>{metrics.new}</b> {t('new', 'جديد')}
        </span>
        <span>
          <b>{metrics.qualified}</b> {t('qualified', 'مؤهل')}
        </span>
        <span>
          <b>{metrics.backlog}</b> {t('assignment backlog', 'بانتظار التوزيع')}
        </span>
      </div>
      {intake && <LeadIntake initialProperty={initialProperty} />}
      <Section
        title={t('Lead pipeline', 'مسار العملاء')}
        subtitle={`${filtered.length} ${t('matching local records', 'سجلات محلية مطابقة')}`}
        actions={
          <div className="crm-view-toggle">
            <button
              className="px-mini-action"
              aria-pressed={view === 'table'}
              onClick={() => setView('table')}
            >
              {t('Table', 'جدول')}
            </button>
            <button
              className="px-mini-action"
              aria-pressed={view === 'pipeline'}
              onClick={() => setView('pipeline')}
            >
              {t('Pipeline', 'مسار')}
            </button>
          </div>
        }
      >
        <div className="crm-filters">
          <label className="px-field">
            {t('Search leads', 'بحث العملاء')}
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t(
                'Identity, event, property or ID',
                'الهوية أو الحدث أو العقار أو المعرّف',
              )}
            />
          </label>
          {[
            {
              label: t('Source', 'المصدر'),
              value: source,
              set: setSource,
              options: leadSources,
            },
            {
              label: t('Property', 'العقار'),
              value: property,
              set: setProperty,
              options: Object.keys(state.properties),
            },
            {
              label: t('Assignee', 'المسؤول'),
              value: owner,
              set: setOwner,
              options: ['Unassigned', ...crmAgents],
            },
            {
              label: t('Stage', 'المرحلة'),
              value: stage,
              set: setStage,
              options: leadStages,
            },
            {
              label: t('Priority', 'الأولوية'),
              value: priority,
              set: setPriority,
              options: ['Normal', 'High'],
            },
            {
              label: t('Qualification', 'التأهيل'),
              value: qualification,
              set: setQualification,
              options: ['Unreviewed', 'Qualified', 'Not qualified'],
            },
          ].map((f) => (
            <label className="px-field" key={f.label}>
              {f.label}
              <select value={f.value} onChange={(e) => f.set(e.target.value)}>
                <option value="All">{t('All', 'الكل')}</option>
                {f.options.map((o) => (
                  <option key={o} value={o}>
                    {leadStages.includes(o as LeadStage)
                      ? t(o, stageAr[o as LeadStage])
                      : o}
                  </option>
                ))}
              </select>
            </label>
          ))}
          <button
            className="px-mini-action"
            onClick={() => {
              setSearch('');
              setSource('All');
              setProperty('All');
              setOwner('All');
              setStage('All');
              setPriority('All');
              setQualification('All');
            }}
          >
            {t('Reset filters', 'إعادة ضبط')}
          </button>
        </div>
        {!filtered.length ? (
          <div className="crm-empty">
            <h3>{t('No matching leads', 'لا توجد نتائج مطابقة')}</h3>
            <p>
              {t(
                'Reset filters or simulate an enquiry for a canonical property.',
                'أعد ضبط المرشحات أو حاكِ استفساراً لعقار أساسي.',
              )}
            </p>
          </div>
        ) : view === 'table' ? (
          <div
            className="px-table-scroll"
            tabIndex={0}
            role="region"
            aria-label={t('Lead records table', 'جدول العملاء')}
          >
            <table className="px-table crm-table">
              <thead>
                <tr>
                  {[
                    'Lead',
                    'Source / original event',
                    'Canonical property',
                    'Stage',
                    'Qualification',
                    'Owner',
                    'Received',
                  ].map((s) => (
                    <th key={s}>
                      {t(
                        s,
                        (
                          {
                            Lead: 'العميل',
                            'Source / original event': 'المصدر / الحدث الأصلي',
                            'Canonical property': 'العقار الأساسي',
                            Stage: 'المرحلة',
                            Qualification: 'التأهيل',
                            Owner: 'المسؤول',
                            Received: 'الاستقبال',
                          } as Record<string, string>
                        )[s],
                      )}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((l) => (
                  <tr key={l.id} data-lead-id={l.id}>
                    <td>
                      <Link href={`/workspace/leads/${l.id}`}>
                        <b>{l.identity.alias}</b>
                        <small>{l.id}</small>
                      </Link>
                    </td>
                    <td>
                      {l.source}
                      <small>{l.sourceEventId}</small>
                    </td>
                    <td>
                      <Link href={`/workspace/inventory/${l.propertyId}`}>
                        <PropertyLabel id={l.propertyId} />
                      </Link>
                    </td>
                    <td>
                      <Pill
                        tone={
                          l.stage === 'Won'
                            ? 'good'
                            : l.stage === 'Lost'
                              ? 'danger'
                              : l.stage === 'New'
                                ? 'info'
                                : 'neutral'
                        }
                      >
                        {t(l.stage, stageAr[l.stage])}
                      </Pill>
                    </td>
                    <td>
                      {t(
                        l.qualification,
                        {
                          Unreviewed: 'لم يراجع',
                          Qualified: 'مؤهل',
                          'Not qualified': 'غير مؤهل',
                        }[l.qualification],
                      )}
                      <small>
                        {t(
                          l.priority,
                          l.priority === 'High' ? 'عالية' : 'عادية',
                        )}
                      </small>
                    </td>
                    <td>{l.assignee ?? t('Unassigned', 'غير موزع')}</td>
                    <td>
                      <time dateTime={l.receivedAt}>
                        {l.receivedAt.slice(0, 16).replace('T', ' ')} UTC
                      </time>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div
            className="crm-pipeline"
            tabIndex={0}
            role="region"
            aria-label={t('Lead pipeline columns', 'أعمدة مسار العملاء')}
          >
            {leadStages.map((s) => (
              <section key={s} className="crm-lane">
                <header>
                  <h3>{t(s, stageAr[s])}</h3>
                  <span>{filtered.filter((l) => l.stage === s).length}</span>
                </header>
                {filtered
                  .filter((l) => l.stage === s)
                  .map((l) => (
                    <Link
                      className="crm-lead-tile"
                      key={l.id}
                      href={`/workspace/leads/${l.id}`}
                    >
                      <b>{l.identity.alias}</b>
                      <span>{l.source}</span>
                      <small>{l.propertyId}</small>
                      <small>{l.assignee ?? t('Unassigned', 'غير موزع')}</small>
                    </Link>
                  ))}
                {!filtered.some((l) => l.stage === s) && (
                  <p>{t('No leads', 'لا عملاء')}</p>
                )}
              </section>
            ))}
          </div>
        )}
      </Section>
      <CrmDisclosure />
    </>
  );
}
export function LeadDetail({id}: {id: string}) {
  const {state, hydrated} = useGeminiDemo();
  const t = useCrmCopy();
  if (!hydrated) return <CrmLoading />;
  const lead = state.crm.leads.find((l) => l.id === id);
  if (!lead)
    return (
      <>
        <Intro
          eyebrow="CRM"
          title={t('Lead not found', 'العميل غير موجود')}
          description={t(
            'This ID does not exist in the current local organization. No other lead has been substituted.',
            'هذا المعرّف غير موجود في المؤسسة المحلية الحالية. لم يتم استبداله بعميل آخر.',
          )}
        />
        <Link href="/workspace/leads">
          {t('Return to leads', 'العودة للعملاء')}
        </Link>
      </>
    );
  return <LeadDossier key={id} lead={lead} />;
}
function LeadDossier({lead: l}: {lead: CanonicalLead}) {
  const {crmCommand} = useGeminiDemo();
  const t = useCrmCopy();
  const [note, setNote] = useState('');
  const [qualification, setQualification] = useState(l.qualification);
  const [priority, setPriority] = useState(l.priority);
  const [qualificationNote, setQualificationNote] = useState(
    l.qualificationNote,
  );
  const [result, setResult] = useState<{
    error: string | null;
    message?: string;
  }>({error: null});
  function run(cmd: CrmCommand) {
    const r = crmCommand(cmd);
    setResult({
      ...r,
      message: r.error
        ? undefined
        : t(
            'Saved in the shared local record.',
            'تم الحفظ في السجل المحلي المشترك.',
          ),
    });
    return !r.error;
  }
  return (
    <>
      <Intro
        eyebrow={`CRM / ${l.id}`}
        title={l.identity.alias}
        description={`${l.source} · ${l.propertyId} · ${t('Fictional identity', 'هوية خيالية')}`}
        action={
          <Link
            className="px-button px-button-dark"
            href={`/workspace/inbox?lead=${l.id}`}
          >
            {t('Open conversation', 'فتح المحادثة')}
          </Link>
        }
      />
      <CrmNavigation />
      <Feedback {...result} />
      <div className="crm-dossier">
        <div>
          <Section
            title={t('Ownership & lifecycle', 'المسؤولية ودورة الحياة')}
            subtitle={t(
              'Changes persist across CRM, inbox and analytics.',
              'تستمر التغييرات عبر العملاء والمحادثات والتحليلات.',
            )}
          >
            <div className="px-field-grid">
              <label className="px-field">
                {t('Lead stage', 'مرحلة العميل')}
                <select
                  value={l.stage}
                  onChange={(e) =>
                    run({
                      type: 'stage',
                      leadId: l.id,
                      stage: e.target.value as LeadStage,
                    })
                  }
                >
                  {leadStages.map((s) => (
                    <option key={s} value={s}>
                      {t(s, stageAr[s])}
                    </option>
                  ))}
                </select>
              </label>
              <AgentSelect
                value={l.assignee ?? ''}
                onChange={(agent) =>
                  run({type: 'assign', leadId: l.id, agent: agent || null})
                }
              />
            </div>
            <div className="px-detail-pairs">
              <div>
                <span>{t('Canonical property', 'العقار الأساسي')}</span>
                <Link href={`/workspace/inventory/${l.propertyId}`}>
                  <PropertyLabel id={l.propertyId} />
                </Link>
              </div>
              <div>
                <span>
                  {t('Original source / event', 'المصدر / الحدث الأصلي')}
                </span>
                <strong>
                  {l.source} · {l.sourceEventId}
                </strong>
              </div>
              <div>
                <span>{t('Source time', 'وقت المصدر')}</span>
                <time>{l.sourceAt}</time>
              </div>
              <div>
                <span>{t('Received time', 'وقت الاستقبال')}</span>
                <time>{l.receivedAt}</time>
              </div>
              <div>
                <span>{t('Destination / campaign', 'الوجهة / الحملة')}</span>
                <strong>
                  {l.destination ?? '—'} / {l.campaign ?? '—'}
                </strong>
              </div>
              <div>
                <span>{t('Privacy-safe contact', 'بيانات تواصل خيالية')}</span>
                <strong>{l.identity.email}</strong>
              </div>
            </div>
            <label className="px-approval">
              <input
                type="checkbox"
                checked={l.consent.replyAllowed}
                onChange={(e) =>
                  run({
                    type: 'consent',
                    leadId: l.id,
                    allowed: e.target.checked,
                  })
                }
              />
              {t(
                'Allow local demonstration replies',
                'السماح بالردود التجريبية المحلية',
              )}
            </label>
            <Link
              className="px-text-link"
              href={`/workspace/leads/viewings?lead=${l.id}`}
            >
              {t('Request a viewing', 'طلب معاينة')} →
            </Link>
          </Section>
          <Section title={t('Qualification & follow-up', 'التأهيل والمتابعة')}>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                run({
                  type: 'qualify',
                  leadId: l.id,
                  qualification,
                  priority,
                  text: qualificationNote,
                });
              }}
            >
              <div className="px-field-grid">
                <label className="px-field">
                  {t('Qualification status', 'حالة التأهيل')}
                  <select
                    value={qualification}
                    onChange={(e) =>
                      setQualification(e.target.value as typeof qualification)
                    }
                  >
                    {(
                      ['Unreviewed', 'Qualified', 'Not qualified'] as const
                    ).map((q) => (
                      <option key={q} value={q}>
                        {t(
                          q,
                          {
                            Unreviewed: 'لم يراجع',
                            Qualified: 'مؤهل',
                            'Not qualified': 'غير مؤهل',
                          }[q],
                        )}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="px-field">
                  {t('Priority', 'الأولوية')}
                  <select
                    value={priority}
                    onChange={(e) =>
                      setPriority(e.target.value as typeof priority)
                    }
                  >
                    <option value="Normal">{t('Normal', 'عادية')}</option>
                    <option value="High">{t('High', 'عالية')}</option>
                  </select>
                </label>
              </div>
              <label className="px-field">
                {t(
                  'Qualification / follow-up details',
                  'تفاصيل التأهيل والمتابعة',
                )}
                <textarea
                  rows={3}
                  value={qualificationNote}
                  maxLength={2000}
                  onChange={(e) => setQualificationNote(e.target.value)}
                />
              </label>
              <button className="px-button px-button-outline">
                {t('Save qualification', 'حفظ التأهيل')}
              </button>
            </form>
          </Section>
          <Section title={t('Internal notes', 'ملاحظات داخلية')}>
            <ul className="crm-timeline">
              {l.notes.map((n) => (
                <li key={n.id}>
                  <p>{n.text}</p>
                  <small>{n.at}</small>
                </li>
              ))}
            </ul>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (run({type: 'note', leadId: l.id, text: note})) setNote('');
              }}
            >
              <label className="px-field">
                {t('Add fictional note', 'إضافة ملاحظة خيالية')}
                <textarea
                  value={note}
                  maxLength={2000}
                  rows={3}
                  onChange={(e) => setNote(e.target.value)}
                />
              </label>
              <button
                className="px-button px-button-dark"
                disabled={!note.trim()}
              >
                {t('Add note', 'إضافة الملاحظة')}
              </button>
            </form>
          </Section>
        </div>
        <aside>
          <Section title={t('Activity timeline', 'سجل النشاط')}>
            <ol className="crm-timeline">
              {[...l.activity].reverse().map((a) => (
                <li key={a.id}>
                  <p>{a.text}</p>
                  <small>{a.at}</small>
                </li>
              ))}
            </ol>
          </Section>
          <AssignmentHistory leads={[l]} />
          <Section
            title={t('Linked viewing requests', 'طلبات المعاينة المرتبطة')}
          >
            {l.viewings.length ? (
              l.viewings.map((v) => (
                <p key={v.id}>
                  {v.date} · {v.time} +03 · {v.agent} <Pill>{v.status}</Pill>
                </p>
              ))
            ) : (
              <p>
                {t('No local viewing requests.', 'لا توجد طلبات معاينة محلية.')}
              </p>
            )}
          </Section>
        </aside>
      </div>
      <CrmDisclosure />
    </>
  );
}
export function AgentSelect({
  value,
  onChange,
  label,
}: {
  value: string;
  onChange: (v: string) => void;
  label?: string;
}) {
  const {state} = useGeminiDemo();
  const t = useCrmCopy();
  return (
    <label className="px-field">
      {label ?? t('Assigned agent', 'المسؤول')}
      <select value={value} onChange={(e) => onChange(e.target.value)}>
        <option value="">{t('Unassigned', 'غير موزع')}</option>
        {crmAgents.map((a) => (
          <option key={a} disabled={state.crm.unavailableAgents.includes(a)}>
            {a}
          </option>
        ))}
      </select>
    </label>
  );
}
export function AssignmentHistory({leads}: {leads: CanonicalLead[]}) {
  const t = useCrmCopy();
  const rows = leads
    .flatMap((l) => l.assignments.map((a) => ({...a, leadId: l.id})))
    .sort((a, b) => b.at.localeCompare(a.at));
  return (
    <Section
      title={t('Assignment decisions', 'قرارات التوزيع')}
      subtitle={t(
        'Browser-local history, including fallback and manual handover.',
        'سجل محلي يشمل التوزيع الاحتياطي والتحويل اليدوي.',
      )}
    >
      <div className="px-table-scroll" tabIndex={0}>
        <table className="px-table">
          <thead>
            <tr>
              <th>{t('Lead', 'العميل')}</th>
              <th>{t('Owner', 'المسؤول')}</th>
              <th>{t('Decision', 'القرار')}</th>
              <th>{t('Time', 'الوقت')}</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id}>
                <td>
                  <Link href={`/workspace/leads/${r.leadId}`}>{r.leadId}</Link>
                </td>
                <td>
                  {r.from ?? '—'} → {r.to ?? t('Unassigned', 'غير موزع')}
                </td>
                <td>{r.reason}</td>
                <td>{r.at}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {!rows.length && (
        <p>{t('No assignment decisions yet.', 'لا توجد قرارات توزيع بعد.')}</p>
      )}
    </Section>
  );
}
export function InboxPage({initialLead}: {initialLead?: string}) {
  const {state, hydrated, crmCommand} = useGeminiDemo();
  const t = useCrmCopy();
  const [selected, setSelected] = useState(initialLead ?? '');
  const [draft, setDraft] = useState('');
  const [feedback, setFeedback] = useState<{
    error: string | null;
    message?: string;
  }>({error: null});
  if (!hydrated) return <CrmLoading />;
  const l = selected
    ? state.crm.leads.find((l) => l.id === selected)
    : state.crm.leads[0];
  return (
    <>
      <Intro
        eyebrow={t('RELATIONSHIPS / CONVERSATIONS', 'العلاقات / المحادثات')}
        title={t('Unified inbox', 'صندوق المحادثات الموحد')}
        description={t(
          'Linked local conversations with original source identity and human ownership. Replies are saved locally only.',
          'محادثات محلية مرتبطة بمصدرها الأصلي ومسؤولها. تُحفظ الردود محلياً فقط.',
        )}
      />
      <CrmNavigation />
      <Feedback {...feedback} />
      <div className="px-inbox crm-inbox">
        <div className="px-inbox-list">
          <div className="px-inbox-list-header">
            <h2>{t('Conversations', 'المحادثات')}</h2>
            <span>{state.crm.leads.length}</span>
          </div>
          {state.crm.leads.map((lead) => (
            <button
              className={`px-conversation-tile ${lead.id === l?.id ? 'active' : ''}`}
              key={lead.id}
              aria-pressed={lead.id === l?.id}
              onClick={() => {
                setSelected(lead.id);
                setDraft('');
                setFeedback({error: null});
              }}
            >
              <span>
                <strong>{lead.identity.alias}</strong>
                <small>
                  {lead.source} · {lead.propertyId}
                </small>
                <em>{lead.conversation.messages.at(-1)?.text}</em>
              </span>
            </button>
          ))}
        </div>
        {l ? (
          <>
            <section
              className="px-chat-panel"
              aria-label={t('Selected conversation', 'المحادثة المحددة')}
            >
              <header className="px-chat-head">
                <div>
                  <strong>{l.identity.alias}</strong>
                  <small>
                    {l.source} · {l.conversation.id}
                  </small>
                </div>
                <Link href={`/workspace/leads/${l.id}`}>
                  {t('Lead record', 'سجل العميل')}
                </Link>
              </header>
              <div
                className="px-chat-messages"
                role="log"
                aria-label={t('Local messages', 'الرسائل المحلية')}
              >
                {l.conversation.messages.map((m) => (
                  <div
                    className={`px-chat-bubble ${m.direction === 'outbound' ? 'mine' : ''}`}
                    key={m.id}
                  >
                    <p>{m.text}</p>
                    <span>
                      {m.direction} · {m.status} · {m.at}
                    </span>
                  </div>
                ))}
              </div>
              <form
                className="px-chat-compose"
                onSubmit={(e) => {
                  e.preventDefault();
                  const r = crmCommand({
                    type: 'reply',
                    leadId: l.id,
                    text: draft,
                  });
                  setFeedback({
                    ...r,
                    message: r.error
                      ? undefined
                      : t(
                          'Demo reply saved locally. No message sent.',
                          'تم حفظ الرد التجريبي محلياً. لم تُرسل رسالة.',
                        ),
                  });
                  if (!r.error) setDraft('');
                }}
              >
                <label className="sr-only" htmlFor="crm-reply">
                  {t('Write a demo reply', 'كتابة رد تجريبي')}
                </label>
                <textarea
                  id="crm-reply"
                  rows={3}
                  maxLength={2000}
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  placeholder={t('Fictional reply only', 'رد خيالي فقط')}
                />
                <button
                  className="px-button px-button-dark"
                  disabled={!draft.trim() || !l.consent.replyAllowed}
                >
                  {t('Save local reply', 'حفظ الرد المحلي')}
                </button>
              </form>
              {!l.consent.replyAllowed && (
                <p role="status">
                  {t(
                    'Opted out: local replies blocked.',
                    'تم إلغاء الاشتراك: الردود المحلية محظورة.',
                  )}
                </p>
              )}
            </section>
            <aside className="px-chat-context">
              <span className="px-overline">
                {t('CONTEXT / HUMAN HANDOVER', 'السياق / التحويل البشري')}
              </span>
              <h3>{t('Linked property', 'العقار المرتبط')}</h3>
              <Link href={`/workspace/inventory/${l.propertyId}`}>
                <PropertyLabel id={l.propertyId} />
              </Link>
              <p>
                {l.source} · {l.sourceEventId}
              </p>
              <AgentSelect
                value={l.assignee ?? ''}
                label={t('Handover agent', 'مسؤول التحويل')}
                onChange={(agent) => {
                  const r = crmCommand({
                    type: 'assign',
                    leadId: l.id,
                    agent: agent || null,
                  });
                  setFeedback({
                    ...r,
                    message: r.error
                      ? undefined
                      : t('Handover saved locally.', 'تم حفظ التحويل محلياً.'),
                  });
                }}
              />
              <Link href={`/workspace/leads/viewings?lead=${l.id}`}>
                {t('Request viewing', 'طلب معاينة')}
              </Link>
              <p>
                {t(
                  'No official WhatsApp API, AI or remote delivery status.',
                  'لا واجهة واتساب رسمية أو ذكاء اصطناعي أو حالة تسليم عن بُعد.',
                )}
              </p>
            </aside>
          </>
        ) : (
          <div className="crm-empty">
            <h3>{t('No conversation found', 'لم يتم العثور على محادثة')}</h3>
            <p>
              {t(
                'Choose an existing lead or create a fictional enquiry.',
                'اختر عميلاً موجوداً أو أنشئ استفساراً خيالياً.',
              )}
            </p>
          </div>
        )}
      </div>
      <CrmDisclosure />
    </>
  );
}
export function LeadRouting() {
  const {state, update, crmCommand, hydrated} = useGeminiDemo();
  const t = useCrmCopy();
  const [feedback, setFeedback] = useState<{
    error: string | null;
    message?: string;
  }>({error: null});
  if (!hydrated) return <CrmLoading />;
  const next = nextAssignment(state);
  return (
    <>
      <Intro
        eyebrow={t('CRM / ASSIGNMENT ENGINE', 'العملاء / محرك التوزيع')}
        title={t('Lead assignment rules', 'قواعد توزيع العملاء')}
        description={t(
          'Rotate active, available agents or hold leads for manual assignment. Decisions and rotation persist across reloads.',
          'توزيع على المسؤولين النشطين والمتاحين، أو الانتظار للتوزيع اليدوي. تُحفظ القرارات والدوران بعد إعادة التحميل.',
        )}
      />
      <CrmNavigation />
      <Feedback {...feedback} />
      <div className="gm-split">
        <div className="gm-main">
          <Section
            className="crm-routing-policy"
            title={t('Routing policy', 'سياسة التوزيع')}
          >
            <div className="gm-choice-row">
              {(['round-robin', 'manual'] as const).map((method) => (
                <button
                  key={method}
                  className={state.assignMethod === method ? 'chosen' : ''}
                  aria-pressed={state.assignMethod === method}
                  onClick={() => update((s) => ({...s, assignMethod: method}))}
                >
                  <b>
                    {method === 'round-robin'
                      ? t('Round-robin', 'توزيع دوري')
                      : t('Manual assignment', 'توزيع يدوي')}
                  </b>
                  <small>
                    {method === 'round-robin'
                      ? t(
                          'Rotate active available agents',
                          'تدوير المسؤولين المتاحين',
                        )
                      : t('Hold for a human owner', 'انتظار اختيار المسؤول')}
                  </small>
                </button>
              ))}
            </div>
            <h3 className="gm-inner-heading">
              {t('Agent eligibility & availability', 'أهلية المسؤولين وتوفرهم')}
            </h3>
            <div className="crm-agent-list">
              {crmAgents.map((agent) => (
                <div key={agent}>
                  <strong>{agent}</strong>
                  <label>
                    <input
                      type="checkbox"
                      aria-label={t(`Active ${agent}`, `نشط ${agent}`)}
                      checked={state.activeAgents.includes(agent)}
                      onChange={(e) =>
                        update((s) => ({
                          ...s,
                          activeAgents: e.target.checked
                            ? [...new Set([...s.activeAgents, agent])]
                            : s.activeAgents.filter((a) => a !== agent),
                        }))
                      }
                    />
                    {t('Active', 'نشط')}
                  </label>
                  <label>
                    <input
                      type="checkbox"
                      aria-label={t(`Available ${agent}`, `متاح ${agent}`)}
                      checked={!state.crm.unavailableAgents.includes(agent)}
                      onChange={(e) =>
                        crmCommand({
                          type: 'availability',
                          agent,
                          available: e.target.checked,
                        })
                      }
                    />
                    {t('Available (simulation)', 'متاح (محاكاة)')}
                  </label>
                </div>
              ))}
            </div>
            <label className="px-field">
              {t('Fallback assignee', 'المسؤول الاحتياطي')}
              <select
                value={state.fallbackAgent}
                onChange={(e) =>
                  update((s) => ({...s, fallbackAgent: e.target.value}))
                }
              >
                {crmAgents.map((a) => (
                  <option key={a}>{a}</option>
                ))}
              </select>
            </label>
            <p>
              {t(
                'If no rotating agent is eligible, use an available fallback. Otherwise the lead remains unassigned with a recorded reason.',
                'إذا لم يتوفر مسؤول مؤهل، يُستخدم الاحتياطي المتاح، وإلا يبقى العميل دون توزيع مع تسجيل السبب.',
              )}
            </p>
          </Section>
        </div>
        <aside className="gm-aside">
          <div className="gm-context">
            <span className="px-overline">
              {t('NEXT ACCEPTED EVENT', 'الحدث المقبول التالي')}
            </span>
            <h3>{t('A predictable next owner.', 'المسؤول التالي واضح.')}</h3>
            <dl>
              <div>
                <dt>{t('Policy', 'السياسة')}</dt>
                <dd>{state.assignMethod}</dd>
              </div>
              <div>
                <dt>{t('Assigned to', 'المسؤول')}</dt>
                <dd>{next.agent ?? t('Unassigned', 'غير موزع')}</dd>
              </div>
              <div>
                <dt>{t('Rotation cursor', 'موضع الدوران')}</dt>
                <dd>{state.crm.cursor}</dd>
              </div>
              <div>
                <dt>{t('Reason', 'السبب')}</dt>
                <dd>{next.reason}</dd>
              </div>
            </dl>
            <button
              className="px-button px-button-dark"
              onClick={() => {
                const propertyId = Object.keys(state.properties)[0];
                if (!propertyId) {
                  setFeedback({error: 'Create a canonical property first.'});
                  return;
                }
                const r = crmCommand({
                  type: 'intake',
                  source: 'Website',
                  payload: exampleLeadPayload('Website', propertyId),
                  acknowledged: true,
                });
                setFeedback({
                  ...r,
                  message: r.error
                    ? undefined
                    : t(
                        'Fictional lead created using the shared intake and routing engine.',
                        'تم إنشاء عميل خيالي عبر محرك الاستقبال والتوزيع المشترك.',
                      ),
                });
              }}
            >
              {t('Simulate another lead', 'محاكاة عميل آخر')}
            </button>
            <p>
              {t(
                'Creates a fictional local lead. No production authorization, concurrency or durable routing guarantee.',
                'ينشئ عميلاً محلياً خيالياً. لا يوفر صلاحيات إنتاجية أو ضمان تزامن أو دوام.',
              )}
            </p>
          </div>
        </aside>
      </div>
      <AssignmentHistory leads={state.crm.leads} />
      <CrmDisclosure />
    </>
  );
}
export function CrmFeedback(props: {error: string | null; message?: string}) {
  return <Feedback {...props} />;
}
export function CrmEmpty({children}: {children: ReactNode}) {
  return <div className="crm-empty">{children}</div>;
}

export function PropertyLeadEnquiries({propertyId}: {propertyId: string}) {
  const {state, hydrated} = useGeminiDemo();
  const t = useCrmCopy();
  if (!hydrated) return <CrmLoading />;
  if (!Object.hasOwn(state.properties, propertyId))
    return (
      <p role="alert">
        {t('Unknown canonical property.', 'العقار الأساسي غير موجود.')}
      </p>
    );
  const leads = state.crm.leads.filter((l) => l.propertyId === propertyId);
  return (
    <Section
      className="crm-property-enquiries"
      title={t('Related enquiries', 'الاستفسارات المرتبطة')}
      subtitle={`${leads.length} ${t('local leads linked to this canonical property', 'عملاء محليون مرتبطون بهذا العقار الأساسي')}`}
      actions={
        <Link
          className="px-button px-button-dark"
          href={`/workspace/leads?property=${propertyId}&intake=1`}
        >
          {t('Simulate an enquiry', 'محاكاة استفسار')}
        </Link>
      }
    >
      {leads.length ? (
        <div
          className="px-table-scroll"
          tabIndex={0}
          role="region"
          aria-label={t('Property lead records', 'سجلات عملاء العقار')}
        >
          <table className="px-table">
            <thead>
              <tr>
                <th>{t('Lead', 'العميل')}</th>
                <th>{t('Source', 'المصدر')}</th>
                <th>{t('Stage', 'المرحلة')}</th>
                <th>{t('Owner', 'المسؤول')}</th>
              </tr>
            </thead>
            <tbody>
              {leads.map((l) => (
                <tr key={l.id}>
                  <td>
                    <Link href={`/workspace/leads/${l.id}`}>
                      <b>{l.identity.alias}</b>
                      <small>{l.id}</small>
                    </Link>
                  </td>
                  <td>
                    {l.source}
                    <small>{l.sourceEventId}</small>
                  </td>
                  <td>{t(l.stage, stageAr[l.stage])}</td>
                  <td>{l.assignee ?? t('Unassigned', 'غير موزع')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <CrmEmpty>
          {t(
            'No local enquiries for this property yet. Simulate a fictional source event to begin.',
            'لا توجد استفسارات محلية لهذا العقار بعد. ابدأ بمحاكاة حدث خيالي.',
          )}
        </CrmEmpty>
      )}
      <div className="px-narrative-row">
        <Link
          className="px-text-link"
          href={`/workspace/leads?property=${propertyId}`}
        >
          {t('Open filtered lead manager', 'فتح إدارة العملاء المرشحة')} →
        </Link>
      </div>
    </Section>
  );
}
