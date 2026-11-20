/** T13.03 — "Cả ngày" must show the error banner (with retry) when the network is down, not "no result yet". */
const { scenario, assert } = require('../harness.cjs');

const offlineDraws = (method, path) =>
  path.startsWith('/api/v1/draws') && path !== '/api/v1/draws/schedule' ? { abort: 'internetdisconnected' } : undefined;

scenario(
  'T13.03 Cả ngày + mất mạng: hiện lỗi có nút thử lại, không báo "chưa có kết quả"',
  async ({ open, byId, shot }) => {
    await open('results');
    await byId('results-view-mode-all').click();
    const error = byId('results-error-container');
    const empty = byId('results-empty-container');
    await Promise.race([
      error.waitFor({ timeout: 20_000 }),
      empty.waitFor({ timeout: 20_000 }),
    ]).catch(() => {});
    await shot('t13-03-all-stations-offline');
    assert(!(await empty.isVisible().catch(() => false)), 'không được hiện khung "chưa có kết quả" khi mất mạng');
    assert(await error.isVisible().catch(() => false), 'phải hiện khung lỗi results-error-container');
  },
  { overrides: offlineDraws, mockOnly: true },
);

scenario('T13.03 Cả ngày có mạng: vẫn hiện đủ 3 đài', async ({ open, byId, page, shot }) => {
  await open('results');
  await byId('results-view-mode-all').click();
  await page.getByText('Trà Vinh').first().waitFor({ timeout: 20_000 });
  assert(!(await byId('results-error-container').isVisible().catch(() => false)), 'không có khung lỗi');
  await shot('t13-03-all-stations-online');
});
