import { useEffect, useState, useRef } from 'react';
import ProgressStepper from '../components/ProgressStepper';
import { getRequest, getGeneratedFiles, getRequests } from '../api/api';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import StepRequestTable from '../components/StepRequestTable';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';

const TRACE_MESSAGES = [
  { text: "[Orchestrator] Initializing multi-agent pipeline...", delay: 500 },
  { text: "[Requirements Interpreter] Validating topic names and schema configs...", delay: 1500 },
  { text: "[Pattern Retrieval Agent] Fetching Processor-Handler-Supplier templates...", delay: 2500 },
  { text: "[Code Blueprint Agent] Generating Java class diagrams and file manifest...", delay: 4000 },
  { text: "[Code Generation Agent] Rendering Jinja2 templates...", delay: 6000 },
  { text: "[Validation Agent] Running static checks and syntax validation...", delay: 8500 }
];

const syntaxHighlight = (code) => {
  if (!code) return '// No content available';
  
  let highlighted = code
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"(.*?)"/g, '<span style="color: #ce9178;">"$1"</span>')
    .replace(/\b(public|private|protected|static|final|class|interface|enum|implements|extends|return|if|else|for|while|try|catch|new|this|super|void|boolean|int|double|float|long|short|byte|char|import|package)\b/g, '<span style="color: #569cd6; font-weight: bold;">$1</span>')
    .replace(/\b([A-Z][a-zA-Z0-9_]*)\b/g, '<span style="color: #4ec9b0;">$1</span>')
    .replace(/@([a-zA-Z0-9_]+)/g, '<span style="color: #dcdcaa;">@$1</span>')
    .replace(/(\/\/.*)/g, '<span style="color: #6a9955; font-style: italic;">$1</span>');
    
  return highlighted;
};

