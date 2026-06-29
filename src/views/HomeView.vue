<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import { mockProducts } from '../mocks/products';
import ProductCard from '../components/common/ProductCard.vue';

const router = useRouter();

// Hero Carousel State
const activeSlide = ref(0);
const slides = [
  {
    title: 'BỨT PHÁ MỌI GIỚI HẠN',
    subtitle: 'BỘ SƯU TẬP AIR JORDAN CỰC CHẤT',
    description: 'Sở hữu ngay các phối màu Chicago huyền thoại cùng chất liệu cao cấp nhất.',
    image: 'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?q=80&w=1200&auto=format&fit=crop',
    link: '/product/jordan-1-low',
    bgClass: 'bg-gradient-to-r from-red-950 via-slate-900 to-black',
    accentText: 'text-red-500'
  },
  {
    title: 'CỔ ĐIỂN & BIỂU TƯỢNG',
    subtitle: 'ADIDAS SUPERSTAR MŨI SÒ',
    description: 'Biểu tượng đường phố tồn tại mãi với thời gian. Khuyến mãi lên đến 20% hôm nay.',
    image: 'https://images.unsplash.com/photo-1539185441755-769473a23570?q=80&w=1200&auto=format&fit=crop',
    link: '/product/adidas-superstar',
    bgClass: 'bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900',
    accentText: 'text-blue-400'
  }
];

let slideInterval: any;
const nextSlide = () => {
  activeSlide.value = (activeSlide.value + 1) % slides.length;
};
const prevSlide = () => {
  activeSlide.value = (activeSlide.value - 1 + slides.length) % slides.length;
};

onMounted(() => {
  slideInterval = setInterval(nextSlide, 6000);
});

onUnmounted(() => {
  if (slideInterval) clearInterval(slideInterval);
});

