/**
 * TopLight Unified E2E Test Suite Runner
 * (Appium Mobile + Express.js Backend)
 */

import { spawn } from 'child_process';
import path from 'path';

const suite = process.argv[2] || 'all';
const filter = process.argv[3]; // e.g., 'login', 'onduty', 'attendance'

console.log('====================================================');
console.log(`🚀 Starting TopLight E2E Test Suite: [${suite.toUpperCase()}]${filter ? ` (Filter: ${filter})` : ''}`);
console.log('====================================================');

function runCommand(command, args, cwd) {
  return new Promise((resolve, reject) => {
    const proc = spawn(command, args, {
      cwd,
      stdio: 'inherit',
      shell: true,
    });

    proc.on('close', (code) => {
      if (code === 0) resolve();
      else reject(new Error(`Command exited with status code ${code}`));
    });
  });
}

async function run() {
  const startTime = Date.now();

  try {
    if (suite === 'backend' || suite === 'all') {
      console.log('\n📦 [1/2] Running Backend Express.js E2E Test Suites...');
      const backendPattern = filter ? `tests/e2e/*${filter}*.test.js` : 'tests/e2e/*.test.js';
      await runCommand('node', ['--test', backendPattern], path.resolve('apps/backend'));
      console.log('✅ Backend Express.js E2E Tests PASSED!\n');
    }

    if (suite === 'mobile' || suite === 'all') {
      console.log('\n📱 [2/2] Running Appium React Native Mobile E2E Test Specs...');
      if (filter) {
        console.log(`  -> Running isolated spec matching filter: "${filter}"...`);
        const mobilePattern = `specs/*${filter}*.spec.js`;
        await runCommand('node', ['--test', mobilePattern], path.resolve('e2e/mobile'));
      } else {
        console.log('  -> Running unified mobile suite in single persistent session (no app reopening)...');
        await runCommand('node', ['--test', 'suite.spec.js'], path.resolve('e2e/mobile'));
      }
      console.log('✅ Appium Mobile E2E Tests Finished!\n');
    }

    const duration = ((Date.now() - startTime) / 1000).toFixed(2);
    console.log('====================================================');
    console.log(`🎉 All E2E Automated Tests Completed Successfully in ${duration}s!`);
    console.log('====================================================');
  } catch (err) {
    console.error('\n❌ E2E Test Suite encountered an error:', err.message);
    process.exit(1);
  }
}

run();
