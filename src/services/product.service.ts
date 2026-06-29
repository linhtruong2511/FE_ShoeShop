import api from './api';

export interface ProductQueryParams {
  keyword?: string;
  brand_id?: number;
  category_id?: number;
  color_name?: string;
  size?: string;
  min_price?: number;
  max_price?: number;
  in_stock?: boolean;
  on_sale?: boolean;
  gender_target?: string;
  page?: number;
  limit?: number;
  sort_by?: string;
  sort_order?: string;
}

export const productService = {
  async getProducts(params: ProductQueryParams) {
    const { data } = await api.get('/products', { params });
    return data;
  },
  async getProductDetail(productId: number | string) {
    const { data } = await api.get(`/products/${productId}`);
    return data;
  }
};
