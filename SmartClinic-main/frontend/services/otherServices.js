// ============================================================
//  frontend/services/otherServices.js
//  Members 4, 5, 6 — all need the 'api' import
// ============================================================
import { api } from './api';

// ── Member 4: Reminders ──────────────────────────────────────
export const reminderService = {
  getAll:       (params = '') => api.get(`/reminders${params}`),
  getById:      (id)          => api.get(`/reminders/${id}`),
  getStats:     ()            => api.get('/reminders/stats'),
  create:       (data)        => api.post('/reminders', data),
  update:       (id, data)    => api.put(`/reminders/${id}`, data),
  delete:       (id)          => api.delete(`/reminders/${id}`),
  markTaken:    (id)          => api.patch(`/reminders/${id}/taken`, {}),
  snooze:       (id)          => api.patch(`/reminders/${id}/snooze`, {}),
  markMissed:   (id)          => api.patch(`/reminders/${id}/missed`, {}),
  toggleStatus: (id)          => api.patch(`/reminders/${id}/toggle`, {}),
  autoStop:     ()            => api.patch('/reminders/auto-stop', {}),
};

// ── Member 4: Notifications ──────────────────────────────────
export const notificationService = {
  getAll:        (params = '') => api.get(`/notifications${params}`),
  getById:       (id)          => api.get(`/notifications/${id}`),
  getUnreadCount:()            => api.get('/notifications/unread-count'),
  create:        (data)        => api.post('/notifications', data),
  broadcast:     (data)        => api.post('/notifications/broadcast', data),
  markRead:      (id)          => api.patch(`/notifications/${id}/read`, {}),
  markAllRead:   (data)        => api.patch('/notifications/mark-all-read', data || {}),
  delete:        (id)          => api.delete(`/notifications/${id}`),
};

// ── Member 5: Billing ────────────────────────────────────────
export const billingService = {
  getAll:        (params = '') => api.get(`/billing${params}`),
  getById:       (id)          => api.get(`/billing/${id}`),
  getAnalytics:  ()            => api.get('/billing/analytics'),
  create:        (data)        => api.post('/billing', data),
  update:        (id, data)    => api.put(`/billing/${id}`, data),
  delete:        (id)          => api.delete(`/billing/${id}`),
  recordPayment: (id, data)    => api.patch(`/billing/${id}/payment`, data),
  uploadEvidence:(id, formData) => api.uploadPatch(`/billing/${id}/upload-evidence`, formData),
  approveEvidence:(id, data)    => api.patch(`/billing/${id}/approve-evidence`, data || {}),
  autoOverdue:   ()            => api.patch('/billing/auto-overdue', {}),
};

// ── Member 6: Lab Tests ──────────────────────────────────────
export const labTestService = {
  getAll:           (params = '')  => api.get(`/labtests${params}`),
  getById:          (id)           => api.get(`/labtests/${id}`),
  getAnalytics:     ()             => api.get('/labtests/analytics'),
  getPatientHistory:(patientId)    => api.get(`/labtests/patient/${patientId}`),
  order:            (data)         => api.post('/labtests', data),
  update:           (id, data)     => api.put(`/labtests/${id}`, data),
  delete:           (id)           => api.delete(`/labtests/${id}`),
  uploadResult:     (id, formData) => api.uploadPatch(`/labtests/${id}/upload-result`, formData),
};
// ── Rating/Reviews ──────────────────────────────────────────
export const ratingService = {
  submit: (data) => api.post('/ratings', data),
  getForDoctor: (drId) => api.get(`/ratings/${drId}`),
};
