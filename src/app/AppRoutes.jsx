import { Navigate, Route, Routes } from 'react-router-dom';
import { AutomationPage } from '../features/automation/pages/AutomationPage.jsx';
import { AutomationRunsPage } from '../features/automation/pages/AutomationRunsPage.jsx';
import { DashboardPage } from '../features/dashboard/pages/DashboardPage.jsx';
import { JobsPage } from '../features/jobs/pages/JobsPage.jsx';

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="/dashboard" element={<DashboardPage />} />
      <Route path="/jobs" element={<JobsPage />} />
      <Route path="/automation" element={<AutomationPage />} />
      <Route path="/automation/runs" element={<AutomationRunsPage />} />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}
