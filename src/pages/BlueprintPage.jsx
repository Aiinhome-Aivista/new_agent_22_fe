import { useEffect, useState } from 'react';
import ProgressStepper from '../components/ProgressStepper';
import FileTree from '../components/FileTree';
import MermaidDiagram from '../components/MermaidDiagram';
import { getBlueprint, approveBlueprint, reworkBlueprint, runWorkflow, getRequests, getRequest } from '../api/api';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import RequestTable from '../components/RequestTable';
import Loader from '../components/Loader';
import { useAuth } from '../context/AuthContext';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import { useProject } from '../context/ProjectContext';

export default function BlueprintPage() {
  const { user } = useAuth();
  const { currentTrack, currentProject } = useProject();
  const role = user?.role?.toLowerCase() || 'developer';
  const isArchitect = role === 'solution architect' || role === 'architect';
  const { id: pathId } = useParams();
  const [searchParams] = useSearchParams();
  const queryId = searchParams.get('id');
  const id = pathId || queryId;
  const navigate = useNavigate();
  const [blueprint, setBlueprint] = useState(null);
  const [loading, setLoading] = useState(true);
  const [approving, setApproving] = useState(false);
  const [showReworkModal, setShowReworkModal] = useState(false);
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [comments, setComments] = useState('');
  const [assumptionsAcknowledged, setAssumptionsAcknowledged] = useState(false);
  const [requests, setRequests] = useState([]);
  const [requestObj, setRequestObj] = useState(null);
  const [specObj, setSpecObj] = useState(null);
  const [jobObj, setJobObj] = useState(null);
  const [refreshToggle, setRefreshToggle] = useState(false);

  useEffect(() => {
    setBlueprint(null);
    setRequestObj(null);
    setSpecObj(null);
    setJobObj(null);
    setLoading(true);

    if (!id) {
      getRequests().then(data => {
        let reqs = data.data || [];
        if (isArchitect) {
          reqs = reqs.filter(r => ['draft', 'blueprint_review', 'approved', 'in_progress', 'validated', 'packaged', 'rework'].includes(r.status?.toLowerCase()));
        }
        if (currentTrack) {
          reqs = reqs.filter(r => 
            r.track_id === currentTrack.id || 
            r.track_name === currentTrack.track_name ||
            (currentTrack.track_name && r.request_name && r.request_name.toLowerCase().includes(currentTrack.track_name.toLowerCase()))
          );
        }
        setRequests(reqs);
        setLoading(false);
      }).catch(err => {
        console.error(err);
        setLoading(false);
      });
      return;
    }

    let isMounted = true;
    let pollTimer = null;

    const fetchStatus = () => {
      getRequest(id).then(data => {
        if (!isMounted) return;
        const req = data?.data?.request || null;
        const spec = data?.data?.spec || null;
        const job = data?.data?.job || null;
        const bp = data?.data?.blueprint;
        
        setRequestObj(req);
        setSpecObj(spec);
        setJobObj(job);
        setBlueprint(bp || null);
        
        if (!bp?.assumptions || bp.assumptions.length === 0) {
          setAssumptionsAcknowledged(true);
        }

        setLoading(false);

        const isGenerating = job && job.job_status === 'running';
        const needsReworkAndGenerating = bp && bp.status === 'rework' && isGenerating;

        // Only poll again if blueprint is not yet available and job is still running/generating
        if ((!bp || needsReworkAndGenerating) && isGenerating) {
          pollTimer = setTimeout(fetchStatus, 3000);
        }
      }).catch(err => {
        if (!isMounted) return;
        console.error(err);
        setBlueprint(null);
        setRequestObj(null);
        setJobObj(null);
        setLoading(false);
      });
    };

    fetchStatus();

    return () => {
      isMounted = false;
      if (pollTimer) clearTimeout(pollTimer);
    };
  }, [id, refreshToggle]);

  const getCleanSystemSummary = () => {
    if (requestObj?.description && !requestObj.description.startsWith('[')) {
      return requestObj.description;
    }

    if (specObj?.schema_hints) {
      const hints = specObj.schema_hints;
      if (typeof hints === 'string' && (hints.trim().startsWith('[') || hints.trim().startsWith('{'))) {
        try {
          const parsed = JSON.parse(hints);
          if (Array.isArray(parsed)) {
            const userMsg = parsed.find(m => m.role === 'user' && m.text && m.text.length > 20);
            if (userMsg) return userMsg.text;
          }
        } catch (e) {}
      } else if (typeof hints === 'string' && hints.length > 30 && !hints.startsWith('[')) {
        return hints;
      }
    }

    return `The ${requestObj?.request_name || 'Agentic AI-powered Virtual Knowledge Transfer (KT) Manager'} is an event-driven system designed to automate the complete KT lifecycle for four personas: KT Receiver, KT Giver, KT Manager, and Admin. Using Java, Apache Kafka, microservices, and specialized AI agents, the system automates KT planning, session scheduling, knowledge sharing, progress tracking, assessments, feedback analysis, knowledge-gap detection, risk prediction, recommendations, and notifications. Every important KT activity generates Kafka events, which are consumed and processed by AI agents and microservices in real time. The system continuously monitors KT activities, identifies delays, risks, and knowledge gaps, recommends corrective actions, and provides real-time dashboards for managers and administrators.`;
  };

  if (loading) return <Loader />;

  if (!id) {
    return (
      <div className="flex flex-col h-full bg-gray-50 p-4 md:p-4">
        <div className="animate-fade-in-up">

          <div className="bg-white rounded-2xl shadow-sm border border-border-light/60 overflow-hidden">
            <div className="p-6 md:p-6 border-b border-border-light/60 bg-white relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-blue-50 rounded-full mix-blend-multiply filter blur-3xl opacity-70 -translate-y-1/2 translate-x-1/4"></div>
              <div className="relative z-10">
                <h2 className="font-extrabold text-sidebar text-xl">
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
    if (!blueprint) return;
    setApproving(true);
    try {
      await approveBlueprint(blueprint.id);
      setBlueprint(prev => ({ ...prev, status: 'approved' }));
      setRequestObj(prev => prev ? { ...prev, status: 'approved' } : null);
      setShowApproveModal(false);
    } catch (err) {
      console.error('Error approving blueprint:', err);
      alert('Error approving blueprint');
    } finally {
      setApproving(false);
    }
  };

  const handleRework = async () => {
    if (!blueprint || !comments.trim()) return;
    setLoading(true);
    await reworkBlueprint(blueprint.id, comments);
    
    // Trigger workflow again in draft mode to regenerate
    await runWorkflow(id, true);
    
    setShowReworkModal(false);
    setComments('');
    setRefreshToggle(prev => !prev);
  };

  return (
    <div className="flex flex-col h-full">
      <ProgressStepper />
      <div className="p-8 flex-1 overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => navigate(isArchitect ? '/review/blueprint' : -1)} 
              className="p-2 -ml-2 text-gray-500 hover:text-gray-800 hover:bg-gray-100 rounded-full transition-colors"
              title={isArchitect ? "Back to Blueprint Reviews" : "Go Back"}
            >
              <ArrowLeftIcon className="w-5 h-5" />
            </button>
            <h2 className="text-xl font-bold text-gray-800">Generated Blueprint</h2>
            {!isArchitect && blueprint && requestObj && (
              <>
                {['approved'].includes(requestObj.status?.toLowerCase()) && (
                  <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-xs font-bold border border-green-200">Approved by Architect</span>
                )}
                {requestObj.status === 'in_progress' && (
                  <span className="bg-orange-100 text-orange-800 px-3 py-1 rounded-full text-xs font-bold border border-orange-200">Generation in Progress</span>
                )}
                {(requestObj.status === 'packaged' || requestObj.status === 'validated') && (
                  <span className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-xs font-bold border border-purple-200">Packaged</span>
                )}
                {['draft', 'rework', 'pending review'].includes(requestObj.status?.toLowerCase()) && (
                  <span className="bg-amber-100 text-amber-800 px-3 py-1 rounded-full text-xs font-bold border border-amber-200">Pending Architect Review</span>
                )}
              </>
            )}
          </div>
          <div className="flex gap-4">
            {!isArchitect && blueprint && requestObj ? (
              <>
                {requestObj.status === 'approved' && (
                  <button onClick={() => navigate(`/requests/${id}/generation`)} className="bg-primary-orange hover:bg-hover-orange text-white px-6 py-2 rounded font-bold shadow-sm transition-colors">
                    Proceed to Code Generation
                  </button>
                )}
                {(requestObj.status === 'packaged' || requestObj.status === 'validated') && (
                  <button onClick={() => navigate('/packages')} className="bg-primary-orange hover:bg-hover-orange text-white px-6 py-2 rounded font-bold shadow-sm transition-colors">
                    View Generated Package
                  </button>
                )}
                {requestObj.status === 'in_progress' && (
                  <button onClick={() => navigate(`/requests/${id}/generation`)} className="bg-primary-orange hover:bg-hover-orange text-white px-6 py-2 rounded font-bold shadow-sm transition-colors">
                    View Generation Progress
                  </button>
                )}
                {['draft', 'rework', 'pending review'].includes(requestObj.status?.toLowerCase()) && (
                  <button disabled className="bg-gray-200 text-gray-500 cursor-not-allowed px-6 py-2 rounded font-medium transition-colors">
                    Waiting for Architect Approval
                  </button>
                )}
              </>
            ) : null}

            {blueprint && isArchitect && requestObj ? (
              (blueprint.status === 'approved' || ['in_progress', 'approved', 'packaged', 'validated'].includes(requestObj.status?.toLowerCase())) ? (
                <>
                  <span className="bg-green-100 text-green-800 px-4 py-2 rounded-lg font-bold text-sm flex items-center border border-green-200">
                    Approved by Architect
                  </span>
                  <button onClick={() => navigate('/review/blueprint')} className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-6 py-2 rounded font-medium shadow-sm transition-colors">
                    Back to Blueprint Reviews
                  </button>
                </>
              ) : (
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
              )
            ) : null}
          </div>
        </div>

        {blueprint && blueprint.status !== 'rework' ? (
          <div className="grid gap-6">

            {/* AI Project Overview Container */}
            <div className="bg-gradient-to-br from-white via-slate-50/80 to-orange-50/40 rounded-2xl p-6 border border-border-orange/40 shadow-sm relative overflow-hidden space-y-5">
              
              {/* Container Top Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border-light/60 pb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-orange to-button-orange text-white flex items-center justify-center font-bold text-lg shadow-md shadow-orange-500/20">
                    ✨
                  </div>
                  <div>
                    <h3 className="font-extrabold text-sidebar text-base tracking-tight">AI Project & Architectural Overview</h3>
                    <p className="text-xs text-text-secondary">Synthesized specifications and design rationale from intake chat</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {requestObj?.track_name && (
                    <span className="px-3 py-1 bg-amber-50 text-amber-700 border border-amber-200 rounded-full text-xs font-bold">
                      {requestObj.track_name}
                    </span>
                  )}
                  <span className="px-3 py-1 bg-orange-100 text-primary-orange border border-orange-200 rounded-full text-xs font-extrabold uppercase">
                    Intake Completed
                  </span>
                </div>
              </div>

              {/* Section 1: Project / System Summary */}
              <div className="bg-white p-5 rounded-xl border border-orange-100/80 shadow-2xs space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-extrabold text-sidebar uppercase tracking-wider flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-primary-orange"></span>
                    1. Project / System Summary (What is Being Built)
                  </h4>
                  <span className="text-[10px] font-bold text-primary-orange bg-orange-50 px-2.5 py-0.5 rounded-full border border-orange-200">
                    System Scope
                  </span>
                </div>
                <p className="text-xs text-text-primary leading-relaxed font-normal">
                  {getCleanSystemSummary()}
                </p>
              </div>

              {/* Section 2: Architecture Design Rationale / Justification */}
              <div className="bg-white p-5 rounded-xl border border-orange-100/80 shadow-2xs space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-extrabold text-sidebar uppercase tracking-wider flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-primary-orange"></span>
                    2. Architecture Design Rationale / Justification (Why This Stack Was Chosen)
                  </h4>
                  <span className="text-[10px] font-bold text-primary-orange bg-orange-50 px-2.5 py-0.5 rounded-full border border-orange-200">
                    Design Justification
                  </span>
                </div>
                <p className="text-xs text-text-primary leading-relaxed font-normal">
                  {blueprint?.generated_rationale || 
                   "This architecture was chosen because it follows a modular and event-driven approach, where each service and AI agent has a specific responsibility. This makes the system easier to maintain, scale, and extend. Apache Kafka enables real-time event processing and seamless communication between microservices and AI agents, while Kafka Streams supports continuous monitoring of KT activities, progress, risks, and knowledge gaps. This enables the system to provide timely recommendations, automated notifications, and real-time dashboards."}
                </p>
              </div>

              {/* Key Specifications Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1">
                <div className="bg-white p-3.5 rounded-xl border border-border-light/70 shadow-2xs">
                  <span className="text-[10px] font-bold text-text-secondary uppercase tracking-wider block">Source Topics (Inputs)</span>
                  <p className="text-xs font-mono font-bold text-sidebar mt-1 truncate">{specObj?.source_topics || 'kt-events-intake, user-activity-stream'}</p>
                </div>
                <div className="bg-white p-3.5 rounded-xl border border-border-light/70 shadow-2xs">
                  <span className="text-[10px] font-bold text-text-secondary uppercase tracking-wider block">Target Topics (Outputs)</span>
                  <p className="text-xs font-mono font-bold text-sidebar mt-1 truncate">{specObj?.target_topics || 'kt-processed-out, kt-notifications'}</p>
                </div>
                <div className="bg-white p-3.5 rounded-xl border border-border-light/70 shadow-2xs">
                  <span className="text-[10px] font-bold text-text-secondary uppercase tracking-wider block">Consumer Group & DLQ Policy</span>
                  <p className="text-xs font-mono font-bold text-sidebar mt-1 truncate">{specObj?.consumer_group || 'cg-kafka-processor'} ({specObj?.error_topic_policy || 'DLQ_RETRY'})</p>
                </div>
              </div>

            </div>

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

            <div className="bg-orange-50/20 border border-border-orange/30 p-6 rounded-lg shadow-sm">
              <h3 className="font-bold text-slate-800 flex items-center gap-2 mb-4">
                <span className="text-xl">🛡️</span> Architecture Standards Checklist
              </h3>
              <div className="space-y-3">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input type="checkbox" checked readOnly className="w-4 h-4 text-primary-orange accent-[#FF5A14] rounded focus:ring-primary-orange" />
                  <span className="text-sm font-medium text-slate-700">Processor-Handler-Supplier Separation</span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input type="checkbox" checked readOnly className="w-4 h-4 text-primary-orange accent-[#FF5A14] rounded focus:ring-primary-orange" />
                  <span className="text-sm font-medium text-slate-700">State Store & Ordering Logic</span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input type="checkbox" checked readOnly className="w-4 h-4 text-primary-orange accent-[#FF5A14] rounded focus:ring-primary-orange" />
                  <span className="text-sm font-medium text-slate-700">DLQ Error Topic Configuration</span>
                </label>
              </div>
            </div>

            <div className="bg-white p-6 rounded shadow border border-border-light">
              <h3 className="font-bold text-gray-700 mb-4">File Manifest</h3>
              <FileTree manifest={typeof blueprint.file_manifest === 'string' ? JSON.parse(blueprint.file_manifest) : blueprint.file_manifest} />
            </div>

            <div className="bg-white p-6 rounded shadow border border-border-light">
              <h3 className="font-bold text-gray-700 mb-4">Class Design & AI Rationale</h3>
              <div className="prose prose-sm max-w-none text-gray-600 mb-6">
                <p><strong>Design:</strong><br/>
                  {blueprint.class_design?.split(/(\*\*.*?\*\*)/g).map((part, idx) => 
                    part.startsWith('**') && part.endsWith('**') ? 
                    <strong key={idx} className="text-gray-800">{part.slice(2, -2)}</strong> : 
                    <span key={idx}>{part}</span>
                  )}
                </p>
                <div className="mt-4">
                  <strong>Rationale:</strong><br/>
                  {blueprint.generated_rationale?.split(/(\*\*.*?\*\*)/g).map((part, idx) => 
                    part.startsWith('**') && part.endsWith('**') ? 
                    <strong key={idx} className="text-gray-800">{part.slice(2, -2)}</strong> : 
                    <span key={idx}>{part}</span>
                  )}
                </div>
              </div>

              {blueprint.mermaid_diagram && (
                <div className="mb-6">
                  <h4 className="font-bold text-gray-700 mb-3 text-sm uppercase tracking-wider">Architecture Diagram</h4>
                  <MermaidDiagram chart={blueprint.mermaid_diagram} />
                </div>
              )}

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
        ) : jobObj && jobObj.job_status === 'running' ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-12 h-12 border-2 border-transparent border-b-primary-orange rounded-full animate-spin mb-4"></div>
            <h3 className="text-xl font-bold text-gray-700">
              {blueprint?.status === 'rework' ? 'AI is re-drafting your blueprint based on Architect feedback...' : 'AI is drafting your blueprint...'}
            </h3>
            <p className="text-gray-500 mt-2 text-center max-w-md">
              Please wait while the AI Architect designs your Kafka Streams topology, classes, and file manifest. This involves deep reasoning and may take a few minutes.
            </p>
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center p-12 bg-white rounded shadow border border-border-light">
            <div className="w-12 h-12 border-2 border-transparent border-b-primary-orange rounded-full animate-spin mb-4"></div>
            <h2 className="text-xl font-bold text-gray-800">Generating Blueprint...</h2>
            <p className="text-gray-500 mt-2">AI is analyzing requirements and building the class manifest.</p>
          </div>
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
                disabled={approving}
                className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-bold text-gray-600 hover:bg-gray-100 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleApproveConfirm}
                disabled={approving}
                className={`px-4 py-2 rounded-lg text-sm font-bold transition-colors flex items-center gap-2 ${approving ? 'bg-green-500 cursor-wait' : 'bg-green-600 hover:bg-green-700'} text-white`}
              >
                {approving && (
                  <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
                  </svg>
                )}
                {approving ? 'Approving...' : 'Confirm Approval'}
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
