import { describe, expect, it } from 'vitest';

import { workerEnvSchema } from './index.js';

describe('workerEnvSchema', () => {
  it('rejects a missing Redis URL', () => {
    const result = workerEnvSchema.safeParse({});
    expect(result.success).toBe(false);
  });
});
