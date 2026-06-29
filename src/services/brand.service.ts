import api from './api';

export const brandService = {
  async getBrands(skip = 0, limit = 100) {
    const { data } = await api.get('/brands', { params: { skip, limit } });
    return data;
  }
};
