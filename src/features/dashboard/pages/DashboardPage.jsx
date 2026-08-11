import { Link } from 'react-router-dom';
import { ApplicationRunsPanel } from '../../applications/components/ApplicationRunsPanel.jsx';
import { dashboardText } from '../../../constants/dashboardText.js';
import {
  agentRunModeMeta,
  getLabel,
  getMeta,
  healthStatusMeta,
  integrationStatusMeta,
  sourceTypeMeta,
  statusMeta,
  storageModeMeta,
} from '../../../constants/statusMeta.js';
import { ApiConnectionBanner } from '../../../shared/components/ApiConnectionBanner.jsx';
import { AppShell } from '../../../shared/components/AppShell.jsx';
import { ErrorNotice } from '../../../shared/components/ErrorNotice.jsx';
import { API_BASE_URL } from '../../../shared/lib/apiConfig.js';
import { useApiConnectionStatus } from '../../../shared/lib/useApiConnectionStatus.js';
import { useDashboardQuery } from '../hooks/useDashboardQuery.js';
import { useHealthQuery } from '../hooks/useHealthQuery.js';
import styles from './DashboardPage.module.css';

export function DashboardPage() {
  const summary = useDashboardQuery();
  const health = useHealthQuery();
  const apiConnection = useApiConnectionStatus();
  const isApiOffline = apiConnection.status === 'offline';
  const dashboard = summary.data ?? null;
  const text = dashboardText.dashboardOverview;

  function refetchOverview() {
    void Promise.all([summary.refetch(), health.refetch()]);
  }

  return (
    <AppShell
      eyebrow={dashboardText.shell.eyebrow}
      title={text.title}
      subtitle={text.subtitle}
    >
      {isApiOffline ? (
        <ApiConnectionBanner
          apiBaseUrl={API_BASE_URL}
          lastCheckedAt={apiConnection.lastCheckedAt}
          onRetry={refetchOverview}
        />
      ) : null}

      {dashboard ? (
        <section className={styles.metricGrid}>
          <MetricCard label={dashboardText.metrics.total} value={dashboard.metrics.total} />
          <MetricCard label={dashboardText.metrics.ready} value={dashboard.metrics.readyToPrepare} />
          <MetricCard label={dashboardText.metrics.awaitingApproval} value={dashboard.metrics.awaitingApproval} />
          <MetricCard label={dashboardText.metrics.blocked} value={dashboard.metrics.blocked} />
          <MetricCard
            label={dashboardText.shell.storageLabel}
            value={getLabel(storageModeMeta, dashboard.storageMode, dashboard.storageMode)}
          />
        </section>
      ) : summary.isLoading ? (
        <PanelMessage message={dashboardText.common.loadingJobs} />
      ) : null}

      <section className={styles.layout}>
        <div className={styles.primaryColumn}>
          <QuickLinksPanel />
          <OperationsPanel
            health={health.data ?? null}
            isLoading={health.isLoading}
            error={!isApiOffline ? health.error : null}
          />
          <RecentJobsPanel jobs={dashboard?.latest ?? []} />
        </div>

        <div className={styles.secondaryColumn}>
          <AgentStatusPanel
            automation={dashboard?.automation ?? null}
            recentAgentRuns={dashboard?.agentRuns ?? []}
            recentApplications={dashboard?.applications ?? []}
          />
          <ApplicationRunsPanel
            applications={dashboard?.applications ?? []}
            agentRuns={dashboard?.agentRuns ?? []}
          />
        </div>
      </section>

      {summary.isError && !isApiOffline ? (
        <ErrorNotice error={summary.error} onRetry={() => summary.refetch()} />
      ) : null}
    </AppShell>
  );
}

function MetricCard({ label, value }) {
  return (
    <article className={styles.metricCard}>
      <span>{label}</span>
      <strong>{value}</strong>
    </article>
  );
}

function PanelMessage({ message }) {
  return <div className={styles.message}>{message}</div>;
}

function QuickLinksPanel() {
  const text = dashboardText.dashboardOverview;
  const links = [
    {
      to: '/jobs',
      title: text.jobsLinkTitle,
      description: text.jobsLinkDescription,
    },
    {
      to: '/automation',
      title: text.automationLinkTitle,
      description: text.automationLinkDescription,
    },
    {
      to: '/automation/runs',
      title: text.automationRunsLinkTitle,
      description: text.automationRunsLinkDescription,
    },
  ];

  return (
    <section className={styles.panel}>
      <div className={styles.panelHeader}>
        <h2>{text.quickLinksTitle}</h2>
        <p>{text.quickLinksSubtitle}</p>
      </div>

      <div className={styles.quickLinksGrid}>
        {links.map((link) => (
          <Link key={link.to} to={link.to} className={styles.quickLinkCard}>
            <strong>{link.title}</strong>
            <span>{link.description}</span>
          </Link>
        ))}
      </div>
    </section>
  );
}

