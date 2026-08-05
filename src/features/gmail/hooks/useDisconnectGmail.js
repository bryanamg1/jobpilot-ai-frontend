import { useMutation, useQueryClient } from '@tanstack/react-query';
import { disconnectGmailConnection } from '../api/gmailApi.js';

export function useDisconnectGmail() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: disconnectGmailConnection,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['gmail', 'status'] });
      queryClient.invalidateQueries({ queryKey: ['gmail', 'alerts'] });
    },
  });
}
