import { dashboardText } from '../../../constants/dashboardText.js';
import {
  agentRunModeMeta,
  agentRunStatusMeta,
  applicationResultMeta,
  applicationStatusMeta,
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
                  <span className={styles.badge}>{getMeta(applicationStatusMeta, item.status).label}</span>
                </div>
                <dl className={styles.metaList}>
                  <DataRow label="Empresa" value={item.metadata?.company ?? dashboardText.common.noCompanyVisible} />
                  <DataRow
                    label={text.resultLabel}
                    value={getLabel(applicationResultMeta, item.metadata?.result, dashboardText.common.notAvailable)}
                  />
                  <DataRow label={text.timelineLabel} value={String(item.metadata?.timeline?.length ?? 0)} />
                  <DataRow label={text.sourceLabel} value={getLabel(sourceTypeMeta, item.metadata?.sourceType, 'Manual')} />
                  <DataRow label={text.startedAtLabel} value={formatDateTime(item.createdAt)} />
                </dl>
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
                  <span className={styles.badge}>{getLabel(agentRunModeMeta, item.metadata?.mode, 'DRY_RUN')}</span>
                </div>
                <dl className={styles.metaList}>
                  <DataRow label={text.startedAtLabel} value={formatDateTime(item.startedAt)} />
                  <DataRow label={text.modeLabel} value={getLabel(agentRunModeMeta, item.metadata?.mode, 'DRY_RUN')} />
                  <DataRow label={text.sourceLabel} value={getLabel(sourceTypeMeta, item.sourceType, item.sourceType)} />
                  <DataRow label={text.durationLabel} value={formatDuration(item.startedAt, item.finishedAt)} />
                  <DataRow label={text.stopReasonLabel} value={translateLegacyRunText(item.metadata?.reason)} />
                </dl>
                <div className={styles.summaryBlock}>
                  <p className={styles.summaryTitle}>{text.summaryLabel}</p>
                  <ul className={styles.summaryList}>
                    {buildRunSummaryRows(item.metadata?.summary).map((row) => (
                      <li key={row.label}>
                        <strong>{row.label}:</strong> {row.value}
                      </li>
                    ))}
                  </ul>
                </div>
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

function DataRow({ label, value }) {
  return (
    <>
      <dt>{label}</dt>
      <dd>{value || dashboardText.common.notAvailable}</dd>
    </>
  );
}

function buildRunSummaryRows(summary) {
  if (!summary) {
    return [{ label: dashboardText.applications.summaryLabel, value: 'Sin resumen disponible.' }];
  }

  if (summary.reason) {
    return [{ label: dashboardText.applications.stopReasonLabel, value: translateLegacyRunText(summary.reason) }];
  }

  if (summary.error) {
    return [{ label: dashboardText.applications.failedLabel, value: summary.error }];
  }

  const rows = [
    { label: dashboardText.applications.processedLabel, value: summary.total ?? 0 },
    { label: dashboardText.applications.completedLabel, value: summary.completed ?? 0 },
    { label: dashboardText.applications.awaitingApprovalLabel, value: summary.awaitingApproval ?? 0 },
    {
      label: dashboardText.applications.blockedLabel,
      value: (summary.blockedByConfiguration ?? 0) + (summary.blockedByPolicy ?? 0) + (summary.rejectedByRules ?? 0),
    },
    { label: dashboardText.applications.duplicatesLabel, value: summary.duplicates ?? 0 },
    { label: dashboardText.applications.failedLabel, value: summary.failed ?? 0 },
  ];

  return rows;
}

function formatDateTime(value) {
  if (!value) {
    return dashboardText.common.notAvailable;
  }

  try {
    return new Intl.DateTimeFormat('es-AR', {
      dateStyle: 'short',
      timeStyle: 'short',
    }).format(new Date(value));
  } catch {
    return value;
  }
}

function translateLegacyRunText(value) {
  if (!value) {
    return dashboardText.common.noDataAvailable;
  }

  const replacements = new Map([
    ['Dashboard manual trigger', 'Ejecucion manual desde el dashboard'],
    ['Scheduled DRY_RUN cycle', 'Ciclo programado de simulacion segura'],
    ['Daily application limit already reached', 'Ya se alcanzo el limite diario de postulaciones.'],
    ['Automation is disabled', 'La automatizacion esta deshabilitada.'],
  ]);

  return replacements.get(value) ?? value;
}

function formatDuration(startedAt, finishedAt) {
  if (!startedAt || !finishedAt) {
    return dashboardText.common.notAvailable;
  }

  const durationMs = new Date(finishedAt).getTime() - new Date(startedAt).getTime();
  if (Number.isNaN(durationMs) || durationMs < 0) {
    return dashboardText.common.notAvailable;
  }

  if (durationMs < 1000) {
    return '< 1 s';
  }

  if (durationMs < 60_000) {
    return `${Math.round(durationMs / 1000)} s`;
  }

  const minutes = Math.floor(durationMs / 60_000);
  const seconds = Math.round((durationMs % 60_000) / 1000);
  return `${minutes} min ${seconds} s`;
}
