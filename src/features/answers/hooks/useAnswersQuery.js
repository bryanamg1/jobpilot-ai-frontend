import { useQuery } from '@tanstack/react-query';
import { fetchAnswers } from '../api/answersApi.js';

export function useAnswersQuery() {
  return useQuery({
    queryKey: ['answers'],
    queryFn: fetchAnswers,
    select: (response) => response.data,
  });
}
