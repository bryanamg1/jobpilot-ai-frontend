import { fetchJson } from '../../../shared/lib/fetchJson.js';

export function fetchAuditEvents(filters = {}) {
  const query = new URLSearchParams();

  if (filters.entityType) {
    query.set('entityType', filters.entityType);
  }

  if (filters.entityId) {
    query.set('entityId', filters.entityId);
  }

  if (filters.eventName) {
    query.set('eventName', filters.eventName);
  }

  query.set('limit', String(filters.limit ?? 20));

  return fetchJson(`/audits?${query.toString()}`);
}
