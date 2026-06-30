<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAdminAuthStore } from '../../stores/adminAuth';
import { authService } from '../../services/auth.service';

const router = useRouter();
const adminAuthStore = useAdminAuthStore();

const email = ref('');
const password = ref('');
const isLoading = ref(false);
const errorMsg = ref<string | null>(null);

const handleLogin = async () => {
  if (!email.value || !password.value) {
    errorMsg.value = 'Vui lòng nhập tài khoản và mật khẩu';
    return;
  }

  isLoading.value = true;
  errorMsg.value = null;

  try {
    const res = await authService.loginAdmin({
      email: email.value,
      password: password.value,
    });
    
    if (res.success && res.data) {
      const { access_token, user } = res.data;
      adminAuthStore.login(access_token, user, user.role);
      router.push('/admin');
    } else {
      errorMsg.value = res.message || 'Đăng nhập thất bại';
    }
  } catch (err: any) {
    errorMsg.value = err.response?.data?.error?.message || err.response?.data?.detail || 'Sai tài khoản hoặc mật khẩu';
  } finally {
    isLoading.value = false;
  }
};

</script>

<template>
  <div class="min-h-screen flex items-center justify-center bg-slate-950 font-sans p-4">
    <div class="max-w-md w-full bg-slate-900 border border-slate-800 p-8 rounded-3xl shadow-2xl space-y-6">
      <div class="text-center space-y-2">
        <h1 class="text-2xl font-black text-white uppercase tracking-wider">SHOESHOP ADMIN</h1>
        <p class="text-xs text-slate-400 font-bold uppercase tracking-widest">Hệ thống quản lý nội bộ</p>
      </div>

      <form @submit.prevent="handleLogin" class="space-y-4 text-left">
        <div>
          <label class="block text-[10px] font-bold text-slate-400 uppercase mb-1 tracking-wider">Tên đăng nhập / Email</label>
          <input
            type="text"
            v-model="email"
            placeholder="admin@shoeshop.com"
            class="w-full bg-slate-800 border border-slate-700 text-white rounded-xl px-4 py-3 text-xs focus:outline-none focus:border-red-500 transition-colors placeholder:text-slate-500"
          />
        </div>

        <div>
          <label class="block text-[10px] font-bold text-slate-400 uppercase mb-1 tracking-wider">Mật khẩu</label>
          <input
            type="password"
            v-model="password"
            placeholder="••••••••"
            class="w-full bg-slate-800 border border-slate-700 text-white rounded-xl px-4 py-3 text-xs focus:outline-none focus:border-red-500 transition-colors placeholder:text-slate-500"
          />
        </div>

        <div v-if="errorMsg" class="bg-red-500/10 border border-red-500/20 text-red-500 rounded-xl px-4 py-2.5 text-xs text-center font-bold">
          {{ errorMsg }}
        </div>

        <button
          type="submit"
          :disabled="isLoading"
          class="w-full bg-red-600 hover:bg-red-700 text-white font-bold text-xs py-3 rounded-xl shadow-lg transition-colors flex items-center justify-center space-x-2"
        >
          <span v-if="isLoading">ĐANG ĐĂNG NHẬP...</span>
          <span v-else>ĐĂNG NHẬP HỆ THỐNG</span>
        </button>
      </form>
    </div>
  </div>
</template>
