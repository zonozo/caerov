export type ProviderKind = 'image' | 'video' | 'audio';

export interface ProviderRequest {
  taskId: string;
  nodeId: string;
  input: Record<string, unknown>;
}

export interface ProviderArtifact {
  storageKey: string;
  mimeType: string;
  sizeBytes?: number;
}

export interface ProviderResult {
  output: Record<string, unknown>;
  artifacts?: ProviderArtifact[];
}

export interface GenerationProvider {
  readonly kind: ProviderKind;
  generate(request: ProviderRequest): Promise<ProviderResult>;
}

export type ImageProvider = GenerationProvider & { readonly kind: 'image' };
export type VideoProvider = GenerationProvider & { readonly kind: 'video' };
export type AudioProvider = GenerationProvider & { readonly kind: 'audio' };

export interface ProviderRegistry {
  image: ImageProvider;
  video: VideoProvider;
  audio: AudioProvider;
}
