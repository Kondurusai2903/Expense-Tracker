import api from './axios';

export const getExpensesApi = async (params = {}) => {
  const res = await api.get('/api/expenses', { params });
  return res.data;
};

export const createExpenseApi = async (data) => {
  const res = await api.post('/api/expenses', data);
  return res.data.expense;
};

export const updateExpenseApi = async (id, data) => {
  const res = await api.put(`/api/expenses/${id}`, data);
  return res.data.expense;
};

export const deleteExpenseApi = async (id) => {
  await api.delete(`/api/expenses/${id}`);
};

export const getDashboardApi = async () => {
  const res = await api.get('/api/expenses/dashboard');
  return res.data;
};
