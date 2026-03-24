import axios from 'axios';

const API_BASE = 'http://localhost:8000';

const api = axios.create({
  baseURL: API_BASE,
});

export const getVehicles = () => api.get('/vehicles');
export const getAlerts = () => api.get('/alerts');

export default api;