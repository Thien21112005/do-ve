/** Tab bar labels ("Trang chủ", "Kết quả"...) must not be clipped at the bottom of the screen. */
const { scenario, assert } = require('../harness.cjs');

const LABELS = ['Trang chủ', 'Dò vé', 'Kết quả', 'Vé của tôi', 'Thêm'];

scenario('Thanh tab: nhãn không bị cắt chân chữ', async ({ page, open, shot }) => {
  await open('check');
  const report = await page.evaluate((labels) => {
    const viewportBottom = window.innerHeight;
    return labels.map((text) => {
      const el = [...document.querySelectorAll('div, span')].find(
        (n) => n.childElementCount === 0 && n.textContent.trim() === text,
      );
      if (!el) return { text, missing: true };
      const r = el.getBoundingClientRect();
      // The text box (incl. descenders) must sit fully inside the viewport and not be cut by overflow.
      let clippedByParent = false;
      for (let p = el.parentElement; p && p !== document.body; p = p.parentElement) {
        const cs = getComputedStyle(p);
        if (cs.overflow === 'hidden' || cs.overflowY === 'hidden') {
          const pr = p.getBoundingClientRect();
          if (r.bottom > pr.bottom + 0.5) clippedByParent = true;
        }
      }
      return {
        text,
        bottom: Math.round(r.bottom * 10) / 10,
        viewportBottom,
        clippedByParent,
        textOverflows: el.scrollHeight > el.clientHeight + 1,
      };
    });
  }, LABELS);
  await shot('tabbar-labels');

  for (const r of report) {
    assert(!r.missing, `không tìm thấy nhãn "${r.text}"`);
    assert(
      !r.clippedByParent && !r.textOverflows && r.bottom <= r.viewportBottom - 4,
      `nhãn "${r.text}" bị cắt: ${JSON.stringify(r)}`,
    );
  }
});
