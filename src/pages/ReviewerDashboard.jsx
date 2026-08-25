import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useProject } from '../context/ProjectContext';
import { getDashboardMetrics, getTechLeadReviews, getTechLeadValidations } from '../api/api';
import Loader from '../components/Loader';
import RequestTable from '../components/RequestTable';
import { useNavigate } from 'react-router-dom';
import { ClipboardDocumentCheckIcon, ExclamationCircleIcon, CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/outline';

export default function ReviewerDashboard() {
  const { user } = useAuth();
  const { currentTrack } = useProject();
  const navigate = useNavigate();
  const [metrics, setMetrics] = useState(null);
  const [requests, setRequests] = useState([]);
  const [validations, setValidations] = useState([]);

  useEffect(() => {
    getDashboardMetrics('techlead', currentTrack?.id).then(res => {
      if (res.success) setMetrics(res.data);
    }).catch(console.error);

    getTechLeadReviews().then(res => {
      if (res.data) {
        let mappedRequests = res.data.map(req => ({
          ...req,
          request_name: req.serviceName || req.request_name,
          application_id: req.targetAppId || req.application_id,
          created_at: req.date || req.created_at
        }));
        if (currentTrack) {
          mappedRequests = mappedRequests.filter(r => 
            r.track_id === currentTrack.id || 
            r.track_name === currentTrack.track_name ||
            (currentTrack.track_name && r.request_name && r.request_name.toLowerCase().includes(currentTrack.track_name.toLowerCase()))
          );
        }
        setRequests(mappedRequests);
      }
    }).catch(console.error);

    getTechLeadValidations(currentTrack?.id).then(res => {
      if (res.success) setValidations(res.data || []);
    }).catch(console.error);
  }, [currentTrack]);

  if (!metrics) return <Loader />;

  const totalReviews = metrics.approvals + metrics.rejected;
  const approvalRate = totalReviews > 0 ? Math.round((metrics.approvals / totalReviews) * 100) : 0;
  const rejectionRate = totalReviews > 0 ? Math.round((metrics.rejected / totalReviews) * 100) : 0;

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
              {validations.length > 0 ? validations.slice(0, 5).map((val, idx) => (
                <div key={val.id || idx} className="flex items-center justify-between p-3 rounded-xl border border-border-light/60 bg-white hover:border-border-orange/30 hover:bg-orange-50/20 transition-all shadow-sm">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg flex items-center justify-center shadow-sm bg-orange-50 text-primary-orange">
                      <ExclamationCircleIcon className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-sidebar truncate max-w-[300px]" title={val.rule_name || val.message}>{val.rule_name || 'Validation Issue'}</p>
                      <p className={`text-xs font-medium ${val.severity === 'error' ? 'text-red-500' : val.severity === 'warning' ? 'text-amber-500' : 'text-primary-orange'}`}>
                        {val.severity === 'error' ? 'High Severity • Blocking deployment' : val.severity === 'warning' ? 'Medium Severity • Needs attention' : 'Low Severity • Info'}
                      </p>
                    </div>
                  </div>
                  <button onClick={() => navigate(`/validation?id=${val.request_id}`)} className="px-4 py-1.5 text-white bg-primary-orange hover:bg-hover-orange rounded-lg text-xs font-bold shadow transition-colors">Review</button>
                </div>
              )) : (
                <div className="text-sm text-gray-500 p-4 text-center border border-dashed border-gray-200 rounded-xl bg-gray-50">No pending validation issues found.</div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Review Performance Stats */}
        <div className="flex flex-col gap-6">
          <div className="bg-white rounded-2xl shadow-sm border border-border-light/60 p-6 h-full flex flex-col relative overflow-hidden">
            <div className="absolute -right-12 -top-12 w-48 h-48 bg-gradient-to-br from-gray-50 to-gray-100 rounded-full opacity-50 pointer-events-none"></div>
            
            <h2 className="text-lg font-bold text-sidebar mb-6 relative z-10">Review Performance</h2>
            
            <div className="flex-grow flex flex-col justify-center space-y-10 relative z-10">
              {/* Donut Chart */}
              <div className="flex items-center justify-center">
                <div className="relative w-40 h-40 flex items-center justify-center rounded-full bg-white shadow-[0_0_20px_rgba(0,0,0,0.02)]">
                  <svg className="absolute inset-0 w-full h-full -rotate-90 transform origin-center" viewBox="0 0 36 36">
                    {/* Background track */}
                    <path className="text-gray-100" strokeWidth="3" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                    
                    {/* Approval segment */}
                    {totalReviews > 0 && (
                      <path className="text-green-500 transition-all duration-1000 ease-out" strokeDasharray={`${approvalRate}, 100`} strokeWidth="3" strokeLinecap="round" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                    )}
                    
                    {/* Rejection segment */}
                    {totalReviews > 0 && rejectionRate > 0 && (
                      <path className="text-red-400 transition-all duration-1000 ease-out" strokeDasharray={`${rejectionRate}, 100`} strokeDashoffset={`-${approvalRate}`} strokeWidth="3" strokeLinecap="round" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                    )}
                  </svg>
                  <div className="text-center z-10 flex flex-col items-center">
                    <span className="text-4xl font-extrabold text-sidebar">{totalReviews}</span>
                    <span className="text-[10px] uppercase font-bold text-gray-400 tracking-widest mt-1">Total Reviews</span>
                  </div>
                </div>
              </div>

              {/* Progress Bars */}
              <div className="space-y-5 px-2">
                <div>
                  <div className="flex justify-between text-sm mb-1.5">
                    <span className="font-bold text-gray-600">Approved</span>
                    <span className="text-green-600 font-extrabold">{metrics.approvals} <span className="text-xs font-normal text-gray-400">({approvalRate}%)</span></span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2">
                    <div className="bg-green-500 h-2 rounded-full transition-all duration-1000 shadow-sm" style={{ width: `${approvalRate}%` }}></div>
                  </div>
                </div>
                
                <div>
                  <div className="flex justify-between text-sm mb-1.5">
                    <span className="font-bold text-gray-600">Rejected</span>
                    <span className="text-red-500 font-extrabold">{metrics.rejected} <span className="text-xs font-normal text-gray-400">({rejectionRate}%)</span></span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2">
                    <div className="bg-red-400 h-2 rounded-full transition-all duration-1000 shadow-sm" style={{ width: `${rejectionRate}%` }}></div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="mt-8 pt-4 border-t border-border-light/60 text-center relative z-10">
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
        <RequestTable requests={requests.slice(0, 5)} role="techlead" navigate={navigate} />
      </div>
    </div>
  );
}

