import { useState } from 'react';
import { getAuditLogs } from '../api/api';
import Loader from '../components/Loader';

export default function AuditTrailPage() {
  const [reqId, setReqId] = useState('');
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!reqId) return;
    setLoading(true);
    try {
      const res = await getAuditLogs(reqId);
      setLogs(res.data || []);
    } catch (err) {
      console.error(err);
      setLogs([]);
    }
    setLoading(false);
  };

  return (
    <div className="flex flex-col h-full">
      <div className="p-8 flex-1 flex flex-col h-full">
        <form onSubmit={handleSearch} className="mb-6 flex gap-4">
          <input 
            type="number" 
            placeholder="Enter Request ID" 
            value={reqId} 
            onChange={(e) => setReqId(e.target.value)} 
            className="bg-white border border-border-light rounded p-2 px-4 focus:border-border-orange outline-none w-64 shadow-sm" 
            required 
          />
          <button type="submit" className="bg-sidebar hover:bg-gray-700 text-white px-6 py-2 rounded transition-colors shadow-sm font-medium">
            Search Traceability
          </button>
        </form>
        
        {loading ? <Loader /> : (
          <div className="bg-white rounded shadow border border-border-light overflow-hidden flex-1">
            <table className="w-full text-left table-fixed">
              <thead>
                <tr className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider border-b border-border-light">
                  <th className="p-3 font-medium w-32">Timestamp</th>
                  <th className="p-3 font-medium w-48">Agent</th>
                  <th className="p-3 font-medium w-24">Action</th>
                  <th className="p-3 font-medium w-64">Input Summary</th>
                  <th className="p-3 font-medium">Output Summary</th>
                  <th className="p-3 font-medium w-32">Error</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-light">
                {logs.map((log) => (
                  <tr key={log.id} className="hover:bg-gray-50">
                    <td className="p-3 text-xs text-gray-500">{new Date(log.created_at).toLocaleString()}</td>
                    <td className="p-3 text-sm font-medium text-gray-900">{log.agent_name}</td>
                    <td className="p-3 text-sm text-gray-600"><span className="bg-gray-100 px-2 py-0.5 rounded border border-gray-200">{log.action}</span></td>
                    <td className="p-3 text-xs text-gray-500 truncate" title={log.input_summary}>{log.input_summary}</td>
                    <td className="p-3 text-xs text-gray-500 truncate" title={log.output_summary}>{log.output_summary}</td>
                    <td className="p-3 text-xs text-red-500 truncate" title={log.error_message}>{log.error_message || '-'}</td>
                  </tr>
                ))}
                {logs.length === 0 && (
                  <tr>
                    <td colSpan="6" className="p-8 text-center text-gray-500">Enter a Request ID to view its audit trail.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
