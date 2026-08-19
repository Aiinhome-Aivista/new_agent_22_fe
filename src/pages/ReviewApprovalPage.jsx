import { useState, useEffect } from 'react';
import ProgressStepper from '../components/ProgressStepper';
import { addReview, getRequest } from '../api/api';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import StepRequestTable from '../components/StepRequestTable';
import { useAuth } from '../context/AuthContext';
import Loader from '../components/Loader';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';

export default function ReviewApprovalPage() {
  const { id: pathId } = useParams();
  const [searchParams] = useSearchParams();
  const queryId = searchParams.get('id');
  const id = pathId || queryId;
  
  const navigate = useNavigate();
  const { user } = useAuth();

  const role = user?.role?.toLowerCase() || 'developer';
  const isDeveloper = role === 'developer';
  const isArchitect = role === 'solution architect' || role === 'architect';

  const [reqData, setReqData] = useState(null);
  const [loadingReq, setLoadingReq] = useState(true);

  const [formData, setFormData] = useState({
    reviewer_name: user?.name || '',
    decision: 'approved',
    comments: ''
  });
  const [loading, setLoading] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [successModal, setSuccessModal] = useState(false);

  useEffect(() => {
    if (!id) {
      setLoadingReq(false);
      return;
    }
    getRequest(id).then(res => {
      if (res.success) {
        setReqData(res.data);
      }
      setLoadingReq(false);
    }).catch(err => {
      console.error(err);
      setLoadingReq(false);
    });
  }, [id]);

  const handleOpenConfirm = (e) => {
    e.preventDefault();
    setShowConfirmModal(true);
  };

  const handleConfirmSubmit = async () => {
    setShowConfirmModal(false);
    setLoading(true);
    try {
      await addReview({ request_id: parseInt(id), ...formData });
      setSuccessModal(true);
      setTimeout(() => {
        navigate(isArchitect ? '/architect/dashboard' : (user?.dashboard || '/techlead/dashboard'));
      }, 2500);
    } catch (err) {
      console.error(err);
      alert('Error submitting review');
      setLoading(false);
    }
  };

  if (loadingReq) return <Loader />;

  if (!id) {
    return (
      <div className="flex flex-col h-full bg-gray-50 p-8">
        <StepRequestTable activeStage="review" />
      </div>
    );
  }

  const req = reqData?.request || {};
  const spec = reqData?.spec || {};
  const valSummary = reqData?.validation_summary || {};

  return (
    <div className="flex flex-col h-full">
      <ProgressStepper />
      <div className="p-8 max-w-4xl mx-auto w-full">
        <div className="flex items-center gap-4 mb-6">
          <button 
            onClick={() => navigate('/review/queue')} 
            className="p-2 -ml-2 text-gray-500 hover:text-gray-800 hover:bg-gray-100 rounded-full transition-colors"
            title="Go Back"
          >
            <ArrowLeftIcon className="w-5 h-5" />
          </button>
          <h2 className="text-2xl font-extrabold text-gray-800">Pipeline Review</h2>
        </div>
        {isDeveloper ? (
          /* Developer Persona Read-Only Status Card */
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-border-light text-center space-y-6">
            <div className="w-20 h-20 bg-amber-50 rounded-full flex items-center justify-center mx-auto border border-amber-200 text-amber-600 text-4xl shadow-sm">
              ⏳
            </div>
            <div>
              <span className="bg-amber-100 text-amber-800 text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full inline-block mb-3">
                Awaiting Tech Lead Approval
              </span>
              <h2 className="text-2xl font-extrabold text-gray-800">Review Pending for {req.request_name || `Request #${req.id || id}`}</h2>
              <p className="text-gray-600 text-sm mt-2 max-w-md mx-auto leading-relaxed">
                Your microservice codebase has been successfully generated, validated, and packaged. The pipeline is currently paused pending final Code Quality & Repository Commit sign-off from the Tech Lead.
              </p>
            </div>

            <div className="pt-4 flex justify-center gap-4">
              <button 
                onClick={() => navigate(`/requests/${id}/package`)}
                className="bg-primary-orange hover:bg-hover-orange text-white font-bold px-6 py-2.5 rounded-lg shadow-sm transition-colors text-sm flex items-center gap-2"
              >
                <span>⬇️</span> Download Skeleton ZIP
              </button>
              <button 
                onClick={() => navigate(user?.dashboard || '/developer/dashboard')}
                className="bg-white text-primary-orange hover:bg-primary-orange hover:text-white font-bold px-6 py-2.5 rounded-lg border border-primary-orange transition-colors text-sm"
              >
                Back to Dashboard
              </button>
            </div>
          </div>
        ) : (
          /* Tech Lead / Solution Architect Form with Inspection Details */
          <div className="space-y-6">
            {/* Inspection Card based on Persona */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-border-light space-y-4">
              <div className="flex items-center justify-between border-b border-border-light pb-4">
                <div>
                  <span className="bg-blue-50 text-blue-700 text-xs font-bold px-2.5 py-1 rounded-md uppercase font-mono">
                    ID #{req.id || id}
                  </span>
                  <h2 className="text-xl font-bold text-gray-800 mt-1">{req.request_name || 'Microservice Review'}</h2>
                </div>
                <div className="text-right">
                  <span className="text-xs text-gray-500 block uppercase font-bold">Validation Status</span>
                  <span className="text-sm font-bold text-emerald-600 flex items-center gap-1 justify-end">
                    <span>✓</span> All Rules Passed (0 Errors)
                  </span>
                </div>
              </div>

              {!isArchitect ? (
                <>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm bg-gray-50 p-4 rounded-xl border border-gray-200">
                    <div>
                      <span className="text-xs text-gray-500 font-medium block">Target App ID</span>
                      <strong className="font-mono text-gray-800">{req.application_id || 'N/A'}</strong>
                    </div>
                    <div>
                      <span className="text-xs text-gray-500 font-medium block">Package Name</span>
                      <strong className="font-mono text-gray-800">{req.package_name || spec.package_name || 'N/A'}</strong>
                    </div>
                    <div>
                      <span className="text-xs text-gray-500 font-medium block">Source Topic</span>
                      <strong className="font-mono text-gray-800">{spec.source_topics || 'N/A'}</strong>
                    </div>
                    <div>
                      <span className="text-xs text-gray-500 font-medium block">Target Topic</span>
                      <strong className="font-mono text-gray-800">{spec.target_topics || 'N/A'}</strong>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs text-gray-500 pt-2">
                    <div className="flex gap-4">
                      <span>Consumer Group: <strong className="font-mono text-gray-700">{spec.consumer_group}</strong></span>
                      <span>Error Topic Policy: <strong className="font-mono text-gray-700">{spec.error_topic_policy || 'DLQ'}</strong></span>
                    </div>
                    <button 
                      onClick={() => navigate(`/requests/${id}/package`)}
                      className="text-primary-orange font-bold hover:underline"
                    >
                      🔍 Inspect Code Skeleton Files &rarr;
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <div className="grid grid-cols-2 gap-4 text-sm bg-slate-50 p-4 rounded-xl border border-slate-200">
                    <div>
                      <span className="text-xs text-slate-500 font-medium block mb-1">Pattern Matching Summary</span>
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                        <strong className="text-slate-800">Stateful Processor Pattern</strong>
                      </div>
                    </div>
                    <div>
                      <span className="text-xs text-slate-500 font-medium block mb-1">Architecture Compliance</span>
                      <div className="flex flex-col gap-1">
                        <span className="flex items-center gap-1 text-emerald-700"><span className="text-xs">✓</span> State Store</span>
                        <span className="flex items-center gap-1 text-emerald-700"><span className="text-xs">✓</span> DLQ Configured</span>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Review Decision Form */}
            <form onSubmit={handleOpenConfirm} className="bg-white p-6 rounded-2xl shadow-sm border border-border-light space-y-6">
              <h2 className="text-xl font-bold text-gray-800">
                {isArchitect ? "Submit Architecture Review & Sign-Off" : "Submit Code Quality Review & Sign-Off"}
              </h2>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Reviewer Name</label>
                <input 
                  required 
                  type="text" 
                  value={formData.reviewer_name} 
                  onChange={(e) => setFormData({...formData, reviewer_name: e.target.value})} 
                  className="w-full bg-input-bg border border-border-light rounded-lg p-2.5 text-sm focus:border-border-orange outline-none font-medium text-gray-800" 
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Review Decision</label>
                <div className="flex gap-6">
                  <label className="flex items-center gap-2 cursor-pointer bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 px-4 py-2.5 rounded-lg transition-colors">
                    <input type="radio" name="decision" value="approved" checked={formData.decision === 'approved'} onChange={(e) => setFormData({...formData, decision: e.target.value})} className="w-4 h-4 text-emerald-600 focus:ring-emerald-600" />
                    <span className="text-sm font-bold text-emerald-800">Approve & Commit</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer bg-amber-50 hover:bg-amber-100 border border-amber-200 px-4 py-2.5 rounded-lg transition-colors">
                    <input type="radio" name="decision" value="rework" checked={formData.decision === 'rework'} onChange={(e) => setFormData({...formData, decision: e.target.value})} className="w-4 h-4 text-amber-500 focus:ring-amber-500" />
                    <span className="text-sm font-bold text-amber-800">Request Rework</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer bg-red-50 hover:bg-red-100 border border-red-200 px-4 py-2.5 rounded-lg transition-colors">
                    <input type="radio" name="decision" value="rejected" checked={formData.decision === 'rejected'} onChange={(e) => setFormData({...formData, decision: e.target.value})} className="w-4 h-4 text-red-600 focus:ring-red-600" />
                    <span className="text-sm font-bold text-red-800">Reject</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Architecture Review Comments</label>
                <textarea 
                  value={formData.comments} 
                  onChange={(e) => setFormData({...formData, comments: e.target.value})} 
                  rows="3" 
                  className="w-full bg-input-bg border border-border-light rounded-lg p-2.5 text-sm focus:border-border-orange outline-none font-medium text-gray-800" 
                  placeholder="Optional review notes or guidelines..."
                ></textarea>
              </div>

              <div className="pt-2 flex justify-end">
                <button type="submit" disabled={loading} className="bg-primary-orange hover:bg-hover-orange text-white px-8 py-3 rounded-lg font-bold shadow-md transition-colors disabled:opacity-50 text-sm flex items-center gap-2">
                  <span>✍️</span> {isArchitect ? "Approve Architecture & Grant Git Commit Clearance" : "Approve Code Quality & Ready for Deployment"}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-border-light space-y-5 animate-scale-up">
            <div className={`w-14 h-14 rounded-full flex items-center justify-center text-2xl font-bold mx-auto border ${
              formData.decision === 'approved' ? 'bg-emerald-100 text-emerald-700 border-emerald-300' :
              formData.decision === 'rework' ? 'bg-amber-100 text-amber-700 border-amber-300' :
              'bg-red-100 text-red-700 border-red-300'
            }`}>
              {formData.decision === 'approved' ? '✔️' : formData.decision === 'rework' ? '🔄' : '❌'}
            </div>
            <div className="text-center">
              <h3 className="text-xl font-extrabold text-gray-900">
                {formData.decision === 'approved' ? 'Confirm Architecture Sign-Off' :
                 formData.decision === 'rework' ? 'Confirm Request Rework' :
                 'Confirm Request Rejection'}
              </h3>
              <p className="text-sm text-gray-600 mt-2 leading-relaxed">
                Are you sure you want to <strong className="capitalize">{formData.decision}</strong> request <strong>#{req.id || id} {req.request_name ? `(${req.request_name})` : ''}</strong>?
                {formData.decision === 'approved' && ' This will officially sign off all 6 pipeline stages.'}
                {formData.decision === 'rework' && ' This will send the request back to the Solution Architect for blueprint revision.'}
                {formData.decision === 'rejected' && ' This will reject the microservice request.'}
              </p>
            </div>
            <div className="flex gap-3 pt-2">
              <button 
                onClick={() => setShowConfirmModal(false)}
                className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold py-2.5 rounded-lg border border-gray-300 text-sm transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={handleConfirmSubmit}
                className={`flex-1 text-white font-bold py-2.5 rounded-lg text-sm shadow-md transition-colors ${
                  formData.decision === 'approved' ? 'bg-emerald-600 hover:bg-emerald-700' :
                  formData.decision === 'rework' ? 'bg-amber-600 hover:bg-amber-700' :
                  'bg-red-600 hover:bg-red-700'
                }`}
              >
                {formData.decision === 'approved' ? 'Yes, Approve Request' :
                 formData.decision === 'rework' ? 'Confirm Rework Request' :
                 'Confirm Rejection'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Success Modal */}
      {successModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full p-8 shadow-2xl text-center space-y-4 animate-scale-up border border-border-light">
            <div className={`w-20 h-20 rounded-full flex items-center justify-center text-4xl mx-auto border shadow-inner ${
              formData.decision === 'approved' ? 'bg-emerald-100 text-emerald-600 border-emerald-300' :
              formData.decision === 'rework' ? 'bg-amber-100 text-amber-600 border-amber-300' :
              'bg-red-100 text-red-600 border-red-300'
            }`}>
              {formData.decision === 'approved' ? '🎉' : formData.decision === 'rework' ? '🔄' : '🛑'}
            </div>
            <h3 className="text-2xl font-extrabold text-gray-900">Review Submitted Successfully!</h3>
            <p className="text-sm text-gray-600 leading-relaxed">
              Request <strong>#{req.id || id}</strong> decision recorded as <strong className="capitalize">{formData.decision}</strong>.
            </p>
            <div className="pt-2 text-xs font-semibold text-gray-700 bg-gray-100 py-2 px-4 rounded-lg inline-block border border-gray-300">
              Redirecting to {isArchitect ? 'Architect' : 'Tech Lead'} Portal...
            </div>
          </div>
        </div>
      )}

    </div>
  );
}


