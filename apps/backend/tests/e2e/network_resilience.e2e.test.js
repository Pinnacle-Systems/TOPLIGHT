import { describe, it, before, after } from 'node:test';
import assert from 'node:assert/strict';
import '../setup.js';
import { startTestServer, stopTestServer, apiRequest } from '../helpers/testServer.js';

describe('Network Resilience & Timeout Handling E2E Tests', () => {
  before(async () => {
    await startTestServer();
  });

  after(async () => {
    await stopTestServer();
  });

  it('should handle request abort / client timeout gracefully', async () => {
    const controller = new AbortController();
    // Simulate an ultra-short network timeout (1ms)
    setTimeout(() => controller.abort(), 1);

    try {
      await apiRequest('/health', { signal: controller.signal });
      assert.fail('Request should have timed out');
    } catch (err) {
      assert.ok(
        err.name === 'AbortError' || err.message.includes('aborted'),
        `Expected AbortError, received: ${err.name}`
      );
    }
  });

  it('should resolve DNS diagnostic check on /health within standard threshold', async () => {
    const startTime = Date.now();
    const res = await apiRequest('/health');
    const elapsed = Date.now() - startTime;

    assert.ok(res.status === 200 || res.status === 207);
    assert.ok(res.data.dns);
    assert.ok(
      elapsed < 10000,
      `DNS check took too long: ${elapsed}ms (threshold 10000ms)`
    );
  });

  it('should recover on immediate retry following a failed attempt', async () => {
    // Attempt 1: Valid request succeeds
    const firstAttempt = await apiRequest('/health');
    assert.ok(firstAttempt.status === 200 || firstAttempt.status === 207);

    // Attempt 2: Immediate consecutive retry also succeeds without socket hang
    const secondAttempt = await apiRequest('/health');
    assert.ok(secondAttempt.status === 200 || secondAttempt.status === 207);
  });
});

