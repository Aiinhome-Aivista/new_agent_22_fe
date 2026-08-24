import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useProject } from '../context/ProjectContext';
import Loader from '../components/Loader';
import { 
  ArrowLeftIcon, 
  PencilSquareIcon,
  QueueListIcon,
  CheckIcon
} from '@heroicons/react/24/outline';

export default function EditTrackPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { projects, editTrack } = useProject();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const [trackName, setTrackName] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState('ACTIVE');
  const [parentProject, setParentProject] = useState(null);

  useEffect(() => {
    let foundTrack = null;
    let foundProj = null;

    for (const p of projects) {
      if (p.tracks) {
        const t = p.tracks.find(tr => tr.id === parseInt(id));
        if (t) {
          foundTrack = t;
          foundProj = p;
          break;
        }
      }
    }

    if (foundTrack) {
      setTrackName(foundTrack.track_name || '');
      setDescription(foundTrack.description || '');
      setStatus(foundTrack.status || 'ACTIVE');
      setParentProject(foundProj);
      setLoading(false);
    } else if (projects.length > 0) {
      setError('Track not found');
      setLoading(false);
    }
  }, [id, projects]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!trackName.trim()) {
      setError('Track name is required');
      return;
    }

    setSaving(true);
    setError('');

    const payload = {
      track_name: trackName,
      description,
      status
    };

    const res = await editTrack(id, payload);
    setSaving(false);

    if (res.success) {
      navigate('/projects');
    } else {
      setError(res.message || 'Failed to update track');
    }
  };

  if (loading || saving) return <Loader message={saving ? "Saving Track Changes..." : "Loading..."} />;

  return (
    <div className="max-w-3xl mx-auto animate-fade-in-up pb-12">
      
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
            Edit Track Details
          </h1>
          {parentProject && (
            <p className="text-text-secondary text-sm mt-1">
              Editing Track under parent project <span className="font-bold text-sidebar">{parentProject.name}</span>
            </p>
          )}
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 text-sm font-semibold rounded-2xl">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        
        <div className="bg-white rounded-3xl p-6 border border-border-light shadow-sm space-y-5">
          <h2 className="text-base font-extrabold text-sidebar border-b border-border-light/60 pb-3 flex items-center gap-2">
            <QueueListIcon className="w-5 h-5 text-primary-orange" />
            Track Information
          </h2>

          {/* Track Name */}
          <div>
            <label className="block text-xs font-bold text-sidebar uppercase tracking-wider mb-1.5">
              Track Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={trackName}
              onChange={(e) => setTrackName(e.target.value)}
              placeholder="e.g. Track 1: Agentic AI & Intelligent Automation"
              required
              className="w-full px-4 py-2.5 bg-input-bg border border-border-light rounded-xl text-sm font-bold text-text-primary focus:ring-1 focus:ring-primary-orange outline-none"
            />
          </div>

          {/* Status */}
          <div>
            <label className="block text-xs font-bold text-sidebar uppercase tracking-wider mb-1.5">
              Track Status
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full px-4 py-2.5 bg-input-bg border border-border-light rounded-xl text-sm font-semibold text-text-primary focus:ring-1 focus:ring-primary-orange outline-none"
            >
              <option value="ACTIVE">ACTIVE</option>
              <option value="CLOSED">CLOSED</option>
            </select>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-bold text-sidebar uppercase tracking-wider mb-1.5">
              Track Description / Scope
            </label>
            <textarea
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe the architectural focus, message pipelines, or automation scope of this track..."
              className="w-full px-4 py-2.5 bg-input-bg border border-border-light rounded-xl text-sm text-text-primary focus:ring-1 focus:ring-primary-orange outline-none"
            />
          </div>
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
            {saving ? 'Saving Track...' : 'Save Track Changes'}
          </button>
        </div>

      </form>

    </div>
  );
}
