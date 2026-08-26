import React, { useState, useEffect } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { getTechLeadValidations, actionValidation } from '../api/api';
import { useProject } from '../context/ProjectContext';
import { 
  ChevronRightIcon,
  FolderIcon,
  QueueListIcon
} from '@heroicons/react/24/outline';

export default function TechLeadValidationsPage() {
  const navigate = useNavigate();
  const { currentProject, currentTrack, selectTrack } = useProject();

  const [validations, setValidations] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Modal state
  const [modalType, setModalType] = useState(null); // 'waive', 'resolve', 'inspect'
  const [activeValidation, setActiveValidation] = useState(null);
  const [note, setNote] = useState('');

  const fetchValidations = async () => {
    setLoading(true);
    try {
      const res = await getTechLeadValidations(currentTrack?.id);
      setValidations(res.data || []);
    } catch (err) {
      console.error('Error fetching validations:', err);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchValidations();
  }, [currentTrack]);

  const openModal = (e, type, val) => {
    e.preventDefault();
    setModalType(type);
    setActiveValidation(val);
    setNote('');
  };

  const closeModal = () => {
    setModalType(null);
    setActiveValidation(null);
    setNote('');
  };

  const handleConfirmAction = async (e) => {
    e.preventDefault();
    if (!activeValidation || (modalType === 'waive' && !note.trim())) return;
    
    try {
      const action = modalType === 'waive' ? 'WAIVE' : 'RESOLVE';
      await actionValidation(activeValidation.id, action);
      
      // Remove from list locally for smooth UI update
      setValidations(prev => prev.filter(v => v.id !== activeValidation.id));
      closeModal();
    } catch (err) {
      console.error('Error taking action:', err);
    }
  };

  const [activeTab, setActiveTab] = useState('all');

  const getSeverityBadge = (severity) => {
    switch(severity) {
      case 'high': return <span className="bg-red-100 text-red-700 px-2 py-1 rounded-full text-xs font-bold uppercase shadow-sm">High</span>;
      case 'medium': return <span className="bg-amber-100 text-amber-700 px-2 py-1 rounded-full text-xs font-bold uppercase shadow-sm">Medium</span>;
      case 'low': return <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded-full text-xs font-bold uppercase shadow-sm">Low</span>;
      default: return null;
    }
  };

  const filtered = validations.filter(v => activeTab === 'all' || v.severity_display === activeTab);

  if (!currentTrack || !currentProject) {
    return <Navigate to="/projects" replace />;
  }

  return (
    <div className="flex flex-col h-full bg-gray-50 p-8">
      <div className="animate-fade-in-up max-w-6xl mx-auto w-full">
        
        {/* Track Context & Breadcrumb Bar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            {/* Breadcrumb Navigation */}
            <div className="flex flex-wrap items-center gap-2 text-xs text-text-secondary mb-1">
              <button 
                onClick={() => { selectTrack(null, null); navigate('/projects'); }}
                className="hover:text-primary-orange transition-colors font-bold flex items-center gap-1"
              >
                <FolderIcon className="w-3.5 h-3.5 text-primary-orange" />
                Projects Directory
              </button>
              <ChevronRightIcon className="w-3 h-3 text-placeholder" />
              <span className="font-bold text-sidebar">{currentProject.name}</span>
              <ChevronRightIcon className="w-3 h-3 text-placeholder" />
              <span className="text-primary-orange font-extrabold flex items-center gap-1">
                <QueueListIcon className="w-3.5 h-3.5" />
                {currentTrack.track_name}
              </span>
            </div>

            <h1 className="text-2xl font-extrabold text-sidebar tracking-tight">Validation Severity Queue</h1>
            <p className="text-text-secondary mt-1">Review and manage automated validation failures for <span className="font-bold text-sidebar">{currentTrack.track_name}</span>.</p>
          </div>

          <button
            onClick={() => { selectTrack(null, currentProject); navigate('/projects'); }}
            className="self-start md:self-auto text-xs font-bold text-primary-orange hover:bg-orange-50 border border-orange-200 px-3.5 py-1.5 rounded-xl transition-all"
          >
            Switch Track / Project &rarr;
          </button>
        </div>

        <div className="mb-8 flex justify-between items-end">
          <div>
            {/* The title has been moved to the breadcrumb area */}
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
              {loading ? (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center text-gray-500 font-medium">Loading validations...</td>
                </tr>
              ) : filtered.map(val => (
                <tr key={val.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-6 py-4 font-mono text-sm font-medium text-gray-500">#{val.request_id}</td>
                  <td className="px-6 py-4">{getSeverityBadge(val.severity_display)}</td>
                  <td className="px-6 py-4 font-bold text-gray-800 text-sm">{val.message}</td>
                  <td className="px-6 py-4 font-mono text-xs text-gray-500">{val.rule_name}</td>
                  <td className="px-6 py-4 flex justify-end gap-2 items-center">
                    <button 
                      onClick={(e) => openModal(e, 'inspect', val)} 
                      className="bg-white border border-gray-200 hover:border-gray-400 text-gray-700 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors"
                    >
                      Review & Fix
                    </button>
                    <button 
                      onClick={(e) => openModal(e, 'resolve', val)}
                      className="bg-blue-50 border border-blue-200 hover:border-blue-400 text-blue-700 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors"
                    >
                      Resolve
                    </button>
                    {val.severity_display !== 'high' && (
                      <button 
                        onClick={(e) => openModal(e, 'waive', val)}
                        className="bg-amber-50 border border-amber-200 hover:border-amber-400 text-amber-700 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors"
                      >
                        Approve Waiver
                      </button>
                    )}
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
      {/* Action Modals */}
      {modalType && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden animate-fade-in-up">
            
            {/* Modal Header */}
            <div className="p-6 border-b border-gray-100">
              <h3 className="text-lg font-bold text-gray-800">
                {modalType === 'waive' && 'Approve Validation Waiver'}
                {modalType === 'resolve' && 'Mark Issue as Resolved'}
                {modalType === 'inspect' && 'Issue Code Inspection'}
              </h3>
              <p className="text-sm text-gray-500 mt-1">
                Req #{activeValidation?.request_id} • {activeValidation?.rule_name}
              </p>
            </div>
            
            {/* Modal Body */}
            <div className="p-6 space-y-4">
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                <p className="text-sm font-bold text-gray-700 mb-1">Issue Description:</p>
                <p className="text-sm text-gray-600">{activeValidation?.message}</p>
              </div>

              {modalType === 'inspect' && (
                <>
                  <div className="bg-slate-900 p-4 rounded-lg overflow-x-auto">
                    <p className="text-xs font-mono text-gray-400 mb-2">// Affected code excerpt could be fetched here</p>
                    <pre className="text-sm font-mono text-green-400">
                      <code>{`public class ${activeValidation?.rule_name.split('.')[0] || 'App'} {\n  // Validation failed here\n}`}</code>
                    </pre>
                  </div>
                  <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
                    <p className="text-sm font-bold text-blue-800 mb-1">AI Suggestion:</p>
                    <p className="text-sm text-blue-700">Ensure the relevant standard is applied before final commit.</p>
                  </div>
                </>
              )}

              {modalType === 'waive' && (
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Waiver Justification / Reason <span className="text-red-500">*</span></label>
                  <textarea
                    className="w-full border border-gray-300 rounded-lg p-3 text-sm focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none resize-none h-24"
                    placeholder="Enter justification for waiving this enterprise validation rule..."
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    required
                  />
                </div>
              )}

              {modalType === 'resolve' && (
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Resolution Note (Optional)</label>
                  <textarea
                    className="w-full border border-gray-300 rounded-lg p-3 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none h-24"
                    placeholder="E.g., Added the missing DLQ topic to the configuration."
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                  />
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-6 border-t border-gray-100 bg-gray-50 flex justify-end gap-3">
              <button
                onClick={closeModal}
                className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-bold text-gray-600 hover:bg-gray-100 transition-colors"
              >
                {modalType === 'inspect' ? 'Close' : 'Cancel'}
              </button>
              
              {modalType === 'waive' && (
                <button
                  onClick={handleConfirmAction}
                  disabled={!note.trim()}
                  className={`px-4 py-2 rounded-lg text-sm font-bold transition-colors ${
                    note.trim() ? 'bg-amber-600 text-white hover:bg-amber-700' : 'bg-amber-300 text-white cursor-not-allowed'
                  }`}
                >
                  Confirm Waiver
                </button>
              )}
              
              {modalType === 'resolve' && (
                <button
                  onClick={handleConfirmAction}
                  className="px-4 py-2 rounded-lg text-sm font-bold transition-colors bg-blue-600 text-white hover:bg-blue-700"
                >
                  Mark Resolved
                </button>
              )}
              
              {modalType === 'inspect' && (
                <button
                  onClick={() => {
                    navigate(`/requests/${activeValidation?.request_id}/validation`);
                    closeModal();
                  }}
                  className="px-4 py-2 rounded-lg text-sm font-bold transition-colors bg-sidebar text-white hover:bg-sidebar-dark"
                >
                  Open Full Validation Report
                </button>
              )}
            </div>
            
          </div>
        </div>
      )}
    </div>
  );
}
