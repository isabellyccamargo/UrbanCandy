import express, { type Application } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import cors from 'cors';
import swaggerUi from 'swagger-ui-express';
import publico from './src/routes/Public.js';
import { dataBaseConectionn } from './src/config/Config.js';
import { initializeDatabase } from './src/config/bootstrap.js';
import { errorHandler } from './src/middlewares/ErrorHandler.js';
import { initializeRedisCache } from './src/config/RedisCache.js';
import { initializeOrderEventSubscriber } from './src/events/OrderEvents.js';
import { startOrderStatusOutbox } from './src/events/OrderStatusOutbox.js';
import { httpMetricsMiddleware, metricsHandler } from './src/observability/metrics.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const server: Application = express();
const metricsServer: Application = express();
const PORT = process.env.PORT || 3000;
const METRICS_PORT = Number(process.env.METRICS_PORT || 9464);
const METRICS_HOST = process.env.METRICS_HOST || '127.0.0.1';
const openApiSpecPath = path.join(process.cwd(), 'docs', 'api', 'openapi.yaml');

if (!Number.isInteger(METRICS_PORT) || METRICS_PORT < 1 || METRICS_PORT > 65535) {
  throw new Error('METRICS_PORT deve ser um número entre 1 e 65535.');
}

metricsServer.get('/metrics', metricsHandler);

// 2. Configure o CORS ANTES das rotas e do express.json
server.use(
  cors({
    origin: [
      'https://urbancandy.local',
      'http://localhost:3000',
      'http://localhost:5173',
      'http://10.10.54.23:3000',
      'http://10.10.54.23:19006',
      'http://10.10.54.23:19000',
    ],
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
    credentials: true,
  })
);

server.use(httpMetricsMiddleware);

// 3. O express.json deve vir logo após o CORS
server.use(express.json());

server.get('/api-docs/openapi.yaml', (_req, res, next) => {
  res.sendFile(openApiSpecPath, (error) => {
    if (error) next(error);
  });
});
server.use(
  '/api-docs',
  swaggerUi.serve,
  swaggerUi.setup(null, {
    swaggerOptions: { url: '/api-docs/openapi.yaml' },
    customSiteTitle: 'UrbanCandy API',
  })
);

// Health check endpoint
server.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Altere para usar process.cwd() para apontar para a raiz (/app)
server.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));
server.use('/api', publico);

// Middleware de tratamento de erros - DEVE ser o último middleware
server.use(errorHandler);

async function startServer() {
  initializeDatabase();
  await initializeRedisCache();
  await dataBaseConectionn();
  await initializeOrderEventSubscriber();
  await startOrderStatusOutbox();

  server.listen(PORT, () => {
    console.log(`Servidor TypeScript rodando na porta ${PORT}`);
  });
  metricsServer.listen(METRICS_PORT, METRICS_HOST, () => {
    console.log(`Endpoint de métricas disponível em ${METRICS_HOST}:${METRICS_PORT}`);
  });
}

startServer().catch((error: unknown) => {
  console.error('Não foi possível iniciar o servidor:', error);
  process.exitCode = 1;
});

export default server;
