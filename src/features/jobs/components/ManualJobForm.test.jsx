import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import '@testing-library/jest-dom/vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ManualJobForm } from './ManualJobForm.jsx';

describe('ManualJobForm', () => {
  beforeEach(() => {
    vi.stubGlobal(
      'fetch',
      vi.fn(() =>
        Promise.resolve(
          new Response(
            JSON.stringify({
              success: false,
              code: 'VALIDATION_ERROR',
              message: 'Los datos enviados no son válidos.',
              errors: [
                {
                  field: 'rawText',
                  message: 'El texto de la vacante no cumple el mínimo requerido.',
                },
                {
                  field: 'sourceUrl',
                  message: 'La URL original no pertenece a una fuente permitida.',
                },
              ],
            }),
            { status: 400 },
          ),
        ),
      ),
    );
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('renders backend validation messages on their matching fields', async () => {
    const queryClient = new QueryClient({
      defaultOptions: {
        mutations: {
          retry: false,
        },
      },
    });

    render(
      <QueryClientProvider client={queryClient}>
        <ManualJobForm />
      </QueryClientProvider>,
    );

    fireEvent.change(screen.getByLabelText(/texto de la vacante/i), {
      target: { value: 'Backend Node.js role with Express, MySQL, testing and remote collaboration details.' },
    });
    fireEvent.change(screen.getByLabelText(/enlace original/i), {
      target: { value: 'https://example.com/job' },
    });
    fireEvent.click(screen.getByRole('button', { name: /analizar vacante/i }));

    await waitFor(() => {
      expect(screen.getByText('El texto de la vacante no cumple el mínimo requerido.')).toBeInTheDocument();
      expect(screen.getByText('La URL original no pertenece a una fuente permitida.')).toBeInTheDocument();
    });
  });
});
