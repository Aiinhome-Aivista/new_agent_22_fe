import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getDashboardMetrics } from '../api/api';

export default function DevopsDashboard() {
  const { user } = useAuth();
  const [metrics, setMetrics] = useState(null);

  useEffect(() => {
    getDashboardMetrics('devops').then(res => {
      if (res.success) setMetrics(res.data);
    }).catch(console.error);
  }, []);

  if (!metrics) return <div className="p-8 text-white">Loading Platform/DevOps Metrics...</div>;

  return (
    <div className="p-8 space-y-6">
      <h1 className="text-2xl font-bold text-white mb-6">Platform DevOps Portal</h1>
      <div className="grid grid-cols-4 gap-6">
        <div className="bg-[#131B2F] border border-gray-800 p-6 rounded-xl">
          <div className="text-gray-400 text-sm mb-2">Package History</div>
          <div className="text-3xl font-bold text-purple-400">{metrics.package_history}</div>
        </div>
        <div className="bg-[#131B2F] border border-gray-800 p-6 rounded-xl">
          <div className="text-gray-400 text-sm mb-2">Deployments</div>
          <div className="text-3xl font-bold text-emerald-500">{metrics.deployments}</div>
        </div>
        <div className="bg-[#131B2F] border border-gray-800 p-6 rounded-xl">
          <div className="text-gray-400 text-sm mb-2">Environment Status</div>
          <div className="text-3xl font-bold text-blue-400">{metrics.environment_status}</div>
        </div>
        <div className="bg-[#131B2F] border border-gray-800 p-6 rounded-xl">
          <div className="text-gray-400 text-sm mb-2">Config Health</div>
          <div className="text-3xl font-bold text-emerald-400">{metrics.configuration_health} Passed</div>
        </div>
      </div>
      
      <div className="bg-[#131B2F] border border-gray-800 p-6 rounded-xl mt-8 text-white">
        <h2 className="text-xl font-bold mb-4">CI/CD Pipeline Status</h2>
        <p className="text-sm text-gray-400">All environments are currently operating nominally.</p>
      </div>
    </div>
  );
}
