import { createClient } from 'redis';
import { createCacheAside } from '../service/CacheAside.js';

const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';
const cacheTtl = Number(process.env.PRODUCT_CACHE_TTL_SECONDS ?? 60);

if (!Number.isInteger(cacheTtl) || cacheTtl < 1) {
  throw new Error('PRODUCT_CACHE_TTL_SECONDS deve ser um número inteiro maior que zero.');
}

export const PRODUCT_CACHE_TTL_SECONDS = cacheTtl;
export const PRODUCT_CACHE_PREFIX = 'urbancandy:products:';

const redisClient = createClient({
  url: redisUrl,
  socket: {
    reconnectStrategy: (retries) => (retries > 3 ? false : Math.min(retries * 250, 1000)),
  },
});

let connectionAttempt: Promise<unknown> | undefined;

redisClient.on('error', (error: Error) => {
  console.error('[redis] Erro de conexão:', error);
});

redisClient.on('ready', () => {
  console.info('[redis] Conexão estabelecida.');
});

async function ensureRedisReady(): Promise<boolean> {
  if (process.env.NODE_ENV === 'test') return false;
  if (redisClient.isReady) return true;

  try {
    if (!redisClient.isOpen) {
      connectionAttempt ??= redisClient.connect().finally(() => {
        connectionAttempt = undefined;
      });
    }
    if (connectionAttempt) await connectionAttempt;
    return redisClient.isReady;
  } catch (error) {
    console.error('[redis] Cache indisponível; as consultas continuarão pelo banco:', error);
    return false;
  }
}

const cacheAside = createCacheAside({
  async get(key) {
    if (!(await ensureRedisReady())) throw new Error('Redis não está conectado.');
    return redisClient.get(key);
  },
  async set(key, value, ttlSeconds) {
    if (!(await ensureRedisReady())) throw new Error('Redis não está conectado.');
    await redisClient.setEx(key, ttlSeconds, value);
  },
});

export async function initializeRedisCache(): Promise<void> {
  await ensureRedisReady();
}

export async function cacheProductQuery<T>(key: string, load: () => Promise<T>): Promise<T> {
  return cacheAside(`${PRODUCT_CACHE_PREFIX}${key}`, PRODUCT_CACHE_TTL_SECONDS, load);
}

export async function invalidateProductCache(): Promise<void> {
  if (!(await ensureRedisReady())) {
    console.warn('[cache] Invalidação de produtos não executada: Redis indisponível.');
    return;
  }

  try {
    let deleted = 0;
    for await (const keys of redisClient.scanIterator({
      MATCH: `${PRODUCT_CACHE_PREFIX}*`,
      COUNT: 100,
    })) {
      if (keys.length > 0) deleted += await redisClient.del(keys);
    }
    console.info(`[cache] Invalidação de produtos concluída (${deleted} chave(s) removida(s)).`);
  } catch (error) {
    console.error('[cache] Falha ao invalidar o cache de produtos:', error);
  }
}
