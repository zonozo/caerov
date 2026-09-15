import { z } from 'zod';

export const generationTaskEventSchema = z.discriminatedUnion('type', [
  z.object({
    type: z.literal('generation.queued'),
    taskId: z.string().min(1),
    projectId: z.string().min(1),
  }),
  z.object({
    type: z.literal('generation.progress'),
    taskId: z.string().min(1),
    progress: z.number().min(0).max(1),
    message: z.string().optional(),
  }),
  z.object({
    type: z.literal('generation.completed'),
    taskId: z.string().min(1),
    outputAssetIds: z.array(z.string().min(1)),
  }),
  z.object({
    type: z.literal('generation.failed'),
    taskId: z.string().min(1),
    code: z.string().min(1),
    message: z.string().min(1),
  }),
]);

export type GenerationTaskEvent = z.infer<typeof generationTaskEventSchema>;
