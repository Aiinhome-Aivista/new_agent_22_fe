import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useProject } from '../context/ProjectContext';
import { getDashboardMetrics, getRequests } from '../api/api';
import Loader from '../components/Loader';
import ProjectsDirectoryPage from './ProjectsDirectoryPage';
import { useNavigate, Navigate } from 'react-router-dom';
import { 
  BuildingLibraryIcon, 
  ShieldCheckIcon, 
  DocumentCheckIcon, 
  LightBulbIcon, 
  ArrowTrendingUpIcon,
  ChevronRightIcon,
  FolderIcon,
  QueueListIcon
} from '@heroicons/react/24/outline';

export default function ArchitectDashboard() {
  const { user } = useAuth();
  const { currentProject, currentTrack, selectProject, selectTrack } = useProject();
  const [metrics, setMetrics] = useState(null);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    Promise.all([
      getDashboardMetrics('architect', currentTrack?.id),
      getRequests()
    ]).then(([metricsRes, requestsRes]) => {
      if (metricsRes.success) setMetrics(metricsRes.data);
      if (requestsRes.success) setRequests(requestsRes.data || []);
      setLoading(false);
    }).catch((err) => {
      console.error(err);
      setLoading(false);
    });
  }, [currentTrack]);

  const getStatusColor = (status) => {
    switch(status) {
      case 'approved':
      case 'validated':
      case 'packaged':
      case 'completed':
        return { bg: 'bg-[#f0fdf4]', text: 'text-[#15803d]', border: 'border-[#bbf7d0]' };
      case 'draft': return { bg: 'bg-[#fefce8]', text: 'text-[#a16207]', border: 'border-[#fef08a]' };
      case 'rework': return { bg: 'bg-[#fef2f2]', text: 'text-[#b91c1c]', border: 'border-[#fecaca]' };
      default: return { bg: 'bg-slate-100', text: 'text-slate-700', border: 'border-slate-200' };
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

  // If no track is currently selected, redirect to Projects Directory view
  if (!currentTrack || !currentProject) {
    return <Navigate to="/projects" replace />;
  }

  // Filter requests strictly for the active track
  const trackRequests = requests.filter(r => 
    r.track_id === currentTrack.id || 
    r.track_name === currentTrack.track_name ||
    (currentTrack.track_name && r.request_name && r.request_name.toLowerCase().includes(currentTrack.track_name.toLowerCase()))
  );

  const pendingDraftsCount = trackRequests.filter(r => r.status === 'draft').length;
  const approvedPatternsCount = trackRequests.filter(r => ['approved', 'validated', 'generating', 'packaged', 'completed'].includes(r.status)).length;
  const reworkCount = trackRequests.filter(r => r.status === 'rework' || r.status === 'rejected').length;

  return (
    <div className="animate-fade-in-up">
      
      {/* Track Context & Breadcrumb Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          {/* Breadcrumb Navigation */}
          <div className="flex flex-wrap items-center gap-2 text-xs text-text-secondary mb-1">
            <button 
              onClick={() => { selectTrack(null, null); navigate('/projects'); }}
              className="hover:text-primary-orange transition-colors font-bold flex items-center gap-1"
            >
              <FolderIcon className="w-3.5 h-3.5 text-primary-orange" />
              Projects Directory
            </button>
            <ChevronRightIcon className="w-3 h-3 text-placeholder" />
            <span className="font-bold text-sidebar">{currentProject.name}</span>
            <ChevronRightIcon className="w-3 h-3 text-placeholder" />
            <span className="text-primary-orange font-extrabold flex items-center gap-1">
              <QueueListIcon className="w-3.5 h-3.5" />
              {currentTrack.track_name}
            </span>
          </div>

          <h1 className="text-2xl font-extrabold text-sidebar tracking-tight">Architecture Portal</h1>
          <p className="text-text-secondary text-sm mt-0.5">
            Review architecture drafts against messaging patterns for <span className="font-bold text-sidebar">{currentTrack.track_name}</span>.
          </p>
        </div>

        <button
          onClick={() => { selectTrack(null, currentProject); navigate('/projects'); }}
          className="self-start md:self-auto text-xs font-bold text-primary-orange hover:bg-orange-50 border border-orange-200 px-3.5 py-1.5 rounded-xl transition-all"
        >
          Switch Track / Project &rarr;
        </button>
      </div>

      {/* 4 Metric Cards (Scoped Strictly to Active Track) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        
        {/* Architecture Reviews */}
        <div className="bg-gradient-to-br from-primary-orange to-button-orange p-6 rounded-2xl shadow-lg shadow-primary-orange/20 text-white flex flex-col justify-between transition-all hover:-translate-y-1 hover:shadow-xl hover:shadow-primary-orange/30 group">
          <div className="flex justify-between items-start mb-4">
            <h3 className="text-white/90 text-xs font-bold uppercase tracking-wider">Architecture Reviews</h3>
            <div className="bg-white/20 p-2 rounded-xl backdrop-blur-sm border border-white/30 group-hover:rotate-12 transition-transform duration-300">
              <BuildingLibraryIcon className="w-6 h-6" />
            </div>
          </div>
          <div>
            <p className="text-4xl font-extrabold">{trackRequests.length}</p>
            <p className="text-sm text-white/80 mt-2 flex items-center gap-1 font-medium">
              {pendingDraftsCount > 0 
                ? <><ArrowTrendingUpIcon className="w-4 h-4" /> {pendingDraftsCount} pending action</>
                : 'All caught up'
              }
            </p>
          </div>
        </div>

        {/* Pattern Matches */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-border-light/60 flex flex-col justify-between transition-all hover:-translate-y-1 hover:shadow-md hover:border-primary-orange/50 group relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-orange-50/60 rounded-full mix-blend-multiply filter blur-xl opacity-50 -translate-y-1/2 translate-x-1/2 group-hover:scale-150 transition-transform duration-500"></div>
          <div className="flex justify-between items-start mb-4 relative z-10">
            <h3 className="text-text-secondary text-xs font-bold uppercase tracking-wider group-hover:text-primary-orange transition-colors">Pattern Matches</h3>
            <div className="bg-orange-50 text-primary-orange p-2 rounded-xl border border-orange-100 group-hover:bg-primary-orange group-hover:text-white transition-colors duration-300">
              <ShieldCheckIcon className="w-6 h-6" />
            </div>
          </div>
          <div className="relative z-10">
            <p className="text-4xl font-extrabold text-sidebar">{approvedPatternsCount}</p>
            <p className="text-xs text-primary-orange mt-2 flex items-center gap-1 font-bold">
              <ShieldCheckIcon className="w-4 h-4" /> 
              {approvedPatternsCount > 0 ? 'Verified patterns' : 'Awaiting verification'}
            </p>
          </div>
        </div>

        {/* Blueprint History */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-border-light/60 flex flex-col justify-between transition-all hover:-translate-y-1 hover:shadow-md hover:border-primary-orange/50 group relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-orange-50/60 rounded-full mix-blend-multiply filter blur-xl opacity-50 -translate-y-1/2 translate-x-1/2 group-hover:scale-150 transition-transform duration-500"></div>
          <div className="flex justify-between items-start mb-4 relative z-10">
            <h3 className="text-text-secondary text-xs font-bold uppercase tracking-wider group-hover:text-primary-orange transition-colors">Blueprint History</h3>
            <div className="bg-orange-50 text-primary-orange p-2 rounded-xl border border-orange-100 group-hover:bg-primary-orange group-hover:text-white transition-colors duration-300">
              <DocumentCheckIcon className="w-6 h-6" />
            </div>
          </div>
          <div className="relative z-10">
            <p className="text-4xl font-extrabold text-sidebar">{approvedPatternsCount}</p>
            <p className="text-xs text-text-secondary mt-2 font-semibold">
              {approvedPatternsCount} active blueprints
            </p>
          </div>
        </div>

        {/* Knowledge Updates */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-border-light/60 flex flex-col justify-between transition-all hover:-translate-y-1 hover:shadow-md hover:border-primary-orange/50 group relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-orange-50/60 rounded-full mix-blend-multiply filter blur-xl opacity-50 -translate-y-1/2 translate-x-1/2 group-hover:scale-150 transition-transform duration-500"></div>
          <div className="flex justify-between items-start mb-4 relative z-10">
            <h3 className="text-text-secondary text-xs font-bold uppercase tracking-wider group-hover:text-primary-orange transition-colors">Knowledge Updates</h3>
            <div className="bg-orange-50 text-primary-orange p-2 rounded-xl border border-orange-100 group-hover:bg-primary-orange group-hover:text-white transition-colors duration-300">
              <LightBulbIcon className="w-6 h-6" />
            </div>
          </div>
          <div className="relative z-10">
            <p className="text-4xl font-extrabold text-sidebar">{metrics.knowledge_updates || 0}</p>
            <p className="text-xs text-text-secondary mt-2 flex items-center gap-1 font-semibold">
              <LightBulbIcon className="w-4 h-4 text-primary-orange" /> Standards updated
            </p>
          </div>
        </div>

      </div>

      {/* Track Requests & Pipeline Health Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        
        {/* Left 2 Columns: Recent Architecture Requests (Track Scoped) */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          <div className="bg-white rounded-2xl shadow-sm border border-border-light/60 p-6 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-primary-orange"></div>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-base font-extrabold text-sidebar">
                Recent Architecture Requests for {currentTrack.track_name}
              </h2>
              <span className="text-xs font-bold text-primary-orange bg-orange-50 border border-orange-200 px-2.5 py-0.5 rounded-full">
                {trackRequests.length} Requests
              </span>
            </div>
            
            <div className="space-y-3">
              {trackRequests.slice(0, 4).map((req) => {
                const colors = getStatusColor(req.status);
                const displayStatus = req.status === 'validated' ? 'approved' : req.status;
                return (
                  <div 
                    key={req.id} 
                    onClick={() => navigate(`/requests/${req.id}/blueprint`)} 
                    className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50/70 border border-slate-200/80 hover:bg-slate-100/80 hover:border-border-orange/50 transition-all cursor-pointer group"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-9 h-9 rounded-xl ${colors.bg} ${colors.text} border ${colors.border} flex items-center justify-center group-hover:scale-105 transition-transform`}>
                        <DocumentCheckIcon className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-sidebar group-hover:text-primary-orange transition-colors">{req.request_name}</p>
                        <p className="text-[10px] text-text-secondary capitalize">{displayStatus} • {formatIST(req.created_at)}</p>
                      </div>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${colors.bg} ${colors.text} border ${colors.border} capitalize shadow-2xs`}>
                      {displayStatus}
                    </span>
                  </div>
                );
              })}

              {trackRequests.length === 0 && (
                <div className="text-center py-8 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                  <p className="text-text-secondary text-xs font-medium">No recent architecture requests found for this track.</p>
                  <button
                    onClick={() => navigate('/request/new')}
                    className="mt-2 text-xs font-bold text-primary-orange hover:underline"
                  >
                    + Submit New Architecture Intake Request
                  </button>
                </div>
              )}
            </div>

            {trackRequests.length > 0 && (
              <button 
                onClick={() => navigate('/review/blueprint')} 
                className="mt-5 w-full bg-slate-50 hover:bg-slate-100 text-xs font-bold text-sidebar py-2.5 rounded-xl transition-colors border border-slate-200"
              >
                View all requests for {currentTrack.track_name} &rarr;
              </button>
            )}
          </div>
        </div>

        {/* Right Column: Track Pipeline Health & Design Standards */}
        <div className="flex flex-col gap-6">

          {/* Pipeline Health Scoped to Track */}
          <div className="bg-white rounded-2xl shadow-sm border border-border-light/60 p-6">
            <h2 className="text-base font-extrabold text-sidebar mb-4">Pipeline Health</h2>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-xs mb-1.5">
                  <span className="text-text-secondary font-semibold">Drafts (Needs Review)</span>
                  <span className="font-extrabold text-sidebar">{pendingDraftsCount}</span>
                </div>
                <div className="w-full bg-input-bg rounded-full h-2">
                  <div className="bg-amber-400 h-2 rounded-full transition-all duration-1000" style={{ width: `${Math.max(0, (pendingDraftsCount / (trackRequests.length || 1)) * 100)}%` }}></div>
                </div>
              </div>
              
              <div>
                <div className="flex justify-between text-xs mb-1.5">
                  <span className="text-text-secondary font-semibold">Approved Patterns</span>
                  <span className="font-extrabold text-sidebar">{approvedPatternsCount}</span>
                </div>
                <div className="w-full bg-input-bg rounded-full h-2">
                  <div className="bg-emerald-500 h-2 rounded-full transition-all duration-1000" style={{ width: `${Math.max(0, (approvedPatternsCount / (trackRequests.length || 1)) * 100)}%` }}></div>
                </div>
              </div>
              
              <div>
                <div className="flex justify-between text-xs mb-1.5">
                  <span className="text-text-secondary font-semibold">Requires Rework</span>
                  <span className="font-extrabold text-sidebar">{reworkCount}</span>
                </div>
                <div className="w-full bg-input-bg rounded-full h-2">
                  <div className="bg-red-400 h-2 rounded-full transition-all duration-1000" style={{ width: `${Math.max(0, (reworkCount / (trackRequests.length || 1)) * 100)}%` }}></div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Design Standards */}
          <div className="bg-gradient-to-br from-[#1E293B] to-[#0F172A] rounded-2xl p-6 text-white relative overflow-hidden shadow-xl border border-gray-800 flex flex-col justify-between">
            <div className="absolute top-0 right-0 w-48 h-48 bg-primary-orange/20 rounded-full mix-blend-screen filter blur-3xl -translate-y-1/2 translate-x-1/4"></div>
            <div className="relative z-10 flex flex-col h-full">
              <div className="flex items-center gap-2 mb-2">
                <LightBulbIcon className="w-6 h-6 text-primary-orange" />
                <h2 className="text-lg font-bold">Design Standards</h2>
              </div>
              <p className="text-gray-400 text-xs mb-6 flex-grow">
                Ensure microservices for <span className="text-white font-bold">{currentTrack.track_name}</span> adhere to standard messaging patterns.
              </p>
              <div className="flex flex-col gap-2 mt-auto">
                <button 
                  onClick={() => navigate('/standards')} 
                  className="w-full bg-button-orange hover:bg-hover-orange text-white px-4 py-2.5 rounded-xl text-xs font-bold transition-all shadow-[0_0_15px_rgba(255,90,20,0.3)]"
                >
                  Update Patterns
                </button>
                <button 
                  onClick={() => navigate('/standards')} 
                  className="w-full bg-white/5 hover:bg-white/10 text-white px-4 py-2.5 rounded-xl text-xs font-medium transition-colors border border-white/10"
                >
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
