import { useEffect, useState } from 'react';
import { getRequests } from '../api/api';
import Loader from '../components/Loader';
import StatusBadge from '../components/StatusBadge';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

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
      {user?.id === 'developer' && <DeveloperDashboard requests={requests} />}
      {user?.id === 'architect' && <ArchitectDashboard requests={requests} />}
      {user?.id === 'techlead' && <TechLeadDashboard requests={requests} />}
      {user?.id === 'devops' && <DevOpsDashboard requests={requests} />}
      
      {/* Fallback */}
      {!['developer', 'architect', 'techlead', 'devops'].includes(user?.id) && <DeveloperDashboard requests={requests} />}
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
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <MetricCard title="Active Configurations" value={activeGenerations} icon="⏳" />
        <MetricCard title="Ready to Download" value={readyToDownload} icon="📦" gradient={true} />
        <MetricCard title="Schema Validations" value="100%" icon="✨" />
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-border-light/60 overflow-hidden">
        <div className="p-6 md:p-8 border-b border-border-light/60 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-input-bg rounded-full mix-blend-multiply filter blur-3xl opacity-50 -translate-y-1/2 translate-x-1/4"></div>
          <div className="relative z-10">
            <h2 className="font-extrabold text-sidebar text-2xl">My Skeletons</h2>
            <p className="text-sm text-text-secondary mt-1">Provide topics and schemas, trigger AI generation, and download code.</p>
          </div>
          <button 
            onClick={() => navigate('/requests/new')}
            className="relative z-10 flex items-center gap-2 bg-primary-orange hover:bg-hover-orange text-white px-6 py-3 rounded-xl text-sm font-bold shadow-[0_4px_14px_rgba(255,90,20,0.3)] hover:shadow-[0_6px_20px_rgba(255,90,20,0.4)] transition-all hover:-translate-y-0.5 whitespace-nowrap"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
            </svg>
            New Microservice Skeleton
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
        <MetricCard title="Total Blueprints" value={blueprintReviews} icon="🏗️" />
        <MetricCard title="Pattern Compliance" value="98%" icon="🛡️" gradient={true} />
        <MetricCard title="Processor-Handler Separation" value="Valid" icon="✅" />
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
          <div className="text-3xl bg-white/20 p-3 rounded-xl backdrop-blur-sm border border-white/30">📋</div>
        </div>
        <MetricCard title="Validation Warnings" value="0" icon="⚠️" />
        <MetricCard title="Traceability Score" value="100%" icon="🔍" />
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
        <MetricCard title="Deployment Packages" value={packagedCount} icon="⚙️" gradient={true} />
        <MetricCard title="CI/CD Pipelines" value="Active" icon="🚀" />
        <MetricCard title="Config Conventions" value="Valid" icon="📝" />
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

function RequestTable({ requests, role, navigate }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left">
        <thead>
          <tr className="bg-input-bg/50 text-text-secondary text-[11px] font-bold uppercase tracking-wider border-b border-border-light/60">
            <th className="px-6 py-4 rounded-tl-lg">ID</th>
            <th className="px-6 py-4">Microservice Request</th>
            <th className="px-6 py-4">Target App ID</th>
            <th className="px-6 py-4">Status</th>
            <th className="px-6 py-4">Date</th>
            <th className="px-6 py-4 text-right rounded-tr-lg">Action</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border-light/40">
          {requests.map(req => (
            <tr key={req.id} className="hover:bg-input-bg/30 transition-colors group">
              <td className="px-6 py-5 text-sm text-text-secondary font-mono font-medium">#{req.id}</td>
              <td className="px-6 py-5 text-sm font-extrabold text-sidebar">{req.request_name}</td>
              <td className="px-6 py-5 text-sm">
                <span className="bg-white border border-border-light/80 text-text-secondary font-mono text-xs font-semibold rounded-md px-2.5 py-1.5 inline-block shadow-sm">
                  {req.application_id}
                </span>
              </td>
              <td className="px-6 py-5"><StatusBadge status={req.status} /></td>
              <td className="px-6 py-5 text-sm font-medium text-text-secondary">{new Date(req.created_at).toLocaleDateString()}</td>
              <td className="px-6 py-5 text-sm font-medium text-right">
                {role === 'techlead' && ['packaged', 'validated'].includes(req.status) ? (
                  <button 
                    onClick={() => navigate(`/requests/${req.id}/review`)}
                    className="text-emerald-700 bg-emerald-50 hover:bg-emerald-600 hover:text-white border border-emerald-200 hover:border-emerald-600 px-4 py-2 rounded-lg font-bold shadow-sm transition-all"
                  >
                    Approve / Rework
                  </button>
                ) : role === 'architect' ? (
                  <button 
                    onClick={() => navigate(`/requests/${req.id}/blueprint`)}
                    className="text-blue-700 bg-blue-50 hover:bg-blue-600 hover:text-white border border-blue-200 hover:border-blue-600 px-4 py-2 rounded-lg font-bold shadow-sm transition-all"
                  >
                    Review Blueprint
                  </button>
                ) : role === 'devops' && ['packaged', 'approved'].includes(req.status) ? (
                  <button 
                    onClick={() => navigate(`/requests/${req.id}/package`)}
                    className="text-purple-700 bg-purple-50 hover:bg-purple-600 hover:text-white border border-purple-200 hover:border-purple-600 px-4 py-2 rounded-lg font-bold shadow-sm transition-all"
                  >
                    Inspect Package
                  </button>
                ) : role === 'developer' && ['packaged', 'approved'].includes(req.status) ? (
                  <button 
                    onClick={() => navigate(`/requests/${req.id}/package`)}
                    className="text-primary-orange bg-input-bg hover:bg-primary-orange hover:text-white border border-border-orange/40 hover:border-primary-orange px-4 py-2 rounded-lg font-bold shadow-sm transition-all"
                  >
                    Download Skeleton
                  </button>
                ) : (
                  <button 
                    onClick={() => navigate(`/requests/${req.id}/patterns`)}
                    className="text-text-secondary hover:text-primary-orange hover:bg-input-bg border border-transparent hover:border-border-orange/20 px-4 py-2 rounded-lg font-bold transition-all"
                  >
                    View Details
                  </button>
                )}
              </td>
            </tr>
          ))}
          {requests.length === 0 && (
            <tr>
              <td colSpan="6" className="p-16 text-center">
                <div className="w-20 h-20 bg-input-bg rounded-full flex items-center justify-center mx-auto mb-4 border border-border-orange/20">
                  <span className="text-4xl">📭</span>
                </div>
                <h3 className="text-lg font-bold text-sidebar mb-1">No requests found</h3>
                <p className="text-text-secondary text-sm">Get started by creating a new microservice skeleton.</p>
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
