import { dashboardText } from '../../../constants/dashboardText.js';
import { ErrorNotice } from '../../../shared/components/ErrorNotice.jsx';
import styles from './GmailIntegrationPanel.module.css';

export function GmailIntegrationPanel({
  status,
  isLoading,
  error,
  actionError,
  onConnect,
  onDisconnect,
  isConnecting,
  isDisconnecting,
}) {
  const gmailText = dashboardText.gmail;

  if (isLoading) {
    return <section className={styles.panel}>{gmailText.statusLoading}</section>;
  }

  if (error) {
    return (
      <section className={styles.panel}>
        <ErrorNotice error={error} />
      </section>
    );
  }

  if (!status?.configured) {
    return (
      <section className={styles.panel}>
        <div className={styles.header}>
          <div>
            <p className={styles.eyebrow}>{gmailText.workspaceEyebrow}</p>
            <h2>{gmailText.title}</h2>
          </div>
          <span className={`${styles.badge} ${styles.warn}`}>{gmailText.notConfigured}</span>
        </div>

        <div className={styles.section}>
          <p>{gmailText.notConfiguredDescription}</p>
          <p>{gmailText.notConfiguredHelp}</p>
        </div>
      </section>
    );
  }

  return (
    <section className={styles.panel}>
      <div className={styles.header}>
        <div>
          <p className={styles.eyebrow}>{gmailText.workspaceEyebrow}</p>
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
          <strong>{gmailText.emailLabel}:</strong> {status?.emailAddress || dashboardText.common.notAvailable}
        </p>
        <p>
          <strong>{gmailText.labelLabel}:</strong> {status?.labelName || 'Postulaciones/Por revisar'}
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

      {actionError ? <ErrorNotice error={actionError} /> : null}
    </section>
  );
}
