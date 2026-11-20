/** T13.01 — more than 20 PENDING tickets of one draw must all be settled by the auto recheck. */
const { scenario, assert } = require('../harness.cjs');

const STATION = 'vinh-long';
const DATE = '2026-11-20';
const TICKETS = Array.from({ length: 25 }, (_, i) => String(100000 + i * 7).padStart(6, '0'));

function seedPending(page) {
  const tickets = TICKETS.map((t, i) => ({
    id: `${STATION}_${DATE}_${t}`,
    ticket: t,
    station: STATION,
    stationName: 'Vĩnh Long',
    drawDate: DATE,
    status: 'PENDING',
    totalPrize: 0,
    wins: [],
    createdAt: new Date(Date.UTC(2026, 10, 20, 8, 0, i)).toISOString(),
  }));
  const envelope = JSON.stringify({ version: 2, tickets });
  return page.addInitScript((value) => {
    if (!localStorage.getItem('dove.tickets.v1')) localStorage.setItem('dove.tickets.v1', value);
  }, envelope);
}

scenario('T13.01 dò lại 25 vé PENDING cùng kỳ: không vé nào kẹt', async ({ page, open, byId, shot, api }) => {
  await seedPending(page);
  await open('tickets');
  await byId('saved-tickets-list').waitFor();

  // Wait until the recheck finished: storage has no PENDING left, or give up after 15s.
  const deadline = Date.now() + 15_000;
  let pending = TICKETS.length;
  while (Date.now() < deadline) {
    pending = await page.evaluate(() => {
      const raw = localStorage.getItem('dove.tickets.v1');
      return raw ? JSON.parse(raw).tickets.filter((t) => t.status === 'PENDING').length : -1;
    });
    if (pending === 0) break;
    await page.waitForTimeout(300);
  }
  await shot('t13-01-recheck-25-tickets');

  const batchSizes = api.calls.filter((c) => c.path === '/api/v1/check/batch').map((c) => c.body.tickets.length);
  assert(batchSizes.every((n) => n <= 20), `mỗi lô gửi lên ≤ 20 vé, nhận ${JSON.stringify(batchSizes)}`);
  assert(pending === 0, `cả 25 vé phải hết PENDING, còn ${pending} (các lô đã gửi: ${JSON.stringify(batchSizes)})`);
});
