import { dashboardText } from '../../../constants/dashboardText.js';
import {
  answerKindMeta,
  applicationResultMeta,
  applicationStatusMeta,
  approvalKindMeta,
  approvalStatusMeta,
  certaintyMeta,
  factFieldMeta,
  getLabel,
  getMeta,
  mapCertaintyToUsageStatus,
  previewStatusMeta,
  usageStatusMeta,
} from '../../../constants/statusMeta.js';
import styles from './DraftPreviewPanel.module.css';

export function DraftPreviewPanel({
  preview,
  isLoading,
  error,
  gmailStatus,
  onCreateGmailDraft,
  onRunDryRun,
  isCreatingGmailDraft,
  isRunningDryRun,
  gmailDraftResult,
  gmailDraftError,
  dryRunResult,
  dryRunError,
}) {
  const draftText = dashboardText.draft;

  if (isLoading) {
    return <section className={styles.panel}>{dashboardText.list.previewBusy}</section>;
  }

  if (error) {
    return <section className={`${styles.panel} ${styles.error}`}>{error.message}</section>;
  }

  if (!preview) {
    return <section className={styles.panel}>{draftText.empty}</section>;
  }

  return (
    <section className={styles.panel}>
      <div className={styles.header}>
        <div>
          <p className={styles.eyebrow}>{preview.company}</p>
          <h2>{draftText.title}</h2>
        </div>
        <span className={`${styles.badge} ${styles[getMeta(previewStatusMeta, preview.status, 'BLOCKED').tone]}`}>
          {getMeta(previewStatusMeta, preview.status, 'BLOCKED').label}
        </span>
      </div>

      <div className={styles.metaGrid}>
        <InfoBlock label={draftText.recipient} value={preview.recipient || dashboardText.common.noVisible} />
        <InfoBlock label={draftText.subject} value={preview.subject || draftText.blocked} />
        <InfoBlock
          label={draftText.selectedResume}
          value={
            preview.selectedResume
              ? `${preview.selectedResume.label} (${preview.selectedResume.originalFileName})`
              : draftText.selectedResumeEmpty
          }
        />
      </div>

      <section className={styles.section}>
        <h3>{draftText.body}</h3>
        <pre className={styles.body}>{preview.body || draftText.blocked}</pre>
      </section>

      <div className={styles.actions}>
        <button
          type="button"
          className={styles.primaryButton}
          onClick={() => onRunDryRun(preview.jobId)}
          disabled={isRunningDryRun || preview.status === 'BLOCKED'}
        >
          {isRunningDryRun ? draftText.dryRunBusy : draftText.dryRunIdle}
        </button>
        <button
          type="button"
          className={styles.primaryButton}
          onClick={() => onCreateGmailDraft(preview.jobId)}
          disabled={
            isCreatingGmailDraft ||
            !gmailStatus?.connected ||
            preview.status === 'BLOCKED' ||
            !preview.recipient
          }
        >
          {isCreatingGmailDraft ? draftText.gmailDraftBusy : draftText.gmailDraftIdle}
        </button>
        {!gmailStatus?.connected ? <p className={styles.helper}>{draftText.gmailDraftConnectHint}</p> : null}
      </div>

      {dryRunResult ? (
        <section className={styles.section}>
          <h3>{draftText.dryRunSuccess}</h3>
          <p className={styles.empty}>
            {`${getMeta(applicationStatusMeta, dryRunResult.status).label} - ${getLabel(applicationResultMeta, dryRunResult.metadata?.result, dashboardText.common.notAvailable)}`}
          </p>
        </section>
      ) : null}

      {dryRunError ? (
        <section className={`${styles.section} ${styles.error}`}>
          <h3>{draftText.warnings}</h3>
          <p className={styles.empty}>{dryRunError.message}</p>
        </section>
      ) : null}

      {gmailDraftResult ? (
        <section className={styles.section}>
          <h3>{draftText.gmailDraftSuccess}</h3>
          <p className={styles.empty}>{gmailDraftResult.subject}</p>
          <p className={styles.helper}>
            {gmailDraftResult.attachmentStatus === 'ATTACHED'
              ? draftText.gmailDraftAttachmentAttached
              : draftText.gmailDraftAttachmentManual}
          </p>
          {gmailDraftResult.attachedResume ? (
            <p className={styles.helper}>
              {`${gmailDraftResult.attachedResume.label} (${gmailDraftResult.attachedResume.originalFileName})`}
            </p>
          ) : null}
          <ul className={styles.list}>
            {gmailDraftResult.warnings.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </section>
      ) : null}

      {gmailDraftError ? (
        <section className={`${styles.section} ${styles.error}`}>
          <h3>{draftText.warnings}</h3>
          <p className={styles.empty}>{gmailDraftError.message}</p>
        </section>
      ) : null}

      <FactSection title={draftText.highlights} items={preview.highlights} />
      <FactSection
        title={draftText.approvals}
        items={preview.approvalsRequired}
        emptyLabel={dashboardText.common.noPendingApprovals}
      />
      <FactSection
        title={draftText.blocked}
        items={preview.blockedReasons}
        emptyLabel={dashboardText.common.noActiveBlocks}
      />
      <FactSection
        title={draftText.warnings}
        items={preview.generation.warnings}
        emptyLabel={dashboardText.common.noNewWarnings}
      />

      <section className={styles.section}>
        <h3>{draftText.suggestedAnswers}</h3>
        {preview.suggestedAnswers.length ? (
          <div className={styles.suggestionList}>
            {preview.suggestedAnswers.map((item) => (
              <article key={item.id} className={styles.suggestionCard}>
                <div className={styles.suggestionHeader}>
                  <strong>{item.question}</strong>
                  <span className={`${styles.badge} ${styles[getMeta(usageStatusMeta, item.usageStatus ?? mapCertaintyToUsageStatus(item.certainty)).tone]}`}>
                    {getMeta(usageStatusMeta, item.usageStatus ?? mapCertaintyToUsageStatus(item.certainty)).label}
                  </span>
                </div>
                <p className={styles.empty}>{item.answer}</p>
                <p className={styles.helper}>
                  {`${getLabel(answerKindMeta, item.kind, item.kind)} - ${getLabel(certaintyMeta, item.certainty, item.certainty)} - ${item.matchReason}`}
                </p>
                {item.approvalStatus ? (
                  <p className={styles.helper}>
                    {draftText.sensitiveApprovals}: {getMeta(approvalStatusMeta, item.approvalStatus).label}
                  </p>
                ) : null}
              </article>
            ))}
          </div>
        ) : (
          <p className={styles.empty}>{draftText.suggestedAnswersEmpty}</p>
        )}
      </section>

      <section className={styles.section}>
        <h3>{draftText.sensitiveApprovals}</h3>
        {preview.approvalRequests.length ? (
          <div className={styles.suggestionList}>
            {preview.approvalRequests.map((item) => (
              <article key={item.id} className={styles.suggestionCard}>
                <div className={styles.suggestionHeader}>
                  <strong>{getLabel(approvalKindMeta, item.approvalKind, item.approvalKind)}</strong>
                  <span className={`${styles.badge} ${styles[getMeta(approvalStatusMeta, item.status).tone]}`}>
                    {getMeta(approvalStatusMeta, item.status).label}
                  </span>
                </div>
                <p className={styles.empty}>{item.payload.reason}</p>
                {item.payload.note ? <p className={styles.helper}>{`${dashboardText.common.noteLabel}: ${item.payload.note}`}</p> : null}
              </article>
            ))}
          </div>
        ) : (
          <p className={styles.empty}>{draftText.sensitiveApprovalsEmpty}</p>
        )}
      </section>

      <section className={styles.section}>
        <h3>{draftText.facts}</h3>
        {preview.factsUsed.length ? (
          <ul className={styles.factList}>
            {preview.factsUsed.map((fact) => (
              <li key={`${fact.field}-${fact.value}-${fact.source}`}>
                <strong>{getLabel(factFieldMeta, fact.field, fact.field)}</strong>: {fact.value} ({getLabel(certaintyMeta, fact.certainty, fact.certainty)})
              </li>
            ))}
          </ul>
        ) : (
          <p className={styles.empty}>{dashboardText.common.noFacts}</p>
        )}
      </section>
    </section>
  );
}

function InfoBlock({ label, value }) {
  return (
    <div className={styles.infoBlock}>
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function FactSection({ title, items, emptyLabel = 'Sin novedades.' }) {
  return (
    <section className={styles.section}>
      <h3>{title}</h3>
      {items.length ? (
        <ul className={styles.list}>
          {items.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      ) : (
        <p className={styles.empty}>{emptyLabel}</p>
      )}
    </section>
  );
}

