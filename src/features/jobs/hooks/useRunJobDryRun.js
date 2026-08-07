import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createJobDryRunApplication } from '../api/jobsApi.js';

export function useRunJobDryRun() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createJobDryRunApplication,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      queryClient.invalidateQueries({ queryKey: ['jobs'] });
    },
  });
}

