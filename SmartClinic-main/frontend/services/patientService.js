// ============================================================
//  frontend/services/patientService.js — Member 2
// ============================================================
import { api } from './api';
export const patientService = {
  getAll:         (params = '') => api.get(`/patients${params}`),
  getMine:        ()            => api.get('/patients/me'),
  getById:        (id)          => api.get(`/patients/${id}`),
  getStats:       ()            => api.get('/patients/stats'),
  create:         (data)        => api.post('/patients', data),
  update:         (id, data)    => api.put(`/patients/${id}`, data),
  delete:         (id)          => api.delete(`/patients/${id}`),
  uploadReport:   (id, formData)=> api.upload(`/patients/${id}/upload-report`, formData),
};
