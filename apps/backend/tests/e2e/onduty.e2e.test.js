import { describe, it, before, after } from 'node:test';
import assert from 'node:assert/strict';
import '../setup.js';
import { startTestServer, stopTestServer, apiRequest } from '../helpers/testServer.js';

describe('Backend Express.js OnDuty Lifecycle E2E Tests', () => {
  before(async () => {
    await startTestServer();
  });

  after(async () => {
    await stopTestServer();
  });

  it('GET /onduty/getDocId should return auto-incremented preview DocID with company prefix', async () => {
    const res = await apiRequest('/onduty/getDocId', {
      headers: {
        compcode: 'TLT',
        idcard: '1001',
      },
    });
    assert.equal(res.status, 200);
    assert.equal(res.data.status, 1);
    assert.ok(res.data.data.docid);
    assert.ok(res.data.data.docid.startsWith('TLT/OND-'));
  });

  it('GET /onduty/get_all_Onduty_reason should return list of reason categories', async () => {
    const res = await apiRequest('/onduty/get_all_Onduty_reason', {
      headers: {
        compcode: 'TLT',
      },
    });
    assert.equal(res.status, 200);
    assert.ok(Array.isArray(res.data.data));
  });

  it('POST /onduty/requestonduty_Approval without docid should return 400 validation error', async () => {
    const res = await apiRequest('/onduty/requestonduty_Approval', {
      method: 'POST',
      headers: { compcode: 'TLT' },
      body: { approval: 'approved' },
    });
    assert.equal(res.status, 400);
    assert.equal(res.data.status, 0);
  });

  it('POST /onduty/requestonduty_Approval with invalid status should return 400', async () => {
    const res = await apiRequest('/onduty/requestonduty_Approval', {
      method: 'POST',
      headers: { compcode: 'TLT' },
      body: { docid: 'TLT/OND-000001', approval: 'invalid_status_xyz' },
    });
    assert.equal(res.status, 400);
    assert.equal(res.data.status, 0);
  });

  it('GET /onduty/getIn should return response for user current status', async () => {
    const res = await apiRequest('/onduty/getIn', {
      headers: {
        compcode: 'TLT',
        idcard: '1001',
      },
    });
    assert.equal(res.status, 200);
    assert.ok(res.data.status === 0 || res.data.status === 1);
  });
});

