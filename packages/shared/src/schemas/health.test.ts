import { describe, expect, it } from 'vitest';

import { healthResponseSchema } from './health.js';

describe('healthResponseSchema', () => {
  it('accepts a valid service health response', () => {
    const result = healthResponseSchema.safeParse({
      status: 'ok',
      service: 'api',
      timestamp: new Date().toISOString(),
    });

    expect(result.success).toBe(true);
  });
});
