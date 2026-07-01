import api from '../api';

export const adminBrandService = {
  async getBrands(params?: any) {
    const res = await api.get('/admin/brands', { params });
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
    const res = await api.patch(`/admin/brands/${id}/status?status=${status}`);
    return res.data;
  },
  async uploadLogo(id: number, file: File) {
    const formData = new FormData();
    formData.append('logo_file', file);
    const res = await api.patch(`/admin/brands/${id}/upload-logo`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return res.data;
  }
};

