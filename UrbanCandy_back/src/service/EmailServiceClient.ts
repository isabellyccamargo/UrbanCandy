import { performance } from 'node:perf_hooks';
import { observeDependency } from '../observability/metrics.js';

type EmailServiceResponse = {
  alreadyVerified?: boolean;
  queued?: boolean;
  verified?: boolean;
};

function serviceSettings(): { baseUrl: string; apiKey: string } {
  const baseUrl = process.env.EMAIL_SERVICE_URL;
  const apiKey = process.env.EMAIL_API_KEY;
  if (!baseUrl || !apiKey) {
    throw new Error('EMAIL_SERVICE_URL and EMAIL_API_KEY must be configured.');
  }
  return { baseUrl: baseUrl.replace(/\/+$/, ''), apiKey };
}

async function postToEmailService(
  endpoint: string,
  body: Record<string, string | number>
): Promise<EmailServiceResponse> {
  const { baseUrl, apiKey } = serviceSettings();
  const startedAt = performance.now();

  try {
    const response = await fetch(`${baseUrl}${endpoint}`, {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'x-service-key': apiKey },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(5000),
    });
    const responseBody: unknown = await response.json().catch(() => ({}));
    if (!response.ok) {
      const message =
        responseBody &&
        typeof responseBody === 'object' &&
        'message' in responseBody &&
        typeof responseBody.message === 'string'
          ? responseBody.message
          : 'Email service request failed.';
      const error = new Error(message);
      Object.assign(error, { status: response.status });
      throw error;
    }

    observeDependency('email_service', 'success', (performance.now() - startedAt) / 1_000);
    return responseBody as EmailServiceResponse;
  } catch (error) {
    observeDependency('email_service', 'failure', (performance.now() - startedAt) / 1_000);
    throw error;
  }
}

export function requestEmailVerification(email: string, userId: number) {
  return postToEmailService('/internal/verifications', { email, userId });
}

export function confirmEmailVerification(email: string, code: string) {
  return postToEmailService('/internal/verifications/confirm', { email, code });
}

export function getEmailVerificationStatus(email: string) {
  return postToEmailService('/internal/verifications/status', { email });
}
