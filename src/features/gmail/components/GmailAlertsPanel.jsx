import { dashboardText } from '../../../constants/dashboardText.js';
import { ErrorNotice } from '../../../shared/components/ErrorNotice.jsx';
import styles from './GmailAlertsPanel.module.css';

export function GmailAlertsPanel({ alerts, isLoading, error, isConnected }) {
  const gmailText = dashboardText.gmail;
  const commonText = dashboardText.common;

  if (!isConnected) {
    return <section className={styles.panel}>{gmailText.alertsConnectHint}</section>;
  }

  if (isLoading) {
    return <section className={styles.panel}>{gmailText.alertsLoading}</section>;
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
      <h2>{gmailText.alertsTitle}</h2>
      {alerts?.messages?.length ? (
        <ul className={styles.list}>
          {alerts.messages.map((message) => (
            <li key={message.id} className={styles.item}>
              <strong>{message.subject || commonText.noSubject}</strong>
              <span>{message.from || commonText.noSender}</span>
              <p>{message.snippet || commonText.noSnippet}</p>
            </li>
          ))}
        </ul>
      ) : (
        <p className={styles.empty}>{gmailText.alertsEmpty}</p>
      )}
    </section>
  );
}
