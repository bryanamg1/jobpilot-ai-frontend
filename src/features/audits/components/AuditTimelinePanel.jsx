import { dashboardText } from '../../../constants/dashboardText.js';
import { ErrorNotice } from '../../../shared/components/ErrorNotice.jsx';
import styles from './AuditTimelinePanel.module.css';

export function AuditTimelinePanel({ events, isLoading, error, selectedJob }) {
  const text = dashboardText.audit;

  return (
    <section className={styles.card}>
      <div className={styles.header}>
        <h2>{text.title}</h2>
        <p>{text.subtitle}</p>
      </div>

      <div className={styles.context}>
        <strong>{selectedJob ? text.jobTitle : text.globalTitle}</strong>
        {selectedJob ? <span>{`${selectedJob.jobOffer.title} - ${selectedJob.jobOffer.company}`}</span> : null}
      </div>

      {isLoading ? <p className={styles.message}>Cargando timeline...</p> : null}
      {error ? <ErrorNotice error={error} /> : null}

      {!isLoading && !error ? (
        events.length ? (
          <div className={styles.timeline}>
            {events.map((event) => (
              <article key={event.id} className={styles.eventCard}>
                <div className={styles.eventHeader}>
                  <strong>{formatEventName(event.eventName)}</strong>
                  <span>{formatDate(event.createdAt)}</span>
                </div>
                <p className={styles.meta}>
                  {text.entityLabel}: {event.entityType} / {event.entityId}
                </p>
                <p className={styles.meta}>
                  {text.eventLabel}: {event.eventName}
                </p>
                {event.payload && Object.keys(event.payload).length ? (
                  <details className={styles.payload}>
                    <summary>{text.payloadTitle}</summary>
                    <pre>{JSON.stringify(event.payload, null, 2)}</pre>
                  </details>
                ) : null}
              </article>
            ))}
          </div>
        ) : (
          <p className={styles.message}>{text.empty}</p>
        )
      ) : null}
    </section>
  );
}

function formatEventName(value) {
  return String(value)
    .replaceAll('.', ' / ')
    .replaceAll('_', ' ')
    .trim();
}

function formatDate(value) {
  return new Intl.DateTimeFormat('es-AR', {
    dateStyle: 'short',
    timeStyle: 'short',
  }).format(new Date(value));
}
