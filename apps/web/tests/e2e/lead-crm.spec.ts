import {selectChoice} from './fixtures';
import {localized} from './fixtures';
import {resolve} from 'node:path';
import {readdirSync, mkdirSync, writeFileSync} from 'node:fs';
import type {Page} from '@playwright/test';
import {test, expect} from './fixtures';
import {seedProperties, newProperty} from '../../src/lib/canonical-property';
import {
  applyCrmCommand,
  exampleLeadPayload,
  seedCrm,
  leadSources,
  leadMetrics,
  selectLeads,
  nextAssignment,
  type CrmHost,
  type LeadSource,
} from '../../src/lib/lead-crm';
import {restoreCrm} from '../../src/lib/lead-storage';
import type {DemoState} from '../../src/components/gemini/demo-provider';
const key = 'maxpro-gemini-v3-demo-state';
function host(): CrmHost {
  const properties = seedProperties();
  return {
    properties,
    crm: {...seedCrm(properties), leads: []},
    activeAgents: ['Fatima Noor', 'Karim Said', 'Mariam Ahmed'],
    fallbackAgent: 'Yousef Al-Marri',
    assignMethod: 'round-robin',
  };
}
function intake(
  s: CrmHost,
  event: string,
  source: LeadSource = 'Website',
  property = 'AQ-10231',
  at = '2026-11-13T10:00:00.000Z',
) {
  const r = applyCrmCommand(
    s,
    {
      type: 'intake',
      source,
      payload: exampleLeadPayload(
        source,
        property,
        event,
        '2026-11-13T09:00:00.000Z',
      ),
      acknowledged: true,
    },
    at,
  );
  s.crm = r.crm;
  return r;
}
async function saved(page: Page): Promise<DemoState> {
  return page.evaluate((k) => JSON.parse(localStorage.getItem(k)!), key);
}
async function openIntake(page: Page, locale = 'en') {
  await page.goto(`/${locale}/workspace/leads`);
  await page
    .getByRole('button', {
      name: localized(/Lead intake simulator|محاكي استقبال العملاء/),
      exact: true,
    })
    .click();
  await page.getByRole('checkbox', {name: localized(/I acknowledge|أقر بأن/)}).check();
}
async function process(page: Page) {
  await page
    .getByRole('button', {name: localized(/Process example event|معالجة الحدث التجريبي/)})
    .click();
}
async function noOverflow(page: Page) {
  expect(
    await page.evaluate(() => document.documentElement.scrollWidth),
  ).toBeLessThanOrEqual(page.viewportSize()!.width + 1);
}

