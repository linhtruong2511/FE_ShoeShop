<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import type { Order } from '../types';

const orders = ref<Order[]>([]);
const activeFilter = ref<string>('all');

onMounted(() => {
  const savedOrders = localStorage.getItem('myshoes_orders');
  if (savedOrders) {
    try {
      orders.value = JSON.parse(savedOrders);
    } catch (e) {
      console.error('Failed to parse orders', e);
    }
  }
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

const filteredOrders = computed(() => {
  if (activeFilter.value === 'all') {
    return orders.value;
  }
  return orders.value.filter(o => o.order_status === activeFilter.value);
});
</script>

<template>
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
    <nav class="flex mb-8 text-xs font-bold text-slate-400 uppercase tracking-wider space-x-2">
      <router-link to="/" class="hover:text-slate-900">Trang chủ</router-link>
      <span>/</span>
      <span class="text-slate-900">Đơn hàng của tôi</span>
    </nav>

    <div class="flex flex-col md:flex-row md:items-end justify-between mb-8">
      <div class="text-left">
        <h1 class="text-3xl font-black text-slate-900 font-sans uppercase">Đơn hàng của tôi</h1>
        <p class="text-xs text-slate-400 font-bold mt-1 uppercase tracking-wide">Quản lý lịch sử mua hàng và trạng thái đơn hàng của bạn</p>
      </div>

      <!-- Filters Tabs -->
      <div class="flex flex-wrap gap-2 mt-4 md:mt-0 bg-slate-50 border border-slate-100 p-1.5 rounded-2xl">
        <button 
          @click="activeFilter = 'all'"
          class="px-4 py-1.5 rounded-xl text-xs font-bold transition-all"
          :class="activeFilter === 'all' ? 'bg-slate-950 text-white shadow-sm' : 'text-slate-500 hover:text-slate-900'"
        >
          Tất cả ({{ orders.length }})
        </button>
        <button 
          v-for="status in ['pending', 'confirmed', 'preparing', 'shipping', 'completed', 'cancelled']"
          :key="status"
          @click="activeFilter = status"
          class="px-4 py-1.5 rounded-xl text-xs font-bold transition-all capitalize"
          :class="activeFilter === status ? 'bg-slate-950 text-white shadow-sm' : 'text-slate-500 hover:text-slate-900'"
        >
          {{ getStatusName(status as Order['order_status']) }}
        </button>
      </div>
    </div>

    <!-- Empty state -->
    <div v-if="filteredOrders.length === 0" class="bg-white rounded-3xl p-16 text-center border border-slate-100 shadow-premium">
      <div class="rounded-full bg-slate-50 p-6 text-slate-400 max-w-max mx-auto mb-4">
        <svg class="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
        </svg>
      </div>
      <h3 class="text-lg font-bold text-slate-800">Không tìm thấy đơn hàng nào</h3>
      <p class="text-xs text-slate-400 mt-1 mb-6 uppercase font-bold tracking-wider">Bạn không có đơn hàng nào trong trạng thái này.</p>
      <router-link to="/products" class="rounded-full bg-slate-950 px-6 py-2.5 text-sm font-bold text-white shadow hover:bg-opacity-95 transition-all">
        Mua sắm ngay
      </router-link>
    </div>

    <!-- Orders grid -->
    <div v-else class="space-y-6">
      <div 
        v-for="order in filteredOrders" 
        :key="order.order_id" 
        class="bg-white rounded-3xl border border-slate-100 shadow-premium p-6 flex flex-col md:flex-row md:items-center md:justify-between text-left"
      >
        <div class="space-y-3.5">
          <div class="flex items-center space-x-3">
            <span class="text-sm font-extrabold text-slate-900">{{ order.order_code }}</span>
            <span 
              class="border text-[10px] font-bold px-2.5 py-0.5 rounded-full"
              :class="getStatusBadgeClass(order.order_status)"
            >
              {{ getStatusName(order.order_status) }}
            </span>
          </div>
          <p class="text-xs text-slate-400 font-semibold">
            Ngày đặt hàng: <span class="text-slate-600 font-bold">{{ formatDate(order.created_at) }}</span>
          </p>
          
          <!-- Quick item preview -->
          <div class="flex items-center space-x-2.5 overflow-x-auto py-1">
            <div 
              v-for="item in order.items.slice(0, 3)" 
              :key="item.order_detail_id" 
              class="h-10 w-10 rounded-lg overflow-hidden border border-slate-100 flex-shrink-0"
              :title="item.product_name_snapshot"
            >
              <img :src="item.image_url_snapshot" :alt="item.product_name_snapshot" class="h-full w-full object-cover" />
            </div>
            <span class="text-xs text-slate-400 font-semibold" v-if="order.items.length > 3">
              và {{ order.items.length - 3 }} sản phẩm khác
            </span>
          </div>
        </div>

        <div class="mt-6 md:mt-0 flex flex-col md:items-end justify-between space-y-3.5">
          <div>
            <span class="text-xs font-semibold text-slate-400 block mb-0.5">Tổng số thanh toán:</span>
            <span class="text-lg font-black text-brand-blue">{{ formatPrice(order.total_amount) }}</span>
          </div>

          <router-link 
            :to="`/orders/${order.order_id}`"
            class="rounded-xl border border-slate-200 hover:border-slate-800 text-slate-700 hover:text-slate-900 font-bold text-xs px-4 py-2.5 shadow-sm transition-all text-center"
          >
            Xem chi tiết đơn hàng
          </router-link>
        </div>
      </div>
    </div>
  </div>
</template>
