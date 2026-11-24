import { afterEach, beforeEach, describe, expect, jest, test } from '@jest/globals';
import { requireVerifiedEmail } from '../src/service/EmailVerificationGuard.js';

describe('requireVerifiedEmail', () => {
  let originalEmailServiceUrl: string | undefined;
  let originalEmailApiKey: string | undefined;

  beforeEach(() => {
    originalEmailServiceUrl = process.env.EMAIL_SERVICE_URL;
    originalEmailApiKey = process.env.EMAIL_API_KEY;
    process.env.EMAIL_SERVICE_URL = 'http://email-service.test';
    process.env.EMAIL_API_KEY = 'test-service-key';
  });

  afterEach(() => {
    jest.restoreAllMocks();
    if (originalEmailServiceUrl === undefined) delete process.env.EMAIL_SERVICE_URL;
    else process.env.EMAIL_SERVICE_URL = originalEmailServiceUrl;
    if (originalEmailApiKey === undefined) delete process.env.EMAIL_API_KEY;
    else process.env.EMAIL_API_KEY = originalEmailApiKey;
  });

  test('allows checkout when the verified address belongs to the account', async () => {
    jest.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(JSON.stringify({ verified: true, userId: 7 }), { status: 200 })
    );

    await expect(requireVerifiedEmail('customer@example.com', 7)).resolves.toBeUndefined();
  });

  test('rejects unverified addresses and addresses associated with another account', async () => {
    const fetchSpy = jest.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(JSON.stringify({ verified: true, userId: 8 }), { status: 200 })
    );

    await expect(requireVerifiedEmail('customer@example.com', 7)).rejects.toMatchObject({
      code: 'EMAIL_NOT_VERIFIED',
      status: 403,
    });

    fetchSpy.mockResolvedValue(
      new Response(JSON.stringify({ verified: true, userId: null }), { status: 200 })
    );
    await expect(requireVerifiedEmail('customer@example.com', 7)).rejects.toMatchObject({
      code: 'EMAIL_NOT_VERIFIED',
      status: 403,
    });

    fetchSpy.mockResolvedValue(
      new Response(JSON.stringify({ verified: false, userId: null }), { status: 200 })
    );
    await expect(requireVerifiedEmail('customer@example.com', 7)).rejects.toMatchObject({
      code: 'EMAIL_NOT_VERIFIED',
      status: 403,
    });
  });

  test('fails closed when the email service is unavailable', async () => {
    jest.spyOn(console, 'error').mockImplementation(() => {});
    jest.spyOn(globalThis, 'fetch').mockRejectedValue(new Error('connection refused'));

    await expect(requireVerifiedEmail('customer@example.com', 7)).rejects.toMatchObject({
      code: 'EMAIL_VERIFICATION_UNAVAILABLE',
      status: 503,
    });
  });
});
