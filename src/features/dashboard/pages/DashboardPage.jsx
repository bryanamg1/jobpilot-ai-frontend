import { useState } from 'react';
import { dashboardText } from '../../../constants/dashboardText.js';
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
import { useReviewJobDecision } from '../../jobs/hooks/useReviewJobDecision.js';
import { ProfileEditor } from '../../profile/components/ProfileEditor.jsx';
import { useProfileQuery } from '../../profile/hooks/useProfileQuery.js';
import { useDashboardQuery } from '../hooks/useDashboardQuery.js';
import styles from './DashboardPage.module.css';

export function DashboardPage() {
  const [selectedPreviewJobId, setSelectedPreviewJobId] = useState(null);
  const [reviewState, setReviewState] = useState({ jobId: null, decision: null });
  const dashboardQuery = useDashboardQuery();
  const jobsQuery = useJobsQuery();
  const profileQuery = useProfileQuery();
  const draftPreviewMutation = useCreateDraftPreview();
  const reviewDecisionMutation = useReviewJobDecision();
  const gmailStatusQuery = useGmailStatusQuery();
  const gmailAlertsQuery = useGmailAlertsQuery(Boolean(gmailStatusQuery.data?.connected));
  const connectGmailMutation = useConnectGmail();
  const disconnectGmailMutation = useDisconnectGmail();
  const createGmailDraftMutation = useCreateGmailDraft();

  const summary = dashboardQuery.data || {
    storageMode: 'memory',
    metrics: { total: 0, readyToPrepare: 0, awaitingApproval: 0, blocked: 0 },
    latest: [],
  };
  const jobs = jobsQuery.data || [];
  const approvalJobs = jobs.filter((job) => job.match.status === 'AWAITING_APPROVAL');

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
        <MetricCard label={dashboardText.shell.storageLabel} value={summary.storageMode} />
      </section>

      <section className={styles.layout}>
        <div className={styles.left}>
          <ManualJobForm />
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
          {profileQuery.isLoading ? <PanelMessage message="Cargando perfil maestro..." /> : null}
          {profileQuery.isError ? <PanelMessage message={profileQuery.error.message} tone="error" /> : null}
          {profileQuery.data ? <ProfileEditor profile={profileQuery.data} /> : null}
        </div>
        <div className={styles.right}>
          <DraftPreviewPanel
            preview={draftPreviewMutation.data?.data ?? null}
            isLoading={draftPreviewMutation.isPending}
            error={draftPreviewMutation.error}
            gmailStatus={gmailStatusQuery.data}
            onCreateGmailDraft={(jobId) => createGmailDraftMutation.mutate(jobId)}
            isCreatingGmailDraft={createGmailDraftMutation.isPending}
            gmailDraftResult={createGmailDraftMutation.data?.data ?? null}
            gmailDraftError={createGmailDraftMutation.error}
          />
          {reviewDecisionMutation.isError ? (
            <PanelMessage message={reviewDecisionMutation.error.message} tone="error" />
          ) : null}
          {jobsQuery.isLoading ? <PanelMessage message="Cargando bandeja de aprobacion..." /> : null}
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
          {dashboardQuery.isLoading ? <PanelMessage message="Cargando vacantes..." /> : null}
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
