import React, { useState, useEffect } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { getTechLeadReviews } from '../api/api';
import { useProject } from '../context/ProjectContext';
import { 
  ChevronRightIcon,
  FolderIcon,
  QueueListIcon
} from '@heroicons/react/24/outline';

export default function TechLeadReviewsPage() {
  const navigate = useNavigate();
  const { currentProject, currentTrack, selectTrack } = useProject();

  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getTechLeadReviews(currentTrack?.id).then(res => {
      let fetchedReviews = res.data || [];

      setReviews(fetchedReviews);
      setLoading(false);
    }).catch(err => {
      console.error(err);
      setLoading(false);
    });
  }, [currentTrack]);

  if (!currentTrack || !currentProject) {
    return <Navigate to="/projects" replace />;
  }

  return (
    <div className="flex flex-col h-full bg-gray-50 p-8">
      <div className="animate-fade-in-up max-w-6xl mx-auto w-full">
        
        {/* Track Context & Breadcrumb Bar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            {/* Breadcrumb Navigation */}
            <div className="flex flex-wrap items-center gap-2 text-xs text-text-secondary mb-1">
              <button 
                onClick={() => { selectTrack(null, null); navigate('/projects'); }}
                className="hover:text-primary-orange transition-colors font-bold flex items-center gap-1"
              >
                <FolderIcon className="w-3.5 h-3.5 text-primary-orange" />
                Projects Directory
              </button>
              <ChevronRightIcon className="w-3 h-3 text-placeholder" />
              <span className="font-bold text-sidebar">{currentProject.name}</span>
              <ChevronRightIcon className="w-3 h-3 text-placeholder" />
              <span className="text-primary-orange font-extrabold flex items-center gap-1">
                <QueueListIcon className="w-3.5 h-3.5" />
                {currentTrack.track_name}
              </span>
            </div>

            <h1 className="text-2xl font-extrabold text-sidebar tracking-tight">Code Reviews & Approvals</h1>
            <p className="text-text-secondary mt-1">Project-wise approval queue for <span className="font-bold text-sidebar">{currentTrack.track_name}</span> generated microservices.</p>
          </div>

          <button
            onClick={() => { selectTrack(null, currentProject); navigate('/projects'); }}
            className="self-start md:self-auto text-xs font-bold text-primary-orange hover:bg-orange-50 border border-orange-200 px-3.5 py-1.5 rounded-xl transition-all"
          >
            Switch Track / Project &rarr;
          </button>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-border-light/60 overflow-hidden">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50 text-gray-500 text-[11px] font-bold uppercase tracking-wider border-b border-border-light/60">
                <th className="px-6 py-4">Req ID</th>
                <th className="px-6 py-4">Service Name</th>
                <th className="px-6 py-4">Target App ID</th>
                <th className="px-6 py-4">Validation Status</th>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-light/40">
              {loading ? (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center text-gray-500 font-medium">Loading reviews...</td>
                </tr>
              ) : reviews.map(rev => (
                <tr key={rev.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-6 py-5 font-mono text-sm font-medium text-gray-500">#{rev.id}</td>
                  <td className="px-6 py-5 font-bold text-gray-800 text-sm">{rev.serviceName}</td>
                  <td className="px-6 py-5 font-mono text-xs text-gray-500">{rev.targetAppId}</td>
                  <td className="px-6 py-5">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold inline-flex items-center gap-1 ${
                      rev.validationStatus.includes('Warnings') || rev.validationStatus === 'Failed' ? 'bg-amber-50 text-amber-700 border border-amber-200' : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    }`}>
                      <span>{rev.validationStatus === 'Failed' ? '✕' : '✓'}</span> {rev.validationStatus}
                    </span>
                  </td>
                  <td className="px-6 py-5 text-sm font-medium text-gray-500">{new Date(rev.date).toLocaleDateString()}</td>
                  <td className="px-6 py-5 text-right flex justify-end gap-2">
                    <button 
                      onClick={() => navigate(`/requests/${rev.id}/review`)} 
                      disabled={['approved', 'packaged', 'rejected'].includes(rev.status)}
                      className={`px-4 py-2 rounded-lg text-sm font-bold shadow-sm transition-colors ${
                        ['approved', 'packaged', 'rejected'].includes(rev.status)
                        ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                        : 'bg-primary-orange hover:bg-hover-orange text-white'
                      }`}
                    >
                      {['approved', 'packaged'].includes(rev.status) ? 'Approved' : rev.status === 'rejected' ? 'Rejected' : 'Inspect & Sign-off'}
                    </button>
                    {['approved', 'packaged', 'rejected'].includes(rev.status) && (
                      <button 
                        onClick={() => navigate(`/requests/${rev.id}/review?viewOnly=true`)} 
                        className="px-4 py-2 rounded-lg text-sm font-bold shadow-sm transition-colors bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
                      >
                        View
                      </button>
                    )}
                  </td>
                </tr>
              ))}
              {!loading && reviews.length === 0 && (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center text-gray-500 font-medium">
                    No code reviews pending.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
