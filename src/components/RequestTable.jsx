import React from 'react';
import StatusBadge from './StatusBadge';

export default function RequestTable({ requests, role, navigate, actionOverride }) {
  const handleNavigate = (path, reqId) => {
    localStorage.setItem('lastGenerationRequestId', reqId);
    navigate(path);
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left">
        <thead>
          <tr className="bg-input-bg/50 text-text-secondary text-[11px] font-bold uppercase tracking-wider border-b border-border-light/60">
            <th className="px-6 py-4 rounded-tl-lg">ID</th>
            <th className="px-6 py-4">Microservice Request</th>
            <th className="px-6 py-4">Target App ID</th>
            <th className="px-6 py-4">Status</th>
            <th className="px-6 py-4">Date</th>
            <th className="px-6 py-4 text-right rounded-tr-lg">Action</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border-light/40">
          {requests.map(req => (
            <tr key={req.id} className="hover:bg-input-bg/30 transition-colors group">
              <td className="px-6 py-5 text-sm text-text-secondary font-mono font-medium">#{req.id}</td>
              <td className="px-6 py-5 text-sm font-extrabold text-sidebar">{req.request_name}</td>
              <td className="px-6 py-5 text-sm">
                <span className="bg-white border border-border-light/80 text-text-secondary font-mono text-xs font-semibold rounded-md px-2.5 py-1.5 inline-block shadow-sm">
                  {req.application_id}
                </span>
              </td>
              <td className="px-6 py-5"><StatusBadge status={req.status} /></td>
              <td className="px-6 py-5 text-sm font-medium text-text-secondary">{new Date(req.created_at).toLocaleDateString()}</td>
              <td className="px-6 py-5 text-sm font-medium text-right">
                {actionOverride ? (
                  <button
                    onClick={() => navigate(`${actionOverride.pathPrefix}${req.id}${actionOverride.pathSuffix}`)}
                    className="text-amber-700 bg-amber-50 hover:bg-amber-600 hover:text-white border border-amber-200 hover:border-amber-600 px-4 py-2 rounded-lg font-bold shadow-sm transition-all"
                  >
                    {actionOverride.label}
                  </button>
                ) : role === 'techlead' && ['packaged', 'validated'].includes(req.status) ? (
                  <button
                    onClick={() => handleNavigate(`/requests/${req.id}/review`, req.id)}
                    className="text-emerald-700 bg-emerald-50 hover:bg-emerald-600 hover:text-white border border-emerald-200 hover:border-emerald-600 px-4 py-2 rounded-lg font-bold shadow-sm transition-all"
                  >
                    Approve / Rework
                  </button>
                ) : role === 'architect' || role === 'solution architect' ? (
                  <button
                    onClick={() => handleNavigate(`/requests/${req.id}/blueprint`, req.id)}
                    className="text-blue-700 bg-blue-50 hover:bg-blue-600 hover:text-white border border-blue-200 hover:border-blue-600 px-4 py-2 rounded-lg font-bold shadow-sm transition-all"
                  >
                    {['approved', 'packaged', 'validated'].includes(req.status?.toLowerCase()) ? 'View Approved Blueprint' : 'Review Blueprint'}
                  </button>
                ) : role === 'devops' && ['packaged', 'approved'].includes(req.status) ? (
                  <button
                    onClick={() => handleNavigate(`/packages?id=${req.id}`, req.id)}
                    className="text-purple-700 bg-purple-50 hover:bg-purple-600 hover:text-white border border-purple-200 hover:border-purple-600 px-4 py-2 rounded-lg font-bold shadow-sm transition-all"
                  >
                    Inspect Package
                  </button>
                ) : role === 'developer' && ['packaged', 'approved'].includes(req.status) ? (
                  <button
                    onClick={() => handleNavigate(`/packages?id=${req.id}`, req.id)}
                    className="text-primary-orange bg-input-bg hover:bg-primary-orange hover:text-white border border-border-orange/40 hover:border-primary-orange px-4 py-2 rounded-lg font-bold shadow-sm transition-all"
                  >
                    Download Skeleton
                  </button>
                ) : (
                  <button
                    onClick={() => handleNavigate(`/progress?id=${req.id}`, req.id)}
                    className="text-text-secondary hover:text-primary-orange hover:bg-input-bg border border-transparent hover:border-border-orange/20 px-4 py-2 rounded-lg font-bold transition-all"
                  >
                    View Details
                  </button>
                )}
              </td>
            </tr>
          ))}
          {requests.length === 0 && (
            <tr>
              <td colSpan="6" className="p-16 text-center">
                <div className="w-20 h-20 bg-input-bg rounded-full flex items-center justify-center mx-auto mb-4 border border-border-orange/20">
                  <span className="text-4xl">📭</span>
                </div>
                <h3 className="text-lg font-bold text-sidebar mb-1">No requests found</h3>
                <p className="text-text-secondary text-sm">Get started by creating a new microservice skeleton.</p>
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
