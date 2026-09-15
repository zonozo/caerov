import type { WorkerEnv } from '@caerov/config';
import { createMockProviderRegistry, type ProviderRegistry } from '@caerov/providers';

type ProviderSettings = Pick<WorkerEnv, 'IMAGE_PROVIDER' | 'VIDEO_PROVIDER' | 'AUDIO_PROVIDER'>;

export function createWorkerProviderRegistry(settings: ProviderSettings): ProviderRegistry {
  const providers = [settings.IMAGE_PROVIDER, settings.VIDEO_PROVIDER, settings.AUDIO_PROVIDER];
  if (providers.some((provider) => provider !== 'mock')) {
    throw new Error('Only the mock provider is available in the scaffold');
  }

  return createMockProviderRegistry();
}
