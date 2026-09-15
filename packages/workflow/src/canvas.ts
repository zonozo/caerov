import { z } from 'zod';

export const canvasNodeSchema = z.object({
  id: z.string().min(1),
  type: z.string().min(1),
  data: z.record(z.string(), z.unknown()).default({}),
});

export const canvasEdgeSchema = z.object({
  id: z.string().min(1).optional(),
  from: z.string().min(1),
  to: z.string().min(1),
});

export const canvasDocumentSchema = z.object({
  schemaVersion: z.number().int().positive().default(1),
  nodes: z.array(canvasNodeSchema),
  edges: z.array(canvasEdgeSchema),
});

export type CanvasDocument = z.infer<typeof canvasDocumentSchema>;
export type CanvasNode = z.infer<typeof canvasNodeSchema>;
export type CanvasEdge = z.infer<typeof canvasEdgeSchema>;

export function validateCanvasDocument(input: unknown): CanvasDocument {
  return canvasDocumentSchema.parse(input);
}
