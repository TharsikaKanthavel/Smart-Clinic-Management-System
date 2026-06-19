// ============================================================
//  frontend/context/AuthContext.js
//  Global authentication state — wraps entire app
// ============================================================
import React, { createContext, useContext, useState, useEffect } from 'react';
import { getUser, getToken, removeToken, removeUser, setAuthToken } from '../services/api';
import { authService } from '../services/authService';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user,    setUser]    = useState(null);
  const [token,   setToken]   = useState(null);
  const [loading, setLoading] = useState(true);

  // Load saved session on app start
  useEffect(() => {
    (async () => {
      try {
        const savedToken = await getToken();
        const savedUser  = await getUser();
        if (savedToken && savedUser) {
          try {
            const profileRes = await authService.getProfile();
            const validUser = profileRes?.user || savedUser;
            setAuthToken(savedToken);
            setToken(savedToken);
            setUser(validUser);
          } catch {
            await removeToken();
            await removeUser();
            setAuthToken(null);
            setToken(null);
            setUser(null);
          }
        }
      } catch (e) {
        console.log('Session load error:', e);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const login = async (email, password, role) => {
    const res = await authService.login({ email, password, role });
    setAuthToken(res.token || null);
    setToken(res.token);
    setUser(res.user);
    return res;
  };

  const logout = async () => {
    await authService.logout();
    setAuthToken(null);
    setUser(null);
    setToken(null);
  };

  const updateUser = (updatedUser) => setUser(updatedUser);

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout, updateUser, isAdmin: user?.role === 'Admin', isDoctor: user?.role === 'Doctor', isPatient: user?.role === 'Patient' }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
