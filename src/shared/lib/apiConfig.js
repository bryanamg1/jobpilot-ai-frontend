const DEFAULT_API_BASE_URL = 'http://localhost:4300/api/v1';

export const API_BASE_URL = resolveApiBaseUrl();

function resolveApiBaseUrl() {
  const configured = import.meta.env.VITE_API_BASE_URL?.trim();
  return configured || DEFAULT_API_BASE_URL;
}
