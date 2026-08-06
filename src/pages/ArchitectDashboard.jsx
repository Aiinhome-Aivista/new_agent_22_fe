import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getDashboardMetrics } from '../api/api';
import Loader from '../components/Loader';
import { useNavigate } from 'react-router-dom';
import { BuildingLibraryIcon, ShieldCheckIcon, DocumentCheckIcon, LightBulbIcon } from '@heroicons/react/24/outline';

export default function ArchitectDashboard() {
  const { user } = useAuth();
  const [metrics, setMetrics] = useState(null);

  useEffect(() => {
    getDashboardMetrics('architect').then(res => {
      if (res.success) setMetrics(res.data);
    }).catch(console.error);
  }, []);

  if (!metrics) return <Loader />;

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
      
      <div className="bg-white rounded-2xl shadow-sm border border-border-light/60 overflow-hidden relative">
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-50 rounded-full mix-blend-multiply filter blur-3xl opacity-70 -translate-y-1/2 translate-x-1/4"></div>
        <div className="p-8 relative z-10">
          <h2 className="text-xl font-extrabold text-sidebar mb-2">Architecture Review Queue</h2>
          <p className="text-sm text-text-secondary">There are <span className="font-bold text-primary-orange">{metrics.architecture_reviews}</span> drafts waiting for blueprint matching and validation.</p>
        </div>
      </div>
    </div>
  );
}
