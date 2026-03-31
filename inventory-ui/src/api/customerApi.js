import api from './axiosInstance';
export const getCustomers = () => api.get('/customers');
export const createCustomer = (data) => api.post('/customers', data);
export const updateCustomer = (id, data) => api.put(`/customers?id=${id}`, data);
export const deleteCustomer = (id) => api.delete(`/customers?id=${id}`);
