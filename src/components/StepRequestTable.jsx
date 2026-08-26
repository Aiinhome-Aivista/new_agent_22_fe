import { useState, useEffect } from 'react';
import { getRequests } from '../api/api';
import StatusBadge from './StatusBadge';
import { useNavigate } from 'react-router-dom';
import Loader from './Loader';
import { useProject } from '../context/ProjectContext';

export default function StepRequestTable({ activeStage }) {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  const navigate = useNavigate();
  const { currentTrack } = useProject();

  const totalPages = Math.ceil(requests.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentRequests = requests.slice(startIndex, startIndex + itemsPerPage);

  useEffect(() => {
    const params = currentTrack ? { track_id: currentTrack.id } : {};
    getRequests(params).then(res => {
      const data = Array.isArray(res) ? res : (res.data || []);
      setRequests(data);
      setLoading(false);
    }).catch(err => {
      console.error(err);
      setLoading(false);
    });
  }, [currentTrack]);

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
    const orangeClass = 'bg-primary-orange text-white hover:bg-hover-orange border-primary-orange hover:border-hover-orange';
    switch (activeStage) {
      case 'blueprint': return { text: 'View', colorClass: orangeClass };
      case 'validation': return { text: 'View', colorClass: orangeClass };
      case 'packages': return { text: 'View', colorClass: orangeClass };
      case 'review': return { text: 'View', colorClass: orangeClass };
      case 'generation': 
      default:
        return { text: 'View', colorClass: orangeClass };
    }
  };

  const actionConfig = getActionConfig();

  if (loading) {
    return <Loader message="Loading..." />;
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
              <th className="px-6 py-4 font-bold whitespace-nowrap">ID</th>
              <th className="px-6 py-4 font-bold whitespace-nowrap">Request Name</th>
              <th className="px-6 py-4 font-bold whitespace-nowrap">App ID</th>
              <th className="px-6 py-4 font-bold whitespace-nowrap">Status</th>
              <th className="px-6 py-4 font-bold whitespace-nowrap">Date</th>
              <th className="px-6 py-4 font-bold text-right whitespace-nowrap">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border-light bg-white">
            {currentRequests.map(req => (
              <tr key={req.id} className="hover:bg-gray-50/50 transition-colors group">
                <td className="px-6 py-5 text-sm font-bold text-text-secondary">#{req.id}</td>
                <td className="px-6 py-5">
                  <div className="font-bold text-sidebar group-hover:text-primary-orange transition-colors truncate max-w-[250px] min-w-[150px]" title={req.request_name}>{req.request_name}</div>
                  <div className="text-xs text-text-secondary font-mono truncate max-w-[250px]" title={req.package_name}>{req.package_name}</div>
                </td>
                <td className="px-6 py-5">
                  <span className="bg-input-bg text-text-secondary px-2.5 py-1 rounded text-xs font-mono font-medium border border-border-light inline-block truncate max-w-[200px]" title={req.application_id}>
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
                    disabled={req.status === 'draft'}
                    className={`border px-4 py-2 rounded-lg font-bold shadow-sm transition-all ${req.status === 'draft' ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed' : actionConfig.colorClass}`}
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
