import { useRef, useState } from 'react';
import { dashboardText } from '../../../constants/dashboardText.js';
import { ErrorNotice } from '../../../shared/components/ErrorNotice.jsx';
import { fileToBase64 } from '../../../shared/lib/fileToBase64.js';
import styles from './ResumeManagerPanel.module.css';

const ACCEPTED_FILES = '.pdf,.doc,.docx';
const MAX_RESUME_BYTES = 5 * 1024 * 1024;
const MIME_BY_EXTENSION = {
  pdf: 'application/pdf',
  doc: 'application/msword',
  docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
};

export function ResumeManagerPanel({
  resumes,
  isLoading,
  error,
  selectedJob,
  onUploadResume,
  isUploading,
  uploadError,
  uploadSuccess,
  onAssignResume,
  isAssigning,
  assignError,
}) {
  const text = dashboardText.resumes;
  const [label, setLabel] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [validationError, setValidationError] = useState(null);
  const fileInputRef = useRef(null);

  async function handleUploadSubmit(event) {
    event.preventDefault();
    if (!selectedFile) {
      setValidationError(new Error(text.fileRequired));
      return;
    }

    try {
      const validationMessage = validateResumeFile(selectedFile, text);
      if (validationMessage) {
        setValidationError(new Error(validationMessage));
        return;
      }

      const contentBase64 = await fileToBase64(selectedFile);
      await onUploadResume({
        label: label.trim() || buildDefaultLabel(selectedFile.name),
        fileName: selectedFile.name,
        mimeType: selectedFile.type,
        contentBase64,
      });

      setLabel('');
      setSelectedFile(null);
      setValidationError(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch {
      // Mutation state already surfaces the user-facing error.
    }
  }

  return (
    <section className={styles.card}>
      <div className={styles.header}>
        <h2>{text.title}</h2>
        <p>{text.subtitle}</p>
      </div>

      <form className={styles.form} onSubmit={handleUploadSubmit}>
        <label className={styles.field}>
          <span>{text.uploadLabel}</span>
          <input
            value={label}
            onChange={(event) => setLabel(event.target.value)}
            placeholder={text.uploadPlaceholder}
          />
        </label>

        <label className={styles.field}>
          <span>{text.uploadFile}</span>
          <input
            ref={fileInputRef}
            type="file"
            accept={ACCEPTED_FILES}
            onChange={(event) => {
              const nextFile = event.target.files?.[0] ?? null;
              setSelectedFile(nextFile);
              setValidationError(nextFile ? createValidationError(nextFile, text) : null);
            }}
          />
        </label>

        <p className={styles.helper}>{text.uploadHelp}</p>

        <div className={styles.actions}>
          <button type="submit" disabled={isUploading || !selectedFile}>
            {isUploading ? text.uploadBusy : text.uploadIdle}
          </button>
          {uploadSuccess ? <p className={styles.success}>{text.uploadSuccess}</p> : null}
          {validationError ? <ErrorNotice error={validationError} /> : null}
          {uploadError ? <ErrorNotice error={uploadError} /> : null}
        </div>
      </form>

      {isLoading ? <p className={styles.message}>{text.uploadLoading}</p> : null}
      {error ? <ErrorNotice error={error} /> : null}
      {!isLoading && !error ? (
        resumes.length ? (
          <div className={styles.list}>
            {resumes.map((resume) => (
              <article key={resume.id} className={styles.resumeItem}>
                <div className={styles.resumeHeader}>
                  <strong>{resume.label}</strong>
                  <span className={`${styles.badge} ${styles[resumeTone(resume, selectedJob)]}`}>
                    {resumeStatusLabel(resume, selectedJob, text)}
                  </span>
                </div>
                <dl className={styles.resumeMeta}>
                  <MetaRow label={text.fileNameLabel} value={resume.originalFileName} />
                  <MetaRow label={text.sizeLabel} value={formatBytes(resume.sizeBytes)} />
                  <MetaRow label={text.uploadedAt} value={formatDate(resume.uploadedAt)} />
                  <MetaRow label={text.statusLabel} value={formatAttachmentStatus(resume.attachmentStatus)} />
                </dl>
              </article>
            ))}
          </div>
        ) : (
          <p className={styles.message}>{text.empty}</p>
        )
      ) : null}

      <section className={styles.assignment}>
        <div className={styles.assignmentHeader}>
          <h3>{text.assignTitle}</h3>
          {selectedJob ? (
            <p>
              {text.assignedTo}: {selectedJob.jobOffer.title} · {selectedJob.jobOffer.company}
            </p>
          ) : (
            <p>{text.assignEmptyJob}</p>
          )}
        </div>

        {selectedJob ? (
          <ResumeAssignmentForm
            key={`${selectedJob.id}:${selectedJob.resumeSelection?.id ?? 'none'}`}
            resumes={resumes}
            selectedJob={selectedJob}
            onAssignResume={onAssignResume}
            isAssigning={isAssigning}
            assignError={assignError}
          />
        ) : null}
      </section>
    </section>
  );
}

function ResumeAssignmentForm({ resumes, selectedJob, onAssignResume, isAssigning, assignError }) {
  const text = dashboardText.resumes;
  const [selectedResumeId, setSelectedResumeId] = useState(selectedJob.resumeSelection?.id ?? '');

  function handleAssignSubmit(event) {
    event.preventDefault();
    onAssignResume({
      jobId: selectedJob.id,
      resumeId: selectedResumeId || null,
    });
  }

  return (
    <form className={styles.form} onSubmit={handleAssignSubmit}>
      <label className={styles.field}>
        <span>{text.assignSelectLabel}</span>
        <select value={selectedResumeId} onChange={(event) => setSelectedResumeId(event.target.value)}>
          <option value="">{text.assignSelectPlaceholder}</option>
          {resumes.map((resume) => (
            <option key={resume.id} value={resume.id}>
              {resume.label} · {resume.originalFileName}
            </option>
          ))}
        </select>
      </label>

      <p className={styles.helper}>
        {text.currentSelection} <strong>{selectedJob.resumeSelection?.label ?? text.currentSelectionEmpty}</strong>
      </p>

      <div className={styles.actions}>
        <button type="submit" disabled={isAssigning || !resumes.length}>
          {isAssigning ? text.assignBusy : text.assignIdle}
        </button>
        <button
          type="button"
          className={styles.secondaryButton}
          onClick={() => onAssignResume({ jobId: selectedJob.id, resumeId: null })}
          disabled={isAssigning || !selectedJob.resumeSelection}
        >
          {isAssigning ? text.clearBusy : text.clearIdle}
        </button>
        {assignError ? <ErrorNotice error={assignError} /> : null}
      </div>
    </form>
  );
}

function buildDefaultLabel(fileName) {
  return String(fileName).replace(/\.[^.]+$/u, '');
}

function createValidationError(file, text) {
  const validationMessage = validateResumeFile(file, text);
  return validationMessage ? new Error(validationMessage) : null;
}

function validateResumeFile(file, text) {
  const extension = String(file?.name ?? '')
    .split('.')
    .pop()
    ?.toLowerCase();

  if (!extension || !MIME_BY_EXTENSION[extension]) {
    return text.invalidFormat;
  }

  if (file.size > MAX_RESUME_BYTES) {
    return text.fileTooLarge;
  }

  if (file.type && file.type !== MIME_BY_EXTENSION[extension]) {
    return text.invalidMimeType;
  }

  return null;
}

function formatBytes(value) {
  if (value >= 1024 * 1024) {
    return `${(value / (1024 * 1024)).toFixed(1)} MB`;
  }

  return `${Math.max(1, Math.round(value / 1024))} KB`;
}

function formatDate(value) {
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

function formatAttachmentStatus(value) {
  if (value === 'MANUAL_REQUIRED') {
    return 'Adjunto manual requerido';
  }

  if (value === 'ATTACHED') {
    return 'Adjuntado';
  }

  return value || dashboardText.common.notAvailable;
}

function resumeStatusLabel(resume, selectedJob, text) {
  if (selectedJob?.resumeSelection?.id === resume.id) {
    return text.selectedStatus;
  }

  return text.availableStatus;
}

function resumeTone(resume, selectedJob) {
  return selectedJob?.resumeSelection?.id === resume.id ? 'good' : 'neutral';
}

function MetaRow({ label, value }) {
  return (
    <>
      <dt>{label}</dt>
      <dd>{value || dashboardText.common.notAvailable}</dd>
    </>
  );
}
