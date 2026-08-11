import { QueryClient } from '@tanstack/react-query';
import { ApiUnavailableError } from './fetchJson.js';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry(failureCount, error) {
        if (error instanceof ApiUnavailableError) {
          return false;
        }

        return failureCount < 1;
      },
      staleTime: 30_000,
    },
  },
});
