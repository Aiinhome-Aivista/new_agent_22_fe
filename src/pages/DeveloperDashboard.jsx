import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getDashboardMetrics, getRequests } from '../api/api';
import Loader from '../components/Loader';
import { useNavigate } from 'react-router-dom';
import { CodeBracketIcon, ArrowPathIcon, ArchiveBoxArrowDownIcon } from '@heroicons/react/24/outline';

export default function DeveloperDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [metrics, setMetrics] = useState(null);
  const [requests, setRequests] = useState([]);

  useEffect(() => {
    Promise.all([getDashboardMetrics('developer'), getRequests()])
      .then(([metricsRes, requestsRes]) => {
        if (metricsRes.success) setMetrics(metricsRes.data);
        if (requestsRes.success) setRequests(requestsRes.data || []);
      })
      .catch(console.error);
  }, []);

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

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-border-light/60 flex justify-between items-start transition-all hover:-translate-y-1 hover:shadow-md hover:border-border-orange/30 group">
          <div>
            <h3 className="text-text-secondary text-xs font-bold uppercase tracking-wider group-hover:text-primary-orange transition-colors">Generation Statuses</h3>
            <p className="text-4xl font-extrabold text-sidebar mt-2">{metrics.generation_status?.length || 0} active</p>
          </div>
          <div className="text-3xl bg-input-bg text-primary-orange p-3 rounded-xl border border-border-orange/20 group-hover:bg-primary-orange group-hover:text-white transition-colors"><ArrowPathIcon className="w-8 h-8" /></div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-border-light/60 flex justify-between items-start transition-all hover:-translate-y-1 hover:shadow-md hover:border-border-orange/30 group">
          <div>
            <h3 className="text-text-secondary text-xs font-bold uppercase tracking-wider group-hover:text-primary-orange transition-colors">Package Downloads</h3>
            <p className="text-4xl font-extrabold text-sidebar mt-2">{metrics.downloads}</p>
          </div>
          <div className="text-3xl bg-input-bg text-primary-orange p-3 rounded-xl border border-border-orange/20 group-hover:bg-primary-orange group-hover:text-white transition-colors"><ArchiveBoxArrowDownIcon className="w-8 h-8" /></div>
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
              {/* Mock Progress Item 1 */}
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="font-semibold text-sidebar">User Service API</span>
                  <span className="text-primary-orange font-bold">75%</span>
                </div>
                <div className="w-full bg-input-bg rounded-full h-2">
                  <div className="bg-gradient-to-r from-primary-orange to-button-orange h-2 rounded-full" style={{ width: '75%' }}></div>
                </div>
                <p className="text-xs text-text-secondary mt-1">Generating Kafka Handlers...</p>
              </div>
              
              {/* Mock Progress Item 2 */}
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="font-semibold text-sidebar">Notification Engine</span>
                  <span className="text-primary-orange font-bold">30%</span>
                </div>
                <div className="w-full bg-input-bg rounded-full h-2">
                  <div className="bg-gradient-to-r from-primary-orange to-button-orange h-2 rounded-full" style={{ width: '30%' }}></div>
                </div>
                <p className="text-xs text-text-secondary mt-1">Parsing Blueprint...</p>
              </div>
            </div>
          </div>

          {/* Recent Activity Timeline */}
          <div className="bg-white rounded-2xl shadow-sm border border-border-light/60 p-6">
            <h2 className="text-lg font-bold text-sidebar mb-4">Recent Activity</h2>
            <div className="relative border-l border-border-light/60 ml-3 space-y-6">
              <div className="relative pl-6">
                <span className="absolute -left-1.5 top-1 w-3 h-3 rounded-full bg-primary-orange ring-4 ring-white"></span>
                <p className="text-sm font-semibold text-sidebar">Downloaded Payment Service Package</p>
                <p className="text-xs text-text-secondary">2 hours ago</p>
              </div>
              <div className="relative pl-6">
                <span className="absolute -left-1.5 top-1 w-3 h-3 rounded-full bg-blue-400 ring-4 ring-white"></span>
                <p className="text-sm font-semibold text-sidebar">Requested Order Service Generation</p>
                <p className="text-xs text-text-secondary">Yesterday at 4:30 PM</p>
              </div>
              <div className="relative pl-6">
                <span className="absolute -left-1.5 top-1 w-3 h-3 rounded-full bg-green-400 ring-4 ring-white"></span>
                <p className="text-sm font-semibold text-sidebar">Architect Approved Payment Service</p>
                <p className="text-xs text-text-secondary">Yesterday at 1:15 PM</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Quick Actions */}
        <div className="flex flex-col gap-6">
          <div className="bg-white rounded-2xl shadow-sm border border-border-light/60 overflow-hidden relative h-full flex flex-col">
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
        </div>
      </div>
    </div>
  );
}
