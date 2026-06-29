<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useRoute } from 'vue-router';
import type { Order } from '../types';
import { orderService } from '../services/order.service';

const route = useRoute();

const order = ref<any | null>(null);
const isLoading = ref(false);
const errorMsg = ref<string | null>(null);

const cancelReasonInput = ref('');
const showCancelModal = ref(false);
const isCancelling = ref(false);

// Return Request States
const showReturnModal = ref(false);
const isSubmittingReturn = ref(false);
const returnType = ref<'exchange' | 'refund'>('refund');
const returnReason = ref<'wrong_size' | 'wrong_color' | 'defective' | 'wrong_item' | 'other'>('wrong_size');
const returnReasonNote = ref('');
const selectedItemsToReturn = ref<Record<string, { quantity: number; selected: boolean }>>({});

const loadOrder = async () => {
  isLoading.value = true;
  errorMsg.value = null;
  try {
    const res = await orderService.getOrderDetail(route.params.id as string);
    if (res.success && res.data) {
      const orderData = res.data;
      // Map details to items for template compatibility
      orderData.items = orderData.details || [];
      order.value = orderData;
      
      // Initialize return items selection
      selectedItemsToReturn.value = {};
      orderData.items.forEach((item: any) => {
        selectedItemsToReturn.value[item.order_detail_id] = {
          quantity: item.quantity,
          selected: false
        };
      });
    } else {
      errorMsg.value = res.message || 'Không tìm thấy thông tin đơn hàng.';
    }
  } catch (err: any) {
    console.error('Failed to load order:', err);
    errorMsg.value = err.response?.data?.detail || 'Có lỗi xảy ra khi tải chi tiết đơn hàng.';
  } finally {
    isLoading.value = false;
  }
};

onMounted(() => {
  loadOrder();
});

const formatPrice = (value: number) => {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
};

