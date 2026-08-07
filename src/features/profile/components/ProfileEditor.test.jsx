import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import '@testing-library/jest-dom/vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ProfileEditor } from './ProfileEditor.jsx';

const profile = {
  name: 'Bryan Marquez',
  headlineTargets: ['Backend Developer'],
  location: 'Buenos Aires, Argentina',
  availability: 'Full time',
  modalities: ['remote', 'hybrid'],
  englishLevel: 'B1',
  salaryExpectation: {
    amount: 1000,
    currency: 'USD',
    period: 'monthly',
  },
  publicLinks: {
    github: 'https://github.com/bryanamg1',
    linkedin: 'https://www.linkedin.com/in/bryan-marquez-dev/',
  },
  contact: {
    email: 'bryanamg181@gmail.com',
  },
  projects: ['Social App'],
  technologies: ['Node.js', 'React'],
  knowledgeAreas: ['AI agents'],
  prohibitedClaims: ['English C1'],
};

describe('ProfileEditor', () => {
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
                  field: 'contact.email',
                  message: 'El email debe pertenecer a un dominio permitido.',
                },
                {
                  field: 'salaryExpectation.amount',
                  message: 'El salario debe ser mayor a 0.',
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

  it('maps nested backend validation paths to flat form fields', async () => {
    const queryClient = new QueryClient({
      defaultOptions: {
        mutations: {
          retry: false,
        },
      },
    });

    render(
      <QueryClientProvider client={queryClient}>
        <ProfileEditor profile={profile} />
      </QueryClientProvider>,
    );

    fireEvent.click(screen.getByRole('button', { name: /guardar perfil/i }));

    await waitFor(() => {
      expect(screen.getByText('El email debe pertenecer a un dominio permitido.')).toBeInTheDocument();
      expect(screen.getByText('El salario debe ser mayor a 0.')).toBeInTheDocument();
    });
  });
});
