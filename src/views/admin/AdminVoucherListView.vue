<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { adminVoucherService } from '../../services/admin/voucher.service';
import type { Voucher } from '../../types';
import ConfirmDialog from '@/components/common/ConfirmDialog.vue';
import BaseModal from '@/components/common/BaseModal.vue';

const vouchers = ref<Voucher[]>([]);
const showAddModal = ref(false);
const isLoading = ref(true);

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
const newStatus = ref<'active' | 'hidden' | 'paused'>('active');

onMounted(() => {
  loadVouchers();
});

const loadVouchers = async () => {
  try {
    isLoading.value = true;
    const res = await adminVoucherService.getVouchers();
    if (res.success && res.data) {
      // Map API voucher response to local UI model
      vouchers.value = res.data.map((item: any) => ({
        voucher_id: item.voucher_id,
        code: item.voucher_code,
        voucher_type: item.discount_type,
        discount_value: item.discount_value,
        min_order_amount: item.min_order_amount,
        max_discount_amount: item.max_discount,
        usage_limit: item.usage_limit,
        used_count: item.used_count || 0,
        max_usage_per_customer: item.max_usage_per_customer || 1,
        start_date: item.start_date,
        end_date: item.end_date,
        status: item.status
      }));
    }
  } catch (e) {
    console.error('Failed to load vouchers:', e);
  } finally {
    isLoading.value = false;
  }
};

const formatPrice = (value: number) => {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
};

const getTypeName = (type: string) => {
  switch (type) {
    case 'percent': return 'Giảm theo %';
    case 'fixed': return 'Giảm số tiền';
    case 'free_shipping': return 'Miễn ship';
    default: return type;
  }
};

const handleAddVoucher = async () => {
  if (!newCode.value) {
    alert('Vui lòng điền mã Voucher!');
    return;
  }
  
  try {
    const data = {
      voucher_code: newCode.value.toUpperCase().trim(),
      voucher_name: `Campaign ${newCode.value.toUpperCase().trim()}`,
      discount_type: newType.value,
      discount_value: newValue.value,
      min_order_amount: newMinOrder.value,
      max_discount: newMaxDiscount.value || null,
      usage_limit: newLimit.value || null,
      max_usage_per_customer: newMaxPerCustomer.value,
      start_date: new Date(newStartDate.value).toISOString(),
      end_date: new Date(newEndDate.value).toISOString(),
      status: newStatus.value
    };

    const res = await adminVoucherService.createVoucher(data);
    if (res.success) {
      alert('Đã thêm voucher khuyến mãi thành công.');
      newCode.value = '';
      newStatus.value = 'active';
      showAddModal.value = false;
      loadVouchers();
    } else {
      alert(res.message || 'Thêm voucher thất bại.');
    }
  } catch (err: any) {
    alert(err.response?.data?.detail || err.message || 'Lỗi hệ thống');
  }
};

const updateVoucherStatusDirect = async (vId: number, nextStatus: string) => {
  try {
    const res = await adminVoucherService.updateStatus(vId, nextStatus);
    if (res.success) {
      loadVouchers();
    } else {
      alert('Không thể cập nhật trạng thái');
    }
  } catch (err: any) {
    alert(err.response?.data?.detail || err.message || 'Lỗi cập nhật');
  }
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

    <!-- Loading State -->
    <div v-if="isLoading" class="py-12 flex justify-center items-center">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-900"></div>
    </div>

    <!-- Vouchers table list -->
    <div v-else class="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-premium">
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
              <th class="py-4 px-6 text-center">Trạng thái (Status)</th>
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
              <td class="py-4 px-6 text-center">
                <select 
                  :value="v.status" 
                  @change="updateVoucherStatusDirect(v.voucher_id as number, ($event.target as HTMLSelectElement).value)"
                  class="border rounded-xl px-3 py-1.5 text-xs bg-white font-bold cursor-pointer outline-none transition-all shadow-sm"
                  :class="{
                    'text-emerald-700 border-emerald-200 bg-emerald-50/50 hover:bg-emerald-50': v.status === 'active',
                    'text-slate-500 border-slate-200 bg-slate-50 hover:bg-slate-100': v.status === 'hidden',
                    'text-amber-700 border-amber-200 bg-amber-50/50 hover:bg-amber-50': v.status === 'paused'
                  }"
                >
                  <option value="active">Hiển thị (Active)</option>
                  <option value="hidden">Ẩn (Hidden)</option>
                  <option value="paused">Dừng (Paused)</option>
                </select>
              </td>
            </tr>
            <tr v-if="vouchers.length === 0">
              <td colspan="7" class="text-center py-8 text-slate-400">Không tìm thấy voucher khuyến mãi nào.</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Add Voucher Modal -->
    <BaseModal :show="showAddModal" title="Tạo mã giảm giá mới" size="md" @close="showAddModal = false">
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
              <label class="block text-[10px] font-bold text-slate-400 uppercase mb-1">Giảm tối đa</label>
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

          <div class="grid grid-cols-3 gap-3">
            <div>
              <label class="block text-[10px] font-bold text-slate-400 uppercase mb-1">Ngày bắt đầu</label>
              <input type="date" v-model="newStartDate" class="w-full border rounded-xl px-3 py-2 text-xs" />
            </div>
            <div>
              <label class="block text-[10px] font-bold text-slate-400 uppercase mb-1">Ngày kết thúc</label>
              <input type="date" v-model="newEndDate" class="w-full border rounded-xl px-3 py-2 text-xs" />
            </div>
            <div>
              <label class="block text-[10px] font-bold text-slate-400 uppercase mb-1">Trạng thái</label>
              <select v-model="newStatus" class="w-full border rounded-xl px-3 py-2 text-xs bg-white">
                <option value="active">Hiển thị (Active)</option>
                <option value="hidden">Ẩn (Hidden)</option>
                <option value="paused">Dừng (Paused)</option>
              </select>
            </div>
          </div>
        </div>
        
        <div class="flex space-x-3.5 pt-4">
          <button @click="showAddModal = false" class="flex-1 border text-slate-600 font-bold text-xs py-2.5 rounded-xl">Đóng</button>
          <button @click="handleAddVoucher" class="flex-1 bg-slate-900 text-white font-bold text-xs py-2.5 rounded-xl">Tạo Voucher</button>
        </div>
    </BaseModal>
  </div>
</template>
