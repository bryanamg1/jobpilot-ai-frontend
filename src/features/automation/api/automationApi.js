import { fetchJson } from '../../../shared/lib/fetchJson.js';

export function updateAutomationSettings(payload) {
  return fetchJson('/automation/settings', {
    method: 'PUT',
    body: JSON.stringify(payload),
  });
}

export function triggerAutomationRun(payload = {}) {
  return fetchJson('/automation/runs', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

