import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProject } from '../context/ProjectContext';
import { useAuth } from '../context/AuthContext';
import { 
  MagnifyingGlassIcon, 
  PlusIcon, 
  FolderIcon,
  ArrowLeftIcon,
  QueueListIcon,
  ChevronRightIcon,
  PencilSquareIcon,
  TrashIcon
} from '@heroicons/react/24/outline';

export default function ProjectsDirectoryPage({ onOpenTrackDashboard }) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const role = user?.role?.toLowerCase() || 'developer';
  const isArchitect = role === 'solution architect' || role === 'architect';
  const isTechLead = role === 'tech lead' || role === 'techlead';

  const { 
    projects, 
    currentProject,
    selectProject, 
    selectTrack,
    toggleProjectStatus,
    deleteExistingProject,
    deleteTrackItem,
    loading,
    searchQuery,
    setSearchQuery,
    statusFilter,
    setStatusFilter
  } = useProject();

  // Expanded project to view its tracks sub-cards (defaults to currentProject?.id for browser back navigation)
  const [expandedProjectId, setExpandedProjectId] = useState(currentProject?.id || null);

  useEffect(() => {
    if (!currentProject) {
      setExpandedProjectId(null);
    } else {
      setExpandedProjectId(currentProject.id);
    }
  }, [currentProject]);

  const handleOpenTrack = (track, project) => {
    selectTrack(track, project);
    if (onOpenTrackDashboard) {
      onOpenTrackDashboard(track, project);
    } else {
      if (isArchitect) {
        navigate('/architect/dashboard');
      } else if (isTechLead) {
        navigate('/techlead/dashboard');
      } else {
        navigate('/developer/dashboard');
      }
    }
  };

  const handleEditProjectClick = (e, projectId) => {
    if (e) e.stopPropagation();
    navigate(`/projects/edit/${projectId}`);
  };

  const handleDeleteProject = async (e, projectId, projectName) => {
    if (e) e.stopPropagation();
    if (window.confirm(`Are you sure you want to delete project "${projectName}"? This action cannot be undone.`)) {
      await deleteExistingProject(projectId);
    }
  };

  const handleEditTrackClick = (e, trackId) => {
    if (e) e.stopPropagation();
    navigate(`/tracks/edit/${trackId}`);
  };

  const handleDeleteTrack = async (e, trackId, trackName) => {
    if (e) e.stopPropagation();
    if (window.confirm(`Are you sure you want to delete track "${trackName}"?`)) {
      await deleteTrackItem(trackId);
    }
  };

  const expandedProject = projects.find(p => p.id === expandedProjectId);

  return (
    <div className="animate-fade-in-up">
      
      {/* View Mode 1: Track Cards View (When a Project Card is Selected) */}
      {expandedProject ? (
        <div>
          {/* Header & Back Link */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <div>
              <button 
                onClick={() => {
                  selectProject(null);
                  setExpandedProjectId(null);
                }}
                className="flex items-center gap-1.5 text-xs font-bold text-text-secondary hover:text-primary-orange transition-colors mb-2"
              >
                <ArrowLeftIcon className="w-4 h-4" />
                Back to Projects Directory
              </button>
              <h1 className="text-2xl font-extrabold text-sidebar tracking-tight flex items-center gap-2.5">
                <FolderIcon className="w-7 h-7 text-primary-orange" />
                {expandedProject.name} — Tracks Directory
              </h1>
              <p className="text-text-secondary text-sm mt-1">
                Select a track under <span className="font-bold text-sidebar">{expandedProject.name}</span> to open its architecture dashboard.
              </p>
            </div>
            
            <div className="flex items-center gap-3">
              <span className="px-3 py-1 bg-amber-50 text-amber-700 border border-amber-200 rounded-full text-xs font-extrabold">
                {expandedProject.tracks ? expandedProject.tracks.length : 0} Tracks Mapped
              </span>

              {/* Architect Only Edit/Delete in Expanded Track Header */}
              {isArchitect && (
                <div className="flex items-center gap-2">
                  <button
                    onClick={(e) => handleEditProjectClick(e, expandedProject.id)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-sidebar rounded-xl text-xs font-bold transition-all border border-slate-200"
                  >
                    <PencilSquareIcon className="w-3.5 h-3.5 text-primary-orange" />
                    Edit Project & Tracks
                  </button>
                  <button
                    onClick={(e) => handleDeleteProject(e, expandedProject.id, expandedProject.name)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl text-xs font-bold transition-all border border-red-200"
                  >
                    <TrashIcon className="w-3.5 h-3.5" />
                    Delete Project
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Track Sub-Cards Grid */}
          {(!expandedProject.tracks || expandedProject.tracks.length === 0) ? (
            <div className="bg-white rounded-2xl border border-border-light p-12 text-center shadow-sm">
              <p className="text-text-secondary text-sm font-medium">No tracks currently mapped to this project.</p>
              {isArchitect && (
                <button
                  onClick={(e) => handleEditProjectClick(e, expandedProject.id)}
                  className="mt-3 text-xs font-bold text-primary-orange hover:underline"
                >
                  + Add Track to Project
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {expandedProject.tracks.map((track, idx) => (
                <div 
                  key={track.id || idx}
                  className="bg-white rounded-2xl p-5 border border-border-light/70 shadow-sm hover:shadow-md hover:border-border-orange/50 transition-all flex flex-col justify-between group relative"
                >
                  <div>
                    {/* Top Row: Track Badge, Status & Architect Controls */}
                    <div className="flex justify-between items-center mb-3">
                      <span className="px-2.5 py-0.5 bg-orange-50 text-primary-orange border border-orange-200 rounded-full text-[10px] font-extrabold uppercase">
                        TRACK {idx + 1}
                      </span>

                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full text-[10px] font-bold">
                          {track.status || 'ACTIVE'}
                        </span>

                        {/* Solution Architect Track Edit & Delete Controls */}
                        {isArchitect && track.id && (
                          <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                            <button
                              onClick={(e) => handleEditTrackClick(e, track.id)}
                              title="Edit Track Details (Architect Only)"
                              className="p-1 text-text-secondary hover:text-primary-orange hover:bg-orange-50 rounded-lg transition-colors"
                            >
                              <PencilSquareIcon className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={(e) => handleDeleteTrack(e, track.id, track.track_name)}
                              title="Delete Track (Architect Only)"
                              className="p-1 text-text-secondary hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            >
                              <TrashIcon className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Track Title */}
                    <h3 className="text-base font-extrabold text-sidebar group-hover:text-primary-orange transition-colors mb-2">
                      {track.track_name}
                    </h3>
                    <p className="text-xs text-text-secondary line-clamp-2 mb-6">
                      {track.description || 'Kafka message processing and event pipeline'}
                    </p>
                  </div>

                  {/* Track Footer: Open Dashboard Action */}
                  <div className="border-t border-border-light/60 pt-4 mt-auto flex items-center justify-between">
                    <span className="text-[11px] font-mono text-placeholder">Mapped to {expandedProject.name}</span>
                    <button
                      onClick={() => handleOpenTrack(track, expandedProject)}
                      className="text-xs font-extrabold text-primary-orange hover:text-hover-orange transition-colors flex items-center gap-1 group/btn"
                    >
                      Open Dashboard 
                      <span className="group-hover/btn:translate-x-1 transition-transform">&rarr;</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        /* View Mode 2: All Projects Directory Grid */
        <div>
          {/* Top Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
            <div>
              <h1 className="text-2xl font-extrabold text-sidebar tracking-tight flex items-center gap-2">
                <FolderIcon className="w-7 h-7 text-primary-orange" />
                Projects Directory
              </h1>
              <p className="text-text-secondary text-sm mt-1">
                Select a project card to view its mapped tracks or manage project details.
              </p>
            </div>
            
            {/* Create Project Button (Architect Only) */}
            {isArchitect && (
              <button
                onClick={() => navigate('/projects/create')}
                className="inline-flex items-center justify-center gap-2 bg-button-orange hover:bg-hover-orange text-white px-5 py-2.5 rounded-xl font-bold text-sm shadow-md shadow-orange-500/20 transition-all hover:-translate-y-0.5"
              >
                <PlusIcon className="w-4 h-4 stroke-[3]" />
                Create Project
              </button>
            )}
          </div>

          {/* Search & Filter Bar */}
          <div className="bg-white p-4 rounded-2xl border border-border-light/60 shadow-sm mb-8 flex flex-col md:flex-row gap-4 justify-between items-stretch md:items-center">
            {/* Search Input */}
            <div className="relative flex-1 max-w-md">
              <MagnifyingGlassIcon className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-placeholder" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search projects by name..."
                className="w-full pl-10 pr-4 py-2 bg-input-bg border border-border-light rounded-xl text-sm text-text-primary placeholder:text-placeholder focus:ring-1 focus:ring-primary-orange focus:border-border-orange outline-none transition-all"
              />
            </div>

            {/* Status Filters */}
            <div className="flex items-center p-1 bg-input-bg rounded-xl border border-border-light self-start md:self-auto">
              {['All Status', 'Active', 'Closed'].map((s) => {
                const isActive = statusFilter === s;
                return (
                  <button
                    key={s}
                    onClick={() => setStatusFilter(s)}
                    className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
                      isActive 
                        ? 'bg-white text-primary-orange shadow-sm border border-border-orange/40' 
                        : 'text-text-secondary hover:text-text-primary'
                    }`}
                  >
                    {s}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Projects Cards Grid */}
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="h-44 bg-white rounded-2xl border border-border-light shadow-sm"></div>
              ))}
            </div>
          ) : projects.length === 0 ? (
            <div className="bg-white rounded-2xl border border-border-light p-12 text-center shadow-sm">
              <p className="text-text-secondary text-base font-medium">No projects created yet.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {projects.map((project) => {
                const isClosed = project.status === 'CLOSED';
                const trackCount = project.tracks ? project.tracks.length : 0;

                return (
                  <div 
                    key={project.id}
                    onClick={() => setExpandedProjectId(project.id)}
                    className="bg-white rounded-2xl p-6 border border-border-light/70 shadow-sm hover:shadow-md hover:border-border-orange/50 transition-all flex flex-col justify-between group cursor-pointer relative"
                  >
                    {/* Top Info Section */}
                    <div>
                      <div className="flex justify-between items-start mb-1">
                        <h3 className="text-xl font-extrabold text-sidebar group-hover:text-primary-orange transition-colors">
                          {project.name}
                        </h3>

                        {/* Top Right Action Icons (Edit & Delete - Architect Only) */}
                        <div className="flex items-center gap-1.5">
                          <span className="px-2.5 py-0.5 bg-amber-50 text-amber-700 border border-amber-200 rounded-full text-[11px] font-extrabold flex items-center gap-1">
                            <QueueListIcon className="w-3.5 h-3.5 text-amber-600" />
                            {trackCount} {trackCount === 1 ? 'Track' : 'Tracks'}
                          </span>

                          {isArchitect && (
                            <div className="flex items-center gap-1 ml-1" onClick={(e) => e.stopPropagation()}>
                              <button
                                onClick={(e) => handleEditProjectClick(e, project.id)}
                                title="Edit Project & Tracks (Architect Only)"
                                className="p-1.5 text-text-secondary hover:text-primary-orange hover:bg-orange-50 rounded-lg transition-colors"
                              >
                                <PencilSquareIcon className="w-4 h-4" />
                              </button>
                              <button
                                onClick={(e) => handleDeleteProject(e, project.id, project.name)}
                                title="Delete Project (Architect Only)"
                                className="p-1.5 text-text-secondary hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              >
                                <TrashIcon className="w-4 h-4" />
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                      <p className="text-xs font-semibold text-text-secondary mb-4">{project.client || 'pwc'}</p>

                      {/* Dates */}
                      <div className="text-xs text-text-secondary space-y-1.5 mb-6 bg-slate-50 border border-slate-100 p-3 rounded-xl">
                        <div className="flex justify-between">
                          <span className="font-medium text-text-secondary">Start Date:</span>
                          <span className="font-mono text-sidebar font-bold">{project.start_date || '2026-07-01'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="font-medium text-text-secondary">End Date:</span>
                          <span className="font-mono text-sidebar font-bold">{project.end_date || '2027-02-27'}</span>
                        </div>
                      </div>
                    </div>

                    {/* Footer Action Bar */}
                    <div className="flex items-center justify-between border-t border-border-light/60 pt-4 mt-auto">
                      <span className={`px-3 py-0.5 rounded-full text-[11px] font-extrabold uppercase border ${
                        isClosed
                          ? 'bg-gray-100 text-gray-600 border-gray-300'
                          : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      }`}>
                        {project.status || 'ACTIVE'}
                      </span>

                      {/* Activate/Close Status Toggle (Architect Only) */}
                      {isArchitect ? (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleProjectStatus(project.id, project.status);
                          }}
                          className="text-xs font-bold text-text-secondary hover:text-sidebar transition-colors"
                        >
                          {isClosed ? 'ACTIVATE' : 'CLOSE'}
                        </button>
                      ) : null}

                      <button
                        onClick={() => {
                          selectProject(project);
                          setExpandedProjectId(project.id);
                        }}
                        className="text-xs font-extrabold text-primary-orange hover:text-hover-orange transition-colors flex items-center gap-1 group/btn"
                      >
                        View Tracks ({trackCount})
                        <ChevronRightIcon className="w-3.5 h-3.5 group-hover/btn:translate-x-1 transition-transform" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

    </div>
  );
}