test('CRM domain: five internal payloads preserve source, event, property, timestamps and same-name identities', () => {
  const s = host();
  for (const [i, source] of leadSources.entries()) {
    const result = intake(s, `DEMO-SOURCE-${i}`, source);
    expect(result.error).toBeNull();
    const l = s.crm.leads[0];
    expect(l.source).toBe(source);
    expect(l.attribution.model).toBe('first-touch');
    expect(l.attribution.history[0].sourceEventId).toBe(`DEMO-SOURCE-${i}`);
    expect(l.sourceEventId).toBe(`DEMO-SOURCE-${i}`);
    expect(l.propertyId).toBe('AQ-10231');
    expect(l.sourceAt).toBe('2026-11-13T09:00:00.000Z');
    expect(l.receivedAt).toBe('2026-11-13T10:00:00.000Z');
  }
  expect(s.crm.leads).toHaveLength(5);
  expect(s.crm.receipts.map((r) => r.status)).toEqual(
    Array.from({length: 5}, () => ['received', 'accepted']).flat(),
  );
});
test('CRM domain: replay is idempotent and does not rotate; different source same event is distinct', () => {
  const s = host();
  const first = intake(s, 'DEMO-REPLAY');
  const cursor = s.crm.cursor;
  const assignments = structuredClone(s.crm.leads[0].assignments);
  expect(intake(s, 'DEMO-REPLAY').leadId).toBe(first.leadId);
  expect(s.crm.cursor).toBe(cursor);
  expect(s.crm.leads).toHaveLength(1);
  expect(s.crm.leads[0].assignments).toEqual(assignments);
  expect(s.crm.receipts.at(-1)?.status).toBe('duplicate');
  intake(s, 'DEMO-REPLAY', 'WhatsApp');
  expect(s.crm.leads).toHaveLength(2);
});
test('CRM domain: malformed, foreign-org, missing-property, future and personal data inputs reject without mutations', () => {
  const s = host();
  intake(s, 'DEMO-GOOD');
  const original = structuredClone(s.crm.leads);
  const payload = JSON.parse(
    exampleLeadPayload(
      'Website',
      'AQ-10231',
      'DEMO-BAD',
      '2026-11-13T09:00:00Z',
    ),
  );
  for (const bad of [
    '{broken',
    JSON.stringify({...payload, organization_id: 'OTHER'}),
    JSON.stringify({...payload, property_id: 'missing'}),
    JSON.stringify({...payload, submitted_at: '2099-01-01T00:00:00Z'}),
    JSON.stringify({...payload, demo_identity: 'Real person'}),
    JSON.stringify({...payload, phone: 'forbidden'}),
    JSON.stringify({...payload, reply_opt_in: 'yes'}),
    JSON.stringify({...payload, enquiry_id: ''}),
  ]) {
    const r = applyCrmCommand(
      s,
      {type: 'intake', source: 'Website', payload: bad, acknowledged: true},
      '2026-11-13T10:00:00Z',
    );
    expect(r.error).toBeTruthy();
    s.crm = r.crm;
    expect(s.crm.leads).toEqual(original);
    expect(s.crm.cursor).toBe(1);
    expect(s.crm.receipts.at(-1)?.status).toBe('rejected');
  }
  expect(
    applyCrmCommand(s, {
      type: 'intake',
      source: 'Website',
      payload: '{}',
      acknowledged: false,
    }).crm,
  ).toBe(s.crm);
});
test('CRM domain: round-robin survives hydration and skips unavailable/inactive agents', () => {
  const s = host();
  intake(s, 'DEMO-RR-1');
  intake(s, 'DEMO-RR-2');
  expect(s.crm.leads.map((l) => l.assignee)).toEqual([
    'Karim Said',
    'Fatima Noor',
  ]);
  const restored = restoreCrm(
    JSON.parse(JSON.stringify(s.crm)),
    1,
    s.properties,
  );
  expect(restored.corrupt).toBe(false);
  s.crm = restored.crm;
  expect(nextAssignment(s).agent).toBe('Mariam Ahmed');
  intake(s, 'DEMO-RR-3');
  expect(s.crm.leads[0].assignee).toBe('Mariam Ahmed');
  s.crm.unavailableAgents = ['Fatima Noor'];
  s.activeAgents = ['Fatima Noor', 'Karim Said'];
  expect(nextAssignment(s).agent).toBe('Karim Said');
});
test('CRM domain: fallback, backlog, manual and invalid assignment have explicit outcomes', () => {
  const s = host();
  s.activeAgents = [];
  intake(s, 'DEMO-FALLBACK');
  expect(s.crm.leads[0].assignee).toBe('Yousef Al-Marri');
  s.crm.unavailableAgents = ['Yousef Al-Marri'];
  intake(s, 'DEMO-BACKLOG');
  expect(s.crm.leads[0].assignee).toBeNull();
  expect(s.crm.leads[0].assignments[0].reason).toContain('Backlog');
  s.assignMethod = 'manual';
  intake(s, 'DEMO-MANUAL');
  expect(s.crm.cursor).toBe(0);
  expect(s.crm.leads[0].assignee).toBeNull();
  expect(
    applyCrmCommand(s, {
      type: 'assign',
      leadId: s.crm.leads[0].id,
      agent: 'Foreign agent',
    }).error,
  ).toBeTruthy();
  const r = applyCrmCommand(s, {
    type: 'assign',
    leadId: s.crm.leads[0].id,
    agent: 'Karim Said',
  });
  expect(r.crm.leads[0].assignments.at(-1)?.to).toBe('Karim Said');
});
test('CRM domain: arbitrary new canonical properties receive leads; unknown IDs do not substitute', () => {
  const s = host();
  const id = 'DEMO-00000000-0000-0000-0000-000000000000';
  s.properties[id] = newProperty(id);
  expect(intake(s, 'DEMO-NEW', 'Qatar Living', id).error).toBeNull();
  expect(s.crm.leads[0].propertyId).toBe(id);
  expect(intake(s, 'DEMO-MISSING', 'Website', 'AQ-99999').error).toContain(
    'Unknown canonical property',
  );
  expect(
    applyCrmCommand(s, {type: 'stage', leadId: 'missing', stage: 'Won'}).error,
  ).toContain('missing');
});
test('CRM domain: stage, qualification, notes, opt-out and replies share one lead and response cohort', () => {
  const s = host();
  intake(s, 'DEMO-LIFECYCLE');
  const id = s.crm.leads[0].id;
  s.crm = applyCrmCommand(s, {
    type: 'stage',
    leadId: id,
    stage: 'Qualified',
  }).crm;
  expect(leadMetrics(s.crm.leads).qualified).toBe(1);
  s.crm = applyCrmCommand(s, {type: 'stage', leadId: id, stage: 'Won'}).crm;
  expect(leadMetrics(s.crm.leads).conversion).toBe(100);
  s.crm = applyCrmCommand(s, {
    type: 'note',
    leadId: id,
    text: 'Fictional follow-up',
  }).crm;
  s.crm = applyCrmCommand(
    s,
    {type: 'reply', leadId: id, text: 'Fictional reply'},
    '2026-11-13T10:05:00Z',
  ).crm;
  expect(leadMetrics(s.crm.leads).responseMinutes).toBe(5);
  s.crm = applyCrmCommand(s, {type: 'consent', leadId: id, allowed: false}).crm;
  expect(
    applyCrmCommand(s, {type: 'reply', leadId: id, text: 'Blocked'}).error,
  ).toContain('opted out');
  expect(s.crm.leads[0].notes[0].text).toBe('Fictional follow-up');
  expect(s.crm.leads[0].sourceEventId).toBe('DEMO-LIFECYCLE');
});
test('CRM domain: viewing conflicts, cancellation and valid transitions persist', () => {
  const s = host();
  intake(s, 'DEMO-VIEW-1');
  const id = s.crm.leads[0].id;
  const request = {
    type: 'view' as const,
    leadId: id,
    date: '2026-12-01',
    time: '10:00',
    agent: 'Fatima Noor',
  };
  let r = applyCrmCommand(s, request, '2026-11-13T10:00:00Z');
  expect(r.error).toBeNull();
  s.crm = r.crm;
  expect(
    applyCrmCommand(s, {...request, time: '10:30'}, '2026-11-13T10:00:00Z')
      .error,
  ).toContain('conflict');
  const v = s.crm.leads[0].viewings[0];
  s.crm = applyCrmCommand(s, {
    type: 'view-status',
    leadId: id,
    viewingId: v.id,
    status: 'Cancelled',
  }).crm;
  expect(applyCrmCommand(s, request, '2026-11-13T10:00:00Z').error).toBeNull();
  expect(
    applyCrmCommand(s, {...request, date: '2026-12-04'}, '2026-11-13T10:00:00Z')
      .error,
  ).toContain('Example availability');
  expect(
    applyCrmCommand(s, {...request, date: '2026-02-30'}, '2026-11-13T10:00:00Z')
      .error,
  ).toBeTruthy();
  r = applyCrmCommand(s, {
    type: 'view-status',
    leadId: id,
    viewingId: v.id,
    status: 'Completed',
  });
  expect(r.error).toContain('Invalid');
  expect(
    restoreCrm(JSON.parse(JSON.stringify(s.crm)), 1, s.properties).crm.leads[0]
      .viewings[0].status,
  ).toBe('Cancelled');
});
test('CRM domain: date filters use inclusive Qatar received dates and explicit costs only', () => {
  const s = host();
  intake(s, 'DEMO-DATE-1', 'Website', 'AQ-10231', '2026-11-13T22:00:00Z');
  expect(
    selectLeads(s.crm, {from: '2026-11-14', to: '2026-11-14'}),
  ).toHaveLength(1);
  expect(selectLeads(s.crm, {to: '2026-11-13'})).toHaveLength(0);
  expect(s.crm.spend).toEqual([]);
  s.crm = applyCrmCommand(s, {
    type: 'spend',
    source: 'Website',
    date: '2026-11-14',
    qar: 100,
  }).crm;
  expect(s.crm.spend[0].qar).toBe(100);
  expect(
    applyCrmCommand(s, {
      type: 'spend',
      source: 'Website',
      date: 'bad',
      qar: NaN,
    }).error,
  ).toBeTruthy();
});
test('CRM storage: migration, invalid references, schema, identity and nested metadata recover safely', () => {
  const s = host();
  expect(restoreCrm(undefined, undefined, s.properties).crm.leads).toHaveLength(
    5,
  );
  intake(s, 'DEMO-VALID');
  intake(s, 'DEMO-INVALID');
  const raw = JSON.parse(JSON.stringify(s.crm));
  raw.leads[0].propertyId = 'missing';
  const r = restoreCrm(raw, 1, s.properties);
  expect(r.corrupt).toBe(true);
  expect(r.crm.leads).toHaveLength(1);
  expect(r.crm.leads[0].sourceEventId).toBe('DEMO-VALID');
  for (const mutate of [
    (v: typeof raw) => {
      v.leads[0].identity.email = 'real@example.com';
    },
    (v: typeof raw) => {
      v.leads[0].conversation.messages[0].status = 'delivered';
    },
    (v: typeof raw) => {
      v.leads[0].assignments[0].to = 'Foreign agent';
    },
  ]) {
    const v = JSON.parse(JSON.stringify(s.crm));
    mutate(v);
    expect(restoreCrm(v, 1, s.properties).corrupt).toBe(true);
  }
  expect(restoreCrm(s.crm, 9, s.properties).crm.leads).toEqual([]);
  const injection = JSON.parse(JSON.stringify(s.crm));
  injection.leads[0].credentials = 'removed';
  injection.leads[0].conversation.messages[0].token = 'removed';
  expect(
    JSON.stringify(restoreCrm(injection, 1, s.properties).crm),
  ).not.toContain('removed');
});

