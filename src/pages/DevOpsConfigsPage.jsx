import React from 'react';
import { ShieldExclamationIcon, ShieldCheckIcon, AdjustmentsHorizontalIcon, LockClosedIcon } from '@heroicons/react/24/outline';

export default function DevOpsConfigsPage() {
  const checklists = [
    { name: 'AWS IAM Access & Secrets Status', status: 'Valid', icon: <LockClosedIcon className="w-5 h-5 text-emerald-600"/> },
    { name: 'Azure Service Principal Credentials', status: 'Valid', icon: <LockClosedIcon className="w-5 h-5 text-emerald-600"/> },
    { name: 'Kafka Topic Binding & Consumer Group Configs', status: 'Checked', icon: <AdjustmentsHorizontalIcon className="w-5 h-5 text-emerald-600"/> },
    { name: 'Environment Secrets Injection (Vault / Env Vars)', status: 'Warning', icon: <ShieldExclamationIcon className="w-5 h-5 text-amber-500"/> }
  ];

  return (
    <div className="flex flex-col h-full bg-gray-50 p-8">
      <div className="animate-fade-in-up max-w-6xl mx-auto w-full">
        <div className="flex justify-between items-end mb-8">
          <div>
            <h1 className="text-2xl font-extrabold text-sidebar tracking-tight">Configuration Health & Security Audits</h1>
            <p className="text-text-secondary mt-1">Monitor IAM policies, Vault injections, and message broker configurations.</p>
          </div>
          <button className="bg-primary-orange hover:bg-hover-orange text-white font-bold py-2.5 px-6 rounded-lg text-sm shadow-md transition-colors flex items-center gap-2">
            <ShieldCheckIcon className="w-5 h-5" /> Run Security Audit Scan
          </button>
        </div>

        {/* Metrics Bar */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-emerald-50 border border-emerald-100 p-6 rounded-2xl flex items-center justify-between">
            <div>
              <h3 className="text-emerald-800 text-xs font-bold uppercase tracking-wider mb-1">Passed Audits</h3>
              <p className="text-3xl font-extrabold text-emerald-600">24</p>
            </div>
            <div className="w-12 h-12 bg-emerald-200/50 rounded-full flex items-center justify-center text-emerald-600">✓</div>
          </div>
          <div className="bg-amber-50 border border-amber-100 p-6 rounded-2xl flex items-center justify-between">
            <div>
              <h3 className="text-amber-800 text-xs font-bold uppercase tracking-wider mb-1">Warnings</h3>
              <p className="text-3xl font-extrabold text-amber-600">2</p>
            </div>
            <div className="w-12 h-12 bg-amber-200/50 rounded-full flex items-center justify-center text-amber-600">!</div>
          </div>
          <div className="bg-red-50 border border-red-100 p-6 rounded-2xl flex items-center justify-between">
            <div>
              <h3 className="text-red-800 text-xs font-bold uppercase tracking-wider mb-1">Failing Configurations</h3>
              <p className="text-3xl font-extrabold text-red-600">0</p>
            </div>
            <div className="w-12 h-12 bg-red-200/50 rounded-full flex items-center justify-center text-red-600">✕</div>
          </div>
        </div>

        {/* Audit Checklist Table */}
        <div className="bg-white rounded-2xl shadow-sm border border-border-light/60 overflow-hidden">
          <div className="p-6 border-b border-border-light/60 bg-gray-50/50">
            <h2 className="font-bold text-gray-800">Security & Configuration Checklist</h2>
          </div>
          <div className="divide-y divide-border-light/40">
            {checklists.map((item, idx) => (
              <div key={idx} className="p-6 flex items-center justify-between hover:bg-gray-50/50 transition-colors">
                <div className="flex items-center gap-4">
                  <div className={`p-2 rounded-lg ${item.status === 'Warning' ? 'bg-amber-100' : 'bg-emerald-100'}`}>
                    {item.icon}
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-800 text-sm">{item.name}</h3>
                    <p className="text-xs text-gray-500 mt-0.5">Automated Check</p>
                  </div>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-bold border ${
                  item.status === 'Warning' ? 'bg-amber-50 text-amber-700 border-amber-200' : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                }`}>
                  {item.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
