import { useQuery } from '@tanstack/react-query';
import { fetchHealthStatus } from '../api/healthApi.js';

export function useHealthQuery() {
  return useQuery({
    queryKey: ['health'],
    queryFn: fetchHealthStatus,
  });
}
