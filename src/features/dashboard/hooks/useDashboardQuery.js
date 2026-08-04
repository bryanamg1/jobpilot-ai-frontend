import { useQuery } from '@tanstack/react-query';
import { fetchDashboard } from '../api/dashboardApi.js';

export function useDashboardQuery() {
  return useQuery({
    queryKey: ['dashboard'],
    queryFn: fetchDashboard,
    select: (response) => response.data,
  });
}
