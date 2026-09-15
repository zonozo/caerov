import { describe, expect, it } from 'vitest';

import { HealthController } from './health.controller.js';

describe('HealthController', () => {
  it('reports the API service as healthy', () => {
    expect(new HealthController().getHealth()).toMatchObject({ status: 'ok', service: 'api' });
  });
});
