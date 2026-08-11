import '@testing-library/jest-dom/vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { AutomationControlPanel } from './AutomationControlPanel.jsx';

describe('AutomationControlPanel', () => {
  it('shows the safe simulation copy in Spanish and renders source policies in separate blocks', () => {
    render(
      <AutomationControlPanel
        settings={{
          enabled: true,
          mode: 'DRY_RUN',
          timezone: 'America/Argentina/Buenos_Aires',
          startTime: '09:00',
          dailyApplicationLimit: 5,
          dailyDiscoveryLimit: 25,
          minimumMatchScore: 75,
          requireHumanApproval: true,
          filters: {
            allowedSources: ['MANUAL'],
            allowedRoles: ['backend'],
            blockedCompanies: [],
            blockedKeywords: [],
          },
          sourcePolicies: {
            MANUAL: 'MANUAL_ONLY',
            LINKEDIN_JOBS_SUPERVISED: 'AUTO_PREPARE',
            LINKEDIN_FEED_SUPERVISED: 'AUTO_PREPARE',
            LINKEDIN_POST_SEARCH_SUPERVISED: 'AUTO_PREPARE',
          },
        }}
        onSave={vi.fn()}
        isSaving={false}
        saveError={null}
        saveSuccess={false}
        onTriggerRun={vi.fn()}
        isTriggering={false}
        triggerError={null}
        triggerResult={null}
      />,
    );

    expect(screen.getByRole('button', { name: /probar automatizacion sin enviar/i })).toBeInTheDocument();
    expect(screen.getByText(/usa tus vacantes, perfil y reglas reales/i)).toBeInTheDocument();
    expect(screen.getByText(/solo estan disponibles manual, asistido y simulacion segura/i)).toBeInTheDocument();
    expect(screen.getByText(/linkedin feed supervisado/i)).toBeInTheDocument();
    expect(screen.getByText(/linkedin post search supervisado/i)).toBeInTheDocument();
    expect(screen.queryByRole('option', { name: /automatico/i })).not.toBeInTheDocument();
  });

  it('submits the configured values through the save handler', () => {
    const onSave = vi.fn();

    const { container } = render(
      <AutomationControlPanel
        settings={null}
        onSave={onSave}
        isSaving={false}
        saveError={null}
        saveSuccess={false}
        onTriggerRun={vi.fn()}
        isTriggering={false}
        triggerError={null}
        triggerResult={null}
      />,
    );

    fireEvent.change(container.querySelectorAll('input[type="number"]')[0], {
      target: { value: '80' },
    });
    fireEvent.submit(container.querySelector('form'));

    expect(onSave).toHaveBeenCalledWith(
      expect.objectContaining({
        minimumMatchScore: 80,
        mode: 'DRY_RUN',
      }),
    );
  });
});
