import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getDashboardMetrics, getRequests } from '../api/api';
import Loader from '../components/Loader';
import { useNavigate } from 'react-router-dom';
import { BuildingLibraryIcon, ShieldCheckIcon, DocumentCheckIcon, LightBulbIcon, ArrowTrendingUpIcon, ArrowTrendingDownIcon } from '@heroicons/react/24/outline';

export default function ArchitectDashboard() {
  const { user } = useAuth();
  const [metrics, setMetrics] = useState(null);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    Promise.all([
      getDashboardMetrics('architect'),
      getRequests()
    ]).then(([metricsRes, requestsRes]) => {
      if (metricsRes.success) setMetrics(metricsRes.data);
      if (requestsRes.success) setRequests(requestsRes.data || []);
      setLoading(false);
    }).catch((err) => {
      console.error(err);
      setLoading(false);
    });
  }, []);

  const getStatusColor = (status) => {
    switch(status) {
      case 'approved':
      case 'validated':
        return { bg: 'bg-green-100', text: 'text-green-700', icon: 'text-green-600' };
      case 'draft': return { bg: 'bg-yellow-100', text: 'text-yellow-700', icon: 'text-yellow-600' };
      case 'rework': return { bg: 'bg-red-100', text: 'text-red-700', icon: 'text-red-600' };
      default: return { bg: 'bg-gray-100', text: 'text-gray-700', icon: 'text-gray-600' };
    }
  };

  const formatIST = (dateStr) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    const corrected = new Date(d.getTime() - (5.5 * 60 * 60 * 1000));
    return corrected.toLocaleString('en-IN', {
      timeZone: 'Asia/Kolkata',
      month: 'short', day: 'numeric',
      hour: '2-digit', minute: '2-digit', hour12: true
    });
  };

  if (loading || !metrics) return <Loader />;

  return (
    <div className="animate-fade-in-up">
      <div className="mb-8">
        <h1 className="text-2xl font-extrabold text-sidebar tracking-tight">Architecture Portal</h1>
        <p className="text-text-secondary mt-1">Review architecture drafts against messaging patterns.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-gradient-to-br from-primary-orange to-button-orange p-6 rounded-2xl shadow-lg shadow-primary-orange/20 text-white flex flex-col justify-between transition-all hover:-translate-y-1 hover:shadow-xl hover:shadow-primary-orange/30 group">
          <div className="flex justify-between items-start mb-4">
            <h3 className="text-white/90 text-xs font-bold uppercase tracking-wider">Architecture Reviews</h3>
            <div className="bg-white/20 p-2 rounded-xl backdrop-blur-sm border border-white/30 group-hover:rotate-12 transition-transform duration-300">
              <BuildingLibraryIcon className="w-6 h-6" />
            </div>
          </div>
          <div>
            <p className="text-4xl font-extrabold">{metrics.architecture_reviews}</p>
            <p className="text-sm text-white/80 mt-2 flex items-center gap-1">
              {requests.filter(r => r.status === 'draft').length > 0 
                ? <><ArrowTrendingUpIcon className="w-4 h-4" /> {requests.filter(r => r.status === 'draft').length} pending action</>
                : 'All caught up'
              }
            </p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-border-light/60 flex flex-col justify-between transition-all hover:-translate-y-1 hover:shadow-md hover:border-blue-300 group relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-blue-50 rounded-full mix-blend-multiply filter blur-xl opacity-50 -translate-y-1/2 translate-x-1/2 group-hover:scale-150 transition-transform duration-500"></div>
          <div className="flex justify-between items-start mb-4 relative z-10">
            <h3 className="text-text-secondary text-xs font-bold uppercase tracking-wider group-hover:text-blue-600 transition-colors">Pattern Matches</h3>
            <div className="bg-blue-50 text-blue-600 p-2 rounded-xl border border-blue-100 group-hover:bg-blue-600 group-hover:text-white transition-colors duration-300">
              <ShieldCheckIcon className="w-6 h-6" />
            </div>
          </div>
          <div className="relative z-10">
            <p className="text-4xl font-extrabold text-sidebar">{metrics.pattern_matches}</p>
            <p className="text-sm text-green-500 mt-2 flex items-center gap-1 font-medium">
              <ShieldCheckIcon className="w-4 h-4" /> 
              {metrics.pattern_matches > 0 ? 'Verified patterns' : 'Awaiting verification'}
            </p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-border-light/60 flex flex-col justify-between transition-all hover:-translate-y-1 hover:shadow-md hover:border-purple-300 group relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-purple-50 rounded-full mix-blend-multiply filter blur-xl opacity-50 -translate-y-1/2 translate-x-1/2 group-hover:scale-150 transition-transform duration-500"></div>
          <div className="flex justify-between items-start mb-4 relative z-10">
            <h3 className="text-text-secondary text-xs font-bold uppercase tracking-wider group-hover:text-purple-600 transition-colors">Blueprint History</h3>
            <div className="bg-purple-50 text-purple-600 p-2 rounded-xl border border-purple-100 group-hover:bg-purple-600 group-hover:text-white transition-colors duration-300">
              <DocumentCheckIcon className="w-6 h-6" />
            </div>
          </div>
          <div className="relative z-10">
            <p className="text-4xl font-extrabold text-sidebar">{metrics.blueprint_history}</p>
            <p className="text-sm text-text-secondary mt-2 font-medium">
              {requests.filter(r => ['approved', 'validated', 'generating', 'packaged', 'completed'].includes(r.status)).length} active blueprints
            </p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-border-light/60 flex flex-col justify-between transition-all hover:-translate-y-1 hover:shadow-md hover:border-amber-300 group relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-amber-50 rounded-full mix-blend-multiply filter blur-xl opacity-50 -translate-y-1/2 translate-x-1/2 group-hover:scale-150 transition-transform duration-500"></div>
          <div className="flex justify-between items-start mb-4 relative z-10">
            <h3 className="text-text-secondary text-xs font-bold uppercase tracking-wider group-hover:text-amber-600 transition-colors">Knowledge Updates</h3>
            <div className="bg-amber-50 text-amber-600 p-2 rounded-xl border border-amber-100 group-hover:bg-amber-600 group-hover:text-white transition-colors duration-300">
              <LightBulbIcon className="w-6 h-6" />
            </div>
          </div>
          <div className="relative z-10">
            <p className="text-4xl font-extrabold text-sidebar">{metrics.knowledge_updates}</p>
            <p className="text-sm text-text-secondary mt-2 flex items-center gap-1 font-medium">
              <LightBulbIcon className="w-4 h-4" /> 
              {metrics.knowledge_updates > 0 ? 'Standards updated' : 'Up to date'}
            </p>
          </div>
        </div>
      </div>
      
      {/* Dynamic Content Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        
        {/* Left Column: Recent Blueprints & Compliance */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          {/* Recent Blueprints List (Dynamic) */}
          <div className="bg-white rounded-2xl shadow-sm border border-border-light/60 p-6 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-400 to-purple-400"></div>
            <h2 className="text-lg font-bold text-sidebar mb-4">Recent Architecture Requests</h2>
            <div className="space-y-3">
              {requests.slice(0, 4).map((req) => {
                const colors = getStatusColor(req.status);
                const displayStatus = req.status === 'validated' ? 'approved' : req.status;
                return (
                  <div key={req.id} onClick={() => navigate(`/requests/${req.id}/blueprint`)} className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 transition-all border border-transparent hover:border-slate-200 cursor-pointer group hover:shadow-sm">
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-xl ${colors.bg} ${colors.icon} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                        <DocumentCheckIcon className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-sidebar group-hover:text-primary-orange transition-colors">{req.request_name}</p>
                        <p className="text-xs text-text-secondary capitalize">{displayStatus} • {formatIST(req.created_at)}</p>
                      </div>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${colors.bg} ${colors.text} capitalize shadow-sm`}>
                      {displayStatus}
                    </span>
                  </div>
                );
              })}
              {requests.length === 0 && (
                <div className="text-center py-6 text-gray-500 italic">No recent requests found.</div>
              )}
            </div>
            <button onClick={() => navigate('/review/blueprint')} className="mt-5 w-full bg-slate-50 hover:bg-slate-100 text-sm font-bold text-slate-700 py-2.5 rounded-xl transition-colors border border-slate-200">
              View all requests &rarr;
            </button>
          </div>
        </div>

        {/* Right Column: Pattern Compliance Meter & Standards */}
        <div className="flex flex-col gap-6">

          {/* Architecture Health Widget */}
          <div className="bg-white rounded-2xl shadow-sm border border-border-light/60 p-6">
            <h2 className="text-lg font-bold text-sidebar mb-4">Pipeline Health</h2>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-text-secondary font-medium">Drafts (Needs Review)</span>
                  <span className="font-bold text-sidebar">{requests.filter(r => r.status === 'draft').length}</span>
                </div>
                <div className="w-full bg-input-bg rounded-full h-2">
                  <div className="bg-yellow-400 h-2 rounded-full transition-all duration-1000" style={{ width: `${Math.max(2, (requests.filter(r => r.status === 'draft').length / (requests.length || 1)) * 100)}%` }}></div>
                </div>
              </div>
              
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-text-secondary font-medium">Approved Patterns</span>
                  <span className="font-bold text-sidebar">{requests.filter(r => ['approved', 'validated', 'generating', 'packaged', 'completed'].includes(r.status)).length}</span>
                </div>
                <div className="w-full bg-input-bg rounded-full h-2">
                  <div className="bg-green-500 h-2 rounded-full transition-all duration-1000" style={{ width: `${Math.max(2, (requests.filter(r => ['approved', 'validated', 'generating', 'packaged', 'completed'].includes(r.status)).length / (requests.length || 1)) * 100)}%` }}></div>
                </div>
              </div>
              
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-text-secondary font-medium">Requires Rework</span>
                  <span className="font-bold text-sidebar">{requests.filter(r => r.status === 'rework' || r.status === 'rejected').length}</span>
                </div>
                <div className="w-full bg-input-bg rounded-full h-2">
                  <div className="bg-red-400 h-2 rounded-full transition-all duration-1000" style={{ width: `${Math.max(2, (requests.filter(r => r.status === 'rework' || r.status === 'rejected').length / (requests.length || 1)) * 100)}%` }}></div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Enhanced Design Standards Section */}
          <div className="bg-gradient-to-br from-[#1E293B] to-[#0F172A] rounded-2xl p-6 text-white relative overflow-hidden shadow-xl border border-gray-800 h-full flex flex-col">
            <div className="absolute top-0 right-0 w-48 h-48 bg-primary-orange/20 rounded-full mix-blend-screen filter blur-3xl -translate-y-1/2 translate-x-1/4"></div>
            <div className="relative z-10 flex flex-col h-full">
              <div className="flex items-center gap-2 mb-2">
                <LightBulbIcon className="w-6 h-6 text-primary-orange" />
                <h2 className="text-xl font-bold">Design Standards</h2>
              </div>
              <p className="text-gray-400 text-xs mb-6 flex-grow">
                Ensure all microservices adhere to standard patterns for stateful processors, event sourcing, and CQRS architectures.
              </p>
              <div className="flex flex-col gap-2 mt-auto">
                <button onClick={() => navigate('/standards')} className="w-full bg-primary-orange hover:bg-hover-orange text-white px-4 py-2.5 rounded-lg text-sm font-bold transition-all shadow-[0_0_15px_rgba(255,90,20,0.3)] hover:shadow-[0_4px_20px_rgba(255,90,20,0.5)]">
                  Update Patterns
                </button>
                <button onClick={() => navigate('/standards')} className="w-full bg-white/5 hover:bg-white/10 text-white px-4 py-2.5 rounded-lg text-sm font-medium transition-colors border border-white/10 backdrop-blur-sm">
                  View Guidelines
                </button>
              </div>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
