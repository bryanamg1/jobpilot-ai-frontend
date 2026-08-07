import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createAnswer } from '../api/answersApi.js';

export function useCreateAnswer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createAnswer,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['answers'] });
    },
  });
}
