import { createContext, useContext, useState, useEffect } from 'react';
import { loginUser as apiLogin } from '../api/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('agent22_user');
    return saved ? JSON.parse(saved) : null;
  });

  const login = async (email, password) => {
    try {
      // Clear previous active session data on new login
      localStorage.removeItem('agent22_active_project');
      localStorage.removeItem('agent22_active_track');
      localStorage.removeItem('lastGenerationRequestId');

      const response = await apiLogin({ email, password });
      if (response.success) {
        const userData = {
            ...response.user,
            session_id: response.session_id,
            role: response.role,
            permissions: response.permissions,
            dashboard: response.dashboard,
            menu: response.menu
        };
        setUser(userData);
        localStorage.setItem('agent22_user', JSON.stringify(userData));
        return { success: true, dashboard: userData.dashboard };
      }
      return { success: false, message: 'Login failed' };
    } catch (error) {
      return { 
        success: false, 
        message: error.response?.data?.message || 'An error occurred during login' 
      };
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('agent22_user');
    localStorage.removeItem('agent22_active_project');
    localStorage.removeItem('agent22_active_track');
    localStorage.removeItem('lastGenerationRequestId');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