// Brand Cards Data
const brands = [
  { name: 'Nike', count: '120+ mẫu', bg: 'bg-slate-100', logo: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=300&auto=format&fit=crop' },
  { name: 'Adidas', count: '90+ mẫu', bg: 'bg-slate-100', logo: 'https://images.unsplash.com/photo-1539185441755-769473a23570?q=80&w=300&auto=format&fit=crop' },
  { name: 'Puma', count: '60+ mẫu', bg: 'bg-slate-100', logo: 'https://images.unsplash.com/photo-1608231387042-66d1773070a5?q=80&w=300&auto=format&fit=crop' },
  { name: 'Jordan', count: '40+ mẫu', bg: 'bg-slate-100', logo: 'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?q=80&w=300&auto=format&fit=crop' }
];

const navigateToBrand = (brandName: string) => {
  router.push(`/products?brand=${brandName}`);
};

// Active Tab State for Promoted Products
const activeTab = ref<'hot' | 'new'>('hot');

const filteredHotProducts = computed(() => {
  return mockProducts.filter(p => p.isHot).slice(0, 4);
});

const filteredNewProducts = computed(() => {
  return mockProducts.filter(p => p.isNew).slice(0, 4);
});
</script>

<template>
  <div class="pb-16">
    
    <!-- Hero Slider -->
    <div class="relative h-[460px] md:h-[600px] overflow-hidden bg-slate-900 text-white">
      <div 
        v-for="(slide, index) in slides" 
        :key="index"
        v-show="activeSlide === index"
        class="absolute inset-0 w-full h-full flex flex-col justify-center transition-all duration-700 ease-in-out"
        :class="slide.bgClass"
      >
        <!-- Overlay backdrop for readability -->
        <div class="absolute inset-0 bg-black/40 z-0"></div>

        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full grid grid-cols-1 lg:grid-cols-2 gap-8 items-center z-10">
          
          <!-- Text Details -->
          <div class="space-y-6 text-left">
            <span class="inline-block text-xs md:text-sm font-bold tracking-widest px-3 py-1 rounded bg-brand-accent/90 text-white">
              HOT SALE CHÀO HÈ
            </span>
            <h1 class="text-4xl md:text-6xl font-extrabold font-sans tracking-tight leading-none text-white">
              {{ slide.title }}<br />
              <span :class="slide.accentText">{{ slide.subtitle }}</span>
            </h1>
            <p class="text-slate-300 text-sm md:text-base max-w-lg leading-relaxed">
              {{ slide.description }}
            </p>
            <div class="flex space-x-4">
              <router-link 
                :to="slide.link"
                class="rounded-full bg-brand-accent hover:bg-brand-accentHover text-white px-8 py-3.5 text-sm md:text-base font-bold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-0.5"
              >
                MUA NGAY
              </router-link>
              <router-link 
                to="/products"
                class="rounded-full border border-white hover:bg-white hover:text-slate-900 text-white px-8 py-3.5 text-sm md:text-base font-bold transition-all duration-300"
              >
                XEM BỘ SƯU TẬP
              </router-link>
            </div>
          </div>

          <!-- Featured Image (hidden on small screens) -->
          <div class="hidden lg:block h-[450px] relative">
            <img 
              :src="slide.image" 
              :alt="slide.title" 
              class="w-full h-full object-cover rounded-2xl shadow-2xl border-4 border-white/10"
            />
          </div>
        </div>
      </div>

      <!-- Slider Controls -->
      <button 
        @click="prevSlide" 
        class="absolute left-4 top-1/2 -translate-y-1/2 z-20 p-2.5 rounded-full bg-slate-800/60 text-white hover:bg-slate-800 transition-colors"
      >
        <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
          <path stroke-linecap="round" stroke-linejoin="round" d="M15 19l-7-7 7-7" />
        </svg>
      </button>
      <button 
        @click="nextSlide" 
        class="absolute right-4 top-1/2 -translate-y-1/2 z-20 p-2.5 rounded-full bg-slate-800/60 text-white hover:bg-slate-800 transition-colors"
      >
        <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
          <path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7" />
        </svg>
      </button>
    </div>

    <!-- Features Banner -->
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12">
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 bg-white p-8 rounded-2xl shadow-premium border border-slate-100">
        <div class="flex items-center space-x-4 border-r border-slate-100 last:border-0 pr-4">
          <div class="rounded-full bg-blue-50 p-3.5 text-brand-blue">
            <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          </div>
          <div>
            <h3 class="text-sm font-bold text-slate-900 uppercase">CHÍNH HÃNG 100%</h3>
            <p class="text-xs text-slate-500 mt-0.5">Cam kết đền gấp 10 lần nếu phát hiện hàng giả.</p>
          </div>
        </div>

        <div class="flex items-center space-x-4 border-r border-slate-100 last:border-0 pr-4">
          <div class="rounded-full bg-blue-50 p-3.5 text-brand-blue">
            <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
            </svg>
          </div>
          <div>
            <h3 class="text-sm font-bold text-slate-900 uppercase">BẢO HÀNH 6 THÁNG</h3>
            <p class="text-xs text-slate-500 mt-0.5">Bảo hành keo chỉ chính hãng miễn phí tại MyShoes.</p>
          </div>
        </div>

        <div class="flex items-center space-x-4 border-r border-slate-100 last:border-0 pr-4">
          <div class="rounded-full bg-blue-50 p-3.5 text-brand-blue">
            <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 1121.21 15H19.62c-.933 0-1.748-.485-2.221-1.22l-1.428-2.203a1.5 1.5 0 00-2.54 0L12.003 15c-.473.735-1.288 1.22-2.22 1.22H8.199a8.002 8.002 0 01-1.377-5.5" />
            </svg>
          </div>
          <div>
            <h3 class="text-sm font-bold text-slate-900 uppercase">ĐỔI TRẢ 30 NGÀY</h3>
            <p class="text-xs text-slate-500 mt-0.5">Đổi hàng dễ dàng nếu không vừa size hoặc không ưng ý.</p>
          </div>
        </div>

        <div class="flex items-center space-x-4">
          <div class="rounded-full bg-blue-50 p-3.5 text-brand-blue">
            <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <div>
            <h3 class="text-sm font-bold text-slate-900 uppercase">GIAO HÀNG MIỄN PHÍ</h3>
            <p class="text-xs text-slate-500 mt-0.5">Áp dụng miễn phí vận chuyển cho mọi đơn hàng.</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Brand Category Grid -->
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-20">
      <div class="text-center max-w-xl mx-auto mb-12">
        <h2 class="text-3xl font-extrabold font-sans text-slate-900">THƯƠNG HIỆU NỔI TIẾNG</h2>
        <div class="w-16 h-1 bg-brand-accent mx-auto mt-3 rounded"></div>
        <p class="text-slate-500 text-sm mt-3">MyShoes cung cấp giày thể thao nguyên hộp từ những thương hiệu hàng đầu thế giới.</p>
      </div>

      <div class="grid grid-cols-2 lg:grid-cols-4 gap-6">
        <div 
          v-for="brand in brands" 
          :key="brand.name"
          @click="navigateToBrand(brand.name)"
          class="group relative bg-white border border-slate-100 rounded-2xl overflow-hidden shadow-premium hover:shadow-premium-hover transition-all duration-300 p-6 flex flex-col items-center justify-center text-center cursor-pointer"
        >
          <div class="w-24 h-24 rounded-full overflow-hidden bg-slate-50 mb-4 border border-slate-100 flex items-center justify-center">
            <img 
              :src="brand.logo" 
              :alt="brand.name" 
              class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
            />
          </div>
          <h3 class="text-lg font-bold text-slate-800 group-hover:text-brand-blue transition-colors font-sans">{{ brand.name }}</h3>
          <p class="text-xs text-slate-400 mt-1">{{ brand.count }}</p>
          
          <div class="mt-4 text-xs font-semibold text-brand-blue group-hover:text-brand-accent transition-colors flex items-center space-x-1">
            <span>Khám phá ngay</span>
            <svg class="h-3 w-3 transform group-hover:translate-x-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="3">
              <path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </div>
      </div>
    </div>

    <!-- Featured Tabs Products Section -->
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-24">
      <div class="flex flex-col md:flex-row md:items-end justify-between border-b border-slate-200 pb-5 mb-10">
        <div>
          <h2 class="text-3xl font-extrabold font-sans text-slate-900">SẢN PHẨM KHUYÊN DÙNG</h2>
          <p class="text-slate-500 text-sm mt-1">Lựa chọn các sản phẩm bán chạy nhất hoặc hàng mới nhập về của chúng tôi.</p>
        </div>

        <!-- Tab Switches -->
        <div class="flex space-x-3 mt-6 md:mt-0 bg-slate-100 p-1 rounded-full">
          <button 
            @click="activeTab = 'hot'"
            class="px-6 py-2 rounded-full text-sm font-bold transition-all duration-200"
            :class="activeTab === 'hot' ? 'bg-brand-blue text-white shadow' : 'text-slate-600 hover:text-slate-900'"
          >
            Bán chạy nhất
          </button>
          <button 
            @click="activeTab = 'new'"
            class="px-6 py-2 rounded-full text-sm font-bold transition-all duration-200"
            :class="activeTab === 'new' ? 'bg-brand-blue text-white shadow' : 'text-slate-600 hover:text-slate-900'"
          >
            Sản phẩm mới về
          </button>
        </div>
      </div>

      <transition name="fade" mode="out-in">
        <div v-if="activeTab === 'hot'" key="hot" class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          <ProductCard 
            v-for="product in filteredHotProducts" 
            :key="product.product_id" 
            :product="product" 
          />
        </div>
        <div v-else key="new" class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          <ProductCard 
            v-for="product in filteredNewProducts" 
            :key="product.product_id" 
            :product="product" 
          />
        </div>
      </transition>
    </div>

    <!-- Promoted Banner Campaign (Design 1 sidebar block replica) -->
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-24">
      <div class="relative bg-gradient-to-br from-brand-blue to-slate-900 rounded-3xl overflow-hidden p-8 md:p-12 shadow-2xl flex flex-col lg:flex-row items-center justify-between">
        <!-- Overlay decoration -->
        <div class="absolute -right-24 -bottom-24 w-80 h-80 rounded-full bg-brand-accent/10 blur-3xl"></div>
        <div class="absolute -left-24 -top-24 w-80 h-80 rounded-full bg-white/5 blur-3xl"></div>

        <div class="max-w-xl text-left space-y-4 lg:space-y-6 z-10 text-white">
          <h2 class="text-2xl md:text-4xl font-extrabold tracking-tight leading-tight font-sans">
            Tại sao Khách Hàng luôn chọn <span class="text-brand-accent font-black">MyShoes?</span>
          </h2>
          <ul class="space-y-3.5 text-slate-300 text-sm md:text-base">
            <li class="flex items-center">
              <span class="rounded-full bg-brand-accent p-1 mr-3 text-white">
                <svg class="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="3"><path d="M5 13l4 4L19 7" /></svg>
              </span>
              Giày chính hãng 100%, đền gấp 10 lần nếu phát hiện hàng FAKE.
            </li>
            <li class="flex items-center">
              <span class="rounded-full bg-brand-accent p-1 mr-3 text-white">
                <svg class="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="3"><path d="M5 13l4 4L19 7" /></svg>
              </span>
              Đổi hàng miễn phí trong vòng 30 ngày (nếu chưa qua sử dụng).
            </li>
            <li class="flex items-center">
              <span class="rounded-full bg-brand-accent p-1 mr-3 text-white">
                <svg class="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="3"><path d="M5 13l4 4L19 7" /></svg>
              </span>
              Chăm sóc khách hàng tận tâm, hỗ trợ trực tuyến 24/7.
            </li>
          </ul>
          <div class="pt-4">
            <router-link 
              to="/products"
              class="inline-block bg-white hover:bg-brand-accent hover:text-white text-brand-blue font-bold px-8 py-3.5 rounded-full shadow-lg transition-all duration-300 text-sm md:text-base"
            >
              MUA GIÀY NGAY
            </router-link>
          </div>
        </div>

        <!-- Banner Lady Image / Stylized Block (from Design 1 "Tại sao chọn MyShoes") -->
        <div class="mt-8 lg:mt-0 z-10 w-full max-w-[320px] bg-white/10 backdrop-blur rounded-2xl p-6 border border-white/15 text-center text-white">
          <div class="w-20 h-20 mx-auto rounded-full bg-white/20 flex items-center justify-center mb-4">
            <svg class="h-10 w-10 text-brand-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 class="font-bold text-lg font-sans">Đổi Trả Trực Tiếp</h3>
          <p class="text-xs text-slate-300 mt-1 leading-relaxed">
            Hỗ trợ đổi mẫu, đổi size trong 30 ngày trực tiếp tại cửa hàng hoặc ship qua bưu điện dễ dàng.
          </p>
        </div>
      </div>
    </div>

  </div>
</template>
