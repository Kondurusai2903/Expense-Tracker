import api from './axios';

export const loginApi = async (email, password) => {
  const res = await api.post('/api/auth/login', { email, password });
  return res.data;
};

export const registerApi = async (name, email, password) => {
  const res = await api.post('/api/auth/register', { name, email, password });
  return res.data;
};

export const getMeApi = async () => {
  const res = await api.get('/api/auth/me');
  return res.data.user;
};

export const logoutApi = async () => {
  await api.post('/api/auth/logout');
};
