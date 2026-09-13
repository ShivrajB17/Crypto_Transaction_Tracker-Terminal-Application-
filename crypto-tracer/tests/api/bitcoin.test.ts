import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import request from 'supertest';
import { app } from '../../src/crypto-tracer/app.js';

describe('Bitcoin API Endpoints', () => {
  let fetchSpy: any;

  beforeEach(() => {
    fetchSpy = vi.spyOn(global, 'fetch');
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should return 400 for an invalid Bitcoin address', async () => {
    fetchSpy.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ isvalid: false })
    } as any);

    const res = await request(app).get('/api/bitcoin/address/invalid_address/transactions');
    
    expect(res.status).toBe(400);
    expect(res.body).toEqual({ error: 'Invalid Bitcoin address' });
    expect(fetchSpy).toHaveBeenCalledWith(expect.stringContaining('/validate-address/invalid_address'));
  });

  it('should return 502 on upstream API failure (validate-address)', async () => {
    fetchSpy.mockResolvedValueOnce({
      ok: false,
      status: 500,
      statusText: 'Internal Server Error'
    } as any);

    const res = await request(app).get('/api/bitcoin/address/some_address/transactions');
    
    expect(res.status).toBe(502);
    expect(res.body).toEqual({ error: 'Upstream blockchain API error' });
  });

  it('should return 502 on upstream API failure (transactions)', async () => {
    fetchSpy.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ isvalid: true })
    } as any);
    
    fetchSpy.mockResolvedValueOnce({
      ok: false,
      status: 500,
      statusText: 'Internal Server Error'
    } as any);

    const res = await request(app).get('/api/bitcoin/address/some_address/transactions');
    
    expect(res.status).toBe(502);
    expect(res.body).toEqual({ error: 'Upstream blockchain API error' });
  });

  it('should normalize and return transactions for a valid address', async () => {
    fetchSpy.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ isvalid: true })
    } as any);

    const mockMempoolResponse = [
      {
        txid: 'mock_txid_1',
        vin: [
          {
            txid: 'prev_txid',
            vout: 0,
            prevout: {
              value: 1000,
              scriptpubkey_address: 'sender_address'
            }
          }
        ],
        vout: [
          {
            value: 900,
            scriptpubkey_address: 'some_address'
          }
        ],
        fee: 100,
        status: {
          confirmed: true,
          block_height: 123456,
          block_time: 1600000000
        }
      }
    ];

    fetchSpy.mockResolvedValueOnce({
      ok: true,
      json: async () => mockMempoolResponse
    } as any);
    
    fetchSpy.mockResolvedValueOnce({
      ok: true,
      json: async () => []
    } as any);

    const res = await request(app).get('/api/bitcoin/address/some_address/transactions');
    
    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(1);
    
    const tx = res.body[0];
    expect(tx.txid).toBe('mock_txid_1');
    expect(tx.fee).toBe(100);
    expect(tx.confirmed).toBe(true);
    expect(tx.blockHeight).toBe(123456);
    expect(tx.timestamp).toBe(1600000000);
    
    expect(tx.inputs).toHaveLength(1);
    expect(tx.inputs[0].txid).toBe('prev_txid');
    expect(tx.inputs[0].value).toBe(1000);
    expect(tx.inputs[0].address).toBe('sender_address');
    
    expect(tx.outputs).toHaveLength(1);
    expect(tx.outputs[0].value).toBe(900);
    expect(tx.outputs[0].address).toBe('some_address');
  });

  it('should return trace results for /trace endpoint', async () => {
    fetchSpy.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ isvalid: true })
    } as any);

    const mockMempoolResponse = [
      {
        txid: 'mock_txid_1',
        vin: [
          { txid: 'prev_txid', vout: 0, prevout: { value: 1000, scriptpubkey_address: 'start_addr' } }
        ],
        vout: [
          { value: 900, scriptpubkey_address: 'next_addr' }
        ],
        fee: 100,
        status: { confirmed: true }
      }
    ];

    fetchSpy.mockResolvedValueOnce({
      ok: true,
      json: async () => mockMempoolResponse
    } as any);
    
    // For depth 1 pagination empty
    fetchSpy.mockResolvedValueOnce({
      ok: true,
      json: async () => []
    } as any);

    // For next_addr trace empty
    fetchSpy.mockResolvedValueOnce({
      ok: true,
      json: async () => []
    } as any);

    const res = await request(app).get('/api/bitcoin/address/start_addr/trace');
    
    expect(res.status).toBe(200);
    expect(res.body.length).toBeGreaterThan(0);
    expect(res.body[0].address).toBe('start_addr');
  });

  it('should parse and pass maxDepth and maxNodes from query parameters', async () => {
    fetchSpy.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ isvalid: true })
    } as any);

    // Mock empty txs so trace terminates instantly
    fetchSpy.mockResolvedValueOnce({
      ok: true,
      json: async () => []
    } as any);

    const res = await request(app).get('/api/bitcoin/address/start_addr/trace?maxDepth=2&maxNodes=5');
    
    expect(res.status).toBe(200);
    // Because we mock empty txs, the graph has no nodes and returns an empty trace
    expect(res.body).toHaveLength(0);
  });
});

