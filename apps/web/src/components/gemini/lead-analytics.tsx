'use client';
import {useState} from 'react';
import {Link} from '@/i18n/navigation';
import {Intro, Notice, Section, Pill} from '@/components/prototype/primitives';
import {
  crmAgents,
  leadSources,
  leadMetrics,
  selectLeads,
  qatarDate,
  type LeadSource,
  type Viewing,
} from '@/lib/lead-crm';
import {useGeminiDemo} from './demo-provider';
import {
  CrmNavigation,
  CrmDisclosure,
  CrmLoading,
  CrmFeedback,
  CrmEmpty,
  useCrmCopy,
} from './lead-workspace';
export function ChannelAnalytics() {
  const {state, hydrated, crmCommand} = useGeminiDemo();
  const t = useCrmCopy();
  const [scope, setScope] = useState('All');
  const [property, setProperty] = useState('All');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [period, setPeriod] = useState('all');
  const [spendSource, setSpendSource] = useState<LeadSource>('Meta Lead Ads');
  const [spendDate, setSpendDate] = useState(
    qatarDate(new Date().toISOString()),
  );
  const [amount, setAmount] = useState('');
  const [feedback, setFeedback] = useState<{
    error: string | null;
    message?: string;
  }>({error: null});
  if (!hydrated) return <CrmLoading />;
  const invalidDates = !!(from && to && from > to);
  const filter = {source: scope, propertyId: property, from, to};
  const leads = invalidDates ? [] : selectLeads(state.crm, filter);
  const metrics = leadMetrics(leads);
  const sources = leadSources.filter((s) => scope === 'All' || scope === s);
  const spendFor = (source: LeadSource) =>
    state.crm.spend.filter(
      (s) =>
        s.source === source &&
        (!from || s.date >= from) &&
        (!to || s.date <= to),
    );
  return (
    <>
      <Intro
        eyebrow={t(
          'ANALYTICS / CHANNEL ATTRIBUTION',
          'التحليلات / إسناد القنوات',
        )}
        title={t(
          'See which channels create opportunities.',
          'تعرّف على القنوات التي تصنع الفرص.',
        )}
        description={t(
          'Counts derive from the shared local CRM. First-touch source stays attached to each lead. No portal traffic or revenue is measured.',
          'الأعداد مستمدة من سجل العملاء المحلي المشترك. يبقى المصدر الأول مرتبطاً بكل عميل. لا قياس لزيارات البوابات أو الإيرادات.',
        )}
        action={
          <Link className="px-button px-button-outline" href="/workspace/leads">
            {t('Open CRM', 'فتح إدارة العملاء')}
          </Link>
        }
      />
      <CrmNavigation />
      <div className="crm-filters">
        <label className="px-field">
          {t('Period', 'الفترة')}
          <select
            value={period}
            onChange={(e) => {
              setPeriod(e.target.value);
              if (e.target.value === 'all') {
                setFrom('');
                setTo('');
              } else {
                const end = qatarDate(new Date().toISOString());
                setTo(end);
                setFrom(
                  new Date(
                    Date.parse(end) -
                      Number(e.target.value) * 86400000 +
                      86400000,
                  )
                    .toISOString()
                    .slice(0, 10),
                );
              }
            }}
          >
            <option value="all">
              {t('All local history', 'كل السجل المحلي')}
            </option>
            <option value="7">{t('Last 7 days', 'آخر ٧ أيام')}</option>
            <option value="30">{t('Last 30 days', 'آخر ٣٠ يوماً')}</option>
            <option value="90">{t('Last 90 days', 'آخر ٩٠ يوماً')}</option>
          </select>
        </label>
        <label className="px-field">
          {t('Source', 'المصدر')}
          <select value={scope} onChange={(e) => setScope(e.target.value)}>
            <option value="All">{t('All channels', 'كل القنوات')}</option>
            {leadSources.map((s) => (
              <option key={s}>{s}</option>
            ))}
          </select>
        </label>
        <label className="px-field">
          {t('Property', 'العقار')}
          <select
            value={property}
            onChange={(e) => setProperty(e.target.value)}
          >
            <option value="All">{t('All properties', 'كل العقارات')}</option>
            {Object.keys(state.properties).map((id) => (
              <option key={id}>{id}</option>
            ))}
          </select>
        </label>
        <label className="px-field">
          {t('From date', 'من تاريخ')}
          <input
            type="date"
            value={from}
            onChange={(e) => {
              setFrom(e.target.value);
              setPeriod('all');
            }}
          />
        </label>
        <label className="px-field">
          {t('To date', 'إلى تاريخ')}
          <input
            type="date"
            value={to}
            onChange={(e) => {
              setTo(e.target.value);
              setPeriod('all');
            }}
          />
        </label>
      </div>
      {invalidDates && (
        <p role="alert">
          {t(
            'From date must be on or before To date.',
            'يجب أن يكون تاريخ البداية قبل النهاية أو مساوياً له.',
          )}
        </p>
      )}
      <p className="crm-muted">
        {t(
          'Inclusive received-date window · Qatar time (UTC+03). Fictional seed records and local actions only.',
          'الفترة تشمل تاريخ الاستقبال بتوقيت قطر. سجلات أولية خيالية وإجراءات محلية فقط.',
        )}
      </p>
      <div className="gm-report-lead">
        <div>
          <span className="px-overline">
            {t(
              'QUALIFIED / SELECTED LOCAL COHORT',
              'المؤهلون / المجموعة المحلية المحددة',
            )}
          </span>
          <strong data-testid="qualified-total">{metrics.qualified}</strong>
          <p>
            {metrics.total}{' '}
            {t(
              'local leads · no live analytics connection',
              'عميل محلي · لا اتصال تحليلات حي',
            )}
          </p>
        </div>
        <div>
          <span>{t('WON / TOTAL LEADS', 'الناجحون / إجمالي العملاء')}</span>
          <b>{metrics.conversion.toFixed(1)}%</b>
          <small>
            {metrics.won} / {metrics.total} ·{' '}
            {t('local stage conversion', 'تحويل المرحلة المحلي')}
          </small>
        </div>
      </div>
      <div className="crm-summary">
        <span>
          <b data-testid="lead-total">{metrics.total}</b>{' '}
          {t('total', 'الإجمالي')}
        </span>
        <span>
          <b>{metrics.new}</b> {t('new', 'جديد')}
        </span>
        <span>
          <b data-testid="assignment-backlog">{metrics.backlog}</b>{' '}
          {t('assignment backlog', 'بانتظار التوزيع')}
        </span>
        <span>
          <b>
            {metrics.responseMinutes === null
              ? '—'
              : `${metrics.responseMinutes.toFixed(1)} min`}
          </b>{' '}
          {t('first local reply average', 'متوسط أول رد محلي')} (
          {metrics.responseSamples} {t('samples', 'عينات')})
        </span>
      </div>
      <Section
        className="crm-report-section"
        title={t('Channel contribution', 'مساهمة القنوات')}
        subtitle={t(
          'Source is the immutable original event provider. CPQL uses only explicit fictional spend in the same date window; unavailable for property-filtered cohorts.',
          'المصدر هو مزود الحدث الأصلي. تُحسب التكلفة من الإنفاق الخيالي الصريح في الفترة نفسها، ولا تتوفر للمجموعات المرشحة بعقار.',
        )}
      >
        <div
          className="px-table-scroll"
          tabIndex={0}
          role="region"
          aria-label={t('Channel contribution table', 'جدول مساهمة القنوات')}
        >
          <table className="px-table">
            <thead>
              <tr>
                {[
                  t('Source', 'المصدر'),
                  t('Leads', 'العملاء'),
                  t('New', 'جديد'),
                  t('Qualified', 'مؤهل'),
                  t('Won / conversion', 'ناجح / التحويل'),
                  t('Backlog', 'الانتظار'),
                  t('Fictional spend (QAR)', 'الإنفاق الخيالي (ر.ق)'),
                  t('Cost / qualified (QAR)', 'تكلفة / مؤهل (ر.ق)'),
                ].map((s) => (
                  <th key={s}>{s}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {sources.map((source) => {
                const m = leadMetrics(leads.filter((l) => l.source === source));
                const spend = spendFor(source);
                const cost = spend.reduce((a, s) => a + s.qar, 0);
                const measurable =
                  spend.length > 0 && property === 'All' && !invalidDates;
                return (
                  <tr key={source} data-channel={source}>
                    <td>
                      <b>{source}</b>
                    </td>
                    <td>{m.total}</td>
                    <td>{m.new}</td>
                    <td>{m.qualified}</td>
                    <td>
                      {m.won} / {m.conversion.toFixed(1)}%
                    </td>
                    <td>{m.backlog}</td>
                    <td>
                      {measurable
                        ? cost.toFixed(2)
                        : t('Unavailable', 'غير متاح')}
                    </td>
                    <td>
                      {measurable && m.qualified
                        ? (cost / m.qualified).toFixed(2)
                        : '—'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {!leads.length && (
          <CrmEmpty>
            {t(
              'No local leads in this cohort. Adjust filters or simulate intake.',
              'لا عملاء محليون في هذه المجموعة. عدّل المرشحات أو حاكِ الاستقبال.',
            )}
          </CrmEmpty>
        )}
      </Section>
      <Section
        className="crm-report-section"
        title={t('Property-level lead performance', 'أداء العملاء لكل عقار')}
        subtitle={t(
          'Counts use the same selected source and received-date cohort.',
          'الأعداد تستخدم المصدر والفترة المحددين نفسيهما.',
        )}
      >
        <div className="px-table-scroll" tabIndex={0}>
          <table className="px-table">
            <thead>
              <tr>
                <th>{t('Canonical property', 'العقار الأساسي')}</th>
                <th>{t('Leads', 'العملاء')}</th>
                <th>{t('Qualified', 'مؤهل')}</th>
                <th>{t('Won', 'ناجح')}</th>
              </tr>
            </thead>
            <tbody>
              {Object.values(state.properties)
                .filter((p) => property === 'All' || p.id === property)
                .map((p) => {
                  const m = leadMetrics(
                    leads.filter((l) => l.propertyId === p.id),
                  );
                  return (
                    <tr key={p.id}>
                      <td>
                        <Link href={`/workspace/inventory/${p.id}`}>
                          <b>{p.id}</b>
                          <small>
                            {t(
                              p.facts.titleEn || 'Untitled',
                              p.facts.titleAr || 'بدون عنوان',
                            )}
                          </small>
                        </Link>
                      </td>
                      <td>{m.total}</td>
                      <td>{m.qualified}</td>
                      <td>{m.won}</td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
        </div>
      </Section>
      <Section
        className="crm-report-section"
        title={t('Explicit fictional spend', 'إنفاق خيالي صريح')}
        subtitle={t(
          'Add dated example costs only. This does not authorize spending. No costs are inferred from queued publishing or campaign drafts.',
          'أضف تكاليف مؤرخة خيالية فقط. لا يصرّح هذا بالإنفاق، ولا تُستنتج تكاليف من النشر أو مسودات الحملات.',
        )}
      >
        <form
          className="crm-spend-form"
          onSubmit={(e) => {
            e.preventDefault();
            const r = crmCommand({
              type: 'spend',
              source: spendSource,
              date: spendDate,
              qar: amount.trim() ? Number(amount) : NaN,
            });
            setFeedback({
              ...r,
              message: r.error
                ? undefined
                : t(
                    'Fictional spend input saved locally.',
                    'تم حفظ الإنفاق الخيالي محلياً.',
                  ),
            });
            if (!r.error) setAmount('');
          }}
        >
          <label className="px-field">
            {t('Spend source', 'مصدر الإنفاق')}
            <select
              value={spendSource}
              onChange={(e) => setSpendSource(e.target.value as LeadSource)}
            >
              {leadSources.map((s) => (
                <option key={s}>{s}</option>
              ))}
            </select>
          </label>
          <label className="px-field">
            {t('Spend date', 'تاريخ الإنفاق')}
            <input
              type="date"
              required
              value={spendDate}
              onChange={(e) => setSpendDate(e.target.value)}
            />
          </label>
          <label className="px-field">
            {t('Fictional amount QAR', 'المبلغ الخيالي ر.ق')}
            <input
              type="number"
              required
              min="0"
              max="10000000"
              step="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
          </label>
          <button className="px-button px-button-outline">
            {t('Add fictional spend', 'إضافة إنفاق خيالي')}
          </button>
        </form>
        <CrmFeedback {...feedback} />
        <details>
          <summary>
            {t('Saved fictional costs', 'التكاليف الخيالية المحفوظة')} (
            {state.crm.spend.length})
          </summary>
          <ul>
            {state.crm.spend.map((s) => (
              <li key={s.id}>
                {s.date} · {s.source} · QAR {s.qar.toFixed(2)}
              </li>
            ))}
          </ul>
        </details>
      </Section>
      <Notice>
        {t(
          'Portal views, ad reach, actual spend and revenue: unavailable. These are local workflow measurements, not verified financial ROI.',
          'زيارات البوابات والوصول الإعلاني والإنفاق الفعلي والإيرادات غير متاحة. هذه قياسات محلية وليست عائداً مالياً مؤكداً.',
        )}
      </Notice>
      <CrmDisclosure />
    </>
  );
}
export function ViewingsPage({initialLead}: {initialLead?: string}) {
  const {state, hydrated, crmCommand} = useGeminiDemo();
  const t = useCrmCopy();
  const [selected, setSelected] = useState(initialLead ?? '');
  const [agent, setAgent] = useState('Fatima Noor');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('10:00');
  const [feedback, setFeedback] = useState<{
    error: string | null;
    message?: string;
  }>({error: null});
  if (!hydrated) return <CrmLoading />;
  const lead = selected
    ? state.crm.leads.find((l) => l.id === selected)
    : state.crm.leads[0];
  const requests = state.crm.leads.flatMap((l) =>
    l.viewings.map((v) => ({...v, lead: l})),
  );
  function status(
    leadId: string,
    viewingId: string,
    status: Viewing['status'],
  ) {
    const r = crmCommand({type: 'view-status', leadId, viewingId, status});
    setFeedback({
      ...r,
      message: r.error
        ? undefined
        : t('Viewing status saved locally.', 'تم حفظ حالة المعاينة محلياً.'),
    });
  }
  return (
    <>
      <Intro
        eyebrow={t('CRM / VIEWING REQUESTS', 'العملاء / طلبات المعاينة')}
        title={t('Organize property viewings', 'تنظيم معاينات العقارات')}
        description={t(
          'Request and manage a viewing linked to the lead’s canonical property. All times use Qatar UTC+03. No calendar is connected.',
          'اطلب معاينة مرتبطة بعقار العميل الأساسي وأدرها. جميع الأوقات بتوقيت قطر. لا اتصال بتقويم.',
        )}
      />
      <CrmNavigation />
      <CrmFeedback {...feedback} />
      <div className="gm-split">
        <div className="gm-main">
          <Section
            title={t('Request a viewing', 'طلب معاينة')}
            subtitle={t(
              'Local overlapping requests are checked. Example availability: Saturday–Thursday, 09:00–18:00, one-hour slots.',
              'تُفحص الطلبات المحلية المتعارضة. التوفر التجريبي من السبت إلى الخميس، من ٩ إلى ١٨، لمدة ساعة.',
            )}
          >
            <form
              className="gm-booking-form"
              onSubmit={(e) => {
                e.preventDefault();
                if (!lead) {
                  setFeedback({error: 'Choose an existing local lead.'});
                  return;
                }
                const r = crmCommand({
                  type: 'view',
                  leadId: lead.id,
                  date,
                  time,
                  agent,
                });
                setFeedback({
                  ...r,
                  message: r.error
                    ? undefined
                    : t(
                        'Local viewing request recorded. No calendar or customer notification sent.',
                        'تم تسجيل طلب المعاينة محلياً. لم يُرسل إشعار أو دعوة تقويم.',
                      ),
                });
              }}
            >
              <div className="px-field-grid">
                <label className="px-field">
                  {t('Lead', 'العميل')}
                  <select
                    value={lead?.id ?? ''}
                    onChange={(e) => {
                      setSelected(e.target.value);
                      setFeedback({error: null});
                    }}
                  >
                    {!lead && (
                      <option value="">
                        {t('Select an existing lead', 'اختر عميلاً موجوداً')}
                      </option>
                    )}
                    {state.crm.leads.map((l) => (
                      <option key={l.id} value={l.id}>
                        {l.identity.alias} · {l.id}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="px-field">
                  {t('Linked canonical property', 'العقار الأساسي المرتبط')}
                  <input
                    readOnly
                    value={
                      lead?.propertyId ?? t('No matching lead', 'لا عميل مطابق')
                    }
                  />
                </label>
                <label className="px-field">
                  {t('Requested date', 'التاريخ المطلوب')}
                  <input
                    type="date"
                    required
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                  />
                </label>
                <label className="px-field">
                  {t('Requested time', 'الوقت المطلوب')}
                  <input
                    type="time"
                    required
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                  />
                </label>
                <label className="px-field">
                  {t('Viewing agent', 'مسؤول المعاينة')}
                  <select
                    value={agent}
                    onChange={(e) => setAgent(e.target.value)}
                  >
                    {crmAgents.map((a) => (
                      <option
                        key={a}
                        disabled={state.crm.unavailableAgents.includes(a)}
                      >
                        {a}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
              <button className="px-button px-button-dark" disabled={!lead}>
                {t('Add demo request', 'إضافة طلب تجريبي')}
              </button>
            </form>
          </Section>
        </div>
        <aside className="gm-aside">
          <div className="gm-context">
            <span className="px-overline">
              {t('LOCAL SCHEDULING', 'جدولة محلية')}
            </span>
            <h3>{t('Keep every request in context.', 'كل طلب في سياقه.')}</h3>
            <p>
              {t(
                'Property follows the selected lead and cannot be independently changed. A cancellation releases the local slot. No live calendar, booking guarantee or invitation.',
                'يتبع العقار العميل المحدد ولا يمكن تغييره مستقلاً. يلغي الإلغاء حجز الفترة المحلية. لا تقويم حي أو ضمان حجز أو دعوة.',
              )}
            </p>
          </div>
        </aside>
      </div>
      <Section
        title={t('Viewing request agenda', 'جدول طلبات المعاينة')}
        subtitle={t(
          'Persisted in each shared lead record. Requested → Confirmed → Completed, or Cancelled.',
          'محفوظ في سجل العميل المشترك. مطلوب ثم مؤكد ثم مكتمل، أو ملغى.',
        )}
      >
        {requests.length ? (
          <div className="px-table-scroll" tabIndex={0}>
            <table className="px-table">
              <thead>
                <tr>
                  {[
                    t('Lead / property', 'العميل / العقار'),
                    t('Date / time (Qatar)', 'التاريخ / الوقت (قطر)'),
                    t('Agent', 'المسؤول'),
                    t('Status', 'الحالة'),
                    t('Actions', 'الإجراءات'),
                  ].map((s) => (
                    <th key={s}>{s}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {requests.map((v) => (
                  <tr key={v.id}>
                    <td>
                      <Link href={`/workspace/leads/${v.lead.id}`}>
                        <b>{v.lead.identity.alias}</b>
                        <small>{v.lead.propertyId}</small>
                      </Link>
                    </td>
                    <td>
                      {v.date} · {v.time} +03
                    </td>
                    <td>{v.agent}</td>
                    <td>
                      <Pill
                        tone={v.status === 'Cancelled' ? 'neutral' : 'info'}
                      >
                        {t(
                          `${v.status} (local)`,
                          {
                            Requested: 'مطلوب (محلي)',
                            Confirmed: 'مؤكد (محلي)',
                            Completed: 'مكتمل (محلي)',
                            Cancelled: 'ملغى (محلي)',
                          }[v.status],
                        )}
                      </Pill>
                    </td>
                    <td>
                      <div className="crm-actions">
                        {v.status === 'Requested' && (
                          <button
                            className="px-mini-action"
                            onClick={() => status(v.lead.id, v.id, 'Confirmed')}
                          >
                            {t('Confirm locally', 'تأكيد محلي')}
                          </button>
                        )}
                        {v.status === 'Confirmed' && (
                          <button
                            className="px-mini-action"
                            onClick={() => status(v.lead.id, v.id, 'Completed')}
                          >
                            {t('Complete', 'إكمال')}
                          </button>
                        )}
                        {['Requested', 'Confirmed'].includes(v.status) && (
                          <button
                            className="px-mini-action"
                            onClick={() => status(v.lead.id, v.id, 'Cancelled')}
                          >
                            {t('Cancel', 'إلغاء')}
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <CrmEmpty>
            {t(
              'No viewing requests yet. Select a lead and request a local slot.',
              'لا توجد طلبات معاينة بعد. اختر عميلاً واطلب فترة محلية.',
            )}
          </CrmEmpty>
        )}
      </Section>
      <CrmDisclosure />
    </>
  );
}
