<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { adminCategoryService } from '@/services/admin/category.service';
import Pagination from '@/components/common/Pagination.vue';
import ConfirmDialog from '@/components/common/ConfirmDialog.vue';
import BaseModal from '@/components/common/BaseModal.vue';

const categories = ref<any[]>([]);
const search = ref('');
const loading = ref(false);
const page = ref(1);
const totalPages = ref(1);

const showCreateModal = ref(false);
const newCategory = ref({ category_name: '', description: '' });

const confirmState = ref({
  show: false,
  title: 'Xác nhận',
  message: '',
  onConfirm: () => {}
});

onMounted(() => {
  loadCategories();
});

const loadCategories = async () => {
  try {
    loading.value = true;
    const res = await adminCategoryService.getCategories({
      search: search.value,
      page: page.value,
      limit: 10
    });
    categories.value = res.data;
    totalPages.value = res.pagination.total_pages;
  } catch (e) {
    console.error('Failed to load categories', e);
  } finally {
    loading.value = false;
  }
};

const handleCreate = async () => {
  try {
    await adminCategoryService.createCategory(newCategory.value);
    showCreateModal.value = false;
    newCategory.value = { category_name: '', description: '' };
    loadCategories();
  } catch (e) {
    alert('Thêm danh mục thất bại');
  }
};

const confirmToggleStatus = (category: any) => {
  const action = category.status === 'active' ? 'khóa' : 'kích hoạt';
  confirmState.value = {
    show: true,
    title: 'Xác nhận trạng thái',
    message: `Bạn có chắc muốn ${action} danh mục "${category.category_name}"?`,
    onConfirm: async () => {
      confirmState.value.show = false;
      const nextStatus = category.status === 'active' ? 'inactive' : 'active';
      await adminCategoryService.toggleCategoryStatus(category.category_id, nextStatus);
      loadCategories();
    }
  };
};
</script>

<template>
  <div class="space-y-8 text-left">
    <div class="flex items-center justify-between border-b pb-5">
      <div>
        <h1 class="text-2xl font-black text-slate-900 font-sans uppercase">Quản lý Danh Mục</h1>
        <p class="text-xs text-slate-400 font-bold mt-1 uppercase tracking-wide">Tạo, cập nhật và quản lý trạng thái các danh mục sản phẩm</p>
      </div>
      <button 
        @click="showCreateModal = true"
        class="bg-slate-950 hover:bg-black text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow transition-all uppercase"
      >
        Tạo Danh Mục Mới
      </button>
    </div>

    <!-- Filter & Search -->
    <div class="bg-white p-4 rounded-3xl border border-slate-200 shadow-premium flex gap-4">
      <input 
        type="text" 
        v-model="search" 
        placeholder="Tìm kiếm danh mục..." 
        class="flex-1 px-4 py-2 border rounded-xl text-sm focus:ring-2 focus:ring-brand-accent focus:outline-none"
        @keyup.enter="loadCategories"
      />
      <button @click="loadCategories" class="px-6 py-2 bg-slate-100 font-bold text-slate-700 rounded-xl hover:bg-slate-200 transition-colors uppercase text-xs tracking-wider">
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
              <th class="py-4 px-6">Tên danh mục</th>
              <th class="py-4 px-6">Mô tả</th>
              <th class="py-4 px-6">Trạng thái</th>
              <th class="py-4 px-6 text-center">Hành động</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100 text-slate-700 font-medium">
            <tr v-for="c in categories" :key="c.category_id" class="hover:bg-slate-50/50">
              <td class="py-4 px-6 text-slate-500 font-mono">#{{ c.category_id }}</td>
              <td class="py-4 px-6 font-bold text-slate-900">{{ c.category_name }}</td>
              <td class="py-4 px-6 text-slate-500 max-w-xs truncate">{{ c.description || '---' }}</td>
              <td class="py-4 px-6">
                <span class="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide"
                  :class="c.status === 'active' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'">
                  {{ c.status === 'active' ? 'Hoạt động' : 'Đã khóa' }}
                </span>
              </td>
              <td class="py-4 px-6 text-center">
                <button 
                  @click="confirmToggleStatus(c)" 
                  class="text-xs font-bold px-3 py-1.5 rounded-lg border transition-all"
                  :class="c.status === 'active' ? 'border-rose-200 text-rose-600 hover:bg-rose-50' : 'border-emerald-200 text-emerald-600 hover:bg-emerald-50'"
                >
                  {{ c.status === 'active' ? 'Khóa' : 'Mở khóa' }}
                </button>
              </td>
            </tr>
            <tr v-if="categories.length === 0">
              <td colspan="5" class="text-center py-8 text-slate-400">Không có danh mục nào.</td>
            </tr>
          </tbody>
        </table>
      </div>
      <Pagination 
        v-model:currentPage="page" 
        :total-pages="totalPages" 
        @change="loadCategories" 
      />
    </div>

    <!-- Create Modal -->
    <BaseModal :show="showCreateModal" title="Tạo Danh Mục Mới" size="sm" @close="showCreateModal = false">
      <div class="space-y-4">
        <div>
          <label class="block text-[10px] font-bold text-slate-400 uppercase mb-1">Tên danh mục *</label>
          <input type="text" v-model="newCategory.category_name" class="w-full border rounded-xl px-3 py-2 text-xs" />
        </div>
        <div>
          <label class="block text-[10px] font-bold text-slate-400 uppercase mb-1">Mô tả</label>
          <textarea v-model="newCategory.description" rows="3" class="w-full border rounded-xl px-3 py-2 text-xs resize-none"></textarea>
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
