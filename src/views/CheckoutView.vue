<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useCartStore, getDiscountedPrice } from '../stores/cart';
import { orderService } from '../services/order.service';

const router = useRouter();
const cartStore = useCartStore();

const isLoadingOrder = ref(false);
const receiverName = ref('');
const receiverPhone = ref('');
const shippingAddress = ref('');
const note = ref('');
const paymentMethod = ref<'cod' | 'bank_transfer'>('cod');
const shippingMethod = ref<'standard' | 'fast'>('standard');
const voucherInput = ref('');

const voucherError = ref('');
const voucherSuccess = ref('');
const orderError = ref('');

onMounted(async () => {
  await cartStore.loadCart();
  if (cartStore.items.length === 0) {
    router.push('/products');
  }
});

const formatPrice = (value: number) => {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
};

// Calculate shipping fee from preview
const shippingFee = computed(() => {
  return cartStore.checkoutPreviewData?.shipping_fee ?? 30000;
});

// Calculate final total from preview
const totalAmount = computed(() => {
  return cartStore.checkoutPreviewData?.total ?? (cartStore.subtotal + shippingFee.value);
});

// Available vouchers to apply (display to user for convenience)
const availableVouchers = computed(() => {
  return [
    { voucher_id: 1, code: 'SALE10', voucher_type: 'percent', discount_value: 10, min_order_amount: 100000, description: 'Giảm 10% đơn từ 100k' },
    { voucher_id: 2, code: 'FREESHIP', voucher_type: 'free_shipping', discount_value: 30000, min_order_amount: 0, description: 'Miễn phí vận chuyển' }
  ];
});

// Apply voucher logic
const handleApplyVoucher = async (code: string) => {
  voucherError.value = '';
  voucherSuccess.value = '';
  
  if (!code.trim()) {
    voucherError.value = 'Vui lòng nhập mã giảm giá!';
    return;
  }
  
  const result = await cartStore.applyVoucher(code.trim());
  if (result.success) {
    voucherSuccess.value = result.message;
    voucherInput.value = '';
  } else {
    voucherError.value = result.message;
  }
};

const handleRemoveVoucher = async () => {
  await cartStore.removeVoucher();
  voucherSuccess.value = '';
  voucherError.value = '';
};

// Confirm order
const handlePlaceOrder = async () => {
  orderError.value = '';
  
  if (!receiverName.value.trim()) {
    orderError.value = 'Vui lòng điền họ tên người nhận!';
    return;
  }
  if (!receiverPhone.value.trim()) {
    orderError.value = 'Vui lòng điền số điện thoại người nhận!';
    return;
  }
  if (!shippingAddress.value.trim()) {
    orderError.value = 'Vui lòng điền địa chỉ giao nhận hàng!';
    return;
  }

  // Vietnamese phone regex
  const phoneRegex = /^0[0-9]{9}$/;
  if (!phoneRegex.test(receiverPhone.value.trim())) {
    orderError.value = 'Số điện thoại không hợp lệ (phải có 10 chữ số và bắt đầu bằng số 0)!';
    return;
  }

  isLoadingOrder.value = true;
  
  try {
    const orderData = {
      receiver_name: receiverName.value.trim(),
      receiver_phone: receiverPhone.value.trim(),
      shipping_address: shippingAddress.value.trim(),
      note: note.value.trim() || undefined,
      payment_method: paymentMethod.value,
      voucher_code: cartStore.appliedVoucherCode || undefined,
    };

    const res = await orderService.createOrder(orderData);
    if (res.success && res.data) {
      const order = res.data;
      await cartStore.clearCart();
      alert('Đặt hàng thành công! Cám ơn bạn đã lựa chọn ShoeShop.');
      router.push(`/orders/${order.order_id}`);
    } else {
      orderError.value = res.message || 'Có lỗi xảy ra khi tạo đơn hàng.';
    }
  } catch (err: any) {
    console.error('Create order error:', err);
    orderError.value = err.response?.data?.detail || 'Không thể tạo đơn hàng. Vui lòng kiểm tra lại thông tin hoặc tồn kho sản phẩm.';
  } finally {
    isLoadingOrder.value = false;
  }
};
</script>

