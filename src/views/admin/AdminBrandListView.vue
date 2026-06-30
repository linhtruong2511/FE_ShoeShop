<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { adminBrandService } from '@/services/admin/brand.service';
import Pagination from '@/components/common/Pagination.vue';
import ConfirmDialog from '@/components/common/ConfirmDialog.vue';
import BaseModal from '@/components/common/BaseModal.vue';

const brands = ref<any[]>([]);
const loading = ref(false);
const page = ref(1);
const totalPages = ref(1);

// Create Brand States
const showCreateModal = ref(false);
const newBrand = ref({ brand_name: '', description: '' });
const logoFile = ref<File | null>(null);
const logoPreview = ref<string | null>(null);

// Edit Brand States
const showEditModal = ref(false);
const editingBrand = ref<any>(null);
const editLogoFile = ref<File | null>(null);
const editLogoPreview = ref<string | null>(null);

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
      skip: (page.value - 1) * 10,
      limit: 10
    });
    if (res && res.data) {
      brands.value = res.data;
      if (res.pagination) {
        totalPages.value = res.pagination.total_pages;
      }
    }
  } catch (e) {
    console.error('Failed to load brands', e);
  } finally {
    loading.value = false;
  }
};

// Create Handlers
const handleFileChange = (e: Event) => {
  const target = e.target as HTMLInputElement;
  if (target.files && target.files[0]) {
    logoFile.value = target.files[0];
    logoPreview.value = URL.createObjectURL(logoFile.value);
  }
};

const handleCreate = async () => {
  if (!newBrand.value.brand_name.trim()) {
    alert('Vui lòng nhập tên thương hiệu');
    return;
  }

  try {
    loading.value = true;
    const res = await adminBrandService.createBrand({
      brand_name: newBrand.value.brand_name,
      description: newBrand.value.description
    });
    
    if (res && res.data) {
      const createdBrand = res.data;
      if (logoFile.value) {
        await adminBrandService.uploadLogo(createdBrand.brand_id, logoFile.value);
      }
      showCreateModal.value = false;
      newBrand.value = { brand_name: '', description: '' };
      logoFile.value = null;
      logoPreview.value = null;
      loadBrands();
    } else {
      alert(res.message || 'Thêm thương hiệu thất bại');
    }
  } catch (e: any) {
    alert(e.response?.data?.detail || 'Thêm thương hiệu thất bại');
  } finally {
    loading.value = false;
  }
};

// Edit Handlers
const openEditModal = (brand: any) => {
  editingBrand.value = { 
    brand_id: brand.brand_id,
    brand_name: brand.brand_name,
    description: brand.description
  };
  editLogoFile.value = null;
  editLogoPreview.value = brand.logo_url || null;
  showEditModal.value = true;
};

const handleEditFileChange = (e: Event) => {
  const target = e.target as HTMLInputElement;
  if (target.files && target.files[0]) {
    editLogoFile.value = target.files[0];
    editLogoPreview.value = URL.createObjectURL(editLogoFile.value);
  }
};

const handleUpdate = async () => {
  if (!editingBrand.value.brand_name.trim()) {
    alert('Vui lòng nhập tên thương hiệu');
    return;
  }

  try {
    loading.value = true;
    const res = await adminBrandService.updateBrand(editingBrand.value.brand_id, {
      brand_name: editingBrand.value.brand_name,
      description: editingBrand.value.description
    });
    
    if (res) {
      if (editLogoFile.value) {
        await adminBrandService.uploadLogo(editingBrand.value.brand_id, editLogoFile.value);
      }
      showEditModal.value = false;
      editingBrand.value = null;
      editLogoFile.value = null;
      editLogoPreview.value = null;
      loadBrands();
    } else {
      alert(res.message || 'Cập nhật thương hiệu thất bại');
    }
  } catch (e: any) {
    alert(e.response?.data?.detail || 'Cập nhật thương hiệu thất bại');
  } finally {
    loading.value = false;
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
      try {
        await adminBrandService.toggleBrandStatus(brand.brand_id, nextStatus);
        loadBrands();
      } catch (err: any) {
        alert(err.response?.data?.detail || 'Thay đổi trạng thái thất bại');
      }
    }
  };
};

const getImageUrl = (url: string) => {
  if (!url) return '';
  if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('blob:')) {
    return url;
  }
  const baseUrl = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1').replace('/api/v1', '');
  const cleanUrl = url.startsWith('/') ? url : `/${url}`;
  return `${baseUrl}${cleanUrl}`;
};
</script>


