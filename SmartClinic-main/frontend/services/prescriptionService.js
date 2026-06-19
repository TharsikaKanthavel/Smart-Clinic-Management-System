// ============================================================
//  frontend/services/prescriptionService.js — Member 1
// ============================================================
import { api } from './api';
export const prescriptionService = {
  getAll:       (params = '')  => api.get(`/prescriptions${params}`),
  getById:      (id)           => api.get(`/prescriptions/${id}`),
  getAnalytics: ()             => api.get('/prescriptions/analytics'),
  create:       (formData)     => api.upload('/prescriptions', formData),
  update:       (id, formData) => api.uploadPatch(`/prescriptions/${id}`, formData),
  delete:       (id)           => api.delete(`/prescriptions/${id}`),
};
