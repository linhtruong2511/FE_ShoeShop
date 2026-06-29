<script setup lang="ts">
import { useCartStore, getDiscountedPrice } from '../../stores/cart';
import { computed } from 'vue';
import { useRouter } from 'vue-router';

const props = defineProps<{
  isOpen: boolean;
}>();

const emit = defineEmits<{
  (e: 'close'): void;
}>();

const cartStore = useCartStore();
const router = useRouter();

const items = computed(() => cartStore.items);
const totalItems = computed(() => cartStore.totalItems);
const subtotal = computed(() => cartStore.subtotal);

const formatPrice = (value: number) => {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
};

const updateQuantity = (id: string, qty: number) => {
  const result = cartStore.updateQuantity(id, qty);
  if (!result.success) {
    alert(result.message);
  }
};

const removeItem = (id: string) => {
  cartStore.removeFromCart(id);
};

const goToProduct = (productId: string) => {
  emit('close');
  router.push(`/product/${productId}`);
};

const goToCheckout = () => {
  emit('close');
  router.push('/checkout');
};
</script>

<template>
  <div 
    v-if="isOpen" 
    class="fixed inset-0 z-50 overflow-hidden" 
    aria-labelledby="slide-over-title" 
    role="dialog" 
    aria-modal="true"
  >
    <div class="absolute inset-0 overflow-hidden">
      <!-- Background backdrop -->
      <div 
        @click="emit('close')" 
        class="absolute inset-0 bg-slate-900 bg-opacity-60 transition-opacity backdrop-blur-sm"
      ></div>

      <div class="pointer-events-none fixed inset-y-0 right-0 flex max-w-full pl-10">
        <transition name="slide-over" appear>
          <div class="pointer-events-auto w-screen max-w-md">
            <div class="flex h-full flex-col bg-white shadow-2xl">
               <!-- Header -->
               <div class="flex items-start justify-between bg-slate-950 p-6 text-white">
                 <h2 class="text-xl font-semibold font-sans" id="slide-over-title">
                   Giỏ hàng của bạn ({{ totalItems }} sản phẩm)
                 </h2>
                 <button 
                   type="button" 
                   @click="emit('close')" 
                   class="rounded-md text-slate-400 hover:text-white focus:outline-none"
                 >
                   <span class="sr-only">Close panel</span>
                   <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor">
                     <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
                   </svg>
                 </button>
               </div>

               <!-- Cart list -->
               <div class="flex-1 overflow-y-auto p-6">
                 <div v-if="items.length === 0" class="flex h-full flex-col items-center justify-center text-center">
                   <div class="rounded-full bg-slate-100 p-6 text-slate-400 mb-4">
                     <svg class="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                       <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                     </svg>
                   </div>
                   <h3 class="text-lg font-medium text-slate-900 mb-1">Giỏ hàng trống</h3>
                   <p class="text-sm text-slate-500 mb-6">Bạn chưa có đôi giày nào trong giỏ hàng.</p>
                   <button 
                     @click="emit('close'); router.push('/products')" 
                     class="rounded-full bg-slate-950 px-6 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-opacity-90 transition-all"
                   >
                     Tiếp tục mua sắm
                   </button>
                 </div>

                 <ul v-else role="list" class="-my-6 divide-y divide-slate-100">
                   <li v-for="item in items" :key="item.id" class="flex py-6">
                     <div 
                       @click="goToProduct(item.product.product_id)"
                       class="h-20 w-20 flex-shrink-0 overflow-hidden rounded-lg border border-slate-200 cursor-pointer hover:opacity-85 transition-opacity"
                     >
                       <img :src="item.selectedColor.images.find(img => img.is_main)?.image_url || item.selectedColor.images[0].image_url" :alt="item.product.product_name" class="h-full w-full object-cover object-center" />
                     </div>

                     <div class="ml-4 flex flex-1 flex-col">
                       <div>
                         <div class="flex justify-between text-base font-medium text-slate-900">
                           <h3 class="line-clamp-1 hover:text-brand-blue cursor-pointer text-sm font-bold text-left" @click="goToProduct(item.product.product_id)">
                             {{ item.product.product_name }}
                           </h3>
                           <p class="ml-4 text-brand-accent font-extrabold text-sm">{{ formatPrice(getDiscountedPrice(item.selectedColor)) }}</p>
                         </div>
                         <p class="mt-1 text-xs text-slate-500 text-left">Hãng: <span class="font-semibold text-slate-700">{{ item.product.brand_name }}</span></p>
                         <p class="text-xs text-slate-500 text-left">Size: <span class="font-semibold text-slate-700">{{ item.selectedSku.size }}</span> | Màu: <span class="font-semibold text-slate-700">{{ item.selectedColor.color_name }}</span></p>
                       </div>
                       
                       <div class="flex flex-1 items-end justify-between text-sm">
                         <!-- Quantity selector -->
                         <div class="flex items-center border border-slate-200 rounded-md">
                           <button 
                             @click="updateQuantity(item.id, item.quantity - 1)" 
                             class="px-2 py-0.5 text-slate-500 hover:bg-slate-50 font-bold"
                           >
                             -
                           </button>
                           <span class="px-2 py-0.5 font-medium text-slate-800 text-xs">{{ item.quantity }}</span>
                           <button 
                             @click="updateQuantity(item.id, item.quantity + 1)" 
                             class="px-2 py-0.5 text-slate-500 hover:bg-slate-50 font-bold"
                           >
                             +
                           </button>
                         </div>

                         <div class="flex">
                           <button 
                             type="button" 
                             @click="removeItem(item.id)" 
                             class="font-medium text-xs text-slate-400 hover:text-brand-accent transition-colors"
                           >
                             Xóa
                           </button>
                         </div>
                       </div>
                     </div>
                   </li>
                 </ul>
               </div>

               <!-- Footer with pricing summary -->
               <div v-if="items.length > 0" class="border-t border-slate-100 px-6 py-6 bg-slate-50">
                 <div class="flex justify-between text-base font-medium text-slate-900 mb-4">
                   <p>Tạm tính:</p>
                   <p class="text-xl font-extrabold text-slate-900">{{ formatPrice(subtotal) }}</p>
                 </div>
                 <p class="text-xs text-slate-500 mb-6 text-left">Phí vận chuyển và voucher sẽ được áp dụng ở trang thanh toán.</p>
                 
                 <button 
                   @click="goToCheckout" 
                   class="w-full rounded-full bg-brand-accent px-6 py-3.5 text-base font-bold text-white shadow-lg hover:bg-brand-accentHover hover:shadow-xl transition-all"
                 >
                   TIẾN HÀNH THANH TOÁN
                 </button>
                 <div class="mt-4 flex justify-center text-center text-sm text-slate-500">
                   <p>
                     hoặc
                     <button 
                       type="button" 
                       @click="emit('close')" 
                       class="font-medium text-brand-blue hover:text-opacity-80 transition-colors"
                     >
                       Tiếp tục mua hàng
                       <span aria-hidden="true"> &rarr;</span>
                     </button>
                   </p>
                 </div>
               </div>
            </div>
          </div>
        </transition>
      </div>
    </div>
  </div>
</template>
