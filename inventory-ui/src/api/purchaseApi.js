import api from './axiosInstance';
export const getPurchases = () => api.get('/purchases');
export const getPurchase = (id) => api.get(`/purchases?id=${id}`);
export const createPurchase = (data) => api.post('/purchases', data);
export const updatePurchase = (id, data) => api.put(`/purchases?id=${id}`, data);
export const deletePurchase = (id) => api.delete(`/purchases?id=${id}`);
