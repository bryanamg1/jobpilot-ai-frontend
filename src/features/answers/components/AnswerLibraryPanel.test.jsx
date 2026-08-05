import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import '@testing-library/jest-dom/vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { AnswerLibraryPanel } from './AnswerLibraryPanel.jsx';

describe('AnswerLibraryPanel', () => {
  beforeEach(() => {
    vi.stubGlobal(
      'fetch',
      vi.fn((url, options = {}) => {
        if (String(url).includes('/answers') && (!options.method || options.method === 'GET')) {
          return Promise.resolve(
            new Response(
              JSON.stringify({
                data: [],
              }),
              { status: 200 },
            ),
          );
        }

        if (String(url).includes('/answers') && options.method === 'POST') {
          return Promise.resolve(
            new Response(
              JSON.stringify({
                success: false,
                code: 'VALIDATION_ERROR',
                message: 'Los datos enviados no son válidos.',
                errors: [
                  {
                    field: 'question',
                    message: 'La pregunta es obligatoria.',
                  },
                  {
                    field: 'answer',
                    message: 'La respuesta es obligatoria.',
                  },
                ],
              }),
              { status: 400 },
            ),
          );
        }

        return Promise.resolve(
          new Response(
            JSON.stringify({
              data: [],
            }),
            { status: 200 },
          ),
        );
      }),
    );
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('renders backend validation field messages after create failure', async () => {
    const queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
        },
        mutations: {
          retry: false,
        },
      },
    });

    render(
      <QueryClientProvider client={queryClient}>
        <AnswerLibraryPanel />
      </QueryClientProvider>,
    );

    await waitFor(() => {
      expect(screen.getByText(/todavia no hay respuestas reutilizables/i)).toBeInTheDocument();
    });

    const questionInput = screen.getByLabelText(/pregunta/i);
    const answerInput = screen.getByLabelText(/respuesta/i);

    fireEvent.change(questionInput, {
      target: { value: 'Experiencia con Redis' },
    });
    fireEvent.change(answerInput, {
      target: { value: 'Tengo experiencia comprobable.' },
    });
    fireEvent.click(screen.getByRole('button', { name: /guardar respuesta/i }));

    await waitFor(() => {
      expect(screen.getByText('La pregunta es obligatoria.')).toBeInTheDocument();
      expect(screen.getByText('La respuesta es obligatoria.')).toBeInTheDocument();
    });
  });
});
