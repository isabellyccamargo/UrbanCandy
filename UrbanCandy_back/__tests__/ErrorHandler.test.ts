import { afterEach, describe, expect, it, jest } from '@jest/globals';
import { once } from 'node:events';
import express from 'express';
import { ApiException } from '../src/exception/ApiException.js';
import { errorHandler } from '../src/middlewares/ErrorHandler.js';

describe('global API error handler', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('returns a standardized response and logs expected API errors as JSON', async () => {
    const warn = jest.spyOn(console, 'warn').mockImplementation(() => {});
    const app = express();
    app.get('/api/orders/:orderId', (_req, _res, next) => {
      next(new ApiException('ORDER_NOT_FOUND', 404));
    });
    app.use(errorHandler);

    const server = app.listen(0);
    await once(server, 'listening');

    try {
      const address = server.address();
      if (!address || typeof address === 'string') {
        throw new Error('Test server did not bind a port.');
      }

      const response = await fetch(`http://127.0.0.1:${address.port}/api/orders/123`);
      expect(response.status).toBe(404);
      expect(await response.json()).toEqual({
        code: 'ORDER_NOT_FOUND',
        message: expect.any(String),
      });

      const log = JSON.parse(String(warn.mock.calls[0][0]));
      expect(log).toMatchObject({
        event: 'api_error',
        method: 'GET',
        route: '/api/orders/:orderId',
        statusCode: 404,
        code: 'ORDER_NOT_FOUND',
        errorName: 'ApiException',
      });
      expect(log).not.toHaveProperty('stackTrace');
    } finally {
      server.close();
      await once(server, 'close');
    }
  });

  it('logs internal error diagnostics without exposing them in the API response', async () => {
    const errorLog = jest.spyOn(console, 'error').mockImplementation(() => {});
    const app = express();
    app.get('/api/orders/:orderId', (_req, _res, next) => {
      next(new Error('database connection details'));
    });
    app.use(errorHandler);

    const server = app.listen(0);
    await once(server, 'listening');

    try {
      const address = server.address();
      if (!address || typeof address === 'string') {
        throw new Error('Test server did not bind a port.');
      }

      const response = await fetch(`http://127.0.0.1:${address.port}/api/orders/123`);
      expect(response.status).toBe(500);
      expect(await response.json()).toEqual({
        code: 'INTERNAL_ERROR',
        message: 'Erro interno no servidor',
      });

      const log = JSON.parse(String(errorLog.mock.calls[0][0]));
      expect(log).toMatchObject({
        event: 'api_error',
        method: 'GET',
        route: '/api/orders/:orderId',
        statusCode: 500,
        code: 'INTERNAL_ERROR',
        errorName: 'Error',
      });
      expect(log.stackTrace).toContain('ErrorHandler.test.ts');
      expect(JSON.stringify(log)).not.toContain('database connection details');
    } finally {
      server.close();
      await once(server, 'close');
    }
  });

  it('returns a standardized client error for malformed JSON requests', async () => {
    const warn = jest.spyOn(console, 'warn').mockImplementation(() => {});
    const app = express();
    app.use(express.json());
    app.post('/api/orders', (_req, res) => res.sendStatus(201));
    app.use(errorHandler);

    const server = app.listen(0);
    await once(server, 'listening');

    try {
      const address = server.address();
      if (!address || typeof address === 'string') {
        throw new Error('Test server did not bind a port.');
      }

      const response = await fetch(`http://127.0.0.1:${address.port}/api/orders`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: '{',
      });

      expect(response.status).toBe(400);
      expect(await response.json()).toEqual({
        code: 'INVALID_REQUEST_BODY',
        message: 'O corpo da requisição está inválido.',
      });
      expect(JSON.parse(String(warn.mock.calls[0][0]))).toMatchObject({
        event: 'api_error',
        method: 'POST',
        route: 'unmatched',
        statusCode: 400,
        code: 'INVALID_REQUEST_BODY',
        errorName: 'ApiException',
      });
    } finally {
      server.close();
      await once(server, 'close');
    }
  });
});
