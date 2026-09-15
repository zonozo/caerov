import { describe, expect, it } from 'vitest';

import { workerStartupMessage } from './constants.js';

describe('workerStartupMessage', () => {
  it('does not expose Redis credentials', () => {
    const message = workerStartupMessage('redis://user:secret@localhost:6379');
    expect(message).toBe('Worker connected to Redis at localhost:6379');
    expect(message).not.toContain('secret');
  });
});
