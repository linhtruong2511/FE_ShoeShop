<script setup lang="ts">
import { useRouter, useRoute } from 'vue-router';

const router = useRouter();
const route = useRoute();

const menuItems = [
  { name: 'Dashboard', path: '/admin/dashboard', icon: 'M4 6a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2H6a2 2 0 01-2-2v-4zM14 16a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 01-2-2v-4z' },
  { name: 'Sản phẩm', path: '/admin/products', icon: 'M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z' },
  { name: 'Đơn hàng', path: '/admin/orders', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2' },
  { name: 'Khuyến mãi (Voucher)', path: '/admin/vouchers', icon: 'M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z' }
];

const logoutAdmin = () => {
  if (confirm('Bạn muốn đăng xuất khỏi trang Quản trị nội bộ?')) {
    router.push('/');
  }
};
</script>

<template>
  <div class="min-h-screen bg-slate-100 flex">
    <!-- Sidebar -->
    <aside class="w-64 bg-slate-950 text-white flex flex-col justify-between flex-shrink-0 shadow-2xl">
      <div>
        <!-- Logo -->
        <div class="p-6 border-b border-slate-900 flex items-center space-x-3">
          <span class="rounded-full bg-brand-accent p-2 text-white">
            <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          </span>
          <span class="text-lg font-black tracking-widest font-sans uppercase">AdminPortal</span>
        </div>

        <!-- Navigation Menu -->
        <nav class="mt-6 px-4 space-y-1">
          <router-link 
            v-for="item in menuItems" 
            :key="item.name" 
            :to="item.path"
            class="flex items-center space-x-3 px-4 py-3 rounded-xl text-xs font-bold transition-all uppercase tracking-wider"
            :class="route.path === item.path ? 'bg-brand-accent text-white shadow-lg' : 'text-slate-400 hover:bg-slate-900 hover:text-white'"
          >
            <svg class="h-5 w-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" :d="item.icon" />
            </svg>
            <span>{{ item.name }}</span>
          </router-link>
        </nav>
      </div>

      <!-- Footer action options -->
      <div class="p-4 border-t border-slate-900 space-y-2">
        <router-link 
          to="/"
          class="flex items-center space-x-3 px-4 py-3 rounded-xl text-xs font-bold text-slate-400 hover:bg-slate-900 hover:text-white uppercase tracking-wider transition-all"
        >
          <svg class="h-5 w-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
          <span>Khách hàng</span>
        </router-link>
        
        <button 
          @click="logoutAdmin"
          class="w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-xs font-bold text-slate-400 hover:bg-rose-950 hover:text-rose-400 uppercase tracking-wider transition-all"
        >
          <svg class="h-5 w-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          <span>Đăng xuất</span>
        </button>
      </div>
    </aside>

    <!-- Main Container -->
    <main class="flex-grow flex flex-col min-w-0">
      <!-- Navbar header -->
      <header class="bg-white border-b border-slate-200 h-16 flex items-center justify-between px-8">
        <h2 class="text-sm font-bold text-slate-500 uppercase tracking-wider">
          Hệ thống Quản lý Bán hàng MyShoes
        </h2>
        <div class="flex items-center space-x-4">
          <div class="text-right text-xs">
            <p class="font-extrabold text-slate-900">Admin Account</p>
            <p class="text-slate-400 mt-0.5">Quyền: Quản trị viên</p>
          </div>
          <span class="h-9 w-9 rounded-full bg-slate-950 flex items-center justify-center text-white text-xs font-black ring-2 ring-brand-accent ring-offset-2">
            AD
          </span>
        </div>
      </header>

      <!-- View content container -->
      <div class="flex-grow p-8 overflow-y-auto">
        <router-view />
      </div>
    </main>
  </div>
</template>
