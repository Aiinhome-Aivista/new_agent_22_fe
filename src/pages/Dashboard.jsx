import { useEffect, useState } from 'react';
import { getRequests } from '../api/api';
import Loader from '../components/Loader';
import StatusBadge from '../components/StatusBadge';
import RequestTable from '../components/RequestTable';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ClockIcon, ArchiveBoxArrowDownIcon, CheckBadgeIcon, BuildingLibraryIcon, ShieldCheckIcon, CheckCircleIcon, ClipboardDocumentCheckIcon, ExclamationTriangleIcon, MagnifyingGlassIcon, ArchiveBoxIcon, RocketLaunchIcon, DocumentTextIcon } from '@heroicons/react/24/outline';

export default function Dashboard() {
  const { user } = useAuth();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getRequests().then(data => {
      setRequests(data.data || []);
      setLoading(false);
    }).catch(err => {
      console.error(err);
      setLoading(false);
    });
  }, []);

  if (loading) return <Loader />;

  return (
    <div className="animate-fade-in-up">
      {user?.role === 'developer' && <DeveloperDashboard requests={requests} />}
      {user?.role === 'architect' && <ArchitectDashboard requests={requests} />}
      {user?.role === 'techlead' && <TechLeadDashboard requests={requests} />}
      {user?.role === 'devops' && <DevOpsDashboard requests={requests} />}
      
      {/* Fallback */}
      {!['developer', 'architect', 'techlead', 'devops'].includes(user?.role) && <DeveloperDashboard requests={requests} />}
    </div>
  );
}

// -------------------------------------------------------------
// 1. DEVELOPER DASHBOARD
// -------------------------------------------------------------
function DeveloperDashboard({ requests }) {
  const navigate = useNavigate();
  const activeGenerations = requests.filter(r => ['draft', 'in_progress'].includes(r.status)).length;
  const readyToDownload = requests.filter(r => r.status === 'packaged' || r.status === 'approved').length;

  return (
    <>
      <div className="bg-white rounded-2xl shadow-sm border border-border-light/60 overflow-hidden mt-6">
        <div className="p-6 md:p-8 border-b border-border-light/60 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-input-bg rounded-full mix-blend-multiply filter blur-3xl opacity-50 -translate-y-1/2 translate-x-1/4"></div>
          <div className="relative z-10">
            <h2 className="font-extrabold text-sidebar text-2xl">My Requests</h2>
            <p className="text-sm text-text-secondary mt-1">View the status of your microservice requests, check pipelines, and download generated code.</p>
          </div>
          <button 
            onClick={() => navigate('/request/new')}
            className="relative z-10 flex items-center gap-2 bg-primary-orange hover:bg-hover-orange text-white px-6 py-3 rounded-xl text-sm font-bold shadow-[0_4px_14px_rgba(255,90,20,0.3)] hover:shadow-[0_6px_20px_rgba(255,90,20,0.4)] transition-all hover:-translate-y-0.5 whitespace-nowrap"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
            </svg>
            New Request
          </button>
        </div>
        <RequestTable requests={requests} role="developer" navigate={navigate} />
      </div>
    </>
  );
}

// -------------------------------------------------------------
// 2. SOLUTION ARCHITECT DASHBOARD
// -------------------------------------------------------------
function ArchitectDashboard({ requests }) {
  const navigate = useNavigate();
  const blueprintReviews = requests.filter(r => r.status !== 'draft').length;
  
  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <MetricCard title="Total Blueprints" value={blueprintReviews} icon={<BuildingLibraryIcon className="w-8 h-8" />} />
        <MetricCard title="Pattern Compliance" value="98%" icon={<ShieldCheckIcon className="w-8 h-8" />} gradient={true} />
        <MetricCard title="Processor-Handler Separation" value="Valid" icon={<CheckCircleIcon className="w-8 h-8" />} />
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-border-light/60 overflow-hidden">
        <div className="p-6 md:p-8 border-b border-border-light/60 bg-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-50 rounded-full mix-blend-multiply filter blur-3xl opacity-70 -translate-y-1/2 translate-x-1/4"></div>
          <div className="relative z-10">
            <h2 className="font-extrabold text-sidebar text-2xl">Architecture Blueprints</h2>
            <p className="text-sm text-text-secondary mt-1">Review generated designs against messaging patterns and standards.</p>
          </div>
        </div>
        <RequestTable requests={requests} role="architect" navigate={navigate} />
      </div>
    </>
  );
}

