import { useState } from 'react';
import Navbar from '../components/Navbar';
import ProgressStepper from '../components/ProgressStepper';
import { addReview } from '../api/api';
import { useParams, useNavigate } from 'react-router-dom';

export default function ReviewApprovalPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    reviewer_name: '',
    decision: 'approved',
    comments: ''
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await addReview({ request_id: parseInt(id), ...formData });
      setSuccess(true);
      setTimeout(() => navigate('/'), 2000);
    } catch (err) {
      console.error(err);
      alert('Error submitting review');
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full">
      <Navbar title={`Request #${id} - Review & Approval (HITL)`} />
      <ProgressStepper />
      <div className="p-8 max-w-2xl mx-auto w-full">
        <form onSubmit={handleSubmit} className="bg-white p-6 rounded shadow border border-border-light space-y-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Submit Architecture Review</h2>
          
          {success && (
            <div className="bg-green-50 text-green-700 p-4 rounded mb-4 font-medium border border-green-200">
              Review submitted successfully! Redirecting...
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Reviewer Name</label>
            <input required type="text" value={formData.reviewer_name} onChange={(e) => setFormData({...formData, reviewer_name: e.target.value})} className="w-full bg-input-bg border border-border-light rounded p-2 focus:border-border-orange outline-none" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Decision</label>
            <div className="flex gap-6">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="radio" name="decision" value="approved" checked={formData.decision === 'approved'} onChange={(e) => setFormData({...formData, decision: e.target.value})} className="w-4 h-4 text-green-600 focus:ring-green-600" />
                <span className="text-sm font-medium text-gray-700">Approve</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="radio" name="decision" value="rework" checked={formData.decision === 'rework'} onChange={(e) => setFormData({...formData, decision: e.target.value})} className="w-4 h-4 text-amber-500 focus:ring-amber-500" />
                <span className="text-sm font-medium text-gray-700">Request Rework</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="radio" name="decision" value="rejected" checked={formData.decision === 'rejected'} onChange={(e) => setFormData({...formData, decision: e.target.value})} className="w-4 h-4 text-red-600 focus:ring-red-600" />
                <span className="text-sm font-medium text-gray-700">Reject</span>
              </label>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Comments</label>
            <textarea value={formData.comments} onChange={(e) => setFormData({...formData, comments: e.target.value})} rows="4" className="w-full bg-input-bg border border-border-light rounded p-2 focus:border-border-orange outline-none" placeholder="Required if rework or rejected..."></textarea>
          </div>

          <div className="pt-4 flex justify-end">
            <button type="submit" disabled={loading} className="bg-button-orange hover:bg-hover-orange text-white px-8 py-2 rounded font-medium transition-colors disabled:opacity-50">
              Submit Review
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
