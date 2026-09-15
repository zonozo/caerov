import { describe, expect, it } from 'vitest';

import { createMockProviderRegistry } from './mock.js';

describe('mock provider registry', () => {
  it('returns a deterministic placeholder result', async () => {
    const result = await createMockProviderRegistry().image.generate({
      taskId: 'task-1',
      nodeId: 'node-1',
      input: { prompt: 'placeholder' },
    });

    expect(result.output).toEqual({
      provider: 'mock',
      kind: 'image',
      taskId: 'task-1',
      nodeId: 'node-1',
    });
  });
});
