import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getDashboardMetrics } from '../api/api';

export default function ReviewerDashboard() {
  const { user } = useAuth();
  const [metrics, setMetrics] = useState(null);

  useEffect(() => {
    getDashboardMetrics('techlead').then(res => {
      if (res.success) setMetrics(res.data);
    }).catch(console.error);
  }, []);

  if (!metrics) return <div className="p-8 text-white">Loading Reviewer Metrics...</div>;

  return (
    <div className="p-8 space-y-6">
      <h1 className="text-2xl font-bold text-white mb-6">Review & Approval Portal</h1>
      <div className="grid grid-cols-4 gap-6">
        <div className="bg-[#131B2F] border border-gray-800 p-6 rounded-xl">
          <div className="text-gray-400 text-sm mb-2">Pending Reviews</div>
          <div className="text-3xl font-bold text-amber-500">{metrics.pending_reviews}</div>
        </div>
        <div className="bg-[#131B2F] border border-gray-800 p-6 rounded-xl">
          <div className="text-gray-400 text-sm mb-2">Validation Reports</div>
          <div className="text-3xl font-bold text-blue-400">{metrics.validation_reports}</div>
        </div>
        <div className="bg-[#131B2F] border border-gray-800 p-6 rounded-xl">
          <div className="text-gray-400 text-sm mb-2">Total Approvals</div>
          <div className="text-3xl font-bold text-emerald-500">{metrics.approvals}</div>
        </div>
        <div className="bg-[#131B2F] border border-gray-800 p-6 rounded-xl">
          <div className="text-gray-400 text-sm mb-2">Total Rejected</div>
          <div className="text-3xl font-bold text-red-500">{metrics.rejected}</div>
        </div>
      </div>
    </div>
  );
}
