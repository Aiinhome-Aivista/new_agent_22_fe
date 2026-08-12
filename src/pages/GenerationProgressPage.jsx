import { useEffect, useState, useRef } from 'react';
import ProgressStepper from '../components/ProgressStepper';
import { getRequest, getGeneratedFiles, getRequests } from '../api/api';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import StepRequestTable from '../components/StepRequestTable';

const TRACE_MESSAGES = [
  { text: "[Orchestrator] Initializing multi-agent pipeline...", delay: 500 },
  { text: "[Requirements Interpreter] Validating topic names and schema configs...", delay: 1500 },
  { text: "[Pattern Retrieval Agent] Fetching Processor-Handler-Supplier templates...", delay: 2500 },
  { text: "[Code Blueprint Agent] Generating Java class diagrams and file manifest...", delay: 4000 },
  { text: "[Code Generation Agent] Rendering Jinja2 templates (Processor, Handler, Supplier, application.yml)...", delay: 6000 },
  { text: "[Validation Agent] Running static checks, DLQ configs, and naming validation...", delay: 8500 }
];

export default function GenerationProgressPage() {
  const { id: pathId } = useParams();
  const [searchParams] = useSearchParams();
  const queryId = searchParams.get('id');
  const id = pathId || queryId;

  const navigate = useNavigate();
  const [reqData, setReqData] = useState(null);
  const [files, setFiles] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [simulatedLogs, setSimulatedLogs] = useState([]);
  const terminalEndRef = useRef(null);



  useEffect(() => {
    if (!id || id === 'undefined') return;

    const fetchStatus = () => {
      getRequest(id).then(res => {
        if (res.success) setReqData(res.data);
      }).catch(console.error);

      getGeneratedFiles(id).then(data => {
        const fetchedFiles = data.data || [];
        setFiles(fetchedFiles);
        setSelectedFile(prev => {
          if (!prev && fetchedFiles.length > 0) return fetchedFiles[0];
          // Keep current selection if it still exists
          if (prev && fetchedFiles.find(f => f.file_name === prev.file_name)) return prev;
          return fetchedFiles.length > 0 ? fetchedFiles[0] : null;
        });
      }).catch(console.error);
    };

    fetchStatus();
    const interval = setInterval(fetchStatus, 3000);
    return () => clearInterval(interval);
  }, [id]);

  // Simulate logs if empty
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
    terminalEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [simulatedLogs, reqData?.job?.step_log]);

  if (!id || id === 'undefined') {
    return (
      <div className="flex flex-col h-full bg-gray-50 p-8">
        <StepRequestTable activeStage="generation" />
      </div>
    );
  }

  // Parse step log lines
  const rawLog = reqData?.job?.step_log || '';
  const logLines = rawLog.trim().length > 0 ? rawLog.split('\n').filter(line => line.trim().length > 0) : simulatedLogs;

  const jobStatus = reqData?.job?.job_status;
  const isFailed = jobStatus === 'failed';
  const isCompleted = ['validated', 'packaged', 'approved'].includes(reqData?.request?.status) || 
                      (reqData?.blueprint?.status === 'approved' && ['Validation', 'Packaging', 'Finished'].includes(reqData?.job?.current_step));

  const handleNext = () => {
    navigate(`/requests/${id}/validation`);
  };

  const handleRetry = () => {
    alert('Retrying generation stage...');
  };

  return (
    <div className="flex flex-col h-full bg-gray-50">
      <ProgressStepper requestId={id} activeStep="generation" />
      <div className="p-8 flex-1 overflow-hidden flex flex-col">
        <div className="flex justify-between items-center mb-6 shrink-0">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Generation Progress</h2>
            <p className="text-sm text-gray-500 mt-1">Executing Kafka agent pipeline...</p>
          </div>
          <div className="flex space-x-4">
            {isFailed && (
              <button onClick={handleRetry} className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg font-medium transition-colors shadow-sm flex items-center">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                Retry Stage
              </button>
            )}
            <button 
              onClick={handleNext} 
              disabled={!isCompleted && !isFailed}
              className={`px-6 py-2 rounded-lg font-medium transition-colors shadow-sm ${(!isCompleted && !isFailed) ? 'bg-gray-300 text-gray-500 cursor-not-allowed' : 'bg-button-orange hover:bg-hover-orange text-white'}`}
            >
              Next: Validation
            </button>
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 flex-1 min-h-0">
          {/* Agent Execution Terminal */}
          <div className="flex flex-col bg-[#1e1e1e] rounded-xl shadow-lg border border-gray-800 overflow-hidden">
            <div className="bg-[#2d2d2d] px-4 py-3 border-b border-gray-700 flex items-center justify-between shrink-0">
              <div className="flex items-center space-x-2">
                <div className="flex space-x-1.5">
                  <div className="w-3 h-3 rounded-full bg-red-500"></div>
                  <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                  <div className="w-3 h-3 rounded-full bg-green-500"></div>
                </div>
                <span className="text-gray-400 text-xs font-mono ml-4">Agent Execution Terminal</span>
              </div>
              <div className="text-green-400 text-xs font-mono flex items-center space-x-2">
                 {!isCompleted && !isFailed && <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>}
                 <span>{isCompleted ? 'Completed' : isFailed ? 'Failed' : 'Live'}</span>
              </div>
            </div>
            <div className="flex-1 p-4 font-mono text-sm overflow-y-auto text-gray-300">
              <div className="mb-4 text-green-400">{"$ ./run-kafka-agents.sh"}</div>
              {logLines.map((line, idx) => {
                const isError = line.toLowerCase().includes('error') || line.toLowerCase().includes('failed');
                return (
                  <div key={idx} className={`mb-1 ${isError ? 'text-red-400 font-bold' : 'text-gray-300'}`}>
                    {line}
                  </div>
                );
              })}
              {files.length > 0 && <div className="text-blue-400 mt-4 font-bold">{"=> Successfully generated " + files.length + " artefacts."}</div>}
              {(!isCompleted && !isFailed) && <div className="mt-2 text-green-400 animate-pulse">_</div>}
              <div ref={terminalEndRef} />
            </div>
          </div>
          
          {/* Generated Files Workspace */}
          <div className="flex flex-col bg-white rounded-xl shadow-lg border border-border-light overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center shrink-0">
              <h3 className="font-bold text-gray-800">Generated Artefacts</h3>
              <span className="text-xs bg-gray-200 text-gray-600 px-2 py-1 rounded-full">{files.length} Files</span>
            </div>
            <div className="flex flex-1 min-h-0">
              {/* File Tree */}
              <div className="w-1/3 border-r border-gray-100 bg-gray-50 p-3 overflow-y-auto shrink-0">
                {files.length === 0 ? (
                  <div className="text-gray-400 italic text-sm text-center mt-10 px-2">
                    {reqData?.request?.status === 'blueprint_review' 
                      ? 'Pipeline paused for Blueprint Review. Waiting for Architect approval.'
                      : 'Waiting for files...'}
                  </div>
                ) : (
                  <div className="space-y-1">
                    {files.map(f => (
                      <button 
                        key={f.id || f.file_name} 
                        onClick={() => setSelectedFile(f)}
                        className={`w-full text-left px-3 py-2 rounded-lg text-sm flex items-center space-x-2 transition-colors ${selectedFile?.file_name === f.file_name ? 'bg-primary-orange/10 text-primary-orange font-medium' : 'text-gray-600 hover:bg-gray-200'}`}
                      >
                        <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                        </svg>
                        <span className="truncate">{f.file_name}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
              {/* File Preview */}
              <div className="flex-1 bg-gray-50/30 flex flex-col min-w-0">
                {selectedFile ? (
                  <>
                    <div className="px-4 py-2 border-b border-gray-100 bg-white text-xs text-gray-500 font-mono truncate shrink-0">
                      {selectedFile.file_path || `src/main/java/com/digiconfx/${selectedFile.file_name}`}
                    </div>
                    <div className="flex-1 overflow-auto p-4">
                      <pre className="text-xs font-mono text-gray-800 whitespace-pre-wrap break-all">
                        {selectedFile.preview || '// No content available'}
                      </pre>
                    </div>
                  </>
                ) : (
                  <div className="flex h-full items-center justify-center text-gray-400 text-sm p-4 text-center">
                    Select a file from the tree to preview its contents
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
