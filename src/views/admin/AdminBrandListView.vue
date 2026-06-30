<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { adminBrandService } from '@/services/admin/brand.service';
import Pagination from '@/components/common/Pagination.vue';
import ConfirmDialog from '@/components/common/ConfirmDialog.vue';
import BaseModal from '@/components/common/BaseModal.vue';

const brands = ref<any[]>([]);
const search = ref('');
const loading = ref(false);
const page = ref(1);
const totalPages = ref(1);

const showCreateModal = ref(false);
const newBrand = ref({ brand_name: '', description: '', origin: '', logo_url: '' });

const confirmState = ref({
  show: false,
  title: 'Xác nhận',
  message: '',
  onConfirm: () => {}
});

onMounted(() => {
  loadBrands();
});

const loadBrands = async () => {
  try {
    loading.value = true;
    const res = await adminBrandService.getBrands({
      search: search.value,
      page: page.value,
      limit: 10
    });
    brands.value = res.data;
    totalPages.value = res.pagination.total_pages;
  } catch (e) {
    console.error('Failed to load brands', e);
  } finally {
    loading.value = false;
  }
};

const handleCreate = async () => {
  try {
    await adminBrandService.createBrand(newBrand.value);
    showCreateModal.value = false;
    newBrand.value = { brand_name: '', description: '', origin: '', logo_url: '' };
    loadBrands();
  } catch (e) {
    alert('Thêm thương hiệu thất bại');
  }
};

const confirmToggleStatus = (brand: any) => {
  const action = brand.status === 'active' ? 'khóa' : 'kích hoạt';
  confirmState.value = {
    show: true,
    title: 'Xác nhận trạng thái',
    message: `Bạn có chắc muốn ${action} thương hiệu "${brand.brand_name}"?`,
    onConfirm: async () => {
      confirmState.value.show = false;
      const nextStatus = brand.status === 'active' ? 'inactive' : 'active';
      await adminBrandService.toggleBrandStatus(brand.brand_id, nextStatus);
      loadBrands();
    }
  };
};
</script>

