<script setup lang="ts">
import { ref } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useAuthStore } from '../stores/auth';
import { useCartStore } from '../stores/cart';
import { authService } from '../services/auth.service';

const router = useRouter();
const route = useRoute();
const authStore = useAuthStore();
const cartStore = useCartStore();

const email = ref('');
const password = ref('');
const isLoading = ref(false);
const errorMsg = ref<string | null>(null);

const handleLogin = async () => {
  if (!email.value || !password.value) {
    errorMsg.value = 'Vui lòng điền đầy đủ email và mật khẩu.';
    return;
  }

  isLoading.value = true;
  errorMsg.value = null;

  try {
    const res = await authService.loginCustomer({
      email: email.value,
      password: password.value,
    });

    if (res.success && res.data) {
      const { access_token, customer } = res.data;
      authStore.login(access_token, customer, 'customer');
      
      // Load cart after login
      await cartStore.fetchCart();
      
      const redirectPath = route.query.redirect as string || '/';
      router.push(redirectPath);
    } else {
      errorMsg.value = res.message || 'Đăng nhập thất bại.';
    }

  } catch (err: any) {
    console.error('Login error:', err);
    errorMsg.value = err.response?.data?.detail || 'Sai tài khoản hoặc mật khẩu. Vui lòng thử lại.';
  } finally {
    isLoading.value = false;
  }
};
</script>

<template>
  <div class="min-h-[80vh] flex items-center justify-center px-4 py-12 sm:px-6 lg:px-8 bg-slate-50">
    <div class="max-w-md w-full space-y-8 bg-white p-8 sm:p-10 rounded-3xl border border-slate-100 shadow-premium">
      <div class="text-center">
        <h2 class="text-3xl font-black font-sans text-slate-900 tracking-tight">ĐĂNG NHẬP CHẮT LỌC</h2>
        <div class="w-12 h-1 bg-brand-accent mx-auto mt-2 rounded"></div>
        <p class="mt-3 text-sm text-slate-500 font-sans">
          Chào mừng trở lại với MyShoes. Hãy đăng nhập để tiếp tục mua sắm.
        </p>
      </div>

      <!-- Error message -->
      <div v-if="errorMsg" class="bg-rose-50 border border-rose-100 text-rose-800 text-xs font-semibold rounded-xl p-3.5 flex items-center space-x-2">
        <svg class="h-4 w-4 text-rose-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
        <span>{{ errorMsg }}</span>
      </div>

      <form class="mt-8 space-y-6" @submit.prevent="handleLogin">
        <div class="space-y-4">
          <div>
            <label for="email-address" class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Địa chỉ Email</label>
            <input 
              id="email-address" 
              name="email" 
              type="email" 
              required 
              v-model="email"
              class="appearance-none rounded-xl relative block w-full px-4 py-3 border border-slate-200 placeholder-slate-400 text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-blue focus:border-brand-blue sm:text-sm transition-all" 
              placeholder="name@example.com" 
            />
          </div>
          <div>
            <label for="password" class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Mật khẩu</label>
            <input 
              id="password" 
              name="password" 
              type="password" 
              required 
              v-model="password"
              class="appearance-none rounded-xl relative block w-full px-4 py-3 border border-slate-200 placeholder-slate-400 text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-blue focus:border-brand-blue sm:text-sm transition-all" 
              placeholder="••••••••" 
            />
          </div>
        </div>

        <div>
          <button 
            type="submit" 
            :disabled="isLoading"
            class="group relative w-full flex justify-center py-3.5 px-4 border border-transparent text-sm font-bold rounded-xl text-white bg-brand-accent hover:bg-brand-accentHover focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-accent transition-all duration-300 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            <span v-if="isLoading" class="absolute left-4 flex items-center">
              <svg class="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            </span>
            {{ isLoading ? 'ĐANG ĐĂNG NHẬP...' : 'ĐĂNG NHẬP' }}
          </button>
        </div>
      </form>

      <div class="text-center mt-6">
        <p class="text-sm text-slate-500 font-sans">
          Chưa có tài khoản?
          <router-link to="/register" class="font-bold text-brand-blue hover:text-brand-accent transition-colors">Đăng ký ngay</router-link>
        </p>
      </div>
    </div>
  </div>
</template>
