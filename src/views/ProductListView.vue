<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { mockProducts } from '../mocks/products';
import ProductCard from '../components/common/ProductCard.vue';
import { getDiscountedPrice } from '../stores/cart';

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

// Watch route queries to apply filters from Header or Home
const applyRouteParams = () => {
  const brandParam = route.query.brand as string;
  if (brandParam && availableBrands.includes(brandParam)) {
    selectedBrands.value = [brandParam];
  } else if (!brandParam && route.query.brand === undefined) {
    // If navigating to general products, don't clear unless routing directly
  }

  const searchParam = route.query.search as string;
  if (searchParam) {
    // Search query logic is implemented in filteredProducts
  }
};

watch(() => route.query, () => {
  applyRouteParams();
}, { deep: true });

onMounted(() => {
  applyRouteParams();
});

// Reset all filters
const clearFilters = () => {
  selectedBrands.value = [];
  selectedSizes.value = [];
  priceRange.value = 'all';
  sortOption.value = 'default';
  router.push({ query: {} });
};

// Filter and sort product computation
const filteredProducts = computed(() => {
  let products = [...mockProducts];

  const getProductPrice = (p: typeof mockProducts[0]) => {
    if (!p.colors || p.colors.length === 0) return 0;
    const def = p.colors.find(c => c.is_default) || p.colors[0];
    return getDiscountedPrice(def);
  };

  const getProductSizes = (p: typeof mockProducts[0]) => {
    if (!p.colors) return [];
    return p.colors.flatMap(c => c.skus.map(s => parseInt(s.size)));
  };

  // 1. Filter by Search Query
  const searchQuery = (route.query.search as string || '').trim().toLowerCase();
  if (searchQuery) {
    products = products.filter(
      p => p.product_name.toLowerCase().includes(searchQuery) || p.brand_name.toLowerCase().includes(searchQuery)
    );
  }

  // 2. Filter by Brand
  if (selectedBrands.value.length > 0) {
    products = products.filter(p => selectedBrands.value.includes(p.brand_name));
  }

  // 3. Filter by Size
  if (selectedSizes.value.length > 0) {
    products = products.filter(p => {
      const sizes = getProductSizes(p);
      return sizes.some(size => selectedSizes.value.includes(size));
    });
  }

  // 4. Filter by Price Range
  if (priceRange.value !== 'all') {
    if (priceRange.value === 'under-2m') {
      products = products.filter(p => getProductPrice(p) < 2000000);
    } else if (priceRange.value === '2m-3m') {
      products = products.filter(p => {
        const price = getProductPrice(p);
        return price >= 2000000 && price <= 3000000;
      });
    } else if (priceRange.value === 'over-3m') {
      products = products.filter(p => getProductPrice(p) > 3000000);
    }
  }

  // 5. Sort Products
  if (sortOption.value === 'price-asc') {
    products.sort((a, b) => getProductPrice(a) - getProductPrice(b));
  } else if (sortOption.value === 'price-desc') {
    products.sort((a, b) => getProductPrice(b) - getProductPrice(a));
  } else if (sortOption.value === 'rating') {
    products.sort((a, b) => b.rating - a.rating);
  }

  return products;
});

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
            Tìm thấy <span class="text-brand-blue text-base font-bold">{{ filteredProducts.length }}</span> đôi giày phù hợp
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

        <!-- Empty State -->
        <div 
          v-if="filteredProducts.length === 0" 
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

        <!-- Grid of Product Cards -->
        <div v-else class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          <ProductCard 
            v-for="product in filteredProducts" 
            :key="product.product_id"
            :product="product" 
          />
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
