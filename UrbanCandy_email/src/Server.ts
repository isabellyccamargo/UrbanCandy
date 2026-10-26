import { createApp } from './app.js';
import { config } from './config.js';
import { sequelize } from './database.js';
import { startDeliveryWorker } from './deliveryWorker.js';
import { startOrderStatusConsumer } from './orderStatusConsumer.js';

async function startServer() {
  await sequelize.authenticate();
  await sequelize.sync();
  await startOrderStatusConsumer();
  startDeliveryWorker();

  const server = createApp().listen(config.port, () => {
    console.info(`[email-service] Listening on port ${config.port}.`);
  });

  const shutdown = async () => {
    server.close();
    await sequelize.close();
  };
  process.on('SIGINT', () => void shutdown());
  process.on('SIGTERM', () => void shutdown());
}

startServer().catch((error: unknown) => {
  console.error('[email-service] Startup failed:', error);
  process.exitCode = 1;
});
