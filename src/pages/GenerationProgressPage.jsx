import { useEffect, useState } from 'react';
import ProgressStepper from '../components/ProgressStepper';
import { getRequest, getGeneratedFiles } from '../api/api';
import { useParams, useNavigate } from 'react-router-dom';

export default function GenerationProgressPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [reqData, setReqData] = useState(null);
  const [files, setFiles] = useState([]);

  useEffect(() => {
    if (!id || id === 'undefined') return;

    const fetchStatus = () => {
      getRequest(id).then(res => {
        if (res.success) setReqData(res.data);
      }).catch(console.error);

      getGeneratedFiles(id).then(data => setFiles(data.data || [])).catch(console.error);
    };

    fetchStatus();
    const interval = setInterval(fetchStatus, 3000);
    return () => clearInterval(interval);
  }, [id]);

  if (!id || id === 'undefined') {
    return (
      <div className="flex flex-col h-full items-center justify-center bg-gray-50 text-gray-500 p-8">
        <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-200 text-center max-w-md">
          <h2 className="text-xl font-bold text-gray-800 mb-2">No Request Selected</h2>
          <p className="text-sm mb-6">Please select a request from your dashboard to view its generation progress.</p>
          <button 
            onClick={() => navigate('/requests')}
            className="bg-primary-orange hover:bg-hover-orange text-white px-6 py-2 rounded-lg font-medium transition-colors"
          >
            Go to My Requests
          </button>
        </div>
      </div>
    );
  }

  // Parse step log lines
  const rawLog = reqData?.job?.step_log || '';
  const logLines = rawLog.split('\n').filter(line => line.trim().length > 0);

  return (
    <div className="flex flex-col h-full">
      <ProgressStepper requestId={id} />
      <div className="p-8 flex-1 overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-gray-800">Pipeline Status</h2>
          <button onClick={() => navigate(`/requests/${id}/validation`)} className="bg-button-orange hover:bg-hover-orange text-white px-6 py-2 rounded font-medium transition-colors">
            Next: Validation
          </button>
        </div>
        
        <div className="grid grid-cols-2 gap-6 h-full">
          <div className="bg-black text-green-400 font-mono text-sm p-4 rounded shadow overflow-y-auto" style={{maxHeight: '60vh'}}>
            <div className="mb-2 text-gray-500">{"// Agent Execution Log"}</div>
            {logLines.length > 0 ? (
              logLines.map((line, idx) => (
                <div key={idx} className={line.includes('Error') || line.includes('Failed') ? 'text-red-400 font-bold' : ''}>
                  {line}
                </div>
              ))
            ) : (
              <>
                <div>[Orchestrator] Starting pipeline...</div>
                <div>[Requirements Interpreter] Normalizing inputs...</div>
                <div>[Pattern Retrieval] Querying knowledge base...</div>
              </>
            )}
            {files.length > 0 && <div className="text-blue-400 mt-2">Successfully generated {files.length} files.</div>}
            <div className="mt-4 animate-pulse">_</div>
          </div>
          
          <div className="bg-white p-4 rounded shadow border border-border-light overflow-y-auto" style={{maxHeight: '60vh'}}>
            <h3 className="font-bold text-gray-700 mb-4 border-b pb-2">Generated Files Workspace</h3>
            {files.map(f => (
              <div key={f.id} className="mb-4">
                <div className="text-sm font-bold text-gray-800 mb-1">{f.file_name}</div>
                <div className="text-xs text-gray-500 mb-2 truncate">{f.file_path}</div>
                <pre className="bg-gray-50 p-2 rounded text-xs overflow-x-auto border border-gray-100 max-h-32">
                  {f.preview}
                </pre>
              </div>
            ))}
            {files.length === 0 && (
              <div className="text-gray-500 italic text-sm">
                {reqData?.request?.status === 'blueprint_review' 
                  ? 'Pipeline paused for Blueprint Review. Waiting for Architect approval.'
                  : 'Waiting for Generation Agent...'}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

