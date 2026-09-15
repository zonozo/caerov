export interface ApiSuccess<T> {
  data: T;
  requestId?: string;
}

export interface ApiFailure {
  error: {
    code: ErrorCode;
    message: string;
  };
  requestId?: string;
}

import type { ErrorCode } from './errors.js';
