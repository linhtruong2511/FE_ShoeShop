<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { mockVouchers } from '../../mocks/products';
import type { Voucher } from '../../types';

const vouchers = ref<Voucher[]>([]);
const showAddModal = ref(false);

// Add voucher form inputs
const newCode = ref('');
const newType = ref<'percent' | 'fixed' | 'free_shipping'>('percent');
const newValue = ref(10);
const newMinOrder = ref(300000);
const newMaxDiscount = ref<number | undefined>(undefined);
const newLimit = ref<number | undefined>(100);
const newMaxPerCustomer = ref(1);
const newStartDate = ref('2026-07-01');
const newEndDate = ref('2026-07-31');

onMounted(() => {
  loadVouchers();
});

const loadVouchers = () => {
  const saved = localStorage.getItem('myshoes_vouchers_data');
  if (saved) {
    try {
      vouchers.value = JSON.parse(saved);
    } catch (e) {
      vouchers.value = mockVouchers;
    }
  } else {
    vouchers.value = mockVouchers;
    saveToStorage();
  }
};

const saveToStorage = () => {
  localStorage.setItem('myshoes_vouchers_data', JSON.stringify(vouchers.value));
};

const formatPrice = (value: number) => {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
};

const getTypeName = (type: Voucher['voucher_type']) => {
  switch (type) {
    case 'percent': return 'Giảm theo %';
    case 'fixed': return 'Giảm số tiền';
    case 'free_shipping': return 'Miễn ship';
  }
};

const handleAddVoucher = () => {
  if (!newCode.value) {
    alert('Vui lòng điền mã Voucher!');
    return;
  }
  
  if (vouchers.value.some(v => v.code.toUpperCase() === newCode.value.toUpperCase())) {
    alert('Mã giảm giá đã tồn tại!');
    return;
  }

  const v: Voucher = {
    voucher_id: 'v-' + Date.now(),
    code: newCode.value.toUpperCase().trim(),
    voucher_type: newType.value,
    discount_value: newValue.value,
    min_order_amount: newMinOrder.value,
    max_discount_amount: newMaxDiscount.value,
    usage_limit: newLimit.value,
    used_count: 0,
    max_usage_per_customer: newMaxPerCustomer.value,
    start_date: new Date(newStartDate.value).toISOString(),
    end_date: new Date(newEndDate.value).toISOString(),
    status: 'active'
  };

  vouchers.value.push(v);
  saveToStorage();
  
  // reset
  newCode.value = '';
  showAddModal.value = false;
  alert('Đã thêm voucher khuyến mãi thành công.');
};

const toggleVoucherStatus = (vId: string) => {
  const idx = vouchers.value.findIndex(v => v.voucher_id === vId);
  if (idx === -1) return;
  
  const v = vouchers.value[idx];
  v.status = v.status === 'active' ? 'paused' : 'active';
  saveToStorage();
};
</script>

