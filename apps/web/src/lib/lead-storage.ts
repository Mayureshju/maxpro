import {demoOrganizationId, type CanonicalProperty} from './canonical-property';
import {isRecord, textValue} from './property-storage';
import {
  crmAgents,
  leadSources,
  leadStages,
  seedCrm,
  type CanonicalLead,
  type CrmRepository,
  type Receipt,
  type Spend,
} from './lead-crm';
const text = (v: unknown, max = 2000): v is string => textValue(v, max);
const id = (v: unknown): v is string => text(v, 150) && v.length > 0;
const at = (v: unknown): v is string =>
  text(v, 50) && /^\d{4}-\d\d-\d\dT/.test(v) && Number.isFinite(Date.parse(v));
const agent = (v: unknown,names:readonly string[]=crmAgents) => v === null || names.some((a) => a === v);
const source = (v: unknown) => leadSources.some((s) => s === v);
const oneOf = (v: unknown, values: readonly string[]) =>
  typeof v === 'string' && values.includes(v);
const list = (v: unknown, p: (x: unknown) => boolean, max = 500) =>
  Array.isArray(v) &&
  v.length <= max &&
  v.every(p) &&
  new Set(v.map((x) => (isRecord(x) ? x.id : x))).size === v.length;
const activity = (v: unknown) =>
  isRecord(v) && id(v.id) && at(v.at) && text(v.text);
const assignment = (v: unknown,names:readonly string[]=crmAgents) =>
  isRecord(v) &&
  id(v.id) &&
  at(v.at) &&
  agent(v.from,names) &&
  agent(v.to,names) &&
  text(v.reason, 200);
const message = (v: unknown) =>
  isRecord(v) &&
  id(v.id) &&
  at(v.at) &&
  text(v.text) &&
  ((v.direction === 'inbound' && v.status === 'received-local') ||
    (v.direction === 'outbound' && v.status === 'saved-local'));
const viewing = (v: unknown,names:readonly string[]=crmAgents) =>
  isRecord(v) &&
  id(v.id) &&
  at(v.at) &&
  text(v.date, 10) &&
  /^\d{4}-\d\d-\d\d$/.test(v.date) &&
  Number.isFinite(Date.parse(v.date)) &&
  new Date(v.date).toISOString().slice(0, 10) === v.date &&
  text(v.time, 5) &&
  /^([01]\d|2[0-3]):[0-5]\d$/.test(v.time) &&
  v.agent !== null &&
  agent(v.agent,names) &&
  oneOf(v.status, ['Requested', 'Confirmed', 'Completed', 'Cancelled']);
