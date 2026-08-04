import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createManualJob } from '../api/jobsApi.js';

export function useCreateManualJob() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createManualJob,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['jobs'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
}
