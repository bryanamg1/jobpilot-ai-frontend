import { useQuery } from '@tanstack/react-query';
import { fetchBrowserSessions } from '../api/browserSessionsApi.js';

export function useBrowserSessionsQuery() {
  return useQuery({
    queryKey: ['browser-sessions'],
    queryFn: fetchBrowserSessions,
    select: (response) => response.data,
  });
}
