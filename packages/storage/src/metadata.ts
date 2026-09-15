import { z } from 'zod';

export const fileMetadataSchema = z.object({
  key: z.string().min(1),
  mimeType: z.string().min(1),
  sizeBytes: z.coerce.bigint().nonnegative(),
  checksum: z.string().min(1).optional(),
  width: z.number().int().positive().optional(),
  height: z.number().int().positive().optional(),
  durationMs: z.number().int().nonnegative().optional(),
  thumbnailKey: z.string().min(1).optional(),
});

export type FileMetadata = z.infer<typeof fileMetadataSchema>;

export type ThumbnailVariant = 'small' | 'medium' | 'large';

export function objectKey(projectId: string, assetId: string, filename: string): string {
  return `projects/${projectId}/assets/${assetId}/${filename}`;
}

export function thumbnailObjectKey(
  projectId: string,
  assetId: string,
  variant: ThumbnailVariant = 'small',
): string {
  return `projects/${projectId}/assets/${assetId}/thumbnails/${variant}.jpg`;
}
