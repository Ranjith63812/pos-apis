import api from './axiosInstance';

export const getPurchaseReturns = () => api.get('/purchase-return');
export const getPurchaseReturn = (id) => api.get(`/purchase-return?id=${id}`);
export const createPurchaseReturn = (data) => api.post('/purchase-return', data);
export const deletePurchaseReturn = (id) => api.delete(`/purchase-return?id=${id}`);
