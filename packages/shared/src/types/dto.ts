import { z } from 'zod';

export const createProjectDtoSchema = z.object({
  name: z.string().trim().min(1).max(120),
});

export type CreateProjectDto = z.infer<typeof createProjectDtoSchema>;

export const createAssetDtoSchema = z.object({
  projectId: z.string().min(1),
  kind: z.enum(['image', 'video', 'audio', 'other']),
  mimeType: z.string().min(1),
  sizeBytes: z.coerce.bigint().nonnegative(),
});

export type CreateAssetDto = z.infer<typeof createAssetDtoSchema>;

export const createGenerationTaskDtoSchema = z.object({
  projectId: z.string().min(1),
  input: z.record(z.string(), z.unknown()),
});

export type CreateGenerationTaskDto = z.infer<typeof createGenerationTaskDtoSchema>;
