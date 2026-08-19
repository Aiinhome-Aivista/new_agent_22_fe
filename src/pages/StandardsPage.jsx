import { useState, useEffect } from 'react';
import { getStandards, saveStandard, deleteStandard } from '../api/api';
import Loader from '../components/Loader';
import { DocumentTextIcon, PlusIcon, TrashIcon } from '@heroicons/react/24/outline';
import { useAuth } from '../context/AuthContext';

export default function StandardsPage() {
  const { user } = useAuth();
  const [standards, setStandards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedStandard, setSelectedStandard] = useState(null);
  
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({ filename: '', folder: 'standards', content: '' });

  const fetchStandards = () => {
    setLoading(true);
    getStandards().then(res => {
      setStandards(res.data || []);
      setLoading(false);
    }).catch(err => {
      console.error(err);
      setLoading(false);
    });
  };

  useEffect(() => {
    fetchStandards();
  }, []);

  const handleSave = async () => {
    await saveStandard({ ...editForm, created_by: user?.id || 2 });
    setIsEditing(false);
    fetchStandards();
    setSelectedStandard(null);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this standard?")) {
      await deleteStandard(id);
      fetchStandards();
      setSelectedStandard(null);
    }
  };

  const openNew = () => {
    setEditForm({ filename: '', folder: 'standards', content: '# New Architecture Standard\n\nExplain the rules here...' });
    setIsEditing(true);
    setSelectedStandard(null);
  };

  const openEdit = (std) => {
    setEditForm({ filename: std.filename, folder: std.folder, content: std.content });
    setIsEditing(true);
  };

  if (loading) return <Loader />;

  return (
    <div className="animate-fade-in-up flex flex-col h-full">
      <div className="mb-6 flex justify-between items-center px-6 pt-6">
        <div>
          <h1 className="text-2xl font-extrabold text-sidebar tracking-tight">Architecture Standards</h1>
          <p className="text-text-secondary mt-1">Manage RAG knowledge base for patterns and guidelines.</p>
        </div>
        {!isEditing && (
          <button onClick={openNew} className="flex items-center gap-2 bg-primary-orange text-white px-4 py-2 rounded-lg font-bold hover:bg-hover-orange transition-colors">
            <PlusIcon className="w-5 h-5" /> Add Standard
          </button>
        )}
      </div>

      <div className="flex flex-1 overflow-hidden px-6 pb-6 gap-6">
        {/* Sidebar List */}
        {!isEditing && (
          <div className="w-1/3 bg-white border border-border-light rounded-xl overflow-y-auto p-4 flex flex-col gap-3 shadow-sm">
            {standards.map(std => (
              <div 
                key={std.id}
                onClick={() => setSelectedStandard(std)}
                className={`p-3 rounded-lg border cursor-pointer transition-all flex items-start gap-3 ${selectedStandard?.id === std.id ? 'border-primary-orange bg-orange-50' : 'border-border-light hover:border-gray-300 bg-gray-50'}`}
              >
                <DocumentTextIcon className="w-6 h-6 text-gray-400 mt-1" />
                <div className="flex-1 overflow-hidden">
                  <h4 className="font-bold text-gray-800 text-sm truncate">{std.filename}</h4>
                  <p className="text-xs text-gray-500 capitalize">{std.folder.replace('_', ' ')}</p>
                </div>
              </div>
            ))}
            {standards.length === 0 && <p className="text-gray-500 text-sm text-center mt-4">No standards found.</p>}
          </div>
        )}

        {/* Detail/Edit View */}
        <div className={`bg-white border border-border-light rounded-xl shadow-sm p-6 flex flex-col ${isEditing ? 'w-full' : 'w-2/3'}`}>
          {isEditing ? (
            <div className="flex flex-col h-full">
              <div className="flex gap-4 mb-4">
                <div className="flex-1">
                  <label className="block text-xs font-bold text-gray-500 mb-1">Filename</label>
                  <input type="text" value={editForm.filename} onChange={e => setEditForm({...editForm, filename: e.target.value})} className="w-full border rounded p-2 text-sm" placeholder="e.g. error_topic_rules.md" />
                </div>
                <div className="flex-1">
                  <label className="block text-xs font-bold text-gray-500 mb-1">Folder</label>
                  <select value={editForm.folder} onChange={e => setEditForm({...editForm, folder: e.target.value})} className="w-full border rounded p-2 text-sm">
                    <option value="standards">Standards</option>
                    <option value="sample_scripts">Sample Scripts</option>
                  </select>
                </div>
              </div>
              <div className="flex-1 mb-4 flex flex-col">
                <label className="block text-xs font-bold text-gray-500 mb-1">Markdown Content</label>
                <textarea value={editForm.content} onChange={e => setEditForm({...editForm, content: e.target.value})} className="flex-1 w-full border rounded p-4 font-mono text-sm resize-none" />
              </div>
              <div className="flex justify-end gap-3">
                <button onClick={() => setIsEditing(false)} className="px-4 py-2 border rounded-lg text-sm font-bold text-gray-600 hover:bg-gray-50">Cancel</button>
                <button onClick={handleSave} className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-bold hover:bg-green-700">Save Standard</button>
              </div>
            </div>
          ) : selectedStandard ? (
            <div className="flex flex-col h-full overflow-hidden">
              <div className="flex justify-between items-center mb-6 pb-4 border-b">
                <div>
                  <h2 className="text-xl font-bold text-gray-800">{selectedStandard.filename}</h2>
                  <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">{selectedStandard.folder}</span>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => openEdit(selectedStandard)} className="px-3 py-1.5 border border-gray-300 rounded text-sm font-bold text-gray-700 hover:bg-gray-50 transition-colors">Edit</button>
                  <button onClick={() => handleDelete(selectedStandard.id)} className="p-1.5 border border-red-200 bg-red-50 text-red-600 rounded hover:bg-red-100 transition-colors">
                    <TrashIcon className="w-5 h-5" />
                  </button>
                </div>
              </div>
              <div className="flex-1 overflow-y-auto prose prose-sm max-w-none prose-headings:font-bold">
                <pre className="bg-gray-50 p-4 rounded-lg font-mono text-sm whitespace-pre-wrap text-gray-700 border border-gray-100">{selectedStandard.content}</pre>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-gray-400">
              <DocumentTextIcon className="w-16 h-16 mb-4 opacity-50" />
              <p>Select a standard to view or edit</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