const formatDate = (dateStr: string) => {
  return new Date(dateStr).toLocaleString('vi-VN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  });
};

const getStatusName = (status: Order['order_status']) => {
  switch (status) {
    case 'pending': return 'Chờ xác nhận';
    case 'confirmed': return 'Đã xác nhận';
    case 'preparing': return 'Đang chuẩn bị';
    case 'shipping': return 'Đang giao hàng';
    case 'completed': return 'Đã hoàn thành';
    case 'cancelled': return 'Đã hủy';
    default: return status;
  }
};

const getStatusBadgeClass = (status: Order['order_status']) => {
  switch (status) {
    case 'pending':
      return 'bg-amber-100 text-amber-800 border-amber-200';
    case 'confirmed':
      return 'bg-blue-100 text-blue-800 border-blue-200';
    case 'preparing':
      return 'bg-indigo-100 text-indigo-800 border-indigo-200';
    case 'shipping':
      return 'bg-purple-100 text-purple-800 border-purple-200';
    case 'completed':
      return 'bg-emerald-100 text-emerald-800 border-emerald-200';
    case 'cancelled':
      return 'bg-rose-100 text-rose-800 border-rose-200';
    default:
      return 'bg-slate-100 text-slate-800 border-slate-200';
  }
};

const canCancel = computed(() => {
  if (!order.value) return false;
  const status = order.value.order_status;
  // Backend only allows cancelling pending orders
  return status === 'pending';
});

const canReturn = computed(() => {
  if (!order.value) return false;
  return order.value.order_status === 'completed';
});

// Cancel Order action
const executeCancelOrder = async () => {
  if (!order.value) return;
  
  isCancelling.value = true;
  try {
    const reason = cancelReasonInput.value.trim() || 'Khách hàng chủ động hủy qua trang web';
    const res = await orderService.cancelOrder(order.value.order_id, reason);
    if (res.success) {
      showCancelModal.value = false;
      alert('Hủy đơn hàng thành công!');
      await loadOrder();
    } else {
      alert(res.message || 'Hủy đơn hàng thất bại.');
    }
  } catch (err: any) {
    console.error('Cancel order error:', err);
    alert(err.response?.data?.detail || 'Không thể hủy đơn hàng vào lúc này.');
  } finally {
    isCancelling.value = false;
  }
};

// Create return request action
const submitReturnRequest = async () => {
  if (!order.value) return;

  const returnItems: any[] = [];
  
  order.value.items.forEach((detail: any) => {
    const selection = selectedItemsToReturn.value[detail.order_detail_id];
    if (selection && selection.selected) {
      returnItems.push({
        sku_id: detail.sku_id,
        quantity: Math.min(selection.quantity, detail.quantity)
      });
    }
  });

  if (returnItems.length === 0) {
    alert('Vui lòng chọn ít nhất một sản phẩm cần đổi trả!');
    return;
  }

  isSubmittingReturn.value = true;
  try {
    const returnData = {
      request_type: returnType.value,
      reason: returnReason.value,
      reason_note: returnReasonNote.value.trim(),
      items: returnItems
    };

    const res = await orderService.createReturn(order.value.order_id, returnData);
    if (res.success) {
      showReturnModal.value = false;
      alert('Gửi yêu cầu đổi trả thành công. Nhân viên cửa hàng sẽ liên hệ với bạn sớm nhất!');
      await loadOrder();
    } else {
      alert(res.message || 'Gửi yêu cầu đổi trả thất bại.');
    }
  } catch (err: any) {
    console.error('Return request error:', err);
    alert(err.response?.data?.detail || 'Không thể gửi yêu cầu đổi trả vào lúc này.');
  } finally {
    isSubmittingReturn.value = false;
  }
};
</script>

<template>
  <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12" v-if="order">
    <!-- Breadcrumbs -->
    <nav class="flex mb-8 text-xs font-bold text-slate-400 uppercase tracking-wider space-x-2">
      <router-link to="/" class="hover:text-slate-900">Trang chủ</router-link>
      <span>/</span>
      <router-link to="/orders" class="hover:text-slate-900">Đơn hàng của tôi</router-link>
      <span>/</span>
      <span class="text-slate-900">Chi tiết {{ order.order_code }}</span>
    </nav>

    <!-- Success Order Header Info -->
    <div class="bg-white border border-slate-100 rounded-3xl p-6 md:p-8 shadow-premium mb-8 text-left">
      <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-5 mb-5">
        <div>
          <h1 class="text-2xl font-black text-slate-900 font-sans tracking-wide uppercase">Chi tiết đơn hàng</h1>
          <p class="text-xs font-bold text-slate-400 mt-1 uppercase tracking-wide">
            Mã đơn: <span class="text-slate-950">{{ order.order_code }}</span>
          </p>
        </div>
        <div class="flex items-center space-x-3">
          <span 
            class="border text-xs font-bold px-3 py-1 rounded-full"
            :class="getStatusBadgeClass(order.order_status)"
          >
            {{ getStatusName(order.order_status) }}
          </span>
          <button 
            v-if="canCancel"
            @click="showCancelModal = true"
            class="bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs px-3.5 py-1.5 rounded-xl transition-all"
          >
            Hủy đơn hàng
          </button>
          <button 
            v-if="canReturn"
            @click="showReturnModal = true"
            class="bg-slate-900 hover:bg-slate-950 text-white font-bold text-xs px-3.5 py-1.5 rounded-xl transition-all"
          >
            Đổi trả sản phẩm
          </button>
        </div>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-8 text-sm">
        <!-- Left details: Delivery info -->
        <div class="space-y-3">
          <h3 class="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Thông tin người nhận</h3>
          <p class="text-slate-800">Họ và tên: <strong class="text-slate-900">{{ order.receiver_name }}</strong></p>
          <p class="text-slate-800">Số điện thoại: <strong class="text-slate-900">{{ order.receiver_phone }}</strong></p>
          <p class="text-slate-800">Địa chỉ nhận hàng: <span class="text-slate-900 font-medium">{{ order.shipping_address }}</span></p>
          <p class="text-slate-800" v-if="order.note">Ghi chú giao nhận: <span class="text-slate-500 italic">"{{ order.note }}"</span></p>
        </div>
        
        <!-- Right details: payment and timing -->
        <div class="space-y-3">
          <h3 class="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Phương thức & Thời gian</h3>
          <p class="text-slate-800">Phương thức thanh toán: 
            <strong class="text-slate-900 uppercase">
              {{ order.payment_method === 'cod' ? 'COD (Tiền mặt)' : 'Chuyển khoản ngân hàng' }}
            </strong>
          </p>
          <p class="text-slate-800">Thời gian khởi tạo: <span class="font-bold text-slate-700">{{ formatDate(order.created_at) }}</span></p>
          <p class="text-slate-800" v-if="order.cancelled_at">Thời gian hủy đơn: <span class="font-bold text-rose-600">{{ formatDate(order.cancelled_at) }}</span></p>
          <p class="text-slate-800 font-bold text-rose-600" v-if="order.cancelled_reason">Lý do hủy đơn: "{{ order.cancelled_reason }}"</p>
        </div>
      </div>
    </div>

    <!-- Items list table section -->
    <div class="bg-white border border-slate-100 rounded-3xl p-6 md:p-8 shadow-premium mb-8 text-left">
      <h2 class="text-lg font-bold text-slate-900 mb-6 font-sans uppercase border-b border-slate-100 pb-3">Sản phẩm đã mua</h2>
      
      <div class="divide-y divide-slate-100">
        <div v-for="item in order.items" :key="item.order_detail_id" class="flex py-4 justify-between items-center">
          <div class="flex items-center space-x-4">
            <img 
              :src="item.image_url_snapshot || '/placeholder_image.png'" 
              :alt="item.product_name_snapshot"
              class="h-16 w-16 rounded-xl object-cover bg-slate-50 border border-slate-100 flex-shrink-0"
            />
            <div>
              <h3 class="text-sm font-bold text-slate-900">{{ item.product_name_snapshot }}</h3>
              <p class="text-xs text-slate-400 mt-1">Size: {{ item.size_snapshot }} | Màu: {{ item.color_name_snapshot }}</p>
              <p class="text-xs text-slate-500 font-bold mt-1">SL: {{ item.quantity }} x {{ formatPrice(item.discounted_price) }}</p>
            </div>
          </div>
          <span class="text-sm font-black text-slate-900">{{ formatPrice(item.line_total) }}</span>
        </div>
      </div>

      <!-- Total calculations -->
      <div class="border-t border-slate-100 pt-5 mt-4 space-y-2 text-sm text-slate-600">
        <div class="flex justify-between">
          <span>Tạm tính hàng hóa:</span>
          <span class="font-bold text-slate-800">{{ formatPrice(order.subtotal_amount) }}</span>
        </div>
        <div class="flex justify-between" v-if="order.voucher_discount_amount > 0">
          <span>Giảm giá Voucher ({{ order.voucher_code_snapshot }}):</span>
          <span class="font-bold text-brand-accent">-{{ formatPrice(order.voucher_discount_amount) }}</span>
        </div>
        <div class="flex justify-between">
          <span>Phí vận chuyển:</span>
          <span class="font-bold text-slate-800">{{ formatPrice(order.shipping_fee) }}</span>
        </div>
        <div class="flex justify-between border-t border-slate-100 pt-4 text-base font-extrabold text-slate-900">
          <span>Tổng thanh toán:</span>
          <span class="text-xl text-brand-blue">{{ formatPrice(order.total_amount) }}</span>
        </div>
      </div>
    </div>

    <!-- Status History timeline section -->
    <div class="bg-white border border-slate-100 rounded-3xl p-6 md:p-8 shadow-premium text-left">
      <h2 class="text-lg font-bold text-slate-900 mb-6 font-sans uppercase border-b border-slate-100 pb-3">Lịch sử đơn hàng</h2>
      
      <div class="flow-root">
        <ul role="list" class="-mb-8">
          <li v-for="(log, logIdx) in order.status_history" :key="log.status_log_id">
            <div class="relative pb-8">
              <!-- Connector line -->
              <span v-if="logIdx !== order.status_history.length - 1" class="absolute top-4 left-4 -ml-px h-full w-0.5 bg-slate-200" aria-hidden="true"></span>
              
              <div class="relative flex space-x-3 items-start">
                <!-- Checkpoint Dot -->
                <div>
                  <span class="h-8 w-8 rounded-full bg-slate-900 text-white flex items-center justify-center ring-8 ring-white">
                    <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2 4-4" />
                    </svg>
                  </span>
                </div>
                
                <!-- Timing and details description -->
                <div class="min-w-0 flex-1 pt-1.5 flex justify-between space-x-4">
                  <div>
                    <p class="text-sm font-bold text-slate-900">{{ getStatusName(log.new_status as Order['order_status']) }}</p>
                    <p class="text-xs text-slate-500 mt-1" v-if="log.note">{{ log.note }}</p>
                  </div>
                  <div class="text-right text-xs whitespace-nowrap text-slate-400 font-bold">
                    <time>{{ formatDate(log.changed_at) }}</time>
                  </div>
                </div>
              </div>
            </div>
          </li>
        </ul>
      </div>
    </div>

    <!-- Modal Hủy Đơn Hàng -->

    <div v-if="showCancelModal" class="fixed inset-0 z-50 flex items-center justify-center overflow-hidden">
      <div class="absolute inset-0 bg-slate-900 bg-opacity-60 backdrop-blur-sm" @click="showCancelModal = false"></div>
      <div class="bg-white rounded-3xl max-w-md w-full p-6 z-10 shadow-2xl text-left space-y-4">
        <h3 class="text-lg font-bold text-slate-950 font-sans uppercase">Hủy đơn hàng của bạn</h3>
        <p class="text-xs text-slate-500">Đơn hàng của bạn sẽ được chuyển sang trạng thái "Đã hủy" và không thể đổi trạng thái khác.</p>
        
        <div>
          <label class="block text-xs font-bold text-slate-500 uppercase mb-2">Lý do hủy đơn hàng *</label>
          <input 
            type="text" 
            v-model="cancelReasonInput"
            placeholder="Nhập lý do ví dụ: đặt nhầm size, đổi địa chỉ..."
            class="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-brand-blue"
          />
        </div>

        <div class="flex space-x-3.5 pt-2">
          <button 
            @click="showCancelModal = false"
            class="flex-1 border border-slate-200 hover:border-slate-800 text-slate-700 font-bold text-xs py-3 rounded-xl transition-all"
          >
            Đóng
          </button>
          <button 
            @click="executeCancelOrder"
            :disabled="isCancelling"
            class="flex-1 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs py-3 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            {{ isCancelling ? 'Đang Hủy...' : 'Xác nhận Hủy Đơn' }}
          </button>
        </div>
      </div>
    </div>

    <!-- Modal Đổi Trả Sản Phẩm -->
     
    <div v-if="showReturnModal" class="fixed inset-0 z-50 flex items-center justify-center overflow-hidden">
      <div class="absolute inset-0 bg-slate-900 bg-opacity-60 backdrop-blur-sm" @click="showReturnModal = false"></div>
      <div class="bg-white rounded-3xl max-w-lg w-full p-6 md:p-8 z-10 shadow-2xl text-left overflow-y-auto max-h-[85vh] space-y-6">
        <h3 class="text-lg font-bold text-slate-950 font-sans uppercase border-b pb-3">Đổi trả sản phẩm</h3>
        
        <!-- Selection of Items to Return -->
        <div class="space-y-3">
          <p class="text-xs font-bold text-slate-400 uppercase">1. Chọn sản phẩm đổi trả:</p>
          <div v-for="item in order.items" :key="item.order_detail_id" class="flex items-center space-x-3 p-3 border rounded-xl">
            <input 
              type="checkbox" 
              v-model="selectedItemsToReturn[item.order_detail_id].selected"
              class="rounded border-slate-300 text-brand-blue focus:ring-brand-blue h-4 w-4"
            />
            <img :src="item.image_url_snapshot || '/placeholder_image.png'" class="h-10 w-10 rounded object-cover border" />
            <div class="flex-1 text-xs">
              <p class="font-bold text-slate-800">{{ item.product_name_snapshot }}</p>
              <p class="text-slate-400 mt-0.5">Size: {{ item.size_snapshot }} | Màu: {{ item.color_name_snapshot }}</p>
            </div>
            
            <div class="flex items-center border rounded-lg">
              <button 
                @click="selectedItemsToReturn[item.order_detail_id].quantity = Math.max(1, selectedItemsToReturn[item.order_detail_id].quantity - 1)"
                class="px-2 py-0.5 font-bold"
              >-</button>
              <span class="px-2 font-bold text-xs">{{ selectedItemsToReturn[item.order_detail_id].quantity }}</span>
              <button 
                @click="selectedItemsToReturn[item.order_detail_id].quantity = Math.min(item.quantity, selectedItemsToReturn[item.order_detail_id].quantity + 1)"
                class="px-2 py-0.5 font-bold"
              >+</button>
            </div>
          </div>
        </div>

        <!-- Return Type -->
        <div>
          <p class="text-xs font-bold text-slate-400 uppercase mb-2">2. Hình thức yêu cầu:</p>
          <div class="flex space-x-4">
            <label class="flex items-center space-x-2 cursor-pointer">
              <input type="radio" value="refund" v-model="returnType" class="text-brand-blue" />
              <span class="text-xs font-bold text-slate-700">Hoàn tiền lại</span>
            </label>
            <label class="flex items-center space-x-2 cursor-pointer">
              <input type="radio" value="exchange" v-model="returnType" class="text-brand-blue" />
              <span class="text-xs font-bold text-slate-700">Đổi size/màu sắc</span>
            </label>
          </div>
        </div>

        <!-- Return Reason -->
        <div>
          <p class="text-xs font-bold text-slate-400 uppercase mb-2">3. Lý do đổi trả:</p>
          <select 
            v-model="returnReason"
            class="w-full border border-slate-200 rounded-xl px-4 py-3 text-xs bg-white focus:outline-none"
          >
            <option value="wrong_size">Không vừa kích thước (Size)</option>
            <option value="wrong_color">Sai màu sắc so với ảnh sản phẩm</option>
            <option value="defective">Sản phẩm bị lỗi kỹ thuật, bong tróc</option>
            <option value="wrong_item">Giao sai mẫu mã sản phẩm đặt mua</option>
            <option value="other">Lý do khách hàng khác</option>
          </select>
        </div>

        <!-- Note details -->
        <div>
          <label class="block text-xs font-bold text-slate-400 uppercase mb-2">4. Chi tiết lý do của bạn</label>
          <textarea 
            v-model="returnReasonNote"
            rows="2"
            placeholder="Nhập mô tả cụ thể về tình trạng lỗi hoặc size đổi muốn nhận..."
            class="w-full border border-slate-200 rounded-xl px-4 py-3 text-xs focus:outline-none resize-none"
          ></textarea>
        </div>

        <div class="flex space-x-3.5 pt-2">
          <button 
            @click="showReturnModal = false"
            class="flex-1 border border-slate-200 hover:border-slate-800 text-slate-700 font-bold text-xs py-3 rounded-xl transition-all"
          >
            Hủy bỏ
          </button>
          <button 
            @click="submitReturnRequest"
            :disabled="isSubmittingReturn"
            class="flex-1 bg-slate-950 hover:bg-black text-white font-bold text-xs py-3 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            {{ isSubmittingReturn ? 'Đang gửi...' : 'Gửi yêu cầu' }}
          </button>
        </div>
      </div>
    </div>

  </div>
</template>
