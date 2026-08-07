import { useState } from 'react';
import { ApplicationRunsPanel } from '../../applications/components/ApplicationRunsPanel.jsx';
import { AutomationControlPanel } from '../../automation/components/AutomationControlPanel.jsx';
import { useTriggerAutomationRun } from '../../automation/hooks/useTriggerAutomationRun.js';
import { useUpdateAutomationSettings } from '../../automation/hooks/useUpdateAutomationSettings.js';
import { AnswerLibraryPanel } from '../../answers/components/AnswerLibraryPanel.jsx';
import { SensitiveApprovalPanel } from '../../approvals/components/SensitiveApprovalPanel.jsx';
import { useApprovalsQuery } from '../../approvals/hooks/useApprovalsQuery.js';
import { useResolveSensitiveApproval } from '../../approvals/hooks/useResolveSensitiveApproval.js';
import { AuditTimelinePanel } from '../../audits/components/AuditTimelinePanel.jsx';
import { useAuditEventsQuery } from '../../audits/hooks/useAuditEventsQuery.js';
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
import {
  circuitStateMeta,
  getLabel,
  healthStatusMeta,
  integrationStatusMeta,
  queueModeMeta,
  storageModeMeta,
} from '../../../constants/statusMeta.js';
import { AppShell } from '../../../shared/components/AppShell.jsx';
import { GmailAlertsPanel } from '../../gmail/components/GmailAlertsPanel.jsx';
import { GmailIntegrationPanel } from '../../gmail/components/GmailIntegrationPanel.jsx';
import { ApprovalQueuePanel } from '../../jobs/components/ApprovalQueuePanel.jsx';
import { useConnectGmail } from '../../gmail/hooks/useConnectGmail.js';
import { useCreateGmailDraft } from '../../gmail/hooks/useCreateGmailDraft.js';
import { useDisconnectGmail } from '../../gmail/hooks/useDisconnectGmail.js';
import { useGmailAlertsQuery } from '../../gmail/hooks/useGmailAlertsQuery.js';
import { useGmailStatusQuery } from '../../gmail/hooks/useGmailStatusQuery.js';
import { DraftPreviewPanel } from '../../jobs/components/DraftPreviewPanel.jsx';
import { JobOfferList } from '../../jobs/components/JobOfferList.jsx';
import { ManualJobForm } from '../../jobs/components/ManualJobForm.jsx';
import { useCreateDraftPreview } from '../../jobs/hooks/useCreateDraftPreview.js';
import { useJobsQuery } from '../../jobs/hooks/useJobsQuery.js';
import { useRunJobDryRun } from '../../jobs/hooks/useRunJobDryRun.js';
import { useReviewJobDecision } from '../../jobs/hooks/useReviewJobDecision.js';
import { ProfileEditor } from '../../profile/components/ProfileEditor.jsx';
import { useProfileQuery } from '../../profile/hooks/useProfileQuery.js';
import { ResumeManagerPanel } from '../../resumes/components/ResumeManagerPanel.jsx';
import { useAssignResumeToJob } from '../../resumes/hooks/useAssignResumeToJob.js';
import { useResumesQuery } from '../../resumes/hooks/useResumesQuery.js';
import { useUploadResume } from '../../resumes/hooks/useUploadResume.js';
import { useDashboardQuery } from '../hooks/useDashboardQuery.js';
import { useHealthQuery } from '../hooks/useHealthQuery.js';
import styles from './DashboardPage.module.css';

