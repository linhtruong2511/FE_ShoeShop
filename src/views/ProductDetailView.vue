<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useCartStore, getDiscountedPrice } from '../stores/cart';
import ProductCard from '../components/common/ProductCard.vue';
import { productService } from '../services/product.service';
import type { Product, ProductColor, ProductSku, ProductListItem } from '../types';

const route = useRoute();
const router = useRouter();
const cartStore = useCartStore();

const showSizeChart = () => {
  alert('Vui lòng chọn size tương ứng với chiều dài chân:\n- Size 38 = 24.0cm\n- Size 39 = 24.5cm\n- Size 40 = 25.0cm\n- Size 41 = 25.5cm\n- Size 42 = 26.0cm\n- Size 43 = 26.5cm\n- Size 44 = 27.0cm');
};

// Selection States
const product = ref<Product | null>(null);
const activeImageIndex = ref(0);
const selectedColor = ref<ProductColor | null>(null);
const selectedSku = ref<ProductSku | null>(null);
const quantity = ref(1);
const showSizeWarning = ref(false);
const showSuccessNotification = ref(false);
const successMessage = ref('');
const errorMessage = ref('');

// API States
const isLoading = ref(false);
const errorMsg = ref<string | null>(null);
const relatedProducts = ref<ProductListItem[]>([]);

const filteredColors = computed(() => {
  if (!product.value || !product.value.colors) return [];
  return product.value.colors.filter(color => 
    color.skus && color.skus.length > 0 && color.skus.some(sku => sku.stock_quantity > 0)
  );
});

const resetSelection = () => {
  activeImageIndex.value = 0;
  selectedSku.value = null;
  quantity.value = 1;
  showSizeWarning.value = false;
  errorMessage.value = '';
  
  if (filteredColors.value && filteredColors.value.length > 0) {
    const defaultColor = filteredColors.value.find(c => c.is_default) || filteredColors.value[0];
    selectedColor.value = defaultColor;
  } else {
    selectedColor.value = null;
  }
};

const fetchProductDetail = async () => {
  const productId = route.params.id as string;
  // debugger
  if (!productId) {
    router.push('/products');
    return;
  }

  isLoading.value = true;
  errorMsg.value = null;

  try {
    const res = await productService.getProductDetail(productId);
    const raw = res.data;

    // Map API response to full ProductColor shape (backend may omit status/product_id)
    if (raw && Array.isArray(raw.colors)) {
      raw.colors = raw.colors.map((c: any) => ({
        ...c,
        product_id: raw.product_id,
        color_code: c.color_code || c.color_name?.toLowerCase().replace(/\s+/g, '-') || 'default',
        status: c.status || 'active',
        sold_quantity: c.sold_quantity ?? 0,
        images: Array.isArray(c.images) ? c.images.map((img: any) => ({
          ...img,
          color_id: img.color_id ?? c.color_id,
        })) : [],
        skus: Array.isArray(c.skus) ? c.skus.map((sku: any) => ({
          ...sku,
          sku_code: sku.sku_code || String(sku.sku_id),
          color_id: sku.color_id ?? c.color_id,
          sold_quantity: sku.sold_quantity ?? 0,
          status: sku.status || 'active',
        })) : [],
      }));
    }

    product.value = raw;
    resetSelection();
    
    // Load related products based on brand if brand exists
    if (product.value?.brand?.brand_id) {
      fetchRelatedProducts(product.value.brand.brand_id, productId);
    }
  } catch (err: any) {
    console.error('Error fetching product details:', err);
    errorMsg.value = 'Không thể tải thông tin chi tiết sản phẩm. Vui lòng kiểm tra lại kết nối.';
  } finally {
    isLoading.value = false;
  }
};

const fetchRelatedProducts = async (brandId: number | string, currentProductId: number | string) => {
  try {
    const res = await productService.getProducts({ brand_id: brandId as any, limit: 5 });
    relatedProducts.value = (res.data || []).filter((p: any) => p.product_id !== currentProductId).slice(0, 4);
  } catch (e) {
    console.error('Error fetching related products:', e);
  }
};

onMounted(() => {
  fetchProductDetail();
});

