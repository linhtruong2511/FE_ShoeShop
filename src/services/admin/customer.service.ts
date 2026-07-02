import api from '../api';

export interface GetCustomersParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
}

export const adminCustomerService = {
  async getCustomers(params?: GetCustomersParams) {
    const { data } = await api.get('/admin/customers', { params });
    return data;
  },
  
  async getCustomerDetail(id: number | string) {
    const { data } = await api.get(`/admin/customers/${id}`);
    return data;
  },
  
  async toggleCustomerStatus(id: number | string, status: 'active' | 'locked') {
    const { data } = await api.patch(`/admin/customers/${id}/status`, { status });
    return data;
  },
  
  async updateCustomer(id: number | string, payload: Record<string, any>) {
    const { data } = await api.put(`/admin/customers/${id}`, payload);
    return data;
  }
};
