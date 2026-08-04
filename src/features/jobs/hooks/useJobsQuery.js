import { useQuery } from '@tanstack/react-query';
import { fetchJobs } from '../api/jobsApi.js';

export function useJobsQuery() {
  return useQuery({
    queryKey: ['jobs'],
    queryFn: fetchJobs,
    select: (response) => response.data,
  });
}
