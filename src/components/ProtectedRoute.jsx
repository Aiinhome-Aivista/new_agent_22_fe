import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute({ allowedRoles }) {
    const { user } = useAuth();
    
    if (!user) {
        return <Navigate to="/login" replace />;
    }
    
    // Convert old ID logic (if any) to string role checks
    const roleId = user.role || user.id;
    
    if (allowedRoles && !allowedRoles.includes(roleId)) {
        // Unauthorised user trying to access protected route
        return <Navigate to={user.dashboard || "/"} replace />;
    }
    
    return <Outlet />;
}