function RecentJobsPanel({ jobs }) {
  const text = dashboardText.dashboardOverview;

  return (
    <section className={styles.panel}>
      <div className={styles.panelHeader}>
        <h2>{text.recentJobsTitle}</h2>
        <p>{text.activitySubtitle}</p>
      </div>

      {jobs.length ? (
        <div className={styles.jobsList}>
          {jobs.map((job) => (
            <article key={job.id} className={styles.jobCard}>
              <div className={styles.jobHeader}>
                <strong>{job.jobOffer.title}</strong>
                <span className={styles.badge}>{getMeta(statusMeta, job.match.status, 'ANALYZED').label}</span>
              </div>
              <p>{job.jobOffer.company || dashboardText.common.noCompanyVisible}</p>
              <dl className={styles.metaList}>
                <DataRow label={text.jobScoreLabel} value={job.match.score} />
                <DataRow label={text.jobStatusLabel} value={getMeta(statusMeta, job.match.status, 'ANALYZED').label} />
                <DataRow label={text.jobSourceLabel} value={getLabel(sourceTypeMeta, job.source?.type, job.source?.label ?? 'Manual')} />
              </dl>
            </article>
          ))}
        </div>
      ) : (
        <p className={styles.empty}>{text.recentJobsEmpty}</p>
      )}
    </section>
  );
}

function AgentStatusPanel({ automation, recentAgentRuns, recentApplications }) {
  const text = dashboardText.dashboardOverview;
  const settings = automation?.settings ?? null;

  return (
    <section className={styles.panel}>
      <div className={styles.panelHeader}>
        <h2>{text.automationStatusTitle}</h2>
        <p>{text.automationStatusSubtitle}</p>
      </div>

      <div className={styles.statusGrid}>
        <article className={styles.statusCard}>
          <span>{text.automationEnabledLabel}</span>
          <strong>{settings?.enabled ? dashboardText.common.active : dashboardText.common.inactive}</strong>
        </article>
        <article className={styles.statusCard}>
          <span>{text.automationModeLabel}</span>
          <strong>{getLabel(agentRunModeMeta, settings?.mode, dashboardText.common.notAvailable)}</strong>
        </article>
        <article className={styles.statusCard}>
          <span>{text.recentRunsLabel}</span>
          <strong>{recentAgentRuns.length}</strong>
        </article>
        <article className={styles.statusCard}>
          <span>{text.recentApplicationsLabel}</span>
          <strong>{recentApplications.length}</strong>
        </article>
      </div>
    </section>
  );
}

function OperationsPanel({ health, isLoading, error }) {
  const text = dashboardText.operations;

  if (isLoading) {
    return <PanelMessage message={dashboardText.common.loadingOperations} />;
  }

  if (error) {
    return <ErrorNotice error={error} />;
  }

  if (!health) {
    return <PanelMessage message={text.empty} />;
  }

  return (
    <section className={styles.panel}>
      <div className={styles.panelHeader}>
        <h2>{text.title}</h2>
        <p>{text.subtitle}</p>
      </div>

      <div className={styles.statusGrid}>
        <article className={styles.statusCard}>
          <span>{text.apiStatus}</span>
          <strong>{getLabel(healthStatusMeta, health.services?.api?.status, dashboardText.common.notAvailable)}</strong>
        </article>
        <article className={styles.statusCard}>
          <span>{text.mysqlStatus}</span>
          <strong>{getLabel(healthStatusMeta, health.services?.mysql?.status, dashboardText.common.notAvailable)}</strong>
        </article>
        <article className={styles.statusCard}>
          <span>{text.gmailStatus}</span>
          <strong>{getLabel(integrationStatusMeta, health.integrations?.gmail?.status, dashboardText.common.notAvailable)}</strong>
        </article>
        <article className={styles.statusCard}>
          <span>{text.openAiStatus}</span>
          <strong>{getLabel(integrationStatusMeta, health.integrations?.openai?.status, dashboardText.common.notAvailable)}</strong>
        </article>
        <article className={styles.statusCard}>
          <span>{text.automationMode}</span>
          <strong>{getLabel(agentRunModeMeta, health.automation?.mode, dashboardText.common.notAvailable)}</strong>
        </article>
        <article className={styles.statusCard}>
          <span>{text.killSwitchStatus}</span>
          <strong>{health.automation?.killSwitch?.enabled ? dashboardText.common.active : dashboardText.common.inactive}</strong>
        </article>
      </div>
    </section>
  );
}

function DataRow({ label, value }) {
  return (
    <>
      <dt>{label}</dt>
      <dd>{value}</dd>
    </>
  );
}
