import type {
  AudioProvider,
  ImageProvider,
  ProviderRegistry,
  ProviderRequest,
  ProviderResult,
  VideoProvider,
} from './types.js';

function mockResult(request: ProviderRequest, kind: string): ProviderResult {
  return {
    output: {
      provider: 'mock',
      kind,
      taskId: request.taskId,
      nodeId: request.nodeId,
    },
  };
}

export function createMockImageProvider(): ImageProvider {
  return {
    kind: 'image',
    generate: (request) => Promise.resolve(mockResult(request, 'image')),
  };
}

export function createMockVideoProvider(): VideoProvider {
  return {
    kind: 'video',
    generate: (request) => Promise.resolve(mockResult(request, 'video')),
  };
}

export function createMockAudioProvider(): AudioProvider {
  return {
    kind: 'audio',
    generate: (request) => Promise.resolve(mockResult(request, 'audio')),
  };
}

export function createMockProviderRegistry(): ProviderRegistry {
  return {
    image: createMockImageProvider(),
    video: createMockVideoProvider(),
    audio: createMockAudioProvider(),
  };
}
