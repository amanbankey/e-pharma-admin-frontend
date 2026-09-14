import { createContext, useContext, useState, useEffect } from 'react';
import { adminAuthApi } from './api';

const AdminAuthContext = createContext(null);

export function AdminAuthProvider({ children }) {
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    if (!token) {
      setLoading(false);
      return;
    }
    adminAuthApi
      .me()
      .then((data) => setAdmin(data.admin))
      .catch(() => localStorage.removeItem('adminToken'))
      .finally(() => setLoading(false));
  }, []);

  const login = async (email, password, loginAs) => {
    const data = await adminAuthApi.login({ email, password, loginAs });
    localStorage.setItem('adminToken', data.token);
    setAdmin(data.admin);
    return data.admin;
  };

  const logout = () => {
    localStorage.removeItem('adminToken');
    setAdmin(null);
  };

  const can = (section) => admin?.role === 'superadmin' || admin?.permissions?.includes(section);

  return (
    <AdminAuthContext.Provider value={{ admin, loading, login, logout, can }}>
      {children}
    </AdminAuthContext.Provider>
  );
}

export const useAdminAuth = () => useContext(AdminAuthContext);
