export enum GenerationTaskStatus {
  Queued = 'queued',
  Running = 'running',
  Succeeded = 'succeeded',
  Failed = 'failed',
  Cancelled = 'cancelled',
}

export enum AssetKind {
  Image = 'image',
  Video = 'video',
  Audio = 'audio',
  Other = 'other',
}

export interface GenerationTaskDto {
  id: string;
  projectId: string;
  status: GenerationTaskStatus;
  createdAt: string;
}
