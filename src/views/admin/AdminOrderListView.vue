<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { adminOrderService } from '../../services/admin/order.service';
import type { Order, ReturnRequest } from '../../types';
import ConfirmDialog from '@/components/common/ConfirmDialog.vue';
import Pagination from '@/components/common/Pagination.vue';

const orders = ref<Order[]>([]);
const returnRequests = ref<ReturnRequest[]>([]);
const activeTab = ref<'orders' | 'returns'>('orders');
const orderFilter = ref<string>('all');
const searchOrder = ref('');
const orderPage = ref(1);
const orderTotalPages = ref(1);
const isLoading = ref(true);

onMounted(() => {
  loadOrders();
  loadReturns();
});

const loadOrders = async () => {
  try {
    isLoading.value = true;
    const res = await adminOrderService.getOrders({
      page: orderPage.value,
      limit: 10,
      status: orderFilter.value === 'all' ? undefined : orderFilter.value,
      order_code: searchOrder.value || undefined
    });
    if (res.success && res.data) {
      orders.value = res.data;
      orderTotalPages.value = res.pagination.total_pages;
    }
  } catch (e) {
    console.error('Failed to load orders:', e);
  } finally {
    isLoading.value = false;
  }
};

const loadReturns = async () => {
  try {
    const res = await adminOrderService.getReturns();
    if (res.success && res.data) {
      returnRequests.value = res.data;
    }
  } catch (e) {
    console.error('Failed to load return requests:', e);
  }
};

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

const getStatusBadgeClass = (status: string) => {
  switch (status) {
    case 'pending': return 'bg-amber-100 text-amber-800 border-amber-200';
    case 'confirmed': return 'bg-blue-100 text-blue-800 border-blue-200';
    case 'preparing': return 'bg-indigo-100 text-indigo-800 border-indigo-200';
    case 'shipping': return 'bg-purple-100 text-purple-800 border-purple-200';
    case 'completed': return 'bg-emerald-100 text-emerald-800 border-emerald-200';
    case 'cancelled': return 'bg-rose-100 text-rose-800 border-rose-200';
    case 'approved': return 'bg-blue-100 text-blue-800 border-blue-200';
    case 'rejected': return 'bg-rose-100 text-rose-800 border-rose-200';
    default: return 'bg-slate-100 text-slate-800 border-slate-200';
  }
};

const filteredOrders = computed(() => {
  if (orderFilter.value === 'all') return orders.value;
  return orders.value.filter(o => o.order_status === orderFilter.value);
});

// Update order status via backend
const handleUpdateStatus = async (orderId: number, nextStatus: Order['order_status']) => {
  try {
    const res = await adminOrderService.updateStatus(orderId, nextStatus);
    if (res.success) {
      alert(`Cập nhật trạng thái đơn hàng thành công.`);
      loadOrders();
    } else {
      alert(res.message || 'Cập nhật thất bại.');
    }
  } catch (err: any) {
    alert(err.response?.data?.detail || err.message || 'Lỗi hệ thống');
  }
};

const confirmState = ref({
  show: false,
  title: 'Xác nhận hủy đơn hàng',
  message: 'Vui lòng nhập lý do hủy đơn hàng:',
  orderId: 0,
  withInput: true,
  inputPlaceholder: 'Ví dụ: Hết hàng, khách yêu cầu...'
});

const handleAdminCancelOrder = (orderId: number) => {
  confirmState.value.orderId = orderId;
  confirmState.value.show = true;
};

const executeCancelOrder = async (reason?: string) => {
  confirmState.value.show = false;
  try {
    const res = await adminOrderService.cancelOrder(confirmState.value.orderId, reason || 'Hủy bởi Quản trị viên');
    if (res.success) {
      alert('Đơn hàng đã được hủy thành công.');
      loadOrders();
    } else {
      alert(res.message || 'Hủy đơn thất bại.');
    }
  } catch (err: any) {
    alert(err.response?.data?.detail || err.message || 'Lỗi hệ thống');
  }
};

