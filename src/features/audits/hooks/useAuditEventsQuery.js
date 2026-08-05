import { useQuery } from '@tanstack/react-query';
import { fetchAuditEvents } from '../api/auditApi.js';

export function useAuditEventsQuery(filters = {}) {
  return useQuery({
    queryKey: ['audits', filters],
    queryFn: () => fetchAuditEvents(filters),
    select: (response) => response.data,
  });
}
