import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createGmailDraft } from '../api/gmailApi.js';

export function useCreateGmailDraft() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createGmailDraft,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['gmail', 'alerts'] });
    },
  });
}
