import { useMutation, useQueryClient } from '@tanstack/react-query';

export function useBrowserSessionMutation(mutationFn, options = {}) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['browser-sessions'] });
      queryClient.invalidateQueries({ queryKey: ['audits'] });

      if (options.invalidateJobs) {
        queryClient.invalidateQueries({ queryKey: ['jobs'] });
        queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      }
    },
  });
}
