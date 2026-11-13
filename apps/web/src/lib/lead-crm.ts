/** Internal fictional contracts only. No provider webhook/API or production authorization. */
import {demoOrganizationId, type CanonicalProperty} from './canonical-property';
import {isRecord, textValue} from './property-storage';
export const leadSources = [
  'Website',
  'Property Finder',
  'Qatar Living',
  'Meta Lead Ads',
  'WhatsApp',
] as const;
export type LeadSource = (typeof leadSources)[number];
export const leadStages = [
  'New',
  'Contacted',
  'Qualified',
  'Viewing',
  'Won',
  'Lost',
] as const;
export type LeadStage = (typeof leadStages)[number];
export const crmAgents = [
  'Fatima Noor',
  'Karim Said',
  'Mariam Ahmed',
  'Yousef Al-Marri',
] as const;
export type Assignment = {
  id: string;
  at: string;
  from: string | null;
  to: string | null;
  reason: string;
};
export type Activity = {id: string; at: string; text: string};
export type Message = {
  id: string;
  at: string;
  direction: 'inbound' | 'outbound';
  status: 'received-local' | 'saved-local';
  text: string;
};
export type Viewing = {
  id: string;
  date: string;
  time: string;
  agent: string;
  status: 'Requested' | 'Confirmed' | 'Completed' | 'Cancelled';
  at: string;
};
export type CanonicalLead = {
  id: string;
  organizationId: string;
  propertyId: string;
  source: LeadSource;
  sourceEventId: string;
  sourceAt: string;
  receivedAt: string;
  destination: 'property-finder' | 'qatar-living' | 'meta-catalog' | null;
  campaign: string | null;
  attribution: {
    model: 'first-touch';
    history: {
      id: string;
      at: string;
      source: LeadSource;
      sourceEventId: string;
      campaign: string | null;
    }[];
  };
  identity: {alias: string; email: string};
  consent: {at: string; replyAllowed: boolean; preferred: LeadSource};
  stage: LeadStage;
  priority: 'Normal' | 'High';
  qualification: 'Unreviewed' | 'Qualified' | 'Not qualified';
  qualificationNote: string;
  assignee: string | null;
  assignments: Assignment[];
  conversation: {id: string; messages: Message[]};
  notes: Activity[];
  viewings: Viewing[];
  activity: Activity[];
};
export type Receipt = {
  id: string;
  attemptId: string;
  at: string;
  source: LeadSource | null;
  eventId: string | null;
  status: 'received' | 'accepted' | 'rejected' | 'duplicate';
  leadId: string | null;
  detail: string;
};
export type Spend = {id: string; source: LeadSource; date: string; qar: number};
export type CrmRepository = {
  version: 1;
  leads: CanonicalLead[];
  receipts: Receipt[];
  cursor: number;
  unavailableAgents: string[];
  spend: Spend[];
};
export type CrmHost = {
  crm: CrmRepository;
  properties: Record<string, CanonicalProperty>;
  assignMethod: 'round-robin' | 'manual';
  activeAgents: string[];
  fallbackAgent: string;
};
export type CrmCommand =
  | {type: 'intake'; source: LeadSource; payload: string; acknowledged: boolean}
  | {type: 'assign'; leadId: string; agent: string | null}
  | {type: 'stage'; leadId: string; stage: LeadStage}
  | {
      type: 'qualify';
      leadId: string;
      qualification: CanonicalLead['qualification'];
      text: string;
      priority: CanonicalLead['priority'];
    }
  | {type: 'note' | 'reply'; leadId: string; text: string}
  | {type: 'consent'; leadId: string; allowed: boolean}
  | {type: 'view'; leadId: string; date: string; time: string; agent: string}
  | {
      type: 'view-status';
      leadId: string;
      viewingId: string;
      status: Viewing['status'];
    }
  | {type: 'availability'; agent: string; available: boolean}
  | {type: 'spend'; source: LeadSource; date: string; qar: number};
