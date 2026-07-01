import api from '../api';

export const adminCategoryService = {
  async getCategories(params?: any) {
    const res = await api.get('/admin/categories', { params });
    return res.data;
  },
  async createCategory(data: any) {
    const res = await api.post('/admin/categories', data);
    return res.data;
  },
  async updateCategory(id: number, data: any) {
    const res = await api.put(`/admin/categories/${id}`, data);
    return res.data;
  },
  async toggleCategoryStatus(id: number, status: string) {
    const res = await api.patch(`/admin/categories/${id}/status?status=${status}`);
    return res.data;
  }
};
