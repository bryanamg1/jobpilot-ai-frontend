import { useMutation } from '@tanstack/react-query';
import { fetchGmailAuthUrl } from '../api/gmailApi.js';

export function useConnectGmail() {
  return useMutation({
    mutationFn: fetchGmailAuthUrl,
    onSuccess: (response) => {
      window.location.assign(response.data.url);
    },
  });
}
