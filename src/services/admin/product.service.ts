import api from '../api';

export const adminProductService = {
  async getProducts(params?: any) {
    const response = await api.get('/admin/products', { params });
    return response.data;
  },
  async createProduct(data: any) {
    const response = await api.post('/admin/products', data);
    return response.data;
  },
  async updateProductStatus(id: number, status: string) {
    const response = await api.patch(`/admin/products/${id}/status`, { status });
    return response.data;
  },
  async updateProduct(id: number, data: any) {
    const response = await api.put(`/admin/products/${id}`, data);
    return response.data;
  },
  async deleteProduct(id: number) {
    const response = await api.delete(`/admin/products/${id}`);
    return response.data;
  },
  async addColor(productId: number, data: any) {
    const response = await api.post(`/admin/products/${productId}/colors`, data);
    return response.data;
  },
  async updateColor(productId: number, colorId: number, data: any) {
    const response = await api.put(`/admin/products/${productId}/colors/${colorId}`, data);
    return response.data;
  },
  async setDefaultColor(productId: number, colorId: number) {
    const response = await api.patch(`/admin/products/${productId}/colors/${colorId}/default`);
    return response.data;
  },
  async updateColorStatus(productId: number, colorId: number, status: string) {
    const response = await api.patch(`/admin/products/${productId}/colors/${colorId}/status`, { status });
    return response.data;
  },
  async updateSkuStatus(productId: number, colorId: number, skuId: number, status: string) {
    const response = await api.patch(`/admin/products/${productId}/colors/${colorId}/skus/${skuId}/status`, { status });
    return response.data;
  },
  async uploadImages(productId: number, colorId: number, files: File[], isMain: boolean = false) {
    const formData = new FormData();
    files.forEach(file => {
      formData.append('images', file);
    });
    const response = await api.post(
      `/admin/products/${productId}/colors/${colorId}/images?is_main=${isMain}`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return response.data;
  },
  async reorderImages(productId: number, colorId: number, images: Array<{ image_id: number; display_order: number; is_main: boolean }>) {
    const response = await api.patch(`/admin/products/${productId}/colors/${colorId}/images/reorder`, { images });
    return response.data;
  },
  async deleteImage(productId: number, colorId: number, imageId: number) {
    const response = await api.delete(`/admin/products/${productId}/colors/${colorId}/images/${imageId}`);
    return response.data;
  },
  async addSkus(productId: number, colorId: number, data: { skus: Array<{ size: string; stock_quantity: number }> }) {
    const response = await api.post(`/admin/products/${productId}/colors/${colorId}/skus`, data);
    return response.data;
  },
  async updatePricing(productId: number, colorId: number, data: { price: number; discount_type: string; discount_value: number }) {
    const response = await api.patch(`/admin/products/${productId}/colors/${colorId}/pricing`, data);
    return response.data;
  },
  async adjustStock(skuId: number, data: { change_quantity: number; reason: string; reason_note?: string }) {
    const response = await api.patch(`/admin/skus/${skuId}/stock`, data);
    return response.data;
  },
  async getStockLogs(skuId: number) {
    const response = await api.get(`/admin/skus/${skuId}/stock-logs`);
    return response.data;
  }
};
