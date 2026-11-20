/**
 * Tiny scenario runner for Playwright against the Expo Web build.
 *
 * Env:
 *   DOVE_WEB_URL      Expo Web URL (default http://localhost:8081)
 *   DOVE_E2E_REAL=1   Hit the real API instead of the in-browser mock (needs Docker + backend)
 *   DOVE_E2E_BROWSER  Playwright channel (default "msedge"; use "chromium" on Linux CI)
 *   DOVE_E2E_SHOTS    Screenshot folder (default docs/screenshots/phase13)
 */
const path = require('node:path');
const fs = require('node:fs');
const { chromium } = require('playwright');
const { createMockApi } = require('./mockApi.cjs');

const BASE_URL = process.env.DOVE_WEB_URL ?? 'http://localhost:8081';
const REAL = process.env.DOVE_E2E_REAL === '1';
const CHANNEL = process.env.DOVE_E2E_BROWSER ?? 'msedge';
const SHOTS = process.env.DOVE_E2E_SHOTS ?? path.join(__dirname, '..', 'docs', 'screenshots', 'phase13');
/** Friday 2026-11-20, after the 16:40 publish time: today's draw (Vĩnh Long, Bình Dương, Trà Vinh) exists. */
const DEFAULT_NOW = '2026-11-20T18:00:00+07:00';

const scenarios = [];

function scenario(name, fn, opts = {}) {
  scenarios.push({ name, fn, opts });
}

function assert(cond, message) {
  if (!cond) throw new Error(`Assertion failed: ${message}`);
}

async function run() {
  fs.mkdirSync(SHOTS, { recursive: true });
  const only = process.argv[2];
  const browser = await chromium.launch(CHANNEL === 'chromium' ? {} : { channel: CHANNEL });
  let failed = 0;

  for (const s of scenarios) {
    if (only && !s.name.includes(only)) continue;
    const context = await browser.newContext({ viewport: { width: 390, height: 844 }, locale: 'vi-VN' });
    const page = await context.newPage();
    const consoleErrors = [];
    page.on('pageerror', (e) => consoleErrors.push(`pageerror: ${e.message}`));
    page.on('console', (m) => {
      // HTTP errors the scenario provoked on purpose are logged by the browser; ignore those.
      if (m.type() === 'error' && !/Failed to load resource/.test(m.text())) consoleErrors.push(m.text());
    });
    await page.clock.setFixedTime(new Date(s.opts.now ?? DEFAULT_NOW));
    const api = createMockApi({ today: s.opts.today, overrides: s.opts.overrides });
    if (!REAL) await api.install(page);

    const ctx = {
      page,
      api,
      real: REAL,
      async open(route = '') {
        await page.goto(`${BASE_URL}/${route}`, { waitUntil: 'load' });
        await page.getByTestId('theme-vars-root').waitFor({ timeout: 30_000 });
      },
      async shot(name) {
        // Let enter animations (Reanimated) settle so screenshots show final state.
        await page.waitForTimeout(1200);
        await page.screenshot({ path: path.join(SHOTS, `${name}.png`) });
      },
      byId: (id) => page.getByTestId(id),
    };

    const slug = s.name
      .normalize('NFD')
      .replace(/[̀-ͯ]/g, '')
      .replace(/đ/gi, 'd')
      .replace(/[^a-z0-9]+/gi, '-')
      .replace(/^-|-$/g, '')
      .toLowerCase();
    const failShot = path.join(SHOTS, `FAIL-${slug}.png`);
    const started = Date.now();
    try {
      await s.fn(ctx);
      assert(consoleErrors.length === 0, `no console errors, got:\n  ${consoleErrors.join('\n  ')}`);
      fs.rmSync(failShot, { force: true }); // drop a stale failure shot once the scenario passes
      console.log(`  ✔ ${s.name} (${Date.now() - started} ms)`);
    } catch (err) {
      failed++;
      await page.screenshot({ path: failShot }).catch(() => {});
      console.log(`  ✘ ${s.name}\n    ${String(err.message).split('\n').join('\n    ')}`);
    } finally {
      await context.close();
    }
  }

  await browser.close();
  console.log(failed ? `\n${failed} scenario(s) failed` : '\nAll scenarios passed');
  process.exit(failed ? 1 : 0);
}

module.exports = { scenario, assert, run, REAL };
