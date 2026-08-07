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
            metadata: {
              mode: 'DRY_RUN',
              reason: 'Ejecucion manual desde el dashboard',
              summary: { total: 1, completed: 1 },
            },
          },
        ]}
      />,
    );

    expect(screen.getByText(/backend developer/i)).toBeInTheDocument();
    expect(screen.getAllByText(/completada/i).length).toBeGreaterThan(0);
    expect(screen.getByText(/ejecucion manual desde el dashboard/i)).toBeInTheDocument();
    expect(screen.getByText(/Total: 1/i)).toBeInTheDocument();
  });
});

