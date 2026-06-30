<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import { useCartStore, getDiscountedPrice } from '../../stores/cart';
import { useAuthStore } from '../../stores/auth';
import { mockProducts } from '../../mocks/products';
import CartDrawer from './CartDrawer.vue';

const router = useRouter();
const cartStore = useCartStore();
const authStore = useAuthStore();

const searchQuery = ref('');
const isCartOpen = ref(false);
const isMobileMenuOpen = ref(false);
const isMobileProductsOpen = ref(false);
const searchResultsRef = ref<HTMLElement | null>(null);
const userMenuRef = ref<HTMLElement | null>(null);
const showSearchResults = ref(false);
const isUserMenuOpen = ref(false);

const totalItems = computed(() => cartStore.totalItems);

const handleLogout = () => {
  authStore.logout();
  isUserMenuOpen.value = false;
  isMobileMenuOpen.value = false;
  router.push('/login');
};

const filteredProducts = computed(() => {
  const query = searchQuery.value.trim().toLowerCase();
  if (query.length < 2) return [];
  return mockProducts.filter(
    (product) =>
      product.product_name.toLowerCase().includes(query) ||
      product.brand_name.toLowerCase().includes(query)
  ).slice(0, 5); // Limit to 5 results
});

const getDisplayImage = (p: typeof mockProducts[0]) => {
  const c = p.colors.find(col => col.is_default) || p.colors[0];
  return c.images.find(img => img.is_main)?.image_url || c.images[0]?.image_url;
};

const getDisplayPrice = (p: typeof mockProducts[0]) => {
  const c = p.colors.find(col => col.is_default) || p.colors[0];
  return getDiscountedPrice(c);
};

const handleSearchInput = () => {
  showSearchResults.value = searchQuery.value.trim().length >= 2;
};

const selectProduct = (productId: number | string) => {
  router.push(`/product/${productId}`);
  searchQuery.value = '';
  showSearchResults.value = false;
};

const handleSearchSubmit = () => {
  if (searchQuery.value.trim()) {
    router.push(`/products?search=${encodeURIComponent(searchQuery.value.trim())}`);
    showSearchResults.value = false;
  }
};

const navigateToBrand = (brandName: string) => {
  router.push(`/products?brand=${brandName}`);
  isMobileMenuOpen.value = false;
};

const toggleCart = () => {
  isCartOpen.value = !isCartOpen.value;
};

const clickOutside = (event: MouseEvent) => {
  if (searchResultsRef.value && !searchResultsRef.value.contains(event.target as Node)) {
    showSearchResults.value = false;
  }
  if (userMenuRef.value && !userMenuRef.value.contains(event.target as Node)) {
    isUserMenuOpen.value = false;
  }
};

onMounted(() => {
  cartStore.loadCart();
  document.addEventListener('click', clickOutside);
});

onUnmounted(() => {
  document.removeEventListener('click', clickOutside);
});
</script>

