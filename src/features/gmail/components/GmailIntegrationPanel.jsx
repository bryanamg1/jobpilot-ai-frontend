import { dashboardText } from '../../../constants/dashboardText.js';
import { ErrorNotice } from '../../../shared/components/ErrorNotice.jsx';
import styles from './GmailIntegrationPanel.module.css';

export function GmailIntegrationPanel({
  status,
  isLoading,
  error,
  onConnect,
  onDisconnect,
  isConnecting,
  isDisconnecting,
}) {
  const gmailText = dashboardText.gmail;

  if (isLoading) {
    return <section className={styles.panel}>{gmailText.connecting}</section>;
  }

  if (error) {
    return (
      <section className={styles.panel}>
        <ErrorNotice error={error} />
      </section>
    );
  }

  return (
    <section className={styles.panel}>
      <div className={styles.header}>
        <div>
          <p className={styles.eyebrow}>Google Workspace</p>
          <h2>{gmailText.title}</h2>
        </div>
        <span className={`${styles.badge} ${styles[status?.connected ? 'good' : 'warn']}`}>
          {status?.connected ? gmailText.connected : gmailText.disconnected}
        </span>
      </div>

      <div className={styles.section}>
        <p>{status?.draftLabelNote || gmailText.createLabelNote}</p>
        <p>{gmailText.attachmentNote}</p>
        <p>
          <strong>Email:</strong> {status?.emailAddress || 'No disponible'}
        </p>
        <p>
          <strong>Label:</strong> {status?.labelName || 'Postulaciones/Por revisar'}
        </p>
      </div>

      <div className={styles.actions}>
        {!status?.connected ? (
          <button type="button" className={styles.primaryButton} onClick={onConnect} disabled={isConnecting}>
            {isConnecting ? gmailText.connecting : gmailText.connect}
          </button>
        ) : (
          <button type="button" className={styles.secondaryButton} onClick={onDisconnect} disabled={isDisconnecting}>
            {isDisconnecting ? gmailText.connecting : gmailText.disconnect}
          </button>
        )}
      </div>
    </section>
  );
}
