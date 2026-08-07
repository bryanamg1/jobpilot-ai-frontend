import { useState } from 'react';
import { dashboardText } from '../../../constants/dashboardText.js';
import { agentRunModeMeta, getLabel, sourcePolicyMeta } from '../../../constants/statusMeta.js';
import styles from './AutomationControlPanel.module.css';

const SOURCE_POLICY_OPTIONS = [
  'MANUAL_ONLY',
  'AUTO_DISCOVER',
  'AUTO_PREPARE',
  'AUTO_FILL',
  'AUTO_SUBMIT_ALLOWED',
];

export function AutomationControlPanel({
  settings,
  onSave,
  isSaving,
  saveError,
  saveSuccess,
  onTriggerRun,
  isTriggering,
  triggerError,
  triggerResult,
}) {
  const text = dashboardText.automation;
  const [formState, setFormState] = useState(() => createFormState(settings));

  function handleSubmit(event) {
    event.preventDefault();
    onSave({
      enabled: formState.enabled,
      mode: formState.mode,
      timezone: formState.timezone.trim(),
      dailyApplicationLimit: Number(formState.dailyApplicationLimit),
      dailyDiscoveryLimit: Number(formState.dailyDiscoveryLimit),
      minimumMatchScore: Number(formState.minimumMatchScore),
      requireHumanApproval: formState.requireHumanApproval,
      unknownQuestionPolicy: 'PAUSE',
      captchaPolicy: 'PAUSE',
      mfaPolicy: 'PAUSE',
      salaryRequiresApproval: true,
      startTime: formState.startTime,
      daysOfWeek: [1, 2, 3, 4, 5],
      filters: {
        allowedSources: splitList(formState.allowedSources),
        allowedRoles: splitList(formState.allowedRoles),
        allowedSeniorities: ['junior', 'unknown'],
        allowedWorkModes: ['remote', 'hybrid', 'onsite'],
        blockedCompanies: splitList(formState.blockedCompanies),
        blockedKeywords: splitList(formState.blockedKeywords),
      },
      sourcePolicies: formState.sourcePolicies,
    });
  }

  return (
    <section className={styles.card}>
      <div className={styles.header}>
        <h2>{text.title}</h2>
        <p>{text.subtitle}</p>
      </div>

      <form className={styles.form} onSubmit={handleSubmit}>
        <label className={styles.checkboxRow}>
          <input
            type="checkbox"
            checked={formState.enabled}
            onChange={(event) => setFormState((current) => ({ ...current, enabled: event.target.checked }))}
          />
          <span>{text.enabled}</span>
        </label>

        <div className={styles.grid}>
          <Field label={text.mode}>
            <select
              value={formState.mode}
              onChange={(event) => setFormState((current) => ({ ...current, mode: event.target.value }))}
            >
              {Object.values(text.modes).map((item) => (
                <option key={item} value={item}>
                  {getLabel(agentRunModeMeta, item, item)}
                </option>
              ))}
            </select>
          </Field>

          <Field label={text.timezone}>
            <input
              value={formState.timezone}
              onChange={(event) => setFormState((current) => ({ ...current, timezone: event.target.value }))}
            />
          </Field>

          <Field label={text.startTime}>
            <input
              value={formState.startTime}
              onChange={(event) => setFormState((current) => ({ ...current, startTime: event.target.value }))}
            />
          </Field>

          <Field label={text.minimumMatchScore}>
            <input
              type="number"
              value={formState.minimumMatchScore}
              onChange={(event) =>
                setFormState((current) => ({ ...current, minimumMatchScore: event.target.value }))
              }
            />
          </Field>

          <Field label={text.dailyApplicationLimit}>
            <input
              type="number"
              value={formState.dailyApplicationLimit}
              onChange={(event) =>
                setFormState((current) => ({ ...current, dailyApplicationLimit: event.target.value }))
              }
            />
          </Field>

          <Field label={text.dailyDiscoveryLimit}>
            <input
              type="number"
              value={formState.dailyDiscoveryLimit}
              onChange={(event) =>
                setFormState((current) => ({ ...current, dailyDiscoveryLimit: event.target.value }))
              }
            />
          </Field>
        </div>

        <label className={styles.checkboxRow}>
          <input
            type="checkbox"
            checked={formState.requireHumanApproval}
            onChange={(event) =>
              setFormState((current) => ({ ...current, requireHumanApproval: event.target.checked }))
            }
          />
          <span>{text.requireHumanApproval}</span>
        </label>

        <Field label={text.allowedSources} hint={text.listHint}>
          <input
            value={formState.allowedSources}
            onChange={(event) => setFormState((current) => ({ ...current, allowedSources: event.target.value }))}
          />
        </Field>

        <Field label={text.allowedRoles} hint={text.listHint}>
          <input
            value={formState.allowedRoles}
            onChange={(event) => setFormState((current) => ({ ...current, allowedRoles: event.target.value }))}
          />
        </Field>

        <Field label={text.blockedCompanies} hint={text.listHint}>
          <input
            value={formState.blockedCompanies}
            onChange={(event) => setFormState((current) => ({ ...current, blockedCompanies: event.target.value }))}
          />
        </Field>

        <Field label={text.blockedKeywords} hint={text.listHint}>
          <input
            value={formState.blockedKeywords}
            onChange={(event) => setFormState((current) => ({ ...current, blockedKeywords: event.target.value }))}
          />
        </Field>

        <section className={styles.policySection}>
          <h3>{text.sourcePolicies}</h3>
          <div className={styles.grid}>
            {Object.entries(formState.sourcePolicies).map(([sourceKey, value]) => (
              <Field key={sourceKey} label={text.sourceLabels[sourceKey] ?? sourceKey}>
                <select
                  value={value}
                  onChange={(event) =>
                    setFormState((current) => ({
                      ...current,
                      sourcePolicies: {
                        ...current.sourcePolicies,
                        [sourceKey]: event.target.value,
                      },
                    }))
                  }
                >
                  {SOURCE_POLICY_OPTIONS.map((item) => (
                    <option key={item} value={item}>
                      {getLabel(sourcePolicyMeta, item, item)}
                    </option>
                  ))}
                </select>
              </Field>
            ))}
          </div>
        </section>

        <div className={styles.actions}>
          <button type="submit" disabled={isSaving}>
            {isSaving ? text.saveBusy : text.saveIdle}
          </button>
          <button
            type="button"
            className={styles.secondaryButton}
            onClick={() => onTriggerRun()}
            disabled={isTriggering}
          >
            {isTriggering ? text.triggerBusy : text.triggerIdle}
          </button>
        </div>

        {saveSuccess ? <p className={styles.success}>{text.success}</p> : null}
        {saveError ? <p className={styles.error}>{saveError.message}</p> : null}
        {triggerError ? <p className={styles.error}>{triggerError.message}</p> : null}
        {triggerResult ? <p className={styles.success}>{text.triggerSuccess}</p> : null}
      </form>
    </section>
  );
}