watch(() => route.params.id, () => {
  fetchProductDetail();
});

watch(selectedColor, () => {
  activeImageIndex.value = 0;
  selectedSku.value = null;
  errorMessage.value = '';
});

// Format Price
const formatPrice = (value: number) => {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
};

const hasDiscount = computed(() => {
  if (!selectedColor.value) return false;
  return selectedColor.value.discount_type !== 'none' && selectedColor.value.discount_value > 0;
});

const discountPercentage = computed(() => {
  if (!selectedColor.value || !hasDiscount.value) return 0;
  if (selectedColor.value.discount_type === 'percent') {
    return Math.round(selectedColor.value.discount_value);
  } else if (selectedColor.value.discount_type === 'fixed') {
    return Math.round((selectedColor.value.discount_value / selectedColor.value.price) * 100);
  }
  return 0;
});

const displayedPrice = computed(() => {
  if (!selectedColor.value) return 0;
  return getDiscountedPrice(selectedColor.value);
});

const originalPrice = computed(() => {
  if (!selectedColor.value) return 0;
  return selectedColor.value.price;
});

const galleryImages = computed(() => {
  if (!selectedColor.value) return [];
  return selectedColor.value.images?.map(img => img.image_url) || [];
});

// Add to Cart Handlers
const handleAddToCart = async () => {
  if (!product.value || !selectedColor.value) return;
  
  if (selectedSku.value === null) {
    showSizeWarning.value = true;
    return;
  }
  
  showSizeWarning.value = false;
  errorMessage.value = '';
  
  const result = await cartStore.addToCart(product.value, selectedColor.value, selectedSku.value, quantity.value);
  if (result.success) {
    successMessage.value = result.message;
    showSuccessNotification.value = true;
    setTimeout(() => {
      showSuccessNotification.value = false;
    }, 3000);
  } else {
    errorMessage.value = result.message;
  }
};

const handleBuyNow = async () => {
  if (!product.value || !selectedColor.value) return;
  
  if (selectedSku.value === null) {
    showSizeWarning.value = true;
    return;
  }

  showSizeWarning.value = false;
  errorMessage.value = '';
  
  const result = await cartStore.addToCart(product.value, selectedColor.value, selectedSku.value, quantity.value);
  if (result.success) {
    router.push('/checkout');
  } else {
    errorMessage.value = result.message;
  }
};
</script>

