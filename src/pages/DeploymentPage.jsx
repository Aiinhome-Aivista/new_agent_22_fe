import { useState, useEffect } from 'react';
import { getPackages } from '../api/api';
import Loader from '../components/Loader';
import { RocketLaunchIcon } from '@heroicons/react/24/outline';
import { useNavigate } from 'react-router-dom';

export default function DeploymentPage() {
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    getPackages().then(res => {
      if (res.data) setPackages(res.data);
      setLoading(false);
    }).catch(err => {
      console.error(err);
      setLoading(false);
    });
  }, []);

  if (loading) return <Loader />;

  return (
    <div className="flex flex-col h-full bg-gray-50 p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-extrabold text-sidebar tracking-tight">Active Deployments</h1>
        <p className="text-text-secondary mt-1">Manage and orchestrate generated microservice packages.</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200 text-xs uppercase tracking-wider text-gray-500">
              <th className="p-4 font-bold">Package ID</th>
              <th className="p-4 font-bold">Request Name</th>
              <th className="p-4 font-bold">Artifact PATH</th>
              <th className="p-4 font-bold">Generated At</th>
              <th className="p-4 font-bold text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {packages.map(pkg => (
              <tr key={pkg.id} className="hover:bg-gray-50">
                <td className="p-4 text-sm font-bold text-gray-800">#{pkg.id}</td>
                <td className="p-4 text-sm font-medium text-gray-700">{pkg.request_name || 'N/A'}</td>
                <td className="p-4 text-xs text-gray-500 font-mono truncate max-w-xs">{pkg.zip_path}</td>
                <td className="p-4 text-sm text-gray-500">{new Date(pkg.generated_at).toLocaleString()}</td>
                <td className="p-4 text-right">
                  <button 
                    onClick={() => navigate(`/requests/${pkg.request_id}/packaging`)}
                    className="inline-flex items-center gap-1 bg-green-50 text-green-700 hover:bg-green-100 px-3 py-1.5 rounded-lg text-sm font-medium border border-green-200 transition-colors"
                  >
                    <RocketLaunchIcon className="w-4 h-4" /> Go to Deploy
                  </button>
                </td>
              </tr>
            ))}
            {packages.length === 0 && (
              <tr>
                <td colSpan="5" className="p-8 text-center text-gray-500 italic">No packages ready for deployment yet.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
