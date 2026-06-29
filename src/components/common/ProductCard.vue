<script setup lang="ts">
import type { Product, ProductListItem } from '../../types';
import { computed } from 'vue';
import { getDiscountedPrice } from '../../stores/cart';

const props = defineProps<{
  product: Product | ProductListItem;
}>();

const formatPrice = (value: number) => {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
};

const defaultColor = computed(() => {
  const p = props.product as any;
  if (p.default_color) {
    return p.default_color;
  }
  if (!p.colors || p.colors.length === 0) return null;
  return p.colors.find((c: any) => c.is_default) || p.colors[0];
});

const hasDiscount = computed(() => {
  if (!defaultColor.value) return false;
  return defaultColor.value.discount_type !== 'none' && defaultColor.value.discount_value > 0;
});

const discountPercentage = computed(() => {
  if (!defaultColor.value || !hasDiscount.value) return 0;
  if (defaultColor.value.discount_type === 'percent') {
    return Math.round(defaultColor.value.discount_value);
  } else if (defaultColor.value.discount_type === 'fixed') {
    return Math.round((defaultColor.value.discount_value / defaultColor.value.price) * 100);
  }
  return 0;
});

const displayedPrice = computed(() => {
  if (!defaultColor.value) return 0;
  if ('discounted_price' in defaultColor.value) {
    return defaultColor.value.discounted_price;
  }
  return getDiscountedPrice(defaultColor.value as any);
});

const originalPrice = computed(() => {
  if (!defaultColor.value) return 0;
  return defaultColor.value.price;
});

const displayImage = computed(() => {
  if (!defaultColor.value) return '';
  if ('main_image_url' in defaultColor.value) {
    return defaultColor.value.main_image_url || '';
  }
  const images = (defaultColor.value as any).images;
  if (!images || images.length === 0) return '';
  return images.find((img: any) => img.is_main)?.image_url || images[0].image_url;
});

</script>

<template>
  <router-link 
    :to="`/product/${product.product_id}`" 
    class="group flex flex-col bg-white rounded-2xl overflow-hidden border border-slate-100 shadow-premium hover:shadow-premium-hover transition-all duration-300 product-card cursor-pointer"
  >
    <!-- Product Image & Badges -->
    <div class="relative aspect-square w-full bg-slate-50 overflow-hidden">
      <!-- Discount Badge -->
      <span 
        v-if="hasDiscount" 
        class="absolute top-3 left-3 z-10 bg-brand-accent text-white text-[11px] font-bold px-2 py-0.5 rounded-full"
      >
        -{{ discountPercentage }}%
      </span>
      
      <!-- New/Hot Badge -->
      <span 
        v-if="product.isHot" 
        class="absolute top-3 right-3 z-10 bg-amber-500 text-white text-[10px] font-extrabold px-2 py-0.5 rounded uppercase tracking-wider"
      >
        HOT
      </span>
      <span 
        v-else-if="product.isNew" 
        class="absolute top-3 right-3 z-10 bg-blue-600 text-white text-[10px] font-extrabold px-2 py-0.5 rounded uppercase tracking-wider"
      >
        MỚI
      </span>

      <!-- Image -->
      <img 
        :src="displayImage || '/placeholder_image.png'" 
        :alt="product.product_name" 
        class="h-full w-full object-cover object-center group-hover:scale-105 transition-transform duration-500" 
        loading="lazy"
      />
    </div>

    <!-- Product Details -->
    <div class="flex-1 p-5 flex flex-col justify-between">
      <div>
        <!-- Brand -->
        <p class="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">{{ product.brand_name }}</p>
        
        <!-- Name -->
        <h3 class="text-sm font-semibold text-slate-900 group-hover:text-brand-blue transition-colors line-clamp-2 leading-relaxed mb-2 min-h-[40px]">
          {{ product.product_name }}
        </h3>

        <!-- Rating -->
        <div class="flex items-center space-x-1 mb-3">
          <div class="flex items-center text-amber-400">
            <svg v-for="i in 5" :key="i" class="h-3.5 w-3.5" :class="i <= Math.round(product.rating || 5) ? 'fill-current' : 'text-slate-200 stroke-current'" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
          </div>
          <span class="text-[11px] font-semibold text-slate-400">({{ product.reviewsCount || 0 }})</span>
        </div>
      </div>

      <!-- Pricing & CTA -->
      <div class="flex items-end justify-between mt-auto pt-2 border-t border-slate-50">
        <div>
          <!-- Discounted Price -->
          <p class="text-base font-bold text-brand-accent leading-none">{{ formatPrice(displayedPrice) }}</p>
          <!-- Original Price -->
          <p v-if="hasDiscount" class="text-xs text-slate-400 line-through mt-1">
            {{ formatPrice(originalPrice) }}
          </p>
        </div>

        <!-- Quick View CTA Icon -->
        <span class="rounded-full bg-slate-50 p-2 text-slate-400 group-hover:bg-brand-blue group-hover:text-white transition-all duration-300">
          <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
        </span>
      </div>
    </div>
  </router-link>
</template>
