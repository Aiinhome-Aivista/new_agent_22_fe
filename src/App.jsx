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

function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/landing" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        
        <Route path="/" element={<MainLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="requests/new" element={<NewRequestPage />} />
          <Route path="requests/:id/patterns" element={<PatternReviewPage />} />
          <Route path="requests/:id/blueprint" element={<BlueprintPage />} />
          <Route path="requests/:id/generation" element={<GenerationProgressPage />} />
          <Route path="requests/:id/validation" element={<ValidationReportPage />} />
          <Route path="requests/:id/package" element={<PackagesPage />} />
          <Route path="requests/:id/review" element={<ReviewApprovalPage />} />
          <Route path="audit" element={<AuditTrailPage />} />
          <Route path="chat" element={<AdvisorChatPage />} />
        </Route>
      </Routes>
    </AuthProvider>
  );
}

export default App;
