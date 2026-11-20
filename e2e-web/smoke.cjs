/**
 * Browser smoke suite for the DoVe Expo Web build.
 * Run: npm run e2e:web            (all scenarios)
 *      npm run e2e:web -- "Dò 1"  (scenarios whose name contains the text)
 */
const fs = require('node:fs');
const path = require('node:path');
const { scenario, assert, run } = require('./harness.cjs');

scenario('Trang chủ hiển thị 3 đài Thứ Sáu 20/11', async ({ open, byId, shot }) => {
  await open('');
  for (const st of ['vinh-long', 'binh-duong', 'tra-vinh']) {
    await byId(`latest-draw-card-${st}`).waitFor();
  }
  await shot('01-home');
});

scenario('Dò 1 vé giữ số 0 đầu và trúng Đặc biệt', async ({ page, open, byId, shot }) => {
  await open('check');
  await byId('station-chips-vinh-long').click();
  await byId('ticket-input-hidden-input').fill('012345');
  // Auto-submit fires on the 6th digit; click only if it did not.
  const result = byId('check-result-section');
  if (!(await result.isVisible().catch(() => false))) {
    await byId('check-ticket-button').click();
  }
  await byId('result-card-hero-ticket').waitFor();
  const hero = await byId('result-card-hero-ticket').innerText();
  assert(hero.replace(/\s/g, '').includes('012345'), `vé hiển thị giữ số 0 đầu, nhận "${hero}"`);
  const total = await byId('result-card-total-prize').innerText();
  assert(/2\.000\.\d{3}\.\d{3}/.test(total), `tổng thưởng có 2 tỷ (Đặc biệt), nhận "${total}"`);
  await shot('02-check-single-won');
  await page.keyboard.press('Escape');
});

scenario('Dò nhiều vé (3 vé) trả đủ 3 kết quả', async ({ open, byId, shot, api }) => {
  await open('check');
  await byId('mode-batch-btn').click();
  await byId('batch-ticket-input').fill('012345\n000000\n999999');
  await byId('check-ticket-button').click();
  await byId('batch-summary-bar').waitFor();
  const batchCalls = api.calls.filter((c) => c.path === '/api/v1/check/batch');
  if (batchCalls.length) assert(batchCalls[0].body.tickets.length === 3, 'gửi đúng 3 vé');
  await shot('03-check-batch');
});

scenario('Lịch tháng mở từ màn Kết quả', async ({ open, byId, shot }) => {
  await open('results');
  await byId('draw-table').waitFor();
  await byId('results-calendar-btn').click();
  await byId('calendar-month-label').waitFor();
  const label = await byId('calendar-month-label').innerText();
  assert(/11/.test(label) && /2026/.test(label), `lịch mở đúng tháng 11/2026, nhận "${label}"`);
  await shot('04-results-calendar');
});

scenario('Lưu vé rồi tải lại trang vẫn còn trong Vé của tôi', async ({ page, open, byId, shot }) => {
  await open('check');
  await byId('station-chips-vinh-long').click();
  await byId('ticket-input-hidden-input').fill('012345');
  const result = byId('check-result-section');
  if (!(await result.isVisible().catch(() => false))) await byId('check-ticket-button').click();
  await byId('result-card-save-btn').first().click();
  await page.waitForTimeout(500);
  await open('tickets');
  await page.reload({ waitUntil: 'load' });
  await byId('saved-tickets-list').waitFor();
  const text = await byId('saved-tickets-list').innerText();
  assert(text.replace(/\s/g, '').includes('012345'), 'vé 012345 còn sau khi tải lại');
  await shot('05-tickets-persisted');
});

// Regression scenarios for individual fixes live in ./scenarios/*.cjs.
const dir = path.join(__dirname, 'scenarios');
if (fs.existsSync(dir)) {
  for (const f of fs.readdirSync(dir).filter((x) => x.endsWith('.cjs')).sort()) require(path.join(dir, f));
}

run();
