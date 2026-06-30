<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { adminUserService } from '@/services/admin/user.service';
import { adminCustomerService } from '@/services/admin/customer.service';
import type { AdminUser, AdminCustomer, AdminUserCreate } from '@/types';
import { useAdminAuthStore } from '@/stores/adminAuth';
import Pagination from '@/components/common/Pagination.vue';
import ConfirmDialog from '@/components/common/ConfirmDialog.vue';

const adminAuthStore = useAdminAuthStore();

const activeTab = ref<'staff' | 'customer'>('staff');

// Staff State
const staffList = ref<AdminUser[]>([]);
const staffSearch = ref('');
const staffRole = ref('');
const staffStatus = ref('');
const staffLoading = ref(false);
const staffPage = ref(1);
const staffTotalPages = ref(1);

// Customer State
const customerList = ref<AdminCustomer[]>([]);
const customerSearch = ref('');
const customerStatus = ref('');
const customerLoading = ref(false);
const customerPage = ref(1);
const customerTotalPages = ref(1);

// Modal Create Staff
const showCreateModal = ref(false);
const formStaff = ref<AdminUserCreate>({
  username: '',
  email: '',
  password: '',
  full_name: '',
  phone: '',
  role: 'staff',
  status: 'active'
});

const loadStaff = async () => {
  try {
    staffLoading.value = true;
    const res = await adminUserService.getUsers({
      search: staffSearch.value,
      role: staffRole.value,
      status: staffStatus.value,
      page: staffPage.value,
      limit: 10
    });
    staffList.value = res.data;
    staffTotalPages.value = res.pagination.total_pages;
  } catch (err) {
    alert('Không thể tải danh sách nhân viên');
  } finally {
    staffLoading.value = false;
  }
};

const loadCustomers = async () => {
  try {
    customerLoading.value = true;
    const res = await adminCustomerService.getCustomers({
      search: customerSearch.value,
      status: customerStatus.value,
      page: customerPage.value,
      limit: 10
    });
    customerList.value = res.data;
    customerTotalPages.value = res.pagination.total_pages;
  } catch (err) {
    alert('Không thể tải danh sách khách hàng');
  } finally {
    customerLoading.value = false;
  }
};

const handleCreateStaff = async () => {
  try {
    await adminUserService.createUser(formStaff.value);
    showCreateModal.value = false;
    formStaff.value = {
      username: '',
      email: '',
      password: '',
      full_name: '',
      phone: '',
      role: 'staff',
      status: 'active'
    };
    await loadStaff();
  } catch (err: any) {
    alert(err.response?.data?.detail || 'Lỗi khi tạo tài khoản');
  }
};

const toggleStaffStatus = async (user: AdminUser) => {
  try {
    const newStatus = user.status === 'active' ? 'locked' : 'active';
    await adminUserService.toggleUserStatus(user.user_id, newStatus);
    user.status = newStatus;
  } catch (err) {
    alert('Lỗi khi cập nhật trạng thái');
  }
};

const toggleCustomerStatus = async (customer: AdminCustomer) => {
  try {
    const newStatus = customer.status === 'active' ? 'locked' : 'active';
    await adminCustomerService.toggleCustomerStatus(customer.customer_id, newStatus);
    customer.status = newStatus;
  } catch (err) {
    alert('Lỗi khi cập nhật trạng thái');
  }
};

const confirmState = ref({
  show: false,
  title: 'Xác nhận',
  message: '',
  onConfirm: () => {}
});

const confirmToggleStaff = (user: AdminUser) => {
  const action = user.status === 'active' ? 'khóa' : 'mở khóa';
  confirmState.value = {
    show: true,
    title: 'Xác nhận trạng thái',
    message: `Bạn có chắc chắn muốn ${action} nhân viên ${user.full_name}?`,
    onConfirm: async () => {
      confirmState.value.show = false;
      await toggleStaffStatus(user);
    }
  };
};

const confirmToggleCustomer = (customer: AdminCustomer) => {
  const action = customer.status === 'active' ? 'khóa' : 'mở khóa';
  confirmState.value = {
    show: true,
    title: 'Xác nhận trạng thái',
    message: `Bạn có chắc chắn muốn ${action} khách hàng ${customer.full_name}?`,
    onConfirm: async () => {
      confirmState.value.show = false;
      await toggleCustomerStatus(customer);
    }
  };
};

onMounted(() => {
  loadStaff();
  loadCustomers();
});
</script>