for (const locale of ['en', 'ar']) {
  test(`CRM ${locale}: intake replay, invalid event, filters and keyboard pipeline work`, async ({
    page,
  }) => {
    await openIntake(page, locale);
    await page
      .getByLabel(/Intake source|مصدر الاستقبال/)
      .selectOption('Property Finder');
    await page
      .getByLabel(/Canonical property|العقار الأساسي/, {exact: true})
      .selectOption('AQ-10244');
    await process(page);
    let s = await saved(page);
    const l = s.crm.leads[0];
    expect(l.propertyId).toBe('AQ-10244');
    expect(l.source).toBe('Property Finder');
    expect(s.crm.leads).toHaveLength(6);
    await process(page);
    s = await saved(page);
    expect(s.crm.leads).toHaveLength(6);
    expect(s.crm.receipts.at(-1)?.status).toBe('duplicate');
    expect(s.crm.cursor).toBe(1);
    await page
      .getByLabel(/Internal example payload|بيانات المثال الداخلي/)
      .fill('{bad');
    await process(page);
    await expect(page.locator('main [role=alert]')).toContainText(
      localized('Malformed JSON'),
    );
    s = await saved(page);
    expect(s.crm.leads).toHaveLength(6);
    expect(s.crm.receipts.at(-1)?.status).toBe('rejected');
    await page.getByLabel(/Search leads|بحث العملاء/).fill(l.sourceEventId);
    await expect(page.locator('.crm-table tbody tr')).toHaveCount(1);
    await page
      .getByRole('button', {name: localized(/^Pipeline$|^مسار$/), exact: true})
      .focus();
    await page.keyboard.press('Enter');
    await expect(page.locator('.crm-lead-tile')).toHaveCount(1);
    await noOverflow(page);
    await page.reload();
    expect((await saved(page)).crm.leads[0].id).toBe(l.id);
  });
  test(`CRM ${locale}: stage, conversation, handover, viewing cancellation and analytics persist`, async ({
    page,
  }) => {
    test.setTimeout(60000);
    await openIntake(page, locale);
    await process(page);
    let s = await saved(page);
    const l = s.crm.leads[0];
    await page.goto(`/${locale}/workspace/leads/${l.id}`);
    await page.getByLabel(/Lead stage|مرحلة العميل/).selectOption('Qualified');
    await page
      .getByLabel(/Add fictional note|إضافة ملاحظة خيالية/)
      .fill('Fictional follow-up context');
    await page
      .getByRole('button', {name: localized(/^Add note$|^إضافة الملاحظة$/)})
      .click();
    await page
      .getByRole('link', {name: localized(/Open conversation|فتح المحادثة/)})
      .click();
    await page
      .getByLabel(/Write a demo reply|كتابة رد تجريبي/)
      .fill('Fictional viewing options');
    await page
      .getByRole('button', {name: localized(/Save local reply|حفظ الرد المحلي/)})
      .click();
    await selectChoice(page,page.getByLabel(/Handover agent|مسؤول التحويل/),'Karim Said');
    await page.reload();
    await expect(page.getByRole('log')).toContainText(
      localized('Fictional viewing options'),
    );
    await expect(page.getByLabel(/Handover agent|مسؤول التحويل/)).toHaveValue(
      'Karim Said',
    );
    await page
      .getByRole('link', {name: localized(/^Request viewing$|^طلب معاينة$/)})
      .click();
    await page.getByLabel(/Requested date|التاريخ المطلوب/).fill('2027-01-05');
    await page
      .getByRole('button', {name: localized(/Add demo request|إضافة طلب تجريبي/)})
      .click();
    await expect(
      page.getByText(/Requested \(local\)|مطلوب \(محلي\)/, {exact: true}),
    ).toBeVisible();
    await page.reload();
    await page.getByRole('button', {name: localized(/^Cancel$|^إلغاء$/)}).click();
    await expect(
      page.getByText(/Cancelled \(local\)|ملغى \(محلي\)/, {exact: true}),
    ).toBeVisible();
    await page.goto(`/${locale}/workspace/leads/${l.id}`);
    await page.getByLabel(/Lead stage|مرحلة العميل/).selectOption('Won');
    await page.goto(`/${locale}/workspace/analytics`);
    await expect(page.getByTestId('lead-total')).toHaveText(localized('6',true));
    await expect(page.getByTestId('qualified-total')).toHaveText(localized('2',true));
    s = await saved(page);
    const final = s.crm.leads.find((x) => x.id === l.id)!;
    expect(final.stage).toBe('Won');
    expect(final.sourceEventId).toBe(l.sourceEventId);
    expect(final.viewings[0].status).toBe('Cancelled');
    expect(
      s.crm.leads
        .filter((x) => x.id !== l.id)
        .some((x) =>
          x.conversation.messages.some(
            (m) => m.text === 'Fictional viewing options',
          ),
        ),
    ).toBe(false);
    await noOverflow(page);
  });
}
test('CRM browser: routing cursor persists, unavailable agents are excluded, manual intake enters backlog', async ({
  page,
}) => {
  await page.goto('/en/workspace/leads/assignment');
  await page.getByRole('button', {name: localized("Simulate another lead")}).click();
  expect((await saved(page)).crm.leads[0].assignee).toBe('Fatima Noor');
  await page.reload();
  await expect(
    page.locator('dd').filter({hasText: 'Karim Said'}),
  ).toBeVisible();
  await page.getByRole('button', {name: localized("Simulate another lead")}).click();
  expect((await saved(page)).crm.leads[0].assignee).toBe('Karim Said');
  await page.getByLabel(localized('Available Mariam Ahmed',true), {exact: true}).uncheck();
  await page.getByLabel(localized('Available Fatima Noor',true), {exact: true}).uncheck();
  await page.getByRole('button', {name: localized("Simulate another lead")}).click();
  expect((await saved(page)).crm.leads[0].assignee).toBe('Karim Said');
  await page.getByRole('button', {name: localized(/Manual assignment/)}).click();
  await page.getByRole('button', {name: localized("Simulate another lead")}).click();
  expect((await saved(page)).crm.leads[0].assignee).toBeNull();
  await page.goto('/en/workspace/analytics');
  await expect(page.getByTestId('assignment-backlog')).toHaveText(localized('3',true));
});
test('CRM browser: a newly created canonical property can receive a simulated lead', async ({
  page,
}) => {
  await page.goto('/en/workspace/inventory/new');
  await page.getByRole('button', {name: localized('Create empty draft')}).click();
  await expect(page).toHaveURL(/\/inventory\/DEMO-[a-f0-9-]+\/edit$/);
  const propertyId = page.url().split('/').at(-2)!;
  await page.goto(`/en/workspace/inventory/${propertyId}/enquiries`);
  await expect(
    page.getByText(
      localized("No local enquiries for this property yet. Simulate a fictional source event to begin."),
    ),
  ).toBeVisible();
  await page
    .getByRole('link', {name: localized("Simulate an enquiry",true), exact: true})
    .click();
  await expect(
    page.getByRole('combobox', {name: localized("Canonical property",true), exact: true}),
  ).toHaveValue(propertyId);
  await page.getByRole('checkbox', {name: localized(/I acknowledge/)}).check();
  await process(page);
  const l = (await saved(page)).crm.leads[0];
  expect(l.propertyId).toBe(propertyId);
  await page.goto(`/en/workspace/inventory/${propertyId}/enquiries`);
  await expect(page.locator('.crm-property-enquiries tbody tr')).toHaveCount(1);
  await expect(page.locator('.crm-property-enquiries')).toContainText(l.id);
  await page.goto(`/en/workspace/leads/${l.id}`);
  await expect(page.locator('main')).toContainText(propertyId);
  await page.reload();
  await expect(page.locator('main')).toContainText(propertyId);
});
test('CRM browser: corrupt saved CRM excludes invalid leads but preserves properties and jobs; unknown ID is explicit', async ({
  page,
}) => {
  await openIntake(page);
  await process(page);
  const before = await saved(page);
  await page.evaluate((k) => {
    const s = JSON.parse(localStorage.getItem(k)!);
    s.crm.leads[0].propertyId = 'missing';
    s.crm.cursor = -4;
    s.crm.receipts.push({status: 'delivered'});
    localStorage.setItem(k, JSON.stringify(s));
  }, key);
  await page.reload();
  await expect(page.getByText(/Some invalid local records/)).toBeVisible();
  await page
    .getByRole('button', {name: localized("Lead intake simulator",true), exact: true})
    .click();
  await page.getByRole('checkbox', {name: localized(/I acknowledge/)}).check();
  await process(page);
  const after = await saved(page);
  expect(Object.keys(after.properties)).toEqual(Object.keys(before.properties));
  expect(after.jobs).toEqual(before.jobs);
  expect(after.crm.cursor).toBe(1);
  await page.goto('/en/workspace/leads/unknown');
  await expect(page.getByRole('heading',{level:1})).toHaveText(localized("Lead not found",true));
  await page.goto('/en/workspace/inbox?lead=unknown');
  await expect(page.getByText(localized("No conversation found"))).toBeVisible();
});
test('CRM browser: fictional spend and date/property filters have explicit provenance', async ({
  page,
}) => {
  await page.goto('/en/workspace/analytics');
  await page
    .getByRole('combobox', {name: localized("Source",true), exact: true})
    .selectOption('Meta Lead Ads');
  await expect(page.locator('[data-channel="Meta Lead Ads"]')).toContainText(
    localized("Unavailable"),
  );
  await page.getByLabel(localized("Fictional amount QAR")).fill('120');
  await page.getByRole('button', {name: localized("Add fictional spend")}).click();
  await expect(page.locator('[data-channel="Meta Lead Ads"]')).toContainText(
    localized('120.00'),
  );
  await page
    .getByRole('combobox', {name: localized("Property",true), exact: true})
    .selectOption('AQ-10231');
  await expect(page.locator('[data-channel="Meta Lead Ads"]')).toContainText(
    localized("Unavailable"),
  );
  await page.getByLabel(localized("From date",true), {exact: true}).fill('2099-01-01');
  await expect(page.getByTestId('lead-total')).toHaveText(localized('0',true));
});

