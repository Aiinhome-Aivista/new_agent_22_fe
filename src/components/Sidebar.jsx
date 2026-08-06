import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';



export default function Sidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/landing');
  };

  return (
    <div className="w-64 bg-sidebar text-white flex flex-col">
      <div className="p-6 font-bold text-xl tracking-wider text-primary-orange flex items-center">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 mr-2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 0 0 8.716-6.747M12 21a9.004 9.004 0 0 1-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 0 1 7.843 4.582M12 3a8.997 8.997 0 0 0-7.843 4.582m15.686 0A11.953 11.953 0 0 1 12 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0 1 21 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0 1 12 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 0 1 3 12c0-1.605.42-3.113 1.157-4.418" />
        </svg>
        Agent 22
      </div>
      
      {user && (
        <div className="px-6 py-4 mb-4 bg-black/20 border-l-4 border-primary-orange">
          <div className="text-xs text-gray-400 font-medium uppercase tracking-wider mb-1">Current Role</div>
          <div className="font-bold text-sm truncate">{user.name}</div>
          <div className="text-xs text-gray-300 truncate">{user.role}</div>
        </div>
      )}

      <nav className="flex-1 px-4 space-y-2">
        {user && user.menu && user.menu.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `block px-4 py-2 rounded transition-colors ${
                isActive ? 'bg-primary-orange text-white' : 'hover:bg-hover-orange/20 text-gray-300'
              }`
            }
          >
            {item.name}
          </NavLink>
        ))}
      </nav>
      
      <div className="p-4 mt-auto border-t border-gray-700">
        <button 
          onClick={handleLogout}
          className="w-full text-left px-4 py-2 text-sm text-gray-400 hover:text-white transition-colors"
        >
          Logout
        </button>
      </div>
      
      <div className="p-4 text-xs text-gray-500">
        DigiconFX Kafka API Builder
      </div>
    </div>
  );
}
