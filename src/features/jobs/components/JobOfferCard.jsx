import { dashboardText } from '../../../constants/dashboardText.js';
import {
  getLabel,
  getMeta,
  guardrailFieldMeta,
  recommendationMeta,
  statusMeta,
} from '../../../constants/statusMeta.js';
import styles from './JobOfferCard.module.css';

export function JobOfferCard({
  job,
  onPreviewRequest,
  previewLoadingJobId,
  onApprove,
  onReject,
  reviewPendingJobId,
  reviewDecision,
}) {
  const status = getMeta(statusMeta, job.match.status, 'ANALYZED');
  const isPreviewLoading = previewLoadingJobId === job.id;
  const isApprovalLoading = reviewPendingJobId === job.id && reviewDecision === 'approve';
  const isRejectLoading = reviewPendingJobId === job.id && reviewDecision === 'reject';
  const isReviewBusy = isApprovalLoading || isRejectLoading;
  const canReview = typeof onApprove === 'function' && typeof onReject === 'function';

  return (
    <article className={styles.card}>
      <div className={styles.top}>
        <div>
          {job.jobOffer.company ? <p className={styles.company}>{job.jobOffer.company}</p> : null}
          <h3>{job.jobOffer.title}</h3>
        </div>
        <div className={styles.scoreBlock}>
          <strong>{job.match.score}</strong>
          <span>{recommendationMeta[job.match.recommendation] ?? job.match.recommendation}</span>
        </div>
      </div>

      <div className={styles.metaRow}>
        <span className={`${styles.badge} ${styles[status.tone]}`}>{status.label}</span>
        <span>{job.source.label}</span>
        <span>{job.source.originalUrl || dashboardText.common.noLink}</span>
      </div>

      <div className={styles.grid}>
        <InfoList title={dashboardText.list.matches} items={job.match.explanation.matches} tone="good" />
        <InfoList title={dashboardText.list.gaps} items={job.match.explanation.gaps} tone="bad" />
        <InfoList title={dashboardText.list.risks} items={job.match.explanation.risks} tone="warn" />
        <InfoList
          title={dashboardText.list.approvals}
          items={job.match.approvals.map((item) => `${getLabel(guardrailFieldMeta, item.field, item.field)}: ${item.reason}`)}
          tone="neutral"
        />
      </div>

      {job.match.excludedByRules.length ? (
        <div className={styles.blockedPanel}>
          <strong>{dashboardText.list.blocked}</strong>
          <ul>
            {job.match.excludedByRules.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
      ) : null}

      <div className={styles.actions}>
        <button
          type="button"
          className={styles.previewButton}
          onClick={() => onPreviewRequest(job.id)}
          disabled={isPreviewLoading || isReviewBusy}
        >
          {isPreviewLoading ? dashboardText.list.previewBusy : dashboardText.list.previewAction}
        </button>
        {canReview ? (
          <>
            <button
              type="button"
              className={styles.secondaryButton}
              onClick={() => onReject(job)}
              disabled={isReviewBusy}
            >
              {isRejectLoading ? dashboardText.approval.rejectBusy : dashboardText.approval.rejectAction}
            </button>
            <button
              type="button"
              className={styles.approveButton}
              onClick={() => onApprove(job)}
              disabled={isReviewBusy}
            >
              {isApprovalLoading ? dashboardText.approval.approveBusy : dashboardText.approval.approveAction}
            </button>
          </>
        ) : null}
      </div>
    </article>
  );
}

function InfoList({ title, items, tone }) {
  return (
    <section className={styles.section}>
      <h4>{title}</h4>
      {items.length ? (
        <ul className={styles[tone]}>
          {items.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      ) : (
        <p className={styles.empty}>{dashboardText.common.noNews}</p>
      )}
    </section>
  );
}
