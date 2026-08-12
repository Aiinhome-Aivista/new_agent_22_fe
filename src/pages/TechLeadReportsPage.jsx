import React, { useState } from 'react';
import { DocumentArrowDownIcon, ChartBarIcon, FunnelIcon } from '@heroicons/react/24/outline';

export default function TechLeadReportsPage() {
  const [reports] = useState([
    { id: 101, title: 'Q3 Enterprise Validation Audit', type: 'PDF', date: '2026-08-01', size: '2.4 MB' },
    { id: 102, title: 'Weekly Microservice Compliance Sync', type: 'JSON', date: '2026-08-08', size: '145 KB' },
    { id: 103, title: 'Payment Processing Service - Strict Audit', type: 'PDF', date: '2026-08-10', size: '1.1 MB' }
  ]);

  return (
    <div className="flex flex-col h-full bg-gray-50 p-8">
      <div className="animate-fade-in-up max-w-6xl mx-auto w-full">
        <div className="mb-8">
          <h1 className="text-2xl font-extrabold text-sidebar tracking-tight">Validation Reports & Audit</h1>
          <p className="text-text-secondary mt-1">Review validation pass/fail statistics and download audit artifacts.</p>
        </div>

        {/* Dashboard Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-border-light relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-50 rounded-full mix-blend-multiply filter blur-xl opacity-50 -translate-y-1/2 translate-x-1/2"></div>
            <h3 className="text-gray-500 text-xs font-bold uppercase tracking-wider mb-2">Total Validations Passed</h3>
            <p className="text-3xl font-extrabold text-gray-800">1,248</p>
            <p className="text-emerald-600 text-sm font-medium mt-1">↑ 14% this month</p>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-border-light relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-amber-50 rounded-full mix-blend-multiply filter blur-xl opacity-50 -translate-y-1/2 translate-x-1/2"></div>
            <h3 className="text-gray-500 text-xs font-bold uppercase tracking-wider mb-2">Warnings & Waivers</h3>
            <p className="text-3xl font-extrabold text-gray-800">42</p>
            <p className="text-amber-600 text-sm font-medium mt-1">Requires attention</p>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-border-light relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-red-50 rounded-full mix-blend-multiply filter blur-xl opacity-50 -translate-y-1/2 translate-x-1/2"></div>
            <h3 className="text-gray-500 text-xs font-bold uppercase tracking-wider mb-2">Critical Failures</h3>
            <p className="text-3xl font-extrabold text-gray-800">3</p>
            <p className="text-red-600 text-sm font-medium mt-1">↓ 2 less than last week</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-border-light/60 overflow-hidden">
          <div className="p-6 border-b border-border-light/60 flex justify-between items-center bg-gray-50/50">
            <h2 className="font-bold text-gray-800 flex items-center gap-2">
              <ChartBarIcon className="w-5 h-5 text-gray-500" /> Downloadable Reports
            </h2>
            <button className="flex items-center gap-2 text-sm font-bold text-gray-600 bg-white border border-gray-200 px-4 py-2 rounded-lg hover:bg-gray-50">
              <FunnelIcon className="w-4 h-4" /> Filter by App ID
            </button>
          </div>
          <table className="w-full text-left">
            <thead>
              <tr className="bg-white text-gray-500 text-[11px] font-bold uppercase tracking-wider border-b border-border-light/60">
                <th className="px-6 py-4">Report Title</th>
                <th className="px-6 py-4">Format</th>
                <th className="px-6 py-4">Size</th>
                <th className="px-6 py-4">Generated Date</th>
                <th className="px-6 py-4 text-right">Download</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-light/40 bg-white">
              {reports.map(rep => (
                <tr key={rep.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-6 py-5 font-bold text-gray-800 text-sm">{rep.title}</td>
                  <td className="px-6 py-5">
                    <span className={`px-2 py-1 rounded text-xs font-bold ${
                      rep.type === 'PDF' ? 'bg-red-50 text-red-700 border border-red-100' : 'bg-blue-50 text-blue-700 border border-blue-100'
                    }`}>
                      {rep.type}
                    </span>
                  </td>
                  <td className="px-6 py-5 font-mono text-xs text-gray-500">{rep.size}</td>
                  <td className="px-6 py-5 text-sm font-medium text-gray-500">{rep.date}</td>
                  <td className="px-6 py-5 text-right flex justify-end">
                    <button className="text-gray-500 hover:text-primary-orange transition-colors p-2 rounded-lg hover:bg-gray-100 flex items-center gap-2 text-xs font-bold border border-gray-200">
                      <DocumentArrowDownIcon className="w-4 h-4" /> Download
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
