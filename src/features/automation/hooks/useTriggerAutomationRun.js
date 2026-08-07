import { useMutation, useQueryClient } from '@tanstack/react-query';
import { triggerAutomationRun } from '../api/automationApi.js';

export function useTriggerAutomationRun() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: triggerAutomationRun,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      queryClient.invalidateQueries({ queryKey: ['jobs'] });
    },
  });
}

