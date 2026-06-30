import api from '../api';

export const adminOrderService = {
  async getOrders(params?: any) {
    const response = await api.get('/admin/orders', { params });
    return response.data;
  },
  async getOrderDetail(orderId: number) {
    const response = await api.get(`/admin/orders/${orderId}`);
    return response.data;
  },
  async updateStatus(id: number, status: string, note?: string) {
    return api.patch(`/admin/orders/${id}/status`, { status, note }).then(res => res.data);
  },
  cancelOrder(id: number, reason: string) {
    return api.patch(`/admin/orders/${id}/cancel`, { reason }).then(res => res.data);
  },
  async getReturns(params?: any) {
    const response = await api.get('/admin/returns', { params });
    return response.data;
  },
  async reviewReturn(returnId: number, status: 'approved' | 'rejected', note?: string) {
    const response = await api.patch(`/admin/returns/${returnId}/review`, { status, note });
    return response.data;
  },
  async completeReturn(returnId: number) {
    const response = await api.patch(`/admin/returns/${returnId}/complete`);
    return response.data;
  }
};
