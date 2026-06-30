<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue';
import { adminCategoryService } from '@/services/admin/category.service';
import ConfirmDialog from '@/components/common/ConfirmDialog.vue';
import BaseModal from '@/components/common/BaseModal.vue';

const categories = ref<any[]>([]);
const loading = ref(false);

// Create States
const showCreateModal = ref(false);
const newCategory = ref({ category_name: '', category_code: '', description: '', parent_id: null as number | null });
const autoGenerateCode = ref(true);

// Edit States
const showEditModal = ref(false);
const editingCategory = ref<any>(null);
const autoGenerateEditCode = ref(false);

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
      skip: 0,
      limit: 200 // Load all categories to build the full 2-level tree structure
    });
    if (res && res.data) {
      categories.value = res.data;
    }
  } catch (e) {
    console.error('Failed to load categories', e);
  } finally {
    loading.value = false;
  }
};

// Auto slug generation helper
const convertToSlug = (text: string) => {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[đĐ]/g, 'd')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .toUpperCase();
};

watch(() => newCategory.value.category_name, (newName) => {
  if (autoGenerateCode.value) {
    newCategory.value.category_code = convertToSlug(newName);
  }
});

watch(() => editingCategory.value?.category_name, (newName) => {
  if (autoGenerateEditCode.value && editingCategory.value) {
    editingCategory.value.category_code = convertToSlug(newName);
  }
});

// Build 2-level tree
const buildTree = (list: any[]) => {
  const roots = list.filter(item => !item.parent_id);
  return roots.map(root => {
    const children = list.filter(item => item.parent_id === root.category_id);
    return {
      ...root,
      children
    };
  });
};

const flattenedCategories = computed(() => {
  const tree = buildTree(categories.value);
  const result: any[] = [];
  tree.forEach(parent => {
    result.push({ ...parent, isChild: false });
    if (parent.children) {
      parent.children.forEach((child: any) => {
        result.push({ ...child, isChild: true, parentName: parent.category_name });
      });
    }
  });
  return result;
});

// Parent Category Dropdowns Options
// For creation: only root categories can be parents
const parentCategoryOptionsForCreate = computed(() => {
  return categories.value.filter(c => !c.parent_id);
});

// For editing: root categories except itself
const parentCategoryOptionsForEdit = computed(() => {
  if (!editingCategory.value) return [];
  // A category cannot select itself as parent
  // A category with children cannot be nested (maintaining 2-level limit)
  const hasChildren = categories.value.some(c => c.parent_id === editingCategory.value.category_id);
  if (hasChildren) return []; 
  
  return categories.value.filter(c => !c.parent_id && c.category_id !== editingCategory.value.category_id);
});

// Form Handlers
const handleCreate = async () => {
  if (!newCategory.value.category_name.trim() || !newCategory.value.category_code.trim()) {
    alert('Vui lòng điền đầy đủ tên và mã danh mục');
    return;
  }

  try {
    loading.value = true;
    const res = await adminCategoryService.createCategory({
      category_name: newCategory.value.category_name,
      category_code: newCategory.value.category_code,
      description: newCategory.value.description,
      parent_id: newCategory.value.parent_id || null
    });

    if (res && res.data) {
      showCreateModal.value = false;
      newCategory.value = { category_name: '', category_code: '', description: '', parent_id: null };
      autoGenerateCode.value = true;
      loadCategories();
    } else {
      alert(res.message || 'Tạo danh mục thất bại');
    }
  } catch (e: any) {
    alert(e.response?.data?.detail || 'Tạo danh mục thất bại');
  } finally {
    loading.value = false;
  }
};

const openEditModal = (category: any) => {
  editingCategory.value = {
    category_id: category.category_id,
    category_name: category.category_name,
    category_code: category.category_code,
    description: category.description,
    parent_id: category.parent_id || null
  };
  autoGenerateEditCode.value = false;
  showEditModal.value = true;
};

const handleUpdate = async () => {
  if (!editingCategory.value.category_name.trim() || !editingCategory.value.category_code.trim()) {
    alert('Vui lòng điền đầy đủ tên và mã danh mục');
    return;
  }

  try {
    loading.value = true;
    const res = await adminCategoryService.updateCategory(editingCategory.value.category_id, {
      category_name: editingCategory.value.category_name,
      category_code: editingCategory.value.category_code,
      description: editingCategory.value.description,
      parent_id: editingCategory.value.parent_id || null
    });

    if (res) {
      showEditModal.value = false;
      editingCategory.value = null;
      loadCategories();
    } else {
      alert(res.message || 'Cập nhật danh mục thất bại');
    }
  } catch (e: any) {
    alert(e.response?.data?.detail || 'Cập nhật danh mục thất bại');
  } finally {
    loading.value = false;
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
      const nextStatus = category.status === 'active' ? 'hidden' : 'active';
      try {
        await adminCategoryService.toggleCategoryStatus(category.category_id, nextStatus);
        loadCategories();
      } catch (err: any) {
        alert(err.response?.data?.detail || 'Thay đổi trạng thái thất bại');
      }
    }
  };
};
</script>

