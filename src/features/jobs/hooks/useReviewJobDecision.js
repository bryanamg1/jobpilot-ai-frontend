import { useMutation, useQueryClient } from '@tanstack/react-query';
import { approveJob, rejectJob } from '../api/jobsApi.js';

const mutationByDecision = {
  approve: ({ jobId, reason }) => approveJob(jobId, { reason }),
  reject: ({ jobId, reason }) => rejectJob(jobId, { reason }),
};

export function useReviewJobDecision() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ decision, jobId, reason = '' }) => {
      const mutation = mutationByDecision[decision];

      if (!mutation) {
        throw new Error('Unsupported review decision');
      }

      return mutation({ jobId, reason });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      queryClient.invalidateQueries({ queryKey: ['jobs'] });
    },
  });
}