export function DashboardPage() {
  const [selectedPreviewJobId, setSelectedPreviewJobId] = useState(null);
  const [reviewState, setReviewState] = useState({ jobId: null, decision: null });
  const [browserActionState, setBrowserActionState] = useState({ sessionId: null, kind: null });
  const [approvalDecisionState, setApprovalDecisionState] = useState({
    requestId: null,
    decision: null,
  });
  const [approvalFilters, setApprovalFilters] = useState({
    status: '',
    approvalKind: '',
    search: '',
  });
  const dashboardQuery = useDashboardQuery();
  const healthQuery = useHealthQuery();
  const jobsQuery = useJobsQuery();
  const profileQuery = useProfileQuery();
  const resumesQuery = useResumesQuery();
  const approvalsQuery = useApprovalsQuery(approvalFilters);
  const browserSessionsQuery = useBrowserSessionsQuery();
  const draftPreviewMutation = useCreateDraftPreview();
  const auditEventsQuery = useAuditEventsQuery({
    entityType: selectedPreviewJobId ? 'job_offer' : undefined,
    entityId: selectedPreviewJobId || undefined,
    limit: selectedPreviewJobId ? 25 : 12,
  });
  const reviewDecisionMutation = useReviewJobDecision();
  const resolveSensitiveApprovalMutation = useResolveSensitiveApproval();
  const startBrowserSessionMutation = useBrowserSessionMutation(startBrowserSession);
  const refreshBrowserSessionMutation = useBrowserSessionMutation(refreshBrowserSession);
  const navigateBrowserSessionMutation = useBrowserSessionMutation(navigateBrowserSession);
  const captureBrowserSessionJobMutation = useBrowserSessionMutation(captureBrowserSessionJob, {
    invalidateJobs: true,
  });
  const closeBrowserSessionMutation = useBrowserSessionMutation(closeBrowserSession);
  const uploadResumeMutation = useUploadResume();
  const assignResumeMutation = useAssignResumeToJob();
  const gmailStatusQuery = useGmailStatusQuery();
  const gmailAlertsQuery = useGmailAlertsQuery(Boolean(gmailStatusQuery.data?.connected));
  const connectGmailMutation = useConnectGmail();
  const disconnectGmailMutation = useDisconnectGmail();
  const createGmailDraftMutation = useCreateGmailDraft();
  const updateAutomationSettingsMutation = useUpdateAutomationSettings();
  const triggerAutomationRunMutation = useTriggerAutomationRun();
  const runJobDryRunMutation = useRunJobDryRun();

  const summary = dashboardQuery.data || {
    storageMode: 'memory',
    metrics: { total: 0, readyToPrepare: 0, awaitingApproval: 0, blocked: 0 },
    latest: [],
  };
  const jobs = jobsQuery.data || [];
  const resumes = resumesQuery.data || [];
  const approvals = approvalsQuery.data || [];
  const browserSessions = browserSessionsQuery.data || [];
  const automationSettings = summary.automation?.settings ?? null;
  const recentApplications = summary.applications ?? [];
  const recentAgentRuns = summary.agentRuns ?? [];
  const approvalJobs = jobs.filter((job) => job.match.status === 'AWAITING_APPROVAL');
  const selectedPreviewJob = jobs.find((job) => job.id === selectedPreviewJobId) ?? null;

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
        onSuccess: () => {
          setReviewState({ jobId: null, decision: null });
        },
        onError: () => {
          setReviewState({ jobId: null, decision: null });
        },
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
        onError: () => {
          setReviewState({ jobId: null, decision: null });
        },
      },
    );
  }

  function handleUploadResume(payload) {
    return uploadResumeMutation.mutateAsync(payload);
  }

  function handleAssignResume({ jobId, resumeId }) {
    assignResumeMutation.mutate(
      { jobId, resumeId },
      {
        onSuccess: () => {
          if (selectedPreviewJobId === jobId) {
            draftPreviewMutation.mutate(jobId);
          }
        },
      },
    );
  }

  function handleResolveSensitiveApproval(item, decision, noteInput) {
    const note =
      noteInput.trim() ||
      (decision === 'approve'
        ? dashboardText.sensitiveApprovals.approveNote
        : dashboardText.sensitiveApprovals.rejectNote);

    setApprovalDecisionState({ requestId: item.id, decision });
    resolveSensitiveApprovalMutation.mutate(
      {
        decision,
        requestId: item.id,
        note,
      },
      {
        onSuccess: () => {
          if (selectedPreviewJobId === item.entityId) {
            draftPreviewMutation.mutate(item.entityId);
          }
          setApprovalDecisionState({ requestId: null, decision: null });
        },
        onError: () => {
          setApprovalDecisionState({ requestId: null, decision: null });
        },
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

  const browserMutationError =
    startBrowserSessionMutation.error ||
    refreshBrowserSessionMutation.error ||
    navigateBrowserSessionMutation.error ||
    captureBrowserSessionJobMutation.error ||
    closeBrowserSessionMutation.error ||
    null;

  return (
    <AppShell
      eyebrow={dashboardText.shell.eyebrow}
      title={dashboardText.shell.title}
      subtitle={dashboardText.shell.subtitle}
    >
      <section className={styles.metricGrid}>
        <MetricCard label={dashboardText.metrics.total} value={summary.metrics.total} />
        <MetricCard label={dashboardText.metrics.ready} value={summary.metrics.readyToPrepare} />
        <MetricCard label={dashboardText.metrics.awaitingApproval} value={summary.metrics.awaitingApproval} />
        <MetricCard label={dashboardText.metrics.blocked} value={summary.metrics.blocked} />
        <MetricCard label={dashboardText.shell.storageLabel} value={getLabel(storageModeMeta, summary.storageMode, summary.storageMode)} />
      </section>

      <section className={styles.layout}>
        <div className={styles.left}>
          <ManualJobForm />
          <AutomationControlPanel
            key={automationSettings?.updatedAt ?? automationSettings?.version ?? 'automation-settings'}
            settings={automationSettings}
            onSave={(payload) => updateAutomationSettingsMutation.mutate(payload)}
            isSaving={updateAutomationSettingsMutation.isPending}
            saveError={updateAutomationSettingsMutation.error}
            saveSuccess={updateAutomationSettingsMutation.isSuccess}
            onTriggerRun={() => triggerAutomationRunMutation.mutate({ reason: dashboardText.common.dashboardManualTrigger })}
            isTriggering={triggerAutomationRunMutation.isPending}
            triggerError={triggerAutomationRunMutation.error}
            triggerResult={triggerAutomationRunMutation.data?.data ?? null}
          />
          <BrowserSessionsPanel
            sessions={browserSessions}
            isLoading={browserSessionsQuery.isLoading}
            error={browserSessionsQuery.error}
            onStartSession={handleStartBrowserSession}
            onRefreshSession={handleRefreshBrowserSession}
            onNavigateSession={handleNavigateBrowserSession}
            onCaptureJob={handleCaptureBrowserJob}
            onCloseSession={handleCloseBrowserSession}
            pendingAction={browserActionState}
          />
          <GmailIntegrationPanel
            status={gmailStatusQuery.data}
            isLoading={gmailStatusQuery.isLoading}
            error={gmailStatusQuery.error}
            onConnect={() => connectGmailMutation.mutate()}
            onDisconnect={() => disconnectGmailMutation.mutate()}
            isConnecting={connectGmailMutation.isPending}
            isDisconnecting={disconnectGmailMutation.isPending}
          />
          <GmailAlertsPanel
            alerts={gmailAlertsQuery.data}
            isLoading={gmailAlertsQuery.isLoading}
            error={gmailAlertsQuery.error}
            isConnected={Boolean(gmailStatusQuery.data?.connected)}
          />
          {profileQuery.isLoading ? <PanelMessage message={dashboardText.common.loadingProfile} /> : null}
          {profileQuery.isError ? <PanelMessage message={profileQuery.error.message} tone="error" /> : null}
          {profileQuery.data ? <ProfileEditor profile={profileQuery.data} /> : null}
          <ResumeManagerPanel
            resumes={resumes}
            isLoading={resumesQuery.isLoading}
            error={resumesQuery.error}
            selectedJob={selectedPreviewJob}
            onUploadResume={handleUploadResume}
            isUploading={uploadResumeMutation.isPending}
            uploadError={uploadResumeMutation.error}
            uploadSuccess={uploadResumeMutation.isSuccess}
            onAssignResume={handleAssignResume}
            isAssigning={assignResumeMutation.isPending}
            assignError={assignResumeMutation.error}
          />
          <SensitiveApprovalPanel
            approvals={approvals}
            isLoading={approvalsQuery.isLoading}
            error={approvalsQuery.error}
            filters={approvalFilters}
            onFiltersChange={(nextValues) =>
              setApprovalFilters((current) => ({
                ...current,
                ...nextValues,
              }))
            }
            onApprove={(item, note) => handleResolveSensitiveApproval(item, 'approve', note)}
            onReject={(item, note) => handleResolveSensitiveApproval(item, 'reject', note)}
            pendingRequestId={
              resolveSensitiveApprovalMutation.isPending ? approvalDecisionState.requestId : null
            }
            pendingDecision={
              resolveSensitiveApprovalMutation.isPending ? approvalDecisionState.decision : null
            }
          />
          <AnswerLibraryPanel />
        </div>
        <div className={styles.right}>
          <DraftPreviewPanel
            preview={draftPreviewMutation.data?.data ?? null}
            isLoading={draftPreviewMutation.isPending}
            error={draftPreviewMutation.error}
            gmailStatus={gmailStatusQuery.data}
            onCreateGmailDraft={(jobId) => createGmailDraftMutation.mutate(jobId)}
            onRunDryRun={(jobId) => runJobDryRunMutation.mutate(jobId)}
            isCreatingGmailDraft={createGmailDraftMutation.isPending}
            isRunningDryRun={runJobDryRunMutation.isPending}
            gmailDraftResult={createGmailDraftMutation.data?.data ?? null}
            gmailDraftError={createGmailDraftMutation.error}
            dryRunResult={runJobDryRunMutation.data?.data ?? null}
            dryRunError={runJobDryRunMutation.error}
          />
          <ApplicationRunsPanel applications={recentApplications} agentRuns={recentAgentRuns} />
          <OperationsPanel
            health={healthQuery.data ?? null}
            isLoading={healthQuery.isLoading}
            error={healthQuery.error}
          />
          <AuditTimelinePanel
            events={auditEventsQuery.data || []}
            isLoading={auditEventsQuery.isLoading}
            error={auditEventsQuery.error}
            selectedJob={selectedPreviewJob}
          />
          {browserMutationError ? <PanelMessage message={browserMutationError.message} tone="error" /> : null}
          {reviewDecisionMutation.isError ? (
            <PanelMessage message={reviewDecisionMutation.error.message} tone="error" />
          ) : null}
          {resolveSensitiveApprovalMutation.isError ? (
            <PanelMessage message={resolveSensitiveApprovalMutation.error.message} tone="error" />
          ) : null}
          {updateAutomationSettingsMutation.isError ? (
            <PanelMessage message={updateAutomationSettingsMutation.error.message} tone="error" />
          ) : null}
          {triggerAutomationRunMutation.isError ? (
            <PanelMessage message={triggerAutomationRunMutation.error.message} tone="error" />
          ) : null}
          {runJobDryRunMutation.isError ? (
            <PanelMessage message={runJobDryRunMutation.error.message} tone="error" />
          ) : null}
          {jobsQuery.isLoading ? <PanelMessage message={dashboardText.common.loadingApprovalQueue} /> : null}
          {jobsQuery.isError ? <PanelMessage message={jobsQuery.error.message} tone="error" /> : null}
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
          {dashboardQuery.isLoading ? <PanelMessage message={dashboardText.common.loadingJobs} /> : null}
          {dashboardQuery.isError ? <PanelMessage message={dashboardQuery.error.message} tone="error" /> : null}
          {!dashboardQuery.isLoading && !dashboardQuery.isError ? (
            <JobOfferList
              jobs={summary.latest}
              onPreviewRequest={handlePreviewRequest}
              previewLoadingJobId={draftPreviewMutation.isPending ? selectedPreviewJobId : null}
            />
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

function PanelMessage({ message, tone = 'neutral' }) {
  return <div className={`${styles.message} ${styles[tone]}`}>{message}</div>;
}

function OperationsPanel({ health, isLoading, error }) {
  const text = dashboardText.operations;

  if (isLoading) {
    return <PanelMessage message={dashboardText.common.loadingOperations} />;
  }

  if (error) {
    return <PanelMessage message={error.message} tone="error" />;
  }

  if (!health) {
    return <PanelMessage message={text.empty} />;
  }

  const circuitEntries = Object.entries(health.reliability?.circuits ?? {});

  return (
    <section className={styles.operationsPanel}>
      <div>
        <h2>{text.title}</h2>
        <p>{text.subtitle}</p>
      </div>

      <div className={styles.operationsGrid}>
        <article className={styles.operationsCard}>
          <span>{text.overallStatus}</span>
          <strong>{getLabel(healthStatusMeta, health.status, health.status ?? dashboardText.common.notAvailable)}</strong>
        </article>
        <article className={styles.operationsCard}>
          <span>{text.storageMode}</span>
          <strong>{getLabel(storageModeMeta, health.storageMode, health.storageMode ?? dashboardText.common.notAvailable)}</strong>
        </article>
        <article className={styles.operationsCard}>
          <span>{text.queueMode}</span>
          <strong>{getLabel(queueModeMeta, health.dependencies?.queue?.mode, dashboardText.common.notAvailable)}</strong>
        </article>
        <article className={styles.operationsCard}>
          <span>{text.queueStatus}</span>
          <strong>{getLabel(healthStatusMeta, health.dependencies?.queue?.status, dashboardText.common.notAvailable)}</strong>
        </article>
        <article className={styles.operationsCard}>
          <span>{text.gmailStatus}</span>
          <strong>{getLabel(integrationStatusMeta, health.integrations?.gmail?.status, dashboardText.common.notAvailable)}</strong>
        </article>
        <article className={styles.operationsCard}>
          <span>{text.openAiStatus}</span>
          <strong>{getLabel(integrationStatusMeta, health.integrations?.openai?.status, dashboardText.common.notAvailable)}</strong>
        </article>
        <article className={styles.operationsCard}>
          <span>{text.redisConfigured}</span>
          <strong>{health.runtime?.redisConfigured ? dashboardText.common.yes : dashboardText.common.no}</strong>
        </article>
        <article className={styles.operationsCard}>
          <span>{text.requestCorrelation}</span>
          <strong>{health.runtime?.requestCorrelation ? dashboardText.common.active : dashboardText.common.inactive}</strong>
        </article>
      </div>

      <div>
        <h3>{text.circuitTitle}</h3>
        <ul className={styles.operationsCircuitList}>
          {circuitEntries.map(([name, circuit]) => (
            <li key={name}>
              <strong>{name}</strong>: {getLabel(circuitStateMeta, circuit.state, circuit.state)}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
