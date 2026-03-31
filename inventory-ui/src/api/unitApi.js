import api from './axiosInstance';
export const getUnits = () => api.get('/units');
export const getUnit = (id) => api.get(`/units?id=${id}`);
export const createUnit = (data) => api.post('/units', data);
export const updateUnit = (id, data) => api.put(`/units?id=${id}`, data);
export const deleteUnit = (id) => api.delete(`/units?id=${id}`);
