<script setup lang="ts">
import { ref, watch, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import ProductCard from '../components/common/ProductCard.vue';
import { productService } from '../services/product.service';
import { brandService } from '../services/brand.service';
import type { ProductListItem } from '../types';

const route = useRoute();
const router = useRouter();

// Filter States
const selectedBrands = ref<string[]>([]);
const selectedSizes = ref<number[]>([]);
const priceRange = ref<string>('all');
const sortOption = ref<string>('default');
const isMobileFilterOpen = ref(false);

const availableBrands = ['Nike', 'Adidas', 'Puma', 'Jordan'];
const availableSizes = [38, 39, 40, 41, 42, 43, 44];

// API States
const products = ref<ProductListItem[]>([]);
const brandsList = ref<any[]>([]);
const isLoading = ref(false);
const errorMsg = ref<string | null>(null);
const totalItems = ref(0);
const totalPages = ref(1);
const page = ref(1);
const limit = ref(12);

// Fetch Products from API
const fetchProducts = async () => {
  isLoading.value = true;
  errorMsg.value = null;

  const params: any = {
    page: page.value,
    limit: limit.value,
  };

  const searchParam = route.query.search as string;
  if (searchParam && searchParam.trim()) {
    params.keyword = searchParam.trim();
  }

  if (selectedBrands.value.length > 0) {
    const brandIds = selectedBrands.value
      .map(name => brandsList.value.find(b => b.brand_name.toLowerCase() === name.toLowerCase())?.brand_id)
      .filter(id => id !== undefined);
    
    if (brandIds.length > 0) {
      params.brand_id = brandIds[0];
    }
  }

  if (selectedSizes.value.length > 0) {
    params.size = String(selectedSizes.value[0]);
  }

  if (priceRange.value === 'under-2m') {
    params.max_price = 2000000;
  } else if (priceRange.value === '2m-3m') {
    params.min_price = 2000000;
    params.max_price = 3000000;
  } else if (priceRange.value === 'over-3m') {
    params.min_price = 3000000;
  }

  if (sortOption.value === 'price-asc') {
    params.sort_by = 'price';
    params.sort_order = 'asc';
  } else if (sortOption.value === 'price-desc') {
    params.sort_by = 'price';
    params.sort_order = 'desc';
  } else if (sortOption.value === 'rating') {
    params.sort_by = 'sold_quantity';
    params.sort_order = 'desc';
  } else {
    params.sort_by = 'created_at';
    params.sort_order = 'desc';
  }

  try {
    const res = await productService.getProducts(params);
    products.value = res.data || [];
    totalItems.value = res.pagination?.total_items || 0;
    totalPages.value = res.pagination?.total_pages || 1;
  } catch (err: any) {
    console.error('Error loading products:', err);
    errorMsg.value = 'Không thể kết nối đến máy chủ. Vui lòng kiểm tra lại kết nối mạng.';
  } finally {
    isLoading.value = false;
  }
};

const applyRouteParams = () => {
  const brandParam = route.query.brand as string;
  if (brandParam) {
    const isId = /^\d+$/.test(brandParam);
    if (isId) {
      const brandId = parseInt(brandParam);
      const matched = brandsList.value.find(b => b.brand_id === brandId);
      if (matched) {
        selectedBrands.value = [matched.brand_name];
      }
    } else {
      const matched = availableBrands.find(b => b.toLowerCase() === brandParam.toLowerCase());
      if (matched) {
        selectedBrands.value = [matched];
      }
    }
  }
};

watch(() => route.query, () => {
  applyRouteParams();
  page.value = 1;
  fetchProducts();
}, { deep: true });

watch([selectedBrands, selectedSizes, priceRange, sortOption], () => {
  page.value = 1;
  fetchProducts();
}, { deep: true });

watch(page, () => {
  fetchProducts();
});

onMounted(async () => {
  isLoading.value = true;
  try {
    const brandsRes = await brandService.getBrands(0, 100);
    brandsList.value = brandsRes.data || [];
  } catch (e) {
    console.error('Error loading filter options:', e);
  }
  applyRouteParams();
  fetchProducts();
});

const clearFilters = () => {
  selectedBrands.value = [];
  selectedSizes.value = [];
  priceRange.value = 'all';
  sortOption.value = 'default';
  page.value = 1;
  router.push({ query: {} });
};

const toggleBrandSelection = (brand: string) => {
  const index = selectedBrands.value.indexOf(brand);
  if (index > -1) {
    selectedBrands.value.splice(index, 1);
  } else {
    selectedBrands.value.push(brand);
  }
};

const toggleSizeSelection = (size: number) => {
  const index = selectedSizes.value.indexOf(size);
  if (index > -1) {
    selectedSizes.value.splice(index, 1);
  } else {
    selectedSizes.value.push(size);
  }
};
</script>

<template>
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
    
    <!-- Title Page Header -->
    <div class="bg-gradient-to-r from-slate-900 via-brand-blue to-slate-900 rounded-3xl p-8 md:p-12 text-white text-center shadow-lg mb-10 relative overflow-hidden">
      <div class="absolute inset-0 bg-black/10 z-0"></div>
      <div class="relative z-10 space-y-2">
        <h1 class="text-3xl md:text-5xl font-extrabold tracking-tight font-sans">
          DANH SÁCH SẢN PHẨM
        </h1>
        <p class="text-slate-300 text-sm md:text-base max-w-lg mx-auto">
          Bộ sưu tập giày chính hãng 100% mới nhất đến từ các nhà sản xuất thể thao hàng đầu toàn cầu.
        </p>
      </div>
    </div>

    <!-- Product view wrapper -->
    <div class="flex flex-col lg:flex-row gap-8 items-start">
      
      <!-- Sidebar Filters (Desktop) -->
      <aside class="hidden lg:block w-64 bg-white rounded-2xl p-6 border border-slate-100 shadow-premium sticky top-28">
        <div class="flex items-center justify-between border-b border-slate-100 pb-4 mb-6">
          <h2 class="text-base font-bold text-slate-800 uppercase tracking-wide">Bộ lọc nâng cao</h2>
          <button 
            @click="clearFilters" 
            class="text-xs font-semibold text-slate-400 hover:text-brand-accent transition-colors"
          >
            Xóa bộ lọc
          </button>
        </div>

        <!-- Filter by Brand -->
        <div class="mb-6">
          <h3 class="text-sm font-bold text-slate-800 mb-3.5 uppercase tracking-wide">Thương hiệu</h3>
          <div class="space-y-3.5">
            <label 
              v-for="brand in availableBrands" 
              :key="brand" 
              class="flex items-center space-x-3 cursor-pointer group"
            >
              <input 
                type="checkbox" 
                :checked="selectedBrands.includes(brand)"
                @change="toggleBrandSelection(brand)"
                class="rounded border-slate-300 text-brand-blue focus:ring-brand-blue h-4 w-4" 
              />
              <span class="text-sm text-slate-600 group-hover:text-brand-blue transition-colors">{{ brand }}</span>
            </label>
          </div>
        </div>

        <!-- Filter by Size -->
        <div class="mb-6 border-t border-slate-50 pt-5">
          <h3 class="text-sm font-bold text-slate-800 mb-3.5 uppercase tracking-wide">Kích cỡ giày</h3>
          <div class="grid grid-cols-4 gap-2">
            <button 
              v-for="size in availableSizes" 
              :key="size"
              @click="toggleSizeSelection(size)"
              class="h-9 w-9 rounded-lg border text-xs font-bold transition-all"
              :class="selectedSizes.includes(size) 
                ? 'bg-brand-blue border-brand-blue text-white shadow-sm' 
                : 'border-slate-200 text-slate-600 hover:border-brand-blue'"
            >
              {{ size }}
            </button>
          </div>
        </div>

        <!-- Filter by Price -->
        <div class="border-t border-slate-50 pt-5">
          <h3 class="text-sm font-bold text-slate-800 mb-3.5 uppercase tracking-wide">Mức giá</h3>
          <div class="space-y-3">
            <label class="flex items-center space-x-3 cursor-pointer">
              <input 
                type="radio" 
                value="all" 
                v-model="priceRange"
                class="text-brand-blue focus:ring-brand-blue h-4 w-4 border-slate-300"
              />
              <span class="text-sm text-slate-600">Tất cả mức giá</span>
            </label>
            <label class="flex items-center space-x-3 cursor-pointer">
              <input 
                type="radio" 
                value="under-2m" 
                v-model="priceRange"
                class="text-brand-blue focus:ring-brand-blue h-4 w-4 border-slate-300"
              />
              <span class="text-sm text-slate-600">Dưới 2.000.000đ</span>
            </label>
            <label class="flex items-center space-x-3 cursor-pointer">
              <input 
                type="radio" 
                value="2m-3m" 
                v-model="priceRange"
                class="text-brand-blue focus:ring-brand-blue h-4 w-4 border-slate-300"
              />
              <span class="text-sm text-slate-600">2.000.000đ - 3.000.000đ</span>
            </label>
            <label class="flex items-center space-x-3 cursor-pointer">
              <input 
                type="radio" 
                value="over-3m" 
                v-model="priceRange"
                class="text-brand-blue focus:ring-brand-blue h-4 w-4 border-slate-300"
              />
              <span class="text-sm text-slate-600">Trên 3.000.000đ</span>
            </label>
          </div>
        </div>
      </aside>

      <!-- Main Products Grid -->
      <div class="flex-1 w-full">
        <!-- Top Toolbar -->
        <div class="flex items-center justify-between bg-white rounded-2xl p-4 border border-slate-100 shadow-premium mb-6">
          <p class="text-sm font-semibold text-slate-500">
            Tìm thấy <span class="text-brand-blue text-base font-bold">{{ totalItems }}</span> đôi giày phù hợp
          </p>

          <!-- Sorting Option -->
          <div class="flex items-center space-x-3">
            <span class="text-xs font-semibold text-slate-400 hidden sm:inline-block">Sắp xếp:</span>
            <select 
              v-model="sortOption"
              class="bg-slate-50 text-slate-700 text-xs font-bold border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:border-brand-blue cursor-pointer"
            >
              <option value="default">Mặc định</option>
              <option value="price-asc">Giá: Thấp đến Cao</option>
              <option value="price-desc">Giá: Cao đến Thấp</option>
              <option value="rating">Đánh giá tốt nhất</option>
            </select>

            <!-- Mobile Filter Button Trigger -->
            <button 
              @click="isMobileFilterOpen = true"
              class="lg:hidden bg-brand-blue text-white px-3 py-2 rounded-lg text-xs font-bold flex items-center space-x-1.5"
            >
              <svg class="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
              </svg>
              <span>Bộ lọc</span>
            </button>
          </div>
        </div>

        <!-- Loading State -->
        <div v-if="isLoading" class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          <div v-for="n in 6" :key="n" class="border border-slate-100 rounded-2xl p-5 space-y-4 animate-pulse bg-white">
            <div class="aspect-square bg-slate-200 rounded-xl"></div>
            <div class="h-4 bg-slate-200 rounded w-1/3"></div>
            <div class="h-5 bg-slate-200 rounded w-3/4"></div>
            <div class="h-4 bg-slate-200 rounded w-1/2"></div>
          </div>
        </div>

        <!-- Error State -->
        <div v-else-if="errorMsg" class="bg-red-50 border border-red-100 rounded-2xl p-8 text-center my-6">
          <p class="text-red-800 text-sm font-semibold mb-4">{{ errorMsg }}</p>
          <button 
            @click="fetchProducts" 
            class="bg-brand-accent hover:bg-brand-accentHover text-white px-6 py-2.5 rounded-full text-xs font-bold transition-all shadow"
          >
            Thử lại
          </button>
        </div>

        <!-- Empty State -->
        <div 
          v-else-if="products.length === 0" 
          class="bg-white rounded-3xl p-16 text-center border border-slate-100 shadow-premium"
        >
          <div class="rounded-full bg-slate-50 p-6 text-slate-400 max-w-max mx-auto mb-4">
            <svg class="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <h3 class="text-xl font-bold text-slate-800">Không tìm thấy sản phẩm</h3>
          <p class="text-slate-500 text-sm mt-1 mb-6">Xin lỗi, chúng tôi không tìm thấy kết quả nào trùng khớp với bộ lọc của bạn.</p>
          <button 
            @click="clearFilters" 
            class="rounded-full bg-brand-blue px-6 py-2.5 text-sm font-bold text-white hover:bg-opacity-95 shadow-md transition-all"
          >
            Thiết lập lại bộ lọc
          </button>
        </div>

        <!-- Grid of Product Cards & Pagination -->
        <div v-else>
          <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            <ProductCard 
              v-for="product in products" 
              :key="product.product_id"
              :product="product" 
            />
          </div>

          <!-- Pagination Controls -->
          <div v-if="totalPages > 1" class="flex justify-center items-center space-x-3 mt-12">
            <button 
              @click="page > 1 ? page-- : null"
              :disabled="page === 1"
              class="px-4 py-2 rounded-lg border text-sm font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed border-slate-200 bg-white text-slate-600 hover:border-brand-blue hover:text-brand-blue cursor-pointer"
            >
              Trước
            </button>
            <span class="text-sm font-bold text-slate-700">Trang {{ page }} / {{ totalPages }}</span>
            <button 
              @click="page < totalPages ? page++ : null"
              :disabled="page === totalPages"
              class="px-4 py-2 rounded-lg border text-sm font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed border-slate-200 bg-white text-slate-600 hover:border-brand-blue hover:text-brand-blue cursor-pointer"
            >
              Sau
            </button>
          </div>
        </div>
      </div>

    </div>

    <!-- Mobile Filters Slide-over (Drawer) -->
    <div 
      v-if="isMobileFilterOpen" 
      class="fixed inset-0 z-50 overflow-hidden lg:hidden"
      role="dialog"
      aria-modal="true"
    >
      <div class="absolute inset-0 overflow-hidden">
        <!-- Backdrop -->
        <div 
          @click="isMobileFilterOpen = false" 
          class="absolute inset-0 bg-slate-900 bg-opacity-60 backdrop-blur-sm transition-opacity"
        ></div>

        <!-- Panel container -->
        <div class="pointer-events-none fixed inset-y-0 right-0 flex max-w-full pl-10">
          <div class="pointer-events-auto w-screen max-w-xs">
            <div class="flex h-full flex-col bg-white shadow-2xl overflow-y-auto">
              
              <!-- Drawer Header -->
              <div class="flex items-center justify-between px-6 py-5 bg-slate-900 text-white">
                <h2 class="text-base font-bold uppercase tracking-wide">Bộ lọc</h2>
                <button 
                  @click="isMobileFilterOpen = false" 
                  class="text-slate-400 hover:text-white"
                >
                  <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <!-- Drawer Content -->
              <div class="flex-1 px-6 py-6 divide-y divide-slate-100 space-y-6">
                <!-- Brands -->
                <div>
                  <h3 class="text-sm font-bold text-slate-800 mb-3.5 uppercase tracking-wide">Thương hiệu</h3>
                  <div class="space-y-3.5">
                    <label 
                      v-for="brand in availableBrands" 
                      :key="brand" 
                      class="flex items-center space-x-3 cursor-pointer"
                    >
                      <input 
                        type="checkbox" 
                        :checked="selectedBrands.includes(brand)"
                        @change="toggleBrandSelection(brand)"
                        class="rounded border-slate-300 text-brand-blue" 
                      />
                      <span class="text-sm text-slate-600">{{ brand }}</span>
                    </label>
                  </div>
                </div>

                <!-- Sizes -->
                <div class="pt-5">
                  <h3 class="text-sm font-bold text-slate-800 mb-3.5 uppercase tracking-wide">Kích cỡ giày</h3>
                  <div class="grid grid-cols-4 gap-2">
                    <button 
                      v-for="size in availableSizes" 
                      :key="size"
                      @click="toggleSizeSelection(size)"
                      class="h-9 w-9 rounded-lg border text-xs font-bold"
                      :class="selectedSizes.includes(size) 
                        ? 'bg-brand-blue border-brand-blue text-white shadow-sm' 
                        : 'border-slate-200 text-slate-600'"
                    >
                      {{ size }}
                    </button>
                  </div>
                </div>

                <!-- Prices -->
                <div class="pt-5">
                  <h3 class="text-sm font-bold text-slate-800 mb-3.5 uppercase tracking-wide">Mức giá</h3>
                  <div class="space-y-3">
                    <label class="flex items-center space-x-3 cursor-pointer">
                      <input type="radio" value="all" v-model="priceRange" class="text-brand-blue border-slate-300" />
                      <span class="text-sm text-slate-600">Tất cả mức giá</span>
                    </label>
                    <label class="flex items-center space-x-3 cursor-pointer">
                      <input type="radio" value="under-2m" v-model="priceRange" class="text-brand-blue border-slate-300" />
                      <span class="text-sm text-slate-600">Dưới 2.000.000đ</span>
                    </label>
                    <label class="flex items-center space-x-3 cursor-pointer">
                      <input type="radio" value="2m-3m" v-model="priceRange" class="text-brand-blue border-slate-300" />
                      <span class="text-sm text-slate-600">2.000.000đ - 3.000.000đ</span>
                    </label>
                    <label class="flex items-center space-x-3 cursor-pointer">
                      <input type="radio" value="over-3m" v-model="priceRange" class="text-brand-blue border-slate-300" />
                      <span class="text-sm text-slate-600">Trên 3.000.000đ</span>
                    </label>
                  </div>
                </div>
              </div>

              <!-- Drawer Footer -->
              <div class="p-6 bg-slate-50 border-t border-slate-100 space-y-3">
                <button 
                  @click="isMobileFilterOpen = false" 
                  class="w-full bg-brand-blue text-white py-3 rounded-full text-sm font-bold"
                >
                  ÁP DỤNG BỘ LỌC
                </button>
                <button 
                  @click="clearFilters(); isMobileFilterOpen = false" 
                  class="w-full bg-white border border-slate-200 text-slate-600 py-3 rounded-full text-sm font-bold"
                >
                  XÓA TẤT CẢ
                </button>
              </div>

            </div>
          </div>
        </div>
      </div>
    </div>

  </div>
</template>