function Field({ label, hint, children }) {
  return (
    <label className={styles.field}>
      <span>{label}</span>
      {children}
      {hint ? <small>{hint}</small> : null}
    </label>
  );
}

function createFormState(settings) {
  return {
    enabled: settings?.enabled ?? false,
    mode: settings?.mode ?? 'DRY_RUN',
    timezone: settings?.timezone ?? 'America/Argentina/Buenos_Aires',
    startTime: settings?.startTime ?? '09:00',
    dailyApplicationLimit: String(settings?.dailyApplicationLimit ?? 5),
    dailyDiscoveryLimit: String(settings?.dailyDiscoveryLimit ?? 25),
    minimumMatchScore: String(settings?.minimumMatchScore ?? 75),
    requireHumanApproval: settings?.requireHumanApproval ?? true,
    allowedSources: (settings?.filters?.allowedSources ?? []).join(', '),
    allowedRoles: (settings?.filters?.allowedRoles ?? []).join(', '),
    blockedCompanies: (settings?.filters?.blockedCompanies ?? []).join(', '),
    blockedKeywords: (settings?.filters?.blockedKeywords ?? []).join(', '),
    sourcePolicies: {
      MANUAL: settings?.sourcePolicies?.MANUAL ?? 'MANUAL_ONLY',
      LINKEDIN_JOBS_SUPERVISED:
        settings?.sourcePolicies?.LINKEDIN_JOBS_SUPERVISED ?? 'AUTO_PREPARE',
      LINKEDIN_FEED_SUPERVISED:
        settings?.sourcePolicies?.LINKEDIN_FEED_SUPERVISED ?? 'AUTO_PREPARE',
      LINKEDIN_POST_SEARCH_SUPERVISED:
        settings?.sourcePolicies?.LINKEDIN_POST_SEARCH_SUPERVISED ?? 'AUTO_PREPARE',
    },
  };
}

function splitList(value) {
  return String(value)
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
}