<template>
  <div class="space-y-8 text-left font-sans">
    <div class="flex items-center justify-between border-b border-slate-200 pb-5">
      <div>
        <h1 class="text-3xl font-black text-slate-900 uppercase tracking-tight font-display">Quản lý Danh Mục</h1>
        <p class="text-xs text-slate-400 font-bold mt-1.5 uppercase tracking-wider">Tạo, cập nhật và quản lý phân cấp danh mục sản phẩm (Tối đa 2 cấp)</p>
      </div>
      <button 
        @click="showCreateModal = true"
        class="bg-slate-950 hover:bg-red-600 hover:shadow-lg text-white text-xs font-bold px-5 py-3 rounded-xl transition-all duration-300 uppercase tracking-wider cursor-pointer"
      >
        Tạo Danh Mục Mới
      </button>
    </div>

    <div v-if="loading && categories.length === 0" class="py-12 flex justify-center items-center">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-900"></div>
    </div>

    <div v-else class="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-premium transition-all duration-300">
      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-slate-100 text-xs text-left">
          <thead>
            <tr class="bg-slate-50/70 text-slate-400 font-bold uppercase tracking-wider">
              <th class="py-4.5 px-6">ID</th>
              <th class="py-4.5 px-6">Tên danh mục</th>
              <th class="py-4.5 px-6">Mã Code</th>
              <th class="py-4.5 px-6">Mô tả</th>
              <!-- <th class="py-4.5 px-6">Phân cấp</th> -->
              <th class="py-4.5 px-6">Trạng thái</th>
              <th class="py-4.5 px-6 text-center">Hành động</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100 text-slate-700 font-medium">
            <tr 
              v-for="c in flattenedCategories" 
              :key="c.category_id" 
              :class="c.isChild ? 'bg-slate-50/20 hover:bg-slate-100/30' : 'hover:bg-slate-50/40'"
              class="transition-colors"
            >
              <td class="py-4 px-6 text-slate-500 font-mono">#{{ c.category_id }}</td>
              <td class="py-4 px-6">
                <div class="flex items-center">
                  <span v-if="c.isChild" class="text-slate-400 mr-2 font-mono text-sm">└─</span>
                  <span 
                    class="text-slate-900"
                    :class="c.isChild ? 'text-xs font-semibold text-slate-600' : 'text-sm font-extrabold'"
                  >
                    {{ c.category_name }}
                  </span>
                </div>
              </td>
              <td class="py-4 px-6 font-mono text-slate-400 font-bold text-[10px]">{{ c.category_code }}</td>
              <td class="py-4 px-6 text-slate-500 max-w-xs truncate">{{ c.description || '---' }}</td>
              <!-- <td class="py-4 px-6">
                <span 
                  class="px-2 py-0.5 rounded-full text-[9px] font-bold uppercase"
                  :class="c.isChild ? 'bg-slate-100 text-slate-600 border border-slate-200' : 'bg-brand-accent/10 text-red-700 border border-brand-accent/20'"
                >
                  {{ c.isChild ? `Thuộc: ${c.parentName}` : 'Danh mục gốc' }}
                </span>
              </td> -->
              <td class="py-4 px-6">
                <span class="px-2.5 py-1 rounded-full text-[9px] font-bold uppercase tracking-wider"
                  :class="c.status === 'active' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-rose-50 text-rose-700 border border-rose-200'">
                  {{ c.status === 'active' ? 'Hoạt động' : 'Đã khóa' }}
                </span>
              </td>
              <td class="py-4 px-6 text-center">
                <div class="flex items-center justify-center space-x-2">
                  <button 
                    @click="openEditModal(c)" 
                    class="text-[11px] font-bold px-3 py-1.5 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
                  >
                    Sửa
                  </button>
                  <button 
                    @click="confirmToggleStatus(c)" 
                    class="text-[11px] font-bold px-3 py-1.5 rounded-lg border transition-colors cursor-pointer"
                    :class="c.status === 'active' ? 'border-rose-100 text-rose-600 hover:bg-rose-50/50' : 'border-emerald-100 text-emerald-600 hover:bg-emerald-50/50'"
                  >
                    {{ c.status === 'active' ? 'Khóa' : 'Mở khóa' }}
                  </button>
                </div>
              </td>
            </tr>
            <tr v-if="categories.length === 0">
              <td colspan="7" class="text-center py-12 text-slate-400 font-medium">Không có danh mục nào.</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Create Modal -->
    <BaseModal :show="showCreateModal" title="Tạo Danh Mục Mới" size="sm" @close="showCreateModal = false">
      <div class="space-y-4 text-left">
        <div>
          <label class="block text-[10px] font-black text-slate-400 uppercase mb-1.5 tracking-wider">Tên Danh mục *</label>
          <input 
            type="text" 
            v-model="newCategory.category_name" 
            placeholder="VD: Giày Bóng Rổ..." 
            class="w-full border border-slate-200 rounded-xl px-4.5 py-3 text-xs focus:outline-none focus:border-red-500 transition-colors" 
          />
        </div>

        <div>
          <div class="flex items-center justify-between mb-1.5">
            <label class="block text-[10px] font-black text-slate-400 uppercase tracking-wider">Mã Code Danh mục *</label>
            <label class="flex items-center space-x-1 cursor-pointer">
              <input type="checkbox" v-model="autoGenerateCode" class="rounded text-red-600 focus:ring-red-500 w-3 h-3" />
              <span class="text-[9px] text-slate-400 font-bold uppercase">Tự động sinh</span>
            </label>
          </div>
          <input 
            type="text" 
            v-model="newCategory.category_code" 
            :disabled="autoGenerateCode"
            placeholder="VD: GIAY-BONG-RO" 
            class="w-full border border-slate-200 rounded-xl px-4.5 py-3 text-xs focus:outline-none focus:border-red-500 transition-colors disabled:bg-slate-50 disabled:text-slate-400 font-mono" 
          />
        </div>

        <div>
          <label class="block text-[10px] font-black text-slate-400 uppercase mb-1.5 tracking-wider">Danh mục cha (Phân cấp)</label>
          <select 
            v-model="newCategory.parent_id"
            class="w-full border border-slate-200 rounded-xl px-4 py-3 text-xs focus:outline-none focus:border-red-500 transition-colors bg-white"
          >
            <option :value="null">-- Không có (Danh mục gốc) --</option>
            <option 
              v-for="parent in parentCategoryOptionsForCreate" 
              :key="parent.category_id" 
              :value="parent.category_id"
            >
              {{ parent.category_name }}
            </option>
          </select>
          <p class="text-[9px] text-slate-400 font-bold mt-1 uppercase tracking-wide">
            Chỉ những danh mục gốc mới được làm danh mục cha.
          </p>
        </div>

        <div>
          <label class="block text-[10px] font-black text-slate-400 uppercase mb-1.5 tracking-wider">Mô tả danh mục</label>
          <textarea 
            v-model="newCategory.description" 
            rows="3" 
            placeholder="Mô tả tóm tắt..." 
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
    <BaseModal :show="showEditModal" title="Chỉnh sửa Danh Mục" size="sm" @close="showEditModal = false">
      <div v-if="editingCategory" class="space-y-4 text-left">
        <div>
          <label class="block text-[10px] font-black text-slate-400 uppercase mb-1.5 tracking-wider">Tên Danh mục *</label>
          <input 
            type="text" 
            v-model="editingCategory.category_name" 
            placeholder="Tên danh mục..." 
            class="w-full border border-slate-200 rounded-xl px-4.5 py-3 text-xs focus:outline-none focus:border-red-500 transition-colors" 
          />
        </div>

        <div>
          <div class="flex items-center justify-between mb-1.5">
            <label class="block text-[10px] font-black text-slate-400 uppercase tracking-wider">Mã Code Danh mục *</label>
            <label class="flex items-center space-x-1 cursor-pointer">
              <input type="checkbox" v-model="autoGenerateEditCode" class="rounded text-red-600 focus:ring-red-500 w-3 h-3" />
              <span class="text-[9px] text-slate-400 font-bold uppercase">Tự động sinh</span>
            </label>
          </div>
          <input 
            type="text" 
            v-model="editingCategory.category_code" 
            :disabled="autoGenerateEditCode"
            placeholder="Mã danh mục..." 
            class="w-full border border-slate-200 rounded-xl px-4.5 py-3 text-xs focus:outline-none focus:border-red-500 transition-colors disabled:bg-slate-50 disabled:text-slate-400 font-mono" 
          />
        </div>

        <div>
          <label class="block text-[10px] font-black text-slate-400 uppercase mb-1.5 tracking-wider">Danh mục cha (Phân cấp)</label>
          <select 
            v-model="editingCategory.parent_id"
            class="w-full border border-slate-200 rounded-xl px-4 py-3 text-xs focus:outline-none focus:border-red-500 transition-colors bg-white"
          >
            <option :value="null">-- Không có (Danh mục gốc) --</option>
            <option 
              v-for="parent in parentCategoryOptionsForEdit" 
              :key="parent.category_id" 
              :value="parent.category_id"
            >
              {{ parent.category_name }}
            </option>
          </select>
          <p class="text-[9px] text-slate-400 font-bold mt-1 uppercase tracking-wide">
            {{ parentCategoryOptionsForEdit.length === 0 ? 'Danh mục này không thể lồng vào danh mục khác (hoặc đang có con).' : 'Chỉ danh mục gốc chưa chứa con mới được chọn.' }}
          </p>
        </div>

        <div>
          <label class="block text-[10px] font-black text-slate-400 uppercase mb-1.5 tracking-wider">Mô tả danh mục</label>
          <textarea 
            v-model="editingCategory.description" 
            rows="3" 
            placeholder="Mô tả tóm tắt..." 
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
