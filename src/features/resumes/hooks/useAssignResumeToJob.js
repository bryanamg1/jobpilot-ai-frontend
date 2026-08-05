import { useMutation, useQueryClient } from '@tanstack/react-query';
import { assignResumeToJob } from '../api/resumesApi.js';

export function useAssignResumeToJob() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: assignResumeToJob,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['jobs'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
}
