import { dashboardText } from '../../constants/dashboardText.js';
import { normalizeAppError } from '../lib/normalizeAppError.js';
import styles from './ErrorNotice.module.css';

export function ErrorNotice({ error, onRetry = null, className = '' }) {
  const view = normalizeAppError(error, { onRetry });

  return (
    <section className={`${styles.notice} ${className}`.trim()} role="alert">
      <strong>{view.title}</strong>
      <p>{view.message}</p>
      {view.cause ? (
        <p>
          <span>Causa:</span> {view.cause}
        </p>
      ) : null}
      {view.action ? (
        <p>
          <span>Accion recomendada:</span> {view.action}
        </p>
      ) : null}
      {view.retryable && onRetry ? (
        <button type="button" onClick={onRetry}>
          {dashboardText.common.retry}
        </button>
      ) : null}
    </section>
  );
}