const uid = () => crypto.randomUUID();
const validTime = (s: unknown): s is string =>
  typeof s === 'string' &&
  /^\d{4}-\d\d-\d\dT/.test(s) &&
  Number.isFinite(Date.parse(s));
const short = (s: unknown, max = 200): s is string =>
  textValue(s, max) && s.trim().length > 0;
const agentValid = (s: unknown): s is string =>
  typeof s === 'string' && crmAgents.some((a) => a === s);
const eventKey = (
  l: Pick<CanonicalLead, 'organizationId' | 'source' | 'sourceEventId'>,
) => JSON.stringify([l.organizationId, l.source, l.sourceEventId]);
export const qatarDate = (at: string) =>
  new Date(Date.parse(at) + 3 * 3600000).toISOString().slice(0, 10);
const dateValid = (s: string) =>
  /^\d{4}-\d\d-\d\d$/.test(s) &&
  Number.isFinite(Date.parse(s)) &&
  new Date(s).toISOString().slice(0, 10) === s;
const timeValid = (s: string) => /^([01]\d|2[0-3]):[0-5]\d$/.test(s);
const eventFields: Record<LeadSource, [string, string, string]> = {
  Website: ['enquiry_id', 'property_id', 'submitted_at'],
  'Property Finder': ['example_lead_id', 'listing_reference', 'created_at'],
  'Qatar Living': ['example_enquiry_id', 'property_reference', 'event_time'],
  'Meta Lead Ads': ['example_leadgen_id', 'canonical_property', 'created_time'],
  WhatsApp: ['example_message_id', 'property_reference', 'message_time'],
};
export function exampleLeadPayload(
  source: LeadSource,
  propertyId: string,
  eventId = `DEMO-EVENT-${uid()}`,
  at = new Date().toISOString(),
) {
  const [id, property, time] = eventFields[source];
  return JSON.stringify(
    {
      contract: 'internal-example-v1',
      organization_id: demoOrganizationId,
      [id]: eventId,
      [property]: propertyId,
      [time]: at,
      demo_identity: 'Demo visitor',
      reply_opt_in: true,
      ...(source === 'Meta Lead Ads'
        ? {campaign_reference: 'DEMO-CAMPAIGN-01'}
        : {}),
    },
    null,
    2,
  );
}
function safeEventId(source: LeadSource, raw: string): string | null {
  if (raw.length > 16000) return null;
  try {
    const v: unknown = JSON.parse(raw);
    const field = eventFields[source][0];
    return isRecord(v) &&
      short(v[field], 100) &&
      /^DEMO-[A-Za-z0-9-]+$/.test(v[field] as string)
      ? (v[field] as string)
      : null;
  } catch {
    return null;
  }
}
function normalize(
  source: LeadSource,
  raw: string,
  properties: CrmHost['properties'],
  at: string,
) {
  if (raw.length > 16000) throw new Error('Example payload is too large.');
  const v: unknown = JSON.parse(raw);
  if (!isRecord(v)) throw new Error('Payload must be a JSON object.');
  const [id, property, time] = eventFields[source];
  if (
    v.contract !== 'internal-example-v1' ||
    v.organization_id !== demoOrganizationId
  )
    throw new Error(
      'Use the internal example contract and current demo organization.',
    );
  if (!short(v[id], 100) || !/^DEMO-[A-Za-z0-9-]+$/.test(v[id] as string))
    throw new Error(
      'Source event ID must start DEMO- and contain only letters, numbers or hyphens.',
    );
  if (
    !short(v[property], 100) ||
    !Object.hasOwn(properties, v[property] as string) ||
    properties[v[property] as string].organizationId !== demoOrganizationId
  )
    throw new Error('Unknown canonical property in this organization.');
  if (!validTime(v[time]) || Date.parse(v[time] as string) > Date.parse(at))
    throw new Error(
      'Source timestamp must be valid and cannot be in the future.',
    );
  if (v.demo_identity !== 'Demo visitor' || typeof v.reply_opt_in !== 'boolean')
    throw new Error(
      'Use Demo visitor and a boolean reply_opt_in; real contact details are not accepted.',
    );
  if (
    v.campaign_reference !== undefined &&
    (!short(v.campaign_reference, 100) ||
      !/^DEMO-[A-Za-z0-9-]+$/.test(v.campaign_reference))
  )
    throw new Error('Campaign reference must be a DEMO- example.');
  const permitted = new Set([
    'contract',
    'organization_id',
    id,
    property,
    time,
    'demo_identity',
    'reply_opt_in',
    'campaign_reference',
  ]);
  if (Object.keys(v).some((k) => !permitted.has(k)))
    throw new Error(
      'Unsupported example field. Do not enter personal data or credentials.',
    );
  return {
    sourceEventId: v[id] as string,
    propertyId: v[property] as string,
    sourceAt: v[time] as string,
    replyAllowed: v.reply_opt_in,
    campaign: (v.campaign_reference as string | undefined) ?? null,
  };
}
export function nextAssignment(host: CrmHost): {
  agent: string | null;
  reason: string;
  rotate: boolean;
} {
  if (host.assignMethod === 'manual')
    return {
      agent: null,
      reason: 'Manual policy · awaiting human assignment',
      rotate: false,
    };
  const eligible = crmAgents.filter(
    (a) =>
      host.activeAgents.includes(a) && !host.crm.unavailableAgents.includes(a),
  );
  if (eligible.length)
    return {
      agent: eligible[host.crm.cursor % eligible.length],
      reason: 'Round-robin · active and available',
      rotate: true,
    };
  const fallback =
    agentValid(host.fallbackAgent) &&
    !host.crm.unavailableAgents.includes(host.fallbackAgent)
      ? host.fallbackAgent
      : null;
  return {
    agent: fallback,
    reason: fallback
      ? 'Fallback · no eligible rotating agents'
      : 'Backlog · no eligible or available fallback agent',
    rotate: false,
  };
}
function createLead(
  id: string,
  source: LeadSource,
  n: ReturnType<typeof normalize>,
  at: string,
  decision: ReturnType<typeof nextAssignment>,
): CanonicalLead {
  return {
    id,
    organizationId: demoOrganizationId,
    propertyId: n.propertyId,
    source,
    sourceEventId: n.sourceEventId,
    sourceAt: n.sourceAt,
    receivedAt: at,
    destination:
      source === 'Property Finder'
        ? 'property-finder'
        : source === 'Qatar Living'
          ? 'qatar-living'
          : source === 'Meta Lead Ads'
            ? 'meta-catalog'
            : null,
    campaign: n.campaign,
    attribution: {
      model: 'first-touch',
      history: [
        {
          id: `ATTR-${id}`,
          at,
          source,
          sourceEventId: n.sourceEventId,
          campaign: n.campaign,
        },
      ],
    },
    identity: {alias: 'Demo visitor', email: 'visitor@example.test'},
    consent: {at, replyAllowed: n.replyAllowed, preferred: source},
    stage: 'New',
    priority: 'Normal',
    qualification: 'Unreviewed',
    qualificationNote: '',
    assignee: decision.agent,
    assignments: [
      {id: uid(), at, from: null, to: decision.agent, reason: decision.reason},
    ],
    conversation: {
      id: `CV-${id}`,
      messages: [
        {
          id: uid(),
          at,
          direction: 'inbound',
          status: 'received-local',
          text: 'Fictional enquiry: please share viewing options for this property.',
        },
      ],
    },
    notes: [],
    viewings: [],
    activity: [
      {
        id: uid(),
        at,
        text: `Accepted internal ${source} example; first-touch attribution preserved.`,
      },
    ],
  };
}
export function seedCrm(properties: CrmHost['properties']): CrmRepository {
  const crm: CrmRepository = {
    version: 1,
    leads: [],
    receipts: [],
    cursor: 0,
    unavailableAgents: [],
    spend: [],
  };
  const propertyIds = Object.keys(properties).filter(
    (id) => properties[id].organizationId === demoOrganizationId,
  );
  const now = Date.now();
  leadSources.forEach((source, i) => {
    if (!propertyIds.length) return;
    const at = new Date(now - (i + 1) * 3600000).toISOString();
    const l = createLead(
      `LE-${2101 + i}`,
      source,
      {
        propertyId: propertyIds[i % propertyIds.length],
        sourceEventId: `DEMO-SEED-${i + 1}`,
        sourceAt: at,
        replyAllowed: true,
        campaign: null,
      },
      at,
      {
        agent: i % 2 === 0 ? 'Fatima Noor' : null,
        reason: 'Built-in fictional example',
        rotate: false,
      },
    );
    l.identity.alias = `Demo visitor ${i + 1}`;
    if (i === 2) {
      l.stage = 'Contacted';
      l.conversation.messages.push({
        id: uid(),
        at: new Date(Date.parse(at) + 600000).toISOString(),
        direction: 'outbound',
        status: 'saved-local',
        text: 'Fictional reply saved locally.',
      });
    }
    if (i === 3) {
      l.stage = 'Qualified';
      l.qualification = 'Qualified';
    }
    if (i === 4) l.stage = 'Lost';
    crm.leads.push(l);
  });
  return crm;
}
export function applyCrmCommand(
  host: CrmHost,
  cmd: CrmCommand,
  at = new Date().toISOString(),
): {crm: CrmRepository; error: string | null; leadId?: string} {
  const original = host.crm;
  const crm = structuredClone(original);
  const fail = (error: string) => ({crm: original, error});
  if (cmd.type === 'intake') {
    if (!cmd.acknowledged)
      return fail(
        'Acknowledge fictional local intake before recording an event.',
      );
    if (!leadSources.includes(cmd.source)) return fail('Unknown source.');
    if (crm.receipts.length > 1998)
      return fail('Local CRM capacity reached. Reset the demo to continue.');
    const attemptId = uid();
    const receipt = (
      status: Receipt['status'],
      eventId: string | null,
      leadId: string | null,
      detail: string,
    ) =>
      crm.receipts.push({
        id: uid(),
        attemptId,
        at,
        source: cmd.source,
        eventId,
        status,
        leadId,
        detail,
      });
    const originalEventId = safeEventId(cmd.source, cmd.payload);
    receipt(
      'received',
      originalEventId,
      null,
      'Internal example received; raw payload not retained.',
    );
    try {
      const n = normalize(cmd.source, cmd.payload, host.properties, at);
      const existing = crm.leads.find(
        (l) =>
          eventKey(l) ===
          eventKey({
            organizationId: demoOrganizationId,
            source: cmd.source,
            sourceEventId: n.sourceEventId,
          }),
      );
      if (existing) {
        receipt(
          'duplicate',
          n.sourceEventId,
          existing.id,
          'Replay ignored; assignment unchanged.',
        );
        return {crm, error: null, leadId: existing.id};
      }
      if (crm.leads.length >= 500)
        throw new Error(
          'Local CRM lead capacity reached. Reset the demo to continue.',
        );
      const decision = nextAssignment(host);
      const lead = createLead(`LE-DEMO-${uid()}`, cmd.source, n, at, decision);
      crm.leads.unshift(lead);
      if (decision.rotate) crm.cursor++;
      receipt(
        'accepted',
        n.sourceEventId,
        lead.id,
        'Normalized, linked and routed locally.',
      );
      return {crm, error: null, leadId: lead.id};
    } catch (e) {
      const detail =
        e instanceof SyntaxError
          ? 'Malformed JSON example.'
          : e instanceof Error
            ? e.message
            : 'Invalid example.';
      receipt('rejected', originalEventId, null, detail);
      return {crm, error: detail};
    }
  }
  if (cmd.type === 'availability') {
    if (!agentValid(cmd.agent)) return fail('Unknown organization agent.');
    crm.unavailableAgents = cmd.available
      ? crm.unavailableAgents.filter((a) => a !== cmd.agent)
      : [...new Set([...crm.unavailableAgents, cmd.agent])];
    return {crm, error: null};
  }
  if (cmd.type === 'spend') {
    if (
      !leadSources.includes(cmd.source) ||
      !dateValid(cmd.date) ||
      !Number.isFinite(cmd.qar) ||
      cmd.qar < 0 ||
      cmd.qar > 1e7
    )
      return fail('Enter a valid fictional spend date and QAR amount.');
    if (crm.spend.length >= 500)
      return fail('Fictional spend capacity reached.');
    crm.spend.push({
      id: uid(),
      source: cmd.source,
      date: cmd.date,
      qar: cmd.qar,
    });
    return {crm, error: null};
  }
  const lead = crm.leads.find(
    (l) => l.id === cmd.leadId && l.organizationId === demoOrganizationId,
  );
  if (!lead || !Object.hasOwn(host.properties, lead.propertyId))
    return fail('Lead or canonical property is missing in this organization.');
  if (lead.activity.length >= 500)
    return fail('Local lead history capacity reached.');
  let action = '';
  if (cmd.type === 'assign') {
    if (
      cmd.agent !== null &&
      (!agentValid(cmd.agent) || host.crm.unavailableAgents.includes(cmd.agent))
    )
      return fail('Choose a known available organization agent.');
    if (lead.assignee === cmd.agent)
      return fail('This agent already owns the lead.');
    lead.assignments.push({
      id: uid(),
      at,
      from: lead.assignee,
      to: cmd.agent,
      reason: 'Human assignment / conversation handover',
    });
    lead.assignee = cmd.agent;
    action = `Ownership changed to ${cmd.agent ?? 'Unassigned'}.`;
  } else if (cmd.type === 'stage') {
    if (!leadStages.includes(cmd.stage)) return fail('Invalid lead stage.');
    if (lead.stage === cmd.stage) return fail('Stage is unchanged.');
    lead.stage = cmd.stage;
    if (cmd.stage === 'Qualified') lead.qualification = 'Qualified';
    action = `Stage changed to ${cmd.stage}.`;
  } else if (cmd.type === 'qualify') {
    if (
      !['Unreviewed', 'Qualified', 'Not qualified'].includes(
        cmd.qualification,
      ) ||
      !['Normal', 'High'].includes(cmd.priority) ||
      !textValue(cmd.text, 2000)
    )
      return fail('Invalid qualification details.');
    lead.qualification = cmd.qualification;
    lead.qualificationNote = cmd.text.trim();
    lead.priority = cmd.priority;
    action = 'Qualification and follow-up details saved.';
  } else if (cmd.type === 'note' || cmd.type === 'reply') {
    if (!short(cmd.text, 2000))
      return fail('Enter 1–2000 characters of fictional text.');
    if (cmd.type === 'reply') {
      if (!lead.consent.replyAllowed)
        return fail('Reply preference is opted out. Local reply blocked.');
      lead.conversation.messages.push({
        id: uid(),
        at,
        direction: 'outbound',
        status: 'saved-local',
        text: cmd.text.trim(),
      });
      action = 'Demo reply saved locally; no message sent.';
    } else {
      lead.notes.push({id: uid(), at, text: cmd.text.trim()});
      action = 'Internal fictional note recorded.';
    }
  } else if (cmd.type === 'consent') {
    lead.consent = {...lead.consent, at, replyAllowed: cmd.allowed};
    action = `Reply preference ${cmd.allowed ? 'opted in' : 'opted out'} locally.`;
  } else if (cmd.type === 'view') {
    if (
      !dateValid(cmd.date) ||
      !timeValid(cmd.time) ||
      !agentValid(cmd.agent) ||
      crm.unavailableAgents.includes(cmd.agent)
    )
      return fail('Choose a valid date/time and available organization agent.');
    const start = Date.parse(`${cmd.date}T${cmd.time}:00+03:00`);
    if (start < Date.parse(at))
      return fail('Choose a future viewing time (Qatar time).');
    const weekday = new Date(`${cmd.date}T12:00:00+03:00`).getUTCDay();
    if (weekday === 5 || cmd.time < '09:00' || cmd.time > '17:00')
      return fail(
        'Example availability warning: Friday or outside 09:00–18:00 Qatar time. No live calendar was checked.',
      );
    const conflict = crm.leads.some((l) =>
      l.viewings.some(
        (v) =>
          ['Requested', 'Confirmed'].includes(v.status) &&
          (v.agent === cmd.agent || l.propertyId === lead.propertyId) &&
          Math.abs(Date.parse(`${v.date}T${v.time}:00+03:00`) - start) <
            3600000,
      ),
    );
    if (conflict)
      return fail(
        'Local conflict warning: agent or property has a request within one hour. No live calendar was checked.',
      );
    lead.viewings.push({
      id: `VIEW-${uid()}`,
      date: cmd.date,
      time: cmd.time,
      agent: cmd.agent,
      status: 'Requested',
      at,
    });
    lead.stage = 'Viewing';
    action = 'Viewing requested locally (Qatar time).';
  } else if (cmd.type === 'view-status') {
    const v = lead.viewings.find((v) => v.id === cmd.viewingId);
    const transitions: Record<Viewing['status'], Viewing['status'][]> = {
      Requested: ['Confirmed', 'Cancelled'],
      Confirmed: ['Completed', 'Cancelled'],
      Completed: [],
      Cancelled: [],
    };
    if (!v || !transitions[v.status].includes(cmd.status))
      return fail('Invalid local viewing transition.');
    v.status = cmd.status;
    action = `Viewing ${cmd.status.toLowerCase()} locally.`;
  }
  lead.activity.push({id: uid(), at, text: action});
  return {crm, error: null, leadId: lead.id};
}

