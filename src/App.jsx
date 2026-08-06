import { Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
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
import ProtectedRoute from './components/ProtectedRoute';

import DeveloperDashboard from './pages/DeveloperDashboard';
import ArchitectDashboard from './pages/ArchitectDashboard';
import ReviewerDashboard from './pages/ReviewerDashboard';
import DevopsDashboard from './pages/DevopsDashboard';

function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        
        <Route element={<MainLayout />}>
          {/* Default redirect to login or role dashboard handled by ProtectedRoute/AuthContext */}
          
          <Route element={<ProtectedRoute allowedRoles={['developer']} />}>
            <Route path="developer/dashboard" element={<DeveloperDashboard />} />
            <Route path="request/new" element={<NewRequestPage />} />
            <Route path="progress" element={<GenerationProgressPage />} />
            <Route path="requests" element={<Dashboard />} />
          </Route>
          
          <Route element={<ProtectedRoute allowedRoles={['architect']} />}>
            <Route path="architect/dashboard" element={<ArchitectDashboard />} />
            <Route path="review/patterns" element={<PatternReviewPage />} />
            <Route path="review/blueprint" element={<BlueprintPage />} />
          </Route>
          
          <Route element={<ProtectedRoute allowedRoles={['techlead']} />}>
            <Route path="techlead/dashboard" element={<ReviewerDashboard />} />
            <Route path="validation" element={<ValidationReportPage />} />
            <Route path="review/queue" element={<ReviewApprovalPage />} />
          </Route>
          
          <Route element={<ProtectedRoute allowedRoles={['devops']} />}>
            <Route path="devops/dashboard" element={<DevopsDashboard />} />
            <Route path="packaging" element={<PackagesPage />} />
          </Route>

          {/* Shared Routes */}
          <Route element={<ProtectedRoute />}>
            <Route path="audit" element={<AuditTrailPage />} />
            <Route path="chat" element={<AdvisorChatPage />} />
            <Route path="packages" element={<PackagesPage />} />
          </Route>

          {/* Catch-all for under construction pages */}
          <Route path="*" element={<PlaceholderPage />} />
        </Route>
      </Routes>
    </AuthProvider>
  );
}

export default App;
