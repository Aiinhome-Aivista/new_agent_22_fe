import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProject } from '../context/ProjectContext';
import { 
  ArrowLeftIcon, 
  PlusIcon, 
  TrashIcon, 
  FolderPlusIcon,
  QueueListIcon,
  CheckIcon
} from '@heroicons/react/24/outline';

import Loader from '../components/Loader';

export default function CreateProjectPage() {
  const navigate = useNavigate();
  const { createNewProject } = useProject();

  // Dynamic Dates
  const today = new Date();
  const sixMonthsLater = new Date(today.getFullYear(), today.getMonth() + 6, today.getDate());
  const defaultStartDate = today.toISOString().split('T')[0];
  const defaultEndDate = sixMonthsLater.toISOString().split('T')[0];

  const [projectName, setProjectName] = useState('');
  const [client, setClient] = useState('pwc');
  const [startDate, setStartDate] = useState(defaultStartDate);
  const [endDate, setEndDate] = useState(defaultEndDate);
  const [description, setDescription] = useState('');

  // Clean empty tracks list state
  const [tracks, setTracks] = useState([]);

  const [newTrackName, setNewTrackName] = useState('');
  const [newTrackDesc, setNewTrackDesc] = useState('');
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState('');

  if (creating) return <Loader message="Creating Project & Mapping Tracks..." />;

  const handleAddTrack = () => {
    if (!newTrackName.trim()) return;
    const trackNum = tracks.length + 1;
    const formattedName = newTrackName.startsWith('Track') 
      ? newTrackName 
      : `Track ${trackNum}: ${newTrackName}`;

    setTracks([...tracks, { track_name: formattedName, description: newTrackDesc }]);
    setNewTrackName('');
    setNewTrackDesc('');
  };

  const handleRemoveTrack = (index) => {
    setTracks(tracks.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!projectName.trim()) {
      setError('Project name is required');
      return;
    }
    setCreating(true);
    setError('');

    const payload = {
      name: projectName,
      client,
      start_date: startDate,
      end_date: endDate,
      description,
      status: 'ACTIVE',
      tracks: tracks
    };

    const res = await createNewProject(payload);
    setCreating(false);

    if (res.success) {
      navigate('/projects');
    } else {
      setError(res.message || 'Failed to create project');
    }
  };

  return (
    <div className="max-w-4xl mx-auto animate-fade-in-up py-4">
      {/* Top Header & Back Link */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <button 
            onClick={() => navigate('/projects')}
            className="flex items-center gap-1.5 text-xs font-bold text-text-secondary hover:text-primary-orange transition-colors mb-2"
          >
            <ArrowLeftIcon className="w-4 h-4" />
            Back to Projects Directory
          </button>
          <h1 className="text-2xl font-extrabold text-sidebar tracking-tight flex items-center gap-2.5">
            <FolderPlusIcon className="w-7 h-7 text-primary-orange" />
            Create New Project & Mapped Tracks
          </h1>
          <p className="text-text-secondary text-sm mt-1">
            Define project metadata and configure multiple tracks mapped to this project.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 text-sm p-4 rounded-xl font-medium">
            {error}
          </div>
        )}

        {/* Section 1: Project Details */}
        <div className="bg-white rounded-2xl p-6 border border-border-light/70 shadow-sm space-y-4">
          <h2 className="text-base font-extrabold text-sidebar border-b border-border-light pb-3">
            1. Project Details
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-text-secondary mb-1.5">Project Name *</label>
              <input
                type="text"
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                placeholder="e.g. agent26 or Core Banking Pipeline"
                className="w-full p-3 bg-input-bg border border-border-light rounded-xl text-sm text-text-primary focus:ring-1 focus:ring-primary-orange focus:border-border-orange outline-none transition-all"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-text-secondary mb-1.5">Client / Organization</label>
              <input
                type="text"
                value={client}
                onChange={(e) => setClient(e.target.value)}
                placeholder="pwc"
                className="w-full p-3 bg-input-bg border border-border-light rounded-xl text-sm text-text-primary focus:ring-1 focus:ring-primary-orange focus:border-border-orange outline-none transition-all"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-text-secondary mb-1.5">Start Date</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full p-3 bg-input-bg border border-border-light rounded-xl text-sm text-text-primary focus:ring-1 focus:ring-primary-orange focus:border-border-orange outline-none transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-text-secondary mb-1.5">End Date</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full p-3 bg-input-bg border border-border-light rounded-xl text-sm text-text-primary focus:ring-1 focus:ring-primary-orange focus:border-border-orange outline-none transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-text-secondary mb-1.5">Description (Optional)</label>
            <textarea
              rows="2"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enterprise Kafka integration project overview..."
              className="w-full p-3 bg-input-bg border border-border-light rounded-xl text-sm text-text-primary focus:ring-1 focus:ring-primary-orange focus:border-border-orange outline-none transition-all"
            ></textarea>
          </div>
        </div>

        {/* Section 2: Tracks Configuration */}
        <div className="bg-white rounded-2xl p-6 border border-border-light/70 shadow-sm space-y-4">
          <div className="flex justify-between items-center border-b border-border-light pb-3">
            <h2 className="text-base font-extrabold text-sidebar flex items-center gap-2">
              <QueueListIcon className="w-5 h-5 text-primary-orange" />
              2. Add Tracks to Project ({tracks.length})
            </h2>
            <span className="text-xs text-text-secondary font-medium">Multiple tracks can be mapped</span>
          </div>

          {/* Add Track Input Box */}
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
            <h3 className="text-xs font-bold text-sidebar uppercase tracking-wider">Add New Track</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <input
                type="text"
                value={newTrackName}
                onChange={(e) => setNewTrackName(e.target.value)}
                placeholder="Track Name (e.g. Payments Ingestion Track)"
                className="p-2.5 bg-white border border-border-light rounded-xl text-xs text-text-primary focus:ring-1 focus:ring-primary-orange outline-none"
              />
              <input
                type="text"
                value={newTrackDesc}
                onChange={(e) => setNewTrackDesc(e.target.value)}
                placeholder="Description / Pipeline purpose"
                className="p-2.5 bg-white border border-border-light rounded-xl text-xs text-text-primary focus:ring-1 focus:ring-primary-orange outline-none"
              />
            </div>
            <button
              type="button"
              onClick={handleAddTrack}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 transition-all"
            >
              <PlusIcon className="w-4 h-4 stroke-[3]" />
              Add Track to List
            </button>
          </div>

          {/* Added Tracks List */}
          <div className="space-y-2.5 pt-2">
            {tracks.length === 0 ? (
              <p className="text-xs text-text-secondary italic text-center py-4">No tracks added yet. Enter track name above and click "+ Add Track to List".</p>
            ) : (
              tracks.map((t, idx) => (
                <div key={idx} className="p-3.5 bg-white border border-border-light rounded-xl flex items-center justify-between hover:border-border-orange/50 transition-all shadow-2xs">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-orange-50 text-primary-orange border border-orange-200 flex items-center justify-center font-extrabold text-xs">
                      T{idx + 1}
                    </div>
                    <div>
                      <p className="text-xs font-bold text-sidebar">{t.track_name}</p>
                      <p className="text-[11px] text-text-secondary">{t.description || 'No description provided'}</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveTrack(idx)}
                    className="p-1.5 text-placeholder hover:text-red-500 transition-colors"
                    title="Remove Track"
                  >
                    <TrashIcon className="w-4 h-4" />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Submit Actions */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={() => navigate('/projects')}
            className="px-5 py-2.5 bg-white hover:bg-slate-50 border border-border-light text-text-secondary text-xs font-bold rounded-xl transition-all"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={creating}
            className="px-6 py-2.5 bg-button-orange hover:bg-hover-orange text-white text-xs font-extrabold rounded-xl shadow-md shadow-orange-500/20 transition-all disabled:opacity-50 flex items-center gap-2"
          >
            <CheckIcon className="w-4 h-4 stroke-[3]" />
            {creating ? 'Creating Project & Tracks...' : 'Create Project & Tracks'}
          </button>
        </div>
      </form>
    </div>
  );
}