export type LeadFilter = {
  source?: string;
  propertyId?: string;
  from?: string;
  to?: string;
};
export function selectLeads(crm: CrmRepository, filter: LeadFilter = {}) {
  return crm.leads.filter(
    (l) =>
      (!filter.source ||
        filter.source === 'All' ||
        l.source === filter.source) &&
      (!filter.propertyId ||
        filter.propertyId === 'All' ||
        l.propertyId === filter.propertyId) &&
      (!filter.from || qatarDate(l.receivedAt) >= filter.from) &&
      (!filter.to || qatarDate(l.receivedAt) <= filter.to),
  );
}
export function leadMetrics(leads: CanonicalLead[]) {
  const response = leads.flatMap((l) => {
    const m = l.conversation.messages.find((m) => m.direction === 'outbound');
    const ms = m ? Date.parse(m.at) - Date.parse(l.receivedAt) : -1;
    return ms >= 0 ? [ms / 60000] : [];
  });
  return {
    total: leads.length,
    new: leads.filter((l) => l.stage === 'New').length,
    qualified: leads.filter((l) => l.qualification === 'Qualified').length,
    won: leads.filter((l) => l.stage === 'Won').length,
    backlog: leads.filter(
      (l) => !l.assignee && !['Won', 'Lost'].includes(l.stage),
    ).length,
    conversion: leads.length
      ? (leads.filter((l) => l.stage === 'Won').length / leads.length) * 100
      : 0,
    responseMinutes: response.length
      ? response.reduce((a, b) => a + b, 0) / response.length
      : null,
    responseSamples: response.length,
  };
}
