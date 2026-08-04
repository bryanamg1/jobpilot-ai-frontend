const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4300/api/v1';

export async function fetchJson(path, options = {}) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
    ...options,
  });

  const payload = await response.json();

  if (!response.ok) {
    throw new Error(payload?.message || 'Request failed');
  }

  return payload;
}
