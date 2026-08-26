import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useProject } from '../context/ProjectContext';
import { 
  ArrowLeftIcon, 
  QueueListIcon, 
  UserIcon, 
  ArrowLeftOnRectangleIcon 
} from '@heroicons/react/24/outline';

import * as Icons from '@heroicons/react/24/outline';

export default function Sidebar() {
  const { user, logout } = useAuth();
  const { currentTrack, selectTrack, selectProject } = useProject();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  const role = user?.role?.toLowerCase() || 'developer';
  const isArchitect = role.includes('architect');
  const isTechLead = role.includes('tech') || role.includes('lead');

  // Minimal Directory View Menu (Shared by ALL personas when no track is active)
  const directoryMenu = [
    { name: 'Dashboard', path: '/dashboard-overview', icon: 'ChartBarIcon' },
    { name: 'Projects', path: '/projects', icon: 'FolderIcon' }
  ];

  // Architect Track Scoped Menu
  const architectTrackMenu = [
    { name: 'Dashboard', path: '/architect/dashboard', icon: 'ChartBarIcon' },
    { name: 'Blueprint Reviews', path: '/review/blueprint', icon: 'RectangleGroupIcon' },
    { name: 'Architecture Standards', path: '/standards', icon: 'DocumentCheckIcon' },
    { name: 'Pending Approvals', path: '/review/queue', icon: 'ClipboardDocumentCheckIcon' },
    { name: 'Advisor Chat', path: '/chat', icon: 'ChatBubbleLeftIcon' }
  ];

  // Tech Lead Track Scoped Menu
  const techLeadTrackMenu = [
    { name: 'Dashboard', path: '/techlead/dashboard', icon: 'ChartBarIcon' },
    { name: 'Validation Severity Queue', path: '/techlead/validations', icon: 'ShieldCheckIcon' },
    { name: 'Code Reviews & Approvals', path: '/techlead/reviews', icon: 'ClipboardDocumentCheckIcon' },
    { name: 'Validation Reports', path: '/techlead/reports', icon: 'DocumentTextIcon' },
    { name: 'Advisor Chat', path: '/chat', icon: 'ChatBubbleLeftIcon' }
  ];

  // Developer Track Scoped Menu
  const developerTrackMenu = [
    { name: 'Dashboard', path: '/developer/dashboard', icon: 'ChartBarIcon' },
    { name: 'New Request (Intake)', path: '/request/new', icon: 'PlusIcon' },
    { name: 'My Requests', path: '/requests', icon: 'FolderIcon' },
    { name: 'Blueprint', path: '/review/blueprint', icon: 'RectangleGroupIcon' },
    { name: 'Generation Progress', path: '/progress', icon: 'CpuChipIcon' },
    { name: 'Validation', path: '/validation', icon: 'ShieldCheckIcon' },
    { name: 'Generated Packages', path: '/packages', icon: 'ArchiveBoxIcon' },
    { name: 'Review', path: '/review/queue', icon: 'ClipboardDocumentCheckIcon' },
    { name: 'Advisor Chat', path: '/chat', icon: 'ChatBubbleLeftIcon' }
  ];

  const isViewingDirectoryPage = location.pathname === '/projects' || location.pathname.startsWith('/projects/') || location.pathname === '/dashboard-overview';
  const showTrackContext = Boolean(currentTrack) && !isViewingDirectoryPage;

  const activeMenu = !showTrackContext 
    ? directoryMenu 
    : isArchitect 
      ? architectTrackMenu 
      : isTechLead 
        ? techLeadTrackMenu 
        : developerTrackMenu;

  // Dynamic User Information
  const displayName = user?.name || user?.username || user?.email?.split('@')[0] || 'User';
  const displayRole = (user?.role || 'ARCHITECT').toUpperCase().replace(/ /g, '_');
  const userInitial = displayName.charAt(0).toUpperCase();

  return (
    <div className="w-72 bg-sidebar text-white flex flex-col shadow-2xl z-20 select-none border-r border-white/5">
      {/* DigiconFX Logo */}
      <div 
        className="p-6 flex items-center justify-between border-b border-white/10 cursor-pointer" 
        onClick={() => { selectProject(null); selectTrack(null, null); navigate('/projects'); }}
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-orange to-button-orange flex items-center justify-center text-white font-bold text-xl shadow-[0_4px_10px_rgba(255,90,20,0.3)]">
            D
          </div>
          <span className="text-2xl font-extrabold tracking-tight">
            Digicon<span className="text-primary-orange">FX</span>
          </span>
        </div>
      </div>

      {/* Active Track Banner in Sidebar */}
      {showTrackContext && (
        <div className="px-4 pt-4 pb-1">
          <div className="p-3 bg-white/5 border border-white/10 rounded-xl">
            <div className="flex justify-between items-center text-[10px] text-gray-400 mb-1">
              <span className="font-bold uppercase tracking-wider text-primary-orange">Active Track</span>
              <button 
                onClick={() => { selectProject(null); selectTrack(null, null); navigate('/projects'); }}
                className="text-gray-300 hover:text-white flex items-center gap-0.5 font-semibold"
              >
                <ArrowLeftIcon className="w-3 h-3" /> Projects
              </button>
            </div>
            <p className="text-xs font-extrabold text-white truncate flex items-center gap-1.5">
              <QueueListIcon className="w-3.5 h-3.5 text-primary-orange flex-shrink-0" />
              {currentTrack.track_name}
            </p>
          </div>
        </div>
      )}
      
      {/* Navigation Menu */}
      <nav className="flex-1 px-4 py-4 space-y-2 overflow-y-auto custom-scrollbar">
        {
          activeMenu.map((item) => {
            const Icon = Icons[item.icon] || Icons.DocumentIcon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={() => {
                  if (item.name === 'Projects' || item.path === '/projects' || item.path === '/dashboard-overview') {
                    selectProject(null);
                    selectTrack(null, null);
                  }
                }}
                className={({ isActive }) => {
                  const currentPath = location.pathname;
                  
                  let isReallyActive = false;

                  if (item.path === '/projects') {
                    isReallyActive = (currentPath === '/projects' || currentPath.startsWith('/projects/'));
                  } else if (item.path === '/dashboard-overview') {
                    isReallyActive = (currentPath === '/dashboard-overview' || currentPath === '/dashboard-under-construction');
                  } else if (item.name === 'Dashboard' || item.path.includes('dashboard')) {
                    isReallyActive = (currentPath === item.path || (currentPath.includes('dashboard') && item.path.includes('dashboard')));
                  } else if (item.path === '/request/new') {
                    isReallyActive = (currentPath === '/request/new');
                  } else if (item.path === '/requests') {
                    isReallyActive = (currentPath === '/requests' || (currentPath.startsWith('/requests/') && !currentPath.includes('/blueprint') && !currentPath.includes('/validation') && !currentPath.includes('/generation') && !currentPath.includes('/package')));
                  } else if (item.path === '/review/blueprint' || item.path === '/blueprint') {
                    isReallyActive = (currentPath === '/blueprint' || currentPath === '/review/blueprint' || currentPath.includes('/blueprint') || currentPath.includes('/patterns'));
                  } else if (item.path === '/progress') {
                    isReallyActive = (currentPath === '/progress' || currentPath.includes('/generation'));
                  } else if (item.path === '/validation') {
                    isReallyActive = (currentPath === '/validation');
                  } else if (item.path === '/techlead/validations') {
                    isReallyActive = (currentPath === '/techlead/validations' || currentPath.startsWith('/techlead/validations/'));
                  } else if (item.path === '/techlead/reports') {
                    isReallyActive = (currentPath === '/techlead/reports' || currentPath.startsWith('/techlead/reports/'));
                  } else if (item.path === '/packages') {
                    isReallyActive = (currentPath === '/packages' || currentPath.includes('/package') || currentPath.includes('/packaging'));
                  } else if (item.path === '/review/queue' || item.path === '/techlead/reviews') {
                    isReallyActive = (currentPath === item.path || (currentPath.includes('/review') && !currentPath.includes('/blueprint')));
                  } else if (item.path === '/standards') {
                    isReallyActive = (currentPath === '/standards' || currentPath.startsWith('/standards/'));
                  } else if (item.path === '/chat') {
                    isReallyActive = (currentPath === '/chat');
                  } else {
                    isReallyActive = (currentPath === item.path || currentPath.startsWith(item.path + '/'));
                  }

                  return `flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium text-sm ${
                    isReallyActive 
                      ? 'bg-primary-orange text-white shadow-[0_4px_12px_rgba(255,90,20,0.4)]' 
                      : 'text-gray-300 hover:bg-white/10 hover:text-white hover:translate-x-1'
                  }`;
                }}
              >
                <Icon className="w-5 h-5" />
                {item.name}
              </NavLink>
            );
          })
        }
      </nav>
      
      {/* Dynamic Footer Profile & Maroon Sign Out Button */}
      <div className="p-4 border-t border-white/10 mt-auto space-y-3 bg-sidebar">
        {/* Dynamic User Profile Card */}
        <div className="p-3 rounded-xl bg-white/5 border border-white/10 flex items-center gap-3 shadow-2xs">
          <div className="w-9 h-9 rounded-xl bg-primary-orange/20 text-primary-orange border border-primary-orange/30 flex items-center justify-center font-bold text-sm">
            {userInitial}
          </div>
          <div className="overflow-hidden">
            <p className="text-xs font-bold text-white truncate">{displayName}</p>
            <p className="text-[9px] font-extrabold uppercase tracking-wider text-gray-400 truncate">
              {displayRole}
            </p>
          </div>
        </div>

        {/* Maroon Sign Out Button */}
        <button 
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-bold text-pink-100 bg-[#6e2c3b] hover:bg-[#853447] border border-pink-500/30 transition-all shadow-md"
        >
          <ArrowLeftOnRectangleIcon className="w-4 h-4" />
          Sign Out
        </button>
      </div>
    </div>
  );
}
