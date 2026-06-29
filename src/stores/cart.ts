import { defineStore } from 'pinia';
import type { CartItem, Product, ProductColor, ProductSku } from '../types';
import { cartService } from '../services/cart.service';

export const getDiscountedPrice = (color: any): number => {
  if (!color) return 0;
  if ('discounted_price' in color) return color.discounted_price;
  if (color.discount_type === 'percent') {
    return Math.round(color.price * (1 - color.discount_value / 100));
  } else if (color.discount_type === 'fixed') {
    return Math.max(0, color.price - color.discount_value);
  }
  return color.price;
};

export const useCartStore = defineStore('cart', {
  state: () => ({
    items: [] as CartItem[],
    subtotal: 0,
    shippingFee: 30000,
    appliedVoucherCode: null as string | null,
    checkoutPreviewData: null as any | null,
  }),
  getters: {
    totalItems: (state) => state.items.reduce((total, item) => total + item.quantity, 0),
    voucherDiscount(): number {
      if (!this.checkoutPreviewData) return 0;
      return this.checkoutPreviewData.discount || 0;
    },
    totalPrice(): number {
      if (!this.checkoutPreviewData) {
        return this.subtotal + this.shippingFee;
      }
      return this.checkoutPreviewData.total;
    }
  },
  actions: {
    async fetchCart() {
      try {
        const res = await cartService.getCart();
        if (res.success && res.data) {
          const cart = res.data;
          this.subtotal = cart.summary.subtotal;
          this.appliedVoucherCode = cart.applied_voucher_code || null;
          
          this.items = cart.items.map((item: any) => ({
            id: item.cart_item_id,
            quantity: item.quantity,
            selectedSku: {
              sku_id: item.sku_id,
              sku_code: item.sku_code,
              size: item.size,
              stock_quantity: item.stock_quantity,
              status: item.is_available ? 'active' : 'out_of_stock',
              color_id: 0,
              sold_quantity: 0
            } as ProductSku,
            selectedColor: {
              color_id: 0,
              product_id: item.product_id,
              color_code: '',
              color_name: item.color_name,
              price: item.unit_price,
              discount_type: item.discount_type as any,
              discount_value: item.discount_value,
              is_default: false,
              status: 'active',
              images: [{ image_id: 0, color_id: 0, image_url: item.image_url, is_main: true, display_order: 0 }],
              skus: []
            } as ProductColor,
            product: {
              product_id: item.product_id,
              product_code: item.sku_code,
              product_name: item.product_name,
              brand_name: item.brand_name,
              category_name: '',
              description: '',
              gender_target: 'unisex',
              status: 'active',
              colors: []
            } as Product
          }));

          await this.getCheckoutPreview();
        }
      } catch (err) {
        console.error('Error fetching cart:', err);
      }
    },

    async getCheckoutPreview() {
      try {
        const res = await cartService.checkoutPreview({});
        if (res.success && res.data) {
          this.checkoutPreviewData = res.data;
        }
      } catch (e) {
        this.checkoutPreviewData = null;
      }
    },

    async loadCart() {
      await this.fetchCart();
    },

    async addToCart(_product: any, _color: any, sku: any, quantity: number = 1): Promise<{ success: boolean; message: string }> {
      try {
        const res = await cartService.addItem(sku.sku_id, quantity);
        if (res.success) {
          await this.fetchCart();
          return { success: true, message: 'Đã thêm vào giỏ hàng thành công!' };
        }
        return { success: false, message: res.message || 'Lỗi thêm vào giỏ hàng.' };
      } catch (err: any) {
        console.error('Add to cart error:', err);
        return { success: false, message: err.response?.data?.detail || 'Không thể thêm sản phẩm vào giỏ hàng.' };
      }
    },

    async removeFromCart(id: number) {
      try {
        const res = await cartService.removeItem(id);
        if (res.success) {
          await this.fetchCart();
        }
      } catch (err) {
        console.error('Remove from cart error:', err);
      }
    },

    async updateQuantity(id: number, quantity: number): Promise<{ success: boolean; message: string }> {
      if (quantity <= 0) {
        await this.removeFromCart(id);
        return { success: true, message: 'Đã xóa sản phẩm khỏi giỏ hàng.' };
      }

      try {
        const res = await cartService.updateItem(id, quantity);
        if (res.success) {
          await this.fetchCart();
          return { success: true, message: 'Đã cập nhật số lượng.' };
        }
        return { success: false, message: res.message || 'Lỗi cập nhật số lượng.' };
      } catch (err: any) {
        console.error('Update quantity error:', err);
        return { success: false, message: err.response?.data?.detail || 'Không thể cập nhật số lượng.' };
      }
    },

    async applyVoucher(code: string): Promise<{ success: boolean; message: string }> {
      try {
        const res = await cartService.applyVoucher(code);
        if (res.success) {
          await this.fetchCart();
          return { success: true, message: `Áp dụng mã giảm giá ${code} thành công!` };
        }
        return { success: false, message: res.message || 'Mã giảm giá không hợp lệ.' };
      } catch (err: any) {
        console.error('Apply voucher error:', err);
        return { success: false, message: err.response?.data?.detail || 'Không thể áp dụng mã giảm giá.' };
      }
    },

    async removeVoucher() {
      try {
        const res = await cartService.removeVoucher();
        if (res.success) {
          await this.fetchCart();
        }
      } catch (err) {
        console.error('Remove voucher error:', err);
      }
    },

    async clearCart() {
      try {
        const res = await cartService.clearCart();
        if (res.success) {
          this.items = [];
          this.subtotal = 0;
          this.appliedVoucherCode = null;
          this.checkoutPreviewData = null;
        }
      } catch (err) {
        console.error('Clear cart error:', err);
      }
    }
  }
});