for (const locale of ['en', 'ar'])
  for (const width of [1440, 1024, 768, 375]) {
    test(`CRM visual ${locale} ${width}: eight connected operational workspaces`, async ({
      page,
    }, info) => {
      test.skip(
        info.project.name !== 'chromium',
        'Each width captured once with Chromium.',
      );
      test.setTimeout(60000);
      await page.setViewportSize({width, height: 1000});
      await openIntake(page, locale);
      await process(page);
      const l = (await saved(page)).crm.leads[0];
      await page.goto(`/${locale}/workspace/leads/${l.id}`);
      await page
        .getByLabel(/Lead stage|مرحلة العميل/)
        .selectOption('Qualified');
      await page.goto(`/${locale}/workspace/leads/viewings?lead=${l.id}`);
      await page
        .getByLabel(/Requested date|التاريخ المطلوب/)
        .fill('2027-01-05');
      await page
        .getByRole('button', {name: localized(/Add demo request|إضافة طلب تجريبي/)})
        .click();
      for (const [name, path] of [
        ['table', 'leads'],
        ['pipeline', 'leads'],
        ['detail', `leads/${l.id}`],
        ['inbox', `inbox?lead=${l.id}`],
        ['assignment', 'leads/assignment'],
        ['viewings', 'leads/viewings'],
        ['analytics', 'analytics'],
        ['control-tower', ''],
      ]) {
        await page.goto(`/${locale}/workspace/${path}`);
        await expect(page.getByRole('heading',{level:1})).toBeVisible();
        if (name === 'pipeline')
          await page
            .getByRole('button', {name: localized(/^Pipeline$|^مسار$/), exact: true})
            .click();
        await page.evaluate(() => document.fonts.ready);
        await expect(page.locator('html')).toHaveAttribute(
          'dir',
          locale === 'ar' ? 'rtl' : 'ltr',
        );
        await noOverflow(page);
        await page.screenshot({
          path: resolve(
            `../../${globalThis.process.env.MAXPRO_EVIDENCE_ROOT??'artifacts/phase6'}/regression/phase3/screenshots/${locale}-${width}-${name}.png`,
          ),
          fullPage: true,
          scale: 'css',
        });
      }
    });
  }

