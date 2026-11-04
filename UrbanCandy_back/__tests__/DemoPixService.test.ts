import { describe, expect, it } from '@jest/globals';
import { ApiException } from '../src/exception/ApiException.js';
import { assertDemoPixEnabled } from '../src/service/DemoPixService.js';

describe('Pix demonstration environment guard', () => {
  it('allows the demo only in local development', () => {
    expect(() => assertDemoPixEnabled('development')).not.toThrow();
    expect(() => assertDemoPixEnabled('test')).toThrow(ApiException);
    expect(() => assertDemoPixEnabled('production')).toThrow(ApiException);
  });
});
