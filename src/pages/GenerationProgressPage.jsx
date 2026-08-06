import { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import ProgressStepper from '../components/ProgressStepper';
import { getWorkflowStatus, getGeneratedFiles } from '../api/api';
import { useParams, useNavigate } from 'react-router-dom';

export default function GenerationProgressPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [job, setJob] = useState(null);
  const [files, setFiles] = useState([]);

  useEffect(() => {
    // Find job id by polling logic usually, but here we'll just fetch latest job for request
    // Alternatively, we can just fetch generated files
    const fetchStatus = () => {
      if (!id || id === 'undefined') return;
      getGeneratedFiles(id).then(data => setFiles(data.data || [])).catch(console.error);
    };
    
    fetchStatus();
    const interval = setInterval(fetchStatus, 3000);
    return () => clearInterval(interval);
  }, [id]);

  return (
    <div className="flex flex-col h-full">
      <Navbar title={`Request #${id} - Generation Progress`} />
      <ProgressStepper />
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
            <div>[Orchestrator] Starting pipeline...</div>
            <div>[Requirements Interpreter] Normalizing inputs...</div>
            <div>[Pattern Retrieval] Found matched templates...</div>
            <div>[Blueprint Agent] Generated class definitions...</div>
            <div>[Generation Agent] Rendering Jinja2 templates...</div>
            {files.length > 0 && <div className="text-blue-400">Successfully generated {files.length} files.</div>}
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
            {files.length === 0 && <div className="text-gray-500 italic text-sm">Waiting for Generation Agent...</div>}
          </div>
        </div>
      </div>
    </div>
  );
}
