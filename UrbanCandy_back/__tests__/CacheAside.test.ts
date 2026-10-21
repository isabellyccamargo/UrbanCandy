import { describe, expect, it, jest } from '@jest/globals';
import { createCacheAside, type CacheStore } from '../src/service/CacheAside.js';

describe('Cache-Aside', () => {
  it('loads and stores a cache miss with its TTL', async () => {
    const cache: CacheStore = {
      get: jest.fn<CacheStore['get']>().mockResolvedValue(null),
      set: jest.fn<CacheStore['set']>().mockResolvedValue(undefined),
    };
    const load = jest.fn<() => Promise<{ products: string[] }>>().mockResolvedValue({
      products: ['brigadeiro'],
    });
    const cacheAside = createCacheAside(cache);

    const result = await cacheAside('products', 60, load);

    expect(result).toEqual({ products: ['brigadeiro'] });
    expect(load).toHaveBeenCalledTimes(1);
    expect(cache.set).toHaveBeenCalledWith('products', '{"products":["brigadeiro"]}', 60);
  });

  it('returns cached data without querying the database', async () => {
    const cache: CacheStore = {
      get: jest.fn<CacheStore['get']>().mockResolvedValue('{"products":["brigadeiro"]}'),
      set: jest.fn<CacheStore['set']>().mockResolvedValue(undefined),
    };
    const load = jest.fn<() => Promise<{ products: string[] }>>();
    const cacheAside = createCacheAside(cache);

    const result = await cacheAside('products', 60, load);

    expect(result).toEqual({ products: ['brigadeiro'] });
    expect(load).not.toHaveBeenCalled();
  });

  it('falls back to the database if Redis cannot be read or written', async () => {
    const cache: CacheStore = {
      get: jest.fn<CacheStore['get']>().mockRejectedValue(new Error('Redis indisponível')),
      set: jest.fn<CacheStore['set']>().mockRejectedValue(new Error('Redis indisponível')),
    };
    const load = jest.fn<() => Promise<string[]>>().mockResolvedValue(['brigadeiro']);
    const cacheAside = createCacheAside(cache);
    const consoleError = jest.spyOn(console, 'error').mockImplementation(() => {});

    await expect(cacheAside('products', 60, load)).resolves.toEqual(['brigadeiro']);
    expect(load).toHaveBeenCalledTimes(1);
    expect(consoleError).toHaveBeenCalledTimes(2);
    consoleError.mockRestore();
  });
});
