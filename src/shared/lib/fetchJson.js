import { API_BASE_URL } from './apiConfig.js';
import { markApiOffline, markApiOnline } from './apiConnectionStore.js';

export class ApiError extends Error {
  constructor(payload, status) {
    super(buildErrorMessage(payload));
    this.name = 'ApiError';
    this.status = status;
    this.code = payload?.code ?? null;
    this.errors = Array.isArray(payload?.errors) ? payload.errors : [];
    this.payload = payload ?? null;
  }
}

export class ApiUnavailableError extends Error {
  constructor(message, options = {}) {
    super(message);
    this.name = 'ApiUnavailableError';
    this.code = 'API_UNAVAILABLE';
    this.apiBaseUrl = options.apiBaseUrl ?? API_BASE_URL;
    this.cause = options.cause ?? null;
  }
}

export async function fetchJson(path, options = {}) {
  try {
    const response = await fetch(`${API_BASE_URL}${path}`, {
      headers: {
        'Content-Type': 'application/json',
        ...(options.headers || {}),
      },
      ...options,
    });

    const payload = await readJsonPayload(response);

    if (!response.ok) {
      markApiOnline();
      throw new ApiError(payload, response.status);
    }

    markApiOnline();
    return payload;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }

    if (isNetworkFailure(error)) {
      const unavailableError = new ApiUnavailableError(
        'No se pudo conectar con JobPilot API. Verifica que el backend este iniciado.',
        {
          apiBaseUrl: API_BASE_URL,
          cause: error,
        },
      );
      markApiOffline(unavailableError);
      throw unavailableError;
    }

    throw error;
  }
}

async function readJsonPayload(response) {
  try {
    return await response.json();
  } catch {
    return null;
  }
}

function buildErrorMessage(payload) {
  const fieldErrors = collectFieldMessages(payload);
  if (fieldErrors.length) {
    return fieldErrors.join(' ');
  }

  return payload?.message || 'La solicitud no pudo completarse.';
}

function collectFieldMessages(payload) {
  if (payload?.code !== 'VALIDATION_ERROR' || !Array.isArray(payload?.errors)) {
    return [];
  }

  return [...new Set(payload.errors.map((item) => item?.message).filter(Boolean))];
}

function isNetworkFailure(error) {
  return error instanceof TypeError || /failed to fetch|networkerror|load failed/i.test(String(error?.message ?? ''));
}
