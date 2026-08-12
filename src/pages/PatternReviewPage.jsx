import { useEffect, useState } from 'react';
import ProgressStepper from '../components/ProgressStepper';
import { getPatterns, getRequests } from '../api/api';
import Loader from '../components/Loader';
import { useParams, useNavigate } from 'react-router-dom';
import RequestTable from '../components/RequestTable';

export default function PatternReviewPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [patterns, setPatterns] = useState([]);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) {
      getRequests().then(data => {
        setRequests(data.data || []);
        setLoading(false);
      }).catch(err => {
        console.error(err);
        setLoading(false);
      });
      return;
    }
    getPatterns(id).then(data => {
      setPatterns(data.data || []);
      setLoading(false);
    }).catch(err => {
      console.error(err);
      setLoading(false);
    });
  }, [id]);

  if (loading) return <Loader />;

  if (!id) {
    return (
      <div className="animate-fade-in-up p-4">
        <div className="mb-4">
          <h1 className="text-2xl font-extrabold text-sidebar tracking-tight">Pattern Review</h1>
          <p className="text-text-secondary mt-1">Review the architectural patterns retrieved for active requests.</p>
        </div>
        <div className="bg-white rounded-2xl shadow-sm border border-border-light/60 overflow-hidden">
          <div className="p-6 md:p-8 border-b border-border-light/60 bg-white relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-amber-50 rounded-full mix-blend-multiply filter blur-3xl opacity-70 -translate-y-1/2 translate-x-1/4"></div>
            <div className="relative z-10">
              <h2 className="font-extrabold text-sidebar text-2xl">Architecture Requests</h2>
              <p className="text-sm text-text-secondary mt-1">Select a request below to review its applied messaging patterns.</p>
            </div>
          </div>
          <RequestTable 
            requests={requests} 
            role="architect" 
            navigate={navigate} 
            actionOverride={{ label: "Review Patterns", pathPrefix: "/requests/", pathSuffix: "/patterns" }} 
          />
        </div>
      </div>
    );
  }

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
