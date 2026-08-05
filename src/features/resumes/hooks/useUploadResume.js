import { useMutation, useQueryClient } from '@tanstack/react-query';
import { uploadResume } from '../api/resumesApi.js';

export function useUploadResume() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: uploadResume,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['resumes'] });
    },
  });
}
