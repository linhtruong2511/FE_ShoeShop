<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { authService } from '../services/auth.service';

const router = useRouter();

const fullName = ref('');
const email = ref('');
const phone = ref('');
const password = ref('');
const confirmPassword = ref('');
const isLoading = ref(false);
const errorMsg = ref<string | null>(null);
const successMsg = ref<string | null>(null);

const handleRegister = async () => {
  if (!fullName.value || !email.value || !password.value || !confirmPassword.value) {
    errorMsg.value = 'Vui lòng điền đầy đủ các thông tin bắt buộc.';
    return;
  }

  if (password.value.length < 6) {
    errorMsg.value = 'Mật khẩu phải chứa ít nhất 6 ký tự.';
    return;
  }

  if (password.value !== confirmPassword.value) {
    errorMsg.value = 'Xác nhận mật khẩu không trùng khớp.';
    return;
  }

  // Vietnamese phone regex
  const phoneRegex = /^0[0-9]{9}$/;
  if (phone.value && !phoneRegex.test(phone.value)) {
    errorMsg.value = 'Số điện thoại không hợp lệ (phải có 10 chữ số và bắt đầu bằng số 0).';
    return;
  }

  isLoading.value = true;
  errorMsg.value = null;
  successMsg.value = null;

  try {
    const res = await authService.registerCustomer({
      full_name: fullName.value,
      email: email.value,
      phone: phone.value || null,
      password: password.value,
    });

    if (res.success) {
      successMsg.value = 'Đăng ký tài khoản thành công! Đang chuyển hướng đến trang đăng nhập...';
      setTimeout(() => {
        router.push('/login');
      }, 2000);
    } else {
      errorMsg.value = res.message || 'Đăng ký thất bại.';
    }
  } catch (err: any) {
    console.error('Register error:', err);
    errorMsg.value = err.response?.data?.detail || 'Email hoặc số điện thoại đã được đăng ký.';
  } finally {
    isLoading.value = false;
  }
};
</script>

<template>
  <div class="min-h-[85vh] flex items-center justify-center px-4 py-12 sm:px-6 lg:px-8 bg-slate-50">
    <div class="max-w-md w-full space-y-8 bg-white p-8 sm:p-10 rounded-3xl border border-slate-100 shadow-premium">
      <div class="text-center">
        <h2 class="text-3xl font-black font-sans text-slate-900 tracking-tight">ĐĂNG KÝ THÀNH VIÊN</h2>
        <div class="w-12 h-1 bg-brand-accent mx-auto mt-2 rounded"></div>
        <p class="mt-3 text-sm text-slate-500 font-sans">
          Tham gia MyShoes ngay hôm nay để nhận được nhiều ưu đãi mua sắm hấp dẫn.
        </p>
      </div>

      <!-- Success message -->
      <div v-if="successMsg" class="bg-emerald-50 border border-emerald-100 text-emerald-800 text-xs font-semibold rounded-xl p-3.5 flex items-center space-x-2">
        <svg class="h-4 w-4 text-emerald-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="3">
          <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
        </svg>
        <span>{{ successMsg }}</span>
      </div>

      <!-- Error message -->
      <div v-if="errorMsg" class="bg-rose-50 border border-rose-100 text-rose-800 text-xs font-semibold rounded-xl p-3.5 flex items-center space-x-2">
        <svg class="h-4 w-4 text-rose-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
        <span>{{ errorMsg }}</span>
      </div>

      <form class="mt-8 space-y-5" @submit.prevent="handleRegister">
        <div class="space-y-4">
          <div>
            <label for="full-name" class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Họ và tên *</label>
            <input 
              id="full-name" 
              name="name" 
              type="text" 
              required 
              v-model="fullName"
              class="appearance-none rounded-xl relative block w-full px-4 py-3 border border-slate-200 placeholder-slate-400 text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-blue focus:border-brand-blue sm:text-sm transition-all" 
              placeholder="Nguyễn Văn A" 
            />
          </div>
          
          <div>
            <label for="email-address" class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Địa chỉ Email *</label>
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
            <label for="phone" class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Số điện thoại</label>
            <input 
              id="phone" 
              name="phone" 
              type="tel" 
              v-model="phone"
              class="appearance-none rounded-xl relative block w-full px-4 py-3 border border-slate-200 placeholder-slate-400 text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-blue focus:border-brand-blue sm:text-sm transition-all" 
              placeholder="0912345678" 
            />
          </div>

          <div>
            <label for="password" class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Mật khẩu *</label>
            <input 
              id="password" 
              name="password" 
              type="password" 
              required 
              v-model="password"
              class="appearance-none rounded-xl relative block w-full px-4 py-3 border border-slate-200 placeholder-slate-400 text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-blue focus:border-brand-blue sm:text-sm transition-all" 
              placeholder="Tối thiểu 6 ký tự" 
            />
          </div>

          <div>
            <label for="confirm-password" class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Xác nhận mật khẩu *</label>
            <input 
              id="confirm-password" 
              name="confirm-password" 
              type="password" 
              required 
              v-model="confirmPassword"
              class="appearance-none rounded-xl relative block w-full px-4 py-3 border border-slate-200 placeholder-slate-400 text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-blue focus:border-brand-blue sm:text-sm transition-all" 
              placeholder="Nhập lại mật khẩu" 
            />
          </div>
        </div>

        <div class="pt-2">
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
            {{ isLoading ? 'ĐANG TẠO TÀI KHOẢN...' : 'ĐĂNG KÝ NGAY' }}
          </button>
        </div>
      </form>

      <div class="text-center mt-6">
        <p class="text-sm text-slate-500 font-sans">
          Đã có tài khoản?
          <router-link to="/login" class="font-bold text-brand-blue hover:text-brand-accent transition-colors">Đăng nhập</router-link>
        </p>
      </div>
    </div>
  </div>
</template>
