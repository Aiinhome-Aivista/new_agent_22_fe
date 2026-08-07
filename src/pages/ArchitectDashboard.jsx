import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getDashboardMetrics, getRequests } from '../api/api';
import Loader from '../components/Loader';
import { useNavigate } from 'react-router-dom';
import RequestTable from '../components/RequestTable';
import { BuildingLibraryIcon, ShieldCheckIcon, DocumentCheckIcon, LightBulbIcon } from '@heroicons/react/24/outline';

export default function ArchitectDashboard() {
  const { user } = useAuth();
  const [metrics, setMetrics] = useState(null);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    Promise.all([getDashboardMetrics('architect'), getRequests()])
      .then(([metricsRes, requestsRes]) => {
        if (metricsRes.success) setMetrics(metricsRes.data);
        if (requestsRes.success) setRequests(requestsRes.data || []);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  if (loading || !metrics) return <Loader />;

  return (
    <div className="animate-fade-in-up">
      <div className="mb-8">
        <h1 className="text-2xl font-extrabold text-sidebar tracking-tight">Architecture Portal</h1>
        <p className="text-text-secondary mt-1">Review architecture drafts against messaging patterns.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-gradient-to-br from-primary-orange to-button-orange p-6 rounded-2xl shadow-[0_8px_30px_rgba(255,90,20,0.2)] text-white flex justify-between items-start transition-all hover:-translate-y-1 hover:shadow-[0_12px_40px_rgba(255,90,20,0.3)]">
          <div>
            <h3 className="text-white/90 text-xs font-bold uppercase tracking-wider">Architecture Reviews</h3>
            <p className="text-4xl font-extrabold mt-2">{metrics.architecture_reviews}</p>
          </div>
          <div className="text-3xl bg-white/20 p-3 rounded-xl backdrop-blur-sm border border-white/30"><BuildingLibraryIcon className="w-8 h-8" /></div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-border-light/60 flex justify-between items-start transition-all hover:-translate-y-1 hover:shadow-md hover:border-border-orange/30 group">
          <div>
            <h3 className="text-text-secondary text-xs font-bold uppercase tracking-wider group-hover:text-primary-orange transition-colors">Pattern Matches</h3>
            <p className="text-4xl font-extrabold text-sidebar mt-2">{metrics.pattern_matches}</p>
          </div>
          <div className="text-3xl bg-input-bg text-primary-orange p-3 rounded-xl border border-border-orange/20 group-hover:bg-primary-orange group-hover:text-white transition-colors"><ShieldCheckIcon className="w-8 h-8" /></div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-border-light/60 flex justify-between items-start transition-all hover:-translate-y-1 hover:shadow-md hover:border-border-orange/30 group">
          <div>
            <h3 className="text-text-secondary text-xs font-bold uppercase tracking-wider group-hover:text-primary-orange transition-colors">Blueprint History</h3>
            <p className="text-4xl font-extrabold text-sidebar mt-2">{metrics.blueprint_history}</p>
          </div>
          <div className="text-3xl bg-input-bg text-primary-orange p-3 rounded-xl border border-border-orange/20 group-hover:bg-primary-orange group-hover:text-white transition-colors"><DocumentCheckIcon className="w-8 h-8" /></div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-border-light/60 flex justify-between items-start transition-all hover:-translate-y-1 hover:shadow-md hover:border-border-orange/30 group">
          <div>
            <h3 className="text-text-secondary text-xs font-bold uppercase tracking-wider group-hover:text-primary-orange transition-colors">Knowledge Updates</h3>
            <p className="text-4xl font-extrabold text-sidebar mt-2">{metrics.knowledge_updates}</p>
          </div>
          <div className="text-3xl bg-input-bg text-primary-orange p-3 rounded-xl border border-border-orange/20 group-hover:bg-primary-orange group-hover:text-white transition-colors"><LightBulbIcon className="w-8 h-8" /></div>
        </div>
      </div>
      
      <div className="bg-white rounded-2xl shadow-sm border border-border-light/60 overflow-hidden mt-8">
        <div className="p-6 md:p-8 border-b border-border-light/60 bg-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-50 rounded-full mix-blend-multiply filter blur-3xl opacity-70 -translate-y-1/2 translate-x-1/4"></div>
          <div className="relative z-10">
            <h2 className="font-extrabold text-sidebar text-2xl">Architecture Blueprints</h2>
            <p className="text-sm text-text-secondary mt-1">Review generated designs against messaging patterns and standards.</p>
          </div>
        </div>
        <RequestTable requests={requests} role="architect" navigate={navigate} />
      </div>

      <div className="mt-8 bg-gradient-to-br from-[#1E293B] to-[#0F172A] rounded-2xl p-8 text-white relative overflow-hidden shadow-xl border border-gray-800">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary-orange/20 rounded-full mix-blend-screen filter blur-3xl -translate-y-1/2 translate-x-1/4"></div>
        <div className="relative z-10">
          <h2 className="text-xl font-bold mb-2">Design Standards</h2>
          <p className="text-gray-400 max-w-2xl text-sm mb-6">
            Ensure all microservices adhere to standard patterns for stateful processors, event sourcing, and CQRS architectures.
          </p>
          <div className="flex gap-4">
            <button className="bg-primary-orange hover:bg-hover-orange text-white px-5 py-2 rounded-lg text-sm font-medium transition-colors shadow-[0_0_15px_rgba(255,90,20,0.4)]">
              Update Patterns
            </button>
            <button className="bg-white/10 hover:bg-white/20 text-white px-5 py-2 rounded-lg text-sm font-medium transition-colors backdrop-blur-sm border border-white/10">
              View Guidelines
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
