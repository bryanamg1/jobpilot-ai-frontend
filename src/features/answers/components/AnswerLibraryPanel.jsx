import { useState } from 'react';
import { dashboardText } from '../../../constants/dashboardText.js';
import { getApiValidationMessages } from '../../../shared/lib/apiValidation.js';
import { useAnswersQuery } from '../hooks/useAnswersQuery.js';
import { useCreateAnswer } from '../hooks/useCreateAnswer.js';
import { useDeleteAnswer } from '../hooks/useDeleteAnswer.js';
import { useUpdateAnswer } from '../hooks/useUpdateAnswer.js';
import styles from './AnswerLibraryPanel.module.css';

const answerKindOptions = [
  'salaryExpectation',
  'englishLevel',
  'availability',
  'workAuthorization',
  'relocation',
  'travel',
  'location',
  'legalQuestions',
  'custom',
];

const certaintyOptions = [
  'CONFIRMED',
  'INFERRED',
  'REQUIRES_APPROVAL',
  'UNKNOWN',
  'PROHIBITED',
];

const defaultForm = {
  kind: 'custom',
  question: '',
  answer: '',
  certainty: 'REQUIRES_APPROVAL',
  tags: '',
};

export function AnswerLibraryPanel() {
  const text = dashboardText.answers;
  const answersQuery = useAnswersQuery();
  const createMutation = useCreateAnswer();
  const updateMutation = useUpdateAnswer();
  const deleteMutation = useDeleteAnswer();
  const [createForm, setCreateForm] = useState(defaultForm);
  const [createValidationError, setCreateValidationError] = useState(null);
  const [editingId, setEditingId] = useState(null);

  async function handleCreateSubmit(event) {
    event.preventDefault();
    const payload = buildPayload(createForm);
    const validationError = getAnswerFormValidationError(payload);

    if (validationError) {
      setCreateValidationError(validationError);
      return;
    }

    try {
      await createMutation.mutateAsync(payload);
      setCreateForm(defaultForm);
      setCreateValidationError(null);
    } catch {
      // Mutation state already exposes the error.
    }
  }

  return (
    <section className={styles.card}>
      <div className={styles.header}>
        <h2>{text.title}</h2>
        <p>{text.subtitle}</p>
      </div>

      <form className={styles.form} onSubmit={handleCreateSubmit}>
        <AnswerFields
          values={createForm}
          onChange={(updater) => {
            setCreateValidationError(null);
            setCreateForm(updater);
          }}
        />
        <div className={styles.actions}>
          <button type="submit" disabled={createMutation.isPending}>
            {createMutation.isPending ? text.createBusy : text.createIdle}
          </button>
          {createMutation.isSuccess ? <p className={styles.success}>{text.createSuccess}</p> : null}
          {createValidationError ? <p className={styles.error}>{createValidationError}</p> : null}
          {createMutation.isError ? <ValidationErrors error={createMutation.error} /> : null}
        </div>
      </form>

      {answersQuery.isLoading ? <p className={styles.message}>Cargando respuestas...</p> : null}
      {answersQuery.isError ? <p className={styles.error}>{answersQuery.error.message}</p> : null}

      {!answersQuery.isLoading && !answersQuery.isError ? (
        answersQuery.data.length ? (
          <div className={styles.list}>
            {answersQuery.data.map((item) =>
              editingId === item.id ? (
                <EditableAnswerCard
                  key={item.id}
                  item={item}
                  onCancel={() => setEditingId(null)}
                  onSave={async (payload) => {
                    try {
                      await updateMutation.mutateAsync({ answerId: item.id, payload });
                      setEditingId(null);
                    } catch {
                      // Mutation state already exposes the error.
                    }
                  }}
                  isSaving={updateMutation.isPending}
                  error={updateMutation.isError ? updateMutation.error : null}
                />
              ) : (
                <article key={item.id} className={styles.answerCard}>
                  <div className={styles.answerMeta}>
                    <strong>{item.question}</strong>
                    <span>{item.kind}</span>
                    <span>{item.certainty}</span>
                  </div>
                  <p className={styles.answerBody}>{item.answer}</p>
                  <p className={styles.tags}>{item.tags.join(', ') || text.tagsHint}</p>
                  <div className={styles.actions}>
                    <button type="button" onClick={() => setEditingId(item.id)}>
                      {text.editIdle}
                    </button>
                    <button
                      type="button"
                      className={styles.secondaryButton}
                      onClick={() => deleteMutation.mutate(item.id)}
                      disabled={deleteMutation.isPending}
                    >
                      {deleteMutation.isPending ? text.deleteBusy : text.deleteIdle}
                    </button>
                    <span className={`${styles.usageBadge} ${styles[mapUsageTone(item.certainty)]}`}>
                      {mapUsageLabel(item.certainty)}
                    </span>
                  </div>
                </article>
              ),
            )}
          </div>
        ) : (
          <p className={styles.message}>{text.empty}</p>
        )
      ) : null}

      {deleteMutation.isError ? <p className={styles.error}>{deleteMutation.error.message}</p> : null}
    </section>
  );
}

