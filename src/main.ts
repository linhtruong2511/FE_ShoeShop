import { createApp } from 'vue'
import { createPinia } from 'pinia'
import router from './router'
import './style.css'
import App from './App.vue'
import { useCartStore } from './stores/cart'

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)
app.use(router)

// Tải dữ liệu giỏ hàng từ LocalStorage
const cartStore = useCartStore()
cartStore.loadCart()

// Listen to image load errors globally (using capture phase since error events do not bubble)
window.addEventListener('error', (event) => {
  const target = event.target as HTMLElement;
  if (target && target.tagName === 'IMG') {
    const img = target as HTMLImageElement;
    if (img.getAttribute('data-fallback-tried') !== 'true') {
      img.setAttribute('data-fallback-tried', 'true');
      img.src = '/placeholder_image.png';
    }
  }
}, true);

app.mount('#app')