<template>


  <div v-if="isLoading" class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 animate-pulse">
    <div class="grid grid-cols-1 lg:grid-cols-12 gap-12 bg-white p-10 rounded-3xl border border-slate-100 shadow-premium">
      <div class="lg:col-span-6 flex flex-col space-y-4">
        <div class="aspect-square bg-slate-200 rounded-2xl"></div>
        <div class="grid grid-cols-4 gap-4">
          <div v-for="n in 4" :key="n" class="aspect-square bg-slate-200 rounded-xl"></div>
        </div>
      </div>
      <div class="lg:col-span-6 space-y-6">
        <div class="h-6 bg-slate-200 rounded w-1/4"></div>
        <div class="h-10 bg-slate-200 rounded w-3/4 flex-grow"></div>
        <div class="h-6 bg-slate-200 rounded w-1/3"></div>
        <div class="h-24 bg-slate-200 rounded w-full"></div>
        <div class="h-12 bg-slate-200 rounded w-1/2"></div>
      </div>
    </div>
  </div>

  
  <div v-else-if="errorMsg" class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
    <div class="bg-red-50 border border-red-100 rounded-2xl p-8 max-w-lg mx-auto">
      <p class="text-red-800 text-sm font-semibold mb-4">{{ errorMsg }}</p>
      <button 
        @click="fetchProductDetail" 
        class="bg-brand-accent hover:bg-brand-accentHover text-white px-6 py-2 rounded-full text-xs font-bold transition-all shadow"
      >
        Thử lại
      </button>
    </div>
  </div>

  <div v-else-if="product" class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
    <!-- Success Alert Notification -->
    <div 
      v-if="showSuccessNotification" 
      class="fixed bottom-6 right-6 z-50 bg-slate-900 border border-slate-800 text-white rounded-2xl p-4 shadow-2xl flex items-center space-x-4 max-w-sm"
    >
      <div class="rounded-full bg-emerald-500 p-1.5 text-white flex-shrink-0">
        <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="3">
          <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
        </svg>
      </div>
      <div>
        <p class="text-sm font-bold">Thành công!</p>
        <p class="text-xs text-slate-400 mt-0.5">{{ successMessage }}</p>
      </div>
    </div>

    <!-- Product Basic Section: Info & Gallery -->
    <div class="grid grid-cols-1 lg:grid-cols-12 gap-12 bg-white p-6 md:p-10 rounded-3xl shadow-premium border border-slate-100 mb-16">
      
      <!-- Left Column: Gallery -->
      <div class="lg:col-span-6 flex flex-col space-y-4">
        <!-- Main Image -->
        <div class="aspect-square bg-slate-50 border border-slate-100 rounded-2xl overflow-hidden shadow-sm relative group">
          <img 
            :src="galleryImages[activeImageIndex] || selectedColor?.images?.[0]?.image_url || '/placeholder_image.png'" 
            :alt="product.product_name" 
            class="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
          />
        </div>

        <!-- Thumbnails Grid -->
        <div class="grid grid-cols-4 gap-4" v-if="galleryImages.length > 1">
          <button 
            v-for="(img, idx) in galleryImages" 
            :key="idx"
            @click="activeImageIndex = idx"
            class="aspect-square rounded-xl bg-slate-50 border overflow-hidden transition-all"
            :class="activeImageIndex === idx ? 'border-brand-blue ring-2 ring-brand-blue ring-offset-2' : 'border-slate-200 opacity-70 hover:opacity-100'"
          >
            <img :src="img || '/placeholder_image.png'" :alt="product.product_name" class="w-full h-full object-cover object-center" />
          </button>
        </div>
      </div>

      <!-- Right Column: Details -->
      <div class="lg:col-span-6 flex flex-col justify-between space-y-6">
        <div>
          <!-- Brand -->
          <span class="inline-block bg-slate-100 text-slate-700 text-xs font-extrabold px-3 py-1 rounded uppercase tracking-wider mb-2">
            {{ product.brand?.brand_name || 'MyShoes' }}
          </span>

          <!-- Name -->
          <h1 class="text-2xl md:text-3xl font-extrabold text-slate-900 leading-snug font-sans">
            {{ product.product_name }}
          </h1>

          <!-- Reviews & Stars -->
          <div class="flex items-center space-x-3 mt-3">
            <div class="flex items-center text-amber-400">
              <svg v-for="i in 5" :key="i" class="h-4 w-4" :class="i <= Math.round(product.rating || 5) ? 'fill-current' : 'text-slate-200 stroke-current'" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            </div>
            <span class="text-sm font-semibold text-slate-400">({{ product.reviewsCount || 120 }} đánh giá thực tế)</span>
          </div>

          <!-- Price section -->
          <div v-if="selectedColor" class="mt-6 bg-slate-50 p-5 rounded-2xl border border-slate-100 flex flex-wrap items-center justify-between gap-4">
            <div>
              <p class="text-sm text-slate-500 font-semibold mb-1">Giá bán ưu đãi:</p>
              <div class="flex items-baseline space-x-3">
                <span class="text-3xl font-extrabold text-brand-accent">{{ formatPrice(displayedPrice) }}</span>
                <span v-if="hasDiscount" class="text-base text-slate-400 line-through">{{ formatPrice(originalPrice) }}</span>
              </div>
            </div>
            <span v-if="hasDiscount" class="bg-brand-accent text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-sm">
              TIẾT KIỆM {{ discountPercentage }}%
            </span>
          </div>
          <div v-else class="mt-6 bg-slate-100 p-5 rounded-2xl border border-slate-200 text-slate-400 text-sm font-semibold">
            Sản phẩm chưa có thông tin màu sắc / giá.
          </div>

          <!-- Highlights short details badges -->
          <div class="grid grid-cols-2 gap-3 mt-5">
            <div class="flex items-center space-x-2 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
              <svg class="h-5 w-5 text-emerald-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
              </svg>
              <span class="text-xs font-bold text-slate-700">Miễn Phí Vận Chuyển</span>
            </div>
            <div class="flex items-center space-x-2 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
              <svg class="h-5 w-5 text-emerald-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2 4-4" />
              </svg>
              <span class="text-xs font-bold text-slate-700">Bảo Hành 6 Tháng</span>
            </div>
          </div>

          <!-- Color Options -->
          <div class="mt-6 border-t border-slate-100 pt-6">
            <h3 class="text-sm font-bold text-slate-900 mb-3.5 uppercase tracking-wide">Màu sắc:</h3>
            <div class="flex flex-wrap gap-2.5">
              <button 
                v-for="color in filteredColors" 
                :key="color.color_id"
                @click="selectedColor = color"
                class="px-4 py-2 border rounded-xl text-xs font-bold transition-all shadow-sm"
                :class="selectedColor?.color_id === color.color_id 
                  ? 'bg-slate-900 border-slate-900 text-white' 
                  : 'bg-white border-slate-200 text-slate-700 hover:border-slate-400'"
              >
                {{ color.color_name }}
              </button>
            </div>
          </div>

          <!-- Size Options -->
          <div class="mt-6 border-t border-slate-100 pt-6">
            <div class="flex items-center justify-between mb-3.5">
              <h3 class="text-sm font-bold text-slate-900 uppercase tracking-wide">Kích cỡ giày (Size):</h3>
              <button @click="showSizeChart" class="text-xs font-bold text-brand-blue hover:text-brand-accent transition-colors">Bảng quy đổi size</button>
            </div>
            
            <div class="grid grid-cols-6 gap-2.5">
              <button 
                v-for="sku in (selectedColor?.skus || [])" 
                :key="sku.sku_id"
                :disabled="sku.status !== 'active' || sku.stock_quantity <= 0"
                @click="selectedSku = sku; showSizeWarning = false; errorMessage = ''"
                class="h-11 rounded-xl border text-sm font-bold transition-all flex flex-col items-center justify-center shadow-sm"
                :class="[
                  selectedSku?.sku_id === sku.sku_id 
                    ? 'bg-brand-blue border-brand-blue text-white ring-2 ring-brand-blue ring-offset-2' 
                    : (sku.status !== 'active' || sku.stock_quantity <= 0)
                      ? 'bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed line-through'
                      : 'bg-white border-slate-200 text-slate-700 hover:border-brand-blue'
                ]"
              >
                <span>{{ sku.size }}</span>
                <span class="text-[9px] font-medium" :class="selectedSku?.sku_id === sku.sku_id ? 'text-blue-100' : 'text-slate-400'" v-if="sku.stock_quantity > 0 && sku.stock_quantity <= 5">
                  Còn {{ sku.stock_quantity }}
                </span>
              </button>
            </div>

            <!-- Size alert warning -->
            <p v-if="showSizeWarning" class="text-brand-accent text-xs font-bold mt-2.5 flex items-center">
              <svg class="h-4 w-4 mr-1 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              Vui lòng chọn kích cỡ giày trước khi thêm vào giỏ hàng!
            </p>
          </div>

          <!-- Quantity Selection -->
          <div class="mt-6 border-t border-slate-100 pt-6">
            <h3 class="text-sm font-bold text-slate-900 mb-3.5 uppercase tracking-wide">Số lượng:</h3>
            <div class="flex items-center space-x-3.5">
              <div class="flex items-center border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                <button 
                  @click="quantity = Math.max(1, quantity - 1); errorMessage = ''" 
                  class="px-4 py-2.5 text-slate-500 hover:bg-slate-50 font-bold"
                >
                  -
                </button>
                <span class="px-6 py-2.5 font-bold text-slate-800 text-sm bg-white min-w-[50px] text-center">{{ quantity }}</span>
                <button 
                  @click="quantity++; errorMessage = ''" 
                  class="px-4 py-2.5 text-slate-500 hover:bg-slate-50 font-bold"
                >
                  +
                </button>
              </div>
              <span class="text-xs font-bold text-slate-400" v-if="selectedSku">
                Kho còn lại: {{ selectedSku.stock_quantity }} đôi.
              </span>
            </div>
            
            <p v-if="errorMessage" class="text-brand-accent text-xs font-bold mt-2.5 flex items-center">
              <svg class="h-4 w-4 mr-1 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              {{ errorMessage }}
            </p>
          </div>
        </div>

        <!-- Add to Cart CTA -->
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-8 pt-6 border-t border-slate-100">
          <button 
            @click="handleAddToCart"
            class="w-full bg-slate-900 hover:bg-slate-950 text-white rounded-full py-4 text-base font-bold shadow-lg hover:shadow-xl transition-all duration-200 transform hover:-translate-y-0.5"
          >
            THÊM VÀO GIỎ HÀNG
          </button>
          <button 
            @click="handleBuyNow"
            class="w-full bg-brand-accent hover:bg-brand-accentHover text-white rounded-full py-4 text-base font-bold shadow-lg hover:shadow-xl transition-all duration-200 transform hover:-translate-y-0.5"
          >
            MUA NGAY
          </button>
        </div>
      </div>

    </div>

    <!-- Product Description Details: Article and Image Panels -->
    <div class="grid grid-cols-1 lg:grid-cols-12 gap-12 mb-16">
      
      <!-- Left side: Description Content -->
      <article class="lg:col-span-7 bg-white p-6 md:p-10 rounded-3xl shadow-premium border border-slate-100 text-left space-y-6">
        <h2 class="text-xl font-extrabold text-slate-900 border-b border-slate-100 pb-4 uppercase tracking-wide font-sans">
          Mô tả sản phẩm chi tiết
        </h2>
        
        <div class="prose prose-slate max-w-none text-slate-600 text-sm leading-relaxed space-y-5">
          <p>{{ product.description }}</p>
          
          <h3 class="text-base font-bold text-slate-900 pt-2 uppercase">Tại sao nên mua tại MyShoes?</h3>
          <p>
            Tất cả các sản phẩm được phân phối tại hệ thống cửa hàng MyShoes đều có tem mác, hộp đựng đầy đủ và được bảo hành chính hãng. Khách hàng được quyền kiểm tra hàng thoải mái trước khi thanh toán. Nếu phát hiện bất kỳ lỗi chế tạo nào từ nhà sản xuất, MyShoes sẽ áp dụng cơ chế 1 đổi 1 ngay lập tức.
          </p>
        </div>
      </article>

      <!-- Right side: Detail Product Images Grid Layout -->
      <div class="lg:col-span-5 space-y-4">
        <div class="bg-white p-4 rounded-3xl shadow-premium border border-slate-100">
          <h3 class="text-sm font-bold text-slate-800 uppercase mb-4 text-left px-2 border-b border-slate-50 pb-2">Hình ảnh thực tế</h3>
          <div class="space-y-4">
            <div 
              v-for="(img, idx) in galleryImages.slice(0, 3)" 
              :key="idx" 
              class="aspect-video w-full rounded-2xl overflow-hidden bg-slate-50 border border-slate-100"
            >
              <img :src="img || '/placeholder_image.png'" :alt="product.product_name" class="w-full h-full object-cover object-center" />
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Related Products -->
    <div v-if="relatedProducts.length > 0">
      <div class="border-t border-slate-200 pt-12 mb-8 flex items-center justify-between">
        <h2 class="text-2xl font-extrabold text-slate-900 font-sans uppercase tracking-wide">Có thể bạn cũng thích</h2>
        <router-link to="/products" class="text-xs font-bold text-brand-blue hover:text-brand-accent transition-colors flex items-center space-x-1">
          <span>Xem tất cả</span>
          <svg class="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
            <path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </router-link>
      </div>
      
      <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        <ProductCard 
          v-for="p in relatedProducts" 
          :key="p.product_id" 
          :product="p" 
        />
      </div>
    </div>

  </div>
  
  <div v-else class="max-w-7xl mx-auto px-4 py-32 text-center">
    <h2 class="text-2xl font-bold text-slate-800">Không tìm thấy giày yêu cầu hoặc sản phẩm không khả dụng</h2>
    <router-link to="/products" class="mt-4 inline-block bg-brand-blue text-white px-6 py-2.5 rounded-full">Quay lại danh sách</router-link>
  </div> 


</template>
