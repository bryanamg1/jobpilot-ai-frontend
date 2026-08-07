import { useQuery } from '@tanstack/react-query';
import { fetchResumes } from '../api/resumesApi.js';

export function useResumesQuery() {
  return useQuery({
    queryKey: ['resumes'],
    queryFn: fetchResumes,
    select: (response) => response.data,
  });
}
