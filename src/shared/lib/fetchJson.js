const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4300/api/v1';

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

export async function fetchJson(path, options = {}) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
    ...options,
  });

  const payload = await readJsonPayload(response);

  if (!response.ok) {
    throw new ApiError(payload, response.status);
  }

  return payload;
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

  return payload?.message || 'Request failed';
}

function collectFieldMessages(payload) {
  if (payload?.code !== 'VALIDATION_ERROR' || !Array.isArray(payload?.errors)) {
    return [];
  }

  return [...new Set(payload.errors.map((item) => item?.message).filter(Boolean))];
}
