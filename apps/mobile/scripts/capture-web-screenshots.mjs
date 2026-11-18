#!/usr/bin/env node
/**
 * Lightweight static + mock-API screenshot runner for DoVe Expo Web exports.
 * Serves `apps/mobile/dist` on 127.0.0.1:8188, serves realistic XSMN fixture
 * responses on 127.0.0.1:8080, and captures light + dark mobile viewports via
 * Playwright + system Microsoft Edge (`npx playwright screenshot`).
 *
 * Usage:
 *   node scripts/capture-web-screenshots.mjs <outDir> [prefix] [routesCsv]
 *   e.g. node scripts/capture-web-screenshots.mjs ../../docs/screenshots/phase11/baseline/after-t1101 "" "home:/,check:/check,results:/results,tickets:/tickets,more:/more,schedule:/schedule,settings:/settings,about:/about"
 */
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const mobileRoot = path.resolve(__dirname, '..');
const distDir = path.join(mobileRoot, 'dist');

const outDirArg = process.argv[2] || '../../docs/screenshots/phase11/baseline/after-t1101';
const rawPrefix = process.argv[3] || '-';
const prefix = rawPrefix === '-' ? '' : rawPrefix; // e.g. 'before' or 'after' or '-'
const routesCsv =
  process.argv[4] ||
  'home:/,check:/check,results:/results,tickets:/tickets,more:/more,schedule:/schedule,settings:/settings,about:/about';
const themesCsv = process.argv[5] || 'light,dark';
const viewportSize = process.argv[6] || '390,844';

const outDir = path.resolve(mobileRoot, outDirArg);
fs.mkdirSync(outDir, { recursive: true });

// Rewrite baked LAN URL in dist JS bundles so browser hits local mock API on 127.0.0.1:8080
const jsDir = path.join(distDir, '_expo', 'static', 'js', 'web');
if (fs.existsSync(jsDir)) {
  for (const f of fs.readdirSync(jsDir)) {
    if (!f.endsWith('.js')) continue;
    const full = path.join(jsDir, f);
    const content = fs.readFileSync(full, 'utf8');
    if (content.includes('http://192.168.1.149:8080')) {
      fs.writeFileSync(
        full,
        content.replaceAll('http://192.168.1.149:8080', 'http://127.0.0.1:8080'),
      );
    }
  }
}

const SAMPLE_STATIONS = [
  { code: 'ben-tre', name: 'Bến Tre', region: 'SOUTH' },
  { code: 'vung-tau', name: 'Vũng Tàu', region: 'SOUTH' },
  { code: 'bac-lieu', name: 'Bạc Liêu', region: 'SOUTH' },
];

function makeDraw(code, name, drawDate, seed) {
  return {
    stationCode: code,
    stationName: name,
    drawDate,
    isComplete: true,
    numbers: {
      EIGHTH: [String(40 + seed).padStart(2, '0')],
      SEVENTH: [String(300 + seed).padStart(3, '0')],
      SIXTH: ['1832', '5501', '0973'],
      FIFTH: ['6620'],
      FOURTH: ['04512', '77810', '31904', '62845', '19023', '84511', '50298'],
      THIRD: ['11029', '58011'],
      SECOND: ['90015'],
      FIRST: ['38274'],
      SPECIAL: [`04512${seed}`],
    },
  };
}

// Compute yesterday in VN time so "latest drawn session" always has complete data
const vnNow = new Date(Date.now() + 7 * 3600 * 1000);
const yesterdayVN = new Date(vnNow.getTime() - 24 * 3600 * 1000)
  .toISOString()
  .slice(0, 10);

const SAMPLE_DRAWS = [
  makeDraw('ben-tre', 'Bến Tre', yesterdayVN, 3),
  makeDraw('vung-tau', 'Vũng Tàu', yesterdayVN, 7),
  makeDraw('bac-lieu', 'Bạc Liêu', yesterdayVN, 9),
];

