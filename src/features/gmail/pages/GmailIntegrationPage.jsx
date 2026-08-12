import { AppShell } from '../../../shared/components/AppShell.jsx';
import { dashboardText } from '../../../constants/dashboardText.js';
import { GmailIntegrationPanel } from '../components/GmailIntegrationPanel.jsx';
import { useConnectGmail } from '../hooks/useConnectGmail.js';
import { useDisconnectGmail } from '../hooks/useDisconnectGmail.js';
import { useGmailStatusQuery } from '../hooks/useGmailStatusQuery.js';
import styles from './GmailIntegrationPage.module.css';

export function GmailIntegrationPage() {
  const gmailStatusQuery = useGmailStatusQuery();
  const connectGmailMutation = useConnectGmail();
  const disconnectGmailMutation = useDisconnectGmail();
  const actionError = connectGmailMutation.error || disconnectGmailMutation.error || null;

  return (
    <AppShell
      eyebrow={dashboardText.shell.eyebrow}
      title={dashboardText.gmail.title}
      subtitle="Conecta o desconecta Gmail desde una vista dedicada para revisar alertas y habilitar borradores reales sin volver a cargar el dashboard."
    >
      <section className={styles.layout}>
        <GmailIntegrationPanel
          status={gmailStatusQuery.data}
          isLoading={gmailStatusQuery.isLoading}
          error={gmailStatusQuery.error}
          actionError={actionError}
          onConnect={() => connectGmailMutation.mutate()}
          onDisconnect={() => disconnectGmailMutation.mutate()}
          isConnecting={connectGmailMutation.isPending}
          isDisconnecting={disconnectGmailMutation.isPending}
        />
      </section>
    </AppShell>
  );
}
