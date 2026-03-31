import api from './axiosInstance';
export const getTaxes = () => api.get('/taxes');
export const getTax = (id) => api.get(`/taxes?id=${id}`);
export const createTax = (data) => api.post('/taxes', data);
export const updateTax = (id, data) => api.put(`/taxes?id=${id}`, data);
export const deleteTax = (id) => api.delete(`/taxes?id=${id}`);
