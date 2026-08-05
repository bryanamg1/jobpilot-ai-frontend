import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { dashboardText } from '../../../constants/dashboardText.js';
import { applyApiFieldErrors } from '../../../shared/lib/apiValidation.js';
import { useCreateManualJob } from '../hooks/useCreateManualJob.js';
import styles from './ManualJobForm.module.css';

const schema = z.object({
  rawText: z.string().min(30, 'Agrega más detalle para analizar la vacante.'),
  sourceUrl: z.union([z.literal(''), z.string().url('Ingresa un enlace válido.')]),
});

const initialValues = {
  rawText: '',
  sourceUrl: '',
};

export function ManualJobForm() {
  const mutation = useCreateManualJob();
  const {
    register,
    handleSubmit,
    reset,
    clearErrors,
    setError,
    formState: { errors },
  } = useForm({
    defaultValues: initialValues,
    resolver: zodResolver(schema),
  });

  const onSubmit = handleSubmit(async (values) => {
    clearErrors();

    try {
      await mutation.mutateAsync({
        ...values,
        sourceLabel: 'Dashboard manual intake',
      });
      reset(initialValues);
    } catch (error) {
      const applied = applyApiFieldErrors(error, setError);
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
        <h2>{dashboardText.form.title}</h2>
        <p>{dashboardText.form.subtitle}</p>
      </div>

      <form className={styles.form} onSubmit={onSubmit}>
        <label className={styles.field}>
          <span>{dashboardText.form.rawTextLabel}</span>
          <textarea
            rows="10"
            placeholder={dashboardText.form.rawTextPlaceholder}
            {...register('rawText')}
          />
          {errors.rawText ? <small>{errors.rawText.message}</small> : null}
        </label>

        <label className={styles.field}>
          <span>{dashboardText.form.sourceUrlLabel}</span>
          <input
            type="url"
            placeholder={dashboardText.form.sourceUrlPlaceholder}
            {...register('sourceUrl')}
          />
          {errors.sourceUrl ? <small>{errors.sourceUrl.message}</small> : null}
        </label>

        <div className={styles.actions}>
          <button type="submit" disabled={mutation.isPending}>
            {mutation.isPending ? dashboardText.form.submitBusy : dashboardText.form.submitIdle}
          </button>
          {mutation.isSuccess ? <p className={styles.success}>{dashboardText.form.success}</p> : null}
          {errors.root?.server?.message ? <p className={styles.error}>{errors.root.server.message}</p> : null}
        </div>
      </form>
    </section>
  );
}
