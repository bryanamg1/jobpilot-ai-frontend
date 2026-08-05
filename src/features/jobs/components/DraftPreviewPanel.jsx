import { dashboardText } from '../../../constants/dashboardText.js';
import styles from './DraftPreviewPanel.module.css';

export function DraftPreviewPanel({
  preview,
  isLoading,
  error,
  gmailStatus,
  onCreateGmailDraft,
  isCreatingGmailDraft,
  gmailDraftResult,
  gmailDraftError,
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
        <span className={`${styles.badge} ${styles[mapTone(preview.status)]}`}>{mapStatus(preview.status)}</span>
      </div>

      <div className={styles.metaGrid}>
        <InfoBlock label={draftText.recipient} value={preview.recipient || 'No visible'} />
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

      {gmailDraftResult ? (
        <section className={styles.section}>
          <h3>{draftText.gmailDraftSuccess}</h3>
          <p className={styles.empty}>{gmailDraftResult.subject}</p>
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
        emptyLabel="Sin aprobaciones pendientes."
      />
      <FactSection
        title={draftText.blocked}
        items={preview.blockedReasons}
        emptyLabel="Sin bloqueos activos."
      />
      <FactSection
        title={draftText.warnings}
        items={preview.generation.warnings}
        emptyLabel="Sin advertencias nuevas."
      />

      <section className={styles.section}>
        <h3>{draftText.facts}</h3>
        {preview.factsUsed.length ? (
          <ul className={styles.factList}>
            {preview.factsUsed.map((fact) => (
              <li key={`${fact.field}-${fact.value}-${fact.source}`}>
                <strong>{fact.field}</strong>: {fact.value} ({fact.certainty})
              </li>
            ))}
          </ul>
        ) : (
          <p className={styles.empty}>Sin hechos disponibles.</p>
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

function mapStatus(status) {
  if (status === 'READY') {
    return dashboardText.draft.statusReady;
  }
  if (status === 'REVIEW_REQUIRED') {
    return dashboardText.draft.statusReview;
  }
  return dashboardText.draft.statusBlocked;
}

function mapTone(status) {
  if (status === 'READY') {
    return 'good';
  }
  if (status === 'REVIEW_REQUIRED') {
    return 'warn';
  }
  return 'bad';
}
