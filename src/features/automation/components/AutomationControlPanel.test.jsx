import '@testing-library/jest-dom/vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { AutomationControlPanel } from './AutomationControlPanel.jsx';

describe('AutomationControlPanel', () => {
  it('builds a normalized automation payload before saving', () => {
    const onSave = vi.fn();

    render(
      <AutomationControlPanel
        settings={{
          enabled: true,
          mode: 'DRY_RUN',
          timezone: 'America/Argentina/Buenos_Aires',
          startTime: '09:00',
          dailyApplicationLimit: 5,
          dailyDiscoveryLimit: 20,
          minimumMatchScore: 75,
          requireHumanApproval: true,
          filters: {
            allowedSources: ['MANUAL'],
            allowedRoles: ['backend'],
            blockedCompanies: [],
            blockedKeywords: [],
          },
          sourcePolicies: {
            MANUAL: 'AUTO_PREPARE',
            LINKEDIN_JOBS_SUPERVISED: 'AUTO_PREPARE',
            LINKEDIN_FEED_SUPERVISED: 'AUTO_PREPARE',
            LINKEDIN_POST_SEARCH_SUPERVISED: 'AUTO_PREPARE',
          },
        }}
        onSave={onSave}
        isSaving={false}
        saveError={null}
        saveSuccess={false}
        onTriggerRun={() => {}}
        isTriggering={false}
        triggerError={null}
        triggerResult={null}
      />,
    );

    fireEvent.change(screen.getByLabelText(/roles habilitados/i), {
      target: { value: ' backend, full stack ' },
    });
    fireEvent.change(screen.getByLabelText(/palabras bloqueadas/i), {
      target: { value: 'wordpress, php ' },
    });
    fireEvent.click(screen.getByRole('button', { name: /guardar automatizacion/i }));

    expect(onSave).toHaveBeenCalledWith({
      enabled: true,
      mode: 'DRY_RUN',
      timezone: 'America/Argentina/Buenos_Aires',
      dailyApplicationLimit: 5,
      dailyDiscoveryLimit: 20,
      minimumMatchScore: 75,
      requireHumanApproval: true,
      unknownQuestionPolicy: 'PAUSE',
      captchaPolicy: 'PAUSE',
      mfaPolicy: 'PAUSE',
      salaryRequiresApproval: true,
      startTime: '09:00',
      daysOfWeek: [1, 2, 3, 4, 5],
      filters: {
        allowedSources: ['MANUAL'],
        allowedRoles: ['backend', 'full stack'],
        allowedSeniorities: ['junior', 'unknown'],
        allowedWorkModes: ['remote', 'hybrid', 'onsite'],
        blockedCompanies: [],
        blockedKeywords: ['wordpress', 'php'],
      },
      sourcePolicies: {
        MANUAL: 'AUTO_PREPARE',
        LINKEDIN_JOBS_SUPERVISED: 'AUTO_PREPARE',
        LINKEDIN_FEED_SUPERVISED: 'AUTO_PREPARE',
        LINKEDIN_POST_SEARCH_SUPERVISED: 'AUTO_PREPARE',
      },
    });
  });
});
