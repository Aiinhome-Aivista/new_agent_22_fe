import { Outlet, Navigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import { useAuth } from '../context/AuthContext';

export default function MainLayout() {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/landing" />;
  }

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <div className="flex-1 overflow-y-auto bg-bg-light relative">
        <Outlet />
      </div>
    </div>
  );
}
