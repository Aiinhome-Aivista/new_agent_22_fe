import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getDashboardMetrics } from '../api/api';

export default function DeveloperDashboard() {
  const { user } = useAuth();
  const [metrics, setMetrics] = useState(null);

  useEffect(() => {
    getDashboardMetrics('developer').then(res => {
      if (res.success) setMetrics(res.data);
    }).catch(console.error);
  }, []);

  if (!metrics) return <div className="p-8 text-white">Loading Developer Metrics...</div>;

  return (
    <div className="p-8 space-y-6">
      <h1 className="text-2xl font-bold text-white mb-6">Developer Portal</h1>
      <div className="grid grid-cols-3 gap-6">
        <div className="bg-[#131B2F] border border-gray-800 p-6 rounded-xl">
          <div className="text-gray-400 text-sm mb-2">My Requests</div>
          <div className="text-3xl font-bold text-primary-orange">{metrics.my_requests}</div>
        </div>
        <div className="bg-[#131B2F] border border-gray-800 p-6 rounded-xl">
          <div className="text-gray-400 text-sm mb-2">Generation Statuses</div>
          <div className="text-3xl font-bold text-blue-400">{metrics.generation_status?.length || 0} active</div>
        </div>
        <div className="bg-[#131B2F] border border-gray-800 p-6 rounded-xl">
          <div className="text-gray-400 text-sm mb-2">Package Downloads</div>
          <div className="text-3xl font-bold text-emerald-400">{metrics.downloads}</div>
        </div>
      </div>
      
      <div className="bg-[#131B2F] border border-gray-800 p-6 rounded-xl mt-8 text-white">
        <h2 className="text-xl font-bold mb-4">Quick Actions</h2>
        <p className="text-sm text-gray-400 mb-4">Generate new Kafka schemas, trace packages, or interact with the AI Advisor.</p>
        <button className="bg-primary-orange hover:bg-hover-orange px-4 py-2 rounded text-sm font-bold shadow-md transition-colors">
          + New Generation Request
        </button>
      </div>
    </div>
  );
}
