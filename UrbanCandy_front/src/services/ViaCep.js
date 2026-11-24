const REQUEST_TIMEOUT_MS = 2_000;
const OPERATION_TIMEOUT_MS = 4_500;
const RETRY_DELAY_MS = 100;
const CIRCUIT_OPEN_MS = 30_000;
const FAILURE_THRESHOLD = 5;
const FAILURE_WINDOW_SIZE = 10;

const recentOutcomes = [];
let consecutiveFailures = 0;
let circuitOpenedAt = null;
let halfOpenProbeInProgress = false;

export class ViaCepError extends Error {
  constructor(code) {
    super(code);
    this.code = code;
  }
}

const temporaryFailure = (retryable, retryAfterMs) => ({
  retryable,
  retryAfterMs,
});

const retryAfterMilliseconds = (value, now) => {
  if (!value) return undefined;

  const seconds = Number(value);
  if (Number.isFinite(seconds)) return Math.max(0, seconds * 1000);

  const date = Date.parse(value);
  return Number.isNaN(date) ? undefined : Math.max(0, date - now);
};

const acquireCircuit = () => {
  if (circuitOpenedAt === null) return false;

  if (Date.now() - circuitOpenedAt < CIRCUIT_OPEN_MS || halfOpenProbeInProgress) {
    throw new ViaCepError('SERVICE_UNAVAILABLE');
  }

  halfOpenProbeInProgress = true;
  return true;
};

const recordOutcome = (success, isHalfOpenProbe) => {
  if (isHalfOpenProbe) {
    halfOpenProbeInProgress = false;
    if (success) {
      circuitOpenedAt = null;
      consecutiveFailures = 0;
      recentOutcomes.length = 0;
    } else {
      circuitOpenedAt = Date.now();
    }
    return;
  }

  recentOutcomes.push(success);
  if (recentOutcomes.length > FAILURE_WINDOW_SIZE) recentOutcomes.shift();
  consecutiveFailures = success ? 0 : consecutiveFailures + 1;

  const failures = recentOutcomes.filter((outcome) => !outcome).length;
  if (
    consecutiveFailures >= FAILURE_THRESHOLD ||
    (recentOutcomes.length === FAILURE_WINDOW_SIZE && failures / FAILURE_WINDOW_SIZE >= 0.5)
  ) {
    circuitOpenedAt = Date.now();
  }
};

const sleep = (milliseconds) =>
  new Promise((resolve) => {
    setTimeout(resolve, milliseconds);
  });

const fetchOnce = async (cep, deadline) => {
  const remainingMs = deadline - Date.now();
  if (remainingMs <= 0) throw temporaryFailure(true);

  const controller = new AbortController();
  const timeoutMs = Math.min(REQUEST_TIMEOUT_MS, remainingMs);
  let timeoutId;

  try {
    const request = fetch(`https://viacep.com.br/ws/${cep}/json/`, {
      signal: controller.signal,
    }).then(async (response) => {
      if (!response.ok) {
        throw temporaryFailure(
          response.status === 429 || response.status >= 500,
          retryAfterMilliseconds(response.headers.get('Retry-After'), Date.now())
        );
      }
      return response.json();
    });

    const timeout = new Promise((_, reject) => {
      timeoutId = setTimeout(() => {
        controller.abort();
        reject(temporaryFailure(true));
      }, timeoutMs);
    });

    const data = await Promise.race([request, timeout]);
    if (!data || typeof data !== 'object' || Array.isArray(data)) {
      throw temporaryFailure(true);
    }
    return data;
  } catch (error) {
    if (error?.retryable !== undefined) throw error;
    throw temporaryFailure(true);
  } finally {
    clearTimeout(timeoutId);
  }
};

const fetchWithRetry = async (cep, deadline) => {
  for (let attempt = 0; attempt < 2; attempt += 1) {
    try {
      return await fetchOnce(cep, deadline);
    } catch (error) {
      if (!error?.retryable || attempt === 1) throw error;

      const delay = error.retryAfterMs ?? Math.floor(Math.random() * RETRY_DELAY_MS);
      if (Date.now() + delay >= deadline) throw error;
      await sleep(delay);
    }
  }

  throw temporaryFailure(false);
};

export const lookupCep = async (cep) => {
  const cleanCep = cep.replace(/\D/g, '');
  if (cleanCep.length !== 8) throw new ViaCepError('INVALID_CEP');

  const isHalfOpenProbe = acquireCircuit();
  const deadline = Date.now() + OPERATION_TIMEOUT_MS;

  try {
    const data = await fetchWithRetry(cleanCep, deadline);
    if (data.erro) {
      recordOutcome(true, isHalfOpenProbe);
      throw new ViaCepError('CEP_NOT_FOUND');
    }

    recordOutcome(true, isHalfOpenProbe);
    return {
      road: data.logradouro ?? '',
      neighborhood: data.bairro ?? '',
      city: data.localidade ?? '',
    };
  } catch (error) {
    if (error instanceof ViaCepError && error.code === 'CEP_NOT_FOUND') throw error;

    recordOutcome(false, isHalfOpenProbe);
    throw new ViaCepError('SERVICE_UNAVAILABLE');
  }
};
