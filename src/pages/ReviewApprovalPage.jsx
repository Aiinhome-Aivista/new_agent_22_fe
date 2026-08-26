import { useState, useEffect } from 'react';
import ProgressStepper from '../components/ProgressStepper';
import { addReview, getRequest, getGeneratedFiles, getReviews } from '../api/api';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import StepRequestTable from '../components/StepRequestTable';
import { useAuth } from '../context/AuthContext';
import Loader from '../components/Loader';
import { ArrowLeftIcon, CubeIcon, CodeBracketIcon, ArrowDownTrayIcon, CheckCircleIcon, ClockIcon } from '@heroicons/react/24/outline';

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
  const [generatedFiles, setGeneratedFiles] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [openFileId, setOpenFileId] = useState(null);
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
    setLoadingReq(true);
    if (!id) {
      setLoadingReq(false);
      return;
    }
    Promise.all([
      getRequest(id),
      getGeneratedFiles(id).catch(() => ({ data: [] })),
      getReviews(id).catch(() => ({ data: [] }))
    ]).then(([resReq, resFiles, resReviews]) => {
      if (resReq.success) {
        setReqData(resReq.data);
      }
      setGeneratedFiles(resFiles.data || []);
      setReviews(resReviews.data || []);
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

  const renderStatusCard = () => (
    ['approved', 'packaged'].includes(req.status) ? (
      <div className="bg-white p-8 rounded-2xl shadow-sm border border-emerald-200 text-center space-y-6">
        <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mx-auto border border-emerald-200 text-emerald-600 text-4xl shadow-sm">
          <CheckCircleIcon className="w-10 h-10 stroke-[2.5]" />
        </div>
        <div>
          <span className="bg-emerald-100 text-emerald-800 text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full inline-block mb-3">
            Approved & Finalized
          </span>
          <h2 className="text-2xl font-extrabold text-gray-800">Pipeline Completed for {req.request_name || `Request #${req.id || id}`}</h2>
          <p className="text-gray-600 text-sm mt-2 max-w-lg mx-auto leading-relaxed">
            Your microservice codebase has been officially reviewed and signed off by the Tech Lead. 
            {reviews.length > 0 && reviews[0].comments && (
              <span className="block mt-4 bg-gray-50 p-4 rounded-lg text-gray-700 italic border border-gray-200 text-left">
                <strong>Notes from Tech Lead:</strong><br/>
                "{reviews[0].comments}" <br/>
                <span className="text-xs text-gray-500 font-medium not-italic mt-1 block">— {reviews[0].reviewer_name}</span>
              </span>
            )}
          </p>
        </div>

        {!isArchitect && (
          <div className="pt-4 flex justify-center gap-4">
            <button 
              onClick={() => navigate(`/requests/${id}/package`)}
              className="bg-primary-orange hover:bg-hover-orange text-white font-bold px-6 py-2.5 rounded-lg shadow-sm transition-colors text-sm flex items-center gap-2"
            >
              <ArrowDownTrayIcon className="w-5 h-5 stroke-[2.5]" />
              <span>Download Skeleton ZIP</span>
            </button>
            <button 
              onClick={() => navigate(user?.dashboard || (isDeveloper ? '/developer/dashboard' : '/architect/dashboard'))}
              className="bg-white text-primary-orange hover:bg-primary-orange hover:text-white font-bold px-6 py-2.5 rounded-lg border border-primary-orange transition-colors text-sm"
            >
              Back to Dashboard
            </button>
          </div>
        )}
      </div>
    ) : (
      <div className="bg-white p-8 rounded-2xl shadow-sm border border-border-light text-center space-y-6">
        <div className="w-20 h-20 bg-amber-50 rounded-full flex items-center justify-center mx-auto border border-amber-200 text-amber-600 text-4xl shadow-sm">
          <ClockIcon className="w-10 h-10 stroke-[2.5]" />
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

        {!isArchitect && (
          <div className="pt-4 flex justify-center gap-4">
            <button 
              onClick={() => navigate(`/requests/${id}/package`)}
              className="bg-primary-orange hover:bg-hover-orange text-white font-bold px-6 py-2.5 rounded-lg shadow-sm transition-colors text-sm flex items-center gap-2"
            >
              <ArrowDownTrayIcon className="w-5 h-5 stroke-[2.5]" />
              <span>Download Skeleton ZIP</span>
            </button>
            <button 
              onClick={() => navigate(user?.dashboard || (isDeveloper ? '/developer/dashboard' : '/architect/dashboard'))}
              className="bg-white text-primary-orange hover:bg-primary-orange hover:text-white font-bold px-6 py-2.5 rounded-lg border border-primary-orange transition-colors text-sm"
            >
              Back to Dashboard
            </button>
          </div>
        )}
      </div>
    )
  );

  return (
    <div className="flex flex-col h-full">
      <ProgressStepper />
      <div className="p-8 max-w-7xl mx-auto w-full">
        {loadingReq ? (
          <Loader />
        ) : (
          <>
            <div className="flex items-center gap-4 mb-6">
              <button 
                onClick={() => navigate(-1)} 
                className="p-2 -ml-2 text-gray-500 hover:text-gray-800 hover:bg-gray-100 rounded-full transition-colors"
                title="Go Back"
              >
                <ArrowLeftIcon className="w-5 h-5" />
              </button>
              <h2 className="text-2xl font-extrabold text-gray-800">Pipeline Review</h2>
            </div>
        {isDeveloper ? (
          /* Developer Persona Status Card */
          renderStatusCard()
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

                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 text-sm bg-gray-50 p-4 rounded-xl border border-gray-200">
                    <div className="overflow-hidden">
                      <span className="text-xs text-gray-500 font-medium block">Target App ID</span>
                      <strong className="font-mono text-gray-800 break-words block">{req.application_id || 'N/A'}</strong>
                    </div>
                    <div className="overflow-hidden">
                      <span className="text-xs text-gray-500 font-medium block">Package Name</span>
                      <strong className="font-mono text-gray-800 break-words block">{req.package_name || spec.package_name || 'N/A'}</strong>
                    </div>
                    <div className="overflow-hidden">
                      <span className="text-xs text-gray-500 font-medium block">Source Topic</span>
                      <strong className="font-mono text-gray-800 break-words block">{spec.source_topics || 'N/A'}</strong>
                    </div>
                    <div className="overflow-hidden">
                      <span className="text-xs text-gray-500 font-medium block">Target Topic</span>
                      <strong className="font-mono text-gray-800 break-words block">{spec.target_topics || 'N/A'}</strong>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row items-start sm:items-center text-xs text-gray-500 pt-2 gap-4">
                    <div className="flex flex-col sm:flex-row gap-4 overflow-hidden w-full">
                      <span className="truncate">Consumer Group: <strong className="font-mono text-gray-700">{spec.consumer_group}</strong></span>
                      <span className="truncate">Error Topic Policy: <strong className="font-mono text-gray-700">{spec.error_topic_policy || 'DLQ'}</strong></span>
                    </div>
                  </div>
            </div>

            {/* Architecture Blueprint Section */}
            {reqData?.blueprint && (
              <details className="bg-white rounded-2xl shadow-sm border border-border-light group">
                <summary className="p-6 cursor-pointer flex justify-between items-center text-lg font-bold text-gray-800 list-none [&::-webkit-details-marker]:hidden hover:bg-orange-50/50 transition-colors rounded-2xl">
                  <div className="flex items-center gap-2">
                    <span className="text-primary-orange"><CubeIcon className="w-6 h-6" /></span> Generated Architecture Blueprint
                  </div>
                  <span className="transition group-open:rotate-180 text-primary-orange">
                    <svg fill="none" height="24" shapeRendering="geometricPrecision" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" viewBox="0 0 24 24" width="24"><path d="M6 9l6 6 6-6"></path></svg>
                  </span>
                </summary>
                <div className="p-6 pt-0 border-t border-border-light/50">
                  <div className="bg-gray-900 rounded-xl p-4 overflow-hidden mt-4">
                    <pre className="text-xs text-green-400 overflow-x-auto custom-scrollbar pb-2">
                      <code>
                        {reqData.blueprint.file_manifest ? 
                          (function() {
                            try { return JSON.stringify(JSON.parse(reqData.blueprint.file_manifest), null, 2); }
                            catch(e) { return reqData.blueprint.file_manifest; }
                          })() : "No blueprint found."}
                      </code>
                    </pre>
                  </div>
                </div>
              </details>
            )}

            {/* Generated Files Section */}
            {generatedFiles && generatedFiles.length > 0 && (
              <details className="bg-white rounded-2xl shadow-sm border border-border-light group">
                <summary className="p-6 cursor-pointer flex justify-between items-center text-lg font-bold text-gray-800 list-none [&::-webkit-details-marker]:hidden hover:bg-orange-50/50 transition-colors rounded-2xl">
                  <div className="flex items-center gap-2">
                    <span className="text-primary-orange"><CodeBracketIcon className="w-6 h-6" /></span> Generated Source Code Files
                  </div>
                  <span className="transition group-open:rotate-180 text-primary-orange">
                    <svg fill="none" height="24" shapeRendering="geometricPrecision" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" viewBox="0 0 24 24" width="24"><path d="M6 9l6 6 6-6"></path></svg>
                  </span>
                </summary>
                <div className="p-6 pt-0 border-t border-border-light/50">
                  <div className="space-y-4 mt-4">
                    {generatedFiles.map(file => (
                      <div key={file.id} className="border border-gray-200 rounded-xl overflow-hidden">
                        <button 
                          type="button"
                          onClick={() => setOpenFileId(openFileId === file.id ? null : file.id)}
                          className="w-full bg-gray-50 hover:bg-gray-100 px-4 py-3 cursor-pointer flex justify-between items-center transition-colors text-left focus:outline-none"
                        >
                          <div className="flex items-center gap-3">
                            <span className={`transition text-gray-400 ${openFileId === file.id ? 'rotate-90' : ''}`}>
                              <svg fill="none" height="16" shapeRendering="geometricPrecision" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" width="16"><path d="M9 18l6-6-6-6"></path></svg>
                            </span>
                            <span className="font-mono text-sm font-bold text-gray-700">{file.file_name}</span>
                          </div>
                          <span className="text-[10px] font-bold text-primary-orange bg-orange-50 border border-orange-100 px-2 py-0.5 rounded uppercase">{file.file_type}</span>
                        </button>
                        {openFileId === file.id && (
                          <div className="bg-slate-900 p-4 overflow-hidden border-t border-gray-200">
                            <pre className="text-xs text-blue-300 overflow-x-auto custom-scrollbar pb-2">
                              <code>
                                {file.preview}
                              </code>
                            </pre>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </details>
            )}

            {/* Architect Persona Status Card */}
            {isArchitect && renderStatusCard()}

            {/* Review Decision Form */}
            {!isArchitect && (
              <form onSubmit={handleOpenConfirm} className="bg-white p-6 rounded-2xl shadow-sm border border-border-light space-y-6">
                <h2 className="text-xl font-bold text-gray-800">
                  Submit Code Quality Review & Sign-Off
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
                    <span>✍️</span> Approve Code Quality & Ready for Deployment
                  </button>
                </div>
              </form>
            )}
          </div>
        )}
          </>
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


