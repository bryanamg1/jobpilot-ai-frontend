import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updateProfile } from '../api/profileApi.js';

export function useUpdateProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateProfile,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
    },
  });
}
