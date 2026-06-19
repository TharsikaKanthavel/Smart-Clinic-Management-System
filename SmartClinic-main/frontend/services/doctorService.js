// ============================================================
//  frontend/services/doctorService.js — Member 1
// ============================================================
import { api } from './api';
export const doctorService = {
  getAll:           (params = '') => api.get(`/doctors${params}`),
  getById:          (id)          => api.get(`/doctors/${id}`),
  getSpecializations:()           => api.get('/doctors/specializations'),
  getDashboardStats: ()           => api.get('/doctors/dashboard-stats'),
  create:           (formData)    => api.upload('/doctors', formData),
  update:           (id, formData)=> api.uploadPatch(`/doctors/${id}`, formData),
  delete:           (id)          => api.delete(`/doctors/${id}`),
  updateStatus:     (id, data)    => api.patch(`/doctors/${id}/status`, data),
};