// Approve/Reject return request
const handleReviewReturn = async (returnId: number, action: 'approved' | 'rejected') => {
  try {
    const note = action === 'approved' ? 'Đã duyệt yêu cầu đổi trả' : 'Đã từ chối yêu cầu đổi trả';
    const res = await adminOrderService.reviewReturn(returnId, action, note);
    if (res.success) {
      alert(`Đã xử lý yêu cầu đổi trả thành công.`);
      loadReturns();
    }
  } catch (err: any) {
    alert(err.response?.data?.detail || err.message || 'Lỗi hệ thống');
  }
};

// Complete return request (adjust inventory automatically on BE)
const handleCompleteReturn = async (returnId: number) => {
  try {
    const res = await adminOrderService.completeReturn(returnId);
    if (res.success) {
      alert('Đã xác nhận hoàn tất đổi trả hàng và cập nhật tồn kho.');
      loadReturns();
    }
  } catch (err: any) {
    alert(err.response?.data?.detail || err.message || 'Lỗi hệ thống');
  }
};

// Helper trigger on filter tab click
const setFilter = (st: string) => {
  orderFilter.value = st;
  loadOrders();
};
</script>

<template>
  <div class="space-y-8 text-left">
    <!-- Header Tab selection -->
    <div class="flex flex-col md:flex-row md:items-end justify-between border-b pb-5">
      <div>
        <h1 class="text-2xl font-black text-slate-900 font-sans uppercase">Quản lý Đơn hàng & Đổi trả</h1>
        <p class="text-xs text-slate-400 font-bold mt-1 uppercase tracking-wide">Xử lý quy trình xác nhận, chuẩn bị hàng, giao hàng và đổi trả hàng</p>
      </div>

      <div class="flex space-x-2 mt-4 md:mt-0 bg-slate-200/60 p-1 rounded-full">
        <button 
          @click="activeTab = 'orders'"
          class="px-5 py-2 rounded-full text-xs font-bold transition-all"
          :class="activeTab === 'orders' ? 'bg-slate-950 text-white shadow' : 'text-slate-600 hover:text-slate-900'"
        >
          Đơn hàng hệ thống
        </button>
        <button 
          @click="activeTab = 'returns'"
          class="px-5 py-2 rounded-full text-xs font-bold transition-all"
          :class="activeTab === 'returns' ? 'bg-slate-950 text-white shadow' : 'text-slate-600 hover:text-slate-900'"
        >
          Yêu cầu Đổi Trả ({{ returnRequests.filter(r => r.status === 'pending').length }})
        </button>
      </div>
    </div>

    <!-- Active view: Orders -->
    <div v-if="activeTab === 'orders'" class="space-y-6">
      <!-- Order Filter Tabs -->
      <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div class="flex flex-wrap gap-2.5">
          <button 
            @click="setFilter('all')"
            class="border px-4 py-2 rounded-xl text-xs font-bold shadow-sm transition-all"
            :class="orderFilter === 'all' ? 'bg-slate-950 text-white border-slate-950' : 'bg-white border-slate-200 text-slate-600 hover:border-slate-400'"
          >
            Tất cả
          </button>
          <button 
            v-for="st in ['pending', 'confirmed', 'preparing', 'shipping', 'completed', 'cancelled']"
            :key="st"
            @click="setFilter(st)"
            class="border px-4 py-2 rounded-xl text-xs font-bold shadow-sm transition-all"
            :class="orderFilter === st ? 'bg-slate-950 text-white border-slate-950' : 'bg-white border-slate-200 text-slate-600 hover:border-slate-400'"
          >
            {{ getStatusName(st as Order['order_status']) }}
          </button>
        </div>
        
        <div class="flex gap-2">
          <input 
            type="text" 
            v-model="searchOrder" 
            placeholder="Tìm mã đơn..." 
            class="px-4 py-2 border rounded-xl text-xs focus:ring-2 focus:ring-brand-accent focus:outline-none w-48"
            @keyup.enter="loadOrders"
          />
          <button @click="loadOrders" class="px-4 py-2 bg-slate-900 text-white font-bold rounded-xl text-xs">Tìm</button>
        </div>
      </div>

      <!-- Loading State -->
      <div v-if="isLoading" class="py-12 flex justify-center items-center">
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-900"></div>
      </div>

      <!-- Orders table list -->
      <div v-else class="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-premium">
        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-slate-100 text-xs text-left">
            <thead>
              <tr class="bg-slate-50 text-slate-400 font-bold uppercase tracking-wider">
                <th class="py-4 px-6">Mã đơn</th>
                <th class="py-4 px-6">Người nhận / SĐT</th>
                <th class="py-4 px-4">Ngày đặt</th>
                <th class="py-4 px-4 text-right">Tổng thanh toán</th>
                <th class="py-4 px-6">Trạng thái</th>
                <th class="py-4 px-6 text-center">Hành động</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100 text-slate-700 font-medium">
              <tr v-if="filteredOrders.length === 0">
                <td colspan="6" class="py-12 text-center text-slate-400 text-xs uppercase font-bold">
                  Không tìm thấy đơn hàng nào.
                </td>
              </tr>
              <tr v-else v-for="o in filteredOrders" :key="o.order_id" class="hover:bg-slate-50/50">
                <td class="py-4 px-6 font-bold text-slate-900">
                  {{ o.order_code }}
                  <span class="block font-mono text-[9px] text-slate-400 font-normal mt-0.5" v-if="o.voucher_code_snapshot">
                    Voucher: {{ o.voucher_code_snapshot }}
                  </span>
                </td>
                <td class="py-4 px-6">
                  <div>{{ o.receiver_name }}</div>
                  <div class="text-[10px] text-slate-400 mt-0.5">{{ o.receiver_phone }}</div>
                </td>
                <td class="py-4 px-4">{{ formatDate(o.created_at) }}</td>
                <td class="py-4 px-4 text-right font-bold text-slate-900">{{ formatPrice(o.total_amount) }}</td>
                <td class="py-4 px-6">
                  <span 
                    class="px-2.5 py-0.5 rounded-full text-[10px] font-bold border"
                    :class="getStatusBadgeClass(o.order_status)"
                  >
                    {{ getStatusName(o.order_status) }}
                  </span>
                </td>
                <td class="py-4 px-6">
                  <div class="flex items-center justify-center space-x-2">
                    <button 
                      v-if="o.order_status === 'pending'"
                      @click="handleUpdateStatus(o.order_id as number, 'confirmed')"
                      class="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-2.5 py-1.5 rounded-lg transition-all"
                    >
                      Xác nhận
                    </button>
                    <button 
                      v-if="o.order_status === 'confirmed'"
                      @click="handleUpdateStatus(o.order_id as number, 'preparing')"
                      class="bg-blue-600 hover:bg-blue-700 text-white font-bold px-2.5 py-1.5 rounded-lg transition-all"
                    >
                      Chuẩn bị hàng
                    </button>
                    <button 
                      v-if="o.order_status === 'preparing'"
                      @click="handleUpdateStatus(o.order_id as number, 'shipping')"
                      class="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-2.5 py-1.5 rounded-lg transition-all"
                    >
                      Giao hàng
                    </button>
                    <button 
                      v-if="o.order_status === 'shipping'"
                      @click="handleUpdateStatus(o.order_id as number, 'completed')"
                      class="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-2.5 py-1.5 rounded-lg transition-all"
                    >
                      Hoàn thành
                    </button>
                    <button 
                      v-if="['pending', 'confirmed', 'preparing'].includes(o.order_status)"
                      @click="handleAdminCancelOrder(o.order_id as number)"
                      class="border border-rose-200 text-rose-600 hover:bg-rose-50 font-bold px-2.5 py-1.5 rounded-lg transition-all"
                    >
                      Hủy đơn
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <Pagination 
          v-model:currentPage="orderPage" 
          :total-pages="orderTotalPages" 
          @change="loadOrders" 
        />
      </div>
    </div>

    <!-- Active view: Returns -->
    <div v-if="activeTab === 'returns'" class="space-y-6">
      <div class="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-premium">
        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-slate-100 text-xs text-left">
            <thead>
              <tr class="bg-slate-50 text-slate-400 font-bold uppercase tracking-wider">
                <th class="py-4 px-6">Đơn gốc</th>
                <th class="py-4 px-6">Loại yêu cầu</th>
                <th class="py-4 px-6">Lý do</th>
                <th class="py-4 px-4">Ngày yêu cầu</th>
                <th class="py-4 px-4">Trạng thái</th>
                <th class="py-4 px-6 text-center">Hành động</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100 text-slate-700 font-medium">
              <tr v-if="returnRequests.length === 0">
                <td colspan="6" class="py-12 text-center text-slate-400 text-xs uppercase font-bold">
                  Không có yêu cầu đổi trả nào.
                </td>
              </tr>
              <tr v-else v-for="r in returnRequests" :key="r.return_id" class="hover:bg-slate-50/50">
                <td class="py-4 px-6 font-bold text-slate-900">{{ r.order_code }}</td>
                <td class="py-4 px-6 font-semibold">
                  <span :class="r.request_type === 'exchange' ? 'text-blue-600' : 'text-amber-600'">
                    {{ r.request_type === 'exchange' ? 'Đổi hàng' : 'Trả tiền' }}
                  </span>
                </td>
                <td class="py-4 px-6">
                  <div class="font-semibold">{{ r.reason === 'defective' ? 'Hàng lỗi' : r.reason === 'wrong_size' ? 'Nhầm size' : 'Lý do khác' }}</div>
                  <div class="text-[10px] text-slate-400 font-normal mt-0.5" v-if="r.reason_note">{{ r.reason_note }}</div>
                </td>
                <td class="py-4 px-4">{{ formatDate(r.created_at) }}</td>
                <td class="py-4 px-4">
                  <span 
                    class="px-2 py-0.5 rounded text-[10px] font-bold border"
                    :class="getStatusBadgeClass(r.status)"
                  >
                    {{ r.status === 'pending' ? 'Chờ duyệt' : r.status === 'approved' ? 'Đã duyệt' : r.status === 'rejected' ? 'Từ chối' : 'Hoàn tất' }}
                  </span>
                </td>
                <td class="py-4 px-6">
                  <div class="flex items-center justify-center space-x-2">
                    <button 
                      v-if="r.status === 'pending'"
                      @click="handleReviewReturn(r.return_id as number, 'approved')"
                      class="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-2.5 py-1.5 rounded-lg transition-all"
                    >
                      Duyệt
                    </button>
                    <button 
                      v-if="r.status === 'pending'"
                      @click="handleReviewReturn(r.return_id as number, 'rejected')"
                      class="border border-rose-200 text-rose-600 hover:bg-rose-50 font-bold px-2.5 py-1.5 rounded-lg transition-all"
                    >
                      Từ chối
                    </button>
                    <button 
                      v-if="r.status === 'approved'"
                      @click="handleCompleteReturn(r.return_id as number)"
                      class="bg-slate-900 hover:bg-black text-white font-bold px-2.5 py-1.5 rounded-lg transition-all"
                    >
                      Hoàn tất kho
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
    
    <ConfirmDialog 
      :show="confirmState.show" 
      :title="confirmState.title" 
      :message="confirmState.message"
      :with-input="confirmState.withInput"
      :input-placeholder="confirmState.inputPlaceholder"
      type="danger"
      confirm-text="Hủy đơn"
      @confirm="executeCancelOrder" 
      @cancel="confirmState.show = false" 
    />
  </div>
</template>
