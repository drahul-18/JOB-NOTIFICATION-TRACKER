/**
 * Smoke test - verifies app loads and key elements exist
 * Run: node test/smoke-test.js (with dev server running on port 3000)
 */

const http = require('http');

const BASE = 'http://localhost:3000';

function fetch(url) {
  return new Promise((resolve, reject) => {
    http.get(url, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => resolve({ status: res.statusCode, body: data }));
    }).on('error', reject);
  });
}

async function runTests() {
  const results = [];
  let passed = 0;

  // Test 1: Index page loads
  try {
    const { status, body } = await fetch(BASE + '/');
    const ok = status === 200 && body.includes('Job Notification Tracker');
    results.push({ name: 'Index page loads', ok });
    if (ok) passed++;
  } catch (e) {
    results.push({ name: 'Index page loads', ok: false, error: e.message });
  }

  // Test 2: Design system CSS loads
  try {
    const { status } = await fetch(BASE + '/design-system/index.css');
    const ok = status === 200;
    results.push({ name: 'Design system CSS loads', ok });
    if (ok) passed++;
  } catch (e) {
    results.push({ name: 'Design system CSS loads', ok: false, error: e.message });
  }

  // Test 3: Jobs data loads
  try {
    const { status, body } = await fetch(BASE + '/data/jobs.js');
    const ok = status === 200 && body.includes('JOBS');
    results.push({ name: 'Jobs data loads', ok });
    if (ok) passed++;
  } catch (e) {
    results.push({ name: 'Jobs data loads', ok: false, error: e.message });
  }

  // Test 4: App JS loads
  try {
    const { status, body } = await fetch(BASE + '/app.js');
    const ok = status === 200 && body.includes('ROUTES');
    results.push({ name: 'App JS loads', ok });
    if (ok) passed++;
  } catch (e) {
    results.push({ name: 'App JS loads', ok: false, error: e.message });
  }

  console.log('\n--- Smoke Test Results ---\n');
  results.forEach((r) => {
    const icon = r.ok ? '\x1b[32m✓\x1b[0m' : '\x1b[31m✗\x1b[0m';
    console.log(`  ${icon} ${r.name}${r.error ? ' - ' + r.error : ''}`);
  });
  console.log(`\nPassed: ${passed}/${results.length}\n`);
  process.exit(passed === results.length ? 0 : 1);
}

runTests();
