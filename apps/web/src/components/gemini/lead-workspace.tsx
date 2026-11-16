'use client';
import {activeEnquiry,lastLeadActivity,unansweredEnquiry} from '@/lib/daily-workspace';
import {UnsavedChanges} from '@/components/prototype/unsaved-changes';
import {SearchCombobox} from '@/components/ui/search-combobox';
import {NativeSelect} from '@/components/ui/field';
import {LeadAssistance} from '@/components/agency/lead-assistance';
import {usePrototypeCopy} from '@/components/prototype/use-prototype-copy';
import {can} from '@/lib/organization-engine';
import {useEffect,useRef,useState, type ReactNode} from 'react';
import {useLocale} from 'next-intl';
import {Link, usePathname} from '@/i18n/navigation';
import {Intro, Notice, Pill, Section} from '@/components/prototype/primitives';
import {
  crmAgentNames,
  availableMember,
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
import {activeOrganizationId} from '@/lib/organization-engine';
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
export function CrmNavigation() {const copyText=usePrototypeCopy();
  const t = useCrmCopy();
  const path = usePathname();
  return (
    <nav
      className="px-subnav crm-nav"
      aria-label={copyText(t('CRM navigation', 'تنقل إدارة العملاء'))}
    >
      {[
        ['/workspace/leads', 'Enquiries', 'الاستفسارات'],
        ['/workspace/inbox', 'Inbox', 'المحادثات'],
        ['/workspace/leads/assignment', 'Assignment', 'التوزيع'],
        ['/workspace/leads/viewings', 'Viewings', 'المعاينات'],
        ['/workspace/analytics', 'Performance', 'الأداء'],
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
          {copyText(t(en, ar))}
        </Link>
      ))}
    </nav>
  );
}
export function CrmDisclosure() {const copyText=usePrototypeCopy();
  const t = useCrmCopy();
  return (
    <Notice>
      {copyText(t(
        'Fictional browser-local demo. Enter fictional notes only. No provider webhook, message, calendar or analytics connection. Browser state is editable and is not production authorization.',
        'عرض تجريبي محلي ببيانات خيالية فقط. لا اتصال بمزودي الخدمات أو الرسائل أو التقويم أو التحليلات. حالة المتصفح ليست صلاحية إنتاجية.',
      ))}
    </Notice>
  );
}
export function CrmLoading() {const copyText=usePrototypeCopy();
  const t = useCrmCopy();
  return (
    <p role="status">
      {copyText(t('Loading local CRM…', 'جارٍ تحميل العملاء المحليين…'))}
    </p>
  );
}
function Feedback({error, message}: {error?: string | null; message?: string}) {const copyText=usePrototypeCopy();
  return error ? (
    <p className="crm-feedback crm-error" role="alert">
      {copyText(error)}
    </p>
  ) : message ? (
    <p className="crm-feedback" role="status">
      {copyText(message)}
    </p>
  ) : null;
}
function PropertyLabel({id}: {id: string}) {const copyText=usePrototypeCopy();
  const {state} = useGeminiDemo();
  const t = useCrmCopy();
  const p = state.properties[id];
  return (
    <>
      {copyText(id)} ·{copyText(' ')}
      {copyText(p
        ? t(
            p.facts.titleEn || 'Untitled property',
            p.facts.titleAr || 'عقار بدون عنوان',
          )
        : 'Missing property')}
    </>
  );
}
export function LeadIntake({initialProperty}: {initialProperty?: string}) {const copyText=usePrototypeCopy();
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
      undefined,undefined,activeOrganizationId(state.organization),
    ),
  );
  const [ack, setAck] = useState(false);
  const [feedback, setFeedback] = useState<{
    error: string | null;
    leadId?: string;
    message?: string;
  }>({error: null});
  function load(s: LeadSource, p: string) {
    setPayload(exampleLeadPayload(s, p,undefined,undefined,activeOrganizationId(state.organization)));
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
            {copyText(t(
              'Create a canonical property before simulating intake.',
              'أنشئ عقاراً أساسياً قبل محاكاة الاستقبال.',
            ))}{copyText(' ')}
            <Link href="/workspace/inventory/new">
              {copyText(t('Create property', 'إنشاء عقار'))}
            </Link>
          </p>
        )}
        <div className="px-field-grid">
          <label className="px-field">
            {copyText(t('Intake source', 'مصدر الاستقبال'))}
            <NativeSelect
              value={source}
              onChange={(e) => {
                const s = e.target.value as LeadSource;
                setSource(s);
                load(s, property);
              }}
            >
              {leadSources.map((s) => (
                <option key={s} value={s}>{copyText(s)}</option>
              ))}
            </NativeSelect>
          </label>
          <label className="px-field">
            {copyText(t('Canonical property', 'العقار الأساسي'))}
            <NativeSelect
              value={property}
              onChange={(e) => {
                setProperty(e.target.value);
                load(source, e.target.value);
              }}
            >
              {!Object.hasOwn(state.properties, property) && (
                <option value={property}>
                  {copyText(t('Unknown canonical property', 'العقار الأساسي غير موجود'))}
                </option>
              )}
              {Object.values(state.properties).map((p) => (
                <option key={p.id} value={p.id}>
                  {copyText(p.id)} ·{copyText(' ')}
                  {copyText(t(
                    p.facts.titleEn || 'Untitled',
                    p.facts.titleAr || 'بدون عنوان',
                  ))}
                </option>
              ))}
            </NativeSelect>
          </label>
        </div>
        <label className="px-field">
          {copyText(t('Internal example payload', 'بيانات المثال الداخلي'))}
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
          {copyText(t(
            'I acknowledge this is fictional local intake; no personal data or real webhook.',
            'أقر بأن هذا استقبال محلي خيالي، دون بيانات شخصية أو اتصال حي.',
          ))}
        </label>
        <div className="crm-actions">
          <button
            className="px-button px-button-dark"
            disabled={!ack || !Object.hasOwn(state.properties, property)}
          >
            {copyText(t('Process example event', 'معالجة الحدث التجريبي'))}
          </button>
          <button
            type="button"
            className="px-button px-button-outline"
            onClick={() => load(source, property)}
          >
            {copyText(t('New example identity', 'معرّف حدث جديد'))}
          </button>
        </div>
        <Feedback {...feedback} />
        {feedback.leadId && (
          <Link
            className="px-text-link"
            href={`/workspace/leads/${feedback.leadId}`}
          >
            {copyText(t('Open resulting lead', 'فتح العميل الناتج'))} →
          </Link>
        )}
      </form>
      <details className="crm-receipts">
        <summary>
          {copyText(t('Intake receipt ledger', 'سجل أحداث الاستقبال'))} (
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
                    {copyText(r.status)}
                  </Pill>
                  <span>
                    {r.source} · {copyText(r.eventId ?? '—')}
                  </span>
                  <small>
                    {copyText(r.detail)} · {copyText(r.at)}
                  </small>
                  {r.leadId && (
                    <Link href={`/workspace/leads/${r.leadId}`}>
                      {copyText(r.leadId)}
                    </Link>
                  )}
                </li>
              ))}
          </ol>
        ) : (
          <p>
            {copyText(t(
              'No simulated events received yet.',
              'لم يتم استقبال أحداث تجريبية بعد.',
            ))}
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
}) {const copyText=usePrototypeCopy();const ar=useLocale()==='ar';
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
  const [work,setWork]=useState('all');
  if (!hydrated) return <CrmLoading />;
  const filtered = state.crm.leads.filter(
    (l) =>
      (work==='all'||work==='unanswered'&&activeEnquiry(l)&&unansweredEnquiry(l)||work==='qualified'&&l.qualification==='Qualified'||work==='viewing'&&l.stage==='Viewing') &&
      (source === 'All' || l.source === source) &&
      (property === 'All' || l.propertyId === property) &&
      (owner === 'All' ||
        (owner === 'Unassigned' ? !l.assignee : l.assignee === owner)) &&
      (stage === 'All' || l.stage === stage) &&
      (priority === 'All' || l.priority === priority) &&
      (qualification === 'All' || l.qualification === qualification) &&
      `${l.identity.alias} ${l.id} ${l.propertyId} ${state.properties[l.propertyId]?.facts.titleEn} ${state.properties[l.propertyId]?.facts.titleAr} ${l.sourceEventId}`
        .toLowerCase()
        .includes(search.trim().toLowerCase()),
  ).sort((a,b)=>lastLeadActivity(b).localeCompare(lastLeadActivity(a))||a.id.localeCompare(b.id));
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
            {copyText(t('Lead intake simulator', 'محاكي استقبال العملاء'))}
          </button>
        }
      />
      <CrmNavigation />
      <div
        className="crm-summary"
        aria-label={copyText(t('Local lead totals', 'إجماليات العملاء المحليين'))}
      >
        <span>
          <b>{metrics.total}</b> {copyText(t('local leads', 'عميل محلي'))}
        </span>
        <span>
          <b>{metrics.new}</b> {copyText(t('new', 'جديد'))}
        </span>
        <span>
          <b>{metrics.qualified}</b> {copyText(t('qualified', 'مؤهل'))}
        </span>
        <span>
          <b>{metrics.backlog}</b> {copyText(t('assignment backlog', 'بانتظار التوزيع'))}
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
              {copyText(t('Table', 'جدول'))}
            </button>
            <button
              className="px-mini-action"
              aria-pressed={view === 'pipeline'}
              onClick={() => setView('pipeline')}
            >
              {copyText(t('Pipeline', 'مسار'))}
            </button>
          </div>
        }
      >
        <div className="crm-quick-filters" aria-label={t('Quick lead filters','فلاتر سريعة للاستفسارات')}><button type="button" aria-pressed={work==='unanswered'} onClick={()=>setWork(work==='unanswered'?'all':'unanswered')}>{t('Unanswered recorded messages','رسائل مسجلة دون رد')} · {state.crm.leads.filter(l=>activeEnquiry(l)&&unansweredEnquiry(l)).length}</button><button type="button" aria-pressed={work==='qualified'} onClick={()=>setWork(work==='qualified'?'all':'qualified')}>{t('Qualified','مؤهل')}</button><button type="button" aria-pressed={work==='viewing'} onClick={()=>setWork(work==='viewing'?'all':'viewing')}>{t('Viewing follow-up','متابعة المعاينات')}</button><button type="button" aria-pressed={owner==='Unassigned'} onClick={()=>setOwner(owner==='Unassigned'?'All':'Unassigned')}>{t('Needs assignment','بحاجة إلى تعيين')} · {state.crm.leads.filter(l=>!l.assignee).length}</button><button type="button" aria-pressed={stage==='New'} onClick={()=>setStage(stage==='New'?'All':'New')}>{t('New enquiries','الاستفسارات الجديدة')} · {metrics.new}</button>          <button
            className="px-mini-action"
            onClick={() => {
              setSearch('');setWork('all');
              setSource('All');
              setProperty('All');
              setOwner('All');
              setStage('All');
              setPriority('All');
              setQualification('All');
            }}
          >
            {copyText(t('Reset filters', 'إعادة ضبط'))}
          </button></div><div className="crm-filters">
          <label className="px-field">
            {copyText(t('Search leads', 'بحث العملاء'))}
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={copyText(t(
                'Identity, event, property or ID',
                'الهوية أو الحدث أو العقار أو المعرّف',
              ))}
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
              options: ['Unassigned', ...crmAgentNames(state)],
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
              {copyText(f.label)}
              <NativeSelect value={f.value} onChange={(e) => f.set(e.target.value)}>
                <option value="All">{copyText(t('All', 'الكل'))}</option>
                {f.options.map((o) => (
                  <option key={o} value={o}>
                    {copyText(state.properties[o] ? `${o} · ${state.properties[o].facts[ar?'titleAr':'titleEn']}` : leadStages.includes(o as LeadStage)
                      ? t(o, stageAr[o as LeadStage])
                      : o)}
                  </option>
                ))}
              </NativeSelect>
            </label>
          ))}

        </div>
        {!filtered.length ? (
          <div className="crm-empty">
            <h3>{copyText(t('No matching leads', 'لا توجد نتائج مطابقة'))}</h3>
            <p>
              {copyText(t(
                'Reset filters or simulate an enquiry for a canonical property.',
                'أعد ضبط المرشحات أو حاكِ استفساراً لعقار أساسي.',
              ))}
            </p>
          </div>
        ) : view === 'table' ? (
          <div
            className="px-table-scroll"
            tabIndex={0}
            role="region"
            aria-label={copyText(t('Lead records table', 'جدول العملاء'))}
          >
            <table className="px-table crm-table ag-daily-leads">
              <thead>
                <tr>
                  {[
                    'Lead',
                    'Source',
                    'Canonical property',
                    'Stage',
                    'Qualification',
                    'Owner',
                    'Last recorded activity',
                  ].map((s) => (
                    <th scope="col" key={s}>
                      {copyText(t(
                        s,
                        (
                          {
                            Lead: 'العميل',
                            'Source': 'المصدر',
                            'Canonical property': 'العقار الأساسي',
                            Stage: 'المرحلة',
                            Qualification: 'التأهيل',
                            Owner: 'المسؤول',
                            'Last recorded activity': 'آخر نشاط مسجل',
                          } as Record<string, string>
                        )[s],
                      ))}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((l) => (
                  <tr key={l.id} data-lead-id={l.id}>
                    <td>
                      <Link href={`/workspace/leads/${l.id}`}>
                        <b>{copyText(l.identity.alias)}</b>
                        <small>{copyText(l.id)}</small>
                      </Link><Link className="crm-row-action" href={!l.assignee?`/workspace/leads/${l.id}`:`/workspace/inbox?lead=${l.id}`}>{!l.assignee?t('Assign enquiry','تعيين الاستفسار'):unansweredEnquiry(l)?t('Reply in Inbox','الرد في الوارد'):t('Open conversation','فتح المحادثة')}</Link>
                    </td>
                    <td>
                      {copyText(l.source)}
                      <small>{unansweredEnquiry(l)?t('Latest message: inbound','آخر رسالة: واردة'):t('Local conversation','محادثة محلية')}</small>
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
                        {copyText(t(l.stage, stageAr[l.stage]))}
                      </Pill>
                    </td>
                    <td>
                      {copyText(t(
                        l.qualification,
                        {
                          Unreviewed: 'لم يراجع',
                          Qualified: 'مؤهل',
                          'Not qualified': 'غير مؤهل',
                        }[l.qualification],
                      ))}
                      <small>
                        {copyText(t(
                          l.priority,
                          l.priority === 'High' ? 'عالية' : 'عادية',
                        ))}
                      </small>
                    </td>
                    <td>{copyText(l.assignee ?? t('Unassigned', 'غير موزع'))}</td>
                    <td>
                      <time dateTime={lastLeadActivity(l)}>
                        {copyText(lastLeadActivity(l).slice(0, 16).replace('T', ' '))} {copyText(" UTC ")}</time>
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
            aria-label={copyText(t('Lead pipeline columns', 'أعمدة مسار العملاء'))}
          >
            {leadStages.map((s) => (
              <section key={s} className="crm-lane">
                <header>
                  <h3>{copyText(t(s, stageAr[s]))}</h3>
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
                      <b>{copyText(l.identity.alias)}</b>
                      <span>{copyText(l.source)}</span>
                      <small>{copyText(l.propertyId)}</small>
                      <small>{copyText(l.assignee ?? t('Unassigned', 'غير موزع'))}</small>
                    </Link>
                  ))}
                {!filtered.some((l) => l.stage === s) && (
                  <p>{copyText(t('No leads', 'لا عملاء'))}</p>
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
export function LeadDetail({id}: {id: string}) {const copyText=usePrototypeCopy();
  const {state, hydrated} = useGeminiDemo();
  const t = useCrmCopy();
  if (!hydrated) return <CrmLoading />;
  const lead = state.crm.leads.find((l) => l.id === id);
  if (!lead)
    return (
      <>
        <Intro
          eyebrow={copyText("CRM")}
          title={t('Lead not found', 'العميل غير موجود')}
          description={t(
            'This ID does not exist in the current local organization. No other lead has been substituted.',
            'هذا المعرّف غير موجود في المؤسسة المحلية الحالية. لم يتم استبداله بعميل آخر.',
          )}
        />
        <Link href="/workspace/leads">
          {copyText(t('Return to leads', 'العودة للعملاء'))}
        </Link>
      </>
    );
  return <LeadDossier key={id} lead={lead} />;
}
function LeadDossier({lead: l}: {lead: CanonicalLead}) {const copyText=usePrototypeCopy();
  const {state,crmCommand} = useGeminiDemo();
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
  const exampleOwner=state.organization.members.find(m=>m.organizationId===l.organizationId&&m.role==='owner'&&m.status==='active-demo');
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
            {copyText(t('Open conversation', 'فتح المحادثة'))}
          </Link>
        }
      />
      {l.sourceEventId.startsWith('DEMO-FIRST-')&&<div className="ag-first-enquiry"><strong>{t('Your fictional property enquiry','استفسار عقارك الخيالي')}</strong><p>{t('This example connects the property, source channel and agent follow-up. Review ownership below, then open the conversation to save a local reply.','يربط هذا المثال العقار وقناة المصدر ومتابعة الوكيل. راجع المسؤولية أدناه ثم افتح المحادثة لحفظ رد محلي.')}</p>{!l.assignee&&exampleOwner&&can(state.organization,'lead.assign')&&<><p>{t('No agent is assigned yet. For this example, make the demo owner available and assign this enquiry to them.','لم يُعيّن وكيل بعد. لهذا المثال، اجعل المالك التجريبي متاحاً وأسند إليه الاستفسار.')} <bdi>{exampleOwner.alias}</bdi></p><button type="button" className="px-button px-button-outline" onClick={()=>{if(run({type:'availability',agent:exampleOwner.alias,available:true}))run({type:'assign',leadId:l.id,agent:exampleOwner.alias});}}>{t('Make owner available & assign','إتاحة المالك وتعيينه')}</button></>}<div className="ag-action-row"><Link className="px-text-link" href={`/workspace/inventory/${l.propertyId}`}>{t('Back to property','العودة إلى العقار')}</Link><Link className="px-text-link" href="/workspace">{t('Back to dashboard','العودة إلى لوحة الوكالة')}</Link></div></div>}<CrmNavigation /><LeadAssistance leadId={l.id}/>
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
                {copyText(t('Lead stage', 'مرحلة العميل'))}
                <NativeSelect
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
                      {copyText(t(s, stageAr[s]))}
                    </option>
                  ))}
                </NativeSelect>
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
                <span>{copyText(t('Canonical property', 'العقار الأساسي'))}</span>
                <Link href={`/workspace/inventory/${l.propertyId}`}>
                  <PropertyLabel id={l.propertyId} />
                </Link>
              </div>
              <div>
                <span>
                  {copyText(t('Original source / event', 'المصدر / الحدث الأصلي'))}
                </span>
                <strong>
                  {copyText(l.source)} · {copyText(l.sourceEventId)}
                </strong>
              </div>
              <div>
                <span>{copyText(t('Source time', 'وقت المصدر'))}</span>
                <time>{copyText(l.sourceAt)}</time>
              </div>
              <div>
                <span>{copyText(t('Received time', 'وقت الاستقبال'))}</span>
                <time>{copyText(l.receivedAt)}</time>
              </div>
              <div>
                <span>{copyText(t('Destination / campaign', 'الوجهة / الحملة'))}</span>
                <strong>
                  {copyText(l.destination ?? '—')} / {l.campaign && state.campaigns.some(c=>c.id===l.campaign)?<Link href={`/workspace/campaigns/${l.campaign}`}>{copyText(l.campaign)}</Link>:l.campaign ?? '—'}
                </strong>
              </div>
              <div>
                <span>{copyText(t('Privacy-safe contact', 'بيانات تواصل خيالية'))}</span>
                <strong>{copyText(l.identity.email)}</strong>
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
              {copyText(t(
                'Allow local demonstration replies',
                'السماح بالردود التجريبية المحلية',
              ))}
            </label>
            <Link
              className="px-text-link"
              href={`/workspace/leads/viewings?lead=${l.id}`}
            >
              {copyText(t('Request a viewing', 'طلب معاينة'))} →
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
                  {copyText(t('Qualification status', 'حالة التأهيل'))}
                  <NativeSelect
                    value={qualification}
                    onChange={(e) =>
                      setQualification(e.target.value as typeof qualification)
                    }
                  >
                    {(
                      ['Unreviewed', 'Qualified', 'Not qualified'] as const
                    ).map((q) => (
                      <option key={q} value={q}>
                        {copyText(t(
                          q,
                          {
                            Unreviewed: 'لم يراجع',
                            Qualified: 'مؤهل',
                            'Not qualified': 'غير مؤهل',
                          }[q],
                        ))}
                      </option>
                    ))}
                  </NativeSelect>
                </label>
                <label className="px-field">
                  {copyText(t('Priority', 'الأولوية'))}
                  <NativeSelect
                    value={priority}
                    onChange={(e) =>
                      setPriority(e.target.value as typeof priority)
                    }
                  >
                    <option value="Normal">{copyText(t('Normal', 'عادية'))}</option>
                    <option value="High">{copyText(t('High', 'عالية'))}</option>
                  </NativeSelect>
                </label>
              </div>
              <label className="px-field">
                {copyText(t(
                  'Qualification / follow-up details',
                  'تفاصيل التأهيل والمتابعة',
                ))}
                <textarea
                  rows={3}
                  value={qualificationNote}
                  maxLength={2000}
                  onChange={(e) => setQualificationNote(e.target.value)}
                />
              </label>
              <button className="px-button px-button-outline">
                {copyText(t('Save qualification', 'حفظ التأهيل'))}
              </button>
            </form>
          </Section>
          <Section title={t('Internal notes', 'ملاحظات داخلية')}>
            <ul className="crm-timeline">
              {l.notes.map((n) => (
                <li key={n.id}>
                  <p dir="auto">{n.text}</p>
                  <small>{copyText(n.at)}</small>
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
                {copyText(t('Add fictional note', 'إضافة ملاحظة خيالية'))}
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
                {copyText(t('Add note', 'إضافة الملاحظة'))}
              </button>
            </form>
          </Section>
        </div>
        <aside>
          <Section title={t('Activity timeline', 'سجل النشاط')}>
            <ol className="crm-timeline">
              {[...l.activity].reverse().map((a) => (
                <li key={a.id}>
                  <p>{copyText(a.text)}</p>
                  <small>{copyText(a.at)}</small>
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
                  {copyText(v.date)} · {copyText(v.time)} +03 · {copyText(v.agent)} <Pill>{copyText(v.status)}</Pill>
                </p>
              ))
            ) : (
              <p>
                {copyText(t('No local viewing requests.', 'لا توجد طلبات معاينة محلية.'))}
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
}) {const copyText=usePrototypeCopy();
  const {state} = useGeminiDemo();
  const t = useCrmCopy();
  return <SearchCombobox label={copyText(label ?? t('Assigned agent', 'المسؤول'))} value={value} disabled={!can(state.organization,'lead.assign')} clearable placeholder={copyText(t('Unassigned', 'غير موزع'))} onValueChange={onChange} options={crmAgentNames(state).map(a=>({value:a,label:copyText(a),disabled:state.crm.unavailableAgents.includes(a)||!availableMember(state,a)}))}/>;
}
export function AssignmentHistory({leads}: {leads: CanonicalLead[]}) {const copyText=usePrototypeCopy();
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
              <th>{copyText(t('Lead', 'العميل'))}</th>
              <th>{copyText(t('Owner', 'المسؤول'))}</th>
              <th>{copyText(t('Decision', 'القرار'))}</th>
              <th>{copyText(t('Time', 'الوقت'))}</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id}>
                <td>
                  <Link href={`/workspace/leads/${r.leadId}`}>{copyText(r.leadId)}</Link>
                </td>
                <td>
                  {copyText(r.from ?? '—')} → {copyText(r.to ?? t('Unassigned', 'غير موزع'))}
                </td>
                <td>{copyText(r.reason)}</td>
                <td>{copyText(r.at)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {!rows.length && (
        <p>{copyText(t('No assignment decisions yet.', 'لا توجد قرارات توزيع بعد.'))}</p>
      )}
    </Section>
  );
}
export function InboxPage({initialLead}: {initialLead?: string}) {const copyText=usePrototypeCopy();const ar=useLocale()==='ar';
  const {state, hydrated, crmCommand} = useGeminiDemo();
  const t = useCrmCopy();
  const [selected, setSelected] = useState(initialLead ?? '');
  const [query,setQuery]=useState(''),[onlyUnanswered,setOnlyUnanswered]=useState(false),[pendingLead,setPendingLead]=useState<string|null>(null);const discardDialog=useRef<HTMLDialogElement>(null);const conversationTrigger=useRef<HTMLButtonElement|null>(null);
  useEffect(()=>{if(pendingLead)discardDialog.current?.showModal();},[pendingLead]);
  function cancelSwitch(){discardDialog.current?.close();setPendingLead(null);conversationTrigger.current?.focus();}
  function selectConversation(id:string){setSelected(id);setDraft('');setFeedback({error:null});const url=new URL(window.location.href);url.searchParams.set('lead',id);window.history.replaceState(null,'',url);}
  const [draft, setDraft] = useState('');
  const [feedback, setFeedback] = useState<{
    error: string | null;
    message?: string;
  }>({error: null});
  if (!hydrated) return <CrmLoading />;
  const conversations=state.crm.leads.filter(lead=>(!onlyUnanswered||activeEnquiry(lead)&&unansweredEnquiry(lead))&&`${lead.identity.alias} ${lead.source} ${state.properties[lead.propertyId]?.facts.titleEn} ${state.properties[lead.propertyId]?.facts.titleAr} ${lead.propertyId}`.toLowerCase().includes(query.trim().toLowerCase())).sort((a,b)=>lastLeadActivity(b).localeCompare(lastLeadActivity(a)));
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
      <UnsavedChanges dirty={!!draft.trim()}/><dialog ref={discardDialog} className="fx-dialog" aria-labelledby="discard-reply-title" onCancel={e=>{e.preventDefault();cancelSwitch();}}><div className="fx-dialog-body"><h2 id="discard-reply-title">{t('Leave this reply draft?','مغادرة مسودة الرد؟')}</h2><p>{t('This reply has not been saved. Keep editing or discard it to open another conversation.','لم يُحفظ الرد. تابع التحرير أو تجاهله لفتح محادثة أخرى.')}</p><div className="fx-dialog-actions"><button type="button" autoFocus className="px-button px-button-dark" onClick={cancelSwitch}>{t('Keep editing','متابعة التحرير')}</button><button type="button" className="px-button px-button-outline" onClick={()=>{const id=pendingLead;cancelSwitch();if(id)selectConversation(id);}}>{t('Discard reply draft','تجاهل مسودة الرد')}</button></div></div></dialog>
      <div className="px-inbox crm-inbox">
        <div className="px-inbox-list">
          <div className="px-inbox-list-header">
            <h2>{copyText(t('Conversations', 'المحادثات'))}</h2>
            <span>{state.crm.leads.length}</span>
          </div>
          <div className="ag-inbox-filters"><label className="px-field">{t('Search conversations','البحث في المحادثات')}<input type="search" value={query} onChange={e=>setQuery(e.target.value)}/></label><label className="gm-ack"><input type="checkbox" checked={onlyUnanswered} onChange={e=>setOnlyUnanswered(e.target.checked)}/>{t('Unanswered recorded messages','رسائل مسجلة دون رد')}</label></div>
          {!conversations.length&&<p className="ag-empty-copy">{t('No conversations match. Clear the search or unanswered filter.','لا توجد محادثات مطابقة. امسح البحث أو فلتر الرسائل دون رد.')}</p>}
          {conversations.map((lead) => (
            <button
              className={`px-conversation-tile ${lead.id === l?.id ? 'active' : ''}`}
              key={lead.id}
              aria-pressed={lead.id === l?.id}
              onClick={e => {if(lead.id===l?.id)return;if(draft.trim()){conversationTrigger.current=e.currentTarget;setPendingLead(lead.id);}else selectConversation(lead.id);}}
            >
              <span>
                <strong>{copyText(lead.identity.alias)}</strong>
                <small>
                  {copyText(lead.source)} · {t(state.properties[lead.propertyId]?.facts.titleEn||lead.propertyId,state.properties[lead.propertyId]?.facts.titleAr||lead.propertyId)}
                </small>
                <small>{t(lead.stage,stageAr[lead.stage])} · {lead.assignee||t('Unassigned','غير معيّن')}</small><em>{lead.conversation.messages.at(-1)?.text}</em><small><time dateTime={lastLeadActivity(lead)}>{lastLeadActivity(lead).slice(0,16).replace('T',' ')} UTC</time></small>
              </span>
            </button>
          ))}
        </div>
        {l ? (
          <>
            <section
              className="px-chat-panel"
              aria-label={copyText(t('Selected conversation', 'المحادثة المحددة'))}
            >
              <header className="px-chat-head">
                <div>
                  <strong>{copyText(l.identity.alias)}</strong>
                  <small>
                    {copyText(l.source)} · {copyText(l.conversation.id)}
                  </small>
                </div>
                <Link href={`/workspace/leads/${l.id}`}>
                  {copyText(t('Lead record', 'سجل العميل'))}
                </Link>
              </header>
              <div
                className="px-chat-messages"
                role="log"
                aria-label={copyText(t('Local messages', 'الرسائل المحلية'))}
              >
                {l.conversation.messages.map((m) => (
                  <div
                    className={`px-chat-bubble ${m.direction === 'outbound' ? 'mine' : ''}`}
                    key={m.id}
                  >
                    <p dir="auto">{m.text}</p>
                    <span>
                      {m.direction==='outbound'?t('Reply saved locally','تم حفظ الرد محلياً'):t('Received locally','تم الاستقبال محلياً')} · <time dateTime={m.at}>{new Date(m.at).toLocaleString(ar?'ar-QA':'en-GB',{dateStyle:'medium',timeStyle:'short',timeZone:'Asia/Qatar'})}</time>
                    </span>
                  </div>
                ))}
              </div>
              <Link className="crm-conversation-property" href={`/workspace/inventory/${l.propertyId}`}>{t('View property','عرض العقار')} · <PropertyLabel id={l.propertyId}/></Link>
              <LeadAssistance key={l.id} leadId={l.id} onDraft={setDraft} draft={draft}/>
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
                  {copyText(t('Write a demo reply', 'كتابة رد تجريبي'))}
                </label>
                <textarea
                  id="crm-reply"
                  rows={3}
                  maxLength={2000}
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  placeholder={copyText(t('Fictional reply only', 'رد خيالي فقط'))}
                />
                <button
                  className="px-button px-button-dark"
                  disabled={!draft.trim() || !l.consent.replyAllowed}
                >
                  {copyText(t('Save local reply', 'حفظ الرد المحلي'))}
                </button>
              </form>
              {!l.consent.replyAllowed && (
                <p role="status">
                  {copyText(t(
                    'Opted out: local replies blocked.',
                    'تم إلغاء الاشتراك: الردود المحلية محظورة.',
                  ))}
                </p>
              )}
            </section>
            <aside className="px-chat-context">
              <span className="px-overline">
                {copyText(t('CONTEXT / HUMAN HANDOVER', 'السياق / التحويل البشري'))}
              </span>
              <h3>{copyText(t('Linked property', 'العقار المرتبط'))}</h3>
              <Link href={`/workspace/inventory/${l.propertyId}`}>
                <PropertyLabel id={l.propertyId} />
              </Link>
              <p>
                {copyText(l.source)} · {copyText(l.sourceEventId)}
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
                {copyText(t('Request viewing', 'طلب معاينة'))}
              </Link>
              <p>
                {copyText(t(
                  'No official WhatsApp API, AI or remote delivery status.',
                  'لا واجهة واتساب رسمية أو ذكاء اصطناعي أو حالة تسليم عن بُعد.',
                ))}
              </p>
            </aside>
          </>
        ) : (
          <div className="crm-empty">
            <h3>{copyText(t('No conversation found', 'لم يتم العثور على محادثة'))}</h3>
            <p>
              {copyText(t(
                'Choose an existing lead or create a fictional enquiry.',
                'اختر عميلاً موجوداً أو أنشئ استفساراً خيالياً.',
              ))}
            </p>
          </div>
        )}
      </div>
      <CrmDisclosure />
    </>
  );
}
export function LeadRouting() {const copyText=usePrototypeCopy();
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
                    {copyText(method === 'round-robin'
                      ? t('Round-robin', 'توزيع دوري')
                      : t('Manual assignment', 'توزيع يدوي'))}
                  </b>
                  <small>
                    {copyText(method === 'round-robin'
                      ? t(
                          'Rotate active available agents',
                          'تدوير المسؤولين المتاحين',
                        )
                      : t('Hold for a human owner', 'انتظار اختيار المسؤول'))}
                  </small>
                </button>
              ))}
            </div>
            <h3 className="gm-inner-heading">
              {copyText(t('Agent eligibility & availability', 'أهلية المسؤولين وتوفرهم'))}
            </h3>
            <div className="crm-agent-list">
              {crmAgentNames(state).map((agent) => (
                <div key={agent}>
                  <strong>{copyText(agent)}</strong>
                  <label>
                    <input
                      type="checkbox"
                      aria-label={copyText(t(`Active ${agent}`, `نشط ${agent}`))}
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
                    {copyText(t('Active', 'نشط'))}
                  </label>
                  <label>
                    <input
                      type="checkbox"
                      aria-label={copyText(t(`Available ${agent}`, `متاح ${agent}`))}
                      checked={availableMember(state,agent)&&!state.crm.unavailableAgents.includes(agent)}
                      onChange={(e) =>
                        crmCommand({
                          type: 'availability',
                          agent,
                          available: e.target.checked,
                        })
                      }
                    />
                    {copyText(t('Available (simulation)', 'متاح (محاكاة)'))}
                  </label>
                </div>
              ))}
            </div>
            <label className="px-field">
              {copyText(t('Fallback assignee', 'المسؤول الاحتياطي'))}
              <NativeSelect
                value={state.fallbackAgent}
                onChange={(e) =>
                  update((s) => ({...s, fallbackAgent: e.target.value}))
                }
              >
                {crmAgentNames(state).map((a) => (
                  <option key={a} value={a}>{copyText(a)}</option>
                ))}
              </NativeSelect>
            </label>
            <p>
              {copyText(t(
                'If no rotating agent is eligible, use an available fallback. Otherwise the lead remains unassigned with a recorded reason.',
                'إذا لم يتوفر مسؤول مؤهل، يُستخدم الاحتياطي المتاح، وإلا يبقى العميل دون توزيع مع تسجيل السبب.',
              ))}
            </p>
          </Section>
        </div>
        <aside className="gm-aside">
          <div className="gm-context">
            <span className="px-overline">
              {copyText(t('NEXT ACCEPTED EVENT', 'الحدث المقبول التالي'))}
            </span>
            <h3>{copyText(t('A predictable next owner.', 'المسؤول التالي واضح.'))}</h3>
            <dl>
              <div>
                <dt>{copyText(t('Policy', 'السياسة'))}</dt>
                <dd>{copyText(state.assignMethod)}</dd>
              </div>
              <div>
                <dt>{copyText(t('Assigned to', 'المسؤول'))}</dt>
                <dd>{copyText(next.agent ?? t('Unassigned', 'غير موزع'))}</dd>
              </div>
              <div>
                <dt>{copyText(t('Rotation cursor', 'موضع الدوران'))}</dt>
                <dd>{state.crm.cursor}</dd>
              </div>
              <div>
                <dt>{copyText(t('Reason', 'السبب'))}</dt>
                <dd>{copyText(next.reason)}</dd>
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
                  payload: exampleLeadPayload('Website', propertyId,undefined,undefined,activeOrganizationId(state.organization)),
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
              {copyText(t('Simulate another lead', 'محاكاة عميل آخر'))}
            </button>
            <p>
              {copyText(t(
                'Creates a fictional local lead. No production authorization, concurrency or durable routing guarantee.',
                'ينشئ عميلاً محلياً خيالياً. لا يوفر صلاحيات إنتاجية أو ضمان تزامن أو دوام.',
              ))}
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

export function PropertyLeadEnquiries({propertyId}: {propertyId: string}) {const copyText=usePrototypeCopy();
  const {state, hydrated} = useGeminiDemo();
  const t = useCrmCopy();
  if (!hydrated) return <CrmLoading />;
  if (!Object.hasOwn(state.properties, propertyId))
    return (
      <p role="alert">
        {copyText(t('Unknown canonical property.', 'العقار الأساسي غير موجود.'))}
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
          {copyText(t('Simulate an enquiry', 'محاكاة استفسار'))}
        </Link>
      }
    >
      {leads.length ? (
        <div
          className="px-table-scroll"
          tabIndex={0}
          role="region"
          aria-label={copyText(t('Property lead records', 'سجلات عملاء العقار'))}
        >
          <table className="px-table">
            <thead>
              <tr>
                <th>{copyText(t('Lead', 'العميل'))}</th>
                <th>{copyText(t('Source', 'المصدر'))}</th>
                <th>{copyText(t('Stage', 'المرحلة'))}</th>
                <th>{copyText(t('Owner', 'المسؤول'))}</th>
              </tr>
            </thead>
            <tbody>
              {leads.map((l) => (
                <tr key={l.id}>
                  <td>
                    <Link href={`/workspace/leads/${l.id}`}>
                      <b>{copyText(l.identity.alias)}</b>
                      <small>{copyText(l.id)}</small>
                    </Link>
                  </td>
                  <td>
                    {copyText(l.source)}
                    <small>{unansweredEnquiry(l)?t('Latest message: inbound','آخر رسالة: واردة'):t('Local conversation','محادثة محلية')}</small>
                  </td>
                  <td>{copyText(t(l.stage, stageAr[l.stage]))}</td>
                  <td>{copyText(l.assignee ?? t('Unassigned', 'غير موزع'))}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <CrmEmpty>
          {copyText(t(
            'No local enquiries for this property yet. Simulate a fictional source event to begin.',
            'لا توجد استفسارات محلية لهذا العقار بعد. ابدأ بمحاكاة حدث خيالي.',
          ))}
        </CrmEmpty>
      )}
      <div className="px-narrative-row">
        <Link
          className="px-text-link"
          href={`/workspace/leads?property=${propertyId}`}
        >
          {copyText(t('Open filtered lead manager', 'فتح إدارة العملاء المرشحة'))} →
        </Link>
      </div>
    </Section>
  );
}
