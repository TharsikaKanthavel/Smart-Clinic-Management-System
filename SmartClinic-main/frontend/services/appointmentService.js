// ============================================================
//  frontend/services/appointmentService.js — Member 3
// ============================================================
import { api } from './api';
export const appointmentService = {
  getAll:          (params = '')  => api.get(`/appointments${params}`),
  getById:         (id)           => api.get(`/appointments/${id}`),
  getStats:        ()             => api.get('/appointments/stats'),
  book:            (formData)     => api.upload('/appointments', formData),
  updateStatus:    (id, data)     => api.patch(`/appointments/${id}/status`, data),
  reschedule:      (id, data)     => api.patch(`/appointments/${id}/reschedule`, data),
  cancelExpired:   ()             => api.patch('/appointments/auto-cancel', {}),
};