<template>
  <div>
    <!-- Header -->
    <div class="mb-6 flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-black text-slate-900 uppercase tracking-tight">Quản lý Người Dùng</h1>
        <p class="text-slate-500 mt-1">Quản lý tài khoản nhân viên và khách hàng</p>
      </div>
      <button 
        v-if="activeTab === 'staff' && adminAuthStore.isAdmin"
        @click="showCreateModal = true"
        class="bg-brand-accent text-white px-4 py-2 rounded-lg font-bold shadow-premium hover:shadow-premium-hover hover:-translate-y-0.5 transition-all"
      >
        + Thêm Nhân Viên
      </button>
    </div>

    <!-- Tabs -->
    <div class="flex space-x-4 mb-6 border-b border-slate-200">
      <button 
        @click="activeTab = 'staff'"
        class="pb-2 font-bold transition-all px-2"
        :class="activeTab === 'staff' ? 'text-brand-accent border-b-2 border-brand-accent' : 'text-slate-500 hover:text-slate-800'"
      >
        Nhân Viên (Staff/Admin)
      </button>
      <button 
        @click="activeTab = 'customer'"
        class="pb-2 font-bold transition-all px-2"
        :class="activeTab === 'customer' ? 'text-brand-accent border-b-2 border-brand-accent' : 'text-slate-500 hover:text-slate-800'"
      >
        Khách Hàng
      </button>
    </div>

    <!-- STAFF TAB -->
    <div v-if="activeTab === 'staff'" class="space-y-6">
      <!-- Filters -->
      <div class="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex space-x-4">
        <input 
          v-model="staffSearch" 
          @keyup.enter="loadStaff"
          type="text" 
          placeholder="Tìm theo username, tên, email..." 
          class="flex-1 px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-accent"
        />
        <select v-model="staffRole" @change="loadStaff" class="px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-accent">
          <option value="">Tất cả quyền</option>
          <option value="admin">Admin</option>
          <option value="staff">Staff</option>
        </select>
        <select v-model="staffStatus" @change="loadStaff" class="px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-accent">
          <option value="">Tất cả trạng thái</option>
          <option value="active">Hoạt động</option>
          <option value="locked">Bị khóa</option>
        </select>
        <button @click="loadStaff" class="bg-slate-900 text-white px-4 py-2 rounded-lg font-bold hover:bg-slate-800">
          Lọc
        </button>
      </div>

      <!-- Table -->
      <div class="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div v-if="staffLoading" class="p-8 text-center text-slate-500">Đang tải...</div>
        <table v-else class="w-full text-left text-sm">
          <thead class="bg-slate-50 border-b border-slate-200">
            <tr>
              <th class="px-6 py-4 font-bold text-slate-600">Username / Email</th>
              <th class="px-6 py-4 font-bold text-slate-600">Họ và Tên</th>
              <th class="px-6 py-4 font-bold text-slate-600">Quyền</th>
              <th class="px-6 py-4 font-bold text-slate-600">Trạng Thái</th>
              <th class="px-6 py-4 font-bold text-slate-600">Thao tác</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100">
            <tr v-for="user in staffList" :key="user.user_id" class="hover:bg-slate-50 transition-colors">
              <td class="px-6 py-4">
                <div class="font-bold text-slate-900">{{ user.username }}</div>
                <div class="text-slate-500 text-xs">{{ user.email }}</div>
              </td>
              <td class="px-6 py-4">{{ user.full_name }}<br><span class="text-xs text-slate-500">{{ user.phone }}</span></td>
              <td class="px-6 py-4">
                <span class="px-2 py-1 text-xs font-bold rounded-full" :class="user.role === 'admin' ? 'bg-indigo-100 text-indigo-700' : 'bg-slate-100 text-slate-700'">
                  {{ user.role.toUpperCase() }}
                </span>
              </td>
              <td class="px-6 py-4">
                <span class="px-2 py-1 text-xs font-bold rounded-full" :class="user.status === 'active' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'">
                  {{ user.status === 'active' ? 'Hoạt động' : 'Bị khóa' }}
                </span>
              </td>
              <td class="px-6 py-4">
                <button 
                  v-if="adminAuthStore.isAdmin"
                  @click="confirmToggleStaff(user)" 
                  class="text-xs font-bold px-3 py-1 rounded bg-slate-200 hover:bg-slate-300"
                >
                  {{ user.status === 'active' ? 'Khóa' : 'Mở khóa' }}
                </button>
              </td>
            </tr>
            <tr v-if="staffList.length === 0">
              <td colspan="5" class="px-6 py-8 text-center text-slate-500">Không có dữ liệu</td>
            </tr>
          </tbody>
        </table>
      </div>
      <Pagination 
        v-model:currentPage="staffPage" 
        :total-pages="staffTotalPages" 
        @change="loadStaff" 
      />
    </div>

    <!-- CUSTOMER TAB -->
    <div v-if="activeTab === 'customer'" class="space-y-6">
      <!-- Filters -->
      <div class="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex space-x-4">
        <input 
          v-model="customerSearch" 
          @keyup.enter="loadCustomers"
          type="text" 
          placeholder="Tìm theo tên, email, SĐT..." 
          class="flex-1 px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-accent"
        />
        <select v-model="customerStatus" @change="loadCustomers" class="px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-accent">
          <option value="">Tất cả trạng thái</option>
          <option value="active">Hoạt động</option>
          <option value="locked">Bị khóa</option>
        </select>
        <button @click="loadCustomers" class="bg-slate-900 text-white px-4 py-2 rounded-lg font-bold hover:bg-slate-800">
          Lọc
        </button>
      </div>

      <!-- Table -->
      <div class="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div v-if="customerLoading" class="p-8 text-center text-slate-500">Đang tải...</div>
        <table v-else class="w-full text-left text-sm">
          <thead class="bg-slate-50 border-b border-slate-200">
            <tr>
              <th class="px-6 py-4 font-bold text-slate-600">Họ và Tên</th>
              <th class="px-6 py-4 font-bold text-slate-600">Liên hệ</th>
              <th class="px-6 py-4 font-bold text-slate-600">Trạng Thái</th>
              <th class="px-6 py-4 font-bold text-slate-600">Ngày Đăng Ký</th>
              <th class="px-6 py-4 font-bold text-slate-600">Thao tác</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100">
            <tr v-for="c in customerList" :key="c.customer_id" class="hover:bg-slate-50 transition-colors">
              <td class="px-6 py-4 font-bold text-slate-900">{{ c.full_name }}</td>
              <td class="px-6 py-4">
                <div class="text-slate-900">{{ c.email }}</div>
                <div class="text-slate-500 text-xs">{{ c.phone || 'Chưa cập nhật' }}</div>
              </td>
              <td class="px-6 py-4">
                <span class="px-2 py-1 text-xs font-bold rounded-full" :class="c.status === 'active' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'">
                  {{ c.status === 'active' ? 'Hoạt động' : 'Bị khóa' }}
                </span>
              </td>
              <td class="px-6 py-4 text-slate-500">{{ new Date(c.created_at).toLocaleDateString('vi-VN') }}</td>
              <td class="px-6 py-4">
                <button 
                  v-if="adminAuthStore.isAdmin"
                  @click="confirmToggleCustomer(c)" 
                  class="text-xs font-bold px-3 py-1 rounded bg-slate-200 hover:bg-slate-300"
                >
                  {{ c.status === 'active' ? 'Khóa' : 'Mở khóa' }}
                </button>
              </td>
            </tr>
            <tr v-if="customerList.length === 0">
              <td colspan="5" class="px-6 py-8 text-center text-slate-500">Không có dữ liệu</td>
            </tr>
          </tbody>
        </table>
      </div>
      <Pagination 
        v-model:currentPage="customerPage" 
        :total-pages="customerTotalPages" 
        @change="loadCustomers" 
      />
    </div>

    <!-- Create Staff Modal -->
    <div v-if="showCreateModal" class="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm">
      <div class="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
        <div class="flex justify-between items-center mb-6">
          <h3 class="text-lg font-black uppercase tracking-tight text-slate-900">Thêm Nhân Viên</h3>
          <button @click="showCreateModal = false" class="text-slate-400 hover:text-slate-600">
            <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
          </button>
        </div>
        <form @submit.prevent="handleCreateStaff" class="space-y-4">
          <div>
            <label class="block text-xs font-bold text-slate-500 uppercase mb-1">Username</label>
            <input v-model="formStaff.username" required class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-brand-accent focus:outline-none" />
          </div>
          <div>
            <label class="block text-xs font-bold text-slate-500 uppercase mb-1">Email</label>
            <input v-model="formStaff.email" type="email" required class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-brand-accent focus:outline-none" />
          </div>
          <div>
            <label class="block text-xs font-bold text-slate-500 uppercase mb-1">Mật khẩu</label>
            <input v-model="formStaff.password" type="password" required class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-brand-accent focus:outline-none" />
          </div>
          <div>
            <label class="block text-xs font-bold text-slate-500 uppercase mb-1">Họ và tên</label>
            <input v-model="formStaff.full_name" required class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-brand-accent focus:outline-none" />
          </div>
          <div>
            <label class="block text-xs font-bold text-slate-500 uppercase mb-1">Số điện thoại</label>
            <input v-model="formStaff.phone" class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-brand-accent focus:outline-none" />
          </div>
          <div>
            <label class="block text-xs font-bold text-slate-500 uppercase mb-1">Quyền</label>
            <select v-model="formStaff.role" class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-brand-accent focus:outline-none">
              <option value="staff">Staff (Nhân viên)</option>
              <option value="admin">Admin (Quản trị viên)</option>
            </select>
          </div>
          <div class="flex space-x-3 pt-4">
            <button type="button" @click="showCreateModal = false" class="flex-1 py-3 bg-slate-100 text-slate-700 font-bold rounded-xl hover:bg-slate-200 transition-colors">Hủy</button>
            <button type="submit" class="flex-1 py-3 bg-brand-accent text-white font-bold rounded-xl shadow-premium hover:shadow-premium-hover transition-all">Tạo Mới</button>
          </div>
        </form>
      </div>
    </div>

    <ConfirmDialog 
      :show="confirmState.show" 
      :title="confirmState.title" 
      :message="confirmState.message" 
      @confirm="confirmState.onConfirm" 
      @cancel="confirmState.show = false" 
    />
  </div>
</template>
