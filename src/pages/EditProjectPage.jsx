import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useProject } from '../context/ProjectContext';
import Loader from '../components/Loader';
import { 
  ArrowLeftIcon, 
  TrashIcon, 
  FolderIcon,
  QueueListIcon,
  CheckIcon,
  PencilSquareIcon,
  PlusIcon
} from '@heroicons/react/24/outline';

export default function EditProjectPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { projects, editProject } = useProject();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const [projectName, setProjectName] = useState('');
  const [client, setClient] = useState('pwc');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [status, setStatus] = useState('ACTIVE');
  const [description, setDescription] = useState('');
  const [tracks, setTracks] = useState([]);

  const [newTrackName, setNewTrackName] = useState('');
  const [newTrackDesc, setNewTrackDesc] = useState('');

  useEffect(() => {
    const existing = projects.find(p => p.id === parseInt(id));
    if (existing) {
      setProjectName(existing.name || '');
      setClient(existing.client || 'pwc');
      setStartDate(existing.start_date || '');
      setEndDate(existing.end_date || '');
      setStatus(existing.status || 'ACTIVE');
      setDescription(existing.description || '');
      setTracks(existing.tracks ? existing.tracks.map(t => ({ ...t })) : []);
      setLoading(false);
    } else if (projects.length > 0) {
      setError('Project not found');
      setLoading(false);
    }
  }, [id, projects]);

  const handleAddTrack = () => {
    if (!newTrackName.trim()) return;
    const trackNum = tracks.length + 1;
    const formattedName = newTrackName.startsWith('Track') 
      ? newTrackName 
      : `Track ${trackNum}: ${newTrackName}`;

    setTracks([...tracks, { track_name: formattedName, description: newTrackDesc, status: 'ACTIVE' }]);
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

    setSaving(true);
    setError('');

    const payload = {
      name: projectName,
      client,
      start_date: startDate,
      end_date: endDate,
      status,
      description,
      tracks
    };

    const res = await editProject(id, payload);
    setSaving(false);

    if (res.success) {
      navigate('/projects');
    } else {
      setError(res.message || 'Failed to update project');
    }
  };

  if (loading || saving) return <Loader message={saving ? "Saving Project Changes..." : "Loading..."} />;

  return (
    <div className="max-w-4xl mx-auto animate-fade-in-up pb-12">
      
      {/* Top Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <button 
            onClick={() => navigate('/projects')}
            className="flex items-center gap-1.5 text-xs font-bold text-text-secondary hover:text-primary-orange transition-colors mb-2"
          >
            <ArrowLeftIcon className="w-4 h-4" />
            Back to Projects Directory
          </button>
          <h1 className="text-2xl font-extrabold text-sidebar tracking-tight flex items-center gap-2.5">
            <PencilSquareIcon className="w-7 h-7 text-primary-orange" />
            Edit Project Details
          </h1>
          <p className="text-text-secondary text-sm mt-1">
            Update project metadata, dates, status, and mapped tracks.
          </p>
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 text-sm font-semibold rounded-2xl">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* Card 1: Primary Project Information */}
        <div className="bg-white rounded-3xl p-6 border border-border-light shadow-sm space-y-5">
          <h2 className="text-base font-extrabold text-sidebar border-b border-border-light/60 pb-3 flex items-center gap-2">
            <FolderIcon className="w-5 h-5 text-primary-orange" />
            Basic Information
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Project Name */}
            <div>
              <label className="block text-xs font-bold text-sidebar uppercase tracking-wider mb-1.5">
                Project Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                placeholder="e.g. KTFlow Kafka Microservices"
                required
                className="w-full px-4 py-2.5 bg-input-bg border border-border-light rounded-xl text-sm font-semibold text-text-primary focus:ring-1 focus:ring-primary-orange focus:border-border-orange outline-none transition-all"
              />
            </div>

            {/* Client */}
            <div>
              <label className="block text-xs font-bold text-sidebar uppercase tracking-wider mb-1.5">
                Client / Organization
              </label>
              <input
                type="text"
                value={client}
                onChange={(e) => setClient(e.target.value)}
                placeholder="e.g. pwc"
                className="w-full px-4 py-2.5 bg-input-bg border border-border-light rounded-xl text-sm font-semibold text-text-primary focus:ring-1 focus:ring-primary-orange focus:border-border-orange outline-none transition-all"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* Start Date */}
            <div>
              <label className="block text-xs font-bold text-sidebar uppercase tracking-wider mb-1.5">
                Start Date
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-4 py-2.5 bg-input-bg border border-border-light rounded-xl text-sm font-semibold text-text-primary focus:ring-1 focus:ring-primary-orange focus:border-border-orange outline-none transition-all"
              />
            </div>

            {/* End Date */}
            <div>
              <label className="block text-xs font-bold text-sidebar uppercase tracking-wider mb-1.5">
                End Date
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-4 py-2.5 bg-input-bg border border-border-light rounded-xl text-sm font-semibold text-text-primary focus:ring-1 focus:ring-primary-orange focus:border-border-orange outline-none transition-all"
              />
            </div>

            {/* Status */}
            <div>
              <label className="block text-xs font-bold text-sidebar uppercase tracking-wider mb-1.5">
                Project Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full px-4 py-2.5 bg-input-bg border border-border-light rounded-xl text-sm font-semibold text-text-primary focus:ring-1 focus:ring-primary-orange focus:border-border-orange outline-none transition-all"
              >
                <option value="ACTIVE">ACTIVE</option>
                <option value="CLOSED">CLOSED</option>
              </select>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-bold text-sidebar uppercase tracking-wider mb-1.5">
              Description (Optional)
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe the architectural scope, goals, and technical domain of this project..."
              className="w-full px-4 py-2.5 bg-input-bg border border-border-light rounded-xl text-sm text-text-primary focus:ring-1 focus:ring-primary-orange focus:border-border-orange outline-none transition-all"
            />
          </div>
        </div>

        {/* Card 2: Track Configuration (1 Project -> Many Tracks) */}
        <div className="bg-white rounded-3xl p-6 border border-border-light shadow-sm space-y-5">
          <div className="flex justify-between items-center border-b border-border-light/60 pb-3">
            <div>
              <h2 className="text-base font-extrabold text-sidebar flex items-center gap-2">
                <QueueListIcon className="w-5 h-5 text-primary-orange" />
                Mapped Project Tracks ({tracks.length})
              </h2>
              <p className="text-xs text-text-secondary mt-0.5">
                Manage the tracks associated with this project. Each track has its own scoped Architecture Portal.
              </p>
            </div>
          </div>

          {/* Add Track Input Controls */}
          <div className="bg-slate-50 border border-slate-200/80 p-4 rounded-2xl space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-text-secondary uppercase mb-1">Track Name</label>
                <input
                  type="text"
                  value={newTrackName}
                  onChange={(e) => setNewTrackName(e.target.value)}
                  placeholder="e.g. Agentic AI & Automation"
                  className="w-full px-3.5 py-2 bg-white border border-border-light rounded-xl text-xs font-semibold focus:ring-1 focus:ring-primary-orange outline-none"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-text-secondary uppercase mb-1">Track Scope / Description</label>
                <input
                  type="text"
                  value={newTrackDesc}
                  onChange={(e) => setNewTrackDesc(e.target.value)}
                  placeholder="e.g. AI agent workflows and event queues"
                  className="w-full px-3.5 py-2 bg-white border border-border-light rounded-xl text-xs focus:ring-1 focus:ring-primary-orange outline-none"
                />
              </div>
            </div>

            <button
              type="button"
              onClick={handleAddTrack}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-orange-50 text-primary-orange border border-orange-200 hover:bg-orange-100 rounded-xl text-xs font-bold transition-colors"
            >
              <PlusIcon className="w-4 h-4 stroke-[3]" />
              + Add Track to List
            </button>
          </div>

          {/* Added Tracks List */}
          {tracks.length === 0 ? (
            <p className="text-xs text-text-secondary italic text-center py-4">No tracks currently mapped.</p>
          ) : (
            <div className="space-y-3">
              {tracks.map((t, idx) => (
                <div 
                  key={idx}
                  className="flex items-center justify-between p-4 bg-white border border-border-light rounded-2xl shadow-2xs hover:border-border-orange/40 transition-all"
                >
                  <div className="flex items-start gap-3">
                    <span className="w-6 h-6 rounded-lg bg-orange-50 text-primary-orange border border-orange-200 flex items-center justify-center text-xs font-extrabold flex-shrink-0 mt-0.5">
                      {idx + 1}
                    </span>
                    <div>
                      <h4 className="text-sm font-extrabold text-sidebar">{t.track_name}</h4>
                      {t.description && <p className="text-xs text-text-secondary mt-0.5">{t.description}</p>}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleRemoveTrack(idx)}
                    className="p-1.5 text-text-secondary hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                  >
                    <TrashIcon className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-4 pt-4">
          <button
            type="button"
            onClick={() => navigate('/projects')}
            className="px-6 py-2.5 rounded-xl border border-border-light text-sidebar font-bold text-xs hover:bg-slate-50 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-button-orange hover:bg-hover-orange text-white font-bold text-xs shadow-md shadow-orange-500/20 transition-all"
          >
            <CheckIcon className="w-4 h-4 stroke-[3]" />
            {saving ? 'Saving Changes...' : 'Save Changes'}
          </button>
        </div>

      </form>

    </div>
  );
}