test('CRM domain: rejected receipts preserve safe event IDs and inconsistent restored references are excluded', () => {
  const s = host();
  intake(s, 'DEMO-REFERENCE');
  const rejection = intake(
    s,
    'DEMO-UNKNOWN-PROPERTY',
    'Property Finder',
    'AQ-99999',
  );
  expect(rejection.error).toContain('Unknown canonical property');
  expect(s.crm.receipts.at(-1)?.eventId).toBe('DEMO-UNKNOWN-PROPERTY');
  expect(s.crm.receipts.at(-2)?.eventId).toBe('DEMO-UNKNOWN-PROPERTY');
  const raw = structuredClone(s.crm);
  raw.receipts[1].source = 'WhatsApp';
  const restored = restoreCrm(raw, 1, s.properties);
  expect(restored.corrupt).toBe(true);
  expect(restored.crm.leads).toHaveLength(1);
  expect(restored.crm.receipts.some((r) => r.status === 'accepted')).toBe(
    false,
  );
});

test('CRM browser: advanced filters, qualification, reply preference and empty states use the same lead', async ({
  page,
}) => {
  await page.goto('/en/workspace/leads/LE-2101');
  await page
    .getByRole('combobox', {name: localized("Qualification status",true), exact: true})
    .selectOption('Qualified');
  await page
    .getByRole('combobox', {name: localized("Priority",true), exact: true})
    .selectOption('High');
  await page
    .getByLabel(localized("Qualification / follow-up details"))
    .fill('Fictional budget confirmed');
  await page.getByRole('button', {name: localized("Save qualification")}).click();
  await page
    .getByRole('checkbox', {name: localized("Allow local demonstration replies")})
    .uncheck();
  await page.goto('/en/workspace/inbox?lead=LE-2101');
  await page.getByLabel(localized("Write a demo reply")).fill('Fictional blocked reply');
  await expect(
    page.getByRole('button', {name: localized("Save local reply")}),
  ).toBeDisabled();
  await page.goto('/en/workspace/leads');
  for (const [name, value] of [
    ['Source', 'Website'],
    ['Property', 'AQ-10231'],
    ['Assignee', 'Fatima Noor'],
    ['Stage', 'New'],
    ['Priority', 'High'],
    ['Qualification', 'Qualified'],
  ])
    await page.getByRole('combobox', {name, exact: true}).selectOption(value);
  await expect(page.locator('.crm-table tbody tr')).toHaveCount(1);
  await page
    .getByRole('combobox', {name: localized("Stage",true), exact: true})
    .selectOption('Lost');
  await expect(
    page.getByText(localized("No matching leads",true), {exact: true}),
  ).toBeVisible();
  await page.getByRole('button', {name: localized("Reset filters")}).click();
  await expect(page.locator('.crm-table tbody tr')).toHaveCount(5);
});

