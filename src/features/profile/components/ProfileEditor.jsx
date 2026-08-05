import { useEffect } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { dashboardText } from '../../../constants/dashboardText.js';
import { applyApiFieldErrors } from '../../../shared/lib/apiValidation.js';
import { useUpdateProfile } from '../hooks/useUpdateProfile.js';
import styles from './ProfileEditor.module.css';

const profileSchema = z.object({
  name: z.string().trim().min(1),
  headlineTargets: z.string().trim().min(1),
  location: z.string().trim().min(1),
  availability: z.string().trim().min(1),
  modalities: z.array(z.enum(['remote', 'hybrid', 'onsite'])).min(1),
  englishLevel: z.string().trim().min(1),
  salaryAmount: z.coerce.number().positive(),
  salaryCurrency: z.string().trim().min(3).max(5),
  salaryPeriod: z.enum(['hourly', 'monthly', 'yearly']),
  github: z.string().url(),
  linkedin: z.string().url(),
  email: z.string().email(),
  projects: z.string().trim().min(1),
  technologies: z.string().trim().min(1),
  knowledgeAreas: z.string().optional(),
  prohibitedClaims: z.string().optional(),
});

const modalityOptions = [
  { value: 'remote', label: 'Remote' },
  { value: 'hybrid', label: 'Hybrid' },
  { value: 'onsite', label: 'Onsite' },
];

export function ProfileEditor({ profile }) {
  const mutation = useUpdateProfile();
  const {
    register,
    handleSubmit,
    reset,
    clearErrors,
    setError,
    formState: { errors },
  } = useForm({
    defaultValues: buildFormValues(profile),
    resolver: zodResolver(profileSchema),
  });

  useEffect(() => {
    reset(buildFormValues(profile));
  }, [profile, reset]);

  const onSubmit = handleSubmit(async (values) => {
    clearErrors();

    try {
      await mutation.mutateAsync({
        name: values.name,
        headlineTargets: splitCsv(values.headlineTargets),
        location: values.location,
        availability: values.availability,
        modalities: values.modalities,
        englishLevel: values.englishLevel,
        salaryExpectation: {
          amount: values.salaryAmount,
          currency: values.salaryCurrency,
          period: values.salaryPeriod,
        },
        publicLinks: {
          github: values.github,
          linkedin: values.linkedin,
        },
        contact: {
          email: values.email,
        },
        projects: splitCsv(values.projects),
        technologies: splitCsv(values.technologies),
        knowledgeAreas: splitCsv(values.knowledgeAreas),
        prohibitedClaims: splitCsv(values.prohibitedClaims),
      });
    } catch (error) {
      const applied = applyApiFieldErrors(error, setError, profileFieldMap);
      if (!applied) {
        setError('root.server', {
          type: 'server',
          message: error.message,
        });
      }
    }
  });

  return (
    <section className={styles.card}>
      <div className={styles.header}>
        <h2>{dashboardText.profile.title}</h2>
        <p>{dashboardText.profile.subtitle}</p>
      </div>

      <form className={styles.form} onSubmit={onSubmit}>
        <Field label={dashboardText.profile.name} error={errors.name?.message}>
          <input {...register('name')} />
        </Field>

        <Field
          label={`${dashboardText.profile.targetRoles} (${dashboardText.profile.listHint})`}
          error={errors.headlineTargets?.message}
        >
          <textarea rows="2" {...register('headlineTargets')} />
        </Field>

        <Field label={dashboardText.profile.location} error={errors.location?.message}>
          <input {...register('location')} />
        </Field>

        <div className={styles.row}>
          <Field label={dashboardText.profile.availability} error={errors.availability?.message}>
            <input {...register('availability')} />
          </Field>
          <Field label={dashboardText.profile.english} error={errors.englishLevel?.message}>
            <input {...register('englishLevel')} />
          </Field>
        </div>

        <div className={styles.row}>
          <Field label={dashboardText.profile.salaryAmount} error={errors.salaryAmount?.message}>
            <input type="number" min="1" step="1" {...register('salaryAmount')} />
          </Field>
          <Field label={dashboardText.profile.salaryCurrency} error={errors.salaryCurrency?.message}>
            <input {...register('salaryCurrency')} />
          </Field>
          <Field label={dashboardText.profile.salaryPeriod} error={errors.salaryPeriod?.message}>
            <select {...register('salaryPeriod')}>
              <option value="monthly">monthly</option>
              <option value="yearly">yearly</option>
              <option value="hourly">hourly</option>
            </select>
          </Field>
        </div>

        <Field label={dashboardText.profile.modalities} error={errors.modalities?.message}>
          <div className={styles.checkboxRow}>
            {modalityOptions.map((option) => (
              <label key={option.value} className={styles.checkbox}>
                <input type="checkbox" value={option.value} {...register('modalities')} />
                <span>{option.label}</span>
              </label>
            ))}
          </div>
        </Field>

        <div className={styles.row}>
          <Field label={dashboardText.profile.github} error={errors.github?.message}>
            <input type="url" {...register('github')} />
          </Field>
          <Field label={dashboardText.profile.linkedin} error={errors.linkedin?.message}>
            <input type="url" {...register('linkedin')} />
          </Field>
        </div>

        <Field label={dashboardText.profile.email} error={errors.email?.message}>
          <input type="email" {...register('email')} />
        </Field>

        <Field
          label={`${dashboardText.profile.projects} (${dashboardText.profile.listHint})`}
          error={errors.projects?.message}
        >
          <textarea rows="2" {...register('projects')} />
        </Field>

        <Field
          label={`${dashboardText.profile.technologies} (${dashboardText.profile.listHint})`}
          error={errors.technologies?.message}
        >
          <textarea rows="4" {...register('technologies')} />
        </Field>

        <Field
          label={`${dashboardText.profile.knowledgeAreas} (${dashboardText.profile.listHint})`}
          error={errors.knowledgeAreas?.message}
        >
          <textarea rows="2" {...register('knowledgeAreas')} />
        </Field>

        <Field
          label={`${dashboardText.profile.prohibitedClaims} (${dashboardText.profile.listHint})`}
          error={errors.prohibitedClaims?.message}
        >
          <textarea rows="3" {...register('prohibitedClaims')} />
        </Field>

        <div className={styles.actions}>
          <button type="submit" disabled={mutation.isPending}>
            {mutation.isPending ? dashboardText.profile.saveBusy : dashboardText.profile.saveIdle}
          </button>
          {mutation.isSuccess ? <p className={styles.success}>{dashboardText.profile.saveSuccess}</p> : null}
          {errors.root?.server?.message ? <p className={styles.error}>{errors.root.server.message}</p> : null}
        </div>
      </form>
    </section>
  );
}

