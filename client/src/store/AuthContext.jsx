import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { authApi } from '../api/endpoints';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [booting, setBooting] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('learnsphere_token');
    if (!token) {
      setBooting(false);
      return;
    }

    authApi.me()
      .then(({ data }) => setUser(data.user))
      .catch(() => localStorage.removeItem('learnsphere_token'))
      .finally(() => setBooting(false));
  }, []);

  const login = async (payload) => {
    const { data } = await authApi.login(payload);
    localStorage.setItem('learnsphere_token', data.accessToken);
    setUser(data.user);
  };

  const register = async (payload) => {
    const { data } = await authApi.register(payload);
    localStorage.setItem('learnsphere_token', data.accessToken);
    setUser(data.user);
  };

  const logout = async () => {
    try {
      await authApi.logout();
    } finally {
      localStorage.removeItem('learnsphere_token');
      setUser(null);
    }
  };

  const value = useMemo(() => ({ user, booting, login, register, logout, setUser }), [user, booting]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);
