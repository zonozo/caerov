export const ErrorCode = {
  InvalidInput: 'INVALID_INPUT',
  Unauthorized: 'UNAUTHORIZED',
  Forbidden: 'FORBIDDEN',
  NotFound: 'NOT_FOUND',
  Conflict: 'CONFLICT',
  InternalError: 'INTERNAL_ERROR',
  ProviderUnavailable: 'PROVIDER_UNAVAILABLE',
} as const;

export type ErrorCode = (typeof ErrorCode)[keyof typeof ErrorCode];