const profileFieldMap = {
  'contact.email': 'email',
  'publicLinks.github': 'github',
  'publicLinks.linkedin': 'linkedin',
  'salaryExpectation.amount': 'salaryAmount',
  'salaryExpectation.currency': 'salaryCurrency',
  'salaryExpectation.period': 'salaryPeriod',
};

function Field({ label, error, children }) {
  return (
    <label className={styles.field}>
      <span>{label}</span>
      {children}
      {error ? <small>{error}</small> : null}
    </label>
  );
}

function buildFormValues(profile) {
  return {
    name: profile?.name ?? '',
    headlineTargets: joinCsv(profile?.headlineTargets),
    location: profile?.location ?? '',
    availability: profile?.availability ?? '',
    modalities: profile?.modalities ?? ['remote'],
    englishLevel: profile?.englishLevel ?? '',
    salaryAmount: profile?.salaryExpectation?.amount ?? 1000,
    salaryCurrency: profile?.salaryExpectation?.currency ?? 'USD',
    salaryPeriod: profile?.salaryExpectation?.period ?? 'monthly',
    github: profile?.publicLinks?.github ?? '',
    linkedin: profile?.publicLinks?.linkedin ?? '',
    email: profile?.contact?.email ?? '',
    projects: joinCsv(profile?.projects),
    technologies: joinCsv(profile?.technologies),
    knowledgeAreas: joinCsv(profile?.knowledgeAreas),
    prohibitedClaims: joinCsv(profile?.prohibitedClaims),
  };
}

function joinCsv(values = []) {
  return values.join(', ');
}

function splitCsv(value = '') {
  return value
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
}