<template>
  <div class="space-y-8 text-left font-sans">
    <div class="flex items-center justify-between border-b border-slate-200 pb-5">
      <div>
        <h1 class="text-3xl font-black text-slate-900 uppercase tracking-tight font-display">Quản lý Thương Hiệu</h1>
        <p class="text-xs text-slate-400 font-bold mt-1.5 uppercase tracking-wider">Quản lý các thương hiệu sản phẩm đối tác liên kết</p>
      </div>
      <button 
        @click="showCreateModal = true"
        class="bg-slate-950 hover:bg-red-600 hover:shadow-lg text-white text-xs font-bold px-5 py-3 rounded-xl transition-all duration-300 uppercase tracking-wider cursor-pointer"
      >
        Tạo Thương Hiệu Mới
      </button>
    </div>

    <!-- Main Brands list -->
    <div v-if="loading && brands.length === 0" class="py-12 flex justify-center items-center">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-900"></div>
    </div>

    <div v-else class="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-premium transition-all duration-300">
      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-slate-100 text-xs text-left">
          <thead>
            <tr class="bg-slate-50/70 text-slate-400 font-bold uppercase tracking-wider">
              <th class="py-4.5 px-6">ID</th>
              <th class="py-4.5 px-6">Tên Thương hiệu</th>
              <th class="py-4.5 px-6">Mô tả</th>
              <th class="py-4.5 px-6">Trạng thái</th>
              <th class="py-4.5 px-6 text-center">Hành động</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100 text-slate-700 font-medium">
            <tr v-for="b in brands" :key="b.brand_id" class="hover:bg-slate-50/40 transition-colors">
              <td class="py-4 px-6 text-slate-500 font-mono">#{{ b.brand_id }}</td>
              <td class="py-4 px-6 font-bold text-slate-900">
                <div class="flex items-center space-x-3">
                  <div class="w-10 h-10 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-center overflow-hidden">
                    <img v-if="b.logo_url" :src="getImageUrl(b.logo_url)" class="w-full h-full object-contain p-1" />
                    <span v-else class="text-[8px] text-slate-400 font-bold uppercase">No Logo</span>
                  </div>
                  <div class="flex flex-col">
                    <span class="text-sm font-extrabold text-slate-900 leading-tight">{{ b.brand_name }}</span>
                    <span class="text-[10px] text-slate-400 font-mono mt-0.5">{{ b.brand_code }}</span>
                  </div>
                </div>
              </td>
              <td class="py-4 px-6 text-slate-500 max-w-xs truncate">{{ b.description || '---' }}</td>
              <td class="py-4 px-6">
                <span class="px-2.5 py-1 rounded-full text-[9px] font-bold uppercase tracking-wider"
                  :class="b.status === 'active' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-rose-50 text-rose-700 border border-rose-200'">
                  {{ b.status === 'active' ? 'Hoạt động' : 'Đã khóa' }}
                </span>
              </td>
              <td class="py-4 px-6 text-center">
                <div class="flex items-center justify-center space-x-2">
                  <button 
                    @click="openEditModal(b)" 
                    class="text-[11px] font-bold px-3 py-1.5 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
                  >
                    Sửa
                  </button>
                  <button 
                    @click="confirmToggleStatus(b)" 
                    class="text-[11px] font-bold px-3 py-1.5 rounded-lg border transition-colors cursor-pointer"
                    :class="b.status === 'active' ? 'border-rose-100 text-rose-600 hover:bg-rose-50/50' : 'border-emerald-100 text-emerald-600 hover:bg-emerald-50/50'"
                  >
                    {{ b.status === 'active' ? 'Khóa' : 'Mở khóa' }}
                  </button>
                </div>
              </td>
            </tr>
            <tr v-if="brands.length === 0">
              <td colspan="5" class="text-center py-12 text-slate-400 font-medium">Không có thương hiệu nào.</td>
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
    <BaseModal :show="showCreateModal" title="Tạo Thương Hiệu Mới" size="sm" @close="showCreateModal = false">
      <div class="space-y-4 text-left">
        <div>
          <label class="block text-[10px] font-black text-slate-400 uppercase mb-1.5 tracking-wider">Tên Thương hiệu *</label>
          <input 
            type="text" 
            v-model="newBrand.brand_name" 
            placeholder="VD: Adidas, Nike..." 
            class="w-full border border-slate-200 rounded-xl px-4.5 py-3 text-xs focus:outline-none focus:border-red-500 transition-colors" 
          />
        </div>
        
        <div>
          <label class="block text-[10px] font-black text-slate-400 uppercase mb-1.5 tracking-wider">Logo thương hiệu</label>
          <div class="flex items-center space-x-4">
            <div class="w-16 h-16 rounded-2xl border border-slate-200 bg-slate-50 flex items-center justify-center overflow-hidden flex-shrink-0">
              <img v-if="logoPreview" :src="getImageUrl(logoPreview)" class="w-full h-full object-contain p-1" />
              <span v-else class="text-[9px] text-slate-400 font-bold uppercase text-center p-1">No Logo Selected</span>
            </div>
            <label class="flex-1">
              <span class="inline-block border border-slate-200 rounded-xl text-center px-4 py-2.5 text-xs font-bold text-slate-700 bg-slate-50 hover:bg-slate-100 transition-colors cursor-pointer w-full uppercase tracking-wider">Chọn ảnh</span>
              <input type="file" accept="image/*" class="hidden" @change="handleFileChange" />
            </label>
          </div>
        </div>

        <div>
          <label class="block text-[10px] font-black text-slate-400 uppercase mb-1.5 tracking-wider">Mô tả chi tiết</label>
          <textarea 
            v-model="newBrand.description" 
            rows="3" 
            placeholder="Mô tả về thương hiệu..." 
            class="w-full border border-slate-200 rounded-xl px-4.5 py-3 text-xs focus:outline-none focus:border-red-500 transition-colors resize-none"
          ></textarea>
        </div>

        <div class="flex space-x-3 pt-4 border-t border-slate-100">
          <button 
            @click="showCreateModal = false" 
            class="flex-1 border border-slate-200 font-bold py-3 rounded-xl text-xs text-slate-500 hover:bg-slate-50 transition-colors uppercase tracking-wider cursor-pointer"
          >
            Hủy
          </button>
          <button 
            @click="handleCreate" 
            :disabled="loading"
            class="flex-1 bg-red-600 hover:bg-red-700 disabled:bg-slate-400 font-bold py-3 rounded-xl text-xs text-white shadow-premium transition-colors uppercase tracking-wider cursor-pointer"
          >
            {{ loading ? 'Đang tạo...' : 'Tạo mới' }}
          </button>
        </div>
      </div>
    </BaseModal>

    <!-- Edit Modal -->
    <BaseModal :show="showEditModal" title="Chỉnh sửa Thương Hiệu" size="sm" @close="showEditModal = false">
      <div v-if="editingBrand" class="space-y-4 text-left">
        <div>
          <label class="block text-[10px] font-black text-slate-400 uppercase mb-1.5 tracking-wider">Tên Thương hiệu *</label>
          <input 
            type="text" 
            v-model="editingBrand.brand_name" 
            placeholder="Tên thương hiệu..." 
            class="w-full border border-slate-200 rounded-xl px-4.5 py-3 text-xs focus:outline-none focus:border-red-500 transition-colors" 
          />
        </div>
        
        <div>
          <label class="block text-[10px] font-black text-slate-400 uppercase mb-1.5 tracking-wider">Logo thương hiệu</label>
          <div class="flex items-center space-x-4">
            <div class="w-16 h-16 rounded-2xl border border-slate-200 bg-slate-50 flex items-center justify-center overflow-hidden flex-shrink-0">
              <img v-if="editLogoPreview" :src="getImageUrl(editLogoPreview)" class="w-full h-full object-contain p-1" />
              <span v-else class="text-[9px] text-slate-400 font-bold uppercase text-center p-1">No Logo Selected</span>
            </div>
            <label class="flex-1">
              <span class="inline-block border border-slate-200 rounded-xl text-center px-4 py-2.5 text-xs font-bold text-slate-700 bg-slate-50 hover:bg-slate-100 transition-colors cursor-pointer w-full uppercase tracking-wider">Thay logo</span>
              <input type="file" accept="image/*" class="hidden" @change="handleEditFileChange" />
            </label>
          </div>
        </div>

        <div>
          <label class="block text-[10px] font-black text-slate-400 uppercase mb-1.5 tracking-wider">Mô tả chi tiết</label>
          <textarea 
            v-model="editingBrand.description" 
            rows="3" 
            placeholder="Mô tả về thương hiệu..." 
            class="w-full border border-slate-200 rounded-xl px-4.5 py-3 text-xs focus:outline-none focus:border-red-500 transition-colors resize-none"
          ></textarea>
        </div>

        <div class="flex space-x-3 pt-4 border-t border-slate-100">
          <button 
            @click="showEditModal = false" 
            class="flex-1 border border-slate-200 font-bold py-3 rounded-xl text-xs text-slate-500 hover:bg-slate-50 transition-colors uppercase tracking-wider cursor-pointer"
          >
            Hủy
          </button>
          <button 
            @click="handleUpdate" 
            :disabled="loading"
            class="flex-1 bg-red-600 hover:bg-red-700 disabled:bg-slate-400 font-bold py-3 rounded-xl text-xs text-white shadow-premium transition-colors uppercase tracking-wider cursor-pointer"
          >
            {{ loading ? 'Đang lưu...' : 'Lưu thay đổi' }}
          </button>
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
