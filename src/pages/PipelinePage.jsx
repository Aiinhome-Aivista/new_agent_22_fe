import { useState, useEffect } from 'react';
import { getPackages } from '../api/api';
import Loader from '../components/Loader';
import { CheckCircleIcon, ArrowPathIcon } from '@heroicons/react/24/outline';

export default function PipelinePage() {
  const [runs, setRuns] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getPackages().then(res => {
      // Simulate pipeline runs based on packages
      if (res.data) {
        const simulatedRuns = res.data.map(pkg => ({
          id: `PL-${pkg.id}00${Math.floor(Math.random() * 10)}`,
          reqName: pkg.request_name || 'N/A',
          env: 'DEV', // Simulated target
          status: 'SUCCESS',
          duration: `${Math.floor(Math.random() * 120 + 30)}s`,
          date: pkg.generated_at
        }));
        setRuns(simulatedRuns);
      }
      setLoading(false);
    }).catch(err => {
      console.error(err);
      setLoading(false);
    });
  }, []);

  if (loading) return <Loader />;

  return (
    <div className="flex flex-col h-full bg-gray-50 p-8">
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-extrabold text-sidebar tracking-tight">CI/CD Pipeline History</h1>
          <p className="text-text-secondary mt-1">Audit log of all automated build and deployment pipelines.</p>
        </div>
        <button className="bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 shadow-sm">
          <ArrowPathIcon className="w-5 h-5" /> Refresh
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200 text-xs uppercase tracking-wider text-gray-500">
              <th className="p-4 font-bold">Run ID</th>
              <th className="p-4 font-bold">Microservice</th>
              <th className="p-4 font-bold">Target Env</th>
              <th className="p-4 font-bold">Status</th>
              <th className="p-4 font-bold">Duration</th>
              <th className="p-4 font-bold">Executed At</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {runs.map(run => (
              <tr key={run.id} className="hover:bg-gray-50">
                <td className="p-4 text-sm font-mono font-bold text-gray-600">{run.id}</td>
                <td className="p-4 text-sm font-medium text-gray-800">{run.reqName}</td>
                <td className="p-4 text-xs font-bold text-sidebar uppercase bg-gray-100 rounded text-center max-w-[60px] inline-block mt-3">{run.env}</td>
                <td className="p-4">
                  <div className="inline-flex items-center gap-1 bg-green-50 text-green-700 px-2 py-1 rounded text-xs font-bold border border-green-200">
                    <CheckCircleIcon className="w-4 h-4" /> {run.status}
                  </div>
                </td>
                <td className="p-4 text-sm text-gray-500">{run.duration}</td>
                <td className="p-4 text-sm text-gray-500">{new Date(run.date).toLocaleString()}</td>
              </tr>
            ))}
            {runs.length === 0 && (
              <tr>
                <td colSpan="6" className="p-8 text-center text-gray-500 italic">No pipeline runs recorded.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
