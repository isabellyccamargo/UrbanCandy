import { once } from 'node:events';
import express from 'express';
import { jest } from '@jest/globals';
import { httpMetricsMiddleware, metricsHandler } from '../src/observability/metrics.js';

describe('Prometheus HTTP metrics', () => {
  it('exposes scrape output and records normalized routes', async () => {
    const app = express();
    app.use(httpMetricsMiddleware);
    app.get('/api/products/:id', (_req, res) => res.status(200).json({ ok: true }));
    app.get('/metrics', metricsHandler);
    const requestLog = jest.spyOn(console, 'info').mockImplementation(() => {});

    const server = app.listen(0);
    await once(server, 'listening');

    try {
      const address = server.address();
      if (!address || typeof address === 'string') {
        throw new Error('Test server did not bind a port.');
      }
      const baseUrl = `http://127.0.0.1:${address.port}`;

      const response = await fetch(`${baseUrl}/api/products/123`);
      expect(response.status).toBe(200);
      const log = requestLog.mock.calls
        .map(([message]) => JSON.parse(String(message)) as Record<string, unknown>)
        .find((entry) => entry.event === 'http_request');
      expect(log).toMatchObject({
        event: 'http_request',
        method: 'GET',
        route: '/api/products/:id',
        statusCode: 200,
      });
      expect(log?.durationMs).toEqual(expect.any(Number));

      const metrics = await fetch(`${baseUrl}/metrics`);
      const body = await metrics.text();

      expect(metrics.status).toBe(200);
      expect(metrics.headers.get('content-type')).toContain('text/plain');
      expect(body).toContain('urbancandy_http_requests_total');
      expect(body).toContain('route="/api/products/:id"');
      expect(body).not.toContain('route="/api/products/123"');
    } finally {
      requestLog.mockRestore();
      server.close();
      await once(server, 'close');
    }
  });
});
