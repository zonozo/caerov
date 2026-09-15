import type { PrismaClient, Project } from '@prisma/client';

import { prisma as defaultPrisma } from '../client.js';

export interface CreateProjectInput {
  name: string;
  ownerId: string;
}

export class ProjectRepository {
  constructor(private readonly client: PrismaClient = defaultPrisma) {}

  findById(id: string): Promise<Project | null> {
    return this.client.project.findUnique({ where: { id } });
  }

  create(input: CreateProjectInput): Promise<Project> {
    return this.client.project.create({
      data: {
        name: input.name,
        owner: { connect: { id: input.ownerId } },
      },
    });
  }
}
