import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getDashboardMetrics } from '../api/api';

export default function ArchitectDashboard() {
  const { user } = useAuth();
  const [metrics, setMetrics] = useState(null);

  useEffect(() => {
    getDashboardMetrics('architect').then(res => {
      if (res.success) setMetrics(res.data);
    }).catch(console.error);
  }, []);

  if (!metrics) return <div className="p-8 text-white">Loading Architect Metrics...</div>;

  return (
    <div className="p-8 space-y-6">
      <h1 className="text-2xl font-bold text-white mb-6">Architecture Portal</h1>
      <div className="grid grid-cols-4 gap-6">
        <div className="bg-[#131B2F] border border-gray-800 p-6 rounded-xl">
          <div className="text-gray-400 text-sm mb-2">Architecture Reviews</div>
          <div className="text-3xl font-bold text-blue-400">{metrics.architecture_reviews}</div>
        </div>
        <div className="bg-[#131B2F] border border-gray-800 p-6 rounded-xl">
          <div className="text-gray-400 text-sm mb-2">Pattern Matches</div>
          <div className="text-3xl font-bold text-purple-400">{metrics.pattern_matches}</div>
        </div>
        <div className="bg-[#131B2F] border border-gray-800 p-6 rounded-xl">
          <div className="text-gray-400 text-sm mb-2">Blueprint History</div>
          <div className="text-3xl font-bold text-emerald-400">{metrics.blueprint_history}</div>
        </div>
        <div className="bg-[#131B2F] border border-gray-800 p-6 rounded-xl">
          <div className="text-gray-400 text-sm mb-2">Knowledge Updates</div>
          <div className="text-3xl font-bold text-amber-400">{metrics.knowledge_updates}</div>
        </div>
      </div>
      
      <div className="bg-[#131B2F] border border-gray-800 p-6 rounded-xl mt-8 text-white">
        <h2 className="text-xl font-bold mb-4">Architecture Review Queue</h2>
        <p className="text-sm text-gray-400">There are {metrics.architecture_reviews} drafts waiting for blueprint matching and validation.</p>
      </div>
    </div>
  );
}
