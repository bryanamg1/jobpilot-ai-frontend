import { dashboardText } from '../../../constants/dashboardText.js';
import { JobOfferCard } from './JobOfferCard.jsx';
import styles from './ApprovalQueuePanel.module.css';

export function ApprovalQueuePanel({
  jobs,
  onPreviewRequest,
  previewLoadingJobId,
  onApprove,
  onReject,
  reviewPendingJobId,
  reviewDecision,
}) {
  return (
    <section className={styles.wrapper}>
      <div className={styles.header}>
        <h2>{dashboardText.approval.title}</h2>
        <p>{dashboardText.approval.subtitle}</p>
      </div>

      {jobs.length ? (
        <div className={styles.list}>
          {jobs.map((job) => (
            <JobOfferCard
              key={job.id}
              job={job}
              onPreviewRequest={onPreviewRequest}
              previewLoadingJobId={previewLoadingJobId}
              onApprove={onApprove}
              onReject={onReject}
              reviewPendingJobId={reviewPendingJobId}
              reviewDecision={reviewDecision}
            />
          ))}
        </div>
      ) : (
        <div className={styles.empty}>{dashboardText.approval.empty}</div>
      )}
    </section>
  );
}
