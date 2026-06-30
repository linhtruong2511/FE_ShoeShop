import api from '../api';

export const adminBrandService = {
  async getBrands(params?: any) {
    const res = await api.get('/brands', { params });
    return res.data;
  },
  async createBrand(data: any) {
    const res = await api.post('/admin/brands', data);
    return res.data;
  },
  async updateBrand(id: number, data: any) {
    const res = await api.put(`/admin/brands/${id}`, data);
    return res.data;
  },
  async toggleBrandStatus(id: number, status: string) {
    const res = await api.patch(`/admin/brands/${id}/status`, { status });
    return res.data;
  }
};