export default function GenerationProgressPage() {
  const { id: pathId } = useParams();
  const [searchParams] = useSearchParams();
  const queryId = searchParams.get('id');
  const id = pathId || queryId;

  const navigate = useNavigate();
  const [reqData, setReqData] = useState(null);
  const [generatedFiles, setGeneratedFiles] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [simulatedLogs, setSimulatedLogs] = useState([]);
  const [activeTab, setActiveTab] = useState('manifest');
  const terminalEndRef = useRef(null);

  useEffect(() => {
    if (!id || id === 'undefined') return;

    let timeoutId;
    let isMounted = true;

    const fetchStatus = async () => {
      try {
        const res = await getRequest(id);
        if (res.success && isMounted) {
          setReqData(res.data);
          
          const data = res.data;
          const isComp = ['validated', 'packaged', 'approved'].includes(data?.request?.status) || 
                         (data?.blueprint?.status === 'approved' && ['Validation', 'Packaging', 'Finished'].includes(data?.job?.current_step));
          const isFail = data?.job?.job_status === 'failed';
          
          const filesData = await getGeneratedFiles(id);
          const fetchedFiles = filesData.data || [];
          if (isMounted) {
             setGeneratedFiles(fetchedFiles);
             setSelectedFile(prev => {
                if (!prev && fetchedFiles.length > 0) return fetchedFiles[0];
                if (prev && fetchedFiles.find(f => f.file_name === prev.file_name)) return prev;
                return fetchedFiles.length > 0 ? fetchedFiles[0] : null;
             });
          }

          if (!isComp && !isFail && isMounted) {
             timeoutId = setTimeout(fetchStatus, 3000);
          }
        }
      } catch (err) {
        console.error(err);
        if (isMounted) timeoutId = setTimeout(fetchStatus, 3000);
      }
    };

    fetchStatus();
    return () => {
      isMounted = false;
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [id]);

  useEffect(() => {
    if (reqData && (!reqData?.job?.step_log || reqData.job.step_log.trim() === '')) {
      let timeouts = [];
      setSimulatedLogs([]);
      TRACE_MESSAGES.forEach((msg) => {
        const timeout = setTimeout(() => {
          const timestamp = new Date().toISOString().substring(11, 19);
          setSimulatedLogs(prev => [...prev, `[${timestamp}] ${msg.text}`]);
        }, msg.delay);
        timeouts.push(timeout);
      });
      return () => timeouts.forEach(clearTimeout);
    }
  }, [reqData]);

  useEffect(() => {
    if (activeTab === 'audit') {
      terminalEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [simulatedLogs, reqData?.job?.step_log, activeTab]);

  if (!id || id === 'undefined') {
    return (
      <div className="flex flex-col h-full bg-gray-50 p-8">
        <StepRequestTable activeStage="generation" />
      </div>
    );
  }

  const rawLog = reqData?.job?.step_log || '';
  const logLines = rawLog.trim().length > 0 ? rawLog.split('\n').filter(line => line.trim().length > 0) : simulatedLogs;
  const jobStatus = reqData?.job?.job_status;
  const isFailed = jobStatus === 'failed';
  const isCompleted = ['validated', 'packaged', 'approved'].includes(reqData?.request?.status) || 
                      (reqData?.blueprint?.status === 'approved' && ['Validation', 'Packaging', 'Finished'].includes(reqData?.job?.current_step));

  // Determine expected files from blueprint manifest
  let expectedFiles = [];
  try {
    if (reqData?.blueprint?.file_manifest) {
      const manifestObj = JSON.parse(reqData.blueprint.file_manifest);
      expectedFiles = manifestObj.files || [];
    }
  } catch (e) {
    console.error("Failed to parse manifest", e);
  }

  // Combine expected and generated
  const displayList = (expectedFiles.length > 0 
    ? expectedFiles.map(ef => {
        const genFile = generatedFiles.find(gf => gf.file_name === ef.filename || gf.file_name === ef.name);
        return genFile ? { ...genFile, isGenerated: true } : { file_name: ef.filename || ef.name, isGenerated: false };
      })
    : generatedFiles.map(gf => ({ ...gf, isGenerated: true }))
  ).filter(f => f.isGenerated || (!isCompleted && !isFailed));

  const isAlreadyValidated = ['validated', 'packaged', 'approved'].includes(reqData?.request?.status);

  // Determine coverage percentage for UI badge
  const coverage = displayList.length > 0 && generatedFiles.length === displayList.length ? "100% GENERATED" : "IN PROGRESS";

  return (
    <div className="flex flex-col h-full bg-[#fcf9f8]">
      <ProgressStepper requestId={id} activeStep="generation" />
      
      <div className="p-6 flex-1 overflow-hidden flex flex-col">
        {/* Workspace Top Header Panel */}
        <div className="bg-[#fffbf6] border border-[#f0e6dc] rounded-xl p-4 mb-6 shrink-0 shadow-sm flex flex-col sm:flex-row justify-between items-center">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => navigate('/progress')} 
              className="p-2 -ml-2 text-gray-500 hover:text-gray-800 hover:bg-gray-100 rounded-full transition-colors"
              title="Go Back"
            >
              <ArrowLeftIcon className="w-5 h-5" />
            </button>
            <div className="bg-orange-100 p-2 rounded-lg text-primary-orange">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" /></svg>
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h2 className="text-lg font-extrabold text-gray-800">Generated Source Code Workspace</h2>
                <span className="bg-green-100 text-green-700 text-[10px] font-black px-2 py-0.5 rounded-full uppercase">{coverage}</span>
              </div>
              <div className="flex items-center gap-3 mt-1 text-xs font-bold text-gray-500">
                <span className="flex items-center gap-1"><span className="text-gray-400">⚙️</span> Language: Java</span>
                <span className="text-gray-300">|</span>
                <span className="flex items-center gap-1"><span className="text-gray-400">📦</span> Framework: Spring Boot / Kafka</span>
                <span className="text-gray-300">|</span>
                <span className="flex items-center gap-1"><span className="text-gray-400">🧩</span> Pattern: Streams Topology</span>
              </div>
            </div>
          </div>
          
          <div className="flex gap-3 mt-4 sm:mt-0">
            {isFailed && (
              <button className="bg-red-50 text-red-600 border border-red-200 hover:bg-red-100 px-4 py-2 rounded font-bold text-sm transition-colors shadow-sm">
                RETRY PIPELINE
              </button>
            )}
            <button 
              onClick={() => navigate(`/requests/${id}/validation`)}
              disabled={!isCompleted && !isFailed}
              className={`px-4 py-2 rounded text-sm font-bold shadow-sm transition-colors ${(!isCompleted && !isFailed) ? 'bg-gray-200 text-gray-400 cursor-not-allowed' : 'bg-primary-orange text-white hover:bg-hover-orange'}`}
            >
              {isAlreadyValidated ? 'VIEW VALIDATION RESULTS' : 'PROCEED TO VALIDATION'}
            </button>
          </div>
        </div>

        {/* Main Workspace Layout */}
        <div className="flex flex-1 gap-6 min-h-0 overflow-hidden">
          
          {/* Left Panel: Tabs & File List */}
          <div className="w-1/3 flex flex-col min-h-0 border-r border-[#f0e6dc] pr-6">
            
            {/* Tabs */}
            <div className="flex gap-6 border-b border-[#f0e6dc] mb-4 shrink-0">
              <button 
                onClick={() => setActiveTab('manifest')}
                className={`pb-2 text-sm font-extrabold transition-colors border-b-2 ${activeTab === 'manifest' ? 'text-primary-orange border-primary-orange' : 'text-gray-400 border-transparent hover:text-gray-600'}`}
              >
                Generated Manifest
              </button>
              <button 
                onClick={() => setActiveTab('audit')}
                className={`pb-2 text-sm font-extrabold transition-colors border-b-2 ${activeTab === 'audit' ? 'text-primary-orange border-primary-orange' : 'text-gray-400 border-transparent hover:text-gray-600'}`}
              >
                Review Agent Audit
              </button>
            </div>

            {/* Tab Content */}
            {activeTab === 'manifest' ? (
              <div className="flex-1 overflow-y-auto pr-2 pb-4">
                <h3 className="text-xs font-black text-gray-400 mb-3 tracking-widest uppercase">File Artifacts</h3>
                
                {!reqData ? (
                  <div className="flex flex-col items-center justify-center mt-10 p-6 bg-white border border-[#f0e6dc] rounded-lg">
                    <div className="w-8 h-8 border-4 border-gray-300 border-t-gray-500 rounded-full animate-spin mb-3"></div>
                    <span className="text-gray-500 font-bold text-sm">Loading workspace...</span>
                  </div>
                ) : displayList.length === 0 ? (
                  <div className="flex flex-col items-center justify-center mt-10 p-6 bg-white border border-[#f0e6dc] rounded-lg">
                    {reqData?.request?.status === 'blueprint_review' ? (
                      <span className="text-gray-400 italic text-sm">Pipeline paused for Blueprint Review. Waiting for approval.</span>
                    ) : (
                      <>
                        <div className="w-12 h-12 border-2 border-transparent border-b-primary-orange rounded-full animate-spin mb-3"></div>
                        <span className="text-gray-500 font-bold text-sm">Generation in progress...</span>
                        <span className="text-gray-400 text-xs mt-1 text-center">AI is analyzing requirements. Please wait.</span>
                      </>
                    )}
                  </div>
                ) : (
                  <div className="space-y-2">
                    {displayList.map((f, idx) => {
                      const isActive = selectedFile?.file_name === f.file_name;
                      const isGen = f.isGenerated;
                      return (
                        <button 
                          key={f.id || idx} 
                          onClick={() => {
                            if (isGen) setSelectedFile(f);
                          }}
                          disabled={!isGen}
                          className={`w-full text-left p-3 rounded-lg flex items-center justify-between transition-all border ${
                            isActive 
                              ? 'bg-orange-50 border-orange-200 shadow-sm' 
                              : isGen 
                                ? 'bg-white border-[#f0e6dc] hover:border-gray-300 cursor-pointer'
                                : 'bg-gray-50 border-dashed border-gray-200 cursor-not-allowed opacity-80'
                          }`}
                        >
                          <div className="flex items-center gap-3 overflow-hidden">
                            {!isGen ? (
                              isCompleted || isFailed ? (
                                <span className="text-red-400 shrink-0">⚠️</span>
                              ) : (
                                <div className="w-4 h-4 border-2 border-gray-300 border-t-gray-500 rounded-full animate-spin shrink-0"></div>
                              )
                            ) : (
                              <span className="text-gray-400 shrink-0">📄</span>
                            )}
                            <span className={`text-sm font-mono truncate ${isActive ? 'text-gray-900 font-bold' : isGen ? 'text-gray-600 font-medium' : 'text-gray-400 italic'}`}>
                              {f.file_name}
                            </span>
                          </div>
                          {isGen ? (
                            <span className="shrink-0 bg-green-50 text-green-700 text-[9px] font-black px-1.5 py-0.5 rounded border border-green-200 tracking-wider">
                              GENERATED
                            </span>
                          ) : isCompleted || isFailed ? (
                            <span className="shrink-0 bg-red-50 text-red-500 text-[9px] font-black px-1.5 py-0.5 rounded border border-red-200 tracking-wider">
                              SKIPPED
                            </span>
                          ) : (
                            <span className="shrink-0 bg-gray-100 text-gray-500 text-[9px] font-black px-1.5 py-0.5 rounded border border-gray-200 tracking-wider animate-pulse">
                              PENDING
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            ) : (
              <div className="flex-1 bg-[#1e1e1e] rounded-xl overflow-hidden flex flex-col shadow-inner">
                <div className="bg-[#2d2d2d] px-4 py-2 border-b border-gray-700 flex justify-between items-center shrink-0">
                  <span className="text-gray-400 text-xs font-mono">Terminal Output</span>
                  {(!isCompleted && !isFailed) && <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>}
                </div>
                <div className="flex-1 p-4 font-mono text-xs overflow-y-auto text-gray-300">
                  <div className="mb-3 text-green-400">{"$ tail -f agent-pipeline.log"}</div>
                  {logLines.map((line, idx) => (
                    <div key={idx} className={`mb-1 ${line.toLowerCase().includes('error') ? 'text-red-400' : 'text-gray-400'}`}>{line}</div>
                  ))}
                  {(!isCompleted && !isFailed) && <div className="mt-2 text-green-400 animate-pulse">_</div>}
                  <div ref={terminalEndRef} />
                </div>
              </div>
            )}
          </div>

          {/* Right Panel: MacOS Code Editor */}
          <div className="w-2/3 flex flex-col min-h-0 bg-[#1e1e1e] rounded-xl shadow-xl border border-gray-800 overflow-hidden">
            {/* MacOS Window Header */}
            <div className="bg-[#2d2d2d] h-10 px-4 flex items-center justify-between shrink-0 border-b border-black/40">
              <div className="flex space-x-2 w-20">
                <div className="w-3 h-3 rounded-full bg-[#ff5f56] border border-[#e0443e]"></div>
                <div className="w-3 h-3 rounded-full bg-[#ffbd2e] border border-[#dea123]"></div>
                <div className="w-3 h-3 rounded-full bg-[#27c93f] border border-[#1aab29]"></div>
              </div>
              <div className="text-gray-300 text-xs font-bold font-mono tracking-wide">
                {selectedFile?.file_name || 'No file selected'}
              </div>
              <div className="w-20"></div> {/* Spacer for centering */}
            </div>

            {/* Code Content */}
            <div className="flex-1 flex overflow-auto bg-[#1e1e1e]">
              {selectedFile && selectedFile.isGenerated !== false ? (
                <>
                  {/* Line Numbers */}
                  <div className="py-4 px-3 bg-[#1e1e1e] border-r border-gray-800 text-right shrink-0 select-none">
                    {(selectedFile.preview || '// Generating...').split('\n').map((_, i) => (
                      <div key={i} className="text-gray-600 text-xs font-mono leading-relaxed">{i + 1}</div>
                    ))}
                  </div>
                  {/* Actual Code */}
                  <div className="p-4 flex-1">
                    <pre 
                      className="text-xs font-mono text-gray-300 whitespace-pre leading-relaxed focus:outline-none"
                      dangerouslySetInnerHTML={{ __html: syntaxHighlight(selectedFile.preview || '// Generating...') }}
                    />
                  </div>
                </>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-gray-500 font-mono text-sm">
                  {displayList.length > 0 ? (
                    "Select a generated file from the manifest to view source code"
                  ) : (
                    <>
                      <div className="w-12 h-12 border-2 border-transparent border-b-gray-600 rounded-full animate-spin mb-4"></div>
                      <span>Waiting for code generation...</span>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
