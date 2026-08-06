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
      const response = await apiLogin({ email, password });
      if (response.success) {
        setUser(response.user);
        localStorage.setItem('agent22_user', JSON.stringify(response.user));
        return { success: true };
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
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
