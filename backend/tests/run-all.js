// Runs every *.test.js in this folder and summarises. Usage: npm run test:api  (BASE=... to target)
const { spawnSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const suites = fs.readdirSync(__dirname).filter((f) => f.endsWith('.test.js')).sort();
let failed = 0;
for (const suite of suites) {
  console.log(`\n=== ${suite} ===`);
  const result = spawnSync(process.execPath, [path.join(__dirname, suite)], { stdio: 'inherit', env: process.env });
  if (result.status !== 0) failed += 1;
}
console.log(`\n${suites.length - failed}/${suites.length} suites passed (target: ${process.env.BASE || 'http://localhost:8080'})`);
process.exit(failed ? 1 : 0);
