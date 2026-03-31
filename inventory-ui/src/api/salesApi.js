import api from './axiosInstance';
export const getSales = () => api.get('/sales');
export const getSale = (id) => api.get(`/sales?id=${id}`);
export const createSale = (data) => api.post('/sales', data);
export const updateSale = (id, data) => api.put(`/sales?id=${id}`, data);
export const deleteSale = (id) => api.delete(`/sales?id=${id}`);
