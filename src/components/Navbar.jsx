import { useAuth } from '../context/AuthContext';

export default function Navbar({ title }) {
  const { user } = useAuth();

  return (
    <header className="bg-white border-b border-border-light/60 px-8 py-4 flex items-center justify-between shadow-sm z-10">
      <h1 className="text-2xl font-extrabold text-sidebar tracking-tight">{title}</h1>
      
      <div className="flex items-center gap-6">
        <div className="hidden md:flex items-center gap-4 text-sm font-medium text-text-secondary">
          <span className="bg-input-bg px-4 py-1.5 rounded-full text-primary-orange border border-border-orange/20 shadow-sm flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary-orange opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-primary-orange"></span>
            </span>
            PwC Enterprise
          </span>
        </div>

        {/* Current Session Info */}
        {user && (
          <div className="flex items-center gap-3 pl-6 border-l border-border-light/60">
            <div className="text-right">
              <div className="font-bold text-sm text-sidebar">{user.name}</div>
              <div className="text-[11px] font-semibold text-primary-orange uppercase tracking-wider">{user.role}</div>
            </div>
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-orange to-button-orange flex items-center justify-center text-white font-bold shadow-md">
              {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
