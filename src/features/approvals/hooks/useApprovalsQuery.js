import { useQuery } from '@tanstack/react-query';
import { fetchApprovals } from '../api/approvalsApi.js';

export function useApprovalsQuery(filters = {}) {
  return useQuery({
    queryKey: ['approvals', filters],
    queryFn: () => fetchApprovals(filters),
    select: (response) => response.data,
  });
}
