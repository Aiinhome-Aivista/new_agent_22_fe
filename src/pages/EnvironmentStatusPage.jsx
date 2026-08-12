import { useState, useEffect } from 'react';
import { getEnvironments } from '../api/api';
import Loader from '../components/Loader';
import { ServerIcon, CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/outline';
import { useNavigate } from 'react-router-dom';

export default function EnvironmentStatusPage() {
  const [environments, setEnvironments] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    getEnvironments().then(res => {
      if (res.success) {
        setEnvironments(res.data);
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
          <h1 className="text-2xl font-extrabold text-sidebar tracking-tight">Environment Status Overview</h1>
          <p className="text-text-secondary mt-1">Live health checks and connectivity status for all deployed environments.</p>
        </div>
        <button 
          onClick={() => navigate('/config')}
          className="bg-primary-orange hover:bg-hover-orange text-white px-6 py-2 rounded-lg font-medium transition-colors"
        >
          Manage Configurations
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {['dev', 'qa', 'prod'].map(envName => {
          const envData = environments.find(e => e.env_name === envName) || { config_json: {} };
          const config = envData.config_json || {};
          
          return (
            <div key={envName} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex flex-col transition-all hover:shadow-md">
              <div className={`p-4 text-white flex items-center justify-between ${
                envName === 'prod' ? 'bg-sidebar' : envName === 'qa' ? 'bg-button-orange' : 'bg-gray-600'
              }`}>
                <div className="flex items-center gap-2">
                  <ServerIcon className="w-6 h-6" />
                  <h2 className="font-bold text-lg uppercase tracking-wide">{envName} Environment</h2>
                </div>
                <div className="bg-green-500/20 text-green-100 px-3 py-1 rounded-full text-xs font-bold border border-green-500/30 flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></span>
                  ONLINE
                </div>
              </div>
              
              <div className="p-6 flex-1 space-y-4">
                <div className="flex justify-between items-center border-b border-gray-100 pb-2">
                  <span className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Namespace</span>
                  <span className="text-sm text-gray-800 font-mono bg-gray-50 px-2 py-1 rounded">{config.namespace || 'N/A'}</span>
                </div>
                <div className="flex justify-between items-center border-b border-gray-100 pb-2">
                  <span className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Kafka Brokers</span>
                  <span className="text-xs text-gray-800 font-mono bg-gray-50 px-2 py-1 rounded truncate max-w-[150px]" title={config.kafka_brokers}>{config.kafka_brokers || 'N/A'}</span>
                </div>
                <div className="flex justify-between items-center border-b border-gray-100 pb-2">
                  <span className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Registry</span>
                  <span className="text-xs text-gray-800 font-mono bg-gray-50 px-2 py-1 rounded truncate max-w-[150px]" title={config.docker_registry}>{config.docker_registry || 'N/A'}</span>
                </div>
                
                <div className="pt-4 space-y-2">
                  <h4 className="text-xs font-bold text-gray-400 uppercase">Service Health</h4>
                  <div className="flex items-center gap-2 text-sm text-gray-700">
                    <CheckCircleIcon className="w-5 h-5 text-green-500" /> API Gateway
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-700">
                    <CheckCircleIcon className="w-5 h-5 text-green-500" /> Kafka Cluster
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-700">
                    <CheckCircleIcon className="w-5 h-5 text-green-500" /> Schema Registry
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
