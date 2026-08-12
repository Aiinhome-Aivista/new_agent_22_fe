import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function TechLeadValidationsPage() {
  const navigate = useNavigate();

  // Mock data for validations
  const [validations] = useState([
    {
      id: 1,
      requestId: 3,
      description: 'Security Group Conflict in ECS Config',
      severity: 'high',
      affectedFile: 'deployment/ecs-task.json'
    },
    {
      id: 2,
      requestId: 5,
      description: 'Missing DLQ Topic Configuration',
      severity: 'high',
      affectedFile: 'src/main/java/.../Config.java'
    },
    {
      id: 3,
      requestId: 2,
      description: 'Environment variable not mapped',
      severity: 'medium',
      affectedFile: 'application-prod.yml'
    },
    {
      id: 4,
      requestId: 8,
      description: 'Unused import statement',
      severity: 'low',
      affectedFile: 'src/main/java/.../Handler.java'
    }
  ]);

  const [activeTab, setActiveTab] = useState('all');

  const getSeverityBadge = (severity) => {
    switch(severity) {
      case 'high': return <span className="bg-red-100 text-red-700 px-2 py-1 rounded-full text-xs font-bold uppercase shadow-sm">High</span>;
      case 'medium': return <span className="bg-amber-100 text-amber-700 px-2 py-1 rounded-full text-xs font-bold uppercase shadow-sm">Medium</span>;
      case 'low': return <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded-full text-xs font-bold uppercase shadow-sm">Low</span>;
      default: return null;
    }
  };

  const filtered = validations.filter(v => activeTab === 'all' || v.severity === activeTab);

  return (
    <div className="flex flex-col h-full bg-gray-50 p-8">
      <div className="animate-fade-in-up max-w-6xl mx-auto w-full">
        <div className="mb-8 flex justify-between items-end">
          <div>
            <h1 className="text-2xl font-extrabold text-sidebar tracking-tight">Validation Severity Queue</h1>
            <p className="text-text-secondary mt-1">Review and manage automated validation failures.</p>
          </div>
          <div className="flex gap-2">
            {['all', 'high', 'medium', 'low'].map(tab => (
              <button 
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 rounded-lg text-sm font-bold transition-all capitalize ${
                  activeTab === tab 
                  ? 'bg-sidebar text-white shadow-sm' 
                  : 'bg-white text-gray-500 border border-gray-200 hover:bg-gray-50'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-border-light/60 overflow-hidden">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50 text-gray-500 text-[11px] font-bold uppercase tracking-wider border-b border-border-light/60">
                <th className="px-6 py-4">Req ID</th>
                <th className="px-6 py-4">Severity</th>
                <th className="px-6 py-4">Issue Description</th>
                <th className="px-6 py-4">Affected File</th>
                <th className="px-6 py-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-light/40">
              {filtered.map(val => (
                <tr key={val.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-6 py-4 font-mono text-sm font-medium text-gray-500">#{val.requestId}</td>
                  <td className="px-6 py-4">{getSeverityBadge(val.severity)}</td>
                  <td className="px-6 py-4 font-bold text-gray-800 text-sm">{val.description}</td>
                  <td className="px-6 py-4 font-mono text-xs text-gray-500">{val.affectedFile}</td>
                  <td className="px-6 py-4 flex justify-end gap-2 items-center">
                    <button onClick={() => navigate(`/requests/${val.requestId}/validation`)} className="bg-white border border-gray-200 hover:border-gray-400 text-gray-700 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors">
                      Review & Fix
                    </button>
                    {val.severity !== 'high' && (
                      <button className="bg-amber-50 border border-amber-200 hover:border-amber-400 text-amber-700 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors">
                        Approve Waiver
                      </button>
                    )}
                    <button className="bg-blue-50 border border-blue-200 hover:border-blue-400 text-blue-700 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors">
                      Re-validate
                    </button>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center text-gray-500 font-medium">
                    No validation issues found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
