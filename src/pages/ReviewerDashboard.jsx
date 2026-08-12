import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getDashboardMetrics, getRequests } from '../api/api';
import Loader from '../components/Loader';
import RequestTable from '../components/RequestTable';
import { useNavigate } from 'react-router-dom';
import { ClipboardDocumentCheckIcon, ExclamationCircleIcon, CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/outline';

export default function ReviewerDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [metrics, setMetrics] = useState(null);
  const [requests, setRequests] = useState([]);

  useEffect(() => {
    getDashboardMetrics('techlead').then(res => {
      if (res.success) setMetrics(res.data);
    }).catch(console.error);

    getRequests().then(res => {
      if (res.data) setRequests(res.data);
    }).catch(console.error);
  }, []);

  if (!metrics) return <Loader />;

  return (
    <div className="animate-fade-in-up">
      <div className="mb-8">
        <h1 className="text-2xl font-extrabold text-sidebar tracking-tight">Tech Lead Portal</h1>
        <p className="text-text-secondary mt-1">Manage validation reports and process code approvals.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        
        <div 
          onClick={() => navigate('/review/queue')}
          className="bg-gradient-to-br from-primary-orange to-button-orange p-6 rounded-2xl shadow-[0_8px_30px_rgba(255,90,20,0.2)] text-white flex justify-between items-start transition-all hover:-translate-y-1 hover:shadow-[0_12px_40px_rgba(255,90,20,0.3)] cursor-pointer"
        >
          <div>
            <h3 className="text-white/90 text-xs font-bold uppercase tracking-wider">Pending Reviews</h3>
            <p className="text-4xl font-extrabold mt-2">{metrics.pending_reviews}</p>
          </div>
          <div className="text-3xl bg-white/20 p-3 rounded-xl backdrop-blur-sm border border-white/30"><ClipboardDocumentCheckIcon className="w-8 h-8" /></div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-border-light/60 flex justify-between items-start transition-all hover:-translate-y-1 hover:shadow-md hover:border-border-orange/30 group">
          <div>
            <h3 className="text-text-secondary text-xs font-bold uppercase tracking-wider group-hover:text-primary-orange transition-colors">Validation Reports</h3>
            <p className="text-4xl font-extrabold text-sidebar mt-2">{metrics.validation_reports}</p>
          </div>
          <div className="text-3xl bg-input-bg text-primary-orange p-3 rounded-xl border border-border-orange/20 group-hover:bg-primary-orange group-hover:text-white transition-colors"><ExclamationCircleIcon className="w-8 h-8" /></div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-border-light/60 flex justify-between items-start transition-all hover:-translate-y-1 hover:shadow-md hover:border-border-orange/30 group">
          <div>
            <h3 className="text-text-secondary text-xs font-bold uppercase tracking-wider group-hover:text-primary-orange transition-colors">Total Approvals</h3>
            <p className="text-4xl font-extrabold text-sidebar mt-2">{metrics.approvals}</p>
          </div>
          <div className="text-3xl bg-input-bg text-primary-orange p-3 rounded-xl border border-border-orange/20 group-hover:bg-primary-orange group-hover:text-white transition-colors"><CheckCircleIcon className="w-8 h-8" /></div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-border-light/60 flex justify-between items-start transition-all hover:-translate-y-1 hover:shadow-md hover:border-border-orange/30 group">
          <div>
            <h3 className="text-text-secondary text-xs font-bold uppercase tracking-wider group-hover:text-primary-orange transition-colors">Total Rejected</h3>
            <p className="text-4xl font-extrabold text-sidebar mt-2">{metrics.rejected}</p>
          </div>
          <div className="text-3xl bg-input-bg text-primary-orange p-3 rounded-xl border border-border-orange/20 group-hover:bg-primary-orange group-hover:text-white transition-colors"><XCircleIcon className="w-8 h-8" /></div>
        </div>

      </div>

      {/* Dynamic Content Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        
        {/* Left Column: Validation Severity Queue */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          <div className="bg-white rounded-2xl shadow-sm border border-border-light/60 p-6">
            <h2 className="text-lg font-bold text-sidebar mb-4">Validation Severity Queue</h2>
            <div className="space-y-3">
              {/* High Severity */}
              <div className="flex items-center justify-between p-3 rounded-xl border border-red-100 bg-red-50/50 hover:bg-red-50 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-red-100 text-red-600 flex items-center justify-center shadow-sm">
                    <ExclamationCircleIcon className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-sidebar">Security Group Conflict in AWS ECS Config</p>
                    <p className="text-xs text-red-600 font-medium">High Severity • Blocking deployment</p>
                  </div>
                </div>
                <button className="px-4 py-1.5 bg-red-600 text-white rounded-lg text-xs font-bold shadow hover:bg-red-700 transition-colors">Review Now</button>
              </div>
              
              {/* Medium Severity */}
              <div className="flex items-center justify-between p-3 rounded-xl border border-yellow-100 bg-yellow-50/50 hover:bg-yellow-50 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-yellow-100 text-yellow-600 flex items-center justify-center shadow-sm">
                    <ExclamationCircleIcon className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-sidebar">Missing Dead Letter Queue for Notification Topic</p>
                    <p className="text-xs text-yellow-700 font-medium">Medium Severity • Needs attention</p>
                  </div>
                </div>
                <button className="px-4 py-1.5 bg-yellow-500 text-white rounded-lg text-xs font-bold shadow hover:bg-yellow-600 transition-colors">Review</button>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Review Performance Stats */}
        <div className="flex flex-col gap-6">
          <div className="bg-white rounded-2xl shadow-sm border border-border-light/60 p-6 h-full flex flex-col">
            <h2 className="text-lg font-bold text-sidebar mb-6">Review Performance</h2>
            
            <div className="flex-grow flex flex-col justify-center space-y-6">
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="font-semibold text-text-secondary">Approval Rate</span>
                  <span className="text-green-600 font-bold">85%</span>
                </div>
                <div className="w-full bg-input-bg rounded-full h-3">
                  <div className="bg-green-500 h-3 rounded-full" style={{ width: '85%' }}></div>
                </div>
              </div>
              
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="font-semibold text-text-secondary">Rejection Rate</span>
                  <span className="text-red-500 font-bold">15%</span>
                </div>
                <div className="w-full bg-input-bg rounded-full h-3">
                  <div className="bg-red-400 h-3 rounded-full" style={{ width: '15%' }}></div>
                </div>
              </div>
            </div>
            
            <div className="mt-6 pt-4 border-t border-border-light/60 text-center">
              <p className="text-xs text-text-secondary">Based on last 30 days of activity.</p>
            </div>
          </div>
        </div>

      </div>

      {/* Microservice Requests for Tech Lead Review */}
      <div className="bg-white rounded-2xl shadow-sm border border-border-light/60 overflow-hidden">
        <div className="p-6 md:p-8 border-b border-border-light/60 bg-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-green-50 rounded-full mix-blend-multiply filter blur-3xl opacity-70 -translate-y-1/2 translate-x-1/4"></div>
          <div className="relative z-10">
            <h2 className="font-extrabold text-sidebar text-2xl">Requests Requiring Review</h2>
            <p className="text-sm text-text-secondary mt-1">Review validation reports and approve repository commits.</p>
          </div>
        </div>
        <RequestTable requests={requests} role="techlead" navigate={navigate} />
      </div>
    </div>
  );
}

