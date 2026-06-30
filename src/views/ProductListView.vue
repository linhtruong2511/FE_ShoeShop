<script setup lang="ts">
import { ref, watch, onMounted, computed, onUnmounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import ProductCard from '../components/common/ProductCard.vue';
import { productService } from '../services/product.service';
import { brandService } from '../services/brand.service';
import { categoryService } from '../services/category.service';
import type { ProductListItem } from '../types';

const route = useRoute();
const router = useRouter();

// Filter States
const keywordInput = ref<string>('');
const selectedBrandId = ref<number | null>(null);
const selectedCategoryId = ref<number | null>(null);
const selectedSizes = ref<number[]>([]);
const priceRange = ref<string>('all');
const customMinPrice = ref<number | null>(null);
const customMaxPrice = ref<number | null>(null);
const selectedColor = ref<string>('all');
const selectedGender = ref<string>('all');
const onlyInStock = ref<boolean>(false);
const onlyOnSale = ref<boolean>(false);
const sortOption = ref<string>('default');
const isMobileFilterOpen = ref(false);

// Show all flags
const isShowAllBrands = ref(false);
const isShowAllCategories = ref(false);

const availableSizes = [38, 39, 40, 41, 42, 43, 44];
const availableColors = [
  { name: 'Đen', value: 'black', hex: '#000000' },
  { name: 'Trắng', value: 'white', hex: '#ffffff', border: true },
  { name: 'Đỏ', value: 'red', hex: '#ef4444' },
  { name: 'Xanh dương', value: 'blue', hex: '#3b82f6' },
  { name: 'Xám', value: 'grey', hex: '#8b9bb4' },
  { name: 'Vàng', value: 'yellow', hex: '#f59e0b' },
  { name: 'Hồng', value: 'pink', hex: '#ec4899' },
  { name: 'Cam', value: 'orange', hex: '#f97316' },
];

// API States
const products = ref<ProductListItem[]>([]);
const brandsList = ref<any[]>([]);
const categoriesList = ref<any[]>([]);
const isLoading = ref(false);
const errorMsg = ref<string | null>(null);
const totalItems = ref(0);
const totalPages = ref(1);
const page = ref(1);
const limit = ref(12);

// Sync current filter states to URL Route
const syncFiltersToRoute = () => {
  const query: any = {};
  if (keywordInput.value.trim()) query.search = keywordInput.value.trim();
  if (selectedBrandId.value) query.brand = String(selectedBrandId.value);
  if (selectedCategoryId.value) query.category = String(selectedCategoryId.value);
  if (selectedGender.value !== 'all') query.gender = selectedGender.value;
  if (selectedColor.value !== 'all') query.color = selectedColor.value;
  if (selectedSizes.value.length > 0) query.size = String(selectedSizes.value[0]);
  
  if (priceRange.value !== 'all') {
    query.price = priceRange.value;
    if (priceRange.value === 'custom') {
      if (customMinPrice.value !== null) query.min_price = String(customMinPrice.value);
      if (customMaxPrice.value !== null) query.max_price = String(customMaxPrice.value);
    }
  }
  
  if (onlyInStock.value) query.in_stock = 'true';
  if (onlyOnSale.value) query.on_sale = 'true';
  if (sortOption.value !== 'default') query.sort = sortOption.value;
  if (page.value > 1) query.page = String(page.value);

  router.push({ query });
};

// Fetch Products from API
const fetchProducts = async () => {
  isLoading.value = true;
  errorMsg.value = null;

  const params: any = {
    page: page.value,
    limit: limit.value,
  };

  if (keywordInput.value.trim()) {
    params.keyword = keywordInput.value.trim();
  }

  if (selectedBrandId.value) {
    params.brand_id = selectedBrandId.value;
  }

  if (selectedCategoryId.value) {
    params.category_id = selectedCategoryId.value;
  }

  if (selectedGender.value !== 'all') {
    params.gender_target = selectedGender.value;
  }

  if (selectedColor.value !== 'all') {
    params.color_name = selectedColor.value;
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
  } else if (priceRange.value === 'custom') {
    if (customMinPrice.value !== null) {
      params.min_price = customMinPrice.value;
    }
    if (customMaxPrice.value !== null) {
      params.max_price = customMaxPrice.value;
    }
  }

  if (onlyInStock.value) {
    params.in_stock = true;
  }

  if (onlyOnSale.value) {
    params.on_sale = true;
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
  const q = route.query;
  
  keywordInput.value = (q.search as string) || '';
  
  if (q.brand) {
    selectedBrandId.value = parseInt(q.brand as string) || null;
  } else {
    selectedBrandId.value = null;
  }
  
  if (q.category) {
    selectedCategoryId.value = parseInt(q.category as string) || null;
  } else {
    selectedCategoryId.value = null;
  }
  
  selectedGender.value = (q.gender as string) || 'all';
  selectedColor.value = (q.color as string) || 'all';
  
  if (q.size) {
    selectedSizes.value = [parseInt(q.size as string)];
  } else {
    selectedSizes.value = [];
  }
  
  priceRange.value = (q.price as string) || 'all';
  if (priceRange.value === 'custom') {
    customMinPrice.value = q.min_price ? parseInt(q.min_price as string) : null;
    customMaxPrice.value = q.max_price ? parseInt(q.max_price as string) : null;
  } else {
    customMinPrice.value = null;
    customMaxPrice.value = null;
  }
  
  onlyInStock.value = q.in_stock === 'true';
  onlyOnSale.value = q.on_sale === 'true';
  sortOption.value = (q.sort as string) || 'default';
  page.value = q.page ? parseInt(q.page as string) : 1;
};

const handleFilterChange = () => {
  page.value = 1;
  syncFiltersToRoute();
};

let debounceTimeout: any = null;
const handleSearchInput = () => {
  if (debounceTimeout) {
    clearTimeout(debounceTimeout);
  }
  debounceTimeout = setTimeout(() => {
    handleFilterChange();
  }, 3000);
};

onUnmounted(() => {
  if (debounceTimeout) {
    clearTimeout(debounceTimeout);
  }
});

watch(() => route.query, () => {
  applyRouteParams();
  fetchProducts();
}, { deep: true });

onMounted(async () => {
  isLoading.value = true;
  try {
    const [brandsRes, categoriesRes] = await Promise.all([
      brandService.getBrands(0, 100),
      categoryService.getCategories(0, 100)
    ]);
    brandsList.value = brandsRes.data || [];
    categoriesList.value = categoriesRes.data || [];
  } catch (e) {
    console.error('Error loading filter options:', e);
  }
  applyRouteParams();
  fetchProducts();
});

const clearFilters = () => {
  keywordInput.value = '';
  selectedBrandId.value = null;
  selectedCategoryId.value = null;
  selectedSizes.value = [];
  priceRange.value = 'all';
  customMinPrice.value = null;
  customMaxPrice.value = null;
  selectedColor.value = 'all';
  selectedGender.value = 'all';
  onlyInStock.value = false;
  onlyOnSale.value = false;
  sortOption.value = 'default';
  page.value = 1;
  router.push({ query: {} });
};

const toggleBrandSelection = (brandId: number) => {
  if (selectedBrandId.value === brandId) {
    selectedBrandId.value = null;
  } else {
    selectedBrandId.value = brandId;
  }
  handleFilterChange();
};

const toggleCategorySelection = (categoryId: number) => {
  if (selectedCategoryId.value === categoryId) {
    selectedCategoryId.value = null;
  } else {
    selectedCategoryId.value = categoryId;
  }
  handleFilterChange();
};

const toggleSizeSelection = (size: number) => {
  const index = selectedSizes.value.indexOf(size);
  if (index > -1) {
    selectedSizes.value.splice(index, 1);
  } else {
    selectedSizes.value = [size];
  }
  handleFilterChange();
};

const visibleBrands = computed(() => {
  return isShowAllBrands.value ? brandsList.value : brandsList.value.slice(0, 5);
});

const visibleCategories = computed(() => {
  return isShowAllCategories.value ? categoriesList.value : categoriesList.value.slice(0, 5);
});
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
        <div class="flex items-center justify-between border-b border-slate-100 pb-4 mb-5">
          <h2 class="text-sm font-black text-slate-900 uppercase tracking-wider font-sans">Bộ lọc nâng cao</h2>
          <button 
            @click="clearFilters" 
            class="text-[11px] font-bold text-slate-400 hover:text-brand-accent transition-colors"
          >
            Xóa bộ lọc
          </button>
        </div>

        <!-- Filter by Keyword -->
        <div class="mb-5">
          <h3 class="text-[11px] font-extrabold text-slate-900 mb-2 uppercase tracking-wider font-sans">Tìm kiếm</h3>
          <div class="relative">
            <input 
              v-model="keywordInput"
              @input="handleSearchInput"
              type="text" 
              placeholder="Nhập tên giày..." 
              class="w-full bg-slate-50 border border-slate-200 rounded-xl pl-3 pr-10 py-2.5 text-xs focus:outline-none focus:border-brand-blue"
            />
            <span class="absolute right-3 top-3 text-slate-400 pointer-events-none">
              <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </span>
          </div>
        </div>

        <!-- Filter by Gender -->
        <div class="mb-5 border-t border-slate-50 pt-4">
          <h3 class="text-[11px] font-extrabold text-slate-900 mb-2.5 uppercase tracking-wider font-sans">Đối tượng</h3>
          <div class="flex flex-wrap gap-1.5">
            <button 
              v-for="gender in [
                { label: 'Tất cả', value: 'all' },
                { label: 'Nam', value: 'men' },
                { label: 'Nữ', value: 'women' },
                { label: 'Trẻ em', value: 'kids' },
                { label: 'Unisex', value: 'unisex' }
              ]"
              :key="gender.value"
              @click="selectedGender = gender.value; handleFilterChange()"
              class="px-2.5 py-1.5 rounded-lg text-[10px] font-extrabold transition-all border uppercase tracking-wider cursor-pointer"
              :class="selectedGender === gender.value 
                ? 'bg-slate-950 border-slate-950 text-white shadow-sm' 
                : 'bg-white border-slate-200 text-slate-600 hover:border-slate-400'"
            >
              {{ gender.label }}
            </button>
          </div>
        </div>

        <!-- Filter by Brand -->
        <div class="mb-5 border-t border-slate-50 pt-4">
          <h3 class="text-[11px] font-extrabold text-slate-900 mb-2.5 uppercase tracking-wider font-sans">Thương hiệu</h3>
          <div class="space-y-2.5 max-h-48 overflow-y-auto pr-1">
            <label 
              v-for="brand in visibleBrands" 
              :key="brand.brand_id" 
              class="flex items-center space-x-2.5 cursor-pointer group"
            >
              <input 
                type="checkbox" 
                :checked="selectedBrandId === brand.brand_id"
                @change="toggleBrandSelection(brand.brand_id)"
                class="rounded border-slate-300 text-brand-blue focus:ring-brand-blue h-4 w-4" 
              />
              <span class="text-xs text-slate-600 group-hover:text-brand-blue transition-colors font-medium">
                {{ brand.brand_name }}
              </span>
            </label>
          </div>
          <button 
            v-if="brandsList.length > 5"
            @click="isShowAllBrands = !isShowAllBrands" 
            class="mt-2 text-[10px] font-bold text-brand-blue hover:text-slate-900 transition-colors flex items-center space-x-1 cursor-pointer"
          >
            <span>{{ isShowAllBrands ? 'Thu gọn' : 'Xem thêm (' + (brandsList.length - 5) + ')' }}</span>
            <svg class="h-3 w-3 transform transition-transform" :class="isShowAllBrands ? 'rotate-180' : ''" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        </div>

        <!-- Filter by Category -->
        <div class="mb-5 border-t border-slate-50 pt-4">
          <h3 class="text-[11px] font-extrabold text-slate-900 mb-2.5 uppercase tracking-wider font-sans">Danh mục</h3>
          <div class="space-y-2.5 max-h-48 overflow-y-auto pr-1">
            <label 
              v-for="cat in visibleCategories" 
              :key="cat.category_id" 
              class="flex items-center space-x-2.5 cursor-pointer group"
            >
              <input 
                type="checkbox" 
                :checked="selectedCategoryId === cat.category_id"
                @change="toggleCategorySelection(cat.category_id)"
                class="rounded border-slate-300 text-brand-blue focus:ring-brand-blue h-4 w-4" 
              />
              <span class="text-xs text-slate-600 group-hover:text-brand-blue transition-colors font-medium">
                {{ cat.category_name }}
              </span>
            </label>
          </div>
          <button 
            v-if="categoriesList.length > 5"
            @click="isShowAllCategories = !isShowAllCategories" 
            class="mt-2 text-[10px] font-bold text-brand-blue hover:text-slate-900 transition-colors flex items-center space-x-1 cursor-pointer"
          >
            <span>{{ isShowAllCategories ? 'Thu gọn' : 'Xem thêm (' + (categoriesList.length - 5) + ')' }}</span>
            <svg class="h-3 w-3 transform transition-transform" :class="isShowAllCategories ? 'rotate-180' : ''" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        </div>

        <!-- Filter by Availability / Sale status -->
        <div class="mb-5 border-t border-slate-50 pt-4">
          <h3 class="text-[11px] font-extrabold text-slate-900 mb-2.5 uppercase tracking-wider font-sans">Trạng thái</h3>
          <div class="space-y-2.5">
            <label class="flex items-center space-x-2.5 cursor-pointer group">
              <input 
                type="checkbox" 
                v-model="onlyInStock"
                @change="handleFilterChange"
                class="rounded border-slate-300 text-brand-blue focus:ring-brand-blue h-4 w-4" 
              />
              <span class="text-xs text-slate-600 group-hover:text-brand-blue transition-colors font-medium">Còn hàng</span>
            </label>
            <label class="flex items-center space-x-2.5 cursor-pointer group">
              <input 
                type="checkbox" 
                v-model="onlyOnSale"
                @change="handleFilterChange"
                class="rounded border-slate-300 text-brand-blue focus:ring-brand-blue h-4 w-4" 
              />
              <span class="text-xs text-slate-600 group-hover:text-brand-blue transition-colors font-medium">Đang giảm giá</span>
            </label>
          </div>
        </div>

        <!-- Filter by Size -->
        <div class="mb-5 border-t border-slate-50 pt-4">
          <h3 class="text-[11px] font-extrabold text-slate-900 mb-2.5 uppercase tracking-wider font-sans">Kích cỡ giày</h3>
          <div class="grid grid-cols-4 gap-1.5">
            <button 
              v-for="size in availableSizes" 
              :key="size"
              @click="toggleSizeSelection(size)"
              class="h-8 rounded-lg border text-xs font-bold transition-all flex items-center justify-center cursor-pointer"
              :class="selectedSizes.includes(size) 
                ? 'bg-slate-900 border-slate-900 text-white shadow-sm' 
                : 'border-slate-200 text-slate-600 hover:border-brand-blue'"
            >
              {{ size }}
            </button>
          </div>
        </div>

        <!-- Filter by Color -->
        <!-- <div class="mb-5 border-t border-slate-50 pt-4">
          <h3 class="text-[11px] font-extrabold text-slate-900 mb-2.5 uppercase tracking-wider font-sans">Màu sắc</h3>
          <div class="grid grid-cols-4 gap-2">
            <button 
              v-for="color in availableColors" 
              :key="color.value"
              @click="selectedColor = (selectedColor === color.value ? 'all' : color.value); handleFilterChange()"
              class="h-7 w-7 rounded-full border transition-all relative flex items-center justify-center group cursor-pointer"
              :style="{ backgroundColor: color.hex }"
              :class="[
                selectedColor === color.value ? 'ring-2 ring-brand-blue scale-110' : 'hover:scale-105 border-slate-200',
                color.border ? 'border border-slate-300' : ''
              ]"
              :title="color.name"
            >
              <span 
                v-if="selectedColor === color.value" 
                class="h-1.5 w-1.5 rounded-full"
                :class="color.value === 'white' ? 'bg-slate-900' : 'bg-white'"
              ></span>
            </button>
          </div>
        </div> -->

        <!-- Filter by Price -->
        <div class="border-t border-slate-50 pt-4">
          <h3 class="text-[11px] font-extrabold text-slate-900 mb-2.5 uppercase tracking-wider font-sans">Mức giá</h3>
          <div class="space-y-2.5">
            <label v-for="preset in [
              { label: 'Tất cả mức giá', value: 'all' },
              { label: 'Dưới 2.000.000đ', value: 'under-2m' },
              { label: '2M - 3M', value: '2m-3m' },
              { label: 'Trên 3.000.000đ', value: 'over-3m' },
              { label: 'Tùy chỉnh...', value: 'custom' }
            ]" :key="preset.value" class="flex items-center space-x-2.5 cursor-pointer group">
              <input 
                type="radio" 
                :value="preset.value" 
                v-model="priceRange"
                @change="handleFilterChange"
                class="text-brand-blue focus:ring-brand-blue h-4 w-4 border-slate-300"
              />
              <span class="text-xs text-slate-600 group-hover:text-slate-900 font-medium">{{ preset.label }}</span>
            </label>
          </div>

          <!-- Custom Price Inputs -->
          <div v-if="priceRange === 'custom'" class="mt-3.5 space-y-2 border border-slate-100 rounded-xl p-3 bg-slate-50/50">
            <div class="flex items-center space-x-2">
              <input 
                type="number" 
                placeholder="Từ" 
                v-model.number="customMinPrice"
                class="w-full bg-white border border-slate-200 rounded-lg px-2 py-1.5 text-xs focus:outline-none focus:border-brand-blue placeholder:text-slate-400"
              />
              <span class="text-slate-400 text-xs">-</span>
              <input 
                type="number" 
                placeholder="Đến" 
                v-model.number="customMaxPrice"
                class="w-full bg-white border border-slate-200 rounded-lg px-2 py-1.5 text-xs focus:outline-none focus:border-brand-blue placeholder:text-slate-400"
              />
            </div>
            <button 
              @click="handleFilterChange"
              class="w-full bg-slate-900 hover:bg-slate-800 text-white rounded-lg py-1.5 text-[10px] font-bold tracking-wider uppercase transition-colors cursor-pointer"
            >
              Áp dụng
            </button>
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
                <!-- Search -->
                <div class="pb-5">
                  <h3 class="text-xs font-bold text-slate-800 mb-3 uppercase tracking-wide">Tìm kiếm</h3>
                  <div class="relative">
                    <input 
                      v-model="keywordInput"
                      @input="handleSearchInput"
                      type="text" 
                      placeholder="Nhập tên giày..." 
                      class="w-full bg-slate-50 border border-slate-200 rounded-xl pl-3 pr-10 py-2.5 text-xs focus:outline-none focus:border-brand-blue"
                    />
                    <span class="absolute right-3 top-3 text-slate-400 pointer-events-none">
                      <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                    </span>
                  </div>
                </div>

                <!-- Gender -->
                <div class="pt-5 pb-5">
                  <h3 class="text-xs font-bold text-slate-800 mb-3 uppercase tracking-wide">Đối tượng</h3>
                  <div class="flex flex-wrap gap-1.5">
                    <button 
                      v-for="gender in [
                        { label: 'Tất cả', value: 'all' },
                        { label: 'Nam', value: 'men' },
                        { label: 'Nữ', value: 'women' },
                        { label: 'Unisex', value: 'unisex' }
                      ]"
                      :key="gender.value"
                      @click="selectedGender = gender.value; handleFilterChange()"
                      class="px-2.5 py-1.5 rounded-lg text-[10px] font-bold border uppercase tracking-wider cursor-pointer"
                      :class="selectedGender === gender.value 
                        ? 'bg-slate-900 border-slate-900 text-white shadow-sm' 
                        : 'bg-white border-slate-200 text-slate-600'"
                    >
                      {{ gender.label }}
                    </button>
                  </div>
                </div>

                <!-- Brands -->
                <div class="pt-5">
                  <h3 class="text-xs font-bold text-slate-800 mb-3.5 uppercase tracking-wide">Thương hiệu</h3>
                  <div class="space-y-3.5 max-h-48 overflow-y-auto">
                    <label 
                      v-for="brand in visibleBrands" 
                      :key="brand.brand_id" 
                      class="flex items-center space-x-3 cursor-pointer"
                    >
                      <input 
                        type="checkbox" 
                        :checked="selectedBrandId === brand.brand_id"
                        @change="toggleBrandSelection(brand.brand_id)"
                        class="rounded border-slate-300 text-brand-blue" 
                      />
                      <span class="text-sm text-slate-600">{{ brand.brand_name }}</span>
                    </label>
                  </div>
                  <button 
                    v-if="brandsList.length > 5"
                    @click="isShowAllBrands = !isShowAllBrands" 
                    class="mt-2 text-xs font-bold text-brand-blue hover:text-slate-900 flex items-center space-x-1 cursor-pointer"
                  >
                    <span>{{ isShowAllBrands ? 'Thu gọn' : 'Xem thêm (' + (brandsList.length - 5) + ')' }}</span>
                    <svg class="h-3 w-3 transform transition-transform" :class="isShowAllBrands ? 'rotate-180' : ''" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                </div>

                <!-- Categories -->
                <div class="pt-5">
                  <h3 class="text-xs font-bold text-slate-800 mb-3.5 uppercase tracking-wide">Danh mục</h3>
                  <div class="space-y-3.5 max-h-48 overflow-y-auto">
                    <label 
                      v-for="cat in visibleCategories" 
                      :key="cat.category_id" 
                      class="flex items-center space-x-3 cursor-pointer"
                    >
                      <input 
                        type="checkbox" 
                        :checked="selectedCategoryId === cat.category_id"
                        @change="toggleCategorySelection(cat.category_id)"
                        class="rounded border-slate-300 text-brand-blue" 
                      />
                      <span class="text-sm text-slate-600">{{ cat.category_name }}</span>
                    </label>
                  </div>
                  <button 
                    v-if="categoriesList.length > 5"
                    @click="isShowAllCategories = !isShowAllCategories" 
                    class="mt-2 text-xs font-bold text-brand-blue hover:text-slate-900 flex items-center space-x-1 cursor-pointer"
                  >
                    <span>{{ isShowAllCategories ? 'Thu gọn' : 'Xem thêm (' + (categoriesList.length - 5) + ')' }}</span>
                    <svg class="h-3 w-3 transform transition-transform" :class="isShowAllCategories ? 'rotate-180' : ''" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                </div>

                <!-- Availability / Sale Status -->
                <div class="pt-5">
                  <h3 class="text-xs font-bold text-slate-800 mb-3.5 uppercase tracking-wide">Trạng thái</h3>
                  <div class="space-y-3">
                    <label class="flex items-center space-x-3 cursor-pointer">
                      <input 
                        type="checkbox" 
                        v-model="onlyInStock"
                        @change="handleFilterChange"
                        class="rounded border-slate-300 text-brand-blue" 
                      />
                      <span class="text-sm text-slate-600 font-medium">Còn hàng</span>
                    </label>
                    <label class="flex items-center space-x-3 cursor-pointer">
                      <input 
                        type="checkbox" 
                        v-model="onlyOnSale"
                        @change="handleFilterChange"
                        class="rounded border-slate-300 text-brand-blue" 
                      />
                      <span class="text-sm text-slate-600 font-medium">Đang giảm giá</span>
                    </label>
                  </div>
                </div>

                <!-- Sizes -->
                <div class="pt-5">
                  <h3 class="text-xs font-bold text-slate-800 mb-3.5 uppercase tracking-wide">Kích cỡ giày</h3>
                  <div class="grid grid-cols-4 gap-2">
                    <button 
                      v-for="size in availableSizes" 
                      :key="size"
                      @click="toggleSizeSelection(size)"
                      class="h-9 w-9 rounded-lg border text-xs font-bold flex items-center justify-center cursor-pointer"
                      :class="selectedSizes.includes(size) 
                        ? 'bg-slate-900 border-slate-900 text-white shadow-sm' 
                        : 'border-slate-200 text-slate-600'"
                    >
                      {{ size }}
                    </button>
                  </div>
                </div>

                <!-- Colors -->
                <div class="pt-5">
                  <h3 class="text-xs font-bold text-slate-800 mb-3.5 uppercase tracking-wide">Màu sắc</h3>
                  <div class="grid grid-cols-4 gap-2">
                    <button 
                      v-for="color in availableColors" 
                      :key="color.value"
                      @click="selectedColor = (selectedColor === color.value ? 'all' : color.value); handleFilterChange()"
                      class="h-7 w-7 rounded-full border transition-all relative flex items-center justify-center cursor-pointer"
                      :style="{ backgroundColor: color.hex }"
                      :class="[
                        selectedColor === color.value ? 'ring-2 ring-brand-blue scale-110' : 'border-slate-200',
                        color.border ? 'border border-slate-300' : ''
                      ]"
                      :title="color.name"
                    >
                      <span 
                        v-if="selectedColor === color.value" 
                        class="h-1.5 w-1.5 rounded-full"
                        :class="color.value === 'white' ? 'bg-slate-900' : 'bg-white'"
                      ></span>
                    </button>
                  </div>
                </div>

                <!-- Prices -->
                <div class="pt-5 pb-5">
                  <h3 class="text-xs font-bold text-slate-800 mb-3.5 uppercase tracking-wide">Mức giá</h3>
                  <div class="space-y-3">
                    <label v-for="preset in [
                      { label: 'Tất cả mức giá', value: 'all' },
                      { label: 'Dưới 2.000.000đ', value: 'under-2m' },
                      { label: '2M - 3M', value: '2m-3m' },
                      { label: 'Trên 3.000.000đ', value: 'over-3m' },
                      { label: 'Tùy chỉnh...', value: 'custom' }
                    ]" :key="preset.value" class="flex items-center space-x-3 cursor-pointer">
                      <input 
                        type="radio" 
                        :value="preset.value" 
                        v-model="priceRange" 
                        @change="handleFilterChange"
                        class="text-brand-blue border-slate-300" 
                      />
                      <span class="text-sm text-slate-600 font-medium">{{ preset.label }}</span>
                    </label>
                  </div>

                  <!-- Custom prices -->
                  <div v-if="priceRange === 'custom'" class="mt-3.5 space-y-2 border border-slate-100 rounded-xl p-3 bg-slate-50/50">
                    <div class="flex items-center space-x-2">
                      <input 
                        type="number" 
                        placeholder="Từ" 
                        v-model.number="customMinPrice"
                        class="w-full bg-white border border-slate-200 rounded-lg px-2 py-1.5 text-xs focus:outline-none focus:border-brand-blue placeholder:text-slate-400"
                      />
                      <span class="text-slate-400 text-xs">-</span>
                      <input 
                        type="number" 
                        placeholder="Đến" 
                        v-model.number="customMaxPrice"
                        class="w-full bg-white border border-slate-200 rounded-lg px-2 py-1.5 text-xs focus:outline-none focus:border-brand-blue placeholder:text-slate-400"
                      />
                    </div>
                    <button 
                      @click="handleFilterChange"
                      class="w-full bg-slate-900 hover:bg-slate-800 text-white rounded-lg py-1.5 text-[10px] font-bold tracking-wider uppercase transition-colors cursor-pointer"
                    >
                      Áp dụng
                    </button>
                  </div>
                </div>
              </div>

              <!-- Drawer Footer -->
              <div class="p-6 bg-slate-50 border-t border-slate-100 space-y-3">
                <button 
                  @click="isMobileFilterOpen = false" 
                  class="w-full bg-brand-blue text-white py-3 rounded-full text-sm font-bold cursor-pointer"
                >
                  ÁP DỤNG BỘ LỌC
                </button>
                <button 
                  @click="clearFilters(); isMobileFilterOpen = false" 
                  class="w-full bg-white border border-slate-200 text-slate-600 py-3 rounded-full text-sm font-bold cursor-pointer"
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
