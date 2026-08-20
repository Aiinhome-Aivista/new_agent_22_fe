import React, { useState, useEffect } from 'react';
import { DocumentArrowDownIcon, ChartBarIcon, FunnelIcon } from '@heroicons/react/24/outline';
import { getTechLeadReportSummary, getTechLeadReports, downloadTechLeadReport } from '../api/api';

export default function TechLeadReportsPage() {
  const [reports, setReports] = useState([]);
  const [summary, setSummary] = useState({ total_passed: 0, warnings_and_waivers: 0, critical_failures: 0 });
  const [loading, setLoading] = useState(true);
  const [filterAppId, setFilterAppId] = useState('All');
  
  useEffect(() => {
    Promise.all([getTechLeadReportSummary(), getTechLeadReports()])
      .then(([sumRes, repRes]) => {
        setSummary(sumRes.data || { total_passed: 0, warnings_and_waivers: 0, critical_failures: 0 });
        setReports(repRes.data || []);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  const handleDownload = async (id, title, format) => {
    try {
      const blob = await downloadTechLeadReport(id, format);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `audit_report_${id}.${format}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch(e) {
      console.error('Download failed', e);
    }
  };
  
  const appIds = ['All', ...new Set(reports.map(r => r.application_id).filter(Boolean))];
  const filteredReports = filterAppId === 'All' ? reports : reports.filter(r => r.application_id === filterAppId);

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
            <p className="text-3xl font-extrabold text-gray-800">{loading ? '...' : summary.total_passed}</p>
            <p className="text-emerald-600 text-sm font-medium mt-1">↑ 14% this month</p>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-border-light relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-amber-50 rounded-full mix-blend-multiply filter blur-xl opacity-50 -translate-y-1/2 translate-x-1/2"></div>
            <h3 className="text-gray-500 text-xs font-bold uppercase tracking-wider mb-2">Warnings & Waivers</h3>
            <p className="text-3xl font-extrabold text-gray-800">{loading ? '...' : summary.warnings_and_waivers}</p>
            <p className="text-amber-600 text-sm font-medium mt-1">Requires attention</p>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-border-light relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-red-50 rounded-full mix-blend-multiply filter blur-xl opacity-50 -translate-y-1/2 translate-x-1/2"></div>
            <h3 className="text-gray-500 text-xs font-bold uppercase tracking-wider mb-2">Critical Failures</h3>
            <p className="text-3xl font-extrabold text-gray-800">{loading ? '...' : summary.critical_failures}</p>
            <p className="text-red-600 text-sm font-medium mt-1">↓ 2 less than last week</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-border-light/60 overflow-hidden">
          <div className="p-6 border-b border-border-light/60 flex justify-between items-center bg-gray-50/50">
            <h2 className="font-bold text-gray-800 flex items-center gap-2">
              <ChartBarIcon className="w-5 h-5 text-gray-500" /> Downloadable Reports
            </h2>
            <div className="relative">
              <select 
                value={filterAppId}
                onChange={(e) => setFilterAppId(e.target.value)}
                className="flex appearance-none items-center gap-2 text-sm font-bold text-gray-600 bg-white border border-gray-200 px-4 py-2 pr-8 rounded-lg hover:bg-gray-50 outline-none focus:ring-2 focus:ring-primary-orange"
              >
                {appIds.map(app => (
                  <option key={app} value={app}>{app === 'All' ? 'Filter by App ID' : app}</option>
                ))}
              </select>
              <FunnelIcon className="w-4 h-4 text-gray-400 absolute right-3 top-2.5 pointer-events-none" />
            </div>
          </div>
          <table className="w-full text-left">
            <thead>
              <tr className="bg-white text-gray-500 text-[11px] font-bold uppercase tracking-wider border-b border-border-light/60">
                <th className="px-6 py-4">Report Title</th>
                <th className="px-6 py-4">Formats</th>
                <th className="px-6 py-4">Size</th>
                <th className="px-6 py-4">Generated Date</th>
                <th className="px-6 py-4 text-right">Download</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-light/40 bg-white">
              {loading ? (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center text-gray-500 font-medium">Loading reports...</td>
                </tr>
              ) : filteredReports.map(rep => (
                <tr key={rep.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-6 py-5 font-bold text-gray-800 text-sm">{rep.title}</td>
                  <td className="px-6 py-5">
                    <span className="px-2 py-1 rounded text-xs font-bold bg-blue-50 text-blue-700 border border-blue-100">
                      {rep.type}
                    </span>
                  </td>
                  <td className="px-6 py-5 font-mono text-xs text-gray-500">{rep.size}</td>
                  <td className="px-6 py-5 text-sm font-medium text-gray-500">{rep.date}</td>
                  <td className="px-6 py-5 text-right flex justify-end gap-2">
                    <button 
                      onClick={() => handleDownload(rep.id, rep.title, 'pdf')}
                      className="text-red-600 hover:text-red-700 transition-colors p-2 rounded-lg hover:bg-red-50 flex items-center gap-1 text-xs font-bold border border-red-200"
                    >
                      <DocumentArrowDownIcon className="w-4 h-4" /> PDF
                    </button>
                    <button 
                      onClick={() => handleDownload(rep.id, rep.title, 'docx')}
                      className="text-blue-600 hover:text-blue-700 transition-colors p-2 rounded-lg hover:bg-blue-50 flex items-center gap-1 text-xs font-bold border border-blue-200"
                    >
                      <DocumentArrowDownIcon className="w-4 h-4" /> DOCX
                    </button>
                  </td>
                </tr>
              ))}
              {!loading && filteredReports.length === 0 && (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center text-gray-500 font-medium">No reports found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
