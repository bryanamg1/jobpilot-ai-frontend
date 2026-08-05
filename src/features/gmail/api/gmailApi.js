import { fetchJson } from '../../../shared/lib/fetchJson.js';

export function fetchGmailStatus() {
  return fetchJson('/integrations/gmail/status');
}

export function fetchGmailAuthUrl() {
  return fetchJson('/integrations/gmail/auth-url');
}

export function disconnectGmailConnection() {
  return fetchJson('/integrations/gmail/connection', {
    method: 'DELETE',
  });
}

export function fetchGmailAlerts() {
  return fetchJson('/integrations/gmail/alerts');
}

export function createGmailDraft(jobId) {
  return fetchJson(`/jobs/${jobId}/gmail-draft`, {
    method: 'POST',
  });
}
