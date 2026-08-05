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
import { ResumeManagerPanel } from '../../resumes/components/ResumeManagerPanel.jsx';
import { useAssignResumeToJob } from '../../resumes/hooks/useAssignResumeToJob.js';
import { useResumesQuery } from '../../resumes/hooks/useResumesQuery.js';
import { useUploadResume } from '../../resumes/hooks/useUploadResume.js';
import { useDashboardQuery } from '../hooks/useDashboardQuery.js';
import styles from './DashboardPage.module.css';

export function DashboardPage() {
  const [selectedPreviewJobId, setSelectedPreviewJobId] = useState(null);
  const [reviewState, setReviewState] = useState({ jobId: null, decision: null });
  const dashboardQuery = useDashboardQuery();
  const jobsQuery = useJobsQuery();
  const profileQuery = useProfileQuery();
  const resumesQuery = useResumesQuery();
  const draftPreviewMutation = useCreateDraftPreview();
  const reviewDecisionMutation = useReviewJobDecision();
  const uploadResumeMutation = useUploadResume();
  const assignResumeMutation = useAssignResumeToJob();
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
  const resumes = resumesQuery.data || [];
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
