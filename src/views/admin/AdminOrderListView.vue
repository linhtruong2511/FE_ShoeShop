<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { mockProducts } from '../../mocks/products';
import type { Order, ReturnRequest, StockLog } from '../../types';

const orders = ref<Order[]>([]);
const returnRequests = ref<ReturnRequest[]>([]);
const activeTab = ref<'orders' | 'returns'>('orders');
const orderFilter = ref<string>('all');

onMounted(() => {
  loadOrders();
  loadReturns();
});

const loadOrders = () => {
  const saved = localStorage.getItem('myshoes_orders');
  if (saved) {
    try {
      orders.value = JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
  }
};

const loadReturns = () => {
  const saved = localStorage.getItem('myshoes_returns');
  if (saved) {
    try {
      returnRequests.value = JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
  }
};

const saveOrdersToStorage = () => {
  localStorage.setItem('myshoes_orders', JSON.stringify(orders.value));
};

const saveReturnsToStorage = () => {
  localStorage.setItem('myshoes_returns', JSON.stringify(returnRequests.value));
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
    case 'pending': return 'bg-amber-100 text-amber-800';
    case 'confirmed': return 'bg-blue-100 text-blue-800';
    case 'preparing': return 'bg-indigo-100 text-indigo-800';
    case 'shipping': return 'bg-purple-100 text-purple-800';
    case 'completed': return 'bg-emerald-100 text-emerald-800';
    case 'cancelled': return 'bg-rose-100 text-rose-800';
    
    // returns
    case 'approved': return 'bg-blue-100 text-blue-800';
    case 'rejected': return 'bg-rose-100 text-rose-800';
    default: return 'bg-slate-100 text-slate-800';
  }
};

const filteredOrders = computed(() => {
  if (orderFilter.value === 'all') return orders.value;
  return orders.value.filter(o => o.order_status === orderFilter.value);
});

// Update order status
const handleUpdateStatus = (orderId: any, nextStatus: Order['order_status']) => {
  const idx = orders.value.findIndex(o => String(o.order_id) === String(orderId));
  if (idx === -1) return;

  const currentOrder = orders.value[idx];
  const oldStatus = currentOrder.order_status;

  // Update status
  currentOrder.order_status = nextStatus;
  
  let note = `Trạng thái đơn hàng được chuyển từ [${getStatusName(oldStatus)}] sang [${getStatusName(nextStatus)}].`;
  
  if (nextStatus === 'completed') {
    currentOrder.completed_at = new Date().toISOString();
    currentOrder.payment_status = 'paid';
    note += ' Xác nhận giao hàng thành công & thanh toán đã nhận.';
    
    // Increase sold_quantity
    updateSoldQuantity(currentOrder);
  }

  currentOrder.status_history.unshift({
    status_log_id: `log-${orderId}-${currentOrder.status_history.length}`,
    order_id: orderId,
    old_status: oldStatus,
    new_status: nextStatus,
    note: note,
    changed_at: new Date().toISOString()
  });

  saveOrdersToStorage();
  alert(`Cập nhật đơn hàng sang trạng thái [${getStatusName(nextStatus)}] thành công.`);
};

// Admin Cancel order
const handleAdminCancelOrder = (orderId: any) => {
  const reason = prompt('Nhập lý do nhân viên hủy đơn hàng:');
  if (reason === null) return; // cancel prompt
  
  const idx = orders.value.findIndex(o => o.order_id === orderId);
  if (idx === -1) return;

  const currentOrder = orders.value[idx];
  
  // Restore stock
  restoreOrderStock(currentOrder);

  currentOrder.order_status = 'cancelled';
  currentOrder.cancelled_reason = reason || 'Hủy bởi Quản trị viên hệ thống';
  currentOrder.cancelled_at = new Date().toISOString();
  currentOrder.status_history.unshift({
    status_log_id: `log-${orderId}-${currentOrder.status_history.length}`,
    order_id: orderId,
    old_status: currentOrder.order_status,
    new_status: 'cancelled',
    note: `Đơn hàng bị hủy bởi Quản trị viên. Lý do: ${currentOrder.cancelled_reason}`,
    changed_at: new Date().toISOString()
  });

  saveOrdersToStorage();
  alert('Đơn hàng đã được chuyển sang trạng thái Hủy.');
};

// Update sold quantity helper
const updateSoldQuantity = (orderObj: Order) => {
  // Load mock products from localStorage
  const saved = localStorage.getItem('myshoes_products_data');
  if (saved) {
    try {
      const productsList: typeof mockProducts = JSON.parse(saved);
      
      orderObj.details.forEach(item => {
        productsList.forEach(p => {
          p.colors.forEach(c => {
            c.skus.forEach(s => {
              if (s.sku_id === item.sku_id) {
                s.sold_quantity += item.quantity;
              }
            });
          });
        });
      });
      
      localStorage.setItem('myshoes_products_data', JSON.stringify(productsList));
    } catch (e) {
      console.error(e);
    }
  }
};

// Restore stock helper
const restoreOrderStock = (orderObj: Order) => {
  const saved = localStorage.getItem('myshoes_products_data');
  if (saved) {
    try {
      const productsList: typeof mockProducts = JSON.parse(saved);
      
      orderObj.details.forEach(item => {
        productsList.forEach(p => {
          p.colors.forEach(c => {
            c.skus.forEach(s => {
              if (s.sku_id === item.sku_id) {
                s.stock_quantity += item.quantity;
                s.status = s.stock_quantity > 0 ? 'active' : 'out_of_stock';
                
                // Write stock log
                const newLog: StockLog = {
                  log_id: 'sl-' + Date.now() + '-' + Math.floor(Math.random() * 1000),
                  sku_id: s.sku_id,
                  sku_code: s.sku_code,
                  product_name: p.product_name,
                  color_name: c.color_name,
                  size: s.size,
                  change_quantity: item.quantity,
                  stock_before: s.stock_quantity - item.quantity,
                  stock_after: s.stock_quantity,
                  reason: 'cancel_return',
                  reason_note: `Hoàn kho do hủy đơn ${orderObj.order_code}`,
                  created_at: new Date().toISOString()
                };

                const logsStr = localStorage.getItem('myshoes_stock_logs');
                const logsList: StockLog[] = logsStr ? JSON.parse(logsStr) : [];
                logsList.unshift(newLog);
                localStorage.setItem('myshoes_stock_logs', JSON.stringify(logsList));
              }
            });
          });
        });
      });
      
      localStorage.setItem('myshoes_products_data', JSON.stringify(productsList));
    } catch (e) {
      console.error(e);
    }
  }
};

// Approve return request
const handleReviewReturn = (returnId: any, action: 'approved' | 'rejected') => {
  const idx = returnRequests.value.findIndex(r => String(r.return_id) === String(returnId));
  if (idx === -1) return;

  const req = returnRequests.value[idx];
  req.status = action;
  req.reviewed_at = new Date().toISOString();
  req.note = action === 'approved' ? 'Nhân viên đã duyệt, đang chờ thu hồi nhận hàng' : 'Nhân viên đã từ chối yêu cầu đổi trả';

  saveReturnsToStorage();
  alert(`Yêu cầu đổi trả đã được chuyển sang trạng thái: ${action === 'approved' ? 'Phê duyệt' : 'Từ chối'}.`);
};

// Complete return request (adjust inventory)
const handleCompleteReturn = (returnId: any) => {
  const idx = returnRequests.value.findIndex(r => String(r.return_id) === String(returnId));
  if (idx === -1) return;

  const req = returnRequests.value[idx];
  req.status = 'completed';
  
  // Update stock
  const saved = localStorage.getItem('myshoes_products_data');
  if (saved) {
    try {
      const productsList: typeof mockProducts = JSON.parse(saved);
      
      req.items.forEach(item => {
        productsList.forEach(p => {
          p.colors.forEach(c => {
            c.skus.forEach(s => {
              if (s.sku_id === item.original_sku_id) {
                // Customer returns item -> increase stock
                s.stock_quantity += item.quantity;
                s.status = s.stock_quantity > 0 ? 'active' : 'out_of_stock';
                
                // log
                const newLog: StockLog = {
                  log_id: 'sl-' + Date.now() + '-ret',
                  sku_id: s.sku_id,
                  sku_code: s.sku_code,
                  product_name: p.product_name,
                  color_name: c.color_name,
                  size: s.size,
                  change_quantity: item.quantity,
                  stock_before: s.stock_quantity - item.quantity,
                  stock_after: s.stock_quantity,
                  reason: 'cancel_return',
                  reason_note: `Hoàn kho do đổi trả đơn ${req.order_code}`,
                  created_at: new Date().toISOString()
                };

                const logsStr = localStorage.getItem('myshoes_stock_logs');
                const logsList: StockLog[] = logsStr ? JSON.parse(logsStr) : [];
                logsList.unshift(newLog);
                localStorage.setItem('myshoes_stock_logs', JSON.stringify(logsList));
              }
            });
          });
        });
      });
      
      localStorage.setItem('myshoes_products_data', JSON.stringify(productsList));
    } catch (e) {
      console.error(e);
    }
  }

  saveReturnsToStorage();
  alert('Đã xác nhận hoàn tất đổi trả hàng thành công và cập nhật tồn kho.');
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
      <div class="flex flex-wrap gap-2.5">
        <button 
          @click="orderFilter = 'all'"
          class="border px-4 py-2 rounded-xl text-xs font-bold shadow-sm transition-all"
          :class="orderFilter === 'all' ? 'bg-slate-950 text-white border-slate-950' : 'bg-white border-slate-200 text-slate-600 hover:border-slate-400'"
        >
          Tất cả ({{ orders.length }})
        </button>
        <button 
          v-for="st in ['pending', 'confirmed', 'preparing', 'shipping', 'completed', 'cancelled']"
          :key="st"
          @click="orderFilter = st"
          class="border px-4 py-2 rounded-xl text-xs font-bold shadow-sm transition-all"
          :class="orderFilter === st ? 'bg-slate-950 text-white border-slate-950' : 'bg-white border-slate-200 text-slate-600 hover:border-slate-400'"
        >
          {{ getStatusName(st as Order['order_status']) }} ({{ orders.filter(o => o.order_status === st).length }})
        </button>
      </div>

      <!-- Orders table list -->
      <div class="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-premium">
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
                      @click="handleUpdateStatus(o.order_id, 'confirmed')"
                      class="bg-blue-600 hover:bg-blue-700 text-white font-bold text-[10px] px-2.5 py-1.5 rounded-lg"
                    >
                      Xác nhận đơn
                    </button>
                    <button 
                      v-if="o.order_status === 'confirmed'"
                      @click="handleUpdateStatus(o.order_id, 'preparing')"
                      class="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-[10px] px-2.5 py-1.5 rounded-lg"
                    >
                      Chuẩn bị hàng
                    </button>
                    <button 
                      v-if="o.order_status === 'preparing'"
                      @click="handleUpdateStatus(o.order_id, 'shipping')"
                      class="bg-purple-600 hover:bg-purple-700 text-white font-bold text-[10px] px-2.5 py-1.5 rounded-lg"
                    >
                      Bàn giao vận chuyển
                    </button>
                    <button 
                      v-if="o.order_status === 'shipping'"
                      @click="handleUpdateStatus(o.order_id, 'completed')"
                      class="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[10px] px-2.5 py-1.5 rounded-lg"
                    >
                      Hoàn thành đơn
                    </button>
                    
                    <button 
                      v-if="['pending', 'confirmed', 'preparing'].includes(o.order_status)"
                      @click="handleAdminCancelOrder(o.order_id)"
                      class="border border-rose-200 text-rose-600 hover:bg-rose-50 font-bold text-[10px] px-2.5 py-1.5 rounded-lg"
                    >
                      Hủy đơn
                    </button>
                    <span v-if="['completed', 'cancelled'].includes(o.order_status)" class="text-slate-400 font-bold text-[10px]">
                      N/A
                    </span>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Active view: Returns -->
    <div v-if="activeTab === 'returns'" class="space-y-6">
      <div class="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-premium">
        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-slate-100 text-xs text-left">
            <thead>
              <tr class="bg-slate-50 text-slate-400 font-bold uppercase tracking-wider">
                <th class="py-4 px-6">Mã đơn gốc</th>
                <th class="py-4 px-6">Loại / Lý do</th>
                <th class="py-4 px-6">Sản phẩm đổi trả</th>
                <th class="py-4 px-4">Ngày yêu cầu</th>
                <th class="py-4 px-4">Trạng thái</th>
                <th class="py-4 px-6 text-center">Thao tác</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100 text-slate-700 font-medium">
              <tr v-if="returnRequests.length === 0">
                <td colspan="6" class="py-12 text-center text-slate-400 text-xs uppercase font-bold">
                  Chưa phát sinh yêu cầu đổi trả hàng nào.
                </td>
              </tr>
              <tr v-else v-for="r in returnRequests" :key="r.return_id" class="hover:bg-slate-50/50">
                <td class="py-4 px-6 font-bold text-slate-900">{{ r.order_code }}</td>
                <td class="py-4 px-6">
                  <div>Hình thức: <strong class="text-slate-800 uppercase">{{ r.request_type === 'exchange' ? 'Đổi hàng' : 'Hoàn tiền' }}</strong></div>
                  <div class="text-[10px] text-slate-400 mt-0.5">Lý do: {{ r.reason }}</div>
                  <div class="text-[10px] text-slate-500 italic mt-0.5" v-if="r.reason_note">"{{ r.reason_note }}"</div>
                </td>
                <td class="py-4 px-6">
                  <div v-for="item in r.items" :key="item.return_item_id" class="border-b last:border-0 py-1">
                    {{ item.product_name }} ({{ item.color_name }} - Size {{ item.size }}) x {{ item.quantity }}
                  </div>
                </td>
                <td class="py-4 px-4">{{ formatDate(r.created_at) }}</td>
                <td class="py-4 px-4">
                  <span 
                    class="px-2.5 py-0.5 rounded-full text-[10px] font-bold border"
                    :class="getStatusBadgeClass(r.status)"
                  >
                    {{ r.status }}
                  </span>
                </td>
                <td class="py-4 px-6">
                  <div class="flex items-center justify-center space-x-2">
                    <button 
                      v-if="r.status === 'pending'"
                      @click="handleReviewReturn(r.return_id, 'approved')"
                      class="bg-blue-600 hover:bg-blue-700 text-white font-bold text-[10px] px-2.5 py-1.5 rounded-lg"
                    >
                      Duyệt
                    </button>
                    <button 
                      v-if="r.status === 'pending'"
                      @click="handleReviewReturn(r.return_id, 'rejected')"
                      class="border border-rose-200 text-rose-600 hover:bg-rose-50 font-bold text-[10px] px-2.5 py-1.5 rounded-lg"
                    >
                      Từ chối
                    </button>
                    
                    <button 
                      v-if="r.status === 'approved'"
                      @click="handleCompleteReturn(r.return_id)"
                      class="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[10px] px-2.5 py-1.5 rounded-lg"
                    >
                      Hoàn tất & Hoàn kho
                    </button>
                    <span v-if="['rejected', 'completed'].includes(r.status)" class="text-slate-400 font-bold text-[10px]">
                      N/A
                    </span>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>
