import { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { 
  getProjects, 
  createProject as apiCreateProject, 
  updateProject as apiUpdateProject, 
  deleteProject as apiDeleteProject,
  updateTrack as apiUpdateTrack,
  deleteTrack as apiDeleteTrack
} from '../api/api';

const ProjectContext = createContext();

export const ProjectProvider = ({ children }) => {
  const { user } = useAuth();
  const [projects, setProjects] = useState([]);
  const [currentProject, setCurrentProject] = useState(() => {
    const saved = localStorage.getItem('agent22_active_project');
    return saved ? JSON.parse(saved) : null;
  });
  const [currentTrack, setCurrentTrack] = useState(() => {
    const saved = localStorage.getItem('agent22_active_track');
    return saved ? JSON.parse(saved) : null;
  });

  // Reset track/project selection when user logs out or switches
  useEffect(() => {
    if (!user) {
      setCurrentProject(null);
      setCurrentTrack(null);
      localStorage.removeItem('agent22_active_project');
      localStorage.removeItem('agent22_active_track');
      localStorage.removeItem('lastGenerationRequestId');
    }
  }, [user]);
  
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All Status');

  const fetchProjects = async (params = {}) => {
    setLoading(true);
    try {
      const queryParams = {
        search: params.search !== undefined ? params.search : searchQuery,
        status: params.status !== undefined ? params.status : statusFilter
      };
      const res = await getProjects(queryParams);
      if (res && res.success) {
        setProjects(res.data || []);
        if (currentProject) {
          const updated = res.data.find(p => p.id === currentProject.id);
          if (updated) {
            setCurrentProject(updated);
            localStorage.setItem('agent22_active_project', JSON.stringify(updated));
            if (currentTrack && updated.tracks) {
              const updatedTrack = updated.tracks.find(t => t.id === currentTrack.id);
              if (updatedTrack) {
                setCurrentTrack(updatedTrack);
                localStorage.setItem('agent22_active_track', JSON.stringify(updatedTrack));
              }
            }
          }
        }
      }
    } catch (err) {
      console.error("Failed to fetch projects:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, [searchQuery, statusFilter]);

  const selectProject = (project) => {
    setCurrentProject(project);
    if (project) {
      localStorage.setItem('agent22_active_project', JSON.stringify(project));
    } else {
      localStorage.removeItem('agent22_active_project');
      setCurrentTrack(null);
      localStorage.removeItem('agent22_active_track');
    }
  };

  const selectTrack = (track, project = null) => {
    if (project) {
      setCurrentProject(project);
      localStorage.setItem('agent22_active_project', JSON.stringify(project));
    }
    setCurrentTrack(track);
    if (track) {
      localStorage.setItem('agent22_active_track', JSON.stringify(track));
    } else {
      localStorage.removeItem('agent22_active_track');
    }
  };

  const createNewProject = async (projectData) => {
    try {
      const res = await apiCreateProject(projectData);
      if (res && res.success) {
        await fetchProjects();
        return { success: true, data: res.data };
      }
      return { success: false, message: res.message || 'Failed to create project' };
    } catch (err) {
      return { success: false, message: err.response?.data?.message || 'Error creating project' };
    }
  };

  const editProject = async (projectId, projectData) => {
    try {
      const res = await apiUpdateProject(projectId, projectData);
      if (res && res.success) {
        await fetchProjects();
        return { success: true, data: res.data };
      }
      return { success: false, message: res.message || 'Failed to update project' };
    } catch (err) {
      return { success: false, message: err.response?.data?.message || 'Error updating project' };
    }
  };

  const deleteExistingProject = async (projectId) => {
    try {
      const res = await apiDeleteProject(projectId);
      if (res && res.success) {
        if (currentProject && currentProject.id === projectId) {
          selectProject(null);
        }
        await fetchProjects();
        return { success: true };
      }
      return { success: false, message: res.message || 'Failed to delete project' };
    } catch (err) {
      return { success: false, message: err.response?.data?.message || 'Error deleting project' };
    }
  };

  const editTrack = async (trackId, trackData) => {
    try {
      const res = await apiUpdateTrack(trackId, trackData);
      if (res && res.success) {
        await fetchProjects();
        return { success: true };
      }
      return { success: false, message: res.message || 'Failed to update track' };
    } catch (err) {
      return { success: false, message: err.response?.data?.message || 'Error updating track' };
    }
  };

  const deleteTrackItem = async (trackId) => {
    try {
      const res = await apiDeleteTrack(trackId);
      if (res && res.success) {
        if (currentTrack && currentTrack.id === trackId) {
          selectTrack(null, currentProject);
        }
        await fetchProjects();
        return { success: true };
      }
      return { success: false, message: res.message || 'Failed to delete track' };
    } catch (err) {
      return { success: false, message: err.response?.data?.message || 'Error deleting track' };
    }
  };

  const toggleProjectStatus = async (projectId, currentStatus) => {
    try {
      const newStatus = currentStatus === 'ACTIVE' ? 'CLOSED' : 'ACTIVE';
      const res = await apiUpdateProject(projectId, { status: newStatus });
      if (res && res.success) {
        await fetchProjects();
      }
    } catch (err) {
      console.error("Error toggling project status:", err);
    }
  };

  return (
    <ProjectContext.Provider value={{
      projects,
      currentProject,
      currentTrack,
      selectProject,
      selectTrack,
      fetchProjects,
      createNewProject,
      editProject,
      deleteExistingProject,
      editTrack,
      deleteTrackItem,
      toggleProjectStatus,
      loading,
      searchQuery,
      setSearchQuery,
      statusFilter,
      setStatusFilter
    }}>
      {children}
    </ProjectContext.Provider>
  );
};

export const useProject = () => useContext(ProjectContext);
