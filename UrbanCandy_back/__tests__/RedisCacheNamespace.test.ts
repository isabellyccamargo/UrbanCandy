import { describe, expect, it } from '@jest/globals';
import { productCachePrefixForEnvironment } from '../src/config/RedisCache.js';

describe('product cache environment namespace', () => {
  it.each([
    ['development', 'urbancandy:local:products:'],
    ['production', 'urbancandy:docker:products:'],
    ['test', 'urbancandy:test:products:'],
  ])('uses the %s namespace', (environment, expectedPrefix) => {
    expect(productCachePrefixForEnvironment(environment)).toBe(expectedPrefix);
  });
});
