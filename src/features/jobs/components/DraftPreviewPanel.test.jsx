import '@testing-library/jest-dom/vitest';
import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { DraftPreviewPanel } from './DraftPreviewPanel.jsx';

function createPreview(overrides = {}) {
  return {
    jobId: 'job-1',
    company: null,
    recipient: null,
    subject: 'Postulacion para Backend Developer - Bryan Marquez',
    body: 'A quien corresponda,\n\nMe interesa la oportunidad de Backend Developer.\n\nSaludos cordiales,',
    status: 'REVIEW_REQUIRED',
    selectedResume: null,
    highlights: ['Node.js', 'React'],
    approvalsRequired: [],
    blockedReasons: [],
    suggestedAnswers: [],
    approvalRequests: [],
    factsUsed: [
      {
        field: 'technology',
        value: 'JavaScript',
        certainty: 'CONFIRMED',
        source: 'candidate_profile',
      },
    ],
    generation: {
      warnings: [],
    },
    ...overrides,
  };
}

describe('DraftPreviewPanel', () => {
  it('no renderiza placeholders de empresa ni muestra la certeza interna en hechos', () => {
    render(
      <DraftPreviewPanel
        preview={createPreview()}
        isLoading={false}
        error={null}
        gmailStatus={{ connected: false }}
        onCreateGmailDraft={vi.fn()}
        onRunDryRun={vi.fn()}
        isCreatingGmailDraft={false}
        isRunningDryRun={false}
        gmailDraftResult={null}
        gmailDraftError={null}
        dryRunResult={null}
        dryRunError={null}
      />,
    );

    expect(screen.queryByText('Unknown company')).not.toBeInTheDocument();
    expect(screen.getByText(/JavaScript/)).toBeInTheDocument();
    expect(screen.queryByText(/\(CONFIRMED\)/)).not.toBeInTheDocument();
  });
});