const apiServer = http.createServer((req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }
  const u = new URL(req.url || '/', 'http://127.0.0.1:8080');
  res.setHeader('Content-Type', 'application/json; charset=utf-8');

  if (u.pathname === '/api/v1/app/config') {
    res.end(
      JSON.stringify({
        minSupportedVersion: '1.0.0',
        latestVersion: '1.0.0',
        maintenanceMode: false,
      }),
    );
    return;
  }
  if (u.pathname === '/api/v1/stations' || u.pathname === '/api/v1/draws/schedule') {
    res.end(JSON.stringify(SAMPLE_STATIONS));
    return;
  }
  if (u.pathname === '/api/v1/draws/latest' || u.pathname === '/api/v1/draws/latest-day') {
    const d = u.searchParams.get('date') || yesterdayVN;
    res.end(JSON.stringify(SAMPLE_DRAWS.map((x) => ({ ...x, drawDate: d }))));
    return;
  }
  if (u.pathname === '/api/v1/draws') {
    const st = u.searchParams.get('station') || 'ben-tre';
    const d = u.searchParams.get('date') || yesterdayVN;
    const found = SAMPLE_DRAWS.find((x) => x.stationCode === st) || SAMPLE_DRAWS[0];
    res.end(JSON.stringify({ ...found, stationCode: st, drawDate: d }));
    return;
  }
  if (u.pathname === '/api/v1/check') {
    res.end(
      JSON.stringify({
        ticket: '045123',
        stationCode: 'ben-tre',
        stationName: 'Bến Tre',
        drawDate: yesterdayVN,
        status: 'CHECKED',
        won: true,
        totalAmount: 2000000000,
        wins: [{ tier: 'SPECIAL', matchedNumber: '045123', prizeAmount: 2000000000 }],
      }),
    );
    return;
  }
  res.end(JSON.stringify([]));
});

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.ttf': 'font/ttf',
  '.png': 'image/png',
  '.ico': 'image/x-icon',
  '.json': 'application/json',
};

const webServer = http.createServer((req, res) => {
  const u = new URL(req.url || '/', 'http://127.0.0.1:8188');
  let rel = decodeURIComponent(u.pathname);
  if (rel === '/') rel = '/index.html';
  let filePath = path.join(distDir, rel);
  if (!fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
    const htmlCandidate = `${filePath}.html`;
    if (fs.existsSync(htmlCandidate)) {
      filePath = htmlCandidate;
    } else if (!path.extname(rel)) {
      filePath = path.join(distDir, 'index.html');
    } else {
      res.writeHead(404);
      res.end('Not found');
      return;
    }
  }
  const ext = path.extname(filePath);
  res.setHeader('Content-Type', MIME[ext] || 'application/octet-stream');
  if (ext === '.html' && process.env.INJECT_HEAD_HTML) {
    const html = fs.readFileSync(filePath, 'utf8');
    res.end(html.replace('</head>', `${process.env.INJECT_HEAD_HTML}</head>`));
    return;
  }
  fs.createReadStream(filePath).pipe(res);
});

function runPlaywrightScreenshot(args) {
  return new Promise((resolve, reject) => {
    const cmd = process.platform === 'win32' ? 'npx.cmd' : 'npx';
    const child = spawn(cmd, ['playwright', 'screenshot', ...args], {
      stdio: 'inherit',
      shell: process.platform === 'win32',
    });
    child.on('error', reject);
    child.on('exit', (code) => {
      if (code === 0) resolve();
      else reject(new Error(`playwright screenshot exited with code ${code}`));
    });
  });
}

await new Promise((r) => apiServer.listen(8080, '127.0.0.1', r));
await new Promise((r) => webServer.listen(8188, '127.0.0.1', r));

try {
  const routes = routesCsv.split(',').map((pair) => {
    const [name, routePath] = pair.split(':');
    return { name: name.trim(), routePath: routePath.trim() };
  });
  const themes = themesCsv.split(',').map((t) => t.trim());

  for (const { name, routePath } of routes) {
    for (const theme of themes) {
      const fileName = prefix ? `${name}-${prefix}-${theme}.png` : `${name}-${theme}.png`;
      const targetFile = path.join(outDir, fileName);
      const url = `http://127.0.0.1:8188${routePath}`;
      await runPlaywrightScreenshot([
        '--channel=msedge',
        `--viewport-size=${viewportSize}`,
        `--color-scheme=${theme}`,
        '--wait-for-timeout=1500',
        url,
        targetFile,
      ]);
    }
  }
} finally {
  apiServer.close();
  webServer.close();
}
