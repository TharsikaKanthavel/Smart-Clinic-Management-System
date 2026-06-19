// ============================================================
//  frontend/services/api.js
//  Central API configuration - connects frontend to backend
// ============================================================
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';

let cachedToken = null;
export const setAuthToken = (token) => {
  cachedToken = token || null;
};

const getLocalToken = () => {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      return window.localStorage.getItem('token');
    }
  } catch { }
  return null;
};

const setLocalToken = (token) => {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      if (token) window.localStorage.setItem('token', token);
      else window.localStorage.removeItem('token');
    }
  } catch { }
};

// Priority:
// 1) EXPO_PUBLIC_API_URL (recommended)
// 2) For web, use current browser host + :5000
// 3) Fallback localhost
const detectFileUrl = () => {
  // Return the live Render API URL
  return 'https://smartclinic-backend-sjsq.onrender.com';
};

export const FILE_URL = detectFileUrl();
export const BASE_URL = `${FILE_URL}/api`;

// Core fetch wrapper
const request = async (method, endpoint, data = null, isFormData = false) => {
  try {
    const token = cachedToken || await AsyncStorage.getItem('token') || getLocalToken();
    if (token && !cachedToken) cachedToken = token;
    const headers = isFormData ? {} : { 'Content-Type': 'application/json' };
    if (token) headers.Authorization = `Bearer ${token}`;

    const config = { method, headers };
    if (data) config.body = isFormData ? data : JSON.stringify(data);

    const response = await fetch(`${BASE_URL}${endpoint}`, config);
    const text = await response.text();
    let json = {};
    if (text) {
      try {
        json = JSON.parse(text);
      } catch {
        json = { message: text };
      }
    }

    if (!response.ok) {
      // If it's a 401 and we're not on an auth route, it means the session expired
      if (response.status === 401 && !endpoint.startsWith('/auth/')) {
        // Silently fail or handle logout globally if needed
        const error = new Error(json.message || 'Unauthorized');
        error.status = 401;
        throw error;
      }
      throw new Error(json.message || `Request failed (${response.status})`);
    }
    return json;
  } catch (err) {
    // If it's a network reachability error, log it as it's important for setup
    if (String(err.message || '').includes('Network request failed')) {
      console.warn(`API Connection Error: ${BASE_URL}${endpoint}`);
      throw new Error(`Cannot reach backend at ${BASE_URL}. Start backend server and check API URL.`);
    }

    // For 401s, we don't want to flood the console if we're logging out
    if (err.status === 401) {
      // Just rethrow, the UI will handle the redirect
      throw err;
    }

    throw new Error(err.message || 'Network error');
  }
};

export const api = {
  get: (endpoint) => request('GET', endpoint),
  post: (endpoint, data) => request('POST', endpoint, data),
  put: (endpoint, data) => request('PUT', endpoint, data),
  patch: (endpoint, data) => request('PATCH', endpoint, data),
  delete: (endpoint) => request('DELETE', endpoint),
  upload: (endpoint, formData) => request('POST', endpoint, formData, true),
  uploadPatch: (endpoint, formData) => request('PATCH', endpoint, formData, true),
};

// Auth helpers
export const saveToken = async (token) => {
  cachedToken = token || null;
  try { await AsyncStorage.setItem('token', token); } catch { }
  setLocalToken(token);
};
export const getToken = async () => {
  if (cachedToken) return cachedToken;
  let token = null;
  try { token = await AsyncStorage.getItem('token'); } catch { }
  token = token || getLocalToken();
  cachedToken = token || null;
  return token;
};
export const removeToken = async () => {
  cachedToken = null;
  try { await AsyncStorage.removeItem('token'); } catch { }
  setLocalToken(null);
};
export const saveUser = async (user) => {
  const text = JSON.stringify(user);
  try { await AsyncStorage.setItem('user', text); } catch { }
  try {
    if (typeof window !== 'undefined' && window.localStorage) window.localStorage.setItem('user', text);
  } catch { }
};
export const getUser = async () => {
  let u = null;
  try { u = await AsyncStorage.getItem('user'); } catch { }
  if (!u) {
    try {
      if (typeof window !== 'undefined' && window.localStorage) u = window.localStorage.getItem('user');
    } catch { }
  }
  return u ? JSON.parse(u) : null;
};
export const removeUser = async () => {
  try { await AsyncStorage.removeItem('user'); } catch { }
  try {
    if (typeof window !== 'undefined' && window.localStorage) window.localStorage.removeItem('user');
  } catch { }
};
