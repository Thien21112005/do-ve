/**
 * Deterministic in-browser stand-in for the DoVe Spring Boot API.
 * Mirrors the real contract: V6/V7 seed (stations + weekday schedule), RFC 7807 errors with
 * `code`, batch limit of 20 tickets, and the Southern lottery matching rules (BR-01..04).
 */

const STATIONS = [
  ['tp-hcm', 'TP. Hồ Chí Minh'], ['dong-thap', 'Đồng Tháp'], ['ca-mau', 'Cà Mau'],
  ['ben-tre', 'Bến Tre'], ['vung-tau', 'Vũng Tàu'], ['bac-lieu', 'Bạc Liêu'],
  ['dong-nai', 'Đồng Nai'], ['can-tho', 'Cần Thơ'], ['soc-trang', 'Sóc Trăng'],
  ['tay-ninh', 'Tây Ninh'], ['an-giang', 'An Giang'], ['binh-thuan', 'Bình Thuận'],
  ['vinh-long', 'Vĩnh Long'], ['binh-duong', 'Bình Dương'], ['tra-vinh', 'Trà Vinh'],
  ['long-an', 'Long An'], ['hau-giang', 'Hậu Giang'], ['binh-phuoc', 'Bình Phước'],
  ['tien-giang', 'Tiền Giang'], ['kien-giang', 'Kiên Giang'], ['da-lat', 'Đà Lạt (Lâm Đồng)'],
].map(([code, name]) => ({ code, name, region: 'SOUTH' }));

const SCHEDULE = {
  1: ['tp-hcm', 'dong-thap', 'ca-mau'],
  2: ['ben-tre', 'vung-tau', 'bac-lieu'],
  3: ['dong-nai', 'can-tho', 'soc-trang'],
  4: ['tay-ninh', 'an-giang', 'binh-thuan'],
  5: ['vinh-long', 'binh-duong', 'tra-vinh'],
  6: ['tp-hcm', 'long-an', 'hau-giang', 'binh-phuoc'],
  7: ['tien-giang', 'kien-giang', 'da-lat'],
};

const TIERS = [
  ['SPECIAL', 1, 6], ['FIRST', 1, 5], ['SECOND', 1, 5], ['THIRD', 2, 5], ['FOURTH', 7, 5],
  ['FIFTH', 1, 4], ['SIXTH', 3, 4], ['SEVENTH', 1, 3], ['EIGHTH', 1, 2],
];

const PRIZES = {
  SPECIAL: 2_000_000_000, FIRST: 30_000_000, SECOND: 15_000_000, THIRD: 10_000_000,
  FOURTH: 3_000_000, FIFTH: 1_000_000, SIXTH: 400_000, SEVENTH: 200_000, EIGHTH: 100_000,
  SPECIAL_CONSOLATION: 50_000_000, ENCOURAGEMENT: 6_000_000,
};

/** Draws whose special number is pinned so tests can assert exact wins (leading zero kept). */
const PINNED_SPECIAL = { 'vinh-long|2026-11-20': '012345' };

function weekday(date) {
  const [y, m, d] = date.split('-').map(Number);
  const w = new Date(Date.UTC(y, m - 1, d, 12)).getUTCDay();
  return w === 0 ? 7 : w;
}

function seededDigits(seed, length) {
  let h = 2166136261;
  for (const ch of seed) h = Math.imul(h ^ ch.charCodeAt(0), 16777619) >>> 0;
  let out = '';
  for (let i = 0; i < length; i++) {
    h = Math.imul(h ^ (h >>> 13), 1274126177) >>> 0;
    out += String(h % 10);
  }
  return out;
}

function buildDraw(station, date) {
  const numbers = {};
  for (const [tier, count, digits] of TIERS) {
    numbers[tier] = Array.from({ length: count }, (_, i) =>
      seededDigits(`${station}|${date}|${tier}|${i}`, digits),
    );
  }
  const pinned = PINNED_SPECIAL[`${station}|${date}`];
  if (pinned) numbers.SPECIAL = [pinned];
  const name = STATIONS.find((s) => s.code === station)?.name ?? station;
  return { stationCode: station, stationName: name, drawDate: date, numbers };
}

function checkOne(ticket, draw) {
  const wins = [];
  for (const [tier, , digits] of TIERS) {
    for (const n of draw.numbers[tier]) {
      if (ticket.slice(-digits) === n) wins.push({ tier, matchedNumber: n, prizeAmount: PRIZES[tier] });
    }
  }
  const special = draw.numbers.SPECIAL[0];
  if (!wins.some((w) => w.tier === 'SPECIAL')) {
    if (ticket[0] !== special[0] && ticket.slice(1) === special.slice(1)) {
      wins.push({ tier: 'SPECIAL_CONSOLATION', matchedNumber: special, prizeAmount: PRIZES.SPECIAL_CONSOLATION });
    } else if (ticket[0] === special[0]) {
      let diff = 0;
      for (let i = 1; i < 6; i++) if (ticket[i] !== special[i]) diff++;
      if (diff === 1) wins.push({ tier: 'ENCOURAGEMENT', matchedNumber: special, prizeAmount: PRIZES.ENCOURAGEMENT });
    }
  }
  const totalAmount = wins.reduce((a, w) => a + w.prizeAmount, 0);
  return {
    ticket, stationCode: draw.stationCode, stationName: draw.stationName, drawDate: draw.drawDate,
    status: 'CHECKED', won: wins.length > 0, wins, totalAmount,
  };
}

