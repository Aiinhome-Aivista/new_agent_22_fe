import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

import * as Icons from '@heroicons/react/24/outline';

export default function Sidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  return (
    <div className="w-72 bg-sidebar text-white flex flex-col shadow-2xl z-20">
      <div className="p-6 flex items-center gap-3 border-b border-white/10 cursor-pointer" onClick={() => navigate('/')}>
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-orange to-button-orange flex items-center justify-center text-white font-bold text-xl shadow-[0_4px_10px_rgba(255,90,20,0.3)]">
          D
        </div>
        <span className="text-2xl font-extrabold tracking-tight">
          Digicon<span className="text-primary-orange">FX</span>
        </span>
      </div>
      
      <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto custom-scrollbar">
        {user && user.menu && user.menu.map((item) => {
          const Icon = Icons[item.icon] || Icons.DocumentIcon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              replace
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium text-sm ${
                  isActive 
                    ? 'bg-primary-orange text-white shadow-[0_4px_12px_rgba(255,90,20,0.4)]' 
                    : 'text-gray-300 hover:bg-white/10 hover:text-white hover:translate-x-1'
                }`
              }
            >
              <Icon className="w-5 h-5" />
              {item.name}
            </NavLink>
          );
        })}
      </nav>
      
      <div className="p-4 border-t border-white/10 mt-auto">
        <button 
          onClick={handleLogout}
          className="flex items-center justify-center gap-2 w-full px-4 py-3 rounded-xl text-sm font-bold text-gray-300 hover:text-white hover:bg-white/10 transition-all group"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 group-hover:-translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          Sign Out
        </button>
      </div>
    </div>
  );
}
