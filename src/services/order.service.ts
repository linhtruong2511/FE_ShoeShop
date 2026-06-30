import api from './api';

export interface CreateOrderRequest {
  receiver_name: string;
  receiver_phone: string;
  shipping_address: string;
  payment_method: 'cod' | 'bank_transfer';
  shipping_method?: 'standard' | 'express';
  note?: string;
  voucher_code?: string;
}

export const orderService = {
  async getMyOrders(skip = 0, limit = 100) {
    const { data } = await api.get('/orders', { params: { skip, limit } });
    return data;
  },
  async getOrderDetail(orderId: number | string) {
    const { data } = await api.get(`/orders/${orderId}`);
    return data;
  },
  async createOrder(orderData: CreateOrderRequest) {
    const { data } = await api.post('/orders', orderData);
    return data;
  },
  async cancelOrder(orderId: number | string, reason: string) {
    const { data } = await api.patch(`/orders/${orderId}/cancel`, null, {
      params: { reason }
    });
    return data;
  },
  async createReturn(orderId: number | string, returnData: any) {
    const { data } = await api.post(`/orders/${orderId}/returns`, returnData);
    return data;
  }
};
