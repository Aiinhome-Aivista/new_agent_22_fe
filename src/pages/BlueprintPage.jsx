import { useEffect, useState } from 'react';
import ProgressStepper from '../components/ProgressStepper';
import FileTree from '../components/FileTree';
import { getBlueprint, approveBlueprint } from '../api/api';
import Loader from '../components/Loader';
import { useParams, useNavigate } from 'react-router-dom';

export default function BlueprintPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [blueprint, setBlueprint] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) {
      setLoading(false);
      return;
    }
    getBlueprint(id).then(data => {
      setBlueprint(data.data);
      setLoading(false);
    }).catch(err => {
      console.error(err);
      setLoading(false);
    });
  }, [id]);

  if (loading) return <Loader />;

  if (!id) {
    return (
      <div className="animate-fade-in-up">
        <div className="bg-white rounded-2xl shadow-sm border border-border-light/60 overflow-hidden flex flex-col items-center justify-center p-16 min-h-[400px]">
          <div className="w-24 h-24 bg-input-bg rounded-full flex items-center justify-center mb-6 border border-border-orange/20 shadow-sm">
            <span className="text-5xl">📄</span>
          </div>
          <h2 className="text-2xl font-extrabold text-sidebar mb-2">No Blueprint Selected</h2>
          <p className="text-text-secondary text-center max-w-md mb-8">
            Please select a specific request from your Architecture Dashboard to review its generated blueprint.
          </p>
          <button 
            onClick={() => navigate('/architect/dashboard')}
            className="bg-button-orange hover:bg-hover-orange text-white px-6 py-2.5 rounded-lg font-bold shadow-sm transition-colors"
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const handleApprove = async () => {
    if (!blueprint) return;
    await approveBlueprint(blueprint.id);
    navigate('/architect/dashboard');
  };

  return (
    <div className="flex flex-col h-full">
      <ProgressStepper />
      <div className="p-8 flex-1 overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-gray-800">Generated Blueprint</h2>
          <div className="flex gap-4">
            <button onClick={() => navigate(`/requests/${id}/generation`)} className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-6 py-2 rounded font-medium transition-colors">
              Skip to Generation
            </button>
            {blueprint && blueprint.status === 'draft' && (
              <button onClick={handleApprove} className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded font-medium transition-colors">
                Approve Blueprint
              </button>
            )}
          </div>
        </div>
        
        {blueprint ? (
          <div className="grid gap-6">
            <div className="bg-white p-6 rounded shadow border border-border-light">
              <h3 className="font-bold text-gray-700 mb-4">File Manifest</h3>
              <FileTree manifest={blueprint.file_manifest} />
            </div>
            <div className="bg-white p-6 rounded shadow border border-border-light">
              <h3 className="font-bold text-gray-700 mb-4">Class Design & AI Rationale</h3>
              <div className="prose prose-sm max-w-none text-gray-600">
                <p><strong>Design:</strong> {blueprint.class_design}</p>
                <p><strong>Rationale:</strong> {blueprint.generated_rationale}</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-gray-500 italic">Blueprint not found.</div>
        )}
      </div>
    </div>
  );
}
