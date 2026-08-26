import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProject } from '../context/ProjectContext';
import { getDashboardMetrics, getRequests } from '../api/api';
import Loader from '../components/Loader';
import { 
  BuildingLibraryIcon, 
  ShieldCheckIcon, 
  DocumentCheckIcon, 
  LightBulbIcon, 
  FolderIcon,
  PlusIcon,
  QueueListIcon,
  ArrowTrendingUpIcon,
  CheckCircleIcon,
  ClockIcon,
  SparklesIcon
} from '@heroicons/react/24/outline';

import { useAuth } from '../context/AuthContext';

export default function AllProjectsDashboardPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const role = user?.role?.toLowerCase() || 'developer';
  const isArchitect = role === 'solution architect' || role === 'architect';

  const { projects, selectProject, selectTrack } = useProject();
  const [metrics, setMetrics] = useState(null);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

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

  const totalTracks = projects.reduce((acc, p) => acc + (p.tracks ? p.tracks.length : 0), 0);
  const activeProjectsCount = projects.filter(p => p.status === 'ACTIVE').length;

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

  const handleOpenProjectTracks = (project) => {
    selectProject(project);
    navigate('/projects');
  };

  if (loading || !metrics) return <Loader />;

  return (
    <div className="animate-fade-in-up space-y-8">
      
      {/* Top Banner Header */}
      <div className="bg-gradient-to-r from-white via-orange-50/30 to-white p-6 rounded-2xl border border-border-light/70 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4 relative overflow-hidden">
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-primary-orange/5 rounded-full filter blur-2xl pointer-events-none"></div>
        
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-primary-orange uppercase tracking-wider mb-1">
            <SparklesIcon className="w-4 h-4" />
            Enterprise Portfolio Overview
          </div>
          <h1 className="text-2xl font-extrabold text-sidebar tracking-tight">
            All Projects & Track Analytics
          </h1>
          <p className="text-text-secondary text-sm mt-1 max-w-2xl">
            Overview of <span className="font-bold text-sidebar">{projects.length} Projects</span> and <span className="font-bold text-sidebar">{totalTracks} Mapped Tracks</span> across your organization.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 relative z-10">
          {isArchitect && (
            <button
              onClick={() => navigate('/projects/create')}
              className="inline-flex items-center gap-2 bg-button-orange hover:bg-hover-orange text-white px-4 py-2.5 rounded-xl font-bold text-xs shadow-md shadow-orange-500/20 transition-all hover:-translate-y-0.5"
            >
              <PlusIcon className="w-4 h-4 stroke-[3]" />
              Create Project
            </button>
          )}

          <button
            onClick={() => navigate('/projects')}
            className="inline-flex items-center gap-2 bg-white hover:bg-slate-50 border border-border-light text-sidebar px-4 py-2.5 rounded-xl font-bold text-xs shadow-2xs transition-all"
          >
            <FolderIcon className="w-4 h-4 text-primary-orange" />
            Projects Directory
          </button>
        </div>
      </div>

      {/* 4 Executive KPI Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* Total Projects Card */}
        <div className="bg-gradient-to-br from-primary-orange to-button-orange p-6 rounded-2xl shadow-lg shadow-primary-orange/20 text-white flex flex-col justify-between transition-all hover:-translate-y-1 hover:shadow-xl group">
          <div className="flex justify-between items-start mb-4">
            <h3 className="text-white/90 text-xs font-bold uppercase tracking-wider">Total Projects</h3>
            <div className="bg-white/20 p-2 rounded-xl backdrop-blur-sm border border-white/30 group-hover:rotate-12 transition-transform duration-300">
              <FolderIcon className="w-6 h-6" />
            </div>
          </div>
          <div>
            <p className="text-4xl font-extrabold">{projects.length}</p>
            <p className="text-xs text-white/80 mt-2 flex items-center gap-1 font-semibold">
              <CheckCircleIcon className="w-4 h-4" /> {activeProjectsCount} Active Enterprise Projects
            </p>
          </div>
        </div>

        {/* Active Mapped Tracks Card */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-border-light/60 flex flex-col justify-between transition-all hover:-translate-y-1 hover:shadow-md hover:border-primary-orange/50 group relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-orange-50/60 rounded-full mix-blend-multiply filter blur-xl opacity-50 -translate-y-1/2 translate-x-1/2 group-hover:scale-150 transition-transform duration-500"></div>
          <div className="flex justify-between items-start mb-4 relative z-10">
            <h3 className="text-text-secondary text-xs font-bold uppercase tracking-wider group-hover:text-primary-orange transition-colors">Mapped Tracks</h3>
            <div className="bg-orange-50 text-primary-orange p-2 rounded-xl border border-orange-100 group-hover:bg-primary-orange group-hover:text-white transition-colors duration-300">
              <QueueListIcon className="w-6 h-6" />
            </div>
          </div>
          <div className="relative z-10">
            <p className="text-4xl font-extrabold text-sidebar">{totalTracks}</p>
            <p className="text-xs text-primary-orange mt-2 flex items-center gap-1 font-bold">
              <ArrowTrendingUpIcon className="w-4 h-4" /> Active Kafka Pipelines
            </p>
          </div>
        </div>

        {/* Architecture Blueprints Card */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-border-light/60 flex flex-col justify-between transition-all hover:-translate-y-1 hover:shadow-md hover:border-primary-orange/50 group relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-orange-50/60 rounded-full mix-blend-multiply filter blur-xl opacity-50 -translate-y-1/2 translate-x-1/2 group-hover:scale-150 transition-transform duration-500"></div>
          <div className="flex justify-between items-start mb-4 relative z-10">
            <h3 className="text-text-secondary text-xs font-bold uppercase tracking-wider group-hover:text-primary-orange transition-colors">Blueprint History</h3>
            <div className="bg-orange-50 text-primary-orange p-2 rounded-xl border border-orange-100 group-hover:bg-primary-orange group-hover:text-white transition-colors duration-300">
              <DocumentCheckIcon className="w-6 h-6" />
            </div>
          </div>
          <div className="relative z-10">
            <p className="text-4xl font-extrabold text-sidebar">{metrics.blueprint_history}</p>
            <p className="text-xs text-text-secondary mt-2 font-semibold">
              {requests.filter(r => ['approved', 'validated', 'generating', 'packaged', 'completed'].includes(r.status)).length} Active Blueprints
            </p>
          </div>
        </div>

        {/* Verified Standards Card */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-border-light/60 flex flex-col justify-between transition-all hover:-translate-y-1 hover:shadow-md hover:border-primary-orange/50 group relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-orange-50/60 rounded-full mix-blend-multiply filter blur-xl opacity-50 -translate-y-1/2 translate-x-1/2 group-hover:scale-150 transition-transform duration-500"></div>
          <div className="flex justify-between items-start mb-4 relative z-10">
            <h3 className="text-text-secondary text-xs font-bold uppercase tracking-wider group-hover:text-primary-orange transition-colors">Knowledge Updates</h3>
            <div className="bg-orange-50 text-primary-orange p-2 rounded-xl border border-orange-100 group-hover:bg-primary-orange group-hover:text-white transition-colors duration-300">
              <LightBulbIcon className="w-6 h-6" />
            </div>
          </div>
          <div className="relative z-10">
            <p className="text-4xl font-extrabold text-sidebar">{metrics.knowledge_updates}</p>
            <p className="text-xs text-text-secondary mt-2 flex items-center gap-1 font-semibold">
              <LightBulbIcon className="w-4 h-4 text-primary-orange" /> Standards Updated
            </p>
          </div>
        </div>

      </div>

      {/* Main Grid: Projects Portfolio Summary & Pipeline Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left 2 Columns: Projects Portfolio Table / Grid */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl shadow-sm border border-border-light/60 p-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
              <div>
                <h2 className="text-base font-extrabold text-sidebar flex items-center gap-2">
                  <FolderIcon className="w-5 h-5 text-primary-orange" />
                  Projects Portfolio ({projects.length})
                </h2>
                <p className="text-xs text-text-secondary mt-0.5">Click any project to view its mapped tracks and launch dashboard.</p>
              </div>

              <button
                onClick={() => navigate('/projects')}
                className="text-xs font-bold text-primary-orange hover:underline self-start sm:self-auto"
              >
                View Full Directory &rarr;
              </button>
            </div>

            {/* Projects Summary List */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {projects.slice(0, 6).map((project) => {
                const trackCount = project.tracks ? project.tracks.length : 0;
                return (
                  <div
                    key={project.id}
                    onClick={() => handleOpenProjectTracks(project)}
                    className="p-4 bg-slate-50/70 border border-slate-200/80 rounded-xl hover:bg-white hover:border-border-orange/50 hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex justify-between items-start mb-1">
                        <h3 className="text-sm font-extrabold text-sidebar group-hover:text-primary-orange transition-colors">
                          {project.name}
                        </h3>
                        <span className="px-2 py-0.5 bg-amber-50 text-amber-700 border border-amber-200 rounded-full text-[10px] font-bold">
                          {trackCount} {trackCount === 1 ? 'Track' : 'Tracks'}
                        </span>
                      </div>
                      <p className="text-[11px] font-medium text-text-secondary mb-3">{project.client || 'pwc'}</p>
                    </div>

                    <div className="border-t border-slate-200/60 pt-2.5 flex items-center justify-between text-[11px]">
                      <span className="text-text-secondary font-mono">{project.start_date || '2026-07-01'}</span>
                      <span className="font-extrabold text-primary-orange group-hover:translate-x-1 transition-transform flex items-center gap-1">
                        View Tracks &rarr;
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Recent Architecture Requests Feed */}
          <div className="bg-white rounded-2xl shadow-sm border border-border-light/60 p-6 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-primary-orange"></div>
            <h2 className="text-base font-extrabold text-sidebar mb-4">Recent Architecture Activity</h2>
            <div className="space-y-3">
              {requests.slice(0, 4).map((req) => {
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
            </div>
          </div>
        </div>

        {/* Right Column: Pipeline Health & Standards */}
        <div className="space-y-6">
          
          {/* Cross-Project Pipeline Health */}
          <div className="bg-white rounded-2xl shadow-sm border border-border-light/60 p-6">
            <h2 className="text-base font-extrabold text-sidebar mb-4">Pipeline Health Summary</h2>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-xs mb-1.5">
                  <span className="text-text-secondary font-semibold">Drafts (Needs Review)</span>
                  <span className="font-extrabold text-sidebar">{requests.filter(r => r.status === 'draft').length}</span>
                </div>
                <div className="w-full bg-input-bg rounded-full h-2">
                  <div className="bg-amber-400 h-2 rounded-full transition-all duration-1000" style={{ width: `${Math.max(4, (requests.filter(r => r.status === 'draft').length / (requests.length || 1)) * 100)}%` }}></div>
                </div>
              </div>
              
              <div>
                <div className="flex justify-between text-xs mb-1.5">
                  <span className="text-text-secondary font-semibold">Approved Patterns</span>
                  <span className="font-extrabold text-sidebar">{requests.filter(r => ['approved', 'validated', 'generating', 'packaged', 'completed'].includes(r.status)).length}</span>
                </div>
                <div className="w-full bg-input-bg rounded-full h-2">
                  <div className="bg-emerald-500 h-2 rounded-full transition-all duration-1000" style={{ width: `${Math.max(4, (requests.filter(r => ['approved', 'validated', 'generating', 'packaged', 'completed'].includes(r.status)).length / (requests.length || 1)) * 100)}%` }}></div>
                </div>
              </div>
              
              <div>
                <div className="flex justify-between text-xs mb-1.5">
                  <span className="text-text-secondary font-semibold">Requires Rework</span>
                  <span className="font-extrabold text-sidebar">{requests.filter(r => r.status === 'rework' || r.status === 'rejected').length}</span>
                </div>
                <div className="w-full bg-input-bg rounded-full h-2">
                  <div className="bg-red-400 h-2 rounded-full transition-all duration-1000" style={{ width: `${Math.max(4, (requests.filter(r => r.status === 'rework' || r.status === 'rejected').length / (requests.length || 1)) * 100)}%` }}></div>
                </div>
              </div>
            </div>
          </div>

          {/* Design Standards Shortcut */}
          <div className="bg-gradient-to-br from-[#1E293B] to-[#0F172A] rounded-2xl p-6 text-white relative overflow-hidden shadow-xl border border-gray-800 flex flex-col justify-between">
            <div className="relative z-10 flex flex-col h-full">
              <div className="flex items-center gap-2 mb-2">
                <LightBulbIcon className="w-6 h-6 text-primary-orange" />
                <h2 className="text-lg font-bold">Design Standards</h2>
              </div>
              <p className="text-gray-400 text-xs mb-6">
                Ensure all microservices adhere to standard patterns for stateful processors, event sourcing, and CQRS architectures.
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
