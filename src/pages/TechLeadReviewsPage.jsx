import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getTechLeadReviews } from '../api/api';

export default function TechLeadReviewsPage() {
  const navigate = useNavigate();

  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getTechLeadReviews().then(res => {
      setReviews(res.data || []);
      setLoading(false);
    }).catch(err => {
      console.error(err);
      setLoading(false);
    });
  }, []);

  return (
    <div className="flex flex-col h-full bg-gray-50 p-8">
      <div className="animate-fade-in-up max-w-6xl mx-auto w-full">
        <div className="mb-8">
          <h1 className="text-2xl font-extrabold text-sidebar tracking-tight">Code Reviews & Approvals</h1>
          <p className="text-text-secondary mt-1">Project-wise approval queue for generated microservices ready for Git commit.</p>
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
                  <td className="px-6 py-5 text-right flex justify-end">
                    <button 
                      onClick={() => navigate(`/requests/${rev.id}/review`)} 
                      className="bg-primary-orange hover:bg-hover-orange text-white px-4 py-2 rounded-lg text-sm font-bold shadow-sm transition-colors"
                    >
                      Inspect & Sign-off
                    </button>
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
