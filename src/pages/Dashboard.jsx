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
        {user?.id === 'ba' && <BADashboard requests={requests} />}
        
        {/* Fallback if no specific role */}
        {!['developer', 'architect', 'ba'].includes(user?.id) && <DeveloperDashboard requests={requests} />}
      </div>
    </div>
  );
}

// -------------------------------------------------------------
// DEVELOPER DASHBOARD
// -------------------------------------------------------------
function DeveloperDashboard({ requests }) {
  const navigate = useNavigate();
  
  const successRate = "98%";
  const activeGenerations = requests.filter(r => ['draft', 'in_progress'].includes(r.status)).length;
  const readyToDownload = requests.filter(r => r.status === 'packaged').length;

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <MetricCard title="Generation Success Rate" value={successRate} icon="⚡" />
        <MetricCard title="Active Generations" value={activeGenerations} icon="⏳" />
        <MetricCard title="Ready to Download" value={readyToDownload} icon="📦" />
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-border-light overflow-hidden">
        <div className="p-6 border-b border-border-light flex justify-between items-center bg-gray-50">
          <div>
            <h2 className="font-bold text-gray-800 text-lg">My Generations</h2>
            <p className="text-sm text-gray-500">Track and download your Kafka microservice skeletons.</p>
          </div>
          <button 
            onClick={() => navigate('/requests/new')}
            className="bg-primary-orange hover:bg-hover-orange text-white px-5 py-2.5 rounded-lg text-sm font-bold shadow-md transition-all transform hover:-translate-y-0.5"
          >
            + New Generation Request
          </button>
        </div>
        <RequestTable requests={requests} role="developer" navigate={navigate} />
      </div>
    </>
  );
}

// -------------------------------------------------------------
// ARCHITECT DASHBOARD
// -------------------------------------------------------------
function ArchitectDashboard({ requests }) {
  const navigate = useNavigate();
  
  const pendingReviews = requests.filter(r => r.status === 'packaged' || r.status === 'validated').length;
  const approvedDesigns = requests.filter(r => r.status === 'approved').length;
  const complianceRate = "100%";

  // Prioritize requests that need review
  const sortedRequests = [...requests].sort((a, b) => {
    if (['packaged', 'validated'].includes(a.status) && !['packaged', 'validated'].includes(b.status)) return -1;
    if (['packaged', 'validated'].includes(b.status) && !['packaged', 'validated'].includes(a.status)) return 1;
    return new Date(b.created_at) - new Date(a.created_at);
  });

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-gradient-to-r from-blue-600 to-cyan-500 p-6 rounded-xl shadow-md text-white">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-blue-100 text-sm font-medium">Pending Reviews</h3>
              <p className="text-4xl font-extrabold mt-2">{pendingReviews}</p>
            </div>
            <div className="text-4xl opacity-50">📋</div>
          </div>
        </div>
        <MetricCard title="Approved Designs" value={approvedDesigns} icon="✅" />
        <MetricCard title="Architecture Compliance" value={complianceRate} icon="🛡️" />
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-border-light overflow-hidden">
        <div className="p-6 border-b border-border-light bg-gray-50">
          <h2 className="font-bold text-gray-800 text-lg">Architecture Review Queue</h2>
          <p className="text-sm text-gray-500">Review validation reports and blueprints before approving repository commits.</p>
        </div>
        <RequestTable requests={sortedRequests} role="architect" navigate={navigate} />
      </div>
    </>
  );
}

// -------------------------------------------------------------
// BUSINESS ANALYST DASHBOARD
// -------------------------------------------------------------
function BADashboard({ requests }) {
  const navigate = useNavigate();
  
  const totalFlows = requests.length;
  const draftFlows = requests.filter(r => r.status === 'draft').length;

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <MetricCard title="Business Flows Mapped" value={totalFlows} icon="📊" />
        <MetricCard title="Draft Requirements" value={draftFlows} icon="📝" />
        <MetricCard title="Schema Compliance" value={"100%"} icon="✨" />
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-border-light overflow-hidden">
        <div className="p-6 border-b border-border-light bg-gray-50">
          <h2 className="font-bold text-gray-800 text-lg">Requirements Tracking</h2>
          <p className="text-sm text-gray-500">Track high-level business flows and target applications.</p>
        </div>
        <RequestTable requests={requests} role="ba" navigate={navigate} />
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
          <th className="p-4 font-semibold">Business Flow / Request</th>
          <th className="p-4 font-semibold">Target App</th>
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
              {role === 'architect' && ['packaged', 'validated'].includes(req.status) ? (
                <button 
                  onClick={() => navigate(`/requests/${req.id}/review`)}
                  className="text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 border border-blue-200 px-4 py-1.5 rounded shadow-sm transition-all"
                >
                  Review Now
                </button>
              ) : role === 'developer' && req.status === 'packaged' ? (
                <button 
                  onClick={() => navigate(`/requests/${req.id}/package`)}
                  className="text-green-600 hover:text-green-800 bg-green-50 hover:bg-green-100 border border-green-200 px-4 py-1.5 rounded shadow-sm transition-all"
                >
                  Download
                </button>
              ) : (
                <button 
                  onClick={() => navigate(`/requests/${req.id}/patterns`)}
                  className="text-primary-orange hover:text-hover-orange hover:underline transition-colors px-4 py-1.5"
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
