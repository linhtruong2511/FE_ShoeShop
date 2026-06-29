<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { mockProducts, mockVouchers } from '../../mocks/products';
import { getDiscountedPrice } from '../../stores/cart';
import type { Order } from '../../types';

const orders = ref<Order[]>([]);

onMounted(() => {
  const savedOrders = localStorage.getItem('myshoes_orders');
  if (savedOrders) {
    try {
      orders.value = JSON.parse(savedOrders);
    } catch (e) {
      console.error(e);
    }
  }
});

const formatPrice = (value: number) => {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
};

// Summary metrics
const totalRevenue = computed(() => {
  return orders.value
    .filter(o => o.order_status === 'completed')
    .reduce((sum, o) => sum + o.total_amount, 0);
});

const totalOrdersCount = computed(() => orders.value.length);
const pendingOrdersCount = computed(() => orders.value.filter(o => o.order_status === 'pending').length);
const completedOrdersCount = computed(() => orders.value.filter(o => o.order_status === 'completed').length);

const itemsSold = computed(() => {
  return orders.value
    .filter(o => o.order_status === 'completed')
    .reduce((sum, o) => sum + o.details.reduce((itemSum, item) => itemSum + item.quantity, 0), 0);
});

// Low stock warnings (under 5 items)
const lowStockSkus = computed(() => {
  const warnings: Array<{
    product_name: string;
    color_name: string;
    size: string;
    sku_code: string;
    stock: number;
  }> = [];

  mockProducts.forEach(p => {
    p.colors.forEach(c => {
      c.skus.forEach(s => {
        if (s.stock_quantity <= 5) {
          warnings.push({
            product_name: p.product_name,
            color_name: c.color_name,
            size: s.size,
            sku_code: s.sku_code,
            stock: s.stock_quantity
          });
        }
      });
    });
  });

  return warnings.sort((a, b) => a.stock - b.stock).slice(0, 10);
});

// Best seller (based on sold_quantity of mock data + order simulation completed)
const bestSellers = computed(() => {
  const list: Array<{
    product_name: string;
    color_name: string;
    size: string;
    sku_code: string;
    sold: number;
    price: number;
  }> = [];

  mockProducts.forEach(p => {
    p.colors.forEach(c => {
      c.skus.forEach(s => {
        // base sold quantity + actual completed orders count
        let orderSold = 0;
        orders.value
          .filter(o => o.order_status === 'completed')
          .forEach(o => {
            o.details.forEach(d => {
              if (d.sku_id === s.sku_id) {
                orderSold += d.quantity;
              }
            });
          });

        list.push({
          product_name: p.product_name,
          color_name: c.color_name,
          size: s.size,
          sku_code: s.sku_code,
          sold: s.sold_quantity + orderSold,
          price: getDiscountedPrice(c)
        });
      });
    });
  });

  return list.sort((a, b) => b.sold - a.sold).slice(0, 5);
});

// Voucher usage tracking
const voucherReport = computed(() => {
  return mockVouchers.map(v => {
    // Find how many orders used this voucher
    const orderUsages = orders.value.filter(o => o.voucher_code_snapshot === v.code);
    const totalDiscountAmount = orderUsages.reduce((sum, o) => sum + o.voucher_discount_amount, 0);
    const totalSalesAmount = orderUsages.reduce((sum, o) => sum + o.total_amount, 0);
    
    return {
      code: v.code,
      type: v.voucher_type === 'percent' ? 'Giảm %' : v.voucher_type === 'fixed' ? 'Giảm tiền' : 'Miễn ship',
      used: v.used_count + orderUsages.length,
      discount: totalDiscountAmount,
      sales: totalSalesAmount
    };
  });
});
</script>

