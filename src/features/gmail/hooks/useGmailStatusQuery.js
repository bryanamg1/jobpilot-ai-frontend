import { useQuery } from '@tanstack/react-query';
import { fetchGmailStatus } from '../api/gmailApi.js';

export function useGmailStatusQuery() {
  return useQuery({
    queryKey: ['gmail', 'status'],
    queryFn: fetchGmailStatus,
    select: (response) => response.data,
  });
}