<template>
  <header class="sticky top-0 z-40 w-full bg-slate-950 text-white border-b border-slate-900 shadow-md">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex items-center justify-between h-20">
        
        <!-- Logo -->
        <div class="shrink-0 flex items-center">
          <router-link to="/" class="flex items-center space-x-1">
            <span class="text-2xl font-black font-sans tracking-wider text-white">SHOE<span class="text-brand-accent">SHOP</span></span>
            <span class="hidden md:inline-block bg-brand-accent text-[9px] uppercase font-bold px-1.5 py-0.5 rounded text-white tracking-widest font-sans ml-2">ORIGINAL</span>
          </router-link>
        </div>

        <!-- Desktop Navigation -->
        <nav class="hidden lg:flex items-center space-x-6 text-xs font-bold uppercase tracking-wider">
          <router-link to="/" class="hover:text-brand-accent transition-colors duration-200 py-2">Trang chủ</router-link>
          
          <!-- Dropdown "Sản phẩm" -->
          <div class="relative group py-2">
            <button class="flex items-center space-x-1 hover:text-brand-accent transition-colors duration-200 focus:outline-none">
              <span>SẢN PHẨM</span>
              <svg class="h-4 w-4 transform group-hover:rotate-180 transition-transform duration-200" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
                <path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            <!-- Dropdown Menu -->
            <div class="absolute left-0 mt-1 w-48 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 transform translate-y-2 group-hover:translate-y-0 z-50 overflow-hidden py-1">
              <router-link to="/products" class="block px-4 py-2.5 text-slate-300 hover:bg-slate-800 hover:text-white transition-colors duration-150 normal-case font-medium">Tất cả giày</router-link>
              <div class="h-px bg-slate-800 my-1"></div>
              <button @click="navigateToBrand('Nike')" class="w-full text-left px-4 py-2.5 text-slate-300 hover:bg-slate-800 hover:text-white transition-colors duration-150 uppercase font-bold text-[11px] tracking-wider">Nike</button>
              <button @click="navigateToBrand('Adidas')" class="w-full text-left px-4 py-2.5 text-slate-300 hover:bg-slate-800 hover:text-white transition-colors duration-150 uppercase font-bold text-[11px] tracking-wider">Adidas</button>
              <button @click="navigateToBrand('Puma')" class="w-full text-left px-4 py-2.5 text-slate-300 hover:bg-slate-800 hover:text-white transition-colors duration-150 uppercase font-bold text-[11px] tracking-wider">Puma</button>
              <button @click="navigateToBrand('Jordan')" class="w-full text-left px-4 py-2.5 text-slate-300 hover:bg-slate-800 hover:text-white transition-colors duration-150 uppercase font-bold text-[11px] tracking-wider">Jordan</button>
            </div>
          </div>

          <router-link to="/orders" class="hover:text-brand-accent transition-colors duration-200 py-2 text-slate-300">Đơn hàng của tôi</router-link>
        </nav>

        <!-- Search Bar & Actions -->
        <div class="flex items-center space-x-4 flex-1 max-w-xs md:max-w-md justify-end lg:flex-none">
          <!-- Live Search Input -->
          <div ref="searchResultsRef" class="relative hidden sm:block w-48 md:w-64">
            <form @submit.prevent="handleSearchSubmit" class="relative">
              <input
                v-model="searchQuery"
                @input="handleSearchInput"
                @focus="handleSearchInput"
                type="text"
                placeholder="Tìm giày Adidas, Nike..."
                class="w-full bg-slate-900 text-slate-200 pl-10 pr-4 py-2.5 rounded-full border border-slate-800 text-xs focus:outline-none focus:border-brand-accent transition-all duration-200"
              />
              <span class="absolute left-3.5 top-3 text-slate-400">
                <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </span>
            </form>

            <!-- Search Results Popover -->
            <div 
              v-if="showSearchResults && filteredProducts.length > 0" 
              class="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-2xl border border-slate-100 text-slate-800 overflow-hidden z-50 py-2"
            >
              <div class="px-4 py-1.5 text-xs font-semibold text-slate-400 uppercase border-b border-slate-50 text-left">
                Sản phẩm gợi ý
              </div>
              <ul>
                <li 
                  v-for="product in filteredProducts" 
                  :key="product.product_id"
                  @click="selectProduct(product.product_id)"
                  class="flex items-center space-x-3 px-4 py-2.5 hover:bg-slate-50 cursor-pointer transition-colors"
                >
                  <img :src="getDisplayImage(product) || '/placeholder_image.png'" :alt="product.product_name" class="w-10 h-10 object-cover rounded-md" />
                  <div class="flex-1 min-w-0 text-left">
                    <p class="text-xs font-bold text-slate-900 truncate">{{ product.product_name }}</p>
                    <p class="text-[10px] text-slate-400">{{ product.brand_name }}</p>
                  </div>
                  <p class="text-xs font-black text-brand-accent">{{ new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(getDisplayPrice(product)) }}</p>
                </li>
              </ul>
              <div 
                @click="handleSearchSubmit" 
                class="px-4 py-2 text-center text-xs font-bold text-brand-blue hover:bg-slate-50 border-t border-slate-50 cursor-pointer mt-1"
              >
                Xem tất cả kết quả
              </div>
            </div>
          </div>

          <!-- Cart Action -->
          <button 
            @click="toggleCart" 
            class="relative p-2 text-slate-300 hover:text-white transition-colors focus:outline-none"
            aria-label="Cart"
          >
            <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
            <span 
              v-if="totalItems > 0"
              class="absolute -top-0.5 -right-0.5 inline-flex items-center justify-center px-1.5 py-0.5 rounded-full text-[10px] font-bold leading-none bg-brand-accent text-white"
            >
              {{ totalItems }}
            </span>
          </button>

          <!-- User Actions (Desktop) -->
          <div v-if="authStore.isLoggedIn" ref="userMenuRef" class="relative hidden lg:block">
            <button 
              @click="isUserMenuOpen = !isUserMenuOpen"
              class="flex items-center space-x-2 text-slate-300 hover:text-white transition-colors focus:outline-none py-1.5 px-3 rounded-full hover:bg-slate-900 border border-transparent hover:border-slate-800 text-xs font-bold uppercase tracking-wider cursor-pointer"
            >
              <svg class="h-4 w-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
                <path stroke-linecap="round" stroke-linejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              <span>{{ authStore.user?.full_name?.split(' ').pop() || 'Tài khoản' }}</span>
            </button>
            <div 
              v-if="isUserMenuOpen" 
              class="absolute right-0 mt-2 w-48 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl z-50 overflow-hidden py-1 text-left"
            >
              <div class="px-4 py-2 border-b border-slate-800">
                <p class="text-[9px] text-slate-500 font-bold uppercase tracking-wide">Tài khoản</p>
                <p class="text-xs font-bold text-white truncate">{{ authStore.user?.full_name }}</p>
              </div>
              <router-link 
                to="/orders" 
                @click="isUserMenuOpen = false" 
                class="block px-4 py-2.5 text-[10px] text-slate-300 hover:bg-slate-800 hover:text-white transition-colors duration-150 font-bold uppercase tracking-wider"
              >
                Đơn hàng của tôi
              </router-link>
              <div class="h-px bg-slate-800 my-1"></div>
              <button 
                @click="handleLogout" 
                class="w-full text-left px-4 py-2.5 text-[10px] text-rose-400 hover:bg-slate-800 hover:text-rose-300 transition-colors duration-150 font-bold uppercase tracking-wider cursor-pointer"
              >
                Đăng xuất
              </button>
            </div>
          </div>
          
          <div v-else class="hidden lg:flex items-center space-x-2">
            <router-link 
              to="/login" 
              class="text-[11px] font-bold text-slate-300 hover:text-white px-3 py-1.5 transition-colors uppercase tracking-wider"
            >
              Đăng nhập
            </router-link>
            <router-link 
              to="/register" 
              class="text-[11px] font-bold text-white bg-brand-accent hover:bg-brand-accentHover px-4 py-2 rounded-full transition-all duration-300 shadow hover:shadow-md uppercase tracking-wider"
            >
              Đăng ký
            </router-link>
          </div>

          <!-- Mobile Menu Button -->
          <button 
            @click="isMobileMenuOpen = !isMobileMenuOpen"
            class="lg:hidden p-2 text-slate-300 hover:text-white transition-colors focus:outline-none"
            aria-label="Toggle Menu"
          >
            <svg v-if="!isMobileMenuOpen" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
            <svg v-else class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

      </div>
    </div>

    <!-- Mobile Navigation Menu -->
    <div v-show="isMobileMenuOpen" class="lg:hidden bg-slate-950 border-t border-slate-900 text-left">
      <div class="px-2 pt-2 pb-4 space-y-1">
        <!-- Search bar inside mobile navigation -->
        <div class="px-3 py-2">
          <form @submit.prevent="handleSearchSubmit" class="relative">
            <input
              v-model="searchQuery"
              @input="handleSearchInput"
              type="text"
              placeholder="Tìm giày Adidas, Nike..."
              class="w-full bg-slate-900 text-slate-200 pl-10 pr-4 py-2 rounded-full border border-slate-800 text-sm focus:outline-none"
            />
            <span class="absolute left-3 top-2.5 text-slate-400">
              <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </span>
          </form>
        </div>
        
        <router-link 
          to="/" 
          @click="isMobileMenuOpen = false" 
          class="block px-3 py-2.5 rounded-md text-base font-medium hover:bg-slate-900 hover:text-brand-accent transition-colors"
        >
          Trang chủ
        </router-link>
        <!-- Mobile accordion for "Sản phẩm" -->
        <div>
          <button 
            @click="isMobileProductsOpen = !isMobileProductsOpen"
            class="flex items-center justify-between w-full px-3 py-2.5 rounded-md text-base font-medium hover:bg-slate-900 hover:text-brand-accent transition-colors"
          >
            <span>Sản phẩm</span>
            <svg class="h-5 w-5 transform transition-transform duration-200" :class="isMobileProductsOpen ? 'rotate-180' : ''" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          
          <div v-show="isMobileProductsOpen" class="pl-6 space-y-1 bg-slate-950/50 py-1 rounded-md">
            <router-link 
              to="/products" 
              @click="isMobileMenuOpen = false" 
              class="block px-3 py-2 rounded-md text-sm font-medium text-slate-300 hover:bg-slate-900 hover:text-brand-accent transition-colors"
            >
              Tất cả giày
            </router-link>
            <button 
              @click="navigateToBrand('Nike')" 
              class="block w-full text-left px-3 py-2 rounded-md text-sm font-medium text-slate-300 hover:bg-slate-900 hover:text-brand-accent transition-colors"
            >
              Nike
            </button>
            <button 
              @click="navigateToBrand('Adidas')" 
              class="block w-full text-left px-3 py-2 rounded-md text-sm font-medium text-slate-300 hover:bg-slate-900 hover:text-brand-accent transition-colors"
            >
              Adidas
            </button>
            <button 
              @click="navigateToBrand('Puma')" 
              class="block w-full text-left px-3 py-2 rounded-md text-sm font-medium text-slate-300 hover:bg-slate-900 hover:text-brand-accent transition-colors"
            >
              Puma
            </button>
            <button 
              @click="navigateToBrand('Jordan')" 
              class="block w-full text-left px-3 py-2 rounded-md text-sm font-medium text-slate-300 hover:bg-slate-900 hover:text-brand-accent transition-colors"
            >
              Jordan
            </button>
          </div>
        </div>
        <router-link 
          to="/orders" 
          @click="isMobileMenuOpen = false" 
          class="block px-3 py-2.5 rounded-md text-base font-medium hover:bg-slate-900 hover:text-brand-accent transition-colors text-slate-300"
        >
          Đơn hàng của tôi
        </router-link>

        <!-- User Actions (Mobile) -->
        <div class="border-t border-slate-900 mt-4 pt-4 pb-2 px-3">
          <div v-if="authStore.isLoggedIn" class="space-y-2">
            <div class="text-xs text-slate-400 font-bold uppercase tracking-wider">
              Tài khoản: <span class="text-white">{{ authStore.user?.full_name }}</span>
            </div>
            <button 
              @click="handleLogout" 
              class="w-full text-left py-2.5 rounded-md text-base font-medium text-rose-400 hover:bg-slate-900 transition-colors uppercase tracking-wider cursor-pointer"
            >
              Đăng xuất
            </button>
          </div>
          <div v-else class="flex flex-col space-y-2">
            <router-link 
              to="/login" 
              @click="isMobileMenuOpen = false"
              class="block py-2.5 rounded-md text-base font-medium text-slate-300 hover:bg-slate-900 hover:text-white transition-colors uppercase tracking-wider"
            >
              Đăng nhập
            </router-link>
            <router-link 
              to="/register" 
              @click="isMobileMenuOpen = false"
              class="block text-center py-2.5 rounded-xl text-base font-bold bg-brand-accent hover:bg-brand-accentHover text-white transition-all duration-300 shadow uppercase tracking-wider"
            >
              Đăng ký
            </router-link>
          </div>
        </div>
      </div>
    </div>

    <!-- Mini Cart Sidebar Component -->
    <CartDrawer :is-open="isCartOpen" @close="isCartOpen = false" />
  </header>
</template>
