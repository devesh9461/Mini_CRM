import { createContext, useContext, useState, useEffect } from 'react';
import API from '../api/axios';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for existing token on mount
    const token = localStorage.getItem('crm_token');
    const savedAdmin = localStorage.getItem('crm_admin');

    if (token && savedAdmin) {
      try {
        setAdmin(JSON.parse(savedAdmin));
      } catch {
        logout();
      }
    }
    setLoading(false);
  }, []);

  const login = async (username, password) => {
    const response = await API.post('/auth/login', { username, password });
    const { access_token, admin: adminData } = response.data;
    localStorage.setItem('crm_token', access_token);
    localStorage.setItem('crm_admin', JSON.stringify(adminData));
    setAdmin(adminData);
    return adminData;
  };

  const register = async (username, email, password) => {
    const response = await API.post('/auth/register', { username, email, password });
    const { access_token, admin: adminData } = response.data;
    localStorage.setItem('crm_token', access_token);
    localStorage.setItem('crm_admin', JSON.stringify(adminData));
    setAdmin(adminData);
    return adminData;
  };

  const logout = () => {
    localStorage.removeItem('crm_token');
    localStorage.removeItem('crm_admin');
    setAdmin(null);
  };

  return (
    <AuthContext.Provider value={{ admin, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
