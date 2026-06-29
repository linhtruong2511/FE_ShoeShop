import api from './api';

export const cartService = {
  async getCart() {
    const { data } = await api.get('/cart');
    return data;
  },
  async addItem(skuId: number, quantity: number) {
    const { data } = await api.post('/cart/items', { sku_id: skuId, quantity });
    return data;
  },
  async updateItem(cartItemId: number, quantity: number) {
    const { data } = await api.patch(`/cart/items/${cartItemId}`, null, {
      params: { quantity }
    });
    return data;
  },
  async removeItem(cartItemId: number) {
    const { data } = await api.delete(`/cart/items/${cartItemId}`);
    return data;
  },
  async clearCart() {
    const { data } = await api.delete('/cart');
    return data;
  },
  async applyVoucher(voucherCode: string) {
    const { data } = await api.post('/cart/voucher', null, {
      params: { voucher_code: voucherCode }
    });
    return data;
  },
  async removeVoucher() {
    const { data } = await api.delete('/cart/voucher');
    return data;
  },
  async checkoutPreview(checkoutInfo: any) {
    const { data } = await api.post('/cart/checkout-preview', checkoutInfo);
    return data;
  }
};
