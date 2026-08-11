import { Link } from 'react-router-dom';
import { dashboardText } from '../../../constants/dashboardText.js';
import { agentRunModeMeta, getLabel } from '../../../constants/statusMeta.js';
import { ApiConnectionBanner } from '../../../shared/components/ApiConnectionBanner.jsx';
import { AppShell } from '../../../shared/components/AppShell.jsx';
import { ErrorNotice } from '../../../shared/components/ErrorNotice.jsx';
import { API_BASE_URL } from '../../../shared/lib/apiConfig.js';
import { useApiConnectionStatus } from '../../../shared/lib/useApiConnectionStatus.js';
import { useDashboardQuery } from '../../dashboard/hooks/useDashboardQuery.js';
import { AutomationControlPanel } from '../components/AutomationControlPanel.jsx';
import { useTriggerAutomationRun } from '../hooks/useTriggerAutomationRun.js';
import { useUpdateAutomationSettings } from '../hooks/useUpdateAutomationSettings.js';
import styles from './AutomationPage.module.css';

export function AutomationPage() {
  const summary = useDashboardQuery();
  const updateAutomationSettingsMutation = useUpdateAutomationSettings();
  const triggerAutomationRunMutation = useTriggerAutomationRun();
  const apiConnection = useApiConnectionStatus();
  const isApiOffline = apiConnection.status === 'offline';
  const dashboard = summary.data ?? null;
  const automationSettings = dashboard?.automation?.settings ?? null;

  function refetchAutomationWorkspace() {
    void summary.refetch();
  }

  return (
    <AppShell
      eyebrow={dashboardText.shell.eyebrow}
      title={dashboardText.automationPage.title}
      subtitle={dashboardText.automationPage.subtitle}
    >
      {isApiOffline ? (
        <ApiConnectionBanner
          apiBaseUrl={API_BASE_URL}
          lastCheckedAt={apiConnection.lastCheckedAt}
          onRetry={refetchAutomationWorkspace}
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
          <AutomationControlPanel
            key={automationSettings?.updatedAt ?? automationSettings?.version ?? 'automation-settings'}
            settings={automationSettings}
            onSave={(payload) => updateAutomationSettingsMutation.mutate(payload)}
            isSaving={updateAutomationSettingsMutation.isPending}
            saveError={updateAutomationSettingsMutation.error}
            saveSuccess={updateAutomationSettingsMutation.isSuccess}
            onTriggerRun={() =>
              triggerAutomationRunMutation.mutate({ reason: dashboardText.common.dashboardManualTrigger })
            }
            isTriggering={triggerAutomationRunMutation.isPending}
            triggerError={triggerAutomationRunMutation.error}
            triggerResult={triggerAutomationRunMutation.data?.data ?? null}
          />
        </div>

        <div className={styles.right}>
          <WorkspacePanel />
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
  const text = dashboardText.automationPage;

  return (
    <section className={styles.panel}>
      <div className={styles.panelHeader}>
        <h2>{text.workspaceTitle}</h2>
        <p>{text.workspaceSubtitle}</p>
      </div>

      <div className={styles.linkGrid}>
        <Link to="/jobs" className={styles.linkCard}>
          <strong>{text.jobsLinkTitle}</strong>
          <span>{text.jobsLinkDescription}</span>
        </Link>
        <Link to="/automation/runs" className={styles.linkCard}>
          <strong>{text.runsLinkTitle}</strong>
          <span>{text.runsLinkDescription}</span>
        </Link>
      </div>
    </section>
  );
}
