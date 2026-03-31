import api from './axiosInstance';
export const getExpenses = () => api.get('/expenses');
export const createExpense = (data) => api.post('/expenses', data);
export const updateExpense = (id, data) => api.put(`/expenses?id=${id}`, data);
export const deleteExpense = (id) => api.delete(`/expenses?id=${id}`);
