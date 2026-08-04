import { dashboardText } from '../../../constants/dashboardText.js';
import { AppShell } from '../../../shared/components/AppShell.jsx';
import { ManualJobForm } from '../../jobs/components/ManualJobForm.jsx';
import { JobOfferList } from '../../jobs/components/JobOfferList.jsx';
import { useProfileQuery } from '../../profile/hooks/useProfileQuery.js';
import { useDashboardQuery } from '../hooks/useDashboardQuery.js';
import styles from './DashboardPage.module.css';

export function DashboardPage() {
  const dashboardQuery = useDashboardQuery();
  const profileQuery = useProfileQuery();

  const summary = dashboardQuery.data || {
    storageMode: 'memory',
    metrics: { total: 0, readyToPrepare: 0, blocked: 0 },
    latest: [],
  };

  return (
    <AppShell
      eyebrow={dashboardText.shell.eyebrow}
      title={dashboardText.shell.title}
      subtitle={dashboardText.shell.subtitle}
    >
      <section className={styles.metricGrid}>
        <MetricCard label={dashboardText.metrics.total} value={summary.metrics.total} />
        <MetricCard label={dashboardText.metrics.ready} value={summary.metrics.readyToPrepare} />
        <MetricCard label={dashboardText.metrics.blocked} value={summary.metrics.blocked} />
        <MetricCard label={dashboardText.shell.storageLabel} value={summary.storageMode} />
      </section>

      <section className={styles.layout}>
        <div className={styles.left}>
          <ManualJobForm />
          <ProfilePanel profile={profileQuery.data} />
        </div>
        <div className={styles.right}>
          {dashboardQuery.isLoading ? <PanelMessage message="Cargando vacantes..." /> : null}
          {dashboardQuery.isError ? <PanelMessage message={dashboardQuery.error.message} tone="error" /> : null}
          {!dashboardQuery.isLoading && !dashboardQuery.isError ? <JobOfferList jobs={summary.latest} /> : null}
        </div>
      </section>
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

function ProfilePanel({ profile }) {
  if (!profile) {
    return <PanelMessage message="Cargando perfil maestro..." />;
  }

  return (
    <section className={styles.profilePanel}>
      <h2>{dashboardText.profile.title}</h2>
      <dl className={styles.profileGrid}>
        <ProfileRow label={dashboardText.profile.targetRoles} value={profile.headlineTargets.join(', ')} />
        <ProfileRow label={dashboardText.profile.location} value={profile.location} />
        <ProfileRow label={dashboardText.profile.english} value={profile.englishLevel} />
        <ProfileRow label={dashboardText.profile.availability} value={profile.availability} />
        <ProfileRow
          label={dashboardText.profile.salary}
          value={`${profile.salaryExpectation.currency} ${profile.salaryExpectation.amount} / ${profile.salaryExpectation.period}`}
        />
      </dl>
    </section>
  );
}

function ProfileRow({ label, value }) {
  return (
    <>
      <dt>{label}</dt>
      <dd>{value}</dd>
    </>
  );
}

function PanelMessage({ message, tone = 'neutral' }) {
  return <div className={`${styles.message} ${styles[tone]}`}>{message}</div>;
}
