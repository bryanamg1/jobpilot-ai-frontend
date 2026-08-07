import { fetchJson } from '../../../shared/lib/fetchJson.js';

export function fetchApprovals(filters = {}) {
  const query = new URLSearchParams();

  if (filters.status) {
    query.set('status', filters.status);
  }

  if (filters.approvalKind) {
    query.set('approvalKind', filters.approvalKind);
  }

  if (filters.entityId) {
    query.set('entityId', filters.entityId);
  }

  if (filters.search) {
    query.set('search', filters.search);
  }

  query.set('limit', String(filters.limit ?? 50));

  return fetchJson(`/approvals?${query.toString()}`);
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
