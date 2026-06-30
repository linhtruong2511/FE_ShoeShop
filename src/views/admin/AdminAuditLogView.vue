<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { adminAuditService } from '@/services/admin/audit.service';
import Pagination from '@/components/common/Pagination.vue';

const logs = ref<any[]>([]);
const loading = ref(false);
const page = ref(1);
const totalPages = ref(1);

onMounted(() => {
  loadLogs();
});

const loadLogs = async () => {
  try {
    loading.value = true;
    const res = await adminAuditService.getLogs({
      page: page.value,
      limit: 20
    });
    logs.value = res.data;
    totalPages.value = res.pagination.total_pages;
  } catch (e) {
    console.error('Failed to load audit logs', e);
  } finally {
    loading.value = false;
  }
};

const formatDate = (dateStr: string) => {
  return new Date(dateStr).toLocaleString('vi-VN');
};
</script>

<template>
  <div class="space-y-8 text-left">
    <div class="flex items-center justify-between border-b pb-5">
      <div>
        <h1 class="text-2xl font-black text-slate-900 font-sans uppercase">Nhật ký Hệ thống (Audit Log)</h1>
        <p class="text-xs text-slate-400 font-bold mt-1 uppercase tracking-wide">Truy vết các thao tác quan trọng trên hệ thống</p>
      </div>
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
              <th class="py-4 px-6">Thời gian</th>
              <th class="py-4 px-6">User ID</th>
              <th class="py-4 px-6">Hành động</th>
              <th class="py-4 px-6">Đối tượng</th>
              <th class="py-4 px-6">Chi tiết</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100 text-slate-700 font-medium">
            <tr v-for="log in logs" :key="log.log_id" class="hover:bg-slate-50/50">
              <td class="py-4 px-6 text-slate-500 font-mono">#{{ log.log_id }}</td>
              <td class="py-4 px-6">{{ formatDate(log.created_at) }}</td>
              <td class="py-4 px-6 font-bold text-slate-900">{{ log.user_id || 'Hệ thống' }}</td>
              <td class="py-4 px-6">
                <span class="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-slate-100 text-slate-800 tracking-wide border">
                  {{ log.action }}
                </span>
              </td>
              <td class="py-4 px-6">{{ log.resource }} {{ log.resource_id ? `#${log.resource_id}` : '' }}</td>
              <td class="py-4 px-6 text-slate-500 max-w-md truncate">{{ log.details || '---' }}</td>
            </tr>
            <tr v-if="logs.length === 0">
              <td colspan="6" class="text-center py-8 text-slate-400">Không có nhật ký nào.</td>
            </tr>
          </tbody>
        </table>
      </div>
      <Pagination 
        v-model:currentPage="page" 
        :total-pages="totalPages" 
        @change="loadLogs" 
      />
    </div>
  </div>
</template>
