import { dashboardText } from '../../../constants/dashboardText.js';
import styles from './GmailAlertsPanel.module.css';

export function GmailAlertsPanel({ alerts, isLoading, error, isConnected }) {
  const gmailText = dashboardText.gmail;

  if (!isConnected) {
    return <section className={styles.panel}>{dashboardText.draft.gmailDraftConnectHint}</section>;
  }

  if (isLoading) {
    return <section className={styles.panel}>{gmailText.alertsLoading}</section>;
  }

  if (error) {
    return <section className={`${styles.panel} ${styles.error}`}>{error.message}</section>;
  }

  return (
    <section className={styles.panel}>
      <h2>{gmailText.alertsTitle}</h2>
      {alerts?.messages?.length ? (
        <ul className={styles.list}>
          {alerts.messages.map((message) => (
            <li key={message.id} className={styles.item}>
              <strong>{message.subject || 'Sin asunto'}</strong>
              <span>{message.from || 'Sin remitente'}</span>
              <p>{message.snippet || 'Sin preview'}</p>
            </li>
          ))}
        </ul>
      ) : (
        <p className={styles.empty}>{gmailText.alertsEmpty}</p>
      )}
    </section>
  );
}