<template>
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
    <!-- Breadcrumbs -->
    <nav class="flex mb-8 text-xs font-bold text-slate-400 uppercase tracking-wider space-x-2">
      <router-link to="/" class="hover:text-slate-900">Trang chủ</router-link>
      <span>/</span>
      <router-link to="/products" class="hover:text-slate-900">Sản phẩm</router-link>
      <span>/</span>
      <span class="text-slate-900">Thanh toán đơn hàng</span>
    </nav>

    <h1 class="text-3xl font-black text-slate-900 mb-10 text-left font-sans uppercase">
      Thanh toán đơn hàng
    </h1>

    <div class="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
      <!-- Left Column: Shipping and Payment Info Form (7 columns) -->
      <div class="lg:col-span-7 space-y-6">
        <!-- Shipping Info Card -->
        <div class="bg-white p-6 md:p-8 rounded-3xl border border-slate-100 shadow-premium text-left">
          <h2 class="text-lg font-bold text-slate-900 mb-6 font-sans uppercase border-b border-slate-100 pb-3 flex items-center">
            <span class="rounded-full bg-slate-100 p-2 mr-3 text-slate-800">
              <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path stroke-linecap="round" stroke-linejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </span>
            Thông tin giao hàng
          </h2>

          <div class="space-y-4">
            <div>
              <label class="block text-xs font-bold text-slate-500 uppercase mb-2">Họ và tên người nhận *</label>
              <input 
                type="text" 
                v-model="receiverName"
                placeholder="Nhập họ và tên đầy đủ"
                class="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-brand-blue"
              />
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="block text-xs font-bold text-slate-500 uppercase mb-2">Số điện thoại *</label>
                <input 
                  type="text" 
                  v-model="receiverPhone"
                  placeholder="Nhập số điện thoại liên hệ"
                  class="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-brand-blue"
                />
              </div>
              <div>
                <label class="block text-xs font-bold text-slate-500 uppercase mb-2">Phương thức giao hàng</label>
                <select 
                  v-model="shippingMethod"
                  class="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm bg-white focus:outline-none focus:border-brand-blue cursor-pointer"
                >
                  <option value="standard">Giao hàng tiêu chuẩn (3-5 ngày) - {{ formatPrice(30000) }}</option>
                  <option value="fast">Giao hàng nhanh (1-2 ngày) - {{ formatPrice(50000) }}</option>
                </select>
              </div>
            </div>

            <div>
              <label class="block text-xs font-bold text-slate-500 uppercase mb-2">Địa chỉ nhận hàng đầy đủ *</label>
              <textarea 
                v-model="shippingAddress"
                rows="3"
                placeholder="Số nhà, tên đường, phường/xã, quận/huyện, tỉnh/thành phố"
                class="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-brand-blue resize-none"
              ></textarea>
            </div>

            <div>
              <label class="block text-xs font-bold text-slate-500 uppercase mb-2">Ghi chú giao hàng (Tùy chọn)</label>
              <input 
                type="text" 
                v-model="note"
                placeholder="Ví dụ: Giao giờ hành chính, gọi trước khi giao..."
                class="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-brand-blue"
              />
            </div>
          </div>
        </div>

        <!-- Payment Info Card -->
        <div class="bg-white p-6 md:p-8 rounded-3xl border border-slate-100 shadow-premium text-left">
          <h2 class="text-lg font-bold text-slate-900 mb-6 font-sans uppercase border-b border-slate-100 pb-3 flex items-center">
            <span class="rounded-full bg-slate-100 p-2 mr-3 text-slate-800">
              <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
              </svg>
            </span>
            Phương thức thanh toán
          </h2>

          <div class="space-y-3">
            <label 
              class="flex items-center justify-between p-4 border rounded-xl cursor-pointer transition-all"
              :class="paymentMethod === 'cod' ? 'border-brand-blue bg-blue-50/20' : 'border-slate-200'"
            >
              <div class="flex items-center space-x-3">
                <input 
                  type="radio" 
                  value="cod" 
                  v-model="paymentMethod"
                  class="text-brand-blue focus:ring-brand-blue h-4 w-4 border-slate-300"
                />
                <div>
                  <p class="text-sm font-bold text-slate-800">Thanh toán khi nhận hàng (COD)</p>
                  <p class="text-xs text-slate-500 mt-0.5">Thanh toán bằng tiền mặt khi shipper giao hàng tới.</p>
                </div>
              </div>
              <svg class="h-6 w-6 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </label>

            <label 
              class="flex items-center justify-between p-4 border rounded-xl cursor-pointer transition-all"
              :class="paymentMethod === 'bank_transfer' ? 'border-brand-blue bg-blue-50/20' : 'border-slate-200'"
            >
              <div class="flex items-center space-x-3">
                <input 
                  type="radio" 
                  value="bank_transfer" 
                  v-model="paymentMethod"
                  class="text-brand-blue focus:ring-brand-blue h-4 w-4 border-slate-300"
                />
                <div>
                  <p class="text-sm font-bold text-slate-800">Chuyển khoản ngân hàng</p>
                  <p class="text-xs text-slate-500 mt-0.5">Quét mã QR hoặc chuyển khoản tới tài khoản shop sau khi đặt.</p>
                </div>
              </div>
              <svg class="h-6 w-6 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
              </svg>
            </label>
          </div>
          
          <div v-if="paymentMethod === 'bank_transfer'" class="mt-4 p-4 bg-slate-50 border border-slate-100 rounded-xl space-y-2 text-xs text-slate-600">
            <p class="font-bold text-slate-800 text-sm">Thông tin tài khoản nhận tiền:</p>
            <p>Ngân hàng: <strong>Vietcombank (VCB)</strong></p>
            <p>Số tài khoản: <strong>1023456789</strong></p>
            <p>Chủ tài khoản: <strong>SHOESHOP VIETNAM</strong></p>
            <p>Nội dung chuyển khoản: <strong>Mã đơn hàng của bạn</strong></p>
          </div>
        </div>
      </div>

      <!-- Right Column: Order Details Summary and Vouchers (5 columns) -->
      <div class="lg:col-span-5 space-y-6">
        <!-- Order Items Summary Card -->
        <div class="bg-white p-6 rounded-3xl border border-slate-100 shadow-premium">
          <h2 class="text-base font-bold text-slate-900 mb-5 font-sans uppercase border-b border-slate-100 pb-3 text-left">
            Đơn hàng của bạn ({{ cartStore.totalItems }})
          </h2>

          <!-- Items list -->
          <ul class="divide-y divide-slate-100 max-h-60 overflow-y-auto mb-6 pr-2">
            <li v-for="item in cartStore.items" :key="item.id" class="flex py-3.5 items-center justify-between">
              <div class="flex items-center space-x-3 text-left">
                <img 
                  :src="(item.selectedColor as any).images?.find((img: any) => img.is_main)?.image_url || (item.selectedColor as any).images?.[0]?.image_url || (item.selectedColor as any).main_image_url || '/placeholder_image.png'" 
                  :alt="item.product.product_name"
                  class="h-12 w-12 rounded-lg object-cover bg-slate-50 border border-slate-100 flex-shrink-0"
                />
                <div>
                  <h4 class="text-xs font-bold text-slate-800 line-clamp-1 max-w-[180px]">{{ item.product.product_name }}</h4>
                  <p class="text-[10px] text-slate-400 mt-0.5">Size: {{ item.selectedSku.size }} | Màu: {{ item.selectedColor.color_name }}</p>
                  <p class="text-[10px] font-bold text-slate-500">SL: {{ item.quantity }} x {{ formatPrice(getDiscountedPrice(item.selectedColor)) }}</p>
                </div>
              </div>
              <span class="text-xs font-bold text-slate-800">
                {{ formatPrice(getDiscountedPrice(item.selectedColor) * item.quantity) }}
              </span>
            </li>
          </ul>

          <!-- Voucher Application Form -->
          <div class="border-t border-slate-100 pt-5 pb-5 text-left">
            <label class="block text-xs font-bold text-slate-500 uppercase mb-2">Nhập mã giảm giá</label>
            <div class="flex space-x-2">
              <input 
                type="text" 
                v-model="voucherInput"
                placeholder="Mã voucher (ví dụ: SALE10)"
                class="flex-1 border border-slate-200 rounded-xl px-3 py-2 text-sm uppercase focus:outline-none"
              />
              <button 
                @click="handleApplyVoucher(voucherInput)"
                class="bg-slate-900 hover:bg-slate-950 text-white font-bold text-xs px-4 py-2 rounded-xl transition-colors"
              >
                ÁP DỤNG
              </button>
            </div>
            
            <p v-if="voucherError" class="text-brand-accent text-xs font-bold mt-2">{{ voucherError }}</p>
            <p v-if="voucherSuccess" class="text-emerald-600 text-xs font-bold mt-2">{{ voucherSuccess }}</p>
          </div>

          <!-- Quick Apply Vouchers list -->
          <div class="border-t border-slate-50 pt-4 pb-4 text-left" v-if="availableVouchers.length > 0">
            <p class="text-xs font-bold text-slate-400 uppercase mb-2">Mã giảm giá phù hợp với bạn:</p>
            <div class="flex flex-wrap gap-2">
              <button 
                v-for="v in availableVouchers" 
                :key="v.voucher_id"
                @click="handleApplyVoucher(v.code)"
                class="border border-dashed border-brand-blue bg-blue-50/10 text-brand-blue px-2.5 py-1 rounded-lg text-xs font-bold hover:bg-blue-50 transition-colors"
              >
                {{ v.code }} (-{{ v.voucher_type === 'percent' ? v.discount_value + '%' : formatPrice(v.discount_value) }})
              </button>
            </div>
          </div>

          <!-- Voucher snap badge -->
          <div v-if="cartStore.appliedVoucherCode" class="bg-emerald-50 border border-emerald-100 text-emerald-800 p-3 rounded-2xl flex items-center justify-between text-xs font-bold mb-6">
            <span class="flex items-center">
              <svg class="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
                <path stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              ĐANG ÁP DỤNG: {{ cartStore.appliedVoucherCode }}
            </span>
            <button @click="handleRemoveVoucher" class="text-slate-400 hover:text-brand-accent">Hủy</button>
          </div>

          <!-- Order Costing Details -->
          <div class="border-t border-slate-100 pt-5 space-y-3 text-sm text-slate-600 text-left">
            <div class="flex justify-between">
              <span>Tạm tính hàng hóa:</span>
              <span class="font-bold text-slate-800">{{ formatPrice(cartStore.subtotal) }}</span>
            </div>
            <div class="flex justify-between" v-if="cartStore.voucherDiscount > 0">
              <span>Giảm giá Voucher:</span>
              <span class="font-bold text-brand-accent">-{{ formatPrice(cartStore.voucherDiscount) }}</span>
            </div>
            <div class="flex justify-between">
              <span>Phí vận chuyển:</span>
              <span class="font-bold text-slate-800">{{ formatPrice(shippingFee) }}</span>
            </div>
            <div class="flex justify-between border-t border-slate-100 pt-4 text-base font-extrabold text-slate-900">
              <span>Tổng thanh toán:</span>
              <span class="text-xl text-brand-blue">{{ formatPrice(totalAmount) }}</span>
            </div>
          </div>

          <div class="mt-8">
            <button 
              @click="handlePlaceOrder"
              :disabled="isLoadingOrder"
              class="w-full bg-brand-accent hover:bg-brand-accentHover text-white py-4 rounded-full font-black tracking-wide text-base shadow-lg transition-all duration-300 transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              {{ isLoadingOrder ? 'ĐANG XỬ LÝ ĐƠN HÀNG...' : 'HOÀN TẤT ĐẶT HÀNG' }}
            </button>
            <p v-if="orderError" class="text-brand-accent text-xs font-bold mt-3 text-center">{{ orderError }}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
