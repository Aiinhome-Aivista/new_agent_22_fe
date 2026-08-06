import { Outlet, Navigate, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import Navbar from './Navbar';
import { useAuth } from '../context/AuthContext';

export default function MainLayout() {
  const { user } = useAuth();
  const location = useLocation();

  if (!user) {
    return <Navigate to="/landing" />;
  }

  // Derive a simple title from the pathname
  const path = location.pathname.split('/')[1];
  const title = path ? path.charAt(0).toUpperCase() + path.slice(1).replace('-', ' ') : 'Dashboard';

  return (
    <div className="flex h-screen overflow-hidden bg-bg-light font-sans">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden relative">
        <Navbar title={title} />
        <main className="flex-1 overflow-y-auto p-6 lg:p-8 bg-input-bg/30 relative">
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
        {/* Footer */}
        <footer className="py-4 px-6 border-t border-border-light/50 text-center text-sm font-medium text-placeholder bg-white z-10">
          &copy; {new Date().getFullYear()} DigiconFX Agent 22. All rights reserved.
        </footer>
      </div>
    </div>
  );
}
