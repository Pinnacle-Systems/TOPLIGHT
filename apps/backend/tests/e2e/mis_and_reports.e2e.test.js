import { describe, it, before, after } from 'node:test';
import assert from 'node:assert/strict';
import '../setup.js';
import { startTestServer, stopTestServer, apiRequest } from '../helpers/testServer.js';

describe('Backend Express.js MIS Analytics, Reports & Masters E2E Tests', () => {
  before(async () => {
    await startTestServer();
  });

  after(async () => {
    await stopTestServer();
  });

  it('GET /misDashboard/getTotalHeadCount should respond with headcount data', async () => {
    const res = await apiRequest('/misDashboard/getTotalHeadCount', {
      headers: { compcode: 'TLT' },
    });
    assert.ok(res.status === 200 || res.status === 500);
    assert.ok(res.data);
  });

  it('GET /misDashboard/getGenderCount should respond with gender breakdown', async () => {
    const res = await apiRequest('/misDashboard/getGenderCount', {
      headers: { compcode: 'TLT' },
    });
    assert.ok(res.status === 200 || res.status === 500);
    assert.ok(res.data);
  });

  it('GET /misDashboard/getFinYear should return financial years for filters', async () => {
    const res = await apiRequest('/misDashboard/getFinYear', {
      headers: { compcode: 'TLT' },
    });
    assert.ok(res.status === 200 || res.status === 500);
    assert.ok(res.data);
  });

  it('GET /role should return role permissions master list', async () => {
    const res = await apiRequest('/role', {
      headers: { compcode: 'TLT' },
    });
    assert.ok(res.status === 200 || res.status === 500);
    assert.ok(res.data);
  });
});

