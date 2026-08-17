import { useState, useEffect } from 'react';
import { getRequests } from '../api/api';
import StatusBadge from './StatusBadge';
import { useNavigate } from 'react-router-dom';

export default function StepRequestTable({ activeStage }) {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  const navigate = useNavigate();

  const totalPages = Math.ceil(requests.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentRequests = requests.slice(startIndex, startIndex + itemsPerPage);

  useEffect(() => {
    getRequests().then(res => {
      const data = Array.isArray(res) ? res : (res.data || []);
      setRequests(data);
      setLoading(false);
    }).catch(err => {
      console.error(err);
      setLoading(false);
    });
  }, []);

  const handleNavigate = (reqId) => {
    localStorage.setItem('lastGenerationRequestId', reqId);
    switch (activeStage) {
      case 'blueprint':
        navigate(`/review/blueprint?id=${reqId}`);
        break;
      case 'generation':
        navigate(`/progress?id=${reqId}`);
        break;
      case 'validation':
        navigate(`/validation?id=${reqId}`);
        break;
      case 'packages':
        navigate(`/packages?id=${reqId}`);
        break;
      case 'review':
        navigate(`/review/queue?id=${reqId}`);
        break;
      default:
        navigate(`/progress?id=${reqId}`);
    }
  };

  const getActionConfig = () => {
    switch (activeStage) {
      case 'blueprint': return { text: 'Review Blueprint', colorClass: 'text-blue-700 bg-blue-50 hover:bg-blue-600 hover:text-white border-blue-200 hover:border-blue-600' };
      case 'validation': return { text: 'Check Validation', colorClass: 'text-emerald-700 bg-emerald-50 hover:bg-emerald-600 hover:text-white border-emerald-200 hover:border-emerald-600' };
      case 'packages': return { text: 'View Packages', colorClass: 'text-purple-700 bg-purple-50 hover:bg-purple-600 hover:text-white border-purple-200 hover:border-purple-600' };
      case 'review': return { text: 'Review Code', colorClass: 'text-red-700 bg-red-50 hover:bg-red-600 hover:text-white border-red-200 hover:border-red-600' };
      case 'generation': 
      default:
        return { text: 'View Generation', colorClass: 'text-primary-orange bg-input-bg hover:bg-primary-orange hover:text-white border-border-orange/40 hover:border-primary-orange' };
    }
  };

  const actionConfig = getActionConfig();

  if (loading) {
    return <div className="p-8 text-center text-gray-500">Loading projects...</div>;
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 ">
      <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
        <div>
          <h2 className="text-xl font-bold text-gray-800 capitalize">{activeStage} Projects</h2>
          <p className="text-sm text-gray-500">Select a project to enter this pipeline stage.</p>
        </div>
      </div>
      <div className="overflow-x-auto overflow-y-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-white text-text-secondary text-xs uppercase tracking-wider border-b border-border-light">
              <th className="px-6 py-4 font-bold">ID</th>
              <th className="px-6 py-4 font-bold">Request Name</th>
              <th className="px-6 py-4 font-bold">App ID</th>
              <th className="px-6 py-4 font-bold">Status</th>
              <th className="px-6 py-4 font-bold">Date</th>
              <th className="px-6 py-4 font-bold text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border-light bg-white">
            {currentRequests.map(req => (
              <tr key={req.id} className="hover:bg-gray-50/50 transition-colors group">
                <td className="px-6 py-5 text-sm font-bold text-text-secondary">#{req.id}</td>
                <td className="px-6 py-5">
                  <div className="font-bold text-sidebar group-hover:text-primary-orange transition-colors">{req.request_name}</div>
                  <div className="text-xs text-text-secondary font-mono">{req.package_name}</div>
                </td>
                <td className="px-6 py-5">
                  <span className="bg-input-bg text-text-secondary px-2.5 py-1 rounded text-xs font-mono font-medium border border-border-light">
                    {req.application_id}
                  </span>
                </td>
                <td className="px-6 py-5">
                  <StatusBadge status={req.status} />
                </td>
                <td className="px-6 py-5 text-sm text-text-secondary font-medium">
                  {new Date(req.created_at).toLocaleDateString()}
                </td>
                <td className="px-6 py-5 text-sm font-medium text-right">
                  <button 
                    onClick={() => handleNavigate(req.id)}
                    className={`border px-4 py-2 rounded-lg font-bold shadow-sm transition-all ${actionConfig.colorClass}`}
                  >
                    {actionConfig.text}
                  </button>
                </td>
              </tr>
            ))}
            {requests.length === 0 && (
              <tr>
                <td colSpan="6" className="px-6 py-12 text-center text-gray-500">
                  No projects found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      
      {totalPages > 1 && (
        <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100 bg-gray-50">
          <div className="text-sm text-gray-500">
            Showing <span className="font-bold text-gray-700">{startIndex + 1}</span> to <span className="font-bold text-gray-700">{Math.min(startIndex + itemsPerPage, requests.length)}</span> of <span className="font-bold text-gray-700">{requests.length}</span> results
          </div>
          <div className="flex items-center space-x-2">
            <button 
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${currentPage === 1 ? 'text-gray-400 bg-gray-100 cursor-not-allowed' : 'text-gray-600 bg-white border border-gray-200 hover:bg-gray-50 hover:text-gray-800'}`}
            >
              Previous
            </button>
            <div className="flex items-center space-x-1">
              {[...Array(totalPages)].map((_, idx) => {
                if (
                  totalPages <= 5 || 
                  idx === 0 || 
                  idx === totalPages - 1 || 
                  (idx >= currentPage - 2 && idx <= currentPage)
                ) {
                  return (
                    <button
                      key={idx}
                      onClick={() => setCurrentPage(idx + 1)}
                      className={`w-8 h-8 flex items-center justify-center rounded-lg text-sm font-medium transition-colors ${currentPage === idx + 1 ? 'bg-primary-orange text-white' : 'text-gray-600 hover:bg-white border border-transparent hover:border-gray-200'}`}
                    >
                      {idx + 1}
                    </button>
                  );
                }
                
                if (
                  (idx === 1 && currentPage > 3) || 
                  (idx === totalPages - 2 && currentPage < totalPages - 2)
                ) {
                  return <span key={idx} className="text-gray-400 px-1">...</span>;
                }
                
                return null;
              })}
            </div>
            <button 
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${currentPage === totalPages ? 'text-gray-400 bg-gray-100 cursor-not-allowed' : 'text-gray-600 bg-white border border-gray-200 hover:bg-gray-50 hover:text-gray-800'}`}
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
