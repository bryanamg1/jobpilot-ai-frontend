import { useQuery } from '@tanstack/react-query';
import { fetchGmailAlerts } from '../api/gmailApi.js';

export function useGmailAlertsQuery(enabled) {
  return useQuery({
    queryKey: ['gmail', 'alerts'],
    queryFn: fetchGmailAlerts,
    enabled,
    select: (response) => response.data,
  });
}
