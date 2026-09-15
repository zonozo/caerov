import { describe, expect, it } from 'vitest';

import { GET } from './route';

describe('GET /health', () => {
  it('reports the web service as healthy', async () => {
    const response = GET();
    await expect(response.json()).resolves.toMatchObject({ status: 'ok', service: 'web' });
  });
});
