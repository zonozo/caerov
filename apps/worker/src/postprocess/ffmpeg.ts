export interface FfmpegPostProcessInput {
  inputKey: string;
  outputKey: string;
}

export interface FfmpegPostProcessor {
  process(input: FfmpegPostProcessInput): Promise<void>;
}

export function createFfmpegPostProcessor(): FfmpegPostProcessor {
  return {
    process: () =>
      Promise.reject(
        new Error('FFmpeg post-processing is reserved for a later implementation phase'),
      ),
  };
}
