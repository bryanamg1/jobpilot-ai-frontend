import '@testing-library/jest-dom/vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { BrowserSessionsPanel } from './BrowserSessionsPanel.jsx';

function createProps(overrides = {}) {
  return {
    sessions: [],
    isLoading: false,
    error: null,
    onStartSession: vi.fn(),
    onOpenRemoteBrowser: vi.fn(),
    onRefreshSession: vi.fn(),
    onNavigateSession: vi.fn(),
    onCaptureJob: vi.fn(),
    onCloseSession: vi.fn(),
    pendingAction: { kind: 'idle', sessionId: null },
    ...overrides,
  };
}

describe('BrowserSessionsPanel', () => {
  it('muestra el estado de login requerido y permite verificar la sesion', () => {
    const props = createProps({
      sessions: [
        {
          id: 'session-1',
          provider: 'LINKEDIN_JOBS',
          status: 'ATTENTION_REQUIRED',
          metadata: {
            currentUrl: 'https://www.linkedin.com/jobs/',
            pageTitle: 'LinkedIn Jobs',
            runtimeAvailable: true,
            runtimeKind: 'browserless',
            requiresAttention: true,
            attentionReasons: ['LOGIN_REQUIRED'],
            hiringSignals: [],
            visibleEmails: [],
          },
        },
      ],
    });

    render(<BrowserSessionsPanel {...props} />);

    expect(screen.getByText('LinkedIn requiere iniciar sesion.')).toBeInTheDocument();
    expect(screen.getByText('Runtime: Browserless remoto')).toBeInTheDocument();
    expect(screen.getByText('Esta sesion corre en Browserless. Usa el navegador remoto para iniciar sesion manualmente y luego verifica el estado.')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Abrir navegador remoto' }));
    expect(props.onOpenRemoteBrowser).toHaveBeenCalledWith('session-1');

    fireEvent.click(screen.getByRole('button', { name: 'Ya inicie sesion - verificar' }));

    expect(props.onRefreshSession).toHaveBeenCalledWith('session-1');
  });
});
