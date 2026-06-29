import api from './api';

export const categoryService = {
  async getCategories(skip = 0, limit = 100) {
    const { data } = await api.get('/categories', { params: { skip, limit } });
    return data;
  }
};
