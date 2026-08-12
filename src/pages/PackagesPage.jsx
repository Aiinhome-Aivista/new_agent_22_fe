import { useEffect, useState } from 'react';
import ProgressStepper from '../components/ProgressStepper';
import { getPackages, getEnvironments, generateDevopsScripts, triggerPipeline, getRequests } from '../api/api';
import Loader from '../components/Loader';
import { useParams, useNavigate } from 'react-router-dom';
import RequestTable from '../components/RequestTable';

export default function PackagesPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [packages, setPackages] = useState([]);
  const [environments, setEnvironments] = useState([]);
  const [selectedEnv, setSelectedEnv] = useState('dev');
  const [loading, setLoading] = useState(true);
  const [requests, setRequests] = useState([]);
  
  const [generating, setGenerating] = useState(false);
  const [generatedScripts, setGeneratedScripts] = useState(null);
  const [deploying, setDeploying] = useState(false);
  const [deploymentLog, setDeploymentLog] = useState('');

  useEffect(() => {
    if (!id || id === 'undefined') {
      getRequests().then(data => {
        setRequests(data.data || []);
        setLoading(false);
      }).catch(err => {
        console.error(err);
        setLoading(false);
      });
      return;
    }

    Promise.all([
      getPackages(),
      getEnvironments()
    ]).then(([pkgData, envData]) => {
      const reqPkgs = (pkgData.data || []).filter(p => p.request_id === parseInt(id));
      setPackages(reqPkgs);
      if (envData.success) {
        setEnvironments(envData.data);
      }
      setLoading(false);
    }).catch(err => {
      console.error(err);
      setLoading(false);
    });
  }, [id]);

  const handleGenerate = async () => {
    setGenerating(true);
    setDeploymentLog('');
    try {
      const res = await generateDevopsScripts(id, selectedEnv);
      if (res.success) {
        setGeneratedScripts(res.data);
      }
    } catch (err) {
      console.error(err);
      alert('Failed to generate scripts');
    }
    setGenerating(false);
  };

  const handleDeploy = async () => {
    if (!confirm(`Are you sure you want to trigger the pipeline for ${selectedEnv.toUpperCase()}?`)) return;
    
    setDeploying(true);
    try {
      const res = await triggerPipeline(id, selectedEnv);
      if (res.success) {
        setDeploymentLog(res.log);
      }
    } catch (err) {
      console.error(err);
      alert('Deployment failed');
    }
    setDeploying(false);
  };

  if (loading) return <Loader />;

  if (!id || id === 'undefined') {
    return (
      <div className="flex flex-col h-full bg-gray-50">
        <div className="p-8">
          <div className="mb-8">
            <h1 className="text-2xl font-extrabold text-sidebar tracking-tight">Packages Requiring DevOps Inspection</h1>
            <p className="text-text-secondary mt-1">Review configurations before automated deployment triggers.</p>
          </div>
          <div className="bg-white rounded-2xl shadow-sm border border-border-light/60 overflow-hidden">
            <div className="p-6 md:p-8 border-b border-border-light/60 bg-white relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-purple-50 rounded-full mix-blend-multiply filter blur-3xl opacity-70 -translate-y-1/2 translate-x-1/4"></div>
              <div className="relative z-10">
                <h2 className="font-extrabold text-sidebar text-2xl">Deployable Packages</h2>
                <p className="text-sm text-text-secondary mt-1">Select a request below to view its packages and trigger CI/CD pipelines.</p>
              </div>
            </div>
            <RequestTable requests={requests} role="devops" navigate={navigate} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-gray-50">
      <ProgressStepper />
      <div className="p-8 flex-1 overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-extrabold text-sidebar">DevOps Packaging & Deployment</h2>
          <button onClick={() => navigate('/devops/dashboard')} className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-6 py-2 rounded font-medium transition-colors">
            Back to Dashboard
          </button>
        </div>
        
        <div className="grid grid-cols-3 gap-6">
          {/* Left Column: Config & Zips */}
          <div className="col-span-1 space-y-6">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
              <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                <span className="text-xl">⚙️</span> Deployment Target
              </h3>
              <label className="block text-sm text-gray-600 mb-2">Select Environment</label>
              <select 
                value={selectedEnv} 
                onChange={(e) => setSelectedEnv(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 rounded p-2 focus:border-primary-orange outline-none mb-4"
              >
                {environments.map(env => (
                  <option key={env.id} value={env.env_name}>{env.env_name.toUpperCase()}</option>
                ))}
                {environments.length === 0 && <option value="dev">DEV</option>}
              </select>
              
              <button 
                onClick={handleGenerate}
                disabled={generating}
                className="w-full bg-button-orange hover:bg-hover-orange text-white py-2 rounded font-medium transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {generating ? 'Generating...' : '🤖 Generate DevOps Scripts'}
              </button>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
              <h3 className="font-bold text-gray-800 mb-4">Code Packages</h3>
              {packages.map((pkg) => (
                <div key={pkg.id} className="p-3 bg-gray-50 rounded border border-gray-200 mb-3 text-sm">
                  <p className="font-bold text-gray-700">{pkg.request_name || `Package #${pkg.id}`}</p>
                  <p className="text-xs text-gray-500 mb-2 truncate" title={pkg.zip_path}>{pkg.zip_path}</p>
                  <a 
                    href={`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api'}/packages/download/${pkg.id}`}
                    className="text-primary-orange font-bold hover:underline flex items-center gap-1"
                    download
                  >
                    ⬇️ Download ZIP
                  </a>
                </div>
              ))}
              {packages.length === 0 && (
                <p className="text-gray-500 text-sm italic">No .zip packages found.</p>
              )}
            </div>
          </div>

          {/* Right Column: Scripts & Pipeline */}
          <div className="col-span-2 space-y-6">
            {generatedScripts ? (
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-bold text-gray-800">Generated Scripts Review</h3>
                  <button 
                    onClick={handleDeploy}
                    disabled={deploying}
                    className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded font-medium transition-colors shadow flex items-center gap-2 disabled:opacity-50"
                  >
                    {deploying ? 'Triggering...' : '🚀 Trigger CI/CD Pipeline'}
                  </button>
                </div>

                {deploymentLog && (
                  <div className="mb-6 p-4 bg-gray-900 text-green-400 font-mono text-sm rounded-lg whitespace-pre-wrap">
                    {deploymentLog}
                  </div>
                )}
                
                <div className="space-y-4">
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-1">Dockerfile</h4>
                    <pre className="bg-gray-50 p-3 rounded border border-gray-200 text-sm font-mono overflow-x-auto text-gray-700">
                      {generatedScripts.dockerfile}
                    </pre>
                  </div>
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-1">deployment.yaml</h4>
                    <pre className="bg-gray-50 p-3 rounded border border-gray-200 text-sm font-mono overflow-x-auto text-gray-700">
                      {generatedScripts.deployment_yaml}
                    </pre>
                  </div>
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-1">pom.xml</h4>
                    <pre className="bg-gray-50 p-3 rounded border border-gray-200 text-sm font-mono overflow-x-auto text-gray-700 max-h-48">
                      {generatedScripts.pom_xml}
                    </pre>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white p-12 rounded-xl shadow-sm border border-gray-200 flex flex-col items-center justify-center text-gray-400 h-full">
                <span className="text-4xl mb-4">🤖</span>
                <p>Click "Generate DevOps Scripts" to create Dockerfile and Deployment configs via AI.</p>
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
