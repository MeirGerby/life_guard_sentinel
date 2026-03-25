import axios from 'axios';

const API_BASE = 'http://localhost:8000';

const api = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  }
});

// הוסף token לכל בקשה אוטומטית
api.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export const getVehicles    = () => api.get('/vehicles');
export const getAlerts      = () => api.get('/alerts');
export const getHealth      = () => api.get('/health');
export const getOnlineUsers = () => api.get('/users/online');
export const getIncidentLog = () => api.get('/incidents/log');
export const getMe          = () => api.get('/auth/me');

export const sendSMS = (vehicleId, phone, message) =>
  api.post('/alerts/notify', { vehicle_id: vehicleId, phone, message });

export const startEngine = (vehicleId) =>
  api.post(`/vehicles/${vehicleId}/engine/start`);

export const stopEngine = (vehicleId) =>
  api.post(`/vehicles/${vehicleId}/engine/stop`);

export const postIncidentLog = (entry) =>
  api.post('/incidents/log', entry);

export default api;