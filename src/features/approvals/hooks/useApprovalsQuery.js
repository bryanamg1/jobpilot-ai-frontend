import { useQuery } from '@tanstack/react-query';
import { fetchApprovals } from '../api/approvalsApi.js';

export function useApprovalsQuery() {
  return useQuery({
    queryKey: ['approvals'],
    queryFn: fetchApprovals,
    select: (response) => response.data,
  });
}
