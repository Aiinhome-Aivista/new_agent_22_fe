import { useState, useEffect } from 'react';
import { getEnvironments, updateEnvironment } from '../api/api';
import Loader from '../components/Loader';

export default function DevopsConfigPage() {
  const [environments, setEnvironments] = useState([]);
  const [selectedEnv, setSelectedEnv] = useState('dev');
  const [configStr, setConfigStr] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });

  useEffect(() => {
    fetchEnvironments();
  }, []);

  const fetchEnvironments = () => {
    getEnvironments().then(res => {
      if (res.success) {
        setEnvironments(res.data);
        const current = res.data.find(e => e.env_name === selectedEnv);
        if (current) {
          setConfigStr(JSON.stringify(current.config_json, null, 2));
        }
      }
      setLoading(false);
    }).catch(err => {
      console.error(err);
      setLoading(false);
    });
  };

  const handleSelectEnv = (envName) => {
    setSelectedEnv(envName);
    const current = environments.find(e => e.env_name === envName);
    if (current) {
      setConfigStr(JSON.stringify(current.config_json, null, 2));
    } else {
      setConfigStr('{\n  "kafka_brokers": "",\n  "schema_registry": "",\n  "docker_registry": "",\n  "namespace": ""\n}');
    }
    setMessage({ text: '', type: '' });
  };

  const handleSave = () => {
    let parsedConfig;
    try {
      parsedConfig = JSON.parse(configStr);
    } catch (e) {
      setMessage({ text: 'Invalid JSON format', type: 'error' });
      return;
    }

    setSaving(true);
    updateEnvironment(selectedEnv, parsedConfig).then(res => {
      if (res.success) {
        setMessage({ text: 'Configuration saved successfully', type: 'success' });
        fetchEnvironments(); // Refresh
      } else {
        setMessage({ text: res.message || 'Failed to save', type: 'error' });
      }
      setSaving(false);
    }).catch(err => {
      setMessage({ text: 'An error occurred while saving', type: 'error' });
      setSaving(false);
    });
  };

  if (loading) return <Loader />;

  return (
    <div className="flex flex-col h-full bg-gray-50 p-8">
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-extrabold text-sidebar tracking-tight">Environment Configurations</h1>
          <p className="text-text-secondary mt-1">Manage standard deployment variables for Dev, QA, and Prod.</p>
        </div>
      </div>

      <div className="flex gap-6 flex-1 overflow-hidden">
        {/* Sidebar */}
        <div className="w-64 bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex flex-col">
          <div className="p-4 border-b border-gray-100 bg-gray-50">
            <h2 className="font-bold text-gray-700 text-sm uppercase tracking-wider">Environments</h2>
          </div>
          <div className="overflow-y-auto flex-1 p-2 space-y-1">
            {['dev', 'qa', 'prod'].map(env => (
              <button
                key={env}
                onClick={() => handleSelectEnv(env)}
                className={`w-full text-left px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                  selectedEnv === env 
                    ? 'bg-primary-orange text-white' 
                    : 'text-gray-600 hover:bg-orange-50 hover:text-primary-orange'
                }`}
              >
                {env.toUpperCase()} Environment
              </button>
            ))}
          </div>
        </div>

        {/* Editor Area */}
        <div className="flex-1 bg-white rounded-xl shadow-sm border border-gray-200 flex flex-col overflow-hidden">
          <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
            <h2 className="font-bold text-gray-800 flex items-center gap-2">
              <span className="text-primary-orange text-xl">⚙️</span>
              Editing: {selectedEnv.toUpperCase()} Configuration
            </h2>
            <button 
              onClick={handleSave}
              disabled={saving}
              className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg font-medium transition-colors disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Save Configuration'}
            </button>
          </div>
          
          {message.text && (
            <div className={`p-3 mx-4 mt-4 text-sm rounded ${message.type === 'error' ? 'bg-red-50 text-red-600 border border-red-200' : 'bg-green-50 text-green-700 border border-green-200'}`}>
              {message.text}
            </div>
          )}

          <div className="flex-1 p-4 flex flex-col">
            <label className="text-sm font-bold text-gray-700 mb-2">Configuration JSON</label>
            <textarea
              value={configStr}
              onChange={(e) => setConfigStr(e.target.value)}
              className="flex-1 w-full bg-gray-900 text-green-400 p-4 rounded-lg font-mono text-sm focus:outline-none focus:ring-2 focus:ring-primary-orange resize-none"
              spellCheck="false"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
