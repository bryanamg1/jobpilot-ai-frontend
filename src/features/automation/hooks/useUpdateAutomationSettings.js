import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updateAutomationSettings } from '../api/automationApi.js';

export function useUpdateAutomationSettings() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateAutomationSettings,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
}

