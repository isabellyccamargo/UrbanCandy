import { createHmac } from 'node:crypto';
import { describe, expect, it } from '@jest/globals';
import {
  getCheckoutUrl,
  validateAccessToken,
  verifyWebhookSignature,
} from '../src/service/MercadoPagoService.js';
import { ApiException } from '../src/exception/ApiException.js';

describe('Mercado Pago checkout URL environment', () => {
  const preference = {
    init_point: 'https://www.mercadopago.com.br/checkout/production',
    sandbox_init_point: 'https://sandbox.mercadopago.com/checkout/test',
  };

  it('uses the sandbox URL for test credentials', () => {
    expect(getCheckoutUrl(preference, 'TEST-private-token')).toBe(
      preference.sandbox_init_point
    );
  });

  it('does not fall back to the production URL when the sandbox URL is missing', () => {
    expect(getCheckoutUrl({ init_point: preference.init_point }, 'TEST-private-token')).toBe(
      undefined
    );
  });

  it('uses the production URL for production credentials', () => {
    expect(getCheckoutUrl(preference, 'APP_USR-private-token')).toBe(preference.init_point);
  });

  it('allows test credentials in development', () => {
    expect(validateAccessToken('TEST-private-token', 'development')).toBe('TEST-private-token');
  });

  it('allows production credentials in development when real payments are intended', () => {
    expect(validateAccessToken('APP_USR-private-token', 'development')).toBe(
      'APP_USR-private-token'
    );
  });

  it('allows production credentials only in production', () => {
    expect(validateAccessToken('APP_USR-private-token', 'production')).toBe(
      'APP_USR-private-token'
    );
  });

  it('rejects test credentials in production', () => {
    expect(() => validateAccessToken('TEST-private-token', 'production')).toThrow(ApiException);
  });
});

describe('Mercado Pago webhook signature', () => {
  it('accepts a valid HMAC signature for the notification identifiers', () => {
    const secret = 'local-test-secret';
    const paymentId = '987654321';
    const requestId = 'request-123';
    const timestamp = '1700000000';
    const manifest = `id:${paymentId.toLowerCase()};request-id:${requestId};ts:${timestamp};`;
    const digest = createHmac('sha256', secret).update(manifest).digest('hex');

    expect(
      verifyWebhookSignature(paymentId, requestId, `ts=${timestamp},v1=${digest}`, secret)
    ).toBe(true);
  });

  it('rejects signatures that do not match the request', () => {
    expect(
      verifyWebhookSignature('987654321', 'request-123', 'ts=1700000000,v1=00', 'secret')
    ).toBe(false);
  });

  it('rejects incomplete signatures', () => {
    expect(verifyWebhookSignature('987654321', 'request-123', 'ts=1700000000', 'secret')).toBe(
      false
    );
  });
});
