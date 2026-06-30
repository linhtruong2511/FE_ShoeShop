<script setup lang="ts">
import { ref } from 'vue';
import BaseModal from './BaseModal.vue';

const props = defineProps<{
  show: boolean;
  title?: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: 'danger' | 'warning' | 'info';
  withInput?: boolean;
  inputPlaceholder?: string;
}>();

const inputValue = ref('');

const emit = defineEmits<{
  (e: 'confirm', value?: string): void;
  (e: 'cancel'): void;
}>();

const handleConfirm = () => {
  emit('confirm', props.withInput ? inputValue.value : undefined);
  inputValue.value = ''; // reset
};
</script>

<template>
  <BaseModal :show="show" :title="title || 'Xác nhận'" size="sm" @close="$emit('cancel')">
    <div class="text-slate-600 mb-4 font-medium leading-relaxed">
      {{ message }}
    </div>
    
    <div v-if="withInput" class="mb-6">
      <input 
        v-model="inputValue" 
        type="text" 
        :placeholder="inputPlaceholder || 'Nhập nội dung...'"
        class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-brand-accent focus:outline-none"
      />
    </div>
    
    <div class="flex space-x-3">
      <button 
        @click="$emit('cancel')" 
        class="flex-1 py-2.5 bg-slate-100 text-slate-700 font-bold rounded-xl hover:bg-slate-200 transition-colors uppercase tracking-wider text-sm"
      >
        {{ cancelText || 'Hủy bỏ' }}
      </button>
      <button 
        @click="handleConfirm" 
        class="flex-1 py-2.5 font-bold rounded-xl text-white shadow-premium hover:shadow-premium-hover transition-all uppercase tracking-wider text-sm"
        :class="{
          'bg-rose-500': type === 'danger',
          'bg-amber-500': type === 'warning',
          'bg-brand-accent': !type || type === 'info'
        }"
      >
        {{ confirmText || 'Đồng ý' }}
      </button>
    </div>
  </BaseModal>
</template>
