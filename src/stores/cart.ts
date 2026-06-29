import { defineStore } from 'pinia';
import type { CartItem, Product, ProductColor, ProductSku, Voucher } from '../types';

export const getDiscountedPrice = (color: ProductColor): number => {
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
    appliedVoucher: null as Voucher | null,
    shippingFee: 30000,
  }),
  getters: {
    totalItems: (state) => state.items.reduce((total, item) => total + item.quantity, 0),
    subtotal: (state) => {
      return state.items.reduce((total, item) => {
        const itemPrice = getDiscountedPrice(item.selectedColor);
        return total + itemPrice * item.quantity;
      }, 0);
    },
    voucherDiscount(): number {
      if (!this.appliedVoucher) return 0;
      const voucher = this.appliedVoucher;
      if (this.subtotal < voucher.min_order_amount) return 0;

      if (voucher.voucher_type === 'percent') {
        let discount = Math.round(this.subtotal * (voucher.discount_value / 100));
        if (voucher.max_discount_amount) {
          discount = Math.min(discount, voucher.max_discount_amount);
        }
        return discount;
      } else if (voucher.voucher_type === 'fixed') {
        return Math.min(voucher.discount_value, this.subtotal);
      } else if (voucher.voucher_type === 'free_shipping') {
        return this.shippingFee; // reduce shipping fee to 0
      }
      return 0;
    },
    totalPrice(): number {
      const discount = this.voucherDiscount;
      const netSubtotal = this.subtotal - discount;
      return Math.max(0, netSubtotal + (this.appliedVoucher?.voucher_type === 'free_shipping' ? 0 : this.shippingFee));
    }
  },
  actions: {
    loadCart() {
      const savedCart = localStorage.getItem('myshoes_cart');
      if (savedCart) {
        try {
          this.items = JSON.parse(savedCart);
        } catch (e) {
          console.error('Error parsing cart from localStorage', e);
          this.items = [];
        }
      }
      const savedVoucher = localStorage.getItem('myshoes_voucher');
      if (savedVoucher) {
        try {
          this.appliedVoucher = JSON.parse(savedVoucher);
        } catch (e) {
          this.appliedVoucher = null;
        }
      }
    },
    saveCart() {
      localStorage.setItem('myshoes_cart', JSON.stringify(this.items));
    },
    saveVoucher() {
      if (this.appliedVoucher) {
        localStorage.setItem('myshoes_voucher', JSON.stringify(this.appliedVoucher));
      } else {
        localStorage.removeItem('myshoes_voucher');
      }
    },
    addToCart(product: Product, color: ProductColor, sku: ProductSku, quantity: number = 1): { success: boolean; message: string } {
      if (sku.status !== 'active' || sku.stock_quantity <= 0) {
        return { success: false, message: 'Kích cỡ giày này hiện đang hết hàng!' };
      }

      const existingItem = this.items.find(item => item.id === sku.sku_id);
      const currentQty = existingItem ? existingItem.quantity : 0;
      
      if (currentQty + quantity > sku.stock_quantity) {
        return { 
          success: false, 
          message: `Không thể thêm! Số lượng trong giỏ (${currentQty}) + thêm mới (${quantity}) vượt quá tồn kho hiện có (${sku.stock_quantity} sản phẩm).` 
        };
      }

      if (existingItem) {
        existingItem.quantity += quantity;
      } else {
        this.items.push({
          id: sku.sku_id,
          product,
          selectedColor: color,
          selectedSku: sku,
          quantity
        });
      }
      this.saveCart();
      return { success: true, message: 'Đã thêm vào giỏ hàng thành công!' };
    },
    removeFromCart(id: string) {
      this.items = this.items.filter(item => item.id !== id);
      this.saveCart();
      
      // Auto recalculate voucher eligibility
      if (this.appliedVoucher && this.subtotal < this.appliedVoucher.min_order_amount) {
        this.appliedVoucher = null;
        this.saveVoucher();
      }
    },
    updateQuantity(id: string, quantity: number): { success: boolean; message: string } {
      const item = this.items.find(item => item.id === id);
      if (item) {
        if (quantity <= 0) {
          this.removeFromCart(id);
          return { success: true, message: 'Đã xóa sản phẩm khỏi giỏ hàng.' };
        }
        
        if (quantity > item.selectedSku.stock_quantity) {
          return { 
            success: false, 
            message: `Không thể tăng số lượng! Kho chỉ còn tối đa ${item.selectedSku.stock_quantity} sản phẩm.` 
          };
        }
        
        item.quantity = quantity;
        this.saveCart();

        // Auto recalculate voucher eligibility
        if (this.appliedVoucher && this.subtotal < this.appliedVoucher.min_order_amount) {
          this.appliedVoucher = null;
          this.saveVoucher();
        }
      }
      return { success: true, message: 'Đã cập nhật số lượng.' };
    },
    applyVoucher(voucher: Voucher): { success: boolean; message: string } {
      if (this.subtotal < voucher.min_order_amount) {
        return { 
          success: false, 
          message: `Đơn hàng tối thiểu phải đạt ${new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(voucher.min_order_amount)} để sử dụng mã này!` 
        };
      }
      
      this.appliedVoucher = voucher;
      this.saveVoucher();
      return { success: true, message: `Áp dụng mã giảm giá ${voucher.code} thành công!` };
    },
    removeVoucher() {
      this.appliedVoucher = null;
      this.saveVoucher();
    },
    clearCart() {
      this.items = [];
      this.appliedVoucher = null;
      this.saveCart();
      this.saveVoucher();
    }
  }
});
