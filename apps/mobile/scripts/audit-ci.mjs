#!/usr/bin/env node
/**
 * CI Dependency Audit Gate for DoVe Mobile.
 *
 * Enforces `npm audit` against the committed `package-lock.json` while
 * applying reachability-based triage per `security-and-hardening`:
 * - Any CRITICAL advisory fails immediately (zero deferrals permitted).
 * - Any HIGH advisory fails immediately UNLESS it is in the time-bounded
 *   `DEFERRED_BUILD_ONLY_ADVISORIES` registry below AND has no non-breaking
 *   upstream patch available yet.
 */
import { execFileSync } from 'node:child_process';

const DEFERRED_BUILD_ONLY_ADVISORIES = {
  'https://github.com/advisories/GHSA-fc5q-39xc-vjpf': {
    package: 'picomatch',
    reachability: 'build-only (Metro / Expo CLI / Tailwind file globbing; not shipped in client bundle)',
    reason: 'Latest upstream release on npm (4.0.7) has no non-breaking patch yet; npm audit fix --force would downgrade Expo 58 -> 52.',
    reviewBy: '2026-12-31',
  },
};

let raw = '';
try {
  raw = execFileSync(process.platform === 'win32' ? 'npm.cmd' : 'npm', ['audit', '--json'], {
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
    shell: process.platform === 'win32',
    maxBuffer: 32 * 1024 * 1024,
  });
} catch (err) {
  raw = err?.stdout ? String(err.stdout) : '';
  if (!raw) {
    console.error('Failed to execute npm audit --json:', err?.message || err);
    process.exit(1);
  }
}

const report = JSON.parse(raw);
const vulnerabilities = report.vulnerabilities || {};
const todayIso = new Date().toISOString().slice(0, 10);

const blocking = [];
const deferred = [];

for (const [pkgName, vuln] of Object.entries(vulnerabilities)) {
  const directAdvisories = (vuln.via || []).filter((item) => typeof item === 'object');
  for (const adv of directAdvisories) {
    const severity = String(adv.severity || vuln.severity || '').toLowerCase();
    if (severity !== 'high' && severity !== 'critical') continue;

    if (severity === 'critical') {
      blocking.push({ pkgName, severity, url: adv.url, title: adv.title });
      continue;
    }

    const deferral = adv.url ? DEFERRED_BUILD_ONLY_ADVISORIES[adv.url] : undefined;
    const hasCleanPatch = vuln.fixAvailable === true;

    if (!deferral) {
      blocking.push({ pkgName, severity, url: adv.url, title: adv.title });
    } else if (todayIso > deferral.reviewBy) {
      blocking.push({
        pkgName,
        severity,
        url: adv.url,
        title: `${adv.title} (deferral expired on ${deferral.reviewBy})`,
      });
    } else if (hasCleanPatch) {
      blocking.push({
        pkgName,
        severity,
        url: adv.url,
        title: `${adv.title} (non-breaking patch is now available via npm audit fix)`,
      });
    } else {
      deferred.push({ pkgName, url: adv.url, title: adv.title, ...deferral });
    }
  }
}

if (deferred.length > 0) {
  console.log(`Documented build-only deferrals (${deferred.length}):`);
  for (const item of deferred) {
    console.log(`  - ${item.pkgName}: ${item.url} (review by ${item.reviewBy}) — ${item.reachability}`);
  }
}

if (blocking.length > 0) {
  console.error(`Blocking high/critical vulnerabilities detected (${blocking.length}):`);
  for (const item of blocking) {
    console.error(`  - [${item.severity.toUpperCase()}] ${item.pkgName}: ${item.title} (${item.url})`);
  }
  process.exit(1);
}

console.log('Security audit gate passed: 0 unmitigated reachable high/critical vulnerabilities.');

