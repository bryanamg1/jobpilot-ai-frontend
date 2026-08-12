import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import '@testing-library/jest-dom/vitest';
import { cleanup, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { App } from './App.jsx';
import { resetApiConnectionState } from '../shared/lib/apiConnectionStore.js';

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
                  metrics: { total: 1, readyToPrepare: 0, awaitingApproval: 1, blocked: 0 },
                  automation: {
                    settings: {
                      enabled: false,
                      mode: 'DRY_RUN',
                      timezone: 'America/Argentina/Buenos_Aires',
                      dailyApplicationLimit: 5,
                      dailyDiscoveryLimit: 25,
                      minimumMatchScore: 75,
                      requireHumanApproval: true,
                      startTime: '09:00',
                      filters: {
                        allowedSources: ['LINKEDIN_JOBS_SUPERVISED'],
                        allowedRoles: [],
                        blockedCompanies: [],
                        blockedKeywords: [],
                      },
                      sourcePolicies: {
                        MANUAL: 'MANUAL_ONLY',
                        LINKEDIN_JOBS_SUPERVISED: 'AUTO_PREPARE',
                        LINKEDIN_FEED_SUPERVISED: 'AUTO_PREPARE',
                        LINKEDIN_POST_SEARCH_SUPERVISED: 'AUTO_PREPARE',
                      },
                    },
                    dailyCompleted: 0,
                  },
                  applications: [],
                  agentRuns: [],
                  latest: [
                    {
                      id: 'job-1',
                      source: {
                        label: 'Manual',
                        originalUrl: 'https://example.com/jobs/1',
                      },
                      jobOffer: {
                        company: 'Acme Labs',
                        title: 'Backend Developer',
                      },
                      match: {
                        score: 72,
                        status: 'AWAITING_APPROVAL',
                        recommendation: 'REVIEW',
                        approvals: [],
                        excludedByRules: [],
                        explanation: {
                          matches: ['Node.js'],
                          gaps: ['El requisito de ingles avanzado supera el nivel B1 confirmado.'],
                          risks: ['El salario es un dato sensible y requiere aprobacion manual.'],
                        },
                      },
                    },
                  ],
                },
              }),
            ),
          );
        }

        if (String(url).includes('/health')) {
          return Promise.resolve(
            new Response(
              JSON.stringify({
                status: 'ok',
                storageMode: 'memory',
                dependencies: {
                  storage: { status: 'ok' },
                  queue: { status: 'ok', mode: 'inline' },
                },
                integrations: {
                  gmail: { status: 'configured' },
                  openai: { status: 'disabled' },
                },
                reliability: {
                  circuits: {
                    gmail: { state: 'closed' },
                    openai: { state: 'closed' },
                    playwright: { state: 'closed' },
                  },
                },
                runtime: {
                  redisConfigured: false,
                  requestCorrelation: true,
                },
              }),
            ),
          );
        }

        if (String(url).includes('/jobs')) {
          return Promise.resolve(
            new Response(
              JSON.stringify({
                data: [
                  {
                    id: 'job-1',
                    source: {
                      label: 'Manual',
                      originalUrl: 'https://example.com/jobs/1',
                    },
                    jobOffer: {
                      company: 'Acme Labs',
                      title: 'Backend Developer',
                    },
                    match: {
                      score: 72,
                      status: 'AWAITING_APPROVAL',
                      recommendation: 'REVIEW',
                      approvals: [],
                      excludedByRules: [],
                      explanation: {
                        matches: ['Node.js'],
                        gaps: ['El requisito de ingles avanzado supera el nivel B1 confirmado.'],
                        risks: ['El salario es un dato sensible y requiere aprobacion manual.'],
                      },
                    },
                  },
                ],
              }),
            ),
          );
        }

        if (String(url).includes('/automation/runs')) {
          return Promise.resolve(
            new Response(
              JSON.stringify({
                data: {
                  id: 'run-1',
                  status: 'COMPLETED',
                },
              }),
            ),
          );
        }

        if (String(url).includes('/resumes')) {
          return Promise.resolve(
            new Response(
              JSON.stringify({
                data: [],
              }),
            ),
          );
        }

        if (String(url).includes('/answers')) {
          return Promise.resolve(
            new Response(
              JSON.stringify({
                data: [],
              }),
            ),
          );
        }

        if (String(url).includes('/approvals')) {
          return Promise.resolve(
            new Response(
              JSON.stringify({
                data: [],
              }),
            ),
          );
        }

        if (String(url).includes('/audits')) {
          return Promise.resolve(
            new Response(
              JSON.stringify({
                data: [],
              }),
            ),
          );
        }

        if (String(url).includes('/browser-sessions')) {
          return Promise.resolve(
            new Response(
              JSON.stringify({
                data: [],
              }),
            ),
          );
        }

        if (String(url).includes('/integrations/gmail/status')) {
          return Promise.resolve(
            new Response(
              JSON.stringify({
                data: {
                  configured: true,
                  connected: false,
                  emailAddress: null,
                  labelName: 'Postulaciones/Por revisar',
                  draftLabelNote: 'Los borradores de Gmail solo admiten la etiqueta predeterminada DRAFT. La etiqueta de revision se conserva para seguimiento interno y futuras automatizaciones.',
                  alertQuery: 'job alert',
                },
              }),
            ),
          );
        }

        if (String(url).includes('/integrations/gmail/alerts')) {
          return Promise.resolve(
            new Response(
              JSON.stringify({
                data: {
                  query: 'job alert',
                  messages: [],
                },
              }),
            ),
          );
        }

        return Promise.resolve(
          new Response(
            JSON.stringify({
              data: {
                name: 'Bryan Marquez',
                headlineTargets: ['Backend Developer'],
                location: 'Buenos Aires, Argentina',
                englishLevel: 'B1',
                availability: 'Full time',
                salaryExpectation: { currency: 'USD', amount: 1000, period: 'monthly' },
                modalities: ['remote', 'hybrid'],
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
              },
            }),
          ),
        );
      }),
    );
  });

  afterEach(() => {
    cleanup();
    vi.unstubAllGlobals();
    resetApiConnectionState();
  });

  it('redirects to /dashboard and renders the executive summary shell', async () => {
    const queryClient = new QueryClient();

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={['/']}>
          <App />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    expect(screen.getByText(/resumen ejecutivo del agente/i)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /^vacantes$/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /^cvs$/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /^automatizacion$/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /^ejecuciones$/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /^integraciones$/i })).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getAllByText('1').length).toBeGreaterThan(0);
    });
  });

  it('renders the dedicated automation route', async () => {
    const queryClient = new QueryClient();

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={['/automation']}>
          <App />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    expect(screen.getByText(/centro de automatizacion/i)).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /probar automatizacion sin enviar/i })).toBeInTheDocument();
    });
  });

  it('renders the dedicated jobs route', async () => {
    const queryClient = new QueryClient();

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={['/jobs']}>
          <App />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    expect(screen.getByText(/operacion de vacantes/i)).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /analizar vacante/i })).toBeInTheDocument();
    });
  });

  it('renders the dedicated automation runs route', async () => {
    const queryClient = new QueryClient();

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={['/automation/runs']}>
          <App />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    expect(screen.getByText(/ejecuciones del runner/i)).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText(/postulaciones y ejecuciones/i)).toBeInTheDocument();
    });
  });

  it('renders the dedicated integrations route', async () => {
    const queryClient = new QueryClient();

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={['/integrations']}>
          <App />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    expect(screen.getByText(/integracion gmail/i)).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /conectar gmail/i })).toBeInTheDocument();
    });
  });

  it('renders the dedicated resumes route', async () => {
    const queryClient = new QueryClient();

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={['/profile/resumes']}>
          <App />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    expect(screen.getAllByText(/gestor de cvs/i).length).toBeGreaterThan(0);

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /cargar cv/i })).toBeInTheDocument();
    });
  });

  it('redirects the gmail oauth callback query to integrations', async () => {
    const queryClient = new QueryClient();

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={['/?gmail=connected']}>
          <App />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    await waitFor(() => {
      expect(screen.getByText(/integracion gmail/i)).toBeInTheDocument();
    });
  });

  it('shows a single centralized API offline message when the backend is disconnected', async () => {
    globalThis.fetch.mockRejectedValue(new TypeError('Failed to fetch'));
    const queryClient = new QueryClient();

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <App />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    await waitFor(() => {
      expect(screen.getAllByText(/no se pudo conectar con jobpilot api/i).length).toBeGreaterThan(0);
    });

    expect(screen.queryByText(/failed to fetch/i)).not.toBeInTheDocument();
  });
});

