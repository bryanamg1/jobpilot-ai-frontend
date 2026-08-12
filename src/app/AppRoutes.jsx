import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { AutomationPage } from '../features/automation/pages/AutomationPage.jsx';
import { AutomationRunsPage } from '../features/automation/pages/AutomationRunsPage.jsx';
import { DashboardPage } from '../features/dashboard/pages/DashboardPage.jsx';
import { GmailIntegrationPage } from '../features/gmail/pages/GmailIntegrationPage.jsx';
import { JobsPage } from '../features/jobs/pages/JobsPage.jsx';
import { ResumeManagerPage } from '../features/resumes/pages/ResumeManagerPage.jsx';

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<RootRedirect />} />
      <Route path="/dashboard" element={<DashboardPage />} />
      <Route path="/integrations" element={<GmailIntegrationPage />} />
      <Route path="/integrations/gmail" element={<GmailIntegrationPage />} />
      <Route path="/profile/resumes" element={<ResumeManagerPage />} />
      <Route path="/resumes" element={<ResumeManagerPage />} />
      <Route path="/gmail-connected" element={<Navigate to="/integrations/gmail?gmail=connected" replace />} />
      <Route path="/gmail-disconnected" element={<Navigate to="/integrations/gmail?gmail=disconnected" replace />} />
      <Route path="/jobs" element={<JobsPage />} />
      <Route path="/automation" element={<AutomationPage />} />
      <Route path="/automation/runs" element={<AutomationRunsPage />} />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}

function RootRedirect() {
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const gmailState = params.get('gmail');

  if (gmailState === 'connected' || gmailState === 'disconnected') {
    return <Navigate to={`/integrations/gmail${location.search}`} replace />;
  }

  return <Navigate to="/dashboard" replace />;
}
