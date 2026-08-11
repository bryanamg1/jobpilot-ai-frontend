import { Link } from 'react-router-dom';
import { ApplicationRunsPanel } from '../../applications/components/ApplicationRunsPanel.jsx';
import { dashboardText } from '../../../constants/dashboardText.js';
import { agentRunModeMeta, getLabel } from '../../../constants/statusMeta.js';
import { ApiConnectionBanner } from '../../../shared/components/ApiConnectionBanner.jsx';
import { AppShell } from '../../../shared/components/AppShell.jsx';
import { ErrorNotice } from '../../../shared/components/ErrorNotice.jsx';
import { API_BASE_URL } from '../../../shared/lib/apiConfig.js';
import { useApiConnectionStatus } from '../../../shared/lib/useApiConnectionStatus.js';
import { useDashboardQuery } from '../../dashboard/hooks/useDashboardQuery.js';
import styles from './AutomationRunsPage.module.css';

export function AutomationRunsPage() {
  const summary = useDashboardQuery();
  const apiConnection = useApiConnectionStatus();
  const isApiOffline = apiConnection.status === 'offline';
  const dashboard = summary.data ?? null;
  const automationSettings = dashboard?.automation?.settings ?? null;
  const text = dashboardText.automationRunsPage;

  function refetchRunsWorkspace() {
    void summary.refetch();
  }

  return (
    <AppShell eyebrow={dashboardText.shell.eyebrow} title={text.title} subtitle={text.subtitle}>
      {isApiOffline ? (
        <ApiConnectionBanner
          apiBaseUrl={API_BASE_URL}
          lastCheckedAt={apiConnection.lastCheckedAt}
          onRetry={refetchRunsWorkspace}
        />
      ) : null}

      {dashboard ? (
        <section className={styles.statusGrid}>
          <StatusCard
            label={dashboardText.dashboardOverview.automationEnabledLabel}
            value={automationSettings?.enabled ? dashboardText.common.active : dashboardText.common.inactive}
          />
          <StatusCard
            label={dashboardText.dashboardOverview.automationModeLabel}
            value={getLabel(agentRunModeMeta, automationSettings?.mode, dashboardText.common.notAvailable)}
          />
          <StatusCard
            label={dashboardText.dashboardOverview.recentRunsLabel}
            value={dashboard.agentRuns?.length ?? 0}
          />
          <StatusCard
            label={dashboardText.dashboardOverview.recentApplicationsLabel}
            value={dashboard.applications?.length ?? 0}
          />
        </section>
      ) : summary.isLoading ? (
        <PanelMessage message={dashboardText.common.loadingOperations} />
      ) : null}

      <section className={styles.layout}>
        <div className={styles.left}>
          <WorkspacePanel />
        </div>

        <div className={styles.right}>
          <ApplicationRunsPanel
            applications={dashboard?.applications ?? []}
            agentRuns={dashboard?.agentRuns ?? []}
          />
          {summary.isError && !isApiOffline ? (
            <ErrorNotice error={summary.error} onRetry={() => summary.refetch()} />
          ) : null}
        </div>
      </section>
    </AppShell>
  );
}

function StatusCard({ label, value }) {
  return (
    <article className={styles.statusCard}>
      <span>{label}</span>
      <strong>{value}</strong>
    </article>
  );
}

function PanelMessage({ message }) {
  return <div className={styles.message}>{message}</div>;
}

function WorkspacePanel() {
  const text = dashboardText.automationRunsPage;

  return (
    <section className={styles.panel}>
      <div className={styles.panelHeader}>
        <h2>{text.workspaceTitle}</h2>
        <p>{text.workspaceSubtitle}</p>
      </div>

      <div className={styles.linkGrid}>
        <Link to="/automation" className={styles.linkCard}>
          <strong>{text.automationLinkTitle}</strong>
          <span>{text.automationLinkDescription}</span>
        </Link>
        <Link to="/jobs" className={styles.linkCard}>
          <strong>{text.jobsLinkTitle}</strong>
          <span>{text.jobsLinkDescription}</span>
        </Link>
      </div>
    </section>
  );
}
