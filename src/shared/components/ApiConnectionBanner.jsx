import { dashboardText } from '../../constants/dashboardText.js';
import styles from './ApiConnectionBanner.module.css';

export function ApiConnectionBanner({ apiBaseUrl, lastCheckedAt, onRetry = null }) {
  const text = dashboardText.common;

  return (
    <section className={styles.banner} aria-live="polite">
      <div className={styles.copy}>
        <strong>{text.apiOfflineTitle}</strong>
        <p>{text.apiOfflineDescription(apiBaseUrl)}</p>
        <p>{text.apiOfflineAction}</p>
        {lastCheckedAt ? <small>{text.apiOfflineCheckedAt(lastCheckedAt)}</small> : null}
      </div>
      {onRetry ? (
        <button type="button" className={styles.button} onClick={onRetry}>
          {text.retry}
        </button>
      ) : null}
    </section>
  );
}
