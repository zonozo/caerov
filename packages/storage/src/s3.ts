import {
  GetObjectCommand,
  HeadObjectCommand,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

import { fileMetadataSchema, type FileMetadata } from './metadata.js';

export interface S3StorageOptions {
  endpoint: string;
  region: string;
  bucket: string;
  accessKeyId: string;
  secretAccessKey: string;
  forcePathStyle?: boolean;
}

export interface PresignedUploadInput {
  key: string;
  contentType: string;
  expiresInSeconds?: number;
}

export interface PresignedDownloadInput {
  key: string;
  expiresInSeconds?: number;
}

export class S3Storage {
  private readonly client: S3Client;

  constructor(private readonly options: S3StorageOptions) {
    this.client = new S3Client({
      endpoint: options.endpoint,
      region: options.region,
      forcePathStyle: options.forcePathStyle ?? true,
      credentials: {
        accessKeyId: options.accessKeyId,
        secretAccessKey: options.secretAccessKey,
      },
    });
  }

  createUploadUrl(input: PresignedUploadInput): Promise<string> {
    const command = new PutObjectCommand({
      Bucket: this.options.bucket,
      Key: input.key,
      ContentType: input.contentType,
    });

    return getSignedUrl(this.client, command, {
      expiresIn: input.expiresInSeconds ?? 900,
    });
  }

  createDownloadUrl(input: PresignedDownloadInput): Promise<string> {
    const command = new GetObjectCommand({
      Bucket: this.options.bucket,
      Key: input.key,
    });

    return getSignedUrl(this.client, command, {
      expiresIn: input.expiresInSeconds ?? 900,
    });
  }

  async getMetadata(key: string): Promise<FileMetadata> {
    const result = await this.client.send(
      new HeadObjectCommand({
        Bucket: this.options.bucket,
        Key: key,
      }),
    );

    return fileMetadataSchema.parse({
      key,
      mimeType: result.ContentType ?? 'application/octet-stream',
      sizeBytes: BigInt(result.ContentLength ?? 0),
      checksum: result.ETag?.replaceAll('"', ''),
    });
  }
}
