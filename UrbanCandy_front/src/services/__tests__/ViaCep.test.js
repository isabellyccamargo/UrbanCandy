import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { lookupCep, ViaCepError } from '../ViaCep';

describe('lookupCep', () => {
  beforeEach(() => {
    globalThis.fetch = jest.fn();
  });

  it('returns address fields for an existing CEP', async () => {
    globalThis.fetch.mockResolvedValue({
      ok: true,
      json: async () => ({
        logradouro: 'Praça da Sé',
        bairro: 'Sé',
        localidade: 'São Paulo',
      }),
    });

    await expect(lookupCep('01001-000')).resolves.toEqual({
      road: 'Praça da Sé',
      neighborhood: 'Sé',
      city: 'São Paulo',
    });
    expect(globalThis.fetch).toHaveBeenCalledWith(
      'https://viacep.com.br/ws/01001000/json/',
      expect.objectContaining({ signal: expect.any(AbortSignal) })
    );
  });

  it('retries one transient failure before returning the address', async () => {
    globalThis.fetch
      .mockResolvedValueOnce({
        ok: false,
        status: 503,
        headers: { get: () => null },
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ localidade: 'São Paulo' }),
      });

    await expect(lookupCep('01001000')).resolves.toMatchObject({ city: 'São Paulo' });
    expect(globalThis.fetch).toHaveBeenCalledTimes(2);
  });

  it('times out each request and stops after the operation deadline', async () => {
    jest.useFakeTimers();
    try {
      globalThis.fetch.mockImplementation(
        (_url, { signal }) =>
          new Promise((_resolve, reject) => {
            signal.addEventListener('abort', () => reject(new Error('request aborted')));
          })
      );

      const result = lookupCep('01001000');
      const rejectedResult = expect(result).rejects.toMatchObject({
        code: 'SERVICE_UNAVAILABLE',
      });
      await jest.runAllTimersAsync();
      await rejectedResult;
      expect(globalThis.fetch).toHaveBeenCalledTimes(2);
    } finally {
      jest.useRealTimers();
    }
  });

  it('reports a missing CEP without treating it as a service failure', async () => {
    globalThis.fetch.mockResolvedValue({
      ok: true,
      json: async () => ({ erro: 'true' }),
    });

    await expect(lookupCep('00000000')).rejects.toMatchObject({
      code: 'CEP_NOT_FOUND',
    });
  });

  it('opens the circuit after repeated dependency failures', async () => {
    globalThis.fetch.mockRejectedValue(new Error('network unavailable'));

    for (let attempt = 0; attempt < 5; attempt += 1) {
      await expect(lookupCep('01001000')).rejects.toBeInstanceOf(ViaCepError);
    }

    const callsAfterFailures = globalThis.fetch.mock.calls.length;
    await expect(lookupCep('01001000')).rejects.toMatchObject({
      code: 'SERVICE_UNAVAILABLE',
    });
    expect(globalThis.fetch).toHaveBeenCalledTimes(callsAfterFailures);
  });
});
