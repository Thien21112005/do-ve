/** T13.02 — the Check tab follows the draw session across 16:10 unless the user picked a date. */
const { scenario, assert } = require('../harness.cjs');

async function returnToForeground(page) {
  // react-native-web's AppState listens to document visibility changes.
  await page.evaluate(() => {
    const set = (v) => Object.defineProperty(document, 'visibilityState', { value: v, configurable: true });
    set('hidden');
    document.dispatchEvent(new Event('visibilitychange'));
    set('visible');
    document.dispatchEvent(new Event('visibilitychange'));
  });
}

scenario(
  'T13.02 Dò vé: 16:05 là kỳ 19/11, quay lại app lúc 16:15 tự sang kỳ 20/11',
  async ({ page, open, byId, shot }) => {
    await open('check');
    const context = byId('check-context-box');
    await page.waitForFunction(() => document.querySelector('[data-testid="check-context-box"]')?.textContent.includes('19/11'));
    await shot('t13-02-before-1610');

    await page.clock.setFixedTime(new Date('2026-11-20T16:15:00+07:00'));
    await returnToForeground(page);

    await page
      .waitForFunction(
        () => document.querySelector('[data-testid="check-context-box"]')?.textContent.includes('20/11'),
        null,
        { timeout: 10_000 },
      )
      .catch(() => {});
    const text = await context.innerText();
    await shot('t13-02-after-1610');
    assert(text.includes('20/11'), `sau 16:10 phải sang kỳ 20/11, đang hiện "${text}"`);
  },
  { now: '2026-11-20T16:05:00+07:00', today: '2026-11-20' },
);
