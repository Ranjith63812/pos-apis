import api from './axiosInstance';
export const getProducts = () => api.get('/products');
export const createProduct = (data) => api.post('/products', data);
export const updateProduct = (id, data) => api.put(`/products?id=${id}`, data);
export const deleteProduct = (id) => api.delete(`/products?id=${id}`);
