import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import '@testing-library/jest-dom/vitest';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { GmailIntegrationPage } from './GmailIntegrationPage.jsx';

function createTestClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
      mutations: {
        retry: false,
      },
    },
  });
}

function renderPage() {
  const queryClient = createTestClient();

  render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>
        <GmailIntegrationPage />
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

describe('GmailIntegrationPage', () => {
  const originalLocation = window.location;

  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn());
  });

  afterEach(() => {
    cleanup();
    Object.defineProperty(window, 'location', {
      configurable: true,
      value: originalLocation,
    });
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it('renderiza Gmail desconectado con accion para conectar', async () => {
    globalThis.fetch.mockResolvedValue(
      new Response(
        JSON.stringify({
          data: {
            configured: true,
            connected: false,
            emailAddress: null,
            labelName: 'Postulaciones/Por revisar',
            draftLabelNote: 'Nota de drafts',
          },
        }),
      ),
    );

    renderPage();

    await waitFor(() => {
      expect(screen.getByText(/gmail no conectado/i)).toBeInTheDocument();
    });

    expect(screen.getByRole('button', { name: /conectar gmail/i })).toBeInTheDocument();
  });

  it('solicita auth-url y redirige al proveedor al conectar gmail', async () => {
    const assignSpy = vi.fn();

    Object.defineProperty(window, 'location', {
      configurable: true,
      value: {
        ...originalLocation,
        assign: assignSpy,
      },
    });

    globalThis.fetch.mockImplementation((url) => {
      if (String(url).includes('/integrations/gmail/status')) {
        return Promise.resolve(
          new Response(
            JSON.stringify({
              data: {
                configured: true,
                connected: false,
                emailAddress: null,
                labelName: 'Postulaciones/Por revisar',
                draftLabelNote: 'Nota de drafts',
              },
            }),
          ),
        );
      }

      if (String(url).includes('/integrations/gmail/auth-url')) {
        return Promise.resolve(
          new Response(
            JSON.stringify({
              data: {
                url: 'https://accounts.google.com/o/oauth2/v2/auth?state=test',
              },
            }),
          ),
        );
      }

      throw new Error(`URL inesperada: ${url}`);
    });

    renderPage();

    const button = await screen.findByRole('button', { name: /conectar gmail/i });
    fireEvent.click(button);

    await waitFor(() => {
      expect(globalThis.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/integrations/gmail/auth-url'),
        expect.objectContaining({
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
          }),
        }),
      );
    });

    await waitFor(() => {
      expect(assignSpy).toHaveBeenCalledWith('https://accounts.google.com/o/oauth2/v2/auth?state=test');
    });
  });

  it('muestra Gmail conectado y permite desconectar', async () => {
    let statusCallCount = 0;

    globalThis.fetch.mockImplementation((url, options = {}) => {
      if (String(url).includes('/integrations/gmail/status')) {
        statusCallCount += 1;

        return Promise.resolve(
          new Response(
            JSON.stringify({
              data:
                statusCallCount === 1
                  ? {
                      configured: true,
                      connected: true,
                      emailAddress: 'bryanamg181@gmail.com',
                      labelName: 'Postulaciones/Por revisar',
                      draftLabelNote: 'Nota de drafts',
                    }
                  : {
                      configured: true,
                      connected: false,
                      emailAddress: null,
                      labelName: 'Postulaciones/Por revisar',
                      draftLabelNote: 'Nota de drafts',
                    },
            }),
          ),
        );
      }

      if (String(url).includes('/integrations/gmail/connection') && options.method === 'DELETE') {
        return Promise.resolve(
          new Response(
            JSON.stringify({
              data: {
                disconnected: true,
              },
            }),
          ),
        );
      }

      throw new Error(`URL inesperada: ${url}`);
    });

    renderPage();

    const button = await screen.findByRole('button', { name: /desconectar/i });
    expect(screen.getByText(/gmail conectado/i)).toBeInTheDocument();

    fireEvent.click(button);

    await waitFor(() => {
      expect(globalThis.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/integrations/gmail/connection'),
        expect.objectContaining({
          method: 'DELETE',
        }),
      );
    });

    await waitFor(() => {
      expect(screen.getByText(/gmail no conectado/i)).toBeInTheDocument();
    });
  });

  it('muestra estado vacio si gmail no esta configurado', async () => {
    globalThis.fetch.mockResolvedValue(
      new Response(
        JSON.stringify({
          data: {
            configured: false,
            connected: false,
            emailAddress: null,
            labelName: 'Postulaciones/Por revisar',
            draftLabelNote: 'Nota de drafts',
          },
        }),
      ),
    );

    renderPage();

    await waitFor(() => {
      expect(screen.getByText(/no configurada/i)).toBeInTheDocument();
    });

    expect(screen.queryByRole('button', { name: /conectar gmail/i })).not.toBeInTheDocument();
  });

  it('muestra un error entendible si falla la API', async () => {
    globalThis.fetch.mockResolvedValue(
      new Response(
        JSON.stringify({
          message: 'No se pudo consultar el estado de Gmail.',
        }),
        { status: 500 },
      ),
    );

    renderPage();

    await waitFor(() => {
      expect(screen.getByRole('alert')).toBeInTheDocument();
    });

    expect(screen.getByText(/no se pudo consultar el estado de gmail/i)).toBeInTheDocument();
  });
});
