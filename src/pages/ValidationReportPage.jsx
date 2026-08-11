import { useEffect, useState } from 'react';
import ProgressStepper from '../components/ProgressStepper';
import { getValidationResults } from '../api/api';
import Loader from '../components/Loader';
import StatusBadge from '../components/StatusBadge';
import { useParams, useNavigate } from 'react-router-dom';

export default function ValidationReportPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [results, setResults] = useState([]);
  const [summary, setSummary] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getValidationResults(id).then(data => {
      setResults(data.data?.results || data.data || []);
      setSummary(data.data?.summary || '');
      setLoading(false);
    }).catch(err => {
      console.error(err);
      setLoading(false);
    });
  }, [id]);

  if (loading) return <Loader />;

  const hasErrors = results.some(r => r.severity === 'error' && !r.passed);

  return (
    <div className="flex flex-col h-full">
      <ProgressStepper />
      <div className="p-8 flex-1 overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-gray-800">Validation Checks</h2>
          <button 
            onClick={() => navigate(`/requests/${id}/review`)}
            disabled={hasErrors}
            className={`px-6 py-2 rounded font-medium transition-colors ${hasErrors ? 'bg-gray-300 text-gray-500 cursor-not-allowed' : 'bg-button-orange hover:bg-hover-orange text-white'}`}
          >
            {hasErrors ? 'Fix Errors to Continue' : 'Next: Review'}
          </button>
        </div>
        
        <div className="grid gap-6">
          {summary && (
            <div className="bg-blue-50 border border-blue-200 text-blue-800 p-4 rounded text-sm shadow-sm">
              <strong className="block mb-2">AI Summary:</strong>
              {summary}
            </div>
          )}
          
          <div className="bg-white rounded shadow border border-border-light overflow-hidden">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider border-b border-border-light">
                  <th className="p-4 font-medium">Rule</th>
                  <th className="p-4 font-medium">Status</th>
                  <th className="p-4 font-medium">Severity</th>
                  <th className="p-4 font-medium">Message</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-light">
                {results.map((r, idx) => (
                  <tr key={idx} className="hover:bg-gray-50">
                    <td className="p-4 text-sm font-medium text-gray-900">{r.rule_name}</td>
                    <td className="p-4">
                      <span className={`text-xs font-bold ${r.passed ? 'text-green-600' : 'text-red-600'}`}>
                        {r.passed ? 'PASS' : 'FAIL'}
                      </span>
                    </td>
                    <td className="p-4"><StatusBadge status={r.severity} /></td>
                    <td className="p-4 text-sm text-gray-600">{r.message}</td>
                  </tr>
                ))}
                {results.length === 0 && (
                  <tr>
                    <td colSpan="4" className="p-8 text-center text-gray-500">No validation results available.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
