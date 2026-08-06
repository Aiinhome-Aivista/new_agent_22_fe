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
      <div className="p-6 font-bold text-xl tracking-wider text-primary-orange">
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
