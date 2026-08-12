import { useEffect, useState } from 'react';
import ProgressStepper from '../components/ProgressStepper';
import { getPackages, getEnvironments, generateDevopsScripts, triggerPipeline, getRequests } from '../api/api';
import Loader from '../components/Loader';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import StepRequestTable from '../components/StepRequestTable';

export default function PackagesPage() {
  const { id: pathId } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const queryId = searchParams.get('id');
  const navigate = useNavigate();
  const { user } = useAuth();
  const isDevOps = user?.role === 'devops';
  const id = pathId || queryId;

  const [packages, setPackages] = useState([]);
  const [environments, setEnvironments] = useState([]);
  const [selectedEnv, setSelectedEnv] = useState('dev');
  const [loading, setLoading] = useState(true);
  
  const [generating, setGenerating] = useState(false);
  const [generatedScripts, setGeneratedScripts] = useState(null);
  const [deploying, setDeploying] = useState(false);
  const [deploymentLog, setDeploymentLog] = useState('');



  useEffect(() => {
    if (!id || id === 'undefined') {
      setLoading(false);
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
    }).catch(err => {
      console.error(err);
    }).finally(() => {
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
      <div className="flex flex-col h-full bg-gray-50 p-8">
        <StepRequestTable activeStage="packages" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-gray-50">
      <ProgressStepper />
      <div className="p-8 flex-1 overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-extrabold text-sidebar">
            {isDevOps ? 'DevOps Packaging & Deployment' : 'Code Package Delivery'}
          </h2>
          <button onClick={() => navigate(isDevOps ? '/devops/dashboard' : '/requests')} className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-6 py-2 rounded font-medium transition-colors">
            {isDevOps ? 'Back to Dashboard' : 'Back to My Requests'}
          </button>
        </div>
        
        {isDevOps ? (
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
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-6">
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <span className="text-xl">📦</span> Download Skeleton
                </h3>
                <p className="text-sm text-gray-600 mb-4">
                  Your microservice skeleton is generated and validated. Download the ZIP file to extract the codebase, or trigger a direct commit to the configured Git repository.
                </p>
                {packages.map((pkg) => (
                  <div key={pkg.id} className="p-4 bg-gray-50 rounded-lg border border-gray-200 mb-3">
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-bold text-gray-800">{pkg.request_name || `Package #${pkg.id}`}</span>
                      <span className="text-xs font-mono text-gray-500 truncate max-w-[200px]" title={pkg.zip_path}>{pkg.zip_path}</span>
                    </div>
                    <a 
                      href={`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api'}/packages/download/${pkg.id}`}
                      className="w-full inline-block text-center bg-button-orange hover:bg-hover-orange text-white py-2 rounded-lg font-medium shadow-sm transition-all hover:-translate-y-0.5"
                      download
                    >
                      ⬇️ Download ZIP
                    </a>
                  </div>
                ))}
                {packages.length === 0 && (
                  <p className="text-gray-500 text-sm italic mb-4">No packages available yet.</p>
                )}
                <button className="w-full bg-gray-900 hover:bg-black text-white py-2 rounded-lg font-medium shadow-sm transition-all flex items-center justify-center gap-2">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>
                  Request Git Commit
                </button>
              </div>
            </div>
            
            <div className="space-y-6">
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                <h3 className="font-bold text-gray-800 mb-4 border-b border-gray-100 pb-2">File Manifest Checklist</h3>
                <div className="space-y-3">
                  {['PaymentProcessor.java', 'application.yml', 'PaymentHandlerTest.java', 'Dockerfile & pom.xml'].map((file, idx) => (
                    <div key={idx} className="flex items-center gap-3">
                      <div className="text-green-500"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg></div>
                      <span className="text-sm font-medium text-gray-700">{file}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-emerald-50 p-6 rounded-xl shadow-sm border border-emerald-100">
                <h3 className="font-bold text-emerald-800 mb-2">Validation Summary</h3>
                <p className="text-sm text-emerald-700 mb-3">All pattern checks and logic validations passed successfully.</p>
                <button onClick={() => navigate(`/progress?id=${id}`)} className="text-sm font-bold text-emerald-700 hover:text-emerald-800 hover:underline">
                  View Validation Details &rarr;
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
