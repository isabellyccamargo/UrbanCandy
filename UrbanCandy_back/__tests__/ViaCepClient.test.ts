import { jest } from '@jest/globals';
import { ViaCepClient } from '../src/service/ViaCepClient.js';

describe('ViaCepClient', () => {
  it('aborts each ViaCEP request after its timeout', async () => {
    jest.useFakeTimers();
    try {
      const client = new ViaCepClient({
        fetchImpl: async (_url, init) =>
          new Promise<Response>((_resolve, reject) => {
            init?.signal?.addEventListener('abort', () => reject(new Error('request aborted')));
          }),
        sleep: async () => {},
        random: () => 0,
      });

      const validation = client.validate('01001000');
      const rejectedValidation = expect(validation).rejects.toMatchObject({
        code: 'FAILED_TO_VALIDATE_CEP',
        status: 503,
      });
      await jest.runAllTimersAsync();
      await rejectedValidation;
    } finally {
      jest.useRealTimers();
    }
  });

  it('retries one transient failure and accepts the next successful response', async () => {
    let calls = 0;
    const client = new ViaCepClient({
      fetchImpl: async () => {
        calls += 1;
        if (calls === 1) {
          return new Response(null, {
            status: 503,
            headers: { 'Retry-After': '0' },
          });
        }

        return new Response('{"cep":"01001000"}', { status: 200 });
      },
      sleep: async () => {},
      random: () => 0,
    });

    await expect(client.validate('01001000')).resolves.toBeUndefined();
    expect(calls).toBe(2);
  });

  it('opens the circuit after five failed validations and allows a probe after 30 seconds', async () => {
    let calls = 0;
    let now = 0;
    let shouldFail = true;
    const client = new ViaCepClient({
      fetchImpl: async () => {
        calls += 1;
        if (shouldFail) throw new Error('network unavailable');
        return new Response('{"cep":"01001000"}', { status: 200 });
      },
      sleep: async () => {},
      now: () => now,
      random: () => 0,
    });

    for (let attempt = 0; attempt < 5; attempt += 1) {
      await expect(client.validate('01001000')).rejects.toMatchObject({
        code: 'FAILED_TO_VALIDATE_CEP',
        status: 503,
      });
    }

    expect(calls).toBe(10);
    await expect(client.validate('01001000')).rejects.toMatchObject({
      code: 'FAILED_TO_VALIDATE_CEP',
      status: 503,
    });
    expect(calls).toBe(10);

    now += 30_001;
    shouldFail = false;
    await expect(client.validate('01001000')).resolves.toBeUndefined();
    await expect(client.validate('01001000')).resolves.toBeUndefined();
    expect(calls).toBe(12);
  });
});
