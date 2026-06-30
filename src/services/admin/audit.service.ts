import api from '../api';

export const adminAuditService = {
  async getLogs(params?: any) {
    const res = await api.get('/admin/audit', { params });
    return res.data;
  }
};
