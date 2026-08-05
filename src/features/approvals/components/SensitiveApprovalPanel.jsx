import { useMemo, useState } from 'react';
import { dashboardText } from '../../../constants/dashboardText.js';
import styles from './SensitiveApprovalPanel.module.css';

const approvalKinds = [
  'salaryExpectation',
  'englishLevel',
  'availability',
  'workAuthorization',
  'relocation',
  'travel',
];

export function SensitiveApprovalPanel({
  approvals,
  isLoading,
  error,
  filters,
  onFiltersChange,
  onApprove,
  onReject,
  pendingRequestId,
  pendingDecision,
}) {
  const text = dashboardText.sensitiveApprovals;
  const pending = approvals.filter((item) => item.status === 'PENDING');
  const history = approvals.filter((item) => item.status !== 'PENDING');

  return (
    <section className={styles.card}>
      <div className={styles.header}>
        <h2>{text.title}</h2>
        <p>{text.subtitle}</p>
      </div>

      <div className={styles.filters}>
        <strong>{text.filtersTitle}</strong>
        <div className={styles.filterGrid}>
          <label className={styles.field}>
            <span>{text.searchLabel}</span>
            <input
              value={filters.search}
              placeholder={text.searchPlaceholder}
              onChange={(event) => onFiltersChange({ search: event.target.value })}
            />
          </label>
          <label className={styles.field}>
            <span>{text.statusLabel}</span>
            <select value={filters.status} onChange={(event) => onFiltersChange({ status: event.target.value })}>
              <option value="">{text.allStatuses}</option>
              <option value="PENDING">PENDING</option>
              <option value="APPROVED">APPROVED</option>
              <option value="REJECTED">REJECTED</option>
            </select>
          </label>
          <label className={styles.field}>
            <span>{text.kindLabel}</span>
            <select
              value={filters.approvalKind}
              onChange={(event) => onFiltersChange({ approvalKind: event.target.value })}
            >
              <option value="">{text.allKinds}</option>
              {approvalKinds.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </label>
        </div>
      </div>

      {isLoading ? <p className={styles.message}>Cargando aprobaciones...</p> : null}
      {error ? <p className={styles.error}>{error.message}</p> : null}

      {!isLoading && !error ? (
        <>
          <ApprovalGroup
            title={text.pendingTitle}
            approvals={pending}
            emptyLabel={text.empty}
            onApprove={onApprove}
            onReject={onReject}
            pendingRequestId={pendingRequestId}
            pendingDecision={pendingDecision}
          />
          <ApprovalGroup
            title={text.historyTitle}
            approvals={history}
            emptyLabel={text.empty}
            onApprove={onApprove}
            onReject={onReject}
            pendingRequestId={pendingRequestId}
            pendingDecision={pendingDecision}
            readOnly
          />
        </>
      ) : null}
    </section>
  );
}

function ApprovalGroup({
  title,
  approvals,
  emptyLabel,
  onApprove,
  onReject,
  pendingRequestId,
  pendingDecision,
  readOnly = false,
}) {
  const text = dashboardText.sensitiveApprovals;
  const [notesById, setNotesById] = useState({});
  const noteValues = useMemo(() => notesById, [notesById]);

  function setNote(id, note) {
    setNotesById((current) => ({
      ...current,
      [id]: note,
    }));
  }

  return (
    <section className={styles.group}>
      <h3>{title}</h3>
      {approvals.length ? (
        <div className={styles.list}>
          {approvals.map((item) => {
            const isApproving = pendingRequestId === item.id && pendingDecision === 'approve';
            const isRejecting = pendingRequestId === item.id && pendingDecision === 'reject';
            const isPendingAction = isApproving || isRejecting;
            const note = noteValues[item.id] ?? '';

            return (
              <article key={item.id} className={styles.approvalCard}>
                <div className={styles.meta}>
                  <strong>{item.payload.jobTitle}</strong>
                  <span>{item.payload.company}</span>
                  <span>{item.approvalKind}</span>
                  <span className={`${styles.badge} ${styles[mapTone(item.status)]}`}>{item.status}</span>
                </div>
                <p className={styles.reason}>{item.payload.reason}</p>
                {readOnly ? (
                  item.payload.note ? <p className={styles.note}>Nota: {item.payload.note}</p> : null
                ) : (
                  <label className={styles.field}>
                    <span>{text.reviewerNoteLabel}</span>
                    <textarea
                      rows="3"
                      value={note}
                      placeholder={text.reviewerNotePlaceholder}
                      onChange={(event) => setNote(item.id, event.target.value)}
                    />
                  </label>
                )}
                {!readOnly ? (
                  <div className={styles.actions}>
                    <button type="button" onClick={() => onApprove(item, note)} disabled={isPendingAction}>
                      {isApproving ? text.approveBusy : text.approveAction}
                    </button>
                    <button
                      type="button"
                      className={styles.secondaryButton}
                      onClick={() => onReject(item, note)}
                      disabled={isPendingAction}
                    >
                      {isRejecting ? text.rejectBusy : text.rejectAction}
                    </button>
                  </div>
                ) : null}
              </article>
            );
          })}
        </div>
      ) : (
        <p className={styles.message}>{emptyLabel}</p>
      )}
    </section>
  );
}

function mapTone(status) {
  if (status === 'APPROVED') {
    return 'good';
  }
  if (status === 'REJECTED') {
    return 'bad';
  }
  return 'warn';
}
