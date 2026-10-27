import { ApiException } from '../exception/ApiException.js';
import { observeDependency, setViaCepCircuitOpen } from '../observability/metrics.js';

const REQUEST_TIMEOUT_MS = 2_000;
const OPERATION_TIMEOUT_MS = 4_500;
const RETRY_DELAY_MS = 100;
const CIRCUIT_OPEN_MS = 30_000;
const FAILURE_THRESHOLD = 5;
const FAILURE_WINDOW_SIZE = 10;

type ViaCepResult = { erro?: string };

class DependencyFailure extends Error {
  constructor(
    readonly retryable: boolean,
    readonly retryAfterMs?: number
  ) {
    super('ViaCEP request failed');
  }
}

type ViaCepClientDependencies = {
  fetchImpl?: typeof fetch;
  sleep?: (ms: number) => Promise<void>;
  now?: () => number;
  random?: () => number;
};

function dependencyFailure(retryable: boolean, retryAfterMs?: number): DependencyFailure {
  return new DependencyFailure(retryable, retryAfterMs);
}

function retryAfterMilliseconds(value: string | null, now: number): number | undefined {
  if (!value) return undefined;

  const seconds = Number(value);
  if (Number.isFinite(seconds)) return Math.max(0, seconds * 1_000);

  const date = Date.parse(value);
  return Number.isNaN(date) ? undefined : Math.max(0, date - now);
}

class ViaCepClient {
  private readonly fetchImpl: typeof fetch;
  private readonly sleep: (ms: number) => Promise<void>;
  private readonly now: () => number;
  private readonly random: () => number;
  private readonly recentOutcomes: boolean[] = [];
  private consecutiveFailures = 0;
  private openedAt: number | undefined;
  private halfOpenProbeInProgress = false;

  constructor(dependencies: ViaCepClientDependencies = {}) {
    this.fetchImpl = dependencies.fetchImpl ?? fetch;
    this.sleep = dependencies.sleep ?? ((ms) => new Promise((resolve) => setTimeout(resolve, ms)));
    this.now = dependencies.now ?? Date.now;
    this.random = dependencies.random ?? Math.random;
  }

  async validate(cep: string): Promise<void> {
    const isHalfOpenProbe = this.acquireCircuit();
    const deadline = this.now() + OPERATION_TIMEOUT_MS;
    const startedAt = this.now();

    try {
      const data = await this.fetchWithRetry(cep, deadline);
      this.recordOutcome(true, isHalfOpenProbe);
      observeDependency('viacep', 'success', (this.now() - startedAt) / 1_000);

      if (data.erro) throw new ApiException('CEP_NOT_FOUND', 400);
    } catch (error) {
      if (error instanceof ApiException && error.code === 'CEP_NOT_FOUND') throw error;

      this.recordOutcome(false, isHalfOpenProbe);
      observeDependency('viacep', 'failure', (this.now() - startedAt) / 1_000);
      throw new ApiException('FAILED_TO_VALIDATE_CEP', 503);
    }
  }

  private acquireCircuit(): boolean {
    if (this.openedAt === undefined) return false;

    if (this.now() - this.openedAt < CIRCUIT_OPEN_MS) {
      throw new ApiException('FAILED_TO_VALIDATE_CEP', 503);
    }

    if (this.halfOpenProbeInProgress) {
      throw new ApiException('FAILED_TO_VALIDATE_CEP', 503);
    }

    this.halfOpenProbeInProgress = true;
    return true;
  }

  private recordOutcome(success: boolean, isHalfOpenProbe: boolean): void {
    if (isHalfOpenProbe) {
      this.halfOpenProbeInProgress = false;

      if (success) {
        this.openedAt = undefined;
        this.consecutiveFailures = 0;
        this.recentOutcomes.length = 0;
        setViaCepCircuitOpen(false);
        return;
      }

      this.openedAt = this.now();
      setViaCepCircuitOpen(true);
      return;
    }

    this.recentOutcomes.push(success);
    if (this.recentOutcomes.length > FAILURE_WINDOW_SIZE) this.recentOutcomes.shift();

    this.consecutiveFailures = success ? 0 : this.consecutiveFailures + 1;

    const failures = this.recentOutcomes.filter((outcome) => !outcome).length;
    if (
      this.consecutiveFailures >= FAILURE_THRESHOLD ||
      (this.recentOutcomes.length === FAILURE_WINDOW_SIZE && failures / FAILURE_WINDOW_SIZE >= 0.5)
    ) {
      this.openedAt = this.now();
      setViaCepCircuitOpen(true);
    }
  }

  private async fetchWithRetry(cep: string, deadline: number): Promise<ViaCepResult> {
    for (let attempt = 0; attempt < 2; attempt += 1) {
      try {
        return await this.fetchOnce(cep, deadline);
      } catch (error) {
        const failure = error instanceof DependencyFailure ? error : dependencyFailure(true);

        if (!failure.retryable || attempt === 1) throw failure;

        const jitter = Math.floor(this.random() * RETRY_DELAY_MS);
        const delay = failure.retryAfterMs ?? jitter;
        if (this.now() + delay >= deadline) throw failure;

        await this.sleep(delay);
      }
    }

    throw dependencyFailure(false);
  }

  private async fetchOnce(cep: string, deadline: number): Promise<ViaCepResult> {
    const remainingMs = deadline - this.now();
    if (remainingMs <= 0) throw dependencyFailure(true);

    const controller = new AbortController();
    const timeout = Math.min(REQUEST_TIMEOUT_MS, remainingMs);
    const timer = setTimeout(() => controller.abort(), timeout);

    try {
      const response = await this.fetchImpl(`https://viacep.com.br/ws/${cep}/json/`, {
        signal: controller.signal,
      });

      if (!response.ok) {
        throw dependencyFailure(
          response.status === 429 || response.status >= 500,
          retryAfterMilliseconds(response.headers.get('Retry-After'), this.now())
        );
      }

      const data: unknown = await response.json();
      if (typeof data !== 'object' || data === null || Array.isArray(data)) {
        throw dependencyFailure(true);
      }
      return 'erro' in data && typeof data.erro === 'string' ? { erro: data.erro } : {};
    } catch (error) {
      if (error instanceof DependencyFailure) throw error;
      throw dependencyFailure(true);
    } finally {
      clearTimeout(timer);
    }
  }
}

export { ViaCepClient };
export default new ViaCepClient();
