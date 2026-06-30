<script setup lang="ts">
import { computed } from 'vue';

const props = defineProps<{
  currentPage: number;
  totalPages: number;
}>();

const emit = defineEmits<{
  (e: 'update:currentPage', page: number): void;
  (e: 'change', page: number): void;
}>();

const pages = computed(() => {
  const p = [];
  for (let i = 1; i <= props.totalPages; i++) {
    p.push(i);
  }
  return p;
});

const goToPage = (page: number) => {
  if (page >= 1 && page <= props.totalPages) {
    emit('update:currentPage', page);
    emit('change', page);
  }
};
</script>

<template>
  <div v-if="totalPages > 1" class="flex items-center justify-center space-x-2 py-4">
    <button 
      @click="goToPage(currentPage - 1)" 
      :disabled="currentPage === 1"
      class="px-3 py-1 rounded border border-slate-200 text-slate-600 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50 transition-colors font-bold text-sm"
    >
      Trang trước
    </button>
    
    <button 
      v-for="p in pages" 
      :key="p"
      @click="goToPage(p)"
      class="w-8 h-8 flex items-center justify-center rounded font-bold text-sm transition-all"
      :class="currentPage === p ? 'bg-brand-accent text-white shadow-premium' : 'text-slate-600 hover:bg-slate-100'"
    >
      {{ p }}
    </button>
    
    <button 
      @click="goToPage(currentPage + 1)" 
      :disabled="currentPage === totalPages"
      class="px-3 py-1 rounded border border-slate-200 text-slate-600 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50 transition-colors font-bold text-sm"
    >
      Trang sau
    </button>
  </div>
</template>