<template>
  <div class="space-y-8 text-left">
    <!-- Header Page Info -->
    <div>
      <h1 class="text-2xl font-black text-slate-900 font-sans uppercase">Hệ Thống Thống Kê Dashboard</h1>
      <p class="text-xs text-slate-400 font-bold mt-1 uppercase tracking-wide">Số liệu kinh doanh cập nhật trực quan thời gian thực</p>
    </div>

    <!-- Metrics Cards Grid -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      <div class="bg-white p-6 rounded-3xl border border-slate-200 shadow-premium flex items-center justify-between">
        <div class="space-y-1">
          <p class="text-xs font-bold text-slate-400 uppercase tracking-wider">Tổng Doanh Thu</p>
          <p class="text-xl font-black text-slate-900 font-sans">{{ formatPrice(totalRevenue) }}</p>
          <span class="text-[10px] text-emerald-600 font-bold">Từ đơn đã hoàn thành</span>
        </div>
        <div class="rounded-2xl bg-emerald-50 p-3.5 text-emerald-600">
          <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
      </div>

      <div class="bg-white p-6 rounded-3xl border border-slate-200 shadow-premium flex items-center justify-between">
        <div class="space-y-1">
          <p class="text-xs font-bold text-slate-400 uppercase tracking-wider">Tổng Số Đơn Hàng</p>
          <p class="text-xl font-black text-slate-900 font-sans">{{ totalOrdersCount }} đơn</p>
          <span class="text-[10px] text-amber-600 font-bold">{{ pendingOrdersCount }} đơn chờ xác nhận</span>
        </div>
        <div class="rounded-2xl bg-amber-50 p-3.5 text-amber-600">
          <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
          </svg>
        </div>
      </div>

      <div class="bg-white p-6 rounded-3xl border border-slate-200 shadow-premium flex items-center justify-between">
        <div class="space-y-1">
          <p class="text-xs font-bold text-slate-400 uppercase tracking-wider">Sản Phẩm Đã Bán</p>
          <p class="text-xl font-black text-slate-900 font-sans">{{ itemsSold }} đôi</p>
          <span class="text-[10px] text-blue-600 font-bold">Từ {{ completedOrdersCount }} đơn hoàn thành</span>
        </div>
        <div class="rounded-2xl bg-blue-50 p-3.5 text-blue-600">
          <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2 4-4" />
          </svg>
        </div>
      </div>

      <div class="bg-white p-6 rounded-3xl border border-slate-200 shadow-premium flex items-center justify-between">
        <div class="space-y-1">
          <p class="text-xs font-bold text-slate-400 uppercase tracking-wider">Cảnh Báo Hết Kho</p>
          <p class="text-xl font-black text-slate-900 font-sans">{{ lowStockSkus.length }} SKU</p>
          <span class="text-[10px] text-rose-600 font-bold">Tồn kho dưới 5 sản phẩm</span>
        </div>
        <div class="rounded-2xl bg-rose-50 p-3.5 text-rose-600">
          <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
      </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-12 gap-8">
      <!-- Best Sellers (7 columns) -->
      <div class="lg:col-span-7 bg-white border border-slate-200 rounded-3xl p-6 shadow-premium">
        <h2 class="text-base font-bold text-slate-900 mb-5 font-sans uppercase border-b pb-3">Sản phẩm bán chạy nhất</h2>
        
        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-slate-100 text-xs">
            <thead>
              <tr class="text-slate-400 font-bold uppercase">
                <th class="py-3 text-left">Tên sản phẩm</th>
                <th class="py-3 text-left">Màu / Size</th>
                <th class="py-3 text-center">Đã bán</th>
                <th class="py-3 text-right">Giá trị</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100 font-medium text-slate-700">
              <tr v-for="item in bestSellers" :key="item.sku_code">
                <td class="py-3 text-left font-bold text-slate-900">{{ item.product_name }}</td>
                <td class="py-3 text-left">{{ item.color_name }} - Size {{ item.size }}</td>
                <td class="py-3 text-center font-bold text-brand-blue">{{ item.sold }} đôi</td>
                <td class="py-3 text-right font-bold text-slate-900">{{ formatPrice(item.sold * item.price) }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Low Stock Warnings (5 columns) -->
      <div class="lg:col-span-5 bg-white border border-slate-200 rounded-3xl p-6 shadow-premium">
        <h2 class="text-base font-bold text-slate-900 mb-5 font-sans uppercase border-b pb-3">Cảnh báo tồn kho thấp</h2>
        
        <div class="space-y-4 max-h-[280px] overflow-y-auto pr-2">
          <div v-for="sku in lowStockSkus" :key="sku.sku_code" class="flex items-center justify-between border-b pb-3 last:border-0 last:pb-0 text-xs">
            <div>
              <p class="font-bold text-slate-800">{{ sku.product_name }}</p>
              <p class="text-slate-400 mt-0.5">{{ sku.color_name }} - Size {{ sku.size }}</p>
              <code class="text-[9px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded font-mono">{{ sku.sku_code }}</code>
            </div>
            
            <span 
              class="px-2.5 py-1 rounded-lg text-xs font-bold font-mono"
              :class="sku.stock === 0 ? 'bg-rose-100 text-rose-800' : 'bg-amber-100 text-amber-800'"
            >
              Tồn: {{ sku.stock }}
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- Voucher Performance reports -->
    <div class="bg-white border border-slate-200 rounded-3xl p-6 shadow-premium">
      <h2 class="text-base font-bold text-slate-900 mb-5 font-sans uppercase border-b pb-3">Báo cáo hiệu quả mã giảm giá (Voucher)</h2>
      
      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-slate-100 text-xs">
          <thead>
            <tr class="text-slate-400 font-bold uppercase">
              <th class="py-3 text-left">Mã Voucher</th>
              <th class="py-3 text-left">Phân loại</th>
              <th class="py-3 class=text-center">Số lượt sử dụng</th>
              <th class="py-3 text-right">Tổng số tiền giảm</th>
              <th class="py-3 text-right">Doanh số đơn kéo theo</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100 font-medium text-slate-700">
            <tr v-for="v in voucherReport" :key="v.code">
              <td class="py-3 text-left font-bold text-slate-900">
                <span class="border border-dashed border-slate-300 px-2 py-0.5 rounded font-mono">{{ v.code }}</span>
              </td>
              <td class="py-3 text-left">{{ v.type }}</td>
              <td class="py-3 text-center font-bold text-slate-800">{{ v.used }} lượt</td>
              <td class="py-3 text-right font-bold text-rose-600">{{ formatPrice(v.discount) }}</td>
              <td class="py-3 text-right font-bold text-brand-blue">{{ formatPrice(v.sales) }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>
