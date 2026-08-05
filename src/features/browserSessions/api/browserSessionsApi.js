import { fetchJson } from '../../../shared/lib/fetchJson.js';

export function fetchBrowserSessions() {
  return fetchJson('/browser-sessions');
}

export function startBrowserSession(payload = {}) {
  return fetchJson('/browser-sessions', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export function refreshBrowserSession(sessionId) {
  return fetchJson(`/browser-sessions/${sessionId}/refresh`, {
    method: 'POST',
  });
}

export function navigateBrowserSession({ sessionId, url }) {
  return fetchJson(`/browser-sessions/${sessionId}/navigate`, {
    method: 'POST',
    body: JSON.stringify({ url }),
  });
}

export function captureBrowserSessionJob(sessionId) {
  return fetchJson(`/browser-sessions/${sessionId}/capture-job`, {
    method: 'POST',
  });
}

export function closeBrowserSession(sessionId) {
  return fetchJson(`/browser-sessions/${sessionId}/close`, {
    method: 'POST',
  });
}
