import { useMutation, useQueryClient } from '@tanstack/react-query';
import { deleteAnswer } from '../api/answersApi.js';

export function useDeleteAnswer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteAnswer,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['answers'] });
    },
  });
}
