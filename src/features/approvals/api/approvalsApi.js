import { fetchJson } from '../../../shared/lib/fetchJson.js';

export function fetchApprovals() {
  return fetchJson('/approvals');
}

export function approveSensitiveApproval({ requestId, note }) {
  return fetchJson(`/approvals/${requestId}/approve`, {
    method: 'POST',
    body: JSON.stringify({ note }),
  });
}

export function rejectSensitiveApproval({ requestId, note }) {
  return fetchJson(`/approvals/${requestId}/reject`, {
    method: 'POST',
    body: JSON.stringify({ note }),
  });
}
