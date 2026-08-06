import { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
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
    <div className="flex flex-col h-full animate-fade-in-up">
      <Navbar title={`${user?.role || 'User'} Dashboard`} />
      <div className="p-8">
        {user?.id === 'developer' && <DeveloperDashboard requests={requests} />}
        {user?.id === 'architect' && <ArchitectDashboard requests={requests} />}
        {user?.id === 'techlead' && <TechLeadDashboard requests={requests} />}
        {user?.id === 'devops' && <DevOpsDashboard requests={requests} />}
        
        {/* Fallback */}
        {!['developer', 'architect', 'techlead', 'devops'].includes(user?.id) && <DeveloperDashboard requests={requests} />}
      </div>
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
        <MetricCard title="Ready to Download" value={readyToDownload} icon="📦" />
        <MetricCard title="Schema Validations" value="100%" icon="✨" />
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-border-light overflow-hidden">
        <div className="p-6 border-b border-border-light flex justify-between items-center bg-gray-50">
          <div>
            <h2 className="font-bold text-gray-800 text-lg">My Skeletons</h2>
            <p className="text-sm text-gray-500">Provide topics and schemas, trigger AI generation, and download code.</p>
          </div>
          <button 
            onClick={() => navigate('/requests/new')}
            className="bg-primary-orange hover:bg-hover-orange text-white px-5 py-2.5 rounded-lg text-sm font-bold shadow-md transition-all"
          >
            + New Microservice Skeleton
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
        <MetricCard title="Pattern Compliance" value="98%" icon="🛡️" />
        <MetricCard title="Processor-Handler Separation" value="Valid" icon="✅" />
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-border-light overflow-hidden">
        <div className="p-6 border-b border-border-light bg-gray-50">
          <h2 className="font-bold text-gray-800 text-lg">Architecture Blueprints</h2>
          <p className="text-sm text-gray-500">Review generated designs against messaging patterns and standards.</p>
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
        <div className="bg-gradient-to-r from-green-600 to-emerald-500 p-6 rounded-xl shadow-md text-white">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-green-100 text-sm font-medium">Pending Approvals</h3>
              <p className="text-4xl font-extrabold mt-2">{pendingApprovals}</p>
            </div>
            <div className="text-4xl opacity-50">📋</div>
          </div>
        </div>
        <MetricCard title="Validation Warnings" value="0" icon="⚠️" />
        <MetricCard title="Traceability Score" value="100%" icon="🔍" />
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-border-light overflow-hidden">
        <div className="p-6 border-b border-border-light bg-gray-50">
          <h2 className="font-bold text-gray-800 text-lg">Commit Review Queue</h2>
          <p className="text-sm text-gray-500">Review validation reports and approve repository commits.</p>
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
        <MetricCard title="Deployment Packages" value={packagedCount} icon="⚙️" />
        <MetricCard title="CI/CD Pipelines" value="Active" icon="🚀" />
        <MetricCard title="Config Conventions" value="Valid" icon="📝" />
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-border-light overflow-hidden">
        <div className="p-6 border-b border-border-light bg-gray-50">
          <h2 className="font-bold text-gray-800 text-lg">Deployment Readiness</h2>
          <p className="text-sm text-gray-500">Inspect packaging, YAML configurations, and environment variables.</p>
        </div>
        <RequestTable requests={requests} role="devops" navigate={navigate} />
      </div>
    </>
  );
}

// -------------------------------------------------------------
// SHARED COMPONENTS
// -------------------------------------------------------------
function MetricCard({ title, value, icon }) {
  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-border-light flex justify-between items-start transition-transform hover:-translate-y-1 hover:shadow-md">
      <div>
        <h3 className="text-gray-500 text-sm font-medium">{title}</h3>
        <p className="text-3xl font-extrabold text-gray-900 mt-2">{value}</p>
      </div>
      <div className="text-3xl bg-gray-50 p-3 rounded-lg border border-gray-100">{icon}</div>
    </div>
  );
}

function RequestTable({ requests, role, navigate }) {
  return (
    <table className="w-full text-left">
      <thead>
        <tr className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider border-b border-gray-200">
          <th className="p-4 font-semibold">ID</th>
          <th className="p-4 font-semibold">Microservice Request</th>
          <th className="p-4 font-semibold">Target App ID</th>
          <th className="p-4 font-semibold">Status</th>
          <th className="p-4 font-semibold">Date</th>
          <th className="p-4 font-semibold text-right">Action</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-border-light">
        {requests.map(req => (
          <tr key={req.id} className="hover:bg-gray-50 transition-colors">
            <td className="p-4 text-sm text-gray-500 font-mono">#{req.id}</td>
            <td className="p-4 text-sm font-bold text-gray-900">{req.request_name}</td>
            <td className="p-4 text-sm text-gray-600 font-mono">
              <span className="bg-gray-100 border border-gray-200 rounded px-2 py-1 inline-block">{req.application_id}</span>
            </td>
            <td className="p-4"><StatusBadge status={req.status} /></td>
            <td className="p-4 text-sm text-gray-500">{new Date(req.created_at).toLocaleDateString()}</td>
            <td className="p-4 text-sm font-medium text-right">
              {role === 'techlead' && ['packaged', 'validated'].includes(req.status) ? (
                <button 
                  onClick={() => navigate(`/requests/${req.id}/review`)}
                  className="text-green-600 hover:text-green-800 bg-green-50 hover:bg-green-100 border border-green-200 px-4 py-1.5 rounded shadow-sm transition-all"
                >
                  Approve/Rework
                </button>
              ) : role === 'architect' ? (
                <button 
                  onClick={() => navigate(`/requests/${req.id}/blueprint`)}
                  className="text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 border border-blue-200 px-4 py-1.5 rounded shadow-sm transition-all"
                >
                  Review Blueprint
                </button>
              ) : role === 'devops' && ['packaged', 'approved'].includes(req.status) ? (
                <button 
                  onClick={() => navigate(`/requests/${req.id}/package`)}
                  className="text-purple-600 hover:text-purple-800 bg-purple-50 hover:bg-purple-100 border border-purple-200 px-4 py-1.5 rounded shadow-sm transition-all"
                >
                  Inspect Package
                </button>
              ) : role === 'developer' && ['packaged', 'approved'].includes(req.status) ? (
                <button 
                  onClick={() => navigate(`/requests/${req.id}/package`)}
                  className="text-primary-orange hover:text-hover-orange bg-orange-50 hover:bg-orange-100 border border-orange-200 px-4 py-1.5 rounded shadow-sm transition-all"
                >
                  Download Skeleton
                </button>
              ) : (
                <button 
                  onClick={() => navigate(`/requests/${req.id}/patterns`)}
                  className="text-gray-600 hover:text-gray-800 hover:underline transition-colors px-4 py-1.5"
                >
                  View Details
                </button>
              )}
            </td>
          </tr>
        ))}
        {requests.length === 0 && (
          <tr>
            <td colSpan="6" className="p-12 text-center text-gray-500">
              <div className="text-4xl mb-3 opacity-50">📭</div>
              No requests found.
            </td>
          </tr>
        )}
      </tbody>
    </table>
  );
}
