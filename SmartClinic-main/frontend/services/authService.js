// ============================================================
//  frontend/services/authService.js — Authentication API
// ============================================================
import { api, saveToken, saveUser, removeToken, removeUser } from './api';

export const authService = {
  register:       (data) => api.post('/auth/register', data),
  verifyOtp:      (data) => api.post('/auth/verify-otp', data),
  resendOtp:      (data) => api.post('/auth/resend-otp', data),
  login:          async (data) => {
    const res = await api.post('/auth/login', data);
    if (res.token) { await saveToken(res.token); await saveUser(res.user); }
    return res;
  },
  logout:         async () => { await removeToken(); await removeUser(); },
  getProfile:     ()     => api.get('/auth/profile'),
  updateProfile:  (data) => api.put('/auth/profile', data),
  changePassword: (data) => api.put('/auth/change-password', data),
  getAllUsers:     ()     => api.get('/auth/users'),
  createUser:      (data) => api.post('/auth/users', data),
  updateUser:      (id, data) => api.put(`/auth/users/${id}`, data),
  deleteUser:      (id) => api.delete(`/auth/users/${id}`),
  updateUserStatus: (id, data) => api.put(`/auth/users/${id}/status`, data),
};
