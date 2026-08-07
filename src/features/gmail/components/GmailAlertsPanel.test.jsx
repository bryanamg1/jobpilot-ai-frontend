import '@testing-library/jest-dom/vitest';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { GmailAlertsPanel } from './GmailAlertsPanel.jsx';

describe('GmailAlertsPanel', () => {
  it('usa placeholders en espanol para mensajes incompletos', () => {
    render(
      <GmailAlertsPanel
        isConnected
        isLoading={false}
        error={null}
        alerts={{
          messages: [{ id: 'msg-1', subject: '', from: '', snippet: '' }],
        }}
      />,
    );

    expect(screen.getByText('Sin asunto')).toBeInTheDocument();
    expect(screen.getByText('Sin remitente')).toBeInTheDocument();
    expect(screen.getByText('Sin resumen visible')).toBeInTheDocument();
  });

  it('muestra ayuda en espanol cuando Gmail no esta conectado', () => {
    render(<GmailAlertsPanel isConnected={false} isLoading={false} error={null} alerts={{ messages: [] }} />);

    expect(screen.getByText(/Conecta Gmail para revisar alertas/i)).toBeInTheDocument();
  });
});
