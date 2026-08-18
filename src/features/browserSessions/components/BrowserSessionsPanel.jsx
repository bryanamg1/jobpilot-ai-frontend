import { useMemo, useState } from 'react';
import { dashboardText } from '../../../constants/dashboardText.js';
import { ErrorNotice } from '../../../shared/components/ErrorNotice.jsx';
import styles from './BrowserSessionsPanel.module.css';

export function BrowserSessionsPanel({
  sessions,
  isLoading,
  error,
  onStartSession,
  onRefreshSession,
  onNavigateSession,
  onCaptureJob,
  onCloseSession,
  pendingAction,
}) {
  const text = dashboardText.browserSessions;
  const [startUrl, setStartUrl] = useState('');
  const [provider, setProvider] = useState('LINKEDIN_JOBS');
  const [urlBySessionId, setUrlBySessionId] = useState({});

  const visibleSessions = useMemo(() => selectVisibleSessions(sessions || []), [sessions]);

  return (
    <section className={styles.card}>
      <div className={styles.header}>
        <h2>{text.title}</h2>
        <p>{text.subtitle}</p>
      </div>

      <div className={styles.startRow}>
        <div className={styles.startFields}>
          <label className={styles.field}>
            <span>{text.providerLabel}</span>
            <select value={provider} onChange={(event) => setProvider(event.target.value)}>
              {Object.entries(text.providers).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </label>
          <label className={styles.field}>
            <span>{text.navigateLabel}</span>
            <input
              value={startUrl}
              placeholder={text.navigatePlaceholder}
              onChange={(event) => setStartUrl(event.target.value)}
            />
          </label>
        </div>
        <button
          type="button"
          className={styles.startButton}
          onClick={() => onStartSession(provider, startUrl.trim() || undefined)}
          disabled={pendingAction.kind === 'start'}
        >
          {pendingAction.kind === 'start' ? text.startBusy : text.startIdle}
        </button>
      </div>
      <p className={styles.meta}>{text.providerHint}</p>

      {isLoading ? <p className={styles.message}>Cargando sesiones...</p> : null}
      {error ? <ErrorNotice error={error} /> : null}

      {!isLoading && !error ? (
        visibleSessions.length ? (
          <div className={styles.list}>
            {visibleSessions.map((session) => {
              const isRefreshing = pendingAction.kind === 'refresh' && pendingAction.sessionId === session.id;
              const isNavigating = pendingAction.kind === 'navigate' && pendingAction.sessionId === session.id;
              const isCapturing = pendingAction.kind === 'capture' && pendingAction.sessionId === session.id;
              const isClosing = pendingAction.kind === 'close' && pendingAction.sessionId === session.id;
              const requiresLogin = Boolean(session.metadata.attentionReasons?.includes('LOGIN_REQUIRED'));
              const localUrl = urlBySessionId[session.id] ?? session.metadata.currentUrl ?? '';

              return (
                <article key={session.id} className={styles.sessionCard}>
                  <div className={styles.sessionHeader}>
                    <strong>{text.providers[session.provider] ?? session.provider}</strong>
                    <span className={`${styles.badge} ${styles[mapTone(session.status)]}`}>{session.status}</span>
                  </div>

                  <p className={styles.meta}>{session.metadata.pageTitle || session.metadata.currentUrl}</p>
                  <p className={styles.meta}>{session.metadata.currentUrl}</p>
                  <p className={styles.meta}>
                    {text.runtimeLabel}: {resolveRuntimeLabel(session.metadata, text)}
                  </p>
                  <p className={styles.meta}>
                    {text.surfaceLabel}: {resolveSurfaceLabel(session.metadata, text)}
                  </p>

                  {session.metadata.reusedStoredSession ? (
                    <div className={styles.infoBox}>
                      <strong>{text.reusedStoredSession}</strong>
                      <p className={styles.meta}>{text.reusedStoredSessionDescription}</p>
                    </div>
                  ) : null}

                  {session.metadata.requiresAttention ? (
                    <div className={styles.attention}>
                      <strong>{requiresLogin ? text.loginRequiredTitle : text.attentionTitle}</strong>
                      {requiresLogin ? <p className={styles.meta}>{text.loginRequiredDescription}</p> : null}
                      <ul>
                        {(session.metadata.attentionReasons || []).map((item) => (
                          <li key={item}>{formatAttentionReason(item)}</li>
                        ))}
                      </ul>
                    </div>
                  ) : null}

                  {!session.metadata.runtimeAvailable ? <p className={styles.error}>{text.runtimeUnavailable}</p> : null}

                  <div className={styles.signalBlock}>
                    <strong>{text.hiringSignals}</strong>
                    <p className={styles.meta}>
                      {session.metadata.hiringSignals?.length
                        ? session.metadata.hiringSignals.join(', ')
                        : text.hiringSignalsEmpty}
                    </p>
                  </div>

                  <div className={styles.signalBlock}>
                    <strong>{text.visibleEmails}</strong>
                    <p className={styles.meta}>
                      {session.metadata.visibleEmails?.length
                        ? session.metadata.visibleEmails.join(', ')
                        : text.visibleEmailsEmpty}
                    </p>
                  </div>

                  {session.metadata.lastCapturedJobId ? (
                    <p className={styles.meta}>
                      {text.lastCaptured}: {session.metadata.lastCapturedJobId}
                    </p>
                  ) : null}

                  <label className={styles.field}>
                    <span>{text.navigateLabel}</span>
                    <input
                      value={localUrl}
                      placeholder={text.navigatePlaceholder}
                      onChange={(event) =>
                        setUrlBySessionId((current) => ({
                          ...current,
                          [session.id]: event.target.value,
                        }))
                      }
                    />
                  </label>

                  <div className={styles.actions}>
                    {requiresLogin ? (
                      <button
                        type="button"
                        className={styles.secondaryButton}
                        onClick={() => onRefreshSession(session.id)}
                        disabled={isRefreshing || !session.metadata.runtimeAvailable}
                      >
                        {isRefreshing ? text.verifyLoginBusy : text.verifyLoginIdle}
                      </button>
                    ) : null}
                    <button
                      type="button"
                      onClick={() => onNavigateSession(session.id, localUrl)}
                      disabled={isNavigating || !session.metadata.runtimeAvailable}
                    >
                      {isNavigating ? text.navigateBusy : text.navigateIdle}
                    </button>
                    <button
                      type="button"
                      onClick={() => onRefreshSession(session.id)}
                      disabled={isRefreshing || !session.metadata.runtimeAvailable}
                    >
                      {isRefreshing ? text.refreshBusy : text.refreshIdle}
                    </button>
                    <button
                      type="button"
                      onClick={() => onCaptureJob(session.id)}
                      disabled={isCapturing || !session.metadata.runtimeAvailable}
                    >
                      {isCapturing ? text.captureBusy : text.captureIdle}
                    </button>
                    <button
                      type="button"
                      className={styles.secondaryButton}
                      onClick={() => onCloseSession(session.id)}
                      disabled={isClosing}
                    >
                      {isClosing ? text.closeBusy : text.closeIdle}
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        ) : (
          <p className={styles.message}>{text.empty}</p>
        )
      ) : null}
    </section>
  );
}

function mapTone(status) {
  if (status === 'ACTIVE') {
    return 'good';
  }

  if (status === 'ATTENTION_REQUIRED') {
    return 'warn';
  }

  return 'bad';
}

function resolveSurfaceLabel(metadata = {}, text) {
  if (metadata.isJobView || metadata.isJobsSection) {
    return text.surfaces.jobs;
  }

  if (metadata.isPostSearchSection) {
    return text.surfaces.search;
  }

  if (metadata.isFeedSection) {
    return text.surfaces.feed;
  }

  if (metadata.isPostDetail) {
    return text.surfaces.post;
  }

  return text.surfaces.unknown;
}

function selectVisibleSessions(sessions) {
  const ordered = [...sessions]
    .filter((session) => session?.status !== 'CLOSED')
    .sort(compareSessionsDesc);

  if (!ordered.length) {
    return [];
  }

  return [ordered[0]];
}

function compareSessionsDesc(left, right) {
  const leftRuntime = left?.metadata?.runtimeAvailable ? 1 : 0;
  const rightRuntime = right?.metadata?.runtimeAvailable ? 1 : 0;

  if (leftRuntime !== rightRuntime) {
    return rightRuntime - leftRuntime;
  }

  const leftDate = Date.parse(left?.updatedAt ?? left?.startedAt ?? 0);
  const rightDate = Date.parse(right?.updatedAt ?? right?.startedAt ?? 0);

  return rightDate - leftDate;
}

function resolveRuntimeLabel(metadata = {}, text) {
  if (metadata.runtimeKind === 'desktop_agent') {
    return text.runtimeDesktopAgent;
  }

  if (metadata.runtimeKind === 'browserless') {
    return text.runtimeBrowserless;
  }

  return text.runtimeLocal;
}

function formatAttentionReason(value) {
  if (value === 'LOGIN_REQUIRED') {
    return 'LinkedIn solicita autenticacion manual.';
  }

  if (value === 'CAPTCHA_OR_CHALLENGE') {
    return 'LinkedIn requiere CAPTCHA, MFA o verificacion adicional.';
  }

  if (value === 'UNSUPPORTED_DOMAIN') {
    return 'La sesion no esta abierta sobre un dominio permitido de LinkedIn.';
  }

  return value;
}
