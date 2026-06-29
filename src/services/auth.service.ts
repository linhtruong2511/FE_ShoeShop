import api from './api';

export const authService = {
  async loginCustomer(data: any) {
    const response = await api.post('/auth/login/customer', data);
    return response.data;
  },
  async registerCustomer(data: any) {
    const response = await api.post('/auth/register', data);
    return response.data;
  },
  async getMe() {
    const response = await api.get('/auth/me/customer');
    return response.data;
  }
};
