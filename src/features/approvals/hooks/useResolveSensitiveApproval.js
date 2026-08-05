import { useMutation, useQueryClient } from '@tanstack/react-query';
import { approveSensitiveApproval, rejectSensitiveApproval } from '../api/approvalsApi.js';

const mutationByDecision = {
  approve: approveSensitiveApproval,
  reject: rejectSensitiveApproval,
};

export function useResolveSensitiveApproval() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ decision, requestId, note }) => {
      const mutation = mutationByDecision[decision];

      if (!mutation) {
        throw new Error('Unsupported sensitive approval decision');
      }

      return mutation({ requestId, note });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['approvals'] });
      queryClient.invalidateQueries({ queryKey: ['jobs'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
}
