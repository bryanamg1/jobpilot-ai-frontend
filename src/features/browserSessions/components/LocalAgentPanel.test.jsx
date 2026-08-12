import '@testing-library/jest-dom/vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { LocalAgentPanel } from './LocalAgentPanel.jsx';

describe('LocalAgentPanel', () => {
  it('muestra el estado del agente local y permite probar conexion', () => {
    const onRetry = vi.fn();
    const onRunBrowserTest = vi.fn();

    render(
      <LocalAgentPanel
        health={{
          runtime: {
            desktopAgent: {
              connected: true,
              lastHeartbeatAt: '2026-08-12T12:00:00.000Z',
              version: '1.0.0',
              os: 'Windows 11',
            },
          },
        }}
        isLoading={false}
        isStartingBrowserTest={false}
        onRetry={onRetry}
        onRunBrowserTest={onRunBrowserTest}
      />,
    );

    expect(screen.getByText('Conectado')).toBeInTheDocument();
    expect(screen.getByText('1.0.0')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Probar conexion' }));
    fireEvent.click(screen.getByRole('button', { name: 'Ejecutar prueba de navegador' }));

    expect(onRetry).toHaveBeenCalledTimes(1);
    expect(onRunBrowserTest).toHaveBeenCalledTimes(1);
  });
});
