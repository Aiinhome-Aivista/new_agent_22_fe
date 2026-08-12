import { useEffect, useState } from 'react';
import ProgressStepper from '../components/ProgressStepper';
import FileTree from '../components/FileTree';
import { getBlueprint, approveBlueprint, reworkBlueprint, runWorkflow, getRequests } from '../api/api';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import RequestTable from '../components/RequestTable';
import Loader from '../components/Loader';
import { useAuth } from '../context/AuthContext';


export default function BlueprintPage() {
  const { user } = useAuth();
  const role = user?.role?.toLowerCase() || 'developer';
  const isArchitect = role === 'solution architect' || role === 'architect';
  const { id: pathId } = useParams();
  const [searchParams] = useSearchParams();
  const queryId = searchParams.get('id');
  const id = pathId || queryId;
  const navigate = useNavigate();
  const [blueprint, setBlueprint] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showReworkModal, setShowReworkModal] = useState(false);
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [comments, setComments] = useState('');
  const [assumptionsAcknowledged, setAssumptionsAcknowledged] = useState(false);
  const [requests, setRequests] = useState([]);

  useEffect(() => {
    if (!id) {
      getRequests().then(data => {
        setRequests(data.data || []);
        setLoading(false);
      }).catch(err => {
        console.error(err);
        setLoading(false);
      });
      return;
    }
    getBlueprint(id).then(data => {
      const bp = data?.data;
      setBlueprint(bp || null);
      if (!bp?.assumptions || bp.assumptions.length === 0) {
        setAssumptionsAcknowledged(true);
      } else {
        setAssumptionsAcknowledged(false);
      }
      setLoading(false);
    }).catch(err => {
      console.error(err);
      setBlueprint(null);
      setLoading(false);
    });
  }, [id]);

  if (loading) return <Loader />;

  if (!id) {
    return (
      <div className="flex flex-col h-full bg-gray-50 p-8">
        <div className="animate-fade-in-up">
          <div className="mb-8">
            <h1 className="text-2xl font-extrabold text-sidebar tracking-tight">
              {isArchitect ? "Architecture Blueprints" : "Microservice Blueprints"}
            </h1>
            <p className="text-text-secondary mt-1">
              {isArchitect ? "Review generated designs against messaging patterns and standards." : "View structural class manifests, handler contracts, and approval status."}
            </p>
          </div>
          <div className="bg-white rounded-2xl shadow-sm border border-border-light/60 overflow-hidden">
            <div className="p-6 md:p-8 border-b border-border-light/60 bg-white relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-blue-50 rounded-full mix-blend-multiply filter blur-3xl opacity-70 -translate-y-1/2 translate-x-1/4"></div>
              <div className="relative z-10">
                <h2 className="font-extrabold text-sidebar text-2xl">
                  {isArchitect ? "Blueprint Reviews" : "Blueprint Inspection"}
                </h2>
                <p className="text-sm text-text-secondary mt-1">
                  {isArchitect ? "Select a request below to view its blueprint details." : "Select a request below to inspect its blueprint details."}
                </p>
              </div>
            </div>
            <RequestTable
              requests={requests}
              role={role}
              navigate={navigate}
              actionOverride={!isArchitect ? { pathPrefix: '/requests/', pathSuffix: '/blueprint', label: 'View Blueprint' } : null}
            />
          </div>
        </div>
      </div>
    );
  }

  const handleApproveConfirm = async () => {
    if (!blueprint || !assumptionsAcknowledged) return;
    setLoading(true);
    await approveBlueprint(blueprint.id);
    await runWorkflow(id, false);
    setBlueprint({ ...blueprint, status: 'approved' });
    setShowApproveModal(false);
    setLoading(false);
  };

  const handleRework = async () => {
    if (!blueprint || !comments.trim()) return;
    setLoading(true);
    await reworkBlueprint(blueprint.id, comments);
    setShowReworkModal(false);
    navigate('/architect/dashboard');
  };

  return (
    <div className="flex flex-col h-full">
      <ProgressStepper />
      <div className="p-8 flex-1 overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-4">
            <h2 className="text-xl font-bold text-gray-800">Generated Blueprint</h2>
            {!isArchitect && blueprint && (
              <span className={`px-3 py-1 rounded-full text-xs font-bold ${blueprint.status === 'approved' || blueprint.status === 'packaged' ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800'}`}>
                {blueprint.status === 'approved' || blueprint.status === 'packaged' ? 'Approved by Architect' : 'Pending Architect Review'}
              </span>
            )}
          </div>
          <div className="flex gap-4">
            {!isArchitect && blueprint && ['approved', 'packaged', 'validated'].includes(blueprint.status?.toLowerCase()) ? (
              <button onClick={() => navigate(`/requests/${id}/generation`)} className="bg-primary-orange hover:bg-hover-orange text-white px-6 py-2 rounded font-bold shadow-sm transition-colors">
                Proceed to Code Generation
              </button>
            ) : !isArchitect && blueprint ? (
              <button disabled className="bg-gray-200 text-gray-500 cursor-not-allowed px-6 py-2 rounded font-medium transition-colors">
                Waiting for Architect Approval
              </button>
            ) : null}
            {blueprint && isArchitect && ['approved', 'packaged', 'validated'].includes(blueprint.status?.toLowerCase()) ? (
              <>
                <span className="bg-green-100 text-green-800 px-4 py-2 rounded-lg font-bold text-sm flex items-center border border-green-200">
                  Approved by Architect
                </span>
                <button onClick={() => navigate('/review/blueprint')} className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-6 py-2 rounded font-medium shadow-sm transition-colors">
                  Back to Blueprint Reviews
                </button>
              </>
            ) : blueprint && isArchitect ? (
              <>
                <button onClick={() => setShowReworkModal(true)} className="bg-red-50 hover:bg-red-100 text-red-600 px-6 py-2 rounded border border-red-200 font-medium transition-colors">
                  Request Rework / Reject
                </button>
                <button
                  onClick={() => setShowApproveModal(true)}
                  disabled={!assumptionsAcknowledged}
                  className={`px-6 py-2 rounded font-medium transition-colors ${assumptionsAcknowledged ? 'bg-green-600 hover:bg-green-700 text-white' : 'bg-green-200 text-white cursor-not-allowed'}`}>
                  Approve Blueprint
                </button>
              </>
            ) : null}
          </div>
        </div>

        {blueprint ? (
          <div className="grid gap-6">

            {blueprint.assumptions && blueprint.assumptions.length > 0 && (
              <div className="bg-yellow-50 border border-yellow-200 p-6 rounded-lg shadow-sm">
                <h3 className="font-bold text-yellow-800 flex items-center gap-2 mb-3">
                  <span className="text-xl">⚠️</span> AI Assumptions & Escalations
                </h3>
                <ul className="list-disc pl-8 mb-4 text-sm text-yellow-900 space-y-1">
                  {blueprint.assumptions.map((asm, idx) => (
                    <li key={idx}>{asm}</li>
                  ))}
                </ul>
                <div className="flex items-center gap-2 mt-4 bg-white p-3 rounded border border-yellow-100">
                  <input
                    type="checkbox"
                    id="ackAssumptions"
                    checked={assumptionsAcknowledged}
                    onChange={(e) => setAssumptionsAcknowledged(e.target.checked)}
                    className="w-4 h-4 text-primary-orange rounded"
                  />
                  <label htmlFor="ackAssumptions" className="text-sm font-bold text-gray-700 cursor-pointer">
                    I acknowledge these assumptions and approve proceeding.
                  </label>
                </div>
              </div>
            )}

            <div className="bg-slate-50 border border-slate-200 p-6 rounded-lg shadow-sm">
              <h3 className="font-bold text-slate-800 flex items-center gap-2 mb-4">
                <span className="text-xl">🛡️</span> Architecture Standards Checklist
              </h3>
              <div className="space-y-3">
                <label className="flex items-center gap-3">
                  <input type="checkbox" checked readOnly className="w-4 h-4 text-green-600 rounded focus:ring-green-500" />
                  <span className="text-sm font-medium text-slate-700">Processor-Handler-Supplier Separation</span>
                </label>
                <label className="flex items-center gap-3">
                  <input type="checkbox" checked readOnly className="w-4 h-4 text-green-600 rounded focus:ring-green-500" />
                  <span className="text-sm font-medium text-slate-700">State Store & Ordering Logic</span>
                </label>
                <label className="flex items-center gap-3">
                  <input type="checkbox" checked readOnly className="w-4 h-4 text-green-600 rounded focus:ring-green-500" />
                  <span className="text-sm font-medium text-slate-700">DLQ Error Topic Configuration</span>
                </label>
              </div>
            </div>

            <div className="bg-white p-6 rounded shadow border border-border-light">
              <h3 className="font-bold text-gray-700 mb-4">File Manifest</h3>
              <FileTree manifest={blueprint.file_manifest} />
            </div>

            <div className="bg-white p-6 rounded shadow border border-border-light">
              <h3 className="font-bold text-gray-700 mb-4">Class Design & AI Rationale</h3>
              <div className="prose prose-sm max-w-none text-gray-600 mb-6">
                <p><strong>Design:</strong> {blueprint.class_design}</p>
                <p><strong>Rationale:</strong> {blueprint.generated_rationale}</p>
              </div>

              {blueprint.alternative_designs && blueprint.alternative_designs.length > 0 && (
                <div className="mt-6 pt-6 border-t border-gray-100">
                  <h4 className="font-bold text-gray-700 mb-3 text-sm uppercase tracking-wider">Alternative Designs</h4>
                  <div className="grid gap-4">
                    {blueprint.alternative_designs.map((alt, idx) => (
                      <div key={idx} className="bg-gray-50 border border-gray-200 p-4 rounded text-sm text-gray-700">
                        {alt}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="text-gray-500 italic">Blueprint not found.</div>
        )}
      </div>

      {showApproveModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden animate-fade-in-up">
            <div className="p-6 border-b border-gray-100">
              <h3 className="text-lg font-bold text-gray-800">Confirm Approval</h3>
              <p className="text-sm text-gray-500 mt-1">Are you sure you want to approve this architecture blueprint?</p>
            </div>
            <div className="p-6">
              <p className="text-sm text-gray-600 mb-2">
                Approving this blueprint will finalize the design and unlock the generation phase for developers.
              </p>
            </div>
            <div className="p-6 border-t border-gray-100 bg-gray-50 flex justify-end gap-3">
              <button
                onClick={() => setShowApproveModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-bold text-gray-600 hover:bg-gray-100 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleApproveConfirm}
                className="px-4 py-2 rounded-lg text-sm font-bold transition-colors bg-green-600 text-white hover:bg-green-700"
              >
                Confirm Approval
              </button>
            </div>
          </div>
        </div>
      )}

      {showReworkModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden animate-fade-in-up">
            <div className="p-6 border-b border-gray-100">
              <h3 className="text-lg font-bold text-gray-800">Request Rework</h3>
              <p className="text-sm text-gray-500 mt-1">Provide feedback for the AI generation agent to refine this blueprint.</p>
            </div>
            <div className="p-6">
              <textarea
                className="w-full border border-gray-300 rounded-lg p-3 text-sm focus:ring-2 focus:ring-primary-orange focus:border-transparent outline-none resize-none h-32"
                placeholder="E.g., The Processor class needs to handle generic types, and we should use the correlation ID pattern for logging..."
                value={comments}
                onChange={(e) => setComments(e.target.value)}
              />
            </div>
            <div className="p-6 border-t border-gray-100 bg-gray-50 flex justify-end gap-3">
              <button
                onClick={() => setShowReworkModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-bold text-gray-600 hover:bg-gray-100 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleRework}
                disabled={!comments.trim()}
                className={`px-4 py-2 rounded-lg text-sm font-bold transition-colors ${comments.trim() ? 'bg-red-600 text-white hover:bg-red-700' : 'bg-red-300 text-white cursor-not-allowed'}`}
              >
                Submit Feedback
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
