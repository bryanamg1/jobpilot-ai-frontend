import { useMutation } from '@tanstack/react-query';
import { createDraftPreview } from '../api/jobsApi.js';

export function useCreateDraftPreview() {
  return useMutation({
    mutationFn: createDraftPreview,
  });
}
