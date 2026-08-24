import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useProject } from '../context/ProjectContext';
import { getDashboardMetrics, getRequests } from '../api/api';
import Loader from '../components/Loader';
import { useNavigate } from 'react-router-dom';
import { CodeBracketIcon, ArrowPathIcon, ArchiveBoxArrowDownIcon, QueueListIcon } from '@heroicons/react/24/outline';

export default function DeveloperDashboard() {
  const { user } = useAuth();
  const { currentTrack, currentProject } = useProject();
  const navigate = useNavigate();
  const [metrics, setMetrics] = useState(null);
  const [requests, setRequests] = useState([]);

  useEffect(() => {
    Promise.all([getDashboardMetrics('developer'), getRequests()])
      .then(([metricsRes, requestsRes]) => {
        if (metricsRes.success) setMetrics(metricsRes.data);
        if (requestsRes.success) {
          let reqs = requestsRes.data || [];
          if (currentTrack) {
            reqs = reqs.filter(r => 
              r.track_id === currentTrack.id || 
              r.track_name === currentTrack.track_name ||
              (currentTrack.track_name && r.request_name && r.request_name.toLowerCase().includes(currentTrack.track_name.toLowerCase()))
            );
          }
          setRequests(reqs);
        }
      })
      .catch(console.error);
  }, [currentTrack]);

  if (!metrics) return <Loader />;

  return (
    <div className="animate-fade-in-up">
      <div className="mb-8">
        <h1 className="text-2xl font-extrabold text-sidebar tracking-tight">Developer Portal</h1>
        <p className="text-text-secondary mt-1">Manage your generation requests and package downloads.</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-gradient-to-br from-primary-orange to-button-orange p-6 rounded-2xl shadow-[0_8px_30px_rgba(255,90,20,0.2)] text-white flex justify-between items-start transition-all hover:-translate-y-1 hover:shadow-[0_12px_40px_rgba(255,90,20,0.3)]">
          <div>
            <h3 className="text-white/90 text-xs font-bold uppercase tracking-wider">My Requests</h3>
            <p className="text-4xl font-extrabold mt-2">{metrics.my_requests}</p>
          </div>
          <div className="text-3xl bg-white/20 p-3 rounded-xl backdrop-blur-sm border border-white/30"><CodeBracketIcon className="w-8 h-8" /></div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-border-light/60 flex justify-between items-start transition-all hover:-translate-y-1 hover:shadow-md hover:border-border-orange/30 group relative overflow-hidden">
          <div className="absolute -right-6 -top-6 w-24 h-24 bg-primary-orange/5 rounded-full group-hover:scale-150 transition-transform duration-500"></div>
          <div className="relative z-10">
            <h3 className="text-text-secondary text-xs font-bold uppercase tracking-wider group-hover:text-primary-orange transition-colors">Active Workflows</h3>
            <p className="text-4xl font-extrabold text-sidebar mt-2">{requests.filter(r => ['approved', 'generating'].includes(r.status)).length}</p>
          </div>
          <div className="text-3xl bg-input-bg text-primary-orange p-3 rounded-xl border border-border-orange/20 group-hover:bg-primary-orange group-hover:text-white transition-colors relative z-10"><ArrowPathIcon className="w-8 h-8 group-hover:animate-spin" /></div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-border-light/60 flex justify-between items-start transition-all hover:-translate-y-1 hover:shadow-md hover:border-border-orange/30 group relative overflow-hidden">
          <div className="absolute -right-6 -top-6 w-24 h-24 bg-green-500/5 rounded-full group-hover:scale-150 transition-transform duration-500"></div>
          <div className="relative z-10">
            <h3 className="text-text-secondary text-xs font-bold uppercase tracking-wider group-hover:text-green-500 transition-colors">Ready Packages</h3>
            <p className="text-4xl font-extrabold text-sidebar mt-2">{requests.filter(r => ['packaged', 'completed'].includes(r.status)).length}</p>
          </div>
          <div className="text-3xl bg-input-bg text-green-500 p-3 rounded-xl border border-green-500/20 group-hover:bg-green-500 group-hover:text-white transition-colors relative z-10"><ArchiveBoxArrowDownIcon className="w-8 h-8 group-hover:animate-bounce" /></div>
        </div>
      </div>
      
      {/* Dynamic Content Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        
        {/* Left Column: Generations & Activity */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          {/* Active Generations Progress */}
          <div className="bg-white rounded-2xl shadow-sm border border-border-light/60 p-6">
            <h2 className="text-lg font-bold text-sidebar mb-4">Active Generations</h2>
            <div className="space-y-4">
              {requests.filter(r => !['completed', 'packaged', 'rejected'].includes(r.status)).slice(0, 3).map((req) => {
                let progress = 10;
                let statusText = 'Processing...';
                
                if (req.status === 'draft') { progress = 25; statusText = 'Pending Review...'; }
                else if (req.status === 'approved') { progress = 50; statusText = 'Pending Generation...'; }
                else if (req.status === 'generating') { progress = 75; statusText = 'Generating Code...'; }

                return (
                  <div key={req.id} className="group cursor-default">
                    <div className="flex justify-between text-sm mb-1">
                      <span className="font-semibold text-sidebar group-hover:text-primary-orange transition-colors">{req.request_name}</span>
                      <span className="text-primary-orange font-bold">{progress}%</span>
                    </div>
                    <div className="w-full bg-input-bg rounded-full h-2 overflow-hidden">
                      <div className={`bg-gradient-to-r from-primary-orange to-button-orange h-2 rounded-full transition-all duration-1000 ${req.status === 'generating' ? 'animate-pulse' : ''}`} style={{ width: `${progress}%` }}></div>
                    </div>
                    <p className="text-xs text-text-secondary mt-1">{statusText}</p>
                  </div>
                );
              })}
              {requests.filter(r => !['completed', 'packaged', 'rejected'].includes(r.status)).length === 0 && (
                <p className="text-sm text-text-secondary">No active generations at the moment.</p>
              )}
            </div>
          </div>

          {/* Recent Activity Timeline */}
          <div className="bg-white rounded-2xl shadow-sm border border-border-light/60 p-6">
            <h2 className="text-lg font-bold text-sidebar mb-4">Recent Activity</h2>
            <div className="relative border-l border-border-light/60 ml-3 space-y-6">
              {requests.slice(0, 5).map((req) => {
                let color = 'bg-gray-400';
                let activityText = `Created request ${req.request_name}`;
                
                if (req.status === 'draft') { color = 'bg-blue-400'; }
                else if (req.status === 'approved') { color = 'bg-green-400'; activityText = `Approved request ${req.request_name}`; }
                else if (req.status === 'generating') { color = 'bg-primary-orange'; activityText = `Started generation for ${req.request_name}`; }
                else if (req.status === 'packaged' || req.status === 'completed') { color = 'bg-green-500'; activityText = `Completed ${req.request_name}`; }
                else if (req.status === 'rejected') { color = 'bg-red-400'; activityText = `Rejected ${req.request_name}`; }

                const formatIST = (dateStr) => {
                  if (!dateStr) return '';
                  const d = new Date(dateStr);
                  const corrected = new Date(d.getTime() - (5.5 * 60 * 60 * 1000));
                  return corrected.toLocaleString('en-IN', {
                    timeZone: 'Asia/Kolkata',
                    month: 'short', day: 'numeric', year: 'numeric',
                    hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true
                  });
                };

                return (
                  <div key={req.id} className="relative pl-6">
                    <span className={`absolute -left-1.5 top-1 w-3 h-3 rounded-full ${color} ring-4 ring-white`}></span>
                    <p className="text-sm font-semibold text-sidebar">{activityText}</p>
                    <p className="text-xs text-text-secondary">{formatIST(req.created_at)}</p>
                  </div>
                );
              })}
              {requests.length === 0 && (
                <p className="text-sm text-text-secondary ml-3">No recent activity found.</p>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Quick Actions & Overview */}
        <div className="flex flex-col gap-6">
          <div className="bg-white rounded-2xl shadow-sm border border-border-light/60 overflow-hidden relative flex flex-col">
            <div className="absolute top-0 right-0 w-64 h-64 bg-input-bg rounded-full mix-blend-multiply filter blur-3xl opacity-50 -translate-y-1/2 translate-x-1/4"></div>
            <div className="p-6 relative z-10 flex flex-col h-full">
              <h2 className="text-xl font-extrabold text-sidebar mb-2">Quick Actions</h2>
              <p className="text-sm text-text-secondary mb-6">Common tasks and shortcuts to speed up your workflow.</p>
              
              <div className="grid grid-cols-1 gap-3 mt-auto">
                <button onClick={() => navigate('/request/new')} className="w-full flex items-center justify-between bg-primary-orange hover:bg-hover-orange text-white px-4 py-3 rounded-xl text-sm font-bold shadow-[0_4px_14px_rgba(255,90,20,0.3)] hover:shadow-[0_6px_20px_rgba(255,90,20,0.4)] transition-all hover:-translate-y-0.5">
                  <span>+ New Generation</span>
                  <CodeBracketIcon className="w-5 h-5" />
                </button>
                <button onClick={() => navigate('/chat')} className="w-full flex items-center justify-between bg-white border border-border-light/60 hover:border-border-orange/50 text-sidebar px-4 py-3 rounded-xl text-sm font-semibold shadow-sm transition-all hover:shadow hover:-translate-y-0.5">
                  <span>Consult AI Advisor</span>
                  <svg className="w-5 h-5 text-primary-orange" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" /></svg>
                </button>
               
              </div>
            </div>
          </div>

          {/* Status Overview */}
          <div className="bg-white rounded-2xl shadow-sm border border-border-light/60 p-6">
            <h2 className="text-lg font-bold text-sidebar mb-4">Pipeline Overview</h2>
            <div className="space-y-5">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-text-secondary font-medium">Pending Review</span>
                  <span className="font-bold text-sidebar">{requests.filter(r => r.status === 'draft').length}</span>
                </div>
                <div className="w-full bg-input-bg rounded-full h-2">
                  <div className="bg-blue-400 h-2 rounded-full transition-all duration-1000" style={{ width: `${Math.max(2, (requests.filter(r => r.status === 'draft').length / (requests.length || 1)) * 100)}%` }}></div>
                </div>
              </div>
              
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-text-secondary font-medium">Generating</span>
                  <span className="font-bold text-sidebar">{requests.filter(r => r.status === 'generating').length}</span>
                </div>
                <div className="w-full bg-input-bg rounded-full h-2">
                  <div className="bg-primary-orange h-2 rounded-full transition-all duration-1000 relative overflow-hidden" style={{ width: `${Math.max(2, (requests.filter(r => r.status === 'generating').length / (requests.length || 1)) * 100)}%` }}>
                    <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
                  </div>
                </div>
              </div>
              
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-text-secondary font-medium">Completed</span>
                  <span className="font-bold text-sidebar">{requests.filter(r => ['packaged', 'completed'].includes(r.status)).length}</span>
                </div>
                <div className="w-full bg-input-bg rounded-full h-2">
                  <div className="bg-green-500 h-2 rounded-full transition-all duration-1000" style={{ width: `${Math.max(2, (requests.filter(r => ['packaged', 'completed'].includes(r.status)).length / (requests.length || 1)) * 100)}%` }}></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
