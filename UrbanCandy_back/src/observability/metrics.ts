import type { Request, RequestHandler } from 'express';
import { collectDefaultMetrics, Counter, Gauge, Histogram, Registry } from 'prom-client';

export const metricsRegistry = new Registry();
metricsRegistry.setDefaultLabels({ service: 'urbancandy-backend' });

collectDefaultMetrics({
  register: metricsRegistry,
  prefix: 'urbancandy_backend_',
});

const httpRequests = new Counter({
  name: 'urbancandy_http_requests_total',
  help: 'Total HTTP requests completed by the backend.',
  labelNames: ['method', 'route', 'status_code'],
  registers: [metricsRegistry],
});

const httpRequestDuration = new Histogram({
  name: 'urbancandy_http_request_duration_seconds',
  help: 'Duration of completed HTTP requests in seconds.',
  labelNames: ['method', 'route'],
  buckets: [0.05, 0.1, 0.25, 0.5, 1, 2, 5, 10],
  registers: [metricsRegistry],
});

const dependencyOperations = new Counter({
  name: 'urbancandy_dependency_operations_total',
  help: 'Total observed operations against external dependencies.',
  labelNames: ['dependency', 'result'],
  registers: [metricsRegistry],
});

const dependencyOperationDuration = new Histogram({
  name: 'urbancandy_dependency_operation_duration_seconds',
  help: 'Duration of observed external dependency operations in seconds.',
  labelNames: ['dependency', 'result'],
  buckets: [0.05, 0.1, 0.25, 0.5, 1, 2, 5, 10],
  registers: [metricsRegistry],
});

const viaCepCircuitOpen = new Gauge({
  name: 'urbancandy_viacep_circuit_open',
  help: 'Whether the ViaCEP circuit breaker is open (1) or closed (0).',
  registers: [metricsRegistry],
});
viaCepCircuitOpen.set(0);

function getRouteLabel(req: Request): string {
  if (req.route?.path) {
    const route = Array.isArray(req.route.path) ? req.route.path[0] : req.route.path;
    return `${req.baseUrl}${route}`;
  }

  return 'unmatched';
}

export const httpMetricsMiddleware: RequestHandler = (req, res, next) => {
  if (req.path === '/metrics' || req.path.startsWith('/api-docs')) {
    next();
    return;
  }

  const startedAt = process.hrtime.bigint();
  res.once('finish', () => {
    const durationSeconds = Number(process.hrtime.bigint() - startedAt) / 1_000_000_000;
    const labels = {
      method: req.method,
      route: getRouteLabel(req),
    };

    httpRequests.inc({
      ...labels,
      status_code: String(res.statusCode),
    });
    httpRequestDuration.observe(labels, durationSeconds);
    console.info(
      JSON.stringify({
        event: 'http_request',
        method: req.method,
        route: labels.route,
        statusCode: res.statusCode,
        durationMs: Math.round(durationSeconds * 1_000),
      })
    );
  });

  next();
};

export function observeDependency(
  dependency: 'viacep' | 'email_service' | 'mercado_pago',
  result: 'success' | 'failure',
  durationSeconds: number
): void {
  const labels = { dependency, result };
  dependencyOperations.inc(labels);
  dependencyOperationDuration.observe(labels, durationSeconds);
}

export function setViaCepCircuitOpen(isOpen: boolean): void {
  viaCepCircuitOpen.set(isOpen ? 1 : 0);
}

export const metricsHandler: RequestHandler = async (_req, res, next) => {
  try {
    res.setHeader('Cache-Control', 'no-store');
    res.setHeader('Content-Type', metricsRegistry.contentType);
    res.end(await metricsRegistry.metrics());
  } catch (error) {
    next(error);
  }
};