function problem(status, code, detail) {
  return { status, body: { type: 'about:blank', title: code, status, detail, code } };
}

/**
 * Creates a mock API. `options.today` is the VN date used to decide which draws exist (today's
 * draw exists because the tests freeze the clock after 16:40). `options.overrides` lets a
 * scenario replace a route: `(method, path, query, body) => response | undefined`.
 */
function createMockApi(options = {}) {
  const today = options.today ?? '2026-11-20';
  const calls = [];

  function resolveDraw(station, date) {
    if (!STATIONS.some((s) => s.code === station)) return problem(404, 'STATION_NOT_FOUND', 'Mã đài không tồn tại');
    if (!SCHEDULE[weekday(date)].includes(station)) return problem(422, 'STATION_NOT_DRAWING', 'Đài không quay vào ngày đó');
    if (date > today) return problem(404, 'RESULT_NOT_AVAILABLE', 'Chưa có kết quả mở thưởng');
    return { status: 200, body: buildDraw(station, date) };
  }

  function handle(method, path, query, body) {
    calls.push({ method, path, query, body });
    const custom = options.overrides?.(method, path, query, body, calls);
    if (custom) return custom;

    if (path === '/api/v1/app/config') return { status: 200, body: { minSupportedVersion: '0.0.0', maintenance: false, message: '' } };
    if (path === '/api/v1/stations') return { status: 200, body: STATIONS };
    if (path === '/api/v1/draws/schedule') {
      const codes = SCHEDULE[weekday(query.date)];
      return { status: 200, body: STATIONS.filter((s) => codes.includes(s.code)) };
    }
    if (path === '/api/v1/draws') {
      return resolveDraw(query.station, query.date);
    }
    if (path === '/api/v1/draws/latest-day') {
      const date = query.date ?? today;
      if (date > today) return { status: 200, body: [] };
      return { status: 200, body: SCHEDULE[weekday(date)].map((s) => buildDraw(s, date)) };
    }
    if (path === '/api/v1/draws/latest') {
      const station = query.station ?? SCHEDULE[weekday(today)][0];
      return { status: 200, body: buildDraw(station, today) };
    }
    if (path === '/api/v1/check' && method === 'POST') {
      const r = resolveDraw(body.stationCode, body.drawDate);
      if (r.status === 404 && r.body.code === 'RESULT_NOT_AVAILABLE') {
        return { status: 200, body: { ticket: body.ticket, stationCode: body.stationCode, drawDate: body.drawDate, status: 'RESULT_NOT_AVAILABLE', won: null, wins: [], totalAmount: 0 } };
      }
      if (r.status !== 200) return r;
      return { status: 200, body: checkOne(body.ticket, r.body) };
    }
    if (path === '/api/v1/check/batch' && method === 'POST') {
      if (!Array.isArray(body.tickets) || body.tickets.length < 1 || body.tickets.length > 20) {
        return problem(400, 'INVALID_TICKET', 'tickets: Số lượng vé dò mỗi lần từ 1 đến 20 vé');
      }
      const r = resolveDraw(body.stationCode, body.drawDate);
      if (r.status === 404 && r.body.code === 'RESULT_NOT_AVAILABLE') {
        const results = body.tickets.map((t) => ({ ticket: t, stationCode: body.stationCode, drawDate: body.drawDate, status: 'RESULT_NOT_AVAILABLE', won: null, wins: [], totalAmount: 0 }));
        return { status: 200, body: { stationCode: body.stationCode, drawDate: body.drawDate, results, totalAmount: 0 } };
      }
      if (r.status !== 200) return r;
      const results = body.tickets.map((t) => checkOne(t, r.body));
      return { status: 200, body: { stationCode: body.stationCode, stationName: r.body.stationName, drawDate: body.drawDate, results, totalAmount: results.reduce((a, x) => a + x.totalAmount, 0) } };
    }
    return problem(404, 'NOT_FOUND', `Mock không có route ${method} ${path}`);
  }

  /** Installs the mock on a Playwright page for every request to `/api/**` on any host. */
  async function install(page) {
    await page.route(/\/api\/v1\//, async (route) => {
      const req = route.request();
      const url = new URL(req.url());
      const query = Object.fromEntries(url.searchParams.entries());
      let body;
      try { body = req.postDataJSON(); } catch { body = undefined; }
      const res = handle(req.method(), url.pathname, query, body);
      if (res.abort) return route.abort(res.abort);
      const isProblem = res.status >= 400;
      await route.fulfill({
        status: res.status,
        contentType: isProblem ? 'application/problem+json' : 'application/json',
        body: JSON.stringify(res.body),
      });
    });
  }

  return { install, calls, buildDraw, checkOne };
}

module.exports = { createMockApi, buildDraw, SCHEDULE, STATIONS };
