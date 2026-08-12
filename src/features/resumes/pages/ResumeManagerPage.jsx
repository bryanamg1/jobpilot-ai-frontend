import { AppShell } from '../../../shared/components/AppShell.jsx';
import { dashboardText } from '../../../constants/dashboardText.js';
import { ResumeManagerPanel } from '../components/ResumeManagerPanel.jsx';
import { useAssignResumeToJob } from '../hooks/useAssignResumeToJob.js';
import { useResumesQuery } from '../hooks/useResumesQuery.js';
import { useUploadResume } from '../hooks/useUploadResume.js';
import styles from './ResumeManagerPage.module.css';

export function ResumeManagerPage() {
  const resumesQuery = useResumesQuery();
  const uploadResumeMutation = useUploadResume();
  const assignResumeMutation = useAssignResumeToJob();

  return (
    <AppShell
      eyebrow={dashboardText.shell.eyebrow}
      title={dashboardText.resumes.title}
      subtitle="Gestiona tus CVs desde una vista dedicada. Aqui puedes cargar nuevas versiones y revisar cuales quedan disponibles para futuras postulaciones."
    >
      <section className={styles.layout}>
        <ResumeManagerPanel
          resumes={resumesQuery.data ?? []}
          isLoading={resumesQuery.isLoading}
          error={resumesQuery.error}
          selectedJob={null}
          onUploadResume={(payload) => uploadResumeMutation.mutateAsync(payload)}
          isUploading={uploadResumeMutation.isPending}
          uploadError={uploadResumeMutation.error}
          uploadSuccess={uploadResumeMutation.isSuccess}
          onAssignResume={(payload) => assignResumeMutation.mutate(payload)}
          isAssigning={assignResumeMutation.isPending}
          assignError={assignResumeMutation.error}
        />
      </section>
    </AppShell>
  );
}
