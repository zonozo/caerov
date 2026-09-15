import { describe, expect, it } from 'vitest';

import { ProjectRepository } from './project.repository.js';

describe('ProjectRepository', () => {
  it('can be constructed with an injected Prisma client', () => {
    const repository = new ProjectRepository({} as never);
    expect(repository).toBeInstanceOf(ProjectRepository);
  });
});
