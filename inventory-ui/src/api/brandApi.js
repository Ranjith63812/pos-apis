import api from './axiosInstance';
export const getBrands = () => api.get('/brands');
export const getBrand = (id) => api.get(`/brands?id=${id}`);
export const createBrand = (data) => api.post('/brands', data);
export const updateBrand = (id, data) => api.put(`/brands?id=${id}`, data);
export const deleteBrand = (id) => api.delete(`/brands?id=${id}`);