for (const locale of ['en', 'ar'])
  test(`CRM accessibility ${locale}: WCAG A/AA axe checks on touched main content`, async ({
    page,
  }, info) => {
    test.setTimeout(90000);
    const packageDir = readdirSync(resolve('../../node_modules/.pnpm')).find(
      (name) => name.startsWith('axe-core@'),
    );
    expect(
      packageDir,
      'axe-core supplied by the locked development tooling',
    ).toBeTruthy();
    const axePath = resolve(
      '../../node_modules/.pnpm',
      packageDir!,
      'node_modules/axe-core/axe.min.js',
    );
    const reports = [];
    for (const route of [
      'leads',
      'leads/LE-2101',
      'inbox',
      'leads/assignment',
      'leads/viewings',
      'analytics',
    ]) {
      await page.goto(`/${locale}/workspace/${route}`);
      await expect(page.getByRole('heading',{level:1})).toBeVisible();
      await expect(page.locator('.crm-nav')).toBeVisible();
      await page.addScriptTag({path: axePath});
      const results = await page.evaluate<{
        violations: {
          id: string;
          impact: string;
          nodes: {html: string; failureSummary: string}[];
        }[];
      }>(
        "window.axe.run(document.querySelector('main'),{runOnly:{type:'tag',values:['wcag2a','wcag2aa','wcag21aa']}})",
      );
      reports.push({route, ...results});
      if (route === 'leads') {
        await page
          .getByRole('button', {name: localized(/^Pipeline$|^مسار$/), exact: true})
          .click();
        const pipeline = await page.evaluate<typeof results>(
          "window.axe.run(document.querySelector('main'),{runOnly:{type:'tag',values:['wcag2a','wcag2aa','wcag21aa']}})",
        );
        reports.push({route: 'leads-pipeline', ...pipeline});
      }
    }
    mkdirSync(resolve(`../../${globalThis.process.env.MAXPRO_EVIDENCE_ROOT??'artifacts/phase6'}/regression/phase3/logs`), {recursive: true});
    writeFileSync(
      resolve(
        `../../${globalThis.process.env.MAXPRO_EVIDENCE_ROOT??'artifacts/phase6'}/regression/phase3/logs/axe-${info.project.name}-${locale}.json`,
      ),
      JSON.stringify(reports, null, 2),
    );
    expect(reports.flatMap((r) => r.violations)).toEqual([]);
  });
