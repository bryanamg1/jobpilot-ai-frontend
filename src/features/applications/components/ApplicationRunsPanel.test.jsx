import '@testing-library/jest-dom/vitest';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { ApplicationRunsPanel } from './ApplicationRunsPanel.jsx';

describe('ApplicationRunsPanel', () => {
  it('renders recent applications and agent runs', () => {
    render(
      <ApplicationRunsPanel
        applications={[
          {
            id: 'application-1',
            status: 'COMPLETED',
            metadata: {
              jobTitle: 'Backend Developer',
              company: 'Acme Labs',
              result: 'COMPLETED',
              timeline: [{ status: 'DISCOVERED' }, { status: 'COMPLETED' }],
              sourceType: 'MANUAL',
            },
          },
        ]}
        agentRuns={[
          {
            id: 'run-1',
            status: 'COMPLETED',
            startedAt: '2026-08-07T13:30:00.000Z',
            metadata: {
              mode: 'DRY_RUN',
              reason: 'Dashboard manual trigger',
              summary: { total: 1, completed: 1, awaitingApproval: 0, blockedByConfiguration: 0, duplicates: 0, failed: 0 },
            },
          },
        ]}
      />,
    );

    expect(screen.getByText(/backend developer/i)).toBeInTheDocument();
    expect(screen.getAllByText(/completada/i).length).toBeGreaterThan(0);
    expect(screen.getByText(/ejecucion manual desde el dashboard/i)).toBeInTheDocument();
    expect(screen.getByText(/vacantes procesadas:/i)).toBeInTheDocument();
    expect(screen.getAllByText(/simulacion segura \(sin enviar\)/i).length).toBeGreaterThan(0);
  });
});

