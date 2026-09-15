import { z } from 'zod';

export const nodeDefinitionSchema = z.object({
  type: z.string().min(1),
  version: z.number().int().positive(),
  description: z.string().optional(),
  inputSchema: z.record(z.string(), z.unknown()),
  outputSchema: z.record(z.string(), z.unknown()),
});

export type NodeDefinition = z.infer<typeof nodeDefinitionSchema>;
