import api from '../api';

export const adminVoucherService = {
  async getVouchers(params?: any) {
    const response = await api.get('/admin/vouchers', { params });
    return response.data;
  },
  async createVoucher(data: any) {
    const response = await api.post('/admin/vouchers', data);
    return response.data;
  },
  async updateStatus(voucherId: number, status: 'active' | 'paused') {
    const response = await api.patch(`/admin/vouchers/${voucherId}/status`, { status });
    return response.data;
  },
  async getUsages(voucherId: number, params?: any) {
    const response = await api.get(`/admin/vouchers/${voucherId}/usages`, { params });
    return response.data;
  }
};