// -------------------------------------------------------------
// 3. TECH LEAD / REVIEWER DASHBOARD
// -------------------------------------------------------------
function TechLeadDashboard({ requests }) {
  const navigate = useNavigate();
  const pendingApprovals = requests.filter(r => ['packaged', 'validated'].includes(r.status)).length;
  
  const sortedRequests = [...requests].sort((a, b) => {
    if (['packaged', 'validated'].includes(a.status) && !['packaged', 'validated'].includes(b.status)) return -1;
    if (['packaged', 'validated'].includes(b.status) && !['packaged', 'validated'].includes(a.status)) return 1;
    return new Date(b.created_at) - new Date(a.created_at);
  });

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-gradient-to-br from-green-500 to-emerald-600 p-6 rounded-2xl shadow-[0_8px_30px_rgba(16,185,129,0.2)] text-white flex justify-between items-start transition-all hover:-translate-y-1 hover:shadow-[0_12px_40px_rgba(16,185,129,0.3)]">
          <div>
            <h3 className="text-white/80 text-sm font-semibold uppercase tracking-wider">Pending Approvals</h3>
            <p className="text-4xl font-extrabold mt-2">{pendingApprovals}</p>
          </div>
          <div className="text-3xl bg-white/20 p-3 rounded-xl backdrop-blur-sm border border-white/30"><ClipboardDocumentCheckIcon className="w-8 h-8" /></div>
        </div>
        <MetricCard title="Validation Warnings" value="0" icon={<ExclamationTriangleIcon className="w-8 h-8" />} />
        <MetricCard title="Traceability Score" value="100%" icon={<MagnifyingGlassIcon className="w-8 h-8" />} />
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-border-light/60 overflow-hidden">
        <div className="p-6 md:p-8 border-b border-border-light/60 bg-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-green-50 rounded-full mix-blend-multiply filter blur-3xl opacity-70 -translate-y-1/2 translate-x-1/4"></div>
          <div className="relative z-10">
            <h2 className="font-extrabold text-sidebar text-2xl">Commit Review Queue</h2>
            <p className="text-sm text-text-secondary mt-1">Review validation reports and approve repository commits.</p>
          </div>
        </div>
        <RequestTable requests={sortedRequests} role="techlead" navigate={navigate} />
      </div>
    </>
  );
}

// -------------------------------------------------------------
// 4. PLATFORM / DEVOPS ENGINEER DASHBOARD
// -------------------------------------------------------------
function DevOpsDashboard({ requests }) {
  const navigate = useNavigate();
  const packagedCount = requests.filter(r => ['packaged', 'approved'].includes(r.status)).length;

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <MetricCard title="Deployment Packages" value={packagedCount} icon={<ArchiveBoxIcon className="w-8 h-8" />} gradient={true} />
        <MetricCard title="CI/CD Pipelines" value="Active" icon={<RocketLaunchIcon className="w-8 h-8" />} />
        <MetricCard title="Config Conventions" value="Valid" icon={<DocumentTextIcon className="w-8 h-8" />} />
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-border-light/60 overflow-hidden">
        <div className="p-6 md:p-8 border-b border-border-light/60 bg-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-purple-50 rounded-full mix-blend-multiply filter blur-3xl opacity-70 -translate-y-1/2 translate-x-1/4"></div>
          <div className="relative z-10">
            <h2 className="font-extrabold text-sidebar text-2xl">Deployment Readiness</h2>
            <p className="text-sm text-text-secondary mt-1">Inspect packaging, YAML configurations, and environment variables.</p>
          </div>
        </div>
        <RequestTable requests={requests} role="devops" navigate={navigate} />
      </div>
    </>
  );
}

// -------------------------------------------------------------
// SHARED COMPONENTS
// -------------------------------------------------------------
function MetricCard({ title, value, icon, gradient = false }) {
  if (gradient) {
    return (
      <div className="bg-gradient-to-br from-primary-orange to-button-orange p-6 rounded-2xl shadow-[0_8px_30px_rgba(255,90,20,0.2)] text-white flex justify-between items-start transition-all hover:-translate-y-1 hover:shadow-[0_12px_40px_rgba(255,90,20,0.3)]">
        <div>
          <h3 className="text-white/90 text-xs font-bold uppercase tracking-wider">{title}</h3>
          <p className="text-4xl font-extrabold mt-2">{value}</p>
        </div>
        <div className="text-3xl bg-white/20 p-3 rounded-xl backdrop-blur-sm border border-white/30">{icon}</div>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-border-light/60 flex justify-between items-start transition-all hover:-translate-y-1 hover:shadow-md hover:border-border-orange/30 group">
      <div>
        <h3 className="text-text-secondary text-xs font-bold uppercase tracking-wider group-hover:text-primary-orange transition-colors">{title}</h3>
        <p className="text-4xl font-extrabold text-sidebar mt-2">{value}</p>
      </div>
      <div className="text-3xl bg-input-bg text-primary-orange p-3 rounded-xl border border-border-orange/20 group-hover:bg-primary-orange group-hover:text-white transition-colors">{icon}</div>
    </div>
  );
}


