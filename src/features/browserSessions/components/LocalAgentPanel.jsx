import { dashboardText } from '../../../constants/dashboardText.js';
import styles from './LocalAgentPanel.module.css';

export function LocalAgentPanel({ health, isLoading, onRetry, onRunBrowserTest, isStartingBrowserTest }) {
  const text = dashboardText.localAgent;
  const desktopAgent = health?.runtime?.desktopAgent ?? null;
  const isConnected = Boolean(desktopAgent?.connected);

  return (
    <section className={styles.card}>
      <div className={styles.header}>
        <h2>{text.title}</h2>
        <p>{text.subtitle}</p>
      </div>

      <div className={styles.grid}>
        <InfoRow label={text.statusLabel} value={isConnected ? text.connected : text.disconnected} />
        <InfoRow label={text.lastHeartbeatLabel} value={desktopAgent?.lastHeartbeatAt ?? dashboardText.common.notAvailable} />
        <InfoRow label={text.versionLabel} value={desktopAgent?.version ?? dashboardText.common.notAvailable} />
        <InfoRow label={text.osLabel} value={desktopAgent?.os ?? dashboardText.common.notAvailable} />
      </div>

      <div className={styles.actions}>
        <button type="button" className={styles.secondaryButton} onClick={onRetry} disabled={isLoading}>
          {text.testConnectionIdle}
        </button>
        <button type="button" onClick={onRunBrowserTest} disabled={isStartingBrowserTest}>
          {isStartingBrowserTest ? text.browserTestBusy : text.browserTestIdle}
        </button>
      </div>
    </section>
  );
}

function InfoRow({ label, value }) {
  return (
    <div className={styles.row}>
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}
