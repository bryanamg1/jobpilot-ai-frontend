import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import '@testing-library/jest-dom/vitest';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ResumeManagerPanel } from '../components/ResumeManagerPanel.jsx';
import { ResumeManagerPage } from './ResumeManagerPage.jsx';

vi.mock('../../../shared/lib/fileToBase64.js', () => ({
  fileToBase64: vi.fn(() => Promise.resolve('ZmFrZS1iYXNlNjQ=')),
}));

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
        <ResumeManagerPage />
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

describe('ResumeManagerPage', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn());
  });

  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it('muestra empty state cuando no hay CVs', async () => {
    globalThis.fetch.mockResolvedValue(
      new Response(
        JSON.stringify({
          data: [],
        }),
      ),
    );

    renderPage();

    await waitFor(() => {
      expect(screen.getByText(/todavia no cargaste ningun cv/i)).toBeInTheDocument();
    });
  });

  it('muestra la lista real de CVs con metadata', async () => {
    globalThis.fetch.mockResolvedValue(
      new Response(
        JSON.stringify({
          data: [
            {
              id: 'resume-1',
              label: 'Backend CV EN',
              originalFileName: 'backend-cv-en.pdf',
              sizeBytes: 245760,
              uploadedAt: '2026-08-12T11:00:00.000Z',
              attachmentStatus: 'MANUAL_REQUIRED',
            },
          ],
        }),
      ),
    );

    renderPage();

    await waitFor(() => {
      expect(screen.getByText('Backend CV EN')).toBeInTheDocument();
    });

    expect(screen.getByText('backend-cv-en.pdf')).toBeInTheDocument();
    expect(screen.getByText(/240 KB/i)).toBeInTheDocument();
    expect(screen.getByText(/Adjunto manual requerido/i)).toBeInTheDocument();
  });

  it('permite subir un CV valido y actualiza la lista', async () => {
    let getCount = 0;

    globalThis.fetch.mockImplementation((url, options = {}) => {
      if (String(url).includes('/resumes') && (!options.method || options.method === 'GET')) {
        getCount += 1;

        return Promise.resolve(
          new Response(
            JSON.stringify({
              data:
                getCount === 1
                  ? []
                  : [
                      {
                        id: 'resume-1',
                        label: 'Backend CV EN',
                        originalFileName: 'backend-cv-en.pdf',
                        sizeBytes: 1024,
                        uploadedAt: '2026-08-12T11:00:00.000Z',
                        attachmentStatus: 'MANUAL_REQUIRED',
                      },
                    ],
            }),
          ),
        );
      }

      if (String(url).includes('/resumes') && options.method === 'POST') {
        return Promise.resolve(
          new Response(
            JSON.stringify({
              data: {
                id: 'resume-1',
                label: 'Backend CV EN',
              },
            }),
            { status: 201 },
          ),
        );
      }

      throw new Error(`URL inesperada: ${url}`);
    });

    renderPage();

    fireEvent.change(screen.getByPlaceholderText(/backend cv en/i), {
      target: { value: 'Backend CV EN' },
    });

    const fileInput = screen.getByLabelText(/archivo del cv/i);
    const file = new File(['resume'], 'backend-cv-en.pdf', { type: 'application/pdf' });
    fireEvent.change(fileInput, {
      target: { files: [file] },
    });

    fireEvent.click(screen.getByRole('button', { name: /cargar cv/i }));

    await waitFor(() => {
      expect(globalThis.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/resumes'),
        expect.objectContaining({
          method: 'POST',
        }),
      );
    });

    await waitFor(() => {
      expect(screen.getByText(/cv cargado correctamente/i)).toBeInTheDocument();
    });

    await waitFor(() => {
      expect(screen.getByText('Backend CV EN')).toBeInTheDocument();
    });
  });

  it('bloquea archivos demasiado grandes antes del upload', async () => {
    globalThis.fetch.mockResolvedValue(
      new Response(
        JSON.stringify({
          data: [],
        }),
      ),
    );

    renderPage();

    const fileInput = screen.getByLabelText(/archivo del cv/i);
    const file = new File([new Uint8Array(5 * 1024 * 1024 + 1)], 'big-resume.pdf', {
      type: 'application/pdf',
    });

    fireEvent.change(fileInput, {
      target: { files: [file] },
    });

    await waitFor(() => {
      expect(screen.getByText(/el archivo supera el tamano maximo permitido de 5 MB/i)).toBeInTheDocument();
    });

    expect(globalThis.fetch).toHaveBeenCalledTimes(1);
  });

  it('bloquea formatos invalidos antes del upload', async () => {
    globalThis.fetch.mockResolvedValue(
      new Response(
        JSON.stringify({
          data: [],
        }),
      ),
    );

    renderPage();

    const fileInput = screen.getByLabelText(/archivo del cv/i);
    const file = new File(['resume'], 'backend-cv.txt', {
      type: 'text/plain',
    });

    fireEvent.change(fileInput, {
      target: { files: [file] },
    });

    await waitFor(() => {
      expect(screen.getByText(/formato no permitido/i)).toBeInTheDocument();
    });

    expect(globalThis.fetch).toHaveBeenCalledTimes(1);
  });

  it('muestra error entendible si el backend falla al cargar', async () => {
    globalThis.fetch.mockImplementation((url, options = {}) => {
      if (String(url).includes('/resumes') && (!options.method || options.method === 'GET')) {
        return Promise.resolve(
          new Response(
            JSON.stringify({
              data: [],
            }),
          ),
        );
      }

      if (String(url).includes('/resumes') && options.method === 'POST') {
        return Promise.resolve(
          new Response(
            JSON.stringify({
              message: 'No se pudo guardar el CV.',
            }),
            { status: 500 },
          ),
        );
      }

      throw new Error(`URL inesperada: ${url}`);
    });

    renderPage();

    const fileInput = screen.getByLabelText(/archivo del cv/i);
    const file = new File(['resume'], 'backend-cv-en.pdf', { type: 'application/pdf' });
    fireEvent.change(fileInput, {
      target: { files: [file] },
    });

    fireEvent.click(screen.getByRole('button', { name: /cargar cv/i }));

    await waitFor(() => {
      expect(screen.getByText(/no se pudo guardar el cv/i)).toBeInTheDocument();
    });
  });

  it('mantiene la seleccion de CV por vacante cuando ya existe', () => {
    render(
      <ResumeManagerPanel
        resumes={[
          {
            id: 'resume-1',
            label: 'Backend CV EN',
            originalFileName: 'backend-cv-en.pdf',
            sizeBytes: 1024,
            uploadedAt: '2026-08-12T11:00:00.000Z',
            attachmentStatus: 'MANUAL_REQUIRED',
          },
        ]}
        isLoading={false}
        error={null}
        selectedJob={{
          id: 'job-1',
          jobOffer: {
            title: 'Backend Developer',
            company: 'Acme Labs',
          },
          resumeSelection: {
            id: 'resume-1',
            label: 'Backend CV EN',
          },
        }}
        onUploadResume={vi.fn()}
        isUploading={false}
        uploadError={null}
        uploadSuccess={false}
        onAssignResume={vi.fn()}
        isAssigning={false}
        assignError={null}
      />,
    );

    expect(screen.getByText(/seleccionado para esta vacante/i)).toBeInTheDocument();
    expect(screen.getByText(/seleccion actual/i)).toBeInTheDocument();
  });
});
