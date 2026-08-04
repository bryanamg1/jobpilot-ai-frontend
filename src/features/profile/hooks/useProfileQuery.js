import { useQuery } from '@tanstack/react-query';
import { fetchProfile } from '../api/profileApi.js';

export function useProfileQuery() {
  return useQuery({
    queryKey: ['profile'],
    queryFn: fetchProfile,
    select: (response) => response.data,
  });
}
