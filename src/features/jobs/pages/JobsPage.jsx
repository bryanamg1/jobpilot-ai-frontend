import { useState } from 'react';
import { AuditTimelinePanel } from '../../audits/components/AuditTimelinePanel.jsx';
import { BrowserSessionsPanel } from '../../browserSessions/components/BrowserSessionsPanel.jsx';
import {
  captureBrowserSessionJob,
  closeBrowserSession,
  navigateBrowserSession,
  refreshBrowserSession,
  startBrowserSession,
} from '../../browserSessions/api/browserSessionsApi.js';
import { useBrowserSessionMutation } from '../../browserSessions/hooks/useBrowserSessionMutation.js';
import { useBrowserSessionsQuery } from '../../browserSessions/hooks/useBrowserSessionsQuery.js';
import { dashboardText } from '../../../constants/dashboardText.js';
import { ApiConnectionBanner } from '../../../shared/components/ApiConnectionBanner.jsx';
import { AppShell } from '../../../shared/components/AppShell.jsx';
import { ErrorNotice } from '../../../shared/components/ErrorNotice.jsx';
import { API_BASE_URL } from '../../../shared/lib/apiConfig.js';
import { useApiConnectionStatus } from '../../../shared/lib/useApiConnectionStatus.js';
import { useAuditEventsQuery } from '../../audits/hooks/useAuditEventsQuery.js';
import { useDashboardQuery } from '../../dashboard/hooks/useDashboardQuery.js';
import { useCreateGmailDraft } from '../../gmail/hooks/useCreateGmailDraft.js';
import { useGmailStatusQuery } from '../../gmail/hooks/useGmailStatusQuery.js';
import { ApprovalQueuePanel } from '../components/ApprovalQueuePanel.jsx';
import { DraftPreviewPanel } from '../components/DraftPreviewPanel.jsx';
import { JobOfferList } from '../components/JobOfferList.jsx';
import { ManualJobForm } from '../components/ManualJobForm.jsx';
import { useCreateDraftPreview } from '../hooks/useCreateDraftPreview.js';
import { useJobsQuery } from '../hooks/useJobsQuery.js';
import { useReviewJobDecision } from '../hooks/useReviewJobDecision.js';
import { useRunJobDryRun } from '../hooks/useRunJobDryRun.js';
import styles from './JobsPage.module.css';

