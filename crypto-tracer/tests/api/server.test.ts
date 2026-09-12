import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { app } from '../../src/crypto-tracer/app.js';

describe('Express API Tests', () => {
  it('GET /health should return status ok', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ status: 'ok' });
  });

  it('GET /api/test should return working message', async () => {
    const res = await request(app).get('/api/test');
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ message: 'Crypto Forensics Tracer API is working' });
  });
});
