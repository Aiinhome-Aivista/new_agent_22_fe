import { Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ProjectProvider } from './context/ProjectContext';
import MainLayout from './components/MainLayout';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import Dashboard from './pages/Dashboard';
import NewRequestPage from './pages/NewRequestPage';
import PatternReviewPage from './pages/PatternReviewPage';
import BlueprintPage from './pages/BlueprintPage';
import GenerationProgressPage from './pages/GenerationProgressPage';
import ValidationReportPage from './pages/ValidationReportPage';
import PackagesPage from './pages/PackagesPage';
import ReviewApprovalPage from './pages/ReviewApprovalPage';
import AuditTrailPage from './pages/AuditTrailPage';
import AdvisorChatPage from './pages/AdvisorChatPage';
import PlaceholderPage from './pages/PlaceholderPage';
import StandardsPage from './pages/StandardsPage';
import GitHubPage from './pages/GitHubPage';
import TechLeadValidationsPage from './pages/TechLeadValidationsPage';
import TechLeadReviewsPage from './pages/TechLeadReviewsPage';
import TechLeadReportsPage from './pages/TechLeadReportsPage';
import ProtectedRoute from './components/ProtectedRoute';
import ProjectsDirectoryPage from './pages/ProjectsDirectoryPage';
import CreateProjectPage from './pages/CreateProjectPage';
import EditProjectPage from './pages/EditProjectPage';
import EditTrackPage from './pages/EditTrackPage';
import AllProjectsDashboardPage from './pages/AllProjectsDashboardPage';

import DeveloperDashboard from './pages/DeveloperDashboard';
import ArchitectDashboard from './pages/ArchitectDashboard';
import ReviewerDashboard from './pages/ReviewerDashboard';

function App() {
  return (
    <AuthProvider>
      <ProjectProvider>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          
          <Route element={<MainLayout />}>
            {/* Shared Pipeline & Feature Routes */}
            <Route element={<ProtectedRoute />}>
              <Route path="projects" element={<ProjectsDirectoryPage />} />
              <Route path="projects/create" element={<CreateProjectPage />} />
              <Route path="projects/edit/:id" element={<EditProjectPage />} />
              <Route path="tracks/edit/:id" element={<EditTrackPage />} />
              <Route path="dashboard-overview" element={<AllProjectsDashboardPage />} />
              <Route path="dashboard-under-construction" element={<AllProjectsDashboardPage />} />
              <Route path="developer/dashboard" element={<DeveloperDashboard />} />
              <Route path="architect/dashboard" element={<ArchitectDashboard />} />
              <Route path="techlead/dashboard" element={<ReviewerDashboard />} />





              <Route path="request/new" element={<NewRequestPage key="new-request" />} />
              <Route path="requests/:id/chat" element={<NewRequestPage key="historical-chat" />} />
              <Route path="progress" element={<GenerationProgressPage />} />
              <Route path="requests" element={<Dashboard />} />

              <Route path="review/patterns" element={<PatternReviewPage />} />
              <Route path="requests/:id/patterns" element={<PatternReviewPage />} />

              <Route path="blueprint" element={<BlueprintPage />} />
              <Route path="review/blueprint" element={<BlueprintPage />} />
              <Route path="requests/:id/blueprint" element={<BlueprintPage />} />

              <Route path="requests/:id/generation" element={<GenerationProgressPage />} />
              <Route path="validation" element={<ValidationReportPage />} />
              <Route
                path="requests/:id/validation"
                element={<ValidationReportPage />}
              />

              <Route
                path="review/queue"
                element={<ReviewApprovalPage />}
              />
              <Route
                path="requests/:id/review"
                element={<ReviewApprovalPage />}
              />
              <Route path="standards" element={<StandardsPage />} />
              <Route path="github" element={<GitHubPage />} />
              <Route path="knowledge" element={<PlaceholderPage title="Knowledge Base" />} />
              <Route path="chat" element={<AdvisorChatPage />} />
              
              <Route path="packaging" element={<PackagesPage />} />
              <Route path="packages" element={<PackagesPage />} />
              <Route path="requests/:id/package" element={<PackagesPage />} />
              <Route path="requests/:id/packages" element={<PackagesPage />} />
              <Route path="requests/:id/packaging" element={<PackagesPage />} />
            </Route>
            
            <Route element={<ProtectedRoute allowedRoles={['techlead']} />}>
              <Route path="techlead/dashboard" element={<ReviewerDashboard />} />
              <Route path="techlead/validations" element={<TechLeadValidationsPage />} />
              <Route path="techlead/reviews" element={<TechLeadReviewsPage />} />
              <Route path="techlead/reports" element={<TechLeadReportsPage />} />
              <Route path="requests/:id/validation" element={<ValidationReportPage />} />

              <Route path="review/queue" element={<ReviewApprovalPage />} />
              <Route path="requests/:id/review" element={<ReviewApprovalPage />} />

              <Route path="standards" element={<StandardsPage />} />
              <Route path="knowledge" element={<PlaceholderPage title="Knowledge Base" />} />
              <Route path="audit" element={<AuditTrailPage />} />
            </Route>

            {/* Catch-all for under construction pages */}
            <Route path="*" element={<PlaceholderPage />} />
          </Route>

        </Routes>
      </ProjectProvider>
    </AuthProvider>
  );
}

export default App;
