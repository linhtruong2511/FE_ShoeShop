<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { adminReportService } from '../../services/admin/report.service';

const formatPrice = (value: number) => {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
};

// Summary metrics
const totalRevenue = ref(0);
const totalOrdersCount = ref(0);
const pendingOrdersCount = ref(0);
const completedOrdersCount = ref(0);
const itemsSold = ref(0);
const totalLowStockCount = ref(0);

// Warnings & lists
const lowStockSkus = ref<Array<{
  product_name: string;
  color_name: string;
  size: string;
  sku_code: string;
  stock_quantity: number;
}>>([]);

const bestSellers = ref<Array<{
  product_name: string;
  color_name: string;
  size: string;
  sku_code: string;
  sold: number;
  price: number;
}>>([]);

const voucherReport = ref<Array<{
  code: string;
  type: string;
  used: number;
  discount: number;
  sales: number;
}>>([]);

const isLoading = ref(true);

onMounted(async () => {
  try {
    isLoading.value = true;
    
    // 1. Get Revenue & Order counts
    const revRes = await adminReportService.getRevenueSummary();
    if (revRes.success && revRes.data) {
      totalRevenue.value = revRes.data.total_revenue || 0;
      totalOrdersCount.value = revRes.data.total_orders || 0;
      // In real backend logic we can compute these or expand report response.
      // Here we set base values.
      pendingOrdersCount.value = 0; 
      completedOrdersCount.value = revRes.data.total_orders || 0;
      itemsSold.value = revRes.data.total_items_sold || 0;
    }

    // 2. Get low stock SKUs
    const invRes = await adminReportService.getInventoryReport({ low_stock_threshold: 5 });
    if (invRes.success && invRes.data) {
      lowStockSkus.value = invRes.data.items || [];
      totalLowStockCount.value = revRes.data?.total_low_stock !== undefined ? revRes.data.total_low_stock : lowStockSkus.value.length;
    }

    // 3. Get best sellers
    const bsRes = await adminReportService.getBestSellers({ limit: 5 });
    if (bsRes.success && bsRes.data) {
      bestSellers.value = bsRes.data.items || [];
    }

    // 4. Get voucher usage report
    const vRes = await adminReportService.getVoucherReport();
    if (vRes.success && vRes.data) {
      voucherReport.value = vRes.data.items || [];
    }
  } catch (e) {
    console.error('Failed to load dashboard statistics:', e);
  } finally {
    isLoading.value = false;
  }
});
</script>

<template>
  <div class="space-y-8 text-left">
    <!-- Header Page Info -->
    <div>
      <h1 class="text-2xl font-black text-slate-900 font-sans uppercase">Hệ Thống Thống Kê Dashboard</h1>
      <p class="text-xs text-slate-400 font-bold mt-1 uppercase tracking-wide">Số liệu kinh doanh cập nhật trực quan thời gian thực</p>
    </div>

    <!-- Loading State -->
    <div v-if="isLoading" class="py-12 flex justify-center items-center">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-900"></div>
    </div>

    <!-- Metrics Cards Grid -->
    <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
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
          <span class="text-[10px] text-amber-600 font-bold">Đơn hàng đã hoàn thành</span>
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
          <p class="text-xl font-black text-slate-900 font-sans">{{ totalLowStockCount }} SKU</p>
          <span class="text-[10px] text-rose-600 font-bold">Tồn kho dưới 5 sản phẩm</span>
        </div>
        <div class="rounded-2xl bg-rose-50 p-3.5 text-rose-600">
          <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
      </div>
    </div>

    <div v-if="!isLoading" class="grid grid-cols-1 lg:grid-cols-12 gap-8">
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
              <tr v-if="bestSellers.length === 0">
                <td colspan="4" class="text-center py-6 text-slate-400">Chưa có dữ liệu sản phẩm bán chạy</td>
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
              :class="sku.stock_quantity === 0 ? 'bg-rose-100 text-rose-800' : 'bg-amber-100 text-amber-800'"
            >
              Tồn: {{ sku.stock_quantity }}
            </span>
          </div>
          <div v-if="lowStockSkus.length === 0" class="text-center py-12 text-slate-400 text-xs">
            Không có SKU nào ở mức cảnh báo tồn kho thấp.
          </div>
        </div>
      </div>
    </div>

    <!-- Voucher Performance reports -->
    <div v-if="!isLoading" class="bg-white border border-slate-200 rounded-3xl p-6 shadow-premium">
      <h2 class="text-base font-bold text-slate-900 mb-5 font-sans uppercase border-b pb-3">Báo cáo hiệu quả mã giảm giá (Voucher)</h2>
      
      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-slate-100 text-xs">
          <thead>
            <tr class="text-slate-400 font-bold uppercase">
              <th class="py-3 text-left">Mã Voucher</th>
              <th class="py-3 text-left">Phân loại</th>
              <th class="py-3 text-center">Số lượt sử dụng</th>
              <th class="py-3 text-right">Tổng số tiền giảm</th>
              <th class="py-3 text-right">Doanh số đơn kéo theo</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100 font-medium text-slate-700">
            <tr v-for="v in voucherReport" :key="v.code">
              <td class="py-3 text-left font-bold text-slate-900">
                <span class="border border-dashed border-slate-300 px-2 py-0.5 rounded font-mono">{{ v.code }}</span>
              </td>
              <td class="py-3 text-left">{{ v.type === 'percent' ? 'Giảm %' : v.type === 'fixed' ? 'Giảm tiền' : 'Miễn ship' }}</td>
              <td class="py-3 text-center font-bold text-slate-800">{{ v.used }} lượt</td>
              <td class="py-3 text-right font-bold text-rose-600">{{ formatPrice(v.discount) }}</td>
              <td class="py-3 text-right font-bold text-brand-blue">{{ formatPrice(v.sales) }}</td>
            </tr>
            <tr v-if="voucherReport.length === 0">
              <td colspan="5" class="text-center py-6 text-slate-400">Chưa ghi nhận mã giảm giá được sử dụng</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>
