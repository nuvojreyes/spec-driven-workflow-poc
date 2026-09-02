import { HttpErrorResponse } from '@angular/common/http';

import { AppError } from './async-state';

/**
 * The single place failures become `AppError`.
 *
 * Nothing else in the application decides what a failure looks like: a raw
 * status code or a stack trace must never reach a template. Every entry point
 * routes through here, so the error copy stays consistent and the doctrine's
 * "normalized, actionable, block-scoped" requirement holds in one file.
 */

/** Error envelope the API returns: `{"error": {"code", "message"}}`. */
interface ApiErrorBody {
  error?: { code?: string; message?: string };
}

const OFFLINE: AppError = {
  code: 'offline',
  message: 'You appear to be offline. Check your connection and try again.',
};

const UNREACHABLE: AppError = {
  code: 'unreachable',
  message: 'Could not reach the weather service. It may be starting up — try again.',
};

const UNEXPECTED: AppError = {
  code: 'unexpected',
  message: 'Something went wrong on our side. Try again.',
};

export function normalizeHttpError(cause: unknown): AppError {
  if (!(cause instanceof HttpErrorResponse)) {
    // A bug in our own mapping code, not a transport failure. Surface it as
    // unexpected rather than pretending it was the network's fault.
    return { ...UNEXPECTED, code: 'client_error' };
  }

  // status 0 means the request never got an answer: offline, DNS, CORS, or a
  // backend that is not running. It is not a server error and must not read
  // like one.
  if (cause.status === 0) {
    return navigator.onLine ? UNREACHABLE : OFFLINE;
  }

  const fromApi = apiError(cause);
  if (fromApi) {
    return { ...fromApi, status: cause.status };
  }

  if (cause.status === 404) {
    return { code: 'not_found', message: 'That city is not available.', status: 404 };
  }

  if (cause.status >= 500) {
    return {
      code: 'upstream_unavailable',
      message: 'The weather service is temporarily unavailable. Try again in a moment.',
      status: cause.status,
    };
  }

  return { ...UNEXPECTED, status: cause.status };
}

/** Read the API's own error envelope, when the response carries one. */
function apiError(cause: HttpErrorResponse): AppError | null {
  const body = cause.error as ApiErrorBody | string | null;
  if (!body || typeof body === 'string') {
    return null;
  }

  const code = body.error?.code;
  const message = body.error?.message;
  return code && message ? { code, message } : null;
}
