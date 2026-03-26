import axios from 'axios';

const API_BASE = 'http://127.0.0.1:8000';
// const API_BASE = '/api';

const api = axios.create({
  baseURL: API_BASE,
});

export const getVehicles  = () => api.get('/vehicles/');
export const getAlerts    = () => api.get('/alerts/');
export const getHealth    = () => api.get('/health');

export const sendSMS = (vehicleId, phone, message) =>
  api.post('/alerts/notify', { vehicle_id: vehicleId, phone, message });

export const startEngine = (vehicleId) =>
  api.post(`/vehicles/${vehicleId}/engine/start`);

export const stopEngine = (vehicleId) =>
  api.post(`/vehicles/${vehicleId}/engine/stop`);

export default api;