function readLead(
  v: unknown,
  properties: Record<string, CanonicalProperty>,
  names: readonly string[]=crmAgents,
  organizationId: string = demoOrganizationId,
): CanonicalLead | null {
  if (
    !isRecord(v) ||
    !id(v.id) ||
    !/^LE-(?:21\d{2}|DEMO-[a-f0-9-]{36})$/.test(v.id) ||
    v.organizationId !== organizationId ||
    !id(v.propertyId) ||
    !Object.hasOwn(properties, v.propertyId) ||
    properties[v.propertyId].organizationId !== organizationId ||
    !source(v.source) ||
    !id(v.sourceEventId) ||
    !/^DEMO-[A-Za-z0-9-]+$/.test(v.sourceEventId) ||
    !at(v.sourceAt) ||
    !at(v.receivedAt) ||
    Date.parse(v.sourceAt) > Date.parse(v.receivedAt)
  )
    return null;
  const expected =
    v.source === 'Property Finder'
      ? 'property-finder'
      : v.source === 'Qatar Living'
        ? 'qatar-living'
        : v.source === 'Meta Lead Ads'
          ? 'meta-catalog'
          : null;
  if (
    v.destination !== expected ||
    !(
      v.campaign === null ||
      (text(v.campaign, 100) && /^DEMO-[A-Za-z0-9-]+$/.test(v.campaign))
    ) ||
    !isRecord(v.identity) ||
    !text(v.identity.alias, 100) ||
    !/^Demo visitor(?: \d+)?$/.test(v.identity.alias) ||
    v.identity.email !== 'visitor@example.test' ||
    !isRecord(v.consent) ||
    !at(v.consent.at) ||
    typeof v.consent.replyAllowed !== 'boolean' ||
    v.consent.preferred !== v.source
  )
    return null;
  if (
    !oneOf(v.stage, leadStages) ||
    !oneOf(v.priority, ['Normal', 'High']) ||
    !oneOf(v.qualification, ['Unreviewed', 'Qualified', 'Not qualified']) ||
    !text(v.qualificationNote) ||
    !agent(v.assignee,names) ||
    !list(v.assignments, (x)=>assignment(x,names)) ||
    !(v.assignments as unknown[]).length ||
    !isRecord(v.conversation) ||
    v.conversation.id !== `CV-${v.id}` ||
    !list(v.conversation.messages, message) ||
    !list(v.notes, activity) ||
    !list(v.viewings, (x)=>viewing(x,names)) ||
    !list(v.activity, activity)
  )
    return null;
  if (v.attribution !== undefined) {
    const a = v.attribution;
    if (
      !isRecord(a) ||
      a.model !== 'first-touch' ||
      !Array.isArray(a.history) ||
      a.history.length !== 1
    )
      return null;
    const touch = a.history[0];
    if (
      !isRecord(touch) ||
      touch.id !== `ATTR-${v.id}` ||
      touch.at !== v.receivedAt ||
      touch.source !== v.source ||
      touch.sourceEventId !== v.sourceEventId ||
      touch.campaign !== v.campaign
    )
      return null;
  }
  const l = v as unknown as CanonicalLead;
  if (
    l.assignments.at(-1)?.to !== l.assignee ||
    l.conversation.messages.some(
      (m) => Date.parse(m.at) < Date.parse(l.receivedAt),
    )
  )
    return null;
  // Reconstruct known fields only; injected payloads/credentials never survive hydration.
  return {
    id: l.id,
    organizationId,
    propertyId: l.propertyId,
    source: l.source,
    sourceEventId: l.sourceEventId,
    sourceAt: l.sourceAt,
    receivedAt: l.receivedAt,
    destination: l.destination,
    campaign: l.campaign,
    attribution: {
      model: 'first-touch',
      history: [
        {
          id: `ATTR-${l.id}`,
          at: l.receivedAt,
          source: l.source,
          sourceEventId: l.sourceEventId,
          campaign: l.campaign,
        },
      ],
    },
    identity: {alias: l.identity.alias, email: l.identity.email},
    consent: {
      at: l.consent.at,
      replyAllowed: l.consent.replyAllowed,
      preferred: l.consent.preferred,
    },
    stage: l.stage,
    priority: l.priority,
    qualification: l.qualification,
    qualificationNote: l.qualificationNote,
    assignee: l.assignee,
    assignments: l.assignments.map((a) => ({
      id: a.id,
      at: a.at,
      from: a.from,
      to: a.to,
      reason: a.reason,
    })),
    conversation: {
      id: l.conversation.id,
      messages: l.conversation.messages.map((m) => ({
        id: m.id,
        at: m.at,
        direction: m.direction,
        status: m.status,
        text: m.text,
      })),
    },
    notes: l.notes.map((n) => ({id: n.id, at: n.at, text: n.text})),
    viewings: l.viewings.map((b) => ({
      id: b.id,
      date: b.date,
      time: b.time,
      agent: b.agent,
      status: b.status,
      at: b.at,
    })),
    activity: l.activity.map((a) => ({id: a.id, at: a.at, text: a.text})),
  };
}
export function restoreCrm(
  value: unknown,
  version: unknown,
  properties: Record<string, CanonicalProperty>,
  names: readonly string[]=crmAgents,
  organizationId: string = demoOrganizationId,
): {crm: CrmRepository; corrupt: boolean} {
  if (version === undefined && value === undefined)
    return {crm: seedCrm(properties), corrupt: false};
  const empty: CrmRepository = {
    version: 1,
    leads: [],
    receipts: [],
    cursor: 0,
    unavailableAgents: [],
    spend: [],
  };
  if (version !== 1 || !isRecord(value) || value.version !== 1)
    return {crm: empty, corrupt: true};
  let corrupt = false;
  const crm = empty;
  const seen = new Set<string>();
  const ids = new Set<string>();
  if (Array.isArray(value.leads) && value.leads.length <= 500) {
    for (const v of value.leads) {
      const l = readLead(v, properties,names,organizationId);
      const key = l
        ? JSON.stringify([l.organizationId, l.source, l.sourceEventId])
        : '';
      if (l && !seen.has(key) && !ids.has(l.id)) {
        crm.leads.push(l);
        seen.add(key);
        ids.add(l.id);
      } else corrupt = true;
    }
  } else corrupt = true;
  if (
    Number.isSafeInteger(value.cursor) &&
    Number(value.cursor) >= 0 &&
    Number(value.cursor) < Number.MAX_SAFE_INTEGER
  )
    crm.cursor = Number(value.cursor);
  else corrupt = true;
  if (
    Array.isArray(value.unavailableAgents) &&
    value.unavailableAgents.length <= 500 &&
    value.unavailableAgents.every((a) => names.some((x) => x === a))
  )
    crm.unavailableAgents = [...new Set(value.unavailableAgents)] as string[];
  else corrupt = true;
  if (Array.isArray(value.receipts) && value.receipts.length <= 2000) {
    const receiptIds = new Set<string>();
    for (const v of value.receipts) {
      if (
        isRecord(v) &&
        id(v.id) &&
        !receiptIds.has(v.id) &&
        id(v.attemptId) &&
        at(v.at) &&
        (v.source === null || source(v.source)) &&
        (v.eventId === null ||
          (text(v.eventId, 100) && /^DEMO-[A-Za-z0-9-]+$/.test(v.eventId))) &&
        oneOf(v.status, ['received', 'accepted', 'rejected', 'duplicate']) &&
        (v.leadId === null || (id(v.leadId) && ids.has(v.leadId))) &&
        (['accepted', 'duplicate'].includes(String(v.status))
          ? v.leadId !== null
          : true) &&
        text(v.detail, 300)
      ) {
        const r = v as unknown as Receipt;
        const linked = crm.leads.find((l) => l.id === r.leadId);
        if (
          (['accepted', 'duplicate'].includes(r.status) &&
            (!linked ||
              linked.source !== r.source ||
              linked.sourceEventId !== r.eventId)) ||
          (['received', 'rejected'].includes(r.status) && r.leadId !== null)
        ) {
          corrupt = true;
          continue;
        }
        crm.receipts.push({
          id: r.id,
          attemptId: r.attemptId,
          at: r.at,
          source: r.source,
          eventId: r.eventId,
          status: r.status,
          leadId: r.leadId,
          detail: r.detail,
        });
        receiptIds.add(r.id);
      } else corrupt = true;
    }
  } else corrupt = true;
  if (Array.isArray(value.spend) && value.spend.length <= 500) {
    for (const v of value.spend) {
      if (
        isRecord(v) &&
        id(v.id) &&
        !crm.spend.some((s) => s.id === v.id) &&
        source(v.source) &&
        text(v.date, 10) &&
        /^\d{4}-\d\d-\d\d$/.test(v.date) &&
        Number.isFinite(Date.parse(v.date)) &&
        new Date(v.date).toISOString().slice(0, 10) === v.date &&
        typeof v.qar === 'number' &&
        Number.isFinite(v.qar) &&
        v.qar >= 0 &&
        v.qar <= 1e7
      ) {
        const s = v as unknown as Spend;
        crm.spend.push({id: s.id, source: s.source, date: s.date, qar: s.qar});
      } else corrupt = true;
    }
  } else corrupt = true;
  return {crm, corrupt};
}
