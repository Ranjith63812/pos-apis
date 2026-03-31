import api from './axiosInstance';
export const getStates = () => api.get('/states');
export const createState = (data) => api.post('/states', data);
export const updateState = (id, data) => api.put(`/states?id=${id}`, data);
export const deleteState = (id) => api.delete(`/states?id=${id}`);
