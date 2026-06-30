import api from '../api';

export const adminReportService = {
  async getRevenueSummary(params?: { from_date?: string; to_date?: string }) {
    const response = await api.get('/admin/reports/revenue', { params });
    return response.data;
  },
  async getInventoryReport(params?: { low_stock_threshold?: number }) {
    const response = await api.get('/admin/reports/inventory', { params });
    return response.data;
  },
  async getBestSellers(params?: { limit?: number }) {
    const response = await api.get('/admin/reports/best-sellers', { params });
    return response.data;
  },
  async getVoucherReport(params?: { from_date?: string; to_date?: string }) {
    const response = await api.get('/admin/reports/vouchers', { params });
    return response.data;
  }
};
