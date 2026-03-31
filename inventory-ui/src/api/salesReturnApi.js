import api from './axiosInstance';

export const getSalesReturns = () => api.get('/sales-return');
export const getSalesReturn = (id) => api.get(`/sales-return?id=${id}`);
export const createSalesReturn = (data) => api.post('/sales-return', data);
export const deleteSalesReturn = (id) => api.delete(`/sales-return?id=${id}`);
