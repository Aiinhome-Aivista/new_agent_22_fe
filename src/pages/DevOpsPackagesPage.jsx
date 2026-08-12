import React, { useState } from 'react';
import { ArchiveBoxArrowDownIcon, CodeBracketSquareIcon, CloudArrowUpIcon, PlayIcon } from '@heroicons/react/24/outline';

export default function DevOpsPackagesPage() {
  const [targetEnv, setTargetEnv] = useState('DEV');
  
  const [packages] = useState([
    { id: 'PKG-001', service: 'Payment Processing', version: 'v1.2.0', status: 'Ready', size: '1.2 MB' },
    { id: 'PKG-002', service: 'User Sync Service', version: 'v2.0.1', status: 'In Review', size: '890 KB' },
    { id: 'PKG-003', service: 'Notification Engine', version: 'v1.0.5', status: 'Ready', size: '2.1 MB' }
  ]);

  return (
    <div className="flex flex-col h-full bg-gray-50 p-8">
      <div className="animate-fade-in-up max-w-6xl mx-auto w-full">
        <div className="mb-8">
          <h1 className="text-2xl font-extrabold text-sidebar tracking-tight">DevOps Packaging & Deployment</h1>
          <p className="text-text-secondary mt-1">Manage generated microservice artifacts, scripts, and container deployments.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Environment Selector Card */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-border-light relative overflow-hidden">
            <h3 className="font-bold text-gray-800 flex items-center gap-2 mb-4">
              <CloudArrowUpIcon className="w-5 h-5 text-primary-orange" /> Target Environment
            </h3>
            <p className="text-sm text-gray-500 mb-4">Select the deployment cluster for the upcoming packaging tasks.</p>
            <select 
              value={targetEnv}
              onChange={(e) => setTargetEnv(e.target.value)}
              className="w-full bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-orange focus:border-primary-orange block p-2.5 outline-none font-bold"
            >
              <option value="DEV">DEV (Local / Sandboxed EKS)</option>
              <option value="STAGING">STAGING (AWS EKS - us-east-1)</option>
              <option value="PROD">PROD (AWS EKS - us-east-1)</option>
            </select>
          </div>

          {/* Deployment Actions Card */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-border-light relative overflow-hidden">
            <h3 className="font-bold text-gray-800 flex items-center gap-2 mb-4">
              <PlayIcon className="w-5 h-5 text-primary-orange" /> Infrastructure Actions
            </h3>
            <p className="text-sm text-gray-500 mb-4">Automate Docker and Helm Chart workflows.</p>
            <div className="flex flex-col gap-3">
              <button className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 border border-gray-300 font-bold py-2.5 rounded-lg text-sm transition-colors flex items-center justify-center gap-2 shadow-sm">
                <CodeBracketSquareIcon className="w-5 h-5" /> Generate DevOps Scripts
              </button>
              <button className="w-full bg-sidebar hover:bg-sidebar/90 text-white font-bold py-2.5 rounded-lg text-sm transition-colors flex items-center justify-center gap-2 shadow-sm">
                <ArchiveBoxArrowDownIcon className="w-5 h-5" /> Push Image to Container Registry
              </button>
            </div>
          </div>
        </div>

        {/* Code Packages List */}
        <div className="bg-white rounded-2xl shadow-sm border border-border-light/60 overflow-hidden">
          <div className="p-6 border-b border-border-light/60 bg-gray-50/50">
            <h2 className="font-bold text-gray-800">Generated Code Packages</h2>
          </div>
          <table className="w-full text-left">
            <thead>
              <tr className="bg-white text-gray-500 text-[11px] font-bold uppercase tracking-wider border-b border-border-light/60">
                <th className="px-6 py-4">Package ID</th>
                <th className="px-6 py-4">Microservice</th>
                <th className="px-6 py-4">Version</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Size</th>
                <th className="px-6 py-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-light/40 bg-white">
              {packages.map(pkg => (
                <tr key={pkg.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-6 py-4 font-mono text-sm font-medium text-gray-500">{pkg.id}</td>
                  <td className="px-6 py-4 font-bold text-gray-800 text-sm">{pkg.service}</td>
                  <td className="px-6 py-4 font-mono text-xs text-gray-500">{pkg.version}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded text-xs font-bold ${
                      pkg.status === 'Ready' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-amber-50 text-amber-700 border border-amber-100'
                    }`}>
                      {pkg.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 font-mono text-xs text-gray-500">{pkg.size}</td>
                  <td className="px-6 py-4 text-right">
                    <button 
                      disabled={pkg.status !== 'Ready'}
                      className={`px-4 py-2 rounded-lg text-xs font-bold transition-colors ${
                        pkg.status === 'Ready' 
                        ? 'bg-primary-orange hover:bg-hover-orange text-white shadow-sm' 
                        : 'bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-200'
                      }`}
                    >
                      Deploy to {targetEnv}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
