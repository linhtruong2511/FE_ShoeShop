import api from './api';

export const voucherService = {
  async getActiveVouchers(page = 1, limit = 100) {
    const { data } = await api.get('/vouchers', { params: { page, limit } });
    return data;
  },
  async getVoucherByCode(code: string) {
    const { data } = await api.get(`/vouchers/code/${code}`);
    return data;
  }
};