export function JobsPage() {
  const [selectedPreviewJobId, setSelectedPreviewJobId] = useState(null);
  const [reviewState, setReviewState] = useState({ jobId: null, decision: null });
  const [browserActionState, setBrowserActionState] = useState({ sessionId: null, kind: null });
  const dashboardQuery = useDashboardQuery();
  const jobsQuery = useJobsQuery();
  const browserSessionsQuery = useBrowserSessionsQuery();
  const draftPreviewMutation = useCreateDraftPreview();
  const reviewDecisionMutation = useReviewJobDecision();
  const dryRunMutation = useRunJobDryRun();
  const gmailStatusQuery = useGmailStatusQuery();
  const createGmailDraftMutation = useCreateGmailDraft();
  const startBrowserSessionMutation = useBrowserSessionMutation(startBrowserSession);
  const refreshBrowserSessionMutation = useBrowserSessionMutation(refreshBrowserSession);
  const navigateBrowserSessionMutation = useBrowserSessionMutation(navigateBrowserSession);
  const captureBrowserSessionJobMutation = useBrowserSessionMutation(captureBrowserSessionJob, {
    invalidateJobs: true,
  });
  const closeBrowserSessionMutation = useBrowserSessionMutation(closeBrowserSession);
  const apiConnection = useApiConnectionStatus();
  const auditEventsQuery = useAuditEventsQuery({
    entityType: selectedPreviewJobId ? 'job_offer' : undefined,
    entityId: selectedPreviewJobId || undefined,
    limit: selectedPreviewJobId ? 25 : 12,
  });
  const isApiOffline = apiConnection.status === 'offline';
  const summary = dashboardQuery.data ?? null;
  const jobs = jobsQuery.data ?? [];
  const browserSessions = browserSessionsQuery.data ?? [];
  const approvalJobs = jobs.filter((job) => job.match.status === 'AWAITING_APPROVAL');
  const selectedPreviewJob = jobs.find((job) => job.id === selectedPreviewJobId) ?? null;
  const browserMutationError =
    startBrowserSessionMutation.error ||
    refreshBrowserSessionMutation.error ||
    navigateBrowserSessionMutation.error ||
    captureBrowserSessionJobMutation.error ||
    closeBrowserSessionMutation.error ||
    null;

  function refetchJobsWorkspace() {
    void Promise.all([
      dashboardQuery.refetch(),
      jobsQuery.refetch(),
      browserSessionsQuery.refetch(),
      gmailStatusQuery.refetch(),
      auditEventsQuery.refetch(),
    ]);
  }

  function handlePreviewRequest(jobId) {
    setSelectedPreviewJobId(jobId);
    draftPreviewMutation.mutate(jobId);
  }

  function handleApprove(job) {
    setReviewState({ jobId: job.id, decision: 'approve' });
    reviewDecisionMutation.mutate(
      {
        decision: 'approve',
        jobId: job.id,
        reason: dashboardText.approval.defaultReasonApprove,
      },
      {
        onSuccess: () => setReviewState({ jobId: null, decision: null }),
        onError: () => setReviewState({ jobId: null, decision: null }),
      },
    );
  }

  function handleReject(job) {
    setReviewState({ jobId: job.id, decision: 'reject' });
    reviewDecisionMutation.mutate(
      {
        decision: 'reject',
        jobId: job.id,
        reason: dashboardText.approval.defaultReasonReject,
      },
      {
        onSuccess: () => {
          if (selectedPreviewJobId === job.id) {
            setSelectedPreviewJobId(null);
          }
          setReviewState({ jobId: null, decision: null });
        },
        onError: () => setReviewState({ jobId: null, decision: null }),
      },
    );
  }

  function resetBrowserActionState() {
    setBrowserActionState({ sessionId: null, kind: null });
  }

  function handleStartBrowserSession(provider, startUrl) {
    setBrowserActionState({ sessionId: null, kind: 'start' });
    startBrowserSessionMutation.mutate(
      {
        provider,
        ...(startUrl ? { startUrl } : {}),
      },
      {
        onSuccess: resetBrowserActionState,
        onError: resetBrowserActionState,
      },
    );
  }

  function handleRefreshBrowserSession(sessionId) {
    setBrowserActionState({ sessionId, kind: 'refresh' });
    refreshBrowserSessionMutation.mutate(sessionId, {
      onSuccess: resetBrowserActionState,
      onError: resetBrowserActionState,
    });
  }

  function handleNavigateBrowserSession(sessionId, url) {
    setBrowserActionState({ sessionId, kind: 'navigate' });
    navigateBrowserSessionMutation.mutate(
      { sessionId, url },
      {
        onSuccess: resetBrowserActionState,
        onError: resetBrowserActionState,
      },
    );
  }

  function handleCaptureBrowserJob(sessionId) {
    setBrowserActionState({ sessionId, kind: 'capture' });
    captureBrowserSessionJobMutation.mutate(sessionId, {
      onSuccess: (response) => {
        const capturedJobId = response?.data?.job?.id;

        if (capturedJobId) {
          setSelectedPreviewJobId(capturedJobId);
          draftPreviewMutation.mutate(capturedJobId);
        }

        resetBrowserActionState();
      },
      onError: resetBrowserActionState,
    });
  }

  function handleCloseBrowserSession(sessionId) {
    setBrowserActionState({ sessionId, kind: 'close' });
    closeBrowserSessionMutation.mutate(sessionId, {
      onSuccess: resetBrowserActionState,
      onError: resetBrowserActionState,
    });
  }

  function handleOpenRemoteBrowser(sessionId) {
    window.open(`${API_BASE_URL}/browser-sessions/${sessionId}/remote-control`, '_blank', 'noopener,noreferrer');
  }

  return (
    <AppShell
      eyebrow={dashboardText.shell.eyebrow}
      title={dashboardText.jobsPage.title}
      subtitle={dashboardText.jobsPage.subtitle}
    >
      {isApiOffline ? (
        <ApiConnectionBanner
          apiBaseUrl={API_BASE_URL}
          lastCheckedAt={apiConnection.lastCheckedAt}
          onRetry={refetchJobsWorkspace}
        />
      ) : null}

      {summary ? (
        <section className={styles.metricGrid}>
          <MetricCard label={dashboardText.metrics.total} value={summary.metrics.total} />
          <MetricCard label={dashboardText.metrics.ready} value={summary.metrics.readyToPrepare} />
          <MetricCard label={dashboardText.metrics.awaitingApproval} value={summary.metrics.awaitingApproval} />
          <MetricCard label={dashboardText.metrics.blocked} value={summary.metrics.blocked} />
        </section>
      ) : dashboardQuery.isLoading ? (
        <PanelMessage message={dashboardText.common.loadingJobs} />
      ) : null}

      <section className={styles.layout}>
        <div className={styles.left}>
          <ManualJobForm />
          <BrowserSessionsPanel
            sessions={browserSessions}
            isLoading={browserSessionsQuery.isLoading}
            error={browserSessionsQuery.error}
            onStartSession={handleStartBrowserSession}
            onOpenRemoteBrowser={handleOpenRemoteBrowser}
            onRefreshSession={handleRefreshBrowserSession}
            onNavigateSession={handleNavigateBrowserSession}
            onCaptureJob={handleCaptureBrowserJob}
            onCloseSession={handleCloseBrowserSession}
            pendingAction={browserActionState}
          />
        </div>

        <div className={styles.right}>
          <DraftPreviewPanel
            preview={draftPreviewMutation.data?.data ?? null}
            isLoading={draftPreviewMutation.isPending}
            error={draftPreviewMutation.error}
            gmailStatus={gmailStatusQuery.data}
            onCreateGmailDraft={(jobId) => createGmailDraftMutation.mutate(jobId)}
            onRunDryRun={(jobId) => dryRunMutation.mutate(jobId)}
            isCreatingGmailDraft={createGmailDraftMutation.isPending}
            isRunningDryRun={dryRunMutation.isPending}
            gmailDraftResult={createGmailDraftMutation.data?.data ?? null}
            gmailDraftError={createGmailDraftMutation.error}
            dryRunResult={dryRunMutation.data?.data ?? null}
            dryRunError={dryRunMutation.error}
          />
          <AuditTimelinePanel
            events={auditEventsQuery.data ?? []}
            isLoading={auditEventsQuery.isLoading}
            error={auditEventsQuery.error}
            selectedJob={selectedPreviewJob}
          />
          {!jobsQuery.isLoading && !jobsQuery.isError ? (
            <ApprovalQueuePanel
              jobs={approvalJobs}
              onPreviewRequest={handlePreviewRequest}
              previewLoadingJobId={draftPreviewMutation.isPending ? selectedPreviewJobId : null}
              onApprove={handleApprove}
              onReject={handleReject}
              reviewPendingJobId={reviewDecisionMutation.isPending ? reviewState.jobId : null}
              reviewDecision={reviewDecisionMutation.isPending ? reviewState.decision : null}
            />
          ) : null}
          {!jobsQuery.isLoading && !jobsQuery.isError ? (
            <JobOfferList
              jobs={jobs}
              onPreviewRequest={handlePreviewRequest}
              previewLoadingJobId={draftPreviewMutation.isPending ? selectedPreviewJobId : null}
            />
          ) : null}
          {browserMutationError && !isApiOffline ? <ErrorNotice error={browserMutationError} /> : null}
          {reviewDecisionMutation.isError && !isApiOffline ? <ErrorNotice error={reviewDecisionMutation.error} /> : null}
          {jobsQuery.isError && !isApiOffline ? <ErrorNotice error={jobsQuery.error} onRetry={() => jobsQuery.refetch()} /> : null}
          {dashboardQuery.isError && !isApiOffline ? (
            <ErrorNotice error={dashboardQuery.error} onRetry={() => dashboardQuery.refetch()} />
          ) : null}
        </div>
      </section>
    </AppShell>
  );
}

function MetricCard({ label, value }) {
  return (
    <article className={styles.metricCard}>
      <span>{label}</span>
      <strong>{value}</strong>
    </article>
  );
}

function PanelMessage({ message }) {
  return <div className={styles.message}>{message}</div>;
}
