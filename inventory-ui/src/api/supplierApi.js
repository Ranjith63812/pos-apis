import api from './axiosInstance';
export const getSuppliers = () => api.get('/suppliers');
export const createSupplier = (data) => api.post('/suppliers', data);
export const updateSupplier = (id, data) => api.put(`/suppliers?id=${id}`, data);
export const deleteSupplier = (id) => api.delete(`/suppliers?id=${id}`);