<template>
  <div class="space-y-8 text-left">
    <div class="flex items-center justify-between border-b pb-5">
      <div>
        <h1 class="text-2xl font-black text-slate-900 font-sans uppercase">Quản lý Thương Hiệu</h1>
        <p class="text-xs text-slate-400 font-bold mt-1 uppercase tracking-wide">Quản lý các thương hiệu sản phẩm đối tác</p>
      </div>
      <button 
        @click="showCreateModal = true"
        class="bg-slate-950 hover:bg-black text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow transition-all uppercase"
      >
        Tạo Thương Hiệu Mới
      </button>
    </div>

    <!-- Filter & Search -->
    <div class="bg-white p-4 rounded-3xl border border-slate-200 shadow-premium flex gap-4">
      <input 
        type="text" 
        v-model="search" 
        placeholder="Tìm kiếm thương hiệu..." 
        class="flex-1 px-4 py-2 border rounded-xl text-sm focus:ring-2 focus:ring-brand-accent focus:outline-none"
        @keyup.enter="loadBrands"
      />
      <button @click="loadBrands" class="px-6 py-2 bg-slate-100 font-bold text-slate-700 rounded-xl hover:bg-slate-200 transition-colors uppercase text-xs tracking-wider">
        Tìm kiếm
      </button>
    </div>

    <div v-if="loading" class="py-12 flex justify-center items-center">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-900"></div>
    </div>

    <div v-else class="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-premium">
      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-slate-100 text-xs text-left">
          <thead>
            <tr class="bg-slate-50 text-slate-400 font-bold uppercase tracking-wider">
              <th class="py-4 px-6">ID</th>
              <th class="py-4 px-6">Tên Thương hiệu</th>
              <th class="py-4 px-6">Xuất xứ</th>
              <th class="py-4 px-6">Trạng thái</th>
              <th class="py-4 px-6 text-center">Hành động</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100 text-slate-700 font-medium">
            <tr v-for="b in brands" :key="b.brand_id" class="hover:bg-slate-50/50">
              <td class="py-4 px-6 text-slate-500 font-mono">#{{ b.brand_id }}</td>
              <td class="py-4 px-6 font-bold text-slate-900">
                <div class="flex items-center space-x-3">
                  <div class="w-8 h-8 rounded-lg border bg-white flex items-center justify-center overflow-hidden">
                    <img v-if="b.logo_url" :src="b.logo_url" class="object-cover" />
                    <span v-else class="text-[10px] text-slate-300">Logo</span>
                  </div>
                  <span>{{ b.brand_name }}</span>
                </div>
              </td>
              <td class="py-4 px-6 text-slate-500">{{ b.origin || '---' }}</td>
              <td class="py-4 px-6">
                <span class="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide"
                  :class="b.status === 'active' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'">
                  {{ b.status === 'active' ? 'Hoạt động' : 'Đã khóa' }}
                </span>
              </td>
              <td class="py-4 px-6 text-center">
                <button 
                  @click="confirmToggleStatus(b)" 
                  class="text-xs font-bold px-3 py-1.5 rounded-lg border transition-all"
                  :class="b.status === 'active' ? 'border-rose-200 text-rose-600 hover:bg-rose-50' : 'border-emerald-200 text-emerald-600 hover:bg-emerald-50'"
                >
                  {{ b.status === 'active' ? 'Khóa' : 'Mở khóa' }}
                </button>
              </td>
            </tr>
            <tr v-if="brands.length === 0">
              <td colspan="5" class="text-center py-8 text-slate-400">Không có thương hiệu nào.</td>
            </tr>
          </tbody>
        </table>
      </div>
      <Pagination 
        v-model:currentPage="page" 
        :total-pages="totalPages" 
        @change="loadBrands" 
      />
    </div>

    <!-- Create Modal -->
    <BaseModal :show="showCreateModal" title="Tạo Thương Hiệu" size="sm" @close="showCreateModal = false">
      <div class="space-y-4">
        <div>
          <label class="block text-[10px] font-bold text-slate-400 uppercase mb-1">Tên Thương hiệu *</label>
          <input type="text" v-model="newBrand.brand_name" class="w-full border rounded-xl px-3 py-2 text-xs" />
        </div>
        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="block text-[10px] font-bold text-slate-400 uppercase mb-1">Xuất xứ</label>
            <input type="text" v-model="newBrand.origin" placeholder="VD: Mỹ, Nhật..." class="w-full border rounded-xl px-3 py-2 text-xs" />
          </div>
          <div>
            <label class="block text-[10px] font-bold text-slate-400 uppercase mb-1">Logo URL</label>
            <input type="text" v-model="newBrand.logo_url" class="w-full border rounded-xl px-3 py-2 text-xs" />
          </div>
        </div>
        <div>
          <label class="block text-[10px] font-bold text-slate-400 uppercase mb-1">Mô tả</label>
          <textarea v-model="newBrand.description" rows="3" class="w-full border rounded-xl px-3 py-2 text-xs resize-none"></textarea>
        </div>
        <div class="flex space-x-3 pt-4">
          <button @click="showCreateModal = false" class="flex-1 border font-bold py-2 rounded-xl text-slate-600">Hủy</button>
          <button @click="handleCreate" class="flex-1 bg-brand-accent font-bold py-2 rounded-xl text-white shadow-premium">Tạo</button>
        </div>
      </div>
    </BaseModal>

    <!-- Confirm Dialog -->
    <ConfirmDialog 
      :show="confirmState.show" 
      :title="confirmState.title" 
      :message="confirmState.message" 
      @confirm="confirmState.onConfirm" 
      @cancel="confirmState.show = false" 
    />
  </div>
</template>
