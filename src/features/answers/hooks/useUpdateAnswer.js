import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updateAnswer } from '../api/answersApi.js';

export function useUpdateAnswer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateAnswer,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['answers'] });
    },
  });
}
