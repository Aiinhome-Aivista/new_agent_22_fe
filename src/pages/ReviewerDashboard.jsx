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

      {/* Microservice Requests for Tech Lead Review */}
      <div className="bg-white rounded-2xl shadow-sm border border-border-light/60 p-6">
        <h2 className="text-lg font-bold text-sidebar mb-4">Requests Requiring Review</h2>
        <RequestTable requests={requests} role="techlead" navigate={navigate} />
      </div>
    </div>
  );
}