<template>
  <div class="space-y-8 text-left">
    <div class="flex items-center justify-between border-b pb-5">
      <div>
        <h1 class="text-2xl font-black text-slate-900 font-sans uppercase">Quản lý Khuyến mãi (Vouchers)</h1>
        <p class="text-xs text-slate-400 font-bold mt-1 uppercase tracking-wide">Tạo mã giảm giá theo chiến dịch, cài đặt đơn hàng tối thiểu và giới hạn sử dụng</p>
      </div>
      
      <button 
        @click="showAddModal = true"
        class="bg-slate-950 hover:bg-black text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow transition-all"
      >
        TẠO VOUCHER MỚI
      </button>
    </div>

    <!-- Vouchers table list -->
    <div class="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-premium">
      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-slate-100 text-xs text-left">
          <thead>
            <tr class="bg-slate-50 text-slate-400 font-bold uppercase tracking-wider">
              <th class="py-4 px-6">Mã Voucher</th>
              <th class="py-4 px-6">Phân loại</th>
              <th class="py-4 px-4">Giá trị giảm</th>
              <th class="py-4 px-4">Đơn tối thiểu</th>
              <th class="py-4 px-4">Đã dùng / Giới hạn</th>
              <th class="py-4 px-4">Thời hạn hiệu lực</th>
              <th class="py-4 px-4">Trạng thái</th>
              <th class="py-4 px-6 text-center">Hành động</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100 text-slate-700 font-medium">
            <tr v-for="v in vouchers" :key="v.voucher_id" class="hover:bg-slate-50/50">
              <td class="py-4 px-6 font-bold text-slate-900">
                <span class="border border-dashed border-slate-300 bg-slate-50 px-2.5 py-1 rounded font-mono">{{ v.code }}</span>
              </td>
              <td class="py-4 px-6">{{ getTypeName(v.voucher_type) }}</td>
              <td class="py-4 px-4 font-bold text-slate-800">
                {{ v.voucher_type === 'percent' ? v.discount_value + '%' : formatPrice(v.discount_value) }}
                <span class="block text-[9px] text-slate-400 font-normal mt-0.5" v-if="v.max_discount_amount">
                  Tối đa: {{ formatPrice(v.max_discount_amount) }}
                </span>
              </td>
              <td class="py-4 px-4 font-bold text-slate-900">{{ formatPrice(v.min_order_amount) }}</td>
              <td class="py-4 px-4 font-semibold">
                {{ v.used_count }} / {{ v.usage_limit || 'Vô hạn' }}
                <span class="block text-[9px] text-slate-400 font-normal mt-0.5">Lượt/Khách: {{ v.max_usage_per_customer }}</span>
              </td>
              <td class="py-4 px-4 text-slate-500 font-normal">
                <div>Từ: {{ new Date(v.start_date).toLocaleDateString('vi-VN') }}</div>
                <div class="mt-0.5">Đến: {{ new Date(v.end_date).toLocaleDateString('vi-VN') }}</div>
              </td>
              <td class="py-4 px-4">
                <span 
                  class="px-2 py-0.5 rounded text-[10px] font-bold"
                  :class="v.status === 'active' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'"
                >
                  {{ v.status === 'active' ? 'Hoạt động' : 'Tạm dừng' }}
                </span>
              </td>
              <td class="py-4 px-6">
                <div class="flex justify-center">
                  <button 
                    @click="toggleVoucherStatus(v.voucher_id)"
                    class="border font-bold text-[10px] px-3 py-1.5 rounded-lg transition-all"
                    :class="v.status === 'active' ? 'border-rose-200 text-rose-600 hover:bg-rose-50' : 'border-emerald-200 text-emerald-600 hover:bg-emerald-50'"
                  >
                    {{ v.status === 'active' ? 'Tạm dừng' : 'Kích hoạt' }}
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Add Voucher Modal -->
    <div v-if="showAddModal" class="fixed inset-0 z-50 flex items-center justify-center overflow-hidden">
      <div class="absolute inset-0 bg-slate-900 bg-opacity-60 backdrop-blur-sm" @click="showAddModal = false"></div>
      <div class="bg-white rounded-3xl max-w-md w-full p-6 z-10 shadow-2xl space-y-4">
        <h3 class="text-base font-bold text-slate-950 font-sans uppercase">Tạo mã giảm giá mới</h3>
        <div class="space-y-3">
          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block text-[10px] font-bold text-slate-400 uppercase mb-1">Mã Voucher *</label>
              <input type="text" v-model="newCode" placeholder="Ví dụ: QUOCTEPHUNU" class="w-full border rounded-xl px-3 py-2 text-xs uppercase" />
            </div>
            <div>
              <label class="block text-[10px] font-bold text-slate-400 uppercase mb-1">Phân loại</label>
              <select v-model="newType" class="w-full border rounded-xl px-3 py-2 text-xs bg-white">
                <option value="percent">Giảm theo %</option>
                <option value="fixed">Giảm số tiền cố định</option>
                <option value="free_shipping">Miễn phí vận chuyển</option>
              </select>
            </div>
          </div>
          
          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block text-[10px] font-bold text-slate-400 uppercase mb-1">Giá trị giảm *</label>
              <input type="number" v-model="newValue" class="w-full border rounded-xl px-3 py-2 text-xs" />
            </div>
            <div>
              <label class="block text-[10px] font-bold text-slate-400 uppercase mb-1">Giảm tối đa (phần trăm)</label>
              <input type="number" v-model="newMaxDiscount" placeholder="Ví dụ: 100000" class="w-full border rounded-xl px-3 py-2 text-xs" :disabled="newType !== 'percent'" />
            </div>
          </div>

          <div class="grid grid-cols-3 gap-3">
            <div class="col-span-2">
              <label class="block text-[10px] font-bold text-slate-400 uppercase mb-1">Đơn tối thiểu *</label>
              <input type="number" v-model="newMinOrder" class="w-full border rounded-xl px-3 py-2 text-xs" />
            </div>
            <div>
              <label class="block text-[10px] font-bold text-slate-400 uppercase mb-1">Tổng lượt dùng</label>
              <input type="number" v-model="newLimit" class="w-full border rounded-xl px-3 py-2 text-xs" />
            </div>
          </div>

          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block text-[10px] font-bold text-slate-400 uppercase mb-1">Ngày bắt đầu</label>
              <input type="date" v-model="newStartDate" class="w-full border rounded-xl px-3 py-2 text-xs" />
            </div>
            <div>
              <label class="block text-[10px] font-bold text-slate-400 uppercase mb-1">Ngày kết thúc</label>
              <input type="date" v-model="newEndDate" class="w-full border rounded-xl px-3 py-2 text-xs" />
            </div>
          </div>
        </div>
        
        <div class="flex space-x-3.5 pt-2">
          <button @click="showAddModal = false" class="flex-1 border text-slate-600 font-bold text-xs py-2.5 rounded-xl">Đóng</button>
          <button @click="handleAddVoucher" class="flex-1 bg-slate-900 text-white font-bold text-xs py-2.5 rounded-xl">Tạo Voucher</button>
        </div>
      </div>
    </div>
  </div>
</template>
