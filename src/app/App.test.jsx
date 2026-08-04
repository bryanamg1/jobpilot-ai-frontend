import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import '@testing-library/jest-dom/vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { App } from './App.jsx';

describe('App', () => {
  beforeEach(() => {
    vi.stubGlobal(
      'fetch',
      vi.fn((url) => {
        if (String(url).includes('/dashboard')) {
          return Promise.resolve(
            new Response(
              JSON.stringify({
                data: {
                  storageMode: 'memory',
                  metrics: { total: 1, readyToPrepare: 1, blocked: 0 },
                  latest: [],
                },
              }),
            ),
          );
        }

        return Promise.resolve(
          new Response(
            JSON.stringify({
              data: {
                headlineTargets: ['Backend Developer'],
                location: 'Buenos Aires, Argentina',
                englishLevel: 'B1',
                availability: 'Full time',
                salaryExpectation: { currency: 'USD', amount: 1000, period: 'monthly' },
              },
            }),
          ),
        );
      }),
    );
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('renders the dashboard shell and metrics', async () => {
    const queryClient = new QueryClient();

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <App />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    expect(screen.getByText(/pipeline de postulaciones/i)).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getAllByText('1').length).toBeGreaterThan(0);
    });
  });
});
