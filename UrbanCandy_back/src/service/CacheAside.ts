export interface CacheStore {
  get(key: string): Promise<string | null>;
  set(key: string, value: string, ttlSeconds: number): Promise<void>;
}

export function createCacheAside(cache: CacheStore) {
  return async function cacheAside<T>(
    key: string,
    ttlSeconds: number,
    load: () => Promise<T>
  ): Promise<T> {
    try {
      const cachedValue = await cache.get(key);
      if (cachedValue !== null) {
        console.info(`[cache] HIT ${key}`);
        return JSON.parse(cachedValue) as T;
      }
      console.info(`[cache] MISS ${key}`);
    } catch (error) {
      console.error(`[cache] Falha ao ler ${key}; consultando o banco de dados:`, error);
    }

    const value = await load();

    try {
      await cache.set(key, JSON.stringify(value), ttlSeconds);
      console.info(`[cache] Gravado ${key} (TTL ${ttlSeconds}s)`);
    } catch (error) {
      console.error(`[cache] Falha ao gravar ${key}; resultado retornado sem cache:`, error);
    }

    return value;
  };
}
