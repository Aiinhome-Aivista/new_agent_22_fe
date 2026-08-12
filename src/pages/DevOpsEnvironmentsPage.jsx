import React from 'react';
import { ServerIcon, ShieldCheckIcon, DocumentTextIcon, ArrowPathIcon } from '@heroicons/react/24/outline';

export default function DevOpsEnvironmentsPage() {
  const environments = [
    {
      id: 'prod',
      name: 'Production (AWS-EKS)',
      status: 'Stable',
      region: 'us-east-1',
      version: 'v1.4.2',
      metrics: { nodes: 12, cpu: '45%', memory: '62%' }
    },
    {
      id: 'staging',
      name: 'Staging (AWS-EKS)',
      status: 'Stable',
      region: 'us-east-2',
      version: 'v1.5.0-rc1',
      metrics: { nodes: 4, cpu: '28%', memory: '41%' }
    },
    {
      id: 'dev',
      name: 'Development (Local/EKS)',
      status: 'Deploying...',
      region: 'local',
      version: 'v1.5.0-dev',
      metrics: { nodes: 2, cpu: '85%', memory: '78%' }
    }
  ];

  const getStatusBadge = (status) => {
    if (status === 'Stable' || status === 'Active') {
      return <span className="bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-xs font-bold uppercase flex items-center gap-1 border border-emerald-200"><ShieldCheckIcon className="w-4 h-4"/> {status}</span>;
    }
    return <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-bold uppercase flex items-center gap-1 animate-pulse border border-blue-200"><ArrowPathIcon className="w-4 h-4"/> {status}</span>;
  };

  return (
    <div className="flex flex-col h-full bg-gray-50 p-8">
      <div className="animate-fade-in-up max-w-6xl mx-auto w-full">
        <div className="mb-8">
          <h1 className="text-2xl font-extrabold text-sidebar tracking-tight">Target Environments & EKS Clusters</h1>
          <p className="text-text-secondary mt-1">Monitor live cluster health, node utilization, and active deployments.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {environments.map(env => (
            <div key={env.id} className="bg-white p-6 rounded-2xl shadow-sm border border-border-light relative flex flex-col">
              <div className="flex justify-between items-start mb-6">
                <div className="flex items-center gap-3">
                  <div className={`p-3 rounded-xl ${env.status.includes('Stable') ? 'bg-emerald-50 text-emerald-600' : 'bg-blue-50 text-blue-600'}`}>
                    <ServerIcon className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-gray-800 text-lg leading-tight">{env.name}</h3>
                    <span className="text-xs font-mono text-gray-500 uppercase tracking-widest">{env.region}</span>
                  </div>
                </div>
              </div>
              
              <div className="mb-6 flex justify-between items-center border-b border-gray-100 pb-4">
                {getStatusBadge(env.status)}
                <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded text-xs font-mono font-bold border border-gray-200">
                  {env.version}
                </span>
              </div>

              <div className="grid grid-cols-3 gap-4 mb-6 text-center bg-gray-50 p-4 rounded-xl border border-gray-100 flex-1">
                <div>
                  <span className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Nodes</span>
                  <strong className="text-xl font-extrabold text-gray-800">{env.metrics.nodes}</strong>
                </div>
                <div>
                  <span className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">CPU</span>
                  <strong className="text-xl font-extrabold text-gray-800">{env.metrics.cpu}</strong>
                </div>
                <div>
                  <span className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Memory</span>
                  <strong className="text-xl font-extrabold text-gray-800">{env.metrics.memory}</strong>
                </div>
              </div>

              <div className="flex gap-3 mt-auto">
                <button className="flex-1 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 font-bold py-2 rounded-lg text-xs transition-colors flex items-center justify-center gap-2 shadow-sm">
                  <DocumentTextIcon className="w-4 h-4" /> View Pod Logs
                </button>
                <button className="flex-1 bg-white border border-red-200 hover:bg-red-50 hover:text-red-700 hover:border-red-300 text-red-600 font-bold py-2 rounded-lg text-xs transition-colors flex items-center justify-center gap-2 shadow-sm">
                  <ArrowPathIcon className="w-4 h-4" /> Restart Pods
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
