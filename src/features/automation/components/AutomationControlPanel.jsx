import { useState } from 'react';
import { dashboardText } from '../../../constants/dashboardText.js';
import { agentRunModeMeta, getLabel, sourcePolicyMeta } from '../../../constants/statusMeta.js';
import { ErrorNotice } from '../../../shared/components/ErrorNotice.jsx';
import styles from './AutomationControlPanel.module.css';

const SOURCE_POLICY_OPTIONS = [
  'MANUAL_ONLY',
  'AUTO_DISCOVER',
  'AUTO_PREPARE',
  'AUTO_FILL',
  'AUTO_SUBMIT_ALLOWED',
];
const MODE_OPTIONS = ['MANUAL', 'ASSISTED', 'DRY_RUN'];
const DAY_OPTIONS = [1, 2, 3, 4, 5, 6, 0];
const SENIORITY_OPTIONS = ['junior', 'unknown', 'semi_senior', 'senior'];
const WORK_MODE_OPTIONS = ['remote', 'hybrid', 'onsite'];

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
      startTime: formState.startTime,
      daysOfWeek: formState.daysOfWeek,
      filters: {
        allowedSources: splitList(formState.allowedSources),
        allowedRoles: splitList(formState.allowedRoles),
        allowedSeniorities: formState.allowedSeniorities,
        allowedWorkModes: formState.allowedWorkModes,
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
              {MODE_OPTIONS.map((item) => (
                <option key={item} value={item}>
                  {getLabel(agentRunModeMeta, item, item)}
                </option>
              ))}
            </select>
            <small>{text.modeHelp}</small>
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

        <fieldset className={styles.optionSection}>
          <legend>{text.activeDays}</legend>
          <div className={styles.optionGrid}>
            {DAY_OPTIONS.map((day) => (
              <label key={day} className={styles.optionChip}>
                <input
                  type="checkbox"
                  checked={formState.daysOfWeek.includes(day)}
                  onChange={() =>
                    setFormState((current) => ({
                      ...current,
                      daysOfWeek: toggleSelection(current.daysOfWeek, day),
                    }))
                  }
                />
                <span>{text.days[day]}</span>
              </label>
            ))}
          </div>
        </fieldset>

        <fieldset className={styles.optionSection}>
          <legend>{text.allowedSeniorities}</legend>
          <div className={styles.optionGrid}>
            {SENIORITY_OPTIONS.map((value) => (
              <label key={value} className={styles.optionChip}>
                <input
                  type="checkbox"
                  checked={formState.allowedSeniorities.includes(value)}
                  onChange={() =>
                    setFormState((current) => ({
                      ...current,
                      allowedSeniorities: toggleSelection(current.allowedSeniorities, value),
                    }))
                  }
                />
                <span>{text.seniorities[value]}</span>
              </label>
            ))}
          </div>
        </fieldset>

        <fieldset className={styles.optionSection}>
          <legend>{text.allowedWorkModes}</legend>
          <div className={styles.optionGrid}>
            {WORK_MODE_OPTIONS.map((value) => (
              <label key={value} className={styles.optionChip}>
                <input
                  type="checkbox"
                  checked={formState.allowedWorkModes.includes(value)}
                  onChange={() =>
                    setFormState((current) => ({
                      ...current,
                      allowedWorkModes: toggleSelection(current.allowedWorkModes, value),
                    }))
                  }
                />
                <span>{text.workModes[value]}</span>
              </label>
            ))}
          </div>
        </fieldset>

        <section className={styles.policySection}>
          <h3>{text.sourcePolicies}</h3>
          <div className={styles.policyGrid}>
            {Object.entries(formState.sourcePolicies).map(([sourceKey, value]) => (
              <Field
                key={sourceKey}
                label={text.sourceLabels[sourceKey] ?? sourceKey}
                className={styles.policyField}
              >
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
        <p className={styles.helper}>{text.triggerDescription}</p>

        {saveSuccess ? <p className={styles.success}>{text.success}</p> : null}
        {saveError ? <ErrorNotice error={saveError} /> : null}
        {triggerError ? <ErrorNotice error={triggerError} /> : null}
        {triggerResult ? <p className={styles.success}>{text.triggerSuccess}</p> : null}
      </form>
    </section>
  );
}

function Field({ label, hint, children, className = '' }) {
  return (
    <label className={`${styles.field} ${className}`.trim()}>
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
    daysOfWeek: settings?.daysOfWeek ?? [1, 2, 3, 4, 5],
    allowedSeniorities: settings?.filters?.allowedSeniorities ?? ['junior', 'unknown'],
    allowedWorkModes: settings?.filters?.allowedWorkModes ?? ['remote', 'hybrid', 'onsite'],
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

function toggleSelection(values, candidate) {
  return values.includes(candidate)
    ? values.filter((item) => item !== candidate)
    : [...values, candidate];
}
