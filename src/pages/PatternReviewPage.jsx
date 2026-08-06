import { useEffect, useState } from 'react';
import ProgressStepper from '../components/ProgressStepper';
import { getPatterns } from '../api/api';
import Loader from '../components/Loader';
import { useParams, useNavigate } from 'react-router-dom';

export default function PatternReviewPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [patterns, setPatterns] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getPatterns(id).then(data => {
      setPatterns(data.data || []);
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
          <h2 className="text-xl font-bold text-gray-800">Retrieved Patterns (RAG)</h2>
          <button onClick={() => navigate(`/requests/${id}/blueprint`)} className="bg-button-orange hover:bg-hover-orange text-white px-6 py-2 rounded font-medium transition-colors">
            Next: Blueprint
          </button>
        </div>
        <div className="grid gap-6">
          {patterns.map((p) => (
            <div key={p.id} className="bg-white p-6 rounded shadow border border-border-light flex flex-col">
              <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-3">
                  <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded text-sm font-mono border border-gray-200">
                    {p.source_reference}
                  </span>
                  <span className="text-xs uppercase font-bold text-primary-orange tracking-wider">{p.pattern_type}</span>
                </div>
                <div className="text-sm font-medium text-green-600 bg-green-50 px-2 py-1 rounded">
                  Score: {(p.similarity_score * 100).toFixed(1)}%
                </div>
              </div>
              <div className="bg-gray-50 p-4 rounded border border-gray-100 text-sm font-mono text-gray-600 whitespace-pre-wrap overflow-x-auto">
                {p.cited_text}
              </div>
            </div>
          ))}
          {patterns.length === 0 && <div className="text-gray-500 italic">No patterns retrieved yet. Is the pipeline running?</div>}
        </div>
      </div>
    </div>
  );
}
