import { dashboardText } from '../../../constants/dashboardText.js';
import {
  agentRunModeMeta,
  agentRunStatusMeta,
  applicationResultMeta,
  applicationStatusMeta,
  formatRunSummary,
  getLabel,
  getMeta,
  sourceTypeMeta,
} from '../../../constants/statusMeta.js';
import styles from './ApplicationRunsPanel.module.css';

export function ApplicationRunsPanel({ applications, agentRuns }) {
  const text = dashboardText.applications;

  return (
    <section className={styles.card}>
      <div className={styles.header}>
        <h2>{text.title}</h2>
        <p>{text.subtitle}</p>
      </div>

      <section className={styles.section}>
        <h3>{text.applicationsTitle}</h3>
        {applications.length ? (
          <div className={styles.list}>
            {applications.map((item) => (
              <article key={item.id} className={styles.item}>
                <div className={styles.row}>
                  <strong>{item.metadata?.jobTitle ?? item.jobOfferId}</strong>
                  <span>{getMeta(applicationStatusMeta, item.status).label}</span>
                </div>
                <p>{item.metadata?.company ?? dashboardText.common.noCompanyVisible}</p>
                <p>{text.resultLabel}: {getLabel(applicationResultMeta, item.metadata?.result, dashboardText.common.notAvailable)}</p>
                <p>{text.timelineLabel}: {item.metadata?.timeline?.length ?? 0}</p>
                <p>{text.sourceLabel}: {getLabel(sourceTypeMeta, item.metadata?.sourceType, 'Manual')}</p>
              </article>
            ))}
          </div>
        ) : (
          <p className={styles.empty}>{text.emptyApplications}</p>
        )}
      </section>

      <section className={styles.section}>
        <h3>{text.runsTitle}</h3>
        {agentRuns.length ? (
          <div className={styles.list}>
            {agentRuns.map((item) => (
              <article key={item.id} className={styles.item}>
                <div className={styles.row}>
                  <strong>{getMeta(agentRunStatusMeta, item.status).label}</strong>
                  <span>{getLabel(agentRunModeMeta, item.metadata?.mode, 'DRY_RUN')}</span>
                </div>
                <p>{item.metadata?.reason ?? dashboardText.common.noData}</p>
                <p>{text.summaryLabel}: {formatRunSummary(item.metadata?.summary)}</p>
              </article>
            ))}
          </div>
        ) : (
          <p className={styles.empty}>{text.emptyRuns}</p>
        )}
      </section>
    </section>
  );
}