function EditableAnswerCard({ item, onCancel, onSave, isSaving, error }) {
  const [form, setForm] = useState({
    kind: item.kind,
    question: item.question,
    answer: item.answer,
    certainty: item.certainty,
    tags: item.tags.join(', '),
  });
  const [validationError, setValidationError] = useState(null);
  const text = dashboardText.answers;

  async function handleSubmit(event) {
    event.preventDefault();
    const payload = buildPayload(form);
    const nextValidationError = getAnswerFormValidationError(payload);

    if (nextValidationError) {
      setValidationError(nextValidationError);
      return;
    }

    setValidationError(null);
    await onSave(payload);
  }

  return (
    <form className={styles.answerCard} onSubmit={handleSubmit}>
      <AnswerFields
        values={form}
        onChange={(updater) => {
          setValidationError(null);
          setForm(updater);
        }}
      />
      <div className={styles.actions}>
        <button type="submit" disabled={isSaving}>
          {isSaving ? text.updateBusy : text.updateIdle}
        </button>
        <button type="button" className={styles.secondaryButton} onClick={onCancel}>
          {text.cancelIdle}
        </button>
        {validationError ? <p className={styles.error}>{validationError}</p> : null}
        {error ? <ValidationErrors error={error} /> : null}
      </div>
    </form>
  );
}

function AnswerFields({ values, onChange }) {
  const text = dashboardText.answers;

  function patch(nextValues) {
    onChange((current) => ({ ...current, ...nextValues }));
  }

  return (
    <>
      <div className={styles.row}>
        <label className={styles.field}>
          <span>{text.kind}</span>
          <select value={values.kind} onChange={(event) => patch({ kind: event.target.value })}>
            {answerKindOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </label>

        <label className={styles.field}>
          <span>{text.certainty}</span>
          <select value={values.certainty} onChange={(event) => patch({ certainty: event.target.value })}>
            {certaintyOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </label>
      </div>

      <label className={styles.field}>
        <span>{text.question}</span>
        <input value={values.question} onChange={(event) => patch({ question: event.target.value })} />
      </label>

      <label className={styles.field}>
        <span>{text.answer}</span>
        <textarea rows="3" value={values.answer} onChange={(event) => patch({ answer: event.target.value })} />
      </label>

      <label className={styles.field}>
        <span>{text.tags}</span>
        <input value={values.tags} onChange={(event) => patch({ tags: event.target.value })} />
        <small>{text.tagsHint}</small>
      </label>
    </>
  );
}

function buildPayload(form) {
  return {
    kind: form.kind,
    question: form.question.trim(),
    answer: form.answer.trim(),
    certainty: form.certainty,
    tags: form.tags
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean),
  };
}

function getAnswerFormValidationError(payload) {
  if (!payload.question) {
    return 'La pregunta es obligatoria.';
  }

  if (!payload.answer) {
    return 'La respuesta es obligatoria.';
  }

  return null;
}

function ValidationErrors({ error }) {
  const messages = getValidationMessages(error);

  if (!messages.length) {
    return <p className={styles.error}>{error.message}</p>;
  }

  return (
    <ul className={styles.errorList}>
      {messages.map((message) => (
        <li key={message} className={styles.error}>
          {message}
        </li>
      ))}
    </ul>
  );
}

function getValidationMessages(error) {
  return getApiValidationMessages(error);
}

function mapUsageLabel(certainty) {
  if (certainty === 'CONFIRMED' || certainty === 'INFERRED') {
    return dashboardText.answers.usageReferenceOnly;
  }
  if (certainty === 'REQUIRES_APPROVAL') {
    return dashboardText.answers.usageReviewRequired;
  }
  return dashboardText.answers.usageDoNotUse;
}

function mapUsageTone(certainty) {
  if (certainty === 'CONFIRMED' || certainty === 'INFERRED') {
    return 'good';
  }
  if (certainty === 'REQUIRES_APPROVAL') {
    return 'warn';
  }
  return 'bad';
}
