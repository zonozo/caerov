import { describe, expect, it } from 'vitest';

import { fileMetadataSchema, thumbnailObjectKey } from './metadata.js';

describe('storage metadata', () => {
  it('builds stable thumbnail keys and validates metadata', () => {
    expect(thumbnailObjectKey('project-1', 'asset-1', 'medium')).toBe(
      'projects/project-1/assets/asset-1/thumbnails/medium.jpg',
    );
    expect(
      fileMetadataSchema.parse({
        key: 'asset.png',
        mimeType: 'image/png',
        sizeBytes: '42',
      }).sizeBytes,
    ).toBe(42n);
  });
});
