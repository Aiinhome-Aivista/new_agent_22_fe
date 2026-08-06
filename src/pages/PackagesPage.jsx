import { useEffect, useState } from 'react';
import ProgressStepper from '../components/ProgressStepper';
import { getPackages } from '../api/api';
import Loader from '../components/Loader';
import { useParams, useNavigate } from 'react-router-dom';

export default function PackagesPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getPackages().then(data => {
      // Filter for this request only
      const reqPkgs = (data.data || []).filter(p => p.request_id === parseInt(id));
      setPackages(reqPkgs);
      setLoading(false);
    }).catch(err => {
      console.error(err);
      setLoading(false);
    });
  }, [id]);

  if (loading) return <Loader />;

  return (
    <div className="flex flex-col h-full">
      <ProgressStepper />
      <div className="p-8 flex-1 overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-gray-800">Download Package</h2>
          <button onClick={() => navigate(`/requests/${id}/review`)} className="bg-button-orange hover:bg-hover-orange text-white px-6 py-2 rounded font-medium transition-colors">
            Next: Review & Approval
          </button>
        </div>
        
        <div className="grid gap-6">
          {packages.map((pkg) => (
            <div key={pkg.id} className="bg-white p-6 rounded shadow border border-border-light flex items-center justify-between">
              <div>
                <h3 className="font-bold text-gray-800 text-lg mb-1">{pkg.request_name || `Package #${pkg.id}`}</h3>
                <p className="text-sm text-gray-500 mb-2">Generated on: {new Date(pkg.generated_at).toLocaleString()}</p>
                <p className="text-xs text-gray-400 font-mono">{pkg.zip_path}</p>
              </div>
              <a 
                href={`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api'}/packages/download/${pkg.id}`}
                className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded font-medium transition-colors shadow flex items-center gap-2"
                download
              >
                <span>⬇️</span> Download ZIP
              </a>
            </div>
          ))}
          {packages.length === 0 && (
            <div className="text-gray-500 italic p-6 bg-gray-50 rounded border border-gray-200">
              No packages generated for this request. (Ensure validation passed and packaging completed).
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
