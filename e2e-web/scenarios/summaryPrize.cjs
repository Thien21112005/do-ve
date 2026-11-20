/** T13.13 — the "Tiền trúng" total in Vé của tôi must show the exact amount, never cut with "…". */
const { scenario, assert } = require('../harness.cjs');

function seedWon(page, prize) {
  const tickets = [
    {
      id: 'vinh-long_2026-11-20_012345',
      ticket: '012345',
      station: 'vinh-long',
      stationName: 'Vĩnh Long',
      drawDate: '2026-11-20',
      status: 'WON',
      totalPrize: prize,
      wins: [],
      createdAt: '2026-11-20T11:00:00.000Z',
    },
  ];
  return page.addInitScript((value) => {
    if (!localStorage.getItem('dove.tickets.v1')) localStorage.setItem('dove.tickets.v1', value);
  }, JSON.stringify({ version: 2, tickets }));
}

/** True when any text node inside the element is clipped (ellipsis / overflow). */
function isClipped(page, testId) {
  return page.evaluate((id) => {
    const root = document.querySelector(`[data-testid="${id}"]`);
    if (!root) return 'missing';
    return [...root.querySelectorAll('*')].some((el) => el.scrollWidth > el.clientWidth + 1);
  }, testId);
}

for (const [label, prize, text] of [
  ['2 tỷ', 2_000_000_000, '2.000.000.000'],
  ['hơn 4 tỷ', 4_050_300_000, '4.050.300.000'],
]) {
  scenario(`T13.13 Vé của tôi: ô Tiền trúng ${label} hiển thị đủ số`, async ({ page, open, byId, shot }) => {
    await seedWon(page, prize);
    await open('tickets');
    await byId('summary-stat-won').waitFor();
    const value = await byId('summary-stat-won').innerText();
    await shot(`t13-13-summary-${prize}`);
    assert(value.replace(/\s/g, '').includes(text), `phải chứa số đầy đủ ${text}, nhận "${value}"`);
    assert((await isClipped(page, 'summary-stat-won')) === false, 'chữ trong ô Tiền trúng không được bị cắt');
  });
}
